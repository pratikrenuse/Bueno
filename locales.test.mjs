#!/usr/bin/env node
// Guards on the six locale files.
//
// WHY THIS EXISTS
// tax-calculator and rental-tax used to print two tax deadlines that were wrong:
// "Deadline December 31" for rental owners, and "Quarterly filings / Q4 deadline
// January 20". Both were moved onto the rules base, but the old strings survived in all
// six locale files as calc_tax.panel_period and calc_rental.panel_period, unreferenced.
// Nothing rendered them, which is exactly what makes them dangerous: they read like live
// copy, and the day somebody wires that key back up the site ships a wrong tax deadline in
// six languages with nothing to catch it.
//
// So: those keys stay deleted, and no locale file is allowed to state a filing deadline in
// prose. Deadlines come from rules/ through rule(), where they carry a source and a date.

import { readFileSync } from 'node:fs';

const LOCALES = ['en', 'no', 'sv', 'de', 'fr', 'nl'];
let pass = 0, fail = 0;
const bad = [];
const check = (cond, msg) => cond ? pass++ : (fail++, bad.push(msg));

// Deleted on purpose. Do not reinstate: the live screens read panel_period_year from each
// tool's own copy.js and take the window itself from the rules base.
// calc_tax.filing_hint is here for the same reason: it said "due by December 31 each year"
// in all six languages. useCopy reads each tool's own copy.js and falls back to copy.en, so
// it never reached a screen, but it read like live copy and it was wrong.
const BANNED_KEYS = [
  ['calc_tax', 'panel_period'],
  ['calc_rental', 'panel_period'],
  ['calc_tax', 'filing_hint'],
];

// A deadline written into a translation cannot carry a source or a read date, and it goes
// stale silently. These are the shapes the wrong ones took, in all six languages.
const DEADLINE_PROSE = [
  /deadline\s+(?:december|31)/i,
  /frist\s+31\.?\s*(?:desember|dezember)/i,
  /deadline\s+31\s+december/i,
  /échéance\s+31\s+décembre/i,
  /q4[\s-]?(?:deadline|frist|échéance)/i,
  /quarterly filings/i,
  /kvartalsvis\w*\s+leveringer/i,
  /kvartalsvisa inlämningar/i,
  /vierteljährliche einreichungen/i,
  /déclarations trimestrielles/i,
  /driemaandelijkse aangiften/i,
];

const walk = (obj, path = []) => {
  const out = [];
  for (const [k, v] of Object.entries(obj || {})) {
    if (v && typeof v === 'object') out.push(...walk(v, [...path, k]));
    else if (typeof v === 'string') out.push([[...path, k].join('.'), v]);
  }
  return out;
};

const keyCounts = {};
for (const loc of LOCALES) {
  const d = JSON.parse(readFileSync(`${loc}.json`, 'utf8'));

  for (const [sec, key] of BANNED_KEYS) {
    check(!(d[sec] && key in d[sec]),
      `${loc}.json: ${sec}.${key} is back. It carried a wrong filing deadline and nothing renders it. Deadlines come from rules/, not from a translation.`);
  }

  const leaves = walk(d);
  keyCounts[loc] = leaves.length;
  for (const [path, value] of leaves) {
    for (const re of DEADLINE_PROSE) {
      if (re.test(value)) {
        fail++; bad.push(`${loc}.json: ${path} states a filing deadline in prose: ${JSON.stringify(value.slice(0, 80))}`);
        break;
      }
    }
  }
}

// The six files have to stay the same shape as each other, or a locale silently loses a
// string and falls back to English without anybody noticing.
const sizes = [...new Set(Object.values(keyCounts))];
check(sizes.length === 1, `locale files disagree on key count: ${JSON.stringify(keyCounts)}`);

console.log(`locales: ${LOCALES.length} files, ${keyCounts.en} keys each`);
console.log(`\n${pass} passed, ${fail} failed`);
if (fail) { console.log(''); for (const b of bad.slice(0, 12)) console.log('  ' + b); process.exit(1); }
