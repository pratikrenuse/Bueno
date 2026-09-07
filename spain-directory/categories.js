// The six trades the directory covers.
//
// `query` is the Spanish search phrase sent to Google Places. It is deliberately Spanish
// rather than English: Spanish tradespeople list themselves in Spanish, and searching
// "plumber" in Alicante returns a thin, skewed set biased towards businesses that market
// to expats, which is the opposite of what a review-ranked directory should surface.
// `types` narrows the result set using Google's own place types where one exists.
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
