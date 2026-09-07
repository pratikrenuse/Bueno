// GET /api/linkedin-emails
// Dashboard data: team roster + the last 100 email log entries.
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
    const H = { apikey: key, Authorization: `Bearer ${key}` };

    const [mr, er] = await Promise.all([
      fetch(`${url}/rest/v1/team_members?order=name.asc&select=*`, { headers: H }),
      fetch(`${url}/rest/v1/linkedin_emails?order=sent_at.desc&limit=100&select=*`, { headers: H }),
    ]);
    if (!mr.ok) return res.status(500).json({ error: `Supabase members ${mr.status}: ${await mr.text()}` });
    if (!er.ok) return res.status(500).json({ error: `Supabase emails ${er.status}: ${await er.text()}` });
    res.json({ members: await mr.json(), emails: await er.json() });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
}
