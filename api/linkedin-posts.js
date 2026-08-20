// GET /api/linkedin-posts?status=pending|approved|rejected|all&lang=en
// Same shared-password gate as the studio: x-passcode header (or ?pass=) vs INTERNAL_PASSCODE.
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

    const status = ['pending', 'approved', 'rejected', 'all'].includes(req.query.status)
      ? req.query.status : 'all';
    const statusFilter = status === 'all' ? 'status=in.(pending,approved,rejected)' : `status=eq.${status}`;
    const lang = /^[a-z]{2}$/.test(req.query.lang || '') ? req.query.lang : 'en';
    const langFilter = req.query.lang === 'all' ? '' : `&language=eq.${lang}`;
    const audFilter = ['owners', 'agents', 'attorneys'].includes(req.query.aud)
      ? `&audience=eq.${req.query.aud}` : '';

    const r = await fetch(
      `${url.replace(/\/$/, '')}/rest/v1/linkedin_posts?${statusFilter}${langFilter}${audFilter}&order=day.asc&select=*`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    );
    if (!r.ok) return res.status(500).json({ error: `Supabase ${r.status}: ${await r.text()}` });
    res.json({ posts: await r.json() });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
}
