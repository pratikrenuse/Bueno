# The rules base

Every rate, threshold, deadline and percentage that any Spain 24/7 tool displays lives in
this folder. Nothing is hardcoded in a tool.

## Files

| File | Covers |
|---|---|
| `irnr.json` | Non-resident income tax: imputed income base and rates, rental rates, deductibility, the 3 percent sale retention |
| `deadlines.json` | Every modelo 210 filing window. Changed twice recently. Highest-risk file here |
| `late-filing.json` | Surcharges, penalties, interest |
| `itp-ajd.json` | Purchase tax by region, banded scales, and the valor de referencia minimum base |
| `vat-igic.json` | New-build IVA, Canary IGIC, and VAT on letting |
| `wealth-tax.json` | Patrimonio and the solidarity tax on large fortunes |
| `plusvalia.json` | IIVTNU methods, deadlines, and who pays when the seller is non-resident |
| `tax-residency.json` | The three tests and how days are actually counted |
| `lph-community.json` | Article 17.12 and tourist letting in a community |
| `rental-registry.json` | The national registry. Annulled |
| `regional-tourist-licence.json` | Six regions, plus penalties |
| `lau-seasonal.json` | Seasonal versus tourist lets |
| `parte-viajeros.json` | Guest reporting |
| `immigration-documents.json` | NIE forms and fees, visa thresholds, golden visa closure |
| `squatting.json` | Offences, the fast-track route, and the 48-hour myth |
| `succession.json` | Forced heirship, foral regions, EU election, ISD |
| `insurance-consorcio.json` | Extraordinary risk cover and the 120 km/h threshold |
| `epc.json` | Energy certificate requirement, validity and penalties |

## Using it

Read the rule by id. Check `status` before rendering. Render the source next to the value.

```js
const rule = rules.irnr['irnr.rates'];
if (rule.status === 'unverified') return notCovered(rule.notes);
show(rule.value, { source: rule.source, verifiedOn: rule.source.read_on, caveat: rule.status === 'partial' ? rule.notes : null });
```

## Gates

```
node validate_rules.mjs   # schema, sources, review dates. Blocks the build.
node test_rules.mjs       # official worked examples and threshold boundaries.
```

Both run in CI before every deploy. `validate_rules.mjs` refuses a rule that is usable
without a source or a review date, and refuses an unverified rule that carries a numeric
value some code might read anyway. `test_rules.mjs` reconciles the banded scales against
their published cumulative cuota columns and tests either side of every threshold.

That second gate has already earned its place: it caught a transcription error in the
Balearic 12 percent band that reads correctly to the eye.

## Current state

92 verified, 19 partial, 20 unverified, 1 annulled, 2 myth.

Partial and unverified items are listed with their fix in `../OPEN_QUESTIONS.md`.
