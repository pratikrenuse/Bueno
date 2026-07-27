// GET /api/internal-packages?status=pending
// Shared-password gate: x-passcode header must match INTERNAL_PASSCODE (Vercel env).
// Talks to Supabase REST with the service key (Vercel env), never exposed to the browser.
module.exports = async function handler(req, res) {
  if (req.headers['x-passcode'] !== process.env.INTERNAL_PASSCODE) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  const status = ['pending', 'approved', 'rejected', 'published'].includes(req.query.status)
    ? req.query.status : 'pending';

  const r = await fetch(
    `${url}/rest/v1/studio_packages?status=eq.${status}&order=created_at.asc&select=*`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } }
  );
  if (!r.ok) return res.status(500).json({ error: await r.text() });
  res.json({ packages: await r.json() });
};
