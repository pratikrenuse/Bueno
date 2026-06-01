// Spanish Rental Income Tax (Modelo 210 / IRNR)
// Based on founder-verified Excel calculation model
// Source: Rental_tax_calculation.xlsx

const n = (v) => parseFloat(v) || 0;

export const calculateRentalTax = (formData) => {
  const income      = n(formData.rentalIncome);
  const days        = n(formData.daysRented);
  const isEUEEA     = formData.residency === 'eu_eea';
  const taxRate     = isEUEEA ? 0.19 : 0.24;
  const proRata     = days > 0 ? days / 365 : 0;

  // Non-EU/UK: no deductions, flat rate on gross income
  if (!isEUEEA) {
    const tax = income * taxRate;
    return {
      income, days, taxRate: 24, isEUEEA: false,
      totalDeductions: 0, taxable: income, tax,
      proratedExpenses: 0, annualExpenses: 0,
      furnitureDepr: 0, buildingDepr: 0,
    };
  }

  // ── EU/EEA: deductions apply ───────────────────────────────────────────

  // PRORATED expenses (annual amount × days/365)
  const annualProrated =
    n(formData.ibiTax)          +
    n(formData.basura)          +
    n(formData.ibiGarage)       +
    n(formData.insurance)       +
    n(formData.communityFees)   +
    n(formData.mortgageInterest)+
    n(formData.electricity)     +
    n(formData.gas)             +
    n(formData.water)           +
    n(formData.internet)        +
    n(formData.alarm);

  const proratedExpenses = annualProrated * proRata;

  // ANNUAL expenses — not prorated, deducted in full
  const annualExpenses =
    n(formData.maintenance)     +
    n(formData.managementFees)  +
    n(formData.advertising)     +
    n(formData.legalFees);

  // DEPRECIATION
  // Furniture: user enters annual 10% of purchase price (10-year write-off)
  // Building: 3% of (property cost − land value), prorated by rental days
  const furnitureDepr  = n(formData.furnitureDepr) * proRata;
  const buildingBase   = Math.max(0, n(formData.propertyValue) - n(formData.landValue));
  const buildingDepr   = buildingBase * 0.03 * proRata;

  const totalDeductions = proratedExpenses + annualExpenses + furnitureDepr + buildingDepr;

  // Costs cannot exceed income — no refund possible
  const allowedDeductions = Math.min(totalDeductions, income);
  const taxable           = Math.max(0, income - allowedDeductions);
  const tax               = taxable * taxRate;

  return {
    income, days, taxRate: 19, isEUEEA: true,
    proratedExpenses,
    annualExpenses,
    furnitureDepr,
    buildingDepr,
    totalDeductions: allowedDeductions,
    deductionsCapped: totalDeductions > income,
    taxable,
    tax,
    proRata,
  };
};
