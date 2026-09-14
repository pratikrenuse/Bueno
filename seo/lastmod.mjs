// Honest lastmod dates, kept in a ledger.
//
// THE PROBLEM THIS FIXES
// Every URL in the sitemap carried the build date. All 11,166 of them, changed or not, on
// every deploy. That is worse than leaving lastmod out.
//
// Google deprecated the sitemap ping endpoint in 2023 and told everyone to rely on lastmod
// instead, with one condition attached: the date has to be accurate, and a site that stamps
// everything with today gets its lastmod ignored entirely. So the one lever available for
// getting recrawled was pointing the wrong way, and the fix is to know which pages actually
// changed.
//
// HOW IT KNOWS
// A ledger at seo/lastmod.json maps a path to the hash of its meaningful content and the
// date that content last changed. On each build every route is hashed. Same hash, same date
// as before. Different hash, today. A page that has not been touched in three months says
// so, which is exactly what makes the signal worth trusting.
//
// The ledger is committed. It has to be: a fresh checkout with no ledger would otherwise
// declare the entire site modified today, which is the thing being fixed.
//
// The changed list is the second use. IndexNow asks to be told about pages that changed and
// only those. The ledger already knows which.

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const LEDGER = join(HERE, 'lastmod.json');
const SEP = String.fromCharCode(30);

const today = () => new Date().toISOString().slice(0, 10);

/**
 * What counts as a change worth telling a search engine about.
 *
 * The title, the description, the heading and the body text: the things a reader or a
 * crawler would notice. Deliberately NOT the asset hashes, the build id, or the ordering of
 * anything, because a rebuilt bundle is not a changed page, and claiming otherwise is how
 * lastmod stopped being believed in the first place.
 */
export function contentHash(route) {
  const material = [
    route.title || '',
    route.description || '',
    route.h1 || '',
    (route.intro || []).join('\n'),
    (route.links || []).map(l => `${l.href}|${l.label}`).sort().join('\n'),
    (route.mentions || []).join(','),
    route.noindex ? 'noindex' : 'index',
  ].join(SEP);
  return createHash('sha1').update(material, 'utf8').digest('hex').slice(0, 16);
}

export function readLedger() {
  if (!existsSync(LEDGER)) return {};
  try { return JSON.parse(readFileSync(LEDGER, 'utf8')); }
  catch { return {}; }
}

/**
 * Resolve a date for every route, and say which ones moved.
 *
 * `seeded` is the first run, where there is no history at all. Everything gets today because
 * there is nothing better to say, and nothing is reported as changed, because announcing
 * eleven thousand changed URLs on day one would be a lie and would burn the IndexNow quota
 * for no reason.
 */
export function resolveLastmod(routes, { now = today(), previous = null } = {}) {
  // `previous` is injectable so the behaviour can be tested against a known history rather
  // than against whatever happens to be committed at the time.
  previous = previous || readLedger();
  const seeded = Object.keys(previous).length === 0;
  const next = {};
  const changed = [];

  for (const route of routes) {
    const hash = contentHash(route);
    const before = previous[route.path];
    if (before && before.hash === hash) {
      next[route.path] = before;
      continue;
    }
    next[route.path] = { hash, date: now };
    if (!seeded) changed.push(route.path);
  }

  const stale = Object.keys(previous).filter(p => !(p in next));

  return {
    ledger: next,
    dateOf: (path) => (next[path] || {}).date || now,
    changed,
    removed: stale,
    seeded,
    total: routes.length,
    untouched: routes.length - changed.length,
  };
}

export function writeLedger(ledger) {
  // Sorted, so a diff of this file is readable and a rebuild does not reshuffle eleven
  // thousand lines for no reason.
  const sorted = {};
  for (const k of Object.keys(ledger).sort()) sorted[k] = ledger[k];
  writeFileSync(LEDGER, JSON.stringify(sorted) + '\n');
  return Object.keys(sorted).length;
}

export const LEDGER_PATH = LEDGER;
