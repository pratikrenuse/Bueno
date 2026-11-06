// Tests for the WhatsApp channels (6 November 2026): every kept idealista story shows in the
// deck for review (api/_fb_channels.js), nothing goes out unless Pratik approved it, approving
// translates it through the digest, and the daily task email carries one approved post a day
// with its photo and all six languages, even when there is no Facebook post (api/_fb_dispatch.js).
// Every network call is mocked.
import fbRouter from './api/fb.js';
import newsRouter from './api/news.js';
import { CHANNEL_POSTS, channelPostFor } from './api/_fb_whatsapp.js';

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => cond ? pass++ : (fail++, console.log('FAIL', name, extra));

process.env.SUPABASE_URL = 'https://sb.test';
process.env.SUPABASE_SERVICE_KEY = 'svc';
process.env.RESEND_API_KEY = 're_test';
process.env.RESEND_FROM = '24/7 Spain <pratik@spanishpropertyinsights.com>';
process.env.ANTHROPIC_API_KEY = 'sk-test';
process.env.INTERNAL_PASSCODE = 'pw';
delete process.env.CRON_SECRET;

const RealDate = Date;
const setNow = (iso) => {
  const NOW = RealDate.parse(iso);
  globalThis.Date = class extends RealDate {
    constructor(...a) { super(...(a.length ? a : [NOW])); }
    static now() { return NOW; }
  };
};

const makeRes = () => {
  const r = { statusCode: 200, body: null, headersSent: false };
  r.status = (c) => { r.statusCode = c; return r; };
  r.json = (b) => { r.body = b; r.headersSent = true; return r; };
  return r;
};
const req = (url, { method = 'GET', body, headers = { 'x-passcode': 'pw' } } = {}) => {
  const q = Object.fromEntries(new URL(url, 'https://x').searchParams);
  return { url, method, query: q, headers, body };
};

// A tiny PostgREST: eq, neq, gte, is.null, not.is.null, order, limit, on_conflict.
function match(row, key, cond) {
  const v = row[key];
  if (cond === 'is.null') return v == null;
  if (cond === 'not.is.null') return v != null;
  const [op, ...rest] = cond.split('.');
  const want = decodeURIComponent(rest.join('.'));
  if (op === 'eq') return String(v) === want || (want === 'true' && v === true);
  if (op === 'neq') return String(v) !== want;
  if (op === 'gte') return String(v) >= want;
  return true;
}
function fakeDb(tables) {
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), method: init.method || 'GET', body: init.body });
    const u = new URL(String(url));
    if (u.host === 'api.resend.com') return new Response(JSON.stringify({ id: 'm1' }), { status: 200 });
    if (u.host === 'api.anthropic.com') {
      const t = { no: 'Norsk tekst.', sv: 'Svensk text.', de: 'Deutscher Text.', fr: 'Texte français.', nl: 'Nederlandse tekst.' };
      return new Response(JSON.stringify({ content: [{ text: JSON.stringify(t) }] }), { status: 200 });
    }
    if (u.host === 'www.247spain.es') {
      const res = makeRes();
      await newsRouter({ url: u.pathname + u.search, method: init.method || 'GET', query: Object.fromEntries(u.searchParams), headers: init.headers || {}, body: init.body ? JSON.parse(init.body) : {} }, res);
      return new Response(JSON.stringify(res.body), { status: res.statusCode });
    }
    const table = u.pathname.split('/').pop();
    const rows = tables[table] || (tables[table] = []);
    const filters = [...u.searchParams.entries()].filter(([k]) => !['select', 'order', 'limit', 'on_conflict'].includes(k));
    const hit = rows.filter(r => filters.every(([k, c]) => match(r, k, c)));
    const method = init.method || 'GET';
    if (method === 'GET') {
      let out = hit.slice();
      const order = u.searchParams.get('order');
      if (order) {
        const keys = order.split(',').map(o => o.split('.'));
        out.sort((a, b) => { for (const [k, d] of keys) { if (a[k] === b[k]) continue; return (a[k] < b[k] ? -1 : 1) * (d === 'desc' ? -1 : 1); } return 0; });
      }
      const limit = u.searchParams.get('limit');
      if (limit) out = out.slice(0, Number(limit));
      return new Response(JSON.stringify(out), { status: 200 });
    }
    if (method === 'PATCH') {
      const patch = JSON.parse(init.body);
      hit.forEach(r => Object.assign(r, patch));
      return new Response(JSON.stringify(hit), { status: 200 });
    }
    if (method === 'POST') {
      const conflict = u.searchParams.get('on_conflict');
      for (const r of JSON.parse(init.body)) {
        if (conflict && rows.some(x => x[conflict] === r[conflict])) continue;
        rows.push(r);
      }
      return new Response('', { status: 201 });
    }
    return new Response('[]', { status: 200 });
  };
  return calls;
}
const mails = (calls) => calls.filter(c => c.url.includes('api.resend.com')).map(c => JSON.parse(c.body));
const cron = (body = {}) => req('/api/fb?action=dispatch', { method: 'POST', body, headers: { 'user-agent': 'vercel-cron/1.0' } });
const story = (over) => ({ keep: true, status: 'pending', score: 4, position: 0, en: 'English story.', edited_en: null,
  translations: null, translations_of: null, is_proposal: false, title_en: 'A story', used_on: null, ...over });
const T = { no: 'N', sv: 'S', de: 'D', fr: 'F', nl: 'NL' };

// --- 1. Nothing goes out unapproved ---------------------------------------------------
const handDay = Object.keys(CHANNEL_POSTS).sort().pop();
ok('the hand-written days are no longer sent', channelPostFor(handDay) === null);
setNow('2031-03-10T01:30:00Z');
{
  const tables = { fb_posts: [], news_items: [story({ id: 'p1', received_on: '2031-03-09', score: 5 })], wa_channel_sends: [] };
  const calls = fakeDb(tables);
  const res = makeRes();
  await fbRouter(cron(), res);
  const m = mails(calls);
  ok('a story nobody approved never reaches the publisher', !m.some(x => (x.bcc || []).length), JSON.stringify(m.map(x => x.subject)));
  ok('the story is untouched', tables.news_items[0].status === 'pending' && !tables.news_items[0].used_on);
  ok('Pratik is reminded to approve, and told one story is waiting', m.some(x => /nothing approved for tomorrow/.test(x.subject) && /1 idealista story/.test(x.html) && x.to.join() === 'pratik.y.renuse@gmail.com'));
  ok('nothing is recorded as sent', tables.wa_channel_sends.length === 0);
}

// --- 2. The deck: review, approve, photo, undo, skip ------------------------------------
setNow('2031-03-10T15:00:00Z');
{
  const tables = {
    news_items: [
      story({ id: 'r1', received_on: '2031-03-10', score: 5, en: 'Newest story.' }),
      story({ id: 'r2', received_on: '2031-03-09', score: 4, en: 'Second story.' }),
      story({ id: 'old', received_on: '2031-02-01', score: 5, en: 'Too old.' }),
      story({ id: 'dropped', received_on: '2031-03-10', keep: false, status: 'skipped' }),
    ],
    wa_channel_sends: [],
  };
  const calls = fakeDb(tables);
  const res = makeRes();
  await fbRouter(req('/api/fb?action=channels'), res);
  ok('the view answers', res.body && res.body.ok, JSON.stringify(res.body));
  ok('every kept story of the last week waits for review, newest first', res.body.review.map(i => i.id).join() === 'r1,r2');
  ok('each one has a photo', res.body.review.every(i => /^https:\/\/www\.247spain\.es\/photos\/[a-z0-9_]+\.jpg$/.test(i.image)));
  ok('nothing is in line yet', res.body.queued.length === 0);

  const pic = makeRes();
  await fbRouter(req('/api/fb?action=channels', { method: 'POST', body: { id: 'r2', action: 'image', image: 'marina' } }), pic);
  ok('a photo can be picked', tables.news_items[1].channel_image === 'marina' && pic.body.item.image.endsWith('/photos/marina.jpg'));
  const badPic = makeRes();
  await fbRouter(req('/api/fb?action=channels', { method: 'POST', body: { id: 'r2', action: 'image', image: '../x' } }), badPic);
  ok('only a known photo is accepted', badPic.statusCode === 400);

  const ap = makeRes();
  await fbRouter(req('/api/fb?action=channels', { method: 'POST', body: { id: 'r2', action: 'approve' } }), ap);
  ok('approving works', ap.body.ok && tables.news_items[1].status === 'approved', JSON.stringify(ap.body));
  ok('approving translates it into the five other languages', ['no', 'sv', 'de', 'fr', 'nl'].every(l => tables.news_items[1].translations[l]) && calls.some(c => c.url.includes('api.anthropic.com')));
  ok('approving sends nothing', mails(calls).length === 0);
  setNow('2031-03-10T15:05:00Z');
  const ap1 = makeRes();
  await fbRouter(req('/api/fb?action=channels', { method: 'POST', body: { id: 'r1', action: 'approve' } }), ap1);
  ok('approving fixes the photo shown in the deck', !!tables.news_items[0].channel_image);

  const res2 = makeRes();
  await fbRouter(req('/api/fb?action=channels'), res2);
  ok('approved stories are in line in the order they were approved', res2.body.queued.map(i => i.id).join() === 'r2,r1', res2.body.queued.map(i => i.id).join());
  ok('and show all six languages', res2.body.queued[0].texts && ['en', 'no', 'sv', 'de', 'fr', 'nl'].every(l => res2.body.queued[0].texts[l]));

  const undo = makeRes();
  await fbRouter(req('/api/fb?action=channels', { method: 'POST', body: { id: 'r1', action: 'undo' } }), undo);
  ok('an approval can be undone', tables.news_items[0].status === 'pending');
  const skip = makeRes();
  await fbRouter(req('/api/fb?action=channels', { method: 'POST', body: { id: 'r1', action: 'skip' } }), skip);
  ok('a story can be set aside and stays kept for LinkedIn', tables.news_items[0].status === 'skipped' && tables.news_items[0].keep === true);
  const noPass = makeRes();
  await fbRouter({ ...req('/api/fb?action=channels'), headers: {} }, noPass);
  ok('the view needs the passcode', noPass.statusCode === 401);
}

// --- 3. The daily email with an approved post and no Facebook post -----------------------
setNow('2031-03-11T01:30:00Z');
{
  const news = [
    story({ id: 'a1', received_on: '2031-03-09', status: 'approved', decided_at: '2031-03-10T10:00:00Z', translations: T, en: 'First approved.', channel_image: 'marina' }),
    story({ id: 'a2', received_on: '2031-03-10', status: 'approved', decided_at: '2031-03-10T11:00:00Z', translations: T, en: 'Second approved.', channel_image: 'g03' }),
  ];
  const tables = { fb_posts: [], news_items: news, wa_channel_sends: [] };
  const calls = fakeDb(tables);
  const res = makeRes();
  await fbRouter(cron(), res);
  const m = mails(calls);
  const task = m.find(x => /WhatsApp channels/.test(x.subject));
  ok('the WhatsApp task email goes out', !!task && res.body.channel_sent === true, JSON.stringify(res.body));
  ok('To Pratik, the publisher and John in BCC', task && task.to.join() === 'pratik.y.renuse@gmail.com' && task.bcc.join() === 'poornimanirwal@gmail.com,john@getbueno.com');
  ok('it carries the first approved post, not the second', task && task.html.includes('First approved.') && !task.html.includes('Second approved.'));
  ok('in all six languages', task && ['N', 'S', 'D', 'F', 'NL'].every(t => task.html.includes(`>${t}</div>`)) && ['Spain 24/7 (English)', 'Spania 24/7', 'Spanien 24/7 Svenska', 'Spanien 24/7 (German)', 'Espagne 24/7', 'Spanje 24/7'].every(n => task.html.includes(n)));
  ok('each language has the photo', task && (task.html.match(/photos\/marina\.jpg" alt=""/g) || []).length === 6);
  ok('it opens Hi Agent and names nobody', task && /Hi Agent,/.test(task.html) && !/Poornima/i.test(task.html + task.subject));
  ok('no euro sign in the subject', task && !/€/.test(task.subject));
  ok('the post is marked sent', news[0].status === 'used' && news[0].used_on === '2031-03-11' && news[1].status === 'approved');
  ok('the day is recorded with its photo', tables.wa_channel_sends.length === 1 && tables.wa_channel_sends[0].news_id === 'a1' && /marina/.test(tables.wa_channel_sends[0].texts.image));
  ok('one left means a reminder to Pratik', m.some(x => /only 1 approved post left/.test(x.subject) && !x.bcc));

  const before = mails(calls).length;
  setNow('2031-03-11T12:00:00Z');
  await fbRouter(cron(), makeRes());
  ok('the second run that day sends nothing more', mails(calls).length === before);

  setNow('2031-03-12T01:30:00Z');
  await fbRouter(cron(), makeRes());
  ok('the next day takes the next approved post', mails(calls).some(x => /WhatsApp channels/.test(x.subject) && x.html.includes('Second approved.')));
}

// --- 4. The channels already had their post, then a Facebook post goes ------------------
setNow('2031-03-10T12:00:00Z');
{
  const { QUEUE_ORDER } = await import('./api/_fb_content.js');
  const { hashOf } = await import('./api/_fb_translate.js');
  const fbT = { no: 'Norsk.', sv: 'Svensk.', da: 'Dansk.', de: 'Deutsch.', fr: 'Français.', nl: 'Nederlands.' };
  const fb = [{ id: 'p1', idea_key: QUEUE_ORDER[0], status: 'approved', post_text: 'Facebook text here.', translations: fbT, translations_of: hashOf('Facebook text here.') }];
  const tables = { fb_posts: fb, news_items: [story({ id: 'n2', received_on: '2031-03-09', status: 'approved', decided_at: '2031-03-09T10:00:00Z', translations: T, en: 'A second story.' })],
    wa_channel_sends: [{ day: '2031-03-10', source: 'news', texts: { en: 'x' } }] };
  const calls = fakeDb(tables);
  const res = makeRes();
  await fbRouter(cron({ force: true }), res);
  const sent = mails(calls).find(x => /task\. Publish/.test(x.subject));
  ok('the approved Facebook post still goes', res.body.sent === true && !!sent, JSON.stringify(res.body));
  ok('but without a second channel post', sent && !sent.html.includes('post in the WhatsApp channels') && tables.news_items[0].status === 'approved');
}

globalThis.Date = RealDate;
console.log(`channels.test: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
