// The localities the directory covers, shared by the front end (search box) and the
// API (search centre for the Google Places lookup).
//
// Coverage note: Spain has more than 8,000 municipalities, so this is deliberately not
// all of them. It is the set of places where foreign property owners actually buy, which
// is what the tool is for. Each locality times six trades is one cached cell, and cells
// refresh at most once every 30 days, so this list is also what keeps the Google Places
// bill inside the free monthly allowance. Adding a locality here is all that is needed
// to make it searchable. Nothing else changes.
//
// Coordinates are the town centre. The API searches a radius around this point rather
// than trusting a text match on the name, because several of these names repeat across
// Spain (there is more than one Santa Eulalia, more than one Guardamar).

export const REGIONS = {
  costa_blanca: 'Costa Blanca',
  costa_del_sol: 'Costa del Sol',
  costa_calida: 'Costa Cálida',
  costa_brava: 'Costa Brava and Catalonia',
  costa_almeria: 'Almería and Costa de la Luz',
  balearics: 'Balearic Islands',
  canaries: 'Canary Islands',
  cities: 'Major cities',
};

export const LOCALITIES = [
  // Costa Blanca (Alicante)
  { slug: 'alicante', name: 'Alicante', province: 'Alicante', region: 'costa_blanca', lat: 38.3452, lng: -0.4810 },
  { slug: 'benidorm', name: 'Benidorm', province: 'Alicante', region: 'costa_blanca', lat: 38.5342, lng: -0.1314 },
  { slug: 'torrevieja', name: 'Torrevieja', province: 'Alicante', region: 'costa_blanca', lat: 37.9787, lng: -0.6822 },
  { slug: 'orihuela-costa', name: 'Orihuela Costa', province: 'Alicante', region: 'costa_blanca', lat: 37.9260, lng: -0.7580 },
  { slug: 'javea', name: 'Jávea (Xàbia)', province: 'Alicante', region: 'costa_blanca', lat: 38.7891, lng: 0.1662 },
  { slug: 'denia', name: 'Dénia', province: 'Alicante', region: 'costa_blanca', lat: 38.8407, lng: 0.1057 },
  { slug: 'moraira', name: 'Moraira', province: 'Alicante', region: 'costa_blanca', lat: 38.6870, lng: 0.1420 },
  { slug: 'calpe', name: 'Calpe (Calp)', province: 'Alicante', region: 'costa_blanca', lat: 38.6446, lng: 0.0450 },
  { slug: 'altea', name: 'Altea', province: 'Alicante', region: 'costa_blanca', lat: 38.5989, lng: -0.0517 },
  { slug: 'alfaz-del-pi', name: "L'Alfàs del Pi", province: 'Alicante', region: 'costa_blanca', lat: 38.5786, lng: -0.1017 },
  { slug: 'guardamar', name: 'Guardamar del Segura', province: 'Alicante', region: 'costa_blanca', lat: 38.0886, lng: -0.6519 },
  { slug: 'santa-pola', name: 'Santa Pola', province: 'Alicante', region: 'costa_blanca', lat: 38.1938, lng: -0.5619 },
  { slug: 'pilar-de-la-horadada', name: 'Pilar de la Horadada', province: 'Alicante', region: 'costa_blanca', lat: 37.8672, lng: -0.7897 },
  { slug: 'san-miguel-de-salinas', name: 'San Miguel de Salinas', province: 'Alicante', region: 'costa_blanca', lat: 37.9767, lng: -0.7889 },
  { slug: 'ciudad-quesada', name: 'Ciudad Quesada (Rojales)', province: 'Alicante', region: 'costa_blanca', lat: 38.0872, lng: -0.7239 },
  { slug: 'elche', name: 'Elche (Elx)', province: 'Alicante', region: 'costa_blanca', lat: 38.2669, lng: -0.6983 },
  { slug: 'villajoyosa', name: 'Villajoyosa', province: 'Alicante', region: 'costa_blanca', lat: 38.5058, lng: -0.2331 },
  { slug: 'finestrat', name: 'Finestrat', province: 'Alicante', region: 'costa_blanca', lat: 38.5678, lng: -0.2094 },
  { slug: 'polop', name: 'Polop', province: 'Alicante', region: 'costa_blanca', lat: 38.6197, lng: -0.1281 },
  { slug: 'benissa', name: 'Benissa', province: 'Alicante', region: 'costa_blanca', lat: 38.7150, lng: 0.0483 },
  { slug: 'gandia', name: 'Gandía', province: 'Valencia', region: 'costa_blanca', lat: 38.9678, lng: -0.1806 },
  { slug: 'oliva', name: 'Oliva', province: 'Valencia', region: 'costa_blanca', lat: 38.9186, lng: -0.1181 },

  // Costa del Sol (Málaga)
  { slug: 'malaga', name: 'Málaga', province: 'Málaga', region: 'costa_del_sol', lat: 36.7213, lng: -4.4214 },
  { slug: 'marbella', name: 'Marbella', province: 'Málaga', region: 'costa_del_sol', lat: 36.5101, lng: -4.8825 },
  { slug: 'estepona', name: 'Estepona', province: 'Málaga', region: 'costa_del_sol', lat: 36.4276, lng: -5.1459 },
  { slug: 'fuengirola', name: 'Fuengirola', province: 'Málaga', region: 'costa_del_sol', lat: 36.5397, lng: -4.6250 },
  { slug: 'benalmadena', name: 'Benalmádena', province: 'Málaga', region: 'costa_del_sol', lat: 36.5988, lng: -4.5163 },
  { slug: 'torremolinos', name: 'Torremolinos', province: 'Málaga', region: 'costa_del_sol', lat: 36.6203, lng: -4.4998 },
  { slug: 'mijas', name: 'Mijas', province: 'Málaga', region: 'costa_del_sol', lat: 36.5958, lng: -4.6378 },
  { slug: 'nerja', name: 'Nerja', province: 'Málaga', region: 'costa_del_sol', lat: 36.7454, lng: -3.8730 },
  { slug: 'torrox', name: 'Torrox', province: 'Málaga', region: 'costa_del_sol', lat: 36.7578, lng: -3.9553 },
  { slug: 'manilva', name: 'Manilva', province: 'Málaga', region: 'costa_del_sol', lat: 36.3761, lng: -5.2506 },
  { slug: 'san-pedro-alcantara', name: 'San Pedro de Alcántara', province: 'Málaga', region: 'costa_del_sol', lat: 36.4847, lng: -4.9903 },
  { slug: 'sotogrande', name: 'Sotogrande', province: 'Cádiz', region: 'costa_del_sol', lat: 36.2870, lng: -5.2810 },
  { slug: 'velez-malaga', name: 'Vélez-Málaga', province: 'Málaga', region: 'costa_del_sol', lat: 36.7797, lng: -4.1006 },
  { slug: 'rincon-de-la-victoria', name: 'Rincón de la Victoria', province: 'Málaga', region: 'costa_del_sol', lat: 36.7167, lng: -4.2764 },
  { slug: 'coin', name: 'Coín', province: 'Málaga', region: 'costa_del_sol', lat: 36.6597, lng: -4.7561 },
  { slug: 'alhaurin-el-grande', name: 'Alhaurín el Grande', province: 'Málaga', region: 'costa_del_sol', lat: 36.6431, lng: -4.6892 },
  { slug: 'ronda', name: 'Ronda', province: 'Málaga', region: 'costa_del_sol', lat: 36.7429, lng: -5.1665 },

  // Costa Cálida (Murcia)
  { slug: 'murcia', name: 'Murcia', province: 'Murcia', region: 'costa_calida', lat: 37.9922, lng: -1.1307 },
  { slug: 'cartagena', name: 'Cartagena', province: 'Murcia', region: 'costa_calida', lat: 37.6257, lng: -0.9966 },
  { slug: 'los-alcazares', name: 'Los Alcázares', province: 'Murcia', region: 'costa_calida', lat: 37.7422, lng: -0.8517 },
  { slug: 'la-manga', name: 'La Manga del Mar Menor', province: 'Murcia', region: 'costa_calida', lat: 37.6392, lng: -0.7194 },
  { slug: 'san-javier', name: 'San Javier', province: 'Murcia', region: 'costa_calida', lat: 37.8064, lng: -0.8372 },
  { slug: 'mazarron', name: 'Mazarrón', province: 'Murcia', region: 'costa_calida', lat: 37.5992, lng: -1.3139 },
  { slug: 'aguilas', name: 'Águilas', province: 'Murcia', region: 'costa_calida', lat: 37.4066, lng: -1.5836 },
  { slug: 'torre-pacheco', name: 'Torre-Pacheco', province: 'Murcia', region: 'costa_calida', lat: 37.7411, lng: -0.9525 },
  { slug: 'fuente-alamo', name: 'Fuente Álamo', province: 'Murcia', region: 'costa_calida', lat: 37.7275, lng: -1.1653 },

  // Costa Brava and Catalonia
  { slug: 'girona', name: 'Girona', province: 'Girona', region: 'costa_brava', lat: 41.9794, lng: 2.8214 },
  { slug: 'lloret-de-mar', name: 'Lloret de Mar', province: 'Girona', region: 'costa_brava', lat: 41.7005, lng: 2.8455 },
  { slug: 'blanes', name: 'Blanes', province: 'Girona', region: 'costa_brava', lat: 41.6748, lng: 2.7908 },
  { slug: 'roses', name: 'Roses', province: 'Girona', region: 'costa_brava', lat: 42.2622, lng: 3.1764 },
  { slug: 'empuriabrava', name: 'Empuriabrava', province: 'Girona', region: 'costa_brava', lat: 42.2472, lng: 3.1219 },
  { slug: 'lescala', name: "L'Escala", province: 'Girona', region: 'costa_brava', lat: 42.1236, lng: 3.1319 },
  { slug: 'palafrugell', name: 'Palafrugell', province: 'Girona', region: 'costa_brava', lat: 41.9175, lng: 3.1631 },
  { slug: 'platja-daro', name: "Platja d'Aro", province: 'Girona', region: 'costa_brava', lat: 41.8175, lng: 3.0656 },
  { slug: 'sitges', name: 'Sitges', province: 'Barcelona', region: 'costa_brava', lat: 41.2371, lng: 1.8055 },
  { slug: 'salou', name: 'Salou', province: 'Tarragona', region: 'costa_brava', lat: 41.0763, lng: 1.1417 },
  { slug: 'cambrils', name: 'Cambrils', province: 'Tarragona', region: 'costa_brava', lat: 41.0672, lng: 1.0575 },

  // Almería and Costa de la Luz
  { slug: 'almeria', name: 'Almería', province: 'Almería', region: 'costa_almeria', lat: 36.8340, lng: -2.4637 },
  { slug: 'mojacar', name: 'Mojácar', province: 'Almería', region: 'costa_almeria', lat: 37.1394, lng: -1.8511 },
  { slug: 'vera', name: 'Vera', province: 'Almería', region: 'costa_almeria', lat: 37.2469, lng: -1.8672 },
  { slug: 'roquetas-de-mar', name: 'Roquetas de Mar', province: 'Almería', region: 'costa_almeria', lat: 36.7642, lng: -2.6147 },
  { slug: 'chiclana', name: 'Chiclana de la Frontera', province: 'Cádiz', region: 'costa_almeria', lat: 36.4194, lng: -6.1467 },
  { slug: 'tarifa', name: 'Tarifa', province: 'Cádiz', region: 'costa_almeria', lat: 36.0143, lng: -5.6044 },
  { slug: 'cadiz', name: 'Cádiz', province: 'Cádiz', region: 'costa_almeria', lat: 36.5271, lng: -6.2886 },

  // Balearic Islands
  { slug: 'palma', name: 'Palma de Mallorca', province: 'Baleares', region: 'balearics', lat: 39.5696, lng: 2.6502 },
  { slug: 'alcudia', name: 'Alcúdia', province: 'Baleares', region: 'balearics', lat: 39.8531, lng: 3.1219 },
  { slug: 'pollenca', name: 'Pollença', province: 'Baleares', region: 'balearics', lat: 39.8767, lng: 3.0164 },
  { slug: 'andratx', name: 'Andratx', province: 'Baleares', region: 'balearics', lat: 39.5747, lng: 2.4211 },
  { slug: 'calvia', name: 'Calvià', province: 'Baleares', region: 'balearics', lat: 39.5658, lng: 2.5064 },
  { slug: 'santanyi', name: 'Santanyí', province: 'Baleares', region: 'balearics', lat: 39.3547, lng: 3.1289 },
  { slug: 'manacor', name: 'Manacor', province: 'Baleares', region: 'balearics', lat: 39.5697, lng: 3.2089 },
  { slug: 'soller', name: 'Sóller', province: 'Baleares', region: 'balearics', lat: 39.7658, lng: 2.7156 },
  { slug: 'ibiza', name: 'Ibiza (Eivissa)', province: 'Baleares', region: 'balearics', lat: 38.9089, lng: 1.4328 },
  { slug: 'santa-eularia', name: 'Santa Eulària des Riu', province: 'Baleares', region: 'balearics', lat: 38.9847, lng: 1.5347 },
  { slug: 'mahon', name: 'Mahón (Maó)', province: 'Baleares', region: 'balearics', lat: 39.8885, lng: 4.2658 },
  { slug: 'ciutadella', name: 'Ciutadella de Menorca', province: 'Baleares', region: 'balearics', lat: 40.0000, lng: 3.8383 },

  // Canary Islands
  { slug: 'las-palmas', name: 'Las Palmas de Gran Canaria', province: 'Las Palmas', region: 'canaries', lat: 28.1235, lng: -15.4363 },
  { slug: 'maspalomas', name: 'Maspalomas', province: 'Las Palmas', region: 'canaries', lat: 27.7606, lng: -15.5860 },
  { slug: 'puerto-rico-mogan', name: 'Puerto Rico (Mogán)', province: 'Las Palmas', region: 'canaries', lat: 27.7897, lng: -15.7089 },
  { slug: 'santa-cruz-tenerife', name: 'Santa Cruz de Tenerife', province: 'Santa Cruz de Tenerife', region: 'canaries', lat: 28.4636, lng: -16.2518 },
  { slug: 'adeje', name: 'Adeje', province: 'Santa Cruz de Tenerife', region: 'canaries', lat: 28.1227, lng: -16.7261 },
  { slug: 'los-cristianos', name: 'Los Cristianos (Arona)', province: 'Santa Cruz de Tenerife', region: 'canaries', lat: 28.0525, lng: -16.7183 },
  { slug: 'puerto-de-la-cruz', name: 'Puerto de la Cruz', province: 'Santa Cruz de Tenerife', region: 'canaries', lat: 28.4139, lng: -16.5500 },
  { slug: 'arrecife', name: 'Arrecife', province: 'Las Palmas', region: 'canaries', lat: 28.9630, lng: -13.5477 },
  { slug: 'playa-blanca', name: 'Playa Blanca (Yaiza)', province: 'Las Palmas', region: 'canaries', lat: 28.8617, lng: -13.8244 },
  { slug: 'puerto-del-carmen', name: 'Puerto del Carmen (Tías)', province: 'Las Palmas', region: 'canaries', lat: 28.9236, lng: -13.6647 },
  { slug: 'corralejo', name: 'Corralejo (La Oliva)', province: 'Las Palmas', region: 'canaries', lat: 28.7397, lng: -13.8672 },
  { slug: 'caleta-de-fuste', name: 'Caleta de Fuste (Antigua)', province: 'Las Palmas', region: 'canaries', lat: 28.3944, lng: -13.8608 },

  // Major cities
  { slug: 'madrid', name: 'Madrid', province: 'Madrid', region: 'cities', lat: 40.4168, lng: -3.7038 },
  { slug: 'barcelona', name: 'Barcelona', province: 'Barcelona', region: 'cities', lat: 41.3874, lng: 2.1686 },
  { slug: 'valencia', name: 'Valencia', province: 'Valencia', region: 'cities', lat: 39.4699, lng: -0.3763 },
  { slug: 'sevilla', name: 'Sevilla', province: 'Sevilla', region: 'cities', lat: 37.3891, lng: -5.9845 },
];

export const LOCALITY_BY_SLUG = Object.fromEntries(LOCALITIES.map(l => [l.slug, l]));

// Strip accents so "Malaga" finds "Málaga" and "Javea" finds "Jávea". Foreign owners
// almost never type the accents, and a search box that punishes them for it is useless.
export function fold(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function searchLocalities(query, limit = 8) {
  const q = fold(query);
  if (q.length < 2) return [];
  const scored = [];
  for (const l of LOCALITIES) {
    const name = fold(l.name);
    const prov = fold(l.province);
    let score = -1;
    if (name.startsWith(q)) score = 0;
    else if (name.includes(q)) score = 1;
    else if (fold(l.slug).includes(q)) score = 2;
    else if (prov.startsWith(q)) score = 3;
    if (score >= 0) scored.push({ l, score });
  }
  scored.sort((a, b) => a.score - b.score || a.l.name.localeCompare(b.l.name));
  return scored.slice(0, limit).map(s => s.l);
}
