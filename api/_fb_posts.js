// GET /api/fb?action=posts&status=pending&lang=en
import { gate, rest } from './_fb_db.js';

const STATUSES = ['pending', 'approved', 'rejected', 'posted', 'all'];
const LANGS = ['en', 'no', 'sv', 'de', 'fr', 'nl'];

export default async function handler(req, res) {
  if (!gate(req, res)) return;

  const status = STATUSES.includes(req.query.status) ? req.query.status : 'all';
  const lang = LANGS.includes(req.query.lang) ? req.query.lang : null;

  const filters = [];
  if (status !== 'all') filters.push(`status=eq.${status}`);
  if (lang) filters.push(`language=eq.${lang}`);
  filters.push('order=idea_key.asc,language.asc');
  filters.push('select=*');

  const rows = await rest(res, `?${filters.join('&')}`);
  if (rows === null) return;

  const counts = { pending: 0, approved: 0, rejected: 0, posted: 0 };
  for (const r of rows) if (counts[r.status] != null) counts[r.status] += 1;

  res.json({ posts: rows, counts, total: rows.length });
}
