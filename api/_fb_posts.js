// GET /api/fb?action=posts&status=pending
//
// There is no language parameter any more. Pratik reviews English; the translations travel
// with the row and are only ever read, never filtered on.
import { gate, rest } from './_fb_db.js';

const STATUSES = ['pending', 'approved', 'rejected', 'posted', 'all'];

export default async function handler(req, res) {
  if (!gate(req, res)) return;

  const status = STATUSES.includes(req.query.status) ? req.query.status : 'all';

  const filters = [];
  if (status !== 'all') filters.push(`status=eq.${status}`);
  filters.push('order=idea_key.asc');
  filters.push('select=*');

  const rows = await rest(res, `?${filters.join('&')}`);
  if (rows === null) return;

  // The dashboard needs every count, not only the ones in the current view, so they are
  // taken from a second read rather than from whatever the filter happened to return.
  const all = status === 'all' ? rows : await rest(res, '?select=status');
  if (all === null) return;

  const counts = { pending: 0, approved: 0, rejected: 0, posted: 0, all: all.length };
  for (const r of all) if (counts[r.status] != null) counts[r.status] += 1;

  res.json({ posts: rows, counts, total: rows.length });
}
