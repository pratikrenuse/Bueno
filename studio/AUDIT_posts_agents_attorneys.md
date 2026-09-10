# Fact-check: LinkedIn trade posts (30 agents, 15 attorneys)

Audited 10 September 2026 against `/home/claude/bc/rules/*.json`, `/home/claude/bc/CORRECTNESS_PROTOCOL.md`,
`/home/claude/bc/ARTICLE_CORRECTIONS.md`, `/home/claude/bc/OPEN_QUESTIONS.md` and
`/home/claude/posts/GROUND_TRUTH.md`. Attorneys days 11 to 15 pulled from Supabase
(`linkedin_posts`, project `zwdkmqzlrhwihijgqgzl`).

**Classification**
- **WRONG**: contradicts a `verified` rule or the live site.
- **UNSUPPORTED**: no rule covers it, or the matching rule is `partial`, `unverified`, `annulled` or `myth`.
- **STALE**: correct for an earlier year, not now.
- **OK**: matches a `verified` rule.

**One structural finding before the detail.** These posts track the errors already logged in
`ARTICLE_CORRECTIONS.md` almost item for item: the cadastral-value mortgage claim, the 36.5 percent
ISD top rate, the 5-percent-per-quarter penalty ladder, the EX-18 form, the 4,000 to 60,000 fine range,
the quarterly Modelo 210 windows, the annulled rental registry, the legitima conflation. They appear to
have been written from the live getbueno.com articles rather than from the rules base. Fixing the posts
without fixing the articles will regenerate the same errors next cycle.

**Coverage limits.** The rules base has no rule at all on: arras and arras penitenciales, agency
commission, reservation fees, notary and registry tariffs, Nota Simple pricing, Ley 57/1968 and off-plan
guarantees, the FEIN and the notarial acta, ICIO, extension legalisation and antiquity certificates,
pre-1956 constructions, IBI rates and IBI arrears, community fee levels and the afeccion real for
community debts, and the intestate succession order. Where a post makes a claim in those areas it is
marked UNSUPPORTED with the coverage gap named. Nothing below asserts Spanish law from memory to fill
a gap.

---

# AUDIENCE: AGENTS

## Agents day 1: EPC fines start at the advert

**UNSUPPORTED.** "Market a property without one and it's 300 to 600 euros before a single viewing happens."
And: "Advertising without a valid certificate runs 300 to 600 euros, while failing to provide one at all,
or falsifying it, runs 1,000 to 6,000."
Rule `epc.penalties` is **unverified**: "DO NOT PUBLISH FIGURES. Disposicion adicional duodecima of
RDLeg 7/2015 could not be read... The bands circulating online (300 to 600, 601 to 1,000, 1,001 to 6,000)
have no primary source that was reached." `OPEN_QUESTIONS.md` #10 says the same. This is the headline of
the post and the number in the first sentence.
Honest wording: "Market a property without one and the fine follows. Enforcement is devolved, so the
band depends on your region, and it is worth asking your regional energy office what theirs is."

**WRONG.** "The certificate lasts ten years and must be registered with the regional authority."
Rule `epc.validity` (**verified**): ten years, "except where the rating is G, in which case it is five
years." The post has already told the reader about the A to G scale two sentences earlier. The rule's own
note: "a large share of older Spanish coastal stock is rated E, F or G."
Correction: "The certificate lasts ten years, or five if the rating comes back G, and must be registered
with the regional authority."

**OK.** "a copy goes into the notarial deed when it sells" and holiday and non-residential properties need
one, consistent with `epc.requirement` (**verified**), which covers new buildings and existing buildings
or parts sold or let to a new tenant.

**UNSUPPORTED (outside coverage).** "It has to exist before the property is listed", the advertising
trigger is not in `epc.requirement` as recorded, which covers sale and letting. Verify against art. 3
RD 390/2021 before it goes out under a real name.

**UNSUPPORTED (outside coverage).** "You're looking at 100 to 300 euros and less than a week"; "replaces it
for roughly 60 to 150 euros"; "open access to green funding and subsidies." Commercial cost estimates, no
rule, no source.

## Agents day 2: The Nota Simple sizes the mortgage

**WRONG.** "If the cadastral value on it sits 10k under the price, the bank may lend 10k less."
And: "at mortgage time, because when the registered cadastral value comes in below the offer, the bank
looks at that lower figure, not the price your buyer agreed."
`ARTICLE_CORRECTIONS.md` #6: "banks lend against the **tasacion**, the appraisal. Cadastral values sit
well below market, so as written the article tells buyers they cannot borrow when they can." Two
compounding problems: banks size the loan on the appraisal, and the cadastral value is not on the Nota
Simple in the first place, it is a Land Registry extract, not a Catastro one. The post's title carries
the error too.
Correction: "Banks size the loan on the tasacion, the bank's own appraisal, not on the price and not on
the cadastral value. Order the appraisal early, because that number is what the offer has to survive."

**UNSUPPORTED.** "costs around 10 euros online and can arrive the same day, or under 4 euros in person."
No rule. `ARTICLE_CORRECTIONS.md` #13 lists the Nota Simple and registry fees among the figures given
inconsistently across articles. This post says roughly 10 online / under 4 in person; day 13 says "about
9 euros"; day 24 says "a few euros in person and a little more online." Three posts, three answers.

**UNSUPPORTED.** "Mortgages, unpaid taxes, debts. In Spain those debts sit on the property, so your buyer
inherits whatever that page reveals." Over-broad and not covered by any rule. A registered mortgage and a
tax afeccion note behave differently from an unsecured personal debt of the seller, which does not
transfer at all.
Honest wording: "Charges registered against the property, mortgages, embargoes, tax affections, travel
with it. Personal debts of the seller do not. The page tells you which is which."

**UNSUPPORTED.** "before 10 percent changes hands." See the arras note under day 3.

**OK (outside coverage).** The IDUFIR, legitimate interest, and what the extract shows are procedural and
not rate-bearing.

## Agents day 3: The arras amendment window

**UNSUPPORTED.** "Once signed, a buyer who withdraws loses the 10 percent deposit, and a seller who
withdraws pays double."
No rule in the base covers the arras. The 10 percent is market convention, not a statutory figure, and
forfeit-and-double is the consequence of an *arras penitenciales* clause specifically, a contract term,
not a default. `ARTICLE_CORRECTIONS.md` #13 flags that the live articles describe the same penalty two
incompatible ways ("20% back" and "double").
Honest wording: "The deposit is customarily 10 percent. Where the contract uses arras penitenciales, a
buyer who pulls out forfeits it and a seller who pulls out repays double. Both the figure and the
mechanism come from the clause, so read the clause."

**UNSUPPORTED (outside coverage).** "A completion date, usually two to three months out"; "a safeguarded
account at a financial institution"; "on a new build... a look at the bank guarantee standing behind the
staged payments" (see day 9).

**Note.** The advice itself, check the description against the Nota Simple, fix the completion date, get
the inclusions in writing, is sound and carries no rate claims.

## Agents day 4: An accepted offer binds nobody

**UNSUPPORTED.** "transfers 1,000 to 2,000 euros." No rule. And the posts disagree with each other:
day 17 says "1,000 to 6,000 euros", day 24 says "roughly 1,000 to 2,000", attorneys day 1 says "around
2,000 euros." `ARTICLE_CORRECTIONS.md` #13: "The reservation fee is given as four different ranges across
four articles." Pick one and use it in all four posts.

**UNSUPPORTED.** "Ten percent of the price... Pull out as seller and you repay double." As day 3.

**UNSUPPORTED (outside coverage).** "An accepted offer in Spain binds nobody"; "From deposit to keys
usually takes six to ten weeks."

**OK (outside coverage).** Power of attorney, notary attendance, registration and utility transfer are
procedural.

## Agents day 5: The week after the keys *(Bueno partner post)*

**Bueno claims:** platform description only, "an account, property tools, energy switching, Modelo 210
filing, insurance, and human support in the client's own language." No price, no country count, no
licence claim.
**OK.** "account" not "bank account"; "Modelo 210" is the correct product name. No brand breach.
**Gap:** an offer that includes a Spanish account is described to a professional audience with no licence
line. Consider adding the approved wording.

## Agents day 6: Licence first, yield second

**WRONG.** "any rental contract under three months makes your buyer a tourist landlord, and that requires
a licence."
Rule `lau.tourist_excluded` (**verified**): the test is a whole furnished dwelling in immediate-use
condition, "marketed or promoted through tourist channels, where subject to a specific regional tourism
regime." Rule `lau.seasonal_basis` (**verified**): a seasonal let under art. 3 LAU is a different animal
and is largely governed by the parties' free will. Rule `lau.short_term_definitions` is **unverified** and
records that guidance defines short-term three incompatible ways (under 3 months, one to twelve months,
under one month).
Correction: "What makes your buyer a tourist landlord is not the length of the let. It is marketing the
whole furnished home through tourist channels, which pulls it into the regional tourism regime. A genuine
seasonal let is a different contract with different rules."

**WRONG.** "Fines typically run 4,000 to 60,000 euros, rising sharply for repeat infractions, and reach
111,000 in Ibiza."
Rule `regional-tourist-licence.penalties` (**partial**): "The commonly cited range of 4,000 to 60,000
euros with an Ibiza ceiling of 111,000 is NOT supported and is wrong for the Balearics." The Balearic
figures are serious 4,001 to 40,000 and very serious 40,001 to 400,000 (arts. 119 and 120 Ley 8/2012).
"There is no 111,000 euro Ibiza ceiling; the statutory ceiling is 400,000." Valencia and Andalucia
penalties are **unverified**: "DO NOT PUBLISH A FIGURE."
Correction: "Fines are regional. In the Balearics a serious infraction runs 4,001 to 40,000 euros and a
very serious one 40,001 to 400,000. Elsewhere, check the region's own tourism law before quoting a number."

**UNSUPPORTED.** "In Barcelona, renting out short term private rooms is illegal, and licences for entire
homes are now very hard to come by. Valencia is generally only granting them to ground floor properties in
popular areas. Catalunya runs dedicated teams hunting illegal lets."
Catalunya is **unverified** in the base: "BLOCKED... Do not publish anything for Catalunya." The Valencia
entry is **verified** but its key facts are a municipal compatibility report, five-year validity,
municipal caps and advertising the number, no ground-floor policy. `OPEN_QUESTIONS.md` #29: municipal
suspensions "are ordinances, not regional law, and none were verified."

**UNSUPPORTED.** "More than 85 million tourists visited Spain in 2023"; "approval takes one to six months";
"per night a short let earns far more than a long term tenant pays." No rules, no sources.

**MISSING, and it is the most important thing in the post.** Nothing here mentions that since
3 April 2025 the community itself must approve a new tourist let. Rule `lph.17_12.majority` (**verified**):
a three-fifths majority of owners who also represent three-fifths of participation quotas is required to
**approve**, limit, condition or prohibit tourist letting. A post titled "Licence first, yield second"
that omits the community vote is telling agents to check the second-hardest gate and skip the hardest one.

## Agents day 7: Community debt comes off the price

**UNSUPPORTED.** "Some owners pay around 100 euros a quarter, while high end developments with pools,
security and a gym can run past 1,000." No rule in the base on community fee levels. Same figures reappear
in attorneys day 12.

**UNSUPPORTED.** "unpaid fees don't always leave with the seller, they can follow the keys"; "unchecked
community debts may become the new owner's liability." No rule. `lph-community.json` covers only art. 17.12
and its scope. The hedged phrasing is honest, but the statutory limit on how far back the charge reaches
is exactly what a professional reader will ask about and the base cannot answer it. Verify art. 9.1.e LPH
before publishing.

**UNSUPPORTED (outside coverage).** "a bigger share also means more voting weight at the annual general
meeting"; the escalation ladder to "a forced auction."

**OK.** "the fees stay the owner's responsibility, never the tenant's", sound as drafted and no rate claim.
**OK.** "The lawyer's job during the purchase is to confirm nothing is outstanding", note this post
correctly does *not* claim the Nota Simple reveals the arrears. Attorneys day 12 does. See there.

## Agents day 8: The 3 percent withholding

**OK.** "The buyer holds back 3 percent of the purchase price and pays it to the tax authorities within one
month of the sale." Rule `irnr.sale.retention` (**verified**): 3 percent of the agreed consideration,
modelo 211, one month.

**WRONG.** "his capital gains bill, which runs 19 percent of the profit for EU and EEA residents and 24
percent for everyone else."
Rule `irnr.rates` (**verified**): `{"capital_gain":{"all":19}}`. The rule's own note: "Capital gains are
frequently quoted with the 19 and 24 percent split applied to them. That split is for imputed and rental
income."
Correction: "It is a holding against the seller's capital gains bill, which is 19 percent of the profit
for every non-resident, whatever their country."

**UNSUPPORTED.** "the seller is entitled to a rebate of the difference within the year."
Rule `deadline.210.refund` (**verified**): a refund return "may be filed from 1 February, within four years
of the end of the filing period for the withheld amount." "Within the year" is not the rule.
Correction: "the seller reclaims the difference on a refund return, which can be filed from 1 February and
stays open for four years."

**WRONG.** "the buyer pays it instead, with 30 days from the transfer to get it to the local council."
Rule `plusvalia.deadlines` (**verified**): "Sale: 30 **working** days from the date of the public deed...
Saturdays, Sundays and holidays do not count. August DOES count as working days for this tax." Dropping
"working" understates the window by around a third. Same error in attorneys day 3.

**UNSUPPORTED (partial rule).** "when the seller is a non-resident, the buyer pays it instead."
Rule `plusvalia.non_resident_seller` is **partial** and says to "present this as market practice, not as a
rule of law": the buyer becomes *sustituto del contribuyente* and is the person the council can pursue,
which is why "buyers and their lawyers routinely retain the estimated plusvalia out of the purchase price
at completion, on top of the 3 percent IRNR retention." The post says the cost lands on the buyer and
stops there. It does not, in practice.
Better: "The council can pursue the buyer, so buyers routinely retain the estimated plusvalia from the
price at completion, on top of the 3 percent. A non-resident seller should expect both deductions at the
notary."

**Partly OK.** "if the land value genuinely fell, or the sale closed at a loss, there's an exemption."
Rule `plusvalia.no_gain` (**verified**) supports the substance but not the word: there is no liability, and
"the transfer must still be declared with both deeds attached; there is simply no assessment." Say "no tax
is due, but the transfer is still declared" rather than "exemption".

**Partly OK.** "up to a 20 year cap." Rule `plusvalia.municipal_variation` (**verified**) records state
maximum coefficients running "0.14 under one year to 0.45 at 20 years or more", so the coefficient stops
rising at 20 years. The same rule warns: "NEVER quote a single national figure."

**UNSUPPORTED (outside coverage).** "on inheritances and donations it's the receiver who pays." Not in the
plusvalia rules.

**MISSING.** `plusvalia.methods` (**verified**), two methods, and the taxpayer may elect the lower, with
the objective method running on the cadastral **land** value only. That is the single most useful
plusvalia fact and it is absent from both this post and attorneys day 3.

## Agents day 9: Law 57/68 off plan guarantees

**UNSUPPORTED, the whole post.** The rules base contains no rule on Ley 57/1968, off-plan guarantees or
staged payments. Every load-bearing claim here is outside coverage:
- "staged payments of up to 80 percent before the escritura is signed"
- "Since 1968, a developer taking a deposit and staged payments must do two things"
- "open a specific bank account for those payments. Not a personal account, not one previously held"
- "provide a guarantee that refunds every payment plus interest"
- "The guarantee must have no expiry date, staying valid until the property is fully finished and deemed
  safe to live in"
- "The guarantee costs the buyer nothing but is expensive for developers"

**Flag before publication, separately.** The post presents a 1968 statute as the operative instrument in
2026 and says so four times ("A law from 1968 is still what stands between..."). Whether Ley 57/1968 is
still in force in its own right, or whether its regime now sits in later legislation, is a question the
base cannot answer and I am not going to answer from memory. It must be checked on BOE before this goes
out under a real name to an audience of estate agents who sell new developments. The same applies to
attorneys day 4, where it goes to lawyers.
If it cannot be checked in time, the honest version is: "Off-plan buyers in Spain are protected by a
statutory guarantee regime that refunds staged payments with interest if the build is not delivered.
Ask the developer to produce the guarantee and the dedicated account before the first instalment moves."
That keeps the advice, which is good advice, and drops the unverified specifics.

**Note.** "the 80 percent" figure also has no source and is the number a developer would dispute first.

## Agents day 10: The utility bill text message *(Bueno partner post)*

**Bueno claims:** platform description only, "a Spanish account, property management tools, energy
switching, non-resident tax filing, home insurance, and human support." No price, no country count, no
licence claim. **OK**, no brand breach. Same licence-line gap as day 5.

## Agents day 11: The three fifths tourist let ruling

This post and attorneys day 6 are the most seriously out of date in the set.

**STALE.** "In 2019, article 17.12 of the Horizontal Property Law was amended to let owner communities
condition and limit tourist rentals."
Rule `lph.17_12.effective_date` (**verified**): "The current wording takes effect from 3 April 2025",
via art. 4.2 Ley Organica 1/2025. The post describes the position as it stood before that.

**WRONG.** "the law never set a voting threshold, so nobody knew if a majority sufficed or unanimity was
needed." And: "The court answered both."
Rule `lph.17_12.majority` (**verified**), notes: "Before Ley Organica 1/2025 the three-fifths rule covered
only limiting, conditioning or prohibiting, so 3/5 was the threshold to ban." The threshold was in the
article. The disputed question was whether "limitar" reached an outright ban, not what majority applied.

**WRONG / incomplete.** "three fifths of the vote, 60 percent, is enough."
Rule `lph.17_12.majority` (**verified**): "A three-fifths majority of owners who **also** represent
three-fifths of participation quotas." The rule's note: "It is a majority of owners AND of quotas, not one
or the other." And the headline change: "THE WORD 'APPROVE' IS THE CHANGE... Now the same majority is
needed to permit a new tourist let at all. Most guidance still describes the old position."
Correction: "Three fifths of owners, who between them also hold three fifths of the quotas. And since
3 April 2025 that same majority is what a community needs to **allow** a tourist let in the first place,
not just to stop one."

**WRONG.** "A ban can't be retroactive; the problems must still be ongoing and affecting residents."
Rule `lph.17_12.retroactivity` (**verified**): "An owner already carrying on the activity before the change
may continue, but only where the tourist licence or declaracion responsable was obtained before
3 April 2025." Notes: "A prior municipal urbanistic compatibility report alone is not enough."
The "problems must still be ongoing" test is not the rule and points an owner at the wrong evidence.
Correction: "Agreements are not retroactive. An owner already letting can carry on, but only if the
tourist licence or declaracion responsable was in hand before 3 April 2025. A municipal compatibility
report on its own does not save them."

**WRONG.** "the connection that matters is the new national rental register, which can certify whether the
building allows tourist lets. A community ban means no registration code."
Rule `registry.annulled` (**annulled**): "The national registration-number procedure created by Real
Decreto 1312/2024 has been ANNULLED by the Tribunal Supremo. There is no state registration number
requirement." Three judgments: 19 May 2026, 21 May 2026, 1 June 2026.
Correction: "What binds the owner is the regional licence, which is unaffected and varies by region and
increasingly by town. The national registration number no longer exists."

**UNSUPPORTED (outside coverage).** The case facts, Marbella, the 48 to 3 vote, two companies, six
apartments, noise and illegal substances, are not in the base. The base has no rule on the Supreme Court
judgment itself.

**MISSING.** `lph.17_12.expense_surcharge` (**verified**): the same three-fifths majority can load the
letting flat with up to a 20 percent increased share of common expenses. That is a direct hit on the yield
the post is telling agents to price, and it is absent.

## Agents day 12: Completion money, on time

**UNSUPPORTED.** "Completion funds that arrive late can cost your buyer the 10 percent deposit." As day 3.

**UNSUPPORTED (outside coverage), and likely wrong.** "Spain runs its own domestic payment network
alongside SEPA, and many direct debits only work through Spanish accounts."
No rule covers this. Spain's domestic direct debit schemes migrated into SEPA, and refusing a valid
SEPA IBAN because it is foreign is the practice EU payment rules were written to stop. The base cannot
verify either way, so this should not go out as stated. It is also the claim most likely to be challenged
by a reader who has actually paid a Spanish utility from a foreign IBAN.
Honest wording: "In practice some Spanish utilities and councils still make life difficult for a foreign
IBAN, which is why a Spanish account belongs in the same conversation as the transfer plan."

**UNSUPPORTED (outside coverage).** "SEPA covers euro payments across the EU, EEA and the UK"; the SWIFT
correspondent-bank description; segregated client funds.

**Brand note.** "which is why the banking setup belongs in the same conversation", the word "banking".
It refers to the buyer's own arrangements rather than to Bueno, so it is not a hard breach, but the brand
rule is absolute in its wording and the sentence works as "the account setup".

## Agents day 13: Four checks for rural land

**UNSUPPORTED.** "an owner lookup runs about 9 euros, plus around 30 for an English translation." No rule,
and it contradicts day 2 and day 24. See day 2.

**UNSUPPORTED (outside coverage).** "Pre 1956 constructions are usually legal without a licence but often
can't be extended." Nothing in the base covers the 1956 planning threshold. Same claim in attorneys day 9.
This is a precise legal date offered without a source to an audience that will check it.

**UNSUPPORTED (outside coverage).** Easements, casa de aperos, septic tanks, "costing thousands", all
descriptive, none rate-verified, none contradicted.

**OK.** No verified rule is contradicted anywhere in this post.

## Agents day 14: The notary is not their lawyer

**UNSUPPORTED (outside coverage).** "the FEIN with the loan conditions must be signed at least 10 days
before the mortgage deed, those 10 days being a legal requirement."
No rule in the base covers the FEIN. `TOOL_STATUS.md` mentions "The FEIN ten-day rule is a legal
requirement and belongs in the timeline", but that is a build note, not a sourced rule with a value, a URL
and a read date, so it does not verify anything under the protocol.
Separately, the verb is the exposure: the FEIN is *delivered* to the borrower at the start of the period,
and what is signed before the notary is the acta of pre-contractual advice. "Signed at least 10 days
before" is the formulation a mortgage lawyer will pick apart. Verify Ley 5/2019 art. 14 before publishing.

**UNSUPPORTED (outside coverage).** "the buyer meets the notary at least 24 hours ahead so the conditions
are explained first." No rule. Also note the post presents the 10 days and the 24 hours as two independent
requirements without saying the meeting sits inside the ten-day window.

**UNSUPPORTED (outside coverage).** "Valencia has 18 and Alicante 8" registry offices. No source.

**OK (outside coverage).** The notary's impartiality, the translator requirement and the separateness of
Land Registry inscription are procedural and uncontradicted.

## Agents day 15: What after-sales actually contains *(Bueno partner post)*

**Bueno claims:** "One annual subscription bundles the account, property management tools, energy
switching, non-resident tax filing and insurance, with multilingual human support behind all of it."
No figure, no country count, no licence claim. **OK**, no brand breach.
**Note:** "One annual subscription" as a bare singular sits oddly with a site showing several tiers. It is
not a misstatement, but see day 30.

## Agents day 16: IBI stays with the house

**UNSUPPORTED.** "Across Spain that rate averages 0.3 to 1.1 percent."
There is no IBI rule anywhere in the base. `ARTICLE_CORRECTIONS.md` #13 flags that the live articles give
"0.3 to 1.1 percent of cadastral value in one article and 0.4 to 1.1 percent of property value in another,
and one of those bases is wrong by a factor of two or three." This post at least uses the cadastral value
as the base, which is the half that matters. The range still has no source.

**UNSUPPORTED, and at risk of being read as the wrong regime.** "the sequence runs from reminder letter to
surcharges starting around 5 percent and climbing to 20 or more."
No IBI rule in the base. The figures resemble the executive-period surcharges under art. 28 LGT, which the
base does not cover, and they are one digit away from the pre-2021 late-filing schedule that
`late.recargo.voluntary` (**verified**) expressly retired: "A schedule of 5 percent every three months to a
maximum of 20 is the pre-2021 regime and no longer applies." A reader who has just read agents day 29 will
see two different ladders in two posts and trust neither. Either source the IBI apremio figures properly
or drop the numbers and say the surcharge escalates.

**UNSUPPORTED.** "Santander, Zaragoza and Madrid sit low, while parts of Catalunya and the Costa Blanca run
higher." No source. Separate point below on the word "Santander".

**UNSUPPORTED (outside coverage).** "Bills land between May and October in many municipalities"; "some
councils no longer post abroad"; "money seized from the owner's Spanish account."

**OK.** "The bill is the cadastral value... usually below market value, multiplied by the municipal rate."
Consistent with `irnr.imputed.base` (**verified**) on cadastral values sitting below market, and it is the
base `ARTICLE_CORRECTIONS.md` #2 says the live articles get wrong.

## Agents day 17: The real price is 12 to 14 more

The regional tax paragraph is wrong at both ends of its range.

**UNSUPPORTED.** "transfer tax runs from 4 percent in the Basque Country."
Rule `itp_resale` / Pais Vasco is **unverified**: "THREE separate regimes: Bizkaia, Gipuzkoa and Alava,
each with its own Norma Foral. Never publish a single Pais Vasco rate." `OPEN_QUESTIONS.md` #5 repeats it.

**STALE.** "and 10 in Valencia."
Rule `itp_resale` / Comunitat Valenciana (**partial**): general 9.0, notes "9 percent from 1 June 2026,
was 10." The post is quoting the pre-June 2026 rate. The rule is partial, so 9 should carry a caveat
rather than be asserted flatly.

**Incomplete.** "and 10 in ... Catalonia."
Rule `itp_resale` / Catalunya (**verified**) is banded: 10 percent to 600,000, 11 to 900,000, 12 to
1,500,000, 13 above. Ten percent is the entry rate, not the rate.

**OK.** "6 in Madrid." Rule `itp_resale` / Madrid (**verified**): general 6.0.

Correction for the whole sentence: "On resales, transfer tax is regional and banded in several regions.
Madrid is 6 percent, Andalucia 7, Valencia 9 since June 2026, and Catalonia runs from 10 percent up to 13
on the top band. Three regions are foral or unpublished, so check rather than quote."

**WRONG.** "New builds skip it and pay 10 percent VAT plus a document fee of roughly 0.5 to 1.5 percent."
The VAT half is **OK** for the mainland and the Balearics (`vat.newbuild.mainland`, **verified**, 10) but
omits `igic.canarias` (**verified**): the Canaries charge IGIC, not VAT, and "a non-resident buying a Canary
holiday home pays the 7 percent general rate."
The AJD half is wrong: verified rates in `ajd_new_build` run from 0.5 (Ceuta and Melilla) to **2.0** in
Murcia, which the rule flags as "Highest in Spain and a common source of underestimation on new builds."
Eight regions are **unverified** with "DO NOT PUBLISH" against them (`OPEN_QUESTIONS.md` #4).
Correction: "New builds skip it and pay 10 percent VAT, or IGIC in the Canaries, plus stamp duty that runs
from 0.75 percent in Madrid to 2 percent in Murcia depending on region."

**UNSUPPORTED.** "The 12 to 14 percent on top of the asking price." No rule, and it does not survive the
base: Catalonia's entry ITP alone is 10 percent before a single fee, and the Balearic and Catalan top bands
reach 12 and 13.

**UNSUPPORTED.** "A reservation fee of 1,000 to 6,000 euros" (contradicts days 4 and 24); "Notary fees sit
around 1,000 euros on a 250,000 euro purchase"; "land registry fees run 400 to 700 and are set by the
government" (`ARTICLE_CORRECTIONS.md` #13: "400 to 700 in one and 500 to 1,000 in another"); "a lawyer
costs a few thousand euros or a gestor a few hundred"; "bank setup fees of up to 2 percent"; "valuation
reports of 250 to 600 euros"; "60 to 70 percent of foreigners buying in Spain never take a Spanish loan";
bank life insurance at "roughly twice what the open market charges." None have rules or sources.

## Agents day 18: The 100 percent tax, calmly

**OK, and the best-calibrated claim in the set.** "The 100 percent tax itself remains a proposal being
studied, with no set mechanism or date. Nothing has changed at the notary."
Rule `itp.foreign_buyer_surcharge` (**verified**): "No surcharge on non-resident or foreign buyers is
enacted anywhere in Spain... The proposed 100 percent charge on non-EU buyers is frequently described as
though it were in force. It is not." `ARTICLE_CORRECTIONS.md` #9 says two live articles get this wrong.
This post gets it right.

**STALE.** "In Valencia today, residents, non-residents and Spanish citizens alike pay the same 10 percent
transfer tax." Valencia has been 9 percent since 1 June 2026 (`itp_resale` / Comunitat Valenciana,
**partial**). The point the sentence makes survives; the number does not.

**WRONG.** "Non-EU residents, meaning anyone spending under 183 days a year in Spain, which includes UK and
US buyers of second homes."
This conflates two unrelated things. Rule `residency.tests` (**partial**): more than 183 days is one of
*three* alternative tests for Spanish **tax** residence, alongside the economic-centre test and the family
presumption. Being non-EU is a matter of nationality and immigration status and has no day count at all.
An EU national spending 40 days a year in Spain is a non-resident but is not "non-EU"; a UK national who
is Spanish tax resident is non-EU but is resident. Rule `residency.day_counting` (**verified**) also warns
that sporadic absences are *added* to the count, so even the day test is not the simple one the post
implies.
Correction: "Who would it target? Buyers who are neither EU nationals nor Spanish residents. For most UK
and US second-home owners, that is both."

**Partly OK.** "the Golden Visa closed on April 3rd 2025, ending residency through 500,000 euro property
purchases."
The date is **OK**: `visa.golden_closed` (**verified**), 2025-04-03, and the rule notes that April 2024 and
April 2025 are both circulating and 3 April 2025 is the right one. But the rule also says "This closed the
WHOLE investor route, not only the property variant", and the 500,000 figure itself is not in the base.
Better: "the Golden Visa closed to new applicants on 3 April 2025, and it closed the whole investor route,
not just the property one."

**UNSUPPORTED.** "one of twelve measures announced by the Prime Minister"; "Property prices have almost
doubled in a decade"; "rents in Madrid and Barcelona rose by as much as 33 percent in five years"; "In
2023, foreigners bought 15 percent of Spanish properties, 87,000 out of 583,000 sales. Non-EU residents
accounted for 27,000, around 5 percent." No rules. The post itself says "Save these numbers", which raises
the stakes on all of them. The 87,000 of 583,000 is at least internally consistent at 14.9 percent.

## Agents day 19: Scam red flags for foreign buyers

**OK.** No numeric, rate, threshold, deadline or legal-rule claim in the post. Nothing to check and nothing
contradicted. The strongest post in the agents set on accuracy.

**Note.** "whether an existing licence actually transfers between owners" is the right question and, given
`lph.17_12.majority` (**verified**), the answer now has a second gate: even a transferring licence does not
survive a community that has not approved the activity. Worth a line.

## Agents day 20: Why saying no costs referrals *(Bueno partner post)*

**Bueno claims:** "a platform that handles the account, taxes, energy, insurance and paperwork, with human
support in their own language." No price, no country count, no licence claim. **OK**, no brand breach.

## Agents day 21: The market calendar as a tool

**OK.** No rule-checkable claim. Seasonality, August closures, the Fallas and the Seville feria are
commentary, not law or rates. Nothing contradicted.

## Agents day 22: New build or resale, wrong question

**OK.** "resales carry transfer tax while new builds carry VAT", consistent with `itp_resale` and
`vat.newbuild.mainland` (**verified**). But as in day 17, it omits `igic.canarias` (**verified**): a Canary
new build is IGIC, and a non-resident holiday buyer pays the 7 percent general rate.

**UNSUPPORTED.** "hidden defects and illegal renovations transfer with the keys. Once the home is in the
buyer's name they're the buyer's issues." No rule. As drafted it tells the buyer they have no remedy
against the seller for concealed defects, which is a strong claim to make without a source.

**UNSUPPORTED (outside coverage).** "IBI is based on the cadastral value, varying by region and by whether
the home is a new build"; "renovation plans need permits from the town hall for each aspect of the work";
"any renovation will cost more than the budget says."

## Agents day 23: NIE timing breaks timelines

**WRONG.** "The application itself is the EX-18, submitted in Spanish in two copies."
Rule `nie.form` (**verified**): "EX-15 is the NIE application form. EX-18 is the EU citizen registration
certificate application and is a **different procedure** under RD 240/2007." The rule's note: "EX-18 is
often given in error." `ARTICLE_CORRECTIONS.md` #11 flags the same error on the live site.
Correction: "The application is the EX-15, submitted in Spanish in two copies. EX-18 is a different form
for a different procedure, and sending it wastes the appointment."

**WRONG.** "The fee, around 11 euros, is paid first at a bank branch using form 790."
Rule `nie.fee` (**verified**): 9.84 euros, Orden PJC/617/2025 annex 5.12, in force 16 June 2025.
The rule also notes: "The 790/012 form covers many procedures at different prices, so select the fee by
procedure, not by form number", so "form 790" alone is incomplete; it is 790 codigo 012.
Correction: "The fee is 9.84 euros, paid first at a bank branch on form 790 codigo 012."

**Partly OK, needs the safe wording.** "the initial document is only valid three months for that purpose"
and "Apply too early and the document ages out."
Rule `nie.permanence` is **partial**: the number is permanent, the certificate is what expires. The rule
gives approved public wording verbatim: "Your NIE number stays with you. The certificate that proves it is
only accepted for three months, so banks, notaries and tax offices may ask for a fresh one." And:
"Never say 'the NIE expires'." The post's phrasing is close but the safe wording exists, use it.

**UNSUPPORTED, and contradicts day 24.** "a passport with at least a year left." Day 24 says "at least six
months left." No rule for either.

**UNSUPPORTED (outside coverage).** "many stations stop letting people in around 13:30"; "Brits can wait
longer than EU applicants"; "a translated letter explaining the reason."

## Agents day 24: Paperwork before the search

**UNSUPPORTED, and contradicts day 23.** "A passport or ID card with at least six months left."

**UNSUPPORTED (outside coverage).** "Spanish banks are required to lend only to people who can demonstrably
repay." No rule.

**UNSUPPORTED.** "a reserve fee of roughly 1,000 to 2,000 euros", contradicts day 17's 1,000 to 6,000.

**UNSUPPORTED.** "the Nota Simple, a few euros in person and a little more online", third variant across
three posts. See day 2.

**UNSUPPORTED.** "It shows the debts associated with the property, and because in Spain those transfer to
the new owner, that page is what your buyer is really buying." Over-broad, as day 2.

**OK (outside coverage).** "A non-resident certificate is sometimes requested for banking, available from
the police station or the requesting bank." `nie.fee` notes record a "certificado de residente o no
residente 7.31" euros, so the document and its fee exist. The post quotes no figure, which is the safe call.

**Brand note.** "free banking offers in Spain often aren't free", the word "banking", about third-party
banks rather than Bueno. Not a hard breach; "free account offers" reads the same.

## Agents day 25: Handover as a service *(Bueno partner post)*

**Bueno claims:** "An account, property tools, energy switching, the Modelo 210 filing, insurance, and
support in their own language." No price, no country count, no licence claim. **OK**, no brand breach.

## Agents day 26: Extensions not on the deeds

**UNSUPPORTED.** "Budget the ICIO tax at 2 to 5 percent of construction cost plus a smaller urban
development fee."
No ICIO rule in the base. ICIO is a municipal tax whose rate is capped by state law and set by ordinance,
so a national 2 to 5 range needs a primary source before it is published, and a top figure of 5 in
particular. Same claim in attorneys day 14.

**UNSUPPORTED, and internally impossible.** "extensions completed after August 2014 must be 15 years old,
versus 4 years for earlier ones."
No rule in the base. Beyond that, the sentence does not work on its own terms in September 2026: work
completed after August 2014 cannot yet be 15 years old, so as written no post-2014 extension can ever be
legalised by antiquity, which is not what the post means. A professional reader will notice within
seconds. Same claim in attorneys day 14, where the audience is lawyers.

**UNSUPPORTED (outside coverage).** "the antiquity certificate, which can legalise retrospectively";
Obra Mayor and Obra Menor scope; the town hall file contents; "the community's certificate signed before a
notary"; the Certificado Final de Obra.

**Tone note.** "the risk scale ends at demolition" and "your foreign buyer's lawyer will find it either
way" sit close to the fear-based-urgency line. They are factual rather than deadline threats, so I would
not call it a breach, but the calmer version of the second one is "your foreign buyer's lawyer will ask."

## Agents day 27: The 2025 rental registration number

**The single most damaging post in the set. Its central subject no longer exists.**

**WRONG.** "Every rental advert in Spain now points to a registration number, and the platforms themselves
must check it."
Rule `registry.annulled` (**annulled**): "The national registration-number procedure created by Real
Decreto 1312/2024 has been ANNULLED by the Tribunal Supremo. There is no state registration number
requirement." Three judgments: 19 May 2026 (BOE-A-2026-12300), 21 May 2026 (BOE-A-2026-13893) and
1 June 2026 (BOE-A-2026-15677). Ground: the State lacks competence to create the registry. Annulled
articles include 1 (part), 2.f, 2.i, 2.j (part), 5, 6 (part), 8, 9, 10, 12.b, 12.c.

**WRONG.** "The scheme rolls out from January 2025, with a voluntary phase first and the mandatory switch
expected towards the end of 2025." Written in a future tense that is now eighteen months stale and
describes a procedure since struck down.

**WRONG.** "Registration runs through the central electronic office of the Colegio de Registradores. It
asks for proof of ownership and proof of compliance with local and regional rules, and it can certify
whether the residents' association allows tourist rental." Annulled (art. 5 and art. 9).

**WRONG (myth).** "The number lasts 12 months, and renewal means listing the leases from the past year
plus, for short lets, a declaracion responsable justifying why they were short term."
Rule `registry.annual_filing_claim` (**myth**): "The claimed annual renewal window... never existed as
described, and the underlying obligation is now void. What existed was an annual INFORMATIVE declaration
filed during the month of February, not a renewal of the number, and the number itself was not
time-limited."

**UNSUPPORTED.** "Short term has its own definition too, more than a month and less than a year."
Rule `lau.short_term_definitions` (**unverified**): guidance defines it at least three incompatible ways.

**UNSUPPORTED.** "Various sources suggest up to 90 percent of properties that should hold a tourist licence
don't." "Various sources" is not a source, and the base has no such rule.

**What is actually true and should replace the post.** Rule `registry.survives` (**verified**): the
Ventanilla Unica Digital and platform data-sharing duties survive, implementing EU Regulation 2024/1028,
and platforms have 48 hours to act on removal orders. Rule `registry.regional_unaffected` (**verified**),
which carries a PRODUCT WARNING: "If a tool tells a foreign owner they need a national registration number,
that is now wrong at state level. What binds them is the REGIONAL licence, which varies by region and
increasingly by municipality. Platforms may still be asking for a number in practice."
Also note `OPEN_QUESTIONS.md` #16: whether any state norm has replaced the annulled registry since
1 June 2026 was not confirmed, so re-check BOE before republishing on this subject at all.

**Recommendation: do not fix this post, replace it.** The correct 2026 post is "The national rental
register was struck down. Your regional licence is what binds."

## Agents day 28: Brexit answers for UK buyers

**OK.** "the purchase costs, tax, notary and registration fees are identical for UK and EU buyers."
Rule `itp.foreign_buyer_surcharge` (**verified**): no surcharge on non-resident or foreign buyers anywhere
in Spain.

**OK.** "Non resident income tax on rental income rose from 19 to 24 percent for Brits, and rental expenses
can no longer be deducted first."
Rules `irnr.rates` (**verified**), 24 percent for non-EU/EEA, and `irnr.rental.deductibility`
(**verified**), deductible only for EU, Norway, Iceland and Liechtenstein. Correct on both limbs.

**OK.** "Time is capped at 90 days in any 180 without a residence permit." Rule `schengen.short_stay`
(**verified**), 90 days in 180.

**OK.** "The Golden Visa is closed to new applicants, though existing holders can renew."
Rule `visa.golden_closed` (**verified**): "existing authorisations keep their validity; renewals are
decided under the law in force when the original permit was granted."

**WRONG figure, and the rule says not to publish one.** "The digital nomad visa suits remote workers
earning around 2,500 euros a month."
Rule `visa.digital_nomad` (**partial**): "DO NOT PUBLISH A EURO FIGURE. The Instruccion says 200 percent of
the SMI monthly but does not state whether the base is the 12-payment monthly figure or the annual figure
divided by twelve. The two readings give roughly 2,442 and 2,849 euros a month. State the rule as '200
percent of the Spanish minimum wage'." `OPEN_QUESTIONS.md` #11: "About 400 euros a month of difference."
Correction: "The digital nomad visa asks for 200 percent of the Spanish minimum wage, mostly earned from
clients or employers outside Spain, with health insurance and proof of qualifications or experience."

**Partly WRONG.** "The non lucrative visa asks for roughly 28,000 euros a year in financial means plus
around 600 euros a month per family member."
Rule `visa.non_lucrative` (**partial**): 400 percent of IPREM for the main applicant and 100 percent per
dependant, which on a 600-euro IPREM is **28,800** a year and 7,200 per dependant. The per-family-member
figure is right; the headline figure is understated by 800. The rule's caveat matters more: "No 2026
instrument fixing IPREM was found. Re-check every January." `OPEN_QUESTIONS.md` #12.
Correction: "The non lucrative visa asks for 400 percent of IPREM for the main applicant and 100 percent
per family member, currently 28,800 euros a year plus 7,200 each, alongside private health insurance, a
clean criminal record and a medical certificate."

**UNSUPPORTED (outside coverage).** "renewed after one year and then every two"; "tax paid in Spain can be
offset against UK tax"; "mortgages for UK nationals involve more paperwork"; "NIE appointments can be
slower for Brits." Rule `residency.treaty_override` (**verified**) confirms the UK has a treaty with Spain
but says nothing about the credit mechanics.

## Agents day 29: The Modelo 210 answer on the spot

**WRONG.** "rental income is declared quarterly, by the 20th of April, July, October and January."
Rule `deadline.rental.2024_2025` (**verified**): rental income accrued in 2024 and 2025 is a single grouped
annual return, 1 to 20 January, direct debit 1 to 15 January. Its note: "Guidance describing quarterly
filing on 20 April, July, October and January is out of date." Rule `deadline.rental.from_2026`
(**verified**): accruals from 2026 file 1 to 20 April. Rule `deadline.rental.last_quarterly`
(**verified**): "The last quarterly rental filing is Q3 2026, due 1 to 20 October 2026", flagged in the
base as "IMMEDIATELY ACTIONABLE." `ARTICLE_CORRECTIONS.md` #3 already raised this as worth an email to
customers, not just an article fix.
Correction: "Rental income is no longer quarterly. There is one last quarterly return, Q3 2026, due 1 to 20
October 2026. Everything accrued from 1 October 2026 goes into an annual return filed 1 to 20 April 2027."

**WRONG / incomplete on the rate.** "cadastral value times 2 percent, or 1.1 percent where the municipality
has had a general cadastral revision in the previous 10 tax years."
That is the standing rule, `irnr.imputed.rate_standing`, and it is **partial** (art. 85 LIRPF not read
verbatim). For the years an owner is actually filing now it is superseded: rule
`irnr.imputed.rate_special_2023_2025` (**verified**) applies 1.1 percent for 2023, 2024 and 2025 wherever
cadastral values were revised with effect from 1 January 2012 onwards, which is a far wider net than a
ten-year lookback. And rule `irnr.imputed.rate_2026` is **unverified** and marked BLOCKER: "Whether the 1.1
percent special rule is extended to the 2026 accrual is not established... A tool must not state a 2026
figure until this is settled." `OPEN_QUESTIONS.md` #1.
Correction: "For 2023, 2024 and 2025 the rate is 1.1 percent wherever the cadastral values were revised
from 2012 onwards, and 2 percent otherwise. Whether that carries into 2026 is not yet settled, and the 2026
window does not open until April 2027."

**WRONG as stated, and it contradicts the next two sentences.** "File voluntarily before the tax office
makes contact and penalties can be avoided entirely."
Rule `late.recargo.voluntary` (**verified**): filing late without a demand still carries 1 percent plus 1
percent per complete month. Rule `late.recargo.excludes_penalty` (**verified**) is what the sentence is
reaching for: the surcharge excludes any *penalty*. A surcharge is not nothing, and the post then correctly
quotes the 1 to 12 percent ladder two lines later.
Correction: "File voluntarily before the tax office makes contact and you get a surcharge instead of a
penalty, which is a much better outcome."

**OK.** "Pay between 1 and 12 months late and the surcharge runs 1 to 12 percent of the tax owed. Beyond 12
months it's 15 percent plus interest."
Rule `late.recargo.voluntary` (**verified**). This is the one place in all 45 posts where the post-2021
regime is stated correctly. Attorneys days 7 and 11 state the retired pre-2021 version instead.

**UNSUPPORTED (partial rule, and the rule says not to publish it).** "if the tax office reaches the owner
first, the fine can reach at least 50 percent of the tax owed."
Rule `late.sancion.after_requerimiento` (**partial**): "PARTIAL: art. 191 could not be read verbatim...
Confirm before this figure appears in public copy." `OPEN_QUESTIONS.md` #8.

**OK, with a precision fix.** "A UK owner with a cadastral value of 45,986 euros pays around 220 euros for
a full year."
This is AEAT's own published worked example, which `CORRECTNESS_PROTOCOL.md` item 7 uses as a unit test:
45,986.60 x 2% x 24% x 365/365 = 220.73. Correct for a UK owner at the 2 percent rate. But the post has
just offered 1.1 percent as an alternative and does not say which the example uses; at 1.1 percent the same
property is about 121 euros. Add four words: "at the 2 percent rate."

**Incomplete.** "Buy mid year without renting, and the first return is due the following year, paid by year
end." True for accruals to 2025 (`deadline.imputed.upto_2025`, **verified**) but from the 2026 accrual the
window is 1 April to 31 December (`deadline.imputed.from_2026`, **verified**, in force 24 June 2026). And
it omits the direct debit cut-off of 23 December, which the rule calls "the most common way an owner
believes they have paid and has not." That is the single most useful line the post could add.

**UNSUPPORTED / conflated.** "Sell, and the owner files for the days up to the sale, early the next year."
The base has a specific rule for the transfer return that the post does not use:
`deadline.210.sale` (**verified**), "filed within three months once one month has elapsed from the date of
transfer... the window opens one month after completion and closes four months after it", and it is
"UNCHANGED by Orden HAC/623/2026. Do not let the new April rule leak into the sale flow." A post about the
Modelo 210 on a sale that omits this window is missing the deadline the client will actually breach.

**Mostly OK, one imprecision.** "straightforward holiday lets are exempt from VAT, but hotel style services
like meals or regular cleaning bring 10 percent VAT, and a sublease contract with a broker or platform
makes the rental commercial at 21."
Rule `vat.letting` (**verified**): exempt / 10 with hotel-type services / 21. The 21 percent limb is
defined as "neither an exempt residential let nor a hotel-type accommodation service", not specifically a
sublease to a broker. The rule also warns: "the much-discussed 21 percent on tourist lets remains a
proposal. Do not code the speculative line."

**UNSUPPORTED (outside coverage).** "Booking platforms now report revenue to the Spanish tax office."
`registry.survives` (**verified**) covers platform data-sharing under EU Regulation 2024/1028, which is not
the same as tax reporting. Substantively likely right via DAC7, but not in the base.

**MISSING.** `late.recargo.reduction` (**verified**): the surcharge drops 25 percent where art. 27.5 LGT is
met. In a post that says "The penalty ladder rewards honesty, so quote it precisely", that belongs in it.

## Agents day 30: What 99 euros a year buys *(Bueno partner post)*

**WRONG against the live site.** "we serve customers across 28 plus countries."
`GROUND_TRUTH.md`: getbueno.com says "TRUSTED BY HOMEOWNERS FROM 25+ COUNTRIES", and the Norwegian and
German pages say over 25 in their own languages. "Treat 25+ as the only publicly supported figure. Flag
every other number as an overclaim."
Correction: "we serve customers in more than 25 countries."

**Flag: price presented as the whole story.** "what a client actually gets for 99 euros a year", and the
title. `GROUND_TRUTH.md`: the homepage shows several figures, not one, €49/yr, €99/yr, €169/yr, €299/yr,
€30/yr, €29, €2, plus a price list PDF at /media/zodb1l2b/product-price-list-may-2026.pdf. €99 is one tier.
A post whose entire premise is "the fair question is what a client gets for 99 euros" will not survive an
agent clicking through to a page with four annual prices on it.
Correction: "The fair question about Bueno is what a client actually gets. The core plan is 99 euros a
year, with other tiers above and below it."

**OK.** "licensed by the Bank of Spain via SEFIDE EDE S.L.U.", the approved wording, verbatim.

**OK.** "A Spanish IBAN account, the Bueno Account, with a Bueno Visa Card... Energy switching through
Bueno Energy... the Modelo 210." All four product names correct. No use of "Bueno Banking", no use of
"bank" or "banking" to describe Bueno anywhere in the post.

**OK.** "with Norway, Sweden, Germany, the UK and France as the main markets", matches the project brief.

---

# AUDIENCE: ATTORNEYS

## Attorneys day 1: The arras amendment window

**UNSUPPORTED.** "A buyer who pulls out loses the 10 percent deposit. A seller who pulls out pays the buyer
double it." As agents day 3. No rule in the base. Going to lawyers, the missing word is *penitenciales*:
this is the consequence of a specific clause, not a default of Spanish contract law, and the audience knows
the difference.

**UNSUPPORTED.** "set against agency fees of 3 to 5 percent of the price."
No rule. Agency commission in Spain is unregulated and commonly quoted across a wider band than 3 to 5.
A figure with no source, offered to lawyers who see the invoices.
Honest wording: "or set against the agency's commission, which is a matter of contract and varies. Worth
checking early who is actually paying it, because in Spain it can be either side."

**UNSUPPORTED.** "the client's likely already transferred around 2,000 euros to secure it." Contradicts
agents days 4, 17 and 24. See agents day 4.

**Internal tension worth fixing.** "Once both parties sign, they're legally bound" sits three sentences
before a description of either side walking away for a price. Under arras penitenciales the whole point is
that withdrawal is priced, not prohibited. To this audience that reads as imprecision.

**OK (outside coverage).** The drafting checklist, description against the Nota Simple, completion date,
penalties both ways, inclusions, is sound and rate-free.

## Attorneys day 2: The choice-of-law clause

**OK.** "Under the European Inheritance Regulation of 2012, anyone who dies after 17 August 2015 can choose
the inheritance law of their home country."
Rule `succession.eu_election` (**verified**): EU Regulation 650/2012, "Applies from 17 August 2015."
Both the instrument and the date check out.

**Imprecise.** "the inheritance law of their home country." The rule says "the law of a State whose
**nationality** they hold." For a dual national or a long-term expatriate those are different things, and
this audience will make that distinction.

**Imprecise.** "The choice must be stated clearly in a Spanish or international will."
The rule: "The choice must be made expressly in a disposition of property upon death, or be demonstrated by
its terms." A will made anywhere qualifies, it does not have to be Spanish or "international".

**WRONG.** "That regime sends 50 percent of the joint property to the spouse, splits one third of the rest
equally between the children, divides a second third among the children as the testator chooses, and leaves
only the final third free."
Rule `succession.gananciales_first` (**verified**), flagged as "THE ERROR TO AVOID, and it is a common one":
"The matrimonial property regime determines what falls into the estate; the legitima then determines how
the estate is divided... A tool that applies 'two thirds to the children' to the whole value of a jointly
held Spanish property overstates the children's entitlement by roughly half. Keep the two calculations in
separate, separately labelled steps." `ARTICLE_CORRECTIONS.md` #7 flags the identical conflation on the
live site. The spouse's 50 percent is their **own** half on liquidating the community. It is not a
succession entitlement and it does not come out of the estate.
Correction: "Two separate steps, and running them as one overstates the children's share by roughly half.
First liquidate the matrimonial regime: under gananciales the surviving spouse keeps their own half, and
only the deceased's half plus their private property forms the estate. Then divide that estate: two thirds
is reserved to the children, of which one third can be applied as mejora, and only the final third is free."

**MISSING, and material to this audience.** Rule `succession.spouse_usufruct` (**verified**): where the
spouse concurs with descendants they take the usufruct of the *tercio de mejora*, "The third is the tercio
de MEJORA, expressly. Not the legitima estricta and not the free third." A post about what Spanish forced
heirship does to an estate that never mentions the widow's usufruct is incomplete.

**WRONG.** "A client with a holiday home in Spain still needs their will to state which country's law
governs, or the default can catch the Spanish assets."
Rule `succession.eu_election` (**verified**): "The default is the law of habitual residence at death." For
a non-resident owner with only a holiday home, the default is their **home** law, not Spanish law. This
sentence tells a Norwegian owner in Norway that Spanish forced heirship may catch their Spanish flat by
default, and the rule says the opposite. A will is still worth having, for practical and probate reasons.
Correction: "A non-resident's estate defaults to the law of their habitual residence, not to Spanish law.
The clause still earns its place, because it removes the argument and speeds the Spanish probate."

**MISSING.** The rule's own note: "The Regulation does not bind Denmark or Ireland and the UK never opted
in, so a British national's choice of English law works from the Spanish side but is not symmetric."
Bueno's markets include the UK, and the site has a Danish locale. This belongs in the post.

## Attorneys day 3: Two tax jobs on your buyer

**OK.** "The buyer holds back 3 percent of the purchase price and pays it to the tax authorities within one
month of the sale." Rule `irnr.sale.retention` (**verified**).

**WRONG.** "the seller's capital gains bill, which runs at 19 percent of the profit for EU and EEA
residents and 24 percent for non-EU sellers."
Rule `irnr.rates` (**verified**): capital gains on sale are 19 percent for everyone. Same error as agents
day 8, and here it goes to lawyers who will be advising on the very transaction.
Correction: "a holding against the seller's capital gains bill, which is 19 percent of the gain for every
non-resident. The 19 and 24 split applies to rental and imputed income, not to the gain."

**UNSUPPORTED.** "the seller claims a partial or full rebate within the year." Rule `deadline.210.refund`
(**verified**): from 1 February, within four years.

**WRONG.** "who then has 30 days to pay the local council." Rule `plusvalia.deadlines` (**verified**):
30 **working** days from the date of the public deed.

**UNSUPPORTED (partial rule, and its framing is reversed).** "It's usually the seller's tax. With a
non-resident seller it falls to the buyer."
Rule `plusvalia.non_resident_seller` (**partial**): the buyer becomes sustituto del contribuyente and is
who the council can pursue, "Present this as market practice, not as a rule of law." And the note the post
most needs: "the cost does not disappear for the seller. Because the buyer carries the liability, buyers
and their lawyers routinely retain the estimated plusvalia out of the purchase price at completion, on top
of the 3 percent IRNR retention." The post tells lawyers the cost lands on their buyer and stops there,
when the standard professional response is to retain it from the price.

**WRONG.** "if the infrastructure hasn't grown since the purchase... there's an exemption."
Not a ground anywhere in the base. Rule `plusvalia.no_gain` (**verified**) gives one ground: no increase in
value, shown, and the transfer must still be declared with both deeds attached.

**UNSUPPORTED.** "plus the property's location and the size of the urban area." Not in the base. Rule
`plusvalia.municipal_variation` (**verified**): coefficients, rate and whether the town works by
declaration or self-assessment are set by local ordinance, and "NEVER quote a single national figure."

**MISSING, and it is the point a lawyer would most want.** Rule `plusvalia.methods` (**verified**): two
methods, objective and real gain, "The taxpayer may elect the lower", and the objective base is the
cadastral **land** value only, not the total cadastral value. That is the fee-earning fact and it is absent.

## Attorneys day 4: Law 57/68 bank guarantees

**UNSUPPORTED, the whole post**, exactly as agents day 9. No rule in the base covers Ley 57/1968, off-plan
guarantees, dedicated accounts or staged-payment ceilings. Specific claims:
- "up to 80 percent of the price in instalments before the escritura is ever signed"
- "Since Law 57/68, any developer taking a deposit and staged payments... has two obligations"
- "That guarantee can't carry an expiry date"
- "Before 1968, Spanish law gave buyers no protection here at all"

**Flag with more force here than on agents day 9.** This post goes out under a real name to Spanish
property lawyers and cites a statute by number four times. Whether Ley 57/1968 remains the operative
instrument in 2026, or whether its regime now lives in later legislation, must be settled on BOE before
publication. The base cannot settle it and I will not settle it from memory. If it cannot be checked in
time, cite the obligation without the statute number and the year.

**OK (outside coverage).** The practical advice, verify the guarantee exists, covers refund plus interest,
and has no expiry date, before the first instalment moves, is good and survives whatever the citation
turns out to be.

## Attorneys day 5: The unbillable email *(Bueno partner post)*

**Bueno claims:** "a Spanish IBAN account and card, property admin tools, energy switching, Modelo 210
filing, home insurance, and human support in the client's own language. One subscription, 99 euros a year."

**Flag: price presented as the only price.** "One subscription, 99 euros a year." See agents day 30 ,
the site shows €49, €99, €169, €299 annually plus other figures. "One subscription" plus a single number
reads as the whole price list.

**Gap.** No licence wording, in a post that offers lawyers a Spanish IBAN account and card. Of the four
attorney posts that describe the account, two carry the SEFIDE line and two do not. To a legal audience
that inconsistency is conspicuous. Add the approved wording here.

**OK.** No country count. "account", never "bank account". No brand breach.

## Attorneys day 6: The 3/5 tourist-let ruling

Same body of errors as agents day 11, delivered to an audience that will check.

**STALE.** "In 2019, Article 17.12 of the Horizontal Property Law was amended by royal decree, giving owner
communities the power to condition and limit tourist rentals."
Rule `lph.17_12.effective_date` (**verified**): the current wording takes effect 3 April 2025, via art. 4.2
Ley Organica 1/2025, an organic law, not a royal decree. Later amendments to art. 17 (RDL 7/2025 of 24
June and RDL 7/2026 of 20 March) touch art. 17.1 only, not 17.12.

**WRONG.** "the law never fixed a voting threshold, so nobody could say whether a majority or unanimity was
needed." Rule `lph.17_12.majority` (**verified**), notes: before Ley Organica 1/2025 the three-fifths rule
already covered limiting, conditioning and prohibiting, "so 3/5 was the threshold to ban."

**WRONG / incomplete.** "three fifths of the vote, 60 percent, is enough. No unanimity required."
Rule `lph.17_12.majority` (**verified**): three fifths of owners who **also** represent three fifths of
participation quotas. And since 3 April 2025 that majority is what is needed to **approve** a tourist let
at all, "THE WORD 'APPROVE' IS THE CHANGE... Most guidance still describes the old position."
Correction: "Three fifths of owners who between them also hold three fifths of the quotas. And since 3 April
2025 the same majority is what a community needs to permit a new tourist let in the first place."

**WRONG.** "The ruling isn't retroactive, so the problems must still be ongoing and affecting residents."
Rule `lph.17_12.retroactivity` (**verified**): agreements have no retroactive effect, and an owner already
carrying on the activity may continue "only where the tourist licence or declaracion responsable was
obtained before 3 April 2025. A prior municipal urbanistic compatibility report alone is not enough."
Two further resolutions on the same point: BOE-A-2026-6851 and BOE-A-2026-14949.
Correction: "Existing operators are grandfathered, but narrowly. The tourist licence or declaracion
responsable has to have been obtained before 3 April 2025, and a municipal compatibility report on its own
will not do it."

**MISSING.** Rule `lph.17_12.expense_surcharge` (**verified**): the same three-fifths majority may impose an
increased share of common expenses on the letting dwelling, capped at a 20 percent increase. For a lawyer
advising a client whose community has not banned but is unhappy, that is the live risk.

**MISSING, and the most valuable omission of the two posts.** Rule `lph.scope` (**verified**): art. 17.12
is tied to the activity in art. 5.e LAU, that is tourist letting under regional tourism rules, and "A
genuine seasonal let under art. 3 LAU falls outside it." The rule adds that "A community can still restrict
uses by other routes such as statutory clauses. The boundary is heavily litigated." That boundary is the
whole advisory question for a buy-to-let client and the post never reaches it. The rule also warns that
Ley Organica 1/2025 added a new disposicion adicional 2 to the LPH whose text was not read: do not build on
it.

**UNSUPPORTED (outside coverage).** The Marbella facts, the 48 to 3 vote, the two companies and six
apartments, and the court's reasoning as paraphrased. No rule in the base covers the judgment.

## Attorneys day 7: Succession tax's six-month lock

**WRONG.** "Rates are progressive, from 7.65 percent to 36.5 percent."
Rule `isd.state_scale` (**verified**): bottom marginal 7.65, top marginal **34.00** on the excess above
797,555.08 euros. Its note is explicit: "CORRECTION: 36.5 percent is NOT the state top marginal rate. A top
rate of 36.5 percent is widely quoted. **Do not publish it.**" `ARTICLE_CORRECTIONS.md` #7 flags the same
figure on the live site. This is a number a Spanish succession lawyer knows by heart.
Correction: "The state scale runs from 7.65 percent to 34 percent above 797,555 euros. What takes a bill
past that is the article 22 multiplier for kinship group and pre-existing wealth, which runs up to 2.4 for
Group IV, so an unmarried partner or a non-relative faces an effective rate well above 34."

**WRONG.** "Miss it and 5 percent is added every 3 months, up to a maximum of 20 percent on top."
Rule `late.recargo.voluntary` (**verified**): 1 percent plus 1 percent for each complete month to 12
months, then a flat 15 percent plus late-payment interest from the day after month 12. Its note: "This
replaced the old 5/10/15/20 tiers via Ley 11/2021. **A schedule of 5 percent every three months to a
maximum of 20 is the pre-2021 regime and no longer applies.**" Rule `isd.deadlines` says the same:
"Late-filing surcharges follow late-filing.json, not the 5-percent-per-quarter schedule that still
circulates." Agents day 29 states the correct ladder, so the two audiences are being given different law.
Correction: "Miss it and the surcharge is 1 percent plus 1 percent for each complete month late, to 12
months. After that it is a flat 15 percent plus interest."

**UNSUPPORTED.** "Andalucia sits among the lowest in the country." No regional ISD rule in the base.
The relevant verified point is in `isd.state_scale`: "Most autonomous communities apply their own scale
with very large reductions for spouses and children, so the state scale is the fallback, not the usual
outcome." Say that instead of ranking a region without a source.

**Partly OK (partial rule).** "The deadline's 6 months, though an extension is possible."
Rule `isd.deadlines` (**partial**): six months from death, extendable by a further six. The post does not
say the extension is six months. The rule's caveat: "PARTIAL on the extension: art. 68 is normally stated
as requiring the request within the first FIVE months, but the text read said only 'before the original
deadline expires'. Verify before coding." A post telling lawyers to open the file in week one should say
when the extension has to be asked for, and should flag that the five-month point is unsettled.

**UNSUPPORTED (outside coverage).** "the estate can't be released until the beneficiary has paid";
"Residents and non-residents alike pay on assets located in Spain. Assets outside Spain escape Spanish
inheritance tax... They're caught if the beneficiary is a Spanish resident." Standard obligacion real
versus personal framing, but not in the base.

**MISSING.** `succession.eu_election` (**verified**) and `succession.foral` (**verified**). A six-month
succession post for foreign families that never mentions that six autonomous communities apply their own
succession law, and that which one applies turns on the deceased's vecindad civil rather than where the
property sits, is missing the branch that changes the answer.

## Attorneys day 8: The notary is not their lawyer

**UNSUPPORTED (outside coverage).** "The FEIN... must be signed at least 10 days before the mortgage deed,
and those 10 days are a legal requirement." As agents day 14. No rule in the base. To this audience the
verb matters: the FEIN is delivered, and the acta of pre-contractual advice is what is authorised before
the notary.

**UNSUPPORTED (outside coverage).** "The buyer also meets the notary at least 24 hours before signing day."
No rule.

**OK (outside coverage).** Notarial impartiality, the translator requirement, the compraventa for a cash
buyer, and registration at the Registro de la Propiedad as a separate step. All procedural, none
contradicted by the base.

**Note.** "The escritura is when the remaining funds move and the keys change hands, but registration...
is a separate step afterwards, and someone has to own it." Sound, and the post is right that this is where
lawyers add value.

## Attorneys day 9: Rural registry vs reality

**UNSUPPORTED (outside coverage).** "Pre 1956 constructions are usually legal, since no building licence
was required, but often can't be extended." As agents day 13. No rule in the base. A precise statutory date
offered to lawyers without a source.

**OK (outside coverage).** Title deed, registry versus cadastre discrepancies, casa de aperos, easements,
septic tanks. Descriptive, no rates, nothing contradicted. No euro figures at all in this post, which is
why it is one of the cleanest in the set.

## Attorneys day 10: After the file closes *(Bueno partner post)*

**WRONG against the live site.** "Our customers span more than 28 countries, with Norway, Sweden, Germany,
the UK and France the biggest."
`GROUND_TRUTH.md`: getbueno.com says 25+ in English, Norwegian and German. "Treat 25+ as the only publicly
supported figure."
Correction: "Our customers span more than 25 countries, with Norway, Sweden, Germany, the UK and France the
biggest."

**Flag: price presented as the only price.** "One platform, one annual subscription of 99 euros." See agents
day 30.

**Gap.** No licence wording, in a post offering a Spanish IBAN account to lawyers. As attorneys day 5.

**OK.** "Modelo 210 filing" correct; "account" never "bank account"; no brand breach.

## Attorneys day 11: Gift tax's 30-day clock

**WRONG (and it is the title).** "A gift gives the recipient 30 days"; "payment's due within 30 days of the
gift being made"; "One month, and the clock starts the moment the gift is made"; "put the 30 day clock on
the table first."
Rule `isd.deadlines` (**partial**): "Gift tax is due within thirty **working** days of the act." Its note:
"Gift tax is thirty WORKING days from the act itself, a much tighter window than the six months for
inheritances and routinely missed." Two problems. First, thirty working days is roughly six calendar weeks,
so "30 days" understates it, and "One month" is a third, different figure in the same post. Second, the
rule is **partial**, so the caveat travels with it.
Correction: "A gift gives the recipient thirty working days, counted from the act itself." And drop "One
month", it contradicts the sentence above it.

**WRONG.** "even the penalty regime is gradual, 5 percent added every 3 months up to a maximum of 20
percent."
Rule `late.recargo.voluntary` (**verified**): 1 percent plus 1 percent per complete month to 12 months,
then 15 percent plus interest. "A schedule of 5 percent every three months to a maximum of 20 is the
pre-2021 regime and no longer applies." Same error as attorneys day 7. Correction as there.

**Partly OK (partial rule).** "the beneficiary usually has 6 months to pay, an extension is possible."
Rule `isd.deadlines` (**partial**): six months, extendable by a further six. Say how long.

**OK (outside coverage).** "Gift tax in Spain falls on the person receiving, not the person giving" and
"Gift tax rates vary from region to region." The second is consistent with `isd.state_scale`'s note that
most autonomous communities apply their own scale.

**MISSING, and it is the answer to the post's own scenario.** The post's flagged case is a parent funding a
child's Spanish purchase. Rule `isd.state_scale` (**verified**) notes that the article 22 multipliers run by
kinship group, and that most autonomous communities apply their own scale "with very large reductions for
spouses and children." A parent-to-child gift is exactly the case where the regional reduction usually
decides the bill, and the post says only that rates "vary."

## Attorneys day 12: Debts that stay with the flat

**UNSUPPORTED.** "Community fee debts in Spain don't follow the debtor. They attach to the flat, which
means your buyer collects them with the keys"; "Debts of community contributions belong to the property,
not the owner."
No rule in the base. `lph-community.json` covers art. 17.12 and its scope only. As drafted the attachment
is unlimited, and the statutory limit on how many years the charge reaches back is the first thing a
property lawyer will raise. Verify art. 9.1.e LPH before this goes out.

**WRONG in mechanism.** "Get the Nota Simple before the offer and the arras are signed. Any outstanding
fees it reveals can be deducted from the selling price."
A Nota Simple is a Land Registry extract. Community fee arrears are not registered there, and the document
that evidences them is the certificate of outstanding debt from the community's administrator or secretary,
which the seller must produce for completion. This is a mechanism error rather than a rules-base conflict ,
the base has no rule either way, but the audience is property lawyers who order both documents weekly.
Agents day 7 gets this right by not naming the Nota Simple; this post names it.
Correction: "Get the community's debt certificate before the offer and the arras are signed. Anything
outstanding comes off the price and is settled before the deeds are exchanged."

**UNSUPPORTED.** "there are only two grounds to have a vote revoked. It's contrary to the law, or it's
detrimental to the community."
No rule in the base. "Only two" is a closed enumeration offered to lawyers with no source, and it is the
sentence most likely to draw a correction in the comments. Either source it from art. 18 LPH or drop the
word "only".

**UNSUPPORTED.** "Most decisions pass by majority, votes are weighted by property size, and proxy voting is
allowed on important matters." No rule. It also sits oddly beside `lph.17_12.majority` (**verified**),
which the post never mentions: for tourist letting the threshold is three fifths of owners **and** of
quotas, and since 3 April 2025 it is needed to permit as well as to prohibit. A post about the voting
arithmetic a buyer is buying into should say so.

**UNSUPPORTED.** "from around 100 euros a quarter in modest communities to over 1,000 in high-end
developments." As agents day 7. No rule.

**OK (outside coverage).** "if the plan is to rent the flat out, the fees stay the owner's obligation, never
the tenant's"; the escalation to interest, court demand and auction.

## Attorneys day 13: Spain's default heirship ladder

**WRONG.** "50 percent of the joint property goes to the spouse. The rest of the estate divides into
thirds."
Rule `succession.gananciales_first` (**verified**), "THE ERROR TO AVOID": the matrimonial regime decides
what is in the estate, the legitima decides how the estate is divided, and running them as one calculation
"overstates the children's entitlement by roughly half." Under gananciales the surviving spouse keeps their
own half; that half never enters the estate and is not something that "goes to" them by succession.
Correction as attorneys day 2. Same conflation flagged in `ARTICLE_CORRECTIONS.md` #7.

**Partly OK (partial rule), and incomplete.** "One third's split equally between the children, a second
third's shared among the children as the testator chooses, and only the final third can be left freely."
Rule `succession.legitima` (**partial**): two thirds to descendants of which one third may be applied as
mejora, one third free. The substance matches, but the rule is partial, arts. 806, 808 and 823 CC could
not be read verbatim (`OPEN_QUESTIONS.md` #9), and it omits `succession.spouse_usufruct` (**verified**),
under which the surviving spouse takes the usufruct of the *tercio de mejora*. So the "second third" is not
the free hand among children the post describes.

**UNDERSTATED, materially.** "Some autonomous regions apply their own rules on top, so the map shifts with
the address." Two errors in one sentence.
Rule `succession.foral` (**verified**): six communities, Aragon, Cataluna, Baleares, Navarra, Pais Vasco
and Galicia, have their own succession law that **displaces** the Civil Code, not that applies "on top".
"The rules differ sharply, not marginally. Navarra and the Ayala valley in Alava have near-total freedom of
testation; Catalonia's legitima is one quarter and is a credit rather than a share of assets." And the
second error: "Which foral law applies depends on the deceased's **vecindad civil**, not on where the
property sits." The post says the map shifts with the address. It does not.
Correction: "Six regions run their own succession law that displaces the Civil Code entirely, and the
differences are large. Catalonia's legitima is a quarter and takes the form of a credit; Navarra allows
near-total freedom of testation. Which one applies turns on the deceased's vecindad civil, not on where the
property sits."

**UNSUPPORTED (outside coverage).** The intestate ladder, "children first, natural and adopted alike, then
the parents of the deceased, then the surviving spouse, then relatives like nieces and nephews. Where no
rightful relatives exist, the estate passes to the state." The base has no rule on intestate succession.
`OPEN_QUESTIONS.md` #9 lists "the intestate articles from 912" as unread. The order as described is
plausible but unverified, and this post's entire premise is that ladder.

**UNSUPPORTED (naming).** "the Law of Obligatory Heirs, Legitima." There is no Spanish statute of that
name; it is a translation artefact that also appears in the live articles. Say "forced heirship, the
legitima."

**MISSING.** `succession.eu_election` (**verified**), described in the base as "THE SINGLE MOST USEFUL FACT
FOR A FOREIGN OWNER." The post gestures at it ("unless a Spanish will, or clear wishes stated in an
international one, says so") without naming the Regulation or the mechanism, in a post that ends by asking
every foreign owner whether their family fits Spain's default order. Name it.

## Attorneys day 14: Legalise extensions before sale

**UNSUPPORTED.** "expect ICIO tax of 2 to 5 percent of construction cost, plus a smaller urban development
licensing fee." As agents day 26. No ICIO rule in the base, and the rate is municipal and capped by state
law, so a national range needs a source.

**UNSUPPORTED, and internally impossible.** "Works completed after August 2014 must be 15 years old, against
4 years for earlier ones, and regions vary."
As agents day 26. No rule in the base. And in September 2026 no work completed after August 2014 can yet be
15 years old, so on its own terms the sentence closes the antiquity route to every post-2014 extension ,
which is not what the post means, and lawyers will spot it immediately. Whatever the underlying rule is
(and it will be a regional prescription period, not a single national one), this formulation cannot go out.

**UNSUPPORTED (outside coverage).** "The antiquity certificate can legalise it retrospectively, with an
architect confirming the age on site"; Obra Mayor and Obra Menor scope; the town hall file contents; "the
community's certificate signed before a notary"; the Certificado Final de Obra; "the extension's declared
before a notary and written into the land registry."

**OK (outside coverage).** "in community properties there's a second catch. Even for work finished years
ago, the neighbours' consent is still needed before the deeds can be updated." Not verified, not
contradicted, and it is the practical point of the post.

## Attorneys day 15: The referral logic of care *(Bueno partner post)*

**Flag: price presented as the only price.** "on one platform, for 99 euros a year." See agents day 30.

**OK.** "licensed by the Bank of Spain via SEFIDE EDE S.L.U.", approved wording, verbatim.

**OK.** No country count. "Account setup" not "bank account setup". "Modelo 210" correct. No brand breach.

---

# BUENO CLAIMS, every instance, with its figure

| Post | Claim | Figure as written | Status |
|---|---|---|---|
| agents 30 | Country count | "customers across 28 plus countries" | **WRONG**, site says 25+ |
| attorneys 10 | Country count | "customers span more than 28 countries" | **WRONG**, site says 25+ |
| agents 30 | Price | "99 euros a year" (title and body) | One tier of several on the site |
| attorneys 5 | Price | "One subscription, 99 euros a year" | One tier of several |
| attorneys 10 | Price | "one annual subscription of 99 euros" | One tier of several |
| attorneys 15 | Price | "on one platform, for 99 euros a year" | One tier of several |
| agents 30 | Licence | "licensed by the Bank of Spain via SEFIDE EDE S.L.U." | **OK**, approved wording |
| attorneys 15 | Licence | "licensed by the Bank of Spain via SEFIDE EDE S.L.U." | **OK**, approved wording |
| agents 30 | Markets | "Norway, Sweden, Germany, the UK and France as the main markets" | OK, matches brief |
| attorneys 10 | Markets | "Norway, Sweden, Germany, the UK and France the biggest" | OK, matches brief |
| agents 30 | Product names | Bueno Account, Bueno Visa Card, Bueno Energy, Modelo 210 | **OK**, all correct |
| agents 5, 10, 15, 20, 25; attorneys 5, 10, 15 | Platform description, no figure | account / property tools / energy switching / Modelo 210 / insurance / multilingual support | OK |

**Country count.** Only two instances exist across all 45 posts, both saying 28. Both are overclaims
against the live site's 25+. `GROUND_TRUTH.md` records four numbers in circulation, 25+ on the site, 28+
in the project brief, 30+ in Natascha's draft CTA, 28 in these posts, and only 25+ is publicly supported.

**Price.** Four posts state 99 euros a year as the subscription price, three of them as "one subscription"
or "one annual subscription", which implies a single price. The site shows €49/yr, €99/yr, €169/yr and
€299/yr plus €30/yr, €29 and €2, and a price list PDF at /media/zodb1l2b/product-price-list-may-2026.pdf.
Recommend a standard qualifier in all four: "from 99 euros a year" or "the core plan, 99 euros a year".

**Licence wording.** Present and correct in two posts. Absent from seven others that describe a Spanish
IBAN account or card, including attorneys days 5 and 10, which pitch the account to lawyers. Recommend the
approved line wherever the account is named.

**No "Bueno Banking" anywhere.** No post uses "bank" or "banking" to describe Bueno. The only uses of
"bank" in a Bueno context are the approved Bank of Spain licence line. That rule is clean across all 45.

---

# BRAND RULE CHECK

Scanned all 45 posts mechanically for em dashes, en dashes, emoji, banned adjectives and competitor names.

- **Em dashes: none.** Zero occurrences of, or to in any of the 45 posts. Clean.
- **Emoji: none.** Clean.
- **"Revolutionary", "disruptive", "game-changing": none.** Clean.
- **Named competitor banks or fintechs: none.** No Sabadell, BBVA, CaixaBank, Revolut or Wise anywhere.
- **Named utilities: none.**
- **"Banking", two soft instances, neither describing Bueno.** Agents day 12: "which is why the banking
  setup belongs in the same conversation as the transfer plan." Agents day 24: "free banking offers in
  Spain often aren't free once card charges and minimum spending conditions kick in." Both refer to the
  buyer's own arrangements with Spanish banks, not to Bueno, so neither is a hard breach of the rule as
  written. Both read identically as "account setup" and "free account offers", so there is no cost to
  changing them.
- **"Santander", agents day 16.** "Santander, Zaragoza and Madrid sit low." This is the city, in a list of
  municipal IBI rates, not the bank. But it appears in a finance-adjacent post from a finance brand, and a
  skim reader will see a competitor bank named. Recommend swapping the example city.
- **Fear-based urgency: none that crosses the line.** Agents day 26 ("the risk scale ends at demolition")
  and attorneys day 14 ("the alternative is infraction risk and demolition") are the closest. Both state a
  consequence rather than manufacture a deadline, so I would not call either a breach.
- **Competitors attacked by name: none.** No Spanish bank is made the enemy anywhere.

---

# CALL TO ACTION AND SOFT PITCH

**Posts with a Bueno pitch (9 of 45).** All are explicitly built as partner posts and all close with an
inbox CTA rather than a product CTA:
agents 5, 10, 15, 20, 25, 30; attorneys 5, 10, 15.

**Posts with no Bueno mention (36 of 45).** All 30 non-partner agent posts and attorneys 1, 2, 3, 4, 6, 7,
8, 9, 11, 12, 13, 14, every one of these is pure trade content with no product reference at all.

**Posts with no call to action: none.** All 45 close with an action line. The non-partner posts close on a
practice instruction ("Order it for every serious buyer before the arras is drafted", "Bring an independent
surveyor into every rural file before the arras"), the partner posts on an inbox line ("my inbox is open",
"my messages are open", "I'm easy to find"). The pattern is consistent and no post trails off.

**Observation, not a finding.** The nine partner posts land on days 5, 10, 15, 20, 25 and 30 for agents and
5, 10, 15 for attorneys, a clean one-in-five cadence in both tracks.

---

# COUNTS

Counted from the labelled findings above.

| Category | Agents | Attorneys | Total |
|---|---|---|---|
| WRONG (incl. "partly wrong") | 24 | 15 | **39** |
| UNSUPPORTED (incl. outside coverage) | 56 | 22 | **78** |
| STALE | 3 | 1 | **4** |
| OK / partly OK (verified rule matched) | 29 | 16 | **45** |
| MISSING (a verified rule the post should carry and does not) | 4 | 8 | **12** |

**Posts with at least one WRONG finding: 20 of 45.**
Agents 1, 2, 6, 8, 11, 17, 18, 23, 27, 28, 29, 30. Attorneys 2, 3, 6, 7, 10, 11, 12, 13.

**Posts carrying a STALE finding: 4.** Agents 11, 17, 18. Attorneys 6.

**Posts with no WRONG, UNSUPPORTED or STALE finding: 9 of 45.**
Agents 5, 10, 15, 19, 20, 21, 25. Attorneys 5, 15.
Of these, agents 19 and 21 are trade content that simply makes no rule-checkable claim; the rest are
partner posts. Attorneys 5 and 15, and agents 15, still carry the €99 price-framing flag, and attorneys 5
the missing licence line.

**Highest priority, in order.**
1. **Agents 27**, the entire subject was annulled by the Tribunal Supremo in May and June 2026. Replace,
   do not edit.
2. **Agents 11 and attorneys 6**, the art. 17.12 position reversed on 3 April 2025 and both posts teach
   the old one, including to lawyers.
3. **Attorneys 7 and 11**, the 36.5 percent top ISD rate and the retired 5-percent-per-quarter penalty
   ladder, to an audience that knows both cold. Agents 29 states the correct ladder, so the two audiences
   are currently being given different law.
4. **Attorneys 2 and 13**, the gananciales and legitima conflation, which overstates the children's share
   by roughly half.
5. **Agents 8 and attorneys 3**, capital gains stated at 19/24 when the verified rate is 19 for everyone;
   plus "30 days" for plusvalia where the rule says 30 working days.
6. **Agents 9 and attorneys 4**, the whole Ley 57/68 post rests on a statute the base does not cover and
   whose current status was not verified.
7. **Agents 29**, quarterly Modelo 210 windows that no longer exist, with a real deadline (Q3 2026, 1 to
   20 October 2026) falling inside the posting window.
8. **Agents 23**, the EX-18 form number and the 11-euro fee, both wrong against verified rules and both
   already logged as live-site errors.
9. **Agents 30 and attorneys 10**, the 28-country overclaim, and the €99 price framing across four posts.
