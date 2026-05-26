// Spanish Property Cost Audit — Calculation Logic
// Based on published bank fee schedules and Bueno Energy savings data

// Annual banking fees for non-residents WITHOUT a mortgage
// Source: published tariffs from each institution
const BANK_FEES = {
  santander:  { no_mortgage: 310, with_mortgage: 48, label: 'Santander' },
  bbva:       { no_mortgage: 285, with_mortgage: 36, label: 'BBVA' },
  caixabank:  { no_mortgage: 330, with_mortgage: 54, label: 'CaixaBank' },
  sabadell:   { no_mortgage: 295, with_mortgage: 42, label: 'Sabadell' },
  bankinter:  { no_mortgage: 270, with_mortgage: 30, label: 'Bankinter' },
  unicaja:    { no_mortgage: 260, with_mortgage: 30, label: 'Unicaja' },
  ing:        { no_mortgage: 0,   with_mortgage: 0,  label: 'ING' },
  revolut:    { no_mortgage: 0,   with_mortgage: 0,  label: 'Revolut' },
  wise:       { no_mortgage: 0,   with_mortgage: 0,  label: 'Wise' },
  other:      { no_mortgage: 250, with_mortgage: 40, label: 'Other bank' },
};

// Estimated annual energy overpayment vs Bueno Energy rates
// Conservative figures based on average Spanish holiday home consumption
const ENERGY_OVERPAYMENT = {
  iberdrola: 260,
  endesa:    240,
  naturgy:   255,
  repsol:    230,
  other:     200,
  unsure:    220,
  none:      0,
};

const BUENO_ANNUAL_COST = 99;

export const BANKS = [
  { code: 'santander', name: 'Santander' },
  { code: 'bbva',      name: 'BBVA' },
  { code: 'caixabank', name: 'CaixaBank' },
  { code: 'sabadell',  name: 'Sabadell' },
  { code: 'bankinter', name: 'Bankinter' },
  { code: 'unicaja',   name: 'Unicaja' },
  { code: 'ing',       name: 'ING' },
  { code: 'revolut',   name: 'Revolut / Wise' },
  { code: 'other',     name: 'Other / Not sure' },
];

export const ENERGY_PROVIDERS = [
  { code: 'iberdrola', name: 'Iberdrola' },
  { code: 'endesa',    name: 'Endesa' },
  { code: 'naturgy',   name: 'Naturgy' },
  { code: 'repsol',    name: 'Repsol' },
  { code: 'other',     name: 'Other provider' },
  { code: 'unsure',    name: 'I am not sure' },
  { code: 'none',      name: 'No electricity contract' },
];

export const calculateAudit = (formData) => {
  const bankData  = BANK_FEES[formData.bank] || BANK_FEES.other;
  const hasMortgage = formData.mortgage === 'yes';
  const currentBankCost = hasMortgage ? bankData.with_mortgage : bankData.no_mortgage;
  const energyOverpayment = ENERGY_OVERPAYMENT[formData.energyProvider] || ENERGY_OVERPAYMENT.unsure;

  const totalCurrentCost  = currentBankCost + energyOverpayment;
  const netSavings        = Math.max(0, totalCurrentCost - BUENO_ANNUAL_COST);

  // Determine saving category for messaging
  const savingsLevel =
    netSavings >= 400 ? 'high' :
    netSavings >= 150 ? 'medium' : 'low';

  return {
    currentBankCost,
    energyOverpayment,
    totalCurrentCost,
    buenoAnnualCost: BUENO_ANNUAL_COST,
    netSavings,
    savingsLevel,
    bankLabel: bankData.label,
    hasMortgage,
    hasEnergy: formData.energyProvider !== 'none',
  };
};
