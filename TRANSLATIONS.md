# Spain 24/7 — Translation Glossary & Style Guide

Purpose: a single source of truth for how Bueno / Spain 24/7 copy is translated,
so AI-generated translations stay consistent and human reviewers spend less time
re-checking the same terms. Both the AI and human translators should read this
before touching the locale files (`en/no/sv/de/fr/nl.json`).

Workflow that cuts review time:
1. AI drafts a translation using the approved terms below.
2. A native speaker reviews **once** and fixes anything wrong.
3. The fix is recorded in the "Verified corrections" log at the bottom and, if it
   is a recurring term, added to the terminology table.
4. From then on, the AI reuses the locked term and the reviewer never has to
   correct it again.

---

## 1. Do NOT translate (keep exactly as written)

Bueno · Spain 24/7 · Modelo 210 · IBAN · Visa · IBI · Basura · IVA · NIE ·
Valor catastral · Bueno Energy · Bueno Club · getbueno.com · €

The Bueno brand name and product names are never translated or inflected with
local suffixes unless a reviewer confirms a natural local form.

## 2. Register / formality (how to address the reader)

| Lang | Address | Notes |
|------|---------|-------|
| EN | "you" | neutral |
| NO (Bokmål) | **du** | informal, standard for consumer web |
| SV | **du** | informal, standard for consumer web |
| DE | **Sie** | formal |
| FR | **vous** | formal |
| NL | **u** | formal |

Keep it warm, calm and plain. No jargon where a simple word works.

## 3. Numbers, currency, percent

- Currency symbol stays as `€` and, to match the calculator's live output,
  is placed **before** the amount in body copy (e.g. `€99`, `€200-400`).
- Thousands separator in static copy: NO/SV/FR use a space (`100 000`),
  DE/NL use a period (`100.000`).
- Decimal/percent: NO/SV/DE/FR/NL use a comma (`1,1 %`); NL often no space (`1,1%`).
- Known gap: dynamic amounts are currently formatted with `en-GB` (`€100,000`).
  Locale-aware formatting is a separate optional fix.

## 4. Brand style rules (all languages)

- No em dashes ( — ). Use a period, comma, or "and"/local equivalent.
- No emojis.
- Never call Bueno a "bank" or "banking". Use "account" / "platform" / "finance".
- Bueno is only named on calculator **results** screens, never elsewhere.

## 5. Core terminology (working glossary — verify and lock per language)

| EN | NO | SV | DE | FR | NL |
|----|----|----|----|----|----|
| non-resident | ikke-resident | icke-resident | Nicht-Resident | non-résident | niet-resident |
| property | bolig | fastighet | Immobilie | bien (immobilier) | woning |
| property owner | boligeier | husägare | Eigentümer | propriétaire | eigenaar |
| property tax | eiendomsskatt | fastighetsskatt | Immobiliensteuer | impôt immobilier | vastgoedbelasting |
| cadastral value | ligningsverdi | taxeringsvärde | Katasterwert | valeur cadastrale | kadastrale waarde |
| rental income | leieinntekt | hyresintäkt | Mieteinkommen | revenu locatif | huurinkomen |
| electricity (not "energy") | strøm | el | Strom | électricité | elektriciteit |
| tax return / filing | skattemelding (levering) | deklaration (inlämning) | Steuererklärung | déclaration | aangifte |
| deduction | fradrag | avdrag | Abzug | déduction | aftrek |
| depreciation | avskrivning | avskrivning | Abschreibung | amortissement | afschrijving |
| mortgage | boliglån | bolån | Hypothek | prêt immobilier | hypotheek |
| fees | gebyrer | avgifter | Gebühren | frais | kosten |
| savings | besparelse | besparing | Ersparnis | économies | besparing |
| deadline | frist | deadline | Frist | échéance | deadline |
| free | gratis | gratis | kostenlos | gratuit | gratis |
| account (the finance one) | konto | konto | Konto | compte | rekening |
| guidance only, not advice | kun til veiledning | endast som vägledning | nur zur Orientierung | à titre indicatif | alleen ter informatie |
| compensation (mortgage) | kompensasjon | ersättning | Entschädigung | indemnisation | compensatie |
| claim (compensation) | krav | anspråk | Anspruch | réclamation | claim |
| set-up / arrangement fees | etableringsgebyrer | uppläggningsavgifter | Bearbeitungsgebühren | frais de dossier | afsluitkosten |
| floor clause (clausula suelo) | rentegulv | räntegolv | Zinsuntergrenze | clause plancher | bodemrenteclausule |
| mis-sold insurance | feilsolgt forsikring | felsåld försäkring | falsch verkaufte Versicherung | assurance mal vendue | verkeerd verkochte verzekering |
| no win, no fee | ingen seier, ingen betaling | ingen vinst, ingen avgift | kein Erfolg, keine Kosten | sans gain, sans frais | no cure, no pay |

(Add a row whenever a reviewer corrects a recurring term.)

## 6. Verified corrections log

Record human-confirmed fixes here so they are never re-introduced.
Format: `YYYY-MM-DD — lang — key — was → now (reason)`

- 2026-06-10 — all — "tax filing" removed from the €99 inclusions (calc_tax.cta_price, calc_rental.cta_price, calc_cost.included_p1). Tax filing is a separate paid service, not included, otherwise people request free returns. (John)
- 2026-06-10 — all — calc_tax.intro_body no longer claims "most owners underpay / miss the deadline" (untrue and invites scrutiny). Now: some may simply not know the tax or how to file.
- 2026-06-10 — all — calc_cost cta_body dropped "No Spanish residency required" (confusing, reads wrong in NO/SV). Now "made specially for foreign owners" + 8 languages incl. Dutch.
- 2026-06-10 — all — calc_tax.status_overdue "Outstanding returns likely" → "Estimated outstanding tax returns".
- 2026-06-10 — all — tax headline verb "owe" → "pay" (NO "skal du betale", SV "kommer du att betala").
- 2026-06-10 — all — generic "energy" → "electricity" in cost copy (NO "strøm", SV "el"); users understand "electricity".
- 2026-06-10 — SV — preferred terms: property = fastighet (not bostad), owner = husägare (not bostadsägare), rental income = hyresintäkt (not hyresinkomst), "EU residents" = invånare i EU.
- 2026-06-10 — NO — management (rental) = administrasjon; drop "lovlige" before "fradrag"; write the range as "200–400 euro".
- 2026-06-25 — all — NEW tool `calc_claim` (Spanish Mortgage Compensation) AI-drafted in all six languages. Mortgage-claim terminology table rows added above. Pending native review for NO/SV/DE/FR/NL before this is considered locked.
