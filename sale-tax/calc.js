// The arithmetic of selling a Spanish property as a non-resident.
//
// No legal figure is typed in this file. Every rate, deadline and window is an argument,
// and index.jsx reads each one from the rules base before calling in. That is also what
// lets these functions be tested under plain node.
//
// Four things this file exists to get right.
//
// 1. The capital gains rate is the same for everyone. The 19 and 24 percent split belongs
//    to imputed and rental income and has no place here, so this function takes ONE rate
//    and there is no country argument to get wrong.
// 2. The buyer's retention is a percentage of the agreed consideration, so of the price.
//    Not of the gain. On a loss-making sale it is still charged in full, which is exactly
//    the case where a seller is owed the whole of it back.
// 3. The gain is the transfer value less the acquisition value. Costs of buying are added
//    to what you paid; costs of selling come off what you got.
// 4. Month deadlines run de fecha a fecha, so one month from 31 January is the last day of
//    February, not 3 March.

export const DAY_MS = 86400000;

export function round2(n) {
  if (!Number.isFinite(n)) return 0;
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function parseISO(iso) {
  if (typeof iso !== 'string') return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const ms = Date.UTC(y, mo - 1, d);
  const back = new Date(ms);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d) return null;
  return back;
}

export function toISO(date) {
  if (!date) return null;
  return date.toISOString().slice(0, 10);
}

// Add whole months the way a Spanish deadline runs: same day number in the later month,
// and where that day does not exist, the last day of that month.
export function addMonths(iso, months) {
  const d = parseISO(iso);
  if (!d) return null;
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  const day = d.getUTCDate();
  const targetMonthEnd = new Date(Date.UTC(y, m + months + 1, 0)).getUTCDate();
  return toISO(new Date(Date.UTC(y, m + months, Math.min(day, targetMonthEnd))));
}

// Working days, counting forward from the day after the deed. Saturdays and Sundays are
// excluded. Public holidays are not, because they are national, regional and municipal all
// at once and this tool cannot know which apply. Anything built on this must be labelled
// as the earliest the deadline can fall, never as the deadline.
export function addWorkingDays(iso, workingDays) {
  const start = parseISO(iso);
  if (!start) return null;
  let counted = 0;
  const cursor = new Date(start.getTime());
  while (counted < workingDays) {
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    const dow = cursor.getUTCDay();
    if (dow !== 0 && dow !== 6) counted += 1;
  }
  return toISO(cursor);
}

const num = v => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

// The whole calculation. Every rate and window comes in from the caller.
export function computeSale({
  purchasePrice,
  purchaseCosts = 0,
  salePrice,
  agentPct = 0,
  completion,
  cgtRate,
  retentionRate,
  retentionMonths,
  saleOpensMonths,
  saleWindowMonths,
  plusvaliaWorkingDays,
}) {
  const bought = num(purchasePrice);
  const boughtCosts = num(purchaseCosts);
  const sold = num(salePrice);
  const agentFee = round2(sold * (num(agentPct) / 100));

  const acquisitionValue = round2(bought + boughtCosts);
  const transferValue = round2(sold - agentFee);
  const gain = round2(transferValue - acquisitionValue);

  const taxableGain = gain > 0 ? gain : 0;
  const taxDue = round2(taxableGain * (cgtRate / 100));

  // The base is the agreed consideration, so the price, whatever the gain turns out to be.
  const retention = round2(sold * (retentionRate / 100));

  const difference = round2(retention - taxDue);
  const outcome = difference > 0 ? 'refund' : difference < 0 ? 'balance' : 'square';

  const dates = completion ? {
    completion,
    buyer211Due: addMonths(completion, retentionMonths),
    sellerWindowOpens: addMonths(completion, saleOpensMonths),
    sellerWindowCloses: addMonths(completion, saleOpensMonths + saleWindowMonths),
    plusvaliaEarliest: addWorkingDays(completion, plusvaliaWorkingDays),
  } : null;

  return {
    acquisitionValue,
    transferValue,
    agentFee,
    gain,
    isLoss: gain < 0,
    taxableGain,
    taxDue,
    retention,
    refund: difference > 0 ? difference : 0,
    balanceDue: difference < 0 ? round2(-difference) : 0,
    outcome,
    // What the seller sees leave the table at the notary, before the municipal tax which
    // this tool deliberately does not put a number on.
    netBeforePlusvalia: round2(sold - agentFee - retention),
    dates,
  };
}
