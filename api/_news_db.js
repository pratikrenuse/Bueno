// The only place the news surface talks to Supabase.
//
// Two tables, both named here and nowhere else: news_emails (one row per received newsletter)
// and news_items (one row per story split out of it). A handler picks one of the two by key,
// never by passing a table name, so nothing in this surface can be pointed at the LinkedIn,
// Facebook or newsletter tables.

export const TABLES = { emails: 'news_emails', items: 'news_items' };

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

function creds() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url) return { error: 'Missing env var: SUPABASE_URL (or VITE_SUPABASE_URL)' };
  if (!key) return { error: 'Missing env var: SUPABASE_SERVICE_KEY.' };
  return { url: url.replace(/\/$/, ''), key };
}

// Returns { ok: true, data } or { ok: false, error }. Never writes to res, so the webhook
// path can decide for itself what to answer.
export async function db(which, path = '', init = {}) {
  const table = TABLES[which];
  if (!table) return { ok: false, error: `Unknown table key: ${which}` };
  const c = creds();
  if (c.error) return { ok: false, error: c.error };
  try {
    const r = await fetch(`${c.url}/rest/v1/${table}${path}`, {
      ...init,
      headers: {
        apikey: c.key,
        Authorization: `Bearer ${c.key}`,
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      },
    });
    const text = await r.text();
    if (!r.ok) return { ok: false, status: r.status, error: `Supabase ${r.status}: ${text.slice(0, 400)}` };
    let data = [];
    try { data = text ? JSON.parse(text) : []; } catch { data = []; }
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: `Supabase request failed: ${String((e && e.message) || e)}` };
  }
}

export const now = () => new Date().toISOString();

export function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body) { try { return JSON.parse(req.body); } catch { return {}; } }
  return {};
}
