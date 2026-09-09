// Tests for the cost audit arithmetic.
//
// The bug this file was written for: ENERGY_OVERPAYMENT.none is 0, and the lookup used
// `|| ENERGY_OVERPAYMENT.unsure`, so 0 fell through to 220. Somebody with no electricity
// contract was shown an overpayment they could not have, in a total that did not add up
// on screen because the breakdown hides the energy row in exactly that case.

import { calculateAudit, ENERGY_PROVIDERS, BANKS } from './auditCalculations.js';

let pass = 0, fail = 0;
const eq = (name, got, want) => {
  const ok = got === want;
  ok ? pass++ : (fail++, console.log(`FAIL ${name}\n  got  ${JSON.stringify(got)}\n  want ${JSON.stringify(want)}`));
};

// --- the falsy zero -------------------------------------------------------------
const none = calculateAudit({ bank: 'ing', mortgage: 'no', energyProvider: 'none' });
eq('no electricity contract means no energy overpayment', none.energyOverpayment, 0);

const unsure = calculateAudit({ bank: 'ing', mortgage: 'no', energyProvider: 'unsure' });
eq('not sure still falls back to the unsure figure', unsure.energyOverpayment, 220);
eq('the two are not the same answer', none.netSavings === unsure.netSavings, false);

// --- the total on screen has to be the sum of its parts --------------------------
for (const b of BANKS) {
  for (const e of ENERGY_PROVIDERS) {
    const r = calculateAudit({ bank: b.code, mortgage: 'no', energyProvider: e.code });
    eq(`${b.code}/${e.code} total is bank plus energy`, r.totalCurrentCost, r.currentBankCost + r.energyOverpayment);
    eq(`${b.code}/${e.code} energy figure is a number`, Number.isFinite(r.energyOverpayment), true);
    eq(`${b.code}/${e.code} savings never negative`, r.netSavings >= 0, true);
  }
}

// --- an unknown or missing provider is the one case that should fall back ---------
eq('unknown provider falls back', calculateAudit({ bank: 'ing', mortgage: 'no', energyProvider: 'nonsense' }).energyOverpayment, 220);
eq('missing provider falls back', calculateAudit({ bank: 'ing', mortgage: 'no' }).energyOverpayment, 220);

// --- holding the mortgage never costs more than not holding it ---------------------
// This runs the other way round from the intuition, and the table is right: a Spanish bank
// waives the account maintenance fee for a customer whose mortgage it holds. The first
// version of this test asserted the opposite and failed on all seven banks, which is the
// only reason the direction is written down here.
for (const b of BANKS) {
  const w = calculateAudit({ bank: b.code, mortgage: 'yes', energyProvider: 'none' });
  const n = calculateAudit({ bank: b.code, mortgage: 'no', energyProvider: 'none' });
  eq(`${b.code}: holding the mortgage is not more expensive`, w.currentBankCost <= n.currentBankCost, true);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
