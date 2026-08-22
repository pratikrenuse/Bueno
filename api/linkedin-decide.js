// POST /api/linkedin-decide
//   { id, action: "approved" | "rejected" | "pending", comment? }  -> status change (pending = undo)
//   { id, action: "edit", text }                                   -> saves edited_text only, status untouched
// Approving also emails the post straight to Pratik and John so they see what was approved
// the moment it happens. The team's own send still runs through /api/linkedin-dispatch.
import { OVERSIGHT, sendMail, shell, imageBlock } from './_email.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });
    if (req.headers['x-passcode'] !== process.env.INTERNAL_PASSCODE) {
      return res.status(401).json({ error: 'unauthorized' });
    }
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url) return res.status(500).json({ error: 'Missing env var: SUPABASE_URL (or VITE_SUPABASE_URL)' });
    if (!key) return res.status(500).json({ error: 'Missing env var: SUPABASE_SERVICE_KEY. Add it in Vercel and redeploy.' });

    const { id, action, comment, text } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id required' });

    let patch;
    if (action === 'edit') {
      if (typeof text !== 'string' || !text.trim()) return res.status(400).json({ error: 'edit needs text' });
      patch = { edited_text: text, updated_at: new Date().toISOString() };
    } else if (['approved', 'rejected', 'pending'].includes(action)) {
      if (action === 'rejected' && !comment) return res.status(400).json({ error: 'rejection needs a comment' });
      patch = {
        status: action,
        reject_comment: action === 'rejected' ? comment : null,
        decided_at: action === 'pending' ? null : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } else {
      return res.status(400).json({ error: 'valid action required (approved, rejected, pending, edit)' });
    }

    const r = await fetch(`${url.replace(/\/$/, '')}/rest/v1/linkedin_posts?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(patch),
    });
    if (!r.ok) return res.status(500).json({ error: `Supabase ${r.status}: ${await r.text()}` });

    // On approval, send the oversight copy immediately.
    let notified = null;
    if (action === 'approved') {
      const base = url.replace(/\/$/, '');
      const H = { apikey: key, Authorization: `Bearer ${key}` };
      const pr = await fetch(`${base}/rest/v1/linkedin_posts?id=eq.${encodeURIComponent(id)}&select=*`, { headers: H });
      const post = pr.ok ? (await pr.json())[0] : null;
      if (post) {
        const body = post.edited_text || post.post_text;
        const streamName = { owners: 'property owners', agents: 'estate agents', attorneys: 'legal advisers' }[post.audience || 'owners'] || post.audience;
        const mail = await sendMail({
          to: OVERSIGHT,
          subject: `Approved for the team: ${post.title || post.slug} (day ${post.day})`,
          html: shell({
            heading: 'review deck',
            greeting: 'A post was just approved.',
            intro: `This is a notification for you and John only. Nothing has gone to the team yet.`,
            notice: `<div style="margin:0 0 16px;font-size:13px;color:#3a3f52;background:#F8F7F4;border:1px solid #E0DFDC;border-radius:10px;padding:12px 14px">
                <div style="margin-bottom:4px"><b>What this is:</b> post day ${post.day} of the series written for ${streamName}.</div>
                <div style="margin-bottom:4px"><b>What happens next:</b> it goes to the team on the next send, weekdays at 15:00 UTC, or immediately if you press Send now in the dashboard.</div>
                <div><b>What they receive:</b> this exact post, translated into each member's own language, with the image attached and you and John on copy.</div>
              </div>
              <p style="margin:0 0 6px;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#5B7FCC">The approved post</p>`,
            body,
            footer: imageBlock(post.image_url, 'Image that goes out with this post:')
              + `<p style="margin:18px 0 0;font-size:13px;color:#5a5f73">Spotted a problem? Open the review deck, press Undo on this post, and edit it. Translations update themselves before the send.</p>`,
          }),
        });
        notified = mail.ok ? 'sent' : mail.error;
        await fetch(`${base}/rest/v1/linkedin_emails`, {
          method: 'POST',
          headers: { ...H, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
          body: JSON.stringify({
            post_id: post.id, post_slug: post.slug, post_title: post.title,
            member_name: 'Approval notice (Pratik + John)', member_email: OVERSIGHT.join(', '),
            status: mail.ok ? 'sent' : 'failed', error: mail.ok ? null : mail.error, resend_id: mail.id || null,
          }),
        });
      }
    }

    res.json({ ok: true, ...(notified ? { approval_email: notified } : {}) });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
}
