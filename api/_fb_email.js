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
// One recipient, one copy. Poornima publishes the post; Pratik is copied on every send so
// he has a record of exactly what left, without having to trust the deck's own display.
//
// WHAT ONE EMAIL IS
// One post, on one day, in seven languages. Each language has its own Facebook account,
// numbered 1 to 7, and its own short list of groups for that day, and both are printed
// right under that language's text so nothing has to be looked up anywhere else.

// Poornima took over publishing from Himanshu in October 2026. The address is stored lower
// case, because Gmail local parts are case insensitive.
import { TRANSLATION_LANGS, LANG_NAME, LANGS, linkFor } from './_fb_content.js';
import { ACCOUNT, groupsFor } from './_fb_groups.js';

const POORNIMA = ['poornimanirwal@gmail.com'];
const PRATIK = 'pratik.y.renuse@gmail.com';

export const SEND_TO = POORNIMA;
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
// from the API and Poornima would never receive anything. The deck would say "Sent" and be
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

export function subjectFor(post, day) {
  const hook = (finalText(post).split('\n').find(l => l.trim()) || '').trim();
  const short = hook.length > 60 ? `${hook.slice(0, 60).trimEnd()}...` : hook;
  return `${day ? `Day ${day}. ` : ''}Facebook post to publish: ${short}`;
}

// Every language's groups for one day, in the order the email prints them. The dispatcher
// uses this for its dry run, so what it reports is exactly what the email would carry.
export function groupsToday(day) {
  return LANGS.map(lang => ({
    lang, language: LANG_NAME[lang], account: ACCOUNT[lang], groups: groupsFor(lang, day),
  }));
}

const SANS = "-apple-system,'Segoe UI',Roboto,Arial,sans-serif";

const groupList = (lang, day) => {
  const groups = groupsFor(lang, day);
  if (!groups.length) return '';
  return `
        <div style="background:#CBEFFF;border-radius:10px;padding:13px 15px;margin:8px 0 0;
                    font-family:${SANS};font-size:13px;line-height:1.6;color:#010221">
          <b>Post it from Account ${esc(String(ACCOUNT[lang]))} in these ${esc(String(groups.length))} groups today:</b><br>
          ${groups.map((g, i) => `${i + 1}. <a href="${esc(g.url)}" style="color:#010221">${esc(g.name)}</a>`).join('<br>')}
        </div>`;
};

const block = (n, lang, text, link, day) => `
        <p style="margin:26px 0 6px;font-size:12px;color:#7a8194;font-family:${SANS};
                  text-transform:uppercase;letter-spacing:.06em">${esc(String(n))}. ${esc(LANG_NAME[lang])}, Account ${esc(String(ACCOUNT[lang]))}</p>
        <div style="background:#F8F7F4;border:1px solid #E0DFDC;border-radius:10px;padding:16px;
                    font-family:${SANS};font-size:14px;
                    line-height:1.55;color:#111;white-space:pre-wrap">${esc(text)}</div>
        <p style="margin:6px 0 0;font-size:11.5px;color:#7a8194;font-family:${SANS}">
          The link in this version goes to
          <a href="${esc(link)}" style="color:#5B7FCC">${esc(link)}</a>
        </p>${groupList(lang, day)}`;

/**
 * The whole envelope: the English post and its six translations, one image, and under each
 * language the account that posts it and the groups it goes into that day.
 *
 * WHY ALL SEVEN ARE IN ONE EMAIL
 * They are one post. Sending seven emails would mean seven things to keep straight, seven
 * subject lines that look almost identical in an inbox, and a real chance of the German
 * going into a Swedish group. One email, seven clearly labelled blocks, one image at the top.
 */
export function bodyFor(post, day = 1) {
  const english = finalText(post);
  const instruction = (post.note || '').trim();
  const translations = post.translations || {};
  const available = TRANSLATION_LANGS.filter(l => translations[l] && String(translations[l]).trim());

  return `
  <div style="background:#F4F2EE;padding:24px 12px;font-family:Georgia,serif">
    <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #E0DFDC">
      <div style="background:#010221;color:#ffffff;padding:16px 22px;font-size:18px;font-weight:bold">
        24<span style="color:#C9A96E">/</span>7 SPAIN<span style="font-weight:normal;font-size:12px;color:#CBEFFF"> &nbsp;Facebook post, day ${esc(String(day))}</span>
      </div>
      <div style="padding:22px">
        <p style="margin:0 0 4px;font-size:15px;color:#010221">Hi Poornima,</p>
        <p style="margin:0 0 16px;font-size:14px;color:#3a3f52">
          This is the post for day ${esc(String(day))}. It is the same post written out in
          ${esc(String(available.length + 1))} languages. Each language has its own account and its own
          groups for today, and you will find both right under that language's text. Please paste
          the text exactly as it is and add the image. Do not add hashtags or emojis and do not
          change the links, because each language links to its own page.
        </p>

        ${instruction ? `
        <div style="background:#FBF5E7;border-radius:10px;padding:13px 15px;margin:0 0 16px;
                    font-family:${SANS};font-size:13px;color:#010221">
          <b>From Pratik</b><br>${esc(instruction)}
        </div>` : ''}

        ${post.image_url ? `
        <p style="margin:0 0 6px;font-size:12px;color:#7a8194;font-family:${SANS};
                  text-transform:uppercase;letter-spacing:.06em">The image, for every language</p>
        <img src="${esc(post.image_url)}" alt="" style="width:100%;max-width:100%;border-radius:10px;display:block">
        <p style="margin:8px 0 0;font-size:12px;color:#7a8194;font-family:${SANS}">
          Tap and hold, or right click, to save it.
          <a href="${esc(post.image_url)}" style="color:#5B7FCC">Direct link</a>
        </p>` : ''}

        ${block(1, 'en', english, post.tool_url, day)}
        ${available.map((lang, i) =>
          block(i + 2, lang, String(translations[lang]).trim(), linkFor(post.tool_slug, lang), day)
        ).join('')}

        <p style="margin:24px 0 0;font-size:12px;color:#7a8194;font-family:${SANS}">
          When you have posted, fill in the rows for day ${esc(String(day))} in the Daily plan sheet
          and paste the link to each post. If a group holds the post for approval, write
          "Waiting for admin" and move on. If a post is removed or an admin writes to you, do not
          post there again and tell Pratik. Any question at all, just reply to this email.
        </p>
      </div>
    </div>
  </div>`;
}

/**
 * Send one post as the given day. Returns { ok, id, warning } or { ok: false, error }.
 * A warning is a send that the API accepted but that may not have reached anyone.
 */
export async function sendPost(post, day = 1) {
  const result = await sendMail({
    to: SEND_TO,
    cc: SEND_CC,
    subject: subjectFor(post, day),
    html: bodyFor(post, day),
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

/**
 * The note Pratik gets on a day when there was nothing approved to send. It goes to him
 * alone. The publisher hears nothing, because there is nothing for her to do.
 */
export async function sendQueueEmpty(day) {
  return sendMail({
    to: SEND_CC,
    subject: 'No Facebook post went out today: nothing is approved',
    html: `<div style="font-family:${SANS};font-size:14px;line-height:1.6;color:#010221">
      <p>Hi Pratik,</p>
      <p>Today would have been day ${esc(String(day))} of the Facebook group posts, but there is no
      approved post left in the queue, so nothing was sent to Poornima.</p>
      <p>Approve a few more in the deck and tomorrow's send will pick up from there:
      <a href="https://www.247spain.es/internal-pratik" style="color:#5B7FCC">https://www.247spain.es/internal-pratik</a></p>
    </div>`,
  });
}
