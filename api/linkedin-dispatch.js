// GET or POST /api/linkedin-dispatch
// The team send. Runs Tuesday and Thursday at 06:00 UTC, which is 08:00 in Barcelona
// during summer time, and takes the oldest approved post that has not been sent yet from
// each stream's backlog. Members receive it in their own language, to post that day, with
// Pratik and John cc'd. Also available on demand from the dashboard's Send now button.
//   ?member=Name  sends to that one person only
//   ?dry=1        reports what would be sent without sending
// Auth: team passcode (header or query), CRON_SECRET bearer if configured, or Vercel cron.

import { getApiKey } from './_translate.js';
import { OVERSIGHT } from './_email.js';
import { sendPostToTeam } from './_dispatch.js';

export default async function handler(req, res) {
  try {
    const pass = req.headers['x-passcode'] || req.query.pass;
    const auth = req.headers['authorization'] || '';
    const isCron = !!req.headers['x-vercel-cron'] || (req.headers['user-agent'] || '').startsWith('vercel-cron');
    const cronOk = process.env.CRON_SECRET ? auth === `Bearer ${process.env.CRON_SECRET}` : isCron;
    if (pass !== process.env.INTERNAL_PASSCODE && !cronOk) {
      return res.status(401).json({ error: 'unauthorized' });
    }
    const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url) return res.status(500).json({ error: 'Missing env var: SUPABASE_URL (or VITE_SUPABASE_URL)' });
    if (!key) return res.status(500).json({ error: 'Missing env var: SUPABASE_SERVICE_KEY. Add it in Vercel and redeploy.' });
    const dry = req.query.dry === '1';
    if (!process.env.RESEND_API_KEY && !dry) {
      return res.status(500).json({ error: 'Missing env var: RESEND_API_KEY. Add it in Vercel and redeploy.' });
    }
    const H = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };

    const mr = await fetch(`${url}/rest/v1/team_members?active=eq.true&order=name.asc&select=*`, { headers: H });
    if (!mr.ok) return res.status(500).json({ error: `Supabase members ${mr.status}: ${await mr.text()}` });
    let members = (await mr.json()).filter(m => m.email && m.email.includes('@'));

    // ?member=Name sends to that one person only. Default: everyone.
    const only = (req.body && req.body.member) || req.query.member;
    if (only && only !== 'all') {
      members = members.filter(m => m.name.toLowerCase() === String(only).toLowerCase());
      if (!members.length) return res.status(400).json({ error: `No active team member with an email named "${only}".` });
    }

    const results = [];
    for (const stream of ['owners', 'agents', 'attorneys']) {
      const streamMembers = members.filter(m => (m.stream || 'owners') === stream);
      if (!streamMembers.length) { results.push({ stream, skipped: 'no members with an email on this stream' }); continue; }

      const pr = await fetch(
        `${url}/rest/v1/linkedin_posts?status=eq.approved&sent_at=is.null&audience=eq.${stream}&language=eq.en&order=day.asc&limit=1&select=*`,
        { headers: H });
      if (!pr.ok) return res.status(500).json({ error: `Supabase posts ${pr.status}: ${await pr.text()}` });
      const post = (await pr.json())[0];
      if (!post) { results.push({ stream, skipped: 'nothing approved and unsent, the team already has everything' }); continue; }

      if (dry) {
        results.push({ stream, would_send: post.title, day: post.day, to: streamMembers.map(m => `${m.name} (${m.language || 'en'})`) });
        continue;
      }

      results.push(await sendPostToTeam({ url, headers: H, post, members: streamMembers, anthropicKey: getApiKey() }));
    }

    res.json({ ok: true, dry, cc: OVERSIGHT.join(', '), ...(only && only !== 'all' ? { sent_to_only: only } : {}), results });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
}
