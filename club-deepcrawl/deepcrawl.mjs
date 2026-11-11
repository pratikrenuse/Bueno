// Deep email check for Bueno Club venues. Used by api/_venues.js (?venues=deep).
//
// For one venue website it reads up to 25 pages of the venue's own site (more on request,
// never more than 40) and returns every email address it finds, each with the page it came
// from. Pages are chosen in this order:
//   1. pages about this venue's own town or branch (a chain lists every shop; we want this one)
//   2. contact pages
//   3. legal notice, imprint, privacy and cookie pages (Spanish law puts the company email there)
//   4. about, team and staff pages
//   5. shop, location and showroom pages
//   6. booking, events and menu pages
//   7. anything else on the site, shallow pages first
// Links come from the pages themselves and from the site's sitemap.xml.
// Nothing here calls Google, so a deep check costs nothing beyond Vercel function time.

import { extractEmails } from '../api/_leads.js';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const SKIP_EXT = /\.(jpe?g|png|gif|webp|svg|avif|ico|pdf|zip|rar|mp4|mp3|mov|webm|css|js|json|xml|txt|woff2?|ttf|eot|docx?|xlsx?)(\?|$)/i;
const SKIP_PATH = /\/(wp-content|wp-includes|wp-json|cdn-cgi|feed|tag|tags|author|cart|checkout|carrito|my-account|mi-cuenta|login|wp-login|xmlrpc)(\/|$)|[?&](add-to-cart|replytocom|share|orderby|filter_)/i;

const KEYWORDS = [
  [/contact|kontakt|contacto|contactar|contatti|yhteys|contactez/i, 50],
  [/aviso-?legal|legal|impressum|imprint|privac|privacidad|personvern|integritet|cookies|terminos|condiciones|terms/i, 45],
  [/about|nosotros|quienes|quien-somos|sobre|om-oss|omoss|om-os|over-ons|ueber-uns|uber-uns|equipo|team|staff|historia|history/i, 35],
  [/tienda|tiendas|store|stores|butikk|butiker|location|locations|ubicacion|donde|where|sucursal|showroom|find-us|encuentranos/i, 30],
  [/reserv|booking|book|eventos|events|carta|menu|meny|horario|opening/i, 15],
];

const STOP = new Set(['puerto', 'playa', 'costa', 'sitio', 'del', 'de', 'la', 'las', 'los', 'el', 'san', 'santa', 'gran', 'canaria', 'port']);
const ALIASES = {
  "l'alfas del pi": ['albir', 'alfas', 'alfaz'], albir: ['albir', 'alfas', 'alfaz'], 'los boliches': ['boliches', 'fuengirola'],
  'la cala de mijas': ['lacala', 'cala-de-mijas', 'mijas'], 'sitio de calahonda': ['calahonda'], 'orihuela costa': ['orihuela', 'cabo-roig', 'caboroig', 'zenia'],
  'puerto de mogan': ['mogan'], patalavaca: ['patalavaca', 'mogan'], 'puerto rico': ['puerto-rico', 'mogan'], 'san agustin': ['san-agustin', 'sanagustin'],
  'costa adeje': ['adeje'], 'playa de las americas': ['americas'], 'los cristianos': ['cristianos'], 'villajoyosa': ['villajoyosa', 'vila-joiosa', 'lavila'],
};

const fold = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function townTokens(town) {
  const t = fold(town);
  const words = t.split(/[^a-z]+/).filter(w => w.length >= 4 && !STOP.has(w));
  for (const [k, v] of Object.entries(ALIASES)) if (t.includes(k)) words.push(...v);
  return [...new Set(words)];
}

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function hostOf(u) {
  try { return new URL(u).hostname.replace(/^www\./, '').toLowerCase(); } catch { return ''; }
}

function normUrl(u) {
  try {
    const x = new URL(u);
    x.hash = '';
    for (const k of [...x.searchParams.keys()]) if (/^(utm_|fbclid|gclid|_gl)/i.test(k)) x.searchParams.delete(k);
    let s = x.href;
    if (s.endsWith('/') && x.pathname !== '/') s = s.slice(0, -1);
    return s;
  } catch { return ''; }
}

export function scoreUrl(u, townRe) {
  let path = '';
  try { const x = new URL(u); path = decodeURIComponent(x.pathname + x.search).toLowerCase(); } catch { return -1; }
  if (SKIP_EXT.test(path) || SKIP_PATH.test(path)) return -1;
  let s = 1;
  if (townRe && townRe.test(path)) s += 100;
  for (const [re, w] of KEYWORDS) if (re.test(path)) { s += w; break; }
  if (/^\/(en|es|no|nb|sv|da|fi|nl|de|fr)\/?$/.test(path)) s += 5;
  s -= Math.max(0, path.split('/').filter(Boolean).length - 1) * 2;
  return s;
}

async function fetchPage(url, ms) {
  const c = new AbortController();
  const timer = setTimeout(() => c.abort(), ms);
  try {
    const r = await fetch(url, {
      signal: c.signal, redirect: 'follow',
      headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml,*/*;q=0.8', 'Accept-Language': 'en,es;q=0.8,no;q=0.6,sv;q=0.5' },
    });
    const ct = r.headers.get('content-type') || '';
    const body = (ct && !/html|text|xml/i.test(ct)) ? '' : (await r.text()).slice(0, 800000);
    return { ok: r.ok, status: r.status, url: r.url || url, html: body };
  } catch (e) {
    return { ok: false, status: 0, url, html: '', error: e?.name === 'AbortError' ? 'timeout' : 'network' };
  } finally {
    clearTimeout(timer);
  }
}

export function pageLinks(html, base, host) {
  const out = [];
  for (const m of html.matchAll(/href\s*=\s*["']([^"'#\s][^"']*)["']/gi)) {
    const raw = m[1].trim();
    if (/^(mailto|tel|javascript|whatsapp|sms):/i.test(raw)) continue;
    try {
      const u = new URL(raw, base);
      if (!/^https?:$/.test(u.protocol) || hostOf(u.href) !== host) continue;
      const n = normUrl(u.href);
      if (n && !out.includes(n)) out.push(n);
    } catch { /* skip */ }
    if (out.length >= 400) break;
  }
  return out;
}

// Turns "info [at] venue [dot] es" and similar into a normal address before extraction.
export function unobfuscate(html) {
  return html
    .replace(/\s*(\[|\(|\{)\s*(at|arroba)\s*(\]|\)|\})\s*/gi, '@')
    .replace(/\s*(\[|\(|\{)\s*(dot|punto)\s*(\]|\)|\})\s*/gi, '.');
}

export function socialLinks(html) {
  const pick = (re) => {
    for (const m of html.matchAll(re)) {
      const u = m[0].replace(/\/+$/, '');
      if (!/sharer|share|intent|plugins|\/p\/|\/reel|\/tr\b|dialog|\/explore|\/watch|\/groups\//i.test(u)) return u;
    }
    return '';
  };
  return {
    facebook: pick(/https?:\/\/(?:www\.|m\.|es-es\.)?facebook\.com\/[A-Za-z0-9_.\-]+/gi),
    instagram: pick(/https?:\/\/(?:www\.)?instagram\.com\/[A-Za-z0-9_.]+/gi),
  };
}

async function sitemapLinks(origin, host, ms) {
  const out = [];
  const first = await fetchPage(`${origin}/sitemap.xml`, ms);
  if (!first.html || !/<(urlset|sitemapindex)/i.test(first.html)) return out;
  const locs = (x) => [...x.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map(m => m[1].replace(/&amp;/g, '&'));
  let pages = [];
  if (/<sitemapindex/i.test(first.html)) {
    const children = locs(first.html).filter(u => /page|post|product|tienda|store|location|sitemap/i.test(u)).slice(0, 3);
    const docs = await Promise.all(children.map(u => fetchPage(u, ms)));
    for (const d of docs) pages.push(...locs(d.html || ''));
  } else {
    pages = locs(first.html);
  }
  for (const u of pages) {
    if (hostOf(u) !== host) continue;
    const n = normUrl(u);
    if (n && !out.includes(n)) out.push(n);
    if (out.length >= 1500) break;
  }
  return out;
}

/**
 * Deep check of one venue website.
 * site: { id, website, town }
 * opts: { maxPages = 25, budgetMs = 40000, pageMs = 7000, concurrency = 5 }
 */
export async function deepCrawl(site, opts = {}) {
  const maxPages = Math.min(Math.max(parseInt(opts.maxPages || 25, 10) || 25, 1), 40);
  const budgetMs = opts.budgetMs || 40000;
  const pageMs = opts.pageMs || 7000;
  const conc = opts.concurrency || 5;
  const started = Date.now();
  const left = () => budgetMs - (Date.now() - started);
  const out = { id: site.id, website: site.website || '', final: '', status: '', pages: 0, emails: [], facebook: '', instagram: '' };

  if (!site.website || !/^https?:\/\//i.test(site.website)) { out.status = 'no_website'; return out; }
  if (/facebook\.com|instagram\.com|linktr\.ee|wa\.me|google\.|tripadvisor|bluepillow|booking\.com|thefork/i.test(site.website)) { out.status = 'not_own_site'; return out; }

  const toks = townTokens(site.town);
  const townRe = toks.length ? new RegExp(toks.map(escape).join('|'), 'i') : null;

  const home = await fetchPage(site.website, pageMs);
  if (!home.html) {
    out.status = home.status === 403 || home.status === 503 ? 'blocked' : home.status ? `http_${home.status}` : (home.error || 'unreachable');
    return out;
  }
  if (!home.ok && /cloudflare|attention required|just a moment|captcha/i.test(home.html.slice(0, 5000))) { out.status = 'blocked'; return out; }

  out.final = home.url;
  const host = hostOf(home.url);
  let origin = '';
  try { origin = new URL(home.url).origin; } catch { /* none */ }

  const found = new Map(); // email -> { src, local }
  const visited = new Set([normUrl(home.url), normUrl(site.website)]);
  const record = (html, url) => {
    let path = '/';
    try { path = new URL(url).pathname || '/'; } catch { /* none */ }
    const local = !!(townRe && townRe.test(fold(decodeURIComponent(path))));
    for (const e of extractEmails(unobfuscate(html))) {
      const prev = found.get(e);
      if (!prev) found.set(e, { src: path, local });
      else if (local && !prev.local) found.set(e, { src: path, local: true });
    }
    if (!out.facebook || !out.instagram) {
      const s = socialLinks(html);
      out.facebook = out.facebook || s.facebook;
      out.instagram = out.instagram || s.instagram;
    }
  };
  record(home.html, home.url);
  out.pages = 1;

  const queue = new Map(); // url -> score
  const enqueue = (list) => {
    for (const u of list) {
      if (visited.has(u) || queue.has(u)) continue;
      const s = scoreUrl(u, townRe);
      if (s > 0) queue.set(u, s);
    }
  };
  enqueue(pageLinks(home.html, home.url, host));
  if (origin && left() > pageMs * 2) enqueue(await sitemapLinks(origin, host, Math.min(pageMs, 6000)));

  while (out.pages < maxPages && queue.size && left() > 1500) {
    const wave = [...queue.entries()].sort((a, b) => b[1] - a[1]).slice(0, Math.min(conc, maxPages - out.pages)).map(e => e[0]);
    for (const u of wave) { queue.delete(u); visited.add(u); }
    const pages = await Promise.all(wave.map(u => fetchPage(u, Math.min(pageMs, Math.max(1000, left())))));
    for (const p of pages) {
      if (!p.html) continue;
      out.pages += 1;
      visited.add(normUrl(p.url));
      record(p.html, p.url);
      if (hostOf(p.url) === host) enqueue(pageLinks(p.html, p.url, host));
    }
  }

  out.emails = [...found.entries()].map(([e, v]) => ({ e, src: v.src, local: v.local }));
  out.status = left() <= 1500 && queue.size ? 'ok_time_limit' : 'ok';
  return out;
}

// Runs several venues at once inside one serverless call and never runs past the deadline.
export async function deepCrawlMany(sites, opts = {}) {
  const deadline = opts.deadlineMs || 50000;
  const started = Date.now();
  const timeout = new Promise(r => setTimeout(() => r('deadline'), deadline));
  const results = new Array(sites.length).fill(null);
  const work = Promise.all(sites.map((s, i) => deepCrawl(s, { ...opts, budgetMs: Math.min(opts.budgetMs || 40000, deadline - 3000) })
    .then(r => { results[i] = r; })
    .catch(e => { results[i] = { id: s.id, website: s.website, status: 'error', error: String(e?.message || e), pages: 0, emails: [] }; })));
  await Promise.race([work, timeout]);
  return results.map((r, i) => r || { id: sites[i].id, website: sites[i].website, status: 'deadline', pages: 0, emails: [], took_ms: Date.now() - started });
}
