// Spanish Mortgage Compensation — Estimate Logic
//
// Scope: foreign owners with a Spanish mortgage signed between 2000 and 2019.
// Three recognised claim types against the lender:
//   1. Set-up / arrangement fees (gastos hipotecarios)
//   2. Floor clause (clausula suelo) overpaid interest
//   3. Mis-sold single-premium life insurance
//
// These are ESTIMATES only. They are scaled from average reported claim
// outcomes and are not a guarantee. Actual compensation depends on the
// individual contract, the lender, and a formal legal review.

// Reference mortgage the published averages are anchored to.
const REF_MORTGAGE = 150000;

// Average reported payout per claim type at the reference mortgage size.
const BASE = {
  setup:     2500,
  floor:     20000,
  insurance: 5000,
};

// Year bands. Floor clauses were most active through the low-Euribor years
// (roughly 2009-2015) and were largely removed from new mortgages after 2016,
// so exposure to overpaid floor interest varies by when the mortgage started.
export const YEAR_BANDS = {
  '2000_2009': { eligible: true,  floorMult: 1.2 },
  '2010_2015': { eligible: true,  floorMult: 1.0 },
  '2016_2019': { eligible: true,  floorMult: 0.45 },
  '2020_later': { eligible: false },
  'none':       { eligible: false },
};

export const YEAR_CODES = ['2000_2009', '2010_2015', '2016_2019', '2020_later', 'none'];

export const CLAIM_CODES = ['setup', 'floor', 'insurance'];

// Round to the nearest 10 and clamp into a sensible band.
const clamp = (v, lo, hi) => {
  const bounded = Math.min(hi, Math.max(lo, v));
  return Math.round(bounded / 10) * 10;
};

export const calculateClaim = (form) => {
  const band = YEAR_BANDS[form.year] || {};
  if (!band.eligible) {
    return { eligible: false, bandCode: form.year };
  }

  const mortgage = parseFloat(form.mortgage) > 0 ? parseFloat(form.mortgage) : REF_MORTGAGE;
  const factor   = Math.min(2.5, Math.max(0.4, mortgage / REF_MORTGAGE));

  // "Not sure" estimates the most common claim (set-up fees) as a baseline.
  let claims = Array.isArray(form.claims) ? [...form.claims] : [];
  if (form.unsure || claims.length === 0) claims = ['setup'];

  const items = [];
  let total = 0;

  if (claims.includes('setup')) {
    const amount = clamp(BASE.setup * factor, 600, 6500);
    items.push({ type: 'setup', amount });
    total += amount;
  }
  if (claims.includes('floor')) {
    const amount = clamp(BASE.floor * factor * (band.floorMult || 1), 3000, 45000);
    items.push({ type: 'floor', amount });
    total += amount;
  }
  if (claims.includes('insurance')) {
    const amount = clamp(BASE.insurance * factor, 1000, 12000);
    items.push({ type: 'insurance', amount });
    total += amount;
  }

  // Present a defensible range rather than false precision.
  const low  = Math.round((total * 0.75) / 100) * 100;
  const high = Math.round((total * 1.25) / 100) * 100;

  return {
    eligible: true,
    bandCode: form.year,
    mortgage,
    factor,
    unsure: !!form.unsure,
    items,
    total,
    low,
    high,
  };
};
