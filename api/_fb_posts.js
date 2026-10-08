// GET /api/fb?action=posts&status=pending
//
// There is no language parameter. Pratik reviews English; the translations travel with the
// row and are only ever read, never filtered on.
//
// Approving no longer sends. An approved post waits in a queue and one goes out each day, so
// every approved post that has not gone yet carries its place in that queue, and the counts
// say how many are waiting and how many have been sent.
import { gate, rest } from './_fb_db.js';
import { queueOf, nextDay } from './_fb_queue.js';

const STATUSES = ['pending', 'approved', 'rejected', 'posted', 'all'];

export default async function handler(req, res) {
  if (!gate(req, res)) return;

  const status = STATUSES.includes(req.query.status) ? req.query.status : 'all';

  const all = await rest(res, '?order=idea_key.asc&select=*');
  if (all === null) return;

  const queue = queueOf(all);
  const place = new Map(queue.map((r, i) => [r.id, i + 1]));
  const withPlace = all.map(r => (place.has(r.id) ? { ...r, queue_pos: place.get(r.id) } : r));
  const rows = status === 'all' ? withPlace : withPlace.filter(r => r.status === status);

  const counts = { pending: 0, approved: 0, rejected: 0, posted: 0, all: all.length };
  for (const r of all) if (counts[r.status] != null) counts[r.status] += 1;
  counts.queued = queue.length;
  counts.sent = all.filter(r => r.sent_at).length;

  res.json({ posts: rows, counts, total: rows.length, next_day: nextDay(all) });
}
