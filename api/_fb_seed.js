// POST /api/fb?action=seed
//
// Writes the content module into the table. Safe to run repeatedly.
//
// WHAT IT WILL AND WILL NOT OVERWRITE
// A row Pratik has already acted on keeps what he did. His status, his edit, his note, his
// rejection reason, his chosen image, the date he posted it and the record of what was
// emailed all survive a reseed. The original post text and the image options are refreshed
// from the content module, because that is the thing this action exists to push. A chosen
// image that is still one of the options is kept; one that is no longer offered falls back
// to the new default.
//
// An edit is never overwritten. post_text is the writing; edited_text is what Pratik made
// of it, and only he can change that.
import { gate, rest, readBody } from './_fb_db.js';
import { IDEAS, LANGS, renderPost, linkFor } from './_fb_content.js';
import { imageOptionsFor, imageFor } from './_fb_images.js';

const firstLine = (t) => (t.split('\n').find(l => l.trim()) || '').trim();

export default async function handler(req, res) {
  if (!gate(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { dry } = readBody(req);

  const existing = await rest(res, '?select=id,idea_key,language,status,note,posted_at,image_url,edited_text,reject_comment,sent_at,sent_to,send_error');
  if (existing === null) return;
  const byKey = new Map(existing.map(r => [`${r.idea_key}:${r.language}`, r]));

  const rows = [];
  for (const idea of IDEAS) {
    const options = imageOptionsFor(idea.key);
    for (const lang of LANGS) {
      const text = renderPost(idea, lang);
      if (!text) continue;
      const prev = byKey.get(`${idea.key}:${lang}`);
      const keptImage = prev && prev.image_url && options.includes(prev.image_url) ? prev.image_url : null;
      rows.push({
        ...(prev ? { id: prev.id } : {}),
        idea_key: idea.key,
        language: lang,
        tool_slug: idea.tool,
        tool_url: linkFor(idea.tool, lang),
        kind: idea.kind,
        hook: firstLine(text),
        post_text: text,
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
    languages: LANGS.length,
    kept_decisions: existing.filter(r => r.status !== 'pending').length,
  });
}
