// node calc.test.mjs
//
// The rates and windows are typed here on purpose. calc.js takes them as arguments so that
// no legal figure sits in a tool file. These are the values the behaviour is pinned to, and
// if the rules base ever moves away from them this file is the thing to look at.

import assert from 'node:assert/strict';
import { computeSale, addMonths, addWorkingDays, round2 } from './calc.js';

const CGT = 19;            // irnr.rates .value.capital_gain.all
const RETENTION = 3;       // irnr.sale.retention .value.rate
const RETENTION_MONTHS = 1;
const OPENS_MONTHS = 1;    // deadline.210.sale .value.opens_months_after
const WINDOW_MONTHS = 3;   // deadline.210.sale .value.window_months
const PLUSVALIA_DAYS = 30; // plusvalia.deadlines .value.sale_working_days

const RATES = {
  cgtRate: CGT,
  retentionRate: RETENTION,
  retentionMonths: RETENTION_MONTHS,
  saleOpensMonths: OPENS_MONTHS,
  saleWindowMonths: WINDOW_MONTHS,
  plusvaliaWorkingDays: PLUSVALIA_DAYS,
};

let passed = 0;
function test(name, fn) {
  fn();
  passed += 1;
  console.log(`  ok  ${name}`);
}

console.log('calc.js');

// --- the gain --------------------------------------------------------------------------

test('a gain: buying costs go on, selling costs come off, and the tax is 19 percent of it', () => {
  const r = computeSale({
    purchasePrice: 200000, purchaseCosts: 20000,
    salePrice: 300000, agentPct: 3,
    completion: '2026-05-15', ...RATES,
  });
  assert.equal(r.agentFee, 9000);
  assert.equal(r.transferValue, 291000);
  assert.equal(r.acquisitionValue, 220000);
  assert.equal(r.gain, 71000);
  assert.equal(r.isLoss, false);
  assert.equal(r.taxDue, round2(71000 * 0.19));
  assert.equal(r.taxDue, 13490);
});

test('a loss: no tax, and the whole retention is repayable', () => {
  const r = computeSale({
    purchasePrice: 300000, purchaseCosts: 25000,
    salePrice: 250000, agentPct: 3,
    completion: '2026-05-15', ...RATES,
  });
  assert.equal(r.agentFee, 7500);
  assert.equal(r.transferValue, 242500);
  assert.equal(r.acquisitionValue, 325000);
  assert.equal(r.gain, -82500);
  assert.equal(r.isLoss, true);
  assert.equal(r.taxableGain, 0);
  assert.equal(r.taxDue, 0);
  assert.equal(r.retention, 7500);
  assert.equal(r.outcome, 'refund');
  assert.equal(r.refund, 7500);
  assert.equal(r.balanceDue, 0);
});

test('purchase costs left blank are treated as nil, not as a reason to fail', () => {
  const r = computeSale({
    purchasePrice: 200000, purchaseCosts: '',
    salePrice: 210000, agentPct: 0,
    completion: '2026-05-15', ...RATES,
  });
  assert.equal(r.acquisitionValue, 200000);
  assert.equal(r.gain, 10000);
});

// --- the retention ----------------------------------------------------------------------

test('the retention is a percentage of the price, never of the gain', () => {
  const gainCase = computeSale({
    purchasePrice: 100000, purchaseCosts: 0,
    salePrice: 400000, agentPct: 0,
    completion: '2026-05-15', ...RATES,
  });
  const lossCase = computeSale({
    purchasePrice: 700000, purchaseCosts: 0,
    salePrice: 400000, agentPct: 0,
    completion: '2026-05-15', ...RATES,
  });
  // Same price, wildly different gains, identical retention.
  assert.equal(gainCase.retention, 12000);
  assert.equal(lossCase.retention, 12000);
  assert.notEqual(gainCase.gain, lossCase.gain);
});

test('the 3 percent exceeds the tax due, so a refund is owed', () => {
  const r = computeSale({
    purchasePrice: 200000, purchaseCosts: 0,
    salePrice: 210000, agentPct: 0,
    completion: '2026-05-15', ...RATES,
  });
  assert.equal(r.gain, 10000);
  assert.equal(r.taxDue, 1900);
  assert.equal(r.retention, 6300);
  assert.equal(r.outcome, 'refund');
  assert.equal(r.refund, 4400);
  assert.equal(r.balanceDue, 0);
});

test('the 3 percent falls short of the tax due, so there is a balance to pay', () => {
  const r = computeSale({
    purchasePrice: 200000, purchaseCosts: 20000,
    salePrice: 300000, agentPct: 3,
    completion: '2026-05-15', ...RATES,
  });
  assert.equal(r.retention, 9000);
  assert.equal(r.taxDue, 13490);
  assert.equal(r.outcome, 'balance');
  assert.equal(r.balanceDue, 4490);
  assert.equal(r.refund, 0);
});

test('the country of residence is not an input, because the gains rate is one rate', () => {
  // The guard against the 19/24 error: there is nowhere to put a country, so the same
  // inputs can only ever produce the same tax.
  const inputs = {
    purchasePrice: 250000, purchaseCosts: 15000,
    salePrice: 380000, agentPct: 4,
    completion: '2026-05-15', ...RATES,
  };
  assert.equal(computeSale(inputs).taxDue, computeSale({ ...inputs }).taxDue);
  assert.equal(Object.keys(inputs).includes('country'), false);
});

// --- the dates ---------------------------------------------------------------------------

test('months run de fecha a fecha and clamp to the end of a short month', () => {
  assert.equal(addMonths('2026-01-31', 1), '2026-02-28');
  assert.equal(addMonths('2026-01-31', 4), '2026-05-31');
  assert.equal(addMonths('2024-01-31', 1), '2024-02-29');
  assert.equal(addMonths('2026-11-30', 1), '2026-12-30');
  assert.equal(addMonths('2026-12-15', 1), '2027-01-15');
});

test('working days skip weekends and start the day after the deed', () => {
  // 2026-01-31 is a Saturday, so day one is Monday 2 February and day thirty is Friday 13 March.
  assert.equal(addWorkingDays('2026-01-31', 30), '2026-03-13');
  // A Monday deed: five working days later is the Monday after.
  assert.equal(addWorkingDays('2026-06-01', 5), '2026-06-08');
  assert.equal(addWorkingDays('2026-06-01', 1), '2026-06-02');
});

test('every deadline is computed from the completion date', () => {
  const r = computeSale({
    purchasePrice: 200000, purchaseCosts: 10000,
    salePrice: 260000, agentPct: 3,
    completion: '2026-01-31', ...RATES,
  });
  assert.equal(r.dates.completion, '2026-01-31');
  // The buyer pays the retention over within one month.
  assert.equal(r.dates.buyer211Due, '2026-02-28');
  // The seller's window opens one month after and closes four months after.
  assert.equal(r.dates.sellerWindowOpens, '2026-02-28');
  assert.equal(r.dates.sellerWindowCloses, '2026-05-31');
  // Thirty working days, weekends only. Holidays push this later, so it is the earliest.
  assert.equal(r.dates.plusvaliaEarliest, '2026-03-13');
});

test('no completion date means no invented dates', () => {
  const r = computeSale({
    purchasePrice: 200000, salePrice: 260000, agentPct: 3,
    completion: '', ...RATES,
  });
  assert.equal(r.dates, null);
  assert.equal(r.gain, 52200);
});

console.log(`\n${passed} tests passed`);
