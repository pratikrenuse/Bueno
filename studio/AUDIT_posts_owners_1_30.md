# Fact-check audit: owners_a.json (30 LinkedIn posts)

Checked against `/home/claude/bc/rules/*.json` and `/home/claude/posts/GROUND_TRUTH.md`.
Audit date 2026-09-10. Posts are not rewritten; corrections are offered as replacement sentences
in the post's own voice.

**Tags:** `WRONG` contradicts a verified rule or the live site. `UNSUPPORTED` no rule, or the
matching rule is unverified / annulled / myth. `STALE` was right for an earlier year.
`OK` matches a verified rule. `PARTIAL-CAVEAT` matches a rule whose status is `partial`, so it
may be stated only with the rule's own caveat.

**Coverage note.** The rules base covers Spanish tax, property, letting, succession, immigration,
insurance and community law. It does NOT cover: cash-handling and AML rules, bank fees and account
freezes, off-plan bank guarantees, conveyancing custom (arras, agency fees, notary and registry
tariffs), IBI rates and collection, ICIO, the Nota Simple, mortgage-law timing (FEIN), or market
statistics. Where a post makes a factual claim in one of those areas I have said it is outside
coverage rather than guessing at Spanish law from memory. Outside coverage still means the claim
cannot go out under a real person's name as fact.

---

## Headline problems

1. **Day 13 must not be published in any form.** The entire post is built on a registration regime
   the Tribunal Supremo annulled in May 2026, and on a renewal window the base classifies as a myth.
2. **Days 2, 20 and 22 all publish the quarterly Modelo 210 rental deadlines.** Those moved for
   accruals from 2024. Three posts under three names carry the same wrong deadline.
3. **Day 3 is built end to end on the 48-hour rule,** which the base classifies as `myth` and calls
   "the single most damaging error in circulation on this subject."
4. **36.5 percent as the top inheritance rate appears in days 10, 24 and 28.** The verified state top
   marginal rate is 34.00 percent, and the rule carries an explicit "do not publish it" note.
5. **The 5 percent per quarter to 20 percent late schedule appears in days 10, 24 and 28.** It is the
   pre-2021 regime, replaced by Ley 11/2021.
6. **Only one post has a call to action, and its number is wrong.** Day 8 says 30+ countries;
   getbueno.com says 25+.

---

# Day 13, rental_rule_changes, "Your NRA number needs renewing yearly"

**Do not publish. Do not rewrite. The subject of the post no longer exists.**

- `WRONG` "1 February to 2 March 2026. If you rented out your Spanish property in 2025, write that
  window down, because your NRA registration number isn't a one-time formality. It renews annually."
  Rule `registry.annual_filing_claim`, status **myth**: "The claimed annual renewal window of
  1 February to 2 March never existed as described, and the underlying obligation is now void."
  What existed was an annual informative declaration during February, not a renewal, and the number
  was never time-limited.
  Correction: delete. There is no annual NRA renewal.

- `WRONG` "The NRA, Numero de Registro de Alquiler, came into force on 1 July 2025. Every short,
  mid-term and tourist rental needs one, displayed on the listing, or you can't legally advertise on
  the big platforms."
  Rule `registry.annulled`, status **annulled**: "The national registration-number procedure created
  by Real Decreto 1312/2024 has been ANNULLED by the Tribunal Supremo. There is no state registration
  number requirement." Three judgments, 19 May, 21 May and 1 June 2026. Ground: the State lacks
  competence to create the registry.
  Correction: "The national rental registration number was struck down by the Supreme Court in May
  2026. There is no state number to hold or renew."

- `WRONG` "The code runs for 12 months, then you go round again."
  Same rules. The number was not time-limited even before the annulment.

- `WRONG` "You file through the Land Registry your property is registered under, and if you already
  hold an NRA, expect a reminder email in January."
  Moot. The filing obligation was annulled.

- `WRONG` "the platforms themselves now have to check the code is there and shown on the advert."
  Partly survives, but not as stated. Rule `registry.survives`, status verified: the Ventanilla Unica
  Digital and the platform data-sharing duties survive under EU Regulation 2024/1028, and art. 6.g
  survives, giving platforms 48 hours to comply with removal orders. The number-checking duty rested
  on annulled articles.

- `UNSUPPORTED` "in Valencia the forms famously only download on a Microsoft computer."
  No rule. Anecdote presented as fact.

- **Material omission.** Rule `registry.regional_unaffected`, status verified: "Regional tourist
  registration and licensing is unaffected by the annulments and remains fully in force." The rule
  carries a product warning: telling a foreign owner they need a national number is now wrong at
  state level. What binds them is the regional licence. That is the post that should exist here.

---

# Day 3, squatter_eviction, "The 48-hour squatter rule"

**The premise is a myth. Rebuild from the offence test, not the clock.**

- `WRONG` "You have 48 hours to get squatters out of your Spanish home without a judge."
  Rule `squat.48_hour_rule`, status **myth**: "There is no 48-hour rule in Spanish law. It does not
  exist as legislation and it is not Spanish police operational practice." The rule's notes trace the
  origin: Instruccion 1/2020 FGE mentions 48 hours only as a description of FRENCH police powers.
  Correction: "There is no 48-hour rule in Spain. What matters is not a clock but a test: clear signs
  an offence was committed, urgency, and proportionality."

- `WRONG` "Inside those first 48 hours, the police can remove occupiers on the spot."
  Same rule. No such window exists.

- `WRONG` "A police-connected alarm timestamps the entry and keeps you inside your 48 hours."
  Same rule. The advice is sound, the reason given is false.
  Correction: "A police-connected alarm timestamps the entry, which is what supports the urgency test."

- `WRONG` "Occupying an 'uninhabited' one, okupacion, is much softer. Guess which category your empty
  holiday home falls into."
  Rule `squat.second_home_is_morada`, status verified: "Second residences and seasonal residences ARE
  a morada, provided the legitimate occupiers carry on their private life there, even occasionally."
  The post tells owners the opposite of the fact that most helps them.
  Correction: "A holiday home you actually use is treated as a morada, even if you are only there a
  few weeks a year. That puts the occupation in the more serious category, not the softer one."

- `STALE` "evictions drag: 18 months to 2 years in some regions."
  Rule `squat.fast_track_2025`, status partial: from 3 April 2025 allanamiento de morada and
  usurpacion entered the fast-track route in art. 795.1.2 LECrim, with trial listed within fifteen
  days of the guard court stage. The rule's notes: "Timelines of 18 months to 2 years predate this
  reform." The rule is partial, so it must be stated with its caveat, and it is a trial listed within
  fifteen days, NOT a fifteen-day eviction.

- `WRONG` "Miss that window and you could be looking at two years."
  Conflation. Rule `squat.offences`, status verified: six months to two years is the PRISON RANGE for
  the offender under art. 202.1 CP, not the owner's waiting time.

- `UNSUPPORTED` "Add Article 47 of the Constitution, which promises everyone decent housing, and you
  can see why evictions drag." Outside the base's coverage, and offered as a causal explanation.

- `UNSUPPORTED` "if they're still inside on that date, police can remove them by force." No rule.

- `UNSUPPORTED` "Some insurers even offer illegal occupation cover." No rule.

- **Material omission.** Rule `squat.civil_express`, status verified: the express civil route under
  art. 250.1.4 LEC gives occupiers five days to justify a title, but it is open only to natural
  persons, non-profits and public social-housing bodies. The rule is flagged "LOAD-BEARING FOR OUR
  AUDIENCE": an owner holding through a company or SL is excluded and must use the ordinary route.

- **Brand.** Fear-based framing throughout, opening on "you could be looking at two years."

---

# Day 2, irnr_who_pays, "Spain taxes your empty holiday home"

- `WRONG` "Rent the place out and the rhythm changes to quarterly, with deadlines on the 20th of
  April, July, October and January."
  Rule `deadline.rental.2024_2025`, status verified: "Rental income accrued in 2024 and 2025 is filed
  as a single grouped annual return from 1 to 20 January of the following year. Direct debit 1 to 15
  January." Its notes: "Guidance describing quarterly filing on 20 April, July, October and January
  is out of date." Rule `deadline.rental.from_2026`, status verified: from the 2026 accrual, 1 to 20
  April. Rule `deadline.rental.last_quarterly`, status verified: the last quarterly filing is Q3 2026,
  due 1 to 20 October 2026, and it is marked "IMMEDIATELY ACTIONABLE".
  Correction: "Rental income is no longer quarterly. Rent for 2025 was filed in the 1 to 20 January
  window. From the 2026 rental year it moves again, to 1 to 20 April. One quarterly return is left:
  Q3 2026, due 1 to 20 October 2026."

- `WRONG` "On a 300,000 euro property at 1.1 percent, an owner in Norway pays 19 percent of 3,300
  euros, which works out to about 627 euros a year."
  The arithmetic is right. The base is wrong. Rule `irnr.imputed.base`, status verified: the base is
  the cadastral value on the IBI receipt, "not of market value or purchase price," and the notes call
  applying the rate to market or purchase value "a common error" that "overstates the tax several
  times over." A reader will take "a 300,000 euro property" as the price they paid.
  Correction: "On a cadastral value of 300,000 euros, at 1.1 percent, an owner in Norway pays 19
  percent of 3,300 euros, about 627 a year. Cadastral values sit well below market, so take the
  figure off your IBI receipt, not off what you paid."

- `STALE` "Spain imputes income at 1.1 percent of the cadastral value, or 2 percent where there's
  been no general cadastral revision in the municipality in the last 10 tax years."
  That is `irnr.imputed.rate_standing`, status **partial**, and it is not the test that applies to the
  years currently being filed. Rule `irnr.imputed.rate_special_2023_2025`, status verified: "For 2023,
  2024 and 2025 only, the 1.1 percent rate applies where the cadastral values were revised with effect
  from 1 January 2012 onwards." Rule `irnr.imputed.rate_2026`, status **unverified**, is a declared
  BLOCKER: whether the 1.1 percent rule extends to 2026 is not established, and "a tool must not state
  a 2026 figure until this is settled."
  Correction: "For 2023, 2024 and 2025 the rate is 1.1 percent where your cadastral values were
  revised from 1 January 2012 onwards, and 2 percent where they were not. The rule for 2026 is not
  settled yet, and the 2026 filing window does not open until April 2027."

- `STALE` "The filing is Modelo 210, due by 31 December, and it always covers the previous year."
  Rule `deadline.imputed.upto_2025`, status verified, holds to 31 December for accruals up to 2025.
  Rule `deadline.imputed.from_2026`, status verified: from the 2026 accrual the window is 1 April to
  31 December of the following year. The post also omits the direct-debit cut-off, which the rule
  calls "the most common way an owner believes they have paid and has not."
  Correction: "Modelo 210 for a year up to 2025 can be filed any time in the following year, to 31
  December, but direct debit closes on 23 December. From the 2026 year the window opens on 1 April."

- `PARTIAL-CAVEAT` "Spain treats you as a tax resident if any of these is true... Your spouse and
  underage children live there."
  Rule `residency.tests`, status **partial**. The family test is a REBUTTABLE presumption and requires
  a non-separated spouse AND dependent minor children. Stated flatly it reads as automatic.
  Correction: "or, unless you can show otherwise, your spouse and dependent children live there."

- `PARTIAL-CAVEAT` "Wait for them to find you instead and the fine starts at 50 percent of the tax
  owed." Rule `late.sancion.after_requerimiento`, status **partial**: art. 191 LGT could not be read
  verbatim. Must carry the caveat before it appears in public copy.

- `OK` "a surcharge of 1 to 12 percent depending on how late you are, or 15 percent plus interest
  beyond a year." Rule `late.recargo.voluntary`, verified.

- `OK` "19 percent if you live in the EU or EEA and 24 percent for everyone else. The UK now sits in
  that second group." Rule `irnr.rates`, verified.

- `UNSUPPORTED` "fines, closure of bank accounts, even confiscation of property in extreme cases."
  No rule. Also fear-based urgency, which the brand rules prohibit.

- **Omission.** Rule `irnr.imputed.no_deductions`, verified: no expenses of any kind may be deducted
  against imputed income. Worth one line in a post about the imputed charge.

---

# Day 16, buying_fees, "Same home, 6% tax or 10%, by region"

**Five of the six regional rates in this post are wrong or unpublishable.**

- `WRONG` "transfer tax runs from 4 percent in the Basque Country."
  Rule `itp_resale` / Pais Vasco, status **unverified**: "THREE separate regimes: Bizkaia, Gipuzkoa
  and Alava, each with its own Norma Foral. Never publish a single Pais Vasco rate."
  Correction: drop the Basque Country from the range.

- `WRONG` "8 percent in Andalucia."
  Rule `itp_resale` / Andalucia, status verified, general **7.0** percent. Notes: "Widely still quoted
  as 8 percent. It has been 7 percent since Ley 5/2021."
  Correction: "7 percent in Andalucia."

- `STALE` "10 percent in Valencia" and the headline "6% tax or 10%".
  Rule `itp_resale` / Comunitat Valenciana, status **partial**: general **9.0** percent from 1 June
  2026, was 10. An 11 percent band above 1,000,000 euros applied as at 29 April 2026 and its survival
  after the June cut is not confirmed.
  Correction: "9 percent in Valencia since June 2026, with a higher band on the largest purchases."

- `WRONG` "10 percent in ... Catalonia."
  Rule `itp_resale` / Catalunya, status verified, and it is BANDED: 10 percent to 600,000, 11 percent
  to 900,000, 12 percent to 1,500,000, 13 percent above. A flat 10 understates every purchase above
  600,000, which is a large share of this audience.
  Correction: "Catalonia is banded, from 10 percent up to 600,000 euros to 13 percent above 1.5
  million."

- `WRONG` "New builds ... pay 10 percent VAT plus a regional document fee of up to 1.5 percent."
  Rule `ajd_new_build` / Region de Murcia, status verified, rate **2.0** percent, with the note
  "Highest in Spain and a common source of underestimation on new builds."
  Correction: "plus regional stamp duty, which runs from 0.75 percent up to 2 percent in Murcia."

- `WRONG` "the Canary Islands sit outside the pattern altogether at 7 percent VAT."
  Rule `igic.canarias`, status verified: the Canaries are outside the EU VAT territory and apply
  IGIC, not IVA. The general rate is 7 percent, and the 5 and 3 percent rates need vivienda habitual,
  so a non-resident holiday buyer pays 7. The rule's note: "This is often labelled 'VAT 7 percent'.
  The rate is right, the label is wrong, and a reader searching for Canary VAT will find nothing."
  Correction: "The Canaries sit outside Spanish VAT entirely and charge IGIC instead, 7 percent on a
  holiday home."

- `OK` "6 percent in Madrid." Rule `itp_resale` / Madrid, verified.
- `OK` "New builds ... 10 percent VAT." Rule `vat.newbuild.mainland`, verified.
- `OK` "the application itself is tiny, 9.84 euros." Rule `nie.fee`, verified, 9.84 euros.

- **Material omission, and the most expensive one in this post.** Rule `itp.base.valor_referencia`,
  status verified: since 1 January 2022 the taxable base for ITP and AJD is the higher of the agreed
  price and the Catastro valor de referencia. A cost breakdown built on the price alone can understate
  the tax. The rule's own guidance is to present any price-based figure as a MINIMUM and point the
  reader to the Catastro lookup.

- `UNSUPPORTED`, all outside the base's coverage and all stated as fact: "Budget 12 to 14 percent on
  top of the price"; "reservation fee, usually 1,000 to 6,000 euros"; "notary fees around 1,000 euros
  on a 250,000 euro purchase"; "land registry fees of 400 to 700 euros at government-set rates";
  "help with it is worth 100 to 200 euros and no more"; agent fees "around 3 percent" in Madrid and
  "5 to 6 percent" in hotspots; "bank setup fees up to 2 percent of the loan"; "valuation reports of
  250 to 600 euros"; "Ordinary home cover runs 30 to 40 percent higher when the bank sells it";
  "resales in Spain are still negotiable, often by 10 to 20 percent". The 7,260 euro worked example
  is arithmetically correct on its own assumptions, but those assumptions are unsourced.

- **Internal contradiction.** Day 1 puts the reservation fee at "around 2,000 euros"; this post says
  1,000 to 6,000. Day 6 puts a Nota Simple at "around 10 euros online" and "under 4 euros in person";
  day 25 says "about 9 euros" plus "roughly 30 euros" in English. Different names, same week.

---

# Day 15, plusvalia, "Buying from a non-resident seller"

- `WRONG` "the seller's capital gains bill, which runs at 19 percent of profit for EU and EEA
  residents and 24 percent for others."
  Rule `irnr.rates`, status verified: "Capital gains on sale are 19 percent for everyone." The rule's
  notes name this exact error: "Capital gains are frequently quoted with the 19 and 24 percent split
  applied to them. That split is for imputed and rental income."
  Correction: "the seller's capital gains bill, which is 19 percent of the profit for every
  non-resident, wherever they live."

- `WRONG` "whoever pays has 30 days from the transfer to get the money to the council."
  Rule `plusvalia.deadlines`, status verified: "Sale: 30 WORKING days from the date of the public
  deed." Working days, so Saturdays, Sundays and holidays do not count. Roughly six calendar weeks,
  not thirty days.
  Correction: "On a sale, 30 working days from the date of the deed."

- `WRONG` "Where it's an inheritance or a gift, whoever receives the property pays. And whoever pays
  has 30 days to get the money to the council."
  Same rule: "Inheritance: six months from death, extendable to one year if requested within the
  initial six months." Applying 30 days to an inheritance is wrong by a factor of six.
  Correction: "On an inheritance it is six months from the death, extendable to a year if you ask
  inside the first six."

- `PARTIAL-CAVEAT` "But when the seller is a non-resident, the buyer pays."
  Rule `plusvalia.non_resident_seller`, status **partial**, and its notes are explicit: "Present this
  as market practice, not as a rule of law." The buyer becomes sustituto del contribuyente, the person
  the council can pursue, which is why buyers retain the estimated plusvalia out of the price at
  completion, on top of the 3 percent.
  Correction: "When the seller is a non-resident, the council can come after the buyer, so buyers
  routinely hold the estimated plusvalia back out of the price at the notary."

- `OK` "You keep back 3 percent of the purchase price and pay it to the tax authorities within one
  month of the sale." Rule `irnr.sale.retention`, verified. Worth naming modelo 211.

- `UNSUPPORTED` "It gets withheld even if the seller made no profit at all."
  Rule `irnr.sale.retention` notes: "AEAT maintains a list of cases where no withholding applies; that
  list was not read, so do not say 'always'."

- `UNSUPPORTED` "they then claim a partial or full rebate within the year."
  Rule `deadline.210.refund`, verified: a refund return may be filed from 1 February, within four
  years of the end of the filing period. "Within the year" is not the rule and reads as a deadline.

- `UNSUPPORTED` "IBI ... is fixed on 1 January and technically owed by whoever owned the place that
  day, but it's routinely split." Outside the base's coverage; market practice stated as fact.

- **Omission.** Rule `plusvalia.methods`, verified: there are two methods, and the taxpayer may elect
  the real-gain figure where it is lower. That is the reader's lever and it is missing.

---

# Day 30, brexit_buying, "What Brexit really changed"

- `WRONG` "EU, EEA and Swiss owners don't face that, though they do have to register once they stay
  beyond 90 days."
  Rule `eu.registration_over_three_months`, status verified: registration in the Registro Central de
  Extranjeros is required for residence of more than THREE MONTHS, applied for within three months of
  entry, on form EX-18. Three months is not 90 days, and the post has merged an immigration allowance
  with a residence formality, which the base keeps deliberately apart. The same rule says: "RD
  240/2007 was read for EU and EEA nationals only, so do not cite this rule as authority for
  Switzerland."
  Correction: "EU and EEA owners have no 90-day cap. They do have to register at the Registro Central
  de Extranjeros if they stay more than three months, on form EX-18."

- `WRONG` "the digital nomad visa ... with a guideline of around 2,500 euros a month, roughly 200
  percent of the Spanish minimum wage."
  Rule `visa.digital_nomad`, status **partial**, notes in capitals: "DO NOT PUBLISH A EURO FIGURE.
  The Instruccion says 200 percent of the SMI monthly but does not state whether the base is the
  12-payment monthly figure or the annual figure divided by twelve. The two readings give roughly
  2,442 and 2,849 euros a month. State the rule as '200 percent of the Spanish minimum wage'."
  2,500 matches neither reading.
  Correction: "the digital nomad visa asks for 200 percent of the Spanish minimum wage. How that is
  calculated is read two ways, so check the current figure before you plan around it."

- `WRONG` "proof of roughly 28,000 euros a year for the main applicant."
  Rule `visa.non_lucrative`, status **partial**: 400 percent of IPREM, IPREM at 7,200 a year, so
  **28,800** for the main applicant and 7,200 per dependant. The 600 euros a month per family member
  in the post is right; the headline figure is 800 euros short.
  Correction: "proof of 28,800 euros a year for the main applicant plus 7,200 per family member,
  figures tied to IPREM and worth re-checking each January."

- `OK` "Tax on rental income rose from 19 to 24 percent for Brits, and worse, rental expenses can no
  longer be deducted before the tax applies." Rules `irnr.rates` and `irnr.rental.deductibility`, both
  verified. This is the strongest paragraph in the post.

- `OK` "the purchase costs, tax, notary and registration fees, are identical for UK and EU buyers."
  Rule `foreign_buyer_surcharge`, verified: "No surcharge on non-resident or foreign buyers is enacted
  anywhere in Spain."

- `OK` "90 days in any 180 without a visa." Rule `schengen.short_stay`, verified.

- `OK` "The Golden Visa route ... has closed to new applicants, though existing holders can still
  renew on the original conditions." Rule `visa.golden_closed`, verified. Note the rule adds that the
  whole investor route closed, not only the property variant.

- **Material omission, and the one most likely to get a reader stopped at a border.** Rule
  `schengen.short_stay` notes: "The window is measured against the 180 days preceding EACH day of
  stay, so a plan has to be tested on every day of a trip, not only its first or last day. The
  allowance is for the Schengen area as a whole, not for Spain alone, so a week in France spends the
  same allowance as a week in Alicante." And rule `schengen.entry_exit_days`, verified: entry day and
  exit day each count as a full day, "so a four-night stay is five days. This is where most owners
  undercount." A Brexit post for owners that gives the 90/180 number without either of these is
  giving them the part that is easy and skipping the part that catches them.

- `UNSUPPORTED` "It renews after the first year, then every two." No rule.

---

# Day 10, inheritance_foreign_law, "One will clause opts out of Spanish law"

- `WRONG` "Rates are progressive, running from about 7.65 to 36.5 percent."
  Rule `isd.state_scale`, status verified: bottom marginal rate 7.65 percent, top marginal rate
  **34.00** percent on the excess above 797,555.08 euros. The rule's notes: "CORRECTION: 36.5 percent
  is NOT the state top marginal rate. A top rate of 36.5 percent is widely quoted. Do not publish it."
  The rule also warns that 34 is not the ceiling on what is actually paid, because the art. 22
  multipliers by kinship group run up to 2.4000 for Group IV.
  Correction: "State rates run from 7.65 percent to 34 percent, and multipliers push the effective
  rate higher for distant relatives and unmarried partners."

- `STALE` "unpaid tax adds 5 percent every 3 months up to a ceiling of 20 percent."
  Rule `late.recargo.voluntary`, status verified: 1 percent plus a further 1 percent for each complete
  month up to 12 months, then a flat 15 percent plus interest. The notes: "This replaced the old
  5/10/15/20 tiers via Ley 11/2021... A schedule of 5 percent every three months to a maximum of 20 is
  the pre-2021 regime and no longer applies." Rule `isd.deadlines` repeats the warning.
  Correction: "Late filing adds 1 percent plus 1 percent for each full month, and 15 percent plus
  interest once you pass a year."

- `WRONG` "Half of the joint property goes to your spouse."
  Rule `succession.gananciales_first`, status verified: under sociedad de gananciales the community is
  liquidated FIRST, and only the deceased's half plus their private property forms the estate. The
  spouse's half is already theirs; nothing "goes to" them on death. The rule's notes call this "THE
  ERROR TO AVOID, and it is a common one." It also only applies where the couple actually hold under
  gananciales, which the post does not say.
  Correction: "If you held under the Spanish community regime, half the community property was
  already your spouse's. Only your half, plus anything held in your own name, forms the estate."

- `PARTIAL-CAVEAT` "one third divided equally between your children, a second third divided between
  the children as you wish, and only the final third free."
  Rule `succession.legitima`, status **partial**: the underlying Civil Code articles could not be read
  verbatim. Usable with the caveat, but the rule adds "Do not cite article numbers to customers until
  read."

- `UNSUPPORTED` "anyone who dies after 17 August 2015 can choose the inheritance law of their home
  country."
  Rule `succession.eu_election`, status verified, says a person may choose "the law of a State whose
  NATIONALITY they hold." Nationality, not home country or country of residence. For a British owner
  living in Norway the two answers differ.
  Correction: "you can choose the law of a country whose nationality you hold."

- `UNSUPPORTED` "The choice must be stated clearly, in a Spanish or international will."
  Same rule: the choice "must be made expressly in a disposition of property upon death, or be
  demonstrated by its terms." A foreign will can carry it. The post narrows the options unnecessarily.

- `UNSUPPORTED` "Andalucia is among the gentlest in the country." No rule for regional ISD reductions.

- `UNSUPPORTED` "Leave no will whatsoever and the order gets decided for you. Children first, natural
  and adopted, then the parents of the deceased, then the surviving spouse..." Intestacy order is not
  in the base.

- `UNSUPPORTED` "Assets held outside Spain stay outside Spanish inheritance tax, unless the
  beneficiary happens to be a Spanish resident." Outside the base's coverage.

- **Material omission.** Rule `succession.spouse_usufruct`, status verified: where the surviving
  spouse concurs with children, they take the usufruct of the tercio de mejora, "expressly. Not the
  legitima estricta and not the free third." The post describes the mejora third as freely divisible
  among the children and never mentions the spouse's usufruct over it.

- **Material omission.** Rule `succession.foral`, verified: six communities have their own succession
  law that displaces the Civil Code, and "the rules differ sharply, not marginally." Catalonia's
  legitima is one quarter and is a credit rather than a share of assets; Navarra has near-total
  freedom of testation. Which applies turns on the deceased's vecindad civil, not where the property
  sits. A post aimed at Costa Brava, Mallorca and Ibiza owners has to branch here.

---

# Day 24, inheritance_tax, "Heirs pay before they inherit"

- `WRONG` "progressive rates run from 7.65 to 36.5 percent."
  Rule `isd.state_scale`, verified, top 34.00 percent. Second occurrence. See day 10.

- `STALE` "Miss it and 5 percent gets added every 3 months, up to a maximum of 20 percent on top."
  Rule `late.recargo.voluntary`, verified. Pre-2021 regime. Second occurrence. See day 10.

- `PARTIAL-CAVEAT` "The clock gives you 6 months from the death, with an extension possible."
  Rule `isd.deadlines`, status **partial**, specifically on the extension: art. 68 is normally stated
  as requiring the request within the first five months, but the text read said only "before the
  original deadline expires."

- `UNSUPPORTED` "Andalucia among the lowest in the country." No rule.
- `UNSUPPORTED` intestacy order. Not in the base.
- `UNSUPPORTED` "assets outside Spain escape Spanish inheritance tax with one exception: a beneficiary
  who's a Spanish resident." Outside coverage.

- **Omission.** The post says "the law already has a plan for your estate if you don't write one" but
  never names the fix. Rule `succession.eu_election` is flagged in the base as "THE SINGLE MOST USEFUL
  FACT FOR A FOREIGN OWNER." Day 10 uses it; this post leaves the reader without it.

---

# Day 28, gift_tax, "Gifts are taxed within 30 days"

- `WRONG` "Thirty days. That's how long the recipient of a gift in Spain has to pay the tax on it.
  Not six months. 30 days." And "30 days from the gift being made, full stop."
  Rule `isd.deadlines`, status **partial**: "Gift tax is due within thirty WORKING days of the act."
  The rule's notes: "Gift tax is thirty WORKING days from the act itself, a much tighter window than
  the six months for inheritances and routinely missed." The post drops the word that defines the
  window, in the headline and three times in the body, and understates it by roughly two weeks.
  Correction: "Thirty working days. That is how long the person receiving a gift in Spain has to pay
  the tax on it."

- `WRONG` "running progressively from 7.65 to 36.5 percent."
  Rule `isd.state_scale`, verified, top 34.00 percent. Third occurrence.

- `STALE` "5 percent added every 3 months, capped at 20 percent on top."
  Rule `late.recargo.voluntary`, verified. Third occurrence.

- `UNSUPPORTED` "On a donation it's the person receiving who pays, and they get 30 days to get it to
  the council."
  Rule `plusvalia.deadlines`, verified, gives 30 working days for a sale and six months for an
  inheritance. It gives no figure for a donation. The post invents one, and drops "working" as well.
  Correction: name only what the rule covers, or say the donation deadline is set by the council's own
  ordinance and must be checked.

---

# Day 7, wealth_tax, "The €700,000 wealth tax line"

- `WRONG` "the tax bites incrementally, only on the value over the line, at progressive rates from
  0.2 to 2.5 percent."
  Rule `ip.state_scale`, status verified: the state scale runs 0.2, 0.3, 0.5, 0.9, 1.3, 1.7, 2.1 and
  **3.5** percent. There is no 2.5 percent rate and 2.5 is not the top.
  Correction: "at progressive rates from 0.2 percent up to 3.5 percent on the largest holdings."

- `WRONG` "Madrid and Andalucia applies a 100 percent discount, so identical assets there mean a zero
  bill."
  Rule `ip.eu_option`, status verified, notes: "Build this as an explicit user input, never inferred
  from where the property sits. A non-resident who does not opt in is taxed under state rules and no
  regional bonificacion applies." The option exists only for EU and EEA non-residents, and it applies
  the rules of the Comunidad where the greatest value of their assets sits, which is a choice they
  have to make, not a default. A non-EU non-resident, which is a large part of this audience, cannot
  reach a regional bonificacion at all. The 100 percent figure itself has no rule in the base.
  Correction: "Some regions discount the tax heavily, but a non-resident is taxed under state rules by
  default. EU and EEA owners can opt into the rules of the region where most of their assets sit.
  Everyone else cannot."
  (Also a grammar error: "Madrid and Andalucia applies".)

- `PARTIAL-CAVEAT` "Residents who live in their Spanish home also get an extra 300,000 euro allowance
  on that main home."
  Rule `ip.main_home_allowance`, status **partial**: this is a reading of art. 4.Cuatro rather than a
  quoted AEAT statement addressed to non-residents. The post's conclusion that a non-resident does not
  get it is the base's conclusion too, but the rule says to confirm with a DGT binding consulta before
  denying it outright.

- `OK` "Below 700,000 euros, nothing is owed." Rule `ip.minimo_exento`, verified, for non-residents by
  obligacion real.

- `OK` "deadline is June 30 for assets held 31.12." Rule `ip.filing_window_2025`, verified, 8 April to
  30 June 2026. The post gives only the closing date; the window opens 8 April.

- `OK` "a 1 percent surcharge plus 1 percent for every month you're late, climbing to 15 percent plus
  interest once you pass a year." Rule `late.recargo.voluntary`, verified. Note this post gets the
  surcharge right while days 10, 24 and 28 get it wrong.

- **Material omission.** Rule `ip.filing_trigger`, status verified: a return is due where the cuota is
  payable OR where assets and rights exceed 2,000,000 euros counting exempt assets and without
  deducting debts. The rule's note: "The second trigger catches non-residents with a Spanish property
  above 2 million even when no tax is due." A post whose whole promise is "where the line sits" gives
  one line and misses the other.

- **Material omission.** Rules `itsgf.in_force` and `itsgf.thresholds`, both verified: the solidarity
  tax on large fortunes is still in force, prorogued indefinitely, confirmed operative in 2026 by
  Orden HAC/652/2026. Hecho imponible at 3,000,000 of net wealth, and because the 700,000 reduction
  applies before a scale that is 0 percent to 3,000,000 of base liquidable, tax actually starts around
  3.7 million. Modelo 718, filed 1 to 31 July. The rule notes it "is absent from most English-language
  guidance for foreign owners," which is exactly the gap a post like this should be filling.

---

# Day 5, tourist_license, "Tourist rentals need a licence"

- `WRONG` "any rental contract under three months makes you a tourist landlord in Spain."
  Rule `lau.tourist_excluded`, status verified: the test in art. 5.e LAU is a whole furnished dwelling
  in immediate-use condition, marketed or promoted through tourist channels, subject to a specific
  regional tourism regime. It is not a duration test. Rule `lau.seasonal_basis`, verified: a genuine
  seasonal let under art. 3 LAU is a different animal and falls outside. Rule
  `lau.short_term_definitions`, status **unverified**: "Available guidance defines short-term letting
  in at least three incompatible ways: under 3 months, one to twelve months, and under one month."
  The post picks one of three unverified definitions and states it as law.
  Correction: "What makes you a tourist landlord is not the length of the let. It is letting the whole
  furnished home, ready to move into, marketed through tourist channels, under your region's tourism
  rules."

- `WRONG` "Fines typically run 4,000 to 60,000 euros, rising sharply for repeat infractions, and up to
  111,000 euros in Ibiza."
  Rule `regional-tourist-licence` / penalties, status **partial**: "The commonly cited range of 4,000
  to 60,000 euros with an Ibiza ceiling of 111,000 is NOT supported and is wrong for the Balearics...
  There is no 111,000 euro Ibiza ceiling; the statutory ceiling is 400,000." The Balearic figures that
  can be stated, with the partial caveat, are serious 4,001 to 40,000 and very serious 40,001 to
  400,000 under arts. 119 and 120 Ley 8/2012. Valencia and Andalucia penalty figures are both marked
  **unverified** with "DO NOT PUBLISH A FIGURE."
  Correction: "In the Balearics, marketing tourist stays without authorisation is a serious
  infraction, 4,001 to 40,000 euros, and a very serious one runs to 400,000. Other regions set their
  own, and we do not have confirmed figures for them."

- `UNSUPPORTED` "Catalunya has dedicated teams hunting illegal lets. Barcelona has made short-term
  private room rentals illegal, and new licences for entire homes are now very hard to come by."
  Rule `regional-tourist-licence` / Catalunya, status **unverified**, notes: "BLOCKED. Every
  Generalitat host is disallowed to automated fetching... Do not publish anything for Catalunya."

- `UNSUPPORTED` "Valencia mostly issues them to ground-floor properties in popular areas."
  The Comunitat Valenciana rule is verified but says nothing of the kind. Its note: "Which specific
  municipalities have suspended new registrations is municipal-level and must be checked town by town."

- `UNSUPPORTED` "The licence comes in two forms, individual for private owners and collective for
  companies managing several properties." No rule. The verified regional rules describe entry by
  declaracion responsable, not an individual/collective split.

- `UNSUPPORTED` "Expect one to six months depending on region and demand." No rule. For Murcia the
  verified rule says the opposite: entry by declaracion responsable, procedure continuously open,
  activity may begin on submission with a provisional number.

- `UNSUPPORTED` "More than 85 million tourists came to Spain in 2023." Outside coverage.

- **Material omissions, all verified and all more useful than what is there.** Comunitat Valenciana:
  a favourable municipal report of urbanistic compatibility is required; registration has five-year
  validity, renewable with a fresh declaration and updated municipal report; the registration number
  must appear in all advertising and failure is a serious infraction; letting room by room inside a
  registered VUT is a very serious infraction. Andalucia: a statutory prohibition in the community's
  title or estatutos blocks tourist use outright. Illes Balears: new ETV places are rationed through
  periodic calls, not freely available, and Ley 1/2025 makes it a serious infraction to omit a party
  prohibition from the contract or to fail to require a disruptive guest to leave within 24 hours.

---

# Day 14, epc_certificates, "Fined for the advert itself: the EPC"

- `WRONG` "Listing a home without an energy certificate runs 300 to 600 euros" and "Having no
  certificate at all, or falsifying one, moves the fine into the 1,000 to 6,000 euro range."
  Rule `epc.penalties`, status **unverified**, notes in capitals: "DO NOT PUBLISH FIGURES.
  Disposicion adicional duodecima of RDLeg 7/2015 could not be read... The bands circulating online
  (300 to 600, 601 to 1,000, 1,001 to 6,000) have no primary source that was reached." The post
  publishes those exact bands, in its opening sentence, under a real person's name.
  Correction: "Breaches are sanctioned under the state building law and enforced regionally. We do not
  have confirmed penalty figures, so check with your region before assuming a number."

- `WRONG` "it stays valid for ten years. Sell inside that decade and the existing one still counts."
  Rule `epc.validity`, status verified: "Maximum validity is ten years, except where the rating is G,
  in which case it is five years." The rule's note: "HIGH VALUE FOR OUR AUDIENCE: a large share of
  older Spanish coastal stock is rated E, F or G." The post even lists the A to G scale two sentences
  earlier and still gives a flat ten years.
  Correction: "It lasts ten years, unless the rating is G, in which case five. A lot of older coastal
  stock rates G, so check the letter before you count on the date."

- `UNSUPPORTED` "the EPC is required at the advertising stage, not just at completion. The certificate
  must exist before the property is listed."
  Rule `epc.requirement`, verified, covers new buildings and existing buildings or parts sold or let
  to a NEW tenant, and the annexing of the certificate and label to the contract. The advertising-stage
  duty is not in the rule as read. It may well be right; it is not supported here.

- `UNSUPPORTED` "Expect 100 to 300 euros and less than a week." Market pricing, no rule.
- `UNSUPPORTED` "a licensed assessor can reissue one for 60 to 150 euros." No rule.

- `OK` "the certificate must also be registered with your regional authority." Rule `epc.requirement`
  refers to a registered certificate throughout.

- **Omission.** Rule `epc.requirement` note: letting requires a certificate for a NEW tenant, so a
  renewal with the same tenant does not itself trigger the obligation. Useful and cheap to add.

---

# Day 8, community_rental_ban, "Neighbours can ban your tourist let"

- `WRONG` **Bueno claim.** "Bueno is trusted by homeowners from 30+ countries - getbueno.com"
  GROUND_TRUTH: getbueno.com's homepage says "TRUSTED BY HOMEOWNERS FROM 25+ COUNTRIES", and the
  Norwegian and German pages say the same in their own languages. 25+ is the only publicly supported
  figure. 30+ is an overclaim against the company's own live site.
  Correction: "Owning or planning to buy property in Spain? Bueno is trusted by homeowners from 25+
  countries. getbueno.com"

- `UNSUPPORTED` "October 2024: The Spanish Supreme Court ruled that a 3/5 majority could also be used
  to completely prohibit new holiday rentals in a building. Two companies owning six tourist
  apartments fought the ban and lost."
  No rule in the base for this judgment, and no case reference. The base's own account of what changed
  attributes the shift to Ley Organica 1/2025, not to a 2024 Supreme Court ruling.

- `UNSUPPORTED` "they must be properly justified by problems still affecting residents."
  No such requirement in `lph.17_12.majority` or `lph.17_12.retroactivity`.

- `UNSUPPORTED` "Owners have to be given at least 3 days notice of a meeting."
  Not in the base. Repeated in day 19. If it is going out under two names it needs a source.

- `UNSUPPORTED` "only owners who keep up with their community fees get a vote at all." Not in the base.
  Repeated in day 19.

- `UNSUPPORTED` "Since 2019, the Royal Decree-Law 7/2019 first allowed communities to vote to limit or
  restrict tourist rentals with a 3/5 majority."
  The substance matches the note in `lph.17_12.majority` ("Before Ley Organica 1/2025 the three-fifths
  rule covered only limiting, conditioning or prohibiting"), but the base does not name RDL 7/2019 and
  the rule says not to cite instruments that have not been read.

- `OK` "April 2025: The law officially flipped the default requirement... the owner is now legally
  prohibited from starting the activity until they have explicitly obtained a 3/5 approval vote from
  the community beforehand." Rules `lph.17_12.majority` and `lph.17_12.effective_date`, both verified.
  This is the best-sourced passage in the whole set.

- `OK` "Bans aren't retroactive if the rental license was issued before April 3 2025."
  Rule `lph.17_12.retroactivity`, verified. Add the rest of the rule: the owner must already have been
  carrying on the activity, and "a prior municipal urbanistic compatibility report alone is not enough."

- **Precision.** The threshold is three-fifths of owners AND three-fifths of participation quotas, not
  one or the other. `lph.17_12.majority` states it expressly. The post says "3/5 majority" throughout
  and only gestures at quotas later.

- **Material omission.** Rule `lph.17_12.expense_surcharge`, verified: the same three-fifths majority
  may impose an increased share of common expenses on the dwelling carrying on the activity, capped at
  a 20 percent increase. That is the second thing the assembly can do to a letting owner, and it is
  missing from the post that exists to warn them.

- **Typography.** Curly apostrophes ("Spain’s") appear in this post only; every other post uses
  straight quotes.

---

# Day 20, modelo210_scenarios, "Modelo 210 prorates by days"

- `WRONG` "Rental income is declared quarterly, in the year it's earned, with deadlines on 20 April,
  20 July, 20 October and 20 January, so January to March income is filed in April."
  Rules `deadline.rental.2024_2025`, `deadline.rental.from_2026` and `deadline.rental.last_quarterly`,
  all verified. See day 2. Second occurrence.
  Correction: "Rental income is no longer quarterly. For 2025 it was a single return, 1 to 20 January
  2026. From the 2026 rental year it is 1 to 20 April. One quarterly return remains, Q3 2026, due 1 to
  20 October 2026."

- `STALE` "cadastral value x 2 percent (or 1.1 percent where the municipality has had a general
  cadastral revision in the last 10 years)."
  Rule `irnr.imputed.rate_special_2023_2025`, verified: for 2023 to 2025 the test is revision from
  1 January 2012, not a ten-year lookback. Rule `irnr.imputed.rate_2026`, **unverified**: the 2026
  position is a declared blocker. See day 2.

- `OK` "A real example from a UK owner: 45,986 euros cadastral value x 2 percent x 24 percent for a
  full year comes to about 220 euros."
  This is AEAT's own published worked example and is used as a unit test in CORRECTNESS_PROTOCOL
  item 7: 45,986.60 x 2% x 24% x 365/365 = 220.73. The best-supported number in the whole batch.

- `OK` "Holiday lets are usually VAT exempt, but start offering hotel-style extras... and 10 percent
  VAT applies." Rule `vat.letting`, verified.
  **Precision:** the rule defines hotel-type services as "reception, cleaning DURING the stay, linen
  changes, restaurant, laundry and similar." The post says "a regular cleaning service", which reads
  as changeover cleaning between guests. That is the exact line owners get wrong, so it should say
  cleaning during the stay.

- `OK` "a sublease that lets them re-rent it and the arrangement turns commercial, at 21 percent."
  Consistent with `vat.letting` value for operations that are neither exempt residential nor
  hotel-type accommodation.

- `OK` "cadastral value ... x 19 percent for EU and EEA residents or 24 percent for everyone else, x
  days owned over 365." Rule `irnr.rates`, verified, and day proration matches the AEAT example.

- `UNSUPPORTED` "Booking platforms now report your revenue to the Spanish tax office." Outside the
  base's coverage.

- **Omission.** Rule `deadline.210.new_fields_2027`, verified: new annexes and fields, including days
  available and ownership percentage, apply to every modelo 210 submitted from 1 January 2027
  regardless of accrual year. For a post whose entire subject is proration by days, that is the single
  most relevant forthcoming change and it is absent.

- **Omission.** Rule `irnr.imputed.no_deductions`, verified.

---

# Day 22, owners_year, "The absent owner's bill calendar"

- `WRONG` "rental income is declared quarterly, on 20 April, 20 July, 20 October and 20 January."
  Third occurrence. See day 2. In a calendar post this is the load-bearing claim.

- `WRONG` "if you sell during the year, the plusvalia clock starts at the transfer, with 30 days to
  pay the council."
  Rule `plusvalia.deadlines`, verified: 30 WORKING days from the date of the public deed.

- `STALE` "on 31 December the non-resident tax return, Modelo 210, closes the year."
  Correct for accruals to 2025 (`deadline.imputed.upto_2025`), and the window changes from the 2026
  accrual (`deadline.imputed.from_2026`, opens 1 April). Both verified.
  **And the omission that matters most in a calendar:** direct debit closes on **23 December**, eight
  days before filing does. The rule's own note calls that gap "the most common way an owner believes
  they have paid and has not." A calendar post that lists 31 December and not 23 December sends
  readers into exactly that trap.

- `UNSUPPORTED` vehicle tax bands "around 20 to 60 euros... up to 150... over 200"; "IBI ... charged to
  whoever owns the home on 1 January"; waste tax "typically 50 to 200 euros a year". All outside the
  base's coverage, all stated as fact.

---

# Day 26, late_tax_penalties, "Missed a deadline? Move first"

- `STALE` "Sort it within 3 months and the surcharge starts at 1 percent, plus 1 percent for each
  month of delay."
  The two percentages are right; the bracket is invented. Rule `late.recargo.voluntary`, verified:
  1 percent plus a further 1 percent for each complete month of delay, up to 12 months. There is no
  three-month tier. The three-month bracket is a remnant of the pre-2021 5/10/15/20 schedule that
  Ley 11/2021 replaced.
  Correction: "File before they write and the surcharge is 1 percent plus 1 percent for each full
  month you are late, up to twelve months."

- `STALE` "the non-resident tax runs on its own quiet schedule, due by 31 December of the following
  year." See day 2. Changes from the 2026 accrual, and the direct-debit date is 23 December.

- `PARTIAL-CAVEAT` "the fine can then be at least 50 percent of the tax owed."
  Rule `late.sancion.after_requerimiento`, status **partial**. The rule's note is directly on point:
  "A tool must present the voluntary and demanded routes as separate branches, never blending 1 percent
  per month with a 50 percent fine." The post does keep them separate, which is right. It still needs
  the caveat.

- **Material omission, and it is good news the post is built to deliver.** Rule
  `late.recargo.reduction`, status verified: the surcharge is reduced by 25 percent where the
  conditions of art. 27.5 LGT are met, essentially full payment within the voluntary payment period
  opened by the notification. A post whose whole angle is "moving first is cheaper" leaves out the one
  verified discount in the base.

- **Omission.** Rule `late.interest`, verified: for 2026 the legal interest rate is 3.25 percent and
  the late-payment interest rate is 4.0625 percent. The post says "interest still runs" three times
  and never gives the figure it is allowed to publish.

---

# Day 27, property_insurance, "The vacant-home insurance trap"

- `WRONG` "cover is automatic with no official disaster declaration needed, and there's no upper or
  lower limit."
  Rule `consorcio.precondition`, status verified, notes: "THE PART THAT COSTS CUSTOMERS MONEY: the
  Consorcio indemnity is capped at the sums insured in the ordinary policy. An owner who under-insures
  the building to save premium is under-insured against earthquake and extraordinary flood in exactly
  the same proportion. An uninsured property has NO Consorcio cover at all. Art. 8 sets a waiting
  period after inception, so cover is not immediate on day one."
  "No upper limit" is the opposite of the rule, and it is the claim most likely to leave a reader
  underinsured after a flood.
  Correction: "The payout is capped at the sums insured on your ordinary policy. Under-insure the
  building and you are under-insured against earthquake and flood in the same proportion. And there is
  a waiting period after a policy starts, so cover is not immediate on day one."

- `OK` "windstorms above 120 km/h." Rule `consorcio.wind_threshold`, verified, 120 km/h.
  **Precision:** the rule specifies a three-second gust, and calls the measurement basis "THE CRUX of
  the claim-routing logic," because a storm reported by average wind speed can easily produce
  qualifying gusts and vice versa. The number without the basis is not usable by a reader trying to
  work out whether their storm counts.

- `OK` "The gaps in between, hail, frost, lightning, landslides, winds below 120 km/h, sit with the
  private market." Rule `consorcio.exclusions`, verified.

- `OK` "A mandatory surcharge on ordinary policies finances it." Rule `consorcio.precondition`,
  verified: the surcharge is compulsory and collected automatically with the premium.

- `UNSUPPORTED` "it covers extraordinary risks: flooding, earthquakes, tsunamis, volcanic eruptions,
  wave battering, windstorms above 120 km/h."
  Rule `consorcio.perils`, verified, lists terremoto, maremoto, inundacion extraordinaria, erupcion
  volcanica, tempestad ciclonica atipica, and caida de cuerpos siderales y aerolitos. "Wave battering"
  as a separate named peril is not in the rule's list. More importantly the post omits the entire
  second half of the cover: terrorism, rebellion, sedition, riot, civil commotion, and acts of the
  armed forces and security forces in peacetime. A post that says "here is what the fund covers"
  should not stop halfway.

- `UNSUPPORTED` "The CCS acts as a direct insurer, so you can claim from it directly." Not in the base.
- `UNSUPPORTED` "Flooding accounts for around 70 percent of what it has paid out." No rule.

- **Material omission, and it is written for exactly this audience.** Rule `consorcio.notification`,
  status **partial**: the loss must be notified within seven days of the policyholder becoming aware of
  it, unless the policy allows longer. The rule's note: "IMPORTANT FOR OUR AUDIENCE: seven days runs
  from when the owner KNEW, which for a non-resident abroad is not the date of the storm. Say that
  plainly; owners often learn of damage weeks later and assume they are out of time." A post about
  absent owners and storm damage that omits this is missing its own best paragraph.

---

# Day 12, noneu_tax_proposal, "The 100% tax: the real numbers"

- `STALE` "in Valencia residents and non-residents alike currently pay the same 10 percent transfer
  tax."
  Rule `itp_resale` / Comunitat Valenciana, status **partial**: 9 percent from 1 June 2026, was 10.
  The word "currently" makes it worse. See day 16.
  Correction: "in Valencia residents and non-residents alike pay the same rate, 9 percent since June
  2026."

- `WRONG` "non-EU residents, meaning anyone spending under 183 days a year in Spain, which includes UK
  and US buyers of second homes."
  Two different tests conflated. Rule `residency.tests`, status partial: 183 days is one of three
  alternative tests for TAX RESIDENCY, and the other two, economic centre and the family presumption,
  can make someone resident on far fewer days. "Non-EU" is a nationality question, not a day count. A
  German who spends 100 days in Spain is not a non-EU buyer; a British national resident in Spain is
  not a non-resident.
  Correction: "non-EU buyers who are not resident in Spain, which is where most UK and US second-home
  owners sit."

- `OK` "this remains a proposal under study, along with the other 11. No final text, no date, no
  mechanism."
  Rule `foreign_buyer_surcharge`, status verified: "The proposed 100 percent charge on non-EU buyers is
  frequently described as though it were in force. It is not." The post is one of the few that gets
  this right, and gets it right emphatically. Keep it.

- `OK` "the closing of the Golden Visa on 3 April 2025."
  Rule `visa.golden_closed`, verified: "The investor residence route closed to new applications on
  3 April 2025... Dates of April 2024 and April 2025 are both circulating. 3 April 2025 is the correct
  one." The rule adds that the whole investor route closed, not only the property variant, which the
  post frames narrowly.

- `UNSUPPORTED` "prices have nearly doubled in a decade, and rents in Madrid and Barcelona rose by as
  much as 33 percent in five years." No rule.

- `UNSUPPORTED` "In 2023, foreigners bought 15 percent of Spanish properties, 87,000 of 583,000 sales.
  Non-EU non-residents? 27,000, about 5 percent, mostly from the US, UK, Morocco, Venezuela and
  Mexico." Internally consistent arithmetic, no source. The whole argument of the post rests on the
  5 percent figure and it is unsourced.

---

# Day 17, ibi_deep, "IBI: the tax that stays with the house"

IBI rates and IBI collection are outside the rules base entirely. Everything numeric here is
unsupported.

- `UNSUPPORTED` "Miss one and the sequence is predictable: a reminder, surcharges from around 5 percent
  rising past 20 percent."
  No rule for council collection surcharges in the base. It also collides head-on with
  `late.recargo.voluntary`, verified, which is the surcharge regime the same author quotes correctly in
  days 2, 7 and 26 as 1 percent per month to 12 then 15 percent. A reader who has seen both posts sees
  two different answers from the same brand.

- `UNSUPPORTED` "Across Spain that averages 0.3 to 1.1 percent." No rule.
- `UNSUPPORTED` "the waste tax too, 50 to 200 euros a year." No rule. Repeated in day 22.
- `UNSUPPORTED` "unpaid IBI stays attached to the property, not the previous owner." No rule.
- `UNSUPPORTED` "money seized from your Spanish account and charges placed against the property."
  No rule, and fear-based framing.

- `OK in substance` "IBI goes to your council. Non-resident income tax goes to the national tax office
  and is a different bill on a different schedule. Paying one doesn't touch the other." Consistent with
  `irnr.imputed.base`, which notes IRNR sits alongside the local bill.

- **Brand.** "Santander, Zaragoza and Madrid sit low." Santander is meant as the city. In a finance
  post, next to a paragraph about collection agencies, a large number of readers will read it as the
  bank. The brand rules forbid naming Spanish bank competitors. Swap it for another city, Valladolid
  or Vigo, and the sentence loses nothing.

---

# Day 4, cash_rules, "Cash in Spain now needs paperwork"

The rules base has no coverage of cash-handling, AML declarations or payment limits. Every figure in
this post is unsupported, and the post is dense with figures.

- `UNSUPPORTED` "Since 2025, withdrawals above 3,000 euros, or any amount involving 500 euro notes,
  have to be reported to the Agencia Tributaria 24 hours in advance."
- `UNSUPPORTED` "From 100,000 euros the notice period stretches to 72 hours."
- `UNSUPPORTED` "1,000 euros for any transaction involving a business, 1,000 between private
  individuals, and 10,000 if you're a non-resident who doesn't pay tax in Spain."
  Note this one is internally incoherent as written: if private-to-private is capped at 1,000, the
  10,000 non-resident figure has nothing to attach to. Whatever the real rule is, this is not it.
- `UNSUPPORTED` "Any cash transfer within Spain over 100,000 euros, property purchases included, has to
  be declared on the S1 form."
- `UNSUPPORTED` "sending more than 10,000 euros to someone means documenting where the money came from."
- `UNSUPPORTED` "You can hold up to 100,000 euros in cash inside Spain without declaring it."
- `UNSUPPORTED` "fines climb in bands, up to 50 percent of the amount for minor infractions, 50 to 100
  percent for serious ones, and 100 to 150 percent where fraud's involved."
- `UNSUPPORTED` "if payer or payee self-reports within three months, they may be exempt."
- `UNSUPPORTED` "Crossing the border with more than 10,000 euros in cash... risk losing up to half the
  undeclared amount."
- `UNSUPPORTED` "keep receipts for large transactions for at least five years."

What would have to be true: each of these needs a BOE or AEAT page read and a rule added, with a value,
a source and a read date, before any of it goes out under a name. As it stands the post asserts eleven
separate numeric legal thresholds with nothing behind any of them.

- **Brand.** "No good answer and it can be seized" and the opening "Then you needed to tell the tax
  office today. I'm not exaggerating" are fear-based urgency.

---

# Day 1, arras_contract, "The arras contract decides what you bought"

Conveyancing custom and mortgage-law timing are outside the base's coverage.

- `UNSUPPORTED` "pull out and you lose your 10 percent deposit, but if the seller pulls out, they pay
  you double."
  This is the arras penitenciales outcome and it depends entirely on which type of arras the contract
  creates. Stated as "the penalties" for all arras, it is wrong often enough to matter. The 10 percent
  is a convention, not a rule. No rule in the base.
  Softer wording: "Most arras contracts are penitenciales, which means pulling out costs you the
  deposit and the seller pulling out costs them double. Check which type yours is, because the label
  changes the outcome."

- `UNSUPPORTED` "the FEIN comes next, and it has to be signed at least 10 days before the mortgage
  deed."
- `UNSUPPORTED` "Book the notary at least 24 hours ahead."
  Both are mortgage-law timing rules. Neither is in the base. Repeated in day 21, so two names carry
  them.

- `UNSUPPORTED` "transferred around 2,000 euros to secure the offer." Contradicted by day 16's "1,000
  to 6,000 euros".
- `UNSUPPORTED` "agency fees, which run 3 to 5 percent." Contradicted by day 16's "around 3 percent" in
  Madrid and "5 to 6 percent" in hotspots.
- `UNSUPPORTED` "the completion date, usually two to three months after signing." Market custom.

---

# Day 6, nota_simple, "The Nota Simple line buyers never read"

- `UNSUPPORTED`, and this is the whole premise of the post: "the line I mean is the valor catastral,
  the official estimate of the property's value. If it's registered lower than your agreed price, the
  bank can base your mortgage on that lower figure. Registered 10k under your buying price? Expect a
  mortgage for 10k less."
  Three problems and no rule behind any of them. The Nota Simple is a Land Registry document; the
  valor catastral is a Catastro figure, and this brand's own posts put it on the IBI receipt, not on
  the Nota Simple (day 2: "The cadastral value is on your IBI receipt"; day 20: "Your cadastral value
  is sitting on your IBI bill"). A mortgage offer is based on a valuation, not on a cadastral figure.
  And the base does have a verified rule about a registered value setting a floor,
  `itp.base.valor_referencia`, but that is the valor de REFERENCIA, it is a different figure from the
  valor catastral, and it governs the ITP and AJD taxable base, not the mortgage.
  Correction, if the intended point is the tax one: "The figure that can catch you is the Catastro's
  valor de referencia. Since 2022, purchase tax is charged on that or on the price, whichever is
  higher, so look it up before you budget."

- `UNSUPPORTED` "in Spain debts travel with the home, not the seller. Buy a property with unpaid
  charges, community fees included, and they become yours." No rule, and stated without limit.
  Repeated in day 19.

- `UNSUPPORTED` "Around 10 euros online, arriving as fast as the same day, or under 4 euros in person
  at the registry." No rule, and inconsistent with day 25.
- `UNSUPPORTED` "there have been cases of squatters selling homes that were never theirs." No source.
- `UNSUPPORTED` "You'll need the property's registry identifier, the IDUFIR." Outside coverage.

---

# Day 19, community_fees, "Community fees: the underestimated cost"

- `UNSUPPORTED` "a ground-floor owner who votes against the new lift may avoid paying for it, but gets
  no key."
  No rule, and it is the riskiest sentence in the post because it invites an owner to vote against
  accessibility works believing they are opting out of the cost. The base does not cover LPH art. 10,
  so this cannot be stated either way, which is precisely the reason not to publish it.

- `UNSUPPORTED` "Notice can legally be as short as three days." Not in the base. Repeated from day 8.
- `UNSUPPORTED` "only owners who are current on their fees get a vote at all." Not in the base.
- `UNSUPPORTED` "community fee debts attach to the property, so arrears can arrive with the keys."
  Not in the base, and stated without any limit on how far back the charge reaches.
- `UNSUPPORTED` "Some owners pay around 100 euros a quarter, while high-end developments run past
  1,000." No rule.
- `UNSUPPORTED` "There's a reserve pot in there too, for storm damage." No rule, and the LPH reserve
  fund is not a storm fund.
- `UNSUPPORTED` "Fees creep up with inflation and rarely by more." No rule, and contradicted by the
  same batch: day 22 says "An emergency repair can also trigger an extra meeting and an extra bill."
- `UNSUPPORTED` "in extreme multi-year cases a forced sale of the property at auction." No rule.

- `OK in substance` "The whole structure sits under the Ley de Propiedad Horizontal, in force since
  1960." The base cites Ley 49/1960 throughout.

- **Material omission.** Rule `lph.17_12.expense_surcharge`, verified: a three-fifths majority may set
  an increased share of common expenses for a dwelling used for tourist letting, capped at 20 percent.
  This is a community-fees post aimed at owners who let. It is the one verified fee rule in the base
  and it is not here.

---

# Day 23, free_banking_myth, "The free banking myth"

Bank pricing is outside the base's coverage. Every figure is unsupported.

- `UNSUPPORTED` "60 to 70 percent of foreigners who buy property in Spain never take a Spanish loan."
- `UNSUPPORTED` "Spain's most expensive banks charge 240 euros a year for basic banking, plus roughly
  20 euros for a credit card and up to 30 for a debit card."
- `UNSUPPORTED` "international transfers at up to 35 euros each."
- `UNSUPPORTED` "On average, Spanish bank fees run higher than in other European countries."
- `UNSUPPORTED` "bank-sold insurance can easily cost twice the market price." Repeated in day 16.
- `UNSUPPORTED` "Take a mortgage and you may be obliged to buy the property cover from the same bank,
  at least for the first year."
  Highest risk of the group. Spanish mortgage law restricts tying and requires lenders to accept
  equivalent alternative policies. The base does not cover it, so I will not assert the counter-rule,
  but a post telling owners they may be obliged to buy the bank's insurance needs a source before it
  goes out under a name.

- **Brand.** The post's frame is Spanish banks as the adversary: "The free-banking route was never
  built for you", "the drain nobody itemises", "Terms are written in dense Spanish, which makes the
  conditions that trigger fees genuinely hard to find". The brand rules say never make Spanish banks
  the enemy, and to be the calm, honest, transparent voice. The facts can carry this post without the
  adversarial framing.

- **CTA.** This is the post where a Bueno CTA is most natural and most defensible, and it has none.

---

# Day 18, frozen_account, "Why Spanish banks freeze accounts"

Entirely outside the base's coverage. No factual claim here can be checked against a rule.

- `UNSUPPORTED` "Under anti-money-laundering law, a bank that spots suspicious activity can freeze the
  account to stop funds moving, report it to Spain's Financial Intelligence Unit, and only notify you
  afterwards."
- `UNSUPPORTED` "Banks must keep your identification current, and an out-of-date document is enough on
  its own." Stated as a legal duty with a consequence.
- `UNSUPPORTED` "simply not answering is grounds enough to freeze."
- `UNSUPPORTED` "Send updated papers and the account usually reopens within days."

- **Brand.** Opening line: "Spanish banks are allowed to freeze your account first and explain later."
  Then "walking into a house with the electricity cut off and no way to access their own money, which
  is a rotten way to start a holiday." That is Spanish banks as the enemy plus fear-based urgency, in
  the first two paragraphs.

---

# Day 11, bank_guarantee, "Off plan? Demand the bank guarantee"

Off-plan buyer protection is outside the base's coverage.

- `UNSUPPORTED` "Law 57/68 is what changed the rules. Any developer taking staged payments must now do
  two things."
  The post presents Ley 57/1968 as the law currently in force, in the present tense, twice. The base
  has no rule confirming that, and a claim about which instrument currently governs off-plan deposits
  is exactly the kind of thing that has to be read on BOE before it goes out under a name.
  What would have to be true: a verified rule confirming the governing instrument and its current
  consolidated text.

- `UNSUPPORTED` "buying off plan still means paying up to 80 percent of the price for a home that
  doesn't exist yet." No rule.
- `UNSUPPORTED` "the guarantee must have no expiry date. It stays valid until the property is fully
  finished and deemed safe to live in." No rule.
- `UNSUPPORTED` "refunds every payment plus interest." No rule for the interest element.
- `UNSUPPORTED` "it costs you nothing and costs the developer a lot." No rule.

---

# Day 21, escritura_notary, "The notary is not your lawyer"

Low risk. Mostly qualitative and mostly sound. Everything factual is outside the base's coverage.

- `UNSUPPORTED` "The FEIN... must be signed at least 10 days before the mortgage deed, and that gap is
  a legal requirement." Repeated from day 1.
- `UNSUPPORTED` "Then you meet the notary at least 24 hours before signing." Repeated from day 1.
- `UNSUPPORTED` "Valencia has 18 of them and Alicante 8." Oddly specific, no source.
- `UNSUPPORTED` "run by the government under the Ministry of Justice." Outside coverage.
- `UNSUPPORTED` "Not strong in Spanish? You may be required to bring a translator." Stated as a
  possible legal requirement.

---

# Day 25, rural_property, "Rural land: run these four checks"

Low risk. Advice-shaped, with a few numbers that need sources.

- `UNSUPPORTED` "Pre-1956 constructions are usually legal without a licence, but often can't be
  extended." A dated legal threshold stated as fact, with no rule. Rural planning prescription is
  region-dependent.
- `UNSUPPORTED` "For about 9 euros you can even look up the registered owner yourself, plus roughly 30
  euros if you want it in English." No rule, and inconsistent with day 6.
- `UNSUPPORTED` "any discrepancy brings legal and financial consequences." Vague and absolute.

---

# Day 29, extension_deeds, "Pools and extensions belong on deeds"

- `UNSUPPORTED` "works finished after August 2014 must be 15 years old, versus 4 years for earlier
  ones."
  A precise dated legal threshold, stated as fact, with no rule behind it. Prescription periods for
  planning enforcement are set regionally and vary. This is the highest-risk sentence in the post
  because a reader could rely on it to decide whether an unlicensed build is safe.

- `UNSUPPORTED` "ICIO tax at 2 to 5 percent of the construction cost." No rule. The top of that range
  is above what the post can evidence.
- `UNSUPPORTED` "the community must approve... with its certificate signed before a notary." No rule.
- `UNSUPPORTED` "Most permits come back within a few weeks." No rule.
- `UNSUPPORTED` "Unregistered extensions stall sales and carry demolition risk." Demolition risk stated
  flatly, no rule. Also fear-based framing.

---

# Day 9, currency_transfer, "Moving money to Spain is timing"

- `UNSUPPORTED`, and reputationally the riskiest sentence in the post: "Spain runs its own domestic
  network, Iberpay, and many utility companies only support direct debits through it. That's why you
  need a Spanish account to pay Spanish bills, however good your other accounts are."
  No rule. It is also a category claim about the payments market that sits close to Bueno's own selling
  proposition, stated as fact under an employee's name. Under EU payment rules a payee in the SEPA area
  is generally not permitted to refuse a direct debit on the basis of the country of the IBAN, which
  means this sentence is likely to be challenged. Either source it precisely, describing what actually
  happens in practice, or soften it: "In practice some Spanish billers still make it awkward to set up
  a direct debit from a non-Spanish IBAN, which is why many owners keep a Spanish account."

- `UNSUPPORTED` "Miss the date because your money's in transit and your 10 percent deposit is at risk."
  Same 10 percent convention as day 1, no rule.

- `UNSUPPORTED` "SEPA covers euro payments across the EU, EEA and the UK"; "Most UK banks send European
  transfers as SEPA by default." Outside the base's coverage.

---

## Findings by category

Counting each distinct claim once, per post.

| Category | Count |
|---|---|
| WRONG, contradicts a verified rule or the live site | 42 |
| UNSUPPORTED, no rule, or the rule is unverified / annulled / myth | 105 |
| STALE, right for an earlier year, wrong now | 13 |
| PARTIAL-CAVEAT, matches a rule whose status is partial | 8 |
| OK, matches a verified rule | 28 |
| Material omissions of directly relevant verified rules | 19 |

Posts by risk:

- **Do not publish, rebuild from the rules base:** 13, 3.
- **Multiple hard errors, hold until corrected:** 2, 5, 7, 10, 14, 15, 16, 20, 24, 27, 28, 30.
- **One hard error or one stale figure:** 8, 12, 17, 22, 26.
- **No hard error, but built almost entirely on unsourced numbers:** 1, 4, 6, 9, 11, 18, 19, 23, 29.
- **Low risk, minor sourcing gaps only:** 21, 25.

## Bueno and brand findings

| Post | Finding |
|---|---|
| 8 | `WRONG` "trusted by homeowners from 30+ countries". getbueno.com says **25+**, in English, Norwegian and German. Use 25+. |
| 8 | The only CTA in the batch. The other 29 posts have none and none link to getbueno.com. |
| 17 | "Santander" used as a city name in a finance post. Reads as the bank. Substitute another city. |
| 18 | "Spanish banks are allowed to freeze your account first and explain later." Spanish banks framed as the adversary. |
| 23 | Whole post frames Spanish banks as the adversary. Also the most natural home for a CTA, and it has none. |
| 2 | "fines, closure of bank accounts, even confiscation of property in extreme cases." Fear-based urgency. |
| 3 | "Miss that window and you could be looking at two years." Fear-based urgency built on a myth. |
| 4 | "Then you needed to tell the tax office today. I'm not exaggerating"; "it can be seized". Fear-based. |
| 17 | "money seized from your Spanish account and charges placed against the property." Fear-based. |
| 29 | "carry demolition risk". Fear-based. |
| 8 | Curly apostrophes, inconsistent with the other 29 posts. |

Checked and clean across all 30: no em dashes, no en dashes, no emojis, no use of "revolutionary",
"disruptive" or "game-changing", and no named fintech or utility competitors.

**Bueno claims audit.** The price, the licence wording and what is included are not mentioned in any of
the 30 posts. The only Bueno claim made anywhere in this batch is the 30+ countries figure in day 8,
and it is wrong. If a CTA is added to the other posts, note from GROUND_TRUTH that the homepage shows
several price tiers (€49, €99, €169, €299, €30, €29, €2), so "99 euros a year" must not be presented as
the single price, and the approved licence wording is "Licensed by the Bank of Spain via SEFIDE EDE
S.L.U."
