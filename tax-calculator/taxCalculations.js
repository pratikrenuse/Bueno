// Modelo 210 Spanish Non-Resident Property Tax Calculations
// Sources: AEAT, Spanish tax law for non-residents (IRNR)

// Countries/territories at 19% rate (EU + EEA)
const EU_EEA_COUNTRIES = new Set([
  'austria', 'belgium', 'bulgaria', 'croatia', 'cyprus', 'czech_republic',
  'denmark', 'estonia', 'finland', 'france', 'germany', 'greece', 'hungary',
  'ireland', 'italy', 'latvia', 'liechtenstein', 'lithuania', 'luxembourg',
  'malta', 'netherlands', 'norway', 'poland', 'portugal', 'romania',
  'slovakia', 'slovenia', 'spain', 'sweden', 'iceland', 'other_eu_eea'
]);

export const isEUEEA = (countryCode) => EU_EEA_COUNTRIES.has(countryCode);

// How many years Spain's AEAT can look back (prescription period)
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

// Late payment surcharges (recargo por presentacion extemporanea)
const getPenaltyRate = (yearsLate) => {
  if (yearsLate <= 0)   return 0;
  if (yearsLate < 0.25) return 0.05;  // up to 3 months
  if (yearsLate < 0.5)  return 0.10;  // 3-6 months
  if (yearsLate < 1)    return 0.15;  // 6-12 months
  return 0.20;                         // over 12 months + interest
};

export const calculateTax = (formData) => {
  const euEEA       = isEUEEA(formData.country);
  const taxRate     = euEEA ? 0.19 : 0.24;
  const cadastral   = parseFloat(formData.cadastralValue) || 0;
  const rental      = parseFloat(formData.rentalIncome)   || 0;

  // Deemed income rate: 1.1% if cadastral revised in last 10 years, 2% otherwise
  // When unsure, use 2% (more conservative, avoids underpayment)
  const hadRevision      = formData.hadRecentRevision === true || formData.hadRecentRevision === 'yes';
  const deemedIncomeRate = hadRevision ? 0.011 : 0.02;

  let annualTax = 0;
  let breakdown = {};
  const use = formData.propertyUse;

  if (use === 'personal') {
    const deemedIncome = cadastral * deemedIncomeRate;
    annualTax = deemedIncome * taxRate;
    breakdown = { deemedIncome, deemedIncomeRate: deemedIncomeRate * 100 };
  } else if (use === 'short_rental' || use === 'long_rental') {
    annualTax = rental * taxRate;
    breakdown = { rentalIncome: rental };
  } else if (use === 'mixed') {
    // Simplified mixed: treat as 50% personal deemed + 50% rental income
    // In practice this should be prorated by days, but we flag this in results
    const deemedIncome = (cadastral * deemedIncomeRate) * 0.5;
    const rentalTax    = rental * taxRate;
    const personalTax  = deemedIncome * taxRate;
    annualTax = personalTax + rentalTax;
    breakdown = {
      deemedIncome,
      deemedIncomeRate: deemedIncomeRate * 100,
      rentalIncome: rental,
      note: 'Mixed use estimate. Actual liability depends on number of personal vs rental days.'
    };
  }

  const yearsUnfiled  = getYearsUnfiled(formData.filingHistory);
  const outstandingTax = annualTax * yearsUnfiled;
  const penaltyRate   = getPenaltyRate(yearsUnfiled);
  const penalty       = outstandingTax * penaltyRate;
  const totalLiability = annualTax + outstandingTax + penalty;

  const status =
    yearsUnfiled === 0  ? 'current'  :
    yearsUnfiled <= 2   ? 'at_risk'  :
                          'overdue';

  return {
    ...breakdown,
    annualTax,
    taxRate: taxRate * 100,
    isEUEEA: euEEA,
    cadastralValue: cadastral,
    propertyUse: use,
    yearsUnfiled,
    outstandingTax,
    penalty,
    totalLiability,
    status,
    filingDeadline: 'December 31, 2025'
  };
};
