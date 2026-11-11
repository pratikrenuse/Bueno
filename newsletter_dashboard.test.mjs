// Test of the /internal-newsletter dashboard API (api/_nl_dash.js through api/newsletter.js),
// with an in-memory Supabase. Run: node newsletter_dashboard.test.mjs
// Proves: the password is required, the dashboard loads articles, editions and settings,
// approving an article also approves its test edition, reject frees the article, launch
// adds John and can be undone, the next send date follows the 14-day cycle, and nothing
// here ever calls Resend.
import assert from 'node:assert/strict';

process.env.INTERNAL_PASSCODE = 'pw';
process.env.SUPABASE_URL = 'https://db.test';
process.env.SUPABASE_SERVICE_KEY = 'svc';

const T = {
  newsletter_articles: [
    { slug: 'community-fees', title: 'Community Fees', category: 'Utilities', sort: 1, status: 'selected', used_in: 'Edition 10 Nov 2026', used_on: '2026-11-10', links: {} },
    { slug: 'ibi-tax', title: 'IBI Tax', category: 'Legal', sort: 2, status: 'available', links: {} },
    { slug: 'scams', title: 'Scams', category: 'Buying', sort: 3, status: 'used', links: {} },
  ],
  newsletter_editions: [{ edition_key: '2026-11-10', send_date: '2026-11-10', status: 'test_sent', subject: { en: 's' }, stories: [], html: { en: '<p>x</p>' } }],
  newsletter_settings: [
    { key: 'recipients', value: { to: ['pratik.y.renuse@gmail.com'], launched: false } },
    { key: 'schedule', value: { anchor: '2026-11-10', every_days: 14 } },
  ],
};
let resendCalls = 0;
globalThis.fetch = async (url, init = {}) => {
  url = String(url);
  const json = (b, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { 'content-type': 'application/json' } });
  if (url.includes('resend.com')) { resendCalls++; return json({}); }
  const m = url.match(/^https:\/\/db\.test\/rest\/v1\/([a-z_]+)(\?.*)?$/);
  if (!m) throw new Error(`unexpected fetch ${url}`);
  const table = T[m[1]]; assert.ok(table, `unknown table ${m[1]}`);
  const p = new URLSearchParams((m[2] || '').slice(1));
  const f = [...p].filter(([, v]) => v.startsWith('eq.')).map(([k, v]) => [k, decodeURIComponent(v.slice(3))]);
  const match = (r) => f.every(([k, v]) => String(r[k]) === v);
  if ((init.method || 'GET') === 'GET') return json(table.filter(match));
  if (init.method === 'PATCH') {
    const b = JSON.parse(init.body); const out = [];
    for (const r of table) if (match(r)) { Object.assign(r, b); out.push({ ...r }); }
    return json(out);
  }
  throw new Error(`unexpected ${init.method} ${url}`);
};

const { default: router, ACTIONS } = await import('./api/newsletter.js');
const { nextSend } = await import('./api/_nl_dash.js');
assert.ok(ACTIONS.includes('dashboard'));
async function call({ method = 'GET', body, query = {}, headers = { 'x-passcode': 'pw' } } = {}) {
  let status = 200, payload;
  const res = { headersSent: false, status(s) { status = s; return this; }, json(j) { payload = j; this.headersSent = true; return this; } };
  await router({ method, url: '/api/newsletter?action=dashboard', query: { action: 'dashboard', ...query }, headers, body }, res);
  return { status, body: payload };
}

let r = await call({ headers: {} });
assert.equal(r.status, 401, 'no password is refused');

r = await call();
assert.equal(r.status, 200, JSON.stringify(r.body));
assert.equal(r.body.counts.all, 3); assert.equal(r.body.counts.selected, 1); assert.equal(r.body.counts.used, 1);
assert.equal(r.body.editions.length, 1);
assert.equal(r.body.settings.recipients.launched, false);

r = await call({ query: { edition: '2026-11-10' } });
assert.equal(r.body.html.en, '<p>x</p>', 'edition html is served on request');

r = await call({ method: 'POST', body: { op: 'approve-article', slug: 'community-fees' } });
assert.equal(r.status, 200, JSON.stringify(r.body));
assert.equal(T.newsletter_articles[0].status, 'approved');
assert.equal(T.newsletter_editions[0].status, 'approved', 'approving the article approves its test edition');

r = await call({ method: 'POST', body: { op: 'pick-article', slug: 'ibi-tax', date: '2026-11-24' } });
assert.equal(T.newsletter_articles[1].status, 'selected');
r = await call({ method: 'POST', body: { op: 'reject-article', slug: 'ibi-tax' } });
assert.equal(T.newsletter_articles[1].status, 'available'); assert.equal(T.newsletter_articles[1].used_on, null);

r = await call({ method: 'POST', body: { op: 'set-launch', launched: true } });
assert.deepEqual(T.newsletter_settings[0].value.to, ['pratik.y.renuse@gmail.com', 'john@getbueno.com']);
r = await call({ method: 'POST', body: { op: 'set-launch', launched: false } });
assert.deepEqual(T.newsletter_settings[0].value.to, ['pratik.y.renuse@gmail.com']);

r = await call({ method: 'POST', body: { op: 'nonsense' } });
assert.equal(r.status, 400);

const sch = { anchor: '2026-11-10', every_days: 14 };
assert.equal(nextSend(sch, new Date('2026-11-10T08:00:00Z')), '2026-11-10');
assert.equal(nextSend(sch, new Date('2026-11-11T08:00:00Z')), '2026-11-24');
assert.equal(nextSend(sch, new Date('2026-11-24T08:00:00Z')), '2026-11-24');
assert.equal(nextSend(sch, new Date('2026-12-01T08:00:00Z')), '2026-12-08');

assert.equal(resendCalls, 0, 'the dashboard never sends email');
console.log('newsletter dashboard: all checks passed');
