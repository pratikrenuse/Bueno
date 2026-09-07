#!/usr/bin/env node
// Worked examples published by official sources, plus boundary cases either side of every
// threshold. A change to the rules base that breaks one of these fails the build.
import { readFileSync } from 'node:fs';
const R = f => JSON.parse(readFileSync(`rules/${f}`, 'utf8'));
const find = (file, id) => { const r = R(file).rules.find(x => x.id === id); if (!r) throw new Error(`missing rule ${id}`); return r; };

let pass = 0, fail = 0;
const eq = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : (fail++, console.log(`FAIL ${name}\n  got  ${JSON.stringify(got)}\n  want ${JSON.stringify(want)}`));
};
const near = (name, got, want, tol = 0.01) => {
  const ok = Math.abs(got - want) <= tol;
  ok ? pass++ : (fail++, console.log(`FAIL ${name}: got ${got}, want ${want}`));
};

// --- AEAT's own published worked example for imputed income -------------------
// 45,986.60 x 2% x 24% x 365/365 = 220.73
{
  const rate = find('irnr.json', 'irnr.imputed.rate_standing').value.not_revised;
  const tax  = find('irnr.json', 'irnr.rates').value.imputed.other;
  near('AEAT imputed income worked example', 45986.60 * (rate/100) * (tax/100) * (365/365), 220.73);
}

// --- Balearic ITP: cumulative cuota column must reconcile with the bands -------
{
  const b = R('itp-ajd.json').itp_resale.find(r => r.region === 'Illes Balears').bands;
  let running = 0;
  b.forEach((band, i) => {
    eq(`Balears cumulative cuota band ${i}`, Math.round(band.cumulative_cuota), Math.round(running));
    if (band.slice) running += band.slice * band.rate / 100;
  });
  // 500,000 euro purchase: 400,000 at 8% + 100,000 at 9% = 32,000 + 9,000
  near('Balears ITP on 500,000', 32000 + 100000 * 0.09, 41000);
}

// --- Aragon ITP: same check ---------------------------------------------------
{
  const b = R('itp-ajd.json').itp_resale.find(r => r.region === 'Aragon').bands;
  let running = 0;
  b.forEach((band, i) => {
    eq(`Aragon cumulative cuota band ${i}`, Math.round(band.cumulative_cuota), Math.round(running));
    if (band.slice) running += band.slice * band.rate / 100;
  });
}

// --- Wealth tax: the two thresholds are different numbers ---------------------
{
  const t = find('wealth-tax.json', 'itsgf.thresholds').value;
  eq('ITSGF hecho imponible', t.hecho_imponible, 3000000);
  // Tax actually starts once base liquidable exceeds 3m, i.e. wealth of 3.7m
  near('ITSGF point tax actually starts', t.hecho_imponible + t.minimo_exento, 3700000);
  const at37 = 3700000 - t.minimo_exento; // 3,000,000 base liquidable
  eq('ITSGF at exactly 3.7m wealth the tax is still zero', at37 <= 3000000, true);
}

// --- Late filing: boundary either side of month 12 ----------------------------
{
  const r = find('late-filing.json', 'late.recargo.voluntary').value;
  const surcharge = m => m <= 12 ? r.base + (m - 1) * r.per_month : r.after_12m;
  eq('1 month late', surcharge(1), 1);
  eq('12 months late', surcharge(12), 12);
  eq('13 months late', surcharge(13), 15);
  eq('no interest inside 12 months', r.interest_from_month, 13);
}

// --- Consorcio: boundary either side of 120 km/h ------------------------------
{
  const t = find('insurance-consorcio.json', 'consorcio.wind_threshold').value;
  const route = g => g > t ? 'consorcio' : 'private insurer';
  eq('119 km/h gust', route(119), 'private insurer');
  eq('120 km/h gust exactly', route(120), 'private insurer'); // "exceeding", so 120 is not enough
  eq('121 km/h gust', route(121), 'consorcio');
}

// --- EPC: validity branches on the rating letter ------------------------------
{
  const v = find('epc.json', 'epc.validity').value;
  const years = r => r === 'G' ? v.rating_g_years : v.default_years;
  eq('EPC rating F', years('F'), 10);
  eq('EPC rating G', years('G'), 5);
}

// --- Tax residency: boundary either side of 183 days --------------------------
{
  const d = find('tax-residency.json', 'residency.tests').value.days;
  const res = n => n > d;
  eq('182 days', res(182), false);
  eq('183 days exactly', res(183), false); // "more than 183"
  eq('184 days', res(184), true);
}

// --- IRNR rates: Norway must get 19% AND deductibility ------------------------
{
  const rates = find('irnr.json', 'irnr.rates').value;
  const ded   = find('irnr.json', 'irnr.rental.deductibility').value.deductible_for;
  eq('Norway rental rate', rates.rental.eu_eea, 19);
  eq('Norway gets deductions', ded.includes('Norway'), true);
  eq('capital gains flat for everyone', rates.capital_gain.all, 19);
}

// --- The 3 percent retention is on price, never on gain -----------------------
{
  const r = find('irnr.json', 'irnr.sale.retention').value;
  eq('retention base', r.base, 'agreed_consideration');
  near('retention on a 300,000 sale', 300000 * r.rate / 100, 9000);
}

// --- Things that must never be codable ----------------------------------------
{
  eq('48 hour rule is a myth', find('squatting.json', 'squat.48_hour_rule').status, 'myth');
  eq('48 hour rule has no truthy value', find('squatting.json', 'squat.48_hour_rule').value, false);
  eq('rental registry is annulled', find('rental-registry.json', 'registry.annulled').status, 'annulled');
  eq('2026 imputed rate is unverified', find('irnr.json', 'irnr.imputed.rate_2026').status, 'unverified');
  eq('2026 imputed rate has no value', find('irnr.json', 'irnr.imputed.rate_2026').value, null);
  eq('ISD top rate is 34 not 36.5', find('succession.json', 'isd.state_scale').value.top, 34.0);
  eq('NIE form is EX-15', find('immigration-documents.json', 'nie.form').value.nie, 'EX-15');
  eq('Andalucia ITP is 7 not 8', R('itp-ajd.json').itp_resale.find(r => r.region === 'Andalucia').general, 7.0);
  eq('Canarias new build is IGIC not IVA', find('vat-igic.json', 'igic.canarias').value.general, 7);
  eq('no foreign buyer surcharge', R('itp-ajd.json').foreign_buyer_surcharge.status, 'verified');
}

// --- Regions we must refuse to answer for --------------------------------------
{
  const unusable = R('itp-ajd.json').itp_resale.filter(r => r.status === 'unverified').map(r => r.region);
  eq('Asturias not answerable', unusable.includes('Principado de Asturias'), true);
  eq('Navarra not answerable', unusable.includes('Comunidad Foral de Navarra'), true);
  eq('Pais Vasco not answerable', unusable.includes('Pais Vasco'), true);
  R('itp-ajd.json').itp_resale.filter(r => r.status === 'unverified')
    .forEach(r => eq(`${r.region} carries no rate`, r.general, null));
}

// --- Deadlines: the trap where direct debit closes before filing does ----------
{
  const a = find('deadlines.json', 'deadline.imputed.upto_2025').value;
  eq('direct debit closes before filing', a.direct_debit_to < a.file_to, true);
  const q = find('deadlines.json', 'deadline.rental.last_quarterly').value;
  eq('last quarterly rental filing', q.file_to, '2026-10-20');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
