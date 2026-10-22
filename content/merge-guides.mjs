#!/usr/bin/env node
// Merge guide translations into guides/<slug>.json.
//
//   node content/merge-guides.mjs <WORK>/gtr
//
// The folder holds <lang>/<slug>.json for no, sv, de, fr, nl, each the translated
// { title, description, h1, lead, sections } object. A guide only publishes once all six
// languages are present (seo/routes.js), and guide_check and locale_check gate the result.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = process.argv[2];
if (!DIR) { console.error('usage: node content/merge-guides.mjs <folder with no/ sv/ de/ fr/ nl/>'); process.exit(1); }
const L = ['no', 'sv', 'de', 'fr', 'nl'];
let merged = 0, missing = 0;
for (const f of readdirSync(join(ROOT, 'guides')).filter(f => f.endsWith('.json'))) {
  const p = join(ROOT, 'guides', f);
  const g = JSON.parse(readFileSync(p, 'utf8'));
  let changed = false;
  for (const l of L) {
    const t = join(DIR, l, f);
    if (existsSync(t)) { g.i18n[l] = JSON.parse(readFileSync(t, 'utf8')); changed = true; }
    else if (!g.i18n[l]) { missing++; console.log(`missing ${l} for ${f}`); }
  }
  if (changed) { writeFileSync(p, JSON.stringify(g, null, 2) + '\n'); merged++; }
}
console.log(`merge-guides: ${merged} guides updated, ${missing} translations still missing`);
