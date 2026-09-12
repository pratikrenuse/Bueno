// POST /api/fb?action=decide
//
// Body: { id, action, text, note, image, comment }
//   edit          save an edited version of the post, keeping the original beside it
//   image         switch to one of this post's own options
//   image_custom  switch to a URL Pratik pasted himself
//   note          save the instruction that travels with the post
//   approved      approve AND email it to the person who will publish it
//   rejected      park it with a reason
//   posted        record that it is live
//   pending       undo
//   resend        send it again, deliberately
//
// WHY APPROVING SENDS
// Because that is the decision. A separate send button means a post can sit approved and
// unsent, which is exactly the state the LinkedIn program lost posts in. One click, one
// consequence, and the result of the send comes straight back into the deck so a failure is
// visible in the moment rather than discovered a week later.
//
// WHAT CANNOT HAPPEN
// A post is never emailed twice by accident: once sent_at is set, approving again does not
// resend. Resending is its own action, so it is always something Pratik chose to do.
// Nothing is ever appended to the text on the way out. What he approved is what is sent.
import { gate, rest, readBody } from './_fb_db.js';
import { sendPost, SEND_TO, finalText } from './_fb_email.js';
import { isCurrent, translate } from './_fb_translate.js';

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

async function save(res, id, patch) {
  return rest(res, `?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() }),
  });
}

export default async function handler(req, res) {
  if (!gate(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { id, action, text, note, image, comment } = readBody(req);
  if (!id) return res.status(400).json({ error: 'id is required' });

  // Actions that need to see the row first.
  if (action === 'image' || action === 'approved' || action === 'resend') {
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

    // Approving an already sent post does not send it again.
    const alreadySent = !!row.sent_at;
    if (action === 'approved' && alreadySent) {
      const out = await save(res, id, { status: 'approved', posted_at: null, send_error: null });
      if (out === null) return;
      return res.json({ ok: true, post: out[0] || null, sent: false, reason: 'already sent' });
    }

    const english = finalText(row);
    if (!english) return res.status(400).json({ error: 'there is no text to send' });

    // The translations must be of the English that is about to be sent, not of whatever the
    // English used to say. If Pratik edited the post, the stored set is stale and is rebuilt
    // before anything leaves. If that rebuild fails, nothing is sent at all: five stale
    // translations going out under an approval is worse than an approval that did not land.
    let sendable = row;
    let retranslated = false;
    if (!isCurrent(row, english)) {
      const t = await translate(english, row.tool_slug);
      if (!t.ok) {
        const out = await save(res, id, { status: 'pending', send_error: `Not sent. ${t.error}` });
        if (out === null) return;
        return res.json({
          ok: true, post: out[0] || null, sent: false,
          error: `The translations were out of date and could not be rebuilt, so nothing was sent. ${t.error}`,
        });
      }
      sendable = { ...row, translations: t.translations, translations_of: t.hash };
      retranslated = true;
    }

    const result = await sendPost(sendable);
    const translationPatch = retranslated
      ? { translations: sendable.translations, translations_of: sendable.translations_of }
      : {};
    const patch = result.ok
      ? { status: 'approved', sent_at: new Date().toISOString(), sent_to: SEND_TO.join(', '), send_error: null, posted_at: null, ...translationPatch }
      : { status: 'approved', send_error: result.error, posted_at: null, ...translationPatch };

    const out = await save(res, id, patch);
    if (out === null) return;
    return res.json({
      ok: true,
      post: out[0] || null,
      sent: result.ok,
      retranslated,
      error: result.ok ? null : result.error,
      warning: result.warning || null,
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
