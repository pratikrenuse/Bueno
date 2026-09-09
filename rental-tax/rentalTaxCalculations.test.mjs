// Tests for the rental income tax arithmetic.
//
// The rates come out of rules/irnr.json rather than being typed here, for the same reason
// the tool reads them: a test that hardcodes 19 would still pass on the day the law changed
// and the tool went wrong.
//
// The first block is the defect this file was rewritten to fix. Those tests fail against the
// old rentalTaxCalculations.js.
//
// Run: node rental-tax/rentalTaxCalculations.test.mjs

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import assert from 'node:assert/strict';

import { calculateRentalTax, daysInYear, clampDays } from './rentalTaxCalculations.js';
import { deadlineRuleId } from '../late-surcharge/calc.js';

const here = dirname(fileURLToPath(import.meta.url));
const readRules = f => JSON.parse(readFileSync(join(here, '..', 'rules', f), 'utf8'));
const byId = file => Object.fromEntries(file.rules.map(r => [r.id, r]));

const IRNR = byId(readRules('irnr.json'));
const DL = byId(readRules('deadlines.json'));
const RATES = IRNR['irnr.rates'].value;

const EU = { ratePercent: RATES.rental.eu_eea, canDeduct: true };
const NON_EU = { ratePercent: RATES.rental.other, canDeduct: false };

const base = {
  taxYear: '2025', rentalIncome: '12000', daysRented: '365',
  ibiTax: '', basura: '', insurance: '', communityFees: '', mortgageInterest: '',
  electricity: '', gas: '', water: '', internet: '', alarm: '',
  maintenance: '', managementFees: '', advertising: '', legalFees: '',
  propertyValue: '', landValue: '', furnitureDepr: '',
};
const run = (over, rules = EU) => calculateRentalTax({ ...base, ...over }, rules);

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

console.log('\nThe defect: more rented days than the year holds');

test('400 days in a 365 day year is clamped to 365, and the pro rata stops at one', () => {
  const r = run({ daysRented: '400' });
  assert.equal(r.days, 365);
  assert.equal(r.yearDays, 365);
  assert.equal(r.proRata, 1);
  assert.equal(r.daysClamped, true);
});

test('3650 days no longer produces property costs at 1000 percent of the year', () => {
  // The old file computed 3650 / 365 = 10 and the screen read "Property costs (1000% of
  // year)", with the deductions capped at income and the tax shown as zero.
  const r = run({ daysRented: '3650', ibiTax: '600', communityFees: '1200', propertyValue: '300000', landValue: '90000' });
  assert.ok(r.proRata <= 1, 'pro rata must never exceed a full year');
  assert.equal(Math.round(r.proRata * 100), 100);
  assert.equal(r.proratedExpenses, 1800);
  assert.equal(r.buildingDepr, 210000 * 0.03);
  assert.ok(r.tax > 0, 'a real letting at a real income should not come out at zero tax');
});

test('the clamp is stated on the result so the screen can say what it did', () => {
  assert.equal(run({ daysRented: '365' }).daysClamped, false);
  assert.equal(run({ daysRented: '366' }).daysClamped, true);
  assert.equal(run({ daysRented: '366', taxYear: '2024' }).daysClamped, false);
});

test('a leap year holds one more day to let', () => {
  assert.equal(daysInYear(2024), 366);
  assert.equal(daysInYear(2025), 365);
  assert.equal(daysInYear(2026), 365);
  assert.equal(daysInYear(2000), 366);
  assert.equal(daysInYear(1900), 365);
  assert.equal(daysInYear('not a year'), 365);
});

test('clampDays holds the boundary from both sides', () => {
  assert.equal(clampDays(0, 2025), 0);
  assert.equal(clampDays(364, 2025), 364);
  assert.equal(clampDays(365, 2025), 365);
  assert.equal(clampDays(366, 2025), 365);
  assert.equal(clampDays(366, 2024), 366);
  assert.equal(clampDays(367, 2024), 366);
  assert.equal(clampDays(400, 2025), 365);
});

console.log('\nThe rate, which is read and not typed');

test('an EU or EEA resident gets the rate irnr.rates states for them', () => {
  const r = run({});
  assert.equal(r.taxRate, RATES.rental.eu_eea);
  assert.equal(r.tax, (12000 * RATES.rental.eu_eea) / 100);
});

test('a resident outside the EU and EEA gets the other rate and no deductions', () => {
  const r = run({ ibiTax: '600', communityFees: '1200' }, NON_EU);
  assert.equal(r.taxRate, RATES.rental.other);
  assert.equal(r.canDeduct, false);
  assert.equal(r.totalDeductions, 0);
  assert.equal(r.taxable, 12000);
  assert.equal(r.tax, (12000 * RATES.rental.other) / 100);
});

test('the same facts give the non-EU owner more tax than the EU one', () => {
  assert.ok(run({}, NON_EU).tax > run({}, EU).tax);
});

console.log('\nDeductions');

test('the worked case from the audit still comes out where it did', () => {
  // 12,000 income, 600 IBI, 1,200 community, 300,000 property with 90,000 land, 365 days.
  const r = run({ ibiTax: '600', communityFees: '1200', propertyValue: '300000', landValue: '90000' });
  assert.equal(r.totalDeductions, 8100);
  assert.equal(r.taxable, 3900);
  assert.equal(r.tax, (3900 * RATES.rental.eu_eea) / 100);
});

test('deductions are prorated by the days actually let', () => {
  const half = run({ daysRented: '182', ibiTax: '365' });
  assert.ok(Math.abs(half.proratedExpenses - 365 * (182 / 365)) < 1e-9);
});

test('deductions cannot exceed income and cannot create a refund', () => {
  const r = run({ rentalIncome: '1000', ibiTax: '5000' });
  assert.equal(r.totalDeductions, 1000);
  assert.equal(r.taxable, 0);
  assert.equal(r.tax, 0);
  assert.equal(r.deductionsCapped, true);
});

test('land is not depreciated', () => {
  const all = run({ propertyValue: '300000', landValue: '300000' });
  assert.equal(all.buildingDepr, 0);
  const negative = run({ propertyValue: '100000', landValue: '400000' });
  assert.equal(negative.buildingDepr, 0);
});

console.log('\nZero and empty input');

test('zero days let is zero pro rata, not a division by zero', () => {
  const r = run({ daysRented: '0', ibiTax: '600' });
  assert.equal(r.proRata, 0);
  assert.equal(r.proratedExpenses, 0);
  assert.ok(Number.isFinite(r.tax));
  assert.equal(r.tax, (12000 * RATES.rental.eu_eea) / 100);
});

test('an empty income is zero tax, not NaN', () => {
  const r = run({ rentalIncome: '' });
  assert.equal(r.income, 0);
  assert.equal(r.tax, 0);
  assert.ok(Number.isFinite(r.tax));
});

test('every expense box left empty is simply nothing deducted', () => {
  const r = run({});
  assert.equal(r.totalDeductions, 0);
  assert.equal(r.taxable, 12000);
});

test('a negative figure is read as zero rather than as a credit', () => {
  const r = run({ ibiTax: '-5000' });
  assert.equal(r.proratedExpenses, 0);
  assert.equal(r.taxable, 12000);
});

console.log('\nThe filing window, which is a rule and not a sentence');

test('2025 rent is filed in the annual January window, not quarterly', () => {
  const id = deadlineRuleId('rental', 2025);
  assert.equal(id, 'deadline.rental.2024_2025');
  assert.equal(DL[id].value.file_to, '01-20');
  // The old screen said "Quarterly filings / Q4 deadline January 20". The rule's own note
  // says that framing is out of date.
  assert.match(DL[id].notes, /out of date/);
});

test('2026 rent moves to the April window', () => {
  const id = deadlineRuleId('rental', 2026);
  assert.equal(id, 'deadline.rental.from_2026');
  assert.equal(DL[id].value.file_from, '04-01');
  assert.equal(DL[id].value.file_to, '04-20');
});

test('a year the rules base has no rental window for returns nothing to print', () => {
  assert.equal(deadlineRuleId('rental', 2023), null);
  assert.equal(deadlineRuleId('rental', ''), null);
});

test('the last quarterly return is a verified rule we can quote rather than paraphrase', () => {
  const q = DL['deadline.rental.last_quarterly'];
  assert.equal(q.status, 'verified');
  assert.ok(q.statement.length > 0);
});

console.log(`\n${passed} passed${process.exitCode ? ', with failures above' : ''}\n`);
