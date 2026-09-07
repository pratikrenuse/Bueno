# Tool status after verification

Every tool in the catalogue, judged against what the rules base can actually support.
Four states.

- **CLEARED.** Every rule it needs is `verified`. Build it.
- **CLEARED WITH CAVEAT.** Buildable, but one rule is `partial` and the tool must carry
  the caveat on the page.
- **BLOCKED.** Needs a rule that is `unverified`. Named blocker, named fix.
- **DEAD.** The premise is gone. Do not build.

## DEAD

**34. Rental registry renewal planner.** The national registration procedure under RD
1312/2024 was annulled by the Tribunal Supremo in May and June 2026. There is no state
number to plan a renewal for, and the annual window it was built around never existed in
the form described. Replace it with a regional licence checker, which is a different tool
answering a question that is still live.

**Any 100 percent non-EU purchase tax calculator.** Not law, no enacting instrument.

## BLOCKED, with the specific fix

**36. Community vote calculator.** Not blocked on the law any more, which is now verified,
but the tool as specified computes the wrong thing. Article 17.12 was rewritten: three
fifths is now the majority to **approve** a tourist let, not only to ban one. Respecify
before building. The 3 April 2025 grandfathering cut-off and the 20 percent cap on the
expense surcharge are both verified and belong in it.

**18. Filing calendar.** Cleared for rental and imputed income. Blocked on the IBI and
basura month, which is municipal. Ship it national-only and say so, or compile a municipal
table first.

**Anything using the 2026 imputed income rate.** The 1.1 percent special rule covers 2023
to 2025 and no extension to 2026 was found. On the face of the sources a 2026 accrual falls
back to the ten-tax-period test, which moves some properties to 2 percent, an 80 percent
increase. The 2026 window does not open until 1 April 2027, so there is time. Until it is
settled, the calculator handles 2025 and earlier and says plainly that 2026 is pending.

**1, 2, 6. Purchase cost calculators.** Cleared for the seven regions where foreign owners
actually buy. Blocked for Asturias (bands not obtained), Navarra and Pais Vasco (foral, and
the Basque Country is three separate regimes, never one rate). General AJD rates are
unverified for nine regions. Ship with a region picker that only offers verified regions and
names the rest as not yet covered.

**35. Unlicensed letting fine exposure.** The claimed range is unsupported and wrong for the
Balearics. Only Balearic figures were confirmed. Do not publish a number for the Comunitat
Valenciana or Andalucia. Either narrow the tool to the Balearics or hold it.

**33. Which let type are you running.** The three source articles define short-term letting
three incompatible ways, and Catalunya could not be verified at all because every Generalitat
host blocks automated access. Fix the taxonomy in the articles first, then build for the five
regions that are verified.

**44. EPC checker.** The requirement and the validity split are verified and are the useful
part. The penalty figures are not, and the bands circulating online have no reachable source.
Build it without a fine amount.

## CLEARED WITH CAVEAT

**19. Late filing surcharge.** The voluntary schedule and the 2026 interest rate are
verified. The 50 percent minimum penalty after a demand is `partial`. Build the voluntary
branch fully; describe the demanded branch qualitatively until art. 191 LGT is read.

**22. Wealth tax exposure.** Scale, thresholds and the solidarity tax are verified. The
denial of the 300,000 main-home allowance to a non-resident is a reasoned reading, not a
quoted statement. Model both thresholds separately: the hecho imponible at 3 million and the
point tax actually starts, around 3.7 million.

**21. Plusvalia.** The methods, the no-gain rule and the deadlines are verified. The
sustituto rule is confirmed through a municipal portal rather than BOE. The amount is
municipal and cannot be computed nationally. Build the who-pays and deadline logic; do not
output euros.

**23. Tax residency.** Tests verified. Art. 9 LIRPF could not be quoted verbatim. Two things
the tool must get right: sporadic absences are ADDED to the day count unless residence
elsewhere is certified, and there is no de minimis trip length; and a treaty tie-breaker
overrides the domestic answer for Norway, Sweden, Germany, the UK and France.

**26. Forced heirship.** Verified enough to build, but it is Tier B not Tier A: six foral
regions displace the Civil Code and their rules differ sharply, and which applies depends on
vecindad civil, not where the property sits. Keep the matrimonial regime and the heirship
division as two visibly separate steps.

**32. Squatter action plan.** Rebuild it around the real test rather than the fake clock.
The most valuable content is the one the article omits: a second home in regular personal use
can be a morada, which changes the offence, and the civil express route excludes owners who
hold through a company.

**7, 31. NIE and lost documents.** Forms and fees verified. The permanence of the number is
`partial`, so use the safe wording in `rules/immigration-documents.json`.

**25. Visa route matcher.** The non-lucrative formula and IPREM are verified. The digital
nomad threshold must be stated as "200 percent of the Spanish minimum wage" with a link,
never as a euro figure, because the Instruccion does not say whether the base is the
12-payment monthly figure or the annual figure divided by twelve, and the two readings differ
by about 400 euros a month.

## CLEARED

Build these now. Every rule they need is verified.

- **20. Sale proceeds and the 3 percent withholding.** Rate, model, both deadlines verified.
  Include the point Bueno's article gets wrong: for a non-resident seller the buyer is
  sustituto for plusvalia, so expect roughly 3 percent plus the full plusvalia retained at
  the notary. Market practice, labelled as such.
- **24. 90/180 day counter.** Pure date arithmetic, no maintenance, highest search demand
  from UK owners.
- **29. Rental VAT status.** The three-tier rule is verified current law. Do not code the
  speculative 21 percent line.
- **47. Storm and flood claim router.** The best-verified tool in the set. The 120 km/h
  three-second gust threshold is the whole logic. Ask for date and location and check the
  official gust record; never ask the customer how windy it was.
- **48. Insurance cover gaps.** Built on the Consorcio precondition: cover is capped at the
  sums insured in the ordinary policy, so under-insurance carries straight through, and an
  uninsured property has no cover at all.
- **27. Inheritance and gift deadlines.** Six months, extendable, and thirty working days for
  gifts. Flag the extension condition as needing one check.
- **37. Landlord contract clauses.** No legal constants needed.
- **50, 51, 52, 53, 54. Pest plan, closing up, maintenance schedule, utility setup,
  contractor check.** Generators and checklists, no rates, no regional variation. These are
  the safest things on the whole list and they need no verification at all.
- **13, 14, 15. Scam check, rural checks, leasehold check.** Structural checkers, no rates.
- **4, 5. Arras exposure and purchase timeline.** Contract mechanics, not tax. The FEIN
  ten-day rule is a legal requirement and belongs in the timeline.

## Build order

1. The five checklist and generator tools. Zero legal risk, immediate value, no blockers.
2. The 90/180 counter and the storm claim router. Fully verified, genuinely useful, nobody
   else has them.
3. The sale and withholding calculator, and the rental VAT checker.
4. The late surcharge calculator, voluntary branch only.
5. Purchase cost, restricted to the seven verified regions.
6. Everything else once its blocker in `OPEN_QUESTIONS.md` is closed.
