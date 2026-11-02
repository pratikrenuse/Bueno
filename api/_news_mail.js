// The one email this surface sends: a short note to Pratik, with John copied, when a
// newsletter has been sorted and stories are waiting in /internal-news.
//
// Self-contained on purpose. The LinkedIn and Facebook surfaces each have their own email
// module and neither is imported here.

const PRATIK = 'pratik.y.renuse@gmail.com';
const JOHN = 'john@getbueno.com';
// To Pratik with John in CC on every email (Pratik, 2 Nov 2026).
export const NOTIFY_TO = [PRATIK];
export const NOTIFY_CC = [JOHN];

const SANS = 'Arial,Helvetica,sans-serif';
export const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export async function sendMail({ to, cc, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: 'Missing env var: RESEND_API_KEY' };
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || '24/7 Spain <onboarding@resend.dev>',
        to, cc, subject, html, reply_to: PRATIK,
      }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: `Resend ${r.status}: ${JSON.stringify(j).slice(0, 300)}` };
    return { ok: true, id: j.id };
  } catch (e) {
    return { ok: false, error: `Resend request failed: ${String((e && e.message) || e)}` };
  }
}

// The email carries the stories themselves. No link and no button: everything is in the email.
export function notifyBody({ source, subject, kept, dropped, note = '' }) {
  const stories = kept.map(s => `
    <div style="border-top:1px solid #E0DFDC;padding:12px 0">
      <p style="margin:0 0 4px;font-weight:bold">${esc(s.title_en || s.title_es)}${s.is_proposal ? ' <span style="color:#8a6d1f;font-weight:normal">(proposal, not law)</span>' : ''}</p>
      <p style="margin:0">${esc(s.en)}</p>
    </div>`).join('');
  const intro = kept.length
    ? `Today's ${esc(source)} email has come in. ${kept.length} of its ${kept.length + dropped} stories are useful for people who own a home in Spain, and here they are in English. The rest were adverts, celebrity homes, company news or stories from outside Spain.`
    : `Today's ${esc(source)} email has come in, but none of its ${dropped} stories is useful for people who own a home in Spain.`;
  return `<div style="font-family:${SANS};font-size:14px;line-height:1.6;color:#010221;max-width:560px">
  <p>Hi,</p>
  ${note ? `<p>${esc(note)}</p>` : ''}
  <p>${intro}</p>
  ${stories}
  <p style="color:#5a5f78;font-size:12.5px;margin-top:16px">From the ${esc(source)} email "${esc(subject)}".</p>
</div>`;
}

export async function notifyNewStories({ source, subject, stories, note = '' }) {
  const kept = stories.filter(s => s.keep);
  return sendMail({
    to: NOTIFY_TO,
    cc: NOTIFY_CC,
    subject: kept.length
      ? `idealista today: ${kept.length} useful ${kept.length === 1 ? 'story' : 'stories'} for owners in Spain`
      : 'idealista today: nothing useful for owners in Spain',
    html: notifyBody({ source, subject, kept, dropped: stories.length - kept.length, note }),
  });
}
