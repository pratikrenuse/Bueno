import { useEffect, useState, useCallback } from 'react'

// LinkedIn post review deck. Route: /internal-linkedin
// Shows each post exactly as it will look in the LinkedIn feed, with approve / reject / edit.
// Same team passcode as the studio (INTERNAL_PASSCODE); shares the studio_pass session key
// so one login covers both /internal and /internal-linkedin.
// No meta.js on purpose: never gets a public homepage card.

const NAVY = '#010221', GOLD = '#C9A96E', ACCENT = '#5B7FCC', LBLUE = '#CBEFFF'
const BG = '#F4F2EE' // LinkedIn's feed background
const CARD_BORDER = '1px solid #E0DFDC'
const LI_FONT = "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
const BRAND_FONT = "'FS Siena', Georgia, serif"
const FOLD_AT = 240 // chars visible before "...see more", roughly LinkedIn's fold

const STATUS = {
  pending: { label: 'Pending review', bg: '#FBF3DF', fg: '#7a611c' },
  approved: { label: 'Approved', bg: '#E8F3E8', fg: '#2e7d32' },
  rejected: { label: 'Rejected', bg: '#FAEDED', fg: '#b02a2a' },
}

export default function InternalLinkedIn() {
  const [pass, setPass] = useState(() => sessionStorage.getItem('studio_pass') || '')
  const [entered, setEntered] = useState(false)
  const [tab, setTab] = useState('pending')
  const [posts, setPosts] = useState([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [expanded, setExpanded] = useState({})
  const [editing, setEditing] = useState(null) // { id, text }
  const [copiedId, setCopiedId] = useState(null)
  const [seeding, setSeeding] = useState(false)

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

  async function decide(p, action) {
    let comment = null
    if (action === 'rejected') {
      comment = prompt('Why reject? The note is saved and drives the rewrite:')
      if (!comment) return
    }
    const prev = posts
    setPosts(list => list.map(x => x.id === p.id
      ? { ...x, status: action, reject_comment: action === 'rejected' ? comment : null }
      : x))
    try { await api('/api/linkedin-decide', { id: p.id, action, comment }) }
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
      const r = await fetch('/api/linkedin-seed', { headers: { 'x-passcode': pass } })
      const text = await r.text()
      let j
      try { j = JSON.parse(text) } catch { throw new Error(`Server error ${r.status}: ${text.slice(0, 200)}`) }
      if (j.error) throw new Error(j.error)
      await load(pass)
    } catch (e) { setErr(String(e.message || e)) }
    setSeeding(false)
  }

  function copyText(p) {
    navigator.clipboard.writeText(p.edited_text || p.post_text)
    setCopiedId(p.id)
    setTimeout(() => setCopiedId(null), 1200)
  }

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

  const counts = { pending: 0, approved: 0, rejected: 0 }
  posts.forEach(p => { if (counts[p.status] !== undefined) counts[p.status] += 1 })
  const shown = tab === 'all' ? posts : posts.filter(p => p.status === tab)
  const reviewed = posts.length - counts.pending

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: BRAND_FONT }}>
      <header style={{ background: NAVY, color: '#fff', padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontSize: 19, fontWeight: 700 }}>
          24<span style={{ color: GOLD }}>/</span>7 SPAIN <span style={{ fontWeight: 400, fontSize: 12, color: LBLUE }}>linkedin</span>
        </div>
        <nav>
          {['pending', 'approved', 'rejected', 'all'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ ...btn(t === tab ? GOLD : 'transparent', t === tab ? NAVY : '#fff'), border: '1px solid ' + (t === tab ? GOLD : '#3a3f5c'), marginLeft: 6, marginTop: 0, padding: '7px 13px', fontSize: 13, textTransform: 'capitalize' }}>
              {t === 'pending' ? `Review${counts.pending ? ` (${counts.pending})` : ''}` : t === 'all' ? 'All posts' : `${t} (${counts[t]})`}
            </button>
          ))}
          <button onClick={seed} disabled={seeding}
            style={{ ...btn('transparent', LBLUE), border: '1px dashed #3a3f5c', marginLeft: 14, marginTop: 0, padding: '7px 13px', fontSize: 13 }}>
            {seeding ? 'Syncing…' : 'Sync new posts'}
          </button>
        </nav>
      </header>

      {err && (
        <div style={{ maxWidth: 555, margin: '12px auto 0', background: '#fff', border: '1px solid #e0b4b4', color: '#8a1f1f', borderRadius: 12, padding: '12px 16px', fontSize: 14 }}>
          {err}
        </div>
      )}

      <main style={{ maxWidth: 555, margin: '0 auto', padding: '18px 12px 60px' }}>
        {busy && <p style={{ textAlign: 'center', color: '#5a5f73' }}>Loading…</p>}

        {!busy && posts.length === 0 && !err && (
          <div style={{ textAlign: 'center', marginTop: 60, background: '#fff', border: CARD_BORDER, borderRadius: 14, padding: '30px 24px' }}>
            <h2 style={{ color: NAVY, marginTop: 0 }}>No posts in the deck yet.</h2>
            <p style={{ color: '#5a5f73', fontSize: 14 }}>Load the English master posts. Safe to press twice; it never overwrites decisions.</p>
            <button onClick={seed} disabled={seeding} style={{ ...btn(NAVY, '#fff'), padding: '13px 26px', fontSize: 15 }}>
              {seeding ? 'Loading posts…' : 'Load the master posts'}
            </button>
          </div>
        )}

        {!busy && posts.length > 0 && (
          <p style={{ textAlign: 'center', color: '#5a5f73', fontSize: 13, margin: '0 0 14px' }}>
            {counts.pending === 0
              ? `All ${posts.length} posts reviewed. ${counts.approved} approved, ${counts.rejected} rejected.`
              : `${reviewed} of ${posts.length} reviewed. Each card is exactly how the post will look on LinkedIn.`}
          </p>
        )}

        {!busy && posts.length > 0 && shown.length === 0 && (
          <p style={{ textAlign: 'center', color: '#5a5f73', marginTop: 40 }}>Nothing in {tab} right now.</p>
        )}

        {shown.map(p => {
          const st = STATUS[p.status] || STATUS.pending
          const text = p.edited_text || p.post_text
          const isOpen = !!expanded[p.id]
          const needsFold = text.length > FOLD_AT + 60
          const visible = !needsFold || isOpen ? text : text.slice(0, text.lastIndexOf(' ', FOLD_AT)).trimEnd()
          const isEditing = editing && editing.id === p.id
          return (
            <section key={p.id} style={{ marginBottom: 22 }}>
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
                      <span> <button onClick={() => setExpanded(x => ({ ...x, [p.id]: true }))}
                        style={{ background: 'none', border: 'none', color: 'rgba(0,0,0,.6)', cursor: 'pointer', fontSize: 14, padding: 0, fontFamily: 'inherit' }}>…see more</button></span>
                    )}
                    {needsFold && isOpen && (
                      <div><button onClick={() => setExpanded(x => ({ ...x, [p.id]: false }))}
                        style={{ background: 'none', border: 'none', color: 'rgba(0,0,0,.6)', cursor: 'pointer', fontSize: 13, padding: 0, marginTop: 6, fontFamily: 'inherit' }}>Show less</button></div>
                    )}
                  </div>
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
                  <span style={{ fontSize: 12, background: st.bg, color: st.fg, borderRadius: 999, padding: '4px 12px', fontWeight: 600 }}>{st.label}</span>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button onClick={() => copyText(p)} style={{ ...btn('#EEF1F6', NAVY), marginTop: 0, padding: '8px 14px', fontSize: 13 }}>
                      {copiedId === p.id ? 'Copied' : 'Copy text'}
                    </button>
                    {!isEditing && (
                      <button onClick={() => setEditing({ id: p.id, text: p.edited_text || p.post_text })}
                        style={{ ...btn('#EEF1F6', NAVY), marginTop: 0, padding: '8px 14px', fontSize: 13 }}>Edit</button>
                    )}
                    {p.status === 'pending' ? (
                      <>
                        <button onClick={() => decide(p, 'rejected')}
                          style={{ ...btn('#fff', '#8c1a1a'), marginTop: 0, padding: '8px 16px', fontSize: 13, border: '1.5px solid #8c1a1a' }}>Reject</button>
                        <button onClick={() => decide(p, 'approved')}
                          style={{ ...btn(NAVY, '#fff'), marginTop: 0, padding: '8px 20px', fontSize: 13, fontWeight: 700 }}>Approve</button>
                      </>
                    ) : (
                      <button onClick={() => decide(p, 'pending')}
                        style={{ ...btn('#fff', '#5a5f73'), marginTop: 0, padding: '8px 14px', fontSize: 13, border: '1px solid #c4c9d4' }}>Undo</button>
                    )}
                  </div>
                </div>
                {p.status === 'rejected' && p.reject_comment && (
                  <p style={{ color: '#8a1f1f', fontSize: 13, background: '#FAEDED', borderRadius: 8, padding: '7px 10px', margin: '8px 0 0' }}>
                    Note: {p.reject_comment}
                  </p>
                )}
              </div>
            </section>
          )
        })}
      </main>
    </div>
  )
}

const btn = (bg, color) => ({
  background: bg, color, padding: '10px 16px', borderRadius: 999, border: 'none',
  fontSize: 14, cursor: 'pointer', marginTop: 8, fontFamily: 'inherit',
})
