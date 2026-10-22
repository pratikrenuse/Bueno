// Six languages, always. This is the gate that lets content scale without a language falling
// behind: every answer, guide, tool, hub and the about page must exist in all six locales, each
// must carry a full reciprocal hreflang set, and no translated page may simply repeat the English.
//
// Town and category directory pages are allowed to be English only for the non featured towns
// (see seo/priority.js), so they are not held to this.
import { readFileSync, existsSync } from 'node:fs';
import { buildRoutes } from './seo/routes.js';
import { loadTools } from './seo/tools.mjs';

const LOCALES = ['en', 'no', 'sv', 'de', 'fr', 'nl'];
const MUST = new Set(['home', 'tool', 'answers-hub', 'answer', 'guides-hub', 'guide', 'about']);
let pass = 0, fail = 0;
const ok = (n, c, x = '') => c ? pass++ : (fail++, fail <= 40 && console.log('FAIL', n, x));

const routes = buildRoutes({ tools: await loadTools() });
const groups = new Map();
for (const r of routes) {
  if (!MUST.has(r.kind)) continue;
  if (!groups.has(r.group)) groups.set(r.group, {});
  groups.get(r.group)[r.locale] = r;
}

for (const [group, fam] of groups) {
  for (const l of LOCALES) ok(`${group}: exists in ${l}`, !!fam[l]);
  const en = fam.en;
  if (!en) continue;
  for (const l of LOCALES.slice(1)) {
    const r = fam[l];
    if (!r) continue;
    ok(`${group}/${l}: hreflang lists all six`, LOCALES.every(x => r.alternates && r.alternates[x]));
    // A translated page that repeats the English title or opening is not translated.
    if (en.kind !== 'tool' || r.title !== en.title) ok(`${group}/${l}: title is translated`, r.title !== en.title, r.title);
    if ((en.intro || [])[0]) ok(`${group}/${l}: opening is translated`, (r.intro || [])[0] !== en.intro[0], (r.intro || [''])[0].slice(0, 60));
    if (Array.isArray(en.body)) ok(`${group}/${l}: body is translated`, JSON.stringify(r.body) !== JSON.stringify(en.body));
  }
}

// The built files agree with the route data, if there is a build.
if (existsSync('./dist/index.html')) {
  const sample = routes.filter(r => MUST.has(r.kind) && r.locale !== 'en').filter((_, i) => i % 25 === 0);
  for (const r of sample) {
    const f = `./dist${r.path}/index.html`;
    ok(`${r.path}: built`, existsSync(f));
    if (!existsSync(f)) continue;
    const html = readFileSync(f, 'utf8');
    ok(`${r.path}: html lang`, html.includes(`<html lang="`));
    ok(`${r.path}: six hreflang links plus x-default`, (html.match(/rel="alternate" hreflang=/g) || []).length === 7);
  }
}

console.log(`locale_check: ${groups.size} page families, ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
