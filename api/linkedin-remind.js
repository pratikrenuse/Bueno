// GET or POST /api/linkedin-remind
// A short, polite nudge to John and Pratik before each posting day. The team posts on
// Tuesdays and Thursdays, so this runs Sunday and Tuesday at 17:00 Barcelona time.
// It says how many posts are waiting for review, how many are approved and queued, and
// warns plainly when the next posting day has nothing ready to go.
// ?force=1 sends it on demand from the dashboard.
import { OVERSIGHT, sendMail, esc, SITE } from './_email.js';

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

    const [pr, mr] = await Promise.all([
      fetch(`${url}/rest/v1/linkedin_posts?language=eq.en&select=slug,title,day,audience,status,sent_at&order=day.asc`, { headers: H }),
      fetch(`${url}/rest/v1/team_members?active=eq.true&select=name,email,stream,language`, { headers: H }),
    ]);
    if (!pr.ok) return res.status(500).json({ error: `Supabase posts ${pr.status}: ${await pr.text()}` });
    if (!mr.ok) return res.status(500).json({ error: `Supabase members ${mr.status}: ${await mr.text()}` });
    const posts = await pr.json();
    const members = (await mr.json()).filter(m => m.email && m.email.includes('@'));

    const pending = posts.filter(p => p.status === 'pending');
    const queued = posts.filter(p => p.status === 'approved' && !p.sent_at);
    const sent = posts.filter(p => p.sent_at);

    // Which day the team posts next, and whether anything is ready for it.
    const dow = new Date().getUTCDay();
    const toTue = (2 - dow + 7) % 7 || 7;
    const toThu = (4 - dow + 7) % 7 || 7;
    const nextDay = toTue <= toThu ? 'Tuesday' : 'Thursday';
    const dayAfter = nextDay === 'Tuesday' ? 'Thursday' : 'Tuesday';

    // Streams that actually have someone to post them.
    const liveStreams = [...new Set(members.map(m => m.stream || 'owners'))];
    const perStream = liveStreams.map(s => ({
      stream: s,
      ready: queued.filter(p => (p.audience || 'owners') === s).length,
      waiting: pending.filter(p => (p.audience || 'owners') === s).length,
      people: members.filter(m => (m.stream || 'owners') === s).length,
    }));
    const emptyNext = perStream.filter(s => s.ready === 0);
    const onlyOne = perStream.filter(s => s.ready === 1);
    const weeks = perStream.length ? Math.floor(Math.min(...perStream.map(s => s.ready)) / 2) : 0;

    const alert = !perStream.length
      ? `<div style="margin:0 0 16px;background:#FAEDED;border:1px solid #E5BDBD;border-radius:10px;padding:12px 14px;font-size:13px;color:#8a1f1f">
           <b>No one is set up to receive posts.</b> The team list has no active member with an email address, so nothing can go out on ${esc(nextDay)}.
         </div>`
      : emptyNext.length
      ? `<div style="margin:0 0 16px;background:#FAEDED;border:1px solid #E5BDBD;border-radius:10px;padding:12px 14px;font-size:13px;color:#8a1f1f">
           <b>Nothing is ready for ${esc(nextDay)}.</b> ${emptyNext.map(s => esc(s.stream)).join(' and ')} ${emptyNext.length === 1 ? 'has' : 'have'} no approved post waiting, so no email will go out that morning. Approving one post is enough to fix it.
         </div>`
      : onlyOne.length
        ? `<div style="margin:0 0 16px;background:#FBF3DF;border:1px solid #E8DCBE;border-radius:10px;padding:12px 14px;font-size:13px;color:#7a611c">
             <b>${esc(nextDay)} is covered, ${esc(dayAfter)} is not.</b> Only one approved post is left, so the team will have nothing for ${esc(dayAfter)} unless another is approved.
           </div>`
        : `<div style="margin:0 0 16px;background:#E8F3E8;border:1px solid #C3DDC3;border-radius:10px;padding:12px 14px;font-size:13px;color:#2e7d32">
             <b>${esc(nextDay)} is covered.</b> ${queued.length} approved posts are queued, roughly ${weeks} week${weeks === 1 ? '' : 's'} of posting.
           </div>`;

    const rows = pending.slice(0, 5).map(p =>
      `<li style="margin-bottom:4px">${esc(p.title || p.slug)} <span style="color:#8a8fa3">(${esc(p.audience || 'owners')}, day ${p.day})</span></li>`
    ).join('');

    const html = `
    <div style="background:#F4F2EE;padding:24px 12px;font-family:Georgia,serif">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #E0DFDC">
        <div style="background:#010221;color:#ffffff;padding:16px 22px;font-size:18px;font-weight:bold">
          24<span style="color:#C9A96E">/</span>7 SPAIN <span style="font-weight:normal;font-size:12px;color:#CBEFFF">review reminder</span>
        </div>
        <div style="padding:22px">
          <p style="margin:0 0 12px;font-size:15px;color:#010221">Hi John, hi Pratik,</p>
          <p style="margin:0 0 16px;font-size:14px;color:#3a3f52">
            A gentle reminder before ${esc(nextDay)}, when the team's next posts go out. No rush, whenever suits you.
          </p>
          ${alert}
          <div style="margin:0 0 18px;font-size:14px;color:#3a3f52">
            <div style="margin-bottom:4px"><b>${pending.length}</b> waiting for review</div>
            <div style="margin-bottom:4px"><b>${queued.length}</b> approved and queued for the team</div>
            <div><b>${sent.length}</b> already sent out</div>
          </div>
          ${pending.length ? `<p style="margin:0 0 6px;font-size:13px;font-weight:bold;color:#010221">Next few up for review</p>
            <ul style="margin:0 0 18px;padding-left:18px;font-size:13px;color:#3a3f52">${rows}</ul>` : ''}
          <p style="margin:0 0 14px">
            <a href="${DECK}" style="display:inline-block;background:#010221;color:#ffffff;text-decoration:none;padding:13px 26px;border-radius:999px;font-size:15px">Open the review deck</a>
          </p>
          <p style="margin:0 0 18px;font-size:13px;color:#5a5f73">
            Password: <b style="font-family:monospace;background:#F4F2EE;padding:2px 7px;border-radius:5px">${esc(process.env.INTERNAL_PASSCODE || '')}</b>
          </p>
          <p style="margin:0;font-size:13px;color:#8a8fa3">
            Approving a post emails it to the two of you only. The team receives the queue automatically on Tuesday and Thursday mornings. Thank you.
          </p>
        </div>
      </div>
    </div>`;

    const subject = !perStream.length
      ? 'No one is set up to receive the posts'
      : emptyNext.length
      ? `Nothing queued for ${nextDay} yet`
      : pending.length
        ? `${pending.length} post${pending.length === 1 ? '' : 's'} waiting for a quick look before ${nextDay}`
        : `${queued.length} posts queued, all set for ${nextDay}`;

    const mail = await sendMail({ to: OVERSIGHT, subject, html });

    await fetch(`${url}/rest/v1/linkedin_emails`, {
      method: 'POST',
      headers: { ...H, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({
        post_title: `Review reminder before ${nextDay}`,
        member_name: 'Review reminder (John + Pratik)', member_email: OVERSIGHT.join(', '),
        status: mail.ok ? 'sent' : 'failed', error: mail.ok ? null : mail.error, resend_id: mail.id || null,
      }),
    });

    res.json({
      ok: mail.ok, next_posting_day: nextDay, pending: pending.length,
      approved_unsent: queued.length, sent: sent.length,
      streams: perStream, ...(mail.ok ? {} : { error: mail.error }),
    });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
}
