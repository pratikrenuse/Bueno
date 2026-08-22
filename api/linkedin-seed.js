// GET or POST /api/linkedin-seed?pass=...
// Idempotent: inserts all content streams (owners, agents, attorneys), skipping rows that
// already exist (unique slug+language+member), so re-running never overwrites decisions or edits.
import owners from './_linkedin_batch1.js';
import agents from './_linkedin_agents.js';
import attorneys from './_linkedin_attorneys.js';
import translations from './_linkedin_translations.js';

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

    // PostgREST bulk insert requires an identical key set on every row, so build rows explicitly.
    const norm = (p, defaults = {}) => ({
      slug: p.slug,
      batch: p.batch ?? 1,
      day: p.day ?? null,
      language: p.language || 'en',
      member: p.member || '',
      audience: p.audience || defaults.audience || 'owners',
      title: p.title || null,
      post_text: p.post_text,
      image_url: p.image_url ?? null,
      status: p.status || defaults.status || 'pending',
      source_hash: p.source_hash ?? null,
    });

    const rows = [
      ...owners.map(p => norm(p, { audience: 'owners' })),
      ...agents.map(p => norm(p, { audience: 'agents' })),
      ...attorneys.map(p => norm(p, { audience: 'attorneys' })),
      ...translations.map(p => norm(p, { status: 'approved' })),
    ];

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
        body: JSON.stringify(rows),
      }
    );
    const text = await r.text();
    if (!r.ok) return res.status(500).json({ error: `Supabase ${r.status}: ${text}` });
    let inserted = [];
    try { inserted = JSON.parse(text); } catch { /* return=representation should give JSON */ }
    res.json({ ok: true, batch_size: rows.length, newly_inserted: inserted.length });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
}
