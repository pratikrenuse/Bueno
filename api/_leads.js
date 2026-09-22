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
].map(([slug, name, region, lat, lng, hub]) => ({ slug, name, region, lat, lng, hub: !!hub }));

// Query 0 finds the market, 1 the English-facing agencies, 2 and 3 the Nordic ones by the
// words they use for themselves.
export const QUERIES = ['inmobiliaria', 'real estate agency', 'eiendomsmegler', 'fastighetsmäklare'];

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

const DAILY_CAP = parseInt(process.env.LEADS_DAILY_CAP || '400', 10);
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

export async function leadsHandler(req, res, envv) {
  const pass = req.headers['x-passcode'] || req.query.pass;
  if (pass !== process.env.INTERNAL_PASSCODE) return res.status(401).json({ error: 'unauthorized' });
  const { url, key, google } = envv;
  const mode = req.query.leads;

  if (mode === 'towns') return res.status(200).json({ towns: TOWNS.map(t => t.slug), queries: QUERIES, daily_cap: DAILY_CAP });

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

  return res.status(400).json({ error: 'leads must be towns, run, export or purge' });
}
