// Bueno Club partner sourcing: restaurants, cafes and shops in the towns where Nordic
// owners live, scored for how Nordic their customers are and whether they already run
// discounts, member cards or partner offers. Internal only, passcode gated.
// Served through api/directory.js (?venues=...) so it costs no extra Vercel function slot.
//
//   GET /api/directory?venues=towns&pass=P                         -> towns, queries, cap
//   GET /api/directory?venues=run&pass=P&town=albir&q=0&page=0      -> one Places page, crawled + scored
//       (&token=<nextPageToken> for page 1 and 2; cached pages return without a Google call)
//   GET /api/directory?venues=export&pass=P[&format=json|rows][&towns=a,b]  -> CSV, deduped, best first
//   GET /api/directory?venues=purge&pass=P                          -> deletes every stored page
//
// Where the towns come from: council padron figures (Torrevieja 2025, l'Alfas del Pi,
// Mogan), Sjomannskirken and Svenska kyrkan locations, the Norwegian and Swedish schools,
// and the Nordic clubs. See the Bueno project doc claude/Bueno_Club_Partner_List.md.
//
// Compliance. Google lets us keep the place ID forever and nothing else beyond 30 days.
// Phone, rating and address are stored here because calling them is the point of the
// list, so every page carries `at` and `?venues=purge` must run within 30 days of the
// harvest. What we read on the venue's OWN website (emails, languages, offers, socials)
// is ours and is not covered by that rule. Review text is read in flight and never stored.

import { TOWNS as LEAD_TOWNS, extractEmails, detectLangs } from './_leads.js';

// Nordic hotspots, in priority order. Every slug that also exists in the estate-agent
// list reuses its coordinates; the four below are hotspots that list did not have.
const EXTRA_TOWNS = [
  { slug: 'calahonda', name: 'Sitio de Calahonda', region: 'Costa del Sol', lat: 36.487, lng: -4.716, hub: true },
  { slug: 'los-boliches', name: 'Los Boliches', region: 'Costa del Sol', lat: 36.553, lng: -4.618, hub: true },
  { slug: 'san-agustin-gc', name: 'San Agustín', region: 'Gran Canaria', lat: 27.773, lng: -15.546, hub: true },
  { slug: 'patalavaca', name: 'Patalavaca', region: 'Gran Canaria', lat: 27.769, lng: -15.700, hub: true },
  { slug: 'la-siesta', name: 'La Siesta', region: 'Costa Blanca South', lat: 38.004, lng: -0.672, hub: true },
  { slug: 'punta-prima', name: 'Punta Prima', region: 'Costa Blanca South', lat: 37.944, lng: -0.711, hub: true },
];

const ORDER = [
  // Costa Blanca North: the Norwegian heartland
  'alfaz-del-pi', 'albir', 'altea', 'benidorm', 'la-nucia', 'villajoyosa', 'finestrat', 'calpe', 'moraira', 'javea',
  // Costa Blanca South: Swedes, Norwegians, Finns, Danes
  'torrevieja', 'la-siesta', 'orihuela-costa', 'punta-prima', 'rojales', 'ciudad-quesada', 'guardamar',
  'san-miguel-de-salinas', 'pilar-de-la-horadada', 'gran-alacant', 'alicante',
  // Costa del Sol: Finns, Danes, Swedes, Norwegians
  'fuengirola', 'los-boliches', 'mijas', 'la-cala-de-mijas', 'calahonda', 'benalmadena', 'torremolinos',
  'marbella', 'san-pedro-alcantara', 'estepona', 'nerja', 'torre-del-mar', 'almunecar', 'malaga',
  // Gran Canaria: Arguineguin and Mogan, the winter Norwegians
  'arguineguin', 'patalavaca', 'puerto-rico-gc', 'puerto-de-mogan', 'playa-del-ingles', 'san-agustin-gc', 'maspalomas', 'las-palmas',
  // Tenerife and Mallorca: Swedish schools and churches
  'los-cristianos', 'playa-de-las-americas', 'costa-adeje', 'palma', 'santa-ponsa', 'port-andratx', 'alcudia',
];

const NORDIC_HQ = new Set(['alfaz-del-pi', 'albir', 'altea', 'villajoyosa', 'torrevieja', 'la-siesta', 'orihuela-costa',
  'rojales', 'fuengirola', 'los-boliches', 'mijas', 'calahonda', 'benalmadena', 'arguineguin', 'patalavaca',
  'puerto-rico-gc', 'puerto-de-mogan', 'san-agustin-gc', 'los-cristianos']);

const BY_SLUG = Object.fromEntries([...LEAD_TOWNS, ...EXTRA_TOWNS].map(t => [t.slug, t]));
export const VENUE_TOWNS = ORDER.map(s => BY_SLUG[s]).filter(Boolean).map(t => ({ ...t, nordic_hq: NORDIC_HQ.has(t.slug) }));

// A query's index is part of the cache path, so these are only ever appended to.
// `pages` is how many result pages are worth paying for: restaurants are the core of the
// club and a busy town has far more than twenty, the rest is one page each.
export const QUERIES = [
  { q: 'restaurante', cat: 'Restaurant', pages: 3 },
  { q: 'restaurant', cat: 'Restaurant', pages: 1 },
  { q: 'scandinavian restaurant', cat: 'Restaurant (Nordic)', pages: 1 },
  { q: 'norsk restaurant', cat: 'Restaurant (Nordic)', pages: 1 },
  { q: 'svensk restaurang', cat: 'Restaurant (Nordic)', pages: 1 },
  { q: 'cafetería café', cat: 'Cafe', pages: 1 },
  { q: 'beach club chiringuito', cat: 'Beach club', pages: 1 },
  { q: 'bar de tapas', cat: 'Bar', pages: 1 },
  { q: 'panadería pastelería', cat: 'Bakery', pages: 1 },
  { q: 'vinoteca tienda de vinos', cat: 'Wine shop', pages: 1 },
  { q: 'tienda de muebles y decoración', cat: 'Furniture and interiors', pages: 1 },
  { q: 'club de golf', cat: 'Golf', pages: 1 },
  { q: 'peluquería', cat: 'Hair and beauty', pages: 1 },
  { q: 'spa masajes', cat: 'Spa and wellness', pages: 1 },
  { q: 'scandinavian shop nordic food', cat: 'Nordic shop', pages: 1 },
  { q: 'óptica', cat: 'Optician', pages: 1 },
  { q: 'gimnasio', cat: 'Gym', pages: 1 },
  { q: 'alquiler de coches', cat: 'Car hire', pages: 1 },
];

const FIELDS = [
  'places.id', 'places.displayName', 'places.businessStatus', 'places.rating', 'places.userRatingCount',
  'places.websiteUri', 'places.location', 'places.reviews', 'places.nationalPhoneNumber',
  'places.internationalPhoneNumber', 'places.formattedAddress', 'places.primaryTypeDisplayName',
  'places.priceLevel', 'places.googleMapsUri', 'nextPageToken',
].join(',');

const NORDIC_LANGS = ['no', 'nb', 'nn', 'sv', 'da', 'fi'];
const FOREIGN_LANGS = ['en', 'de', 'nl', 'fr', 'be', 'pl', 'ru', 'it'];
const RE_NORDIC_NAME = /norsk|norge|noruego|svensk|sverige|sueco|dansk|danmark|dan[eé]s|viking|nordic|nordisk|n[oó]rdico|scandi|skandinav|escandinav|sm[oø]rbr[oø]d|fika|hygge|suomi|finsk|lofoten|bergen|oslo|stockholm|copenhag|k[oø]benhavn|fjord|troll|valhall|odin|sm[oø]rrebr[oø]d/i;
const RE_NORDIC_MENTION = /\b(norsk|nordmenn|norwegian|noruego|noruegos|svensk|svenskar|swedish|sueco|dansk|danish|danes|scandinavian|escandinavo|nordic|finnish|finlandés|suomalai)/i;
const RE_DISCOUNT = /descuento|\bdto\.?\s?\d|\d{1,2}\s?% ?(de )?(dto|descuento|off|rabatt|korting)|oferta especial|promoci[oó]n|happy hour|2x1|rabatt|tilbud|korting|discount|special offer|early bird|men[uú] del d[ií]a/i;
const RE_MEMBER = /tarjeta (de )?(cliente|socio|fidelidad|vip)|club de (socios|clientes)|fidelizaci[oó]n|loyalty|member(ship)? (card|club|discount)|\bvip card|medlemsrabatt|medlemskort|stamkund|kundeklubb|kundklubb|socios?\b/i;
const RE_GIFT = /tarjeta regalo|gift (card|voucher)|gavekort|presentkort|cheque regalo|bono regalo/i;
const RE_PARTNER = /colaborador(es)?|nuestros partners|our partners|partner offers?|patrocin|sponsor|en colaboraci[oó]n|samarbeid|samarbete|samarbejde/i;
const RE_FORK = /thefork\.|eltenedor\.|lafourchette\./i;
const RE_CHAIN = /mcdonald|burger king|\bkfc\b|telepizza|starbucks|100 montaditos|foster'?s hollywood|\bvips\b|goiko|\btgb\b|domino'?s|pans ?& ?company|rodilla|five guys|taco bell|hard rock|carrefour|mercadona|\blidl\b|\baldi\b|\bzara\b|decathlon|\bikea\b|leroy merlin|el corte ingl[eé]s|ginos|la tagliatella|udon|wok to walk|subway|papa john|popeyes|tim hortons|costa coffee|primark|druni|primor|mango\b|h&m|europcar|hertz|avis\b|sixt\b|enterprise rent|goldcar|holiday autos|basic[- ]fit|mcfit|vivagym|altafit|synergym|multiopticas|general [oó]ptica|alain afflelou|specsavers|opticalia|marionnaud|llongueras|jean louis david/i;

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

// Inner pages worth a look on a venue site: where offers, menus and contact details live.
export function venueLinks(html, base) {
  const out = [];
  let host;
  try { host = new URL(base).hostname.replace(/^www\./, ''); } catch { return out; }
  for (const m of html.matchAll(/href=["']([^"'#]+)["']/gi)) {
    if (!/ofert|promo|descuento|club|socio|loyalty|member|offer|deal|contact|contacto|kontakt|carta|menu|meny/i.test(m[1])) continue;
    try {
      const u = new URL(m[1], base);
      if (u.hostname.replace(/^www\./, '') !== host || !/^https?:$/.test(u.protocol)) continue;
      const s = u.href.split('#')[0];
      if (!out.includes(s)) out.push(s);
    } catch { /* skip */ }
    if (out.length >= 2) break;
  }
  return out;
}

export function socials(html) {
  const pick = (re) => {
    for (const m of html.matchAll(re)) {
      const u = m[0].replace(/["'].*$/, '').replace(/\/+$/, '');
      if (!/sharer|share\?|intent|plugins|\/p\/|\/reel|\/tr\?|dialog|\/explore|\/watch/i.test(u)) return u;
    }
    return '';
  };
  return {
    instagram: pick(/https?:\/\/(www\.)?instagram\.com\/[A-Za-z0-9_.]+/gi),
    facebook: pick(/https?:\/\/(www\.|m\.|es-es\.)?facebook\.com\/[A-Za-z0-9_.\-]+/gi),
  };
}

// Short readable label for whatever offer language the site uses, for the sheet.
function offerSnippet(html) {
  const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  for (const re of [RE_MEMBER, RE_DISCOUNT, RE_GIFT, RE_PARTNER]) {
    const m = text.match(re);
    if (m) {
      const i = Math.max(0, m.index - 50);
      return text.slice(i, m.index + 70).trim();
    }
  }
  return '';
}

export async function crawlVenue(website) {
  const empty = { emails: [], langs: [], discount: false, member: false, gift: false, partner: false, thefork: false, instagram: '', facebook: '', snippet: '', site_ok: false };
  if (!website) return empty;
  const home = await get(website);
  if (!home.html) return empty;
  const links = venueLinks(home.html, home.url);
  const pages = await Promise.all(links.map(l => get(l, 5000)));
  const html = home.html + '\n' + pages.map(p => p.html).join('\n');
  return {
    emails: extractEmails(html),
    langs: detectLangs(home.html),
    discount: RE_DISCOUNT.test(html),
    member: RE_MEMBER.test(html),
    gift: RE_GIFT.test(html),
    partner: RE_PARTNER.test(html),
    thefork: RE_FORK.test(html),
    ...socials(html),
    snippet: offerSnippet(html),
    site_ok: true,
  };
}

export function scoreVenue(p, site, town) {
  const R = p.rating || 0, v = p.userRatingCount || 0;
  const bayes = (v / (v + PRIOR_COUNT)) * R + (PRIOR_COUNT / (v + PRIOR_COUNT)) * PRIOR_RATING;
  const name = p.displayName?.text || '';
  const reviews = p.reviews || [];
  const langs = reviews.map(r => (r.originalText?.languageCode || r.text?.languageCode || '').slice(0, 2).toLowerCase());
  const nordicReviews = langs.filter(l => NORDIC_LANGS.includes(l)).length;
  const foreignReviews = langs.filter(l => FOREIGN_LANGS.includes(l)).length;
  const mention = reviews.some(r => RE_NORDIC_MENTION.test(`${r.originalText?.text || ''} ${r.text?.text || ''}`));
  const nordicSite = site.langs.some(l => NORDIC_LANGS.includes(l));
  const nordicName = RE_NORDIC_NAME.test(name);
  const foreignSite = site.langs.some(l => FOREIGN_LANGS.includes(l));
  const chain = RE_CHAIN.test(name);
  const offers = site.discount || site.member || site.gift;

  let s = 0;
  if (nordicSite) s += 25;
  if (nordicName) s += 15;
  s += Math.min(24, nordicReviews * 8);
  if (mention) s += 6;
  s += Math.min(6, foreignReviews * 2);
  s += Math.max(0, Math.min(15, (bayes - 4.0) * 20));
  if (v >= 50 && v <= 2500) s += 6;
  if (town.nordic_hq) s += 8; else if (town.hub) s += 4;
  if (site.member) s += 8;
  if (site.discount) s += 5;
  if (site.gift) s += 2;
  if (site.partner) s += 4;
  if (foreignSite) s += 3;
  if (chain) s -= 30;
  s = Math.round(Math.max(0, Math.min(100, s)));

  const nordic = nordicSite || nordicName || nordicReviews >= 1 || mention;
  const tier = chain ? 'C' : (nordic && s >= 50) ? 'A' : s >= 32 ? 'B' : 'C';
  return { score: s, tier, nordic, nordicSite, nordicName, nordicReviews, foreignReviews, mention, chain, offers, langs };
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
  for (let i = 0; i < paths.length; i += 500) {
    await fetch(`${url}/storage/v1/object/${BUCKET}`, {
      method: 'DELETE', headers: { ...auth(key), 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefixes: paths.slice(i, i + 500) }),
    });
  }
}

// Separate from the estate-agent cap and the public directory budget, so a harvest can
// never starve the live directory. Roughly 900 calls covers every town and query once.
const DAILY_CAP = parseInt(process.env.VENUES_DAILY_CAP || '1000', 10);
const capPath = () => `venues/budget/${new Date().toISOString().slice(0, 10)}.json`;
const pagePath = (slug, qi, page) => `venues/v1/${slug}/${qi}-${page}.json`;

function priceLabel(p) {
  return { PRICE_LEVEL_INEXPENSIVE: '€', PRICE_LEVEL_MODERATE: '€€', PRICE_LEVEL_EXPENSIVE: '€€€', PRICE_LEVEL_VERY_EXPENSIVE: '€€€€' }[p.priceLevel] || '';
}

export async function runPage({ url, key, google }, town, qi, page, token, fetchImpl = fetch) {
  const path = pagePath(town.slug, qi, page);
  const cached = await readObj(url, key, path);
  if (cached) return { ...cached, cached: true };

  const b = (await readObj(url, key, capPath())) || { count: 0 };
  if (b.count >= DAILY_CAP) return { error: 'daily_cap', cap: DAILY_CAP };
  await writeObj(url, key, capPath(), { count: b.count + 1 });

  const Q = QUERIES[qi];
  const body = {
    textQuery: `${Q.q} ${town.name}`,
    languageCode: 'en', regionCode: 'ES', pageSize: 20,
    locationBias: { circle: { center: { latitude: town.lat, longitude: town.lng }, radius: 6000 } },
  };
  if (token) body.pageToken = token;
  const r = await fetchImpl('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': google, 'X-Goog-FieldMask': FIELDS },
    body: JSON.stringify(body),
  });
  const raw = await r.text();
  if (!r.ok) return { error: `google_${r.status}`, detail: raw.slice(0, 300) };
  let data;
  try { data = JSON.parse(raw); } catch { return { error: 'google_non_json', detail: raw.slice(0, 200) }; }
  const places = (data.places || [])
    .filter(p => p.businessStatus === 'OPERATIONAL')
    .filter(p => !p.location || distKm(town, { lat: p.location.latitude, lng: p.location.longitude }) <= 10);

  const rows = await Promise.all(places.map(async p => {
    const site = await crawlVenue(p.websiteUri);
    const sc = scoreVenue(p, site, town);
    const signals = [site.member && 'member or loyalty card', site.discount && 'discounts or promotions', site.gift && 'gift cards', site.partner && 'partners or sponsors', site.thefork && 'TheFork bookings'].filter(Boolean);
    return {
      place_id: p.id,
      name: p.displayName?.text || '',
      category: Q.cat,
      google_type: p.primaryTypeDisplayName?.text || '',
      town: town.name, region: town.region, nordic_hq: town.nordic_hq,
      phone: p.nationalPhoneNumber || '',
      phone_intl: p.internationalPhoneNumber || '',
      email: site.emails.find(e => /^(info|hola|hello|reservas|booking|contact|contacto|kontakt|admin|office)@/.test(e)) || site.emails[0] || '',
      emails_all: site.emails.slice(0, 5).join(' '),
      website: p.websiteUri || '',
      instagram: site.instagram, facebook: site.facebook,
      rating: p.rating ?? '', reviews: p.userRatingCount ?? 0, price: priceLabel(p),
      nordic_reviews: sc.nordicReviews, foreign_reviews: sc.foreignReviews, review_languages: sc.langs.filter(Boolean).join(' '),
      nordic_mention: sc.mention, nordic_site: sc.nordicSite, nordic_name: sc.nordicName,
      site_languages: site.langs.join(' '),
      offer_signals: signals.join(', '), offer_snippet: site.snippet.slice(0, 140),
      chain: sc.chain, score: sc.score, tier: sc.tier,
      address: p.formattedAddress || '', maps_url: p.googleMapsUri || '',
      found_by: Q.q,
    };
  }));
  const out = { town: town.slug, q: qi, page, next: data.nextPageToken || null, rows, at: new Date().toISOString() };
  await writeObj(url, key, path, out);
  return out;
}

export const COLS = ['tier', 'score', 'name', 'category', 'google_type', 'town', 'region', 'phone_intl', 'phone', 'email', 'website',
  'instagram', 'facebook', 'rating', 'reviews', 'price', 'nordic_reviews', 'foreign_reviews', 'review_languages', 'nordic_mention',
  'nordic_site', 'nordic_name', 'site_languages', 'offer_signals', 'offer_snippet', 'chain', 'address', 'maps_url', 'found_by', 'place_id'];
const csvCell = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };

// One row per place: a venue found by several queries or towns keeps its best score and
// the most specific category (a Nordic restaurant query beats the generic one).
export function dedupe(rows) {
  const byId = new Map();
  for (const r of rows) {
    const prev = byId.get(r.place_id);
    if (!prev) { byId.set(r.place_id, r); continue; }
    const best = r.score > prev.score ? r : prev;
    if (/Nordic/.test(r.category) || /Nordic/.test(prev.category)) best.category = /Nordic/.test(r.category) ? r.category : prev.category;
    byId.set(r.place_id, best);
  }
  return [...byId.values()].sort((a, b) => b.score - a.score);
}

export async function venuesHandler(req, res, envv) {
  const pass = req.headers['x-passcode'] || req.query.pass;
  if (pass !== process.env.INTERNAL_PASSCODE) return res.status(401).json({ error: 'unauthorized' });
  const { url, key, google } = envv;
  const mode = req.query.venues;

  if (mode === 'towns') {
    return res.status(200).json({ towns: VENUE_TOWNS.map(t => t.slug), queries: QUERIES.map(q => ({ q: q.q, pages: q.pages })), daily_cap: DAILY_CAP });
  }

  if (mode === 'run') {
    if (!google) return res.status(500).json({ error: 'Missing env var: GOOGLE_PLACES_KEY' });
    const town = VENUE_TOWNS.find(t => t.slug === req.query.town);
    const qi = parseInt(req.query.q || '0', 10);
    const page = parseInt(req.query.page || '0', 10);
    if (!town || !(qi >= 0 && qi < QUERIES.length) || !(page >= 0 && page <= 2)) return res.status(400).json({ error: 'bad town/q/page' });
    const out = await runPage({ url, key, google }, town, qi, page, req.query.token || null);
    return res.status(out.error ? 502 : 200).json({
      ...out, rows: undefined, found: out.rows?.length ?? 0,
      tier_a: out.rows?.filter(r => r.tier === 'A').length ?? 0,
      with_offers: out.rows?.filter(r => r.offer_signals).length ?? 0,
    });
  }

  if (mode === 'export' || mode === 'purge') {
    const wanted = req.query.towns ? String(req.query.towns).split(',') : null;
    const towns = wanted ? VENUE_TOWNS.filter(t => wanted.includes(t.slug)) : VENUE_TOWNS;
    const lists = await Promise.all(towns.map(t => listObj(url, key, `venues/v1/${t.slug}/`).then(items => ({ t, items }))));
    const paths = [];
    for (const { t, items } of lists) for (const it of items || []) if (it.name?.endsWith('.json')) paths.push(`venues/v1/${t.slug}/${it.name}`);
    if (mode === 'purge') { await delObj(url, key, paths); return res.status(200).json({ deleted: paths.length }); }
    const all = [];
    for (let i = 0; i < paths.length; i += 25) {
      const objs = await Promise.all(paths.slice(i, i + 25).map(p => readObj(url, key, p).catch(() => null)));
      for (const o of objs) if (o?.rows) all.push(...o.rows.map(r => ({ ...r, harvested_at: o.at })));
    }
    const list = dedupe(all);
    if (req.query.format === 'rows') return res.status(200).json({ pages: paths.length, count: list.length, rows: list });
    const csv = [COLS.join(','), ...list.map(r => COLS.map(c => csvCell(r[c])).join(','))].join('\n');
    if (req.query.format === 'json') return res.status(200).json({ pages: paths.length, count: list.length, csv });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="bueno-club-venues.csv"');
    return res.status(200).send(csv);
  }

  return res.status(400).json({ error: 'venues must be towns, run, export or purge' });
}
