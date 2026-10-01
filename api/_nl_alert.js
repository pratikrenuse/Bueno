// /api/newsletter?action=alert            the fortnightly review email to John and Pratik
// /api/newsletter?action=alert&key=nl-14  for one issue
// /api/newsletter?action=alert&dry=1      build it and return it, send nothing
//
// "This is the newsletter for Thursday 22 October." It goes to John and Pratik only, with a
// link straight to that issue in the deck, the password, and a short look at what is in it.
// Without a key it picks the issue whose alert date is today or has passed and that has not
// been alerted yet. It only ever sends once per issue unless force=1 is passed.
import { gate, rest, patch, emailsLive, sendMail, shell, esc, longDate, PRATIK, JOHN, SITE } from './_nl_db.js';
import { current } from './_newsletter_render.js';

const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Madrid' });

function build(row, upcoming) {
  const c = current(row, 'en');
  const link = `${SITE}/internal-newsletter?issue=${encodeURIComponent(row.issue_key)}`;
  const pass = process.env.INTERNAL_PASSCODE || '';
  const li = (t) => `<li style="margin:0 0 6px">${esc(t)}</li>`;
  const queue = upcoming.length
    ? `<p style="margin:18px 0 6px">The issues after this one are also ready to look at whenever you have time:</p><ul style="margin:0 0 0 18px;padding:0">${upcoming.map(u => li(`Newsletter ${u.number}, ${longDate(u.send_date)}: ${u.status === 'pending' ? 'waiting for review' : u.status}`)).join('')}</ul>`
    : '';
  const inner = `<p style="margin:0 0 12px">Hi John and Pratik,</p>
    <p style="margin:0 0 12px">This is the newsletter for ${esc(longDate(row.send_date))}. It is written in English, Norwegian and Swedish, and the news has been researched this week so it is current.</p>
    <p style="margin:0 0 12px">John, could you read it through, change anything you want directly in the tool, and press Approve when you are happy with it? As soon as it is approved, Pratik gets the final text so he can schedule it in beehiiv.</p>
    <p style="margin:18px 0 6px"><b>What is in it</b></p>
    <ul style="margin:0 0 0 18px;padding:0">
      ${c.news.map(n => li(`News: ${n.title}`)).join('')}
      ${li(`Guide: ${c.guide.title}`)}
      ${li(c.region.title)}
      ${li(`Reader's question: ${c.question.q}`)}
    </ul>
    <p style="margin:22px 0"><a href="${esc(link)}" style="display:inline-block;background:#010221;color:#fff;text-decoration:none;padding:12px 24px;border-radius:24px">Open Newsletter ${row.number}</a></p>
    ${pass ? `<p style="margin:0 0 12px;font-size:13px;color:#555">The password for the tool is <b>${esc(pass)}</b>.</p>` : ''}
    ${queue}`;
  return { subject: `Newsletter for ${longDate(row.send_date)} is ready for review (Bueno Newsletter ${row.number})`, html: shell('Newsletter review', inner) };
}

export default async function handler(req, res) {
  if (!gate(req, res)) return;
  const q = req.query || {};
  const dry = q.dry === '1' || q.dry === 'true';
  const force = q.force === '1' || q.force === 'true';

  const rows = await rest(res, '?select=*&order=send_date.asc');
  if (rows === null) return;

  let row;
  if (q.key) row = rows.find(r => r.issue_key === q.key);
  else row = rows.find(r => r.alert_date && r.alert_date <= today() && !r.alert_sent_at && r.status === 'pending' && r.send_date >= today());
  if (!row) return res.json({ ok: true, sent: false, reason: q.key ? `No issue ${q.key}` : 'No issue is due for its review email today.' });

  if (row.alert_sent_at && !force && !dry) return res.json({ ok: true, sent: false, reason: `Already sent on ${row.alert_sent_at}. Pass force=1 to send again.` });

  const upcoming = rows.filter(r => r.send_date > row.send_date && r.status !== 'scheduled').slice(0, 4);
  const mail = build(row, upcoming);

  if (dry) return res.json({ ok: true, dry: true, issue: row.issue_key, to: [JOHN, PRATIK], ...mail });
  if (!emailsLive()) {
    await patch(res, row.issue_key, { last_email: { kind: 'alert', at: new Date().toISOString(), ok: false, held: true, error: 'Emails are switched off (NEWSLETTER_EMAILS_LIVE is not true).' } });
    return res.json({ ok: true, sent: false, held: true, reason: 'Emails are switched off (NEWSLETTER_EMAILS_LIVE is not true). Nothing was sent.', issue: row.issue_key, ...mail });
  }

  const result = await sendMail({ to: [JOHN, PRATIK], subject: mail.subject, html: mail.html });
  const body = { last_email: { kind: 'alert', at: new Date().toISOString(), ...result } };
  if (result.ok) body.alert_sent_at = new Date().toISOString();
  const out = await patch(res, row.issue_key, body);
  if (out === null) return;
  res.json({ ok: result.ok, sent: result.ok, issue: row.issue_key, email: result });
}
