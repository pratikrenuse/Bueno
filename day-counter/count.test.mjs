// node count.test.mjs
//
// The limit and the window are typed here on purpose. count.js takes them as arguments so
// that no legal figure sits in a tool file, and a test that took them from the rules base
// would only be checking that the rules base agrees with itself. These are the numbers the
// behaviour is pinned to, and if the rules base ever moves away from them this file is the
// thing that should be looked at.

import assert from 'node:assert/strict';
import {
  toDay, toISO, tripLength, normaliseTrips, daysUsedOn,
  firstBreach, nextRefresh, fullReset, analyse,
} from './count.js';

const LIMIT = 90;
const WINDOW = 180;

const BASE = '2026-01-01';
const base = toDay(BASE);

// Build a trip from day offsets, inclusive of both ends.
const trip = (from, to) => ({ start: toISO(base + from), end: toISO(base + to) });

let passed = 0;
function test(name, fn) {
  fn();
  passed += 1;
  console.log(`  ok  ${name}`);
}

console.log('count.js');

// --- the day arithmetic itself --------------------------------------------------------

test('entry and exit days both count, so a four-night stay is five days', () => {
  assert.equal(tripLength({ start: '2026-06-01', end: '2026-06-05' }), 5);
  assert.equal(daysUsedOn([{ start: '2026-06-01', end: '2026-06-05' }], toDay('2026-06-05'), WINDOW), 5);
  // A same-day arrival and departure is one day, not zero.
  assert.equal(tripLength({ start: '2026-06-01', end: '2026-06-01' }), 1);
});

test('a day is counted once even when the reader enters overlapping trips', () => {
  const trips = [
    { start: '2026-06-01', end: '2026-06-10' },
    { start: '2026-06-05', end: '2026-06-15' },
  ];
  assert.equal(normaliseTrips(trips).length, 1);
  assert.equal(daysUsedOn(trips, toDay('2026-06-15'), WINDOW), 15);
});

test('an unparseable or reversed trip is dropped rather than counted as zero days', () => {
  assert.equal(normaliseTrips([{ start: '2026-06-10', end: '2026-06-01' }]).length, 0);
  assert.equal(normaliseTrips([{ start: '2026-02-30', end: '2026-03-02' }]).length, 0);
  assert.equal(normaliseTrips([{ start: '', end: '' }]).length, 0);
});

test('the window ending on a day is 180 days long, inclusive of that day', () => {
  const t = [trip(0, 0)];
  // Day 0 is still inside the window that ends on day 179, and outside the one ending day 180.
  assert.equal(daysUsedOn(t, base + 179, WINDOW), 1);
  assert.equal(daysUsedOn(t, base + 180, WINDOW), 0);
});

// --- the six cases the brief names ----------------------------------------------------

test('a single 90-day trip is compliant', () => {
  const trips = [trip(0, 89)];
  assert.equal(tripLength(trips[0]), 90);
  assert.equal(daysUsedOn(trips, base + 89, WINDOW), 90);
  assert.equal(firstBreach(trips, LIMIT, WINDOW), null);
});

test('a single 91-day trip is not compliant', () => {
  const trips = [trip(0, 90)];
  assert.equal(tripLength(trips[0]), 91);
  const b = firstBreach(trips, LIMIT, WINDOW);
  assert.ok(b, 'expected a breach');
  assert.equal(b.date, toISO(base + 90));
  assert.equal(b.used, 91);
  assert.equal(b.over, 1);
});

test('two 50-day trips 100 days apart are compliant', () => {
  // 100 clear days between departure and the next arrival.
  const trips = [trip(0, 49), trip(150, 199)];
  assert.equal(tripLength(trips[0]), 50);
  assert.equal(tripLength(trips[1]), 50);
  assert.equal(toDay(trips[1].start) - toDay(trips[0].end) - 1, 100);
  assert.equal(firstBreach(trips, LIMIT, WINDOW), null);
  // The worst any single day reaches is 80, comfortably inside the allowance.
  assert.equal(daysUsedOn(trips, base + 199, WINDOW), 80);
});

test('two 50-day trips 60 days apart breach', () => {
  const trips = [trip(0, 49), trip(110, 159)];
  assert.equal(toDay(trips[1].start) - toDay(trips[0].end) - 1, 60);
  const b = firstBreach(trips, LIMIT, WINDOW);
  assert.ok(b, 'expected a breach');
  assert.equal(b.used, 91);
  // The 91st day of presence inside the window is the 41st day of the second trip.
  assert.equal(b.date, toISO(base + 150));
});

test('a trip that breaches only on its final day is caught', () => {
  // 40 days earlier in the year, then a 51-day trip. The count reaches 90 on the day
  // before departure and 91 on the day of departure itself.
  const trips = [trip(0, 39), trip(100, 150)];
  assert.equal(tripLength(trips[0]), 40);
  assert.equal(tripLength(trips[1]), 51);

  assert.equal(daysUsedOn(trips, base + 149, WINDOW), 90);
  assert.equal(daysUsedOn(trips, base + 150, WINDOW), 91);

  const b = firstBreach(trips, LIMIT, WINDOW);
  assert.ok(b, 'expected a breach');
  assert.equal(b.date, toISO(base + 150));

  // The failure this guards against: checking the arrival date alone reports 41 days used
  // and would have told the reader the trip was fine.
  assert.equal(daysUsedOn(trips, base + 100, WINDOW), 41);
});

// --- the reporting the result screen depends on ---------------------------------------

test('the next refresh is 180 days after the oldest day still inside the window', () => {
  const trips = [{ start: '2026-06-01', end: '2026-06-10' }];
  const r = nextRefresh(trips, toDay('2026-07-01'), WINDOW);
  assert.equal(r.date, toISO(toDay('2026-06-01') + WINDOW));
  // Nothing refreshes when the window is already empty.
  assert.equal(nextRefresh(trips, toDay('2027-06-01'), WINDOW), null);
});

test('the full allowance returns 180 days after the last day of presence', () => {
  const trips = [{ start: '2026-06-01', end: '2026-06-10' }];
  assert.equal(fullReset(trips, WINDOW).date, toISO(toDay('2026-06-10') + WINDOW));
});

test('analyse reports the position today and flags a future breach', () => {
  const today = toISO(base + 45);
  const trips = [trip(0, 39), trip(100, 150)];
  const a = analyse({ trips, today, limitDays: LIMIT, windowDays: WINDOW });

  assert.equal(a.usedToday, 40);
  assert.equal(a.remainingToday, 50);
  assert.equal(a.overToday, 0);
  assert.equal(a.windowFrom, toISO(base + 45 - 179));
  assert.equal(a.breach.date, toISO(base + 150));
  assert.equal(a.breachIsFuture, true);
  assert.equal(a.peak.used, 91);

  assert.equal(a.perTrip.length, 2);
  assert.equal(a.perTrip[0].future, false);
  assert.equal(a.perTrip[0].breachDate, null);
  assert.equal(a.perTrip[1].future, true);
  assert.equal(a.perTrip[1].days, 51);
  assert.equal(a.perTrip[1].peakUsed, 91);
  assert.equal(a.perTrip[1].breachDate, toISO(base + 150));
});

test('analyse reports a clean plan as clean', () => {
  const a = analyse({
    trips: [trip(0, 49), trip(150, 199)],
    today: toISO(base + 200),
    limitDays: LIMIT,
    windowDays: WINDOW,
  });
  assert.equal(a.breach, null);
  assert.equal(a.overToday, 0);
  assert.equal(a.usedToday, 79);
  assert.equal(a.remainingToday, 11);
});

console.log(`\n${passed} tests passed`);
