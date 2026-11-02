// GET /api/news?action=items&status=pending|approved|used|rejected|skipped|all
// GET /api/news?action=health
// Both need the internal passcode. Neither changes anything.
import { gate, db } from './_news_db.js';
import { allowedSenders } from './_news_parse.js';
import { getApiKey } from './_news_sort.js';

const STATUSES = ['pending', 'approved', 'used', 'rejected', 'skipped'];

export async function items(req, res) {
  if (!gate(req, res)) return;
  const status = String((req.query && req.query.status) || 'pending');
  const filter = STATUSES.includes(status) ? `&status=eq.${status}` : '';
  const order = status === 'approved' ? 'decided_at.asc' : status === 'used' ? 'used_on.desc' : 'created_at.desc,position.asc';
  const [list, all, emails] = await Promise.all([
    db('items', `?select=*${filter}&order=${order}&limit=300`),
    db('items', '?select=status'),
    db('emails', '?select=email_id,source,subject,received_at,status,error,stories,kept,created_at&order=created_at.desc&limit=15'),
  ]);
  for (const r of [list, all, emails]) if (!r.ok) return res.status(500).json({ error: r.error });
  const counts = { all: all.data.length };
  for (const s of STATUSES) counts[s] = all.data.filter(x => x.status === s).length;
  res.json({ items: list.data, counts, emails: emails.data });
}

export async function health(req, res) {
  if (!gate(req, res)) return;
  const env = {
    SUPABASE_URL: !!(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL),
    SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_KEY,
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    RESEND_FROM: !!process.env.RESEND_FROM,
    ANTHROPIC_API_KEY: !!getApiKey(),
    INTERNAL_PASSCODE: true,
  };
  const [e, i] = await Promise.all([
    db('emails', '?select=email_id,subject,status,created_at&order=created_at.desc&limit=1'),
    db('items', '?select=id&limit=1'),
  ]);
  const ok = Object.values(env).every(Boolean) && e.ok && i.ok;
  res.json({
    ok, env,
    tables: { news_emails: e.ok || e.error, news_items: i.ok || i.error },
    last_email: e.ok ? (e.data[0] || null) : null,
    allowed_senders: allowedSenders(),
    webhook_url: 'https://www.247spain.es/api/news?action=inbound',
  });
}
