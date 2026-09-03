// GET or POST /api/linkedin-refresh?pass=...
// Safe content refresh, used by the deck's Sync button. Nothing is ever deleted:
//   1. reads what is already in the table,
//   2. inserts only the rows that are missing,
//   3. updates the text, title and image of rows that are still pending and unedited,
//      so rewritten content reaches the deck.
// Approved masters, rejected posts and anything a reviewer edited are never overwritten.
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

    // PostgREST bulk insert requires every row to carry an identical key set, so build each
    // row explicitly instead of spreading whatever the data modules happen to contain.
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

    // Non-destructive sync. Nothing is ever deleted, so a failure part way through can
    // never empty the deck. Order: read what exists, add what is new, then update the text
    // of rows that are still pending and unedited. Decided or edited rows are left alone.
    const cur = await fetch(
      `${url}/rest/v1/linkedin_posts?select=id,slug,language,member,status,edited_text,post_text,title,image_url,source_hash&limit=5000`,
      { headers: H });
    if (!cur.ok) return res.status(500).json({ error: `Supabase read ${cur.status}: ${await cur.text()}` });
    const existing = new Map((await cur.json()).map(r => [`${r.slug}|${r.language}|${r.member}`, r]));

    // 1. Add rows that do not exist yet.
    const toInsert = rows.filter(p => !existing.has(`${p.slug}|${p.language}|${p.member}`));
    let inserted = [];
    if (toInsert.length) {
      const ins = await fetch(`${url}/rest/v1/linkedin_posts?on_conflict=slug,language,member`, {
        method: 'POST',
        headers: { ...H, Prefer: 'resolution=ignore-duplicates,return=representation' },
        body: JSON.stringify(toInsert),
      });
      const insText = await ins.text();
      if (!ins.ok) return res.status(500).json({ error: `Supabase insert ${ins.status}: ${insText}` });
      try { inserted = JSON.parse(insText); } catch { /* representation expected */ }
    }

    // 2. Refresh rows that already exist but are untouched by a reviewer, so rewritten
    //    content reaches the deck. Anything approved, rejected or hand-edited is preserved.
    const changed = rows.filter(p => {
      const e = existing.get(`${p.slug}|${p.language}|${p.member}`);
      if (!e || e.edited_text) return false;
      if (e.status !== 'pending' && e.status !== 'approved') return false;
      if (e.status === 'approved' && p.language === 'en') return false; // never rewrite an approved master
      return e.post_text !== p.post_text || e.title !== p.title || (e.image_url || null) !== (p.image_url || null)
        || (e.source_hash || null) !== (p.source_hash || null);
    });
    let updated = 0;
    const updateErrors = [];
    for (const p of changed.slice(0, 400)) {
      const e = existing.get(`${p.slug}|${p.language}|${p.member}`);
      const r = await fetch(`${url}/rest/v1/linkedin_posts?id=eq.${e.id}`, {
        method: 'PATCH',
        headers: { ...H, Prefer: 'return=minimal' },
        body: JSON.stringify({
          post_text: p.post_text, title: p.title, image_url: p.image_url,
          source_hash: p.source_hash, updated_at: new Date().toISOString(),
        }),
      });
      if (r.ok) updated += 1;
      else updateErrors.push(`${p.slug} (${p.language}): ${r.status}`);
    }

    res.json({
      ok: true,
      total: rows.length,
      already_present: rows.length - toInsert.length,
      newly_inserted: inserted.length,
      content_updated: updated,
      untouched_because_reviewed: rows.filter(p => {
        const e = existing.get(`${p.slug}|${p.language}|${p.member}`);
        return e && (e.edited_text || e.status === 'rejected' || (e.status === 'approved' && p.language === 'en'));
      }).length,
      ...(updateErrors.length ? { update_errors: updateErrors.slice(0, 10) } : {}),
    });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
}
