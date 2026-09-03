import { useEffect, useState, useCallback, useRef } from 'react'

// LinkedIn post review deck. Route: /internal-linkedin
// Three content streams (owners / agents / attorneys), each post shown exactly as it
// will look in the LinkedIn feed, with approve / reject / edit / keyboard review.
// Same team passcode as the studio (INTERNAL_PASSCODE); shares the studio_pass session
// key so one login covers /internal and /internal-linkedin.
// No meta.js on purpose: never gets a public homepage card.

const NAVY = '#010221', GOLD = '#C9A96E', ACCENT = '#5B7FCC', LBLUE = '#CBEFFF'
const BG = '#F4F2EE' // LinkedIn's feed background
const CARD_BORDER = '1px solid #E0DFDC'
const LI_FONT = "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
const BRAND_FONT = "'FS Siena', Georgia, serif"
const FOLD_AT = 240 // chars visible before "...see more", roughly LinkedIn's fold

const STREAMS = [
  { key: 'owners', label: 'Owners', desc: 'For foreign property owners in Spain' },
  { key: 'agents', label: 'Agents', desc: 'For real estate agents serving foreign buyers' },
  { key: 'attorneys', label: 'Attorneys', desc: 'For legal advisers to foreign buyers and owners' },
]

const STATUS = {
  pending: { label: 'Pending review', bg: '#FBF3DF', fg: '#7a611c' },
  approved: { label: 'Approved', bg: '#E8F3E8', fg: '#2e7d32' },
  rejected: { label: 'Rejected', bg: '#FAEDED', fg: '#b02a2a' },
}

export default function InternalLinkedIn() {
  const [pass, setPass] = useState(() => sessionStorage.getItem('studio_pass') || '')
  const [entered, setEntered] = useState(false)
  const [stream, setStream] = useState('owners')
  const [tab, setTab] = useState('pending')
  const [posts, setPosts] = useState([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [expanded, setExpanded] = useState({})
  const [editing, setEditing] = useState(null)    // { id, text }
  const [rejecting, setRejecting] = useState(null) // { id, note }
  const [copiedId, setCopiedId] = useState(null)
  const [seeding, setSeeding] = useState(false)
  const [focusId, setFocusId] = useState(null)
  const [flash, setFlash] = useState(null)         // { id, kind }
  const [view, setView] = useState('deck')         // deck | dash
  const [dash, setDash] = useState(null)           // { members, emails }
  const [dashBusy, setDashBusy] = useState(false)
  const [dispatching, setDispatching] = useState(false)
  const [dispatchResult, setDispatchResult] = useState(null)
  const [sendTo, setSendTo] = useState('all')
  const listRef = useRef(null)

  const load = useCallback(async (p) => {
    setBusy(true); setErr('')
    try {
      const r = await fetch('/api/linkedin-posts?status=all', { headers: { 'x-passcode': p } })
      if (r.status === 401) { setEntered(false); setErr('Wrong password'); setBusy(false); return }
      const text = await r.text()
      let j
      try { j = JSON.parse(text) } catch { throw new Error(`Server error ${r.status}: ${text.slice(0, 200)}`) }
      if (j.error) throw new Error(j.error)
      setPosts(j.posts || [])
      sessionStorage.setItem('studio_pass', p)
    } catch (e) { setErr(String(e.message || e)) }
    setBusy(false)
  }, [])

  useEffect(() => { document.title = 'LinkedIn | 24/7 Spain studio' }, [])
  useEffect(() => { if (entered) load(pass) }, [entered, load, pass])

  async function api(path, body) {
    const r = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-passcode': pass },
      body: JSON.stringify(body),
    })
    const text = await r.text()
    let j
    try { j = JSON.parse(text) } catch { throw new Error(`Server error ${r.status}: ${text.slice(0, 200)}`) }
    if (j.error) throw new Error(j.error)
    return j
  }

  // ----- derived data -----
  const byStream = {}
  STREAMS.forEach(s => { byStream[s.key] = { pending: 0, approved: 0, rejected: 0, total: 0 } })
  posts.forEach(p => {
    const b = byStream[p.audience || 'owners']
    if (!b) return
    b.total += 1
    if (b[p.status] !== undefined) b[p.status] += 1
  })
  const streamPosts = posts.filter(p => (p.audience || 'owners') === stream)
  const shown = (tab === 'all' ? streamPosts : streamPosts.filter(p => p.status === tab))
  const sc = byStream[stream]
  const reviewed = sc.total - sc.pending
  const pct = sc.total ? Math.round((reviewed / sc.total) * 100) : 0
  const streamMeta = STREAMS.find(s => s.key === stream)

  // ----- actions -----
  const nextFocusAfter = (id) => {
    const i = shown.findIndex(x => x.id === id)
    const next = shown[i + 1] || shown[i - 1]
    return next ? next.id : null
  }

  async function decide(p, action, comment) {
    const prev = posts
    setFlash({ id: p.id, kind: action })
    setTimeout(() => setFlash(null), 450)
    if (tab === 'pending') setFocusId(nextFocusAfter(p.id))
    setRejecting(null)
    setPosts(list => list.map(x => x.id === p.id
      ? { ...x, status: action, reject_comment: action === 'rejected' ? comment : null }
      : x))
    try { await api('/api/linkedin-decide', { id: p.id, action, comment: comment || null }) }
    catch (e) { setPosts(prev); setErr(`Could not save "${p.title}": ${e.message}`) }
  }

  async function saveEdit(p) {
    const text = (editing && editing.text || '').trim()
    if (!text) return
    try {
      await api('/api/linkedin-decide', { id: p.id, action: 'edit', text })
      setPosts(list => list.map(x => (x.id === p.id ? { ...x, edited_text: text } : x)))
      setEditing(null)
    } catch (e) { setErr(String(e.message || e)) }
  }

  async function seed() {
    setSeeding(true); setErr('')
    try {
      const r = await fetch('/api/linkedin-refresh', { headers: { 'x-passcode': pass } })
      const text = await r.text()
      let j
      try { j = JSON.parse(text) } catch { throw new Error(`Server error ${r.status}: ${text.slice(0, 200)}`) }
      if (j.error) throw new Error(j.error)
      await load(pass)
    } catch (e) { setErr(String(e.message || e)) }
    setSeeding(false)
  }

  async function loadDash() {
    setDashBusy(true); setErr('')
    try {
      const r = await fetch('/api/linkedin-emails', { headers: { 'x-passcode': pass } })
      const text = await r.text()
      let j
      try { j = JSON.parse(text) } catch { throw new Error(`Server error ${r.status}: ${text.slice(0, 200)}`) }
      if (j.error) throw new Error(j.error)
      setDash(j)
    } catch (e) { setErr(String(e.message || e)) }
    setDashBusy(false)
  }

  async function sendReminder() {
    setDispatching(true); setDispatchResult(null); setErr('')
    try {
      const r = await fetch('/api/linkedin-remind?force=1', { headers: { 'x-passcode': pass } })
      const text = await r.text()
      let j
      try { j = JSON.parse(text) } catch { throw new Error(`Server error ${r.status}: ${text.slice(0, 200)}`) }
      if (j.error) throw new Error(j.error)
      setDispatchResult({
        results: [{
          stream: 'reminder to John',
          skipped: `Sent. ${j.pending} pending review, ${j.approved_unsent} approved and not yet emailed, ${j.sent} already out. Next posting day: ${j.next_posting_day}.`,
        }],
      })
    } catch (e) { setErr(String(e.message || e)) }
    setDispatching(false)
  }

  async function runHealth() {
    setDispatching(true); setDispatchResult(null); setErr('')
    try {
      const r = await fetch('/api/linkedin-health', { headers: { 'x-passcode': pass } })
      const text = await r.text()
      let j
      try { j = JSON.parse(text) } catch { throw new Error(`Server error ${r.status}: ${text.slice(0, 200)}`) }
      if (j.error) throw new Error(j.error)
      setDispatchResult({
        results: j.checks.map(c => ({ stream: `${c.ok ? 'OK' : 'ACTION NEEDED'} ${c.name}`, skipped: c.detail })),
      })
    } catch (e) { setErr(String(e.message || e)) }
    setDispatching(false)
  }

  async function refreshTranslations() {
    setDispatching(true); setDispatchResult(null); setErr('')
    try {
      const r = await fetch('/api/linkedin-translate', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-passcode': pass }, body: '{}',
      })
      const text = await r.text()
      let j
      try { j = JSON.parse(text) } catch { throw new Error(`Server error ${r.status}: ${text.slice(0, 200)}`) }
      if (j.error) throw new Error(j.error)
      setDispatchResult({
        results: [{
          stream: 'translations',
          skipped: j.refreshed === 0
            ? `All ${j.posts_checked} approved posts are already translated and up to date.`
            : `Refreshed ${j.refreshed} translation${j.refreshed === 1 ? '' : 's'} across ${j.posts_checked} approved posts.${j.failures ? ` ${j.failures} failed.` : ''}`,
        }],
      })
    } catch (e) { setErr(String(e.message || e)) }
    setDispatching(false)
  }

  async function sendNow() {
    const who = sendTo === 'all' ? 'the whole team' : sendTo
    if (!confirm(`Send the next approved post of each stream to ${who} now?`)) return
    setDispatching(true); setDispatchResult(null); setErr('')
    try {
      const q = sendTo === 'all' ? '' : `?member=${encodeURIComponent(sendTo)}`
      const r = await fetch(`/api/linkedin-dispatch${q}`, { headers: { 'x-passcode': pass } })
      const text = await r.text()
      let j
      try { j = JSON.parse(text) } catch { throw new Error(`Server error ${r.status}: ${text.slice(0, 200)}`) }
      if (j.error) throw new Error(j.error)
      setDispatchResult(j)
      load(pass); loadDash()
    } catch (e) { setErr(String(e.message || e)) }
    setDispatching(false)
  }

  function copyText(p) {
    navigator.clipboard.writeText(p.edited_text || p.post_text)
    setCopiedId(p.id)
    setTimeout(() => setCopiedId(null), 1200)
  }

  // ----- keyboard review -----
  useEffect(() => {
    if (!entered) return
    const h = (e) => {
      const t = e.target && e.target.tagName
      if (t === 'TEXTAREA' || t === 'INPUT') {
        if (e.key === 'Escape') { setRejecting(null); setEditing(null) }
        return
      }
      if (!shown.length) return
      const idx = Math.max(0, shown.findIndex(x => x.id === focusId))
      const cur = shown[idx] || shown[0]
      if (e.key === 'j' || e.key === 'ArrowDown') { e.preventDefault(); setFocusId((shown[Math.min(idx + 1, shown.length - 1)] || cur).id) }
      else if (e.key === 'k' || e.key === 'ArrowUp') { e.preventDefault(); setFocusId((shown[Math.max(idx - 1, 0)] || cur).id) }
      else if (e.key === 'a' && cur && cur.status === 'pending') decide(cur, 'approved')
      else if (e.key === 'r' && cur && cur.status === 'pending') setRejecting({ id: cur.id, note: '' })
      else if (e.key === 'e' && cur) setEditing({ id: cur.id, text: cur.edited_text || cur.post_text })
      else if (e.key === 'c' && cur) copyText(cur)
      else if (e.key === 'Escape') { setRejecting(null); setEditing(null) }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  })

  useEffect(() => {
    if (!focusId || !listRef.current) return
    const el = listRef.current.querySelector(`[data-pid="${focusId}"]`)
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [focusId])

  // ----- gate -----
  if (!entered)
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: BRAND_FONT }}>
        <div style={{ textAlign: 'center', background: '#fff', border: CARD_BORDER, borderRadius: 20, padding: '40px 48px', boxShadow: '0 8px 30px rgba(1,2,33,.08)' }}>
          <div style={{ fontSize: 34, fontWeight: 700, color: NAVY, marginBottom: 4 }}>
            24<span style={{ color: GOLD }}>/</span>7 SPAIN <span style={{ fontWeight: 400, fontSize: 16, color: ACCENT }}>linkedin</span>
          </div>
          <p style={{ color: '#5a5f73', fontSize: 14, margin: '6px 0 14px' }}>Review the team's LinkedIn posts before they go out.</p>
          <input type="password" value={pass} placeholder="Team password" autoFocus
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && setEntered(true)}
            style={{ padding: '12px 16px', fontSize: 16, borderRadius: 10, border: '1px solid #c4c9d4', width: 220 }} />
          <div>
            <button onClick={() => setEntered(true)} style={{ ...btn(NAVY, '#fff'), width: '100%', marginTop: 12 }}>Open the deck</button>
          </div>
          {err && <p style={{ color: '#b00020', fontSize: 14 }}>{err}</p>}
        </div>
      </div>
    )

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: BRAND_FONT }}>
      <header style={{ background: NAVY, color: '#fff', padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontSize: 19, fontWeight: 700 }}>
          24<span style={{ color: GOLD }}>/</span>7 SPAIN <span style={{ fontWeight: 400, fontSize: 12, color: LBLUE }}>linkedin</span>
        </div>
        <nav style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          {[['deck', 'Review deck'], ['dash', 'Dashboard']].map(([v, label]) => (
            <button key={v} onClick={() => { setView(v); if (v === 'dash') loadDash() }}
              style={{ ...btn(view === v ? GOLD : 'transparent', view === v ? NAVY : '#fff'), border: '1px solid ' + (view === v ? GOLD : '#3a3f5c'), marginTop: 0, padding: '7px 13px', fontSize: 13 }}>
              {label}
            </button>
          ))}
          <button onClick={seed} disabled={seeding}
            style={{ ...btn('transparent', LBLUE), border: '1px dashed #3a3f5c', marginLeft: 8, marginTop: 0, padding: '7px 13px', fontSize: 13 }}>
            {seeding ? 'Syncing…' : 'Sync new posts'}
          </button>
        </nav>
      </header>

      {view === 'deck' && <>
      {/* Sticky controls: stream switcher, progress, status filter */}
      <div style={{ position: 'sticky', top: 0, zIndex: 5, background: BG, boxShadow: '0 8px 14px -10px rgba(1,2,33,.18)' }}>
      <div style={{ maxWidth: 555, margin: '0 auto', padding: '10px 12px' }}>
        <div style={{ display: 'flex', background: '#fff', border: CARD_BORDER, borderRadius: 12, padding: 4, gap: 4 }}>
          {STREAMS.map(s => {
            const active = s.key === stream
            const pend = byStream[s.key].pending
            return (
              <button key={s.key} onClick={() => { setStream(s.key); setFocusId(null) }}
                style={{
                  flex: 1, padding: '10px 6px', borderRadius: 9, border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 14, fontWeight: active ? 700 : 400,
                  background: active ? NAVY : 'transparent', color: active ? '#fff' : NAVY,
                }}>
                {s.label}
                {pend > 0 && (
                  <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, background: active ? GOLD : '#EEE9DC', color: NAVY, borderRadius: 999, padding: '2px 7px' }}>{pend}</span>
                )}
              </button>
            )
          })}
        </div>
        <p style={{ color: '#5a5f73', fontSize: 13, margin: '8px 4px 0' }}>{streamMeta.desc}.</p>

        {/* Progress */}
        {sc.total > 0 && (
          <div style={{ margin: '10px 4px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#5a5f73', marginBottom: 4 }}>
              <span>{sc.pending === 0 ? 'Stream fully reviewed' : `${reviewed} of ${sc.total} reviewed`}</span>
              <span>{pct}%</span>
            </div>
            <div style={{ height: 6, background: '#E4E1DA', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: sc.pending === 0 ? '#2e7d32' : ACCENT, borderRadius: 999, transition: 'width .4s ease' }} />
            </div>
          </div>
        )}

        {/* Status filter */}
        <div style={{ display: 'flex', gap: 6, margin: '12px 0 0', flexWrap: 'wrap' }}>
          {['pending', 'approved', 'rejected', 'all'].map(t => (
            <button key={t} onClick={() => { setTab(t); setFocusId(null) }}
              style={{
                padding: '8px 14px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
                border: '1px solid ' + (t === tab ? NAVY : '#D5D2CA'),
                background: t === tab ? NAVY : '#fff', color: t === tab ? '#fff' : '#3a3f52',
                fontWeight: t === tab ? 700 : 400, textTransform: 'capitalize',
              }}>
              {t === 'all' ? `All (${sc.total})` : `${t} (${sc[t]})`}
            </button>
          ))}
        </div>
      </div>
      </div>

      {err && (
        <div style={{ maxWidth: 555, margin: '12px auto 0', padding: '0 12px' }}>
          <div style={{ background: '#fff', border: '1px solid #e0b4b4', color: '#8a1f1f', borderRadius: 12, padding: '12px 16px', fontSize: 14 }}>{err}</div>
        </div>
      )}

      <main ref={listRef} style={{ maxWidth: 555, margin: '0 auto', padding: '16px 12px 60px' }}>
        {busy && <p style={{ textAlign: 'center', color: '#5a5f73' }}>Loading…</p>}

        {!busy && posts.length === 0 && !err && (
          <div style={{ textAlign: 'center', marginTop: 40, background: '#fff', border: CARD_BORDER, borderRadius: 14, padding: '30px 24px' }}>
            <h2 style={{ color: NAVY, marginTop: 0 }}>No posts in the deck yet.</h2>
            <p style={{ color: '#5a5f73', fontSize: 14 }}>Load the master posts: three streams, one for owners, one for agents, one for attorneys. Safe to press twice; it never overwrites decisions.</p>
            <button onClick={seed} disabled={seeding} style={{ ...btn(NAVY, '#fff'), padding: '13px 26px', fontSize: 15 }}>
              {seeding ? 'Loading posts…' : 'Load the master posts'}
            </button>
          </div>
        )}

        {!busy && sc.total > 0 && tab === 'pending' && sc.pending === 0 && (
          <div style={{ textAlign: 'center', background: '#fff', border: CARD_BORDER, borderRadius: 14, padding: '26px 22px' }}>
            <h2 style={{ color: NAVY, margin: '0 0 6px' }}>This stream is done.</h2>
            <p style={{ color: '#5a5f73', fontSize: 14, margin: 0 }}>
              {sc.approved} approved, {sc.rejected} rejected. Rejected posts get rewritten from your notes.
            </p>
          </div>
        )}

        {!busy && sc.total > 0 && !(tab === 'pending' && sc.pending === 0) && shown.length === 0 && (
          <p style={{ textAlign: 'center', color: '#5a5f73', marginTop: 30 }}>Nothing in {tab} for this stream.</p>
        )}

        {shown.map(p => {
          const st = STATUS[p.status] || STATUS.pending
          const text = p.edited_text || p.post_text
          const isOpen = !!expanded[p.id]
          const needsFold = text.length > FOLD_AT + 60
          const visible = !needsFold || isOpen ? text : text.slice(0, text.lastIndexOf(' ', FOLD_AT)).trimEnd()
          const isEditing = editing && editing.id === p.id
          const isRejecting = rejecting && rejecting.id === p.id
          const isFocused = focusId === p.id
          const fl = flash && flash.id === p.id ? flash.kind : null
          return (
            <section key={p.id} data-pid={p.id} onClick={() => setFocusId(p.id)}
              style={{ marginBottom: 22, borderRadius: 12, boxShadow: isFocused ? `0 0 0 2px ${ACCENT}` : 'none', transition: 'box-shadow .15s ease', position: 'relative' }}>
              {fl && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 2, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: fl === 'approved' ? 'rgba(46,125,50,.45)' : 'rgba(176,42,42,.45)', color: '#fff', fontSize: 26, fontWeight: 700, pointerEvents: 'none' }}>
                  {fl === 'approved' ? 'Approved' : 'Rejected'}
                </div>
              )}
              <article style={{ background: '#fff', border: CARD_BORDER, borderRadius: '10px 10px 0 0', overflow: 'hidden', fontFamily: LI_FONT }}>
                <div style={{ display: 'flex', gap: 10, padding: '14px 16px 0' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: NAVY, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0, fontFamily: BRAND_FONT }}>
                    24<span style={{ color: GOLD }}>/</span>7
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(0,0,0,.9)' }}>
                      24/7 Spain Team <span style={{ color: 'rgba(0,0,0,.6)', fontWeight: 400 }}>· 1st</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(0,0,0,.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Property, tax and life in Spain
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(0,0,0,.6)' }}>
                      Day {p.day}{p.edited_text ? ' · Edited' : ''}
                    </div>
                  </div>
                </div>

                {isEditing ? (
                  <div style={{ padding: '10px 16px 14px' }}>
                    <textarea value={editing.text} onChange={e => setEditing({ id: p.id, text: e.target.value })}
                      rows={14} autoFocus
                      style={{ width: '100%', boxSizing: 'border-box', fontFamily: LI_FONT, fontSize: 14, lineHeight: 1.45, border: '1px solid #c4c9d4', borderRadius: 8, padding: 10 }} />
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button onClick={() => saveEdit(p)} style={{ ...btn(NAVY, '#fff'), marginTop: 0, padding: '8px 18px', fontSize: 13 }}>Save edit</button>
                      <button onClick={() => setEditing(null)} style={{ ...btn('#EEF1F6', NAVY), marginTop: 0, padding: '8px 18px', fontSize: 13 }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '10px 16px 12px', fontSize: 14, lineHeight: 1.45, color: 'rgba(0,0,0,.9)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {visible}
                    {needsFold && !isOpen && (
                      <span> <button onClick={e => { e.stopPropagation(); setExpanded(x => ({ ...x, [p.id]: true })) }}
                        style={{ background: 'none', border: 'none', color: 'rgba(0,0,0,.6)', cursor: 'pointer', fontSize: 14, padding: 0, fontFamily: 'inherit' }}>…see more</button></span>
                    )}
                    {needsFold && isOpen && (
                      <div><button onClick={e => { e.stopPropagation(); setExpanded(x => ({ ...x, [p.id]: false })) }}
                        style={{ background: 'none', border: 'none', color: 'rgba(0,0,0,.6)', cursor: 'pointer', fontSize: 13, padding: 0, marginTop: 6, fontFamily: 'inherit' }}>Show less</button></div>
                    )}
                  </div>
                )}

                {p.image_url && !isEditing && (
                  <img src={p.image_url} alt="" draggable={false} loading="lazy"
                    style={{ width: '100%', display: 'block', maxHeight: 340, objectFit: 'cover' }} />
                )}

                <div style={{ borderTop: '1px solid #EBEBEB', margin: '0 12px', padding: '6px 4px', display: 'flex', justifyContent: 'space-around', color: 'rgba(0,0,0,.6)', fontSize: 13, fontWeight: 600 }}>
                  <span style={{ padding: '6px 8px' }}>Like</span>
                  <span style={{ padding: '6px 8px' }}>Comment</span>
                  <span style={{ padding: '6px 8px' }}>Repost</span>
                  <span style={{ padding: '6px 8px' }}>Send</span>
                </div>
              </article>

              <div style={{ background: '#FAFAF8', border: CARD_BORDER, borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '10px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, background: st.bg, color: st.fg, borderRadius: 999, padding: '4px 12px', fontWeight: 600 }}>{st.label}</span>
                    {p.slug.includes('partner') && (
                      <span style={{ fontSize: 12, background: '#F4EBDD', color: '#7a611c', borderRadius: 999, padding: '4px 12px', fontWeight: 600 }}>Partner post</span>
                    )}
                  </span>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button onClick={() => copyText(p)} style={{ ...btn('#EEF1F6', NAVY), marginTop: 0, padding: '9px 14px', fontSize: 13 }}>
                      {copiedId === p.id ? 'Copied' : 'Copy text'}
                    </button>
                    {!isEditing && (
                      <button onClick={() => setEditing({ id: p.id, text: p.edited_text || p.post_text })}
                        style={{ ...btn('#EEF1F6', NAVY), marginTop: 0, padding: '9px 14px', fontSize: 13 }}>Edit</button>
                    )}
                    {p.status === 'pending' ? (
                      <>
                        <button onClick={() => setRejecting({ id: p.id, note: '' })}
                          style={{ ...btn('#fff', '#8c1a1a'), marginTop: 0, padding: '9px 16px', fontSize: 13, border: '1.5px solid #8c1a1a' }}>Reject</button>
                        <button onClick={() => decide(p, 'approved')}
                          style={{ ...btn(NAVY, '#fff'), marginTop: 0, padding: '9px 22px', fontSize: 13, fontWeight: 700 }}>Approve</button>
                      </>
                    ) : (
                      <button onClick={() => decide(p, 'pending')}
                        style={{ ...btn('#fff', '#5a5f73'), marginTop: 0, padding: '9px 14px', fontSize: 13, border: '1px solid #c4c9d4' }}>Undo</button>
                    )}
                  </div>
                </div>

                {isRejecting && (
                  <div style={{ marginTop: 10 }}>
                    <textarea value={rejecting.note} autoFocus rows={2}
                      placeholder="Why reject? Your note drives the rewrite."
                      onChange={e => setRejecting({ id: p.id, note: e.target.value })}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey && rejecting.note.trim()) { e.preventDefault(); decide(p, 'rejected', rejecting.note.trim()) }
                      }}
                      style={{ width: '100%', boxSizing: 'border-box', fontFamily: LI_FONT, fontSize: 13, border: '1px solid #d8a5a5', borderRadius: 8, padding: 8 }} />
                    <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                      <button disabled={!rejecting.note.trim()} onClick={() => decide(p, 'rejected', rejecting.note.trim())}
                        style={{ ...btn('#8c1a1a', '#fff'), marginTop: 0, padding: '8px 16px', fontSize: 13, opacity: rejecting.note.trim() ? 1 : .5 }}>Save rejection</button>
                      <button onClick={() => setRejecting(null)} style={{ ...btn('#EEF1F6', NAVY), marginTop: 0, padding: '8px 16px', fontSize: 13 }}>Cancel</button>
                    </div>
                  </div>
                )}

                {p.status === 'rejected' && p.reject_comment && !isRejecting && (
                  <p style={{ color: '#8a1f1f', fontSize: 13, background: '#FAEDED', borderRadius: 8, padding: '7px 10px', margin: '8px 0 0' }}>
                    Note: {p.reject_comment}
                  </p>
                )}
              </div>
            </section>
          )
        })}

        {!busy && shown.length > 0 && (
          <p style={{ textAlign: 'center', color: '#8a8fa3', fontSize: 12, marginTop: 4 }}>
            Keyboard: J / K move · A approve · R reject · E edit · C copy
          </p>
        )}
      </main>
      </>}

      {view === 'dash' && (
        <main style={{ maxWidth: 920, margin: '0 auto', padding: '18px 14px 60px' }}>
          {err && (
            <div style={{ background: '#fff', border: '1px solid #e0b4b4', color: '#8a1f1f', borderRadius: 12, padding: '12px 16px', fontSize: 14, marginBottom: 14 }}>{err}</div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 14 }}>
            {STREAMS.map(s => {
              const sp = posts.filter(p => (p.audience || 'owners') === s.key)
              const n = k => sp.filter(p => p.status === k).length
              return (
                <div key={s.key} style={{ background: '#fff', border: CARD_BORDER, borderRadius: 14, padding: '14px 16px' }}>
                  <div style={{ fontWeight: 700, color: NAVY, marginBottom: 8 }}>{s.label} <span style={{ fontWeight: 400, color: '#8a8fa3', fontSize: 12 }}>{sp.length} posts</span></div>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <Stat label="Approved" value={n('approved')} color="#2e7d32" />
                    <Stat label="Rejected" value={n('rejected')} color="#b02a2a" />
                    <Stat label="Pending" value={n('pending')} color="#7a611c" />
                    <Stat label="Emailed" value={sp.filter(p => p.sent_at).length} color={ACCENT} />
                  </div>
                </div>
              )
            })}
          </div>

          <Card title="Daily email dispatch">
            <p style={{ fontSize: 13, color: '#5a5f73', margin: '0 0 10px' }}>
              Approving a post sends it to the whole team immediately, each person in their own language, with Pratik and John on copy. The team publishes on Tuesdays and Thursdays. John gets a review reminder on Sunday and Tuesday evenings. Use Send now only to catch up something approved that never went out, or to resend to one person.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <label style={{ fontSize: 13, color: '#3a3f52' }}>
                Send to{' '}
                <select value={sendTo} onChange={e => setSendTo(e.target.value)}
                  style={{ fontFamily: 'inherit', fontSize: 13, padding: '8px 10px', borderRadius: 8, border: '1px solid #c4c9d4', background: '#fff' }}>
                  <option value="all">the whole team</option>
                  {(dash ? dash.members : []).filter(m => m.email && m.active !== false).map(m => (
                    <option key={m.id} value={m.name}>{m.name} ({m.language})</option>
                  ))}
                </select>
              </label>
              <button onClick={sendNow} disabled={dispatching} style={{ ...btn(NAVY, '#fff'), marginTop: 0, padding: '9px 18px', fontSize: 13, fontWeight: 700 }}>
                {dispatching ? 'Working…' : 'Send now'}
              </button>
              <button onClick={refreshTranslations} disabled={dispatching} style={{ ...btn('#EEF1F6', NAVY), marginTop: 0, padding: '9px 16px', fontSize: 13 }}>
                Refresh translations
              </button>
              <button onClick={sendReminder} disabled={dispatching} style={{ ...btn('#EEF1F6', NAVY), marginTop: 0, padding: '9px 16px', fontSize: 13 }}>
                Remind John now
              </button>
              <button onClick={runHealth} disabled={dispatching} style={{ ...btn('#EEF1F6', NAVY), marginTop: 0, padding: '9px 16px', fontSize: 13 }}>
                Run health check
              </button>
            </div>
            <p style={{ fontSize: 12, color: '#8a8fa3', margin: '8px 0 0' }}>
              Edited an approved post? Its translations are regenerated automatically before the next send. Use Refresh translations to update them right away.
            </p>
            {dispatchResult && (
              <div style={{ marginTop: 10, fontSize: 13, background: '#F8F7F4', borderRadius: 8, padding: '10px 12px' }}>
                {dispatchResult.results.map((r, i) => (
                  <div key={i} style={{ padding: '2px 0' }}>
                    <b style={{ textTransform: 'capitalize' }}>{r.stream}</b>:{' '}
                    {r.skipped ? r.skipped
                      : r.would_send ? `would send "${r.would_send}" (day ${r.day}) to ${(r.to || []).join(', ')}`
                      : `sent "${r.post}" (day ${r.day}) to ${r.sent} member${r.sent === 1 ? '' : 's'}${r.failed ? `, ${r.failed} failed` : ''}`}
                    {r.retranslated && r.retranslated.updated && r.retranslated.updated.length > 0 && (
                      <div style={{ color: '#2e7d32', fontSize: 12 }}>Translations refreshed before sending: {r.retranslated.updated.join(', ')}</div>
                    )}
                    {r.translations_stale && (
                      <div style={{ color: '#7a611c', fontSize: 12 }}>Older translation used for: {r.translations_stale.join(', ')}</div>
                    )}
                    {r.translations_missing && (
                      <div style={{ color: '#b02a2a', fontSize: 12 }}>English fallback sent to: {r.translations_missing.join(', ')}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Why posts were rejected">
            {posts.filter(p => p.status === 'rejected').length === 0 && <p style={{ fontSize: 13, color: '#5a5f73', margin: 0 }}>No rejections yet.</p>}
            {posts.filter(p => p.status === 'rejected').map(p => (
              <div key={p.id} style={{ padding: '8px 0', borderBottom: '1px solid #F0EEE8', fontSize: 13 }}>
                <span style={{ fontWeight: 600, color: NAVY }}>{p.title}</span>
                <span style={{ color: '#8a8fa3' }}> · {(p.audience || 'owners')} · day {p.day}</span>
                <div style={{ color: '#8a1f1f', marginTop: 2 }}>{p.reject_comment || 'No note'}</div>
              </div>
            ))}
          </Card>

          <Card title="Team roster">
            {dashBusy && <p style={{ fontSize: 13, margin: 0 }}>Loading…</p>}
            {dash && dash.members.map(m => (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #F0EEE8', fontSize: 13, flexWrap: 'wrap', gap: 4 }}>
                <span><b style={{ color: NAVY }}>{m.name}</b> <span style={{ color: '#8a8fa3' }}>· {m.language} · {m.stream}{m.active ? '' : ' · inactive'}</span></span>
                {m.email ? <span style={{ color: '#3a3f52' }}>{m.email}</span> : <span style={{ color: '#b02a2a', fontWeight: 600 }}>email missing</span>}
              </div>
            ))}
            {dash && <p style={{ fontSize: 12, color: '#8a8fa3', margin: '8px 0 0' }}>Members without an email are skipped by the dispatch. The roster lives in the team_members table.</p>}
          </Card>

          <Card title="Email log (latest 100)">
            {dash && dash.emails.length === 0 && <p style={{ fontSize: 13, color: '#5a5f73', margin: 0 }}>Nothing sent yet.</p>}
            {dash && dash.emails.map(e => (
              <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '6px 0', borderBottom: '1px solid #F0EEE8', fontSize: 13, flexWrap: 'wrap' }}>
                <span>{new Date(e.sent_at).toLocaleString()} · <b>{e.member_name}</b> · {e.post_title}</span>
                <span style={{ color: e.status === 'sent' ? '#2e7d32' : '#b02a2a', fontWeight: 600 }}>{e.status}{e.error ? `: ${e.error.slice(0, 80)}` : ''}</span>
              </div>
            ))}
          </Card>
        </main>
      )}
    </div>
  )
}

const Card = ({ title, children }) => (
  <div style={{ background: '#fff', border: CARD_BORDER, borderRadius: 14, padding: '14px 16px', marginTop: 14 }}>
    <div style={{ fontWeight: 700, color: NAVY, marginBottom: 8 }}>{title}</div>
    {children}
  </div>
)

const Stat = ({ label, value, color }) => (
  <span style={{ fontSize: 13 }}>
    <span style={{ fontSize: 20, fontWeight: 700, color }}>{value}</span>
    <span style={{ color: '#5a5f73', marginLeft: 5 }}>{label}</span>
  </span>
)

const btn = (bg, color) => ({
  background: bg, color, padding: '10px 16px', borderRadius: 999, border: 'none',
  fontSize: 14, cursor: 'pointer', marginTop: 8, fontFamily: 'inherit',
})
