import { useEffect, useState, useCallback } from 'react'

// 24/7 Spain Studio: internal approval queue. Route: /internal
// No meta.js on purpose: this tool must never appear on the public homepage.
// Access: one shared password, checked server-side against INTERNAL_PASSCODE.

const NAVY = '#010221', LBLUE = '#CBEFFF', ACCENT = '#5B7FCC', GOLD = '#C9A96E', OFF = '#F8F7F4'

export default function Internal() {
  const [pass, setPass] = useState(() => sessionStorage.getItem('studio_pass') || '')
  const [entered, setEntered] = useState(false)
  const [tab, setTab] = useState('pending')
  const [items, setItems] = useState([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const load = useCallback(async (p, t) => {
    setBusy(true); setErr('')
    try {
      const r = await fetch(`/api/internal-packages?status=${t}`, { headers: { 'x-passcode': p } })
      if (r.status === 401) { setEntered(false); setErr('Wrong password'); setBusy(false); return }
      const text = await r.text()
      let j
      try { j = JSON.parse(text) } catch { throw new Error(`Server error ${r.status}: ${text.slice(0, 300)}`) }
      if (j.error) throw new Error(j.error)
      setItems(j.packages || [])
      sessionStorage.setItem('studio_pass', p)
    } catch (e) {
      setItems([]); setErr(String(e.message || e))
    }
    setBusy(false)
  }, [])

  useEffect(() => { document.title = 'Studio | 24/7 Spain' }, [])
  useEffect(() => { if (entered) load(pass, tab) }, [entered, tab, load, pass])

  async function decide(id, action) {
    let comment = null
    if (action === 'rejected') {
      comment = prompt('Why? This comment drives the regeneration:')
      if (!comment) return
    }
    await fetch('/api/internal-decide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-passcode': pass },
      body: JSON.stringify({ id, action, comment }),
    })
    load(pass, tab)
  }

  if (!entered) return (
    <div style={{ minHeight: '100vh', background: OFF, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'FS Siena', Georgia, serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 34, fontWeight: 700, color: NAVY, marginBottom: 4 }}>
          24<span style={{ color: GOLD }}>/</span>7 SPAIN <span style={{ fontWeight: 400, fontSize: 16, color: ACCENT }}>studio</span>
        </div>
        <input type="password" value={pass} placeholder="Password" autoFocus
          onChange={e => setPass(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && setEntered(true)}
          style={{ padding: '12px 16px', fontSize: 16, borderRadius: 10, border: '1px solid #ccc', marginTop: 12 }} />
        <div>
          <button onClick={() => setEntered(true)} style={btn(NAVY, '#fff')}>Enter</button>
        </div>
        {err && <p style={{ color: '#b00' }}>{err}</p>}
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: OFF, fontFamily: "'FS Siena', Georgia, serif" }}>
      <header style={{ background: NAVY, color: '#fff', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>
          24<span style={{ color: GOLD }}>/</span>7 SPAIN <span style={{ fontWeight: 400, fontSize: 13, color: LBLUE }}>studio</span>
        </div>
        <nav>
          {['pending', 'approved', 'rejected', 'published'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ ...btn(t === tab ? GOLD : 'transparent', t === tab ? NAVY : '#fff'), border: '1px solid ' + (t === tab ? GOLD : '#334'), marginLeft: 8, marginTop: 0 }}>
              {t}
            </button>
          ))}
        </nav>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: 20 }}>
        {busy && <p>Loading…</p>}
        {!busy && err && (
          <div style={{ background: '#fff', border: '1px solid #e0b4b4', color: '#8a1f1f', borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 14, wordBreak: 'break-word' }}>
            {err}
          </div>
        )}
        {!busy && !err && items.length === 0 && <p style={{ color: '#667' }}>Nothing in “{tab}”.</p>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 20 }}>
          {items.map(p => (
            <div key={p.id} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 16px rgba(1,2,33,.08)', overflow: 'hidden' }}>
              {p.image_url && <img src={p.image_url} alt={p.slug} style={{ width: '100%', display: 'block' }} />}
              {p.video_url && <video src={p.video_url} controls muted playsInline style={{ width: '100%', display: 'block', background: '#000' }} />}
              <div style={{ padding: 14 }}>
                <div style={{ fontSize: 13, color: ACCENT, textTransform: 'uppercase', letterSpacing: 1 }}>
                  {p.language} · {p.layout || 'rows'}
                </div>
                <div style={{ fontWeight: 700, color: NAVY, margin: '4px 0 10px' }}>{p.slug}</div>
                {p.reject_comment && <p style={{ color: '#b00', fontSize: 13 }}>Rejected: {p.reject_comment}</p>}
                {tab === 'pending' && (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => decide(p.id, 'approved')} style={{ ...btn(NAVY, '#fff'), flex: 1 }}>Approve</button>
                    <button onClick={() => decide(p.id, 'rejected')} style={{ ...btn('#fff', NAVY), flex: 1, border: '1px solid ' + NAVY }}>Reject</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

const btn = (bg, color) => ({
  background: bg, color, padding: '10px 16px', borderRadius: 999, border: 'none',
  fontSize: 14, cursor: 'pointer', marginTop: 8,
})
