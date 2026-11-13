// The only place the social posting tool talks to Supabase, checks who is calling, signs
// links and sends its one kind of email.
//
// Two tables, named here and nowhere else: social_accounts (one row per connected Instagram
// account, Facebook Page or LinkedIn profile, with its access token) and social_posts (one
// row per post for one account). Nothing here can be pointed at the LinkedIn, Facebook,
// news, newsletter or reels tables, and none of their helpers are imported.

import crypto from 'node:crypto';

export const TABLES = { accounts: 'social_accounts', posts: 'social_posts' };
export const BUCKET = 'social';

// ---------- who is calling ----------

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

// The same rule as the other dispatchers in this repo: with CRON_SECRET set, Vercel's cron
// must carry it; without it, Vercel's own cron call is recognised by its header and agent.
export function gateCron(req, res) {
  const pass = req.headers['x-passcode'] || (req.query && req.query.pass);
  if (process.env.INTERNAL_PASSCODE && pass === process.env.INTERNAL_PASSCODE) return true;
  const auth = String(req.headers.authorization || '');
  const isCron = !!req.headers['x-vercel-cron'] || String(req.headers['user-agent'] || '').startsWith('vercel-cron');
  const cronOk = process.env.CRON_SECRET ? auth === `Bearer ${process.env.CRON_SECRET}` : isCron;
  if (cronOk) return true;
  res.status(401).json({ error: 'unauthorized' });
  return false;
}

// ---------- Supabase ----------

export function creds() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url) return { error: 'Missing env var: SUPABASE_URL (or VITE_SUPABASE_URL)' };
  if (!key) return { error: 'Missing env var: SUPABASE_SERVICE_KEY.' };
  return { url, key };
}

// Returns { ok: true, data } or { ok: false, error }. Never throws and never writes to res.
export async function rest(path, init = {}) {
  const c = creds();
  if (c.error) return { ok: false, error: c.error };
  try {
    const r = await fetch(`${c.url}${path}`, {
      ...init,
      headers: { apikey: c.key, Authorization: `Bearer ${c.key}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
    });
    const text = await r.text();
    if (!r.ok) return { ok: false, status: r.status, error: `Supabase ${r.status}: ${text.slice(0, 300)}` };
    let data = [];
    try { data = text ? JSON.parse(text) : []; } catch { data = []; }
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: `Supabase request failed: ${String((e && e.message) || e)}` };
  }
}

export function db(which, path = '', init = {}) {
  const table = TABLES[which];
  if (!table) return Promise.resolve({ ok: false, error: `Unknown table key: ${which}` });
  return rest(`/rest/v1/${table}${path}`, init);
}

export async function ensureBucket() {
  const g = await rest(`/storage/v1/bucket/${BUCKET}`);
  if (g.ok) return { ok: true };
  return rest('/storage/v1/bucket', {
    method: 'POST', body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true, file_size_limit: 104857600 }),
  });
}

export const now = () => new Date().toISOString();
export const isUuid = (s) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(s || ''));

export function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body) { try { return JSON.parse(req.body); } catch { return {}; } }
  return {};
}

// ---------- signed links ----------
//
// A connect link and the OAuth "state" value are both a small signed note. The key is made
// from two secrets the site already holds, so there is no new env var and nothing to leak:
// a link proves it was made by someone who had the internal password, and it expires.

const b64 = (buf) => Buffer.from(buf).toString('base64url');

function signingKey() {
  const a = process.env.SUPABASE_SERVICE_KEY || '';
  const b = process.env.INTERNAL_PASSCODE || '';
  if (!a || !b) return null;
  return crypto.createHash('sha256').update(`${a}:${b}:social-links`).digest();
}

export function sign(payload, ttlSeconds) {
  const key = signingKey();
  if (!key) return null;
  const body = b64(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds }));
  const mac = b64(crypto.createHmac('sha256', key).update(body).digest());
  return `${body}.${mac}`;
}

export function verify(token) {
  const key = signingKey();
  if (!key) return null;
  const [body, mac] = String(token || '').split('.');
  if (!body || !mac) return null;
  const want = b64(crypto.createHmac('sha256', key).update(body).digest());
  if (mac.length !== want.length || !crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(want))) return null;
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!p.exp || p.exp < Math.floor(Date.now() / 1000)) return null;
    return p;
  } catch { return null; }
}

// The address the person is using right now. The OAuth redirect has to match what was
// registered with each platform character for character, so it is read from the request
// and carried through the whole sign-in, never rebuilt from a guess.
export function baseUrl(req) {
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
  const proto = /^(localhost|127\.)/.test(host) ? 'http' : 'https';
  return host ? `${proto}://${host}` : 'https://www.247spain.es';
}
export const redirectUri = (base) => `${base}/api/social/callback`;

// ---------- email ----------

export const ALERT_TO = () => [process.env.SOCIAL_ALERT_TO || 'pratik.y.renuse@gmail.com'];

export const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export async function sendMail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: 'Missing env var: RESEND_API_KEY' };
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.RESEND_FROM || '24/7 Spain <onboarding@resend.dev>', to, subject, html, reply_to: to[0] }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: `Resend ${r.status}: ${JSON.stringify(j).slice(0, 300)}` };
    return { ok: true, id: j.id };
  } catch (e) {
    return { ok: false, error: `Resend request failed: ${String((e && e.message) || e)}` };
  }
}
