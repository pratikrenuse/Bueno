// Tests for the late-filing arithmetic.
//
// The bands are read out of rules/late-filing.json here, not typed, for the same reason
// the tool reads them: a test that hardcodes 15 would still pass on the day the law
// changed and the tool went wrong.
//
// Run: node late-surcharge/calc.test.mjs

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import assert from 'node:assert/strict';

import {
  monthOfDelay, completeMonthsBetween, addMonths, daysBetween,
  surchargePercent, surchargeAmount, applyReduction,
  interestStart, interestEstimate,
  deadlineRuleId, deadlineDate, directDebitGapDays,
} from './calc.js';

const here = dirname(fileURLToPath(import.meta.url));
const lateFiling = JSON.parse(readFileSync(join(here, '..', 'rules', 'late-filing.json'), 'utf8'));
const deadlines = JSON.parse(readFileSync(join(here, '..', 'rules', 'deadlines.json'), 'utf8'));

const byId = file => Object.fromEntries(file.rules.map(r => [r.id, r]));
const LATE = byId(lateFiling);
const DL = byId(deadlines);

const BANDS = LATE['late.recargo.voluntary'].value;
const REDUCTION = LATE['late.recargo.reduction'].value;
const DEMORA = LATE['late.interest'].value.demora;

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

console.log('\nThe surcharge ladder, art. 27 LGT');

test('one month late is 1 percent', () => {
  const r = surchargePercent(1, BANDS);
  assert.equal(r.percent, 1);
  assert.equal(r.flat, false);
  assert.equal(r.interestApplies, false);
});

test('twelve months late is 12 percent', () => {
  const r = surchargePercent(12, BANDS);
  assert.equal(r.percent, 12);
  assert.equal(r.flat, false);
  assert.equal(r.interestApplies, false);
});

test('thirteen months late is 15 percent', () => {
  const r = surchargePercent(13, BANDS);
  assert.equal(r.percent, 15);
  assert.equal(r.flat, true);
  assert.equal(r.interestApplies, true);
});

test('the ladder climbs one point a month up to the cap', () => {
  for (let m = 1; m <= 12; m += 1) assert.equal(surchargePercent(m, BANDS).percent, m);
});

test('the boundary either side of month twelve', () => {
  assert.equal(surchargePercent(11, BANDS).percent, 11);
  assert.equal(surchargePercent(12, BANDS).percent, 12);
  assert.equal(surchargePercent(13, BANDS).percent, 15);
  assert.equal(surchargePercent(14, BANDS).percent, 15);
  assert.equal(surchargePercent(40, BANDS).percent, 15);
});

test('no interest inside the first twelve months, interest from month thirteen', () => {
  assert.equal(surchargePercent(12, BANDS).interestApplies, false);
  assert.equal(surchargePercent(13, BANDS).interestApplies, true);
});

test('the surcharge never exceeds the cap before it goes flat', () => {
  assert.ok(surchargePercent(12, BANDS).percent <= BANDS.max_within_12m);
});

test('not late is not a surcharge', () => {
  assert.equal(surchargePercent(0, BANDS).percent, 0);
  assert.equal(surchargeAmount(5000, 0), 0);
});

console.log('\nThe 25 percent reduction, art. 27.5 LGT');

test('the reduction takes a quarter off the surcharge', () => {
  const surcharge = surchargeAmount(1000, surchargePercent(12, BANDS).percent);
  assert.equal(surcharge, 120);
  assert.equal(applyReduction(surcharge, REDUCTION), 90);
});

test('the reduction applies to the flat band too', () => {
  const surcharge = surchargeAmount(2000, surchargePercent(13, BANDS).percent);
  assert.equal(surcharge, 300);
  assert.equal(applyReduction(surcharge, REDUCTION), 225);
});

test('the reduction is applied to the surcharge, never to the tax', () => {
  const tax = 4000;
  const surcharge = surchargeAmount(tax, surchargePercent(1, BANDS).percent);
  assert.equal(surcharge, 40);
  const reduced = applyReduction(surcharge, REDUCTION);
  assert.equal(reduced, 30);
  assert.equal(tax + reduced, 4030);
});

test('nothing to reduce when there is no surcharge', () => {
  assert.equal(applyReduction(0, REDUCTION), 0);
});

console.log('\nDates: the month counter');

test('a delay of days already sits in month one', () => {
  assert.equal(monthOfDelay('2026-01-20', '2026-01-23'), 1);
});

test('filing on the deadline is not late', () => {
  assert.equal(monthOfDelay('2026-01-20', '2026-01-20'), 0);
  assert.equal(monthOfDelay('2026-01-20', '2026-01-10'), 0);
});

test('one complete month of delay is month two', () => {
  assert.equal(completeMonthsBetween('2026-01-20', '2026-02-20'), 1);
  assert.equal(monthOfDelay('2026-01-20', '2026-02-20'), 2);
});

test('a year and a day of delay crosses into the flat band', () => {
  assert.equal(monthOfDelay('2025-01-20', '2026-01-19'), 12);
  assert.equal(monthOfDelay('2025-01-20', '2026-01-20'), 13);
  assert.equal(surchargePercent(monthOfDelay('2025-01-20', '2026-01-19'), BANDS).percent, 12);
  assert.equal(surchargePercent(monthOfDelay('2025-01-20', '2026-01-20'), BANDS).percent, 15);
});

test('adding months clamps to a short month', () => {
  assert.equal(addMonths('2026-01-31', 1), '2026-02-28');
  assert.equal(addMonths('2025-12-31', 12), '2026-12-31');
});

console.log('\nInterest, which starts only after month twelve');

test('interest runs from the day after the twelfth month', () => {
  assert.equal(interestStart('2025-01-20', BANDS), '2026-01-21');
});

test('interest is priced only over days we hold a rate for', () => {
  const r = interestEstimate({
    taxDue: 10000, fromISO: '2026-01-21', toISO_: '2026-07-21',
    ratePercent: DEMORA, rateKnownFromISO: '2025-01-01',
  });
  assert.equal(r.unpricedDays, 0);
  assert.equal(r.totalDays, 181);
  assert.ok(Math.abs(r.amount - (10000 * (DEMORA / 100) * 181) / 365) < 1e-9);
});

test('days before the rate we hold are counted, not priced', () => {
  const r = interestEstimate({
    taxDue: 10000, fromISO: '2024-01-01', toISO_: '2025-07-01',
    ratePercent: DEMORA, rateKnownFromISO: '2025-01-01',
  });
  assert.equal(r.unpricedDays, daysBetween('2024-01-01', '2025-01-01'));
  assert.equal(r.pricedDays, daysBetween('2025-01-01', '2025-07-01'));
  assert.ok(r.unpricedDays > 0);
});

console.log('\nWhich deadline the clock ran from');

test('imputed income splits at the 2026 accrual', () => {
  assert.equal(deadlineRuleId('imputed', 2023), 'deadline.imputed.upto_2025');
  assert.equal(deadlineRuleId('imputed', 2025), 'deadline.imputed.upto_2025');
  assert.equal(deadlineRuleId('imputed', 2026), 'deadline.imputed.from_2026');
});

test('rental income splits at the 2026 accrual and stops before 2024', () => {
  assert.equal(deadlineRuleId('rental', 2023), null);
  assert.equal(deadlineRuleId('rental', 2024), 'deadline.rental.2024_2025');
  assert.equal(deadlineRuleId('rental', 2025), 'deadline.rental.2024_2025');
  assert.equal(deadlineRuleId('rental', 2026), 'deadline.rental.from_2026');
});

test('every id the router returns exists in the rules base', () => {
  for (const kind of ['imputed', 'rental']) {
    for (let y = 2024; y <= 2027; y += 1) {
      const id = deadlineRuleId(kind, y);
      if (id) assert.ok(DL[id], `missing rule ${id}`);
    }
  }
});

test('the deadline date is the rule month and day of the following year', () => {
  const imputed = DL['deadline.imputed.upto_2025'].value;
  assert.equal(deadlineDate(2023, imputed.file_to), '2024-12-31');
  const rental = DL['deadline.rental.2024_2025'].value;
  assert.equal(deadlineDate(2024, rental.file_to), '2025-01-20');
  const april = DL['deadline.rental.from_2026'].value;
  assert.equal(deadlineDate(2026, april.file_to), '2027-04-20');
});

test('the direct debit gap on imputed income is eight days', () => {
  const v = DL['deadline.imputed.upto_2025'].value;
  assert.equal(directDebitGapDays(2023, v.file_to, v.direct_debit_to), 8);
});

test('the rental return has a gap of its own', () => {
  const v = DL['deadline.rental.2024_2025'].value;
  assert.equal(directDebitGapDays(2024, v.file_to, v.direct_debit_to), 5);
});

console.log('\nA worked case, end to end');

test('rental income for 2024, filed thirteen months late, with the reduction', () => {
  const id = deadlineRuleId('rental', 2024);
  const dl = deadlineDate(2024, DL[id].value.file_to);
  assert.equal(dl, '2025-01-20');
  const month = monthOfDelay(dl, '2026-02-20');
  assert.equal(month, 14);
  const band = surchargePercent(month, BANDS);
  assert.equal(band.percent, 15);
  assert.equal(band.interestApplies, true);
  const surcharge = surchargeAmount(3000, band.percent);
  assert.equal(surcharge, 450);
  assert.equal(applyReduction(surcharge, REDUCTION), 337.5);
});

console.log(`\n${passed} passed${process.exitCode ? ', with failures above' : ''}\n`);
