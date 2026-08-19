// GET or POST /api/linkedin-seed?pass=...
// Idempotent: inserts the batch from api/_linkedin_batch1.js, skipping rows that already
// exist (unique slug+language+member), so re-running never overwrites decisions or edits.
import batch from './_linkedin_batch1.js';

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

    const r = await fetch(
      `${url.replace(/\/$/, '')}/rest/v1/linkedin_posts?on_conflict=slug,language,member`,
      {
        method: 'POST',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=ignore-duplicates,return=representation',
        },
        body: JSON.stringify(batch),
      }
    );
    const text = await r.text();
    if (!r.ok) return res.status(500).json({ error: `Supabase ${r.status}: ${text}` });
    let inserted = [];
    try { inserted = JSON.parse(text); } catch { /* return=representation should give JSON */ }
    res.json({ ok: true, batch_size: batch.length, newly_inserted: inserted.length });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
}
