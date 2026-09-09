// Modelo 210. What a non-resident owner owes on one Spanish property, for one accrual year.
//
// Not one rate, threshold or deadline is typed in this file. Every figure arrives as an
// argument, read from the rules base by index.jsx, exactly the way late-surcharge/calc.js
// works. If a rate moves, the JSON moves and this file does not. See CORRECTNESS_PROTOCOL.md.
//
// Three things this file deliberately refuses to do.
//
// It will not price a year the rules base cannot support. The 1.1 percent imputed rate is
// stated for 2023, 2024 and 2025. Whether it carries into 2026 is unsettled, and the rule
// that would settle it is unverified. For those years this returns supported: false and the
// screen says we do not have a confirmed figure, which is the only honest thing to say.
//
// It will not deduct rental costs. Costs are deductible for an EU or EEA resident, and this
// tool never asks what they were, so it reports the gross basis and says so on the screen
// next to the number. The site's rental-tax tool collects the costs and does the deduction.
// The two tools must not disagree in silence.
//
// It will not split a mixed-use year by inventing a proportion. The imputed charge falls
// only on the days the property was not let, this tool does not ask for that split, so the
// answer comes back as a range with the rent taxed in full at both ends.

import { deadlineRuleId } from '../late-surcharge/calc.js';

// Residence, not a tax figure: which states sit inside the EU or EEA. The rates that hang
// off this split come from irnr.rates, and the deductibility that hangs off it from
// irnr.rental.deductibility. Neither is decided here.
const EU_EEA_COUNTRIES = new Set([
  'austria', 'belgium', 'bulgaria', 'croatia', 'cyprus', 'czech_republic',
  'denmark', 'estonia', 'finland', 'france', 'germany', 'greece', 'hungary',
  'ireland', 'italy', 'latvia', 'liechtenstein', 'lithuania', 'luxembourg',
  'malta', 'netherlands', 'norway', 'poland', 'portugal', 'romania',
  'slovakia', 'slovenia', 'spain', 'sweden', 'iceland', 'other_eu_eea',
]);

export const isEUEEA = (countryCode) => EU_EEA_COUNTRIES.has(countryCode);

export const RENTAL_USES = ['short_rental', 'long_rental'];
export const usesRent = (use) => RENTAL_USES.includes(use) || use === 'mixed';
export const usesImputed = (use) => use === 'personal' || use === 'mixed';

// A status the protocol allows on a screen. Anything else is a not-covered state.
export const displayable = (status) => status === 'verified' || status === 'partial';

// Which rule states the imputed rate for a given accrual year.
//
// The year boundaries are not numbers we picked. They are the scope each rule states about
// itself: irnr.imputed.rate_special_2023_2025 carries its own list of years, and
// irnr.imputed.rate_2026 is the rule that governs anything after them. Today that rule is
// unverified, so a later accrual has no displayable rate, which is the point.
export function imputedRateRuleId(year, specialYears) {
  if (year === '' || year == null) return null;
  const y = Number(year);
  // A four digit year, or nothing. An empty box reads as zero otherwise, and zero is a
  // number, and a number would quietly pick a rule.
  if (!Number.isInteger(y) || y < 1000 || y > 9999) return null;
  if (!Array.isArray(specialYears) || !specialYears.length) return null;
  if (specialYears.includes(y)) return 'irnr.imputed.rate_special_2023_2025';
  if (y < Math.min(...specialYears)) return 'irnr.imputed.rate_standing';
  return 'irnr.imputed.rate_2026';
}

// The revision question the tool must ask for a given year, because the two rules test
// different things. The special rule asks whether the value was revised with effect from a
// stated date. The standing rule asks whether it was revised within a lookback of tax
// periods. Asking one and answering with the other is how a plausible wrong rate happens.
export function revisionTestFor(rateRuleId) {
  if (rateRuleId === 'irnr.imputed.rate_special_2023_2025') return 'since_date';
  if (rateRuleId === 'irnr.imputed.rate_standing') return 'lookback';
  return null;
}

// The imputed rate as a percentage, plus the other rate on the same rule, so the screen can
// show both when the owner does not know which side of the test they are on.
//
// `revised` is true, false, or 'unsure'. An owner who does not know is shown the higher
// rate with the lower one named beside it. Both are read from the rules base, so nothing on
// that screen is a figure we made up, and nobody is told a smaller number than they may owe.
export function imputedRatePercent({ rateRuleId, revised, special, standing }) {
  if (rateRuleId === 'irnr.imputed.rate_special_2023_2025') {
    if (revised === true) return { percent: special.rate, other: standing.not_revised, assumed: false };
    if (revised === false) return { percent: standing.not_revised, other: special.rate, assumed: false };
    return { percent: standing.not_revised, other: special.rate, assumed: true };
  }
  if (rateRuleId === 'irnr.imputed.rate_standing') {
    if (revised === true) return { percent: standing.revised, other: standing.not_revised, assumed: false };
    if (revised === false) return { percent: standing.not_revised, other: standing.revised, assumed: false };
    return { percent: standing.not_revised, other: standing.revised, assumed: true };
  }
  return null;
}

const num = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

// How many earlier returns the owner's own answer suggests are outstanding. This is a
// reading of what they told us about themselves, not a legal period, and the screen says so.
const LOOKBACK_YEARS = 4;

export const getYearsUnfiled = (filingHistory) => {
  switch (filingHistory) {
    case 'never':       return LOOKBACK_YEARS;
    case 'missed_some': return 2;
    case 'unsure':      return 2;
    case 'always':      return 0;
    default:            return 0;
  }
};

// rules is the shape index.jsx builds from the rules base:
//   rates          irnr.rates value
//   special        irnr.imputed.rate_special_2023_2025 value
//   standing       irnr.imputed.rate_standing value
//   deductibleFor  irnr.rental.deductibility value.deductible_for
//   statusOf       ruleStatus, so this file can ask whether a rule may be displayed
export function calculateTax(formData, rules) {
  const { rates, special, standing, statusOf } = rules;
  const euEEA = isEUEEA(formData.country);
  const year = Number(formData.taxYear);
  const use = formData.propertyUse;

  const imputedRatePct = euEEA ? rates.imputed.eu_eea : rates.imputed.other;
  const rentalRatePct = euEEA ? rates.rental.eu_eea : rates.rental.other;

  const cadastral = num(formData.cadastralValue);
  const rent = num(formData.rentalIncome);

  // --- the imputed side -----------------------------------------------------
  let imputed = null;
  if (usesImputed(use)) {
    const rateRuleId = imputedRateRuleId(year, special.years);
    const supported = !!rateRuleId && displayable(statusOf(rateRuleId));
    const band = supported ? imputedRatePercent({ rateRuleId, revised: formData.hadRecentRevision, special, standing }) : null;
    const income = band ? (cadastral * band.percent) / 100 : 0;
    imputed = {
      supported,
      rateRuleId,
      revisionTest: revisionTestFor(rateRuleId),
      ratePercent: band ? band.percent : null,
      otherRatePercent: band ? band.other : null,
      rateAssumed: band ? band.assumed : false,
      income: band ? income : null,
      tax: band ? (income * imputedRatePct) / 100 : null,
    };
  }

  // --- the rental side ------------------------------------------------------
  // Gross, always. See the note at the top of this file.
  let rental = null;
  if (usesRent(use)) {
    rental = {
      supported: true,
      income: rent,
      tax: (rent * rentalRatePct) / 100,
      basis: 'gross',
      costsDeductible: euEEA,
    };
  }

  // --- the answer -----------------------------------------------------------
  // low and high are the same figure everywhere except mixed use, where the imputed charge
  // falls on the days the property was not let and we do not ask for that split.
  let low = null;
  let high = null;
  let supported = true;

  if (use === 'personal') {
    supported = imputed.supported;
    low = high = supported ? imputed.tax : null;
  } else if (RENTAL_USES.includes(use)) {
    low = high = rental.tax;
  } else if (use === 'mixed') {
    if (imputed.supported) {
      low = rental.tax;
      high = rental.tax + imputed.tax;
    } else {
      // The rent is still priced. The imputed part is not, and the screen says which.
      supported = false;
      low = high = rental.tax;
    }
  } else {
    supported = false;
  }

  const isRange = low != null && high != null && high > low;
  const annualTax = low != null ? low : null;

  const yearsUnfiled = getYearsUnfiled(formData.filingHistory);
  const outstandingLow = low != null ? low * yearsUnfiled : null;
  const outstandingHigh = high != null ? high * yearsUnfiled : null;
  const totalLow = low != null ? low + outstandingLow : null;
  const totalHigh = high != null ? high + outstandingHigh : null;

  const status =
    yearsUnfiled === 0 ? 'current' :
    yearsUnfiled <= 2 ? 'at_risk' :
    'overdue';

  // Which filing window governs. Both ids come from the router the late-surcharge tool
  // already uses, so the two tools cannot drift apart on a date.
  const deadlines = {
    imputed: usesImputed(use) ? deadlineRuleId('imputed', year) : null,
    rental: usesRent(use) ? deadlineRuleId('rental', year) : null,
  };

  return {
    year,
    propertyUse: use,
    isEUEEA: euEEA,
    taxRate: usesRent(use) ? rentalRatePct : imputedRatePct,
    cadastralValue: cadastral,
    imputed,
    rental,
    supported,
    isRange,
    annualTax,
    annualTaxLow: low,
    annualTaxHigh: high,
    yearsUnfiled,
    outstandingTax: outstandingLow,
    outstandingTaxHigh: outstandingHigh,
    totalLiability: totalLow,
    totalLiabilityHigh: totalHigh,
    status,
    deadlines,
  };
}
