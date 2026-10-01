// POST /api/newsletter?action=decide
// Body: { key, action, lang?, content?, note? }
//   edit       save John's version of one language (content = the full language object)
//   revert     drop John's edit for one language and go back to the written version
//   approved   approve, and email Pratik the paste-ready issue in all three languages
//   rejected   park it with a note
//   pending    undo a decision
//   scheduled  Pratik records that he has scheduled it in beehiiv
//   resend     email the approved issue to Pratik again, deliberately
//
// Approving an issue whose news still has the placeholder text is refused, so a half-filled
// issue can never reach Pratik as ready to schedule.
import { gate, readBody, getIssue, patch, emailsLive, sendMail, shell, esc, longDate, PRATIK, SITE } from './_nl_db.js';
import { LANGS, LANG_LABEL } from './_newsletter_shell.js';
import { current, toText } from './_newsletter_render.js';

const MAX = 60000;

function approvalEmail(row) {
  const blocks = LANGS.map(l => {
    const c = current(row, l);
    return `<h3 style="margin:24px 0 8px;color:#010221">${LANG_LABEL[l]}</h3>
      <p style="margin:0 0 8px;font-size:13px">Guide PDF: <a href="${esc(c.guide.url)}">${esc(c.guide.url)}</a></p>
      <pre style="white-space:pre-wrap;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;font-size:14px;line-height:1.55;background:#F8F7F4;border:1px solid #E0DFDC;border-radius:10px;padding:16px;margin:0">${esc(toText(c))}</pre>`;
  }).join('');
  const inner = `<p style="margin:0 0 12px">Hi Pratik,</p>
    <p style="margin:0 0 12px">John has approved Bueno Newsletter ${row.number}, which is planned for ${esc(longDate(row.send_date))}. Below is the final text in English, Norwegian and Swedish, ready to paste into beehiiv and schedule.</p>
    <p style="margin:0 0 12px">Once it is scheduled, you can mark it as scheduled in the tool so everyone knows it is done: <a href="${SITE}/internal-newsletter?issue=${esc(row.issue_key)}">${SITE}/internal-newsletter</a></p>${blocks}`;
  return { subject: `Approved and ready to schedule: Bueno Newsletter ${row.number} (${longDate(row.send_date)})`, html: shell('Newsletter approved', inner) };
}

function hasPlaceholderNews(row) {
  return LANGS.some(l => {
    const c = current(row, l);
    return !c || (c.news || []).some(n => /research job|research-jobben|researchjobbet|alert day|varslingsdagen|aviseringsdagen/i.test(`${n.title} ${n.body}`));
  });
}

export default async function handler(req, res) {
  if (!gate(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { key, action, lang, content, note } = readBody(req);
  if (!key) return res.status(400).json({ error: 'key is required' });

  const row = await getIssue(res, key);
  if (!row) return;

  if (action === 'edit') {
    if (!LANGS.includes(lang)) return res.status(400).json({ error: 'lang must be en, no or sv' });
    if (!content || typeof content !== 'object') return res.status(400).json({ error: 'content is required' });
    if (JSON.stringify(content).length > MAX) return res.status(400).json({ error: 'content is too long' });
    const edited = { ...(row.edited || {}) };
    edited[lang] = content;
    const out = await patch(res, key, { edited });
    if (out === null) return;
    return res.json({ ok: true, issue: out[0] });
  }

  if (action === 'revert') {
    if (!LANGS.includes(lang)) return res.status(400).json({ error: 'lang must be en, no or sv' });
    const edited = { ...(row.edited || {}) };
    delete edited[lang];
    const out = await patch(res, key, { edited: Object.keys(edited).length ? edited : null });
    if (out === null) return;
    return res.json({ ok: true, issue: out[0] });
  }

  if (action === 'rejected') {
    const out = await patch(res, key, { status: 'rejected', reject_note: note || null, approved_at: null });
    if (out === null) return;
    return res.json({ ok: true, issue: out[0] });
  }

  if (action === 'pending') {
    const out = await patch(res, key, { status: 'pending', reject_note: null, approved_at: null, scheduled_at: null });
    if (out === null) return;
    return res.json({ ok: true, issue: out[0] });
  }

  if (action === 'scheduled') {
    if (row.status !== 'approved' && row.status !== 'scheduled') return res.status(400).json({ error: 'Approve the issue before marking it scheduled.' });
    const out = await patch(res, key, { status: 'scheduled', scheduled_at: new Date().toISOString() });
    if (out === null) return;
    return res.json({ ok: true, issue: out[0] });
  }

  if (action === 'approved' || action === 'resend') {
    if (action === 'approved' && hasPlaceholderNews(row)) {
      return res.status(400).json({ error: 'This issue still has placeholder news. The research job fills it on the alert day, or the news can be written in by hand with Edit.' });
    }
    if (action === 'resend' && row.status !== 'approved' && row.status !== 'scheduled') {
      return res.status(400).json({ error: 'Only an approved issue can be sent again.' });
    }
    const mail = approvalEmail(row);
    const alreadySent = !!row.approval_sent_at && action === 'approved';
    let result;
    if (alreadySent) result = { ok: true, skipped: 'already emailed to Pratik' };
    else if (!emailsLive()) result = { ok: false, held: true, error: 'Emails are switched off (NEWSLETTER_EMAILS_LIVE is not true). Nothing was sent.' };
    else result = await sendMail({ to: [PRATIK], subject: mail.subject, html: mail.html });

    const body = {
      status: action === 'approved' ? 'approved' : row.status,
      approved_at: action === 'approved' ? new Date().toISOString() : row.approved_at,
      reject_note: null,
      last_email: { kind: 'approval', at: new Date().toISOString(), ...result },
    };
    if (result.ok && !result.skipped) body.approval_sent_at = new Date().toISOString();
    const out = await patch(res, key, body);
    if (out === null) return;
    return res.json({ ok: true, issue: out[0], email: result, preview: { subject: mail.subject, html: mail.html } });
  }

  return res.status(400).json({ error: `Unknown action: ${action}` });
}
