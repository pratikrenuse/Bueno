// POST /api/linkedin-translate   { slug?, audience?, scope? }
// Regenerates translations that are missing or stale (the English master changed since
// they were made). Scope "approved" (default) covers every approved English post;
// pass a slug to refresh just one. Safe to run repeatedly: rows already matching the
// current English text are skipped.
import { syncTranslations, LANGS, getApiKey } from './_translate.js';

export default async function handler(req, res) {
  try {
    const pass = req.headers['x-passcode'] || req.query.pass;
    if (pass !== process.env.INTERNAL_PASSCODE) {
      return res.status(401).json({ error: 'unauthorized' });
    }
    const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
    const key = process.env.SUPABASE_SERVICE_KEY;
    const apiKey = getApiKey();
    if (!url) return res.status(500).json({ error: 'Missing env var: SUPABASE_URL (or VITE_SUPABASE_URL)' });
    if (!key) return res.status(500).json({ error: 'Missing env var: SUPABASE_SERVICE_KEY. Add it in Vercel and redeploy.' });
    if (!apiKey) return res.status(500).json({ error: 'Missing env var: ANTHROPIC_API_KEY. Add it in Vercel and redeploy, then translations can refresh automatically.' });
    const H = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };

    const body = req.body || {};
    const slug = body.slug || req.query.slug;
    const limit = Math.min(Number(body.limit || req.query.limit || 8), 20);

    // Which languages the active team actually needs.
    const mr = await fetch(`${url}/rest/v1/team_members?active=eq.true&select=language,stream,email`, { headers: H });
    if (!mr.ok) return res.status(500).json({ error: `Supabase members ${mr.status}: ${await mr.text()}` });
    const members = (await mr.json()).filter(m => m.email && m.email.includes('@'));
    const langs = [...new Set(members.map(m => m.language || 'en'))].filter(l => l !== 'en' && LANGS[l]);
    if (!langs.length) return res.json({ ok: true, note: 'No non-English team languages configured, nothing to translate.' });

    let q = `${url}/rest/v1/linkedin_posts?language=eq.en&select=*&order=day.asc`;
    if (slug) q += `&slug=eq.${encodeURIComponent(slug)}`;
    else q += `&status=eq.approved&limit=${limit}`;
    const pr = await fetch(q, { headers: H });
    if (!pr.ok) return res.status(500).json({ error: `Supabase posts ${pr.status}: ${await pr.text()}` });
    const posts = await pr.json();

    const results = [];
    for (const post of posts) {
      const streamLangs = [...new Set(members
        .filter(m => (m.stream || 'owners') === post.audience)
        .map(m => m.language || 'en'))].filter(l => l !== 'en' && LANGS[l]);
      if (!streamLangs.length) continue;
      const r = await syncTranslations({ apiKey, url, headers: H, post, langs: streamLangs });
      if (r.updated.length || r.failed.length) {
        results.push({ slug: post.slug, day: post.day, audience: post.audience, ...r });
      }
    }

    res.json({
      ok: true,
      posts_checked: posts.length,
      refreshed: results.reduce((n, r) => n + r.updated.length, 0),
      failures: results.reduce((n, r) => n + r.failed.length, 0),
      results,
    });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
}
