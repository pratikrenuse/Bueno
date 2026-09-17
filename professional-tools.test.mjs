#!/usr/bin/env node
// Guards on the four professional tools added after the audience split:
// purchase-costs, inheritance-roadmap, aml-file and poa-planner.
//
// Every figure is read from the rules JSON exactly as the pages read it, the arithmetic is
// checked against published worked figures, and every combination of answers is rendered
// in every language to prove no placeholder, dash or missing string reaches a page.

import { readFileSync } from 'node:fs';
import { bandedTax, computeCosts } from './purchase-costs/costs.js';
import { H, HANDOUT_LANGS, fill as hfill } from './purchase-costs/handout.js';
import { buildRoadmap, lawOutcome, taxOutcome } from './inheritance-roadmap/roadmap.js';
import { buildHeirLetter, HEIR_LETTER } from './inheritance-roadmap/letter.js';
import { assess, inScope, DOC, FLAG_KEYS, FUNDS_KEYS, PAYMENT_KEYS, fill as afill } from './aml-file/aml.js';
import { buildPlan, buildPoaLetter, route, POA_LETTER, COUNTRY_KEYS, PURPOSE_KEYS } from './poa-planner/plan.js';

let pass = 0, fail = 0;
const ok = (n, c, x = '') => (c ? pass++ : (fail++, console.log('FAIL', n, x)));
const eq = (n, got, want) => ok(n, JSON.stringify(got) === JSON.stringify(want), `got ${JSON.stringify(got)} want ${JSON.stringify(want)}`);
const DASH = /[–—]/;
const clean = (n, s) => { if (DASH.test(s) || /\{\w+\}/.test(s) || /undefined|null/.test(s)) ok(n, false, s.slice(0, 160)); else pass++; };
const keys = o => Object.keys(o).sort().join(',');

const J = f => JSON.parse(readFileSync(`rules/${f}.json`, 'utf8'));
const itp = J('itp-ajd');
const byId = Object.fromEntries(['irnr', 'deadlines', 'plusvalia', 'vat-igic', 'succession', 'professional'].flatMap(f => J(f).rules).map(r => [r.id, r]));

// --- purchase costs ----------------------------------------------------------------------
const T = { itp: itp.itp_resale, ajd: itp.ajd_new_build, iva: byId['vat.newbuild.mainland'].value, igic: byId['igic.canarias'].value.general };
const band = r => itp.itp_resale.find(x => x.region === r).bands;

// Catalonia: Decreto-ley 5/2025 gives a cumulative cuota of 60,000 at 600,000 and 93,000 at 900,000.
eq('Catalonia at 600,000 matches the published cuota', bandedTax(600000, band('Catalunya')), 60000);
eq('Catalonia at 900,000 matches the published cuota', bandedTax(900000, band('Catalunya')), 93000);
eq('Catalonia at 1,500,000 matches the published cuota', bandedTax(1500000, band('Catalunya')), 165000);
eq('Catalonia at 800,000 is taxed by slice', bandedTax(800000, band('Catalunya')), 82000);
eq('Balearics at 500,000 is taxed by slice', bandedTax(500000, band('Illes Balears')), 41000);
eq('Balearics at 2,000,000 matches the next band’s cuota', bandedTax(2000000, band('Illes Balears')), 210000);
eq('Aragon exactly at a band edge stays in the lower band', bandedTax(400000, band('Aragon')), 32000);
eq('Aragon one euro over the edge', bandedTax(400001, band('Aragon')), 32000.09);
eq('Castilla y Leon by slice', bandedTax(300000, band('Castilla y Leon')), 25000);
eq('Extremadura by slice', bandedTax(700000, band('Extremadura')), 28800 + 24000 + 11000);

const costs = (region, kind, price) => computeCosts({ region, kind, price }, T);
eq('a flat region', costs('Andalucia', 'resale', 300000).total, 300000 * itp.itp_resale.find(x => x.region === 'Andalucia').general / 100);
for (const r of itp.itp_resale.filter(x => x.status === 'unverified')) {
  eq(`${r.region}: no rate is invented`, costs(r.region, 'resale', 250000).gaps, ['itp']);
}
eq('Valencia above a million says nothing', costs('Comunitat Valenciana', 'resale', 1200000).gaps, ['itp_valencia_high']);
ok('Valencia below a million is computed with its caveat', costs('Comunitat Valenciana', 'resale', 300000).caveats.length === 1);
eq('Canary new build pays IGIC, not IVA', costs('Canarias', 'newbuild', 100000).lines.map(l => l.key), ['igic', 'ajd']);
eq('Ceuta new build has no IVA line', costs('Ceuta', 'newbuild', 100000).gaps, ['vat_ceuta_melilla']);
for (const r of itp.ajd_new_build.filter(x => x.status === 'unverified')) {
  const region = { Asturias: 'Principado de Asturias', Navarra: 'Comunidad Foral de Navarra' }[r.region] || r.region;
  ok(`${region}: no stamp duty invented`, costs(region, 'newbuild', 200000).gaps.includes('ajd'));
}
eq('no price, no lines', costs('Madrid', 'resale', 0).lines, []);
for (const l of HANDOUT_LANGS) {
  eq(`handout ${l}: same keys as English`, keys(H[l]), keys(H.en));
  for (const [k, v] of Object.entries(H[l])) clean(`handout ${l}.${k}`, hfill(Array.isArray(v) ? v.join(' ') : v, { name: 'X', kind: 'X', price: 'X', region: 'X', r: 1, e: 1 }));
}

// --- inheritance ------------------------------------------------------------------------
const R = {
  isdMonths: byId['isd.deadlines'].value.death_months,
  isdExtension: byId['isd.deadlines'].value.extension_months,
  pvMonths: byId['plusvalia.deadlines'].value.death_months,
  pvExtendTo: byId['plusvalia.deadlines'].value.extension_to_months,
  stateBottom: byId['isd.state_scale'].value.bottom,
  stateTop: byId['isd.state_scale'].value.top,
  foral: byId['succession.foral'].value,
};
eq('a chosen nationality law wins', lawOutcome({ choice: 'yes', nationality: 'other', residence: 'spain' }), 'nationality');
eq('no choice, lived abroad', lawOutcome({ choice: 'no', nationality: 'other', residence: 'abroad' }), 'residence_abroad');
eq('no choice, lived in Spain', lawOutcome({ choice: 'nowill', nationality: 'other', residence: 'spain' }), 'spanish');
eq('a Spanish national cannot choose a foreign law here', lawOutcome({ choice: 'yes', nationality: 'spanish', residence: 'abroad' }), 'residence_abroad');
eq('non-resident heirs of a resident', taxOutcome({ heirs: 'abroad', residence: 'spain' }), 'nonres_heirs_resident_deceased');
eq('non-resident heirs of a non-resident', taxOutcome({ heirs: 'mixed', residence: 'abroad' }), 'nonres_heirs_nonresident_deceased');
eq('resident heirs', taxOutcome({ heirs: 'spain', residence: 'abroad' }), 'resident_heirs');
const road = buildRoadmap({ residence: 'abroad', choice: 'no', nationality: 'other', heirs: 'abroad', assetsRegion: 'Madrid', married: 'yes', death: '2026-03-31' }, R);
eq('inheritance tax falls due on the date that follows', road.dates.isdDue, '2026-09-30');
ok('the region is named in the tax answer', road.sections[1].lines[0].includes('Madrid'));
ok('Spanish forced heirship is not claimed when a foreign law governs', !road.sections[0].lines.some(l => /two thirds/.test(l)));
ok('the community property warning shows for a married deceased', road.sections[0].lines.some(l => /community property/.test(l)));
const roadEs = buildRoadmap({ residence: 'spain', deceasedRegion: 'Andalucia', choice: 'no', nationality: 'spanish', heirs: 'spain', married: 'no' }, R, 'es');
ok('Spanish law brings the foral warning and the legitima', roadEs.sections[0].lines.some(l => /vecindad civil/.test(l)) && roadEs.sections[0].lines.some(l => /dos tercios/.test(l)));
for (const l of Object.keys(HEIR_LETTER)) eq(`heir letter ${l}: same keys as English`, keys(HEIR_LETTER[l]), keys(HEIR_LETTER.en));

let n = 0;
for (const residence of ['spain', 'abroad']) for (const nationality of ['spanish', 'other']) for (const choice of ['yes', 'no', 'nowill', 'unsure'])
for (const heirs of ['spain', 'abroad', 'mixed']) for (const married of ['yes', 'no']) for (const death of ['', '2026-08-31']) for (const region of ['', 'Catalunya']) {
  const a = { residence, nationality, choice: nationality === 'spanish' ? 'no' : choice, heirs, married, death, deceasedRegion: region, assetsRegion: region, clientName: n % 2 ? 'Anna' : '' };
  for (const lang of ['en', 'es']) {
    const r = buildRoadmap(a, R, lang, x => x, x => x);
    clean(`roadmap ${lang} ${JSON.stringify(a)}`, [...r.sections.flatMap(s => [s.title, ...s.lines]), ...r.docs.map(d => d.text + d.who.join(''))].join(' '));
    ok('roadmap has documents', r.docs.length >= 8);
    if (lang === 'en') for (const ll of Object.keys(HEIR_LETTER)) {
      const L = buildHeirLetter(a, R, r, ll, x => x, x => x);
      clean(`heir letter ${ll}`, [L.greeting, ...L.paragraphs, L.note, L.regards].join(' '));
    }
  }
  n++;
}
ok('every inheritance combination was checked', n === 2 * 2 * 4 * 3 * 2 * 2 * 2, String(n));

// --- anti-money-laundering file -----------------------------------------------------------
const scope = byId['aml.obliged_agents'].value;
const AR = { leaseMonthly: scope.lease_monthly_eur, leaseAnnual: scope.lease_annual_eur };
ok('a sale is always in scope', inScope({ op: 'sale' }, AR));
ok('a lease at the monthly threshold is in scope', inScope({ op: 'lease', rent: scope.lease_monthly_eur }, AR));
ok('a lease one euro below is not', !inScope({ op: 'lease', rent: scope.lease_monthly_eur - 1 }, AR));
const good = { op: 'sale', clientType: 'person', idChecked: 'yes', pep: 'no', fundsEvidence: 'yes', payment: 'es_bank', flags: [] };
eq('a clean file', assess(good, AR).verdict, 'standard');
eq('no identification stops it', assess({ ...good, idChecked: 'no' }, AR).verdict, 'stop');
eq('a company without its owners stops it', assess({ ...good, clientType: 'company', bo: 'no' }, AR).stops, ['stop_bo']);
eq('a politically exposed client needs enhanced review', assess({ ...good, pep: 'yes' }, AR).verdict, 'enhanced');
eq('cash needs enhanced review', assess({ ...good, payment: 'cash' }, AR).reasons, ['why_pay_cash']);
eq('a warning sign needs enhanced review', assess({ ...good, flags: ['urgency'] }, AR).verdict, 'enhanced');
eq('a small lease is out of scope', assess({ ...good, op: 'lease', rent: 900 }, AR).verdict, 'out_of_scope');
eq('record en and es have the same keys', keys(DOC.es), keys(DOC.en));
for (const l of ['en', 'es']) {
  for (const k of [...FLAG_KEYS.map(x => `flag_${x}`), ...FUNDS_KEYS.map(x => `funds_${x}`), ...PAYMENT_KEYS.map(x => `pay_${x}`)]) ok(`record ${l} has ${k}`, !!DOC[l][k]);
  for (const [k, v] of Object.entries(DOC[l])) clean(`record ${l}.${k}`, afill(v, { bo: 25, years: 10 }));
}
for (const op of ['sale', 'lease']) for (const idChecked of ['yes', 'no']) for (const clientType of ['person', 'company']) for (const bo of ['yes', 'no'])
for (const pep of ['yes', 'no', 'unknown']) for (const fundsEvidence of ['yes', 'no']) for (const payment of PAYMENT_KEYS) {
  const v = assess({ op, rent: 20000, idChecked, clientType, bo, pep, fundsEvidence, payment, flags: [] }, AR);
  ok('every verdict has record text', !!DOC.en[`v_${v.verdict}`] && v.stops.every(s => DOC.en[s]) && v.reasons.every(s => DOC.en[s]));
}

// --- power of attorney ----------------------------------------------------------------------
const PR = { apostille: byId['poa.apostille_parties'].value };
eq('consulate first when the client can get there', route({ consulate: 'yes', country: 'Norway' }, PR), 'consular');
eq('Norway is an Apostille party', route({ consulate: 'no', country: 'Norway' }, PR), 'notary_apostille');
eq('an unlisted country is flagged', route({ consulate: 'no', country: 'other' }, PR), 'notary_check');
for (const k of COUNTRY_KEYS.filter(k => k !== 'other')) ok(`${k} is in the Apostille list`, PR.apostille.includes(k));
for (const l of Object.keys(POA_LETTER)) eq(`poa letter ${l}: same keys as English`, keys(POA_LETTER[l]), keys(POA_LETTER.en));
for (const country of COUNTRY_KEYS) for (const consulate of ['yes', 'no', 'unsure']) for (const language of ['spanish', 'bilingual', 'other']) {
  const a = { country, consulate, language, purposes: PURPOSE_KEYS.filter((_, i) => (country.length + i) % 2), clientName: '' };
  for (const lang of ['en', 'es']) {
    const p = buildPlan(a, PR, lang);
    clean(`poa ${lang}`, [p.rec, p.translation || '', ...p.routes.flatMap(r => [r.title, ...r.steps]), ...p.powers, ...p.tips].join(' '));
    for (const ll of Object.keys(POA_LETTER)) {
      const L = buildPoaLetter(a, p, ll);
      clean(`poa letter ${ll}`, [L.greeting, ...L.paragraphs, L.note, L.regards].join(' '));
    }
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
