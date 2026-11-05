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
  const t0 = Date.now();
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
  // Only when there is time left in this run (60 seconds at most). If not, each deck picks
  // the stories up on its next load, so nothing is lost.
  const fed = kept && Date.now() - t0 < 50000 ? await feedDecks() : null;
  return { ok: true, stories: sorted.stories.length, kept, notified, fed, model: sorted.model };
}

// Since 5 November 2026 the useful stories also become posts in the team's LinkedIn deck.
// The deck writes its own posts from news_items, on its own side (api/_lk_news.js); this only
// tells it there is something new, and does not wait. If the call is lost, the deck notices
// the missing posts on its next load. The Facebook deck is parked (Pratik, 5 November 2026):
// api/_fb_news.js exists but nothing calls it until he says so.
const DECKS = ['/api/linkedin?action=news'];
export async function feedDecks() {
  const pass = process.env.INTERNAL_PASSCODE;
  if (!pass) return 'Missing env var: INTERNAL_PASSCODE';
  const site = process.env.NEWS_SITE || 'https://www.247spain.es';
  await Promise.all(DECKS.map(async (path) => {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), 2500);
    try {
      await fetch(`${site}${path}`, {
        method: 'POST', headers: { 'x-passcode': pass, 'Content-Type': 'application/json' }, body: '{}', signal: c.signal,
      });
    } catch { /* the deck carries on by itself, or picks it up on its next load */ } finally { clearTimeout(t); }
  }));
  return true;
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
