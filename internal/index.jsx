import { useEffect, useState, useCallback, useRef } from 'react'

// 24/7 Spain Studio: swipe-deck approval queue + Instagram-style overview grid.
// Route: /internal. English-only view (API filters language=en).
// No meta.js on purpose: this tool must never appear on the public homepage.

const NAVY = '#010221', LBLUE = '#CBEFFF', ACCENT = '#5B7FCC', GOLD = '#C9A96E'
const PAGE_BG = '#E7EAF0'
const CARD_BORDER = '1px solid #D5DAE3'
const STATUS_COLOR = { pending: GOLD, approved: '#2e7d32', rejected: '#b02a2a', published: ACCENT }

export default function Internal() {
  const [pass, setPass] = useState(() => sessionStorage.getItem('studio_pass') || '')
  const [entered, setEntered] = useState(false)
  const [view, setView] = useState('review') // review | all | approved | rejected | published
  const [deck, setDeck] = useState([])
  const [total, setTotal] = useState(0)
  const [items, setItems] = useState([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [flash, setFlash] = useState(null)
  const [modal, setModal] = useState(null) // package shown in the lightbox
  const drag = useRef({ x: 0, active: false })
  const [dx, setDx] = useState(0)

  const fetchStatus = useCallback(async (p, status) => {
    const r = await fetch(`/api/internal-packages?status=${status}`, { headers: { 'x-passcode': p } })
    if (r.status === 401) throw { auth: true }
    const text = await r.text()
    let j
    try { j = JSON.parse(text) } catch { throw new Error(`Server error ${r.status}: ${text.slice(0, 200)}`) }
    if (j.error) throw new Error(j.error)
    return j.packages || []
  }, [])

  const load = useCallback(async (p, v) => {
    setBusy(true); setErr('')
    try {
      if (v === 'review') {
        const pkgs = await fetchStatus(p, 'pending')
        setDeck(pkgs); setTotal(pkgs.length)
      } else {
        setItems(await fetchStatus(p, v === 'all' ? 'all' : v))
      }
      sessionStorage.setItem('studio_pass', p)
    } catch (e) {
      if (e.auth) { setEntered(false); setErr('Wrong password') } else setErr(String(e.message || e))
    }
    setBusy(false)
  }, [fetchStatus])

  useEffect(() => { document.title = 'Studio | 24/7 Spain' }, [])
  useEffect(() => { if (entered) load(pass, view) }, [entered, view, load, pass])

  const current = deck[0]

  async function saveDecision(p, action, comment) {
    const r = await fetch('/api/internal-decide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-passcode': pass },
      body: JSON.stringify({ id: p.id, action, comment }),
    })
    const j = await r.json()
    if (j.error) throw new Error(j.error)
  }

  // deck decision (swipe view)
  async function decide(action) {
    if (!current) return
    let comment = null
    if (action === 'rejected') {
      comment = prompt('Why reject? Your note is saved and drives the redo:')
      if (!comment) return
    }
    const p = current
    setFlash({ kind: action })
    setTimeout(() => setFlash(null), 700)
    setDeck(d => d.slice(1))
    setDx(0)
    try { await saveDecision(p, action, comment) }
    catch (e) {
      setErr(`Could not save ${p.slug}: ${e.message}. Put back in the deck.`)
      setDeck(d => [p, ...d])
    }
  }

  // grid/modal decision (works from any status)
  async function decideItem(p, action) {
    let comment = null
    if (action === 'rejected') {
      comment = prompt('Why reject? Your note is saved and drives the redo:')
      if (!comment) return
    }
    try {
      await saveDecision(p, action, comment)
      const updated = { ...p, status: action, reject_comment: action === 'rejected' ? comment : null }
      setItems(list => list.map(x => (x.id === p.id ? updated : x)))
      setModal(m => (m && m.id === p.id ? updated : m))
    } catch (e) { setErr(String(e.message || e)) }
  }

  useEffect(() => {
    if (!entered) return
    const h = (e) => {
      if (e.key === 'Escape') setModal(null)
      if (view !== 'review' || modal) return
      if (e.key === 'ArrowRight') decide('approved')
      if (e.key === 'ArrowLeft') decide('rejected')
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  })

  function onPointerDown(e) { drag.current = { x: e.clientX ?? e.touches?.[0]?.clientX, active: true } }
  function onPointerMove(e) {
    if (!drag.current.active) return
    const x = e.clientX ?? e.touches?.[0]?.clientX
    setDx(x - drag.current.x)
  }
  function onPointerUp() {
    if (!drag.current.active) return
    drag.current.active = false
    if (dx > 120) decide('approved')
    else if (dx < -120) decide('rejected')
    else setDx(0)
  }

  if (!entered)
    return (
      <div style={{ minHeight: '100vh', background: PAGE_BG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'FS Siena', Georgia, serif" }}>
        <div style={{ textAlign: 'center', background: '#fff', border: CARD_BORDER, borderRadius: 20, padding: '40px 48px', boxShadow: '0 8px 30px rgba(1,2,33,.08)' }}>
          <div style={{ fontSize: 34, fontWeight: 700, color: NAVY, marginBottom: 4 }}>
            24<span style={{ color: GOLD }}>/</span>7 SPAIN <span style={{ fontWeight: 400, fontSize: 16, color: ACCENT }}>studio</span>
          </div>
          <p style={{ color: '#5a5f73', fontSize: 14, margin: '6px 0 14px' }}>Review and approve posts before they go out.</p>
          <input type="password" value={pass} placeholder="Team password" autoFocus
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && setEntered(true)}
            style={{ padding: '12px 16px', fontSize: 16, borderRadius: 10, border: '1px solid #c4c9d4', width: 220 }} />
          <div>
            <button onClick={() => setEntered(true)} style={{ ...btn(NAVY, '#fff'), width: '100%', marginTop: 12 }}>Open the studio</button>
          </div>
          {err && <p style={{ color: '#b00020', fontSize: 14 }}>{err}</p>}
        </div>
      </div>
    )

  const reviewed = total - deck.length

  return (
    <div style={{ minHeight: '100vh', background: PAGE_BG, fontFamily: "'FS Siena', Georgia, serif" }}>
      <header style={{ background: NAVY, color: '#fff', padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontSize: 19, fontWeight: 700 }}>
          24<span style={{ color: GOLD }}>/</span>7 SPAIN <span style={{ fontWeight: 400, fontSize: 12, color: LBLUE }}>studio</span>
        </div>
        <nav>
          {['review', 'all', 'approved', 'rejected', 'published'].map(t => (
            <button key={t} onClick={() => setView(t)}
              style={{ ...btn(t === view ? GOLD : 'transparent', t === view ? NAVY : '#fff'), border: '1px solid ' + (t === view ? GOLD : '#3a3f5c'), marginLeft: 6, marginTop: 0, padding: '7px 13px', fontSize: 13 }}>
              {t === 'review' ? `Review${deck.length ? ` (${deck.length})` : ''}` : t === 'all' ? 'All posts' : t}
            </button>
          ))}
          <button onClick={async () => {
            if (!confirm('Put every approved and rejected post back into the deck?')) return
            const r = await fetch('/api/internal-reset', { method: 'POST', headers: { 'x-passcode': pass } })
            const j = await r.json()
            alert(j.error ? j.error : `${j.reset} posts back in the deck.`)
            setView('review'); load(pass, 'review')
          }}
            style={{ ...btn('transparent', LBLUE), border: '1px dashed #3a3f5c', marginLeft: 14, marginTop: 0, padding: '7px 13px', fontSize: 13 }}>
            Reset deck
          </button>
        </nav>
      </header>

      {err && (
        <div style={{ maxWidth: 560, margin: '12px auto 0', background: '#fff', border: '1px solid #e0b4b4', color: '#8a1f1f', borderRadius: 12, padding: '12px 16px', fontSize: 14 }}>
          {err}
        </div>
      )}

      {view === 'review' && (
        <main style={{ maxWidth: 560, margin: '0 auto', padding: '18px 16px 40px' }}>
          {busy && <p style={{ textAlign: 'center' }}>Loading…</p>}
          {!busy && !current && (
            <div style={{ textAlign: 'center', marginTop: 60 }}>
              <h2 style={{ color: NAVY }}>All reviewed.</h2>
              <p style={{ color: '#5a5f73' }}>Every decision is saved. See All posts for the full picture.</p>
            </div>
          )}
          {current && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5a5f73', fontSize: 13, margin: '0 4px 10px' }}>
                <span>{reviewed + 1} of {total}</span>
                <span>{(current.layout || 'rows').toUpperCase()}</span>
              </div>
              <div
                onMouseDown={onPointerDown} onMouseMove={onPointerMove} onMouseUp={onPointerUp} onMouseLeave={onPointerUp}
                onTouchStart={onPointerDown} onTouchMove={onPointerMove} onTouchEnd={onPointerUp}
                style={{
                  background: '#fff', border: CARD_BORDER, borderRadius: 20, overflow: 'hidden',
                  boxShadow: '0 10px 34px rgba(1,2,33,.16)',
                  transform: `translateX(${dx}px) rotate(${dx / 30}deg)`,
                  transition: drag.current.active ? 'none' : 'transform .18s ease',
                  cursor: 'grab', userSelect: 'none', position: 'relative',
                }}>
                {flash && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: flash.kind === 'approved' ? 'rgba(31,94,47,.55)' : 'rgba(140,26,26,.55)', color: '#fff', fontSize: 40, fontWeight: 700, zIndex: 2 }}>
                    {flash.kind === 'approved' ? 'Approved' : 'Rejected'}
                  </div>
                )}
                {dx !== 0 && (
                  <div style={{ position: 'absolute', top: 18, left: dx > 0 ? 18 : 'auto', right: dx < 0 ? 18 : 'auto', zIndex: 2, padding: '6px 14px', borderRadius: 999, fontWeight: 700, background: dx > 0 ? '#1f5e2f' : '#8c1a1a', color: '#fff', opacity: Math.min(1, Math.abs(dx) / 120) }}>
                    {dx > 0 ? 'APPROVE' : 'REJECT'}
                  </div>
                )}
                {current.image_url && <img src={current.image_url} alt={current.slug} draggable={false} style={{ width: '100%', display: 'block' }} />}
              </div>
              {current.content && current.content.caption && (
                <div style={{ background: '#fff', border: CARD_BORDER, borderRadius: 14, padding: '12px 14px', marginTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: ACCENT, textTransform: 'uppercase', letterSpacing: 1 }}>Caption</span>
                    <button onClick={() => { navigator.clipboard.writeText(current.content.caption) }}
                      style={{ ...btn('#EEF1F6', NAVY), padding: '4px 12px', fontSize: 12, marginTop: 0 }}>Copy</button>
                  </div>
                  <div style={{ fontSize: 13, color: '#3a3f52', whiteSpace: 'pre-wrap', maxHeight: 130, overflowY: 'auto' }}>
                    {current.content.caption}
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 14, marginTop: 16 }}>
                <button onClick={() => decide('rejected')} style={{ ...btn('#fff', '#8c1a1a'), flex: 1, padding: '16px', fontSize: 17, border: '2px solid #8c1a1a', borderRadius: 16 }}>✕ Reject</button>
                <button onClick={() => decide('approved')} style={{ ...btn(NAVY, '#fff'), flex: 1, padding: '16px', fontSize: 17, borderRadius: 16 }}>✓ Approve</button>
              </div>
              <p style={{ textAlign: 'center', color: '#8a8fa3', fontSize: 12, marginTop: 10 }}>
                Swipe right or press → to approve. Swipe left or ← to reject with a note. All saved to the database.
              </p>
            </>
          )}
        </main>
      )}

      {view === 'all' && (
        <main style={{ maxWidth: 940, margin: '0 auto', padding: '16px 12px 40px' }}>
          {busy && <p>Loading…</p>}
          {!busy && (
            <>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', color: '#5a5f73', fontSize: 13, margin: '2px 4px 12px' }}>
                {['pending', 'approved', 'rejected', 'published'].map(s => (
                  <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 9, background: STATUS_COLOR[s], display: 'inline-block' }} />
                    {s} ({items.filter(x => x.status === s).length})
                  </span>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
                {items.map(p => (
                  <div key={p.id} onClick={() => setModal(p)}
                    style={{ position: 'relative', cursor: 'pointer', aspectRatio: '1 / 1', background: '#fff', overflow: 'hidden' }}>
                    {p.image_url && <img src={p.image_url} alt={p.slug} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                    <span style={{ position: 'absolute', top: 8, right: 8, width: 12, height: 12, borderRadius: 12, background: STATUS_COLOR[p.status] || '#999', border: '2px solid #fff' }} />
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      )}

      {['approved', 'rejected', 'published'].includes(view) && (
        <main style={{ maxWidth: 1180, margin: '0 auto', padding: 20 }}>
          {busy && <p>Loading…</p>}
          {!busy && items.length === 0 && <p style={{ color: '#5a5f73' }}>Nothing in {view} yet.</p>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}>
            {items.map(p => (
              <div key={p.id} onClick={() => setModal(p)} style={{ background: '#fff', border: CARD_BORDER, borderRadius: 14, overflow: 'hidden', boxShadow: '0 3px 12px rgba(1,2,33,.08)', cursor: 'pointer' }}>
                {p.image_url && <img src={p.image_url} alt={p.slug} style={{ width: '100%', display: 'block' }} />}
                <div style={{ padding: 10 }}>
                  <div style={{ fontSize: 11, color: ACCENT, textTransform: 'uppercase', letterSpacing: 1 }}>{p.layout || 'rows'}</div>
                  <div style={{ fontWeight: 700, color: NAVY, fontSize: 13 }}>{p.slug}</div>
                  {p.reject_comment && view === 'rejected' && (
                    <p style={{ color: '#8a1f1f', fontSize: 12, background: '#faf1f1', borderRadius: 8, padding: '6px 8px', margin: '6px 0 0' }}>{p.reject_comment}</p>
                  )}
                  {view === 'published' && p.content && p.content.published && (
                    <a href={p.content.published.ig_url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                      style={{ display: 'inline-block', fontSize: 12, color: ACCENT, marginTop: 6 }}>
                      View on Instagram
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {modal && (
        <div onClick={() => setModal(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(1,2,33,.72)', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 18, maxWidth: 520, width: '100%', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.4)' }}>
            {modal.image_url && <img src={modal.image_url} alt={modal.slug} style={{ width: '100%', display: 'block' }} />}
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: NAVY }}>{(modal.content && modal.content.headline || []).join(' ') || modal.slug}</span>
                <span style={{ fontSize: 12, color: '#fff', background: STATUS_COLOR[modal.status] || '#999', borderRadius: 999, padding: '3px 12px', textTransform: 'capitalize' }}>{modal.status}</span>
              </div>
              <div style={{ fontSize: 12, color: '#7a7f93', margin: '2px 0 10px' }}>{modal.slug} · {modal.layout || 'rows'}</div>
              {modal.reject_comment && (
                <p style={{ color: '#8a1f1f', fontSize: 13, background: '#faf1f1', borderRadius: 8, padding: '8px 10px' }}>Note: {modal.reject_comment}</p>
              )}
              {modal.content && modal.content.caption && (
                <div style={{ border: CARD_BORDER, borderRadius: 12, padding: '10px 12px', margin: '8px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: ACCENT, textTransform: 'uppercase', letterSpacing: 1 }}>Caption</span>
                    <button onClick={() => navigator.clipboard.writeText(modal.content.caption)}
                      style={{ ...btn('#EEF1F6', NAVY), padding: '3px 10px', fontSize: 11, marginTop: 0 }}>Copy</button>
                  </div>
                  <div style={{ fontSize: 12.5, color: '#3a3f52', whiteSpace: 'pre-wrap', maxHeight: 120, overflowY: 'auto' }}>{modal.content.caption}</div>
                </div>
              )}
              {modal.content && modal.content.published && (
                <a href={modal.content.published.ig_url} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: ACCENT }}>View on Instagram</a>
              )}
              {modal.status !== 'published' && (
                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <button onClick={() => decideItem(modal, 'rejected')}
                    style={{ ...btn('#fff', '#8c1a1a'), flex: 1, padding: '12px', fontSize: 15, border: '2px solid #8c1a1a', borderRadius: 12 }}>✕ Reject</button>
                  <button onClick={() => decideItem(modal, 'approved')}
                    style={{ ...btn(NAVY, '#fff'), flex: 1, padding: '12px', fontSize: 15, borderRadius: 12 }}>✓ Approve</button>
                </div>
              )}
              <button onClick={() => setModal(null)} style={{ ...btn('#EEF1F6', NAVY), width: '100%', marginTop: 10, padding: '10px' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const btn = (bg, color) => ({
  background: bg, color, padding: '10px 16px', borderRadius: 999, border: 'none',
  fontSize: 14, cursor: 'pointer', marginTop: 8, fontFamily: 'inherit',
})
