// Tests for the social posting tool (api/social.js, api/_social*.js). Every outside service
// is mocked: Supabase, Instagram, Facebook, LinkedIn and Resend. Run: node social.test.mjs
import { readFileSync, readdirSync, existsSync } from 'node:fs';

process.env.SUPABASE_URL = 'https://sb.test';
process.env.SUPABASE_SERVICE_KEY = 'service-key';
process.env.INTERNAL_PASSCODE = 'pass';
process.env.RESEND_API_KEY = 're_test';
process.env.INSTAGRAM_APP_ID = 'ig-id'; process.env.INSTAGRAM_APP_SECRET = 'ig-secret';
process.env.FACEBOOK_APP_ID = 'fb-id'; process.env.FACEBOOK_APP_SECRET = 'fb-secret';
process.env.LINKEDIN_CLIENT_ID = 'li-id'; process.env.LINKEDIN_CLIENT_SECRET = 'li-secret';
delete process.env.CRON_SECRET;

let failed = 0;
const ok = (name, cond, extra = '') => { if (cond) console.log(`  ok  ${name}`); else { failed++; console.log(`  FAIL ${name} ${extra}`); } };

const S = await import('./api/_social.js');
const D = await import('./api/_social_db.js');
const P = await import('./api/_social_platforms.js');
const { resolveAction, ACTIONS, default: router } = await import('./api/social.js');
P.timing.poll = 1;

// ---------- a small in-memory Supabase ----------
const tables = { social_accounts: [], social_posts: [] };
let seq = 0;
const uuid = () => `00000000-0000-4000-8000-${String(++seq).padStart(12, '0')}`;
const DEFAULTS = {
  social_accounts: () => ({ id: uuid(), status: 'active', last_error: null, alerted_at: null, refresh_token: null, token_expires_at: null, connected_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
  social_posts: () => ({ id: uuid(), status: 'pending', attempts: 0, error: null, container_id: null, external_post_id: null, permalink: null, published_at: null, source: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
};
function matches(row, params) {
  for (const [k, v] of params) {
    if (['select', 'order', 'limit', 'on_conflict'].includes(k)) continue;
    const [op, ...rest] = v.split('.'); const val = rest.join('.');
    const cell = row[k];
    if (op === 'eq' && String(cell) !== val) return false;
    if (op === 'neq' && String(cell) === val) return false;
    if (op === 'in' && !val.replace(/^\(|\)$/g, '').split(',').includes(String(cell))) return false;
    if (op === 'lte' && !(new Date(cell) <= new Date(val))) return false;
    if (op === 'lt' && !(new Date(cell) < new Date(val))) return false;
  }
  return true;
}
const keySets = [];
function supabase(url, init) {
  const u = new URL(url);
  const json = (data, status = 200) => new Response(JSON.stringify(data), { status });
  if (u.pathname.startsWith('/storage/v1/bucket')) return json({ id: 'social' });
  if (u.pathname.startsWith('/storage/v1/object/upload/sign/')) return json({ url: `/object/upload/sign/${u.pathname.split('/sign/')[1]}?token=t` });
  const table = u.pathname.replace('/rest/v1/', '');
  const rows = tables[table];
  if (!rows) return json({ message: 'no such table' }, 404);
  const params = [...u.searchParams];
  const method = (init.method || 'GET').toUpperCase();
  if (method === 'GET') {
    let out = rows.filter(r => matches(r, params));
    const order = u.searchParams.get('order');
    if (order) { const [col, dir] = order.split(',')[0].split('.'); out = [...out].sort((a, b) => (a[col] > b[col] ? 1 : -1) * (dir === 'desc' ? -1 : 1)); }
    return json(out);
  }
  if (method === 'POST') {
    const body = JSON.parse(init.body); const list = Array.isArray(body) ? body : [body];
    keySets.push(new Set(list.map(r => Object.keys(r).sort().join(','))).size);
    const conflict = u.searchParams.get('on_conflict');
    const out = [];
    for (const r of list) {
      const hit = conflict && rows.find(x => conflict.split(',').every(c => x[c] === r[c]));
      if (hit) { Object.assign(hit, r); out.push(hit); } else { const n = { ...DEFAULTS[table](), ...r }; rows.push(n); out.push(n); }
    }
    return json(out, 201);
  }
  if (method === 'PATCH') { const hit = rows.filter(r => matches(r, params)); const patch = JSON.parse(init.body); hit.forEach(r => Object.assign(r, patch)); return json(hit); }
  if (method === 'DELETE') { const hit = rows.filter(r => matches(r, params)); tables[table] = rows.filter(r => !hit.includes(r)); return json(hit); }
  return json({}, 405);
}

// ---------- the platforms ----------
let calls = [];
let platform = () => null;       // per-test override: (url, init) => Response | undefined
let mails = [];
globalThis.fetch = async (url, init = {}) => {
  url = String(url);
  calls.push({ url, method: (init.method || 'GET').toUpperCase(), body: init.body, headers: init.headers || {} });
  if (url.startsWith('https://sb.test')) return supabase(url, init);
  if (url.startsWith('https://api.resend.com')) { mails.push(JSON.parse(init.body)); return new Response(JSON.stringify({ id: 'm1' }), { status: 200 }); }
  const custom = await platform(url, init);
  if (custom) return custom;
  return new Response(JSON.stringify({ error: { message: `unmocked ${url}`, code: 1 } }), { status: 400 });
};
const J = (o, status = 200, headers = {}) => new Response(JSON.stringify(o), { status, headers });
const happy = (url, init) => {
  const m = (init.method || 'GET').toUpperCase();
  // Instagram
  if (/graph\.instagram\.com\/[^/]+\/media$/.test(url)) return J({ id: `c${calls.length}` });
  if (/graph\.instagram\.com\/c\d+\?/.test(url)) return J({ status_code: 'FINISHED' });
  if (/graph\.instagram\.com\/[^/]+\/media_publish$/.test(url)) return J({ id: 'igmedia1' });
  if (/graph\.instagram\.com\/igmedia1\?/.test(url)) return J({ permalink: 'https://www.instagram.com/p/abc/' });
  // Facebook
  if (/graph\.facebook\.com\/[^/]+\/photos$/.test(url)) return J({ id: `ph${calls.length}` });
  if (/graph\.facebook\.com\/[^/]+\/feed$/.test(url)) return J({ id: 'page1_post9' });
  // LinkedIn
  if (/api\.linkedin\.com\/rest\/images/.test(url)) return J({ value: { uploadUrl: 'https://upload.linkedin.test/put', image: 'urn:li:image:1' } });
  if (url === 'https://upload.linkedin.test/put' && m === 'PUT') return new Response('', { status: 201 });
  if (/api\.linkedin\.com\/rest\/posts$/.test(url)) return new Response('', { status: 201, headers: { 'x-restli-id': 'urn:li:share:77' } });
  if (/cdn\.test\//.test(url)) return new Response(Buffer.from('jpegbytes'), { status: 200, headers: { 'content-type': 'image/jpeg' } });
  return null;
};

function mockRes() {
  const r = { code: 200, headers: {}, body: null, headersSent: false };
  r.status = (c) => { r.code = c; r.statusCode = c; return r; };
  r.json = (b) => { r.body = b; r.headersSent = true; return r; };
  r.send = (b) => { r.body = b; r.headersSent = true; return r; };
  r.setHeader = (k, v) => { r.headers[k.toLowerCase()] = v; return r; };
  r.end = () => { r.headersSent = true; return r; };
  Object.defineProperty(r, 'statusCode', { get() { return r.code; }, set(v) { r.code = v; } });
  return r;
}
const req = (action, { body, query = {}, pass = 'pass', headers = {}, method } = {}) => ({
  url: `/api/social?action=${action}`, method: method || (body ? 'POST' : 'GET'), query: { action, ...query }, body,
  headers: { host: 'www.247spain.es', ...(pass ? { 'x-passcode': pass } : {}), ...headers },
});
const hit = async (action, opts) => { const res = mockRes(); await router(req(action, opts), res); return res; };
const reset = () => { tables.social_accounts = []; tables.social_posts = []; calls = []; mails = []; platform = happy; P._resetLinkedinVersion(); };
const addAccount = (a) => { const row = { ...DEFAULTS.social_accounts(), platform: 'instagram', external_id: 'ig1', username: 'maria', access_token: 'tok', ...a }; tables.social_accounts.push(row); return row; };
const addPost = (p) => { const row = { ...DEFAULTS.social_posts(), caption: 'Hello', media: [{ url: 'https://cdn.test/a.jpg', type: 'image' }], scheduled_at: new Date(Date.now() - 60000).toISOString(), status: 'approved', ...p }; tables.social_posts.push(row); return row; };
const platformCalls = () => calls.filter(c => !c.url.startsWith('https://sb.test') && !c.url.startsWith('https://api.resend.com'));

// --- 1. routing, isolation, config --------------------------------------------------------
console.log('routing and isolation');
ok('the router knows every action', ['health', 'accounts', 'connect-link', 'connect', 'callback', 'account', 'posts', 'create', 'decide', 'upload-url', 'run'].every(a => ACTIONS.includes(a)));
ok('/api/social/callback resolves', resolveAction({ url: '/api/social/callback?code=1', query: {} }) === 'callback');
ok('an unknown action is refused', resolveAction({ url: '/api/social?action=x', query: { action: 'x' } }) === null);
const vercel = JSON.parse(readFileSync('./vercel.json', 'utf8'));
const iS = vercel.rewrites.findIndex(r => r.source === '/api/social/:action');
ok('the /api/social/:action rewrite comes before the catch-all', iS !== -1 && iS < vercel.rewrites.findIndex(r => r.source === '/api/(.*)'));
const socialCrons = vercel.crons.filter(c => c.path.startsWith('/api/social?action=run'));
ok('three daily runs are scheduled, each once a day', socialCrons.length === 3 && socialCrons.every(c => /^\d+ \d+ \* \* \*$/.test(c.schedule)) && new Set(socialCrons.map(c => c.path)).size === 3);
ok('no existing cron or rewrite was removed', ['/api/linkedin-remind', '/api/linkedin-dispatch', '/api/fb-dispatch', '/api/fb/dispatch'].every(p => vercel.crons.some(c => c.path === p))
  && ['/api/linkedin/:action', '/api/fb/:action', '/api/news/:action', '/api/reels/:action'].every(s => vercel.rewrites.some(r => r.source === s)));
const code = ['./api/social.js', './api/_social.js', './api/_social_db.js', './api/_social_platforms.js'].map(p => readFileSync(p, 'utf8')).join('\n');
ok('it imports nothing from the other surfaces', !/from\s+['"]\.\/_(lk|fb|news|nl|reels|linkedin|newsletter|email|dispatch)/.test(code));
ok('it names no table but its own', !/linkedin_posts|fb_posts|news_items|news_emails|newsletter_|team_members|\/rest\/v1\/reels/.test(code));
ok('no password login, browser automation or engagement calls', !/puppeteer|playwright|password=|\/likes|\/comments|\/follow|\/messages/i.test(code.split('\n').filter(l => !l.trim().startsWith('//')).join('\n')));
ok('nothing marks a post or an account as AI made', !/is_ai_generated|ai[-_ ]generated|\bpersonas?\b/i.test(code + readFileSync('./internal-social/index.jsx', 'utf8')));
ok('the page has no meta.js', !readdirSync('./internal-social').includes('meta.js'));
ok('the page is noindex', /'\/internal-social'/.test(readFileSync('./seo/routes.js', 'utf8')));
ok('the test is in the test script', /node social\.test\.mjs/.test(readFileSync('./package.json', 'utf8')));
ok('every handler file is ESM', !/module\.exports|require\(/.test(code));

// --- 2. access ------------------------------------------------------------------------------
console.log('access');
reset();
ok('no password, no accounts', (await hit('accounts', { pass: '' })).code === 401);
ok('a wrong password is refused', (await hit('posts', { pass: 'nope' })).code === 401);
ok('the run refuses a stranger', (await hit('run', { pass: '' })).code === 401);
ok('the run accepts Vercel cron', (await hit('run', { pass: '', headers: { 'user-agent': 'vercel-cron/1.0' } })).code === 200);
process.env.CRON_SECRET = 'sec';
ok('with CRON_SECRET set, a bare cron agent is refused', (await hit('run', { pass: '', headers: { 'user-agent': 'vercel-cron/1.0' } })).code === 401);
ok('with CRON_SECRET set, the bearer is accepted', (await hit('run', { pass: '', headers: { authorization: 'Bearer sec' } })).code === 200);
delete process.env.CRON_SECRET;

// --- 3. signed links ------------------------------------------------------------------------
console.log('signed links');
const t = D.sign({ k: 'connect', p: 'instagram', b: 'https://www.247spain.es' }, 60);
ok('a signed link verifies', D.verify(t)?.p === 'instagram');
ok('a tampered link is refused', D.verify(t.replace(/.$/, c => (c === 'A' ? 'B' : 'A'))) === null && D.verify(`${Buffer.from('{"k":"connect","p":"instagram","exp":9999999999}').toString('base64url')}.${t.split('.')[1]}`) === null);
ok('an expired link is refused', D.verify(D.sign({ k: 'connect', p: 'instagram' }, -5)) === null);
ok('garbage is refused', D.verify('') === null && D.verify('a.b') === null && D.verify(null) === null);

// --- 4. connecting --------------------------------------------------------------------------
console.log('connecting');
reset();
let r = await hit('connect-link', { body: { platform: 'instagram' } });
ok('a connect link is issued', r.code === 200 && r.body.url.startsWith('https://www.247spain.es/api/social/connect?t='));
ok('a link to share lasts three days', (await hit('connect-link', { body: { platform: 'linkedin', share: true } })).body.valid_for === '3 days');
ok('an unknown platform is refused', (await hit('connect-link', { body: { platform: 'tiktok' } })).code === 400);
const saved = process.env.LINKEDIN_CLIENT_ID; delete process.env.LINKEDIN_CLIENT_ID;
r = await hit('connect-link', { body: { platform: 'linkedin' } });
ok('a platform that is not set up says which setting is missing', r.code === 400 && /LINKEDIN_CLIENT_ID/.test(r.body.error));
process.env.LINKEDIN_CLIENT_ID = saved;

const tok = new URL((await hit('connect-link', { body: { platform: 'instagram' } })).body.url).searchParams.get('t');
r = await hit('connect', { pass: '', query: { t: tok } });
const loc = new URL(r.headers.location);
ok('connect sends the person to Instagram itself', r.code === 302 && loc.host === 'www.instagram.com' && loc.searchParams.get('scope') === 'instagram_business_basic,instagram_business_content_publish');
ok('the redirect address is the one on this site', loc.searchParams.get('redirect_uri') === 'https://www.247spain.es/api/social/callback');
ok('connect with a bad link shows a page, not a crash', (await hit('connect', { pass: '', query: { t: 'x.y' } })).code === 400);
const state = loc.searchParams.get('state');

platform = (url, init) => {
  if (url === 'https://api.instagram.com/oauth/access_token') return J({ access_token: 'short', user_id: 123 });
  if (url.startsWith('https://graph.instagram.com/access_token')) return J({ access_token: 'LONG', expires_in: 5184000 });
  if (url.startsWith('https://graph.instagram.com/me?')) return J({ user_id: '178414', username: 'maria.in.spain' });
  if (url.startsWith('https://graph.facebook.com/oauth/access_token')) return J({ access_token: url.includes('fb_exchange_token') ? 'FBLONG' : 'fbshort' });
  if (url.startsWith('https://graph.facebook.com/me/accounts')) return J({ data: [{ id: '11', name: 'Page One', access_token: 'P1' }, { id: '22', name: 'Page Two', access_token: 'P2' }] });
  if (url === 'https://www.linkedin.com/oauth/v2/accessToken') return J({ access_token: 'LI', expires_in: 5184000 });
  if (url === 'https://api.linkedin.com/v2/userinfo') return J({ sub: 'abc', name: 'Real Person' });
  return null;
};
r = await hit('callback', { pass: '', query: { code: 'CODE#_', state } });
ok('the callback saves the Instagram account', r.code === 200 && tables.social_accounts.length === 1 && tables.social_accounts[0].external_id === '178414' && tables.social_accounts[0].access_token === 'LONG');
ok('the token expiry is recorded', daysBetween(tables.social_accounts[0].token_expires_at) >= 59);
ok('the callback page never shows the token', !String(r.body).includes('LONG'));
ok('a callback with a forged state is refused', (await hit('callback', { pass: '', query: { code: 'x', state: 'a.b' } })).code === 400);
ok('a refused permission changes nothing', (await hit('callback', { pass: '', query: { error: 'access_denied', state } })).code === 400 && tables.social_accounts.length === 1);
tables.social_accounts[0].status = 'needs_reconnect';
await hit('callback', { pass: '', query: { code: 'CODE', state } });
ok('connecting again reuses the same row and makes it active', tables.social_accounts.length === 1 && tables.social_accounts[0].status === 'active');

const fbState = new URL((await hit('connect', { pass: '', query: { t: D.sign({ k: 'connect', p: 'facebook', b: 'https://www.247spain.es' }, 60) } })).headers.location).searchParams.get('state');
await hit('callback', { pass: '', query: { code: 'C', state: fbState } });
ok('one Facebook sign-in connects every Page', tables.social_accounts.filter(a => a.platform === 'facebook').length === 2);
const liState = new URL((await hit('connect', { pass: '', query: { t: D.sign({ k: 'connect', p: 'linkedin', b: 'https://www.247spain.es' }, 60) } })).headers.location).searchParams.get('state');
await hit('callback', { pass: '', query: { code: 'C', state: liState } });
ok('LinkedIn connects as the person', tables.social_accounts.some(a => a.external_id === 'urn:li:person:abc'));
ok('every bulk write used rows of one shape', keySets.every(n => n === 1));
r = await hit('accounts');
ok('the accounts list never carries a token', r.code === 200 && r.body.accounts.length === 4 && !JSON.stringify(r.body).match(/LONG|"P1"|"LI"|access_token|refresh_token/));
function daysBetween(iso) { return Math.round((new Date(iso) - Date.now()) / 864e5); }

// --- 5. adding and deciding -----------------------------------------------------------------
console.log('adding and deciding');
reset();
const ig = addAccount({});
const fb = addAccount({ platform: 'facebook', external_id: 'page1', username: 'Page One' });
const liA = addAccount({ platform: 'linkedin', external_id: 'urn:li:person:abc', username: 'Real Person', token_expires_at: new Date(Date.now() + 40 * 864e5).toISOString() });
r = await hit('create', { body: { account_ids: [ig.id, fb.id, liA.id], caption: 'A tip', media: [{ url: 'https://cdn.test/a.jpg' }], scheduled_at: new Date().toISOString(), approve: true } });
ok('one post goes to three accounts', r.code === 200 && r.body.added === 3 && tables.social_posts.every(p => p.status === 'approved'));
r = await hit('create', { body: { account_ids: [ig.id], caption: 'From outside', media: ['https://cdn.test/b.jpg'] } });
ok('a post added without approval waits as pending', r.code === 200 && r.body.posts[0].status === 'pending');
ok('Instagram without a photo is refused', (await hit('create', { body: { account_ids: [ig.id], caption: 'text only' } })).code === 400);
ok('Instagram with a PNG is refused with the reason', /JPEG/.test((await hit('create', { body: { account_ids: [ig.id], caption: 'x', media: ['https://cdn.test/a.png'] } })).body.error));
ok('a non-https file is refused', (await hit('create', { body: { account_ids: [fb.id], caption: 'x', media: ['http://cdn.test/a.jpg'] } })).code === 400);
ok('LinkedIn video is refused up front', (await hit('create', { body: { account_ids: [liA.id], caption: 'x', media: ['https://cdn.test/a.mp4'] } })).code === 400);
ok('too long for LinkedIn is refused', (await hit('create', { body: { account_ids: [liA.id], caption: 'x'.repeat(3001) } })).code === 400);
ok('an unknown account is refused', (await hit('create', { body: { account_ids: ['00000000-0000-4000-8000-999999999999'], caption: 'x' } })).code === 400);
ok('a bad date is refused', (await hit('create', { body: { account_ids: [fb.id], caption: 'x', scheduled_at: 'soon' } })).code === 400);
ok('nothing was half added by a refused request', tables.social_posts.length === 4);
const pend = tables.social_posts.find(p => p.status === 'pending');
ok('approve moves pending to approved', (await hit('decide', { body: { ids: [pend.id], op: 'approve' } })).body.changed === 1 && pend.status === 'approved');
ok('hold moves it back', (await hit('decide', { body: { ids: [pend.id], op: 'hold' } })).body.changed === 1 && pend.status === 'pending');
await hit('decide', { body: { ids: [pend.id], op: 'edit', caption: 'New text', scheduled_at: '2027-01-02T09:00:00Z' } });
ok('edit changes text and time', pend.caption === 'New text' && pend.scheduled_at === '2027-01-02T09:00:00.000Z');
const pub = addPost({ account_id: ig.id, status: 'published' });
await hit('decide', { body: { ids: [pub.id, pend.id], op: 'delete' } });
ok('delete removes a waiting post and never a published one', !tables.social_posts.includes(pend) && tables.social_posts.includes(pub));
ok('a published post cannot be edited or sent again', (await hit('decide', { body: { ids: [pub.id], op: 'retry' } })).body.changed === 0 && (await hit('decide', { body: { ids: [pub.id], op: 'edit', caption: 'z' } })).body.changed === 0);
r = await hit('upload-url', { body: { ext: 'jpg' } });
ok('an upload address is issued for a JPEG', r.code === 200 && r.body.public_url.includes('/storage/v1/object/public/social/') && r.body.type === 'image');
ok('other file types are refused', (await hit('upload-url', { body: { ext: 'exe' } })).code === 400);

// --- 6. the run -----------------------------------------------------------------------------
console.log('the run');
reset();
const a1 = addAccount({});
const p1 = addPost({ account_id: a1.id });
const p2 = addPost({ account_id: a1.id, scheduled_at: new Date(Date.now() - 30000).toISOString() });
const future = addPost({ account_id: a1.id, scheduled_at: new Date(Date.now() + 864e5).toISOString() });
const notApproved = addPost({ account_id: a1.id, status: 'pending' });
r = await hit('run', { query: { dry: '1' } });
ok('a dry run publishes nothing', r.body.would_publish.length === 1 && platformCalls().length === 0 && p1.status === 'approved');
r = await hit('run');
ok('the due post is published on Instagram', p1.status === 'published' && p1.external_post_id === 'igmedia1' && p1.permalink === 'https://www.instagram.com/p/abc/');
ok('container first, then publish', (() => { const c = platformCalls().map(x => x.url); return c.findIndex(u => u.endsWith('/ig1/media')) < c.findIndex(u => u.endsWith('/ig1/media_publish')); })());
ok('one post per account per run', p2.status === 'approved' && r.body.waiting.length === 1);
ok('a future post and an unapproved post are left alone', future.status === 'approved' && notApproved.status === 'pending' && !future.published_at);
ok('no email when all is well', mails.length === 0);
calls = [];
await hit('run');
ok('the next run sends the second post and never the first again', p2.status === 'published' && platformCalls().filter(c => c.url.endsWith('/media_publish')).length === 1);

// a carousel and a reel
reset();
const a2 = addAccount({});
const car = addPost({ account_id: a2.id, media: [{ url: 'https://cdn.test/1.jpg', type: 'image' }, { url: 'https://cdn.test/2.jpg', type: 'image' }] });
await hit('run');
const carBodies = platformCalls().filter(c => c.url.endsWith('/ig1/media')).map(c => Object.fromEntries(new URLSearchParams(c.body)));
ok('a carousel makes two children and one parent', carBodies.length === 3 && carBodies[0].is_carousel_item === 'true' && carBodies[2].media_type === 'CAROUSEL' && carBodies[2].children.split(',').length === 2 && car.status === 'published');
reset();
const a3 = addAccount({});
const reel = addPost({ account_id: a3.id, media: [{ url: 'https://cdn.test/v.mp4', type: 'video' }] });
platform = (url, init) => (/graph\.instagram\.com\/c\d+\?/.test(url) ? J({ status_code: 'IN_PROGRESS' }) : happy(url, init));
const realNow = Date.now; let skew = 0; Date.now = () => realNow() + skew;
const slow = hit('run'); skew = 60000; r = await slow; skew = 0; Date.now = realNow;
const reelBody = Object.fromEntries(new URLSearchParams(platformCalls().find(c => c.url.endsWith('/ig1/media')).body));
ok('a reel still processing waits for the next run without counting as a failure', reel.status === 'approved' && reel.attempts === 0 && !!reel.container_id && r.body.waiting.length === 1);
platform = happy; calls = [];
await hit('run');
ok('the next run publishes the same container, without uploading again', reel.status === 'published' && platformCalls().filter(c => c.url.endsWith('/ig1/media')).length === 0);
ok('a reel is sent as REELS with its video address', reelBody.media_type === 'REELS' && reelBody.video_url === 'https://cdn.test/v.mp4');

// Facebook and LinkedIn
reset();
const fbA = addAccount({ platform: 'facebook', external_id: 'page1', username: 'Page One', access_token: 'PT' });
const liB = addAccount({ platform: 'linkedin', external_id: 'urn:li:person:abc', username: 'Real Person', access_token: 'LT', token_expires_at: new Date(Date.now() + 40 * 864e5).toISOString() });
const fbPost = addPost({ account_id: fbA.id, caption: 'Page text' });
const liPost = addPost({ account_id: liB.id, caption: 'Owning in Spain (a tip) #Spain #property_tax' });
await hit('run');
const feed = platformCalls().find(c => c.url.endsWith('/page1/feed'));
ok('Facebook uploads the photo unpublished and attaches it to one feed post', fbPost.status === 'published' && new URLSearchParams(feed.body).get('attached_media[0]').includes('media_fbid') && new URLSearchParams(platformCalls().find(c => c.url.endsWith('/page1/photos')).body).get('published') === 'false');
const liCall = platformCalls().find(c => c.url.endsWith('/rest/posts'));
const liBody = JSON.parse(liCall.body);
ok('LinkedIn posts as the person, publicly, with the photo', liPost.status === 'published' && liBody.author === 'urn:li:person:abc' && liBody.visibility === 'PUBLIC' && liBody.content.media.id === 'urn:li:image:1' && liPost.external_post_id === 'urn:li:share:77');
ok('LinkedIn text is escaped and hashtags still work', liBody.commentary === 'Owning in Spain \\(a tip\\) {hashtag|\\#|Spain} \\#property\\_tax');
ok('LinkedIn calls carry a version month and the protocol header', /^\d{6}$/.test(liCall.headers['LinkedIn-Version']) && liCall.headers['X-Restli-Protocol-Version'] === '2.0.0');
ok('plain text escapes every reserved character', P.linkedinText('a|b{c}d@e[f]g<h>i*j~k\\l') === 'a\\|b\\{c\\}d\\@e\\[f\\]g\\<h\\>i\\*j\\~k\\\\l');
ok('an email address is not turned into a hashtag or mention', P.linkedinText('mail me#now a#b') === 'mail me\\#now a\\#b');

// a retired LinkedIn version is stepped over
reset();
const liC = addAccount({ platform: 'linkedin', external_id: 'urn:li:person:z', username: 'Z', access_token: 'LT', token_expires_at: new Date(Date.now() + 40 * 864e5).toISOString() });
const liP2 = addPost({ account_id: liC.id, media: [], caption: 'Text only' });
let versionTries = 0;
platform = (url, init) => {
  if (/rest\/posts$/.test(url)) { versionTries++; if (versionTries < 3) return J({ status: 426, code: 'NONEXISTENT_VERSION', message: 'Requested version is not active' }, 426); }
  return happy(url, init);
};
await hit('run');
ok('a retired LinkedIn version is stepped over and the post still goes out once', liP2.status === 'published' && versionTries === 3);

// failures
console.log('when things go wrong');
reset();
const a4 = addAccount({});
const bad = addPost({ account_id: a4.id });
platform = (url, init) => (/\/ig1\/media$/.test(url) ? J({ error: { message: 'The aspect ratio is not supported.', code: 36003 } }, 400) : happy(url, init));
await hit('run');
ok('a clear refusal is retried on the next run', bad.status === 'approved' && bad.attempts === 1 && /aspect ratio/.test(bad.error) && mails.length === 0);
await hit('run'); await hit('run');
ok('after three tries it stops and an email goes out with the reason', bad.status === 'failed' && bad.attempts === 3 && mails.length === 1 && /aspect ratio/.test(mails[0].html));
ok('the alert goes to Pratik only, opens with Hi, and has no euro sign in the subject', mails[0].to.join() === 'pratik.y.renuse@gmail.com' && !mails[0].cc && !mails[0].bcc && /<p>Hi,<\/p>/.test(mails[0].html) && !/€/.test(mails[0].subject));
calls = [];
await hit('run');
ok('a failed post is never sent again by itself', platformCalls().length === 0);
await hit('decide', { body: { ids: [bad.id], op: 'retry' } });
ok('Send it again puts it back in line', bad.status === 'approved' && bad.attempts === 0);

reset();
const a5 = addAccount({});
const amb = addPost({ account_id: a5.id });
platform = (url, init) => { if (/media_publish$/.test(url)) throw new Error('socket hang up'); return happy(url, init); };
await hit('run');
ok('no clear answer on the publish call parks the post for a person', amb.status === 'check' && mails.length === 1);
calls = []; platform = happy;
await hit('run');
ok('a parked post is never retried by itself, so it cannot be posted twice', amb.status === 'check' && platformCalls().length === 0);
await hit('decide', { body: { ids: [amb.id], op: 'mark-published' } });
ok('"It is live" settles it without sending', amb.status === 'published' && platformCalls().length === 0);

reset();
const a6 = addAccount({});
const p500 = addPost({ account_id: a6.id });
platform = (url, init) => (/media_publish$/.test(url) ? J({ error: { message: 'Unknown error', code: 1 } }, 500) : happy(url, init));
await hit('run');
ok('a server error on the publish call is also parked, not retried', p500.status === 'check');

reset();
const a7 = addAccount({});
const authPost = addPost({ account_id: a7.id });
platform = (url, init) => (/\/ig1\/media$/.test(url) ? J({ error: { message: 'Error validating access token', code: 190 } }, 400) : happy(url, init));
r = await hit('run');
ok('a refused token marks the account, keeps the post, and emails once', a7.status === 'needs_reconnect' && authPost.status === 'approved' && authPost.attempts === 0 && mails.length === 1);
calls = []; mails = [];
await hit('run');
ok('nothing is sent to an account waiting to be connected again', platformCalls().length === 0 && mails.length === 0);

reset();
const a8 = addAccount({});
const stuck = addPost({ account_id: a8.id, status: 'publishing', updated_at: new Date(Date.now() - 3600e3).toISOString() });
await hit('run');
ok('a post stuck half way is parked, never resent', stuck.status === 'check' && platformCalls().length === 0 && mails.length === 1);

reset();
const a9 = addAccount({});
const raced = addPost({ account_id: a9.id });
const origFetch = globalThis.fetch;
globalThis.fetch = async (url, init = {}) => {
  // Another run claims the post in the instant before this run's claim lands.
  if (String(url).includes('status=eq.approved') && (init.method || '') === 'PATCH') raced.status = 'publishing';
  return origFetch(url, init);
};
await hit('run');
globalThis.fetch = origFetch;
ok('two runs at once cannot both send a post', platformCalls().length === 0);

reset();
const paused = addAccount({ status: 'paused' });
const pp = addPost({ account_id: paused.id });
await hit('run');
ok('a paused account posts nothing', pp.status === 'approved' && platformCalls().length === 0);

// --- 7. tokens ------------------------------------------------------------------------------
console.log('tokens');
reset();
const soon = addAccount({ token_expires_at: new Date(Date.now() + 5 * 864e5).toISOString() });
platform = (url) => (url.startsWith('https://graph.instagram.com/refresh_access_token') ? J({ access_token: 'FRESH', expires_in: 5184000 }) : null);
await hit('run');
ok('an Instagram token is renewed by itself before it ends', soon.access_token === 'FRESH' && daysBetween(soon.token_expires_at) >= 59 && mails.length === 0);
reset();
const liSoon = addAccount({ platform: 'linkedin', external_id: 'urn:li:person:q', username: 'Q', token_expires_at: new Date(Date.now() + 5 * 864e5).toISOString() });
await hit('run');
ok('a LinkedIn access about to end sends one reminder', mails.length === 1 && /ends in/.test(mails[0].html) && liSoon.status === 'active');
await hit('run');
ok('the reminder is not repeated on every run', mails.length === 1);
reset();
const dead = addAccount({ platform: 'linkedin', external_id: 'urn:li:person:d', username: 'D', token_expires_at: new Date(Date.now() - 864e5).toISOString() });
const deadPost = addPost({ account_id: dead.id, media: [] });
await hit('run');
ok('an expired access stops posting to that account and says so', dead.status === 'needs_reconnect' && deadPost.status === 'approved' && platformCalls().length === 0 && mails.length === 1);
const fbForever = addAccount({ platform: 'facebook', external_id: 'p9', username: 'P9', token_expires_at: null });
mails = [];
await hit('run');
ok('a Facebook Page token has no expiry to chase', fbForever.status === 'active');

// --- 8. health ------------------------------------------------------------------------------
console.log('health');
reset();
r = await hit('health');
ok('health reports the redirect address and every platform', r.code === 200 && r.body.redirect_uri === 'https://www.247spain.es/api/social/callback' && r.body.platforms.instagram.ready && r.body.platforms.linkedin.ready && r.body.tables.accounts === true);
ok('health never returns a secret', !JSON.stringify(r.body).match(/service-key|ig-secret|fb-secret|li-secret/));
ok('the schema file creates both tables with the service grant', existsSync('./studio/social_schema.sql') && /grant select, insert, update, delete on public\.social_posts to service_role/.test(readFileSync('./studio/social_schema.sql', 'utf8')));

console.log(failed ? `\n${failed} FAILED` : '\nall social posting tests passed');
process.exit(failed ? 1 : 0);
