// GET or POST /api/internal-reset?pass=... [&scope=approved|rejected|all]
// Puts decided posts back into the pending deck (for testing / re-review).
// Clears the decision fields. Default scope: all decided (approved + rejected).
export default async function handler(req, res) {
  try {
    const pass = req.headers['x-passcode'] || req.query.pass;
    if (pass !== process.env.INTERNAL_PASSCODE) {
      return res.status(401).json({ error: 'unauthorized' });
    }
    const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) return res.status(500).json({ error: 'Missing Supabase env vars' });

    const scope = ['approved', 'rejected'].includes(req.query.scope) ? req.query.scope : 'all';
    const filter = scope === 'all' ? 'status=in.(approved,rejected)' : `status=eq.${scope}`;

    const r = await fetch(`${url}/rest/v1/studio_packages?${filter}`, {
      method: 'PATCH',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        status: 'pending',
        reject_comment: null,
        decided_at: null,
        updated_at: new Date().toISOString(),
      }),
    });
    if (!r.ok) return res.status(500).json({ error: `Supabase ${r.status}: ${await r.text()}` });
    const rows = await r.json();
    res.json({ ok: true, reset: rows.length, scope });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
}
