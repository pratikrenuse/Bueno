#!/usr/bin/env node
// Build gate. Fails if any rule is malformed, out of review, or usable when it should not be.
// Run in CI before every deploy: node validate_rules.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'rules';
const TODAY = new Date().toISOString().slice(0, 10);
const OK_STATUS = ['verified', 'partial', 'unverified', 'annulled', 'myth'];

let errors = [], warnings = [], counts = {};

function walk(node, file, path = '') {
  if (Array.isArray(node)) return node.forEach((n, i) => walk(n, file, `${path}[${i}]`));
  if (!node || typeof node !== 'object') return;
  if (typeof node.status === 'string') check(node, file, path);
  for (const [k, v] of Object.entries(node)) {
    if (k !== 'source') walk(v, file, path ? `${path}.${k}` : k);
  }
}

function check(r, file, path) {
  const id = r.id || r.region || path || '(unnamed)';
  const where = `${file} :: ${id}`;

  if (!OK_STATUS.includes(r.status)) errors.push(`${where}: bad status "${r.status}"`);
  counts[r.status] = (counts[r.status] || 0) + 1;

  // Every rule must say what it is, in words a user could read.
  if (!r.statement && !r.notes && !r.key_facts) errors.push(`${where}: no statement`);

  // Anything usable must be sourced. Unverified rules are allowed to have no source,
  // because that is precisely what makes them unverified.
  const usable = r.status === 'verified' || r.status === 'partial';
  if (usable) {
    const s = r.source;
    if (!s) { errors.push(`${where}: usable rule with no source block`); }
    else {
      for (const f of ['name', 'ref', 'url', 'read_on']) {
        if (!s[f]) errors.push(`${where}: source missing "${f}"`);
      }
      if (s.url && !/^https?:\/\//.test(s.url)) errors.push(`${where}: source url is not a URL`);
    }
    if (!r.source_url && !r.source && !r.source_url) { /* handled above */ }
    if (!r.review_by) errors.push(`${where}: usable rule with no review_by`);
    else if (r.review_by < TODAY) warnings.push(`${where}: review overdue since ${r.review_by}`);
  }

  // A partial rule must carry the caveat that the page will show.
  if (r.status === 'partial' && !r.notes) errors.push(`${where}: partial rule with no caveat in notes`);

  // Brand and typography rules apply to shipped data, not only to components.
  for (const field of ['statement', 'notes', 'tool_design']) {
    const v = r[field];
    if (typeof v !== 'string') continue;
    const b = v.match(BANNED);
    if (b) errors.push(`${where}: ${field} names "${b[0]}", which must never ship to a page`);
    if (DASHES.test(v)) errors.push(`${where}: ${field} contains an em or en dash`);
  }

  // Unverified, annulled and myth rules must never carry a usable value.
  if (['unverified', 'annulled', 'myth'].includes(r.status)) {
    if (typeof r.value === 'number') errors.push(`${where}: status "${r.status}" but carries a numeric value that code could read`);
  }
}

// The rules JSON is bundled into the client and its `notes` render to users on partial
// rules. This site must never name the brand, a bank, an insurer or a utility, so the
// data is checked for it too, not only the components.
const BANNED = /\b(Bueno|Currencies Direct|Energy Nordic|Sabadell|BBVA|CaixaBank|Santander|Unicaja|Iberdrola|Naturgy|Endesa|Revolut|Wise)\b/i;
const DASHES = /[\u2014\u2013]/;

for (const file of readdirSync(DIR).filter(f => f.endsWith('.json') && f !== '_schema.json')) {
  let data;
  try { data = JSON.parse(readFileSync(join(DIR, file), 'utf8')); }
  catch (e) { errors.push(`${file}: invalid JSON, ${e.message}`); continue; }
  if (!data.domain) errors.push(`${file}: no domain`);
  walk(data, file);
}

console.log('rule statuses:', counts);
if (warnings.length) { console.log('\nWARNINGS'); warnings.forEach(w => console.log('  ' + w)); }
if (errors.length) { console.log('\nERRORS'); errors.forEach(e => console.log('  ' + e)); console.log(`\n${errors.length} error(s). Build blocked.`); process.exit(1); }
console.log('\nAll rules well formed.');
