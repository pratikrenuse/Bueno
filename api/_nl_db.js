// The only place the newsletter surface talks to Supabase, and the only table it names.
// Shares nothing with the LinkedIn (_lk_) or Facebook (_fb_) surfaces.

export const TABLE = 'newsletter_issues';

export const PRATIK = 'pratik.y.renuse@gmail.com';
export const JOHN = 'john@getbueno.com';
export const SITE = 'https://www.247spain.es';

// Emails stay off until Pratik says go. With this unset, every action that would send an
// email does everything else and returns the email it would have sent, so the whole flow
// can be tested end to end without anyone receiving anything.
export const emailsLive = () => String(process.env.NEWSLETTER_EMAILS_LIVE || '').toLowerCase() === 'true';

export function gate(req, res) {
  const pass = req.headers['x-passcode'] || (req.query && req.query.pass);
  if (!process.env.INTERNAL_PASSCODE) {
    res.status(500).json({ error: 'Missing env var: INTERNAL_PASSCODE.' });
    return false;
  }
  if (pass === process.env.INTERNAL_PASSCODE) return true;
  const auth = req.headers.authorization || '';
  if (process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`) return true;
  res.status(401).json({ error: 'unauthorized' });
  return false;
}

function creds(res) {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url) { res.status(500).json({ error: 'Missing env var: SUPABASE_URL (or VITE_SUPABASE_URL)' }); return null; }
  if (!key) { res.status(500).json({ error: 'Missing env var: SUPABASE_SERVICE_KEY.' }); return null; }
  return { url: url.replace(/\/$/, ''), key };
}

export async function rest(res, path, init = {}) {
  const c = creds(res);
  if (!c) return null;
  const r = await fetch(`${c.url}/rest/v1/${TABLE}${path}`, {
    ...init,
    headers: {
      apikey: c.key,
      Authorization: `Bearer ${c.key}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const text = await r.text();
  if (!r.ok) { res.status(500).json({ error: `Supabase ${r.status}: ${text.slice(0, 400)}` }); return null; }
  try { return text ? JSON.parse(text) : []; } catch { return []; }
}

export async function getIssue(res, key) {
  const rows = await rest(res, `?issue_key=eq.${encodeURIComponent(key)}&select=*`);
  if (rows === null) return null;
  if (!rows[0]) { res.status(404).json({ error: `No issue ${key}` }); return null; }
  return rows[0];
}

export async function patch(res, key, body) {
  return rest(res, `?issue_key=eq.${encodeURIComponent(key)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ ...body, updated_at: new Date().toISOString() }),
  });
}

export function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body) { try { return JSON.parse(req.body); } catch { return {}; } }
  return {};
}

export const longDate = (iso, lang = 'en') => {
  if (!iso) return '';
  const d = new Date(`${iso}T12:00:00Z`);
  const loc = { en: 'en-GB', no: 'nb-NO', sv: 'sv-SE' }[lang] || 'en-GB';
  return d.toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
};

export async function sendMail({ to, cc, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: 'Missing env var: RESEND_API_KEY' };
  const from = process.env.RESEND_FROM;
  if (!from) return { ok: false, error: 'Missing env var: RESEND_FROM (the sandbox sender only reaches the account owner)' };
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, ...(cc && cc.length ? { cc } : {}), reply_to: PRATIK, subject, html }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: `Resend ${r.status}: ${JSON.stringify(j).slice(0, 300)}` };
    return { ok: true, id: j.id || null };
  } catch (e) {
    return { ok: false, error: String((e && e.message) || e) };
  }
}

export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** The card every internal newsletter email sits in. */
export function shell(heading, inner) {
  return `<div style="background:#F4F2EE;padding:24px 12px;font-family:Georgia,serif">
  <div style="max-width:620px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #E0DFDC">
    <div style="background:#010221;color:#fff;padding:16px 22px;font-size:18px;letter-spacing:.06em">BUENO <span style="color:#C9A96E">|</span> <span style="font-size:12px;color:#CBEFFF">${esc(heading)}</span></div>
    <div style="padding:22px;font-size:15px;line-height:1.6;color:#2B2E45">${inner}</div>
  </div></div>`;
}
