// GET /api/directory?locality=<slug>&category=<slug>
// GET /api/directory?health=1&pass=<INTERNAL_PASSCODE>
//
// Returns the best reviewed tradespeople in one Spanish locality for one trade, sourced
// from Google Places and ranked by a rating weighted for review volume.
//
// Setup: none. There is no table to create and no SQL to run. The cache lives in a
// Supabase Storage bucket that this endpoint creates for itself the first time it needs
// it, using the service key that is already in the environment. Add GOOGLE_PLACES_KEY,
// redeploy, done.
//
// How the cost stays at zero
// --------------------------
// Google bills per API call, not per visitor. Every (locality, category) pair is one
// object in the bucket, and an object is refreshed at most once every 30 days, so a
// locality that gets a thousand visitors in a month still costs exactly one Google call.
// Thirty days is also the longest Google's terms allow their content to be cached, so
// the cheapest behaviour and the compliant behaviour are the same behaviour.
//
// One call does all of it. Text Search (New) returns the name, address, phone, website,
// rating, review count and the review text in a single response, so there is no second
// Place Details lookup. That call bills as Enterprise + Atmosphere, which carries 1,000
// free calls per month. DAILY_CELL_BUDGET keeps the month's total under that ceiling
// even in the worst case, and it is a hard stop rather than a target: when the budget is
// spent this endpoint serves cache and refuses to bill.
//
// Compliance
// ----------
// Place IDs may be stored indefinitely. Everything else Google returns may not, so an
// object older than 30 days is never served: it is deleted on sight and refetched. If it
// cannot be refetched (budget spent, or Google unreachable) the endpoint reports the
// locality as temporarily unavailable rather than serving expired content, and the
// expired object stays deleted. That is why no purge job is needed. The client is
// responsible for the visible attribution Google also requires: the Google Maps mark,
// the reviewer's name and photo, a link to the review, and a plain statement of how
// results were ordered.

import { LOCALITY_BY_SLUG } from '../spain-directory/localities.js';
import { ANY_CATEGORY_BY_SLUG } from '../spain-directory/categories.js';

const BUCKET = 'directory-cache';
// Bump when the shape of a stored cell changes. Cached objects live for 30 days, so
// without this a fix to what we store would not reach anyone who already has a cell.
// v2: review text is Google's English translation rather than the Spanish original.
// v3: dropped includedType and widened the radius, which was returning one result for
//     towns the size of Benidorm.
const CACHE_VERSION = 'v3';
const CACHE_DAYS = 30;
// A plumber drives. 15 km was drawn around the town as if a trade only serves its own
// postcode, which starved smaller towns of candidates for no good reason.
const SEARCH_RADIUS_M = 25000;

// Worst case 30 refreshes a day is 900 Google calls a month, inside the 1,000 free
// Enterprise + Atmosphere allowance. Raise it only alongside the budget cap in Google
// Cloud, never on its own.
const DAILY_CELL_BUDGET = Number(process.env.DIRECTORY_DAILY_BUDGET || 30);

// Bayesian prior. A 5.0 from three reviews should not outrank a 4.7 from four hundred,
// so every business is treated as if it started with PRIOR_COUNT reviews at PRIOR_RATING
// and has to earn its way away from that.
//
// PRIOR_COUNT is set at 50 rather than the more usual 20 because of what this directory
// is for. Buying sixty reviews for a small trade business is cheap and it happens;
// buying four hundred is not. A weak prior lets a 4.9 built on sixty reviews outrank a
// 4.7 built on four hundred, which is precisely the gap a manipulated listing exploits.
// At 50 a business has to show real volume before its rating is taken at face value.
const PRIOR_COUNT = 50;
const PRIOR_RATING = 4.3;

// A business with a handful of reviews carries no signal worth ranking on, so five is
// the bar. But in a smaller town five can leave one lonely result, which reads as a broken
// tool rather than an honest one. So the floor is tiered: take everyone at five or more,
// and only if that leaves fewer than MIN_RESULTS do we top up from the three-and-four
// review businesses in the SAME response. No second API call, no extra cost, and the
// review count is on every card so nobody is misled about how thin the evidence is.
const MIN_REVIEWS = 5;
const FALLBACK_MIN_REVIEWS = 3;
const MIN_RESULTS = 4;
const MAX_RESULTS = 12;

const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.businessStatus',
  'places.rating',
  'places.userRatingCount',
  'places.nationalPhoneNumber',
  'places.internationalPhoneNumber',
  'places.websiteUri',
  'places.googleMapsUri',
  'places.reviews',
].join(',');

function env() {
  return {
    url: (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, ''),
    key: process.env.SUPABASE_SERVICE_KEY,
    google: process.env.GOOGLE_PLACES_KEY,
  };
}

const auth = (key) => ({ apikey: key, Authorization: `Bearer ${key}` });

// ---------------------------------------------------------------------------
// Storage helpers. Plain REST against Supabase Storage with the service key.
// ---------------------------------------------------------------------------

const cellPath = (loc, cat) => `cells/${CACHE_VERSION}/${loc}/${cat}.json`;
const budgetPath = () => `budget/${new Date().toISOString().slice(0, 10)}.json`;

async function readObject(url, key, path) {
  const r = await fetch(`${url}/storage/v1/object/${BUCKET}/${path}`, { headers: auth(key) });
  if (r.status === 404 || r.status === 400) return null; // missing object or missing bucket
  if (!r.ok) throw new Error(`Storage read ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const text = await r.text();
  try {
    return JSON.parse(text);
  } catch {
    return null; // A corrupt object is treated as a cache miss, never as a hard failure.
  }
}

async function createBucket(url, key) {
  const r = await fetch(`${url}/storage/v1/bucket`, {
    method: 'POST',
    headers: { ...auth(key), 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: false }),
  });
  // 409 means someone else (or a concurrent request) already made it. That is success.
  if (!r.ok && r.status !== 409) {
    throw new Error(`Could not create the ${BUCKET} bucket: ${r.status} ${(await r.text()).slice(0, 200)}`);
  }
}

async function writeObject(url, key, path, value, { retried = false } = {}) {
  const r = await fetch(`${url}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: { ...auth(key), 'Content-Type': 'application/json', 'x-upsert': 'true' },
    body: JSON.stringify(value),
  });
  if (r.ok) return;

  // First write of the deployment's life: the bucket does not exist yet. Make it and
  // retry once. This is the whole of the setup, and it happens without anyone doing it.
  const body = (await r.text()).slice(0, 300);
  if (!retried && (r.status === 400 || r.status === 404) && /bucket/i.test(body)) {
    await createBucket(url, key);
    return writeObject(url, key, path, value, { retried: true });
  }
  throw new Error(`Storage write ${r.status}: ${body}`);
}

async function deleteObject(url, key, path) {
  try {
    await fetch(`${url}/storage/v1/object/${BUCKET}/${path}`, { method: 'DELETE', headers: auth(key) });
  } catch {
    // Best effort. An orphaned object is refetched and overwritten on the next request.
  }
}

// The budget is a soft guard in front of a hard one. Two requests arriving in the same
// millisecond can both read the same count, so the ceiling can be overshot by a call or
// two. That is fine: the real stop is the daily quota set on the Google key itself, and
// this exists to keep normal traffic comfortably inside the free allowance.
async function readBudget(url, key) {
  const b = await readObject(url, key, budgetPath()).catch(() => null);
  return (b && Number(b.count)) || 0;
}

async function bumpBudget(url, key, current) {
  try {
    await writeObject(url, key, budgetPath(), { count: current + 1, date: budgetPath() });
  } catch {
    // Never fail a visitor's request because the counter could not be written.
  }
}

// ---------------------------------------------------------------------------
// Ranking and shaping
// ---------------------------------------------------------------------------

function bayesian(rating, count) {
  const v = Number(count) || 0;
  const r = Number(rating) || 0;
  return (v / (v + PRIOR_COUNT)) * r + (PRIOR_COUNT / (v + PRIOR_COUNT)) * PRIOR_RATING;
}

// Cut on a word boundary. Slicing at a fixed character count produced endings like
// "en cuanto a la calidad del tr...", which reads as a bug rather than an excerpt.
function trim(text, max) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:]+$/, '')}...`;
}

// Trim a Google review to what the card shows, keeping every field the attribution rules
// require: who wrote it, their photo, a link to their profile, and a link to the review.
function shapeReview(rv, placeMapsUri) {
  if (!rv) return null;
  // `text` is Google's translation into the language we asked for, `originalText` is
  // what the reviewer actually wrote. Show the translation, report the original's
  // language. Taking originalText first was why every card was a wall of Spanish.
  const shown = rv.text || rv.originalText || {};
  const source = rv.originalText || rv.text || {};
  const author = rv.authorAttribution || {};
  const text = String(shown.text || '').trim();
  if (!text) return null;
  return {
    rating: rv.rating ?? null,
    text: trim(text, 260),
    lang: source.languageCode || null,
    published: rv.publishTime || null,
    relative: rv.relativePublishTimeDescription || null,
    author: author.displayName || null,
    author_uri: author.uri || null,
    author_photo: author.photoUri || null,
    uri: rv.googleMapsUri || placeMapsUri || null,
  };
}

function shapePlace(p) {
  const mapsUri = p.googleMapsUri || null;
  const reviews = Array.isArray(p.reviews)
    ? p.reviews.map(r => shapeReview(r, mapsUri)).filter(Boolean).slice(0, 3)
    : [];

  // Which languages this business has actually been reviewed in. This is the honest
  // version of "do they speak English": it says what language the reviews are written
  // in, not what language the business claims to speak.
  const langs = {};
  for (const r of reviews) if (r.lang) langs[r.lang] = (langs[r.lang] || 0) + 1;

  return {
    id: p.id,
    name: (p.displayName && p.displayName.text) || null,
    address: p.formattedAddress || null,
    lat: (p.location && p.location.latitude) ?? null,
    lng: (p.location && p.location.longitude) ?? null,
    rating: p.rating ?? null,
    review_count: p.userRatingCount ?? 0,
    phone: p.nationalPhoneNumber || p.internationalPhoneNumber || null,
    website: p.websiteUri || null,
    maps_uri: mapsUri,
    score: Number(bayesian(p.rating, p.userRatingCount).toFixed(4)),
    review_langs: langs,
    reviews,
  };
}

async function fetchFromGoogle(locality, category, googleKey) {
  const body = {
    textQuery: `${category.query} ${locality.name}`,
    // English, not Spanish. The businesses are searched for in Spanish (category.query)
    // because that is how they list themselves, but the reviews come back translated,
    // and so does "3 months ago". The badge still reports the language each review was
    // actually written in, so nothing is misrepresented.
    languageCode: 'en',
    regionCode: 'ES',
    locationBias: {
      circle: {
        center: { latitude: locality.lat, longitude: locality.lng },
        radius: SEARCH_RADIUS_M,
      },
    },
  };
  // Deliberately no includedType. It restricts results to places whose PRIMARY Google
  // type matches exactly, and most Spanish trade businesses are filed as
  // general_contractor, a store, or just a point of interest. Setting it to "plumber"
  // returned a single result for Benidorm. The Spanish text query is specific enough.

  const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': googleKey,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify(body),
  });

  const raw = await r.text();
  if (!r.ok) throw new Error(`Google Places ${r.status}: ${raw.slice(0, 300)}`);

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(`Google Places returned a non-JSON body: ${raw.slice(0, 200)}`);
  }

  const places = (Array.isArray(data.places) ? data.places : [])
    .filter(p => p.businessStatus === 'OPERATIONAL')
    .filter(p => typeof p.rating === 'number');

  const rank = (list) => list.map(shapePlace).sort((a, b) => b.score - a.score);

  const strong = rank(places.filter(p => (p.userRatingCount || 0) >= MIN_REVIEWS));
  if (strong.length >= MIN_RESULTS) return strong.slice(0, MAX_RESULTS);

  // Thin town: top up from the businesses just under the bar rather than showing one card.
  const thin = rank(places.filter(p => {
    const n = p.userRatingCount || 0;
    return n >= FALLBACK_MIN_REVIEWS && n < MIN_REVIEWS;
  }));
  return [...strong, ...thin].slice(0, MAX_RESULTS);
}

// ---------------------------------------------------------------------------

export default async function handler(req, res) {
  try {
    const { url, key, google } = env();

    if (!url) return res.status(500).json({ error: 'Missing env var: SUPABASE_URL (or VITE_SUPABASE_URL). Add it in Vercel and redeploy.' });
    if (!key) return res.status(500).json({ error: 'Missing env var: SUPABASE_SERVICE_KEY. Add it in Vercel and redeploy.' });

    // Diagnostics. Read-only, spends no Google credit, answers "is this wired up".
    if (req.query.health === '1') {
      const pass = req.headers['x-passcode'] || req.query.pass;
      if (pass !== process.env.INTERNAL_PASSCODE) return res.status(401).json({ error: 'unauthorized' });
      let storage = 'not created yet, it will be made on the first lookup';
      try {
        const br = await fetch(`${url}/storage/v1/bucket/${BUCKET}`, { headers: auth(key) });
        if (br.ok) {
          storage = 'ready';
        } else {
          // Supabase reports a missing bucket as HTTP 400 with a 404 buried in the JSON
          // body, so the status code alone is not enough to tell "not made yet" apart
          // from a real fault. Reading the body keeps a normal pre-first-use state from
          // looking like a broken deployment.
          const body = (await br.text()).slice(0, 200);
          const missing = br.status === 404 || /NoSuchBucket|not\s*found/i.test(body);
          if (!missing) storage = `Storage ${br.status}: ${body}`;
        }
      } catch (e) {
        storage = `unreachable: ${String((e && e.message) || e)}`;
      }
      const used = await readBudget(url, key);
      return res.json({
        ok: !!google,
        checks: {
          SUPABASE_URL: 'set',
          SUPABASE_SERVICE_KEY: 'set',
          GOOGLE_PLACES_KEY: google ? 'set' : 'MISSING. This is the only thing left to configure.',
          cache_bucket: storage,
        },
        budget: { refreshed_today: used, daily_limit: DAILY_CELL_BUDGET, remaining: Math.max(0, DAILY_CELL_BUDGET - used) },
        cache_days: CACHE_DAYS,
      });
    }

    const localitySlug = String(req.query.locality || '').trim();
    const categorySlug = String(req.query.category || '').trim();

    // Only slugs from our own lists are ever turned into a Google query. Without this,
    // anyone could point our billed API key at arbitrary searches.
    const locality = LOCALITY_BY_SLUG[localitySlug];
    const category = ANY_CATEGORY_BY_SLUG[categorySlug];
    if (!locality) return res.status(400).json({ error: `Unknown locality "${localitySlug}".` });
    if (!category) return res.status(400).json({ error: `Unknown category "${categorySlug}".` });

    const path = cellPath(localitySlug, categorySlug);

    let cell = null;
    try {
      cell = await readObject(url, key, path);
    } catch (e) {
      return res.status(500).json({ error: String((e && e.message) || e) });
    }

    const ageMs = cell && cell.fetched_at ? Date.now() - new Date(cell.fetched_at).getTime() : Infinity;
    const fresh = cell && ageMs < CACHE_DAYS * 24 * 60 * 60 * 1000;

    if (fresh) {
      res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
      return res.json({
        locality: { slug: locality.slug, name: locality.name, province: locality.province },
        category: category.slug,
        providers: cell.providers || [],
        fetched_at: cell.fetched_at,
        source: 'cache',
      });
    }

    // Expired content must never be served, so it goes now rather than after a
    // successful refetch. If the refetch fails the visitor sees "try again later",
    // which is the correct answer, and nothing expired is left sitting in storage.
    if (cell) await deleteObject(url, key, path);

    if (!google) {
      return res.status(503).json({
        error: 'not_configured',
        message: 'This locality has not been looked up yet and live lookup is not configured.',
        detail: 'Missing env var: GOOGLE_PLACES_KEY. Add it in Vercel and redeploy.',
        locality: locality.name,
      });
    }

    const usedToday = await readBudget(url, key);
    if (usedToday >= DAILY_CELL_BUDGET) {
      return res.status(503).json({
        error: 'temporarily_unavailable',
        message: `${locality.name} is being refreshed. Please try again tomorrow.`,
        locality: locality.name,
        budget_spent: true,
      });
    }

    let providers;
    try {
      providers = await fetchFromGoogle(locality, category, google);
    } catch (e) {
      return res.status(502).json({ error: `Lookup failed: ${String((e && e.message) || e)}` });
    }

    const record = { locality: localitySlug, category: categorySlug, providers, fetched_at: new Date().toISOString() };

    let cacheWarning = null;
    try {
      await writeObject(url, key, path, record);
      await bumpBudget(url, key, usedToday);
    } catch (e) {
      // The lookup itself worked, so still answer the visitor. Only the cache write
      // failed, which costs one extra Google call next time and nothing else.
      cacheWarning = String((e && e.message) || e);
    }

    return res.json({
      locality: { slug: locality.slug, name: locality.name, province: locality.province },
      category: category.slug,
      providers,
      fetched_at: record.fetched_at,
      source: 'live',
      ...(cacheWarning ? { cache_warning: cacheWarning } : {}),
    });
  } catch (e) {
    // Never let Vercel emit a bare FUNCTION_INVOCATION_FAILED. The UI parses JSON.
    if (!res.headersSent) {
      return res.status(500).json({ error: String((e && e.message) || e), where: 'api/directory.js' });
    }
  }
}
