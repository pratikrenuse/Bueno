// Arithmetic for a late modelo 210.
//
// Not one rate, threshold or deadline is typed in this file. Every band arrives as an
// argument, read from the rules base by index.jsx. That is the point: if art. 27 LGT
// changes, the JSON changes and this file does not.
//
// The one thing worth reading slowly is how the month counter works. Art. 27 LGT charges
// "1 percent, plus a further 1 percent for each complete month of delay". So a delay of
// three days is already 1 percent, a delay of one month and three days is 2 percent, and
// so on. Expressed as "the month of delay you are in", which is what an owner counts on
// their fingers, that is simply: month 1 is 1 percent, month 12 is 12 percent, and from
// month 13 the surcharge stops climbing and becomes a flat figure with interest attached.
// The two readings are the same arithmetic. This file uses the second because it is the
// one a reader can check.

const DAY = 86400000;

export function parseISO(iso) {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function toISO(d) {
  return d.toISOString().slice(0, 10);
}

export function daysBetween(fromISO, toISO_) {
  const a = parseISO(fromISO), b = parseISO(toISO_);
  if (!a || !b) return null;
  return Math.floor((b - a) / DAY);
}

// Add whole months, clamping to the end of a short month so that 31 January plus one
// month is 28 February rather than sliding into March.
export function addMonths(iso, n) {
  const d = parseISO(iso);
  if (!d) return null;
  const day = d.getUTCDate();
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));
  return toISO(target);
}

// Complete months elapsed between two dates.
export function completeMonthsBetween(fromISO, toISO_) {
  const a = parseISO(fromISO), b = parseISO(toISO_);
  if (!a || !b || b <= a) return 0;
  let n = 0;
  while (parseISO(addMonths(fromISO, n + 1)) <= b) n += 1;
  return n;
}

// The month of delay the filing is in. Zero when the deadline has not passed. Any delay at
// all, even a single day, puts you in month 1.
export function monthOfDelay(deadlineISO, todayISO) {
  const days = daysBetween(deadlineISO, todayISO);
  if (days == null || days <= 0) return 0;
  return completeMonthsBetween(deadlineISO, todayISO) + 1;
}

// The surcharge percentage for a given month of delay.
// bands comes straight from rule('late.recargo.voluntary').value.
export function surchargePercent(month, bands) {
  if (!(month > 0)) return { percent: 0, flat: false, interestApplies: false };
  if (month >= bands.interest_from_month) {
    return { percent: bands.after_12m, flat: true, interestApplies: true };
  }
  const climbed = bands.base + bands.per_month * (month - 1);
  return { percent: Math.min(climbed, bands.max_within_12m), flat: false, interestApplies: false };
}

export function surchargeAmount(taxDue, percent) {
  if (!(taxDue > 0)) return 0;
  return (taxDue * percent) / 100;
}

// Art. 27.5 LGT. reductionPercent comes from rule('late.recargo.reduction').value.
export function applyReduction(surcharge, reductionPercent) {
  if (!(surcharge > 0)) return 0;
  return surcharge * (1 - reductionPercent / 100);
}

// Interest runs from the day after the twelfth month, not from the deadline.
export function interestStart(deadlineISO, bands) {
  const anniversary = addMonths(deadlineISO, bands.interest_from_month - 1);
  return anniversary ? toISO(new Date(parseISO(anniversary).getTime() + DAY)) : null;
}

// Late-payment interest, simple, on a 365 day year.
//
// We hold the rate for one year and, from that rule's own note, the year before it. For
// any stretch of the delay earlier than that we do not have a rate, so those days are
// counted and reported rather than priced. A figure we cannot source is not a figure.
export function interestEstimate({ taxDue, fromISO, toISO_, ratePercent, rateKnownFromISO }) {
  const totalDays = daysBetween(fromISO, toISO_);
  if (totalDays == null || totalDays <= 0) {
    return { totalDays: 0, pricedDays: 0, unpricedDays: 0, amount: 0 };
  }
  const startPriced = parseISO(fromISO) >= parseISO(rateKnownFromISO) ? fromISO : rateKnownFromISO;
  const pricedDays = Math.max(0, Math.min(totalDays, daysBetween(startPriced, toISO_) || 0));
  const unpricedDays = totalDays - pricedDays;
  const amount = taxDue > 0 ? (taxDue * (ratePercent / 100) * pricedDays) / 365 : 0;
  return { totalDays, pricedDays, unpricedDays, amount };
}

// Which deadline rule governs a given return and accrual year.
//
// The year boundaries below are not numbers we picked. They are the scope each rule states
// in its own id and statement: deadline.imputed.upto_2025 covers accruals to and including
// 2025, deadline.imputed.from_2026 covers 2026 onward, deadline.rental.2024_2025 covers
// those two accrual years, deadline.rental.from_2026 covers 2026 onward.
//
// Rental income accrued before 2024 sat in the old quarterly regime, and the rules base
// does not hold those windows. This returns null for those years and the tool says so
// rather than guessing a date and building a surcharge on top of it.
export const IMPUTED_SPLIT_AFTER = 2025;
export const RENTAL_ANNUAL_FROM = 2024;
export const RENTAL_APRIL_FROM = 2026;

export function deadlineRuleId(kind, year) {
  const y = Number(year);
  if (!Number.isFinite(y)) return null;
  if (kind === 'imputed') {
    return y <= IMPUTED_SPLIT_AFTER ? 'deadline.imputed.upto_2025' : 'deadline.imputed.from_2026';
  }
  if (kind === 'rental') {
    if (y < RENTAL_ANNUAL_FROM) return null;
    return y < RENTAL_APRIL_FROM ? 'deadline.rental.2024_2025' : 'deadline.rental.from_2026';
  }
  return null;
}

// Every one of these returns is filed in the calendar year after the income accrued, so
// the date is the rule's month and day on the following year.
export function deadlineDate(year, monthDay) {
  if (!monthDay) return null;
  const y = Number(year);
  if (!Number.isFinite(y)) return null;
  return `${y + 1}-${monthDay}`;
}

// The gap between the day direct debit closes and the day filing closes. Computed, never
// stated, so it stays right if either date moves.
export function directDebitGapDays(year, fileTo, debitTo) {
  if (!fileTo || !debitTo) return null;
  return daysBetween(deadlineDate(year, debitTo), deadlineDate(year, fileTo));
}
