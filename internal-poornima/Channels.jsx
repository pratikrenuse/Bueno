import { useCallback, useEffect, useState } from 'react'

// The WhatsApp channels view on /internal-poornima (6 November 2026).
//
// Every story the idealista digest keeps shows up here by itself. Nothing goes into the six
// Spain 24/7 WhatsApp channels unless Pratik approves it here. Approving translates it into
// the five other channel languages and puts it in line; each morning the daily task email
// carries the next one, with its photo and the text in all six languages.
// Data: /api/fb?action=channels. Not a route of its own: the folder's index.jsx renders it.

const NAVY = '#010221'
const ACCENT = '#5B7FCC'

const day = (iso) => {
  if (!iso) return ''
  try { return new Date(`${String(iso).slice(0, 10)}T00:00:00Z`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }) }
  catch { return iso }
}
const addDays = (iso, n) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * 864e5).toISOString().slice(0, 10)

const pill = (label, bg, fg) => (
  <span style={{ fontSize: 12, fontWeight: 600, background: bg, color: fg, borderRadius: 999, padding: '3px 10px' }}>{label}</span>
)
const btn = (primary) => ({
  background: primary ? NAVY : '#fff', color: primary ? '#fff' : NAVY, border: `1px solid ${primary ? NAVY : '#C9CCD6'}`,
  borderRadius: 8, padding: '8px 14px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', minHeight: 40,
})

function Translations({ texts, langs, names }) {
  const [open, setOpen] = useState(false)
  if (!texts) return null
  const others = langs.filter(l => l !== 'en' && texts[l])
  if (!others.length) return null
  return (
    <div>
      <button onClick={() => setOpen(o => !o)}
        style={{ marginTop: 10, background: 'none', border: 0, padding: 0, color: ACCENT, cursor: 'pointer', fontSize: 13.5, fontWeight: 600 }}>
        {open ? 'Hide the translations' : `Show the ${others.length} translations`}
      </button>
      {open && others.map(l => (
        <div key={l} style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>{names[l] || l}</div>
          <p style={{ margin: '4px 0 0', whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.6, color: '#22263a' }}>{texts[l]}</p>
        </div>
      ))}
    </div>
  )
}

function Story({ item, head, children, langs, names, picking, onPick, photos, onPhoto }) {
  const english = item.texts ? item.texts.en : item.english
  return (
    <article style={{ background: '#fff', border: '1px solid #E0DFDC', borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 220px) 1fr', gap: 0 }}>
        <div style={{ background: '#EDEBE6' }}>
          {item.image
            ? <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: 160 }} />
            : <div style={{ minHeight: 160, display: 'grid', placeItems: 'center', fontSize: 13, color: '#55596b', padding: 12, textAlign: 'center' }}>No photo yet</div>}
        </div>
        <div style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>{head}</div>
          <p style={{ margin: '10px 0 0', whiteSpace: 'pre-wrap', fontSize: 14.5, lineHeight: 1.6, color: '#22263a' }}>{english}</p>
          <Translations texts={item.texts} langs={langs} names={names} />
          {children && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>{children}</div>}
        </div>
      </div>
      {picking && (
        <div style={{ borderTop: '1px solid #E0DFDC', padding: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
          {!photos && <p style={{ margin: 0, fontSize: 13.5 }}>Finding photos...</p>}
          {photos && photos.error && <p className="fbp-err" style={{ margin: 0 }}>{photos.error}</p>}
          {photos && (photos.list || []).map(url => (
            <button key={url} onClick={() => onPhoto(url)} aria-label="Use this photo"
              style={{ padding: 0, border: '1px solid #E0DFDC', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', background: '#EDEBE6' }}>
              <img src={url.replace('w=1200', 'w=320')} alt="" loading="lazy" style={{ width: '100%', height: 86, objectFit: 'cover', display: 'block' }} />
            </button>
          ))}
          <button onClick={onPick} style={btn(false)}>Close</button>
        </div>
      )}
    </article>
  )
}

export default function Channels({ pass, mode = 'posts' }) {
  const [data, setData] = useState(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [working, setWorking] = useState(null) // { id, action }
  const [picking, setPicking] = useState(null)
  const [flash, setFlash] = useState('')
  const [options, setOptions] = useState(null) // photo choices for the story being picked

  const load = useCallback(async () => {
    setBusy(true); setErr('')
    try {
      const r = await fetch('/api/fb?action=channels', { headers: { 'x-passcode': pass } })
      const raw = await r.text()
      let j
      try { j = JSON.parse(raw) } catch { throw new Error(`Server error ${r.status}: ${raw.slice(0, 200)}`) }
      if (j.error) throw new Error(j.error)
      setData(j)
    } catch (e) { setErr(String(e.message || e)) }
    setBusy(false)
  }, [pass])

  useEffect(() => { load() }, [load])

  async function act(id, action, extra = {}) {
    setWorking({ id, action }); setErr(''); setFlash('')
    try {
      const r = await fetch('/api/fb?action=channels', {
        method: 'POST', headers: { 'x-passcode': pass, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, ...extra }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok || j.error) throw new Error(j.error || `Server error ${r.status}`)
      if (action === 'approve') setFlash('Approved and translated. It is now in line for the daily email.')
      if (action === 'image') setPicking(null)
      await load()
    } catch (e) { setErr(String(e.message || e)) }
    setWorking(null)
  }
  async function openPicker(id) {
    if (picking === id) { setPicking(null); return }
    setPicking(id); setOptions(null)
    try {
      const r = await fetch(`/api/fb?action=channels&photos=${encodeURIComponent(id)}`, { headers: { 'x-passcode': pass } })
      const j = await r.json().catch(() => ({}))
      setOptions(j.error ? { error: j.error } : { list: j.photos || [] })
    } catch (e) { setOptions({ error: String(e.message || e) }) }
  }
  const doing = (id, action) => working && working.id === id && working.action === action

  if (!data) return <div className="fbp-wide">{err ? <p className="fbp-err">{err}</p> : <p>Loading the WhatsApp channels...</p>}</div>

  const { langs, names, review, queued, sent, today, sent_today, photo_error } = data
  // The daily email goes at 07:00 India time (01:30 UTC), with a catch-up at 12:00 UTC.
  const firstDay = (!sent_today && new Date().getUTCHours() < 12) ? today : addDays(today, 1)
  const common = { langs, names, photos: options }

  if (mode === 'dashboard') {
    return <WhatsAppDashboard data={data} firstDay={firstDay} busy={busy} onRefresh={load} err={err} />
  }

  return (
    <div className="fbp-wide" style={{ paddingBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '6px 0 14px' }}>
        <p style={{ margin: 0, fontSize: 14, color: '#22263a', lineHeight: 1.6, flex: 1 }}>
          New idealista stories appear here by themselves. Nothing goes into the WhatsApp channels until you approve it. Each morning at 7 am India time the daily email carries the next approved post, with its photo and the text in all six languages.
        </p>
        <button className="fbp-chip" onClick={load} disabled={busy}>{busy ? 'Refreshing...' : 'Refresh'}</button>
      </div>
      {err && <p className="fbp-err">{err}</p>}
      {photo_error && <p className="fbp-err">The photos could not be fetched: {photo_error}</p>}
      {flash && <p className="fbp-ok">{flash}</p>}

      <h2 style={{ fontSize: 17, color: NAVY, margin: '18px 0 10px' }}>To review ({review.length})</h2>
      {review.length === 0 && <p style={{ fontSize: 14, color: '#22263a' }}>Nothing is waiting. The next idealista newsletter adds its stories here.</p>}
      {review.map(i => (
        <Story key={i.id} item={i} {...common} picking={picking === i.id} onPick={() => setPicking(null)}
          onPhoto={(url) => act(i.id, 'image', { image: url })}
          head={<>
            <b style={{ color: NAVY }}>{i.title}</b>
            {pill(`idealista, ${day(i.received_on)}`, '#CBEFFF', NAVY)}
            {i.is_proposal && pill('Proposal, not law', '#FBF3E2', '#8a6d1f')}
          </>}>
          <button style={btn(true)} disabled={!!working} onClick={() => act(i.id, 'approve')}>
            {doing(i.id, 'approve') ? 'Approving and translating...' : 'Approve'}</button>
          <button style={btn(false)} disabled={!!working} onClick={() => openPicker(i.id)}>Change photo</button>
          <button style={btn(false)} disabled={!!working} onClick={() => act(i.id, 'skip')}>
            {doing(i.id, 'skip') ? 'Setting aside...' : 'Not for the channels'}</button>
        </Story>
      ))}

      <h2 style={{ fontSize: 17, color: NAVY, margin: '26px 0 10px' }}>Approved, in line ({queued.length})</h2>
      {queued.length === 0 && <p style={{ fontSize: 14, color: '#22263a' }}>Nothing is approved yet, so nothing will go into the channels.</p>}
      {queued.map((i, n) => (
        <Story key={i.id} item={i} {...common} picking={picking === i.id} onPick={() => setPicking(null)}
          onPhoto={(url) => act(i.id, 'image', { image: url })}
          head={<>
            <b style={{ color: NAVY }}>Goes out {day(addDays(firstDay, n))}</b>
            {pill('Approved', '#E8F3E8', '#2e7d32')}
            {pill(`idealista, ${day(i.received_on)}`, '#CBEFFF', NAVY)}
          </>}>
          <button style={btn(false)} disabled={!!working} onClick={() => openPicker(i.id)}>Change photo</button>
          <button style={btn(false)} disabled={!!working} onClick={() => act(i.id, 'undo')}>
            {doing(i.id, 'undo') ? 'Undoing...' : 'Undo approval'}</button>
        </Story>
      ))}

      <h2 style={{ fontSize: 17, color: NAVY, margin: '26px 0 10px' }}>Already sent</h2>
      {sent.length === 0 && <p style={{ fontSize: 14, color: '#22263a' }}>Nothing has been sent from here yet.</p>}
      {sent.map(s => (
        <Story key={s.day} item={{ id: s.day, image: s.texts && s.texts.image, texts: s.texts }} {...common}
          head={<>
            <b style={{ color: NAVY }}>{day(s.day)}</b>
            {pill('Sent', '#E8F3E8', '#2e7d32')}
            {s.title && <span style={{ fontSize: 13, color: '#55596b' }}>{s.title}</span>}
          </>} />
      ))}
    </div>
  )
}

// The dashboard (6 November 2026): what is waiting, what goes out when, what went, and the
// idealista emails that came in. Same data as the posts view, from /api/fb?action=channels.
const time = (iso) => {
  if (!iso) return ''
  try { return new Date(iso).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }
  catch { return iso }
}

function Tile({ big, label, sub }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E0DFDC', borderRadius: 12, padding: '14px 16px' }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: NAVY, lineHeight: 1.1 }}>{big}</div>
      <div style={{ fontSize: 13.5, color: '#22263a', marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 12.5, color: '#55596b', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function Table({ head, rows, empty }) {
  if (!rows.length) return <p style={{ fontSize: 14, color: '#22263a' }}>{empty}</p>
  return (
    <div style={{ background: '#fff', border: '1px solid #E0DFDC', borderRadius: 12, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5, color: '#22263a' }}>
        <thead><tr>{head.map(h => <th key={h} style={{ textAlign: 'left', padding: '10px 12px', background: '#F4F2EE', color: NAVY, fontWeight: 700 }}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => (
          <tr key={i} style={{ borderTop: '1px solid #EDEBE6' }}>
            {r.map((c, j) => <td key={j} style={{ padding: '10px 12px', verticalAlign: 'top' }}>{c}</td>)}
          </tr>
        ))}</tbody>
      </table>
    </div>
  )
}

function WhatsAppDashboard({ data, firstDay, busy, onRefresh, err }) {
  const { review, queued, sent, newsletters = [], sent_today } = data
  const lastNews = newsletters[0]
  const since = addDays(data.today, -29)
  const sentMonth = sent.filter(s => s.day >= since).length
  const nextTitle = queued[0] ? queued[0].title : null
  return (
    <div className="fbp-wide" style={{ paddingBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '6px 0 14px' }}>
        <p style={{ margin: 0, fontSize: 14, color: '#22263a', lineHeight: 1.6, flex: 1 }}>
          One approved post goes into the six WhatsApp channels each morning at 7 am India time. Nothing goes out unless you approved it.
        </p>
        <button className="fbp-chip" onClick={onRefresh} disabled={busy}>{busy ? 'Refreshing...' : 'Refresh'}</button>
      </div>
      {err && <p className="fbp-err">{err}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        <Tile big={review.length} label="Stories waiting for your review" />
        <Tile big={queued.length} label="Approved and in line"
          sub={queued.length ? `Covers the channels until ${day(addDays(firstDay, queued.length - 1))}.` : 'Nothing will go out until you approve one.'} />
        <Tile big={nextTitle ? day(firstDay) : 'None'} label="Next channel post"
          sub={nextTitle ? `7 am India time: ${nextTitle}` : (sent_today ? 'Today’s post has already gone.' : 'No approved post is waiting.')} />
        <Tile big={sentMonth} label="Posts sent in the last 30 days" />
        <Tile big={lastNews ? day(lastNews.received_at) : 'None'} label="Last idealista email"
          sub={lastNews ? `${lastNews.kept || 0} useful stories kept from it.` : 'No idealista email has come in yet.'} />
      </div>

      <h2 style={{ fontSize: 17, color: NAVY, margin: '26px 0 10px' }}>Coming up</h2>
      <Table head={['Date', 'Story', 'From idealista']} empty="Nothing is approved, so nothing is scheduled."
        rows={queued.map((q, n) => [day(addDays(firstDay, n)), q.title, day(q.received_on)])} />

      <h2 style={{ fontSize: 17, color: NAVY, margin: '26px 0 10px' }}>Sent</h2>
      <Table head={['Date', 'Story', 'Sent to']} empty="Nothing has been sent from here yet."
        rows={sent.map(s => [day(s.day), s.title || (s.texts && s.texts.en ? s.texts.en.slice(0, 80) + '...' : ''), 'You, with the publisher and John in BCC'])} />

      <h2 style={{ fontSize: 17, color: NAVY, margin: '26px 0 10px' }}>idealista emails received</h2>
      <Table head={['Received', 'Subject', 'Useful stories']} empty="No idealista email has come in yet."
        rows={newsletters.map(e => [time(e.received_at), e.subject, e.status === 'done' ? String(e.kept || 0) : e.status])} />
    </div>
  )
}
