// End-to-end test of the newsletter API with an in-memory Supabase and a fake Resend.
// Run: node newsletter.test.mjs
// Proves: seed is idempotent and never overwrites touched issues, edits win, placeholder
// news blocks approval, emails are held while NEWSLETTER_EMAILS_LIVE is off and sent once
// it is on, the alert picks the right issue, the research job cannot touch approved issues,
// and the health check reports repeats.
import assert from 'node:assert/strict';

process.env.INTERNAL_PASSCODE = 'pw';
process.env.SUPABASE_URL = 'https://db.test';
process.env.SUPABASE_SERVICE_KEY = 'svc';
process.env.RESEND_API_KEY = 'rk';
process.env.RESEND_FROM = 'Test <t@test>';
process.env.CRON_SECRET = 'cs';

let table = []; let nextId = 1; const sent = [];
const parseFilter = (qs) => {
  const p = new URLSearchParams(qs); const f = [];
  for (const [k, v] of p) if (v.startsWith('eq.')) f.push([k, decodeURIComponent(v.slice(3))]);
  return f;
};
globalThis.fetch = async (url, init = {}) => {
  url = String(url);
  const json = (b, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { 'content-type': 'application/json' } });
  if (url.startsWith('https://api.resend.com')) { sent.push(JSON.parse(init.body)); return json({ id: `m${sent.length}` }); }
  if (url.includes('newsletter-guides')) return new Response('', { status: 200, headers: { 'content-type': 'application/pdf' } });
  if (url.startsWith('https://db.test/rest/v1/newsletter_issues')) {
    const qs = url.split('?')[1] || ''; const f = parseFilter(qs);
    const match = (r) => f.every(([k, v]) => String(r[k]) === v);
    const m = init.method || 'GET';
    if (m === 'GET') { let rows = table.filter(match); if (qs.includes('order=send_date.asc')) rows = [...rows].sort((a, b) => a.send_date.localeCompare(b.send_date)); return json(rows); }
    if (m === 'POST') { const rows = JSON.parse(init.body); for (const r of rows) { assert.ok(!table.some(t => t.issue_key === r.issue_key), 'duplicate insert'); table.push({ id: nextId++, status: 'pending', edited: null, ...r }); } return json([]); }
    if (m === 'PATCH') { const b = JSON.parse(init.body); const out = []; table = table.map(r => { if (match(r)) { const n = { ...r, ...b }; out.push(n); return n; } return r; }); return json(out); }
  }
  throw new Error(`unexpected fetch ${url}`);
};

const { default: router } = await import('./api/newsletter.js');
async function call(action, { method = 'GET', body, query = {}, headers = { 'x-passcode': 'pw' } } = {}) {
  let status = 200, payload;
  const res = { headersSent: false, status(s) { status = s; return this; }, json(j) { payload = j; this.headersSent = true; return this; } };
  await router({ method, url: `/api/newsletter?action=${action}`, query: { action, ...query }, headers, body }, res);
  return { status, body: payload };
}

let r = await call('issues', { headers: {} });
assert.equal(r.status, 401, 'no password is refused');

r = await call('seed', { method: 'POST', body: {} });
assert.equal(r.status, 200, JSON.stringify(r.body));
assert.ok(r.body.inserted.includes('nl-13') && r.body.inserted.includes('nl-14'));
r = await call('seed', { method: 'POST', body: {} });
assert.equal(r.body.inserted.length, 0, 'second seed inserts nothing');
assert.ok(r.body.refreshed.includes('nl-13'), 'untouched issue is refreshed');

r = await call('issues');
const i13 = r.body.issues.find(i => i.issue_key === 'nl-13');
assert.equal(i13.content.no.news.length, 3);
assert.equal(r.body.emails_live, false);

// Edit Norwegian, then reseed: the edit survives.
const no = JSON.parse(JSON.stringify(i13.content.no)); no.news[0].title = 'John sin overskrift';
r = await call('decide', { method: 'POST', body: { key: 'nl-13', action: 'edit', lang: 'no', content: no } });
assert.equal(r.body.issue.edited.no.news[0].title, 'John sin overskrift');
r = await call('seed', { method: 'POST', body: {} });
assert.ok(r.body.kept.includes('nl-13'), 'edited issue is kept');
assert.equal(table.find(t => t.issue_key === 'nl-13').edited.no.news[0].title, 'John sin overskrift');

// Placeholder news blocks approval.
r = await call('decide', { method: 'POST', body: { key: 'nl-14', action: 'approved' } });
assert.equal(r.status, 400); assert.match(r.body.error, /placeholder/);

// Approve with emails off: approved, nothing sent.
r = await call('decide', { method: 'POST', body: { key: 'nl-13', action: 'approved' } });
assert.equal(r.body.issue.status, 'approved'); assert.equal(r.body.email.held, true); assert.equal(sent.length, 0);
assert.match(r.body.preview.html, /John sin overskrift/, 'the approval email carries the edited text');
assert.match(r.body.preview.html, /Svenska/);

// Research job: due, write news, cannot touch approved.
r = await call('news', { method: 'POST', body: { key: 'nl-13', news: { en: [], no: [], sv: [] } } });
assert.equal(r.status, 400);
const three = (p) => [1, 2, 3].map(n => ({ title: `${p} t${n}`, body: `${p} b${n}` }));
r = await call('news', { method: 'POST', body: { key: 'nl-13', news: { en: three('en'), no: three('no'), sv: three('sv') } } });
assert.equal(r.status, 409, 'approved issue is left alone');
r = await call('news', { method: 'POST', body: { key: 'nl-14', news: { en: three('en'), no: three('no'), sv: three('sv') }, region: { en: ['new para'] }, sources: { news: ['https://x'] } } });
assert.equal(r.status, 200, JSON.stringify(r.body));
const i14 = table.find(t => t.issue_key === 'nl-14');
assert.equal(i14.news_status, 'researched'); assert.equal(i14.content.sv.news[2].title, 'sv t3'); assert.deepEqual(i14.content.en.region.paras, ['new para']);
assert.equal(i14.content.no.region.paras.length, 2, 'region left as is where no refresh given');

// Alert: dry run builds it; emails off holds it; on sends once to John and Pratik.
r = await call('alert', { query: { key: 'nl-14', dry: '1' } });
assert.match(r.body.subject, /Newsletter for Thursday 22 October/); assert.deepEqual(r.body.to, ['john@getbueno.com', 'pratik.y.renuse@gmail.com']);
assert.match(r.body.html, /The password for the tool is <b>pw<\/b>/);
r = await call('alert', { query: { key: 'nl-14' } });
assert.equal(r.body.held, true); assert.equal(sent.length, 0);
process.env.NEWSLETTER_EMAILS_LIVE = 'true';
r = await call('alert', { query: { key: 'nl-14' } }, );
assert.equal(r.body.sent, true); assert.equal(sent.length, 1); assert.deepEqual(sent[0].to, ['john@getbueno.com', 'pratik.y.renuse@gmail.com']);
r = await call('alert', { query: { key: 'nl-14' } });
assert.equal(r.body.sent, false, 'never twice without force');

// Approve with emails on: Pratik only, and only once.
r = await call('decide', { method: 'POST', body: { key: 'nl-14', action: 'approved' } });
assert.equal(r.body.email.ok, true); assert.deepEqual(sent[1].to, ['pratik.y.renuse@gmail.com']);
r = await call('decide', { method: 'POST', body: { key: 'nl-14', action: 'approved' } });
assert.equal(r.body.email.skipped, 'already emailed to Pratik'); assert.equal(sent.length, 2);
r = await call('decide', { method: 'POST', body: { key: 'nl-14', action: 'scheduled' } });
assert.equal(r.body.issue.status, 'scheduled');

// Cron bearer works for the alert, nothing else is needed.
r = await call('alert', { query: { dry: '1' }, headers: { authorization: 'Bearer cs' } });
assert.equal(r.status, 200);

// Health.
r = await call('health');
const names = Object.fromEntries(r.body.checks.map(c => [c.name, c]));
assert.equal(names['no repeated guide'].ok, true, names['no repeated guide'].detail);
assert.equal(names['no repeated region'].ok, true);
assert.equal(names['no repeated reader topic'].ok, true);
assert.equal(names['guide PDFs open'].ok, true, names['guide PDFs open'].detail);
table.find(t => t.issue_key === 'nl-14').guide = 'closing-up-for-winter';
r = await call('health');
assert.equal(r.body.checks.find(c => c.name === 'no repeated guide').ok, false, 'a repeated guide is reported');

console.log('newsletter.test: all checks passed');
