#!/usr/bin/env node
// Build gate for the serverless surface. Run before every deploy: node check_api.mjs
//
// This exists because the LinkedIn deck broke in production and nothing caught it. The
// router lived at api/linkedin/[action].js, that one function was missing from the
// deployment, and every LinkedIn URL quietly returned the SPA's index.html with a 200. A
// 200 with an HTML body is the worst possible failure: no error page, no alert, nothing in
// the logs, and the deck only says "Server error 200" when somebody opens it.
//
// Three things are checked here, each of which would have caught it:
//   1. The Hobby function limit, counted the way Vercel counts it.
//   2. Every rewrite destination resolves to a function that actually exists.
//   3. Every cron path resolves to a function, through the rewrites.
//
// It also refuses a filename containing glob metacharacters anywhere under /api, which is
// what made the original router so easy to lose.

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const LIMIT = 12;                 // Vercel Hobby plan
const API = 'api';
const RUNTIME_EXT = /\.(js|mjs|cjs|ts|mts|cts)$/;

let errors = [], warnings = [];

// --- what Vercel would ignore ------------------------------------------------
const ignorePatterns = existsSync('.vercelignore')
  ? readFileSync('.vercelignore', 'utf8').split('\n')
      .map(l => l.trim()).filter(l => l && !l.startsWith('#'))
  : [];

function isIgnored(p) {
  return ignorePatterns.some(pat => p === pat || p.startsWith(pat.replace(/\/$/, '') + '/'));
}

// --- walk /api ---------------------------------------------------------------
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(relative('.', full));
  }
  return out;
}

const all = existsSync(API) ? walk(API) : [];

// A path segment starting with "_" makes the file a helper rather than a route. That is
// the mechanism the whole LinkedIn consolidation depends on, so it is worth stating
// explicitly rather than leaving implicit.
const isHelper = p => p.split('/').some(seg => seg.startsWith('_'));

const functions = all.filter(p =>
  RUNTIME_EXT.test(p) && !isHelper(p) && !isIgnored(p)
);

// --- 1. the limit ------------------------------------------------------------
if (functions.length > LIMIT) {
  errors.push(`${functions.length} serverless functions, limit is ${LIMIT}. Vercel fails the whole build, and production silently keeps serving the previous deployment.`);
}

// --- 2. no glob metacharacters in a filename ---------------------------------
// Vercel's own dynamic-route convention uses [param], so this is a deliberate house rule
// rather than a platform requirement. We lost a function to one and will not do it again.
for (const p of all) {
  if (!/[[\]*?]/.test(p)) continue;
  const msg = `${p} contains a glob metacharacter in its filename. Use a plain filename and pass the parameter in the query string. This is exactly how the LinkedIn router went missing from production.`;
  // Already excluded from the deployment, so it cannot break anything today. It still
  // nags, because a dead file with brackets in its name is an invitation to copy the
  // pattern. Delete it.
  if (isIgnored(p)) warnings.push(`${msg} It is in .vercelignore so it will not deploy, but delete it.`);
  else errors.push(msg);
}

// --- 3. test files do not belong in /api -------------------------------------
for (const p of all) {
  if (/\.test\.(m?js|ts)$/.test(p)) {
    errors.push(`${p} is a test file inside /api. Move it to the repo root. Test files here get bundled into the deployment and a top level process.exit() in one is a live hazard.`);
  }
}

// --- 4. rewrites and crons resolve -------------------------------------------
const vercel = existsSync('vercel.json') ? JSON.parse(readFileSync('vercel.json', 'utf8')) : {};
const rewrites = vercel.rewrites || [];

// Resolve a request path the way Vercel would: filesystem first, then rewrites in order.
function functionFor(pathname) {
  const direct = functions.find(f => '/' + f.replace(RUNTIME_EXT, '') === pathname);
  if (direct) return direct;
  for (const r of rewrites) {
    const rx = new RegExp('^' + r.source
      .replace(/[.+^${}()|\\]/g, '\\$&')
      .replace(/:[a-zA-Z]+/g, '([^/]+)')
      .replace(/\(\.\*\)/g, '(.*)') + '$');
    const m = rx.exec(pathname);
    if (!m) continue;
    let dest = r.destination.split('?')[0];
    dest = dest.replace(/\$(\d)/g, (_, i) => m[Number(i)] || '');
    dest = dest.replace(/:[a-zA-Z]+/g, () => m[1] || '');
    if (dest === '/index.html') return 'SPA';
    const hit = functions.find(f => '/' + f.replace(RUNTIME_EXT, '') === dest);
    if (hit) return hit;
    if (dest === pathname) continue;   // the identity /api/(.*) rule
    return `MISSING:${dest}`;
  }
  return 'SPA';
}

// Every URL that must return JSON. If one of these resolves to the SPA, that is the
// "Server error 200" bug reappearing.
const MUST_BE_JSON = [
  '/api/directory',
  '/api/linkedin',
  ...['decide', 'dispatch', 'emails', 'health', 'posts', 'refresh', 'remind', 'translate']
      .flatMap(a => [`/api/linkedin-${a}`, `/api/linkedin/${a}`]),
];

for (const url of MUST_BE_JSON) {
  const f = functionFor(url);
  if (f === 'SPA') errors.push(`${url} resolves to index.html, so it would answer 200 with an HTML body instead of JSON. This is the exact bug that broke the deck.`);
  else if (String(f).startsWith('MISSING:')) errors.push(`${url} rewrites to ${String(f).slice(8)}, and no function exists there.`);
}

for (const c of vercel.crons || []) {
  const f = functionFor(String(c.path).split('?')[0]);
  if (f === 'SPA' || String(f).startsWith('MISSING:')) {
    errors.push(`cron "${c.path}" does not resolve to a function. It would fire into the SPA and do nothing, silently, on its schedule.`);
  }
}

// --- report ------------------------------------------------------------------
console.log(`serverless functions: ${functions.length} of ${LIMIT}`);
for (const f of functions) console.log(`  ${f}`);
const helpers = all.filter(p => RUNTIME_EXT.test(p) && isHelper(p)).length;
const ignored = all.filter(p => RUNTIME_EXT.test(p) && !isHelper(p) && isIgnored(p)).length;
console.log(`  (${helpers} helpers not routed, ${ignored} ignored by .vercelignore)`);

if (warnings.length) { console.log('\nWARNINGS'); warnings.forEach(w => console.log('  ' + w)); }
if (errors.length) {
  console.log('\nERRORS');
  errors.forEach(e => console.log('  ' + e));
  console.log(`\n${errors.length} error(s). Do not deploy.`);
  process.exit(1);
}
console.log('\napi surface OK: under the limit, every route resolves to a real function.');
