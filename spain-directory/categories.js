// The six trades the directory covers.
//
// `query` is the Spanish search phrase sent to Google Places. It is deliberately Spanish
// rather than English: Spanish tradespeople list themselves in Spanish, and searching
// "plumber" in Alicante returns a thin, skewed set biased towards businesses that market
// to expats, which is the opposite of what a review-ranked directory should surface.
// `types` is retained for reference only and is NOT sent to Google. It used to be passed
// as includedType, which restricts results to places whose PRIMARY type matches exactly.
// Most Spanish trade businesses are filed as general_contractor, a store, or a plain point
// of interest, so that filter returned a single plumber for a town the size of Benidorm.
// Do not reinstate it.
//
// Labels are not here. They live in the locale files as calc_directory.cat_<slug>, so
// each trade reads naturally in all six languages.

export const CATEGORIES = [
  { slug: 'plumber',      query: 'fontanero',                    types: ['plumber'] },
  { slug: 'electrician',  query: 'electricista',                 types: ['electrician'] },
  { slug: 'locksmith',    query: 'cerrajero',                    types: ['locksmith'] },
  { slug: 'aircon',       query: 'aire acondicionado instalación', types: [] },
  { slug: 'pool',         query: 'mantenimiento de piscinas',    types: [] },
  { slug: 'builder',      query: 'empresa de reformas',          types: ['general_contractor'] },
];

export const CATEGORY_BY_SLUG = Object.fromEntries(CATEGORIES.map(c => [c.slug, c]));

// Property professionals, served by /spain-professionals rather than by the trades page.
//
// Kept separate on purpose. A burst pipe is an emergency and you want a phone number; a
// purchase is a decision and you want to compare. Putting a lawyer in the same list as a
// locksmith would make both lists worse.
//
// The set is deliberately the full list of people a foreign owner actually has to deal
// with, not the obvious two. A gestoría handles the NIE and the tax filings, an
// administrador de fincas runs the community your flat sits in, a traductor jurado is the
// only person whose translation a Spanish registry will accept. Leaving those out would
// make the page look like a property portal rather than a directory.
//
// Queries are Spanish because that is how these businesses list themselves. "abogados"
// is plural because Spanish firms name themselves that way ("Abogados García"), and
// "abogado inmobiliario" is too narrow: in most of these towns the property work is done
// by a general practice, so the specific query returns nothing.
export const PROFESSIONALS = [
  { slug: 'real-estate',      query: 'inmobiliaria' },
  { slug: 'lawyer',           query: 'abogados' },
  { slug: 'gestoria',         query: 'gestoría administrativa' },
  { slug: 'architect',        query: 'arquitecto' },
  { slug: 'community-admin',  query: 'administrador de fincas' },
  { slug: 'surveyor',         query: 'tasador inmobiliario' },
  { slug: 'insurance',        query: 'correduría de seguros' },
  { slug: 'translator',       query: 'traductor jurado' },
];

export const PROFESSIONAL_BY_SLUG = Object.fromEntries(PROFESSIONALS.map(c => [c.slug, c]));

// Every category the API will accept, from either page. api/directory.js validates
// against this, so a slug that is not here can never reach Google on our billed key.
export const ALL_CATEGORIES = [...CATEGORIES, ...PROFESSIONALS];
export const ANY_CATEGORY_BY_SLUG = Object.fromEntries(ALL_CATEGORIES.map(c => [c.slug, c]));
