// Which towns get their own indexed page, and in what order they are linked.
//
// COVERAGE: every town in localities.js, all 660 of them, in English.
//
// This started as a curated 133 on the argument that a new domain is crawled in the
// thousands and that near-identical pages drag down the ones that would rank. The counter
// argument won, and it is the stronger one: these pages are not near-identical. Each names
// a real town, its province and its coast, says what that trade does and what to ask, and
// links to its neighbours. A town with no page earns nothing at all, and "fontanero Vera"
// is a search with almost no competition. Publishing costs a static file.
//
// The list is ordered rather than alphabetical, and that ordering is the part that still
// does the work a curated list used to do. FEATURED_TOWNS below is the Costa property
// market: the Costa Blanca strip, the Costa del Sol, the Balearics, the Canaries and the
// rest, plus the provincial capitals people search by name. Those come first in every hub
// page's links and in the sitemap, so the pages most likely to rank are the ones a crawler
// meets first. The remaining towns follow.
//
// WHAT IS STILL NOT PUBLISHED, AND WHY
// The six-locale version, 660 x 14 x 6, is not 55,440 pages of content. It is 9,240 pages
// of content and 46,200 copies of it, because the town and category copy in seo/copy.js
// exists in English only: CAT_NAME and CAT_PL are translated, but TOWN.category's titles,
// leads and tails are not. Generating those URLs today would put English sentences under a
// /no/ and /de/ path, which is the one thing that genuinely is thin. Write the five other
// locales into TOWN.category and they can ship the same day.
//
// Every slug is checked against localities.js at build time. A typo fails the build rather
// than silently producing a 404 in the sitemap, which is worse than no page at all.

import { LOCALITIES } from '../spain-directory/localities.js';

export const FEATURED_TOWNS = [
  // --- Costa Blanca north, the Nordic and British heartland --------------------
  'javea', 'denia', 'moraira', 'calpe', 'altea', 'benissa',

  // --- Costa Blanca south -------------------------------------------------------
  'benidorm', 'alfaz-del-pi', 'polop', 'finestrat', 'villajoyosa',
  'alicante', 'el-campello', 'elche', 'santa-pola', 'guardamar',
  'torrevieja', 'orihuela', 'orihuela-costa', 'pilar-de-la-horadada',
  'ciudad-quesada', 'san-miguel-de-salinas', 'almoradi', 'elda', 'novelda',

  // --- Costa Cálida, Murcia -----------------------------------------------------
  'murcia', 'cartagena', 'la-manga', 'los-alcazares', 'san-javier',
  'mazarron', 'aguilas', 'torre-pacheco', 'fuente-alamo',

  // --- Costa del Sol ------------------------------------------------------------
  'malaga', 'marbella', 'san-pedro-alcantara', 'estepona', 'fuengirola', 'benalmadena',
  'torremolinos', 'mijas', 'nerja', 'torrox', 'velez-malaga', 'rincon-de-la-victoria',
  'manilva', 'sotogrande', 'san-roque', 'ronda', 'coin', 'alhaurin-el-grande',
  'alhaurin-de-la-torre',

  // --- Costa de Almería ---------------------------------------------------------
  'almeria', 'mojacar', 'vera', 'roquetas-de-mar', 'huercal-overa',

  // --- Costa de la Luz and Cádiz -------------------------------------------------
  'cadiz', 'chiclana', 'conil-de-la-frontera', 'tarifa',
  'el-puerto-de-santa-maria', 'jerez-de-la-frontera', 'sanlucar-de-barrameda', 'ayamonte',
  'isla-cristina', 'huelva',

  // --- Balearics ------------------------------------------------------------------
  'palma', 'calvia', 'andratx', 'pollenca', 'alcudia', 'soller', 'santanyi',
  'felanitx', 'manacor', 'llucmajor', 'ibiza', 'santa-eularia', 'mahon', 'ciutadella',

  // --- Canaries ---------------------------------------------------------------------
  'las-palmas', 'santa-cruz-tenerife', 'adeje', 'los-cristianos',
  'puerto-de-la-cruz', 'san-miguel-de-abona', 'granadilla-de-abona', 'puerto-rico-mogan', 'san-bartolome-de-tirajana',
  'puerto-del-carmen', 'teguise',
  'pajara', 'caleta-de-fuste', 'arrecife',

  // --- Costa Brava and Catalunya ------------------------------------------------------
  'barcelona', 'sitges', 'castelldefels', 'lloret-de-mar', 'blanes',
  'palamos', 'roses', 'empuriabrava', 'lescala',
  'platja-daro', 'girona', 'salou', 'cambrils', 'tarragona',

  // --- Costa del Azahar and Valencia ---------------------------------------------------
  'valencia', 'gandia', 'oliva', 'cullera', 'sagunto', 'castello-de-la-plana', 'benicassim', 'vinaros',

  // --- Inland and capitals people search by name ------------------------------------------
  'madrid', 'sevilla', 'granada', 'cordoba', 'zaragoza', 'bilbao', 'donostia-san-sebastian',
  'santander', 'oviedo', 'gijon', 'vigo', 'a-coruna', 'pontevedra', 'salamanca', 'toledo',
];

// Towns a foreign owner genuinely buys in that are NOT in localities.js, because that file
// was generated with a 15,000 population floor. They are dropped from the priority list
// rather than pointed at a URL that 404s, which in a sitemap is worse than no page at all.
//
// Adding them needs a name, province, region and centre coordinates in localities.js. It
// would improve the directory as well as the search coverage, because these are exactly
// the places people ask about.
export const MISSING_FROM_LOCALITIES = [
  'Teulada', 'Benitachell', 'Gata de Gorgos', 'Pedreguer', 'Ondara', 'Els Poblets', 'Orba',
  'Parcent', 'Albir', 'La Nucia', 'Sant Joan d\'Alacant', 'Rojales', 'Algorfa',
  'Los Montesinos', 'Formentera del Segura', 'Catral', 'Dolores', 'Benijofar',
  'San Fulgencio', 'San Pedro del Pinatar', 'Casares', 'Competa', 'Frigiliana', 'Garrucha',
  'Aguadulce', 'Albox', 'Arboleas', 'Turre', 'Vejer de la Frontera', 'Campos',
  'Sant Antoni de Portmany', 'Sant Josep de sa Talaia', 'Tias', 'Tossa de Mar',
  'Castello d\'Empuries', 'Begur', 'Oropesa del Mar', 'Peniscola', 'Alcossebre',
];

// Coast groupings, for the hub pages that stop every town page being an orphan.
// A page nothing links to is a page Google finds late and trusts little, and the town
// dropdown in the app is a <select>, which is not a link and does not pass anything.
export const COASTS = {
  'costa-blanca':   { name: 'Costa Blanca',   provinces: ['alicante'] },
  'costa-calida':   { name: 'Costa Cálida',   provinces: ['murcia'] },
  'costa-del-sol':  { name: 'Costa del Sol',  provinces: ['malaga'] },
  'costa-de-almeria': { name: 'Costa de Almería', provinces: ['almeria'] },
  'costa-de-la-luz':  { name: 'Costa de la Luz',  provinces: ['cadiz', 'huelva'] },
  'islas-baleares': { name: 'Islas Baleares', provinces: ['baleares'] },
  'islas-canarias': { name: 'Islas Canarias', provinces: ['las_palmas', 'santa_cruz_de_tenerife'] },
  'costa-brava':    { name: 'Costa Brava',    provinces: ['girona'] },
  'costa-del-azahar': { name: 'Costa del Azahar', provinces: ['castellon'] },
};

// Every town in the directory gets a page. The featured ones lead, so hub links and the
// sitemap put the towns a foreign owner actually buys in ahead of the rest.
const FEATURED_SET = new Set(FEATURED_TOWNS);
export const PRIORITY_TOWNS = [
  ...FEATURED_TOWNS,
  ...LOCALITIES.map(l => l.slug).filter(slug => !FEATURED_SET.has(slug)),
];
