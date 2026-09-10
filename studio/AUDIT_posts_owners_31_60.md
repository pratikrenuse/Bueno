# Fact-check: owners_b.json, 30 LinkedIn posts (days 31 to 60)

Checked 2026-09-10 against `/home/claude/bc/rules/*.json` and `/home/claude/posts/GROUND_TRUTH.md`.
Method per `/home/claude/bc/CORRECTNESS_PROTOCOL.md`: a claim is only OK if a `verified` rule
carries it. `partial` rules are flagged with their caveat. `unverified`, `annulled` and `myth`
rules must never appear as fact in a post.

Nothing was rewritten. Corrections are offered as replacement sentences in the post's voice.

## Headline

- 23 WRONG, 88 UNSUPPORTED, 3 STALE, 17 OK.
- The single worst problem is repeated across four posts: the **48-hour squatting rule**
  (days 59 and 60) and the **national rental registration number / NRA** (days 36, 38, 43).
  The base classes the first as `myth` and the second as `annulled`. Both are stated as
  present-day fact under a named person's byline.
- Second worst: **three different tax-residency day counts across the batch** (180 on day 48,
  183 on day 31, 184 in day 31's own title). Only one can be right.
- **No post mentions Bueno at all.** No country count, no price, no licence wording appears
  anywhere in the 30 posts, so there is nothing to fact-check against the live site, and
  equally no route from any post to getbueno.com. See "Brand and CTA" at the end.

---

## Day 31 — retirement_183_line — "Day 184 changes your tax return"

Worst post in the batch for volume of unsourced tax figures. Nine separate numbers, one
supported.

**WRONG 1.** "Spend 183 days of the year in Spain and you're a tax resident."
Rule `residency.tests` (status `partial`): "more than 183 days in Spain in the calendar year".
183 days is not residency. 184 is. The post's own title says 184, so the body contradicts
the headline.
Correction: "Spend more than 183 days of the year in Spain and you're a tax resident."

**WRONG 2.** "Net assets above 700,000 euros attract roughly 0.2 to 2.5 percent."
Rule `ip.state_scale` (`verified`): the state scale runs 0.2, 0.3, 0.5, 0.9, 1.3, 1.7, 2.1 and
**3.5 percent** on the top band above 10,695,996.06 euros. 2.5 percent is not a rate on the scale.
Correction: "Net assets above 700,000 euros attract 0.2 to 3.5 percent on the state scale."

**WRONG 3.** "The visado residencia is the usual retirement route: no work, granted on proof of
around 7,200 euros of funds plus a private health policy."
Rule `visa.non_lucrative` (`partial`): 400 percent of IPREM for the main applicant, 100 percent
per dependant. At IPREM 600 a month that is **28,800 euros a year** for the main applicant.
7,200 is the annual IPREM itself, which is the figure for one dependant. The post is out by a
factor of four on the number a retiree would budget against.
Correction: "The visado de residencia is the usual retirement route: no work, and proof of funds
at 400 percent of IPREM, about 28,800 euros a year, plus private health cover."
Caveat from the rule: IPREM has been frozen at 600 a month and no 2026 instrument was found.
Re-check every January before this figure goes out.

**UNSUPPORTED 4.** "You're typically liable if annual employment income tops 22,000 euros, if
you're self-employed or run a business in Spain, if rental income goes over 1,000 euros a year,
or if capital gains and savings income go over 1,600."
No rule in the base covers IRPF filing thresholds. Outside the base's coverage entirely. Four
euro figures, none checkable here. Either source each to the AEAT filing-obligation page or cut
the sentence.

**UNSUPPORTED 5.** "Assets held abroad worth more than 50,000 euros have to be declared as well."
Modelo 720. No rule in the base. Note the modelo 720 penalty regime was struck down by the CJEU
in 2022 and rebuilt, so this is exactly the kind of claim that needs a live primary source.
Honest wording: "Assets held abroad above a threshold have to be declared on modelo 720. Check
the current threshold and deadline with your gestor."

**UNSUPPORTED 6.** "Between 65 and 75 the personal allowance is 6,700 euros, rising to 8,100
once you're past 75."
No rule in the base for IRPF personal allowances by age. Two euro figures, unsourced.

**UNSUPPORTED 7.** "Pensions are taxed as general income, so they sit on the progressive scale."
No rule. Also treaty-dependent: `residency.treaty_override` (`verified`) confirms a double tax
treaty tie-breaker overrides the domestic test, and government service pensions are commonly
treated differently under those treaties. Stating it flat is not safe.

**UNSUPPORTED 8.** "Homeowners get a further 300,000 euro allowance against their main home."
Rule `ip.main_home_allowance` (`partial`, 300,000 eur) requires the property to be the taxpayer's
**vivienda habitual**, needing three continuous years of residence. The rule's own note: "A
non-resident whose Spanish property is a second home does not qualify." Written as "homeowners
get", to an audience of foreign second-home owners, it tells most readers the opposite of the truth.
Correction: "There's a further 300,000 euro allowance, but only against a main home you've lived
in for three continuous years. A holiday home doesn't qualify."

**UNSUPPORTED 9.** "Madrid and Andalucia don't charge it at all."
No rule in the base covers regional wealth-tax bonificaciones. And the post omits the rule that
neutralises the point: `itsgf.in_force` (`verified`) — the Impuesto Temporal de Solidaridad de
las Grandes Fortunas is still in force, prorogued indefinitely, confirmed operative in 2026 by
Orden HAC/652/2026. `itsgf.thresholds` (`verified`): hecho imponible at 3,000,000 euros of net
wealth, tax effectively starting around 3.7 million. The rule notes it is "absent from most
English-language guidance for foreign owners." A post naming the two zero-rate regions without
naming the state tax that catches those same people is materially misleading.

**UNSUPPORTED 10.** "The visado nacionale lets you live, work and study, renews every year and
expects at least six months annually in the country."
No such visa in the base, and "visado nacionale" is not the Spanish term. The base covers only
`visa.non_lucrative`, `visa.digital_nomad` and `visa.golden_closed`. Cut or replace with a
sourced route.

**UNSUPPORTED 11.** "those policies run 50 to 200 euros a month" (private health cover).
Market pricing, no rule, no source.

**Omission against a verified rule.** "With an EU or EEA passport, Norway included, you can retire
in Spain without a visa or residence permit."
True as far as it goes, but `eu.registration_over_three_months` (`verified`) requires an EU or EEA
citizen residing more than three months to register **in person** in the Registro Central de
Extranjeros, on form EX-18, within three months of entry. The post leaves a Norwegian reader
believing there is no formality at all.

**Omission 2.** `residency.treaty_override` (`verified`) — Norway, Sweden, Germany, the UK and
France all have treaties with Spain, and the rule says any residency output "must say so rather
than returning a bare domestic-law verdict." The post gives a bare domestic-law verdict.

**Omission 3.** `ip.filing_trigger` (`verified`): a Patrimonio return is due where assets exceed
2,000,000 euros even when no tax is payable. Relevant to exactly this reader and absent.

**OK:** the 700,000 euro figure itself — `ip.minimo_exento` (`verified`).

## Day 32 — retire_coast_shortlist — "Six coasts, not two"

No tax or legal claims. Fourteen statistics, none within the base's coverage (the base covers
Spanish tax and property law, not geography or demographics). Listing them so they can be sourced
or cut, not because the base contradicts them.

**UNSUPPORTED.** Costa del Sol "160 kilometres of coastline"; Canaries "about 60 miles off the
Moroccan coast"; Canaries "winter temperatures around 20C"; Costa Blanca "runs 200 kilometres
from Denia down to Pilar de la Horadada"; "summers averaging 29C"; "roughly eighteen smaller
towns and villages nearby"; Costa del Azahar "120 kilometres of beaches and coves"; "an hour
from Valencia"; Mallorca "around 900,000 people, a fifth of them not Spanish"; "41 marinas, 21
golf courses, 200 beaches and some 2,500 restaurants"; Menorca "50 kilometres wide, 25 miles
from Mallorca"; "more than 4,000 Brits mostly around Mahon"; Costa de la Luz "well over 3,000
hours of sunshine a year".

Two notes. Menorca's dimensions mix kilometres and miles inside one sentence. And the sunshine
claim here ("3,000 hours") sits alongside "around 330 days of sun" on day 40 and "over 300 days
of sun" on day 51 — three different measures of the same selling point across one batch.

## Day 33 — village_or_city_spain — "The February test for your shortlist"

Lowest-risk post in the batch. No tax, legal, euro or deadline claims.

**UNSUPPORTED.** "Seville and Cordoba reach 40C in summer without trying." Outside base coverage.

Everything else is judgement rather than fact and reads as such.

## Day 34 — s1_before_you_leave — "The UK form you can't get later"

**UNSUPPORTED 1.** The whole premise: "Pensioners moving from the UK have one piece of paperwork
they can only sort out while they're still in the UK" / title "The UK form you can't get later".
No rule in the base covers the S1. This is a UK entitlement, outside the base's scope. The
absolute framing ("can't get later") is the part that carries reputational risk, because a reader
who has already moved will read it as being told they have lost the entitlement.
Softer wording that stays honest: "The S1 is far easier to sort before you go. Request it from
the UK while you're still there."

**UNSUPPORTED 2.** "More than 400,000 Britons have already made the move." No rule, no source.
Published figures for British residents in Spain vary widely by source and by whether they count
registered residents or estimated population. Source it or cut it.

**UNSUPPORTED 3.** "The visado de residencia covers retirement and family reunification. There's
a combined work and residence visa if you'll be employed, and a study visa that lasts as long as
the course." The base covers only the non-lucrative, digital nomad and closed golden visa routes.

**OK 1.** "post-Brexit you can still relocate and still buy property here. What changed is that
you'll pay higher taxes and handle more paperwork than an EU national doing the same thing."
Supported by `irnr.rates` (`verified`): 19 percent for EU, Iceland, Norway and Liechtenstein
residents, 24 percent for everyone else on imputed and rental income. And by
`irnr.rental.deductibility` (`verified`): expenses are deductible for EU and qualifying EEA
residents, everyone else is taxed on gross rent with no deductions. This is the batch's clearest
correct claim. Worth strengthening with the actual numbers.

**OK 2.** "The NIE is the number every foreigner needs to do anything legal in Spain" and the TIE
as the physical card. Consistent with `nie.form` (`verified`): EX-15 for the NIE, EX-17 for the TIE.

**Omission.** `nie.fee` (`verified`) is 9.84 euros. The post says "pay the fee" without it, which
is safe, but the figure is available and verified if wanted.

## Day 35 — october_ibi_month — "October is the month owners miss"

The post is a deadline calendar. Two of its deadline claims are out of date and the one deadline
that actually falls this month is missing.

**STALE 1.** "January is when annual rental income returns for the previous year are usually filed."
Rule `deadline.rental.2024_2025` (`verified`): rent accrued in 2024 and 2025 is filed 1 to 20
January of the following year. Rule `deadline.rental.from_2026` (`verified`): rent accrued **from
2026** is filed in the first 20 calendar days of **April** of the following year, direct debit 1
to 15 April. Published on 10 September 2026, "January" is right for last year's rent and wrong for
this year's.
Correction: "Rent you earned in 2025 was filed last January. Rent you earn from 2026 is filed in
the first 20 days of April the following year, so the next one is April 2027."

**Material omission, and it is this month.** `deadline.rental.last_quarterly` (`verified`): "The
last quarterly rental filing is Q3 2026, due 1 to 20 October 2026. Income accrued from 1 October
2026 goes into the annual April 2027 window." The rule is flagged IMMEDIATELY ACTIONABLE. A post
titled "October is the month owners miss", published in September 2026, names IBI and rubbish tax
and misses the one-off modelo 210 deadline that falls in the same month for every letting owner.

**Incomplete on a verified rule.** "December is the usual deadline, 31 December, for annual imputed
income tax on Modelo 210."
The date is right — `deadline.imputed.upto_2025` (`verified`) and `deadline.imputed.from_2026`
(`verified`) both close on 31 December. But both rules also carry a direct debit cutoff of **23
December**, and the note on the first says the eight-day gap "is the most common way an owner
believes they have paid and has not." For a post whose entire argument is that owners miss dates,
leaving out the cutoff that actually catches them is the wrong omission to make. Also, from the
2026 accrual the window does not open until 1 April, which the post's April entry does not say.
Correction: "December is the deadline, 31 December, for annual imputed income tax on Modelo 210,
but direct debit closes on 23 December. From the 2026 year the window opens on 1 April."

**UNSUPPORTED 1.** "On the Costa Blanca it usually falls due around October" (IBI). No IBI rule in
the base. The post does hedge properly ("deadlines differ across Spain and the only reliable source
is your own ayuntamiento"), which is the right shape. Keep the hedge, drop the specific month or
source it to a named ayuntamiento.

**UNSUPPORTED 2.** "rubbish tax, where the payment window often runs from late July to mid-October."
No rule. Municipal, varies. Same treatment.

**OK.** "if you only let the property for July and August, you file for those days and an imputed
income return for the months it was empty or used by you." Consistent with `irnr.imputed.base`
(`verified`) and the deadline rules.

## Day 36 — buying_2026_compliance — "Renting is a compliance question now"

**WRONG 1.** "If you plan to let at all, even occasionally, you'll generally need an NRA number,
the Numero de Registro de Alquiler, before listing anywhere like Airbnb or Booking. Having a
tourist licence doesn't exempt you."
Rule `registry.annulled` (status `annulled`): "The national registration-number procedure created
by Real Decreto 1312/2024 has been ANNULLED by the Tribunal Supremo. There is no state registration
number requirement." Three judgments: 19 May 2026 (BOE-A-2026-12300), 21 May 2026 (BOE-A-2026-13893)
and 1 June 2026 (BOE-A-2026-15677). Ground: the State lacks competence to create the registry. The
consolidated RD on BOE was updated 18 July 2026 to reflect it.
Correction: "The national rental registration number was annulled by the Supreme Court in 2026.
What binds you is the regional licence, and that varies by region and increasingly by municipality."
Supported by `registry.regional_unaffected` (`verified`): regional tourist registration and
licensing is unaffected and remains fully in force.

**WRONG 2.** "The NRA renews every year, usually by March."
Rule `registry.annual_filing_claim` (status `myth`): "The claimed annual renewal window of 1
February to 2 March never existed as described, and the underlying obligation is now void." What
existed was an annual informative declaration in February, not a renewal, and the number was never
time-limited. Article 10, which the Orden develops, was annulled.
Correction: delete the sentence. There is no annual renewal.

**UNSUPPORTED 3.** "expect a deposit of 30 to 40 percent, detailed affordability checks, a
preference for fixed rate products". No rule in the base for non-resident mortgage LTVs. Lending
practice, and it varies by lender. Two percentages presented as a rule.

**UNSUPPORTED 4.** "Not long ago a tourist licence was straightforward to obtain. Now, in the
popular rental areas, it's close to impossible."
`regional-tourist-licence.json` supports that municipalities may cap numbers (Comunitat Valenciana
and Andalucia both `verified` on that point), but the rule for Comunitat Valenciana says which
municipalities have suspended new registrations "is municipal-level and must be checked town by
town", and Andalucia's cap adoption is "not verified". "Close to impossible" across "popular rental
areas" is a generalisation the base will not carry.
Softer: "Several regions now let municipalities cap the number of tourist registrations, and some
have. It has to be checked town by town."

**Incomplete.** "wealth tax exposure varies by region."
`ip.eu_option` (`verified`): EU and EEA non-residents **may opt** to apply the autonomic rules of
the Comunidad where the greatest value of their assets sits. The rule's note is the load-bearing
part: "A non-resident who does not opt in is taxed under state rules and no regional bonificacion
applies." Exposure does not vary by region by default. It varies if you opt in, and only if you
are EU or EEA.

**OK 1.** "Non-resident property tax runs for as long as you own the place." Consistent with
`irnr.imputed.base` and `irnr.imputed.no_deductions` (both `verified`).

**OK 2.** "Certificates are a legal requirement." `epc.requirement` (`verified`): required for new
buildings and for existing buildings sold or let to a **new** tenant.
Worth adding, verified and useful: `epc.validity` — ten years, but **five years where the rating is
G**. The rule flags that a large share of older Spanish coastal stock is rated E, F or G. Note
`epc.penalties` is `unverified` — do not publish any penalty figure.

## Day 37 — alquiler_opcion_compra — "Rent to buy, explained properly"

Low legal risk. Everything factual here is contract practice, which the base does not cover.

**UNSUPPORTED 1.** "Most arrangements run two to five years." No rule.
**UNSUPPORTED 2.** "without rushing into a mortgage or wiring 10 percent for the arras contract."
The 10 percent arras figure is market convention, not law, and it is negotiable. No rule in the
base. The same figure appears on days 41 and 45, so it is worth settling once.
**UNSUPPORTED 3.** "The option fee is usually non-refundable if you walk away." Contract practice.
**UNSUPPORTED 4.** "Rent tends to run higher than the market equivalent." Market practice.

The post's hedging ("Depending on the contract, you may carry maintenance, community fees and IBI")
is the right register, and the closing instruction to have a Spanish property lawyer read it is
correct advice.

## Day 38 — seasonal_vs_tourist — "Same flat, two sets of rules"

Second-worst post. The core legal distinction it teaches is drawn on the wrong test, and it repeats
the annulled registry twice.

**WRONG 1.** "no contract needed, but the property must be shorter-let than a month to count"
(as a tourist rental).
Rule `lau.tourist_excluded` (`verified`): art. 5.e LAU excludes "temporary transfer of use of a
whole furnished dwelling in immediate-use condition, **marketed or promoted through tourist
channels**, where subject to a specific regional tourism regime." The test is the channel and the
regional regime, not a duration. The rule's note: "The dividing line is drawn by regional tourism
law, not by the LAU."
And `lau.short_term_definitions` (status `unverified`) exists precisely to stop this: "Available
guidance defines short-term letting in at least three incompatible ways: under 3 months, one to
twelve months, and under one month." The post has picked one of the three and stated it as the rule.
Correction: "What makes it a tourist rental is that it's marketed through tourist channels and falls
under your region's tourism rules. It isn't a stopwatch."

**WRONG 2.** "Both still need an NRA registration code if you list online."
`registry.annulled`. There is no state registration number requirement. Same three TS judgments as
day 36.

**WRONG 3.** "with seasonal lets you have to state the tenant's justification in your yearly NRA
declaration, so ask people why they're coming before you accept the booking."
`registry.annulled` plus `registry.annual_filing_claim` (`myth`). There is no yearly NRA declaration.
This one is worse than day 36's because it instructs the reader to change how they take bookings on
the strength of an obligation that does not exist.

**WRONG 4.** "Short stays may also face VAT of up to 21 percent."
Rule `vat.letting` (`verified`): residential letting is **exempt** from IVA; 10 percent where the
landlord provides hotel-type complementary services; 21 percent only where the operation is neither
an exempt residential let nor a hotel-type accommodation service. The rule's note: "No enacted
Spanish change to short-term let VAT has taken effect; the much-discussed 21 percent on tourist lets
remains a proposal. Do not code the speculative line."
Correction: "A holiday let without hotel-type services is exempt from IVA. Add reception, cleaning
during the stay or linen changes and it becomes 10 percent."

**UNSUPPORTED 5.** "running from weeks to under a year" (seasonal lets). `lau.seasonal_basis`
(`verified`) confirms the governing law is art. 3 LAU, uso distinto del de vivienda, but sets no such
duration. The duration claim rests on `lau.short_term_definitions`, which is `unverified`.

**UNSUPPORTED 6.** "Tourist rentals need a tourism licence, and many regions have simply stopped
issuing new ones, so a place you buy today may never qualify."
Same problem as day 36. Caps are municipal and, per the rules, unverified as to which.

**UNSUPPORTED 7.** "Seasonal lets need no tourism licence and generally can't be restricted the same
way."
Half right. `lph.scope` (`verified`): art. 17.12 is tied to the art. 5.e LAU activity, and a genuine
seasonal let under art. 3 falls outside it. But the same rule's note: "A community can still restrict
uses by other routes such as statutory clauses. The boundary is heavily litigated." And
`lau.tourist_excluded` notes regional re-characterisation criteria are unverified. Stating it as a
reliable workaround is the risk.

**UNSUPPORTED 8.** "authorities increasingly look past the label on the contract." The direction of
travel may be right but the base marks re-characterisation criteria as unverified, so it cannot be
stated as a trend that is happening.

**Understated against a verified rule.** "They may also need approval from the community of owners."
`lph.17_12.majority` (`verified`): since the current wording, a **three-fifths majority of owners who
also represent three-fifths of participation quotas** is required to **approve**, limit, condition or
prohibit tourist letting. The rule's note: "THE WORD 'APPROVE' IS THE CHANGE. Before Ley Organica
1/2025 the three-fifths rule covered only limiting, conditioning or prohibiting... Now the same
majority is needed to permit a new tourist let at all. Most guidance still describes the old
position."
`lph.17_12.effective_date` (`verified`): 3 April 2025.
`lph.17_12.retroactivity` (`verified`): no retroactive effect; an owner already carrying on the
activity may continue **only** where the tourist licence or declaracion responsable was obtained
before 3 April 2025.
"May also need approval" describes the pre-April-2025 position. This is the fact a buyer most needs.
Also available and verified: `lph.17_12.expense_surcharge` — the same majority can add up to a 20
percent increase in common expenses for the dwelling carrying on the activity.

**Omission.** `parte.obligation` (`verified`): anyone letting short-term through a portal, expressly
including private individuals, must report guest and transaction data to the Secretaria de Estado de
Seguridad **within 24 hours** and keep a documentary register. The post says a tourist let needs "no
contract", which sits badly beside a verified 24-hour reporting duty with a documentary register.

**OK.** "as a non-resident owner you're filing a non-resident tax return on the income."
`irnr.rates` and the `deadline.rental.*` rules.

## Day 39 — holiday_home_running_cost — "What the flat costs when empty"

Twelve euro figures, none of them from the base. The arithmetic is at least internally sound:
50 + 100 + 25 + 25 + 30 + 20 + 50 + 10 + 15 + 8 = 333, which matches the stated total.

**UNSUPPORTED 1, and the one that matters.** "National tax on the property comes to about 15" a month.
That is 180 euros a year of IRNR presented as a typical figure. The base makes clear it cannot be
typical: `irnr.imputed.base` (`verified`) computes on cadastral value, which varies enormously;
`irnr.imputed.rate_standing` (`partial`) applies **1.1 percent** where cadastral values were revised
by a general collective valuation in the tax period or previous ten, and **2 percent** otherwise; and
`irnr.rates` (`verified`) applies **19 percent** for EU, Iceland, Norway and Liechtenstein residents
against **24 percent** for everyone else. A British owner of an unrevised-cadastral property pays
roughly twice what a Norwegian owner of a revised one pays on the same cadastral value. One number
cannot cover that.
Honest wording: "National tax on the property depends on your cadastral value, on whether your
municipality has revised it in the last ten years, and on where you live. Work it out rather than
budget a round number."

**UNSUPPORTED 2.** Every other figure in the build-up: community 50, electricity 100, gas 25, water 25,
internet 30, insurance 20, IBI 50 a month, upkeep 10, bank account 8, total 333, management 50 to 100,
alarm 50, planning figure 400 to 500, villa electricity 300 to 500 a month over summer. None are in the
base; all are market estimates. They are presented with more precision than an estimate supports.

**Omission worth having.** `consorcio.precondition` (`verified`): Consorcio extraordinary-risk cover
is not standalone and an uninsured property has **no** Consorcio cover at all; the indemnity is capped
at the sums insured in the ordinary policy, so under-insuring the building to save premium
under-insures you against earthquake and extraordinary flood in the same proportion. A post that
budgets 20 euros a month for insurance should say what under-insuring costs.

## Day 40 — costa_blanca_eight_towns — "200km is not one place"

No tax, legal or euro claims. Town descriptions are outside the base's coverage.

**UNSUPPORTED.** "over 200 kilometres of coast"; "around 330 days of sun a year"; "daily flights from
across Europe"; Denia's "daily ferries to the Balearics"; Xalo "about half an hour from the beach" and
"one of the area's best known wine regions"; Torrevieja's "nature park with two salt lakes".

The 330-days figure conflicts with day 51's "over 300 days of sun" and day 32's "well over 3,000 hours".
Pick one and use it consistently.

## Day 41 — property_search_start — "Apply for the NIE before you view"

**STALE 1.** "On the Costa Blanca it's 10 percent of the property price" (purchase tax).
Rule `itp_resale`, Comunitat Valenciana (status `partial`): general rate **9 percent from 1 June 2026,
was 10**. The Costa Blanca is in the Comunitat Valenciana. The post is quoting the rate that applied
until three months before publication.
Correction: "On the Costa Blanca, transfer tax on a resale is 9 percent, down from 10 in June 2026."
Two caveats the rule attaches and the post must respect: the rule is `partial`, and "an 11 percent band
above 1,000,000 euros applied as at 29 April 2026; survival of that band after the June cut is NOT
confirmed."

**WRONG 2 (same sentence, second error).** "purchase tax varies by area. On the Costa Blanca it's 10
percent of the property price."
Two problems beyond the rate. First, it conflates resale and new build. A new build on the Costa Blanca
is **10 percent IVA** (`vat.newbuild.mainland`, `verified`) **plus 1.4 percent AJD** (`ajd_new_build`,
Comunitat Valenciana, `verified`, "From 1 June 2026, was 1.5"), not transfer tax. Second, the base is
not the price. `itp.base.valor_referencia` (`verified`): "The taxable base for ITP and AJD on immovable
property is the valor de referencia published by the Direccion General del Catastro, or the declared
price or consideration where that is higher. The base is the greater of the two." In force since 1
January 2022.
Correction: "On the Costa Blanca a resale is taxed at 9 percent, a new build at 10 percent IVA plus 1.4
percent stamp duty. And the tax is charged on the higher of your price and the Catastro's valor de
referencia, so check that figure before you budget."

**WRONG 3.** "EU and EEA buyers need an EU Registration Certificate beyond 90 days."
Rule `eu.registration_over_three_months` (`verified`): the duty arises where the citizen "resides in
Spain for **more than three months**", the application is made within three months of entry, on form
EX-18, at the Registro Central de Extranjeros. Three months is not 90 days, and more importantly the
post has borrowed the Schengen number and attached it to a different regime. The rule's note also says
registration "is a residence formality, not a limit on time in the country", which the post's phrasing
("need ... beyond 90 days") reverses.
Correction: "EU and EEA buyers who live in Spain for more than three months register at the Registro
Central de Extranjeros on form EX-18. It's a formality, not a limit on your time here."

**UNSUPPORTED 4.** "The good part is you walk out with the number the same day."
No rule on issue times. And the base's own safe wording on this document is being missed:
`nie.permanence` (`partial`) — "Your NIE number stays with you. The certificate that proves it is only
accepted for three months, so banks, notaries and tax offices may ask for a fresh one." That is the fact
a buyer needs and the post does not carry it, while asserting a same-day claim it cannot support.

**UNSUPPORTED 5.** "Many experts suggest allowing at least 10 percent on top of the price to cover
notary, purchase taxes, land registry fees and legal costs."
No rule. And day 45 of the same batch says "6 to 10 percent" for the tax alone. The two posts give
readers different budgets.

**UNSUPPORTED 6.** "Agent fees usually sit with the seller, though it isn't unusual for the buyer to
pay them, normally around 3 percent." Market practice, no rule.

**UNSUPPORTED 7.** "if you plan to let for periods under a month, check the property qualifies for one."
The under-a-month test again, resting on `lau.short_term_definitions` (`unverified`). See day 38.

**Material omission on a verified rule.** "non-EU buyers, Brits included, get 90 days in any 180."
The headline is right — `schengen.short_stay` (`verified`), 90 days in any 180-day period. But the rule
carries two notes the post drops, and they are the two things owners get wrong:
(a) "The window is measured against the 180 days preceding EACH day of stay, so a plan has to be tested
on every day of a trip, not only its first or last day", and the allowance is for the Schengen area as
a whole, so "a week in France spends the same allowance as a week in Alicante".
(b) `schengen.entry_exit_days` (`verified`): entry day and exit day each count as a full day. "A
four-night stay is five days. This is where most owners undercount."

**OK.** "The NIE, the Numero de Identidad de Extranjero, is the foreign identity number everyone buying
in Spain has to have." `nie.form` (`verified`). The fee, if wanted, is 9.84 euros (`nie.fee`, `verified`).

## Day 42 — leasehold_freehold — "Freehold or leasehold: check before arras"

Low risk. The base has no rules on tenure types, the Nota Simple or mortgage underwriting, so nothing
here is contradicted, but nothing is supported either.

**UNSUPPORTED 1.** "usually 30 to 99 years" (leasehold terms). No rule.
**UNSUPPORTED 2.** "typically with at least 60 to 75 years left on the lease" (mortgageability). No rule.
**UNSUPPORTED 3.** "Online is more convenient and more expensive" (Nota Simple). No rule, and the
registry tariff for a nota simple is a published fixed figure, so this is checkable and should be checked.
**UNSUPPORTED 4.** "Spanish banks clearly prefer freehold." Lending practice.

**OK.** "maintenance, community fees and property taxes such as non-resident income tax are all yours."
`irnr.imputed.base` and `irnr.imputed.no_deductions` (both `verified`).

Opening line is strong and accurate in substance: derecho de uso, usufructo and concesion administrativa
are indeed not ownership.

## Day 43 — hidden_time_cost — "The time cost nobody budgets for"

**WRONG 1.** "Short and mid-term lets now need registration for a national identification number, and
failing to do it has meant properties pulled from platforms and severe fines."
`registry.annulled`. Third appearance of this error in the batch. The word "now" makes it worse — it
asserts currency for a procedure annulled by the Supreme Court in May and June 2026 and reflected in the
BOE consolidated text on 18 July 2026.
Note what does survive, per `registry.survives` (`verified`): the Ventanilla Unica Digital and the
platform data-sharing duties under EU Regulation 2024/1028, and art. 6.g giving platforms 48 hours to
comply with orders removing listings tied to a suspended or withdrawn number. That is not a registration
duty on the owner.
Correction: "The national registration number was annulled by the Supreme Court in 2026. What still binds
you is your region's tourist licence, and that changes region by region."

**WRONG 2.** "Miss one or file it wrong and the fine costs money, then costs you more time to unpick."
Rule `late.recargo.voluntary` (`verified`): filing late **without a prior demand** carries a surcharge of
1 percent plus 1 percent per complete month, to 12 months; from month 13 a flat 15 percent plus
late-payment interest. No interest in the first 12 months. It is a surcharge, and
`late.recargo.excludes_penalty` (`verified`) says the surcharge **excludes** any penalty. A fine only
enters once the tax office has issued a demand (`late.sancion.after_requerimiento`, `partial`).
The correctness protocol names this exact blend as a trap: "The voluntary late-filing surcharge and the
penalty after a demand are two branches. Never blend them."
Correction: "File late and you pay a surcharge, 1 percent plus 1 percent for each month you're late.
Fines only start once the tax office has written to you."

**UNSUPPORTED 3.** "You'll almost always need a Spanish account to pay taxes, community fees, utilities
and maintenance." No rule requires it. The hedge "almost always" is doing useful work here, but day 48
of the same batch states it as an absolute. They should agree.

## Day 44 — landlord_tenant_issues — "Seven landlord problems, one contract"

**STALE 1.** "And squatting, rare in well-managed occupied homes, painfully slow to unwind."
Two verified or partial rules cut against "painfully slow" as a present-tense description:
`squat.fast_track_2025` (`partial`): Ley Organica 1/2025 added allanamiento de morada and usurpacion to
the fast-track criminal route in art. 795.1.2 LECrim from 3 April 2025, with trial listed within fifteen
days of the guard court stage. The rule's note: "Timelines of 18 months to 2 years predate this reform."
`squat.civil_express` (`verified`): the civil express route under art. 250.1.4 LEC gives occupiers five
days to justify a title.
Correction: "And squatting. Since April 2025 there's a fast-track criminal route with the trial listed
inside fifteen days, and a civil express route that gives occupiers five days to show a title."

**Load-bearing omission.** `squat.civil_express` (`verified`) is open to natural persons, non-profits and
public social-housing bodies. The rule's note: "an owner who holds the property through a company or SL
is EXCLUDED from this route and must use the ordinary one." That is a material planning point for exactly
this readership and appears nowhere in the batch.

**UNSUPPORTED 2.** "tenant protections here are relatively strong and eviction is slow compared with
somewhere like the UK." No rule, and a cross-border comparison the base cannot carry.
**UNSUPPORTED 3.** "Landlords generally cover structural issues and major repairs while tenants handle
minor wear and tear." LAU substance, not in the base.
**UNSUPPORTED 4.** "Unauthorised subletting, where you can request termination for breach of contract."
Not in the base.
**UNSUPPORTED 5.** "repeated disturbances can lead to restrictions on renting in some buildings." The
mechanism does exist (`lph.17_12.majority`, `verified`), but the post's version is vague where the rule is
specific: three-fifths of owners and of quotas.

**Material omission.** `parte.obligation` (`verified`): guest and transaction data reported to the
Secretaria de Estado de Seguridad within 24 hours of the start of the service, plus a documentary register,
expressly binding on private individuals letting short-term through portals. Anexo I includes payment data.
A post listing seven landlord problems that omits the one with a 24-hour clock on it is incomplete.

## Day 45 — accountant_non_resident — "Do you need a Spanish accountant?"

**WRONG 1.** "New build means VAT on top, a resale means Property Transfer Tax, and between them you're
budgeting somewhere in the region of 6 to 10 percent."
The range is too low at the top on both branches.
New build, mainland or Balearics: `vat.newbuild.mainland` (`verified`) is **10 percent IVA**, and stamp
duty comes on top — `ajd_new_build` (`verified`): 1.4 percent Comunitat Valenciana, 1.2 Andalucia, 1.5
Galicia, 0.75 Madrid and Canarias, and **2 percent in Region de Murcia**, which the rule flags as "Highest
in Spain and a common source of underestimation on new builds." So 10.75 to 12 percent, not 6 to 10.
Resale: `itp_resale` — Canarias 6.5 (`verified`), Andalucia 7 (`verified`), Comunitat Valenciana 9
(`partial`), Illes Balears banded (`verified`) **8, 9, 10, 12 and 13 percent** by tranche, reaching 13
above 2,000,000 euros. Again above 10.
Correction: "A new build in mainland Spain or the Balearics is 10 percent IVA plus stamp duty of 0.75 to 2
percent, depending on the region. A resale is transfer tax at the regional rate: 6.5 percent in the
Canaries, 7 in Andalucia, 9 on the Costa Blanca, and a banded 8 to 13 percent in the Balearics."

**WRONG 2 (same sentence).** "New build means VAT on top" is wrong in the Canaries.
`igic.canarias` (`verified`): "A new-build home in the Canary Islands is subject to IGIC, not IVA. The
Canaries sit outside the EU VAT territory. General rate 7 percent." The rule's note is directly about this
readership: "the 5 and 3 percent rates require vivienda habitual. A non-resident buying a Canary holiday
home pays the 7 percent general rate. This is often labelled 'VAT 7 percent'. The rate is right, the label
is wrong."

**UNSUPPORTED 3.** "When you sign the Arras you transfer 10 percent of the value, often straight to the
seller." Market convention, negotiable, no rule. Third different arras/deposit framing in the batch
(days 37, 41, 45).

**UNSUPPORTED 4.** "Property scams get more sophisticated every year." Unverifiable.

**Material omission, and it is the post's own subject.** The post is about "the costs above the listing
price". `itp.base.valor_referencia` (`verified`, in force 1 January 2022) is the single biggest such
surprise: the tax base is the **higher** of the agreed price and the Catastro valor de referencia. Buy
below valor de referencia and you are taxed as if you had paid it. That belongs in this post and is absent.

**OK.** "Owning property, earning income or holding assets in Spain brings Non-Resident Income Tax among
others." `irnr.rates`, `irnr.imputed.base` (both `verified`).

## Day 46 — nie_to_dni — "NIE to DNI: the day after the jura"

Almost the whole post sits outside the base's coverage. The base covers NIE forms and fees
(`immigration-documents.json`) but nothing on naturalisation or DNI issue. Flagging accordingly rather
than guessing.

**UNSUPPORTED 1.** "Citizenship comes by residency, usually 10 years and less in some cases, by marriage,
by descent, or through specific national programmes." Outside base coverage.
**UNSUPPORTED 2.** "A recent original Certificado de Empadronamiento, usually issued within the last 90
days." Outside base coverage. Note `nie.permanence` (`partial`) gives three months for a **certificado de
no residente**, which is a different document; do not let the two collapse into each other.
**UNSUPPORTED 3.** "A passport photo, 32mm high by 26mm wide." Outside base coverage.
**UNSUPPORTED 4.** "And around 12 euros for the fee, paid in person in cash or by card."
Outside base coverage, and there is a collision worth noting: `nie.fee` (`verified`) lists, from the same
fee annex, "certificado de registro de ciudadano de la UE **12.00**". A 12 euro figure attached to the DNI
may have been borrowed from the wrong line of that annex. Source the DNI tasa directly.
**UNSUPPORTED 5.** "Ten to fifteen minutes if everything is in order, and many stations print the card
immediately." Outside base coverage.

**Needs rewording against a partial rule.** "From that point your NIE no longer applies."
`nie.permanence` (`partial`): "The NIE number is personal, unique and sequential." The rule's explicit
instruction: "Never say 'the NIE expires'." What changes is which document you identify with, not the
existence of the number, and the post's own closing paragraph, telling readers to update the number with
banks and the tax office, contradicts the sentence.
Softer: "From that point you identify with the DNI rather than the NIE."

**OK in substance.** Spain opening a new Civil Registry birth record on naturalisation is not covered by
the base either, but it is the post's central claim and everything else hangs off it. It needs a primary
source before publication under a real name.

## Day 47 — spanish_citizenship — "Citizenship: the clock resets quietly"

**WRONG 1.** "For families with property here, it also simplifies inheritance and long-term planning in a
way permanent residency doesn't."
This is backwards, and it is the one claim in the post the base does speak to.
`succession.eu_election` (`verified`): under EU Regulation 650/2012 a person may choose the law of a State
whose nationality they hold; the choice must be made expressly in a will; the default is the law of
habitual residence at death. The rule's note: "THE SINGLE MOST USEFUL FACT FOR A FOREIGN OWNER. A
Norwegian, Swedish, German, British or French owner can displace the Spanish legitima entirely, but ONLY
through a will."
`succession.legitima` (`partial`): under the Civil Code the legitima for children and descendants is two
thirds of the estate.
The post itself says applicants may face "renouncing your previous nationality if you have no dual rights
with Spain". Renouncing the other nationality removes the very nationality whose law could be elected, and
habitual residence in Spain makes Spanish law the default. Taking Spanish nationality can therefore make
Spanish forced heirship harder to displace, not easier.
Correction: "Nationality doesn't simplify inheritance. Under EU Regulation 650/2012 you can choose the law
of a nationality you hold, but only in a will. Check what changing nationality does to that choice before
you apply."
Also relevant and absent: `succession.foral` (`verified`) — six communities have their own succession law,
and which applies turns on vecindad civil, not on where the property sits.

**UNSUPPORTED 2.** "normally 10 years lived legally and continuously in the country immediately before
applying". Outside base coverage.
**UNSUPPORTED 3.** "marriage, which needs at least a year married and living together in Spain". Outside
base coverage.
**UNSUPPORTED 4.** "Most applicants sit two, both run by the Instituto Cervantes. The CCSE ... The DELE
A2". Outside base coverage.
**UNSUPPORTED 5.** "Some certificates are only valid for 90 days." Outside base coverage; see the
`nie.permanence` three-month point on day 46, which is a different document.
**UNSUPPORTED 6.** "renouncing your previous nationality if you have no dual rights with Spain." Outside
base coverage, and consequential enough for a Norwegian, Swedish, German or British reader that it must be
sourced or cut.

## Day 48 — credit_card_fees — "Why a Spanish credit card says no"

**WRONG 1.** "If you spend fewer than 180 days a year in Spain, have no income there and no spouse or
child living there, you're a non-resident."
Rule `residency.tests` (`partial`): the permanence test is **more than 183 days** in the calendar year.
180 is not the number in any of the three tests. This is the third different figure for the same line in
one batch: 180 here, 183 on day 31, 184 in day 31's title.
Correction: "If you spend 183 days a year or fewer in Spain, have no income there and no spouse or child
living there, you're a non-resident."
Second problem in the same sentence: it merges two different concepts. Banks classify accounts as
residente or no residente on documentary evidence, typically a certificado de no residente. Tax residency
is decided by `residency.tests`, and `residency.day_counting` (`verified`) makes it more complicated than a
day count: "sporadic absences ... are ADDED to the count unless tax residence elsewhere is proved by
certificate", and there is no de minimis trip length. The post should not let a bank rule and a tax rule
share a sentence.

**UNSUPPORTED 2.** "you will need a Spanish account, since transactions relating to the property have to
run through one."
Stated as a legal requirement. No rule in the base imposes it, and day 43 hedges the same claim as "almost
always". Either find the source or match day 43's hedge.

**UNSUPPORTED 3.** "the credit rating you built at home stays at home. It means very little to a Spanish
bank." Plausible, unsourced.
**UNSUPPORTED 4.** "holding a card for a minimum period can be part of the terms you sign" on a mortgage.
Lending practice, no rule.

**Omission.** `nie.permanence` (`partial`) carries the bank-facing fact the post needs: the certificate
that proves your NIE "is only accepted for three months, so banks, notaries and tax offices may ask for a
fresh one."

**OK on brand.** No bank is named anywhere in the post, which is correct.

## Day 49 — invest_locations — "Where you buy decides if you can let"

**UNSUPPORTED 1, and the base's instruction is explicit.** "Barcelona has stopped issuing tourist
licences, so new buyers can't legally short-let there, and Catalonia's rules push investors toward
long-term rentals or living in the place themselves."
`regional-tourist-licence.json`, Catalunya entry, status `unverified`: "BLOCKED. Every Generalitat host
(portaljuridic, canalempresa, tramits.gencat.cat) is disallowed to automated fetching. The commonly
repeated points, a municipal urbanistic licence required in 262 municipalities, the Registre de Turisme de
Catalunya, and existing HUT licences expiring five years after entry into force, are NOT verified. **Do
not publish anything for Catalunya.**"
Two sentences of Catalunya-specific licensing claims in a post that tells readers to choose a city on
exactly this basis.

**UNSUPPORTED 2.** "The Costa Brava carries restrictions too, which is why owners there tend to look at
mid-term or long-term letting instead." Catalunya again. Same rule, same instruction.

**UNSUPPORTED 3.** "Madrid is expensive and has one of the most reliable property markets in Europe." A
comparative market claim with no source.

**UNSUPPORTED 4.** "Valencia, the third largest city". Outside base coverage.

**UNSUPPORTED 5.** "Spain has been cracking down on illegal and short-term tourist rentals to ease its
housing problem, and the effect is local rather than national." The second half is well supported by
`registry.regional_unaffected` (`verified`) and by the regional licence rules. The first half is framing
and is fine. Keep the second, source or soften the first.

**Available and unused.** The post's whole argument is that permission is local. `registry.annulled` and
`registry.regional_unaffected` make that point with a Supreme Court judgment behind it, and would let the
post say something true and specific instead of something unverified about Barcelona.

## Day 50 — utilities_setup — "Utilities: start at the arras, not keys"

**UNSUPPORTED 1.** "If you go the gas route, the appliances have to be checked every year for compliance
and safety, at around 70 euros."
No rule in the base covers gas installation inspections. This is a stated legal duty plus a euro figure,
which is the highest-risk shape a claim can take, and the inspection cycle for domestic gas installations
in Spain is commonly described on a multi-year cycle rather than annually. Do not publish "every year"
plus "70 euros" without a primary source.

**UNSUPPORTED 2.** "Gas is less popular here than elsewhere in Europe, and only certain areas and towns
are on the mains supply. Where it exists it can work out cheaper than electricity." Market claims.
**UNSUPPORTED 3.** "Small towns may have a single provider while cities are competitive." Market claim.

**OK on brand.** No utility company is named anywhere. Correct.

**Omission.** `epc.requirement` (`verified`): a registered energy certificate is required on sale and on
letting to a **new** tenant, with the label annexed and the recommendations handed over. A post about
setting up a property's services should carry it. `epc.validity` (`verified`): ten years, five where the
rating is G. Do not publish penalties — `epc.penalties` is `unverified` and the bands circulating online
have no primary source that was reached.

## Day 51 — solar_panels_costs — "Spain taxed sunshine until 2019"

**UNSUPPORTED 1.** "The sun tax arrived in 2015 and made installing panels almost impossible to justify
financially. It was abolished in 2019."
Not covered by the base. The dates are the load-bearing part of the headline and the opening line, and the
repeal instrument and the later self-consumption regulation are commonly conflated in English-language
coverage, which is how a wrong year gets into a post. Source both dates to BOE before this runs, or write
it without years: "Spain taxed self-consumed solar until the rule was repealed, and installations have
climbed steeply since."

**UNSUPPORTED 2.** "What most homes see is a drop of 30 to 80 percent in their bills."
**UNSUPPORTED 3.** "Installation usually runs between 6,000 and 10,000 euros."
**UNSUPPORTED 4.** "Spain gets over 300 days of sun." Conflicts with day 40's 330.
**UNSUPPORTED 5.** "waiting times run to months, with upfront payment sometimes requested."
None in the base. All are market figures.

**OK in substance, no rule needed.** The anti-islanding point — a grid-tied system without a battery shuts
down during an outage — is a technical fact, correctly stated and correctly caveated.

## Day 52 — direct_debit_switch — "Leaving a Spanish bank is the hard part"

Lowest-risk post in the batch alongside days 33, 53 and 57. No euro figures, no rates, no deadlines, no
legal claims.

**UNSUPPORTED 1.** "In Spain a direct debit often isn't a convenience, it's the only payment method on
offer. Utility bills, social security payments and private healthcare subscriptions frequently accept
nothing else." Market practice, no rule.
**UNSUPPORTED 2.** "In the UK, banks move the direct debits across automatically once you give notice."
A UK claim, outside the base. Broadly matches how the UK switch service is described, but source it.

No bank named. Correct on brand.

## Day 53 — pest_prevention_empty — "What the noises in your walls mean"

Clean. No tax, legal, euro, rate or deadline claims anywhere in the post. Nothing to correct.

The only checkable assertions are natural-history ones ("Some cockroaches in Spain fly", repellent plants),
which are outside the base and carry no reputational exposure under a named byline.

## Day 54 — preventative_maintenance — "The sun is working on your house"

No euro figures, no rates, no deadlines. Very low risk.

**UNSUPPORTED 1.** "Valencia, the Costa Blanca and the Costa del Sol all have hard water." Outside base
coverage.
**UNSUPPORTED 2.** "older Spanish buildings are unlikely to have double glazing." Outside base coverage.

**Two verified rules the post should be using.** It is a storm-and-maintenance post that never mentions
what insurance actually covers:
`consorcio.wind_threshold` (`verified`): extraordinary wind means gusts exceeding **120 km/h**, measured as
a three-second gust. Below that, storm damage is the private insurer's problem under ordinary storm cover.
`consorcio.precondition` (`verified`): the cover is not standalone, the surcharge is collected automatically
with the premium, an uninsured property has no Consorcio cover at all, and the indemnity is capped at the
sums insured in the ordinary policy.
`consorcio.notification` (`partial`): seven days, running from when the owner **knew**, which for a
non-resident abroad is not the date of the storm. The rule says to state that plainly because "owners often
learn of damage weeks later and assume they are out of time." That is a genuinely useful, calm, on-brand
fact and it is missing.

**Also relevant.** The post's alarm line ("most vulnerable to squatters") is fine, but see days 59 and 60 —
the same theme is handled with a myth two posts later.

## Day 55 — healthcare_access_owners — "90 percent are covered. Are you?"

The base has no healthcare rules at all, so nearly every figure here is outside its coverage. Flagging
rather than guessing.

**UNSUPPORTED 1.** "Roughly 90 percent of people living in Spain are registered with the public health
system." Headline claim, also the title. No source.
**UNSUPPORTED 2.** "Prescriptions are shared, with the system paying 40 to 60 percent and you covering the
difference. Retirees pay 10 percent." Three percentages on a health entitlement, unsourced. This is the
kind of figure a reader will act on.
**UNSUPPORTED 3.** "British nationals visiting short term can still use a valid EHIC, then move to the
Global Health Insurance Card once it expires." Post-Brexit healthcare entitlement, outside the base.
**UNSUPPORTED 4.** "in Spain over a year? You can apply to join the public scheme through the Convenio
Especial and pay monthly contributions." Outside the base.
**UNSUPPORTED 5.** "After five years of living there, permanent residency opens the same access a Spanish
national has." Outside the base.
**UNSUPPORTED 6.** "some countries cap how long you can rely on it abroad." Outside the base.

**Conflated thresholds.** "Planning to stay past three months? You'll need the appropriate visa or to
register as a resident."
Two different regimes share one number here. For an EU or EEA citizen, three months is right —
`eu.registration_over_three_months` (`verified`), form EX-18, Registro Central de Extranjeros. For a
third-country national the limit is **90 days in any 180-day period** — `schengen.short_stay` (`verified`) —
which is a rolling window, not a single three-month run, and per `schengen.entry_exit_days` (`verified`)
both the entry and exit days count in full. A British reader following the post's three-month framing can
overstay while believing they are inside the limit.
Correction: "EU and EEA owners register after three months of living here. Everyone else has 90 days in any
180 across the whole Schengen area, counted against the 180 days before each day of the trip."

## Day 56 — seasonal_rental_roi — "Rental yield is a postcode decision"

**UNSUPPORTED 1.** "Barcelona is planning to revoke licences that have already been issued."
Catalunya. Status `unverified` and the base's instruction is "Do not publish anything for Catalunya." A
claim that a city will revoke existing licences is exactly the kind of thing an owner would act on.

**UNSUPPORTED 2.** "In many popular cities a newly issued licence is close to impossible to get."
Same generalisation problem as days 36 and 38. Caps are municipal, and which municipalities have adopted
them is unverified in Comunitat Valenciana and Andalucia alike.

**UNSUPPORTED 3.** "Plenty of guests will pay more for environmentally friendly touches such as solar
panels." Marketing claim, no source.

**OK, and worth saying so.** "A 100 percent tax on property purchases by non EU buyers has been floated as
a housing crisis measure. It hasn't come into effect, but it would reshape the market if it did."
`foreign_buyer_surcharge` (`verified`): "No surcharge on non-resident or foreign buyers is enacted anywhere
in Spain." The rule's note: "The proposed 100 percent charge on non-EU buyers is frequently described as
though it were in force. It is not." This post handles it correctly, names it as a proposal, and does not
overstate. It is the only place in the batch where a circulating myth is handled the right way.

**OK 2.** "Check licence availability in that exact area before you buy, not after." Matches the base's
own municipal caveat.

## Day 57 — spanish_lifestyle_owner — "Lunch at 15.30, dinner at 22.00"

No tax, legal, euro or deadline claims. Nothing in the base is contradicted.

**UNSUPPORTED 1.** "anything above 15 percent would be very unusual" (tipping). Custom, not covered.
**UNSUPPORTED 2.** "up to 15 minutes late for a restaurant booking is usually fine." Custom, not covered.

One tone note rather than a fact-check finding: "Spanish is a more direct language than English" and
"Spaniards don't like silence" are national generalisations. They are affectionate rather than negative, but
they are stated as fact about a whole country under a named person's byline in a market where a large share
of readers are Spanish.

## Day 58 — hidden_bank_fees — "The five fees on a Spanish account"

**UNSUPPORTED 1.** "On average, bank fees in Spain run higher than in other European countries." A
comparative claim, no source. It is also the post's premise.
**UNSUPPORTED 2.** "Regional banks, the cajas, were once common and many merged into larger banks after the
2008 financial crisis. A few still exist and still serve non residents." Outside base coverage.
**UNSUPPORTED 3.** "Several of the biggest banks run departments with English speakers." Outside base
coverage.

**Omission.** `nie.permanence` (`partial`) again: the resident / non-resident account split the post
describes runs on the certificado de no residente, "only accepted for three months, so banks, notaries and
tax offices may ask for a fresh one." That is the mechanism behind the paragraph and it is missing.

**OK on brand.** No bank is named. The post talks about "the biggest banks" and "the cajas" generically,
which is the right way to do it.

## Day 59 — squatter_signals — "Squatters read signals, not addresses"

**Worst post in the batch.** Its entire mechanism is a rule the base classifies as a myth, and the base
calls it "the single most damaging error in circulation on this subject."

**WRONG 1.** "Police can remove occupiers without a court order only if the occupation is caught within 48
hours of entry."
Rule `squat.48_hour_rule` (status **`myth`**): "There is no 48-hour rule in Spanish law. It does not exist
as legislation and it is not Spanish police operational practice."
The rule traces the origin: "Instruccion 1/2020 mentions 48 hours only as a FOREIGN comparison, describing
French police powers, alongside a 24-hour reference for Germany. Spain has no equivalent."

**WRONG 2.** "It deters entry, and it timestamps it, so you stay inside that 48 hour window instead of
discovering the problem on your next visit."
Same myth, now built into the product recommendation.

**WRONG 3.** "It brings in income, and it guarantees that anyone entering is found well inside the first 48
hours."
Same myth. Also "guarantees" is an overpromise on its own terms.

The correct framing is in the rule and it is better copy than the myth: "What exists instead is a test, not
a clock: solid indications the offence was committed, urgency and harm to the legitimate possessor, and
proportionality. Speed matters because it supports flagrancia and the urgency test, not because any statute
grants a 48-hour window."
Correction for the whole post: "There's no 48-hour rule in Spanish law, whatever you've read. What matters
is whether police find solid indications of the offence, urgency, and harm to you as the legitimate
possessor. Speed helps because it supports all three, not because a clock is running."

**The fact this post should be built on, and isn't.** `squat.second_home_is_morada` (`verified`): "Second
residences and seasonal residences ARE a morada, provided the legitimate occupiers carry on their private
life there, even occasionally." The rule calls this "THE MOST USEFUL FACT FOR OUR AUDIENCE, and it cuts in
their favour": a holiday home in regular personal use can be a morada, which makes the occupation the more
serious art. 202.1 offence (six months to two years prison, `squat.offences`, `verified`) and opens the
door to precautionary eviction. A purely investment property, empty and never personally used, likely falls
under art. 245.2, a fine-level offence. The rule adds that a tool must give the test and not tell a customer
which one applies.

## Day 60 — occupation_cover — "The cover most policies leave out"

Equal worst. Same myth, plus a stale timeline, plus fear-based urgency built on both.

**WRONG 1.** "Once occupiers pass the 48 hour mark, getting them out stops being a police matter and becomes
a court process."
`squat.48_hour_rule` (`myth`). There is no such mark.

**WRONG 2.** "that process runs between 18 months and 2 years depending on where in Spain the property sits."
`squat.fast_track_2025` (`partial`): Ley Organica 1/2025 added allanamiento de morada and usurpacion to the
fast-track criminal route in art. 795.1.2 LECrim with effect from 3 April 2025, and the trial is listed
within fifteen days of the guard court stage. The rule's note names this figure directly: "**Timelines of 18
months to 2 years predate this reform.**"
`squat.civil_express` (`verified`): the civil express route gives occupiers **five days** to justify a title.
Correction: "Since April 2025 there's a fast-track criminal route, with the trial listed inside fifteen days.
There's also a civil express route that gives occupiers five days to show a title."
Two caveats to carry: the fast-track rule is `partial` (disposicion final 38 of LO 1/2025 lists exceptions to
the 3 April date and could not be read), and the fifteen days is a trial listing, **not** a fifteen-day
eviction. And per `squat.civil_express`, an owner holding through a company or SL is excluded from the
express route.

**WRONG 3.** "The low season is precisely when an occupation goes unnoticed past the 48 hour window, so the
profile most exposed to the risk is the one most likely to miss the deadline that avoids it."
Same myth, and here it is the justification for buying a product.

**UNSUPPORTED 4.** "Many providers offer property insurance with illegal occupation cover, and it's often
well priced." An unsourced pricing claim attached to a product recommendation.

**Brand rule breach.** "Sit with that number for a second. For that entire period the home is out of your
hands. You can't use it, you can't let it, and the costs attached to it keep landing on you anyway."
That is fear-based urgency, which the brand rules prohibit, and it is anchored to a figure (18 months to 2
years) the base says predates the 2025 reform. The emotional pressure and the wrong number are doing the
same job in the same paragraph. This is the sentence most likely to be quoted back at whoever's name is on
the post.

---

## Brand and CTA check, all 30 posts

Mechanical scan of every title and body:

- **Em dashes: 0.** Clean across all 30.
- **Emoji: 0.** Clean.
- **Competitor banks or utilities named: 0.** No Santander, BBVA, CaixaBank, Sabadell, Unicaja,
  Iberdrola, Endesa, Naturgy, Revolut or Wise anywhere. Days 48, 50, 52 and 58 all discuss banks and
  utilities at length and keep them generic, which is exactly right.
- **"Revolutionary", "disruptive", "game-changing": 0.** Clean.
- **Fear-based urgency: 1.** Day 60, the "sit with that number" paragraph. See above.
- **Overpromise: 1.** Day 59, "guarantees that anyone entering is found well inside the first 48 hours."

**Bueno claims: none, in any post.** No post names Bueno, states a country count, states a price, or uses
the licence wording. So there is nothing here to check against the ground truth's 25+ figure, the several
price tiers on the homepage, or the approved "Licensed by the Bank of Spain via SEFIDE EDE S.L.U." wording.
Nothing is overclaimed because nothing is claimed.

**Calls to action: 30 of 30 have a behavioural CTA. 0 of 30 link to getbueno.com.**
Every post closes with an action the reader takes alone: "count the nights", "Request the S1 first", "Put
your ayuntamiento's IBI date in your phone", "Book the appointment the same week as the jura", "ask your
insurer one question". These are good closes and they suit the calm register. But not one post offers a
destination, so 30 posts of accumulated expertise send no one anywhere. That is a strategic gap rather than
a factual error, and it is worth deciding deliberately rather than by omission.

One consequence worth noting: because no post mentions Bueno, several posts recommend actions Bueno's own
product covers (utility switching on days 35 and 50, the account and fee discussions on days 48, 52 and 58,
tax filing on days 31, 35 and 39) without ever connecting them.

---

## Cross-batch inconsistencies

These are not single-post errors. They are places where the batch contradicts itself, which a reader
following the series will notice.

1. **Tax residency day count: three values.** 180 (day 48), 183 (day 31 body), 184 (day 31 title). Rule
   `residency.tests` (`partial`) says more than 183. Only day 31's title is right.
2. **Purchase cost budget: two ranges.** "at least 10 percent on top of the price" (day 41) against "6 to
   10 percent" for tax alone (day 45). Both are wrong against `itp_resale`, `vat.newbuild.mainland` and
   `ajd_new_build`.
3. **Days of sunshine: three figures.** "well over 3,000 hours a year" (day 32), "around 330 days" (day
   40), "over 300 days" (day 51).
4. **Spanish bank account: requirement or convenience.** "almost always need" (day 43) against "you will
   need ... transactions relating to the property have to run through one" (day 48).
5. **Costa Blanca coast length: two figures.** "runs 200 kilometres" (day 32) against "over 200
   kilometres" (day 40). Minor, but they are the same claim written twice.
6. **The under-one-month test.** Days 38 and 41 both use it. `lau.short_term_definitions` is `unverified`
   precisely because guidance gives three incompatible definitions.

## Counts

| Category | Findings |
|---|---|
| WRONG | 23 |
| UNSUPPORTED | 88 |
| STALE | 3 |
| OK | 17 |

Counted as findings, where a grouped list counts once. Days 32 and 40 each carry a single
UNSUPPORTED finding covering 14 and 7 separate statistics respectively, so the number of
individual unsupported statements is higher than 88.

Posts with at least one WRONG finding: 31, 36, 38, 41, 43, 45, 47, 48, 59, 60. Ten of thirty.
Posts carrying a STALE finding: 35, 41, 44.
Posts clean of WRONG and STALE findings but carrying unsupported figures: 32, 34, 37, 39, 40, 42, 46,
49, 50, 51, 52, 55, 56, 57, 58.
Posts with nothing to correct: 53. Near-clean: 33, 54, 57.

## What to fix first

1. **Days 59 and 60.** Pull both. Six sentences across the two posts state the 48-hour rule, which the base
   classes as `myth`, and day 60 pairs it with a timeline the base says predates the April 2025 reform.
   Rebuild day 59 on `squat.second_home_is_morada`, which is verified and helps the reader.
2. **Days 36, 38 and 43.** Remove every NRA and national registration claim. `registry.annulled`, three
   Supreme Court judgments, BOE consolidated text updated 18 July 2026. Replace with
   `registry.regional_unaffected`.
3. **Day 41.** The Costa Blanca purchase tax rate has been 9 percent since 1 June 2026, the base is the
   valor de referencia where higher, and new builds are IVA plus AJD, not transfer tax.
4. **Day 45.** The 6 to 10 percent range is below both the new-build and the Balearic resale reality, and
   "VAT" is the wrong tax in the Canaries.
5. **Day 31.** Three wrong figures in one post, including a retirement funds threshold out by a factor of
   four. It also carries nine unsourced tax numbers, which is more unsourced tax content than any other
   post in the batch.
6. **Day 35.** Add the Q3 2026 rental deadline, 1 to 20 October 2026. It falls inside the month the post is
   named after, it is the last quarterly return there will be, and the post is going out weeks before it.
