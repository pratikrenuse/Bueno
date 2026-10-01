// GET /api/newsletter?action=issues
// Every issue, oldest send date first, with counts for the deck header.
import { gate, rest, emailsLive } from './_nl_db.js';

export default async function handler(req, res) {
  if (!gate(req, res)) return;
  const rows = await rest(res, '?select=*&order=send_date.asc');
  if (rows === null) return;
  const counts = { pending: 0, approved: 0, rejected: 0, scheduled: 0, all: rows.length };
  for (const r of rows) if (counts[r.status] != null) counts[r.status] += 1;
  res.json({ issues: rows, counts, emails_live: emailsLive() });
}
