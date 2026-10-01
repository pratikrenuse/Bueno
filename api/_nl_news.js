// GET  /api/newsletter?action=news            which issue needs its news researched now
// POST /api/newsletter?action=news            write researched news into an issue
//
// POST body:
// { key, news: { en: [{title, body}] x3, no: [...], sv: [...] },
//   region: { en: [para, para], no: [...], sv: [...] }   optional, refreshed figures
//   sources: { news: [url], region: [url] } }
//
// Used by the fortnightly research job. Refuses an issue that is no longer pending, so an
// approved issue can never change underneath John. If John has already edited a language,
// his edit gets the new news too, and the rest of his edit is left exactly as it was.
import { gate, rest, readBody, getIssue, patch } from './_nl_db.js';
import { LANGS } from './_newsletter_shell.js';

const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Madrid' });
const okItems = (a) => Array.isArray(a) && a.length === 3 && a.every(n => n && n.title && n.body && n.title.length < 200 && n.body.length < 900);

export default async function handler(req, res) {
  if (!gate(req, res)) return;

  if (req.method === 'GET') {
    const rows = await rest(res, '?select=issue_key,number,send_date,alert_date,status,news_status,region,content&order=send_date.asc');
    if (rows === null) return;
    const due = rows.find(r => r.status === 'pending' && r.alert_date && r.alert_date <= today() && r.send_date >= today() && r.news_status === 'to_refresh');
    if (!due) return res.json({ due: null });
    const used = rows.filter(r => r.issue_key !== due.issue_key).flatMap(r => (r.content?.en?.news || []).map(n => n.title));
    return res.json({ due: { key: due.issue_key, number: due.number, send_date: due.send_date, region: due.region, region_title: due.content?.en?.region?.title, region_paras: due.content?.en?.region?.paras }, recent_titles: used });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'GET or POST' });
  const { key, news, region, sources } = readBody(req);
  if (!key) return res.status(400).json({ error: 'key is required' });
  for (const l of LANGS) if (!okItems(news && news[l])) return res.status(400).json({ error: `news.${l} must be three items with a title and a body` });

  const row = await getIssue(res, key);
  if (!row) return;
  if (row.status !== 'pending') return res.status(409).json({ error: `Issue ${key} is ${row.status}, so its news is left alone.` });

  const apply = (c, l) => {
    if (!c) return c;
    const next = { ...c, news: news[l].map(n => ({ title: n.title, body: n.body })) };
    if (region && Array.isArray(region[l]) && region[l].length) next.region = { ...c.region, paras: region[l] };
    return next;
  };
  const content = {}; for (const l of LANGS) content[l] = apply(row.content[l], l);
  let edited = row.edited;
  if (edited) { edited = { ...edited }; for (const l of Object.keys(edited)) edited[l] = apply(edited[l], l); }

  const out = await patch(res, key, {
    content, edited, news_status: 'researched', news_refreshed_at: new Date().toISOString(),
    sources: { ...(row.sources || {}), ...(sources || {}) },
  });
  if (out === null) return;
  res.json({ ok: true, issue: key });
}
