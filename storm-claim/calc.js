// Date arithmetic for the storm claim tool.
//
// Small file, one job. The result screen prints how many days have passed since the owner
// found out about the damage, and it used to subtract without a floor: a date in the future
// produced "Days since: -30" on a results screen. The date input carries a max attribute,
// which marks a later date invalid but does not stop it being typed or pasted.
//
// So the future date is rejected twice. The step will not advance while the date is ahead of
// today, and daysSince returns null for one anyway, which renders as unknown rather than as
// a negative number. Neither guard alone is enough. A max attribute is a suggestion.

const DAY = 86400000;

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function parse(iso) {
  if (!iso || typeof iso !== 'string') return null;
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

// True where the date given is later than today. An empty or unparseable value is not a
// future date; it is simply not an answer yet, and the step handles that separately.
export function isFutureDate(iso, today = todayISO()) {
  const a = parse(iso);
  const b = parse(today);
  if (!a || !b) return false;
  return a.getTime() > b.getTime();
}

// Whole days between the date given and today. Null where there is no usable date, and null
// where the date is in the future, because there is no honest count for a day that has not
// happened yet.
export function daysSince(iso, today = todayISO()) {
  const a = parse(iso);
  const b = parse(today);
  if (!a || !b) return null;
  const days = Math.floor((b.getTime() - a.getTime()) / DAY);
  return days < 0 ? null : days;
}
