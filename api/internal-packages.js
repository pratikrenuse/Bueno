// GET /api/internal-packages?status=pending
// Shared-password gate: x-passcode header must match INTERNAL_PASSCODE (Vercel env).
// Talks to Supabase REST with the service key (Vercel env), never exposed to the browser.
export default async function handler(req, res) {
  try {
    const pass = req.headers['x-passcode'] || req.query.pass;
    if (pass !== process.env.INTERNAL_PASSCODE) {
      return res.status(401).json({ error: 'unauthorized' });
    }
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url) return res.status(500).json({ error: 'Missing env var: SUPABASE_URL (or VITE_SUPABASE_URL)' });
    if (!key) return res.status(500).json({ error: 'Missing env var: SUPABASE_SERVICE_KEY. Add it in Vercel and redeploy.' });
    const status = ['pending', 'approved', 'rejected', 'published', 'all'].includes(req.query.status)
      ? req.query.status : 'pending';
    const statusFilter = status === 'all'
      ? 'status=in.(pending,approved,rejected,published)'
      : `status=eq.${status}`;
    // English-only studio for now; pass ?lang=all to see every language again
    const langFilter = req.query.lang === 'all' ? '' : '&language=eq.en';

    const r = await fetch(
      `${url.replace(/\/$/, '')}/rest/v1/studio_packages?${statusFilter}${langFilter}&order=created_at.asc&select=*`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    );
    if (!r.ok) return res.status(500).json({ error: `Supabase ${r.status}: ${await r.text()}` });
    res.json({ packages: await r.json() });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
};
