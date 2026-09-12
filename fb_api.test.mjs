// The three handlers behind /api/fb, exercised against a fake Supabase.
//
// The deck is seeded by a button, so the first thing that happens in production is a POST
// to this seed handler. That makes it worth knowing here, offline, that it builds the rows
// it should, keeps decisions that have already been made, and refuses the things it should
// refuse. Nothing in this file touches a network or a real database.

import fbRouter, { resolveAction, ACTIONS } from './api/fb.js';
import { finalText, subjectFor, bodyFor, SEND_TO, SEND_CC } from './api/_fb_email.js';
import { hashOf, isCurrent, checkTranslation } from './api/_fb_translate.js';

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => cond ? pass++ : (fail++, console.log('FAIL', name, extra));

process.env.INTERNAL_PASSCODE = 'test-pass';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_KEY = 'service-key';
process.env.RESEND_API_KEY = 'resend-key';
process.env.ANTHROPIC_API_KEY = 'anthropic-key';

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

// A fake Supabase that answers from a table in memory and records what it was asked.
function fakeSupabase(table, mail = { ok: true }, translation = null) {
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), method: init.method || 'GET', body: init.body });
    const u = String(url);
    if (/api\.anthropic\.com/.test(u)) {
      if (translation && translation.fail) return { ok: false, status: 500, json: async () => ({ error: 'model down' }) };
      const body = translation && translation.out
        ? translation.out
        : Object.fromEntries(['no','sv','de','fr','nl'].map(l =>
            [l, `Oversatt ${l}. https://www.247spain.es/${l}/day-counter`]));
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
    if ((init.method || 'GET') === 'GET') return { ok: true, status: 200, text: async () => JSON.stringify(table) };
    if (init.method === 'POST') return { ok: true, status: 201, text: async () => init.body };
    if (init.method === 'PATCH') return { ok: true, status: 200, text: async () => JSON.stringify([{ id: 'x', ...JSON.parse(init.body) }]) };
    return { ok: false, status: 405, text: async () => 'no' };
  };
  LAST_CALLS = calls;
  return calls;
}

const ENGLISH = 'First line of the original.\n\nSecond paragraph with enough text in it.';
const trFor = (langs = ['no','sv','de','fr','nl']) =>
  Object.fromEntries(langs.map(l => [l, `Oversatt ${l}. https://www.247spain.es/${l}/day-counter`]));

const samplePost = (over = {}) => ({
  id: '1', language: 'en', tool_slug: 'day-counter',
  tool_url: 'https://www.247spain.es/day-counter',
  post_text: ENGLISH,
  translations: trFor(), translations_of: hashOf(ENGLISH),
  edited_text: null, note: 'Brits in Spain group', image_url: 'https://images.pexels.com/photos/1/a.jpeg',
  image_options: ['https://images.pexels.com/photos/1/a.jpeg', 'https://images.pexels.com/photos/2/b.jpeg'],
  status: 'pending', sent_at: null, ...over,
});

// Routing
ok('the router knows three actions', ACTIONS.length === 3 && ACTIONS.includes('seed'), ACTIONS.join(','));
ok('query form resolves', resolveAction(req('/api/fb?action=posts')) === 'posts');
ok('path form resolves', resolveAction(req('/api/fb/decide')) === 'decide');
ok('hyphen form resolves', resolveAction(req('/api/fb-seed')) === 'seed');
ok('an unknown action resolves to nothing', resolveAction(req('/api/fb?action=dispatch')) === null);
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
  await fbRouter({ ...req('/api/fb?action=seed'), method: 'POST', body: {} }, res);
  ok('seed succeeds on an empty table', res.code === 200 && res.body && res.body.ok, JSON.stringify(res.body).slice(0, 160));
  ok('seed writes one row per idea', res.body.written === 20, String(res.body && res.body.written));
  ok('seed reports 20 ideas in 6 languages', res.body.ideas === 20 && res.body.languages === 6);
  ok('seed only ever talked to fb_posts', calls.every(c => /\/rest\/v1\/fb_posts/.test(c.url)));
  const written = JSON.parse(calls.find(c => c.method === 'POST').body);
  ok('every written row carries its post text', written.every(r => r.post_text && r.post_text.length > 200));
  ok('every written row carries twelve image options', written.every(r => r.image_options.length === 12));
  ok('every written row starts as pending', written.every(r => r.status === 'pending'));
  ok('every row is English', written.every(r => r.language === 'en'));
  ok('every row carries the five translations',
     written.every(r => ['no','sv','de','fr','nl'].every(l => r.translations[l] && r.translations[l].length > 100)));
  ok('and stamps the English they were made from',
     written.every(r => r.translations_of === hashOf(r.post_text)));
  ok('every row url is the English one', written.every(r => r.tool_url === `https://www.247spain.es/${r.tool_slug}`));
  ok('the hook is the first line of the post', written.every(r => r.post_text.startsWith(r.hook)));
}

// Seed again, over decisions already made. This is the behaviour that matters most: a
// reseed must refresh the writing without throwing away what Pratik did with it.
{
  const chosen = 'https://images.pexels.com/photos/6076164/pexels-photo-6076164.jpeg?auto=compress&cs=tinysrgb&w=1200&h=630&fit=crop';
  const existing = [
    { id: 'a', idea_key: 'ninety-days', language: 'en', status: 'posted', note: 'Costa Blanca group, 3 Sept', posted_at: '2026-09-03T10:00:00Z', image_url: chosen },
    { id: 'b', idea_key: 'imputed-income-empty-home', language: 'en', status: 'rejected', note: 'too long', posted_at: null, image_url: 'https://images.pexels.com/photos/999999/pexels-photo-999999.jpeg' },
  ];
  const calls = fakeSupabase(existing);
  const res = makeRes();
  await fbRouter({ ...req('/api/fb?action=seed'), method: 'POST', body: {} }, res);
  const written = JSON.parse(calls.find(c => c.method === 'POST').body);
  const a = written.find(r => r.idea_key === 'ninety-days');
  const b = written.find(r => r.idea_key === 'imputed-income-empty-home');

  ok('a reseed keeps the row id', a.id === 'a' && b.id === 'b');
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
  await fbRouter({ ...req('/api/fb?action=seed'), method: 'POST', body: { dry: true } }, res);
  ok('a dry run writes nothing and says what it would do', res.body.dry === true && res.body.would_write === 20);
}

// Posts
{
  const rows = [
    { id: '1', idea_key: 'k', language: 'en', status: 'pending' },
    { id: '2', idea_key: 'k', language: 'en', status: 'posted' },
  ];
  const calls = fakeSupabase(rows);
  const res = makeRes();
  await fbRouter(req('/api/fb?action=posts&status=all'), res);
  ok('posts returns the rows and counts them', res.body.total === 2 && res.body.counts.posted === 1);
  ok('the dashboard gets a total as well', res.body.counts.all === 2);
  ok('status=all adds no status filter', !/status=eq/.test(calls[0].url));
  ok('no language filter is sent any more', !/language=eq/.test(calls[0].url));
}
{
  const calls = fakeSupabase([]);
  const res = makeRes();
  await fbRouter(req('/api/fb?action=posts&status=nonsense'), res);
  ok('a nonsense status is ignored rather than passed through', !/status=eq\.nonsense/.test(calls[0].url));
}

// Decide
{
  fakeSupabase([]);
  const res = makeRes();
  await fbRouter({ ...req('/api/fb?action=decide'), method: 'POST', body: { id: '1', action: 'posted' } }, res);
  ok('marking posted works', res.body.ok === true);
  ok('marking posted stamps the date', !!res.body.post.posted_at);
}
{
  // Approving now reads the row first, because approving is the send.
  // Approving reads the row, checks the translations are of this English, and only then sends.
  fakeSupabase([samplePost()]);
  const res = makeRes();
  await fbRouter({ ...req('/api/fb?action=decide'), method: 'POST', body: { id: '1', action: 'approved' } }, res);
  ok('approving clears any posted date', res.body.post.posted_at === null);
}
{
  fakeSupabase([]);
  const res = makeRes();
  await fbRouter({ ...req('/api/fb?action=decide'), method: 'POST', body: { id: 'missing', action: 'approved' } }, res);
  ok('approving a post that does not exist is a 404, not a send', res.code === 404, String(res.code));
}
{
  fakeSupabase([{ id: '1', image_options: ['https://a.example/1.jpg', 'https://a.example/2.jpg'] }]);
  const res = makeRes();
  await fbRouter({ ...req('/api/fb?action=decide'), method: 'POST', body: { id: '1', action: 'image', image: 'https://a.example/2.jpg' } }, res);
  ok('an offered image is accepted', res.body.ok === true && res.body.post.image_url === 'https://a.example/2.jpg');
}
{
  fakeSupabase([{ id: '1', image_options: ['https://a.example/1.jpg'] }]);
  const res = makeRes();
  await fbRouter({ ...req('/api/fb?action=decide'), method: 'POST', body: { id: '1', action: 'image', image: 'https://evil.example/x.jpg' } }, res);
  ok('an image that is not one of the options is refused', res.code === 400, String(res.code));
}
{
  fakeSupabase([]);
  const res = makeRes();
  await fbRouter({ ...req('/api/fb?action=decide'), method: 'POST', body: { id: '1', action: 'delete' } }, res);
  ok('an unknown decision is refused', res.code === 400, String(res.code));
}
{
  fakeSupabase([]);
  const res = makeRes();
  await fbRouter({ ...req('/api/fb?action=decide'), method: 'POST', body: { action: 'posted' } }, res);
  ok('a decision without an id is refused', res.code === 400, String(res.code));
}
{
  fakeSupabase([]);
  const res = makeRes();
  await fbRouter({ ...req('/api/fb?action=decide'), method: 'GET' }, res);
  ok('decide refuses a GET', res.code === 405, String(res.code));
}

// ---------------------------------------------------------------------------
// Editing, parking, and the send that approval performs.
// ---------------------------------------------------------------------------

// What is sent is the edit where there is one, untouched.
ok('the original is sent when there is no edit', finalText(samplePost()).startsWith('First line'));
ok('the edit wins over the original', finalText(samplePost({ edited_text: '  My edit  ' })) === 'My edit');
ok('a blank edit does not win', finalText(samplePost({ edited_text: '   ' })).startsWith('First line'));

{
  const p = samplePost({ edited_text: 'Edited line one.\n\nRest.' });
  const html = bodyFor(p);
  ok('the email carries the edited text, not the original', html.includes('Edited line one.') && !html.includes('First line of the original'));
  ok('the email carries the group instruction', html.includes('Brits in Spain group'));
  ok('the email carries all five translations',
     ['no','sv','de','fr','nl'].every(l => html.includes(`Oversatt ${l}.`)));
  ok('and labels each language', ['English','Norwegian','Swedish','German','French','Dutch'].every(n => html.includes(n)));
  ok('each version carries its own localised link',
     ['no','sv','de','fr','nl'].every(l => html.includes(`247spain.es/${l}/day-counter`)));
  ok('the email carries the image', html.includes(p.image_url));
  ok('the email carries the tool link', html.includes(p.tool_url));
  ok('the email appends no call to action', !/getbueno/i.test(html));
  ok('the email names no brand', !/\b(Bueno|Sabadell|BBVA|CaixaBank|Revolut|Wise)\b/i.test(html));
  ok('the subject is one post, not one language', /Facebook post to publish:/.test(subjectFor(p)) && !/\(German\)/.test(subjectFor(p)));
  ok('both publisher addresses, one copy', SEND_TO.length === 2 && SEND_CC.length === 1);
}
{
  const html = bodyFor(samplePost({ note: null }));
  ok('with no group named the email says to check first', /check with Pratik/i.test(html));
}

// Editing
{
  fakeSupabase([]);
  const res = makeRes();
  await fbRouter({ ...req('/api/fb?action=decide'), method: 'POST', body: { id: '1', action: 'edit', text: '  new words  ' } }, res);
  ok('an edit is saved trimmed', res.body.post.edited_text === 'new words');
  ok('an edit does not touch the original', res.body.post.post_text === undefined);
}
{
  fakeSupabase([]);
  const res = makeRes();
  await fbRouter({ ...req('/api/fb?action=decide'), method: 'POST', body: { id: '1', action: 'edit', text: '   ' } }, res);
  ok('an empty edit is refused', res.code === 400, String(res.code));
}
{
  fakeSupabase([]);
  const res = makeRes();
  await fbRouter({ ...req('/api/fb?action=decide'), method: 'POST', body: { id: '1', action: 'edit', text: 'x'.repeat(9000) } }, res);
  ok('an absurdly long edit is refused', res.code === 400, String(res.code));
}

// Parking, with a reason
{
  fakeSupabase([]);
  const res = makeRes();
  await fbRouter({ ...req('/api/fb?action=decide'), method: 'POST', body: { id: '1', action: 'rejected', comment: 'reads as an ad' } }, res);
  ok('parking keeps the reason', res.body.post.status === 'rejected' && res.body.post.reject_comment === 'reads as an ad');
}
{
  fakeSupabase([]);
  const res = makeRes();
  await fbRouter({ ...req('/api/fb?action=decide'), method: 'POST', body: { id: '1', action: 'pending' } }, res);
  ok('undo clears the reason and any send error', res.body.post.reject_comment === null && res.body.post.send_error === null);
}

// A custom image
{
  fakeSupabase([samplePost()]);
  const res = makeRes();
  const url = 'https://cdn.example.com/mine.png';
  await fbRouter({ ...req('/api/fb?action=decide'), method: 'POST', body: { id: '1', action: 'image_custom', image: url } }, res);
  ok('a pasted https image is accepted', res.body.post.image_url === url);
  ok('and is kept in the options so it survives a reseed', res.body.post.image_options[0] === url);
}
{
  fakeSupabase([samplePost()]);
  const res = makeRes();
  await fbRouter({ ...req('/api/fb?action=decide'), method: 'POST', body: { id: '1', action: 'image_custom', image: 'http://insecure.example/x.png' } }, res);
  ok('a plain http image is refused', res.code === 400, String(res.code));
}
{
  fakeSupabase([samplePost()]);
  const res = makeRes();
  await fbRouter({ ...req('/api/fb?action=decide'), method: 'POST', body: { id: '1', action: 'image_custom', image: 'javascript:alert(1)' } }, res);
  ok('a non https scheme is refused', res.code === 400, String(res.code));
}

// Approving sends
{
  const calls = fakeSupabase([samplePost()]);
  const res = makeRes();
  await fbRouter({ ...req('/api/fb?action=decide'), method: 'POST', body: { id: '1', action: 'approved' } }, res);
  ok('approving reports that it sent', res.body.sent === true);
  ok('approving records when and to whom', !!res.body.post.sent_at && res.body.post.sent_to === SEND_TO.join(', '));
  ok('approving sets the status', res.body.post.status === 'approved');
  const mail = calls.find(c => /resend/.test(c.url));
  ok('exactly one email was sent', calls.filter(c => /resend/.test(c.url)).length === 1);
  const sent = JSON.parse(mail.body);
  ok('it went to both of the publisher addresses',
     sent.to.join(',') === 'himanshu1997bisht@gmail.com,himanshubisht1407@gmail.com', sent.to.join(','));
  ok('with Pratik copied', sent.cc.join() === 'pratik.y.renuse@gmail.com', String(sent.cc));
  ok('and a reply goes back to Pratik', sent.reply_to === 'pratik.y.renuse@gmail.com');
}
{
  const calls = fakeSupabase([samplePost({ sent_at: '2026-09-10T09:00:00Z' })]);
  const res = makeRes();
  await fbRouter({ ...req('/api/fb?action=decide'), method: 'POST', body: { id: '1', action: 'approved' } }, res);
  ok('approving an already sent post sends nothing', res.body.sent === false && res.body.reason === 'already sent');
  ok('and really does not touch Resend', calls.filter(c => /resend/.test(c.url)).length === 0);
}
{
  const calls = fakeSupabase([samplePost({ sent_at: '2026-09-10T09:00:00Z' })]);
  const res = makeRes();
  await fbRouter({ ...req('/api/fb?action=decide'), method: 'POST', body: { id: '1', action: 'resend' } }, res);
  ok('resending is deliberate and does send', res.body.sent === true && calls.filter(c => /resend/.test(c.url)).length === 1);
}
{
  fakeSupabase([samplePost()], { ok: false, error: 'domain not verified' });
  const res = makeRes();
  await fbRouter({ ...req('/api/fb?action=decide'), method: 'POST', body: { id: '1', action: 'approved' } }, res);
  ok('a failed send is reported, not swallowed', res.body.sent === false && /domain not verified/.test(res.body.error));
  ok('a failed send leaves no sent_at to lie about', res.body.post.sent_at === undefined);
  ok('and the error is kept on the row', /domain not verified/.test(res.body.post.send_error));
}
{
  fakeSupabase([samplePost({ post_text: '', edited_text: null })]);
  const res = makeRes();
  await fbRouter({ ...req('/api/fb?action=decide'), method: 'POST', body: { id: '1', action: 'approved' } }, res);
  ok('a post with no text is never sent', res.code === 400, String(res.code));
}
{
  delete process.env.RESEND_API_KEY;
  fakeSupabase([samplePost()]);
  const res = makeRes();
  await fbRouter({ ...req('/api/fb?action=decide'), method: 'POST', body: { id: '1', action: 'approved' } }, res);
  ok('a missing Resend key is a clear message, not a crash', res.body.sent === false && /RESEND_API_KEY/.test(res.body.error));
  process.env.RESEND_API_KEY = 'resend-key';
process.env.ANTHROPIC_API_KEY = 'anthropic-key';
}

// A reseed must not throw away an edit or the record of a send.
{
  const existing = [{
    id: 'a', idea_key: 'ninety-days', language: 'en', status: 'approved',
    note: 'Costa Blanca group', posted_at: null, image_url: null,
    edited_text: 'My own version of the ninety days post.',
    reject_comment: null, sent_at: '2026-09-10T08:00:00Z',
    sent_to: 'himanshu1997bisht@gmail.com, himanshubisht1407@gmail.com', send_error: null,
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
  await fbRouter({ ...req('/api/fb?action=seed'), method: 'POST', body: {} }, res);
  const written = JSON.parse(calls.find(c => c.method === 'POST' && /fb_posts/.test(c.url)).body);
  const a = written.find(r => r.idea_key === 'ninety-days');
  const b = written.find(r => r.idea_key === 'imputed-income-empty-home');
  ok('a reseed keeps the edit', a.edited_text === 'My own version of the ninety days post.');
  ok('a reseed keeps the record of the send',
     a.sent_at === '2026-09-10T08:00:00Z' && a.sent_to === 'himanshu1997bisht@gmail.com, himanshubisht1407@gmail.com');
  ok('a reseed still refreshes the original writing', a.post_text.includes('90 days'));
  ok('a reseed keeps translations that have already gone out', a.translations_of === 'a-hash-from-before');
  ok('but rewrites translations on a post that has not', b.translations_of === hashOf(b.post_text));
  ok('and the rewritten set is the written one, not a machine rebuild',
     ['no','sv','de','fr','nl'].every(l => b.translations[l] && b.translations[l].length > 100));
  ok('a reseed sends nothing', calls.filter(c => /resend/.test(c.url)).length === 0);
}

// The sandbox sender. RESEND_FROM is set in Vercel, but if it ever were not, a send would
// come back ok and reach nobody. The deck must say so rather than claiming it was sent.
{
  const before = process.env.RESEND_FROM;
  delete process.env.RESEND_FROM;
  fakeSupabase([samplePost()]);
  const res = makeRes();
  await fbRouter({ ...req('/api/fb?action=decide'), method: 'POST', body: { id: '1', action: 'approved' } }, res);
  ok('a sandbox send is flagged rather than reported as delivered',
     res.body.sent === true && /RESEND_FROM is not set/.test(res.body.warning || ''));
  ok('the warning names both people who did not receive it',
     /himanshu1997bisht@gmail\.com/.test(res.body.warning || '')
     && /himanshubisht1407@gmail\.com/.test(res.body.warning || ''));
  if (before) process.env.RESEND_FROM = before;
}
{
  process.env.RESEND_FROM = '24/7 Spain <hello@247spain.es>';
  fakeSupabase([samplePost()]);
  const res = makeRes();
  await fbRouter({ ...req('/api/fb?action=decide'), method: 'POST', body: { id: '1', action: 'approved' } }, res);
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
ok('an empty language makes them stale',
   !isCurrent(samplePost({ translations: { ...trFor(), de: '   ' } }), ENGLISH));

ok('a translation with a dash is rejected',
   checkTranslation('hei \u2014 der https://www.247spain.es/no/day-counter', 'no', 'day-counter') !== null);
ok('a translation missing its link is rejected',
   checkTranslation('hei der', 'no', 'day-counter') !== null);
ok('a translation naming a bank is rejected',
   checkTranslation('hei Sabadell https://www.247spain.es/no/day-counter', 'no', 'day-counter') !== null);
ok('a good translation passes',
   checkTranslation('hei der https://www.247spain.es/no/day-counter', 'no', 'day-counter') === null);

// Approving an unedited post uses what is stored and calls nothing.
{
  const calls = fakeSupabase([samplePost()]);
  const res = makeRes();
  await fbRouter({ ...req('/api/fb?action=decide'), method: 'POST', body: { id: '1', action: 'approved' } }, res);
  ok('an unedited post is not retranslated', res.body.retranslated === false || res.body.retranslated === undefined);
  ok('and the model is never called', calls.filter(c => /anthropic/.test(c.url)).length === 0);
  ok('it still sends', res.body.sent === true);
}

// Approving an edited post rebuilds the translations from the edit, first.
{
  const calls = fakeSupabase([samplePost({ edited_text: 'My own version, which is quite different.' })]);
  const res = makeRes();
  await fbRouter({ ...req('/api/fb?action=decide'), method: 'POST', body: { id: '1', action: 'approved' } }, res);
  ok('an edited post is retranslated', res.body.retranslated === true);
  ok('the model is called exactly once', calls.filter(c => /anthropic/.test(c.url)).length === 1);
  ok('the model is asked to translate the edit, not the original',
     JSON.parse(calls.find(c => /anthropic/.test(c.url)).body).messages[0].content.includes('My own version'));
  ok('the new translations are saved', /Oversatt no/.test(JSON.stringify(res.body.post.translations)));
  ok('stamped with the hash of the edit', res.body.post.translations_of === hashOf('My own version, which is quite different.'));
  const mail = JSON.parse(calls.find(c => /resend/.test(c.url)).body);
  ok('and the email carries the new translations', /Oversatt nl/.test(mail.html));
}

// If the rebuild fails, nothing is sent. Stale translations under an approval would be worse.
{
  const calls = fakeSupabase([samplePost({ edited_text: 'An edit that cannot be translated.' })], { ok: true }, { fail: true });
  const res = makeRes();
  await fbRouter({ ...req('/api/fb?action=decide'), method: 'POST', body: { id: '1', action: 'approved' } }, res);
  ok('a failed rebuild sends nothing at all', res.body.sent === false);
  ok('and really does not touch Resend', calls.filter(c => /resend/.test(c.url)).length === 0);
  ok('and the post goes back to pending rather than sitting approved and unsent', res.body.post.status === 'pending');
  ok('and it says why', /could not be rebuilt/i.test(res.body.error));
}

// A translation that comes back breaking a house rule is refused, and nothing is sent.
{
  const bad = { out: { no: 'hei \u2014 der https://www.247spain.es/no/day-counter', sv: 'x', de: 'x', fr: 'x', nl: 'x' } };
  const calls = fakeSupabase([samplePost({ edited_text: 'Another edit entirely here.' })], { ok: true }, bad);
  const res = makeRes();
  await fbRouter({ ...req('/api/fb?action=decide'), method: 'POST', body: { id: '1', action: 'approved' } }, res);
  ok('a translation breaking the house rules is refused', res.body.sent === false);
  ok('nothing is emailed', calls.filter(c => /resend/.test(c.url)).length === 0);
  ok('and the reason names the rule', /dash|link/i.test(res.body.error));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
