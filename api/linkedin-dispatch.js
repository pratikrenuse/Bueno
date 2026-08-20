// GET or POST /api/linkedin-dispatch
// The daily send: for each stream, takes the next APPROVED post not yet sent and emails it
// (ready to copy) to that stream's active team members. Runs weekdays 15:00 UTC via Vercel
// cron, and manually from the dashboard's "Send now" button.
// ?dry=1 previews what would be sent without sending anything.
// Auth: team passcode (header/query), CRON_SECRET bearer if configured, or Vercel cron itself.

const SITE = 'https://247spain.es';

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
    const resendKey = process.env.RESEND_API_KEY;
    if (!url) return res.status(500).json({ error: 'Missing env var: SUPABASE_URL (or VITE_SUPABASE_URL)' });
    if (!key) return res.status(500).json({ error: 'Missing env var: SUPABASE_SERVICE_KEY. Add it in Vercel and redeploy.' });
    const dry = req.query.dry === '1';
    if (!resendKey && !dry) return res.status(500).json({ error: 'Missing env var: RESEND_API_KEY. Add it in Vercel and redeploy.' });
    const from = process.env.RESEND_FROM || '24/7 Spain <onboarding@resend.dev>';
    const H = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };

    const mr = await fetch(`${url}/rest/v1/team_members?active=eq.true&order=name.asc&select=*`, { headers: H });
    if (!mr.ok) return res.status(500).json({ error: `Supabase members ${mr.status}: ${await mr.text()}` });
    const members = (await mr.json()).filter(m => m.email && m.email.includes('@'));

    const results = [];
    for (const stream of ['owners', 'agents', 'attorneys']) {
      const streamMembers = members.filter(m => (m.stream || 'owners') === stream);
      if (!streamMembers.length) { results.push({ stream, skipped: 'no members with email' }); continue; }

      const pr = await fetch(
        `${url}/rest/v1/linkedin_posts?status=eq.approved&sent_at=is.null&audience=eq.${stream}&language=eq.en&order=day.asc&limit=1&select=*`,
        { headers: H });
      if (!pr.ok) return res.status(500).json({ error: `Supabase posts ${pr.status}: ${await pr.text()}` });
      const post = (await pr.json())[0];
      if (!post) { results.push({ stream, skipped: 'no approved unsent posts' }); continue; }

      if (dry) { results.push({ stream, would_send: post.title, day: post.day, to: streamMembers.map(m => m.name) }); continue; }

      const text = post.edited_text || post.post_text;
      let sent = 0, failed = 0;
      for (const m of streamMembers) {
        let status = 'sent', error = null, resendId = null;
        try {
          const er = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from,
              to: [m.email],
              subject: `Your LinkedIn post for tomorrow: ${post.title}`,
              html: emailHtml(m.name, post, text),
            }),
          });
          const ej = await er.json().catch(() => ({}));
          if (!er.ok) { status = 'failed'; error = `Resend ${er.status}: ${JSON.stringify(ej).slice(0, 300)}`; }
          else resendId = ej.id || null;
        } catch (e) { status = 'failed'; error = String((e && e.message) || e); }

        await fetch(`${url}/rest/v1/linkedin_emails`, {
          method: 'POST',
          headers: { ...H, Prefer: 'return=minimal' },
          body: JSON.stringify({
            post_id: post.id, post_slug: post.slug, post_title: post.title,
            member_name: m.name, member_email: m.email, status, error, resend_id: resendId,
          }),
        });
        if (status === 'sent') sent += 1; else failed += 1;
      }

      if (sent > 0) {
        await fetch(`${url}/rest/v1/linkedin_posts?id=eq.${post.id}`, {
          method: 'PATCH', headers: { ...H, Prefer: 'return=minimal' },
          body: JSON.stringify({ sent_at: new Date().toISOString() }),
        });
      }
      results.push({ stream, post: post.title, day: post.day, sent, failed });
    }

    res.json({ ok: true, dry, results });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function emailHtml(name, post, text) {
  const img = post.image_url
    ? `<p style="margin:18px 0 6px;font-size:13px;color:#5a5f73">Attach this image to the post (tap and hold / right click to save):</p>
       <img src="${SITE}${post.image_url}" alt="" style="width:100%;max-width:520px;border-radius:10px;display:block" />`
    : '';
  return `
  <div style="background:#F4F2EE;padding:24px 12px;font-family:Georgia,serif">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #E0DFDC">
      <div style="background:#010221;color:#ffffff;padding:16px 22px;font-size:18px;font-weight:bold">
        24<span style="color:#C9A96E">/</span>7 SPAIN
      </div>
      <div style="padding:22px">
        <p style="margin:0 0 4px;font-size:15px;color:#010221">Hi ${esc(name)},</p>
        <p style="margin:0 0 16px;font-size:14px;color:#3a3f52">Here is your LinkedIn post for tomorrow. Copy the text below, adapt it to your language and voice if you like, attach the image, and post.</p>
        <div style="background:#F8F7F4;border:1px solid #E0DFDC;border-radius:10px;padding:16px;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;font-size:14px;line-height:1.5;color:#111;white-space:pre-wrap">${esc(text)}</div>
        ${img}
        <p style="margin:18px 0 0;font-size:13px;color:#5a5f73">Day ${post.day} of the plan. Questions or edits: just reply to this email.</p>
      </div>
    </div>
  </div>`;
}
