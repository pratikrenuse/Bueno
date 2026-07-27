// POST /api/internal-decide  { id, action: "approved"|"rejected", comment }
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });
  if (req.headers['x-passcode'] !== process.env.INTERNAL_PASSCODE) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const { id, action, comment } = req.body || {};
  if (!id || !['approved', 'rejected'].includes(action)) {
    return res.status(400).json({ error: 'id and valid action required' });
  }
  if (action === 'rejected' && !comment) {
    return res.status(400).json({ error: 'rejection needs a comment' });
  }
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  const r = await fetch(`${url}/rest/v1/studio_packages?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      status: action,
      reject_comment: action === 'rejected' ? comment : null,
      decided_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }),
  });
  if (!r.ok) return res.status(500).json({ error: await r.text() });
  res.json({ ok: true });
};
