// GET or POST /api/linkedin-refresh?pass=...
// Safe content refresh, used by the deck's Sync button:
//   1. deletes rows that are still pending AND unedited (no decision or edit is ever lost),
//   2. re-inserts the full current content set (ignore-duplicates, so decided/edited rows stay),
//   3. updates image_url on the surviving rows so photos stay in sync everywhere.
// Idempotent: safe to press any number of times.
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
    const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url) return res.status(500).json({ error: 'Missing env var: SUPABASE_URL (or VITE_SUPABASE_URL)' });
    if (!key) return res.status(500).json({ error: 'Missing env var: SUPABASE_SERVICE_KEY. Add it in Vercel and redeploy.' });
    const H = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };

    const rows = [
      ...owners.map(p => ({ ...p, audience: p.audience || 'owners' })),
      ...agents,
      ...attorneys,
      ...translations,
    ].map(({ source_slug, source_slug2, source_article, ...rest }) => rest);

    // 1. Clear pending, unedited English rows (their fresh versions come back in step 2).
    //    Translation rows are seeded as 'approved' and ride along with the English master's
    //    decision, so they are not part of the pending sweep.
    const del = await fetch(`${url}/rest/v1/linkedin_posts?status=eq.pending&edited_text=is.null&language=eq.en`, {
      method: 'DELETE', headers: { ...H, Prefer: 'count=exact' },
    });
    if (!del.ok) return res.status(500).json({ error: `Supabase delete ${del.status}: ${await del.text()}` });
    const cleared = Number((del.headers.get('content-range') || '').split('/')[1] || 0);

    // 2. Insert everything; existing (decided or edited) rows are skipped.
    const ins = await fetch(`${url}/rest/v1/linkedin_posts?on_conflict=slug,language,member`, {
      method: 'POST',
      headers: { ...H, Prefer: 'resolution=ignore-duplicates,return=representation' },
      body: JSON.stringify(rows),
    });
    const insText = await ins.text();
    if (!ins.ok) return res.status(500).json({ error: `Supabase insert ${ins.status}: ${insText}` });
    let inserted = [];
    try { inserted = JSON.parse(insText); } catch { /* representation expected */ }

    // 3. Sync image_url on rows that survived step 1 (grouped: one call per distinct image).
    const groups = {};
    rows.forEach(p => {
      const k = p.image_url || 'null';
      (groups[k] = groups[k] || []).push(p.slug);
    });
    let imageUpdates = 0;
    for (const [img, slugs] of Object.entries(groups)) {
      const r = await fetch(`${url}/rest/v1/linkedin_posts?slug=in.(${slugs.join(',')})`, {
        method: 'PATCH',
        headers: { ...H, Prefer: 'return=minimal' },
        body: JSON.stringify({ image_url: img === 'null' ? null : img }),
      });
      if (!r.ok) return res.status(500).json({ error: `Supabase image sync ${r.status}: ${await r.text()}` });
      imageUpdates += 1;
    }

    res.json({ ok: true, total: rows.length, refreshed: cleared, newly_inserted: inserted.length, image_groups: imageUpdates });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
}
