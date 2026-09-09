// Spanish rental income tax, modelo 210, for one accrual year.
//
// No rate is typed in this file. The two rates and the deductibility test arrive as
// arguments, read from the rules base by index.jsx, the same way late-surcharge/calc.js
// works. See CORRECTNESS_PROTOCOL.md.
//
// The deduction model itself, the expense categories and the depreciation percentages, came
// from a founder-verified spreadsheet rather than from a primary source, so it is not a
// figure the rules base holds. That is stated on the results screen and noted in the final
// report on this work. What this file guarantees is narrower and still worth having: the
// rate is sourced, the deduction only ever applies to someone the rules base says may
// deduct, and the pro rata can no longer exceed a full year.
//
// The pro rata used to be days / 365 with nothing stopping days. An owner who typed 3650
// was shown "Property costs (1000% of year)" and a tax bill of zero. Days are now clamped
// to the days in the accrual year, at the point of entry and again here, because a value
// that cannot happen should not be able to reach the arithmetic.

const n = (v) => {
  const x = parseFloat(v);
  return Number.isFinite(x) && x > 0 ? x : 0;
};

// A calendar fact, not a tax figure. 2024 is a leap year and has 366 days to let.
export function daysInYear(year) {
  const y = Number(year);
  if (!Number.isFinite(y)) return 365;
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 366 : 365;
}

export function clampDays(days, year) {
  const max = daysInYear(year);
  const d = n(days);
  return Math.min(d, max);
}

// Building depreciation, 3 percent of the built value. Not held in the rules base; see the
// note at the top of this file. Kept as a named constant rather than buried in a formula so
// that it is obvious what is and is not sourced.
const BUILDING_DEPRECIATION_PERCENT = 3;

// rules is the shape index.jsx builds:
//   ratePercent      irnr.rates value, the rental rate for this residency
//   canDeduct        whether irnr.rental.deductibility allows deductions for this residency
export const calculateRentalTax = (formData, rules) => {
  const { ratePercent, canDeduct } = rules;

  const income = n(formData.rentalIncome);
  const year = Number(formData.taxYear);
  const yearDays = daysInYear(year);
  const days = clampDays(formData.daysRented, year);
  const daysClamped = n(formData.daysRented) > yearDays;
  const proRata = days > 0 ? days / yearDays : 0;

  // No deductions where the rules base says none are available. Gross rent is the base.
  if (!canDeduct) {
    return {
      income, days, daysClamped, yearDays,
      taxRate: ratePercent, isEUEEA: false, canDeduct: false,
      totalDeductions: 0, taxable: income, tax: (income * ratePercent) / 100,
      proratedExpenses: 0, annualExpenses: 0,
      furnitureDepr: 0, buildingDepr: 0,
      proRata,
    };
  }

  // Prorated expenses. An annual amount, counted for the part of the year it was let.
  const annualProrated =
    n(formData.ibiTax)          +
    n(formData.basura)          +
    n(formData.insurance)       +
    n(formData.communityFees)   +
    n(formData.mortgageInterest)+
    n(formData.electricity)     +
    n(formData.gas)             +
    n(formData.water)           +
    n(formData.internet)        +
    n(formData.alarm);

  const proratedExpenses = annualProrated * proRata;

  // Annual expenses. Costs of the letting itself, deducted in full.
  const annualExpenses =
    n(formData.maintenance)     +
    n(formData.managementFees)  +
    n(formData.advertising)     +
    n(formData.legalFees);

  const furnitureDepr = n(formData.furnitureDepr) * proRata;
  const buildingBase  = Math.max(0, n(formData.propertyValue) - n(formData.landValue));
  const buildingDepr  = (buildingBase * BUILDING_DEPRECIATION_PERCENT * proRata) / 100;

  const totalDeductions = proratedExpenses + annualExpenses + furnitureDepr + buildingDepr;

  // Costs cannot exceed income. There is no refund here.
  const allowedDeductions = Math.min(totalDeductions, income);
  const taxable = Math.max(0, income - allowedDeductions);

  return {
    income, days, daysClamped, yearDays,
    taxRate: ratePercent, isEUEEA: true, canDeduct: true,
    proratedExpenses,
    annualExpenses,
    furnitureDepr,
    buildingDepr,
    totalDeductions: allowedDeductions,
    deductionsCapped: totalDeductions > income,
    taxable,
    tax: (taxable * ratePercent) / 100,
    proRata,
  };
};
