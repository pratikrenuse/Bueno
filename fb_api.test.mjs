// The handlers behind /api/fb, exercised against a fake Supabase.
//
// The deck is seeded by a button, so the first thing that happens in production is a POST
// to the seed handler. That makes it worth knowing here, offline, that it builds the rows
// it should, keeps decisions that have already been made, and refuses the things it should
// refuse. Nothing in this file touches a network or a real database.
//
// Since October 2026 approving a post queues it and a daily dispatch sends it, so the second
// half of this file is about the queue: that approving sends nothing, that one post goes out
// a day, in the written order, with each language's account and groups in the email.

import { createHash } from 'node:crypto';
import fbRouter, { resolveAction, ACTIONS } from './api/fb.js';
import { finalText, subjectFor, bodyFor, groupsToday, introBody, planDays, INTRO_SUBJECT, SEND_TO, SEND_CC } from './api/_fb_email.js';
import { GROUPS } from './api/_fb_groups.js';
import { hashOf, isCurrent, checkTranslation } from './api/_fb_translate.js';
import { queueOf, nextDay, sentOn } from './api/_fb_queue.js';
import { IDEAS, QUEUE_ORDER, SPONSOR, linkFor, BUENO_TOOL } from './api/_fb_content.js';
import { groupsFor, ACCOUNT, MAX_PER_DAY } from './api/_fb_groups.js';
import { cardFor } from './api/_fb_images.js';

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => cond ? pass++ : (fail++, console.log('FAIL', name, extra));

process.env.INTERNAL_PASSCODE = 'test-pass';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_KEY = 'service-key';
process.env.RESEND_API_KEY = 'resend-key';
process.env.ANTHROPIC_API_KEY = 'anthropic-key';

const OTHERS = ['no', 'sv', 'da', 'de', 'fr', 'nl'];

// A fake res that records instead of sending.
let LAST_CALLS = [];
const calls_last = () => (LAST_CALLS.filter(c => /resend/.test(c.url)).pop() || {}).body;

function makeRes() {
  const res = { code: 200, body: null, headersSent: false };
  res.status = (c) => { res.code = c; return res; };
  res.json = (b) => { res.body = b; res.headersSent = true; return res; };
  return res;
}
const req = (url, extra = {}) => ({
  url, method: 'GET', headers: { 'x-passcode': 'test-pass' },
  query: Object.fromEntries(new URL(url, 'http://x').searchParams), ...extra,
});
const post = (url, body, extra = {}) => ({ ...req(url), method: 'POST', body, ...extra });

// A fake Supabase that answers from a table in memory and records what it was asked. A read
// with an id filter returns that row, and a write to a row that exists changes it, so a test
// can follow one post through approve, queue and send.
function fakeSupabase(table, mail = { ok: true }, translation = null) {
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), method: init.method || 'GET', body: init.body });
    const u = String(url);
    if (/api\.anthropic\.com/.test(u)) {
      if (translation && translation.fail) return { ok: false, status: 500, json: async () => ({ error: 'model down' }) };
      const body = translation && translation.out
        ? translation.out
        : Object.fromEntries(OTHERS.map(l => [l, `Oversatt ${l}. ${linkFor('day-counter', l)}`]));
      return { ok: true, status: 200, json: async () => ({ content: [{ type: 'text', text: JSON.stringify(body) }] }) };
    }
    if (/api\.resend\.com/.test(u)) {
      return mail.ok
        ? { ok: true, status: 200, json: async () => ({ id: 'mail-1' }) }
        : { ok: false, status: 422, json: async () => ({ message: mail.error || 'refused' }) };
    }
    if (!/\/rest\/v1\/fb_posts/.test(u)) {
      return { ok: false, status: 400, text: async () => `unexpected table in ${u}` };
    }
    const idMatch = u.match(/[?&]id=eq\.([^&]+)/);
    const id = idMatch ? decodeURIComponent(idMatch[1]) : null;
    if ((init.method || 'GET') === 'GET') {
      const rows = id ? table.filter(r => r.id === id) : table;
      return { ok: true, status: 200, text: async () => JSON.stringify(rows) };
    }
    if (init.method === 'POST') return { ok: true, status: 201, text: async () => init.body };
    if (init.method === 'PATCH') {
      const patch = JSON.parse(init.body);
      const row = table.find(r => r.id === id);
      if (row) Object.assign(row, patch);
      return { ok: true, status: 200, text: async () => JSON.stringify([row || { id: id || 'x', ...patch }]) };
    }
    return { ok: false, status: 405, text: async () => 'no' };
  };
  LAST_CALLS = calls;
  return calls;
}
const mails = (calls) => calls.filter(c => /resend/.test(c.url));

const ENGLISH = 'First line of the original.\n\nSecond paragraph with enough text in it.';
const trFor = (langs = OTHERS) =>
  Object.fromEntries(langs.map(l => [l, `Oversatt ${l}. ${linkFor('day-counter', l)}`]));

const samplePost = (over = {}) => ({
  id: '1', idea_key: 'ninety-days', language: 'en', tool_slug: 'day-counter',
  tool_url: 'https://www.247spain.es/day-counter',
  post_text: ENGLISH,
  translations: trFor(), translations_of: hashOf(ENGLISH),
  edited_text: null, note: 'Leave out the Brits in Spain group today', image_url: cardFor('ninety-days', 'en'),
  image_options: [cardFor('ninety-days', 'en'), 'https://images.pexels.com/photos/2/b.jpeg'],
  status: 'pending', sent_at: null, send_day: null, ...over,
});

// Routing
ok('the router knows six actions', ACTIONS.length === 6 && ['seed', 'dispatch', 'trial', 'intro'].every(a => ACTIONS.includes(a)), ACTIONS.join(','));
ok('query form resolves', resolveAction(req('/api/fb?action=posts')) === 'posts');
ok('path form resolves', resolveAction(req('/api/fb/decide')) === 'decide');
ok('hyphen form resolves', resolveAction(req('/api/fb-seed')) === 'seed');
ok('the daily send resolves', resolveAction(req('/api/fb?action=dispatch')) === 'dispatch');
ok('a LinkedIn action is not routable here', resolveAction(req('/api/fb?action=remind')) === null);

// The gate
{
  fakeSupabase([]);
  const res = makeRes();
  await fbRouter({ ...req('/api/fb?action=posts'), headers: { 'x-passcode': 'wrong' } }, res);
  ok('a wrong password is refused', res.code === 401, String(res.code));
}
{
  const res = makeRes();
  await fbRouter(req('/api/fb?action=nope'), res);
  ok('an unknown action is a 404', res.code === 404, String(res.code));
}

// Seed, from empty
{
  const calls = fakeSupabase([]);
  const res = makeRes();
  await fbRouter(post('/api/fb?action=seed', {}), res);
  ok('seed succeeds on an empty table', res.code === 200 && res.body && res.body.ok, JSON.stringify(res.body).slice(0, 160));
  ok('seed writes one row per idea', res.body.written === 30, String(res.body && res.body.written));
  ok('seed reports 30 ideas in 7 languages', res.body.ideas === 30 && res.body.languages === 7);
  ok('seed only ever talked to fb_posts', calls.every(c => /\/rest\/v1\/fb_posts/.test(c.url)));
  const written = JSON.parse(calls.find(c => c.method === 'POST').body);
  ok('every written row carries its post text', written.every(r => r.post_text && r.post_text.length > 200));
  ok('every written row offers its own English image', written.every(r => r.image_options.length === 1 && r.image_url === cardFor(r.idea_key, 'en')));
  ok('every written row starts as pending', written.every(r => r.status === 'pending'));
  ok('every row is English', written.every(r => r.language === 'en'));
  ok('every row carries the six translations',
     written.every(r => OTHERS.every(l => r.translations[l] && r.translations[l].length > 100)));
  ok('and stamps the English they were made from',
     written.every(r => r.translations_of === hashOf(r.post_text)));
  ok('a tool row links to the English tool', written.filter(r => r.tool_slug !== BUENO_TOOL)
     .every(r => r.tool_url === `https://www.247spain.es/${r.tool_slug}`));
  ok('a Bueno row links to the Bueno tax page', written.filter(r => r.tool_slug === BUENO_TOOL).length === 10
     && written.filter(r => r.tool_slug === BUENO_TOOL).every(r => r.tool_url === 'https://getbueno.com/products/non-resident-tax-return/'));
  ok('every row names Bueno in the text Pratik reviews', written.every(r => /\bBueno\b/.test(r.post_text)));
  ok('a tool row ends with the sponsor line', written.filter(r => r.tool_slug !== BUENO_TOOL).every(r => r.post_text.endsWith(SPONSOR.en)));
  ok('the hook is the first line of the post', written.every(r => r.post_text.startsWith(r.hook)));
  // PostgREST refuses a bulk upsert whose objects carry different keys (PGRST102).
  const keys = (r) => Object.keys(r).sort().join(',');
  ok('every row carries the same keys', written.every(r => keys(r) === keys(written[0])));
}

// Seed again, over decisions already made. This is the behaviour that matters most: a
// reseed must refresh the writing without throwing away what Pratik did with it. Twenty
// rows already exist in production and ten are new, which is exactly this mix.
{
  const chosen = cardFor('ninety-days', 'en');
  const existing = [
    { id: 'a', idea_key: 'ninety-days', language: 'en', status: 'posted', note: 'Costa Blanca group, 3 Sept', posted_at: '2026-09-03T10:00:00Z', image_url: chosen },
    { id: 'b', idea_key: 'imputed-income-empty-home', language: 'en', status: 'rejected', note: 'too long', posted_at: null, image_url: 'https://images.pexels.com/photos/999999/pexels-photo-999999.jpeg' },
  ];
  const calls = fakeSupabase(existing);
  const res = makeRes();
  await fbRouter(post('/api/fb?action=seed', {}), res);
  const upsert = calls.find(c => c.method === 'POST');
  const written = JSON.parse(upsert.body);
  const a = written.find(r => r.idea_key === 'ninety-days');
  const b = written.find(r => r.idea_key === 'imputed-income-empty-home');

  ok('a reseed finds the row by its key, not by an id', /on_conflict=idea_key,language/.test(upsert.url) && written.every(r => !('id' in r)));
  const keys = (r) => Object.keys(r).sort().join(',');
  ok('old and new rows carry the same keys', written.every(r => keys(r) === keys(written[0])));
  ok('a reseed keeps the status', a.status === 'posted' && b.status === 'rejected');
  ok('a reseed keeps the note', a.note === 'Costa Blanca group, 3 Sept' && b.note === 'too long');
  ok('a reseed keeps the posted date', a.posted_at === '2026-09-03T10:00:00Z');
  ok('a reseed keeps an image that is still offered', a.image_url === chosen);
  ok('a reseed replaces an image that is no longer offered', b.image_url !== 'https://images.pexels.com/photos/999999/pexels-photo-999999.jpeg'
    && b.image_options.includes(b.image_url));
  ok('a reseed still refreshes the writing', a.post_text.length > 200 && b.post_text.length > 200);
  ok('a reseed reports the decisions it kept', res.body.kept_decisions === 2, String(res.body.kept_decisions));
}

// Seed, dry
{
  fakeSupabase([]);
  const res = makeRes();
  await fbRouter(post('/api/fb?action=seed', { dry: true }), res);
  ok('a dry run writes nothing and says what it would do', res.body.dry === true && res.body.would_write === 30);
}

// Posts
{
  const rows = [
    { id: '1', idea_key: 'k', language: 'en', status: 'pending' },
    { id: '2', idea_key: 'k2', language: 'en', status: 'posted' },
    { id: '3', idea_key: QUEUE_ORDER[4], language: 'en', status: 'approved', sent_at: null },
    { id: '4', idea_key: QUEUE_ORDER[1], language: 'en', status: 'approved', sent_at: null },
    { id: '5', idea_key: QUEUE_ORDER[0], language: 'en', status: 'approved', sent_at: '2026-10-07T03:30:00Z', send_day: 1 },
  ];
  const calls = fakeSupabase(rows);
  const res = makeRes();
  await fbRouter(req('/api/fb?action=posts&status=all'), res);
  ok('posts returns the rows and counts them', res.body.total === 5 && res.body.counts.posted === 1);
  ok('the dashboard gets a total as well', res.body.counts.all === 5);
  ok('it counts what is waiting and what has gone', res.body.counts.queued === 2 && res.body.counts.sent === 1);
  ok('a queued post knows its place', res.body.posts.find(p => p.id === '4').queue_pos === 1
     && res.body.posts.find(p => p.id === '3').queue_pos === 2);
  ok('a sent post has no place in the queue', res.body.posts.find(p => p.id === '5').queue_pos === undefined);
  ok('it says which day comes next', res.body.next_day === 2);
  ok('no language filter is sent any more', !/language=eq/.test(calls[0].url));
  const res2 = makeRes();
  await fbRouter(req('/api/fb?action=posts&status=approved'), res2);
  ok('a status view shows only that status', res2.body.total === 3 && res2.body.counts.all === 5);
}
{
  fakeSupabase([{ id: '1', idea_key: 'k', status: 'pending' }]);
  const res = makeRes();
  await fbRouter(req('/api/fb?action=posts&status=nonsense'), res);
  ok('a nonsense status is treated as everything', res.body.total === 1);
}

// Decide
{
  fakeSupabase([]);
  const res = makeRes();
  await fbRouter(post('/api/fb?action=decide', { id: '1', action: 'posted' }), res);
  ok('marking posted works', res.body.ok === true);
  ok('marking posted stamps the date', !!res.body.post.posted_at);
}
{
  fakeSupabase([samplePost()]);
  const res = makeRes();
  await fbRouter(post('/api/fb?action=decide', { id: '1', action: 'approved' }), res);
  ok('approving clears any posted date', res.body.post.posted_at === null);
}
{
  fakeSupabase([]);
  const res = makeRes();
  await fbRouter(post('/api/fb?action=decide', { id: 'missing', action: 'approved' }), res);
  ok('approving a post that does not exist is a 404', res.code === 404, String(res.code));
}
{
  fakeSupabase([{ id: '1', image_options: ['https://a.example/1.jpg', 'https://a.example/2.jpg'] }]);
  const res = makeRes();
  await fbRouter(post('/api/fb?action=decide', { id: '1', action: 'image', image: 'https://a.example/2.jpg' }), res);
  ok('an offered image is accepted', res.body.ok === true && res.body.post.image_url === 'https://a.example/2.jpg');
}
{
  fakeSupabase([{ id: '1', image_options: ['https://a.example/1.jpg'] }]);
  const res = makeRes();
  await fbRouter(post('/api/fb?action=decide', { id: '1', action: 'image', image: 'https://evil.example/x.jpg' }), res);
  ok('an image that is not one of the options is refused', res.code === 400, String(res.code));
}
{
  fakeSupabase([]);
  const res = makeRes();
  await fbRouter(post('/api/fb?action=decide', { id: '1', action: 'delete' }), res);
  ok('an unknown decision is refused', res.code === 400, String(res.code));
}
{
  fakeSupabase([]);
  const res = makeRes();
  await fbRouter(post('/api/fb?action=decide', { action: 'posted' }), res);
  ok('a decision without an id is refused', res.code === 400, String(res.code));
}
{
  fakeSupabase([]);
  const res = makeRes();
  await fbRouter({ ...req('/api/fb?action=decide'), method: 'GET' }, res);
  ok('decide refuses a GET', res.code === 405, String(res.code));
}

// ---------------------------------------------------------------------------
// The email.
// ---------------------------------------------------------------------------

// What is sent is the edit where there is one, untouched.
ok('the original is sent when there is no edit', finalText(samplePost()).startsWith('First line'));
ok('the edit wins over the original', finalText(samplePost({ edited_text: '  My edit  ' })) === 'My edit');
ok('a blank edit does not win', finalText(samplePost({ edited_text: '   ' })).startsWith('First line'));

{
  const p = samplePost({ edited_text: 'Edited line one.\n\nRest.' });
  const html = bodyFor(p, 3);
  ok('the email carries the edited text, not the original', html.includes('Edited line one.') && !html.includes('First line of the original'));
  ok('the email carries a note from Pratik when there is one', html.includes('Leave out the Brits in Spain group today'));
  ok('the email carries all six translations', OTHERS.every(l => html.includes(`Oversatt ${l}.`)));
  ok('and labels each language', ['English','Norwegian','Swedish','Danish','German','French','Dutch'].every(n => html.includes(n)));
  ok('each version carries its own link', OTHERS.every(l => html.includes(linkFor('day-counter', l))));
  ok('the email carries one image per language, each with that language on it',
     ['en', ...OTHERS].every(l => html.includes(cardFor('ninety-days', l))));
  ok('no image is shared between two languages', new Set(['en', ...OTHERS].map(l => cardFor('ninety-days', l))).size === 7);
  ok('the email carries the tool link', html.includes(p.tool_url));
  ok('the email says which day it is', /day 3/i.test(html) && /^Day 3\. Facebook post to publish:/.test(subjectFor(p, 3)));
  ok('the email names no other company', !/\b(Sabadell|BBVA|CaixaBank|Revolut|Wise)\b/i.test(html));
  ok('the subject is one post, not one language', !/\(German\)/.test(subjectFor(p, 3)));
  ok('one publisher address, one copy', SEND_TO.length === 1 && SEND_CC.length === 1);

  // The groups. Every language names its account and that day's groups, as links.
  for (const lang of ['en', ...OTHERS]) {
    const groups = groupsFor(lang, 3);
    ok(`${lang}: the email names Account ${ACCOUNT[lang]}`, html.includes(`Post it from Account ${ACCOUNT[lang]} in these ${groups.length} groups today`));
    ok(`${lang}: the email links every one of today's groups`, groups.every(g => html.includes(`href="${g.url}"`)));
  }
  ok('the accounts are called 1 to 7 and nothing else', [1,2,3,4,5,6,7].every(n => html.includes(`Account ${n}`)) && !/Account [089]/.test(html));
  const d4 = bodyFor(p, 4);
  ok('the next day carries different groups', !d4.includes(`href="${groupsFor('en', 3)[0].url}"`) && d4.includes(`href="${groupsFor('en', 4)[0].url}"`));
  ok('the dry run reports the same groups the email prints', groupsToday(3).length === 7
     && groupsToday(3).every(x => x.groups.every(g => html.includes(`href="${g.url}"`))));
}
{
  const html = bodyFor(samplePost({ note: null }), 1);
  ok('with no note there is no note box', !/From Pratik/.test(html));
  ok('and nobody is told to check before posting, because the groups are in the email', !/check with Pratik/i.test(html));
}

// Editing
{
  fakeSupabase([]);
  const res = makeRes();
  await fbRouter(post('/api/fb?action=decide', { id: '1', action: 'edit', text: '  new words  ' }), res);
  ok('an edit is saved trimmed', res.body.post.edited_text === 'new words');
  ok('an edit does not touch the original', res.body.post.post_text === undefined);
}
{
  fakeSupabase([]);
  const res = makeRes();
  await fbRouter(post('/api/fb?action=decide', { id: '1', action: 'edit', text: '   ' }), res);
  ok('an empty edit is refused', res.code === 400, String(res.code));
}
{
  fakeSupabase([]);
  const res = makeRes();
  await fbRouter(post('/api/fb?action=decide', { id: '1', action: 'edit', text: 'x'.repeat(9000) }), res);
  ok('an absurdly long edit is refused', res.code === 400, String(res.code));
}

// Parking, with a reason
{
  fakeSupabase([]);
  const res = makeRes();
  await fbRouter(post('/api/fb?action=decide', { id: '1', action: 'rejected', comment: 'reads as an ad' }), res);
  ok('parking keeps the reason', res.body.post.status === 'rejected' && res.body.post.reject_comment === 'reads as an ad');
}
{
  fakeSupabase([]);
  const res = makeRes();
  await fbRouter(post('/api/fb?action=decide', { id: '1', action: 'pending' }), res);
  ok('undo clears the reason and any send error', res.body.post.reject_comment === null && res.body.post.send_error === null);
}

// A custom image
{
  fakeSupabase([samplePost()]);
  const res = makeRes();
  const url = 'https://cdn.example.com/mine.png';
  await fbRouter(post('/api/fb?action=decide', { id: '1', action: 'image_custom', image: url }), res);
  ok('a pasted https image is accepted', res.body.post.image_url === url);
  ok('and is kept in the options so it survives a reseed', res.body.post.image_options[0] === url);
}
{
  fakeSupabase([samplePost()]);
  const res = makeRes();
  await fbRouter(post('/api/fb?action=decide', { id: '1', action: 'image_custom', image: 'http://insecure.example/x.png' }), res);
  ok('a plain http image is refused', res.code === 400, String(res.code));
}
{
  fakeSupabase([samplePost()]);
  const res = makeRes();
  await fbRouter(post('/api/fb?action=decide', { id: '1', action: 'image_custom', image: 'javascript:alert(1)' }), res);
  ok('a non https scheme is refused', res.code === 400, String(res.code));
}

// ---------------------------------------------------------------------------
// Approving queues. It does not send.
// ---------------------------------------------------------------------------
{
  const calls = fakeSupabase([samplePost()]);
  const res = makeRes();
  await fbRouter(post('/api/fb?action=decide', { id: '1', action: 'approved' }), res);
  ok('approving reports that it queued', res.body.queued === true && res.body.sent === false);
  ok('approving sets the status', res.body.post.status === 'approved');
  ok('approving emails nobody', mails(calls).length === 0);
  ok('approving leaves no sent_at to lie about', !res.body.post.sent_at);
}
{
  const calls = fakeSupabase([samplePost({ sent_at: '2026-09-10T09:00:00Z', send_day: 2 })]);
  const res = makeRes();
  await fbRouter(post('/api/fb?action=decide', { id: '1', action: 'approved' }), res);
  ok('approving an already sent post does not queue it again', res.body.queued === false && res.body.reason === 'already sent');
  ok('and really does not touch Resend', mails(calls).length === 0);
}
{
  fakeSupabase([samplePost({ post_text: '', edited_text: null })]);
  const res = makeRes();
  await fbRouter(post('/api/fb?action=decide', { id: '1', action: 'approved' }), res);
  ok('a post with no text is never queued', res.body.queued === false && res.body.post.status === 'pending');
}

// Sending one ahead of the queue, and sending one again.
{
  const table = [samplePost({ status: 'approved' }), samplePost({ id: '2', idea_key: 'k2', status: 'approved', sent_at: '2026-10-07T03:30:00Z', send_day: 4 })];
  const calls = fakeSupabase(table);
  const res = makeRes();
  await fbRouter(post('/api/fb?action=decide', { id: '1', action: 'send_now' }), res);
  ok('send now does send', res.body.sent === true && mails(calls).length === 1);
  ok('send now takes the next day number', res.body.day === 5 && res.body.post.send_day === 5);
  ok('send now records when and to whom', !!res.body.post.sent_at && res.body.post.sent_to === SEND_TO.join(', '));
  const sent = JSON.parse(mails(calls)[0].body);
  ok('it went to the publisher address', sent.to.join(',') === 'poornimanirwal@gmail.com', sent.to.join(','));
  ok('with Pratik copied', sent.cc.join() === 'pratik.y.renuse@gmail.com', String(sent.cc));
  ok('and a reply goes back to Pratik', sent.reply_to === 'pratik.y.renuse@gmail.com');
  ok('the subject carries the day', /^Day 5\./.test(sent.subject));
}
{
  const calls = fakeSupabase([samplePost({ status: 'approved', sent_at: '2026-10-07T03:30:00Z', send_day: 4 })]);
  const res = makeRes();
  await fbRouter(post('/api/fb?action=decide', { id: '1', action: 'send_now' }), res);
  ok('send now refuses a post that has already gone', res.code === 400 && mails(calls).length === 0);
  const res2 = makeRes();
  await fbRouter(post('/api/fb?action=decide', { id: '1', action: 'resend' }), res2);
  ok('resending is deliberate and does send', res2.body.sent === true && mails(calls).length === 1);
  ok('a resend repeats the day the post first had, so the groups are the same', res2.body.day === 4
     && /^Day 4\./.test(JSON.parse(mails(calls)[0].body).subject));
}
{
  const calls = fakeSupabase([samplePost({ status: 'approved' })]);
  const res = makeRes();
  await fbRouter(post('/api/fb?action=decide', { id: '1', action: 'resend' }), res);
  ok('resend refuses a post that was never sent', res.code === 400 && mails(calls).length === 0);
}
{
  fakeSupabase([samplePost({ status: 'approved' })], { ok: false, error: 'domain not verified' });
  const res = makeRes();
  await fbRouter(post('/api/fb?action=decide', { id: '1', action: 'send_now' }), res);
  ok('a failed send is reported, not swallowed', res.body.sent === false && /domain not verified/.test(res.body.error));
  ok('a failed send leaves no sent_at to lie about', !res.body.post.sent_at);
  ok('and the error is kept on the row', /domain not verified/.test(res.body.post.send_error));
}
{
  delete process.env.RESEND_API_KEY;
  fakeSupabase([samplePost({ status: 'approved' })]);
  const res = makeRes();
  await fbRouter(post('/api/fb?action=decide', { id: '1', action: 'send_now' }), res);
  ok('a missing Resend key is a clear message, not a crash', res.body.sent === false && /RESEND_API_KEY/.test(res.body.error));
  process.env.RESEND_API_KEY = 'resend-key';
}

// A reseed must not throw away an edit or the record of a send.
{
  const existing = [{
    id: 'a', idea_key: 'ninety-days', language: 'en', status: 'approved',
    note: 'Costa Blanca group', posted_at: null, image_url: null,
    edited_text: 'My own version of the ninety days post.',
    reject_comment: null, sent_at: '2026-09-10T08:00:00Z',
    sent_to: 'poornimanirwal@gmail.com', send_error: null,
    translations: trFor(), translations_of: 'a-hash-from-before',
  }, {
    // Never emailed, and carrying a set made from wording that has since been rewritten.
    id: 'b', idea_key: 'imputed-income-empty-home', language: 'en', status: 'pending',
    note: null, posted_at: null, image_url: null, edited_text: null,
    reject_comment: null, sent_at: null, sent_to: null, send_error: null,
    translations: trFor(), translations_of: 'a-stale-hash',
  }];
  const calls = fakeSupabase(existing);
  const res = makeRes();
  await fbRouter(post('/api/fb?action=seed', {}), res);
  const written = JSON.parse(calls.find(c => c.method === 'POST' && /fb_posts/.test(c.url)).body);
  const a = written.find(r => r.idea_key === 'ninety-days');
  const b = written.find(r => r.idea_key === 'imputed-income-empty-home');
  ok('a reseed keeps the edit', a.edited_text === 'My own version of the ninety days post.');
  ok('a reseed keeps the record of the send',
     a.sent_at === '2026-09-10T08:00:00Z' && a.sent_to === 'poornimanirwal@gmail.com');
  ok('a reseed never writes the day number, so it cannot reset it', written.every(r => !('send_day' in r)));
  ok('a reseed still refreshes the original writing', a.post_text.includes('90 days'));
  ok('a reseed keeps translations that have already gone out', a.translations_of === 'a-hash-from-before');
  ok('but rewrites translations on a post that has not', b.translations_of === hashOf(b.post_text));
  ok('and the rewritten set is the written one, not a machine rebuild',
     OTHERS.every(l => b.translations[l] && b.translations[l].length > 100));
  ok('a reseed sends nothing', mails(calls).length === 0);
}

// The sandbox sender. RESEND_FROM is set in Vercel, but if it ever were not, a send would
// come back ok and reach nobody. The deck must say so rather than claiming it was sent.
{
  const before = process.env.RESEND_FROM;
  delete process.env.RESEND_FROM;
  fakeSupabase([samplePost({ status: 'approved' })]);
  const res = makeRes();
  await fbRouter(post('/api/fb?action=decide', { id: '1', action: 'send_now' }), res);
  ok('a sandbox send is flagged rather than reported as delivered',
     res.body.sent === true && /RESEND_FROM is not set/.test(res.body.warning || ''));
  ok('the warning names the person who did not receive it',
     /poornimanirwal@gmail\.com/.test(res.body.warning || ''));
  if (before) process.env.RESEND_FROM = before;
}
{
  process.env.RESEND_FROM = '24/7 Spain <hello@247spain.es>';
  fakeSupabase([samplePost({ status: 'approved' })]);
  const res = makeRes();
  await fbRouter(post('/api/fb?action=decide', { id: '1', action: 'send_now' }), res);
  ok('a real sender carries no warning', res.body.sent === true && !res.body.warning);
  const mail = JSON.parse(calls_last());
  ok('and the from address is the configured one', mail.from === '24/7 Spain <hello@247spain.es>');
  delete process.env.RESEND_FROM;
}

// ---------------------------------------------------------------------------
// The translations, which are the thing that can quietly go wrong.
// ---------------------------------------------------------------------------

ok('translations of this English are current', isCurrent(samplePost(), ENGLISH));
ok('an edit makes them stale', !isCurrent(samplePost(), 'Something else entirely.'));
ok('a missing language makes them stale',
   !isCurrent(samplePost({ translations: trFor(['no', 'sv']) }), ENGLISH));
ok('a set written before Danish existed is stale',
   !isCurrent(samplePost({ translations: trFor(['no', 'sv', 'de', 'fr', 'nl']) }), ENGLISH));
ok('an empty language makes them stale',
   !isCurrent(samplePost({ translations: { ...trFor(), de: '   ' } }), ENGLISH));

ok('a translation with a dash is rejected',
   checkTranslation('hei — der https://www.247spain.es/no/day-counter', 'no', 'day-counter') !== null);
ok('a translation missing its link is rejected',
   checkTranslation('hei der', 'no', 'day-counter') !== null);
ok('a translation naming another company is rejected',
   checkTranslation('hei Sabadell https://www.247spain.es/no/day-counter', 'no', 'day-counter') !== null);
ok('a translation naming Bueno is fine',
   checkTranslation('hei Bueno https://www.247spain.es/no/day-counter', 'no', 'day-counter') === null);
ok('a good translation passes',
   checkTranslation('hei der https://www.247spain.es/no/day-counter', 'no', 'day-counter') === null);
ok('a Danish tool translation must carry the English tool link',
   checkTranslation('hej https://www.247spain.es/day-counter', 'da', 'day-counter') === null
   && checkTranslation('hej https://www.247spain.es/da/day-counter', 'da', 'day-counter') !== null);
ok('a Bueno translation must carry that language\'s Bueno page',
   checkTranslation(`hej ${linkFor(BUENO_TOOL, 'da')}`, 'da', BUENO_TOOL) === null
   && checkTranslation('hej https://getbueno.com/', 'da', BUENO_TOOL) !== null);

// Approving an unedited post uses what is stored and calls nothing.
{
  const calls = fakeSupabase([samplePost()]);
  const res = makeRes();
  await fbRouter(post('/api/fb?action=decide', { id: '1', action: 'approved' }), res);
  ok('an unedited post is not retranslated', res.body.retranslated === false);
  ok('and the model is never called', calls.filter(c => /anthropic/.test(c.url)).length === 0);
  ok('it is queued', res.body.queued === true);
}

// Approving an edited post rebuilds the translations from the edit, at once, so a problem
// shows while Pratik is still looking at the post.
{
  const calls = fakeSupabase([samplePost({ edited_text: 'My own version, which is quite different.' })]);
  const res = makeRes();
  await fbRouter(post('/api/fb?action=decide', { id: '1', action: 'approved' }), res);
  ok('an edited post is retranslated', res.body.retranslated === true);
  ok('the model is called exactly once', calls.filter(c => /anthropic/.test(c.url)).length === 1);
  ok('the model is asked to translate the edit, not the original',
     JSON.parse(calls.find(c => /anthropic/.test(c.url)).body).messages[0].content.includes('My own version'));
  ok('the model is asked for all six languages',
     OTHERS.every(l => JSON.parse(calls.find(c => /anthropic/.test(c.url)).body).messages[0].content.includes(`"${l}"`)));
  ok('the new translations are saved', OTHERS.every(l => new RegExp(`Oversatt ${l}`).test(JSON.stringify(res.body.post.translations))));
  ok('stamped with the hash of the edit', res.body.post.translations_of === hashOf('My own version, which is quite different.'));
  ok('and still nothing is emailed', mails(calls).length === 0);
}

// An edit that keeps the sponsor line: the body is translated, and each language gets its
// own written sponsor line back, so the sentence naming Bueno is never left to the model.
{
  const edit = `My own version of it.\n\nhttps://www.247spain.es/day-counter\n\n${SPONSOR.en}`;
  const calls = fakeSupabase([samplePost({ edited_text: edit })]);
  const res = makeRes();
  await fbRouter(post('/api/fb?action=decide', { id: '1', action: 'approved' }), res);
  const asked = JSON.parse(calls.find(c => /anthropic/.test(c.url)).body).messages[0].content;
  ok('the sponsor line is not sent to the model', !asked.includes(SPONSOR.en));
  ok('each language gets its own sponsor line back', OTHERS.every(l => res.body.post.translations[l].endsWith(SPONSOR[l])));
}

// If the rebuild fails, nothing is queued. Stale translations under an approval would be worse.
{
  const calls = fakeSupabase([samplePost({ edited_text: 'An edit that cannot be translated.' })], { ok: true }, { fail: true });
  const res = makeRes();
  await fbRouter(post('/api/fb?action=decide', { id: '1', action: 'approved' }), res);
  ok('a failed rebuild queues nothing', res.body.queued === false && res.body.sent === false);
  ok('and really does not touch Resend', mails(calls).length === 0);
  ok('and the post goes back to pending rather than sitting approved', res.body.post.status === 'pending');
  ok('and it says why', /could not be rebuilt/i.test(res.body.error));
}

// A translation that comes back breaking a house rule is refused, and nothing is queued.
{
  const bad = { out: { no: 'hei — der https://www.247spain.es/no/day-counter', sv: 'x', da: 'x', de: 'x', fr: 'x', nl: 'x' } };
  const calls = fakeSupabase([samplePost({ edited_text: 'Another edit entirely here.' })], { ok: true }, bad);
  const res = makeRes();
  await fbRouter(post('/api/fb?action=decide', { id: '1', action: 'approved' }), res);
  ok('a translation breaking the house rules is refused', res.body.queued === false);
  ok('nothing is emailed', mails(calls).length === 0);
  ok('and the reason names the rule', /dash|link/i.test(res.body.error));
}
{
  // An edit that names Bueno, and a model that quietly drops the name.
  const out = Object.fromEntries(OTHERS.map(l => [l, `Uten navnet. ${linkFor('day-counter', l)}`]));
  fakeSupabase([samplePost({ edited_text: 'At Bueno we do this.\n\nhttps://www.247spain.es/day-counter' })], { ok: true }, { out });
  const res = makeRes();
  await fbRouter(post('/api/fb?action=decide', { id: '1', action: 'approved' }), res);
  ok('a translation that drops the name Bueno is refused', res.body.queued === false && /Bueno/.test(res.body.error));
}

{
  // A pasted image of Pratik's own goes with every language, because it is what he chose.
  const html = bodyFor(samplePost({ image_url: 'https://cdn.example.com/mine.png' }), 1);
  ok('a pasted image is used for every language', (html.match(/cdn\.example\.com\/mine\.png/g) || []).length >= 7
     && !html.includes('/fb-cards/'));
}

// ---------------------------------------------------------------------------
// The queue and the daily send. The clock is fixed at 20 October 2026, after posting starts.
// ---------------------------------------------------------------------------
const RealDate = Date;
const setNow = (iso) => {
  const NOW = RealDate.parse(iso);
  globalThis.Date = class extends RealDate {
    constructor(...a) { super(...(a.length ? a : [NOW])); }
    static now() { return NOW; }
  };
};
setNow('2026-10-20T03:30:00Z');
const row = (n, over = {}) => samplePost({ id: `r${n}`, idea_key: QUEUE_ORDER[n], status: 'approved', note: null, ...over });

{
  const rows = [row(5), row(2), row(0, { status: 'pending' }), row(1, { sent_at: '2026-10-07T03:30:00Z', send_day: 1 }), row(9, { status: 'rejected' })];
  const q = queueOf(rows);
  ok('the queue is the approved posts that have not gone', q.length === 2);
  ok('in the written order, not the order they were approved in', q[0].idea_key === QUEUE_ORDER[2] && q[1].idea_key === QUEUE_ORDER[5]);
  ok('the next day is one more than the last day sent', nextDay(rows) === 2 && nextDay([]) === 1);
  ok('it knows whether something went out on a date', sentOn(rows, new Date('2026-10-07T20:00:00Z')) && !sentOn(rows, new Date('2026-10-08T01:00:00Z')));
  const toolOf = Object.fromEntries(IDEAS.map(i => [i.key, i.tool]));
  ok('the written order opens on a Bueno post and then a 24/7 Spain one',
     toolOf[QUEUE_ORDER[0]] === BUENO_TOOL && toolOf[QUEUE_ORDER[1]] !== BUENO_TOOL);
}

// Who may start the daily send.
{
  fakeSupabase([]);
  const res = makeRes();
  await fbRouter({ ...req('/api/fb?action=dispatch&dry=1'), headers: {} }, res);
  ok('the daily send refuses a caller with no credentials', res.code === 401, String(res.code));
  const res2 = makeRes();
  await fbRouter({ ...req('/api/fb?action=dispatch&dry=1'), headers: { authorization: 'Bearer service-key' } }, res2);
  ok('the service key itself is not a credential', res2.code === 401, String(res2.code));
  const token = createHash('sha256').update('service-key', 'utf8').digest('hex');
  const res3 = makeRes();
  await fbRouter({ ...req('/api/fb?action=dispatch&dry=1'), headers: { authorization: `Bearer ${token}` } }, res3);
  ok('the scheduled job gets in with the hash of the service key', res3.code === 200 && res3.body.ok === true, JSON.stringify(res3.body));
  process.env.CRON_SECRET = 'cron-secret';
  const res4 = makeRes();
  await fbRouter({ ...req('/api/fb?action=dispatch&dry=1'), headers: { authorization: 'Bearer cron-secret' } }, res4);
  ok('the cron secret gets in too', res4.code === 200);
  delete process.env.CRON_SECRET;
  const res5 = makeRes();
  await fbRouter(req('/api/fb?action=dispatch&dry=1'), res5);
  ok('and so does the deck password', res5.code === 200);
}

// A dry run says what would go and to which groups, and sends nothing.
{
  const table = [row(3), row(0), row(1)];
  const calls = fakeSupabase(table);
  const res = makeRes();
  await fbRouter(req('/api/fb?action=dispatch&dry=1'), res);
  ok('a dry run sends nothing', res.body.dry === true && res.body.sent === false && mails(calls).length === 0);
  ok('a dry run names the post at the front', res.body.would_send.idea_key === QUEUE_ORDER[0]);
  ok('a dry run says what comes after it', res.body.then.join() === [QUEUE_ORDER[1], QUEUE_ORDER[3]].join());
  ok('a dry run lists every language with its account and groups', res.body.groups.length === 7
     && res.body.groups.every(g => g.account >= 1 && g.account <= 7 && g.groups.length >= 1 && g.groups.length <= MAX_PER_DAY));
  ok('the first day goes into one group per language', res.body.day === 1 && res.body.groups.every(g => g.groups.length === 1));
  ok('a dry run changes no row', table.every(r => !r.sent_at));
}

// The real thing: one post, the one at the front, as day 1.
{
  const table = [row(3), row(0), row(1), row(7, { status: 'pending' })];
  const calls = fakeSupabase(table);
  const res = makeRes();
  await fbRouter(post('/api/fb?action=dispatch', {}), res);
  ok('the daily send sends', res.body.sent === true && res.body.day === 1, JSON.stringify(res.body));
  ok('exactly one email goes out', mails(calls).length === 1);
  ok('it is the post at the front of the queue', res.body.idea_key === QUEUE_ORDER[0]);
  const sent = JSON.parse(mails(calls)[0].body);
  ok('to the publisher, with Pratik copied', sent.to.join() === 'poornimanirwal@gmail.com' && sent.cc.join() === 'pratik.y.renuse@gmail.com');
  ok('the email is day 1 and carries day 1 groups', /^Day 1\./.test(sent.subject)
     && groupsFor('en', 1).every(g => sent.html.includes(`href="${g.url}"`)));
  const first = table.find(r => r.idea_key === QUEUE_ORDER[0]);
  ok('the row records the send and its day', !!first.sent_at && first.send_day === 1 && first.sent_to === SEND_TO.join(', '));
  ok('it says how many are still waiting', res.body.queued === 2);

  // A second call the same day does nothing.
  const res2 = makeRes();
  await fbRouter(post('/api/fb?action=dispatch', {}), res2);
  ok('a second call the same day sends nothing', res2.body.sent === false && res2.body.reason === 'already sent today' && mails(calls).length === 1);

  // Forcing it is a person choosing to, and it takes the next post as day 2.
  const res3 = makeRes();
  await fbRouter(post('/api/fb?action=dispatch', { force: true }), res3);
  ok('force sends the next post as day 2', res3.body.sent === true && res3.body.day === 2 && res3.body.idea_key === QUEUE_ORDER[1]);
  ok('day 2 carries day 2 groups', groupsFor('no', 2).every(g => JSON.parse(mails(calls)[1].body).html.includes(`href="${g.url}"`)));
}

// The next morning the next post goes, and a pending post is skipped, not waited for.
{
  const yesterday = new Date(Date.now() - 26 * 3600 * 1000).toISOString();
  const table = [row(0, { sent_at: yesterday, send_day: 1 }), row(1, { status: 'pending' }), row(2)];
  const calls = fakeSupabase(table);
  const res = makeRes();
  await fbRouter(post('/api/fb?action=dispatch', {}), res);
  ok('the next day the next approved post goes', res.body.sent === true && res.body.day === 2 && res.body.idea_key === QUEUE_ORDER[2]);
  ok('a post nobody approved is never sent', !table[1].sent_at && mails(calls).length === 1);
}

// Nothing approved: the publisher hears nothing and Pratik is told.
{
  const calls = fakeSupabase([row(0, { status: 'pending' })]);
  const res = makeRes();
  await fbRouter(post('/api/fb?action=dispatch', {}), res);
  ok('an empty queue sends no post', res.body.sent === false && res.body.reason === 'queue empty');
  const m = mails(calls).map(c => JSON.parse(c.body));
  ok('an empty queue tells Pratik and only Pratik', m.length === 1 && m[0].to.join() === 'pratik.y.renuse@gmail.com' && !m[0].cc);
  const res2 = makeRes();
  await fbRouter(req('/api/fb?action=dispatch&dry=1'), res2);
  ok('a dry run on an empty queue emails nobody', mails(calls).length === 1 && res2.body.reason === 'queue empty');
}

// A send that fails is a failure the scheduled job can see.
{
  const table = [row(0)];
  fakeSupabase(table, { ok: false, error: 'domain not verified' });
  const res = makeRes();
  await fbRouter(post('/api/fb?action=dispatch', {}), res);
  ok('a failed daily send is a 500, so the job fails loudly', res.code === 500 && res.body.ok === false && /domain not verified/.test(res.body.error));
  ok('the post stays in the queue for tomorrow', !table[0].sent_at && table[0].status === 'approved' && /domain not verified/.test(table[0].send_error));
}

// A queued post whose translations have gone stale is rebuilt at send time, and if that
// fails nothing goes out.
{
  const table = [row(0, { edited_text: 'Edited after approval.' })];
  const calls = fakeSupabase(table, { ok: true }, { fail: true });
  const res = makeRes();
  await fbRouter(post('/api/fb?action=dispatch', {}), res);
  ok('stale translations stop the daily send', res.code === 500 && mails(calls).length === 0);
}

// Before the first posting day nothing goes out, however much is approved.
{
  setNow('2026-10-10T03:30:00Z');
  const calls = fakeSupabase([row(0), row(1)]);
  const res = makeRes();
  await fbRouter(post('/api/fb?action=dispatch', {}), res);
  ok('before 12 October the daily send sends nothing', res.body.sent === false && /2026-10-12/.test(res.body.reason) && mails(calls).length === 0);
  const res2 = makeRes();
  await fbRouter(post('/api/fb?action=dispatch', { force: true }), res2);
  ok('unless someone forces it', res2.body.sent === true);
  setNow('2026-10-12T03:30:00Z');
  fakeSupabase([row(0), row(1)]);
  const res3 = makeRes();
  await fbRouter(post('/api/fb?action=dispatch', {}), res3);
  ok('on 12 October it sends', res3.body.sent === true && res3.body.day === 1);
  globalThis.Date = RealDate;
}
// Never more than three groups a language, in any email.
for (const d of [1, 2, 3, 9, 20]) {
  const html = bodyFor(samplePost(), d);
  const counts = ['en', ...OTHERS].map(l => groupsFor(l, d).length);
  ok(`day ${d}: no language gets more than three groups`, counts.every(n => n <= 3) && html.includes(`in these ${counts[0]} groups today`));
}

// ---------------------------------------------------------------------------
// The instructions email, and the trial Pratik sends himself first.
// ---------------------------------------------------------------------------
{
  const html = introBody();
  ok('the instructions name all seven accounts and their languages',
     ['English', 'Norwegian', 'Swedish', 'Danish', 'German', 'French', 'Dutch'].every(n => html.includes(n))
     && [1, 2, 3, 4, 5, 6, 7].every(n => html.includes(`Account ${n}`)));
  ok('the instructions list every group each account should join, as links',
     Object.values(GROUPS).every(list => list.every(([, url]) => html.includes(`href="${url}"`))));
  ok('the instructions explain the plan, the accounts, held posts and Reddit',
     /day by day/i.test(html) && /Keeping the accounts healthy/.test(html) && /Waiting for admin/.test(html) && /Reddit/.test(html));
  const plan = planDays();
  ok('the plan runs from 9 to 31 October', plan[0].date === '2026-10-09' && plan[plan.length - 1].date === '2026-10-31' && plan.length === 23);
  ok('the first three days are joining and warming up, with no posting', plan.slice(0, 3).every(p => !p.day && /No posting/.test(p.task)));
  ok('days 1 and 2 of the plan are for joining every group', /join the first half/.test(plan[0].task) && /join the rest/.test(plan[1].task));
  ok('posting starts on 12 October with one group, then two, then three',
     plan[3].date === '2026-10-12' && /in 1 group/.test(plan[3].task) && /in 2 groups/.test(plan[4].task) && /in 3 groups/.test(plan[5].task));
  ok('every day of the plan is in the email', plan.every(p => html.includes(p.label)));
  ok('the instructions ask for no friend requests to strangers', /Please do not send friend requests to random strangers/.test(html));
  ok('the instructions carry no dash and no emoji', !/[\u2014\u2013]/.test(html) && !/[\u{1F300}-\u{1FAFF}]/u.test(html));
  ok('a real instructions email carries no trial banner', !/Trial copy/.test(html));
  ok('a trial copy says so at the top', /Trial copy for Pratik/.test(introBody({ trial: true })));
  ok('a trial post says so at the top, and a real one does not',
     /Trial copy for Pratik/.test(bodyFor(samplePost(), 1, { trial: true })) && !/Trial copy/.test(bodyFor(samplePost(), 1)));
}
{
  // Nothing approved yet: the trial shows the first post in the written order, as day 1.
  const table = [row(0, { status: 'pending' })];
  const calls = fakeSupabase(table);
  const res = makeRes();
  await fbRouter(post('/api/fb?action=trial', {}), res);
  const m = mails(calls).map(c => JSON.parse(c.body));
  ok('a trial sends two emails', res.body.ok === true && m.length === 2, JSON.stringify(res.body));
  ok('both go to Pratik alone, with nobody copied', m.every(x => x.to.join() === 'pratik.y.renuse@gmail.com' && !x.cc));
  ok('Poornima is on neither', !JSON.stringify(m).includes('poornimanirwal'));
  ok('the first is the instructions', m[0].subject === `Trial: ${INTRO_SUBJECT}`);
  ok('the second is day 1 of the posts, with day 1 groups', /^Trial: Day 1\./.test(m[1].subject)
     && groupsToday(1).every(x => x.groups.every(g => m[1].html.includes(`href="${g.url}"`))));
  ok('the trial post is the first in the written order', res.body.idea_key === QUEUE_ORDER[0] && res.body.from_queue === false);
  ok('the trial post carries all seven languages', ['English', 'Danish', 'Dutch'].every(n => m[1].html.includes(n)));
  ok('a trial marks nothing as sent', table.every(r => !r.sent_at && !r.send_day) && !calls.some(c => c.method === 'PATCH'));
}
{
  // Something approved: the trial shows what will really go next, as the next day.
  const table = [row(0, { sent_at: '2026-10-07T03:30:00Z', send_day: 1 }), row(3), row(1)];
  const calls = fakeSupabase(table);
  const res = makeRes();
  await fbRouter(post('/api/fb?action=trial', {}), res);
  ok('a trial shows the post at the front of the queue as the next day',
     res.body.idea_key === QUEUE_ORDER[1] && res.body.day === 2 && res.body.from_queue === true);
  ok('and still sends to nobody but Pratik', mails(calls).every(c => !c.body.includes('poornimanirwal')));
}
{
  const calls = fakeSupabase([]);
  const res = makeRes();
  await fbRouter(post('/api/fb?action=intro', {}), res);
  ok('the real instructions need confirm: true', res.code === 400 && mails(calls).length === 0);
  const res2 = makeRes();
  await fbRouter(post('/api/fb?action=intro', { confirm: true }), res2);
  const m = JSON.parse(mails(calls)[0].body);
  ok('the real instructions go to Poornima with Pratik copied',
     res2.body.ok === true && m.to.join() === 'poornimanirwal@gmail.com' && m.cc.join() === 'pratik.y.renuse@gmail.com'
     && m.subject === INTRO_SUBJECT && !/Trial/.test(m.html));
  const res3 = makeRes();
  await fbRouter({ ...post('/api/fb?action=trial', {}), headers: { 'x-passcode': 'wrong' } }, res3);
  ok('a trial needs the password', res3.code === 401);
}
{
  // Everything that goes to Poornima is copied to Pratik.
  ok('every send to the publisher copies Pratik', SEND_CC.join() === 'pratik.y.renuse@gmail.com');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
