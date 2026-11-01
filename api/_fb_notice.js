// One-off task briefs for the publisher, sent as their own email alongside the daily post.
//
// HOW IT WORKS
// Each notice has a date. The daily dispatch, right after it has sent the day's post, sends
// every notice whose date has arrived and that has not gone out yet. "Not gone out yet" is
// read from the posts table itself: a notice counts as sent once any post has a sent_at on or
// after its date, because the notice always rides with the first post sent on or after that
// date. So no new table, and a notice can never go twice.
//
// Recipients are the same as the daily post: To Pratik, with the publisher and John in BCC.
import { sendMail, SEND_TO, SEND_BCC } from './_fb_email.js';
import { WHATSAPP_AGENTS_HUB } from './_fb_content.js';

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const SANS = 'Helvetica,Arial,sans-serif';
const PROFILE_URL = 'https://www.247spain.es/images/brand/spain247-profile.png';
const P = (html) => `<p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#22263a;font-family:${SANS}">${html}</p>`;
const H = (text) => `<p style="margin:24px 0 8px;font-size:15px;font-weight:bold;color:#010221;font-family:${SANS}">${esc(text)}</p>`;
const LI = (items) => `<ul style="margin:0 0 14px;padding-left:20px;font-size:14px;line-height:1.6;color:#22263a;font-family:${SANS}">${items.map(i => `<li style="margin:0 0 6px">${i}</li>`).join('')}</ul>`;

const CHANNELS = [
  ['Spain 24/7 (English)', 'Updates for people who own a home in Spain: tax deadlines, rule changes and tips for the house.'],
  ['Spania 24/7 (Norwegian)', 'Nytt for deg som eier bolig i Spania: skattefrister, regelendringer og tips for boligen.'],
  ['Spanien 24/7 Svenska (Swedish)', 'Nyheter för dig som äger en bostad i Spanien: deklarationsfrister, regeländringar och tips för huset.'],
  ['Spanien 24/7 (German)', 'Neues für alle mit einem Zuhause in Spanien: Steuerfristen, Regeländerungen und Tipps fürs Haus.'],
  ['Espagne 24/7 (French)', 'Des nouvelles pour ceux qui ont une maison en Espagne : délais fiscaux, changements de règles et conseils pour la maison.'],
  ['Spanje 24/7 (Dutch)', 'Nieuws voor wie een huis in Spanje heeft: belastingtermijnen, regelwijzigingen en tips voor het huis.'],
  ["Agents' WhatsApp Hub", 'A private group for estate agents in Spain who sell to foreign buyers. Ask questions, get answers for your clients and hear about rule changes every week.'],
];

function whatsappTasksBody() {
  return `
  <div style="background:#F4F2EE;padding:24px 12px;font-family:Georgia,serif">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #E0DFDC">
      <div style="background:#010221;color:#ffffff;padding:16px 22px;font-size:18px;font-weight:bold">
        24<span style="color:#C9A96E">/</span>7 SPAIN<span style="font-weight:normal;font-size:12px;color:#CBEFFF"> &nbsp;New tasks</span>
      </div>
      <div style="padding:22px">
        ${P('Hi Agent,')}
        ${P('Please keep doing the daily Facebook group posts as usual. The tasks below are extra, so do them alongside.')}

        ${H('1. Add descriptions to the WhatsApp channels')}
        ${P('You are now admin of six channels, one per language, and of the estate agents\' group. Please copy each description below into its channel exactly as written.')}
        ${LI(CHANNELS.map(([name, text]) => `<b>${esc(name)}:</b> ${esc(text)}`))}

        ${H('2. Add the profile picture')}
        ${P('Use this picture as the profile picture for all six channels and the estate agents\' group. Open the link, save the image, and upload it in each channel\'s settings.')}
        <p style="margin:0 0 10px"><img src="${PROFILE_URL}" width="160" height="160" alt="Spain 24/7" style="display:block;border-radius:80px"></p>
        ${P(`<a href="${PROFILE_URL}" style="color:#5B7FCC">Download the profile picture</a>`)}

        ${H('3. Post in the channels every day')}
        ${P('Starting today, your daily email also has a short update on the news in the Spanish property market, in all six languages, under the Facebook post. Post each language in its own channel on the same day. Today\'s update is already in this morning\'s email.')}

        ${H('4. Post in the estate agents\' group (later)')}
        ${P('Once a few agents have joined the hub, you will also get a daily post for that group in your email. Please do not start this until I tell you.')}

        ${H('5. Find Facebook groups for estate agents')}
        ${P('Please research Facebook groups where estate agents in Spain are active, especially agents who sell to foreign buyers. Add each group to your tracking sheet with:')}
        ${LI(['The group name and link.', 'The number of members.', 'The language.', 'Whether the group allows posts.'])}
        ${P('Then send the list to me as well.')}

        ${H('6. Join those groups from all seven accounts')}
        ${P('Join the estate agents\' groups you find from Account 1 to Account 7, today and tomorrow. From Wednesday 4 November, your daily email will have a post about our agents\' group, with the steps for where to post it.')}

        ${H('7. Add the hub link in the comments every day')}
        ${P('Wherever estate agents are likely to see it, add this link in the comments. That includes the agents\' groups and your posts in them.')}
        ${P(`<a href="${esc(WHATSAPP_AGENTS_HUB)}" style="color:#5B7FCC">${esc(WHATSAPP_AGENTS_HUB)}</a>`)}

        ${P('Thanks,')}
        ${P('Pratik')}
      </div>
    </div>
  </div>`;
}

export const NOTICES = [
  {
    id: 'whatsapp-tasks-2026-11',
    date: '2026-11-02',
    subject: 'New WhatsApp tasks, alongside the daily posts',
    body: whatsappTasksBody,
  },
];

/** Notices due today that have not ridden with an earlier send. `rows` is read before today's send. */
export function dueNotices(rows, now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  return NOTICES.filter(n => n.date <= today
    && !rows.some(r => r.sent_at && String(r.sent_at).slice(0, 10) >= n.date));
}

export async function sendNotices(rows, now = new Date()) {
  const out = [];
  for (const n of dueNotices(rows, now)) {
    const r = await sendMail({ to: SEND_TO, bcc: SEND_BCC, subject: n.subject, html: n.body() });
    out.push({ id: n.id, ok: r.ok, error: r.error || null });
  }
  return out;
}
