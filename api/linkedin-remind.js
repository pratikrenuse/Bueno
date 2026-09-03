// GET or POST /api/linkedin-remind
// Nudges John to review before a posting day. The team posts Tuesdays and Thursdays, so
// this runs Sunday evening (read Monday morning, for Tuesday's post) and Tuesday evening
// (for Thursday's post). It only writes an email when something actually needs attention,
// unless ?force=1 is passed.
import { OVERSIGHT, sendMail, shell, esc, SITE } from './_email.js';

const DECK = `${SITE}/internal-linkedin`;

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
    const H = { apikey: key, Authorization: `Bearer ${key}` };
    const force = req.query.force === '1';

    const pr = await fetch(`${url}/rest/v1/linkedin_posts?language=eq.en&select=slug,title,day,audience,status,sent_at&order=day.asc`, { headers: H });
    if (!pr.ok) return res.status(500).json({ error: `Supabase posts ${pr.status}: ${await pr.text()}` });
    const posts = await pr.json();

    const pending = posts.filter(p => p.status === 'pending');
    const readyToSend = posts.filter(p => p.status === 'approved' && !p.sent_at);
    const sent = posts.filter(p => p.sent_at);

    // The next posting day, so the reminder can name it.
    const now = new Date();
    const dow = now.getUTCDay(); // 0 Sun ... 6 Sat
    const daysToTue = (2 - dow + 7) % 7 || 7;
    const daysToThu = (4 - dow + 7) % 7 || 7;
    const nextDay = daysToTue <= daysToThu ? 'Tuesday' : 'Thursday';

    // Nothing to nudge about: everything reviewed and the team already has posts in hand.
    if (!force && pending.length === 0 && readyToSend.length === 0) {
      return res.json({ ok: true, skipped: 'nothing pending to review and nothing waiting to send' });
    }

    const nextUp = pending.slice(0, 5);
    const rows = nextUp.map(p =>
      `<li style="margin-bottom:4px">${esc(p.title || p.slug)} <span style="color:#8a8fa3">(${esc(p.audience || 'owners')}, day ${p.day})</span></li>`
    ).join('');

    const html = shell({
      heading: 'review reminder',
      greeting: 'Hi John,',
      intro: `The team posts on ${nextDay}. Here is where the queue stands.`,
      notice: `<div style="margin:0 0 16px;font-size:13px;color:#3a3f52;background:#F8F7F4;border:1px solid #E0DFDC;border-radius:10px;padding:12px 14px">
          <div style="margin-bottom:4px"><b>${pending.length}</b> post${pending.length === 1 ? '' : 's'} waiting for your review.</div>
          <div style="margin-bottom:4px"><b>${readyToSend.length}</b> approved but not yet emailed to the team.</div>
          <div><b>${sent.length}</b> already sent out so far.</div>
        </div>
        ${pending.length ? `<p style="margin:0 0 6px;font-size:13px;font-weight:bold;color:#010221">Next up for review</p>
          <ul style="margin:0 0 16px;padding-left:18px;font-size:13px;color:#3a3f52">${rows}</ul>` : ''}
        <p style="margin:0 0 18px"><a href="${DECK}" style="display:inline-block;background:#010221;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:14px">Open the review deck</a></p>`,
      body: pending.length
        ? `Approving a post sends it to the whole team immediately, each person in their own language, with the image attached. So approve when you are happy for them to have it, and they will publish on ${nextDay}.`
        : `Nothing is waiting on you right now. The team has ${readyToSend.length} approved post${readyToSend.length === 1 ? '' : 's'} in hand for ${nextDay}.`,
    });

    const mail = await sendMail({
      to: ['john@getbueno.com'],
      cc: OVERSIGHT.filter(a => a !== 'john@getbueno.com'),
      subject: pending.length
        ? `${pending.length} LinkedIn post${pending.length === 1 ? '' : 's'} waiting for review before ${nextDay}`
        : `LinkedIn queue check before ${nextDay}`,
      html,
    });

    await fetch(`${url}/rest/v1/linkedin_emails`, {
      method: 'POST',
      headers: { ...H, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({
        post_title: `Review reminder before ${nextDay}`,
        member_name: 'Review reminder (John)', member_email: 'john@getbueno.com',
        status: mail.ok ? 'sent' : 'failed', error: mail.ok ? null : mail.error, resend_id: mail.id || null,
      }),
    });

    res.json({ ok: mail.ok, next_posting_day: nextDay, pending: pending.length, approved_unsent: readyToSend.length, sent: sent.length, ...(mail.ok ? {} : { error: mail.error }) });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
}
