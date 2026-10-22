// The guides, checked the way the answers are.
//
// A guide is long, so the risk is different: a figure slipping in that no rule supports, one
// language drifting out of step with the others, or a title too long to show. The first is
// prevented by writing guides only from verified rules and listing them; the rest is tested.
import { GUIDES } from './guides/index.js';
import { checkRules } from './answers/sources.js';
import { ANSWERS } from './answers/answers.js';
import { existsSync } from 'node:fs';

const LANGS = ['en', 'no', 'sv', 'de', 'fr', 'nl'];
const TOPICS = ['tax', 'selling', 'buying', 'letting', 'community', 'home', 'insurance', 'legal-claims', 'inheritance', 'residency'];
const BANNED = /\b(Bueno|Sabadell|BBVA|CaixaBank|Santander|Revolut|Wise)\b/i;
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;
let pass = 0, fail = 0;
const ok = (n, c, x = '') => c ? pass++ : (fail++, console.log('FAIL', n, x));
const words = s => s.split(/\s+/).filter(Boolean).length;

const slugs = new Set();
for (const g of GUIDES) {
  ok(`${g.slug}: unique slug`, !slugs.has(g.slug)); slugs.add(g.slug);
  ok(`${g.slug}: clean slug`, /^[a-z0-9-]+$/.test(g.slug));
  ok(`${g.slug}: topic`, TOPICS.includes(g.topic), g.topic);
  ok(`${g.slug}: tool exists`, existsSync(`./${g.tool}/index.jsx`), g.tool);
  const probs = checkRules(g.rules || []);
  ok(`${g.slug}: every rule verified and sourced`, probs.length === 0, probs.join('; '));
  ok(`${g.slug}: cites rules`, (g.rules || []).length >= 2);
  for (const s of g.answers || []) ok(`${g.slug}: linked answer ${s} exists`, ANSWERS.some(a => a.slug === s));
  const en = g.i18n?.en;
  for (const l of LANGS) {
    const c = g.i18n?.[l];
    ok(`${g.slug}/${l}: written`, !!c);
    if (!c) continue;
    for (const f of ['title', 'description', 'h1', 'lead']) ok(`${g.slug}/${l}: has ${f}`, !!c[f]);
    ok(`${g.slug}/${l}: title 20 to 65 characters`, c.title.length >= 20 && c.title.length <= 65, `${c.title.length} ${c.title}`);
    ok(`${g.slug}/${l}: title differs from h1`, c.title !== c.h1);
    ok(`${g.slug}/${l}: description up to 155`, c.description.length <= 155 && c.description.length >= 70, String(c.description.length));
    ok(`${g.slug}/${l}: same number of sections as English`, (c.sections || []).length === (en.sections || []).length);
    (c.sections || []).forEach((sec, i) => ok(`${g.slug}/${l}: section ${i} has paragraphs like English`, sec.h2 && sec.paras?.length === en.sections[i].paras.length));
    const text = [c.title, c.description, c.h1, c.lead, ...(c.sections || []).flatMap(s => [s.h2, ...s.paras])].join(' ');
    if (l === 'en') ok(`${g.slug}: English runs 600 words or more`, words(text) >= 600, String(words(text)));
    ok(`${g.slug}/${l}: no em or en dash`, !/[—–]/.test(text));
    ok(`${g.slug}/${l}: no emoji`, !EMOJI.test(text));
    ok(`${g.slug}/${l}: names no brand`, !BANNED.test(text), (text.match(BANNED) || [])[0] || '');
  }
}
console.log(`guide_check: ${GUIDES.length} guides, ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
