// Shared by the webhook, the manual paste and the retry: sort one email and store its stories.
import { db, now } from './_news_db.js';
import { sortStories } from './_news_sort.js';
import { notifyNewStories } from './_news_mail.js';

// Every row has the identical key set, or PostgREST refuses the bulk insert (PGRST102).
export const itemRow = (s, { email_id, source, received_on }) => ({
  email_id,
  source,
  received_on,
  position: s.position,
  title_es: s.title_es || null,
  title_en: s.title_en || null,
  link: s.link || null,
  category: s.category || 'other',
  score: s.score || 1,
  is_proposal: !!s.is_proposal,
  keep: !!s.keep,
  reason: s.reason || null,
  status: s.keep ? 'pending' : 'skipped',
  en: s.en || null,
});

export async function recentTitles(days = 4) {
  const since = new Date(Date.now() - days * 864e5).toISOString();
  const r = await db('items', `?select=title_en&keep=eq.true&created_at=gte.${encodeURIComponent(since)}&order=created_at.desc&limit=60`);
  return r.ok ? r.data.map(x => x.title_en).filter(Boolean) : [];
}

/**
 * email: { email_id, source, subject, received_at, text }
 * Returns { ok, stories, kept, notified, error }
 */
export async function processEmail(email, { notify = true } = {}) {
  const fail = async (error) => {
    await db('emails', `?email_id=eq.${encodeURIComponent(email.email_id)}`, {
      method: 'PATCH', body: JSON.stringify({ status: 'failed', error: String(error).slice(0, 1000), updated_at: now() }),
    });
    return { ok: false, error };
  };
  if (!email.text || email.text.length < 200) return fail('The email had no readable text.');

  const recent = await recentTitles();
  const sorted = await sortStories({ text: email.text, subject: email.subject, source: email.source, recentTitles: recent });
  if (!sorted.ok) return fail(sorted.error);

  const received_on = String(email.received_at || now()).slice(0, 10);
  const rows = sorted.stories.map(s => itemRow(s, { email_id: email.email_id, source: email.source, received_on }));
  const ins = await db('items', '?on_conflict=email_id,position', {
    method: 'POST',
    headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
    body: JSON.stringify(rows),
  });
  if (!ins.ok) return fail(ins.error);

  const kept = sorted.stories.filter(s => s.keep).length;
  await db('emails', `?email_id=eq.${encodeURIComponent(email.email_id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'done', error: null, stories: sorted.stories.length, kept, updated_at: now() }),
  });

  let notified = null;
  if (notify) {
    const n = await notifyNewStories({ source: email.source, subject: email.subject, stories: sorted.stories });
    notified = n.ok ? true : n.error;
  }
  return { ok: true, stories: sorted.stories.length, kept, notified, model: sorted.model };
}

// Claims an email so a webhook retry, or a second delivery, can never process it twice.
// Returns 'claimed', 'duplicate' or an error string.
export async function claim({ email_id, source, from_addr, subject, received_at, status = 'processing', body_text = null }) {
  const r = await db('emails', '?on_conflict=email_id', {
    method: 'POST',
    headers: { Prefer: 'resolution=ignore-duplicates,return=representation' },
    body: JSON.stringify([{ email_id, source, from_addr, subject, received_at, status, body_text }]),
  });
  if (!r.ok) return r.error;
  return r.data.length ? 'claimed' : 'duplicate';
}
