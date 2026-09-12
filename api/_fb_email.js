// The email that carries an approved post to the person who will publish it.
//
// SEPARATE FROM api/_email.js ON PURPOSE
// The LinkedIn program has its own email module with its own recipients, its own call to
// action and its own per-language copy for five team members. None of that belongs here and
// none of it may leak in either direction, so this file duplicates the small amount of
// plumbing it needs rather than importing any of it. The isolation test enforces that a
// file in this surface imports nothing but its own siblings.
//
// WHO GETS WHAT
// One recipient, one copy. Himanshu publishes the post; Pratik is copied on every send so
// he has a record of exactly what left, without having to trust the deck's own display.

const INTERN = 'himanshu1997bisht@gmail.com';
const PRATIK = 'pratik.y.renuse@gmail.com';

export const SEND_TO = [INTERN];
export const SEND_CC = [PRATIK];
export const REPLY_TO = PRATIK;

const LANG_NAME = {
  en: 'English', no: 'Norwegian', sv: 'Swedish',
  de: 'German', fr: 'French', nl: 'Dutch',
};

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// The sender. RESEND_FROM is already set in Vercel for the LinkedIn programme and this
// surface reads the same variable, so there is nothing new to configure.
//
// The fallback matters though. Resend's sandbox sender only delivers to the address that
// owns the Resend account, so if RESEND_FROM were ever unset, a send would come back ok
// from the API and Himanshu would never receive anything. The deck would say "Sent" and be
// wrong, which is the worst possible failure for a queue like this. usingSandboxSender lets
// the send path say so on the card instead.
const SANDBOX_FROM = '24/7 Spain <onboarding@resend.dev>';

export const senderFrom = () => process.env.RESEND_FROM || SANDBOX_FROM;
export const usingSandboxSender = () => !process.env.RESEND_FROM;

export async function sendMail({ to, cc, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: 'Missing env var: RESEND_API_KEY' };
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: senderFrom(),
        to,
        ...(cc && cc.length ? { cc } : {}),
        reply_to: REPLY_TO,
        subject,
        html,
      }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: `Resend ${r.status}: ${JSON.stringify(j).slice(0, 300)}` };
    return { ok: true, id: j.id || null };
  } catch (e) {
    return { ok: false, error: String((e && e.message) || e) };
  }
}

/**
 * The text that must be published, which is the edit where there is one.
 * Nothing is appended to it here. What Pratik approved is what gets sent, character for
 * character, because a post that changes after approval is a post nobody reviewed.
 */
export const finalText = (post) => (post.edited_text && post.edited_text.trim())
  ? post.edited_text.trim()
  : (post.post_text || '').trim();

export function subjectFor(post) {
  const lang = LANG_NAME[post.language] || post.language;
  const hook = (finalText(post).split('\n').find(l => l.trim()) || '').trim();
  const short = hook.length > 62 ? `${hook.slice(0, 62).trimEnd()}...` : hook;
  return `Facebook post to publish (${lang}): ${short}`;
}

export function bodyFor(post) {
  const text = finalText(post);
  const lang = LANG_NAME[post.language] || post.language;
  const instruction = (post.note || '').trim();

  return `
  <div style="background:#F4F2EE;padding:24px 12px;font-family:Georgia,serif">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #E0DFDC">
      <div style="background:#010221;color:#ffffff;padding:16px 22px;font-size:18px;font-weight:bold">
        24<span style="color:#C9A96E">/</span>7 SPAIN<span style="font-weight:normal;font-size:12px;color:#CBEFFF"> &nbsp;Facebook post</span>
      </div>
      <div style="padding:22px">
        <p style="margin:0 0 4px;font-size:15px;color:#010221">Hi Himanshu,</p>
        <p style="margin:0 0 16px;font-size:14px;color:#3a3f52">
          Here is a post to publish. It is in ${esc(lang)}. Please post the text below exactly as it
          is, with the image attached. Do not add hashtags, do not add emojis, and do not change the
          link.
        </p>

        ${instruction ? `
        <div style="background:#CBEFFF;border-radius:10px;padding:13px 15px;margin:0 0 16px;
                    font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;font-size:13px;color:#010221">
          <b>Where to post it</b><br>${esc(instruction)}
        </div>` : `
        <div style="background:#FBF5E7;border-radius:10px;padding:13px 15px;margin:0 0 16px;
                    font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;font-size:13px;color:#010221">
          No group named for this one yet. Please check with Pratik before posting.
        </div>`}

        <p style="margin:0 0 6px;font-size:12px;color:#7a8194;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;
                  text-transform:uppercase;letter-spacing:.06em">The post</p>
        <div style="background:#F8F7F4;border:1px solid #E0DFDC;border-radius:10px;padding:16px;
                    font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;font-size:14px;
                    line-height:1.55;color:#111;white-space:pre-wrap">${esc(text)}</div>

        ${post.image_url ? `
        <p style="margin:18px 0 6px;font-size:12px;color:#7a8194;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;
                  text-transform:uppercase;letter-spacing:.06em">The image</p>
        <img src="${esc(post.image_url)}" alt="" style="width:100%;max-width:100%;border-radius:10px;display:block">
        <p style="margin:8px 0 0;font-size:12px;color:#7a8194;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif">
          Tap and hold, or right click, to save it.
          <a href="${esc(post.image_url)}" style="color:#5B7FCC">Direct link</a>
        </p>` : ''}

        <p style="margin:18px 0 0;font-size:12px;color:#7a8194;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif">
          The link in the post goes to
          <a href="${esc(post.tool_url)}" style="color:#5B7FCC">${esc(post.tool_url)}</a>.
          Open it once before posting to be sure it loads.
        </p>
        <p style="margin:14px 0 0;font-size:12px;color:#7a8194;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif">
          Reply to this email once it is live, with a link to the post. Any question, just ask.
        </p>
      </div>
    </div>
  </div>`;
}

/**
 * Send one post. Returns { ok, id, warning } or { ok: false, error }.
 * A warning is a send that the API accepted but that may not have reached anyone.
 */
export async function sendPost(post) {
  const result = await sendMail({
    to: SEND_TO,
    cc: SEND_CC,
    subject: subjectFor(post),
    html: bodyFor(post),
  });
  if (result.ok && usingSandboxSender()) {
    return {
      ...result,
      warning: 'RESEND_FROM is not set in Vercel, so this went out from the Resend sandbox sender, '
        + 'which only delivers to the address that owns the Resend account. '
        + `${SEND_TO.join(', ')} will not have received it.`,
    };
  }
  return result;
}
