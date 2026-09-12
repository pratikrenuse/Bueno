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

// Himanshu reads two mailboxes, so both are on every send. Gmail local parts are case
// insensitive, so these are stored lower case regardless of how they were written down.
import { TRANSLATION_LANGS, LANG_NAME, linkFor } from './_fb_content.js';

const HIMANSHU = ['himanshu1997bisht@gmail.com', 'himanshubisht1407@gmail.com'];
const PRATIK = 'pratik.y.renuse@gmail.com';

export const SEND_TO = HIMANSHU;
export const SEND_CC = [PRATIK];
export const REPLY_TO = PRATIK;

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
  const hook = (finalText(post).split('\n').find(l => l.trim()) || '').trim();
  const short = hook.length > 70 ? `${hook.slice(0, 70).trimEnd()}...` : hook;
  return `Facebook post to publish: ${short}`;
}

const block = (heading, langLabel, text, link) => `
        <p style="margin:22px 0 6px;font-size:12px;color:#7a8194;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;
                  text-transform:uppercase;letter-spacing:.06em">${esc(heading)}</p>
        <div style="background:#F8F7F4;border:1px solid #E0DFDC;border-radius:10px;padding:16px;
                    font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;font-size:14px;
                    line-height:1.55;color:#111;white-space:pre-wrap">${esc(text)}</div>
        <p style="margin:6px 0 0;font-size:11.5px;color:#7a8194;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif">
          ${esc(langLabel)} groups. The link in this version goes to
          <a href="${esc(link)}" style="color:#5B7FCC">${esc(link)}</a>
        </p>`;

/**
 * The whole envelope: the English post and its five translations, one image, one instruction.
 *
 * WHY ALL SIX ARE IN ONE EMAIL
 * They are one post. Sending six emails would mean six things to keep straight, six subject
 * lines that look almost identical in an inbox, and a real chance of the German going into a
 * Swedish group. One email, six clearly labelled blocks, one image at the top.
 */
export function bodyFor(post) {
  const english = finalText(post);
  const instruction = (post.note || '').trim();
  const translations = post.translations || {};
  const available = TRANSLATION_LANGS.filter(l => translations[l] && String(translations[l]).trim());

  return `
  <div style="background:#F4F2EE;padding:24px 12px;font-family:Georgia,serif">
    <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #E0DFDC">
      <div style="background:#010221;color:#ffffff;padding:16px 22px;font-size:18px;font-weight:bold">
        24<span style="color:#C9A96E">/</span>7 SPAIN<span style="font-weight:normal;font-size:12px;color:#CBEFFF"> &nbsp;Facebook post</span>
      </div>
      <div style="padding:22px">
        <p style="margin:0 0 4px;font-size:15px;color:#010221">Hi Himanshu,</p>
        <p style="margin:0 0 16px;font-size:14px;color:#3a3f52">
          Here is one post, written out in ${esc(String(available.length + 1))} languages. Same post, same image,
          one version per language. Post each version in groups that speak that language. Please use
          the text exactly as it is: no hashtags, no emojis, and do not change the links, because
          each language links to its own page.
        </p>

        ${instruction ? `
        <div style="background:#CBEFFF;border-radius:10px;padding:13px 15px;margin:0 0 16px;
                    font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;font-size:13px;color:#010221">
          <b>From Pratik</b><br>${esc(instruction)}
        </div>` : `
        <div style="background:#FBF5E7;border-radius:10px;padding:13px 15px;margin:0 0 16px;
                    font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;font-size:13px;color:#010221">
          No groups named for this one yet. Please check with Pratik before posting.
        </div>`}

        ${post.image_url ? `
        <p style="margin:0 0 6px;font-size:12px;color:#7a8194;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;
                  text-transform:uppercase;letter-spacing:.06em">The image, for every language</p>
        <img src="${esc(post.image_url)}" alt="" style="width:100%;max-width:100%;border-radius:10px;display:block">
        <p style="margin:8px 0 0;font-size:12px;color:#7a8194;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif">
          Tap and hold, or right click, to save it.
          <a href="${esc(post.image_url)}" style="color:#5B7FCC">Direct link</a>
        </p>` : ''}

        ${block('1. English', 'English speaking', english, post.tool_url)}
        ${available.map((lang, i) =>
          block(`${i + 2}. ${LANG_NAME[lang]}`, LANG_NAME[lang], String(translations[lang]).trim(), linkFor(post.tool_slug, lang))
        ).join('')}

        <p style="margin:24px 0 0;font-size:12px;color:#7a8194;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif">
          Open each link once before posting, just to be sure it loads. Reply to this email as you
          go, with a link to each post. Any question at all, just ask.
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
