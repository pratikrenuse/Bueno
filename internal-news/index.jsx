import { useCallback, useEffect, useMemo, useState } from 'react'

// /internal-news: the stories Claude picked out of the idealista/news emails (and any other
// newsletter on the allow list), ready to approve for the Spain 24/7 WhatsApp channels.
//
// THE LOOP
//   an email arrives at the Resend receiving address -> Claude splits it into stories, drops
//   what is not useful to foreign owners and writes a short English post for the rest ->
//   Pratik (or John) approves here -> approving translates it into Norwegian, Swedish,
//   German, French and Dutch -> the oldest approved story becomes the WhatsApp channel post
//   in the next daily email, on any day without a hand-written channel post.
//
// No meta.js on purpose: never on the homepage grid, never in the sitemap, and noindex.

const NAVY = '#010221'
const LBLUE = '#CBEFFF'
const ACCENT = '#5B7FCC'
const GOLD = '#C9A96E'
const BG = '#F4F2EE'
const SANS = "'DM Sans', Arial, Helvetica, sans-serif"

const TABS = [
  { key: 'pending', label: 'To review' },
  { key: 'approved', label: 'Approved, in line' },
  { key: 'used', label: 'Used in the channels' },
  { key: 'skipped', label: 'Left out by Claude' },
  { key: 'rejected', label: 'Rejected' },
]
const LANGS = [
  { key: 'no', label: 'Norwegian' }, { key: 'sv', label: 'Swedish' }, { key: 'de', label: 'German' },
  { key: 'fr', label: 'French' }, { key: 'nl', label: 'Dutch' },
]
const englishOf = (it) => (it.edited_en && it.edited_en.trim()) ? it.edited_en : (it.en || '')
const day = (iso) => {
  if (!iso) return ''
  try { return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) } catch { return iso }
}

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

export default function InternalNews() {
  const [pass, setPass] = useState(() => sessionStorage.getItem('news_pass') || '')
  const [entered, setEntered] = useState(false)
  const [tab, setTab] = useState('pending')
  const [items, setItems] = useState([])
  const [counts, setCounts] = useState({})
  const [emails, setEmails] = useState([])
  const [busy, setBusy] = useState(false)
  const [working, setWorking] = useState(null)
  const [err, setErr] = useState('')
  const [flash, setFlash] = useState('')
  const [editing, setEditing] = useState(null) // { id, text }
  const [openTr, setOpenTr] = useState(null)
  const [cursor, setCursor] = useState(0)
  const [paste, setPaste] = useState({ open: false, text: '', subject: '' })

  useEffect(() => { document.title = 'News for the WhatsApp channels | 24/7 Spain' }, [])

  const load = useCallback(async (p, t) => {
    setBusy(true); setErr('')
    try {
      const j = await call(`/api/news?action=items&status=${t}`, p)
      setItems(j.items || []); setCounts(j.counts || {}); setEmails(j.emails || [])
      sessionStorage.setItem('news_pass', p)
    } catch (e) {
      if (e.auth) setEntered(false)
      setErr(String(e.message || e))
    }
    setBusy(false)
  }, [])
  useEffect(() => { if (entered) load(pass, tab) }, [entered, tab, pass, load])
  useEffect(() => { setCursor(c => Math.min(c, Math.max(0, items.length - 1))) }, [items.length])

  const say = (m) => { setFlash(m); setTimeout(() => setFlash(''), 2600) }

  async function decide(it, action, text) {
    setWorking(it.id); setErr('')
    try {
      await call('/api/news?action=decide', pass, { id: it.id, action, text })
      // The card leaves this tab at once (an edit stays in To review), then the list reloads.
      if (!(action === 'edit' && tab === 'pending')) setItems(xs => xs.filter(x => x.id !== it.id))
      say(action === 'approve' ? 'Approved and translated. It is in line for the channels.'
        : action === 'reject' ? 'Rejected.' : action === 'edit' ? 'Saved. It is waiting for review.' : 'Moved back.')
      setEditing(null)
      load(pass, tab)
    } catch (e) { setErr(String(e.message || e)) }
    setWorking(null)
  }

  async function ingest() {
    setWorking('paste'); setErr('')
    try {
      const j = await call('/api/news?action=ingest', pass, { text: paste.text, subject: paste.subject || undefined })
      say(`Read ${j.stories} stories and kept ${j.kept}.`)
      setPaste({ open: false, text: '', subject: '' })
      setTab('pending'); load(pass, 'pending')
    } catch (e) { setErr(String(e.message || e)) }
    setWorking(null)
  }

  async function retry(email_id) {
    setWorking(email_id); setErr('')
    try {
      const j = await call('/api/news?action=reprocess', pass, { email_id })
      say(`Read ${j.stories} stories and kept ${j.kept}.`); load(pass, tab)
    } catch (e) { setErr(String(e.message || e)) }
    setWorking(null)
  }

  // Keyboard review: J/K move, A approve, R reject, E edit.
  useEffect(() => {
    if (!entered) return
    const onKey = (e) => {
      if (editing || paste.open || /input|textarea/i.test(e.target.tagName)) return
      const it = items[cursor]
      if (e.key === 'j') setCursor(c => Math.min(items.length - 1, c + 1))
      else if (e.key === 'k') setCursor(c => Math.max(0, c - 1))
      else if (!it || working) return
      else if (e.key === 'a' && tab === 'pending') decide(it, 'approve')
      else if (e.key === 'r' && tab === 'pending') decide(it, 'reject')
      else if (e.key === 'e' && tab !== 'used') setEditing({ id: it.id, text: englishOf(it) })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const queued = counts.approved || 0
  const lastEmail = emails[0]
  const failed = useMemo(() => emails.filter(e => e.status === 'failed'), [emails])

  if (!entered) {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'grid', placeItems: 'center', fontFamily: SANS }}>
        <form onSubmit={(e) => { e.preventDefault(); setEntered(true) }}
          style={{ background: '#fff', padding: 32, borderRadius: 14, width: 340, border: '1px solid #E0DFDC' }}>
          <h1 style={{ margin: '0 0 6px', fontFamily: 'Georgia, serif', color: NAVY, fontSize: 24 }}>News for the channels</h1>
          <p style={{ margin: '0 0 18px', color: '#4a4e63', fontSize: 14 }}>Enter the internal password to review today's stories.</p>
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Password" autoFocus
            style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 8, border: '1px solid #c9ccd6', fontSize: 15 }} />
          {err && <p style={{ color: '#b02a2a', fontSize: 13 }}>{err}</p>}
          <button type="submit" style={btn(true)}>Open</button>
        </form>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: SANS, color: NAVY }}>
      <header style={{ background: NAVY, color: '#fff', padding: '18px 24px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 'bold' }}>
              24<span style={{ color: GOLD }}>/</span>7 SPAIN <span style={{ fontWeight: 'normal', fontSize: 14, color: LBLUE }}>News for the WhatsApp channels</span>
            </div>
            <div style={{ fontSize: 13, color: LBLUE, marginTop: 4 }}>
              {queued
                ? `${queued} approved ${queued === 1 ? 'story is' : 'stories are'} in line, which covers the channels for ${queued} ${queued === 1 ? 'day' : 'days'}.`
                : 'Nothing is approved yet, so the channels have no news post coming.'}
              {lastEmail ? ` Last newsletter: ${day(lastEmail.created_at)}.` : ' No newsletter has arrived yet.'}
            </div>
          </div>
          <button onClick={() => setPaste(p => ({ ...p, open: !p.open }))} style={{ ...btn(false), color: '#fff', borderColor: '#5c6080', marginTop: 0 }}>
            Paste a newsletter
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 980, margin: '0 auto', padding: '20px 16px 60px' }}>
        {paste.open && (
          <section style={card}>
            <h2 style={h2}>Paste a newsletter by hand</h2>
            <p style={muted}>For an email that did not come in by itself. Copy the whole text of the email and paste it here.</p>
            <input value={paste.subject} onChange={(e) => setPaste(p => ({ ...p, subject: e.target.value }))} placeholder="Subject (optional)" style={field} />
            <textarea value={paste.text} onChange={(e) => setPaste(p => ({ ...p, text: e.target.value }))} rows={10} placeholder="The newsletter text" style={{ ...field, fontFamily: SANS }} />
            <button onClick={ingest} disabled={working === 'paste' || paste.text.length < 200} style={btn(true)}>
              {working === 'paste' ? 'Reading it, this takes about half a minute...' : 'Sort and translate'}
            </button>
          </section>
        )}

        {failed.length > 0 && (
          <section style={{ ...card, borderColor: '#e6b3b3', background: '#FDF5F5' }}>
            <h2 style={{ ...h2, color: '#b02a2a' }}>{failed.length === 1 ? 'One newsletter could not be sorted' : `${failed.length} newsletters could not be sorted`}</h2>
            {failed.map(e => (
              <div key={e.email_id} style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', marginTop: 8, flexWrap: 'wrap' }}>
                <div style={{ fontSize: 13.5 }}><b>{e.subject || e.email_id}</b> ({day(e.created_at)}): {e.error}</div>
                <button onClick={() => retry(e.email_id)} disabled={working === e.email_id} style={{ ...btn(false), marginTop: 0 }}>
                  {working === e.email_id ? 'Trying again...' : 'Try again'}
                </button>
              </div>
            ))}
          </section>
        )}

        <nav style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '4px 0 16px', position: 'sticky', top: 0, background: BG, padding: '8px 0', zIndex: 2 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setCursor(0) }}
              style={{
                border: `1px solid ${tab === t.key ? NAVY : '#c9ccd6'}`, background: tab === t.key ? NAVY : '#fff',
                color: tab === t.key ? '#fff' : NAVY, borderRadius: 999, padding: '8px 14px', fontSize: 13.5, cursor: 'pointer', fontFamily: SANS,
              }}>
              {t.label} <span style={{ opacity: 0.7 }}>{counts[t.key] || 0}</span>
            </button>
          ))}
        </nav>

        {err && <div style={{ background: '#FAEDED', color: '#b02a2a', padding: '12px 14px', borderRadius: 10, marginBottom: 14, fontSize: 14 }}>{err}</div>}
        {flash && <div style={{ background: '#E8F3E8', color: '#2e7d32', padding: '10px 14px', borderRadius: 10, marginBottom: 14, fontSize: 14 }}>{flash}</div>}
        {busy && !items.length && <p style={muted}>Loading...</p>}
        {!busy && !items.length && (
          <p style={{ ...muted, padding: '30px 0', textAlign: 'center' }}>
            {tab === 'pending' ? 'Nothing to review. New stories appear here as soon as the next newsletter arrives.' : 'Nothing here.'}
          </p>
        )}

        {items.map((it, i) => {
          const isEditing = editing && editing.id === it.id
          const text = englishOf(it)
          return (
            <article key={it.id} onClick={() => setCursor(i)}
              style={{ ...card, outline: i === cursor ? `2px solid ${ACCENT}` : 'none', opacity: working === it.id ? 0.6 : 1 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', fontSize: 12, color: '#5a5f78', marginBottom: 8 }}>
                <span style={{ textTransform: 'capitalize' }}>{it.source}</span><span>·</span><span>{day(it.received_on || it.created_at)}</span>
                {it.category && <><span>·</span><span>{it.category.replace(/-/g, ' ')}</span></>}
                {it.is_proposal && <span style={{ background: '#FBF3E2', color: '#8a6d1f', borderRadius: 999, padding: '2px 8px', fontWeight: 600 }}>Proposal, not law</span>}
                {it.edited_en && <span style={{ background: '#E9EEF9', color: '#2f4f9e', borderRadius: 999, padding: '2px 8px' }}>Edited</span>}
                {it.status === 'used' && it.used_on && <span style={{ background: '#E8F3E8', color: '#2e7d32', borderRadius: 999, padding: '2px 8px' }}>In the email of {day(it.used_on)}</span>}
                {tab === 'approved' && <span style={{ background: '#E8F3E8', color: '#2e7d32', borderRadius: 999, padding: '2px 8px' }}>Number {i + 1} in line</span>}
              </div>
              <h3 style={{ margin: '0 0 4px', fontFamily: 'Georgia, serif', fontSize: 19 }}>{it.title_en || it.title_es}</h3>
              {it.title_es && <p style={{ margin: '0 0 12px', fontSize: 13, color: '#6b7088', fontStyle: 'italic' }}>{it.title_es}</p>}

              {isEditing ? (
                <div>
                  <textarea value={editing.text} onChange={(e) => setEditing({ ...editing, text: e.target.value })} rows={6} autoFocus
                    style={{ ...field, fontFamily: SANS, fontSize: 15, lineHeight: 1.55 }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => decide(it, 'edit', editing.text)} disabled={!editing.text.trim() || working === it.id} style={btn(true)}>Save</button>
                    <button onClick={() => setEditing(null)} style={btn(false)}>Cancel</button>
                  </div>
                </div>
              ) : text ? (
                <div style={{ background: '#E7F6EA', borderRadius: '4px 14px 14px 14px', padding: '12px 14px', fontSize: 15, lineHeight: 1.55, whiteSpace: 'pre-wrap', maxWidth: 640 }}>
                  {text}
                </div>
              ) : null}

              <p style={{ margin: '10px 0 0', fontSize: 13, color: '#5a5f78' }}>
                <b>{it.status === 'skipped' ? 'Why Claude left it out:' : 'Why it was picked:'}</b> {it.reason}
                {it.link && <> <a href={it.link} target="_blank" rel="noreferrer" style={{ color: ACCENT }}>Read the original</a></>}
              </p>

              {it.translations && (
                <div style={{ marginTop: 10 }}>
                  <button onClick={() => setOpenTr(openTr === it.id ? null : it.id)} style={link}>
                    {openTr === it.id ? 'Hide the translations' : 'Show the five translations'}
                  </button>
                  {openTr === it.id && LANGS.map(l => (
                    <div key={l.key} style={{ marginTop: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{l.label}</div>
                      <div style={{ background: '#F7F7F5', border: '1px solid #E0DFDC', borderRadius: 10, padding: '10px 12px', fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{it.translations[l.key]}</div>
                    </div>
                  ))}
                </div>
              )}

              {!isEditing && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                  {tab === 'pending' && <>
                    <button onClick={() => decide(it, 'approve')} disabled={working === it.id} style={btn(true)}>
                      {working === it.id ? 'Translating...' : 'Approve'}
                    </button>
                    <button onClick={() => setEditing({ id: it.id, text })} style={btn(false)}>Edit</button>
                    <button onClick={() => decide(it, 'reject')} disabled={working === it.id} style={btn(false)}>Reject</button>
                  </>}
                  {tab === 'approved' && <>
                    <button onClick={() => setEditing({ id: it.id, text })} style={btn(false)}>Edit</button>
                    <button onClick={() => decide(it, 'pending')} disabled={working === it.id} style={btn(false)}>Take it out of line</button>
                  </>}
                  {tab === 'rejected' && <button onClick={() => decide(it, 'pending')} disabled={working === it.id} style={btn(false)}>Move back to review</button>}
                  {tab === 'skipped' && <button onClick={() => setEditing({ id: it.id, text: '' })} style={btn(false)}>Write a post for it</button>}
                </div>
              )}
            </article>
          )
        })}

        {emails.length > 0 && (
          <section style={{ ...card, marginTop: 28 }}>
            <h2 style={h2}>Newsletters received</h2>
            {emails.map(e => (
              <div key={e.email_id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13.5, padding: '8px 0', borderTop: '1px solid #eee', flexWrap: 'wrap' }}>
                <span><b>{day(e.created_at)}</b> {e.subject}</span>
                <span style={{ color: e.status === 'failed' ? '#b02a2a' : '#5a5f78' }}>
                  {e.status === 'done' ? `${e.kept} kept of ${e.stories}` : e.status === 'ignored' ? 'Ignored, sender not on the list' : e.status === 'processing' ? 'Being read now' : 'Failed'}
                </span>
              </div>
            ))}
          </section>
        )}
        <p style={{ ...muted, fontSize: 12.5, marginTop: 18 }}>Keys: J and K move between stories, A approves, R rejects, E edits.</p>
      </main>
    </div>
  )
}

const card = { background: '#fff', border: '1px solid #E0DFDC', borderRadius: 14, padding: '18px 20px', marginBottom: 14 }
const h2 = { margin: '0 0 8px', fontFamily: 'Georgia, serif', fontSize: 18, color: NAVY }
const muted = { color: '#5a5f78', fontSize: 14, margin: '0 0 10px' }
const field = { width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 8, border: '1px solid #c9ccd6', fontSize: 14, marginBottom: 10 }
const link = { background: 'none', border: 'none', color: ACCENT, padding: 0, cursor: 'pointer', fontSize: 13.5, fontFamily: SANS }
function btn(primary) {
  return {
    marginTop: 12, padding: '10px 18px', minHeight: 44, borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: SANS,
    background: primary ? NAVY : 'transparent', color: primary ? '#fff' : NAVY, border: `1px solid ${primary ? NAVY : '#c9ccd6'}`,
  }
}
