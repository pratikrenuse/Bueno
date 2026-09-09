// Tests for the non-resident property tax arithmetic.
//
// Every rate here is read out of rules/*.json rather than typed, for the same reason the
// tool reads them: a test that hardcodes 19 would still pass on the day the law changed and
// the tool went wrong.
//
// The first block is the four defects this file was rewritten to fix. Each of those tests
// fails against the old taxCalculations.js, which is the only way to know a fix is real.
//
// Run: node tax-calculator/taxCalculations.test.mjs

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import assert from 'node:assert/strict';

import {
  calculateTax, isEUEEA, imputedRateRuleId, imputedRatePercent,
  revisionTestFor, displayable, getYearsUnfiled, usesImputed, usesRent,
} from './taxCalculations.js';

const here = dirname(fileURLToPath(import.meta.url));
const readRules = f => JSON.parse(readFileSync(join(here, '..', 'rules', f), 'utf8'));
const byId = file => Object.fromEntries(file.rules.map(r => [r.id, r]));

const IRNR = byId(readRules('irnr.json'));
const DL = byId(readRules('deadlines.json'));

const RATES = IRNR['irnr.rates'].value;
const SPECIAL = IRNR['irnr.imputed.rate_special_2023_2025'].value;
const STANDING = IRNR['irnr.imputed.rate_standing'].value;

const statusOf = id => {
  const all = { ...IRNR, ...DL };
  return all[id] ? all[id].status : 'missing';
};

const RULES = { rates: RATES, special: SPECIAL, standing: STANDING, statusOf };

const base = {
  country: 'norway', taxYear: '2025', propertyUse: 'personal',
  cadastralValue: '', hadRecentRevision: null, rentalIncome: '', filingHistory: 'always',
};
const run = over => calculateTax({ ...base, ...over }, RULES);

let passed = 0;
const test = (name, fn) => {
  try {
    fn();
    passed += 1;
    console.log(`  ok   ${name}`);
  } catch (err) {
    console.error(`  FAIL ${name}`);
    console.error(`       ${err.message}`);
    process.exitCode = 1;
  }
};

console.log('\nThe defects this rewrite exists to fix');

test('rental income is reported on the gross basis, and the result says so', () => {
  // The old file taxed gross silently while the site's rental-tax tool deducted costs.
  // It still taxes gross, because it still does not ask for costs. It now labels it.
  const r = run({ propertyUse: 'short_rental', rentalIncome: '12000' });
  assert.equal(r.rental.basis, 'gross');
  assert.equal(r.rental.costsDeductible, true);
  assert.equal(r.rental.tax, (12000 * RATES.rental.eu_eea) / 100);
});

test('a non-EU owner is told costs are not deductible at all', () => {
  const r = run({ country: 'united_kingdom', propertyUse: 'long_rental', rentalIncome: '12000' });
  assert.equal(r.rental.costsDeductible, false);
  assert.equal(r.rental.tax, (12000 * RATES.rental.other) / 100);
});

test('a rental year is routed to a rental deadline, never to 31 December', () => {
  // The old screen printed "Deadline December 31" to every owner. That is the imputed
  // window. These are the rental ones, and they differ by accrual year.
  assert.equal(run({ propertyUse: 'short_rental', rentalIncome: '1', taxYear: '2025' }).deadlines.rental, 'deadline.rental.2024_2025');
  assert.equal(run({ propertyUse: 'long_rental', rentalIncome: '1', taxYear: '2026' }).deadlines.rental, 'deadline.rental.from_2026');
  assert.notEqual(DL['deadline.rental.2024_2025'].value.file_to, '12-31');
  assert.notEqual(DL['deadline.rental.from_2026'].value.file_to, '12-31');
});

test('a personal use year is routed to the imputed deadline, which does end 31 December', () => {
  const r = run({ propertyUse: 'personal', cadastralValue: '200000', taxYear: '2025' });
  assert.equal(r.deadlines.imputed, 'deadline.imputed.upto_2025');
  assert.equal(r.deadlines.rental, null);
  assert.equal(DL['deadline.imputed.upto_2025'].value.file_to, '12-31');
});

test('a mixed use year carries both deadlines, and they are different rules', () => {
  const r = run({ propertyUse: 'mixed', cadastralValue: '200000', rentalIncome: '5000', taxYear: '2025' });
  assert.equal(r.deadlines.imputed, 'deadline.imputed.upto_2025');
  assert.equal(r.deadlines.rental, 'deadline.rental.2024_2025');
  assert.notEqual(r.deadlines.imputed, r.deadlines.rental);
});

test('no surcharge percentage is computed from an answer that cannot place a band', () => {
  // The old getPenaltyRate took whole years against thresholds in fractions of a year, so
  // three of its four bands were unreachable and it always returned 20 percent.
  const r = run({ propertyUse: 'personal', cadastralValue: '200000', filingHistory: 'never' });
  assert.equal(r.penalty, undefined);
  assert.equal(r.penaltyRate, undefined);
  assert.equal(r.totalLiability, r.annualTax + r.outstandingTax);
});

test('the imputed rate comes from the rules base, not from the tool', () => {
  const r = run({ propertyUse: 'personal', cadastralValue: '200000', hadRecentRevision: true, taxYear: '2025' });
  assert.equal(r.imputed.ratePercent, SPECIAL.rate);
  assert.equal(r.imputed.income, (200000 * SPECIAL.rate) / 100);
  assert.equal(r.imputed.tax, (r.imputed.income * RATES.imputed.eu_eea) / 100);
});

console.log('\nThe year boundary: 2025 against 2026');

test('2025 is covered by the special rate rule', () => {
  assert.equal(imputedRateRuleId(2025, SPECIAL.years), 'irnr.imputed.rate_special_2023_2025');
  assert.ok(displayable(statusOf('irnr.imputed.rate_special_2023_2025')));
});

test('2026 lands on a rule that is unverified, so nothing is priced', () => {
  assert.equal(imputedRateRuleId(2026, SPECIAL.years), 'irnr.imputed.rate_2026');
  assert.equal(statusOf('irnr.imputed.rate_2026'), 'unverified');
  assert.equal(displayable(statusOf('irnr.imputed.rate_2026')), false);
  const r = run({ propertyUse: 'personal', cadastralValue: '200000', taxYear: '2026' });
  assert.equal(r.supported, false);
  assert.equal(r.imputed.supported, false);
  assert.equal(r.imputed.ratePercent, null);
  assert.equal(r.annualTax, null);
  assert.equal(r.totalLiability, null);
});

test('a 2026 rental year is still priced, because the rental rate is not the blocked one', () => {
  const r = run({ propertyUse: 'short_rental', rentalIncome: '12000', taxYear: '2026' });
  assert.equal(r.annualTax, (12000 * RATES.rental.eu_eea) / 100);
  assert.equal(r.supported, true);
});

test('a 2026 mixed year prices the rent and refuses the imputed part', () => {
  const r = run({ propertyUse: 'mixed', cadastralValue: '200000', rentalIncome: '10000', taxYear: '2026' });
  assert.equal(r.imputed.supported, false);
  assert.equal(r.supported, false);
  assert.equal(r.annualTax, (10000 * RATES.rental.eu_eea) / 100);
  assert.equal(r.isRange, false);
});

test('a year before the special rule falls back to the standing test, not to nothing', () => {
  const earliest = Math.min(...SPECIAL.years);
  assert.equal(imputedRateRuleId(earliest - 1, SPECIAL.years), 'irnr.imputed.rate_standing');
  assert.equal(revisionTestFor('irnr.imputed.rate_standing'), 'lookback');
  assert.equal(revisionTestFor('irnr.imputed.rate_special_2023_2025'), 'since_date');
});

console.log('\nEU against non-EU');

test('the rate split follows irnr.rates on both sides', () => {
  assert.equal(run({ propertyUse: 'personal', cadastralValue: '100000' }).taxRate, RATES.imputed.eu_eea);
  assert.equal(run({ country: 'united_kingdom', propertyUse: 'personal', cadastralValue: '100000' }).taxRate, RATES.imputed.other);
  assert.equal(run({ propertyUse: 'short_rental', rentalIncome: '100' }).taxRate, RATES.rental.eu_eea);
  assert.equal(run({ country: 'other', propertyUse: 'short_rental', rentalIncome: '100' }).taxRate, RATES.rental.other);
});

test('the EEA states the deductibility rule names are all inside the EU EEA set', () => {
  for (const name of ['norway', 'iceland', 'liechtenstein']) assert.equal(isEUEEA(name), true);
  assert.equal(isEUEEA('united_kingdom'), false);
  assert.equal(isEUEEA('other'), false);
});

test('the same rent gives the same tax to a Norwegian and a German', () => {
  const no = run({ country: 'norway', propertyUse: 'long_rental', rentalIncome: '9000' });
  const de = run({ country: 'germany', propertyUse: 'long_rental', rentalIncome: '9000' });
  assert.equal(no.annualTax, de.annualTax);
});

console.log('\nMixed use is a range, never an invented half');

test('the low end taxes the rent alone and the high end adds a full imputed year', () => {
  const r = run({ propertyUse: 'mixed', cadastralValue: '200000', rentalIncome: '10000', taxYear: '2025', hadRecentRevision: false });
  const rentTax = (10000 * RATES.rental.eu_eea) / 100;
  const imputedIncome = (200000 * STANDING.not_revised) / 100;
  const imputedTax = (imputedIncome * RATES.imputed.eu_eea) / 100;
  assert.equal(r.annualTaxLow, rentTax);
  assert.equal(r.annualTaxHigh, rentTax + imputedTax);
  assert.equal(r.isRange, true);
});

test('nothing in a mixed result is half of anything', () => {
  const r = run({ propertyUse: 'mixed', cadastralValue: '200000', rentalIncome: '10000', taxYear: '2025', hadRecentRevision: true });
  const full = run({ propertyUse: 'personal', cadastralValue: '200000', taxYear: '2025', hadRecentRevision: true });
  assert.ok(Math.abs((r.annualTaxHigh - r.annualTaxLow) - full.annualTax) < 1e-9);
});

console.log('\nThe revision answer, including not knowing');

test('revised takes the lower rate, not revised takes the higher one', () => {
  const yes = imputedRatePercent({ rateRuleId: 'irnr.imputed.rate_special_2023_2025', revised: true, special: SPECIAL, standing: STANDING });
  const no = imputedRatePercent({ rateRuleId: 'irnr.imputed.rate_special_2023_2025', revised: false, special: SPECIAL, standing: STANDING });
  assert.equal(yes.percent, SPECIAL.rate);
  assert.equal(no.percent, STANDING.not_revised);
  assert.ok(yes.percent < no.percent);
});

test('not knowing shows the higher rate and names the lower one beside it', () => {
  const unsure = imputedRatePercent({ rateRuleId: 'irnr.imputed.rate_special_2023_2025', revised: 'unsure', special: SPECIAL, standing: STANDING });
  assert.equal(unsure.percent, STANDING.not_revised);
  assert.equal(unsure.other, SPECIAL.rate);
  assert.equal(unsure.assumed, true);
});

test('both figures on that screen come from the rules base', () => {
  const unsure = imputedRatePercent({ rateRuleId: 'irnr.imputed.rate_standing', revised: 'unsure', special: SPECIAL, standing: STANDING });
  assert.ok([STANDING.revised, STANDING.not_revised].includes(unsure.percent));
  assert.ok([STANDING.revised, STANDING.not_revised].includes(unsure.other));
});

test('a year the rules base cannot support returns no rate at all', () => {
  assert.equal(imputedRatePercent({ rateRuleId: 'irnr.imputed.rate_2026', revised: true, special: SPECIAL, standing: STANDING }), null);
  assert.equal(imputedRateRuleId('', SPECIAL.years), null);
  assert.equal(imputedRateRuleId(null, SPECIAL.years), null);
  assert.equal(imputedRateRuleId(0, SPECIAL.years), null);
  assert.equal(imputedRateRuleId('not a year', SPECIAL.years), null);
});

console.log('\nZero and empty input');

test('an empty cadastral value is zero tax, not NaN', () => {
  const r = run({ propertyUse: 'personal', cadastralValue: '' });
  assert.equal(r.imputed.income, 0);
  assert.equal(r.annualTax, 0);
  assert.ok(Number.isFinite(r.annualTax));
});

test('an empty rent is zero tax, not NaN', () => {
  const r = run({ propertyUse: 'short_rental', rentalIncome: '' });
  assert.equal(r.rental.income, 0);
  assert.equal(r.annualTax, 0);
});

test('a negative or nonsense figure is read as zero', () => {
  assert.equal(run({ propertyUse: 'short_rental', rentalIncome: '-5000' }).annualTax, 0);
  assert.equal(run({ propertyUse: 'personal', cadastralValue: 'abc' }).annualTax, 0);
});

test('no filing history means nothing outstanding', () => {
  const r = run({ propertyUse: 'personal', cadastralValue: '200000', filingHistory: 'always' });
  assert.equal(r.yearsUnfiled, 0);
  assert.equal(r.outstandingTax, 0);
  assert.equal(r.status, 'current');
});

test('the use helpers agree with the four options the tool offers', () => {
  assert.equal(usesImputed('personal'), true);
  assert.equal(usesImputed('mixed'), true);
  assert.equal(usesImputed('short_rental'), false);
  assert.equal(usesRent('short_rental'), true);
  assert.equal(usesRent('long_rental'), true);
  assert.equal(usesRent('mixed'), true);
  assert.equal(usesRent('personal'), false);
  assert.equal(getYearsUnfiled('always'), 0);
  assert.ok(getYearsUnfiled('never') > getYearsUnfiled('missed_some'));
});

console.log('\nThe two calculators must not disagree in silence');

test('the gross figure here is flagged as gross wherever costs could have been deducted', () => {
  // rental-tax deducts costs for the same owner. This tool does not collect them, so the
  // only acceptable difference is one the screen explains. costsDeductible drives that copy.
  for (const country of ['norway', 'germany', 'france', 'sweden']) {
    const r = calculateTax({ ...base, country, propertyUse: 'short_rental', rentalIncome: '12000' }, RULES);
    assert.equal(r.rental.basis, 'gross');
    assert.equal(r.rental.costsDeductible, true, `${country} may deduct, so the screen must say this is gross`);
  }
});

console.log(`\n${passed} passed${process.exitCode ? ', with failures above' : ''}\n`);
