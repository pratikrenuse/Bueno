// Tests for the storm claim date arithmetic.
//
// One defect, one boundary, and the boundary is today. The result screen used to print a
// negative "Days since" when the owner entered a date after today, because the subtraction
// had no floor and the max attribute on the input does not stop a typed or pasted value.
//
// Run: node storm-claim/calc.test.mjs

import assert from 'node:assert/strict';

import { daysSince, isFutureDate, todayISO } from './calc.js';

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

const TODAY = '2026-09-08';

console.log('\nThe defect: a date that has not happened yet');

test('a future date never produces a negative count', () => {
  assert.equal(daysSince('2026-10-08', TODAY), null);
  assert.equal(daysSince('2027-01-01', TODAY), null);
  assert.equal(daysSince('2099-01-01', TODAY), null);
});

test('a future date is recognised as one, so the step can refuse to advance', () => {
  assert.equal(isFutureDate('2026-09-09', TODAY), true);
  assert.equal(isFutureDate('2026-10-08', TODAY), true);
  assert.equal(isFutureDate('2030-06-01', TODAY), true);
});

test('every count this returns is zero or more', () => {
  for (const d of ['2026-09-07', '2026-09-08', '2026-09-09', '2026-12-31', '2020-01-01']) {
    const n = daysSince(d, TODAY);
    if (n != null) assert.ok(n >= 0, `${d} gave ${n}`);
  }
});

console.log('\nThe boundary, which is today');

test('today is zero days ago and is not a future date', () => {
  assert.equal(daysSince(TODAY, TODAY), 0);
  assert.equal(isFutureDate(TODAY, TODAY), false);
});

test('yesterday is one day, tomorrow is nothing', () => {
  assert.equal(daysSince('2026-09-07', TODAY), 1);
  assert.equal(daysSince('2026-09-09', TODAY), null);
  assert.equal(isFutureDate('2026-09-07', TODAY), false);
});

test('the count is right across a month and a leap day', () => {
  assert.equal(daysSince('2026-08-08', TODAY), 31);
  assert.equal(daysSince('2024-02-28', '2024-03-01'), 2);
  assert.equal(daysSince('2025-02-28', '2025-03-01'), 1);
});

console.log('\nNo answer yet is not a future date');

test('an empty or unusable value gives no count and no future flag', () => {
  for (const v of ['', null, undefined, 'not a date', '2026-13-45']) {
    assert.equal(daysSince(v, TODAY), null, `daysSince ${v}`);
    assert.equal(isFutureDate(v, TODAY), false, `isFutureDate ${v}`);
  }
});

test('the notification warning cannot fire on a date with no count', () => {
  // lateWarning in index.jsx is days != null && days > NOTIFY.value, so a null count can
  // never turn it on. This pins the null.
  assert.equal(daysSince('2030-01-01', TODAY), null);
});

console.log('\nToday, read from the clock');

test('todayISO is a plain ISO date and is not itself in the future', () => {
  const t = todayISO();
  assert.match(t, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(isFutureDate(t), false);
  assert.equal(daysSince(t), 0);
});

console.log(`\n${passed} passed${process.exitCode ? ', with failures above' : ''}\n`);
