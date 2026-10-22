#!/usr/bin/env node
// Merge drafted answers and their five translations into answers/answers.js.
//
//   node content/merge-answers.mjs <WORK>
//
// <WORK> holds answers_*.json (English drafts, { new: [{ slug, topic, tool, rules, q, a }] }) and
// tr_<lang>.json for no, sv, de, fr, nl ({ answers: { slug: { q, a } } }). Any answer missing a
// language stops the merge: nothing ships in fewer than six. Already present slugs are skipped.
// Run `npm test` afterwards; aeo_check and locale_check gate the result.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const WORK = process.argv[2];
if (!WORK) { console.error('usage: node content/merge-answers.mjs <work folder>'); process.exit(1); }
const L = ['no', 'sv', 'de', 'fr', 'nl'];
const tr = {};
for (const l of L) {
  tr[l] = {};
  for (const f of readdirSync(WORK).filter(f => new RegExp(`^tr\\d*_${l}\\.json$`).test(f))) {
    Object.assign(tr[l], JSON.parse(readFileSync(join(WORK, f), 'utf8')).answers);
  }
}
const file = join(ROOT, 'answers', 'answers.js');
let js = readFileSync(file, 'utf8');
const q = s => JSON.stringify(s);
const blocks = [];
for (const f of readdirSync(WORK).filter(f => /^answers_.*\.json$/.test(f))) {
  for (const x of JSON.parse(readFileSync(join(WORK, f), 'utf8')).new) {
    if (js.includes(`slug: '${x.slug}'`)) continue;
    for (const l of L) if (!tr[l][x.slug]) throw new Error(`${x.slug} has no ${l} translation`);
    const field = k => ['en', ...L].map(l => `    ${l}: ${q(l === 'en' ? x[k] : tr[l][x.slug][k])},`).join('\n');
    blocks.push(`{\n  slug: '${x.slug}',\n  topic: '${x.topic}',\n  tool: '${x.tool}',\n  rules: [${x.rules.map(r => `'${r}'`).join(', ')}],\n  q: {\n${field('q')}\n  },\n  a: {\n${field('a')}\n  },\n},`);
  }
}
const end = js.lastIndexOf('];');
writeFileSync(file, js.slice(0, end) + blocks.join('\n') + (blocks.length ? '\n' : '') + js.slice(end));
console.log(`merge-answers: ${blocks.length} answers added`);
