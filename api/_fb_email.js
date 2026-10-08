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
import { ACCOUNT, GROUPS, groupsFor, DAILY_START, MAX_PER_DAY } from './_fb_groups.js';
import { cardFor, isCard } from './_fb_images.js';

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

// The image for one language: that language's own card, unless Pratik pasted an image of his
// own in the deck, in which case that one image goes with every language.
const imageFor = (post, lang) => (post.idea_key && (!post.image_url || isCard(post.image_url))
  ? cardFor(post.idea_key, lang)
  : post.image_url || null);

const imageTag = (src, lang) => (src ? `
        <img src="${esc(src)}" alt="" width="576" style="width:100%;max-width:576px;border-radius:10px;display:block;margin:0 0 8px">
        <p style="margin:0 0 8px;font-size:11.5px;color:#7a8194;font-family:${SANS}">
          The ${esc(LANG_NAME[lang])} image. Tap and hold, or right click, to save it.
          <a href="${esc(src)}" style="color:#5B7FCC">Direct link</a>
        </p>` : '');

const block = (n, lang, text, link, day, image) => `
        <p style="margin:30px 0 8px;font-size:12px;color:#7a8194;font-family:${SANS};
                  text-transform:uppercase;letter-spacing:.06em">${esc(String(n))}. ${esc(LANG_NAME[lang])}, Account ${esc(String(ACCOUNT[lang]))}</p>
        ${imageTag(image, lang)}
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
export function bodyFor(post, day = 1, { trial = false } = {}) {
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
        ${trial ? trialBanner() : ''}
        <p style="margin:0 0 4px;font-size:15px;color:#010221">Hi Poornima,</p>
        <p style="margin:0 0 16px;font-size:14px;color:#3a3f52">
          This is the post for day ${esc(String(day))}. It is the same post written out in
          ${esc(String(available.length + 1))} languages, and each language has its own image with the
          text in that language. Under each one you will find its account and its groups for today.
          Please paste the text exactly as it is and add that language's image. Do not add hashtags
          or emojis and do not change the links, because each language links to its own page.
        </p>

        ${instruction ? `
        <div style="background:#FBF5E7;border-radius:10px;padding:13px 15px;margin:0 0 16px;
                    font-family:${SANS};font-size:13px;color:#010221">
          <b>From Pratik</b><br>${esc(instruction)}
        </div>` : ''}

        ${block(1, 'en', english, post.tool_url, day, imageFor(post, 'en'))}
        ${available.map((lang, i) =>
          block(i + 2, lang, String(translations[lang]).trim(), linkFor(post.tool_slug, lang), day, imageFor(post, lang))
        ).join('')}

        <p style="margin:24px 0 0;font-size:12px;color:#7a8194;font-family:${SANS}">
          Before you post, spend about ten minutes on each account using Facebook normally: reply
          to comments and messages, and like or comment on a few posts in the groups. Keep asking
          to join any group that has not accepted you yet. When you have posted, fill in the rows
          for day ${esc(String(day))} in the Daily plan sheet and paste the link to each post. If a
          group holds the post for approval, write "Waiting for admin" and move on. If a post is
          removed or an admin writes to you, do not post there again and tell Pratik. Any question
          at all, just reply to this email.
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
      <a href="https://www.247spain.es/internal-poornima" style="color:#5B7FCC">https://www.247spain.es/internal-poornima</a></p>
    </div>`,
  });
}

// ---------------------------------------------------------------------------
// The instructions email, and the trial copies Pratik sends himself first.
// ---------------------------------------------------------------------------

const trialBanner = () => `
        <div style="background:#FBF5E7;border:1px solid #C9A96E;border-radius:10px;padding:12px 14px;margin:0 0 18px;
                    font-family:${SANS};font-size:13px;color:#010221">
          <b>Trial copy for Pratik.</b> This is exactly what Poornima will receive. She has not been
          sent this one, and nothing has been marked as sent.
        </div>`;

const P = (html) => `<p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#22263a;font-family:${SANS}">${html}</p>`;
const H = (text) => `<p style="margin:24px 0 8px;font-size:15px;font-weight:bold;color:#010221;font-family:${SANS}">${esc(text)}</p>`;

export const INTRO_SUBJECT = 'How the daily Facebook group posts will work';

// The day-by-day plan in the instructions, from 9 to 31 October 2026. The first three days
// are for joining groups and getting the accounts going; posting starts on DAILY_START with
// one group per language, then two, then three. Worked out from DAILY_START, so moving that
// date moves the plan with it.
const PLAN_FROM = '2026-10-09';
const PLAN_TO = '2026-10-31';
const DAY_MS = 24 * 3600 * 1000;
const WEEKDAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function planDays() {
  const start = Date.parse(`${DAILY_START}T00:00:00Z`);
  const out = [];
  for (let t = Date.parse(`${PLAN_FROM}T00:00:00Z`); t <= Date.parse(`${PLAN_TO}T00:00:00Z`); t += DAY_MS) {
    const d = new Date(t);
    const label = `${WEEKDAY[d.getUTCDay()]} ${d.getUTCDate()} ${MONTH[d.getUTCMonth()]}`;
    const n = Math.round((t - start) / DAY_MS) + 1;
    let task;
    if (n === -2) task = 'No posting today. Log in to each account in its own browser profile and make sure each one has a profile photo and a short About section. Then, on each account, ask to join the first half of its groups.';
    else if (n === -1) task = 'No posting today. On each account, ask to join the rest of its groups, and answer any questions the groups ask. Spend ten minutes on each account using Facebook normally.';
    else if (n === 0) task = 'No posting today. Check which groups have accepted each account and ask again where they have not. Spend ten minutes on each account reading, liking and commenting in the groups.';
    else {
      const groups = n <= RAMP_TEXT.length ? RAMP_TEXT[n - 1] : `${MAX_PER_DAY} groups`;
      task = `The day ${n} email arrives. Post each language from its own account in ${groups}, as the email lists. Spend ten minutes on each account first, and keep asking to join any group that has not accepted you.`;
      if (d.getUTCDay() === 0) task += ' As it is Sunday, please also send me a short note on the week: what went up, what is waiting for an admin, and anything that was removed.';
    }
    out.push({ date: d.toISOString().slice(0, 10), label, day: n >= 1 ? n : null, task });
  }
  return out;
}
const RAMP_TEXT = ['1 group', '2 groups'];

const planTable = () => `<table style="border-collapse:collapse;font-family:${SANS};font-size:13px;line-height:1.5;color:#22263a;margin:0 0 6px;width:100%">
          ${planDays().map(p => `<tr>
            <td style="padding:7px 10px;border-bottom:1px solid #E0DFDC;vertical-align:top;white-space:nowrap;font-weight:bold">${esc(p.label)}</td>
            <td style="padding:7px 10px;border-bottom:1px solid #E0DFDC;vertical-align:top">${esc(p.task)}</td>
          </tr>`).join('')}
        </table>`;

/**
 * The first email Poornima gets: what happens every day, which account posts in which
 * language, the full list of groups each account should join, and what to do when a group
 * holds or removes a post. Written the way Pratik would say it, not as a manual.
 */
export function introBody({ trial = false } = {}) {
  const accounts = LANGS.map(l => `<tr>
          <td style="padding:6px 10px;border-bottom:1px solid #E0DFDC;font-weight:bold">Account ${esc(String(ACCOUNT[l]))}</td>
          <td style="padding:6px 10px;border-bottom:1px solid #E0DFDC">${esc(LANG_NAME[l])}</td>
          <td style="padding:6px 10px;border-bottom:1px solid #E0DFDC">${esc(String((GROUPS[l] || []).length))} groups</td>
        </tr>`).join('');

  const lists = LANGS.map(l => `
        <p style="margin:18px 0 6px;font-size:13px;font-weight:bold;color:#010221;font-family:${SANS}">
          Account ${esc(String(ACCOUNT[l]))}, ${esc(LANG_NAME[l])} groups</p>
        <div style="font-family:${SANS};font-size:13px;line-height:1.7;color:#22263a">
          ${(GROUPS[l] || []).map(([name, url], i) => `${i + 1}. <a href="${esc(url)}" style="color:#5B7FCC">${esc(name)}</a>`).join('<br>')}
        </div>`).join('');

  return `
  <div style="background:#F4F2EE;padding:24px 12px;font-family:Georgia,serif">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #E0DFDC">
      <div style="background:#010221;color:#ffffff;padding:16px 22px;font-size:18px;font-weight:bold">
        24<span style="color:#C9A96E">/</span>7 SPAIN<span style="font-weight:normal;font-size:12px;color:#CBEFFF"> &nbsp;Facebook group posts</span>
      </div>
      <div style="padding:22px">
        ${trial ? trialBanner() : ''}
        ${P('Hi Poornima,')}
        ${P('From now on you will be posting for 24/7 Spain and Bueno in Facebook groups. Before the first post reaches you, I want to explain how it works, step by step, so nothing in the daily emails is a surprise.')}

        ${H('How it works')}
        ${P('Every morning, from Monday 12 October, you will get one email from me. It holds one post, written out in seven languages: English, Norwegian, Swedish, Danish, German, French and Dutch. Each language has its own image with the text in that language.')}
        ${P(`Under each language you will see which account to post it from and the groups it goes into that day, as links. The first day is one group per language, the second day is two, and from then on it is never more than ${esc(String(MAX_PER_DAY))}.`)}

        ${H('Your seven accounts')}
        ${P('Each of your seven Facebook accounts looks after one language, and only posts in that language. They are called Account 1 to Account 7.')}
        <table style="border-collapse:collapse;font-family:${SANS};font-size:13px;color:#22263a;margin:0 0 6px">${accounts}</table>
        ${P('Please log in to each account in its own browser, or its own browser profile, so you always know which account you are in.')}

        ${H('Your plan, day by day')}
        ${planTable()}

        ${H('Keeping the accounts healthy')}
        ${P('New accounts that only ever post links get restricted quickly, so please use each account the way a person would. Every day, spend about ten minutes on each one: read the groups it has joined, like and comment on a few posts where you have something useful to say, and reply to comments and messages. If you have a real conversation with someone in a group, it is fine to send them a friend request. Please do not send friend requests to random strangers, because that is exactly what Facebook treats as spam.')}
        ${P('Some groups ask a few questions before they let you in. Answer them honestly. Some take a day or two to accept you. Keep asking each day until they do.')}
        ${P('The Dutch groups on Account 7 have not all been checked yet. Before joining one, open it and make sure it is active and about living in Spain. If it is not, skip it and tell me.')}

        ${H('Each posting day')}
        ${P('1. Open the day\'s email.<br>2. For each language, log in to the account named for it.<br>3. Open each group link, paste the text exactly as it is, and add that language\'s image.<br>4. Note what happened in the Excel sheet I am sharing with you, and paste the link to each post.')}
        ${P('Please do not change the wording or the link, and do not add hashtags or emojis. Each language links to its own page, so the links have to stay as they are.')}
        ${P('If a group holds the post for an admin to approve, write "Waiting for admin" and move on. If a post is removed, or an admin writes to you, do not post in that group again and let me know. If someone asks a question under a post, send it to me and I will give you the reply.')}

        ${H('Reddit and forums')}
        ${P('There are also some Reddit communities and forums we will use later. Please do not post there yet. I will tell you when, and how.')}

        ${P('If anything is unclear, just reply to this email and ask. Thank you.')}
        ${P('Pratik')}

        ${H('The groups for each account')}
        ${lists}
      </div>
    </div>
  </div>`;
}

/** The instructions email, to Poornima with Pratik copied. */
export async function sendIntro() {
  const result = await sendMail({ to: SEND_TO, cc: SEND_CC, subject: INTRO_SUBJECT, html: introBody() });
  if (result.ok && usingSandboxSender()) {
    return { ...result, warning: `RESEND_FROM is not set in Vercel, so ${SEND_TO.join(', ')} will not have received the instructions.` };
  }
  return result;
}

/**
 * The trial: the instructions email and one day's post, both to Pratik alone and both marked
 * as a trial at the top. Nothing is recorded anywhere.
 */
export async function sendTrial(post, day) {
  const to = SEND_CC;
  const a = await sendMail({ to, subject: `Trial: ${INTRO_SUBJECT}`, html: introBody({ trial: true }) });
  if (!a.ok) return { ...a, to };
  const b = await sendMail({ to, subject: `Trial: ${subjectFor(post, day)}`, html: bodyFor(post, day, { trial: true }) });
  if (!b.ok) return { ...b, to };
  return {
    ok: true, to,
    warning: usingSandboxSender() ? 'RESEND_FROM is not set in Vercel, so the trial went out from the Resend sandbox sender.' : null,
  };
}
