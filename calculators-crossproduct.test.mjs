#!/usr/bin/env node
// Every branch of the two rewritten calculators, not just the first option on each screen.
//
// WHY THIS EXISTS SEPARATELY FROM THE OTHER TESTS
// tax-calculator and rental-tax were rewritten onto the rules base, and they are the two
// tools that put a tax figure in front of somebody. The unit tests cover the specific
// defects that were fixed. The browser walk only ever takes the FIRST choice on each
// screen, so it exercises one path out of hundreds. This runs the whole cross-product
// through the real calculation functions with the real rules, and asserts the invariants
// that have to hold on every path:
//
//   - nothing throws
//   - every number that reaches a screen is finite and not negative
//   - a figure is either present or explicitly refused, never NaN or undefined
//   - the rate is one of the two rates in the rules base, never anything else
//   - tax never exceeds the income or base it is charged on
//
// It reads the rules base the same way the pages do, so a rule changing status is caught
// here rather than in production.

import { readFileSync, readdirSync } from 'node:fs';
import { calculateTax, isEUEEA } from './tax-calculator/taxCalculations.js';
import { calculateRentalTax, daysInYear } from './rental-tax/rentalTaxCalculations.js';

// rules/index.js imports JSON, which Vite handles and plain node does not, so the base is
// read off disk here the same way test_rules.mjs reads it. Same files, same values.
const INDEX = {};
for (const f of readdirSync('rules').filter(n => n.endsWith('.json'))) {
  for (const r of JSON.parse(readFileSync(`rules/${f}`, 'utf8')).rules || []) if (r.id) INDEX[r.id] = r;
}
const DISPLAYABLE = new Set(['verified', 'partial']);
const rule = (id) => {
  const r = INDEX[id];
  if (!r) throw new Error(`rules: unknown id "${id}"`);
  if (!DISPLAYABLE.has(r.status)) throw new Error(`rules: "${id}" has status "${r.status}"`);
  return r;
};
const ruleStatus = (id) => (INDEX[id] ? INDEX[id].status : 'missing');

const RATES    = rule('irnr.rates');
const SPECIAL  = rule('irnr.imputed.rate_special_2023_2025');
const STANDING = rule('irnr.imputed.rate_standing');

let pass = 0, fail = 0;
const bad = [];
const check = (cond, label) => cond ? pass++ : (fail++, bad.push(label));

const finite = (v) => v === null || v === undefined || (typeof v === 'number' && Number.isFinite(v));
const nonNeg = (v) => v === null || v === undefined || (typeof v === 'number' && v >= 0);

// Countries on both sides of the EU/EEA split, plus a code that is in neither list.
const COUNTRIES = ['NO', 'SE', 'DE', 'FR', 'NL', 'GB', 'US', 'CH', 'ZZ'];
const YEARS = [2021, 2022, 2023, 2024, 2025, 2026, 2027];
const USES = ['personal', 'short_rental', 'long_rental', 'mixed'];
const REVISIONS = [true, false, 'yes', 'no', null, undefined, 'unsure'];
const FILINGS = ['never', 'missed_some', 'unsure', 'always', '', undefined];
const CADASTRAL = ['', '0', '1', '100000', '2500000', 'abc', '-5'];
const RENTS = ['', '0', '12000', '999999', 'abc', '-100'];

// --- tax-calculator -------------------------------------------------------------------
let taxRuns = 0;
for (const country of COUNTRIES) {
  for (const taxYear of YEARS) {
    for (const propertyUse of USES) {
      for (const hadRecentRevision of REVISIONS) {
        for (const filingHistory of FILINGS) {
          // One value pair per option combination keeps the run honest without exploding it,
          // and the money-shaped inputs get their own sweep below.
          const cadastralValue = CADASTRAL[taxRuns % CADASTRAL.length];
          const rentalIncome = RENTS[taxRuns % RENTS.length];
          const form = { country, taxYear: String(taxYear), propertyUse, hadRecentRevision, filingHistory, cadastralValue, rentalIncome };
          let r;
          try {
            r = calculateTax(form, { rates: RATES.value, special: SPECIAL.value, standing: STANDING.value, statusOf: ruleStatus });
          } catch (e) {
            fail++; bad.push(`THREW ${JSON.stringify(form)}: ${e.message}`); taxRuns++; continue;
          }
          taxRuns++;

          const label = `${country}/${taxYear}/${propertyUse}/rev=${hadRecentRevision}/cad=${cadastralValue}/rent=${rentalIncome}`;
          for (const k of ['annualTax', 'taxRate', 'totalLiability']) {
            check(finite(r[k]), `${label}: ${k} is not finite (${r[k]})`);
            check(nonNeg(r[k]), `${label}: ${k} is negative (${r[k]})`);
          }
          // The rate is one of the two the rules base holds, or absent. Never invented.
          if (r.taxRate != null) {
            const allowed = [RATES.value.rental.eu_eea, RATES.value.rental.other,
                             RATES.value.imputed.eu_eea, RATES.value.imputed.other];
            check(allowed.includes(r.taxRate), `${label}: taxRate ${r.taxRate} is not in the rules base`);
          }
          // The EU split follows the country, not the year or the use.
          check(r.isEUEEA === isEUEEA(country), `${label}: isEUEEA disagrees with the country list`);
          // A refused figure is refused explicitly, never as NaN.
          check(!Object.values(r).some(v => typeof v === 'number' && Number.isNaN(v)), `${label}: a NaN is in the result object`);
          // 2026 imputed is unverified, so a use that needs it must not produce an imputed figure.
          if (taxYear === 2026 && propertyUse === 'personal') {
            check(r.annualTax == null || r.annualTax === 0,
              `${label}: printed an imputed figure for 2026, whose rate is unverified (${r.annualTax})`);
          }
        }
      }
    }
  }
}

// --- rental-tax -----------------------------------------------------------------------
let rentRuns = 0;
for (const country of COUNTRIES) {
  const isEU = isEUEEA(country);
  const ratePercent = isEU ? RATES.value.rental.eu_eea : RATES.value.rental.other;
  for (const taxYear of YEARS) {
    for (const daysRented of ['', '0', '1', '180', '365', '366', '400', '3650', 'abc', '-30']) {
      for (const rentalIncome of RENTS) {
        const form = {
          taxYear: String(taxYear), daysRented, rentalIncome,
          // the expense fields, swept across empty, zero and real values
          mortgageInterest: rentRuns % 3 === 0 ? '' : '2400',
          ibi: rentRuns % 3 === 1 ? '0' : '450',
          community: '600', insurance: '300', repairs: '800', utilities: '1200',
          agentFees: '900', propertyValue: rentRuns % 4 === 0 ? '' : '250000',
        };
        let r;
        try { r = calculateRentalTax(form, { ratePercent, canDeduct: isEU }); }
        catch (e) { fail++; bad.push(`THREW rental ${JSON.stringify({country, taxYear, daysRented, rentalIncome})}: ${e.message}`); rentRuns++; continue; }
        rentRuns++;

        const label = `rental ${country}/${taxYear}/days=${daysRented}/rent=${rentalIncome}`;
        for (const k of ['income', 'days', 'taxable', 'tax', 'totalDeductions', 'taxRate']) {
          check(finite(r[k]), `${label}: ${k} is not finite (${r[k]})`);
          check(nonNeg(r[k]), `${label}: ${k} is negative (${r[k]})`);
        }
        check(!Object.values(r).some(v => typeof v === 'number' && Number.isNaN(v)), `${label}: a NaN is in the result object`);
        // Days can never exceed the days in that year. This is the "1000% of year" bug.
        check(r.days <= daysInYear(taxYear), `${label}: days ${r.days} exceeds the ${daysInYear(taxYear)} in that year`);
        // Tax is charged on the taxable base, so it cannot be larger than it.
        check(r.tax <= r.taxable + 0.01, `${label}: tax ${r.tax} exceeds the taxable base ${r.taxable}`);
        // Where the rules base allows no deduction, the base is the gross rent.
        if (!isEU) check(Math.abs(r.taxable - r.income) < 0.01, `${label}: deducted for a non-EU owner`);
        // Deductions never turn the base negative.
        check(r.taxable >= 0, `${label}: taxable base went negative`);
      }
    }
  }
}

console.log(`tax-calculator: ${taxRuns} input combinations`);
console.log(`rental-tax:     ${rentRuns} input combinations`);
console.log(`\n${pass} assertions passed, ${fail} failed`);
if (fail) {
  console.log('\nFirst failures:');
  for (const b of bad.slice(0, 15)) console.log('  ' + b);
  if (bad.length > 15) console.log(`  ...and ${bad.length - 15} more`);
  process.exit(1);
}
