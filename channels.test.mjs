// Tests for the WhatsApp channels (6 November 2026): every kept idealista story shows in the
// deck for review (api/_fb_channels.js), nothing goes out unless Pratik approved it, approving
// translates it through the digest, and the daily task email carries one approved post a day
// with its photo and all six languages, even when there is no Facebook post (api/_fb_dispatch.js).
// Every network call is mocked.
import fbRouter from './api/fb.js';
import newsRouter from './api/news.js';
import { CHANNEL_POSTS, channelPostFor, isChannelPhoto, CHANNEL_PHOTOS, photoUrl } from './api/_fb_whatsapp.js';
const P1 = photoUrl(CHANNEL_PHOTOS[5]), P2 = photoUrl(CHANNEL_PHOTOS[6]);

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

// --- 1. No approval needed (17 November 2026) -------------------------------------------
const { DAILY_TO, DAILY_CC } = await import('./api/_fb_email.js');
const handDay = Object.keys(CHANNEL_POSTS).sort().pop();
ok('the hand-written days are no longer sent', channelPostFor(handDay) === null);
setNow('2031-03-10T01:30:00Z');
{
  const tables = { fb_posts: [], persona_posts: [], news_items: [
    story({ id: 'old', received_on: '2031-02-01', score: 5, en: 'Too old.' }),
    story({ id: 'p0', received_on: '2031-03-08', score: 5, en: 'Older story.' }),
    story({ id: 'p1', received_on: '2031-03-09', score: 4, en: 'Newest story.' }),
  ], wa_channel_sends: [] };
  const calls = fakeDb(tables);
  const res = makeRes();
  await fbRouter(cron(), res);
  const m = mails(calls);
  const task = m.find(x => /Today's tasks/.test(x.subject));
  ok('the newest kept story goes out by itself', task && task.html.includes('Newest story.') && !task.html.includes('Older story.'), JSON.stringify(res.body));
  ok('it was approved and translated on the way', tables.news_items[2].status === 'used' && tables.news_items[2].used_on === '2031-03-10' && tables.news_items[2].translations && tables.news_items[2].translations.no === 'Norsk tekst.');
  ok('a story older than two weeks is never picked', tables.news_items[0].status === 'pending');
  ok('the day is recorded', tables.wa_channel_sends.length === 1 && tables.wa_channel_sends[0].news_id === 'p1');
  ok('To the publisher, Pratik in CC, nobody else', task && task.to.join() === DAILY_TO.join() && task.cc.join() === DAILY_CC.join() && !task.bcc && DAILY_TO.length === 1 && DAILY_CC.length === 1 && /pratik/.test(DAILY_CC[0]) && !/john/.test(JSON.stringify(task)));
  ok('no approval reminder goes to Pratik', !m.some(x => /approve/i.test(x.subject)));
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
  ok('each one has a folder photo', res.body.review.every(i => isChannelPhoto(i.image) && /^https:\/\/www\.247spain\.es\/photos\/[a-z0-9_]+\.jpg$/.test(i.image)), JSON.stringify(res.body.review.map(i => i.image)));
  ok('none is a Bueno or LinkedIn image', res.body.review.every(i => !/bueno|linkedin|\/posts\/|studio-assets/i.test(i.image)));
  ok('no two stories share a photo', new Set(res.body.review.map(i => i.image)).size === res.body.review.length);
  ok('the photo is saved, so it never changes', tables.news_items.filter(i => ['r1', 'r2'].includes(i.id)).every(i => isChannelPhoto(i.channel_image)));
  const again0 = makeRes();
  await fbRouter(req('/api/fb?action=channels'), again0);
  ok('and is the same on the next load', again0.body.review.map(i => i.image).join() === res.body.review.map(i => i.image).join());
  ok('nothing is in line yet', res.body.queued.length === 0);

  const opts = makeRes();
  await fbRouter(req('/api/fb?action=channels&photos=r2'), opts);
  ok('"Change photo" offers all 15 folder photos', opts.body.ok && opts.body.photos.length === 15 && opts.body.photos.every(isChannelPhoto), JSON.stringify(opts.body));
  ok('the unused ones first', !res.body.review.some(i => opts.body.photos.slice(0, 13).includes(i.image)));
  ok('the greyscale and duplicate files are never used', !CHANNEL_PHOTOS.some(n => ['g00', 'golden_coast', 'arch_terrace', 'coast_bay', 'sunset_village', 'terrace_sunset'].includes(n)));
  const pic = makeRes();
  await fbRouter(req('/api/fb?action=channels', { method: 'POST', body: { id: 'r2', action: 'image', image: P1 } }), pic);
  ok('a photo can be picked', tables.news_items[1].channel_image === P1 && pic.body.item.image === P1);
  const badPic = makeRes();
  await fbRouter(req('/api/fb?action=channels', { method: 'POST', body: { id: 'r2', action: 'image', image: 'https://images.pexels.com/photos/1/x.jpg' } }), badPic);
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

// --- 3. Stories already approved go first -----------------------------------------------
setNow('2031-03-11T01:30:00Z');
{
  const news = [
    story({ id: 'a1', received_on: '2031-03-09', status: 'approved', decided_at: '2031-03-10T10:00:00Z', translations: T, en: 'First approved.', channel_image: P1 }),
    story({ id: 'a2', received_on: '2031-03-10', status: 'approved', decided_at: '2031-03-10T11:00:00Z', translations: T, en: 'Second approved.', channel_image: P2 }),
  ];
  const tables = { fb_posts: [], persona_posts: [], news_items: news, wa_channel_sends: [] };
  const calls = fakeDb(tables);
  const res = makeRes();
  await fbRouter(cron(), res);
  const m = mails(calls);
  const task = m.find(x => /Today's tasks/.test(x.subject));
  const wa = task ? task.html.slice(task.html.indexOf('post in the WhatsApp channels')) : '';
  ok('the daily task email goes out', !!task && res.body.daily.sent === true, JSON.stringify(res.body));
  ok('To the publisher with Pratik in CC', task && task.to.join() === DAILY_TO.join() && task.cc.join() === DAILY_CC.join() && !task.bcc);
  ok('it carries the first approved post, not the second', task && task.html.includes('First approved.') && !task.html.includes('Second approved.'));
  ok('in all six languages', task && ['N', 'S', 'D', 'F', 'NL'].every(t => wa.includes(`>${t}</div>`)) && ['Spain 24/7 (English)', 'Spania 24/7', 'Spanien 24/7 Svenska', 'Spanien 24/7 (German)', 'Espagne 24/7', 'Spanje 24/7'].every(n => wa.includes(n)));
  ok('each language has the photo', task && wa.split(`${P1.replace(/&/g, '&amp;')}" alt=""`).length - 1 === 6);
  ok('it opens Hi, and names nobody', task && /Hi,/.test(task.html) && !/Hi (Agent|P),/.test(task.html) && !/Poornima/i.test(task.html + task.subject));
  ok('no euro sign in the subject', task && !/€/.test(task.subject));
  ok('the WhatsApp part never mentions Bueno', task && wa && !/bueno/i.test(wa));
  ok('the post is marked sent', news[0].status === 'used' && news[0].used_on === '2031-03-11' && news[1].status === 'approved');
  ok('the day is recorded with its photo', tables.wa_channel_sends.length === 1 && tables.wa_channel_sends[0].news_id === 'a1' && tables.wa_channel_sends[0].texts.image.includes(P1));

  const before = mails(calls).length;
  setNow('2031-03-11T12:00:00Z');
  await fbRouter(cron(), makeRes());
  ok('the second run that day sends nothing more', mails(calls).length === before);

  setNow('2031-03-12T01:30:00Z');
  await fbRouter(cron(), makeRes());
  ok('the next day takes the next approved post', mails(calls).some(x => /Today's tasks/.test(x.subject) && x.html.includes('Second approved.')));
}

// --- 4. No story at all: an evergreen post still goes -------------------------------------
setNow('2031-03-13T01:30:00Z');
{
  const tables = { fb_posts: [], persona_posts: [], news_items: [], wa_channel_sends: [] };
  const calls = fakeDb(tables);
  const res = makeRes();
  await fbRouter(cron(), res);
  const task = mails(calls).find(x => /Today's tasks/.test(x.subject));
  const w = tables.wa_channel_sends[0];
  ok('a ready-written post goes into the channels', task && /WhatsApp channels/.test(task.subject) && w && w.source === 'evergreen', JSON.stringify(res.body));
  ok('in all six languages with a folder photo', w && ['en', 'no', 'sv', 'de', 'fr', 'nl'].every(l => w.texts[l]) && isChannelPhoto(w.texts.image));
  ok('the evergreen text names no company and has no link', w && ['en', 'no', 'sv', 'de', 'fr', 'nl'].every(l => !/bueno|24\/7|https?:/i.test(w.texts[l])));
  setNow('2031-03-14T01:30:00Z');
  await fbRouter(cron(), makeRes());
  ok('the next day is a different post', tables.wa_channel_sends.length === 2 && tables.wa_channel_sends[1].title !== w.title);
}

// --- 5. The Facebook group posts are paused -----------------------------------------------
setNow('2031-03-10T12:00:00Z');
{
  const { QUEUE_ORDER } = await import('./api/_fb_content.js');
  const { hashOf } = await import('./api/_fb_translate.js');
  const fbT = { no: 'Norsk.', sv: 'Svensk.', da: 'Dansk.', de: 'Deutsch.', fr: 'Français.', nl: 'Nederlands.' };
  const fb = [{ id: 'p1', idea_key: QUEUE_ORDER[0], status: 'approved', post_text: 'Facebook text here.', translations: fbT, translations_of: hashOf('Facebook text here.') }];
  const tables = { fb_posts: fb, persona_posts: [], news_items: [], wa_channel_sends: [{ day: '2031-03-10', source: 'news', texts: { en: 'x' } }] };
  const calls = fakeDb(tables);
  const res = makeRes();
  await fbRouter(cron(), res);
  ok('no Facebook group post goes out while paused', !mails(calls).some(x => /task\. Publish/.test(x.subject)) && res.body.facebook.paused === true);
  const task = mails(calls).find(x => /Today's tasks/.test(x.subject));
  ok('the profile post still goes, without a second channel post', task && /profile posts/.test(task.subject) && !/WhatsApp/.test(task.subject));
}

globalThis.Date = RealDate;
console.log(`channels.test: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
