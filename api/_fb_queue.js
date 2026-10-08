// The queue between approving a post and it reaching the publisher.
//
// WHY THERE IS A QUEUE NOW
// Until October 2026 approving a post emailed it at once. Pratik now approves many posts in
// one sitting and wants exactly one to go out each day, so approving puts a post in line and
// a daily job sends the one at the front.
//
// WHAT DECIDES THE ORDER
// QUEUE_ORDER in the content module, and nothing else. It is not the order posts were
// approved in, because that is whatever order the deck happened to show them in. A post that
// is not approved is skipped, so the line never stalls behind one Pratik has not read.
//
// WHAT A DAY IS
// The day number counts sends, not dates. The first post ever sent is day 1, the next is
// day 2. The groups each language posts in are worked out from that number, so a day with
// nothing to send does not make any group miss its turn.
import { rest } from './_fb_db.js';
import { queueIndex } from './_fb_content.js';
import { sendPost, finalText, SEND_TO } from './_fb_email.js';
import { isCurrent, translate } from './_fb_translate.js';

export const queueOf = (rows) => rows
  .filter(r => r.status === 'approved' && !r.sent_at)
  .sort((a, b) => queueIndex(a.idea_key) - queueIndex(b.idea_key) || String(a.idea_key).localeCompare(String(b.idea_key)));

export const nextDay = (rows) => rows.reduce((m, r) => Math.max(m, Number(r.send_day) || 0), 0) + 1;

// Has anything already gone out on this calendar day (UTC)? One post a day means one.
export const sentOn = (rows, date = new Date()) => {
  const day = date.toISOString().slice(0, 10);
  return rows.some(r => r.sent_at && String(r.sent_at).slice(0, 10) === day);
};

export async function save(res, id, patch) {
  return rest(res, `?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() }),
  });
}

/**
 * Make sure the translations are of the English that is actually going out.
 * Returns { ok: true, row, patch, retranslated } or { ok: false, error }.
 * The stored set is used untouched when it is current; the model is only called for a post
 * Pratik edited, and if that rebuild fails nothing downstream is allowed to happen.
 */
export async function withCurrentTranslations(row) {
  const english = finalText(row);
  if (!english) return { ok: false, error: 'There is no text to send.' };
  if (isCurrent(row, english)) return { ok: true, row, patch: {}, retranslated: false };
  const t = await translate(english, row.tool_slug);
  if (!t.ok) return { ok: false, error: t.error };
  const patch = { translations: t.translations, translations_of: t.hash };
  return { ok: true, row: { ...row, ...patch }, patch, retranslated: true };
}

/**
 * Email one post to the publisher as the given day and record that it went.
 * Returns { ok, post, sent, error, warning }. ok is false only when the database refused.
 */
export async function deliver(res, row, day, extraPatch = {}) {
  const result = await sendPost(row, day);
  const patch = result.ok
    ? { ...extraPatch, status: row.status === 'posted' ? 'posted' : 'approved', sent_at: new Date().toISOString(),
        sent_to: SEND_TO.join(', '), send_day: day, send_error: null }
    : { ...extraPatch, send_error: result.error };
  const out = await save(res, row.id, patch);
  if (out === null) return { ok: false };
  return { ok: true, post: out[0] || null, sent: result.ok, error: result.ok ? null : result.error, warning: result.warning || null };
}
