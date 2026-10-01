// POST /api/newsletter?action=seed   body { dry?: true }
//
// Writes the issues in _newsletter_issues.js into the table. Safe to run any number of times.
//
// WHAT IT WILL NEVER OVERWRITE
// An issue John has touched keeps everything: his edit, his decision, his note. Only an
// issue that is still pending, unedited and never emailed gets its content refreshed from
// the module. New issues are inserted. Nothing is ever deleted.
import { gate, rest, readBody } from './_nl_db.js';
import { ISSUES } from './_newsletter_issues.js';
import { buildContent } from './_newsletter_render.js';

const row = (i) => ({
  issue_key: i.key,
  number: i.number,
  send_date: i.send_date,
  alert_date: i.alert_date,
  news_status: i.news_status || 'researched',
  guide: i.guide,
  region: i.region,
  reader_topic: i.reader_topic,
  content: buildContent(i),
  sources: i.sources || null,
});

export default async function handler(req, res) {
  if (!gate(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { dry } = readBody(req);

  const existing = await rest(res, '?select=issue_key,status,edited,alert_sent_at,approval_sent_at,news_refreshed_at');
  if (existing === null) return;
  const byKey = new Map(existing.map(r => [r.issue_key, r]));

  const inserts = [];
  const refreshes = [];
  const kept = [];
  for (const i of ISSUES) {
    const prev = byKey.get(i.key);
    if (!prev) { inserts.push(row(i)); continue; }
    const untouched = prev.status === 'pending' && !prev.edited && !prev.alert_sent_at
      && !prev.approval_sent_at && !prev.news_refreshed_at;
    if (untouched) refreshes.push(row(i)); else kept.push(i.key);
  }

  if (dry) return res.json({ ok: true, dry: true, would_insert: inserts.map(r => r.issue_key), would_refresh: refreshes.map(r => r.issue_key), kept });

  if (inserts.length) {
    const out = await rest(res, '', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(inserts) });
    if (out === null) return;
  }
  for (const r of refreshes) {
    const out = await rest(res, `?issue_key=eq.${encodeURIComponent(r.issue_key)}`, {
      method: 'PATCH', headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ ...r, updated_at: new Date().toISOString() }),
    });
    if (out === null) return;
  }
  res.json({ ok: true, inserted: inserts.map(r => r.issue_key), refreshed: refreshes.map(r => r.issue_key), kept });
}
