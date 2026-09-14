// The answers layer, checked the way the rest of this repo checks things.
//
// The point of the layer is that an answer engine can quote it and trust it. Both halves of
// that are testable: the answer has to rest on rules that are actually verified, and the page
// has to carry the question, the answer, the citation and the date in a shape a machine reads.
import { readFileSync, existsSync } from 'node:fs';
import { ANSWERS, ANSWER_LANGS } from './answers/answers.js';
import { checkRules, sourceOf, lastCheckedOf } from './answers/sources.js';

let pass = 0, fail = 0;
const ok = (n, c, x = '') => c ? pass++ : (fail++, console.log('FAIL', n, x));

const BANNED = /\b(Bueno|Sabadell|BBVA|CaixaBank|Santander|Revolut|Wise)\b/i;
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;

ok('there are answers', ANSWERS.length >= 20, String(ANSWERS.length));
ok('six languages', ANSWER_LANGS.length === 6);

const slugs = new Set();
for (const a of ANSWERS) {
  ok(`${a.slug}: the slug is unique`, !slugs.has(a.slug));
  slugs.add(a.slug);
  ok(`${a.slug}: the slug is a clean url`, /^[a-z0-9-]+$/.test(a.slug));
  ok(`${a.slug}: it points at a tool that exists`, existsSync(`./${a.tool}/index.jsx`), a.tool);

  // The whole promise of the layer.
  const problems = checkRules(a.rules);
  ok(`${a.slug}: every rule behind it is verified and sourced`, problems.length === 0, problems.join('; '));
  ok(`${a.slug}: it cites at least one rule`, (a.rules || []).length >= 1);
  ok(`${a.slug}: it has a date it was last checked`, !!lastCheckedOf(a.rules));
  for (const id of a.rules) {
    const s = sourceOf(id);
    ok(`${a.slug}: ${id} links to a primary source`, !!(s && /^https?:\/\//.test(s.url)), s ? s.url : 'missing');
  }

  for (const l of ANSWER_LANGS) {
    const q = a.q[l], ans = a.a[l];
    ok(`${a.slug}/${l}: the question is written`, !!q);
    ok(`${a.slug}/${l}: the answer is written`, !!ans);
    if (!q || !ans) continue;
    ok(`${a.slug}/${l}: the question is a question`, q.trim().endsWith('?'), q);
    // An answer engine lifts a passage, not an essay. Too short says nothing, too long is
    // summarised instead of quoted, and a summary loses the attribution.
    const words = ans.split(/\s+/).length;
    ok(`${a.slug}/${l}: the answer is quotable length`, words >= 35 && words <= 110, String(words));
    ok(`${a.slug}/${l}: no em or en dash`, !/[—–]/.test(q + ans));
    ok(`${a.slug}/${l}: no emoji`, !EMOJI.test(q + ans));
    ok(`${a.slug}/${l}: names no brand`, !BANNED.test(ans), (ans.match(BANNED) || [])[0] || '');
  }
}

// The built pages, if there is a build to look at.
if (existsSync('./dist/answers/index.html')) {
  const readPage = (p) => readFileSync(p, 'utf8');
  const jsonLd = (html) => [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)]
    .map(m => { try { return JSON.parse(m[1]); } catch { return null; } }).filter(Boolean);

  for (const a of ANSWERS) {
    for (const l of ANSWER_LANGS) {
      const path = l === 'en' ? `./dist/answers/${a.slug}/index.html` : `./dist/${l}/answers/${a.slug}/index.html`;
      ok(`${a.slug}/${l}: the page was built`, existsSync(path), path);
      if (!existsSync(path)) continue;
      const html = readPage(path);
      const types = jsonLd(html).map(b => b['@type']);

      ok(`${a.slug}/${l}: the title is the question`,
         (html.match(/<title>(.*?)<\/title>/s) || [])[1] === a.q[l].replace(/&/g, '&amp;'));
      ok(`${a.slug}/${l}: the answer is in the static html`, html.includes(a.a[l].slice(0, 60).replace(/&/g, '&amp;')));
      ok(`${a.slug}/${l}: it carries FAQPage schema`, types.includes('FAQPage'), types.join(','));
      ok(`${a.slug}/${l}: it carries a dated Article`, types.includes('Article'));
      ok(`${a.slug}/${l}: it names its publisher`, types.includes('Organization'));
      ok(`${a.slug}/${l}: it is indexable`, /content="index, follow/.test(html));

      const article = jsonLd(html).find(b => b['@type'] === 'Article');
      ok(`${a.slug}/${l}: the article is dated`, !!article?.dateModified);
      ok(`${a.slug}/${l}: the article cites its sources`, Array.isArray(article?.citation) && article.citation.length >= 1);
      ok(`${a.slug}/${l}: every citation carries a url`,
         (article?.citation || []).every(c => /^https?:\/\//.test(c.url || '')));
    }
  }

  for (const f of ['./dist/llms.txt', './dist/llms-full.txt']) {
    ok(`${f} was written`, existsSync(f));
    if (!existsSync(f)) continue;
    const t = readPage(f);
    ok(`${f} lists every answer`, ANSWERS.every(a => t.includes(a.slug) || t.includes(a.q.en)));
    ok(`${f} names no brand`, !BANNED.test(t), (t.match(BANNED) || [])[0] || '');
    ok(`${f} has no em or en dash`, !/[—–]/.test(t));
  }
  ok('llms-full carries the answers themselves',
     ANSWERS.every(a => readPage('./dist/llms-full.txt').includes(a.a.en.slice(0, 50))));
} else {
  console.log('(no build to inspect, run npm run build for the page level checks)');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
