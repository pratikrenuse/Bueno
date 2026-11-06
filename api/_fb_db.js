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

// The approved story that has waited longest, or null. Never throws: a problem here must
// not stop the Facebook post going out, so it only means no channel post today.
// 6 November 2026, Pratik: nothing goes into the channels unless he approved it in the deck's
// WhatsApp channels view. Approving translates the story (api/_news_decide.js) and puts it in
// line; one goes out a day, in the order he approved them.
const QUEUED = 'status=eq.approved&used_on=is.null&translations=not.is.null';
const CHANNEL_FIELDS = 'id,title_en,title_es,en,edited_en,translations,is_proposal,source,link,received_on,score,category,position,channel_image,decided_at,status,used_on';
export async function nextChannelNews() {
  const r = await newsFetch(`?select=${CHANNEL_FIELDS}&${QUEUED}&order=decided_at.asc&limit=1`);
  return r.ok ? { ok: true, item: r.data[0] || null } : { ok: false, item: null, error: r.error };
}
export async function countChannelNews() {
  const r = await newsFetch(`?select=id&${QUEUED}`);
  return r.ok ? r.data.length : 0;
}
// The channel view in the deck: approved stories waiting to go out, in sending order.
export async function queuedChannelNews() {
  return newsFetch(`?select=${CHANNEL_FIELDS}&${QUEUED}&order=decided_at.asc`);
}
// Stories from the last REVIEW_DAYS days the digest kept and nobody has decided on yet.
export const REVIEW_DAYS = 7;
export async function reviewChannelNews() {
  const since = new Date(Date.now() - (REVIEW_DAYS - 1) * 864e5).toISOString().slice(0, 10);
  return newsFetch(`?select=${CHANNEL_FIELDS}&keep=eq.true&status=eq.pending&received_on=gte.${since}&order=received_on.desc,score.desc,position.asc`);
}
export async function getChannelNews(id) {
  const r = await newsFetch(`?select=${CHANNEL_FIELDS}&id=eq.${encodeURIComponent(id)}`);
  return r.ok ? (r.data[0] || null) : null;
}
// Every photo a story already has (with repeats), so a new story gets the one used least.
export async function usedChannelImages() {
  const r = await newsFetch('?select=channel_image&channel_image=not.is.null');
  return r.ok ? r.data.map(x => x.channel_image) : [];
}
// The deck's own changes to a story: the photo, "not for the channels" (skipped, which keeps
// it kept so the LinkedIn deck is not affected) and undo. Never touches a story already sent.
export async function patchChannelNews(id, patch) {
  return newsFetch(`?id=eq.${encodeURIComponent(id)}&used_on=is.null`, {
    method: 'PATCH', headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() }),
  });
}
export async function markChannelNewsUsed(id, date) {
  return newsFetch(`?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'used', used_on: date, updated_at: new Date().toISOString() }),
  });
}

// --- The record of what went to the WhatsApp channels -----------------------------------
// wa_channel_sends: one row per day, written when the daily task email carries a channel
// post. It stops the same day going out twice (there are two daily send times) and is what
// the deck's channel view shows as sent. Created 6 November 2026.
export const SENDS_TABLE = 'wa_channel_sends';
async function sendsFetch(path, init = {}) {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return { ok: false, error: 'Supabase is not configured.' };
  try {
    const r = await fetch(`${url}/rest/v1/${SENDS_TABLE}${path}`, {
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
export async function channelSentOn(day) {
  const r = await sendsFetch(`?select=day&day=eq.${day}`);
  return r.ok && r.data.length > 0;
}
export async function logChannelSend({ day, source, news_id = null, title = null, texts, via }) {
  return sendsFetch('?on_conflict=day', {
    method: 'POST',
    headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
    body: JSON.stringify([{ day, source, news_id, title, texts, via, sent_at: new Date().toISOString() }]),
  });
}
export async function recentChannelSends(limit = 14) {
  return sendsFetch(`?select=*&order=day.desc&limit=${limit}`);
}

// A read of the digest's tables for api/_fb_news.js. GET only: this side never changes a story.
export async function readNews(path, table = NEWS_TABLE) {
  return newsFetch(path, {}, table);
}
