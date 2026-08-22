// GET /api/linkedin-health?pass=...
// One call that answers "is this thing actually ready?": env vars present, database
// reachable and migrated, content seeded, roster complete, translations current.
// Read-only. Sends no email and spends no API credit.
import { getApiKey, LANGS } from './_translate.js';

export default async function handler(req, res) {
  try {
    const pass = req.headers['x-passcode'] || req.query.pass;
    if (pass !== process.env.INTERNAL_PASSCODE) {
      return res.status(401).json({ error: 'unauthorized' });
    }
    const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
    const key = process.env.SUPABASE_SERVICE_KEY;
    const checks = [];
    const add = (name, ok, detail) => checks.push({ name, ok, detail });

    add('SUPABASE_URL', !!url, url ? 'set' : 'missing');
    add('SUPABASE_SERVICE_KEY', !!key, key ? 'set' : 'missing');
    add('RESEND_API_KEY', !!process.env.RESEND_API_KEY, process.env.RESEND_API_KEY ? 'set' : 'missing, emails cannot send');
    add('RESEND_FROM', !!process.env.RESEND_FROM,
      process.env.RESEND_FROM || 'not set, would fall back to the Resend sandbox sender which only reaches the account owner');
    add('Claude API key', !!getApiKey(), getApiKey() ? 'set, translations refresh automatically' : 'missing, edited posts would send with a warning instead of an updated translation');

    if (!url || !key) return res.json({ ready: false, checks });
    const H = { apikey: key, Authorization: `Bearer ${key}` };

    const pr = await fetch(`${url}/rest/v1/linkedin_posts?select=slug,language,audience,status,sent_at,source_hash,post_text,edited_text&limit=2000`, { headers: H });
    if (!pr.ok) {
      add('linkedin_posts table', false, `Supabase ${pr.status}: ${(await pr.text()).slice(0, 200)}`);
      return res.json({ ready: false, checks });
    }
    const posts = await pr.json();
    const en = posts.filter(p => p.language === 'en');
    const tr = posts.filter(p => p.language !== 'en');
    add('linkedin_posts table', true, `${posts.length} rows`);
    add('English masters seeded', en.length > 0, `${en.length} posts (${en.filter(p => p.status === 'approved').length} approved, ${en.filter(p => p.status === 'pending').length} pending)`);
    add('audience column', posts.every(p => p.audience), posts.every(p => p.audience) ? 'present' : 'missing on some rows, run the migration');
    add('source_hash column', posts.some(p => 'source_hash' in p), 'present');

    const mr = await fetch(`${url}/rest/v1/team_members?select=*`, { headers: H });
    if (!mr.ok) {
      add('team_members table', false, `Supabase ${mr.status}: ${(await mr.text()).slice(0, 200)}. Run the migration in studio/linkedin_schema.sql.`);
      return res.json({ ready: false, checks });
    }
    const members = await mr.json();
    const active = members.filter(m => m.active !== false);
    const withEmail = active.filter(m => m.email && m.email.includes('@'));
    add('team_members table', true, `${members.length} members`);
    add('every active member has an email', withEmail.length === active.length,
      withEmail.length === active.length ? 'yes' : `missing for: ${active.filter(m => !m.email).map(m => m.name).join(', ')}`);

    const er = await fetch(`${url}/rest/v1/linkedin_emails?select=id&limit=1`, { headers: H });
    add('linkedin_emails table', er.ok, er.ok ? 'present' : `Supabase ${er.status}, run the migration`);

    // Translation coverage for the languages the team actually needs, per stream.
    const gaps = [];
    for (const stream of ['owners', 'agents', 'attorneys']) {
      const langs = [...new Set(withEmail.filter(m => (m.stream || 'owners') === stream).map(m => m.language || 'en'))]
        .filter(l => l !== 'en' && LANGS[l]);
      if (!langs.length) continue;
      const masters = en.filter(p => p.audience === stream && p.status === 'approved');
      for (const m of masters) {
        for (const lang of langs) {
          const t = tr.find(x => x.slug === m.slug && x.language === lang && x.audience === stream);
          if (!t) gaps.push(`${m.slug} (${lang}): missing`);
        }
      }
    }
    add('translations for approved posts', gaps.length === 0,
      gaps.length === 0 ? 'complete, or will be generated automatically at send time' : `${gaps.length} to generate: ${gaps.slice(0, 6).join('; ')}${gaps.length > 6 ? ' and more' : ''}`);

    const queued = en.filter(p => p.status === 'approved' && !p.sent_at);
    add('posts queued to send', queued.length > 0,
      queued.length > 0 ? `${queued.length} approved and unsent` : 'none yet, approve a post in the review deck');

    res.json({ ready: checks.every(c => c.ok), checks });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
}
