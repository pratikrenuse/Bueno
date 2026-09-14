// The citation line under every answer.
//
// An answer engine decides whether to quote a page partly on whether the page shows its
// working. This turns a rule id into the one line that does that: the article, the body that
// published it, and the date a human last read it. Nothing here is written by hand, so a
// citation cannot drift away from the rule it belongs to.
//
// NODE ONLY, AND READ FROM DISK ON PURPOSE
// rules/index.js imports its JSON without import attributes, which Vite handles and plain
// Node does not. The prerenderer is plain Node, so this reads the files directly instead.
// Nothing in the browser bundle imports this module: the answers layer is static pages.

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RULES_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'rules');

const RULES = {};
for (const file of readdirSync(RULES_DIR)) {
  if (!file.endsWith('.json') || file.startsWith('_')) continue;
  const parsed = JSON.parse(readFileSync(join(RULES_DIR, file), 'utf8'));
  for (const r of parsed.rules || []) if (r.id) RULES[r.id] = r;
}

export { RULES };

export function sourceOf(id) {
  const r = RULES[id];
  if (!r || !r.source) return null;
  return {
    id,
    ref: r.source.ref || '',
    name: r.source.name || '',
    url: r.source.url || '',
    readOn: r.source.read_on || '',
    dated: r.source.source_dated || '',
    status: r.status,
    statement: r.statement || '',
  };
}

/** "art. 24.6 TRLIRNR, AEAT, read 2026-09-07" */
export function sourceLine(id) {
  const s = sourceOf(id);
  if (!s) return null;
  const bits = [s.ref, s.name].filter(Boolean);
  return s.readOn ? `${bits.join(', ')}, read ${s.readOn}` : bits.join(', ');
}

/** The most recent read date across a set of rules, which is the page's honest freshness. */
export function lastCheckedOf(ids = []) {
  const dates = ids.map(id => sourceOf(id)?.readOn).filter(Boolean).sort();
  return dates.length ? dates[dates.length - 1] : null;
}

export const citationsOf = (ids = []) => ids.map(sourceOf).filter(Boolean);

/** Every answer must rest on rules that exist and are verified. The build gate uses this. */
export function checkRules(ids = []) {
  const problems = [];
  for (const id of ids) {
    const r = RULES[id];
    if (!r) { problems.push(`${id} does not exist`); continue; }
    if (r.status !== 'verified') problems.push(`${id} is ${r.status}, not verified`);
    if (!r.source || !r.source.url) problems.push(`${id} has no source url`);
  }
  return problems;
}
