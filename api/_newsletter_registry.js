// Everything the newsletter has already used, so nothing repeats.
//
// PAST lists issues 4 to 12 as published on newsletter.getbueno.com (read 1 Oct 2026).
// Issues 1 to 3 are no longer online. GUIDES is the library of branded guide PDFs built with
// studio/guides/render.py. The health action and the research job both check new issues
// against these lists.

export const PAST = [
  { number: 12, date: '2026-09-04', guide: 'hoa-rules', region: 'costa-blanca', reader_topic: 'community-bill-not-agreed' },
  { number: 11, date: '2026-07-17', guide: 'nota-simple', region: 'malaga', reader_topic: 'summer-only-rental-tax' },
  { number: 10, date: '2026-05-20', guide: 'frozen-account', region: null, reader_topic: 'never-filed-taxes' },
  { number: 9, date: '2026-04-10', guide: 'plusvalia', region: 'barcelona', reader_topic: 'property-if-i-die' },
  { number: 8, date: '2026-03-24', guide: 'nie-to-dni', region: null, reader_topic: 'nota-simple-before-buying' },
  { number: 7, date: '2026-02-19', guide: 'scams', region: null, reader_topic: 'away-from-property' },
  { number: 6, date: null, guide: 'lost-documents', region: null, reader_topic: 'rental-regulatory-risk' },
  { number: 5, date: null, guide: 'estate-planning', region: null, reader_topic: 'uk-mortgage-after-brexit' },
  { number: 4, date: null, guide: 'noneu-100-tax', region: 'benidorm', reader_topic: 'anti-okupa-law' },
];

// Regions the spotlight rotates through. A region is not reused until every other one has
// had its turn.
export const REGIONS = [
  { key: 'costa-blanca', name: 'Costa Blanca' },
  { key: 'malaga', name: 'Málaga and the Costa del Sol' },
  { key: 'barcelona', name: 'Barcelona' },
  { key: 'benidorm', name: 'Benidorm' },
  { key: 'murcia', name: 'Murcia and the Costa Cálida' },
  { key: 'canary-islands', name: 'The Canary Islands' },
  { key: 'balearic-islands', name: 'The Balearic Islands' },
  { key: 'costa-del-sol-west', name: 'Marbella and Estepona' },
  { key: 'valencia', name: 'Valencia' },
  { key: 'costa-brava', name: 'The Costa Brava' },
  { key: 'almeria', name: 'Almería' },
  { key: 'torrevieja-orihuela', name: 'Torrevieja and Orihuela Costa' },
  { key: 'madrid', name: 'Madrid' },
  { key: 'costa-de-la-luz', name: 'The Costa de la Luz' },
  { key: 'costa-dorada', name: 'The Costa Dorada' },
];

// The branded guide library. file = the stem of the PDF names in public/newsletter-guides.
// From 10 Nov 2026 every issue gets a NEW guide built from studio/articles (never an older guide reused),
// rendered with studio/guides/render.py and checked against current law before it is linked.
export const GUIDES = [
  { slug: 'closing-up-for-winter', file: 'Closing-Up-Your-Spanish-Home-For-Winter', title: 'Leaving your Spanish home for the winter', season: 'autumn' },
  { slug: 'non-resident-property-tax', file: 'Non-Resident-Property-Tax-Spain-2026', title: 'Non-resident property tax in Spain', season: 'any' },
  { slug: 'electricity-bills', file: 'Electricity-Bills-In-Spain', title: 'Your electricity bill in Spain, explained', season: 'any' },
  { slug: 'renting-out-legally', file: 'Renting-Out-Your-Spanish-Home-Legally', title: 'Renting out your Spanish home legally', season: 'any' },
  { slug: 'owner-calendar', file: 'Your-Year-As-A-Spanish-Property-Owner', title: 'Your year as a Spanish property owner', season: 'winter' },
  { slug: 'community-fees', file: 'Community-Fees-In-Spain', title: 'Community fees in Spain: what you pay and your rights', season: 'any', articles: ['community-fees', 'hoa-rules', 'direct-debit'], built: '2026-11-10' },
  { slug: 'ibi-tax', file: 'IBI-Property-Tax-In-Spain', title: "IBI in Spain: your yearly local property tax explained", season: 'any', articles: ['ibi-tax'], built: '2026-11-10', edition: '2026-11-23' },
  { slug: 'property-insurance', file: 'Home-Insurance-In-Spain', title: "Home insurance in Spain: what your policy should cover", season: 'any', articles: ['property-insurance'], built: '2026-11-10', edition: '2026-12-07' },
  { slug: 'utilities-setup', file: 'Utilities-For-Your-Spanish-Home', title: "Electricity, water, gas and internet for your Spanish home", season: 'any', articles: ['utilities-setup'], built: '2026-11-10', edition: '2026-12-21' },
  { slug: 'local-tax-office', file: 'Who-Taxes-Your-Spanish-Home', title: "Who taxes your Spanish home, and the dates for 2027", season: 'any', articles: ['local-tax-office'], built: '2026-11-10', edition: '2027-01-04' },
  { slug: 'buying-fees', file: 'The-Real-Cost-Of-Buying-In-Spain', title: "The real cost of buying a home in Spain", season: 'any', articles: ['buying-fees'], built: '2026-11-10', edition: '2027-01-18' },
  { slug: 'landlord-tenant-issues', file: 'Letting-To-A-Long-Term-Tenant', title: "Letting your Spanish home to a long-term tenant", season: 'any', articles: ['landlord-tenant-issues'], built: '2026-11-10', edition: '2027-02-01' },
  { slug: 'extension-deeds', file: 'Extending-Your-Spanish-Home-Legally', title: "Extending your Spanish home and adding it to the deeds", season: 'any', articles: ['extension-deeds'], built: '2026-11-10', edition: '2027-02-15' },
  { slug: 'epc', file: 'Energy-Certificates-In-Spain', title: "The energy certificate for your Spanish home", season: 'any', articles: ['epc'], built: '2026-11-10', edition: '2027-03-01' },
  { slug: 'seasonal-vs-tourist-rentals', file: 'Seasonal-Or-Holiday-Letting-In-Spain', title: "Seasonal or holiday letting: which one fits your Spanish home", season: 'any', articles: ['seasonal-vs-tourist-rentals'], built: '2026-11-10', edition: '2027-03-15' },
  { slug: 'preventative-maintenance', file: 'Caring-For-Your-Spanish-Home-From-Abroad', title: "Caring for your Spanish home from abroad", season: 'any', articles: ['preventative-maintenance'], built: '2026-11-10', edition: '2027-03-29' },
];

export const usedGuides = () => new Set(PAST.map(p => p.guide));
export const usedRegions = () => new Set(PAST.map(p => p.region).filter(Boolean));
export const usedTopics = () => new Set(PAST.map(p => p.reader_topic));
