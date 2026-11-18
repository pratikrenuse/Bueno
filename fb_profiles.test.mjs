// Tests for the Maria Lopez persona profile posts (17 November 2026): the content, the
// persona lock, the rendered reels, the daily task email and the deck's profile view.
// Every network call is mocked.
import { readFileSync, existsSync, statSync } from 'node:fs';
import {
  PROFILE_POSTS, PROFILE_ORDER, LANGS7, PERSONA_BY_LANG, PERSONAS, AVATAR, PROFILES, HASHTAGS,
  captionFor, xTextFor, nextProfilePost, profilesLeft, PROFILE_LOW,
} from './api/_fb_profiles.js';
import { FACTS } from './api/_reels_facts.js';
import { DAILY_TO, DAILY_CC, PRATIK_ONLY, dailyTasksBody } from './api/_fb_email.js';

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => cond ? pass++ : (fail++, console.log('FAIL', name, extra));

// --- 1. The writing ----------------------------------------------------------------------
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;
const FACT_IDS = new Set(FACTS.map(f => f.id));
ok('seven posts in the 7-day trial batch', PROFILE_POSTS.length === 7);
ok('every key is unique', new Set(PROFILE_ORDER).size === PROFILE_POSTS.length);
for (const p of PROFILE_POSTS) {
  ok(`${p.key}: every fact is from the checked base`, p.facts.every(f => FACT_IDS.has(f) || /^(channel|idealista) \d{4}-\d{2}-\d{2}$/.test(f)), p.facts.join());
  ok(`${p.key}: owners or agents only`, /owners|buyers|agents/.test(p.audience));
  for (const l of LANGS7) {
    const at = `${p.key}/${l}`;
    const lines = p.overlay[l] || [];
    const all = [...lines, p.caption[l] || ''].join(' ');
    ok(`${at}: three lines on screen`, lines.length === 3);
    ok(`${at}: every line is a complete sentence`, lines.every(s => /[.?]$/.test(s.trim()) && s.trim().split(/\s+/).length >= 3), lines.join(' | '));
    ok(`${at}: a caption`, (p.caption[l] || '').split(/\s+/).length >= 40);
    ok(`${at}: no dash, no emoji`, !/[—–]/.test(all) && !EMOJI.test(all));
    ok(`${at}: no brand, no site, no link`, !/\bBueno\b|24\/7|247spain|https?:|www\./i.test(all));
    ok(`${at}: personal, not a business`, !/\b(we offer|our service|sign up|subscribe|book a call)\b/i.test(all));
    ok(`${at}: the X text fits`, xTextFor(p, l).length <= 280, String(xTextFor(p, l).length));
    ok(`${at}: the caption fits Instagram`, captionFor(p, l).length <= 2200 && captionFor(p, l).endsWith(HASHTAGS[l]));
  }
  // The same figures in every language.
  const figs = (t) => (t.match(/\d+/g) || []).sort().join(',');
  ok(`${p.key}: the same numbers in every language`, LANGS7.every(l => figs(p.caption[l]) === figs(p.caption.en)),
    LANGS7.map(l => `${l}:${figs(p.caption[l])}`).join(' '));
}

// --- 2. The persona lock -----------------------------------------------------------------
ok('English and Norwegian are Maria NE', PERSONA_BY_LANG.en === 'NE' && PERSONA_BY_LANG.no === 'NE');
ok('Swedish and Dutch are Maria SD', PERSONA_BY_LANG.sv === 'SD' && PERSONA_BY_LANG.nl === 'SD');
ok('French and German are Maria FG', PERSONA_BY_LANG.fr === 'FG' && PERSONA_BY_LANG.de === 'FG');
ok('Danish is Maria SD', PERSONA_BY_LANG.da === 'SD');
ok('seven different profile pictures', new Set(Object.values(AVATAR)).size === 7);
ok('the guide in the repo agrees', /Swedish \+ Dutch/.test(readFileSync('./INSTAGRAM_PERSONAS.md', 'utf8')) && /Danish/.test(readFileSync('./INSTAGRAM_PERSONAS.md', 'utf8')));

const plan = JSON.parse(readFileSync('./studio/personas/plan.json', 'utf8')).items;
ok('the plan has a reel for every post and language', plan.length === PROFILE_POSTS.length * 7);
for (const it of plan) {
  const at = `${it.key}/${it.lang}`;
  ok(`${at}: the persona is this language's`, it.persona === PERSONA_BY_LANG[it.lang]);
  ok(`${at}: the photo is from that persona's folder only`, it.photo.startsWith(`Claude outputs/${PERSONAS[it.persona]}/`));
  ok(`${at}: three different scene photos, all from that persona's folder`, it.photos.length === 3 && new Set(it.photos).size === 3 && it.photos[0] === it.photo && it.photos.every(f => f.startsWith(`Claude outputs/${PERSONAS[it.persona]}/`)));
  ok(`${at}: the profile picture is this language's`, AVATAR[it.lang].endsWith(`/${it.avatar.split('/').pop()}`));
  ok(`${at}: the words are this language's`, JSON.stringify(it.lines) === JSON.stringify(PROFILE_POSTS.find(p => p.key === it.key).overlay[it.lang]));
}
for (const l of LANGS7) {
  const photos = plan.filter(i => i.lang === l).map(i => i.photo);
  ok(`${l}: no photo repeats in this account's batch`, new Set(photos).size === photos.length);
}
for (const key of PROFILE_ORDER) {
  for (const persona of ['NE', 'SD', 'FG']) {
    const same = plan.filter(i => i.key === key && i.persona === persona).map(i => i.photo);
    ok(`${key}/${persona}: languages sharing her show different photos that day`, new Set(same).size === same.length);
  }
}
const pools = JSON.parse(readFileSync('./studio/personas/photos.json', 'utf8'));
ok('no pool mixes two personas', ['NE', 'SD', 'FG'].every(p => pools[p].every(f => f.startsWith(`Claude outputs/${PERSONAS[p]}/`))));

// --- 3. The reels exist ------------------------------------------------------------------
for (const it of plan) {
  const mp4 = `./public/persona-reels/${it.key}/${it.lang}.mp4`;
  const jpg = `./public/persona-reels/${it.key}/${it.lang}.jpg`;
  ok(`${it.key}/${it.lang}: the reel is rendered`, existsSync(mp4) && statSync(mp4).size > 100000 && existsSync(jpg), mp4);
}

// --- 4. The 28 accounts ------------------------------------------------------------------
for (const platform of ['instagram', 'facebook', 'linkedin', 'x']) {
  const ns = LANGS7.map(l => PROFILES[l][platform] && PROFILES[l][platform].n);
  ok(`${platform}: seven accounts, numbered 1 to 7 once each`, ns.slice().sort().join() === '1,2,3,4,5,6,7', ns.join());
  ok(`${platform}: every account has a login`, LANGS7.every(l => PROFILES[l][platform].login));
}

// --- 5. Picking the day's post -----------------------------------------------------------
ok('the first post goes first', nextProfilePost([]).key === PROFILE_ORDER[0]);
ok('a sent post is skipped', nextProfilePost([{ post_key: PROFILE_ORDER[0], sent_on: '2031-01-01' }]).key === PROFILE_ORDER[1]);
ok('a parked post is skipped', nextProfilePost([{ post_key: PROFILE_ORDER[0], parked: true }]).key === PROFILE_ORDER[1]);
ok('none left means none', nextProfilePost(PROFILE_ORDER.map(k => ({ post_key: k, sent_on: '2031-01-01' }))) === null);
ok('the count left', profilesLeft([{ post_key: PROFILE_ORDER[0], sent_on: 'x' }]) === PROFILE_ORDER.length - 1);

{
  const html = dailyTasksBody('2031-03-10', { profile: PROFILE_POSTS[0] });
  ok('the email carries every language with its video', LANGS7.every(l => html.includes(`/persona-reels/${PROFILE_POSTS[0].key}/${l}.mp4`)));
  ok('each language lists its four accounts', LANGS7.every(l => html.includes(`@${PROFILES[l].instagram.handle}`) && html.includes(`@${PROFILES[l].x.handle}`)));
  ok('the email opens with Hi, and names nobody', /Hi,/.test(html) && !/Poornima|Hi Agent/i.test(html));
}

// --- 6. The daily send and the deck, against a fake database --------------------------------
process.env.SUPABASE_URL = 'https://sb.test';
process.env.SUPABASE_SERVICE_KEY = 'svc';
process.env.RESEND_API_KEY = 're_test';
process.env.RESEND_FROM = '24/7 Spain <hello@247spain.es>';
process.env.INTERNAL_PASSCODE = 'pw';
delete process.env.CRON_SECRET;
delete process.env.FB_GROUPS_ON;
const { default: fbRouter } = await import('./api/fb.js');

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
const req = (url, { method = 'GET', body, headers = { 'x-passcode': 'pw' } } = {}) =>
  ({ url, method, query: Object.fromEntries(new URL(url, 'https://x').searchParams), headers, body });
const cron = (body = {}) => req('/api/fb?action=dispatch', { method: 'POST', body, headers: { 'user-agent': 'vercel-cron/1.0' } });

function fakeDb(tables) {
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), method: init.method || 'GET', body: init.body });
    const u = new URL(String(url));
    if (u.host === 'api.resend.com') return new Response(JSON.stringify({ id: 'm1' }), { status: 200 });
    const table = u.pathname.split('/').pop();
    const rows = tables[table] || (tables[table] = []);
    const filters = [...u.searchParams.entries()].filter(([k]) => !['select', 'order', 'limit', 'on_conflict'].includes(k));
    const match = (r, k, c) => c.startsWith('eq.') ? String(r[k]) === c.slice(3) : c === 'is.null' ? r[k] == null
      : c === 'not.is.null' ? r[k] != null : c.startsWith('gte.') ? String(r[k]) >= c.slice(4) : true;
    const hit = rows.filter(r => filters.every(([k, c]) => match(r, k, c)));
    const method = init.method || 'GET';
    if (method === 'GET') return new Response(JSON.stringify(hit), { status: 200 });
    if (method === 'PATCH') { const p = JSON.parse(init.body); hit.forEach(r => Object.assign(r, p)); return new Response(JSON.stringify(hit), { status: 200 }); }
    if (method === 'POST') {
      const conflict = u.searchParams.get('on_conflict');
      const out = [];
      for (const r of JSON.parse(init.body)) {
        const ex = conflict && rows.find(x => x[conflict] === r[conflict]);
        if (ex) { if (/merge-duplicates/.test((init.headers || {}).Prefer || '')) Object.assign(ex, r); out.push(ex); }
        else { rows.push(r); out.push(r); }
      }
      return new Response(JSON.stringify(out), { status: 201 });
    }
    return new Response('[]', { status: 200 });
  };
  return calls;
}
const mails = (calls) => calls.filter(c => c.url.includes('api.resend.com')).map(c => JSON.parse(c.body));

setNow('2031-03-10T01:30:00Z');
{
  const tables = { persona_posts: [], news_items: [], wa_channel_sends: [], fb_posts: [] };
  const calls = fakeDb(tables);
  const res = makeRes();
  await fbRouter(cron(), res);
  const task = mails(calls).find(m => /Today's tasks/.test(m.subject));
  ok('the daily email goes out with no approval', res.body.daily.sent === true && !!task, JSON.stringify(res.body));
  ok('it carries the first profile post', task && task.html.includes(`/persona-reels/${PROFILE_ORDER[0]}/en.mp4`));
  ok('To the publisher, Pratik in CC, nobody else', task && task.to.join() === DAILY_TO.join() && task.cc.join() === DAILY_CC.join() && !task.bcc);
  ok('the post is recorded as sent today', tables.persona_posts.some(r => r.post_key === PROFILE_ORDER[0] && r.sent_on === '2031-03-10'));

  const before = mails(calls).length;
  setNow('2031-03-10T12:00:00Z');
  await fbRouter(cron(), makeRes());
  ok('the catch-up run sends nothing more', mails(calls).length === before);

  setNow('2031-03-11T01:30:00Z');
  tables.persona_posts.push({ post_key: PROFILE_ORDER[1], parked: true });
  await fbRouter(cron(), makeRes());
  const next = mails(calls).slice(before).find(m => /Today's tasks/.test(m.subject));
  ok('the next day skips a parked post', next && next.html.includes(`/persona-reels/${PROFILE_ORDER[2]}/en.mp4`));
}
{
  // Only a few left: Pratik alone is told to ask for the next batch.
  setNow('2031-03-12T01:30:00Z');
  const tables = { persona_posts: PROFILE_ORDER.slice(0, PROFILE_ORDER.length - PROFILE_LOW).map(k => ({ post_key: k, sent_on: '2031-01-01' })), news_items: [], wa_channel_sends: [], fb_posts: [] };
  const calls = fakeDb(tables);
  await fbRouter(cron(), makeRes());
  const low = mails(calls).find(m => /Profile posts:/.test(m.subject));
  ok('a low batch tells Pratik, and only Pratik', low && low.to.join() === PRATIK_ONLY.join() && !low.cc && !low.bcc && /next batch/.test(low.html));
}
{
  // Nothing left: the WhatsApp channels still go.
  setNow('2031-03-13T01:30:00Z');
  const tables = { persona_posts: PROFILE_ORDER.map(k => ({ post_key: k, sent_on: '2031-01-01' })), news_items: [], wa_channel_sends: [], fb_posts: [] };
  const calls = fakeDb(tables);
  const res = makeRes();
  await fbRouter(cron(), res);
  const task = mails(calls).find(m => /Today's tasks/.test(m.subject));
  ok('with no profile post left, the channels still go', task && /WhatsApp channels/.test(task.subject) && !/profile/.test(task.subject));
}
{
  // The deck view.
  setNow('2031-03-10T03:00:00Z');
  const tables = { persona_posts: [{ post_key: PROFILE_ORDER[0], sent_on: '2031-03-10' }], wa_channel_sends: [] };
  fakeDb(tables);
  const res = makeRes();
  await fbRouter(req('/api/fb?action=profiles'), res);
  const b = res.body;
  ok('the view lists every post in order', b.ok && b.posts.map(p => p.key).join() === PROFILE_ORDER.join());
  ok('the sent one shows as sent', b.posts[0].status === 'sent' && b.posts[0].date === '2031-03-10');
  ok('the next one is dated tomorrow', b.posts[1].date === '2031-03-11' && b.posts[2].date === '2031-03-12');
  ok('the 28 accounts are listed', b.accounts.length === 7 && b.accounts.every(a => a.instagram && a.facebook && a.linkedin && a.x));
  const r2 = makeRes();
  await fbRouter(req('/api/fb?action=profiles', { method: 'POST', body: { key: PROFILE_ORDER[1], action: 'park' } }), r2);
  ok('parking works', r2.body.ok && tables.persona_posts.some(r => r.post_key === PROFILE_ORDER[1] && r.parked === true));
  const r3 = makeRes();
  await fbRouter(req('/api/fb?action=profiles', { method: 'POST', body: { key: PROFILE_ORDER[0], action: 'park' } }), r3);
  ok('a sent post cannot be parked', r3.statusCode === 409);
  const r4 = makeRes();
  await fbRouter(req('/api/fb?action=profiles', { headers: { 'x-passcode': 'nope' } }), r4);
  ok('the view needs the password', r4.statusCode === 401);
}

globalThis.Date = RealDate;
console.log(`fb_profiles.test: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
