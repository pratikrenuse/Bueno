// "Our existing data" for the Instagram reels: background facts that were checked against
// official sources for the LinkedIn programme (project doc LinkedIn_Verified_Fact_Base_Sept2026).
// A reel may add ONE of these to its "what it means for you" scene, and only when it plainly
// belongs to the day's story. Nothing outside this list is ever added from memory.
//
// Keep each fact a complete sentence that is true on its own. When a rule changes, change it
// here first.

export const FACTS = [
  { id: 'ibi_1jan', topic: 'owning, IBI, selling', text: 'IBI, the yearly council property tax, is owed in full by whoever owns the home on 1 January, even if they sell later in the year.' },
  { id: 'imputed_income', topic: 'owning, non-resident tax', text: 'A non-resident who owns a Spanish home that is not let pays non-resident income tax every year on an imputed income based on the cadastral value.' },
  { id: 'nr_rates', topic: 'non-resident tax, letting', text: 'Non-residents pay 19% on rental income if they live in the EU, Iceland or Norway, and 24% if they live anywhere else, including the UK.' },
  { id: 'rent_annual', topic: 'letting, non-resident tax', text: 'Rental income from 2026 onwards is declared once a year by non-residents, between 1 and 20 April of the following year.' },
  { id: 'sale_3pct', topic: 'selling, non-resident tax', text: 'When a non-resident sells a Spanish home, the buyer must hold back 3% of the price and pay it to the tax office within one month.' },
  { id: 'sale_gain_19', topic: 'selling, non-resident tax', text: 'Non-residents pay 19% tax on the gain when they sell a Spanish property, whatever country they live in.' },
  { id: 'plusvalia_buyer', topic: 'selling, buying', text: 'When the seller is a non-resident, the law makes the buyer pay the municipal plusvalía tax to the council on the seller\'s behalf.' },
  { id: 'community_debt', topic: 'buying, community fees', text: 'A buyer\'s flat stays liable for the seller\'s unpaid community fees for the current year and the three calendar years before it.' },
  { id: 'community_cert', topic: 'buying, community fees', text: 'The community secretary must issue a certificate of the seller\'s fee debts within seven calendar days of being asked.' },
  { id: 'tourist_35', topic: 'letting, tourist lets, community', text: 'Since 3 April 2025, a new tourist let in a building needs the express approval of three fifths of the owners, holding three fifths of the shares.' },
  { id: 'tourist_20', topic: 'letting, tourist lets, community', text: 'A community can raise a tourist-let flat\'s share of the common costs by up to 20%.' },
  { id: 'nota_simple', topic: 'buying', text: 'A Nota Simple from the Land Registry costs 9.02 euros plus VAT and shows the registered owner and registered charges such as mortgages.' },
  { id: 'valor_ref', topic: 'buying, purchase tax', text: 'Since 2022 the Catastro reference value is the minimum base for transfer tax, so the tax can be higher than the price paid would suggest.' },
  { id: 'itp_rates', topic: 'buying, purchase tax, regions', text: 'Transfer tax on a resale home is 6% in Madrid, 7% in Andalusia, 7.75% in Murcia and 9% in the Valencia region up to one million euros.' },
  { id: 'new_build_vat', topic: 'buying, new builds', text: 'The first sale of a new home by a developer carries 10% VAT instead of transfer tax.' },
  { id: 'offplan_guarantee', topic: 'buying, new builds, off-plan', text: 'A developer must guarantee every staged payment a buyer makes on an off-plan home, plus legal interest, with insurance or a bank guarantee.' },
  { id: 'mortgage_10days', topic: 'buying, mortgages', text: 'A lender must hand over the mortgage offer and draft contract at least ten calendar days before the deed is signed.' },
  { id: 'arras', topic: 'buying, deposits', text: 'Under Spanish case law, a deposit only lets the buyer walk away (losing it) or the seller walk away (repaying double) when the contract clearly says so.' },
  { id: 'squat_morada', topic: 'squatting, owning', text: 'A second home that is used, even only some weeks a year, counts as a dwelling, which gives the owner stronger protection against squatters.' },
  { id: 'squat_express', topic: 'squatting', text: 'An individual owner can use a fast civil procedure where squatters get five days to show a right to be there before the court orders the home returned.' },
  { id: 'insurance_ccs', topic: 'insurance, storms, floods', text: 'Damage from floods, earthquakes or winds above 120 km/h is paid by the state Consorcio, but only if the home has an ordinary insurance policy.' },
  { id: 'insurance_7days', topic: 'insurance', text: 'A home insurance claim should be reported within seven days of finding the damage, unless the policy allows longer.' },
  { id: 'epc', topic: 'selling, letting', text: 'A home that is sold or let needs an energy certificate, and its rating must appear in every advert.' },
  { id: 'late_filing', topic: 'tax, deadlines', text: 'A tax return filed late without a letter from the tax office costs 1% extra plus 1% for each full month late, for the first 12 months.' },
  { id: 'residency_183', topic: 'tax residence', text: 'Spending more than 183 days in Spain in a calendar year makes a person tax resident in Spain.' },
  { id: 'wealth_700k', topic: 'wealth tax', text: 'Non-residents pay Spanish wealth tax only on assets in Spain, and the first 700,000 euros per person are exempt.' },
  { id: 'golden_visa', topic: 'buying, residence, politics', text: 'The investor visa for buying property in Spain was abolished on 3 April 2025, although existing permits can still be renewed.' },
  { id: 'nontax_proposal', topic: 'politics, buying, non-EU buyers', text: 'The proposed tax of up to 100% on homes bought by non-EU non-residents has never become law.' },
  { id: 'cash_limit', topic: 'buying, cash', text: 'Cash payments of 1,000 euros or more are not allowed when one side is a business, and the fine is 25% of the cash paid.' },
  { id: 'switch_account', topic: 'money, direct debits', text: 'Moving a Spanish account to another provider is free, and the new provider moves the direct debits within 13 business days.' },
]

export const factById = (id) => FACTS.find(f => f.id === id) || null
