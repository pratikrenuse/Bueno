// POST /api/fb?action=seed
//
// Writes the content module into the table. Safe to run repeatedly.
//
// ONE ROW PER IDEA, IN ENGLISH
// Pratik reviews English and nothing else, so English is the row. The five translations ride
// along in a jsonb column, stamped with the hash of the English they were made from. A post
// is one decision, not six.
//
// WHAT A RESEED WILL AND WILL NOT OVERWRITE
// Anything Pratik did survives: his status, his edit, his note, his rejection reason, his
// chosen image, the date he marked it live, and the record of what was emailed. The original
// English and the image options are refreshed, because that is what this action is for. An
// edit is never overwritten, and neither are translations he has already had sent.
import { gate, rest, readBody } from './_fb_db.js';
import { IDEAS, TRANSLATION_LANGS, renderPost, linkFor } from './_fb_content.js';
import { imageOptionsFor, imageFor } from './_fb_images.js';
import { hashOf } from './_fb_translate.js';

const firstLine = (t) => (t.split('\n').find(l => l.trim()) || '').trim();

export default async function handler(req, res) {
  if (!gate(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { dry } = readBody(req);

  const existing = await rest(res, '?select=id,idea_key,status,note,posted_at,image_url,edited_text,'
    + 'reject_comment,sent_at,sent_to,send_error,translations,translations_of');
  if (existing === null) return;
  const byKey = new Map(existing.map(r => [r.idea_key, r]));

  const rows = [];
  for (const idea of IDEAS) {
    const options = imageOptionsFor(idea.key);
    const english = renderPost(idea, 'en');
    const prev = byKey.get(idea.key);

    // The written translations of the written English. If Pratik has edited the post, his
    // edit is what gets translated at approve time and these stay as the fallback.
    const written = {};
    for (const lang of TRANSLATION_LANGS) written[lang] = renderPost(idea, lang);

    const keptImage = prev && prev.image_url && options.includes(prev.image_url) ? prev.image_url : null;
    const keepTranslations = prev && prev.translations_of && Object.keys(prev.translations || {}).length;

    rows.push({
      ...(prev ? { id: prev.id } : {}),
      idea_key: idea.key,
      language: 'en',
      tool_slug: idea.tool,
      tool_url: linkFor(idea.tool, 'en'),
      kind: idea.kind,
      hook: firstLine(english),
      post_text: english,
      translations: keepTranslations ? prev.translations : written,
      translations_of: keepTranslations ? prev.translations_of : hashOf(english),
      image_url: keptImage || imageFor(idea.key),
      image_options: options,
      rule_ids: idea.rules || [],
      status: prev ? prev.status : 'pending',
      note: prev ? prev.note : null,
      posted_at: prev ? prev.posted_at : null,
      edited_text: prev ? prev.edited_text : null,
      reject_comment: prev ? prev.reject_comment : null,
      sent_at: prev ? prev.sent_at : null,
      sent_to: prev ? prev.sent_to : null,
      send_error: prev ? prev.send_error : null,
      updated_at: new Date().toISOString(),
    });
  }

  if (dry) return res.json({ ok: true, dry: true, would_write: rows.length, existing: existing.length });

  const out = await rest(res, '?on_conflict=idea_key,language', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify(rows),
  });
  if (out === null) return;

  res.json({
    ok: true,
    written: Array.isArray(out) ? out.length : rows.length,
    ideas: IDEAS.length,
    languages: TRANSLATION_LANGS.length + 1,
    kept_decisions: existing.filter(r => r.status !== 'pending').length,
  });
}
