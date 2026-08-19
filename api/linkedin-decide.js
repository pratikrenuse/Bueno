// POST /api/linkedin-decide
//   { id, action: "approved" | "rejected" | "pending", comment? }  -> status change (pending = undo)
//   { id, action: "edit", text }                                   -> saves edited_text only, status untouched
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });
    if (req.headers['x-passcode'] !== process.env.INTERNAL_PASSCODE) {
      return res.status(401).json({ error: 'unauthorized' });
    }
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url) return res.status(500).json({ error: 'Missing env var: SUPABASE_URL (or VITE_SUPABASE_URL)' });
    if (!key) return res.status(500).json({ error: 'Missing env var: SUPABASE_SERVICE_KEY. Add it in Vercel and redeploy.' });

    const { id, action, comment, text } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id required' });

    let patch;
    if (action === 'edit') {
      if (typeof text !== 'string' || !text.trim()) return res.status(400).json({ error: 'edit needs text' });
      patch = { edited_text: text, updated_at: new Date().toISOString() };
    } else if (['approved', 'rejected', 'pending'].includes(action)) {
      if (action === 'rejected' && !comment) return res.status(400).json({ error: 'rejection needs a comment' });
      patch = {
        status: action,
        reject_comment: action === 'rejected' ? comment : null,
        decided_at: action === 'pending' ? null : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } else {
      return res.status(400).json({ error: 'valid action required (approved, rejected, pending, edit)' });
    }

    const r = await fetch(`${url.replace(/\/$/, '')}/rest/v1/linkedin_posts?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(patch),
    });
    if (!r.ok) return res.status(500).json({ error: `Supabase ${r.status}: ${await r.text()}` });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
}
