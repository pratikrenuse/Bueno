// Shared email plumbing for the LinkedIn program.
export const OVERSIGHT = ['pratik.y.renuse@gmail.com', 'john@getbueno.com'];
export const REPLY_TO = 'pratik.y.renuse@gmail.com';
export const SITE = 'https://247spain.es';

export const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const senderFrom = () => process.env.RESEND_FROM || '24/7 Spain <onboarding@resend.dev>';

export async function sendMail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: 'Missing env var: RESEND_API_KEY' };
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: senderFrom(), to, reply_to: REPLY_TO, subject, html }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: `Resend ${r.status}: ${JSON.stringify(j).slice(0, 300)}` };
    return { ok: true, id: j.id || null };
  } catch (e) {
    return { ok: false, error: String((e && e.message) || e) };
  }
}

// The card layout used by every email in this program.
export function shell({ heading, greeting, intro, notice = '', body, footer = '' }) {
  return `
  <div style="background:#F4F2EE;padding:24px 12px;font-family:Georgia,serif">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #E0DFDC">
      <div style="background:#010221;color:#ffffff;padding:16px 22px;font-size:18px;font-weight:bold">
        24<span style="color:#C9A96E">/</span>7 SPAIN${heading ? `<span style="font-weight:normal;font-size:12px;color:#CBEFFF"> ${esc(heading)}</span>` : ''}
      </div>
      <div style="padding:22px">
        ${greeting ? `<p style="margin:0 0 4px;font-size:15px;color:#010221">${esc(greeting)}</p>` : ''}
        ${intro ? `<p style="margin:0 0 16px;font-size:14px;color:#3a3f52">${esc(intro)}</p>` : ''}
        ${notice}
        <div style="background:#F8F7F4;border:1px solid #E0DFDC;border-radius:10px;padding:16px;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;font-size:14px;line-height:1.5;color:#111;white-space:pre-wrap">${esc(body)}</div>
        ${footer}
      </div>
    </div>
  </div>`;
}

export const imageBlock = (imageUrl, label = 'Attach this image to the post (tap and hold or right click to save):') =>
  imageUrl
    ? `<p style="margin:18px 0 6px;font-size:13px;color:#5a5f73">${esc(label)}</p>
       <img src="${SITE}${imageUrl}" alt="" style="width:100%;max-width:520px;border-radius:10px;display:block" />`
    : '';
