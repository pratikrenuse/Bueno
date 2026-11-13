// The social posting tool: connect Instagram accounts, Facebook Pages and LinkedIn profiles
// once, queue posts for them, and have approved posts published on schedule.
//
// All behind the router api/social.js. The page is /internal-social.
//
//   health        what is set up and what is missing                       (passcode)
//   accounts      the connected accounts, never their tokens               (passcode)
//   connect-link  a link that starts a sign-in, to use or to send someone  (passcode)
//   connect       opens the platform's own permission screen               (signed link)
//   callback      the platform sends the person back here                  (signed state)
//   account       pause, resume or remove an account                       (passcode)
//   posts         the queue and the history                                (passcode)
//   create        add posts                                                (passcode)
//   decide        approve, hold, edit, retry or delete posts               (passcode)
//   upload-url    a signed address to upload one photo or video to         (passcode)
//   run           publish what is due                                      (cron or passcode)
//
// WHAT CANNOT HAPPEN
//   - A post nobody approved. Only posts with status approved are ever published.
//   - The same post twice. A post is claimed in the database before anything is sent, and a
//     publish call that got no clear answer is parked for a person to look at, never retried.
//   - A burst. Each run publishes at most one post per account.
//   - A silent failure. Anything that needs a person is emailed, with the reason in the email.
//
// Nothing here reads or writes the LinkedIn deck, the Facebook deck, the news, the
// newsletter or the reels.

import crypto from 'node:crypto';
import { gate, gateCron, db, rest, creds, ensureBucket, now, isUuid, readBody, sign, verify, baseUrl, redirectUri, sendMail, ALERT_TO, esc, BUCKET } from './_social_db.js';
import { PLATFORMS, PLATFORM_KEYS } from './_social_platforms.js';

export const MAX_ATTEMPTS = 3;
export const RUN_BUDGET_MS = 42000;       // the function is allowed 60 seconds
const STUCK_AFTER_MS = 20 * 60 * 1000;
const RENEW_WITHIN_DAYS = 14;
const WARN_WITHIN_DAYS = 7;
const REALERT_AFTER_DAYS = 3;
const LIMITS = { instagram: { caption: 2200, media: 10 }, facebook: { caption: 60000, media: 10 }, linkedin: { caption: 3000, media: 9 } };

const daysLeft = (iso) => (iso ? Math.floor((new Date(iso).getTime() - Date.now()) / 864e5) : null);
const publicAccount = (a) => ({
  id: a.id, platform: a.platform, username: a.username, external_id: a.external_id, status: a.status,
  token_expires_at: a.token_expires_at, days_left: daysLeft(a.token_expires_at),
  renews_itself: a.platform === 'instagram' || a.platform === 'facebook' || !!a.refresh_token,
  last_error: a.last_error, connected_at: a.connected_at,
});
const page = (title, body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(title)}</title></head>
<body style="margin:0;background:#F4F2EE;font-family:Arial,Helvetica,sans-serif;color:#010221"><div style="max-width:460px;margin:12vh auto;background:#fff;border-radius:14px;padding:28px;line-height:1.55">
<h1 style="margin:0 0 10px;font-size:22px">${esc(title)}</h1>${body}</div></body></html>`;
const sendPage = (res, status, title, body) => { res.status(status).setHeader('Content-Type', 'text/html; charset=utf-8'); return res.send(page(title, body)); };

// ---------- health ----------

export async function health(req, res) {
  if (!gate(req, res)) return;
  const base = baseUrl(req);
  const [a, p, b] = await Promise.all([db('accounts', '?select=id,platform,status'), db('posts', '?select=id,status&limit=2000'), rest(`/storage/v1/bucket/${BUCKET}`)]);
  const platforms = Object.fromEntries(PLATFORM_KEYS.map((k) => [k, { ready: PLATFORMS[k].env().missing.length === 0, missing: PLATFORMS[k].env().missing }]));
  const count = (rows, f) => (rows || []).filter(f).length;
  return res.json({
    ok: a.ok && p.ok && !!process.env.RESEND_API_KEY,
    env: {
      SUPABASE_URL: !!(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL),
      SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_KEY,
      INTERNAL_PASSCODE: !!process.env.INTERNAL_PASSCODE,
      RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    },
    platforms,
    redirect_uri: redirectUri(base),
    tables: { accounts: a.ok || a.error, posts: p.ok || p.error },
    storage: b.ok ? true : 'It is created the first time a file is uploaded.',
    accounts: { active: count(a.data, (x) => x.status === 'active'), need_reconnect: count(a.data, (x) => x.status === 'needs_reconnect') },
    posts: Object.fromEntries(['pending', 'approved', 'published', 'failed', 'check'].map((s) => [s, count(p.data, (x) => x.status === s)])),
  });
}

// ---------- accounts ----------

export async function accounts(req, res) {
  if (!gate(req, res)) return;
  const r = await db('accounts', '?select=*&status=neq.removed&order=platform.asc,username.asc');
  if (!r.ok) return res.status(500).json({ error: r.error });
  const platforms = Object.fromEntries(PLATFORM_KEYS.map((k) => [k, { ready: PLATFORMS[k].env().missing.length === 0, missing: PLATFORMS[k].env().missing }]));
  return res.json({ accounts: r.data.map(publicAccount), platforms, redirect_uri: redirectUri(baseUrl(req)) });
}

export async function connectLink(req, res) {
  if (!gate(req, res)) return;
  const b = readBody(req);
  const platform = String(b.platform || '');
  if (!PLATFORMS[platform]) return res.status(400).json({ error: `Unknown platform. Use one of: ${PLATFORM_KEYS.join(', ')}.` });
  const missing = PLATFORMS[platform].env().missing;
  if (missing.length) return res.status(400).json({ error: `${PLATFORMS[platform].name} is not set up yet. Missing in Vercel: ${missing.join(', ')}. After adding them, redeploy.` });
  const base = baseUrl(req);
  const days = b.share ? 3 : 0;
  const t = sign({ k: 'connect', p: platform, b: base }, days ? days * 86400 : 900);
  if (!t) return res.status(500).json({ error: 'Missing env var: SUPABASE_SERVICE_KEY or INTERNAL_PASSCODE.' });
  return res.json({ url: `${base}/api/social/connect?t=${encodeURIComponent(t)}`, valid_for: days ? `${days} days` : '15 minutes' });
}

export async function connect(req, res) {
  const t = verify(req.query && req.query.t);
  if (!t || t.k !== 'connect' || !PLATFORMS[t.p]) return sendPage(res, 400, 'This link has expired', '<p style="margin:0">Ask for a new connect link and open it again.</p>');
  const P = PLATFORMS[t.p];
  if (P.env().missing.length) return sendPage(res, 500, `${P.name} is not set up yet`, `<p style="margin:0">Missing in Vercel: ${esc(P.env().missing.join(', '))}.</p>`);
  const state = sign({ k: 'state', p: t.p, b: t.b, n: crypto.randomBytes(8).toString('hex') }, 900);
  res.statusCode = 302;
  res.setHeader('Location', P.authUrl({ redirect: redirectUri(t.b), state }));
  return res.end();
}

// The fixed key set every account row is written with, so a bulk upsert never fails on
// rows of different shapes. Reconnecting an account lands on the same row and makes it
// active again with its new token.
export const accountRow = (a) => ({
  platform: a.platform, external_id: a.external_id, username: a.username ?? null,
  access_token: a.access_token, refresh_token: a.refresh_token ?? null, token_expires_at: a.token_expires_at ?? null,
  status: 'active', last_error: null, alerted_at: null, updated_at: now(),
});

export async function callback(req, res) {
  const q = req.query || {};
  const s = verify(q.state);
  if (!s || s.k !== 'state' || !PLATFORMS[s.p]) return sendPage(res, 400, 'This sign-in has expired', '<p style="margin:0">Open the connect link again and allow access within 15 minutes.</p>');
  const P = PLATFORMS[s.p];
  if (q.error || !q.code) {
    return sendPage(res, 400, `${P.name} was not connected`, `<p style="margin:0">${esc(q.error_description || q.error_reason || q.error || 'No permission was given.')} Nothing was changed. You can open the connect link again.</p>`);
  }
  try {
    const found = await P.exchange({ code: q.code, redirect: redirectUri(s.b) });
    if (!found.length) return sendPage(res, 400, 'Nothing to connect', `<p style="margin:0">${s.p === 'facebook' ? 'This Facebook login does not manage any Page, or no Page was ticked on the permission screen. Open the link again and tick the Pages to connect.' : 'The platform returned no account.'}</p>`);
    const up = await db('accounts', '?on_conflict=platform,external_id', {
      method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(found.map(accountRow)),
    });
    if (!up.ok) return sendPage(res, 500, 'The account could not be saved', `<p style="margin:0">${esc(up.error)}</p>`);
    const names = found.map((f) => esc(f.username || f.external_id)).join(', ');
    return sendPage(res, 200, `${P.name} is connected`, `<p>${found.length === 1 ? 'Connected' : `Connected ${found.length} Pages`}: <strong>${names}</strong>.</p><p style="margin:0">You can close this tab. <a href="${esc(s.b)}/internal-social" style="color:#5B7FCC;font-weight:bold">Open the posting tool</a></p>`);
  } catch (e) {
    return sendPage(res, 500, `${P.name} was not connected`, `<p style="margin:0">${esc(String((e && e.message) || e))}</p>`);
  }
}

export async function account(req, res) {
  if (!gate(req, res)) return;
  const b = readBody(req);
  if (!isUuid(b.id)) return res.status(400).json({ error: 'Need the account id.' });
  const patch = { pause: { status: 'paused' }, resume: { status: 'active', last_error: null }, remove: { status: 'removed', access_token: null, refresh_token: null } }[b.op];
  if (!patch) return res.status(400).json({ error: 'op must be pause, resume or remove.' });
  const r = await db('accounts', `?id=eq.${b.id}`, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ ...patch, updated_at: now() }) });
  if (!r.ok) return res.status(500).json({ error: r.error });
  return res.json({ ok: true, account: r.data[0] ? publicAccount(r.data[0]) : null });
}

// ---------- posts ----------

export async function posts(req, res) {
  if (!gate(req, res)) return;
  const r = await db('posts', '?select=*&order=scheduled_at.desc&limit=400');
  if (!r.ok) return res.status(500).json({ error: r.error });
  return res.json({ posts: r.data });
}

const NOT_JPEG = /\.(png|webp|gif|heic|heif|bmp|tiff?)(\?|#|$)/i;
const VIDEO_EXT = /\.(mp4|mov|m4v)(\?|#|$)/i;

export function cleanMedia(list) {
  return (Array.isArray(list) ? list : []).map((m) => (typeof m === 'string' ? { url: m } : m)).filter((m) => m && m.url)
    .map((m) => ({ url: String(m.url).trim(), type: m.type === 'video' || (m.type !== 'image' && VIDEO_EXT.test(String(m.url))) ? 'video' : 'image' }));
}

// Says what is wrong with a post for one platform, or returns null when it is fine. Checked
// when the post is added, so a mistake shows up at the desk and not at publishing time.
export function problemWith(platform, { caption, media }) {
  const L = LIMITS[platform];
  if (!L) return 'Unknown platform.';
  if (media.some((m) => !/^https:\/\//i.test(m.url))) return 'Every photo or video needs a public https address.';
  if (caption.length > L.caption) return `The text is ${caption.length} characters and ${PLATFORMS[platform].name} allows ${L.caption}.`;
  if (media.length > L.media) return `${PLATFORMS[platform].name} takes up to ${L.media} files in one post.`;
  if (platform === 'instagram') {
    if (!media.length) return 'An Instagram post needs a photo or a video.';
    if (media.some((m) => m.type === 'image' && NOT_JPEG.test(m.url))) return 'Instagram only accepts JPEG photos. Upload the photo through the page, which converts it, or use a .jpg file.';
  }
  if (platform === 'linkedin' && media.some((m) => m.type === 'video')) return 'This tool posts text and photos to LinkedIn. Video on LinkedIn is not supported yet.';
  if (platform === 'facebook' && media.some((m) => m.type === 'video') && media.length > 1) return 'A Facebook post can carry one video or several photos, not both.';
  if (!media.length && !caption.trim()) return 'The post is empty.';
  return null;
}

// Fixed key set, for the same PGRST102 reason as accountRow.
export const postRow = (p) => ({
  account_id: p.account_id, caption: p.caption, media: p.media, scheduled_at: p.scheduled_at,
  status: p.status, source: p.source ?? null,
});

// Body: { account_ids: [...], caption, media: [{url, type}], scheduled_at, approve }
//   or: { posts: [ { account_id | account_ids, caption, media, scheduled_at }, ... ], approve }
// A post made on the page by the person who approves posts arrives approved. Anything added
// another way arrives pending and waits for Approve on the page.
export async function create(req, res) {
  if (!gate(req, res)) return;
  const b = readBody(req);
  const list = Array.isArray(b.posts) ? b.posts : [b];
  const acc = await db('accounts', '?select=id,platform,username,status&status=neq.removed');
  if (!acc.ok) return res.status(500).json({ error: acc.error });
  const byId = new Map(acc.data.map((a) => [a.id, a]));
  const rows = [], errors = [];
  for (const [i, p] of list.entries()) {
    const ids = Array.isArray(p.account_ids) ? p.account_ids : (p.account_id ? [p.account_id] : []);
    if (!ids.length) { errors.push(`Post ${i + 1}: choose at least one account.`); continue; }
    const caption = String(p.caption || '').replace(/\r\n/g, '\n').trim();
    const media = cleanMedia(p.media);
    const when = p.scheduled_at ? new Date(p.scheduled_at) : new Date();
    if (Number.isNaN(when.getTime())) { errors.push(`Post ${i + 1}: the date is not valid.`); continue; }
    for (const id of ids) {
      const a = byId.get(id);
      if (!a) { errors.push(`Post ${i + 1}: one of the accounts is not connected.`); continue; }
      const bad = problemWith(a.platform, { caption, media });
      if (bad) { errors.push(`Post ${i + 1}, ${PLATFORMS[a.platform].name} ${a.username || ''}: ${bad}`); continue; }
      rows.push(postRow({ account_id: id, caption, media, scheduled_at: when.toISOString(), status: (p.approve ?? b.approve) ? 'approved' : 'pending', source: p.source || b.source || null }));
    }
  }
  if (errors.length) return res.status(400).json({ error: errors.join(' '), errors });
  if (!rows.length) return res.status(400).json({ error: 'There is nothing to add.' });
  const ins = await db('posts', '', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(rows) });
  if (!ins.ok) return res.status(500).json({ error: ins.error });
  return res.json({ ok: true, added: ins.data.length, posts: ins.data });
}

// Body: { ids: [...], op, caption?, scheduled_at? }
export async function decide(req, res) {
  if (!gate(req, res)) return;
  const b = readBody(req);
  const ids = (Array.isArray(b.ids) ? b.ids : [b.id]).filter(isUuid);
  if (!ids.length) return res.status(400).json({ error: 'Need the post ids.' });
  const inList = `in.(${ids.join(',')})`;
  const patchWhere = (from, patch) => db('posts', `?id=${inList}&status=in.(${from.join(',')})`, {
    method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ ...patch, updated_at: now() }),
  });
  let r;
  if (b.op === 'approve') r = await patchWhere(['pending'], { status: 'approved' });
  else if (b.op === 'hold') r = await patchWhere(['approved'], { status: 'pending' });
  // Retry is a person saying "I looked, it is not live, send it again".
  else if (b.op === 'retry') r = await patchWhere(['failed', 'check'], { status: 'approved', attempts: 0, error: null, container_id: null });
  // "It is live" settles a parked post without sending anything.
  else if (b.op === 'mark-published') r = await patchWhere(['check', 'failed'], { status: 'published', error: null, published_at: now() });
  else if (b.op === 'edit') {
    const patch = {};
    if (typeof b.caption === 'string') patch.caption = b.caption.replace(/\r\n/g, '\n').trim();
    if (b.scheduled_at) {
      const d = new Date(b.scheduled_at);
      if (Number.isNaN(d.getTime())) return res.status(400).json({ error: 'The date is not valid.' });
      patch.scheduled_at = d.toISOString();
    }
    if (!Object.keys(patch).length) return res.status(400).json({ error: 'Nothing to change.' });
    r = await patchWhere(['pending', 'approved', 'failed'], patch);
  } else if (b.op === 'delete') {
    // Published posts stay as the record of what went out.
    r = await db('posts', `?id=${inList}&status=in.(pending,approved,failed,check)`, { method: 'DELETE', headers: { Prefer: 'return=representation' } });
  } else return res.status(400).json({ error: 'op must be approve, hold, edit, retry, mark-published or delete.' });
  if (!r.ok) return res.status(500).json({ error: r.error });
  return res.json({ ok: true, changed: r.data.length, posts: r.data });
}

export async function uploadUrl(req, res) {
  if (!gate(req, res)) return;
  const b = readBody(req);
  const ext = String(b.ext || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!['jpg', 'mp4', 'mov'].includes(ext)) return res.status(400).json({ error: 'Files must be .jpg, .mp4 or .mov.' });
  const bk = await ensureBucket();
  if (!bk.ok) return res.status(500).json({ error: bk.error });
  const path = `${new Date().toISOString().slice(0, 7)}/${Date.now().toString(36)}-${crypto.randomBytes(5).toString('hex')}.${ext}`;
  const s = await rest(`/storage/v1/object/upload/sign/${BUCKET}/${path}`, { method: 'POST', headers: { 'x-upsert': 'true' }, body: '{}' });
  if (!s.ok) return res.status(500).json({ error: s.error });
  const c = creds();
  const signed = s.data.url || s.data.signedURL || '';
  return res.json({
    upload_url: `${c.url}/storage/v1${signed.startsWith('/') ? '' : '/'}${signed}`,
    public_url: `${c.url}/storage/v1/object/public/${BUCKET}/${path}`,
    type: ext === 'jpg' ? 'image' : 'video',
  });
}

// ---------- the run ----------

const patchPost = (id, patch, where = '') => db('posts', `?id=eq.${id}${where}`, {
  method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ ...patch, updated_at: now() }),
});
const patchAccount = (id, patch) => db('accounts', `?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ ...patch, updated_at: now() }) });
const label = (a) => `${PLATFORMS[a.platform].name} ${a.username || a.external_id}`;
const short = (s, n = 90) => { const t = String(s || '').replace(/\s+/g, ' ').trim(); return t.length > n ? `${t.slice(0, n - 1)}…` : t; };

// Renews tokens that can renew themselves and lists the accounts a person has to reconnect.
async function tendTokens(list, dry) {
  const attention = [];
  for (const a of list) {
    const left = daysLeft(a.token_expires_at);
    if (left === null || left > RENEW_WITHIN_DAYS) continue;
    if (!dry) {
      try {
        const fresh = await PLATFORMS[a.platform].refresh(a);
        if (fresh && fresh.access_token) {
          await patchAccount(a.id, { ...fresh, last_error: null, alerted_at: null });
          Object.assign(a, fresh);
          continue;
        }
      } catch (e) { a.last_error = String((e && e.message) || e); }
    }
    if (left < 0) {
      if (!dry) await patchAccount(a.id, { status: 'needs_reconnect', last_error: 'The access has expired. Connect the account again.' });
      a.status = 'needs_reconnect';
      attention.push({ account: a, why: 'its access has expired, so nothing can be posted to it until it is connected again' });
    } else if (left <= WARN_WITHIN_DAYS) {
      const quiet = a.alerted_at && Date.now() - new Date(a.alerted_at).getTime() < REALERT_AFTER_DAYS * 864e5;
      if (!quiet) {
        attention.push({ account: a, why: `its access ends in ${left} ${left === 1 ? 'day' : 'days'} and has to be connected again before then` });
        if (!dry) await patchAccount(a.id, { alerted_at: now() });
      }
    }
  }
  return attention;
}

function alertHtml({ problems, attention, base }) {
  const li = (items) => `<ul style="margin:0 0 14px;padding-left:20px">${items.map((i) => `<li style="margin:0 0 8px">${i}</li>`).join('')}</ul>`;
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#010221;max-width:560px">
  <p>Hi,</p>
  ${problems.length ? `<p>${problems.length === 1 ? 'One post did not go out as planned.' : `${problems.length} posts did not go out as planned.`}</p>${li(problems.map((p) => `<strong>${esc(p.who)}</strong>, "${esc(short(p.caption))}": ${esc(p.what)}`))}` : ''}
  ${attention.length ? `<p>${attention.length === 1 ? 'One account needs you.' : `${attention.length} accounts need you.`}</p>${li(attention.map((x) => `<strong>${esc(label(x.account))}</strong>: ${esc(x.why)}.`))}` : ''}
  <p>Everything else is running as normal. Each of these can be settled on the Social posting page (${esc(String(base).replace(/^https?:\/\//, ''))}/internal-social).</p>
</div>`;
}

export async function run(req, res) {
  if (!gateCron(req, res)) return;
  const q = req.query || {}, body = readBody(req);
  const truthy = (v) => v === true || v === 1 || v === '1' || v === 'true';
  const dry = truthy(q.dry) || truthy(body.dry);
  const started = Date.now();
  const deadline = started + RUN_BUDGET_MS;

  const acc = await db('accounts', '?select=*&status=in.(active,needs_reconnect,paused)');
  if (!acc.ok) return res.status(500).json({ error: acc.error });
  const byId = new Map(acc.data.map((a) => [a.id, a]));

  // A post left in "publishing" means a run stopped half way. Whether it went out is not
  // known, so it is parked for a person and never sent again on its own.
  const problems = [];
  if (!dry) {
    const cut = new Date(Date.now() - STUCK_AFTER_MS).toISOString();
    const stuck = await db('posts', `?status=eq.publishing&updated_at=lt.${encodeURIComponent(cut)}`, {
      method: 'PATCH', headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ status: 'check', error: 'An earlier run stopped before it could record the result. Look at the account: if the post is there, press "It is live", and if it is not, press "Send it again".', updated_at: now() }),
    });
    for (const p of (stuck.ok ? stuck.data : [])) {
      const a = byId.get(p.account_id);
      problems.push({ who: a ? label(a) : 'An account', caption: p.caption, what: 'the run stopped half way, so please check the account and settle the post on the page' });
    }
  }

  const attention = await tendTokens(acc.data.filter((a) => a.status === 'active'), dry);

  const due = await db('posts', `?select=*&status=eq.approved&scheduled_at=lte.${encodeURIComponent(now())}&order=scheduled_at.asc&limit=60`);
  if (!due.ok) return res.status(500).json({ error: due.error });

  const used = new Set();
  const out = { published: [], waiting: [], retrying: [], failed: [], parked: [], would_publish: [] };

  for (const post of due.data) {
    if (Date.now() > deadline - 8000) { out.waiting.push({ id: post.id, why: 'this run was out of time, so it goes on the next one' }); continue; }
    const a = byId.get(post.account_id);
    if (!a || a.status !== 'active') { out.waiting.push({ id: post.id, why: a ? `${label(a)} is ${a.status === 'paused' ? 'paused' : 'waiting to be connected again'}` : 'its account was removed' }); continue; }
    if (used.has(a.id)) { out.waiting.push({ id: post.id, why: `${label(a)} already had its post on this run` }); continue; }
    used.add(a.id);
    if (dry) { out.would_publish.push({ id: post.id, account: label(a), caption: short(post.caption) }); continue; }

    // The claim. Only one run can move a post from approved to publishing, so two runs at
    // the same moment cannot both send it.
    const claim = await patchPost(post.id, { status: 'publishing' }, '&status=eq.approved');
    if (!claim.ok || !claim.data.length) continue;

    try {
      const r = await PLATFORMS[a.platform].publish(a, post, { deadline: deadline - 6000 });
      if (r.pending) {
        await patchPost(post.id, { status: 'approved', container_id: r.container_id, error: 'Instagram is still processing the video. It is published on the next run.' });
        out.waiting.push({ id: post.id, why: 'Instagram is still processing the video' });
        continue;
      }
      const saved = await patchPost(post.id, { status: 'published', external_post_id: r.id || null, permalink: r.permalink || null, published_at: now(), error: null, container_id: r.container_id || post.container_id || null });
      out.published.push({ id: post.id, account: label(a), permalink: r.permalink || null, recorded: saved.ok });
    } catch (e) {
      const message = String((e && e.message) || e);
      if (e && e.auth) {
        await patchAccount(a.id, { status: 'needs_reconnect', last_error: message });
        a.status = 'needs_reconnect';
        await patchPost(post.id, { status: 'approved', error: `${label(a)} has to be connected again. The post goes out once it is.` });
        attention.push({ account: a, why: 'the platform refused its access, so it has to be connected again. Its posts wait until then' });
        out.waiting.push({ id: post.id, why: `${label(a)} has to be connected again` });
      } else if (e && e.ambiguous) {
        await patchPost(post.id, { status: 'check', error: `${message} The post may or may not be live. Look at the account: if it is there, press "It is live", and if it is not, press "Send it again".` });
        out.parked.push({ id: post.id, account: label(a), error: message });
        problems.push({ who: label(a), caption: post.caption, what: 'the platform gave no clear answer, so it may or may not be live. Please check the account and settle the post on the page' });
      } else {
        const attempts = (post.attempts || 0) + 1;
        const giveUp = attempts >= MAX_ATTEMPTS;
        await patchPost(post.id, { status: giveUp ? 'failed' : 'approved', attempts, error: message, ...(e && e.resetContainer ? { container_id: null } : {}) });
        if (giveUp) {
          out.failed.push({ id: post.id, account: label(a), error: message });
          problems.push({ who: label(a), caption: post.caption, what: `it failed ${MAX_ATTEMPTS} times and has stopped. The reason given was: ${message}` });
        } else out.retrying.push({ id: post.id, account: label(a), error: message, attempts });
      }
    }
  }

  let emailed = false;
  if (!dry && (problems.length || attention.length)) {
    const n = problems.length + attention.length;
    const m = await sendMail({
      to: ALERT_TO(),
      subject: `Social posting: ${n} ${n === 1 ? 'thing needs' : 'things need'} your attention`,
      html: alertHtml({ problems, attention, base: baseUrl(req) }),
    });
    emailed = m.ok || m.error;
  }

  return res.json({
    ok: true, dry, due: due.data.length, ...out,
    accounts_needing_attention: attention.map((x) => ({ account: label(x.account), why: x.why })),
    emailed, ms: Date.now() - started,
  });
}
