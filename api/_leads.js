// Estate-agent lead sourcing for the B2B outreach. Internal only, passcode gated.
// Served through api/directory.js (?leads=...) so it costs no extra Vercel function slot.
//
//   GET /api/directory?leads=towns&pass=P                      -> town list
//   GET /api/directory?leads=run&pass=P&town=altea&q=0&page=0   -> one Places page, crawled + scored
//       (&token=<nextPageToken> for page 1 and 2; cached pages are returned without a Google call)
//   GET /api/directory?leads=export&pass=P[&all=1]             -> CSV, deduped, best first
//
// What is stored (Supabase Storage, bucket directory-cache, leads/v1/...): place_id, the
// agency name, town, website and what we read on the agency's OWN website (emails,
// languages, resale signals) plus a score. Google rating, review count, reviews, phone
// and address are used in-flight for scoring and never written. Place IDs may be kept;
// delete the rest within 30 days of the campaign (?leads=purge).

export const TOWNS = [
  // slug, name, region, lat, lng, nordicHub
  ['alfaz-del-pi', "L'Alfàs del Pi", 'Costa Blanca North', 38.580, -0.101, 1],
  ['albir', 'Albir', 'Costa Blanca North', 38.573, -0.071, 1],
  ['altea', 'Altea', 'Costa Blanca North', 38.599, -0.051, 1],
  ['benidorm', 'Benidorm', 'Costa Blanca North', 38.538, -0.131, 1],
  ['la-nucia', 'La Nucía', 'Costa Blanca North', 38.614, -0.123, 1],
  ['finestrat', 'Finestrat', 'Costa Blanca North', 38.567, -0.212, 1],
  ['villajoyosa', 'Villajoyosa', 'Costa Blanca North', 38.508, -0.233, 1],
  ['calpe', 'Calpe', 'Costa Blanca North', 38.644, 0.045, 1],
  ['benissa', 'Benissa', 'Costa Blanca North', 38.715, 0.049, 0],
  ['moraira', 'Moraira', 'Costa Blanca North', 38.688, 0.135, 1],
  ['javea', 'Jávea', 'Costa Blanca North', 38.789, 0.166, 1],
  ['denia', 'Dénia', 'Costa Blanca North', 38.840, 0.105, 0],
  ['alicante', 'Alicante', 'Costa Blanca', 38.345, -0.481, 1],
  ['santa-pola', 'Santa Pola', 'Costa Blanca South', 38.192, -0.566, 0],
  ['guardamar', 'Guardamar del Segura', 'Costa Blanca South', 38.090, -0.655, 1],
  ['rojales', 'Rojales', 'Costa Blanca South', 38.087, -0.724, 1],
  ['ciudad-quesada', 'Ciudad Quesada', 'Costa Blanca South', 38.060, -0.720, 1],
  ['torrevieja', 'Torrevieja', 'Costa Blanca South', 37.978, -0.683, 1],
  ['orihuela-costa', 'Orihuela Costa', 'Costa Blanca South', 37.935, -0.742, 1],
  ['san-miguel-de-salinas', 'San Miguel de Salinas', 'Costa Blanca South', 37.980, -0.789, 1],
  ['pilar-de-la-horadada', 'Pilar de la Horadada', 'Costa Blanca South', 37.866, -0.792, 1],
  ['san-pedro-del-pinatar', 'San Pedro del Pinatar', 'Costa Cálida', 37.835, -0.791, 0],
  ['los-alcazares', 'Los Alcázares', 'Costa Cálida', 37.744, -0.851, 0],
  ['la-manga', 'La Manga', 'Costa Cálida', 37.640, -0.720, 0],
  ['mazarron', 'Mazarrón', 'Costa Cálida', 37.598, -1.314, 0],
  ['aguilas', 'Águilas', 'Costa Cálida', 37.406, -1.583, 0],
  ['mojacar', 'Mojácar', 'Costa de Almería', 37.140, -1.851, 0],
  ['vera', 'Vera', 'Costa de Almería', 37.243, -1.868, 0],
  ['roquetas-de-mar', 'Roquetas de Mar', 'Costa de Almería', 36.764, -2.614, 0],
  ['almunecar', 'Almuñécar', 'Costa Tropical', 36.733, -3.690, 0],
  ['nerja', 'Nerja', 'Costa del Sol', 36.758, -3.874, 1],
  ['torre-del-mar', 'Torre del Mar', 'Costa del Sol', 36.740, -4.093, 0],
  ['malaga', 'Málaga', 'Costa del Sol', 36.721, -4.421, 1],
  ['torremolinos', 'Torremolinos', 'Costa del Sol', 36.622, -4.500, 1],
  ['benalmadena', 'Benalmádena', 'Costa del Sol', 36.599, -4.517, 1],
  ['fuengirola', 'Fuengirola', 'Costa del Sol', 36.540, -4.625, 1],
  ['mijas', 'Mijas', 'Costa del Sol', 36.596, -4.637, 1],
  ['marbella', 'Marbella', 'Costa del Sol', 36.510, -4.883, 1],
  ['san-pedro-alcantara', 'San Pedro de Alcántara', 'Costa del Sol', 36.487, -4.990, 1],
  ['estepona', 'Estepona', 'Costa del Sol', 36.425, -5.146, 1],
  ['casares', 'Casares', 'Costa del Sol', 36.445, -5.275, 0],
  ['manilva', 'Manilva', 'Costa del Sol', 36.377, -5.250, 0],
  ['sotogrande', 'Sotogrande', 'Costa del Sol', 36.290, -5.280, 0],
  ['las-palmas', 'Las Palmas de Gran Canaria', 'Gran Canaria', 28.124, -15.430, 1],
  ['playa-del-ingles', 'Playa del Inglés', 'Gran Canaria', 27.757, -15.573, 1],
  ['maspalomas', 'Maspalomas', 'Gran Canaria', 27.760, -15.586, 1],
  ['arguineguin', 'Arguineguín', 'Gran Canaria', 27.760, -15.680, 1],
  ['puerto-rico-gc', 'Puerto Rico', 'Gran Canaria', 27.788, -15.711, 1],
  ['puerto-de-mogan', 'Puerto de Mogán', 'Gran Canaria', 27.816, -15.763, 1],
  ['los-cristianos', 'Los Cristianos', 'Tenerife', 28.052, -16.716, 1],
  ['costa-adeje', 'Costa Adeje', 'Tenerife', 28.083, -16.730, 1],
  ['puerto-de-la-cruz', 'Puerto de la Cruz', 'Tenerife', 28.414, -16.548, 0],
  ['santa-cruz-de-tenerife', 'Santa Cruz de Tenerife', 'Tenerife', 28.463, -16.251, 0],
  ['playa-blanca', 'Playa Blanca', 'Lanzarote', 28.863, -13.829, 0],
  ['puerto-del-carmen', 'Puerto del Carmen', 'Lanzarote', 28.922, -13.665, 0],
  ['corralejo', 'Corralejo', 'Fuerteventura', 28.730, -13.867, 0],
  ['palma', 'Palma', 'Mallorca', 39.570, 2.650, 1],
  ['santa-ponsa', 'Santa Ponsa', 'Mallorca', 39.509, 2.477, 1],
  ['port-andratx', "Port d'Andratx", 'Mallorca', 39.544, 2.389, 1],
  ['pollenca', 'Pollença', 'Mallorca', 39.877, 3.016, 0],
  ['cala-dor', "Cala d'Or", 'Mallorca', 39.375, 3.232, 0],
  ['ibiza', 'Ibiza', 'Ibiza', 38.908, 1.432, 0],
  ['valencia', 'Valencia', 'Valencia', 39.470, -0.376, 0],
  ['sitges', 'Sitges', 'Costa Dorada', 41.237, 1.805, 0],
  ['lloret-de-mar', 'Lloret de Mar', 'Costa Brava', 41.700, 2.845, 0],
  ['roses', 'Roses', 'Costa Brava', 42.263, 3.176, 0],
  ['empuriabrava', 'Empuriabrava', 'Costa Brava', 42.247, 3.121, 0],
  // Second pass, 24 Sep 2026: the rest of the islands, Murcia, more Costa Brava and
  // Costa Dorada, the inland Costa del Sol towns, and the two cities whose agencies
  // also sell coastal property.
  ['mahon', 'Mahón', 'Menorca', 39.889, 4.265, 0],
  ['ciutadella', 'Ciutadella', 'Menorca', 40.000, 3.838, 0],
  ['alcudia', 'Alcúdia', 'Mallorca', 39.853, 3.121, 1],
  ['manacor', 'Manacor', 'Mallorca', 39.569, 3.209, 0],
  ['santanyi', 'Santanyí', 'Mallorca', 39.354, 3.128, 0],
  ['santa-eulalia', 'Santa Eulalia del Río', 'Ibiza', 38.984, 1.535, 0],
  ['san-antonio', 'Sant Antoni de Portmany', 'Ibiza', 38.981, 1.304, 0],
  ['costa-teguise', 'Costa Teguise', 'Lanzarote', 28.995, -13.500, 0],
  ['arrecife', 'Arrecife', 'Lanzarote', 28.963, -13.548, 0],
  ['caleta-de-fuste', 'Caleta de Fuste', 'Fuerteventura', 28.394, -13.862, 0],
  ['puerto-del-rosario', 'Puerto del Rosario', 'Fuerteventura', 28.500, -13.863, 0],
  ['morro-jable', 'Morro Jable', 'Fuerteventura', 28.052, -14.352, 0],
  ['playa-de-las-americas', 'Playa de las Américas', 'Tenerife', 28.058, -16.729, 1],
  ['golf-del-sur', 'Golf del Sur', 'Tenerife', 28.030, -16.610, 0],
  ['los-gigantes', 'Los Gigantes', 'Tenerife', 28.243, -16.840, 0],
  ['el-medano', 'El Médano', 'Tenerife', 28.046, -16.537, 0],
  ['cartagena', 'Cartagena', 'Costa Cálida', 37.606, -0.987, 0],
  ['torre-pacheco', 'Torre-Pacheco', 'Costa Cálida', 37.741, -0.951, 1],
  ['santiago-de-la-ribera', 'Santiago de la Ribera', 'Costa Cálida', 37.796, -0.797, 0],
  ['murcia', 'Murcia', 'Costa Cálida', 37.987, -1.130, 0],
  ['el-campello', 'El Campello', 'Costa Blanca', 38.427, -0.401, 0],
  ['gran-alacant', 'Gran Alacant', 'Costa Blanca South', 38.216, -0.583, 1],
  ['elche', 'Elche', 'Costa Blanca', 38.265, -0.698, 0],
  ['gandia', 'Gandía', 'Valencia', 38.968, -0.181, 0],
  ['oliva', 'Oliva', 'Valencia', 38.919, -0.118, 0],
  ['garrucha', 'Garrucha', 'Costa de Almería', 37.181, -1.822, 0],
  ['almeria', 'Almería', 'Costa de Almería', 36.834, -2.464, 0],
  ['la-cala-de-mijas', 'La Cala de Mijas', 'Costa del Sol', 36.507, -4.702, 1],
  ['alhaurin-el-grande', 'Alhaurín el Grande', 'Costa del Sol', 36.642, -4.689, 0],
  ['coin', 'Coín', 'Costa del Sol', 36.659, -4.756, 0],
  ['ronda', 'Ronda', 'Costa del Sol', 36.742, -5.166, 0],
  ['rincon-de-la-victoria', 'Rincón de la Victoria', 'Costa del Sol', 36.717, -4.276, 0],
  ['velez-malaga', 'Vélez-Málaga', 'Costa del Sol', 36.782, -4.101, 0],
  ['salobrena', 'Salobreña', 'Costa Tropical', 36.744, -3.587, 0],
  ['blanes', 'Blanes', 'Costa Brava', 41.674, 2.792, 0],
  ['platja-daro', "Platja d'Aro", 'Costa Brava', 41.817, 3.065, 0],
  ['lescala', "L'Escala", 'Costa Brava', 42.124, 3.132, 0],
  ['begur', 'Begur', 'Costa Brava', 41.954, 3.207, 0],
  ['salou', 'Salou', 'Costa Dorada', 41.076, 1.141, 0],
  ['cambrils', 'Cambrils', 'Costa Dorada', 41.067, 1.060, 0],
  ['barcelona', 'Barcelona', 'Barcelona', 41.387, 2.170, 0],
  ['madrid', 'Madrid', 'Madrid', 40.417, -3.703, 0],
  // Third pass, 27 Oct 2026: every other coastal and island municipality in the foreign-buyer
  // provinces (GeoNames, from spain-directory/localities.js), at least 7 km from a town above.
  ['orihuela', "Orihuela", 'Costa Blanca', 38.085, -0.944, 0],
  ['adra', "Adra", 'Costa de Almería', 36.748, -3.021, 0],
  ['huercal-overa', "Huercal-Overa", 'Costa de Almería', 37.389, -1.943, 0],
  ['nijar', "Níjar", 'Costa de Almería', 36.967, -2.206, 0],
  ['andratx', "Andratx", 'Balearics', 39.575, 2.421, 0],
  ['felanitx', "Felanitx", 'Balearics', 39.470, 3.148, 0],
  ['inca', "Inca", 'Balearics', 39.721, 2.911, 0],
  ['llucmajor', "Llucmajor", 'Balearics', 39.491, 2.891, 0],
  ['marratxi', "Marratxí", 'Balearics', 39.621, 2.725, 0],
  ['soller', "Sóller", 'Balearics', 39.766, 2.716, 0],
  ['arenys-de-mar', "Arenys de Mar", 'Costa del Maresme / Garraf', 41.582, 2.549, 0],
  ['calella', "Calella", 'Costa del Maresme / Garraf', 41.614, 2.654, 0],
  ['castelldefels', "Castelldefels", 'Costa del Maresme / Garraf', 41.278, 1.970, 0],
  ['mataro', "Mataró", 'Costa del Maresme / Garraf', 41.542, 2.445, 0],
  ['premia-de-mar', "Premià de Mar", 'Costa del Maresme / Garraf', 41.492, 2.365, 0],
  ['vilaseca', "Vilaseca", 'Costa del Maresme / Garraf', 42.062, 2.255, 0],
  ['algeciras', "Algeciras", 'Costa de la Luz', 36.133, -5.450, 0],
  ['barbate', "Barbate", 'Costa de la Luz', 36.192, -5.922, 0],
  ['cadiz', "Cádiz", 'Costa de la Luz', 36.527, -6.289, 0],
  ['chiclana', "Chiclana de la Frontera", 'Costa de la Luz', 36.419, -6.147, 0],
  ['chipiona', "Chipiona", 'Costa de la Luz', 36.737, -6.437, 0],
  ['conil-de-la-frontera', "Conil de la Frontera", 'Costa de la Luz', 36.277, -6.088, 0],
  ['el-puerto-de-santa-maria', "El Puerto de Santa María", 'Costa de la Luz', 36.594, -6.233, 0],
  ['jerez-de-la-frontera', "Jerez de la Frontera", 'Costa de la Luz', 36.687, -6.136, 0],
  ['la-linea-de-la-concepcion', "La Línea de la Concepción", 'Costa de la Luz', 36.168, -5.348, 0],
  ['puerto-real', "Puerto Real", 'Costa de la Luz', 36.528, -6.190, 0],
  ['rota', "Rota", 'Costa de la Luz', 36.624, -6.360, 0],
  ['sanlucar-de-barrameda', "Sanlúcar de Barrameda", 'Costa de la Luz', 36.778, -6.351, 0],
  ['tarifa', "Tarifa", 'Costa de la Luz', 36.014, -5.604, 0],
  ['benicarlo', "Benicarló", 'Costa del Azahar', 40.416, 0.427, 0],
  ['benicassim', "Benicàssim", 'Costa del Azahar', 40.050, 0.067, 0],
  ['el-grao', "El Grao", 'Costa del Azahar', 39.974, 0.013, 0],
  ['vinaros', "Vinaròs", 'Costa del Azahar', 40.470, 0.476, 0],
  ['figueres', "Figueres", 'Costa Brava', 42.266, 2.962, 0],
  ['girona', "Girona", 'Costa Brava', 41.979, 2.821, 0],
  ['palamos', "Palamós", 'Costa Brava', 41.848, 3.129, 0],
  ['sant-feliu-de-guixols', "Sant Feliu de Guíxols", 'Costa Brava', 41.783, 3.033, 0],
  ['aljaraque', "Aljaraque", 'Costa de la Luz', 37.270, -7.023, 0],
  ['almonte', "Almonte", 'Costa de la Luz', 37.265, -6.517, 0],
  ['ayamonte', "Ayamonte", 'Costa de la Luz', 37.213, -7.408, 0],
  ['cartaya', "Cartaya", 'Costa de la Luz', 37.281, -7.151, 0],
  ['huelva', "Huelva", 'Costa de la Luz', 37.266, -6.940, 0],
  ['isla-cristina', "Isla Cristina", 'Costa de la Luz', 37.200, -7.317, 0],
  ['aguimes', "Agüimes", 'Canary Islands', 27.905, -15.446, 0],
  ['arucas', "Arucas", 'Canary Islands', 28.120, -15.523, 0],
  ['galdar', "Gáldar", 'Canary Islands', 28.147, -15.650, 0],
  ['pajara', "Pájara", 'Canary Islands', 28.350, -14.108, 0],
  ['san-bartolome', "San Bartolomé", 'Canary Islands', 29.001, -13.613, 0],
  ['san-bartolome-de-tirajana', "San Bartolomé de Tirajana", 'Canary Islands', 27.925, -15.573, 0],
  ['santa-brigida', "Santa Brígida", 'Canary Islands', 28.032, -15.504, 0],
  ['teguise', "Teguise", 'Canary Islands', 29.061, -13.564, 0],
  ['telde', "Telde", 'Canary Islands', 27.992, -15.419, 0],
  ['alhaurin-de-la-torre', "Alhaurín de la Torre", 'Costa del Sol', 36.664, -4.561, 0],
  ['cartama', "Cártama", 'Costa del Sol', 36.711, -4.633, 0],
  ['torrox', "Torrox", 'Costa del Sol', 36.758, -3.955, 0],
  ['alhama-de-murcia', "Alhama de Murcia", 'Costa Cálida', 37.851, -1.425, 0],
  ['atamaria', "Atamaría", 'Costa Cálida', 37.600, -0.807, 0],
  ['fuente-alamo', "Fuente Álamo", 'Costa Cálida', 37.727, -1.165, 0],
  ['lorca', "Lorca", 'Costa Cálida', 37.671, -1.702, 0],
  ['totana', "Totana", 'Costa Cálida', 37.769, -1.502, 0],
  ['candelaria', "Candelaria", 'Canary Islands', 28.355, -16.373, 0],
  ['granadilla-de-abona', "Granadilla de Abona", 'Canary Islands', 28.119, -16.576, 0],
  ['icod-de-los-vinos', "Icod de los Vinos", 'Canary Islands', 28.372, -16.712, 0],
  ['la-laguna', "La Laguna", 'Canary Islands', 28.485, -16.320, 0],
  ['los-llanos-de-aridane', "Los Llanos de Aridane", 'Canary Islands', 28.659, -17.918, 0],
  ['santa-cruz-de-la-palma', "Santa Cruz de la Palma", 'Canary Islands', 28.683, -17.764, 0],
  ['tacoronte', "Tacoronte", 'Canary Islands', 28.477, -16.410, 0],
  ['valverde', "Valverde", 'Canary Islands', 27.806, -17.916, 0],
  ['amposta', "Amposta", 'Costa Dorada', 40.710, 0.579, 0],
  ['calafell', "Calafell", 'Costa Dorada', 41.200, 1.568, 0],
  ['reus', "Reus", 'Costa Dorada', 41.156, 1.107, 0],
  ['sant-carles-de-la-rapita', "Sant Carles de la Ràpita", 'Costa Dorada', 40.617, 0.600, 0],
  ['tarragona', "Tarragona", 'Costa Dorada', 41.119, 1.245, 0],
  ['torredembarra', "Torredembarra", 'Costa Dorada', 41.145, 1.399, 0],
  ['cullera', "Cullera", 'Costa de Valencia', 39.167, -0.250, 0],
  ['grao-de-murviedro', "Grao de Murviedro", 'Costa de Valencia', 39.642, -0.239, 0],
  ['massamagrell', "Massamagrell", 'Costa de Valencia', 39.567, -0.333, 0],
  ['tavernes-de-la-valldigna', "Tavernes de la Valldigna", 'Costa de Valencia', 39.072, -0.266, 0],
].map(([slug, name, region, lat, lng, hub]) => ({ slug, name, region, lat, lng, hub: !!hub }));

// Query 0 finds the market, 1 the English-facing agencies, 2 and 3 the Nordic ones by the
// words they use for themselves. An agency that names itself in the buyer's language is
// the pattern worth finding, so 4 to 6 do the same in German, Dutch and Danish.
// A query's index is part of the cache path, so these are only ever appended to.
export const QUERIES = ['inmobiliaria', 'real estate agency', 'eiendomsmegler', 'fastighetsmäklare',
  'immobilienmakler', 'makelaar', 'ejendomsmægler',
  // 27 Oct 2026, appended: wider nets for the agencies the first seven missed.
  'estate agent', 'property for sale', 'agence immobilière', 'kiinteistönvälittäjä', 'agencia inmobiliaria internacional'];

const FIELDS = [
  'places.id', 'places.displayName', 'places.businessStatus', 'places.rating',
  'places.userRatingCount', 'places.websiteUri', 'places.location', 'places.reviews',
  'nextPageToken',
].join(',');

const NORDIC_LANGS = ['no', 'nb', 'nn', 'sv', 'da', 'fi'];
const OTHER_LANGS = ['en', 'de', 'nl', 'fr', 'be', 'pl', 'ru'];
const RE_NORDIC_NAME = /eiendom|fastighet|nordic|nordisk|scandi|skandinav|norsk|svensk|dansk|norge|sverige|viking|bolig|m[aä]klar|megler|suomi/i;
const RE_FRANCHISE = /re\/?max|century ?21|engel ?(&|and|y)? ?v[oö]lkers|tecnocasa|solvia|lucas fox|keller williams|coldwell|sotheby|donpiso|look ?(&|and) ?find|servihabitat|redpiso|housfy|comprarcasa|alfa inmobiliaria|habitaclia/i;
const RE_RESALE = /resale|reventa|segunda mano|bruktbolig|brukt bolig|begagnad|second[- ]hand|pre-owned/i;
const RE_NEWBUILD = /obra nueva|new build|new-build|nybygg|nyproduktion|off[- ]plan/i;
const NO_WORDS = ['eiendom', 'leilighet', 'megler', 'til salgs', 'soverom', 'boligen'];
const SV_WORDS = ['bostad', 'lägenhet', 'mäklare', 'till salu', 'sovrum', 'bostäder'];
const DA_WORDS = ['bolig til salg', 'ejendom', 'værelser', 'lejlighed'];
const BAD_EMAIL = /\.(png|jpe?g|gif|webp|svg|css|js|avif)$|@(sentry|.*wixpress|example|domain|email|yourdomain|dominio|tudominio|godaddy|mysite|company)\.|^(no-?reply|noreply|donotreply)@|@2x\./i;
const ROLE = /^(info|ventas|sales|contact|contacto|kontakt|hello|hola|office|oficina|admin|mail|post|enquiries|inquiries|properties|inmobiliaria)@/i;

const PRIOR_COUNT = 50, PRIOR_RATING = 4.3;

function distKm(a, b) {
  const R = 6371, t = x => x * Math.PI / 180;
  const dLat = t(b.lat - a.lat), dLng = t(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(t(a.lat)) * Math.cos(t(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

async function get(url, ms = 6000) {
  const c = new AbortController();
  const timer = setTimeout(() => c.abort(), ms);
  try {
    const r = await fetch(url, {
      signal: c.signal, redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; 247spain-research/1.0; +https://www.247spain.es)', Accept: 'text/html,*/*;q=0.8' },
    });
    if (!r.ok) return { html: '', url };
    const ct = r.headers.get('content-type') || '';
    if (ct && !/html|text/i.test(ct)) return { html: '', url: r.url || url };
    return { html: (await r.text()).slice(0, 600000), url: r.url || url };
  } catch {
    return { html: '', url };
  } finally {
    clearTimeout(timer);
  }
}

function cfDecode(hex) {
  try {
    const k = parseInt(hex.slice(0, 2), 16);
    let s = '';
    for (let i = 2; i < hex.length; i += 2) s += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16) ^ k);
    return s;
  } catch { return ''; }
}

export function extractEmails(html) {
  const found = new Set();
  const text = html
    .replace(/&#64;|&#x40;|%40/gi, '@')
    .replace(/&#46;|&#x2e;/gi, '.');
  for (const m of html.matchAll(/data-cfemail="([0-9a-f]+)"/gi)) found.add(cfDecode(m[1]));
  for (const m of text.matchAll(/\/cdn-cgi\/l\/email-protection#([0-9a-f]+)/gi)) found.add(cfDecode(m[1]));
  for (const m of text.matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,24}/g)) found.add(m[0]);
  return [...found]
    .map(e => e.trim().toLowerCase().replace(/^mailto:/, '').replace(/[.,;]+$/, ''))
    .filter(e => /^[^@\s]+@[^@\s]+\.[a-z]{2,24}$/.test(e) && !BAD_EMAIL.test(e));
}

export function extractLinks(html, base) {
  const out = [];
  let host;
  try { host = new URL(base).hostname.replace(/^www\./, ''); } catch { return out; }
  for (const m of html.matchAll(/href=["']([^"'#]+)["']/gi)) {
    const href = m[1];
    if (!/contact|contacto|kontakt|about|sobre|nosotros|quienes|om-oss|omoss|equipo|team/i.test(href)) continue;
    try {
      const u = new URL(href, base);
      if (u.hostname.replace(/^www\./, '') !== host || !/^https?:$/.test(u.protocol)) continue;
      const s = u.href.split('#')[0];
      if (!out.includes(s)) out.push(s);
    } catch { /* skip */ }
    if (out.length >= 2) break;
  }
  return out;
}

export function detectLangs(html) {
  const langs = new Set();
  const low = html.toLowerCase();
  for (const m of low.matchAll(/hreflang=["']?([a-z]{2})/g)) langs.add(m[1]);
  const h = low.match(/<html[^>]*\blang=["']?([a-z]{2})/);
  if (h) langs.add(h[1]);
  for (const m of low.matchAll(/href=["'][^"']*?\/(no|nb|sv|da|fi|de|nl|fr|en|ru|pl)(?:\/|["'?])/g)) langs.add(m[1]);
  const count = (words) => words.reduce((n, w) => n + (low.includes(w) ? 1 : 0), 0);
  if (count(NO_WORDS) >= 2) langs.add('no');
  if (count(SV_WORDS) >= 2) langs.add('sv');
  if (count(DA_WORDS) >= 2) langs.add('da');
  if (langs.has('nb') || langs.has('nn')) { langs.delete('nb'); langs.delete('nn'); langs.add('no'); }
  langs.delete('es'); langs.delete('ca');
  return [...langs].filter(l => NORDIC_LANGS.includes(l) || OTHER_LANGS.includes(l)).sort();
}

function pickEmail(emails, website) {
  let host = '';
  try { host = new URL(website).hostname.replace(/^www\./, ''); } catch { /* none */ }
  const own = emails.filter(e => host && e.endsWith('@' + host));
  const pool = own.length ? own : emails;
  return pool.find(e => ROLE.test(e)) || pool[0] || '';
}

export async function crawl(website) {
  if (!website) return { emails: [], langs: [], resale: false, newbuild: false };
  const home = await get(website);
  let html = home.html;
  const links = extractLinks(html, home.url);
  const pages = await Promise.all(links.map(l => get(l, 5000)));
  html += pages.map(p => p.html).join('\n');
  const emails = extractEmails(html);
  return {
    emails,
    langs: detectLangs(home.html || html),
    resale: RE_RESALE.test(html),
    newbuild: RE_NEWBUILD.test(html),
  };
}

export function score(p, site, town) {
  const R = p.rating || 0, v = p.userRatingCount || 0;
  const bayes = (v / (v + PRIOR_COUNT)) * R + (PRIOR_COUNT / (v + PRIOR_COUNT)) * PRIOR_RATING;
  const name = p.displayName?.text || '';
  const reviewLangs = (p.reviews || []).map(r => (r.originalText?.languageCode || '').slice(0, 2));
  const nordicReviews = reviewLangs.filter(l => NORDIC_LANGS.includes(l)).length;
  const nordicSite = site.langs.some(l => NORDIC_LANGS.includes(l));
  const nordicName = RE_NORDIC_NAME.test(name);
  const otherSite = site.langs.some(l => OTHER_LANGS.includes(l));
  const franchise = RE_FRANCHISE.test(name);
  const newbuildOnly = site.newbuild && !site.resale;

  let s = 0;
  if (nordicSite) s += 30;
  if (nordicName) s += 20;
  s += Math.min(15, nordicReviews * 5);
  s += Math.max(0, Math.min(20, (bayes - 4.0) * 20));
  if (v >= 20 && v <= 300) s += 10; else if (v > 300) s += 4;
  if (site.resale) s += 10;
  if (town.hub) s += 10;
  if (otherSite) s += 8;
  if (franchise) s -= 15;
  if (newbuildOnly) s -= 5;
  s = Math.round(Math.max(0, Math.min(100, s)));

  const nordic = nordicSite || nordicName || nordicReviews >= 2;
  const tier = nordic && s >= 50 ? 'A' : s >= 35 && (otherSite || nordic) ? 'B' : 'C';
  return { score: s, tier, nordic, nordicSite, nordicName, nordicReviews, franchise, newbuildOnly };
}

// ---- storage (same bucket as the directory cache) ----
const BUCKET = 'directory-cache';
const auth = (key) => ({ apikey: key, Authorization: `Bearer ${key}` });
async function readObj(url, key, path) {
  const r = await fetch(`${url}/storage/v1/object/${BUCKET}/${path}`, { headers: auth(key) });
  if (!r.ok) return null;
  try { return await r.json(); } catch { return null; }
}
async function writeObj(url, key, path, data) {
  const put = () => fetch(`${url}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: { ...auth(key), 'Content-Type': 'application/json', 'x-upsert': 'true' },
    body: JSON.stringify(data),
  });
  let r = await put();
  if (!r.ok) {
    const t = await r.text();
    if (/bucket/i.test(t)) {
      await fetch(`${url}/storage/v1/bucket`, {
        method: 'POST', headers: { ...auth(key), 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: BUCKET, name: BUCKET, public: false }),
      });
      r = await put();
    }
  }
  if (!r.ok) throw new Error(`storage write ${r.status}`);
}
async function listObj(url, key, prefix) {
  const r = await fetch(`${url}/storage/v1/object/list/${BUCKET}`, {
    method: 'POST', headers: { ...auth(key), 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefix, limit: 1000, offset: 0 }),
  });
  if (!r.ok) return [];
  return r.json();
}
async function delObj(url, key, paths) {
  if (!paths.length) return;
  await fetch(`${url}/storage/v1/object/${BUCKET}`, {
    method: 'DELETE', headers: { ...auth(key), 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefixes: paths }),
  });
}

const DAILY_CAP = parseInt(process.env.LEADS_DAILY_CAP || '2000', 10);
const capPath = () => `leads/budget/${new Date().toISOString().slice(0, 10)}.json`;

async function runPage({ url, key, google }, town, qi, page, token) {
  const path = `leads/v1/${town.slug}/${qi}-${page}.json`;
  const cached = await readObj(url, key, path);
  if (cached) return { ...cached, cached: true };

  const b = (await readObj(url, key, capPath())) || { count: 0 };
  if (b.count >= DAILY_CAP) return { error: 'daily_cap', cap: DAILY_CAP };
  await writeObj(url, key, capPath(), { count: b.count + 1 });

  const body = {
    textQuery: `${QUERIES[qi]} ${town.name}`,
    languageCode: 'en', regionCode: 'ES', pageSize: 20,
    locationBias: { circle: { center: { latitude: town.lat, longitude: town.lng }, radius: 12000 } },
  };
  if (token) body.pageToken = token;
  const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': google, 'X-Goog-FieldMask': FIELDS },
    body: JSON.stringify(body),
  });
  const raw = await r.text();
  if (!r.ok) return { error: `google_${r.status}`, detail: raw.slice(0, 300) };
  const data = JSON.parse(raw);
  const places = (data.places || [])
    .filter(p => p.businessStatus === 'OPERATIONAL')
    .filter(p => !p.location || distKm(town, { lat: p.location.latitude, lng: p.location.longitude }) <= 20);

  const rows = await Promise.all(places.map(async p => {
    const site = await crawl(p.websiteUri);
    const sc = score(p, site, town);
    return {
      place_id: p.id,
      agency: p.displayName?.text || '',
      town: town.name, region: town.region,
      website: p.websiteUri || '',
      email: pickEmail(site.emails, p.websiteUri),
      emails_all: site.emails.slice(0, 6).join(' '),
      site_languages: site.langs.join(' '),
      resale: site.resale, newbuild_only: sc.newbuildOnly, franchise: sc.franchise,
      nordic_site: sc.nordicSite, nordic_name: sc.nordicName, nordic_reviews: sc.nordicReviews,
      score: sc.score, tier: sc.tier, found_by: QUERIES[qi],
    };
  }));
  const out = { town: town.slug, q: qi, page, next: data.nextPageToken || null, rows, at: new Date().toISOString() };
  await writeObj(url, key, path, out);
  return out;
}

const COLS = ['tier', 'score', 'agency', 'email', 'town', 'region', 'website', 'site_languages', 'nordic_site', 'nordic_name', 'nordic_reviews', 'resale', 'newbuild_only', 'franchise', 'emails_all', 'found_by', 'place_id'];
const csvCell = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };

export function buildCsv(rows, all) {
  const byId = new Map();
  for (const r of rows) {
    const prev = byId.get(r.place_id);
    if (!prev || r.score > prev.score) byId.set(r.place_id, r);
  }
  const byEmail = new Map();
  const noEmail = [];
  for (const r of byId.values()) {
    if (!r.email) { noEmail.push(r); continue; }
    const prev = byEmail.get(r.email);
    if (!prev || r.score > prev.score) byEmail.set(r.email, r);
  }
  const list = [...byEmail.values(), ...(all ? noEmail : [])].sort((a, b) => b.score - a.score);
  return { csv: [COLS.join(','), ...list.map(r => COLS.map(c => csvCell(r[c])).join(','))].join('\n'), count: list.length, without_email: noEmail.length };
}

// ---- named contacts (27 Oct 2026) ----
// One named person per agency, read off the agency's own team, about and contact pages.
// Nothing is stored server-side and Google is not called: the caller already has the
// websites from the stored Places pages and collects the answers itself.
//
//   GET /api/directory?leads=people&pass=P&sites=<url>|<url>|...   (up to 4 per call)

const TEAM_LINK = /team|equipo|nuestro-?equipo|agent|agente|asesor|staff|people|meet|about|sobre|nosotros|quienes|who-we-are|contact|contacto|kontakt|om-oss|omoss|ansatte|medarbeidere|medarbetare|personal|mitarbeiter|uber-uns|ueber-uns|over-ons|qui-sommes|equipe/i;
const NOT_PERSON = /^(info|ventas|venta|sales|sale|contact|contacto|contacta|kontakt|hello|hola|office|oficina|admin|administracion|administration|mail|email|correo|post|enquiries|enquiry|inquiries|inquiry|properties|property|propiedades|inmobiliaria|inmo|reservas|reservations|booking|bookings|marketing|web|webmaster|rentals|rental|alquiler|alquileres|lettings|accounts|contabilidad|facturacion|billing|rrhh|hr|jobs|empleo|careers|support|soporte|recepcion|reception|comercial|gerencia|direccion|legal|prensa|press|newbuild|obranueva|valoraciones|valuations|casas|home|homes|team|equipo|service|servicio|services|customer|clientes|atencion|consultas|buy|sell|realestate|agency|agencia|privacy|privacidad|lopd|rgpd|gdpr|dpo|datos|protecciondedatos|noreply|general|main|central|estate|villas|online|news|newsletter|bolig|eiendom|kunde|kundeservice|kundtjanst|makler|immobilien|makelaar|management|gestion|direccion|director|manager|ceo|mallorca|ibiza|marbella|spain|espana|costa|international)[\d._-]*@/i;
const FREE_MAIL = /@(gmail|googlemail|hotmail|outlook|yahoo|icloud|live|msn|aol|telefonica|terra|ono|me|protonmail|gmx|web)\.[a-z.]+$/i;
const ROLE_TOP = /director|owner|founder|co-?founder|ceo|managing|principal|gerente|propietari[oa]|fundador|socio|partner|daglig leder|eier|[äa]gare|\bvd\b|inhaber|gesch[äa]ftsf[üu]hrer|eigenaar|directrice|g[ée]rant/i;
const ROLE_AGENT = /agent|asesor|advisor|adviser|consultant|consultor|sales|ventas|negotiator|broker|megler|m[äa]klare|makler|makelaar|comercial/i;
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function plainText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<a[^>]+href=["']mailto:([^"'?]+)[^>]*>/gi, ' $1 ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#64;|&#x40;|%40/gi, '@')
    .replace(/\s+/g, ' ');
}

function teamLinks(html, base, max = 6) {
  const out = [];
  let host;
  try { host = new URL(base).hostname.replace(/^www\./, ''); } catch { return out; }
  for (const m of html.matchAll(/href=["']([^"'#]+)["']/gi)) {
    const href = m[1];
    if (!TEAM_LINK.test(href) || /\.(pdf|jpe?g|png|webp)$/i.test(href)) continue;
    try {
      const u = new URL(href, base);
      if (u.hostname.replace(/^www\./, '') !== host || !/^https?:$/.test(u.protocol)) continue;
      const s = u.href.split('#')[0];
      if (s.replace(/\/$/, '') === base.replace(/\/$/, '')) continue;
      if (!out.includes(s)) out.push(s);
    } catch { /* skip */ }
    if (out.length >= max) break;
  }
  // Team pages first: they are where named addresses live.
  return out.sort((a, b) => (/team|equipo|agent|asesor|staff|people|ansatte|medarbe|mitarbeiter/i.test(b) ? 1 : 0) - (/team|equipo|agent|asesor|staff|people|ansatte|medarbe|mitarbeiter/i.test(a) ? 1 : 0));
}

// Is the local part a person, and what is their name? Accepted only when the name the
// address implies is also written on the page, so "costablanca@" or "villas2@" never
// passes as a person.
const fold = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const SKIP_SURNAME = /^(Real|Estate|Properties|Property|Inmobiliaria|Spain|Costa|Sales|Agent|Team|Phone|Tel|Email|Mobile|Movil|Contact|The|And|Office|Director|Directora|Manager|Founder|Owner|Agente|Asesor|Asesora|Telefono|Whatsapp)$/;

function personFrom(email, rawText) {
  const text = fold(rawText);
  const local = email.split('@')[0];
  const parts = local.split(/[._-]+/).filter(p => /^[a-z]{2,}$/.test(p));
  if (!parts.length) return null;
  const first = parts[0];
  // Look beside the address first, then anywhere on the page.
  const i = text.toLowerCase().indexOf(email);
  const near = i >= 0 ? text.slice(Math.max(0, i - 160), i) : '';
  if (first.length < 3) {
    // j.smith@ style: initial plus surname, check the surname is on the page.
    const sur = parts[1];
    if (!sur || sur.length < 3) return null;
    const re = new RegExp(`\\b([A-Z][a-z]+)\\s+${cap(sur)}\\b`);
    const m = near.match(re) || text.match(re);
    return m ? { name: `${m[1]} ${cap(sur)}` } : null;
  }
  const re = new RegExp(`\\b${cap(first)}\\b(?:\\s+([A-Z][a-z'-]+))?`, 'g');
  const hits = [...near.matchAll(re)].reverse().concat([...text.matchAll(re)]);
  if (!hits.length) {
    // Two-part address like anna.berg@ is a person even if the page renders the name in an image.
    return parts.length >= 2 && parts[1].length >= 3 ? { name: `${cap(first)} ${cap(parts[1])}`, weak: true } : null;
  }
  let name = cap(first);
  if (parts[1] && parts[1].length >= 3) return { name: `${name} ${cap(parts[1])}` };
  const withSurname = hits.find(h => h[1] && !SKIP_SURNAME.test(h[1]));
  if (withSurname) name += ' ' + withSurname[1];
  return { name };
}

function roleNear(text, email) {
  const i = text.toLowerCase().indexOf(email);
  if (i < 0) return '';
  // Only the text since the previous address, so one person's title never lands on the next.
  let start = Math.max(0, i - 90);
  const before = text.slice(start, i);
  const prev = [...before.matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g)].pop();
  if (prev) start += prev.index + prev[0].length;
  const ctx = text.slice(start, i);
  if (ROLE_TOP.test(ctx)) return 'owner/director';
  if (ROLE_AGENT.test(ctx)) return 'agent';
  return '';
}

// Links from a team page to one agent's own page (/team/kari-nordmann, /agentes/lars).
const PROFILE_LINK = /\/(team|equipo|our-team|nuestro-equipo|agents?|agentes?|asesor(es)?|staff|people|ansatte|medarbeidere|medarbetare|mitarbeiter|makelaars?|meglere?|consultants?)\/[a-z0-9-]{4,}\/?$/i;

function profileLinks(pages, host, max = 4) {
  const out = [];
  for (const p of pages) {
    for (const m of p.html.matchAll(/href=["']([^"'#?]+)["']/gi)) {
      try {
        const u = new URL(m[1], p.url);
        if (u.hostname.replace(/^www\./, '') !== host || !PROFILE_LINK.test(u.pathname)) continue;
        if (!out.includes(u.href)) out.push(u.href);
      } catch { /* skip */ }
      if (out.length >= max) return out;
    }
  }
  return out;
}

// A named owner or director on the page with no address of their own. Returned so the
// caller can try first@domain and let the verifier decide; always flagged as guessed.
const NAME_ROLE = /([A-ZÀ-Ý][a-zà-ÿ]{2,})\s+([A-ZÀ-Ý][a-zà-ÿ'-]{2,})(?:\s+[A-ZÀ-Ý][a-zà-ÿ'-]{2,})?\s*[,|\-–]?\s*(?:\(?\s*)(founder|co-?founder|owner|managing director|director|ceo|gerente|propietari[oa]|fundador[a]?|socio|daglig leder|eier|[äa]gare|inhaber|gesch[äa]ftsf[üu]hrer|eigenaar)\b/i;
const NOT_NAME = /^(Real|Estate|Properties|Property|Inmobiliaria|Spain|Costa|Sales|Our|The|Contact|Meet|About|Team|Blanca|Del|Sol|Luxury|Home|Homes|Villas|International|Managing|General|Sales|Office|Marketing)$/;

function guessOwner(text, host) {
  const m = text.match(NAME_ROLE);
  if (!m || NOT_NAME.test(m[1]) || NOT_NAME.test(m[2]) || !host) return null;
  const first = m[1].normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  return { email: `${first}@${host}`, name: `${m[1]} ${m[2]}`, role: 'owner/director', own: true, guessed: true };
}

export async function findPeople(website) {
  const out = { website, people: [], generic: '', langs: [], pages: 0, guess: null };
  if (!website) return out;
  const home = await get(website, 5000);
  if (!home.html) return out;
  let host = '';
  try { host = new URL(home.url).hostname.replace(/^www\./, '').toLowerCase(); } catch { /* none */ }
  const stem = host.split('.')[0];
  const links = teamLinks(home.html, home.url, 8);
  const pages = await Promise.all(links.map(l => get(l, 5000)));
  let all = [home, ...pages].filter(p => p.html);

  const read = () => {
    const html = all.map(p => p.html).join('\n');
    const text = plainText(html);
    const people = [];
    let generic = '';
    const seen = new Set();
    for (const e of extractEmails(html)) {
      if (seen.has(e)) continue;
      seen.add(e);
      const domain = e.split('@')[1];
      const own = domain === host || (stem.length >= 4 && domain.includes(stem));
      if (NOT_PERSON.test(e)) { if (own && !generic) generic = e; continue; }
      if (!own && !FREE_MAIL.test(e)) continue; // a portal, a developer, the web agency
      const p = personFrom(e, text);
      if (!p) { if (own && !generic) generic = e; continue; }
      people.push({ email: e, name: p.name, role: roleNear(text, e), own, weak: !!p.weak });
    }
    return { people, generic, text };
  };

  let r = read();
  // Nobody named yet: open up to four individual agent pages linked from the team page.
  if (!r.people.length) {
    const prof = profileLinks(all, host).filter(u => !all.some(p => p.url === u));
    if (prof.length) {
      const more = await Promise.all(prof.map(l => get(l, 5000)));
      all = all.concat(more.filter(p => p.html));
      r = read();
    }
  }
  out.pages = all.length;
  out.langs = detectLangs(home.html);
  out.generic = r.generic;
  const rank = (p) => (p.role === 'owner/director' ? 4 : p.role === 'agent' ? 1 : 0) + (p.own ? 2 : 0) + (p.weak ? 0 : 1);
  out.people = r.people.sort((a, b) => rank(b) - rank(a));
  out.best = out.people[0] || null;
  // Only guess on a site that uses its own domain for mail (a generic address proves it).
  if (!out.best && out.generic && out.generic.endsWith('@' + host)) out.guess = guessOwner(r.text, host);
  return out;
}

export async function leadsHandler(req, res, envv) {
  const pass = req.headers['x-passcode'] || req.query.pass;
  if (pass !== process.env.INTERNAL_PASSCODE) return res.status(401).json({ error: 'unauthorized' });
  const { url, key, google } = envv;
  const mode = req.query.leads;

  if (mode === 'towns') return res.status(200).json({ towns: TOWNS.map(t => t.slug), queries: QUERIES, daily_cap: DAILY_CAP });

  if (mode === 'people') {
    const sites = String(req.query.sites || req.query.site || '').split('|').map(s => s.trim()).filter(s => /^https?:\/\//i.test(s)).slice(0, 4);
    if (!sites.length) return res.status(400).json({ error: 'sites=<url>|<url> required' });
    const results = await Promise.all(sites.map(s => findPeople(s).catch(e => ({ website: s, error: String(e?.message || e), people: [] }))));
    return res.status(200).json({ results });
  }

  if (mode === 'run') {
    if (!google) return res.status(500).json({ error: 'Missing GOOGLE_PLACES_KEY' });
    const town = TOWNS.find(t => t.slug === req.query.town);
    const qi = parseInt(req.query.q || '0', 10);
    const page = parseInt(req.query.page || '0', 10);
    if (!town || !(qi >= 0 && qi < QUERIES.length) || !(page >= 0 && page <= 2)) return res.status(400).json({ error: 'bad town/q/page' });
    const out = await runPage({ url, key, google }, town, qi, page, req.query.token || null);
    return res.status(out.error ? 502 : 200).json({
      ...out, rows: undefined, found: out.rows?.length ?? 0,
      with_email: out.rows?.filter(r => r.email).length ?? 0,
      tier_a: out.rows?.filter(r => r.tier === 'A').length ?? 0,
    });
  }

  if (mode === 'export' || mode === 'purge') {
    // Reading every stored page one after another took longer than the function is
    // allowed to run, so the reads now happen in parallel batches, and the caller can
    // ask for a few towns at a time with &towns=slug,slug.
    const wanted = req.query.towns ? String(req.query.towns).split(',') : null;
    const towns = wanted ? TOWNS.filter(t => wanted.includes(t.slug)) : TOWNS;
    const all = [];
    const paths = [];
    const lists = await Promise.all(towns.map(t => listObj(url, key, `leads/v1/${t.slug}/`).then(items => ({ t, items }))));
    for (const { t, items } of lists) {
      for (const it of items || []) {
        if (it.name?.endsWith('.json')) paths.push(`leads/v1/${t.slug}/${it.name}`);
      }
    }
    if (mode === 'export') {
      for (let i = 0; i < paths.length; i += 25) {
        const objs = await Promise.all(paths.slice(i, i + 25).map(p => readObj(url, key, p).catch(() => null)));
        for (const o of objs) if (o?.rows) all.push(...o.rows);
      }
    }
    if (mode === 'purge') { await delObj(url, key, paths); return res.status(200).json({ deleted: paths.length }); }
    if (req.query.format === 'rows') return res.status(200).json({ pages: paths.length, rows: all });
    const { csv, count, without_email } = buildCsv(all, req.query.all === '1');
    if (req.query.format === 'json') return res.status(200).json({ count, without_email, pages: paths.length, csv });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="spain-agents-leads.csv"');
    return res.status(200).send(csv);
  }

  return res.status(400).json({ error: 'leads must be towns, run, people, export or purge' });
}
