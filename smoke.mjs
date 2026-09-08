#!/usr/bin/env node
// Production smoke test. Run it against the deployed site AFTER every deploy:
//
//   node smoke.mjs                      checks https://www.247spain.es
//   node smoke.mjs http://localhost:4180  checks a local build
//
// WHY THIS EXISTS
//
// The LinkedIn deck broke in production and every check we had said green, because every
// check we had ran against a local build and a mocked API. A local build cannot tell you
// whether a function made it into the deployment. Only the deployment can.
//
// The specific failure this is built to catch: an endpoint answering 200 with the SPA's
// index.html instead of JSON. That happens whenever no serverless function matches a path
// and the catch-all rewrite takes over. It produces no error page, nothing in the logs and
// no alert. The only symptom is a screen somewhere saying "Server error 200".
//
// So the assertion is not "did it respond". It is "did it respond with JSON".

const BASE = (process.argv[2] || 'https://www.247spain.es').replace(/\/+$/, '');

const LINKEDIN_ACTIONS = ['decide', 'dispatch', 'emails', 'health', 'posts', 'refresh', 'remind', 'translate'];

// Every URL that must return JSON. An auth failure is a pass: a 401 proves a function ran.
// An HTML body is a fail whatever the status code.
const CHECKS = [
  { url: '/api/directory?locality=javea&category=plumber', name: 'directory' },
  ...LINKEDIN_ACTIONS.map(a => ({ url: `/api/linkedin-${a}`, name: `linkedin-${a} (legacy URL, in inboxes)` })),
  ...LINKEDIN_ACTIONS.map(a => ({ url: `/api/linkedin/${a}`, name: `linkedin/${a} (path form)` })),
  ...LINKEDIN_ACTIONS.map(a => ({ url: `/api/linkedin?action=${a}`, name: `linkedin?action=${a} (canonical)` })),
];

const looksLikeHtml = t => /^\s*<(?:!doctype|html)/i.test(t);

let pass = 0, fail = 0;
const results = [];

for (const c of CHECKS) {
  let status = 0, body = '', err = null;
  try {
    const r = await fetch(BASE + c.url, { headers: { accept: 'application/json' }, redirect: 'follow' });
    status = r.status;
    body = (await r.text()).slice(0, 400);
  } catch (e) {
    err = String((e && e.message) || e);
  }

  let verdict;
  if (err) verdict = `UNREACHABLE: ${err}`;
  else if (looksLikeHtml(body)) verdict = `HTML BODY with status ${status}. No function matched this path, so the catch-all rewrite served index.html. This is the "Server error 200" bug.`;
  else {
    try { JSON.parse(body); verdict = null; }
    catch { verdict = body.trim() ? `status ${status}, body is neither JSON nor HTML: ${body.slice(0, 120)}` : `status ${status}, empty body`; }
  }

  if (verdict) { fail++; results.push(`  FAIL  ${c.name}\n        ${verdict}`); }
  else { pass++; results.push(`  ok    ${c.name}  (${status})`); }
}

console.log(`smoke test against ${BASE}\n`);
console.log(results.join('\n'));
console.log(`\n${pass} passed, ${fail} failed`);

if (fail) {
  console.log('\nA failing endpoint here means the deployed site is broken, whatever the local build said.');
  console.log('Check that the deploy actually succeeded and that every function listed by check_api.mjs is present.');
  process.exit(1);
}
