# Tool audit: what can break, and on which click

Scope: the fourteen tools at the repo root, `ToolShell.jsx`, `SourceNote.jsx`, `rules/`,
`i18n.jsx` and the six locale files. Read only, nothing run in a browser.

Ranking: WRONG NUMBER first, because a plausible wrong figure is the one nobody reports.
Then CRASH, then NONSENSE.

Headline: the four tools that predate `ToolShell` and the rules base (`cost-audit`,
`tax-calculator`, `rental-tax`, `mortgage-claim`) hold every defect found. They carry their
own hardcoded constants, their own deadline strings in `en.json`, and none of them reads
`rules/`. The ten tools built on `ToolShell` and `rule()` are clean.

---

## 1. WRONG NUMBER — cost-audit invents a €220 energy overpayment for anyone with no electricity contract

`cost-audit/auditCalculations.js:59`

```js
const energyOverpayment = ENERGY_OVERPAYMENT[formData.energyProvider] || ENERGY_OVERPAYMENT.unsure;
```

`ENERGY_OVERPAYMENT.none` is `0` (line 28). `0` is falsy, so `||` discards it and falls
through to `unsure`, which is `220`.

**Input sequence:** Start audit → any bank → any mortgage answer → energy provider
**"No electricity contract"** (offered at `auditCalculations.js:52`, rendered
`cost-audit/index.jsx:185-193`).

**Arithmetic, ING + no mortgage + no electricity contract:**

- `currentBankCost` = 0
- `energyOverpayment` = 0 → falsy → **220**
- `totalCurrentCost` = 0 + 220 = **220**
- `netSavings` = max(0, 220 − 99) = **121**

Correct: `totalCurrentCost` = 0, `netSavings` = 0.

**What the user sees** (`cost-audit/index.jsx:205-281`): the "at_risk" badge, the
`headline_over` headline claiming **€121**, the savings hero block at €121, and the vs-bar
labelled "€220" against "€99". The energy breakdown row is suppressed at line 266
(`results.hasEnergy` is false for `none`), so the €220 appears in the total with **no line
item anywhere on the page explaining it**. A user with a zero-fee account and no power
contract is told they will save money by switching.

Same bug at every other bank. Santander, no mortgage, no electricity contract: shown
€431 saving (310 + 220 − 99) against a true €211. The breakdown on screen then reads
"bank fees €310, membership €99, net saving €431", which does not add up — 310 − 99 = 211.

Fix: `Object.prototype.hasOwnProperty.call(ENERGY_OVERPAYMENT, code) ? ... : 220`, or `?? `
after normalising missing codes.

---

## 2. WRONG NUMBER — tax-calculator prints "Deadline December 31" to rental and mixed-use owners

`tax-calculator/index.jsx:290` renders `calc_tax.panel_period` unconditionally, directly
under the headline tax figure.

`en.json` → `calc_tax.panel_period` = `"Per year. Modelo 210. Deadline December 31"`.
Present and translated in all six locale files (`no`, `sv`, `de`, `fr`, `nl` carry the same
31 December claim), so no locale escapes it.

**Input sequence:** any country → property use **"Holiday rental"**, **"Long-term rental"**
or **"Mixed"** (`PROPERTY_USE_CODES`, `tax-calculator/index.jsx:28`) → cadastral value →
rental income → filing history → email → results.

31 December is the imputed-income window. It has never been the rental window. This repo's
own verified rules say so:

- `rules/deadlines.json` `deadline.rental.2024_2025` (status verified): rental accrued 2024
  and 2025 is filed **1 to 20 January**.
- `rules/deadlines.json` `deadline.rental.from_2026` (status verified): rental accrued from
  2026 is filed in the **first 20 days of April**.

The site's own `late-surcharge` tool reads those rules and tells the same user a different
date. This is the file the rules base flags as `"the highest-risk file in the set"`.

---

## 3. WRONG NUMBER — rental-tax prints "Quarterly filings", which the rules base marks out of date

`rental-tax/index.jsx:389` renders `calc_rental.panel_period` under the tax figure.

`en.json` → `calc_rental.panel_period` =
`"Quarterly filings / Modelo 210 / Q4 deadline January 20"`. Translated the same way in all
six locales.

**Input sequence:** any residency → income and days → (EU path: expenses, annual costs,
depreciation) → Calculate → results. Every completed run shows it.

`rules/deadlines.json` `deadline.rental.2024_2025` (verified) notes verbatim: *"The grouping
period moved from quarterly to annual for accruals from 2024. Guidance describing quarterly
filing on 20 April, July, October and January is out of date."* `deadline.rental.last_quarterly`
(verified) puts the final quarterly return at Q3 2026, filed 1–20 October 2026.

The 20 January date is right only for a 2024 or 2025 accrual, and only as the annual window
rather than a Q4 one. For rent accrued from 2026 the date is 20 April 2027. The framing is
wrong today and the date becomes wrong for the next accrual.

---

## 4. WRONG NUMBER — tax-calculator taxes EU/EEA rent gross, having told the user costs are deductible

`tax-calculator/taxCalculations.js:56-58`

```js
} else if (use === 'short_rental' || use === 'long_rental') {
  annualTax = rental * taxRate;
```

There is no expenses input on the rental branch and no deduction in the arithmetic. The
hint on the very screen that collects the figure (`en.json` → `calc_tax.rental_hint`) reads
*"Enter gross rental income before expenses. EU/EEA residents may deduct costs."*

**Input sequence:** country **Norway** (or Sweden, Germany, France, Netherlands — the
primary markets) → property use **"Holiday rental"** → cadastral value → rental income
€12,000 → filing history "Always filed" → email.

- tax-calculator: 12,000 × 0.19 = **€2,280**, labelled "Annual tax obligation" (`index.jsx:289`).
- Same user in this site's `rental-tax` tool with €600 IBI, €1,200 community fees, a
  €300,000 property with €90,000 land, 365 days: deductions €8,100, taxable €3,900, tax
  **€741**.

Two calculators on one site, same facts, 3× apart. `rules/irnr.json`
`irnr.rental.deductibility` (verified) confirms the deduction exists for EU/EEA residents.
The cadastral value is collected on this path (`index.jsx:190-206`) and then never used —
that question could become the expenses question.

---

## 5. WRONG NUMBER — tax-calculator's late-payment surcharge is a hardcoded 20% and its band table is inert

`tax-calculator/taxCalculations.js:29-35`, called at line 76.

```js
const getPenaltyRate = (yearsLate) => {
  if (yearsLate <= 0)   return 0;
  if (yearsLate < 0.25) return 0.05;  // up to 3 months
  ...
```

`yearsLate` comes from `getYearsUnfiled` (line 18), which returns whole years: `4`, `2` or
`0`. The thresholds are fractions of a year. Three of the four bands are unreachable — the
function returns 0 or 0.20, nothing else. This is a unit mismatch, not a tuning choice.

**Input sequence:** any country → **"Personal use only"** → cadastral €200,000 → revision
**"Not sure"** → filing history **"Never filed"** → email.

- deemed income = 200,000 × 0.02 = 4,000
- annualTax = 4,000 × 0.24 = **960**
- outstandingTax = 960 × 4 = **3,840**
- penalty = 3,840 × **0.20** = **768**
- total shown = 960 + 3,840 + 768 = **€5,568**

`rules/late-filing.json` `late.recargo.voluntary` (verified) gives 1% + 1% per complete
month, capped at 12%, then a flat **15%** from month 13 with interest. On the same facts the
`late-surcharge` tool applies 15%, i.e. €576 rather than €768.

Caveat, stated plainly: late-payment interest at 4.0625% (`late.interest`, verified) runs
alongside the 15% and over several years could exceed the 5-point gap, so I cannot claim
€768 is necessarily too high. What is certain: 20% is a figure typed into a tool file rather
than read from `rules/`, three of its four bands can never fire, and the site shows two
different surcharge percentages for identical facts.

---

## 6. CRASH (tab freeze) — day-counter hangs on a mistyped year

`day-counter/index.jsx:89` — `analyse()` runs on **every render**, not in a `useMemo`.
`day-counter/count.js:93-99` (`presenceDays`) materialises one array entry per day of every
trip, and `peakUse` (line 114) calls `daysUsedOn` for each of them, which re-runs
`normaliseTrips` (filter + map + sort) every time.

**Input sequence:** "I am not an EU citizen" → trip start `2026-09-01`, trip end year typed
as `9999` (the browser date field accepts any 4-digit year, and `toDay` accepts it because
its regex is `\d{4}`) → **Add this trip**.

Measured on Node in this container: 2,912,200 presence days, **10.2 seconds** for a single
`analyse()` call. It then runs again on every subsequent render — adding another trip,
removing one, pressing Continue. On a phone that is a dead tab.

Five-digit years are safe: `count.js:27` requires exactly four digits, so `22026-01-01`
returns `null`, `tripIsValid` fails and the Add button stays disabled. Only the four-digit
far-future case gets through. The trip row also renders `2912200 days`
(`index.jsx:147`).

Two fixes, either sufficient: put a `max` on the end `DateField` (and reject spans over,
say, 20 years in `tripIsValid`), and wrap the `analyse` call in `useMemo`.

---

## 7. WRONG NUMBER / NONSENSE — rental-tax accepts more than 365 rented days

`rental-tax/rentalTaxCalculations.js:12` — `proRata = days / 365`, unbounded.
`rental-tax/index.jsx:257` validates only `parseFloat(form.daysRented) > 0`, and the
`NumberInput` at `index.jsx:52-60` sets `min="0"` with no `max`.

**Input sequence:** EU/EEA → income €12,000, **days rented `3650`** → expenses IBI €600,
community €1,200 → depreciation property €300,000, land €90,000 → Calculate.

- `proRata` = 3650 / 365 = **10**
- prorated expenses = 1,800 × 10 = 18,000; building depreciation = 210,000 × 0.03 × 10 = 63,000
- total deductions capped at income → taxable **€0**, tax **€0**

The breakdown label at `index.jsx:418` reads
`Math.round(results.proRata * 100)` → **"Property costs (1000% of year)"**, and the user is
told their Spanish rental tax is zero.

Fix: `max="365"` on the days field, and clamp `proRata` to 1 in the calculation.

---

## 8. NONSENSE — storm-claim reports negative "Days since"

`storm-claim/index.jsx:32` — `Math.floor((now - then) / 86400000)`, no floor at zero.
The `max` attribute at line 123 marks a future date invalid but does not block it, and
nothing checks validity before rendering.

**Input sequence:** any cause → any policy answer → on "The day you found out", type a date
after today → See the answer.

Row at `index.jsx:206` renders e.g. `Days since: -30`. `lateWarning` (line 68) stays false,
so the calm copy is shown. Minor, but it is a visible nonsense value on a result screen.

---

## Checked and clean

- **`rules/index.js` dynamic lookups.** The only runtime-computed `rule()` call in the
  repo is `late-surcharge/index.jsx:74`, `rule(dlId)`. Its five possible ids are all
  `verified`, as you found. Every other `rule()` call site — `day-counter:23-28`,
  `storm-claim:19-23`, `rental-vat:29`, `late-surcharge:32-35`, `sale-tax:29-41`,
  `utility-setup:21`, `SourceNote.jsx:24` — passes a string literal. I checked all 88 ids
  across `rules/*.json`: every literal passed to `rule()` resolves to a rule with status
  `verified` or `partial`, so nothing throws. The four non-displayable rules
  (`epc.penalties`, `irnr.imputed.rate_2026`, `lau.short_term_definitions`,
  `vat.ceuta_melilla` unverified; `registry.annulled` annulled; `registry.annual_filing_claim`,
  `squat.48_hour_rule` myth) are never passed to `rule()`. `rental-vat:39-40` correctly
  reaches the annulled rule through `ruleStatus` and the raw JSON instead.
- **`SourceNote ids={dlId}`** at `late-surcharge:195, 320, 385` — every one of those is
  inside a branch where `dlId` is non-null, and `SourceNote.jsx:21` filters falsy ids anyway.
- **Copy key coverage.** Every `c('...')` and `tt('...')` key, including all dynamic
  templates (`${n}_${k}`, `result_${verdict}`, `s_region_${...}`, `year_${code}_t`,
  `use_${code}_t`, `filing_${code}_t`, `${current.id}_${o.value}`), resolves for every
  reachable option value, in all six locales. No raw key path can reach the screen.
- **Generator exhaustion.** I enumerated the full option cross-product and ran the builders:
  `closing-up` (180 combinations), `pest-plan` (1,440), `utility-setup` (648),
  `maintenance-schedule` (1,050), `contractor-check` (all 12 questions × every option).
  No throw, no empty checklist group, no missing pest data, no `undefined` in a region
  coverage sentence.
- **`sale-tax`.** `calc.js` is careful: `parseISO` round-trips the date to reject
  `2026-02-31`, `addMonths` clamps to month end (31 Jan + 1 month = 28 Feb), `num()` floors
  negatives at 0, `round2` guards non-finite, `euro()` returns `''` rather than `NaN`, and
  the dates panel is gated on `r.dates`. All rates come from `rules/`.
- **`late-surcharge`.** Both regimes are routed apart, the unknown branch handles pre-2024
  rental years without inventing a date, the interest estimate reports unpriced days rather
  than extrapolating the rate, and `directDebitGapDays` is computed rather than stated.
- **`rental-vat`, `storm-claim`, `contractor-check`, `maintenance-schedule`, `closing-up`,
  `utility-setup`, `pest-plan`.** No arithmetic that can go non-finite, no regional table
  with a gap (`pest-plan`'s `coverageFor` has a named fallback for all six regions), no
  option leading to a step that does not exist, no `.find()` used without a guard.
- **State machines.** I traced back-button and re-selection paths in every tool that
  branches on an earlier answer (`storm-claim` wind step, `tax-calculator`
  `needsRevision`/`needsRental`, `rental-tax` EU/non-EU, `mortgage-claim` eligible/ineligible,
  `utility-setup`). Stale answers survive a re-selection in several tools, but in every case
  the stale field is ignored by the branch that ends up running, so no stale value reaches a
  figure. `mortgage-claim`'s results block is gated on `results.eligible`, and I could not
  find a path that reaches `step === 'results'` with an ineligible year, so the blank-screen
  case is not live.
- **Routing.** `src/App.jsx` glob-discovers all fourteen `index.jsx` files and registers
  both the bare and the locale-prefixed route for each. No tool is unreachable.

## One thing outside the audit brief

`cost-audit` names Santander, BBVA, CaixaBank, Sabadell, Bankinter, Unicaja, ING, Revolut
and Wise on a customer-facing screen (`auditCalculations.js:33-43`, rendered
`index.jsx:133-141`), with a euro fee attached to each. That is a brand-rule problem rather
than a defect, but it sits in the same file as finding 1 and would be fixed in the same pass.
