import { useCallback, useEffect, useMemo, useState } from 'react'

// /internal-social: one place to post to several Instagram accounts, Facebook Pages and
// LinkedIn profiles.
//
// Each account is connected once, by its owner clicking Allow on the platform's own screen.
// A post is written here (or added to the queue from outside), approved, and then published
// by the site at its scheduled time through the platforms' official APIs. Nothing has to be
// clicked for the publishing itself.
//
// No meta.js on purpose: never on the homepage grid, never in the sitemap, and noindex.

const NAVY = '#010221'
const LBLUE = '#CBEFFF'
const ACCENT = '#5B7FCC'
const GOLD = '#C9A96E'
const BG = '#F4F2EE'
const RED = '#A3341F'
const MUTED = '#5a5f78'
const SANS = "'DM Sans', Arial, Helvetica, sans-serif"

const PLATFORMS = [
  { key: 'instagram', name: 'Instagram', what: 'Creator or Business accounts. Photos, carousels and reels.' },
  { key: 'facebook', name: 'Facebook', what: 'Pages. One sign-in connects every Page that login manages.' },
  { key: 'linkedin', name: 'LinkedIn', what: 'Personal profiles. Text and photos.' },
]
const PNAME = Object.fromEntries(PLATFORMS.map(p => [p.key, p.name]))
const STATUS = {
  pending: { label: 'Waiting for approval', bg: '#FFF4D6', fg: '#7A5B00' },
  approved: { label: 'Scheduled', bg: '#EEF1F8', fg: ACCENT },
  publishing: { label: 'Publishing now', bg: LBLUE, fg: NAVY },
  published: { label: 'Published', bg: '#E5F3EA', fg: '#1F6B3A' },
  failed: { label: 'Failed', bg: '#FBE9E7', fg: RED },
  check: { label: 'Please check', bg: '#FBE9E7', fg: RED },
}
const ACCOUNT_STATUS = {
  active: { label: 'Connected', bg: '#E5F3EA', fg: '#1F6B3A' },
  paused: { label: 'Paused', bg: '#EEF1F8', fg: ACCENT },
  needs_reconnect: { label: 'Connect again', bg: '#FBE9E7', fg: RED },
}

const btn = (kind = 'plain') => ({
  border: kind === 'primary' ? 'none' : `1px solid ${kind === 'danger' ? RED : NAVY}`,
  background: kind === 'primary' ? NAVY : '#fff',
  color: kind === 'primary' ? '#fff' : kind === 'danger' ? RED : NAVY,
  borderRadius: 8, padding: '10px 16px', fontWeight: 700, cursor: 'pointer', minHeight: 44, fontFamily: SANS, fontSize: 14.5,
})
const card = { background: '#fff', borderRadius: 14, padding: 22, marginBottom: 22, boxShadow: '0 1px 3px rgba(1,2,33,.08)' }
const input = { width: '100%', boxSizing: 'border-box', padding: 12, borderRadius: 8, border: '1px solid #c9c7c2', fontSize: 16, fontFamily: SANS, color: NAVY }
const labelStyle = { display: 'block', fontWeight: 700, color: NAVY, margin: '14px 0 6px' }

const toLocalInput = (d) => { const x = new Date(d); return new Date(x.getTime() - x.getTimezoneOffset() * 60000).toISOString().slice(0, 16) }
const tomorrowMorning = () => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0); return toLocalInput(d) }
const when = (iso) => { try { return new Date(iso).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) } catch { return iso } }

async function call(path, pass, body) {
  const r = await fetch(path, {
    method: body ? 'POST' : 'GET',
    headers: { 'x-passcode': pass, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  const raw = await r.text()
  let j
  try { j = JSON.parse(raw) } catch { throw new Error(`Server error ${r.status}: ${raw.slice(0, 200)}`) }
  if (r.status === 401) { const e = new Error('Wrong password'); e.auth = true; throw e }
  if (j.error) throw new Error(j.error)
  return j
}

// Instagram only takes JPEG photos, so every photo that is not one is converted here.
async function asJpeg(file) {
  if (file.type === 'image/jpeg') return file
  const bmp = await createImageBitmap(file)
  const c = document.createElement('canvas')
  c.width = bmp.width; c.height = bmp.height
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(bmp, 0, 0)
  return new Promise((resolve, reject) => c.toBlob(b => (b ? resolve(b) : reject(new Error('This photo could not be converted to JPEG.'))), 'image/jpeg', 0.92))
}

async function uploadFile(file, pass) {
  const video = file.type.startsWith('video/')
  if (!video && !file.type.startsWith('image/')) throw new Error(`${file.name} is not a photo or a video.`)
  const ext = video ? (/\.mov$/i.test(file.name) ? 'mov' : 'mp4') : 'jpg'
  const blob = video ? file : await asJpeg(file)
  const u = await call('/api/social?action=upload-url', pass, { ext })
  const put = await fetch(u.upload_url, { method: 'PUT', headers: { 'Content-Type': video ? (file.type || 'video/mp4') : 'image/jpeg' }, body: blob })
  if (!put.ok) throw new Error(`The upload of ${file.name} failed (${put.status}).`)
  return { url: u.public_url, type: u.type }
}

function Pill({ map, status }) {
  const s = map[status] || { label: status, bg: '#eee', fg: '#333' }
  return <span style={{ background: s.bg, color: s.fg, borderRadius: 999, padding: '3px 10px', fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap' }}>{s.label}</span>
}

function Thumbs({ media, onRemove }) {
  if (!media || !media.length) return null
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
      {media.map((m, i) => (
        <div key={m.url + i} style={{ position: 'relative' }}>
          {m.type === 'video'
            ? <video src={m.url} muted playsInline style={{ width: 84, height: 84, objectFit: 'cover', borderRadius: 8, background: NAVY }} />
            : <img src={m.url} alt="" style={{ width: 84, height: 84, objectFit: 'cover', borderRadius: 8, background: BG }} />}
          {onRemove && <button type="button" aria-label="Remove this file" onClick={() => onRemove(i)}
            style={{ position: 'absolute', top: -8, right: -8, width: 28, height: 28, borderRadius: 14, border: 'none', background: NAVY, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>×</button>}
        </div>
      ))}
    </div>
  )
}

function Accounts({ data, pass, onChanged, setErr }) {
  const [busy, setBusy] = useState('')
  const [note, setNote] = useState('')
  const [removing, setRemoving] = useState('')

  const link = async (platform, share) => {
    setBusy(platform + (share ? 's' : 'c')); setNote(''); setErr('')
    try {
      const j = await call('/api/social?action=connect-link', pass, { platform, share })
      if (share) { await navigator.clipboard.writeText(j.url); setNote(`The ${PNAME[platform]} connect link is copied. It works for ${j.valid_for}. Send it to the owner of the account, who opens it while logged in to ${PNAME[platform]} and clicks Allow.`) }
      else window.open(j.url, '_blank', 'noopener')
    } catch (e) { setErr(String(e.message || e)) }
    setBusy('')
  }
  const act = async (id, op) => {
    setBusy(id + op); setErr('')
    try { await call('/api/social?action=account', pass, { id, op }); setRemoving(''); onChanged() } catch (e) { setErr(String(e.message || e)) }
    setBusy('')
  }

  return (
    <section style={card} aria-labelledby="acc-h">
      <h2 id="acc-h" style={{ margin: '0 0 4px', fontSize: 21 }}>Accounts</h2>
      <p style={{ margin: '0 0 6px', color: MUTED }}>Each account is connected once. Log in to the account in this browser first, then press Connect and click Allow.</p>
      {note && <p style={{ background: LBLUE, borderRadius: 10, padding: 12, margin: '10px 0' }}>{note}</p>}
      {PLATFORMS.map(p => {
        const setup = data.platforms?.[p.key]
        const list = (data.accounts || []).filter(a => a.platform === p.key)
        return (
          <div key={p.key} style={{ borderTop: '1px solid #E0DFDC', padding: '16px 0 4px', marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ minWidth: 220, flex: '1 1 260px' }}>
                <strong style={{ fontSize: 17 }}>{p.name}</strong>
                <div style={{ color: MUTED, fontSize: 13.5 }}>{p.what}</div>
              </div>
              {setup?.ready ? (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button style={btn('primary')} disabled={!!busy} onClick={() => link(p.key, false)}>{busy === p.key + 'c' ? 'Opening...' : `Connect ${p.name}`}</button>
                  <button style={btn()} disabled={!!busy} onClick={() => link(p.key, true)}>{busy === p.key + 's' ? 'Copying...' : 'Copy a link for someone else'}</button>
                </div>
              ) : (
                <div style={{ color: RED, fontSize: 13.5, maxWidth: 420 }}>
                  {p.name} is not set up yet. Add {(setup?.missing || []).join(' and ')} in Vercel and redeploy.
                </div>
              )}
            </div>
            {list.map(a => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center', background: BG, borderRadius: 10, padding: '10px 14px', marginTop: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <strong>{a.username || a.external_id}</strong> <Pill map={ACCOUNT_STATUS} status={a.status} />
                  <div style={{ color: a.status === 'needs_reconnect' ? RED : MUTED, fontSize: 13 }}>
                    {a.status === 'needs_reconnect' ? (a.last_error || 'Press Connect above to connect this account again.')
                      : a.renews_itself ? 'The access renews itself.'
                      : a.days_left !== null ? `The access lasts ${a.days_left} more ${a.days_left === 1 ? 'day' : 'days'}. Connect again before then; you get an email a week ahead.`
                      : 'Connected.'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {a.status === 'active' && <button style={btn()} disabled={!!busy} onClick={() => act(a.id, 'pause')}>Pause</button>}
                  {a.status === 'paused' && <button style={btn()} disabled={!!busy} onClick={() => act(a.id, 'resume')}>Resume</button>}
                  {removing === a.id
                    ? <><button style={btn('danger')} disabled={!!busy} onClick={() => act(a.id, 'remove')}>Yes, remove it</button><button style={btn()} onClick={() => setRemoving('')}>Keep it</button></>
                    : <button style={btn()} onClick={() => setRemoving(a.id)}>Remove</button>}
                </div>
              </div>
            ))}
            {setup?.ready && list.length === 0 && <p style={{ color: MUTED, margin: '10px 0 0', fontSize: 13.5 }}>No {p.name} account is connected yet.</p>}
          </div>
        )
      })}
    </section>
  )
}

function Composer({ accounts, pass, onAdded }) {
  const usable = accounts.filter(a => a.status !== 'removed')
  const [chosen, setChosen] = useState([])
  const [caption, setCaption] = useState('')
  const [media, setMedia] = useState([])
  const [url, setUrl] = useState('')
  const [at, setAt] = useState(tomorrowMorning)
  const [busy, setBusy] = useState('')
  const [err, setErr] = useState('')
  const [done, setDone] = useState('')

  const toggle = (id) => setChosen(c => (c.includes(id) ? c.filter(x => x !== id) : [...c, id]))
  const addFiles = async (files) => {
    setErr(''); setBusy('upload')
    try {
      for (const f of Array.from(files)) { const m = await uploadFile(f, pass); setMedia(x => [...x, m]) }
    } catch (e) { setErr(String(e.message || e)) }
    setBusy('')
  }
  const addUrl = () => {
    const u = url.trim()
    if (!/^https:\/\//i.test(u)) { setErr('The address has to start with https://'); return }
    setMedia(x => [...x, { url: u, type: /\.(mp4|mov|m4v)(\?|#|$)/i.test(u) ? 'video' : 'image' }]); setUrl(''); setErr('')
  }
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setDone('')
    if (!chosen.length) { setErr('Choose at least one account to post to.'); return }
    setBusy('save')
    try {
      const j = await call('/api/social?action=create', pass, { account_ids: chosen, caption, media, scheduled_at: new Date(at).toISOString(), approve: true, source: 'page' })
      setDone(j.added === 1 ? 'The post is scheduled.' : `The post is scheduled for ${j.added} accounts.`)
      setCaption(''); setMedia([]); onAdded()
    } catch (e2) { setErr(String(e2.message || e2)) }
    setBusy('')
  }

  return (
    <section style={card} aria-labelledby="new-h">
      <h2 id="new-h" style={{ margin: '0 0 4px', fontSize: 21 }}>New post</h2>
      <p style={{ margin: 0, color: MUTED }}>Write it once and send it to one account or several. It is published by itself at the time you set.</p>
      {usable.length === 0 ? <p style={{ margin: '14px 0 0' }}>Connect an account above first.</p> : (
        <form onSubmit={submit}>
          <span style={labelStyle}>Post to</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {usable.map(a => {
              const on = chosen.includes(a.id)
              return (
                <label key={a.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, padding: '0 14px', borderRadius: 999, cursor: 'pointer', fontWeight: 700,
                  background: on ? NAVY : BG, color: on ? '#fff' : NAVY, opacity: a.status === 'active' ? 1 : 0.6 }}>
                  <input type="checkbox" checked={on} onChange={() => toggle(a.id)} style={{ width: 18, height: 18 }} />
                  {PNAME[a.platform]}: {a.username || a.external_id}
                </label>
              )
            })}
          </div>

          <label htmlFor="cap" style={labelStyle}>Text</label>
          <textarea id="cap" value={caption} onChange={e => setCaption(e.target.value)} rows={7} style={{ ...input, resize: 'vertical', lineHeight: 1.5 }} />
          <div style={{ color: MUTED, fontSize: 12.5, marginTop: 4 }}>{caption.length} characters. Instagram allows 2,200 and LinkedIn 3,000.</div>

          <label htmlFor="files" style={labelStyle}>Photos or a video</label>
          <input id="files" type="file" accept="image/*,video/mp4,video/quicktime" multiple disabled={!!busy} onChange={e => { addFiles(e.target.files); e.target.value = '' }} style={{ fontFamily: SANS, fontSize: 15, minHeight: 44 }} />
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            <input aria-label="Or paste the address of a photo or video" placeholder="Or paste an https address of a photo or video" value={url} onChange={e => setUrl(e.target.value)} style={{ ...input, flex: '1 1 260px', width: 'auto' }} />
            <button type="button" style={btn()} onClick={addUrl}>Add</button>
          </div>
          {busy === 'upload' && <p style={{ margin: '8px 0 0', color: MUTED }}>Uploading...</p>}
          <Thumbs media={media} onRemove={(i) => setMedia(x => x.filter((_, k) => k !== i))} />

          <label htmlFor="at" style={labelStyle}>Publish at</label>
          <input id="at" type="datetime-local" value={at} onChange={e => setAt(e.target.value)} required style={{ ...input, maxWidth: 280 }} />
          <div style={{ color: MUTED, fontSize: 12.5, marginTop: 4 }}>Your local time. The site publishes three times a day, so the post goes out on the first run after this time.</div>

          {err && <div role="alert" style={{ background: '#FBE9E7', color: RED, padding: 12, borderRadius: 10, marginTop: 14 }}>{err}</div>}
          {done && <div role="status" style={{ background: '#E5F3EA', color: '#1F6B3A', padding: 12, borderRadius: 10, marginTop: 14 }}>{done}</div>}
          <button type="submit" disabled={!!busy} style={{ ...btn('primary'), marginTop: 16, fontSize: 16, minHeight: 48, padding: '12px 22px' }}>{busy === 'save' ? 'Scheduling...' : 'Schedule the post'}</button>
        </form>
      )}
    </section>
  )
}

function PostCard({ post, account, pass, onChanged }) {
  const [busy, setBusy] = useState('')
  const [err, setErr] = useState('')
  const [editing, setEditing] = useState(false)
  const [caption, setCaption] = useState(post.caption)
  const [at, setAt] = useState(() => toLocalInput(post.scheduled_at))
  const [open, setOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const act = async (op, extra) => {
    setBusy(op); setErr('')
    try { await call('/api/social?action=decide', pass, { ids: [post.id], op, ...extra }); setEditing(false); setConfirmDelete(false); onChanged() } catch (e) { setErr(String(e.message || e)) }
    setBusy('')
  }
  const long = post.caption.length > 280
  const s = post.status

  return (
    <article style={{ ...card, padding: 18, marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <strong>{account ? `${PNAME[account.platform]}: ${account.username || account.external_id}` : 'Removed account'}</strong>
          <div style={{ color: MUTED, fontSize: 13 }}>{s === 'published' && post.published_at ? `Published ${when(post.published_at)}` : `Set for ${when(post.scheduled_at)}`}</div>
        </div>
        <Pill map={STATUS} status={s} />
      </div>

      {editing ? (
        <div style={{ marginTop: 10 }}>
          <label htmlFor={`c-${post.id}`} style={labelStyle}>Text</label>
          <textarea id={`c-${post.id}`} value={caption} onChange={e => setCaption(e.target.value)} rows={6} style={{ ...input, resize: 'vertical', lineHeight: 1.5 }} />
          <label htmlFor={`t-${post.id}`} style={labelStyle}>Publish at</label>
          <input id={`t-${post.id}`} type="datetime-local" value={at} onChange={e => setAt(e.target.value)} style={{ ...input, maxWidth: 280 }} />
        </div>
      ) : (
        <>
          <p style={{ whiteSpace: 'pre-wrap', margin: '12px 0 0', lineHeight: 1.55 }}>{long && !open ? `${post.caption.slice(0, 280)}...` : post.caption}</p>
          {long && <button onClick={() => setOpen(o => !o)} style={{ border: 'none', background: 'none', color: ACCENT, fontWeight: 700, cursor: 'pointer', padding: '10px 0', minHeight: 44 }}>{open ? 'Show less' : 'Show all of it'}</button>}
        </>
      )}
      <Thumbs media={post.media} />
      {post.error && s !== 'published' && <p style={{ color: s === 'approved' ? MUTED : RED, margin: '10px 0 0', fontSize: 14 }}>{post.error}</p>}
      {err && <div role="alert" style={{ background: '#FBE9E7', color: RED, padding: 10, borderRadius: 10, marginTop: 10 }}>{err}</div>}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
        {editing ? (
          <>
            <button style={btn('primary')} disabled={!!busy} onClick={() => act('edit', { caption, scheduled_at: new Date(at).toISOString() })}>{busy === 'edit' ? 'Saving...' : 'Save'}</button>
            <button style={btn()} onClick={() => { setEditing(false); setCaption(post.caption) }}>Cancel</button>
          </>
        ) : (
          <>
            {s === 'pending' && <button style={btn('primary')} disabled={!!busy} onClick={() => act('approve')}>{busy === 'approve' ? 'Approving...' : 'Approve'}</button>}
            {s === 'approved' && <button style={btn()} disabled={!!busy} onClick={() => act('hold')}>Hold it back</button>}
            {s === 'check' && <button style={btn('primary')} disabled={!!busy} onClick={() => act('mark-published')}>It is live</button>}
            {(s === 'failed' || s === 'check') && <button style={btn(s === 'failed' ? 'primary' : 'plain')} disabled={!!busy} onClick={() => act('retry')}>Send it again</button>}
            {['pending', 'approved', 'failed'].includes(s) && <button style={btn()} onClick={() => setEditing(true)}>Edit</button>}
            {s === 'published' && post.permalink && <a href={post.permalink} target="_blank" rel="noreferrer" style={{ ...btn(), textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>Open the post</a>}
            {['pending', 'approved', 'failed', 'check'].includes(s) && (confirmDelete
              ? <><button style={btn('danger')} disabled={!!busy} onClick={() => act('delete')}>Yes, delete it</button><button style={btn()} onClick={() => setConfirmDelete(false)}>Keep it</button></>
              : <button style={btn()} onClick={() => setConfirmDelete(true)}>Delete</button>)}
          </>
        )}
      </div>
    </article>
  )
}

const VIEWS = [
  { key: 'needs', label: 'Needs you', match: ['pending', 'failed', 'check'], empty: 'Nothing is waiting for you.' },
  { key: 'scheduled', label: 'Scheduled', match: ['approved', 'publishing'], empty: 'Nothing is scheduled. Write a post above.' },
  { key: 'published', label: 'Published', match: ['published'], empty: 'Nothing has been published yet.' },
]

export default function InternalSocial() {
  const [pass, setPass] = useState(() => { try { return sessionStorage.getItem('social_pass') || sessionStorage.getItem('studio_pass') || '' } catch { return '' } })
  const [entered, setEntered] = useState(false)
  const [data, setData] = useState({ accounts: [], platforms: {} })
  const [posts, setPosts] = useState([])
  const [busy, setBusy] = useState('')
  const [err, setErr] = useState('')
  const [health, setHealth] = useState(null)
  const [runNote, setRunNote] = useState('')
  const [view, setView] = useState('needs')

  useEffect(() => { document.title = 'Social posting | 24/7 Spain' }, [])

  const load = useCallback(async (p) => {
    setBusy('load'); setErr('')
    try {
      const [a, q] = await Promise.all([call('/api/social?action=accounts', p), call('/api/social?action=posts', p)])
      setData(a); setPosts(q.posts || []); setEntered(true)
      try { sessionStorage.setItem('social_pass', p) } catch { /* private mode */ }
    } catch (e) {
      if (e.auth) setEntered(false)
      setErr(String(e.message || e))
    }
    setBusy('')
  }, [])

  useEffect(() => { if (pass) load(pass) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const byId = useMemo(() => Object.fromEntries((data.accounts || []).map(a => [a.id, a])), [data.accounts])
  const counts = useMemo(() => Object.fromEntries(VIEWS.map(v => [v.key, posts.filter(p => v.match.includes(p.status)).length])), [posts])
  const pending = posts.filter(p => p.status === 'pending')

  const check = async () => {
    setHealth({ loading: true })
    try { setHealth(await call('/api/social?action=health', pass)) } catch (e) { setHealth({ error: String(e.message || e) }) }
  }
  const runNow = async () => {
    setBusy('run'); setRunNote(''); setErr('')
    try {
      const j = await call('/api/social?action=run', pass, {})
      const parts = [`${j.published.length} published`]
      if (j.waiting.length) parts.push(`${j.waiting.length} waiting`)
      if (j.retrying.length) parts.push(`${j.retrying.length} will be tried again`)
      if (j.failed.length + j.parked.length) parts.push(`${j.failed.length + j.parked.length} need you`)
      setRunNote(j.due === 0 ? 'No post is due yet.' : `Done: ${parts.join(', ')}.`)
      await load(pass)
    } catch (e) { setErr(String(e.message || e)) }
    setBusy('')
  }
  const approveAll = async () => {
    setBusy('all'); setErr('')
    try { await call('/api/social?action=decide', pass, { ids: pending.map(p => p.id), op: 'approve' }); await load(pass) } catch (e) { setErr(String(e.message || e)) }
    setBusy('')
  }

  if (!entered) {
    return (
      <main style={{ minHeight: '100vh', background: BG, fontFamily: SANS, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <form onSubmit={(e) => { e.preventDefault(); load(pass) }} style={{ background: '#fff', borderRadius: 14, padding: 28, width: '100%', maxWidth: 380 }}>
          <h1 style={{ margin: '0 0 6px', color: NAVY, fontSize: 22 }}>Social posting</h1>
          <p style={{ margin: '0 0 16px', color: MUTED }}>Enter the internal password to open the posting tool.</p>
          <label htmlFor="pw" style={{ display: 'block', fontWeight: 700, color: NAVY, marginBottom: 6 }}>Password</label>
          <input id="pw" type="password" value={pass} onChange={e => setPass(e.target.value)} autoFocus style={{ ...input, marginBottom: 12 }} />
          {err && <p role="alert" style={{ color: RED, margin: '0 0 12px' }}>{err}</p>}
          <button type="submit" disabled={!!busy} style={{ ...btn('primary'), width: '100%', fontSize: 16, minHeight: 48 }}>{busy ? 'Opening...' : 'Open'}</button>
        </form>
      </main>
    )
  }

  const active = (data.accounts || []).filter(a => a.status === 'active').length
  const reconnect = (data.accounts || []).filter(a => a.status === 'needs_reconnect')
  const shown = posts.filter(p => VIEWS.find(v => v.key === view).match.includes(p.status))
    .sort((a, b) => (view === 'published' ? new Date(b.published_at || b.scheduled_at) - new Date(a.published_at || a.scheduled_at) : new Date(a.scheduled_at) - new Date(b.scheduled_at)))

  return (
    <main style={{ minHeight: '100vh', background: BG, fontFamily: SANS, color: NAVY }}>
      <header style={{ background: NAVY, color: '#fff', padding: '28px 20px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div style={{ color: GOLD, fontWeight: 700, letterSpacing: 1, fontSize: 12.5, textTransform: 'uppercase' }}>Internal</div>
          <h1 style={{ margin: '6px 0 8px', fontSize: 28 }}>Social posting</h1>
          <p style={{ margin: 0, color: '#c8cbe0', maxWidth: 680, lineHeight: 1.55 }}>
            Connect each Instagram account, Facebook Page and LinkedIn profile once. Approved posts are then published by themselves at the time you set, three times a day.
          </p>
          <div style={{ display: 'flex', gap: 28, marginTop: 18, flexWrap: 'wrap' }}>
            <div><div style={{ fontSize: 30, fontWeight: 700 }}>{active}</div><div style={{ color: '#c8cbe0', fontSize: 13 }}>accounts connected</div></div>
            <div><div style={{ fontSize: 30, fontWeight: 700 }}>{counts.needs}</div><div style={{ color: '#c8cbe0', fontSize: 13 }}>posts need you</div></div>
            <div><div style={{ fontSize: 30, fontWeight: 700 }}>{counts.scheduled}</div><div style={{ color: '#c8cbe0', fontSize: 13 }}>scheduled</div></div>
            <div><div style={{ fontSize: 30, fontWeight: 700 }}>{counts.published}</div><div style={{ color: '#c8cbe0', fontSize: 13 }}>published</div></div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 980, margin: '0 auto', padding: '22px 20px 60px' }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={() => load(pass)} disabled={!!busy} style={btn()}>{busy === 'load' ? 'Loading...' : 'Refresh'}</button>
          <button onClick={runNow} disabled={!!busy} style={btn()}>{busy === 'run' ? 'Publishing...' : 'Publish what is due now'}</button>
          <button onClick={check} style={btn()}>Run health check</button>
          {runNote && <span role="status">{runNote}</span>}
        </div>

        {err && <div role="alert" style={{ background: '#FBE9E7', color: RED, padding: 14, borderRadius: 10, marginBottom: 16 }}>{err}</div>}
        {reconnect.length > 0 && (
          <div role="alert" style={{ background: '#FBE9E7', color: RED, padding: 14, borderRadius: 10, marginBottom: 16 }}>
            {reconnect.length === 1 ? 'One account has to be connected again' : `${reconnect.length} accounts have to be connected again`}: {reconnect.map(a => `${PNAME[a.platform]} ${a.username || a.external_id}`).join(', ')}. Their posts wait until then.
          </div>
        )}
        {health && (
          <div style={{ background: '#fff', borderRadius: 10, padding: 14, marginBottom: 18, fontSize: 14, lineHeight: 1.6 }}>
            {health.loading ? 'Checking...' : health.error ? <span style={{ color: RED }}>{health.error}</span> : (
              <>
                <strong style={{ color: health.ok ? '#1F6B3A' : RED }}>{health.ok ? 'The basics are in place.' : 'Something the tool needs is missing.'}</strong>
                <div>Settings: {Object.entries(health.env || {}).map(([k, v]) => `${k} ${v ? 'set' : 'MISSING'}`).join(', ')}.</div>
                <div>Platforms: {PLATFORMS.map(p => `${p.name} ${health.platforms?.[p.key]?.ready ? 'ready' : `needs ${(health.platforms?.[p.key]?.missing || []).join(' and ')}`}`).join(', ')}.</div>
                <div>Tables: accounts {health.tables?.accounts === true ? 'ready' : String(health.tables?.accounts)}, posts {health.tables?.posts === true ? 'ready' : String(health.tables?.posts)}.</div>
                <div>The redirect address to register with each platform is <code style={{ background: BG, padding: '2px 6px', borderRadius: 4 }}>{health.redirect_uri}</code></div>
              </>
            )}
          </div>
        )}

        <Accounts data={data} pass={pass} onChanged={() => load(pass)} setErr={setErr} />
        <Composer accounts={data.accounts || []} pass={pass} onAdded={() => { setView('scheduled'); load(pass) }} />

        <section aria-labelledby="q-h">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
            <h2 id="q-h" style={{ margin: 0, fontSize: 21 }}>Posts</h2>
            <div role="tablist" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {VIEWS.map(v => (
                <button key={v.key} role="tab" aria-selected={view === v.key} onClick={() => setView(v.key)}
                  style={{ border: 'none', borderRadius: 999, padding: '8px 14px', minHeight: 44, cursor: 'pointer', fontWeight: 700, fontFamily: SANS, background: view === v.key ? NAVY : '#fff', color: view === v.key ? '#fff' : NAVY }}>
                  {v.label} ({counts[v.key]})
                </button>
              ))}
            </div>
          </div>
          {view === 'needs' && pending.length > 1 && (
            <button onClick={approveAll} disabled={!!busy} style={{ ...btn('primary'), marginBottom: 14 }}>{busy === 'all' ? 'Approving...' : `Approve all ${pending.length} waiting posts`}</button>
          )}
          {shown.length === 0 && <div style={{ ...card, textAlign: 'center', color: MUTED }}>{VIEWS.find(v => v.key === view).empty}</div>}
          {shown.map(p => <PostCard key={p.id + p.updated_at} post={p} account={byId[p.account_id]} pass={pass} onChanged={() => load(pass)} />)}
        </section>
      </div>
    </main>
  )
}
