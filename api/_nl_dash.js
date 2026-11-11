// GET  /api/newsletter?action=dashboard   everything the /internal-newsletter dashboard shows
// POST /api/newsletter?action=dashboard   { op, ... } a decision from the dashboard
//
// Tables (all created 10 Nov 2026, RLS on, service role only):
//   newsletter_articles  one row per blog article, with its guide status
//   newsletter_editions  one row per fortnightly edition (EN, NO, SV)
//   newsletter_settings  recipients, schedule and sender
//
// Article status, in order:
//   available  never used in a newsletter guide
//   selected   picked for an edition, waiting for Pratik
//   approved   Pratik approved it as the guide for that edition
//   used       went out in a newsletter (or was marked Yes in the weekly report)
//
// Ops: approve-article, reject-article, mark-used, make-available, pick-article,
//      approve-edition, set-launch. Nothing here sends an email.
import { gate, readBody } from './_nl_db.js';

const TABLES = new Set(['newsletter_articles', 'newsletter_editions', 'newsletter_settings']);
const STATUSES = ['available', 'selected', 'approved', 'used'];
export const JOHN = 'john@getbueno.com';
export const PRATIK = 'pratik.y.renuse@gmail.com';

function creds(res) {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url) { res.status(500).json({ error: 'Missing env var: SUPABASE_URL (or VITE_SUPABASE_URL)' }); return null; }
  if (!key) { res.status(500).json({ error: 'Missing env var: SUPABASE_SERVICE_KEY.' }); return null; }
  return { url: url.replace(/\/$/, ''), key };
}

export async function db(res, table, path = '', init = {}) {
  if (!TABLES.has(table)) throw new Error(`Table not allowed: ${table}`);
  const c = creds(res);
  if (!c) return null;
  const r = await fetch(`${c.url}/rest/v1/${table}${path}`, {
    ...init,
    headers: { apikey: c.key, Authorization: `Bearer ${c.key}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  const text = await r.text();
  if (!r.ok) { res.status(500).json({ error: `Supabase ${r.status} on ${table}: ${text.slice(0, 300)}` }); return null; }
  try { return text ? JSON.parse(text) : []; } catch { return []; }
}

const today = () => new Date().toISOString().slice(0, 10);

// The next send date: every `every_days` days from the anchor, never in the past.
export function nextSend(schedule, now = new Date()) {
  const anchor = new Date(`${(schedule && schedule.anchor) || '2026-11-10'}T00:00:00Z`);
  const every = Number((schedule && schedule.every_days) || 14);
  const day0 = new Date(`${now.toISOString().slice(0, 10)}T00:00:00Z`);
  const diff = Math.round((day0 - anchor) / 86400000);
  if (diff <= 0) return anchor.toISOString().slice(0, 10);
  const steps = Math.ceil(diff / every);
  return new Date(anchor.getTime() + steps * every * 86400000).toISOString().slice(0, 10);
}

async function load(res) {
  const articles = await db(res, 'newsletter_articles', '?select=*&order=sort.asc');
  if (articles === null) return null;
  const editions = await db(res, 'newsletter_editions', '?select=id,edition_key,send_date,status,subject,stories,article_slug,guide_slug,guide_urls,region,reader_question,recipients,resend_ids,note,approved_at,sent_at,created_at&order=send_date.desc');
  if (editions === null) return null;
  const rows = await db(res, 'newsletter_settings', '?select=*');
  if (rows === null) return null;
  const settings = Object.fromEntries(rows.map(r => [r.key, r.value]));
  const counts = Object.fromEntries(STATUSES.map(s => [s, 0]));
  for (const a of articles) if (counts[a.status] != null) counts[a.status] += 1;
  counts.all = articles.length;
  return { articles, editions, settings, counts, next_send: nextSend(settings.schedule) };
}

async function patchArticle(res, slug, body) {
  const rows = await db(res, 'newsletter_articles', `?slug=eq.${encodeURIComponent(slug)}`, {
    method: 'PATCH', headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ ...body, decided_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
  });
  if (rows === null) return null;
  if (!rows[0]) { res.status(404).json({ error: `No article ${slug}` }); return null; }
  return rows[0];
}

export default async function handler(req, res) {
  if (!gate(req, res)) return;
  if ((req.method || 'GET') === 'GET') {
    const key = req.query && req.query.edition;
    if (key) {
      const rows = await db(res, 'newsletter_editions', `?edition_key=eq.${encodeURIComponent(key)}&select=edition_key,html`);
      if (rows === null) return;
      if (!rows[0]) return res.status(404).json({ error: `No edition ${key}` });
      return res.json({ edition_key: rows[0].edition_key, html: rows[0].html || {} });
    }
    const data = await load(res);
    if (data) res.json(data);
    return;
  }
  const b = readBody(req);
  const op = b.op;
  let out = null;
  if (op === 'approve-article') {
    out = await patchArticle(res, b.slug, { status: 'approved', source: 'Approved by Pratik in /internal-newsletter' });
    if (out && out.used_in && /^Edition /.test(out.used_in)) {
      const key = out.used_on;
      if (key) await db(res, 'newsletter_editions', `?edition_key=eq.${encodeURIComponent(key)}&status=eq.test_sent`, {
        method: 'PATCH', body: JSON.stringify({ status: 'approved', approved_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
      });
    }
  } else if (op === 'reject-article') {
    out = await patchArticle(res, b.slug, { status: 'available', used_in: null, used_on: null, guide_slug: null, note: b.note || 'Rejected by Pratik; free to pick again.' });
  } else if (op === 'mark-used') {
    out = await patchArticle(res, b.slug, { status: 'used', used_on: b.date || today(), used_in: b.used_in || 'Marked used by Pratik' });
  } else if (op === 'make-available') {
    out = await patchArticle(res, b.slug, { status: 'available', used_in: null, used_on: null, guide_slug: null });
  } else if (op === 'pick-article') {
    out = await patchArticle(res, b.slug, { status: 'selected', used_in: `Edition ${b.date || ''}`.trim(), used_on: b.date || null, source: 'Picked by Pratik for the next edition' });
  } else if (op === 'approve-edition') {
    const rows = await db(res, 'newsletter_editions', `?edition_key=eq.${encodeURIComponent(b.key)}`, {
      method: 'PATCH', headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ status: 'approved', approved_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
    });
    if (rows === null) return;
    if (!rows[0]) return res.status(404).json({ error: `No edition ${b.key}` });
    out = rows[0];
  } else if (op === 'set-launch') {
    const launched = !!b.launched;
    const value = { to: launched ? [PRATIK, JOHN] : [PRATIK], launched, john: JOHN };
    const rows = await db(res, 'newsletter_settings', '?key=eq.recipients', {
      method: 'PATCH', headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ value, updated_at: new Date().toISOString() }),
    });
    if (rows === null) return;
    out = rows[0];
  } else {
    return res.status(400).json({ error: `Unknown op: ${op}` });
  }
  if (out === null) return;
  const data = await load(res);
  if (data) res.json({ ok: true, changed: out, ...data });
}
