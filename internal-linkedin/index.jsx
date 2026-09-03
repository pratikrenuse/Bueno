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
  const [allRows, setAllRows] = useState([])   // every row incl. translations, for coverage
  const [logFilter, setLogFilter] = useState('all')
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
      const [er, ar] = await Promise.all([
        fetch('/api/linkedin-emails', { headers: { 'x-passcode': pass } }),
        fetch('/api/linkedin-posts?status=all&lang=all', { headers: { 'x-passcode': pass } }),
      ])
      const etext = await er.text()
      let j
      try { j = JSON.parse(etext) } catch { throw new Error(`Server error ${er.status}: ${etext.slice(0, 200)}`) }
      if (j.error) throw new Error(j.error)
      setDash(j)
      if (ar.ok) {
        const atext = await ar.text()
        try {
          const aj = JSON.parse(atext)
          if (!aj.error) setAllRows(aj.posts || [])
        } catch { /* coverage panel simply stays empty */ }
      }
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

      {view === 'dash' && (() => {
        const pendingAll = posts.filter(p => p.status === 'pending')
        const approvedAll = posts.filter(p => p.status === 'approved')
        const rejectedAll = posts.filter(p => p.status === 'rejected')
        const sentAll = posts.filter(p => p.sent_at)
        const queued = approvedAll.filter(p => !p.sent_at)
        const weeksOfRunway = Math.floor(sentAll.length ? queued.length / 2 : queued.length / 2)
        const members = (dash ? dash.members : []).filter(m => m.active !== false)
        const mailable = members.filter(m => m.email && m.email.includes('@'))
        const emails = dash ? dash.emails : []
        const failedMails = emails.filter(e => e.status !== 'sent')
        const nextDay = (() => {
          const d = new Date().getUTCDay()
          const toTue = (2 - d + 7) % 7 || 7
          const toThu = (4 - d + 7) % 7 || 7
          return toTue <= toThu ? 'Tuesday' : 'Thursday'
        })()
        const langs = [...new Set(mailable.map(m => m.language || 'en'))].filter(l => l !== 'en')
        const lastFor = (name) => {
          const hit = emails.find(e => (e.member_name || '').toLowerCase().startsWith(String(name).toLowerCase()))
          return hit ? new Date(hit.sent_at) : null
        }
        const wordCount = posts.reduce((n, p) => n + (p.post_text || '').split(/\s+/).length, 0)

        return (
        <main style={{ maxWidth: 980, margin: '0 auto', padding: '18px 14px 60px' }}>
          {err && (
            <div style={{ background: '#fff', border: '1px solid #e0b4b4', color: '#8a1f1f', borderRadius: 12, padding: '12px 16px', fontSize: 14, marginBottom: 14 }}>{err}</div>
          )}

          {/* Where things stand, and the one thing to do about it */}
          <div style={{ background: NAVY, color: '#fff', borderRadius: 18, padding: '22px 24px', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div style={{ minWidth: 240 }}>
                <div style={{ fontSize: 12, letterSpacing: 1.4, textTransform: 'uppercase', color: GOLD, marginBottom: 6 }}>Next posting day</div>
                <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.1 }}>{nextDay}</div>
                <div style={{ fontSize: 13, color: LBLUE, marginTop: 8 }}>
                  {queued.length > 0
                    ? `${queued.length} post${queued.length === 1 ? '' : 's'} approved and with the team. That is about ${weeksOfRunway} week${weeksOfRunway === 1 ? '' : 's'} of posting at two a week.`
                    : 'Nothing approved yet. The team has nothing to post.'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {pendingAll.length > 0 ? (
                  <>
                    <div style={{ fontSize: 44, fontWeight: 700, lineHeight: 1, color: GOLD }}>{pendingAll.length}</div>
                    <div style={{ fontSize: 13, color: LBLUE, margin: '4px 0 10px' }}>waiting for review</div>
                    <button onClick={() => { setView('deck'); setTab('pending') }}
                      style={{ ...btn(GOLD, NAVY), marginTop: 0, padding: '11px 22px', fontSize: 14, fontWeight: 700 }}>
                      Review them now
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>All reviewed</div>
                    <div style={{ fontSize: 13, color: LBLUE, marginTop: 4 }}>Nothing is waiting on John.</div>
                  </>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap', marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,.14)' }}>
              <HeroStat label="Approved" value={approvedAll.length} />
              <HeroStat label="Sent to team" value={sentAll.length} />
              <HeroStat label="Rejected" value={rejectedAll.length} />
              <HeroStat label="Team members" value={mailable.length} />
              <HeroStat label="Emails delivered" value={emails.filter(e => e.status === 'sent').length} />
              {failedMails.length > 0 && <HeroStat label="Failed" value={failedMails.length} tone="#ff9d9d" />}
            </div>
          </div>

          {/* Per stream progress */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 14 }}>
            {STREAMS.map(s => {
              const sp = posts.filter(p => (p.audience || 'owners') === s.key)
              const n = k => sp.filter(p => p.status === k).length
              const done = sp.length - n('pending')
              const pct = sp.length ? Math.round((done / sp.length) * 100) : 0
              const streamMembers = mailable.filter(m => (m.stream || 'owners') === s.key)
              return (
                <div key={s.key} style={{ background: '#fff', border: CARD_BORDER, borderRadius: 16, padding: '16px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontWeight: 700, color: NAVY, fontSize: 16 }}>{s.label}</div>
                    <div style={{ fontSize: 12, color: '#8a8fa3' }}>{sp.length} posts</div>
                  </div>
                  <div style={{ fontSize: 12, color: '#8a8fa3', margin: '2px 0 10px' }}>
                    {streamMembers.length
                      ? `${streamMembers.map(m => m.name).join(', ')}`
                      : 'No one assigned, this stream will not send'}
                  </div>
                  <div style={{ height: 8, background: '#EDEAE4', borderRadius: 999, overflow: 'hidden', marginBottom: 10 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#2e7d32' : ACCENT, transition: 'width .4s ease' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                    <Stat label="Approved" value={n('approved')} color="#2e7d32" />
                    <Stat label="Pending" value={n('pending')} color="#7a611c" />
                    <Stat label="Rejected" value={n('rejected')} color="#b02a2a" />
                    <Stat label="Sent" value={sp.filter(p => p.sent_at).length} color={ACCENT} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Actions */}
          <Card title="Actions">
            <p style={{ fontSize: 13, color: '#5a5f73', margin: '0 0 12px' }}>
              Approving a post already sends it to the whole team, each person in their own language, with you and John on copy. Everything here is for the exceptions.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <label style={{ fontSize: 13, color: '#3a3f52' }}>
                Catch up unsent posts for{' '}
                <select value={sendTo} onChange={e => setSendTo(e.target.value)}
                  style={{ fontFamily: 'inherit', fontSize: 13, padding: '8px 10px', borderRadius: 8, border: '1px solid #c4c9d4', background: '#fff' }}>
                  <option value="all">the whole team</option>
                  {mailable.map(m => (<option key={m.id} value={m.name}>{m.name} ({m.language})</option>))}
                </select>
              </label>
              <button onClick={sendNow} disabled={dispatching} style={{ ...btn(NAVY, '#fff'), marginTop: 0, padding: '9px 18px', fontSize: 13, fontWeight: 700 }}>
                {dispatching ? 'Working…' : 'Send now'}
              </button>
              <button onClick={sendReminder} disabled={dispatching} style={{ ...btn('#EEF1F6', NAVY), marginTop: 0, padding: '9px 16px', fontSize: 13 }}>Remind John</button>
              <button onClick={refreshTranslations} disabled={dispatching} style={{ ...btn('#EEF1F6', NAVY), marginTop: 0, padding: '9px 16px', fontSize: 13 }}>Refresh translations</button>
              <button onClick={runHealth} disabled={dispatching} style={{ ...btn('#EEF1F6', NAVY), marginTop: 0, padding: '9px 16px', fontSize: 13 }}>Health check</button>
            </div>
            {dispatchResult && (
              <div style={{ marginTop: 12, fontSize: 13, background: '#F8F7F4', border: CARD_BORDER, borderRadius: 10, padding: '12px 14px' }}>
                {dispatchResult.results.map((r, i) => (
                  <div key={i} style={{ padding: '3px 0' }}>
                    <b style={{ textTransform: 'capitalize' }}>{r.stream}</b>:{' '}
                    {r.skipped ? r.skipped
                      : r.would_send ? `would send "${r.would_send}" (day ${r.day}) to ${(r.to || []).join(', ')}`
                      : `sent "${r.post}" (day ${r.day}) to ${r.sent} member${r.sent === 1 ? '' : 's'}${r.failed ? `, ${r.failed} failed` : ''}`}
                    {r.retranslated && r.retranslated.updated && r.retranslated.updated.length > 0 && (
                      <div style={{ color: '#2e7d32', fontSize: 12 }}>Translations refreshed first: {r.retranslated.updated.join(', ')}</div>
                    )}
                    {r.translations_stale && <div style={{ color: '#7a611c', fontSize: 12 }}>Older translation used for: {r.translations_stale.join(', ')}</div>}
                    {r.translations_missing && <div style={{ color: '#b02a2a', fontSize: 12 }}>English fallback sent to: {r.translations_missing.join(', ')}</div>}
                    {r.errors && r.errors.map((x, k) => <div key={k} style={{ color: '#b02a2a', fontSize: 12 }}>{x}</div>)}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Language coverage */}
          <Card title="Language coverage">
            {langs.length === 0 && <p style={{ fontSize: 13, color: '#5a5f73', margin: 0 }}>Everyone on the roster posts in English, so nothing needs translating.</p>}
            {langs.length > 0 && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10 }}>
                  {langs.map(l => {
                    const who = mailable.filter(m => (m.language || 'en') === l).map(m => m.name)
                    const needed = posts.filter(p => mailable.some(m => (m.language || 'en') === l && (m.stream || 'owners') === (p.audience || 'owners')))
                    const have = needed.filter(p => allRows.some(r => r.slug === p.slug && r.language === l && (r.audience || 'owners') === (p.audience || 'owners')))
                    const pct = needed.length ? Math.round((have.length / needed.length) * 100) : 100
                    return (
                      <div key={l} style={{ border: CARD_BORDER, borderRadius: 12, padding: '10px 12px', background: '#FBFAF8' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <b style={{ color: NAVY, textTransform: 'uppercase', fontSize: 13 }}>{l}</b>
                          <span style={{ fontSize: 12, color: pct === 100 ? '#2e7d32' : '#7a611c', fontWeight: 700 }}>{pct}%</span>
                        </div>
                        <div style={{ fontSize: 12, color: '#8a8fa3', margin: '2px 0 8px' }}>{who.join(', ')}</div>
                        <div style={{ height: 6, background: '#EDEAE4', borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#2e7d32' : GOLD }} />
                        </div>
                        <div style={{ fontSize: 11, color: '#8a8fa3', marginTop: 6 }}>{have.length} of {needed.length} posts</div>
                      </div>
                    )
                  })}
                </div>
                <p style={{ fontSize: 12, color: '#8a8fa3', margin: '10px 0 0' }}>
                  Anything missing is written automatically before that post is sent, so a gap here is not a blocker.
                </p>
              </>
            )}
          </Card>

          {/* Team */}
          <Card title="The team">
            {dashBusy && <p style={{ fontSize: 13, margin: 0 }}>Loading…</p>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 10 }}>
              {(dash ? dash.members : []).map(m => {
                const last = lastFor(m.name)
                const ok = m.email && m.email.includes('@')
                return (
                  <div key={m.id} style={{ border: CARD_BORDER, borderRadius: 12, padding: '12px 14px', background: ok ? '#FBFAF8' : '#FDF6F6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <b style={{ color: NAVY }}>{m.name}</b>
                      <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: ACCENT }}>{m.language}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#8a8fa3', marginTop: 2 }}>{m.stream} stream{m.active === false ? ' · inactive' : ''}</div>
                    <div style={{ fontSize: 12, color: ok ? '#3a3f52' : '#b02a2a', fontWeight: ok ? 400 : 700, marginTop: 6, wordBreak: 'break-all' }}>
                      {ok ? m.email : 'Email missing, this person is skipped'}
                    </div>
                    <div style={{ fontSize: 12, color: '#8a8fa3', marginTop: 6 }}>
                      {last ? `Last post sent ${last.toLocaleDateString()}` : 'Nothing sent yet'}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Rejections */}
          <Card title={`Rejected posts${rejectedAll.length ? ` (${rejectedAll.length})` : ''}`}>
            {rejectedAll.length === 0 && <p style={{ fontSize: 13, color: '#5a5f73', margin: 0 }}>Nothing rejected. Rejections show here with John's note so they can be rewritten.</p>}
            {rejectedAll.map(p => (
              <div key={p.id} style={{ padding: '10px 0', borderBottom: '1px solid #F0EEE8', fontSize: 13 }}>
                <span style={{ fontWeight: 600, color: NAVY }}>{p.title}</span>
                <span style={{ color: '#8a8fa3' }}> · {(p.audience || 'owners')} · day {p.day}</span>
                <div style={{ color: '#8a1f1f', marginTop: 4, background: '#FAEDED', borderRadius: 8, padding: '7px 10px' }}>{p.reject_comment || 'No note left'}</div>
              </div>
            ))}
          </Card>

          {/* Email log */}
          <Card title="Email log">
            <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
              {[['all', `All (${emails.length})`], ['failed', `Failed (${failedMails.length})`]].map(([k, label]) => (
                <button key={k} onClick={() => setLogFilter(k)}
                  style={{ padding: '6px 12px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12,
                    border: '1px solid ' + (logFilter === k ? NAVY : '#D5D2CA'), background: logFilter === k ? NAVY : '#fff',
                    color: logFilter === k ? '#fff' : '#3a3f52', fontWeight: logFilter === k ? 700 : 400 }}>
                  {label}
                </button>
              ))}
            </div>
            {emails.length === 0 && <p style={{ fontSize: 13, color: '#5a5f73', margin: 0 }}>Nothing sent yet. Approve a post and it goes straight to the team.</p>}
            {(logFilter === 'failed' ? failedMails : emails).map(e => (
              <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '8px 0', borderBottom: '1px solid #F0EEE8', fontSize: 13, flexWrap: 'wrap' }}>
                <span style={{ minWidth: 0 }}>
                  <b style={{ color: NAVY }}>{e.member_name}</b>
                  <span style={{ color: '#8a8fa3' }}> · {e.post_title || 'no post'}</span>
                  <div style={{ color: '#8a8fa3', fontSize: 12 }}>{new Date(e.sent_at).toLocaleString()}</div>
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
                  color: e.status === 'sent' ? '#2e7d32' : '#b02a2a',
                  background: e.status === 'sent' ? '#E8F3E8' : '#FAEDED', borderRadius: 999, padding: '4px 12px', height: 'fit-content' }}>
                  {e.status}
                </span>
                {e.error && <div style={{ width: '100%', color: '#b02a2a', fontSize: 12 }}>{e.error}</div>}
              </div>
            ))}
          </Card>

          {/* Library */}
          <Card title="The content library">
            <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap' }}>
              <Stat label="English posts" value={posts.length} color={NAVY} />
              <Stat label="With a photo" value={posts.filter(p => p.image_url).length} color={NAVY} />
              <Stat label="Translated rows" value={allRows.filter(r => r.language !== 'en').length} color={NAVY} />
              <Stat label="Edited by John" value={posts.filter(p => p.edited_text).length} color={NAVY} />
              <Stat label="Words written" value={wordCount.toLocaleString()} color={NAVY} />
            </div>
            <p style={{ fontSize: 12, color: '#8a8fa3', margin: '10px 0 0' }}>
              Every fact traces back to the 24/7 Spain article library. Posts run day 1 upward within each stream, and the team receives them in that order.
            </p>
          </Card>
        </main>
        )
      })()}
    </div>
  )
}

const Card = ({ title, children }) => (
  <div style={{ background: '#fff', border: CARD_BORDER, borderRadius: 16, padding: '16px 18px', marginTop: 14, boxShadow: '0 1px 3px rgba(1,2,33,.04)' }}>
    <div style={{ fontWeight: 700, color: NAVY, marginBottom: 10, fontSize: 15 }}>{title}</div>
    {children}
  </div>
)

const HeroStat = ({ label, value, tone }) => (
  <span>
    <div style={{ fontSize: 22, fontWeight: 700, color: tone || '#fff', lineHeight: 1.1 }}>{value}</div>
    <div style={{ fontSize: 12, color: '#9aa0bb' }}>{label}</div>
  </span>
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
