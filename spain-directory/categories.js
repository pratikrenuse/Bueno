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
