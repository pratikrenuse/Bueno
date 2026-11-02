// POST /api/news?action=inbound   (Resend webhook, event email.received)
//
// HOW IT IS KEPT SAFE WITHOUT A SECRET
// The webhook body is only used for its email_id. The email itself is fetched back from
// Resend with our own API key, so a forged call can only point at an email Resend really
// received for us. Then only senders on the allow list (idealista.com, plus
// NEWS_ALLOWED_SENDERS) are sent to Claude; anything else is stored as "ignored".
//
// WHY RETRIES ARE HARMLESS
// Resend retries a webhook that does not answer in time, and sorting an email takes longer
// than that. The email is claimed by its Resend id before any work starts, so a retry finds
// the claim and stops. The first call carries on to the end regardless.
import { db, now, readBody } from './_news_db.js';
import { emailText, isAllowedSender, sourceOf, addressOf } from './_news_parse.js';
import { processEmail, claim } from './_news_process.js';

export async function fetchReceived(id) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: 'Missing env var: RESEND_API_KEY' };
  try {
    const r = await fetch(`https://api.resend.com/emails/receiving/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: `Resend ${r.status}: ${JSON.stringify(j).slice(0, 300)}` };
    return { ok: true, email: j };
  } catch (e) {
    return { ok: false, error: `Resend request failed: ${String((e && e.message) || e)}` };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const event = readBody(req);
  if (event.type !== 'email.received') return res.json({ ok: true, ignored: `event ${event.type || 'unknown'}` });
  const id = event.data && event.data.email_id;
  if (!id) return res.status(400).json({ error: 'No email_id in the event.' });

  const got = await fetchReceived(id);
  if (!got.ok) {
    // 500 so Resend retries: nothing was claimed yet, so the retry starts cleanly.
    return res.status(500).json({ ok: false, error: got.error });
  }
  const e = got.email;
  const from = (e.headers && e.headers.from) || e.from || '';
  const allowed = isAllowedSender(from);
  const text = allowed ? emailText(e) : null;

  const c = await claim({
    email_id: id,
    source: sourceOf(from),
    from_addr: addressOf(from),
    subject: e.subject || event.data.subject || '',
    received_at: e.created_at || event.data.created_at || now(),
    status: allowed ? 'processing' : 'ignored',
    body_text: text,
  });
  if (c === 'duplicate') return res.json({ ok: true, duplicate: true });
  if (c !== 'claimed') return res.status(500).json({ ok: false, error: c });
  if (!allowed) return res.json({ ok: true, ignored: `sender ${addressOf(from)} is not on the allow list` });

  const out = await processEmail({
    email_id: id, source: sourceOf(from), subject: e.subject || '',
    received_at: e.created_at || now(), text,
  });
  // Always 200 once claimed: a retry could not do better, and the deck shows the error.
  return res.json({ ok: out.ok, ...out });
}

// Used by the retry button for an email that failed.
export async function reprocess(email_id) {
  const r = await db('emails', `?email_id=eq.${encodeURIComponent(email_id)}&select=*`);
  if (!r.ok) return { ok: false, error: r.error };
  const row = r.data[0];
  if (!row) return { ok: false, error: 'No such email.' };
  if (row.status === 'done') return { ok: false, error: 'This email was already sorted.' };
  let text = row.body_text;
  if (!text && !String(email_id).startsWith('manual-')) {
    const got = await fetchReceived(email_id);
    if (!got.ok) return { ok: false, error: got.error };
    text = emailText(got.email);
  }
  await db('emails', `?email_id=eq.${encodeURIComponent(email_id)}`, {
    method: 'PATCH', body: JSON.stringify({ status: 'processing', error: null, body_text: text, updated_at: now() }),
  });
  return processEmail({ email_id, source: row.source, subject: row.subject, received_at: row.received_at, text });
}
