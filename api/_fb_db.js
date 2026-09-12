// The only place this surface talks to Supabase, and the only table it is allowed to name.
//
// TABLE is a constant rather than a parameter on purpose. A handler cannot be talked into
// reading or writing linkedin_posts or studio_packages, because it never gets to choose.

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
