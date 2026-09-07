// Counting for the rolling short-stay allowance.
//
// No legal figure is typed in this file. The allowance and the window length are arguments,
// and index.jsx reads them from the rules base before calling in. The test file supplies
// them explicitly, which is what lets these functions be tested under plain node without
// pulling the whole rules base and its JSON imports into the test.
//
// Three things this file exists to get right, because they are the three that calculators
// of this kind get wrong.
//
// 1. The window is measured against the period preceding EACH day of stay. So a plan is
//    tested on every day of every trip, not on the first day and not on the last day.
// 2. The day of entry and the day of exit are both full days of presence. A four-night
//    stay is five days.
// 3. Overlapping or touching trips are merged before counting, so a reader who enters the
//    same fortnight twice does not get charged for it twice.
//
// Days are handled as whole-day integers counted from the epoch in UTC, never as Date
// objects in local time. A summer trip and a winter trip are then the same arithmetic.

export const DAY_MS = 86400000;

// Parse an ISO date into a whole-day integer. Returns null on anything that is not a real
// calendar date, so a half-typed input never becomes a silent zero.
export function toDay(iso) {
  if (typeof iso !== 'string') return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const ms = Date.UTC(y, mo - 1, d);
  const back = new Date(ms);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d) return null;
  return Math.round(ms / DAY_MS);
}

export function toISO(day) {
  if (day == null || !Number.isFinite(day)) return null;
  return new Date(day * DAY_MS).toISOString().slice(0, 10);
}

// A trip is valid when both ends parse and the departure is not before the arrival.
export function tripIsValid(trip) {
  if (!trip) return false;
  const a = toDay(trip.start);
  const b = toDay(trip.end);
  return a != null && b != null && b >= a;
}

// Drop anything unusable, sort, then merge trips that overlap or touch.
export function normaliseTrips(trips) {
  const spans = (trips || [])
    .filter(tripIsValid)
    .map(t => ({ startDay: toDay(t.start), endDay: toDay(t.end) }))
    .sort((x, y) => x.startDay - y.startDay);

  const merged = [];
  for (const s of spans) {
    const last = merged[merged.length - 1];
    if (last && s.startDay <= last.endDay + 1) {
      last.endDay = Math.max(last.endDay, s.endDay);
    } else {
      merged.push({ startDay: s.startDay, endDay: s.endDay });
    }
  }
  return merged;
}

export function tripLength(trip) {
  if (!tripIsValid(trip)) return 0;
  return toDay(trip.end) - toDay(trip.start) + 1;
}

export function windowStartDay(refDay, windowDays) {
  return refDay - windowDays + 1;
}

// Days of presence inside the window that ENDS on refDay, inclusive at both ends.
export function daysUsedOn(trips, refDay, windowDays) {
  const from = windowStartDay(refDay, windowDays);
  let used = 0;
  for (const s of normaliseTrips(trips)) {
    const a = Math.max(s.startDay, from);
    const b = Math.min(s.endDay, refDay);
    if (b >= a) used += b - a + 1;
  }
  return used;
}

// Every day of presence, in order. This is the set of days the rule has to be tested on:
// a window ending on a day nobody is in the country can never be the first breach.
export function presenceDays(trips) {
  const out = [];
  for (const s of normaliseTrips(trips)) {
    for (let d = s.startDay; d <= s.endDay; d++) out.push(d);
  }
  return out;
}

// The first day on which the plan goes over. Tested on every day of every trip, which is
// the whole point: within a single trip the count can pass the limit on the last day and
// on no day before it, and a check on the arrival date alone would report all clear.
export function firstBreach(trips, limitDays, windowDays, fromDay = null) {
  for (const d of presenceDays(trips)) {
    if (fromDay != null && d < fromDay) continue;
    const used = daysUsedOn(trips, d, windowDays);
    if (used > limitDays) return { day: d, date: toISO(d), used, over: used - limitDays };
  }
  return null;
}

// The highest the count reaches on any day of presence, and when.
export function peakUse(trips, windowDays) {
  let best = null;
  for (const d of presenceDays(trips)) {
    const used = daysUsedOn(trips, d, windowDays);
    if (!best || used > best.used) best = { day: d, date: toISO(d), used };
  }
  return best;
}

// The next date on which a day of allowance comes back, which is the day the oldest day
// still inside today's window falls out of it.
export function nextRefresh(trips, todayDay, windowDays) {
  const from = windowStartDay(todayDay, windowDays);
  for (const d of presenceDays(trips)) {
    if (d >= from && d <= todayDay) return { day: d + windowDays, date: toISO(d + windowDays) };
  }
  return null;
}

// The date the whole allowance is free again, assuming no travel beyond the trips entered.
export function fullReset(trips, windowDays) {
  const days = presenceDays(trips);
  if (!days.length) return null;
  const last = days[days.length - 1];
  return { day: last + windowDays, date: toISO(last + windowDays) };
}

// The next date on which the count is back at or under the limit, assuming no travel
// beyond the trips entered. Only meaningful when the count is currently over.
export function backWithinLimit(trips, fromDay, limitDays, windowDays) {
  const days = presenceDays(trips);
  if (!days.length) return null;
  const last = days[days.length - 1];
  for (let d = fromDay; d <= last + windowDays; d++) {
    if (daysUsedOn(trips, d, windowDays) <= limitDays) return { day: d, date: toISO(d) };
  }
  return null;
}

// One call for the result screen.
export function analyse({ trips, today, limitDays, windowDays }) {
  const todayDay = toDay(today);
  if (todayDay == null) throw new Error('analyse: today must be an ISO date');

  const spans = normaliseTrips(trips);
  const usedToday = daysUsedOn(trips, todayDay, windowDays);
  const remainingToday = Math.max(0, limitDays - usedToday);
  const breach = firstBreach(trips, limitDays, windowDays);

  const perTrip = (trips || []).filter(tripIsValid).map(t => {
    const a = toDay(t.start);
    const b = toDay(t.end);
    let peak = { day: a, used: daysUsedOn(trips, a, windowDays) };
    let breachDay = null;
    for (let d = a; d <= b; d++) {
      const used = daysUsedOn(trips, d, windowDays);
      if (used > peak.used) peak = { day: d, used };
      if (breachDay == null && used > limitDays) breachDay = d;
    }
    return {
      start: t.start,
      end: t.end,
      days: b - a + 1,
      future: a > todayDay,
      peakUsed: peak.used,
      peakDate: toISO(peak.day),
      breachDate: breachDay == null ? null : toISO(breachDay),
    };
  });

  return {
    today,
    windowFrom: toISO(windowStartDay(todayDay, windowDays)),
    usedToday,
    remainingToday,
    overToday: Math.max(0, usedToday - limitDays),
    totalDaysEntered: spans.reduce((n, s) => n + (s.endDay - s.startDay + 1), 0),
    breach,
    breachIsFuture: breach ? breach.day > todayDay : false,
    peak: peakUse(trips, windowDays),
    nextRefresh: nextRefresh(trips, todayDay, windowDays),
    fullReset: fullReset(trips, windowDays),
    backWithinLimit: usedToday > limitDays ? backWithinLimit(trips, todayDay, limitDays, windowDays) : null,
    perTrip,
  };
}
