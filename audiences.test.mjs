#!/usr/bin/env node
// Guards on the audience split and the professional tools.
//
// What has to hold:
//   1. Every tool that existed before the split is still an owner tool, so the owner home
//      page lists exactly what it listed before.
//   2. No professional tool or hub leaks onto the owner grid.
//   3. The internal decks are untouched by the split: they have no meta.js and nothing in the
//      new code imports them.
//   4. Every piece of new copy exists in every language it promises, with no em dashes, no
//      emoji and no placeholder left unfilled.
//   5. The checklist and the pack take every legal figure from the rules base and get the
//      dates right.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { AUDIENCES, AUDIENCE_LABELS, audiencesOf, isForAudience, HUB_GROUP } from './audiences.js';
import { buildDeal, computeDates } from './deal-checklist/list.js';
import { buildLetter, LETTER_LANGS } from './deal-checklist/letter.js';
import { analyse, median, PACK, PACK_LANGS, fill, fmtEUR } from './seller-pack/pack.js';
import { TOOL_COPY, LOCALES } from './seo/copy.js';

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => (cond ? pass++ : (fail++, console.log('FAIL', name, extra)));
const eq = (name, got, want) => ok(name, JSON.stringify(got) === JSON.stringify(want), `got ${JSON.stringify(got)} want ${JSON.stringify(want)}`);

const DASH = /[–—]/;
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const clean = (name, s) => {
  ok(`${name}: no em or en dash`, !DASH.test(s), s);
  ok(`${name}: no emoji`, !EMOJI.test(s), s);
  ok(`${name}: no unfilled placeholder`, !/\{\w+\}/.test(s), s);
};

// --- 1-3. the split ------------------------------------------------------------------
const PRO_FOLDERS = ['for-agents', 'for-lawyers', 'deal-checklist', 'seller-pack', 'aml-file', 'poa-planner'];
// New tools that also serve owners, so they appear on the owner grid on purpose.
const SHARED_NEW = ['purchase-costs', 'inheritance-roadmap'];
const INTERNAL = ['internal', 'internal-linkedin', 'internal-pratik'];
const SKIP = new Set(['node_modules', 'dist', 'public', 'src', 'api', 'seo', 'studio', 'rules', 'answers']);

const folders = readdirSync('.').filter(n => !n.startsWith('.') && !SKIP.has(n) && statSync(n).isDirectory());
const metas = {};
for (const f of folders) {
  if (existsSync(`${f}/meta.js`)) metas[f] = (await import(pathToFileURL(`${f}/meta.js`).href)).default;
}

for (const [f, m] of Object.entries(metas)) {
  if (PRO_FOLDERS.includes(f)) {
    ok(`${f}: is not an owner tool`, !isForAudience(m, 'owners'));
    ok(`${f}: names its audience`, Array.isArray(m.audiences) && m.audiences.length > 0);
    ok(`${f}: has static page copy`, !!TOOL_COPY[f]);
    for (const l of LOCALES) ok(`${f}: static copy in ${l}`, !!TOOL_COPY[f]?.[l]?.h1 && !!TOOL_COPY[f]?.[l]?.lead);
  } else if (SHARED_NEW.includes(f)) {
    ok(`${f}: serves owners`, isForAudience(m, 'owners'));
    ok(`${f}: serves a professional audience too`, m.audiences.some(x => x !== 'owners'));
    for (const l of LOCALES) ok(`${f}: static copy in ${l}`, !!TOOL_COPY[f]?.[l]?.h1 && !!TOOL_COPY[f]?.[l]?.lead);
  } else {
    ok(`${f}: an existing tool is still an owner tool`, isForAudience(m, 'owners'));
    ok(`${f}: an existing tool was not given an audiences field`, m.audiences === undefined);
  }
}
ok('both hubs are hub pages', metas['for-agents']?.group === HUB_GROUP && metas['for-lawyers']?.group === HUB_GROUP);
ok('a hub is never listed as a tool, even for its own audience', !isForAudience(metas['for-agents'], 'agents'));
eq('a tool with no field defaults to owners', audiencesOf({}), ['owners']);
eq('an unknown audience is ignored', audiencesOf({ audiences: ['martians'] }), ['owners']);
eq('the three sections', AUDIENCES.map(a => a.path), ['/', '/for-agents', '/for-lawyers']);
for (const a of AUDIENCES.filter(x => x.key !== 'owners')) {
  ok(`${a.key}: the hub folder exists`, existsSync(`.${a.path}/index.jsx`));
}

for (const f of INTERNAL) {
  ok(`${f}: still has no meta.js, so it is on no grid and in no sitemap`, !existsSync(`${f}/meta.js`));
}
const NEW_FILES = [
  'audiences.js', 'AudienceSwitch.jsx', 'AudienceHub.jsx', 'BrandProfile.jsx',
  ...[...PRO_FOLDERS, ...SHARED_NEW].flatMap(f => readdirSync(f).map(x => `${f}/${x}`)),
];
for (const p of NEW_FILES) {
  const src = readFileSync(p, 'utf8');
  ok(`${p}: imports nothing from the internal decks or the api`, !/from\s+['"][^'"]*(internal|\/api\/)/.test(src));
  ok(`${p}: no em or en dash anywhere`, !DASH.test(src));
}

// --- 4. copy parity -------------------------------------------------------------------
const keysOf = o => Object.keys(o).sort().join(',');
for (const l of LOCALES) {
  eq(`audience labels ${l}: same keys as English`, keysOf(AUDIENCE_LABELS[l]), keysOf(AUDIENCE_LABELS.en));
}
for (const [name, path] of [['agents hub', './for-agents/copy.js'], ['lawyers hub', './for-lawyers/copy.js'], ['checklist screens', './deal-checklist/copy.js'], ['pack screens', './seller-pack/copy.js'], ['costs screens', './purchase-costs/copy.js'], ['inheritance screens', './inheritance-roadmap/copy.js'], ['aml screens', './aml-file/copy.js'], ['poa screens', './poa-planner/copy.js']]) {
  const dict = (await import(path)).default;
  for (const l of LOCALES) {
    ok(`${name} ${l}: exists`, !!dict[l]);
    eq(`${name} ${l}: same keys as English`, keysOf(dict[l] || {}), keysOf(dict.en));
    for (const [k, v] of Object.entries(dict[l] || {})) {
      const s = Array.isArray(v) ? v.join(' ') : (v && typeof v === 'object') ? Object.values(v).join(' ') : String(v);
      ok(`${name} ${l}.${k}: no dash`, !DASH.test(s), s);
      ok(`${name} ${l}.${k}: never calls Bueno a bank`, !/Bueno[^.]*\bbank/i.test(s), s);
    }
  }
}
for (const l of PACK_LANGS) {
  eq(`pack ${l}: same keys as English`, keysOf(PACK[l]), keysOf(PACK.en));
}

// --- 5. figures and dates ----------------------------------------------------------------
const rulesOf = f => JSON.parse(readFileSync(`rules/${f}.json`, 'utf8')).rules;
const byId = Object.fromEntries(['irnr', 'deadlines', 'plusvalia', 'vat-igic'].flatMap(rulesOf).map(r => [r.id, r]));
const R = {
  retentionRate: byId['irnr.sale.retention'].value.rate,
  retentionMonths: byId['irnr.sale.retention'].value.deadline_months,
  saleOpensMonths: byId['deadline.210.sale'].value.opens_months_after,
  saleWindowMonths: byId['deadline.210.sale'].value.window_months,
  plusvaliaWorkingDays: byId['plusvalia.deadlines'].value.sale_working_days,
  ivaNewBuild: byId['vat.newbuild.mainland'].value,
  igicGeneral: byId['igic.canarias'].value.general,
};
for (const [k, v] of Object.entries(R)) ok(`rule value ${k} is a number`, typeof v === 'number' && v > 0, String(v));

// Month deadlines run date to date, and 31 January plus one month is the last day of February.
// 31 January 2026 is a Saturday: February has 20 working days and March reaches 30 on the 13th.
eq('dates from 31 January', computeDates('2026-01-31', R), {
  completion: '2026-01-31', d211: '2026-02-28', open210: '2026-02-28', close210: '2026-05-31', pv: '2026-03-13',
});
eq('no date, no dates', computeDates('', R), null);
eq('a nonsense date gives no dates', computeDates('2026-02-30', R), null);

const base = { side: 'both', seller: 'nonresident', buyer: 'nonresident', property: 'resale', region: '', finance: 'cash', nie: 'yes', account: 'yes', signing: 'person', completion: '2026-01-31' };
const all = d => d.groups.flatMap(g => g.items.map(i => i.text)).join('\n');

let d = buildDeal(base, R, 'en');
ok('non-resident seller: the retention is on the list at the rules rate', all(d).includes(`${R.retentionRate} percent`));
ok('non-resident seller: the 211 date is printed', all(d).includes('2026-02-28'));
ok('non-resident seller: the 210 window is printed', all(d).includes('between 2026-02-28 and 2026-05-31'));
ok('every retention item cites its rule', d.groups.flatMap(g => g.items).filter(i => /retention|withholds/.test(i.text)).every(i => i.rule === 'irnr.sale.retention'));
ok('nothing is missing when everything is known', d.missing.length === 0, d.missing.join(' | '));
ok('resale: transfer tax, not IVA', /ITP/.test(all(d)) && !/IVA/.test(all(d)));

d = buildDeal({ ...base, seller: 'resident' }, R, 'en');
ok('resident seller: no retention and no Modelo 211', !/211|withhold|retention/i.test(all(d)));

d = buildDeal({ ...base, side: 'seller', nie: '', account: '' }, R, 'en');
ok('seller side: no buyer NIE task', !/NIE/.test(all(d)));

d = buildDeal({ ...base, property: 'newbuild', region: 'canarias' }, R, 'en');
ok('Canary new build: IGIC at the general rate', all(d).includes(`${R.igicGeneral} percent`) && /IGIC/.test(all(d)));
ok('Canary new build: never IVA as the tax', !/pays IVA/.test(all(d)));
d = buildDeal({ ...base, property: 'newbuild', region: 'mainland' }, R, 'en');
ok('mainland new build: IVA at the rules rate', all(d).includes(`IVA at ${R.ivaNewBuild} percent`));

d = buildDeal({ ...base, seller: 'unsure', buyer: 'unsure', finance: 'undecided', nie: 'unsure', signing: 'undecided', completion: '' }, R, 'en');
eq('missing facts are all listed', d.missing.length, 6);
ok('an unsure seller is treated as non-resident for safety', /retention/.test(all(d)));
ok('without a date the 210 window is described in months', all(d).includes(`between ${R.saleOpensMonths} and ${R.saleOpensMonths + R.saleWindowMonths} months`));

d = buildDeal(base, R, 'es');
ok('Spanish checklist is Spanish', /Antes de la reserva/.test(d.groups[0].title) && /retención/.test(all(d)));

// Every combination of answers, in both checklist languages and all seven letter languages.
const V = {
  side: ['buyer', 'seller', 'both'], seller: ['resident', 'nonresident', 'unsure'], buyer: ['resident', 'nonresident', 'unsure'],
  property: ['resale', 'newbuild'], region: ['mainland', 'canarias'], finance: ['cash', 'mortgage', 'undecided'],
  nie: ['yes', 'no', 'unsure'], signing: ['person', 'poa', 'undecided'], completion: ['', '2026-10-30'], recipient: ['buyer', 'seller'],
};
let combos = 0;
const walk = (keys, acc) => {
  if (!keys.length) {
    combos++;
    const a = { ...acc, account: acc.nie };
    for (const lang of ['en', 'es']) {
      const r = buildDeal(a, R, lang);
      const text = all(r) + r.missing.join(' ');
      if (DASH.test(text) || /\{\w+\}/.test(text) || r.groups.length < 4) {
        ok(`deal ${lang} ${JSON.stringify(a)}`, false, text.slice(0, 200));
      } else pass++;
      if (lang === 'en') {
        for (const ll of LETTER_LANGS) {
          const L = buildLetter(a, R, ll, r.dates, x => x);
          const t = [L.greeting, ...L.paragraphs, L.note, L.regards].join(' ');
          if (DASH.test(t) || /\{\w+\}/.test(t) || L.paragraphs.length < 3) ok(`letter ${ll} ${JSON.stringify(a)}`, false, t.slice(0, 200));
          else pass++;
        }
      }
    }
    return;
  }
  const [k, ...rest] = keys;
  for (const v of V[k]) walk(rest, { ...acc, [k]: v });
};
walk(Object.keys(V), {});
ok('every combination was checked', combos === 3 * 3 * 3 * 2 * 2 * 3 * 3 * 3 * 2 * 2, String(combos));

const L1 = buildLetter({ ...base, side: 'seller', clientName: 'Anne' }, R, 'no', computeDates('2026-01-31', R), x => x);
ok('a seller letter names the retention in the client language', L1.paragraphs.some(p => p.includes(`${R.retentionRate} prosent`)));
ok('a named client is greeted by name', L1.greeting.includes('Anne'));
const L2 = buildLetter({ ...base, side: 'buyer', nie: 'no' }, R, 'de', null, x => x);
ok('a buyer without an NIE is told to start it', L2.paragraphs.some(p => /NIE/.test(p)));
ok('an unnamed client gets a neutral greeting', L2.greeting === 'Guten Tag,');

// --- the pack --------------------------------------------------------------------------
eq('median of an odd list', median([3, 1, 2]), 2);
eq('median of an even list', median([4, 1, 2, 3]), 2.5);
eq('median of nothing', median([]), null);

const pk = analyse({
  area: 100, price: 300000, low: 280000, high: 260000,
  comps: [
    { label: 'A', status: 'asking', price: 320000, area: 105 },
    { label: 'B', status: 'sold', price: 250000, area: 95 },
    { label: 'C', status: 'sold', price: 270000, area: 140 },
    { label: '', price: '' },
  ],
});
eq('empty comparable rows are dropped', pk.rows.length, 3);
eq('price per m2 is rounded', pk.rows.map(r => r.ppm), [3048, 2632, 1929]);
eq('asking and sold are kept apart', [pk.medAsking, pk.medSold], [3048, 2281]);
eq('a reversed range is put the right way round', [pk.low, pk.high], [260000, 280000]);
eq('the hoped price per m2', pk.subjectPpm, 3000);
eq('position within the comparables', pk.position, 'within');
eq('difference from the sold median', pk.vsSold, 32);
ok('a comparable a quarter bigger is flagged', pk.rows[2].sizeGap && !pk.rows[0].sizeGap);
eq('English thousands are read as thousands', analyse({ area: 100, price: '250,000', comps: [] }).hoped, 250000);
eq('Spanish thousands are read as thousands', analyse({ area: 100, price: '250.000', comps: [] }).hoped, 250000);
eq('a decimal area is kept', analyse({ area: '85,5', price: 1, comps: [] }).subjectArea, 85.5);
eq('one comparable gives no position', analyse({ area: 100, price: 1, comps: [{ price: 5, area: 1 }] }).position, null);
eq('no area, no price per m2', analyse({ area: '', price: 300000, comps: [] }).subjectPpm, null);
ok('the euro sign comes first in every language', PACK_LANGS.every(l => fmtEUR(l, 285000).startsWith('€')));
for (const l of PACK_LANGS) {
  for (const [k, v] of Object.entries(PACK[l])) {
    clean(`pack ${l}.${k}`, fill(v, { name: 'X', date: 'X', x: 'X', p: 'X', n: 1, lo: 'X', hi: 'X', a: 'X', b: 'X', ret: 3, url: 'X' }));
  }
}

console.log(`audiences: ${combos} answer combinations checked`);
console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
