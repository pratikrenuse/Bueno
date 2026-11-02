// The one email this surface sends: a short note to Pratik, with John copied, when a
// newsletter has been sorted and stories are waiting in /internal-news.
//
// Self-contained on purpose. The LinkedIn and Facebook surfaces each have their own email
// module and neither is imported here.

const PRATIK = 'pratik.y.renuse@gmail.com';
const JOHN = 'john@getbueno.com';
export const NOTIFY_TO = [PRATIK];
export const NOTIFY_CC = [JOHN];
export const DECK_URL = 'https://www.247spain.es/internal-news';

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

export function notifyBody({ source, subject, kept, dropped }) {
  const list = kept.map(s => `<li style="margin:0 0 6px">${esc(s.title_en || s.title_es)}${s.is_proposal ? ' <span style="color:#8a6d1f">(proposal, not law)</span>' : ''}</li>`).join('');
  return `<div style="font-family:${SANS};font-size:14px;line-height:1.6;color:#010221;max-width:560px">
  <p>Hi Pratik,</p>
  <p>Today's ${esc(source)} email (${esc(subject)}) has been read and translated. ${kept.length} of its ${kept.length + dropped} stories look useful for the WhatsApp channels:</p>
  <ul style="padding-left:20px;margin:0 0 14px">${list}</ul>
  <p>The rest were celebrity homes, ads, company news or stories outside Spain, so they were left out. You can still see them on the page.</p>
  <p>Approve the ones you want and they go into Poornima's daily email as the channel post, one a day, in all six languages.</p>
  <p><a href="${DECK_URL}" style="display:inline-block;background:#010221;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:bold">Review the stories</a></p>
</div>`;
}

export async function notifyNewStories({ source, subject, stories }) {
  const kept = stories.filter(s => s.keep);
  if (!kept.length) return { ok: true, skipped: 'nothing kept' };
  return sendMail({
    to: NOTIFY_TO, cc: NOTIFY_CC,
    subject: `${kept.length} new Spain property ${kept.length === 1 ? 'story' : 'stories'} ready to review`,
    html: notifyBody({ source, subject, kept, dropped: stories.length - kept.length }),
  });
}
