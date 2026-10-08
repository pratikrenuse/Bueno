// POST /api/fb?action=decide
//
// Body: { id, action, text, note, image, comment }
//   edit          save an edited version of the post, keeping the original beside it
//   image         switch to one of this post's own options
//   image_custom  switch to a URL Pratik pasted himself
//   note          save an instruction that travels with the post
//   approved      approve it, which puts it in the daily queue
//   send_now      email it to the publisher today, ahead of the queue
//   rejected      park it with a reason
//   posted        record that it is live
//   pending       undo
//   resend        send an already sent post again, deliberately
//
// WHY APPROVING NO LONGER SENDS
// It used to, because one post was approved at a time and an approved post sitting unsent was
// how the LinkedIn program lost posts. Since October 2026 Pratik approves many posts in one
// sitting and exactly one goes out each day, so approving puts a post in the queue and
// api/_fb_dispatch.js sends the one at the front. The deck shows each post's place in the
// queue, so an approved post is never out of sight.
//
// WHAT STILL HOLDS
// The translations are checked at the moment of approval, not at send time, so a problem
// shows up while Pratik is looking at the post and not at nine the next morning.
// A post is never emailed twice by accident: once sent_at is set, approving again does not
// queue it again. Resending is its own action, so it is always something Pratik chose to do.
// Nothing is ever appended to the text on the way out. What he approved is what is sent.
import { gate, rest, readBody } from './_fb_db.js';
import { nextDay, queueOf, save, withCurrentTranslations, deliver } from './_fb_queue.js';

const DECISIONS = new Set(['pending', 'approved', 'rejected', 'posted']);
const MAX_TEXT = 8000;

const isImageUrl = (u) => {
  try {
    const url = new URL(u);
    return url.protocol === 'https:' && !!url.hostname;
  } catch { return false; }
};

async function fetchOne(res, id) {
  const rows = await rest(res, `?id=eq.${encodeURIComponent(id)}&select=*`);
  if (rows === null) return null;
  if (!rows[0]) { res.status(404).json({ error: 'no such post' }); return null; }
  return rows[0];
}

export default async function handler(req, res) {
  if (!gate(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { id, action, text, note, image, comment } = readBody(req);
  if (!id) return res.status(400).json({ error: 'id is required' });

  // Actions that need to see the row first.
  if (action === 'image' || action === 'approved' || action === 'resend' || action === 'send_now') {
    const row = await fetchOne(res, id);
    if (!row) return;

    if (action === 'image') {
      if (!image) return res.status(400).json({ error: 'image is required' });
      if (!(row.image_options || []).includes(image)) {
        return res.status(400).json({ error: 'that image is not one of this post options' });
      }
      const out = await save(res, id, { image_url: image });
      if (out === null) return;
      return res.json({ ok: true, post: out[0] || null });
    }

    const alreadySent = !!row.sent_at;

    // Approving an already sent post does not queue it again.
    if (action === 'approved' && alreadySent) {
      const out = await save(res, id, { status: 'approved', posted_at: null, send_error: null });
      if (out === null) return;
      return res.json({ ok: true, post: out[0] || null, queued: false, sent: false, reason: 'already sent' });
    }
    if (action === 'resend' && !alreadySent) {
      return res.status(400).json({ error: 'this post has not been sent yet, so there is nothing to send again' });
    }
    if (action === 'send_now' && alreadySent) {
      return res.status(400).json({ error: 'this post has already been sent. Use send again if you mean to repeat it' });
    }

    // The translations must be of the English that is about to go out, not of whatever the
    // English used to say. If Pratik edited the post, the stored set is stale and is rebuilt
    // here. If that rebuild fails the post goes back to pending and nothing is queued or
    // sent: stale translations going out under an approval is worse than an approval that
    // did not land.
    const ready = await withCurrentTranslations(row);
    if (!ready.ok) {
      const out = await save(res, id, { status: alreadySent ? row.status : 'pending', send_error: `Not sent. ${ready.error}` });
      if (out === null) return;
      return res.json({
        ok: true, post: out[0] || null, queued: false, sent: false,
        error: `The translations were out of date and could not be rebuilt, so nothing was ${action === 'approved' ? 'queued' : 'sent'}. ${ready.error}`,
      });
    }

    if (action === 'approved') {
      const out = await save(res, id, { status: 'approved', posted_at: null, send_error: null, ...ready.patch });
      if (out === null) return;
      // Where it landed in the line, so the deck can say so on the card straight away.
      const all = await rest(res, '?select=id,idea_key,status,sent_at');
      if (all === null) return;
      const queue = queueOf(all.map(r => (r.id === id ? { ...r, status: 'approved' } : r)));
      const at = queue.findIndex(r => r.id === id);
      return res.json({
        ok: true, post: out[0] || null, queued: true, sent: false, retranslated: ready.retranslated,
        queue_pos: at === -1 ? null : at + 1, queued_total: queue.length,
      });
    }

    // send_now takes the next day number. resend repeats the day the post originally had,
    // so the publisher sees the same groups she was given the first time.
    let day = Number(row.send_day) || 1;
    if (action === 'send_now') {
      const all = await rest(res, '?select=send_day');
      if (all === null) return;
      day = nextDay(all);
    }
    const r = await deliver(res, { ...ready.row, status: action === 'send_now' ? 'approved' : ready.row.status }, day, ready.patch);
    if (!r.ok) return;
    return res.json({
      ok: true, post: r.post, sent: r.sent, day, retranslated: ready.retranslated,
      error: r.error, warning: r.warning,
    });
  }

  // Actions that only write.
  const patch = {};

  if (action === 'edit') {
    if (typeof text !== 'string' || !text.trim()) return res.status(400).json({ error: 'text is required' });
    if (text.length > MAX_TEXT) return res.status(400).json({ error: `text is longer than ${MAX_TEXT} characters` });
    patch.edited_text = text.trim();
    // The stored translations were made from the old wording. They are not deleted, because
    // they are still the best fallback, but approving will notice the mismatch and rebuild.
  } else if (action === 'image_custom') {
    if (!isImageUrl(image)) return res.status(400).json({ error: 'that is not an https image address' });
    const row = await fetchOne(res, id);
    if (!row) return;
    const options = row.image_options || [];
    patch.image_url = image;
    // Keep it in the options so it survives a reseed and can be switched back to.
    patch.image_options = options.includes(image) ? options : [image, ...options];
  } else if (action === 'note') {
    patch.note = note ?? null;
  } else if (DECISIONS.has(action)) {
    patch.status = action;
    patch.posted_at = action === 'posted' ? new Date().toISOString() : null;
    if (action === 'rejected') patch.reject_comment = comment ?? null;
    if (action === 'pending') { patch.reject_comment = null; patch.send_error = null; }
    if (note != null) patch.note = note;
  } else {
    return res.status(400).json({ error: `unknown action: ${String(action)}` });
  }

  const out = await save(res, id, patch);
  if (out === null) return;
  res.json({ ok: true, post: out[0] || null });
}
