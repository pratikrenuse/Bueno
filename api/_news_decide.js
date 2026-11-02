// POST /api/news?action=decide    { id, action: approve|reject|pending|edit, text? }
// POST /api/news?action=ingest    { text, subject?, from? }  paste a newsletter by hand
// POST /api/news?action=reprocess { email_id }                retry an email that failed
//
// Approving translates the story into the five other channel languages, from the edited
// English if there is one, and puts it in line for Poornima's daily email. The translation
// is stamped with a hash of the English it was made from, so an edit after approval sends
// the story back to review instead of going out with an old translation.
import { createHash } from 'node:crypto';
import { gate, db, now, readBody } from './_news_db.js';
import { translateItem, clean } from './_news_sort.js';
import { tidy, isAllowedSender, sourceOf, addressOf } from './_news_parse.js';
import { processEmail, claim } from './_news_process.js';
import { reprocess as retry } from './_news_inbound.js';

export const hashOf = (s) => createHash('sha1').update(String(s || ''), 'utf8').digest('hex');
export const englishOf = (row) => (row.edited_en && row.edited_en.trim()) ? row.edited_en : (row.en || '');

async function getItem(id) {
  const r = await db('items', `?id=eq.${encodeURIComponent(id)}&select=*`);
  if (!r.ok) return { error: r.error };
  return r.data[0] ? { row: r.data[0] } : { error: 'No such story.' };
}
async function save(id, patch) {
  const r = await db('items', `?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH', headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ ...patch, updated_at: now() }),
  });
  return r.ok ? { row: r.data[0] } : { error: r.error };
}

export async function decide(req, res) {
  if (!gate(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { id, action, text } = readBody(req);
  if (!id || !action) return res.status(400).json({ error: 'id and action are required' });
  const got = await getItem(id);
  if (got.error) return res.status(404).json({ error: got.error });
  const row = got.row;
  if (row.status === 'used' && action !== 'pending') return res.status(409).json({ error: 'This story has already gone out in a daily email.' });

  let patch;
  if (action === 'approve') {
    const en = englishOf(row);
    if (!en.trim()) return res.status(400).json({ error: 'There is no English text to approve. Write one with Edit first.' });
    patch = { status: 'approved', decided_at: now() };
    if (row.translations_of !== hashOf(en) || !row.translations) {
      const t = await translateItem(en, row.is_proposal);
      if (!t.ok) return res.status(502).json({ error: `Not approved, the translation failed: ${t.error}` });
      patch.translations = t.translations;
      patch.translations_of = hashOf(en);
    }
  } else if (action === 'reject') {
    patch = { status: 'rejected', decided_at: now() };
  } else if (action === 'pending') {
    patch = { status: row.keep || row.edited_en ? 'pending' : 'skipped', decided_at: null, used_on: null };
  } else if (action === 'edit') {
    const t = clean(text);
    if (!t) return res.status(400).json({ error: 'The text is empty.' });
    // An edit always goes back to review: the translations no longer match.
    patch = { edited_en: t, status: 'pending', decided_at: null };
  } else {
    return res.status(400).json({ error: `Unknown action: ${action}` });
  }
  const out = await save(id, patch);
  if (out.error) return res.status(500).json({ error: out.error });
  res.json({ ok: true, item: out.row });
}

export async function ingest(req, res) {
  if (!gate(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { text, subject, from } = readBody(req);
  const body = tidy(text);
  if (!body || body.length < 200) return res.status(400).json({ error: 'Paste the whole newsletter text.' });
  const sender = from || 'news@diario.idealista.com';
  if (!isAllowedSender(sender)) return res.status(400).json({ error: `Sender ${addressOf(sender)} is not on the allow list.` });
  const email_id = `manual-${hashOf(body).slice(0, 20)}`;
  const c = await claim({
    email_id, source: sourceOf(sender), from_addr: addressOf(sender),
    subject: subject || 'Pasted by hand', received_at: now(), body_text: body,
  });
  if (c === 'duplicate') return res.status(409).json({ error: 'This exact text was already pasted.', email_id });
  if (c !== 'claimed') return res.status(500).json({ error: c });
  const out = await processEmail({ email_id, source: sourceOf(sender), subject: subject || 'Pasted by hand', received_at: now(), text: body }, { notify: false });
  res.status(out.ok ? 200 : 502).json({ email_id, ...out });
}

export async function reprocess(req, res) {
  if (!gate(req, res)) return;
  const { email_id } = { ...(req.query || {}), ...readBody(req) };
  if (!email_id) return res.status(400).json({ error: 'email_id is required' });
  const out = await retry(email_id);
  res.status(out.ok ? 200 : 502).json(out);
}
