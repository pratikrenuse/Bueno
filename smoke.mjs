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
//
// The second half checks the opposite failure. Every indexed page is a static file written
// by seo/prerender.mjs, and Vercel only serves those if the filesystem is consulted before
// the catch all rewrite. If that ever stops being true the site does not break: it quietly
// serves the SPA shell everywhere, every page gets the home page's title and canonical, and
// the whole index collapses into one URL. Nothing in a local build can tell you which of
// the two the deployment is doing.

const BASE = (process.argv[2] || 'https://www.247spain.es').replace(/\/+$/, '');

// Canonicals are absolute and always point at the live origin, whatever host is answering.
// That is deliberate: a canonical naming localhost would be worse than none at all.
const ORIGIN = 'https://www.247spain.es';

const LINKEDIN_ACTIONS = ['decide', 'dispatch', 'emails', 'health', 'posts', 'refresh', 'remind', 'translate'];

// Every URL that must return JSON. An auth failure is a pass: a 401 proves a function ran.
// An HTML body is a fail whatever the status code.
const CHECKS = [
  { url: '/api/directory?locality=javea&category=plumber', name: 'directory' },
  ...LINKEDIN_ACTIONS.map(a => ({ url: `/api/linkedin-${a}`, name: `linkedin-${a} (legacy URL, in inboxes)` })),
  ...LINKEDIN_ACTIONS.map(a => ({ url: `/api/linkedin/${a}`, name: `linkedin/${a} (path form)` })),
  ...LINKEDIN_ACTIONS.map(a => ({ url: `/api/linkedin?action=${a}`, name: `linkedin?action=${a} (canonical)` })),
];

// A page that must arrive as its own prerendered file, and the canonical it has to carry.
// One of each kind, because they are written by different branches of the route builder.
const PAGE_CHECKS = [
  { url: '/', canonical: '/' },
  { url: '/areas', canonical: '/areas' },
  { url: '/areas/alicante', canonical: '/areas/alicante' },
  { url: '/coast/costa-blanca', canonical: '/coast/costa-blanca' },
  { url: '/spain-directory', canonical: '/spain-directory' },
  { url: '/spain-directory/javea', canonical: '/spain-directory/javea' },
  { url: '/spain-directory/javea/plumber', canonical: '/spain-directory/javea/plumber' },
  { url: '/spain-professionals/marbella/lawyer', canonical: '/spain-professionals/marbella/lawyer' },
  { url: '/no/areas', canonical: '/no/areas' },
  { url: '/de/spain-directory', canonical: '/de/spain-directory' },
  { url: '/sitemap.xml', xml: true },
  { url: '/robots.txt', text: 'Disallow: /api/' },
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

// --- the prerendered pages actually reached the deployment ------------------------
for (const c of PAGE_CHECKS) {
  let body = '', err = null, status = 0;
  try {
    const r = await fetch(BASE + c.url, { redirect: 'follow' });
    status = r.status;
    body = await r.text();
  } catch (e) { err = String((e && e.message) || e); }

  let verdict = null;
  if (err) verdict = `UNREACHABLE: ${err}`;
  else if (status !== 200) verdict = `status ${status}`;
  else if (c.xml) {
    if (!/<sitemapindex|<urlset/.test(body)) verdict = 'not a sitemap. The build did not write it, or the SPA rewrite swallowed it.';
  } else if (c.text) {
    if (!body.includes(c.text)) verdict = `does not contain ${JSON.stringify(c.text)}`;
  } else {
    const canonical = (body.match(/<link rel="canonical" href="([^"]*)"/i) || [])[1];
    const want = ORIGIN + (c.canonical === '/' ? '/' : c.canonical);
    const h1 = (body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [, ''])[1].replace(/<[^>]+>/g, '').trim();
    if (!canonical) verdict = 'no canonical. This is the SPA shell, not the prerendered file.';
    else if (canonical !== want) verdict = `canonical is ${canonical}, expected ${want}. A different file was served, most likely the catch all rewrite winning over the filesystem.`;
    else if (!h1) verdict = 'no h1 in the served HTML, so there is no no-JavaScript fallback on this URL.';
  }

  if (verdict) { fail++; results.push(`  FAIL  page ${c.url}\n        ${verdict}`); }
  else { pass++; results.push(`  ok    page ${c.url}  (${status})`); }
}

console.log(`smoke test against ${BASE}\n`);
console.log(results.join('\n'));
console.log(`\n${pass} passed, ${fail} failed`);

if (fail) {
  console.log('\nA failing endpoint here means the deployed site is broken, whatever the local build said.');
  console.log('Check that the deploy actually succeeded and that every function listed by check_api.mjs is present.');
  process.exit(1);
}
