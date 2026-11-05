// The only place this surface talks to Supabase, and the only table it writes posts to.
//
// One more table is read here, news_items, written by the newsletter digest (api/news.js).
// Its approved stories become the WhatsApp channel post in the daily email on days with no
// hand-written channel post. This surface only takes the next approved story and marks it
// as used; everything else about that table belongs to the digest.
//
// TABLE is a constant rather than a parameter on purpose. A handler cannot be talked into
// reading or writing linkedin_posts or studio_packages, because it never gets to choose.

import { createHash } from 'node:crypto';

export const TABLE = 'fb_posts';

export function gate(req, res) {
  const pass = req.headers['x-passcode'] || (req.query && req.query.pass);
  if (!process.env.INTERNAL_PASSCODE) {
    res.status(500).json({ error: 'Missing env var: INTERNAL_PASSCODE.' });
    return false;
  }
  if (pass !== process.env.INTERNAL_PASSCODE) {
    res.status(401).json({ error: 'unauthorized' });
    return false;
  }
  return true;
}

// The daily send is started by a GitHub Actions schedule, because both of the Vercel cron
// slots this plan allows are taken. That job has to prove who it is without anyone having to
// add a new secret anywhere, so it sends the sha256 of the Supabase service key, which the
// repository's Actions secrets and this function's environment both already hold. The key
// itself never travels. CRON_SECRET and the deck's own password are accepted too.
export const cronToken = () => (process.env.SUPABASE_SERVICE_KEY
  ? createHash('sha256').update(process.env.SUPABASE_SERVICE_KEY, 'utf8').digest('hex')
  : null);

export function gateCron(req, res) {
  const pass = req.headers['x-passcode'] || (req.query && req.query.pass);
  if (process.env.INTERNAL_PASSCODE && pass === process.env.INTERNAL_PASSCODE) return true;
  const auth = String(req.headers.authorization || '');
  // Exactly the LinkedIn dispatcher's rule (api/_lk_dispatch.js), at Pratik's request on
  // 12 Oct 2026: with CRON_SECRET set, Vercel's cron must carry it; without it, Vercel's own
  // cron call is recognised by its header and user agent.
  const isCron = !!req.headers['x-vercel-cron'] || String(req.headers['user-agent'] || '').startsWith('vercel-cron');
  const cronOk = process.env.CRON_SECRET ? auth === `Bearer ${process.env.CRON_SECRET}` : isCron;
  if (cronOk) return true;
  const token = cronToken();
  if (token && auth === `Bearer ${token}`) return true;
  res.status(401).json({ error: 'unauthorized' });
  return false;
}

function creds(res) {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url) { res.status(500).json({ error: 'Missing env var: SUPABASE_URL (or VITE_SUPABASE_URL)' }); return null; }
  if (!key) { res.status(500).json({ error: 'Missing env var: SUPABASE_SERVICE_KEY.' }); return null; }
  return { url: url.replace(/\/$/, ''), key };
}

export async function rest(res, path, init = {}) {
  const c = creds(res);
  if (!c) return null;
  const r = await fetch(`${c.url}/rest/v1/${TABLE}${path}`, {
    ...init,
    headers: {
      apikey: c.key,
      Authorization: `Bearer ${c.key}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const text = await r.text();
  if (!r.ok) { res.status(500).json({ error: `Supabase ${r.status}: ${text.slice(0, 400)}` }); return null; }
  try { return text ? JSON.parse(text) : []; }
  catch { return []; }
}

export function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body) { try { return JSON.parse(req.body); } catch { return {}; } }
  return {};
}

// --- Approved newsletter stories for the WhatsApp channel section -------------------------
export const NEWS_TABLE = 'news_items';

// The digest's two tables, read only from this side. news_items carries the stories,
// news_emails the Spanish text they came from (api/_fb_news.js writes posts from both).
const NEWS_TABLES = new Set([NEWS_TABLE, 'news_emails']);

async function newsFetch(path, init = {}, table = NEWS_TABLE) {
  if (!NEWS_TABLES.has(table)) return { ok: false, error: `Not a news table: ${table}` };
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return { ok: false, error: 'Supabase is not configured.' };
  try {
    const r = await fetch(`${url}/rest/v1/${table}${path}`, {
      ...init,
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
    });
    const text = await r.text();
    if (!r.ok) return { ok: false, error: `Supabase ${r.status}: ${text.slice(0, 200)}` };
    let data = [];
    try { data = text ? JSON.parse(text) : []; } catch { data = []; }
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: String((e && e.message) || e) };
  }
}

// The oldest approved story that has not gone out yet, or null. Never throws: a problem here
// must not stop the Facebook post going out, so it only means no channel post today.
export async function nextChannelNews() {
  const r = await newsFetch('?select=id,title_en,en,edited_en,translations,is_proposal,source,link&status=eq.approved&used_on=is.null&translations=not.is.null&order=decided_at.asc&limit=1');
  return r.ok ? { ok: true, item: r.data[0] || null } : { ok: false, item: null, error: r.error };
}
export async function countChannelNews() {
  const r = await newsFetch('?select=id&status=eq.approved&used_on=is.null&translations=not.is.null');
  return r.ok ? r.data.length : 0;
}
export async function markChannelNewsUsed(id, date) {
  return newsFetch(`?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'used', used_on: date, updated_at: new Date().toISOString() }),
  });
}

// A read of the digest's tables for api/_fb_news.js. GET only: this side never changes a story.
export async function readNews(path, table = NEWS_TABLE) {
  return newsFetch(path, {}, table);
}
