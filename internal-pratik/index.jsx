import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// Pratik's own Facebook post deck. Route: /internal-pratik.
//
// WHAT THIS IS NOT
// It is not /internal-linkedin. That deck belongs to the team, John reviews it, and its
// posts go out over other people's names to five team members. This one is personal: Pratik
// reviews, edits and approves, and each approval emails one post to Himanshu, who publishes
// it, with Pratik copied.
//
// The two surfaces share no table, no API route, no module and no style prefix, and a test
// enforces that. If you are here to change something, change it here and nowhere else.
//
// THE REVIEW LOOP
//   read  ->  edit if it needs it  ->  pick the image  ->  say which group  ->  approve
// Approving is the send. There is no separate send button, because an approved post sitting
// unsent is the failure mode this whole deck exists to avoid. The result of the send comes
// straight back onto the card, so a failure is visible in the moment.
//
// No meta.js in this folder on purpose: without one the tool never appears in the public
// homepage grid and is never prerendered into a page a search engine can find.

const NAVY = '#010221'
const LBLUE = '#CBEFFF'
const ACCENT = '#5B7FCC'
const GOLD = '#C9A96E'
const PAGE_BG = '#E7EAF0'

const LANGS = [
  { key: 'en', label: 'English' },
  { key: 'no', label: 'Norsk' },
  { key: 'sv', label: 'Svenska' },
  { key: 'de', label: 'Deutsch' },
  { key: 'fr', label: 'Français' },
  { key: 'nl', label: 'Nederlands' },
]
const STATUSES = [
  { key: 'all', label: 'Everything' },
  { key: 'pending', label: 'To review' },
  { key: 'approved', label: 'Approved' },
  { key: 'posted', label: 'Live' },
  { key: 'rejected', label: 'Parked' },
]
const PILL = {
  pending: { label: 'To review', bg: '#FBF3E2', fg: '#8a6d1f' },
  approved: { label: 'Approved', bg: '#E8F3E8', fg: '#2e7d32' },
  rejected: { label: 'Parked', bg: '#FAEDED', fg: '#b02a2a' },
  posted: { label: 'Live', bg: '#E9EEF9', fg: '#2f4f9e' },
}

const textOf = (p) => (p.edited_text && p.edited_text.trim()) ? p.edited_text : p.post_text
const fmt = (iso) => {
  if (!iso) return ''
  try { return new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }
  catch { return iso }
}

export default function InternalPratik() {
  const [pass, setPass] = useState(() => sessionStorage.getItem('fb_pass') || '')
  const [entered, setEntered] = useState(false)
  const [lang, setLang] = useState('en')
  const [status, setStatus] = useState('all')
  const [kind, setKind] = useState('all')
  const [posts, setPosts] = useState([])
  const [counts, setCounts] = useState({})
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [flash, setFlash] = useState('')
  const [copied, setCopied] = useState(null)
  const [picking, setPicking] = useState(null)
  const [editing, setEditing] = useState(null)    // { id, text }
  const [rejecting, setRejecting] = useState(null) // { id, comment }
  const [customUrl, setCustomUrl] = useState('')
  const [cursor, setCursor] = useState(0)
  const cardRefs = useRef({})

  useEffect(() => { document.title = 'My Facebook posts | 24/7 Spain' }, [])

  const load = useCallback(async (p, l, s) => {
    setBusy(true); setErr('')
    try {
      const r = await fetch(`/api/fb?action=posts&lang=${l}&status=${s}`, { headers: { 'x-passcode': p } })
      if (r.status === 401) { setEntered(false); setErr('Wrong password'); setBusy(false); return }
      const raw = await r.text()
      let j
      try { j = JSON.parse(raw) } catch { throw new Error(`Server error ${r.status}: ${raw.slice(0, 200)}`) }
      if (j.error) throw new Error(j.error)
      setPosts(j.posts || [])
      setCounts(j.counts || {})
      sessionStorage.setItem('fb_pass', p)
    } catch (e) { setErr(String(e.message || e)) }
    setBusy(false)
  }, [])

  useEffect(() => { if (entered) load(pass, lang, status) }, [entered, lang, status, load, pass])

  const shown = useMemo(
    () => (kind === 'all' ? posts : posts.filter(p => p.kind === kind)),
    [posts, kind]
  )
  useEffect(() => { setCursor(c => Math.min(c, Math.max(0, shown.length - 1))) }, [shown.length])

  async function patch(id, body) {
    const r = await fetch('/api/fb?action=decide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-passcode': pass },
      body: JSON.stringify({ id, ...body }),
    })
    const raw = await r.text()
    let j
    try { j = JSON.parse(raw) } catch { throw new Error(`Server error ${r.status}: ${raw.slice(0, 200)}`) }
    if (j.error) throw new Error(j.error)
    return j
  }

  const replace = (post) => setPosts(ps => ps.map(x => (x.id === post.id ? { ...x, ...post } : x)))

  // Approving is the send, so it reports what actually happened rather than assuming.
  async function approve(p) {
    setBusy(true); setErr(''); setFlash('')
    try {
      const j = await patch(p.id, { action: 'approved' })
      if (j.post) replace(j.post)
      // A warning is a send the API accepted that may not have reached anyone. It is shown
      // as an error on purpose: a queue that says Sent when nothing arrived is worse than
      // one that says it failed.
      if (j.warning) setErr(j.warning)
      else if (j.sent) setFlash(`Sent to ${j.post?.sent_to || 'the publisher'}, you are copied.`)
      else if (j.reason === 'already sent') setFlash('Approved. It had already been emailed, so nothing was sent again.')
      else setErr(`Approved, but the email did not go: ${j.error}`)
    } catch (e) { setErr(String(e.message || e)) }
    setBusy(false)
  }

  async function resend(p) {
    if (!confirm('Send this post to the publisher again?')) return
    setBusy(true); setErr(''); setFlash('')
    try {
      const j = await patch(p.id, { action: 'resend' })
      if (j.post) replace(j.post)
      if (j.warning) setErr(j.warning)
      else if (j.sent) setFlash('Sent again.')
      else setErr(`It did not go: ${j.error}`)
    } catch (e) { setErr(String(e.message || e)) }
    setBusy(false)
  }

  async function simple(p, body, optimistic) {
    const before = posts
    if (optimistic) setPosts(ps => ps.map(x => (x.id === p.id ? { ...x, ...optimistic } : x)))
    try {
      const j = await patch(p.id, body)
      if (j.post) replace(j.post)
    } catch (e) { setPosts(before); setErr(String(e.message || e)) }
  }

  const park = (p, comment) => { setRejecting(null); return simple(p, { action: 'rejected', comment }, { status: 'rejected', reject_comment: comment }) }
  const markPosted = (p) => simple(p, { action: 'posted' }, { status: 'posted' })
  const undo = (p) => simple(p, { action: 'pending' }, { status: 'pending', reject_comment: null, send_error: null })
  const saveNote = (p, note) => simple(p, { action: 'note', note }, { note })

  async function saveEdit(p) {
    const text = (editing?.text || '').trim()
    if (!text) return
    setEditing(null)
    await simple(p, { action: 'edit', text }, { edited_text: text })
  }

  async function chooseImage(p, url) {
    setPicking(null)
    await simple(p, { action: 'image', image: url }, { image_url: url })
  }

  async function useCustomImage(p) {
    const url = customUrl.trim()
    if (!url) return
    setCustomUrl(''); setPicking(null)
    await simple(p, { action: 'image_custom', image: url }, { image_url: url })
  }

  async function copy(p) {
    try {
      await navigator.clipboard.writeText(textOf(p))
      setCopied(p.id)
      setTimeout(() => setCopied(c => (c === p.id ? null : c)), 1400)
    } catch { setErr('Could not reach the clipboard. Select the text and copy it by hand.') }
  }

  async function seed() {
    setBusy(true); setFlash(''); setErr('')
    try {
      const r = await fetch('/api/fb?action=seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-passcode': pass },
        body: '{}',
      })
      const j = await r.json()
      if (j.error) throw new Error(j.error)
      setFlash(`${j.written} posts written, ${j.ideas} ideas in ${j.languages} languages. ${j.kept_decisions} decisions kept.`)
      await load(pass, lang, status)
    } catch (e) { setErr(String(e.message || e)) }
    setBusy(false)
  }

  // Keyboard review, the same keys the team deck uses.
  useEffect(() => {
    if (!entered) return
    const onKey = (e) => {
      const typing = /^(INPUT|TEXTAREA)$/.test(e.target.tagName)
      if (typing) { if (e.key === 'Escape') { setEditing(null); setRejecting(null) } return }
      const cur = shown[cursor]
      if (e.key === 'j') setCursor(c => Math.min(c + 1, shown.length - 1))
      else if (e.key === 'k') setCursor(c => Math.max(c - 1, 0))
      else if (e.key === 'a' && cur && !cur.sent_at) approve(cur)
      else if (e.key === 'r' && cur) setRejecting({ id: cur.id, comment: '' })
      else if (e.key === 'e' && cur) setEditing({ id: cur.id, text: textOf(cur) })
      else if (e.key === 'c' && cur) copy(cur)
      else if (e.key === 'Escape') { setEditing(null); setRejecting(null); setPicking(null) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [entered, shown, cursor]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const el = cardRefs.current[shown[cursor]?.id]
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [cursor, shown])

  if (!entered) {
    return (
      <div className="fbp-gate">
        <form onSubmit={e => { e.preventDefault(); setEntered(true) }}>
          <h1>My posts</h1>
          <p>24/7 Spain, for Facebook groups. This deck is not the team one.</p>
          <input type="password" value={pass} autoFocus placeholder="Password"
            onChange={e => setPass(e.target.value)} />
          <button type="submit">Open</button>
          {err && <p className="fbp-err">{err}</p>}
        </form>
      </div>
    )
  }

  return (
    <div className="fbp" style={{ background: PAGE_BG }}>
      <header className="fbp-head">
        <div className="fbp-head-in">
          <span className="fbp-brand">24<span style={{ color: GOLD }}>/</span>7 SPAIN</span>
          <span className="fbp-mine">My Facebook posts</span>
          <button className="fbp-seed" onClick={seed} disabled={busy}>Load the latest writing</button>
        </div>
      </header>

      <div className="fbp-bar">
        <div className="fbp-filters">
          <div className="fbp-group" role="group" aria-label="Language">
            {LANGS.map(l => (
              <button key={l.key} className={`fbp-chip${lang === l.key ? ' current' : ''}`}
                aria-pressed={lang === l.key} onClick={() => setLang(l.key)}>{l.label}</button>
            ))}
          </div>
          <div className="fbp-group" role="group" aria-label="Status">
            {STATUSES.map(s => (
              <button key={s.key} className={`fbp-chip${status === s.key ? ' current' : ''}`}
                aria-pressed={status === s.key} onClick={() => setStatus(s.key)}>
                {s.label}{counts[s.key] != null ? ` (${counts[s.key]})` : ''}
              </button>
            ))}
          </div>
          <div className="fbp-group" role="group" aria-label="Kind">
            {[['all', 'Both'], ['story', 'Personal story'], ['informative', 'Straight useful']].map(([k, label]) => (
              <button key={k} className={`fbp-chip${kind === k ? ' current' : ''}`}
                aria-pressed={kind === k} onClick={() => setKind(k)}>{label}</button>
            ))}
          </div>
        </div>
        <p className="fbp-count">
          {shown.length} posts. Approving emails the post to the publisher and copies you.
          <span className="fbp-keys"> j k to move, a approve, e edit, r park, c copy</span>
        </p>
      </div>

      {err && <p className="fbp-err fbp-wide">{err}</p>}
      {flash && <p className="fbp-ok fbp-wide">{flash}</p>}
      {busy && <p className="fbp-wide">Working...</p>}
      {!busy && !shown.length && (
        <p className="fbp-wide">Nothing here yet. Press Load the latest writing to fill the deck.</p>
      )}

      <main className="fbp-list">
        {shown.map((p, i) => {
          const pill = PILL[p.status] || PILL.pending
          const isEditing = editing && editing.id === p.id
          const isRejecting = rejecting && rejecting.id === p.id
          return (
            <article key={p.id} ref={el => { cardRefs.current[p.id] = el }}
              className={`fbp-card${i === cursor ? ' cursor' : ''}`}
              onClick={() => setCursor(i)}>
              <div className="fbp-meta">
                <span className="fbp-pill" style={{ background: pill.bg, color: pill.fg }}>{pill.label}</span>
                <b>{p.kind === 'story' ? 'Personal story' : 'Straight useful'}</b>
                <span className="fbp-tool">{p.tool_slug}</span>
                <span className="fbp-lang">{p.language.toUpperCase()}</span>
                {p.edited_text && <span className="fbp-tag">Edited</span>}
              </div>

              {p.sent_at && (
                <p className="fbp-sent">Emailed to {p.sent_to} on {fmt(p.sent_at)}, you were copied.</p>
              )}
              {p.send_error && (
                <p className="fbp-err fbp-inline">The email did not go: {p.send_error}</p>
              )}
              {p.reject_comment && (
                <p className="fbp-parked">Parked: {p.reject_comment}</p>
              )}

              {p.image_url && !isEditing && (
                <img className="fbp-img" src={p.image_url} alt="" loading="lazy" />
              )}

              {isEditing ? (
                <div className="fbp-edit">
                  <textarea value={editing.text} rows={16} autoFocus
                    onChange={e => setEditing({ id: p.id, text: e.target.value })} />
                  <div className="fbp-editbtns">
                    <button className="fbp-primary" onClick={() => saveEdit(p)}>Save edit</button>
                    <button onClick={() => setEditing(null)}>Cancel</button>
                    {p.edited_text && (
                      <button onClick={() => setEditing({ id: p.id, text: p.post_text })}>Back to the original</button>
                    )}
                  </div>
                </div>
              ) : (
                <pre className="fbp-text">{textOf(p)}</pre>
              )}

              {!!(p.rule_ids || []).length && !isEditing && (
                <p className="fbp-rules">
                  <span>Facts from</span>
                  {p.rule_ids.map(r => <code key={r}>{r}</code>)}
                </p>
              )}

              <label className="fbp-note">
                <span>Which group should this go in? This line is in the email.</span>
                <input defaultValue={p.note || ''} placeholder="Group name, and anything the publisher needs to know"
                  onBlur={e => saveNote(p, e.target.value)} />
              </label>

              <div className="fbp-actions">
                <button onClick={() => setEditing(isEditing ? null : { id: p.id, text: textOf(p) })}>
                  {isEditing ? 'Stop editing' : 'Edit'}
                </button>
                <button onClick={() => setPicking(picking === p.id ? null : p.id)}>Change image</button>
                <button onClick={() => copy(p)}>{copied === p.id ? 'Copied' : 'Copy text'}</button>
                <a href={p.tool_url} target="_blank" rel="noopener noreferrer">Open the page</a>
                <span className="fbp-spacer" />
                {!p.sent_at && (
                  <button className="fbp-primary" onClick={() => approve(p)} disabled={busy}>
                    Approve and send
                  </button>
                )}
                {p.sent_at && <button onClick={() => resend(p)} disabled={busy}>Send again</button>}
                {p.status !== 'posted' && <button onClick={() => markPosted(p)}>It is live</button>}
                {p.status !== 'rejected' && <button onClick={() => setRejecting({ id: p.id, comment: '' })}>Park</button>}
                {p.status !== 'pending' && <button onClick={() => undo(p)}>Undo</button>}
              </div>

              {isRejecting && (
                <div className="fbp-park">
                  <input autoFocus value={rejecting.comment} placeholder="Why? The note is kept with the post."
                    onChange={e => setRejecting({ id: p.id, comment: e.target.value })}
                    onKeyDown={e => { if (e.key === 'Enter') park(p, rejecting.comment) }} />
                  <button className="fbp-primary" onClick={() => park(p, rejecting.comment)}>Park it</button>
                  <button onClick={() => setRejecting(null)}>Cancel</button>
                </div>
              )}

              {picking === p.id && (
                <>
                  <div className="fbp-grid">
                    {(p.image_options || []).map(url => (
                      <button key={url} className={`fbp-opt${url === p.image_url ? ' current' : ''}`}
                        onClick={() => chooseImage(p, url)}>
                        <img src={url} alt="" loading="lazy" />
                        {url === p.image_url && <span className="fbp-inuse">In use</span>}
                      </button>
                    ))}
                  </div>
                  <div className="fbp-custom">
                    <input value={customUrl} placeholder="Or paste an image address of your own, https only"
                      onChange={e => setCustomUrl(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') useCustomImage(p) }} />
                    <button onClick={() => useCustomImage(p)}>Use it</button>
                  </div>
                </>
              )}
            </article>
          )
        })}
      </main>
    </div>
  )
}
