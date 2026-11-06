import { useCallback, useEffect, useState } from 'react'

// /internal-reels: the daily Spain 24/7 Instagram reels.
//
// Every day a GitHub Action (.github/workflows/reels-render.yml) asks the site to write a
// short script from the best new idealista story, has it translated into five languages,
// renders one vertical video per language with the presenter and a voice-over, and emails
// the videos with their captions. Nothing here has to be clicked for that to happen. This
// page is for watching what went out, re-sending an email or putting a reel back in the
// render queue.
//
// No meta.js on purpose: never on the homepage grid, never in the sitemap, and noindex.

const NAVY = '#010221'
const LBLUE = '#CBEFFF'
const ACCENT = '#5B7FCC'
const GOLD = '#C9A96E'
const BG = '#F4F2EE'
const SANS = "'DM Sans', Arial, Helvetica, sans-serif"

const LANGS = [
  { key: 'en', label: 'English' }, { key: 'no', label: 'Norwegian' }, { key: 'sv', label: 'Swedish' },
  { key: 'de', label: 'German' }, { key: 'fr', label: 'French' }, { key: 'nl', label: 'Dutch' },
]
const STATUS = {
  planned: { label: 'Script written', bg: '#EEF1F8', fg: ACCENT },
  scripted: { label: 'Waiting to render', bg: '#EEF1F8', fg: ACCENT },
  rendered: { label: 'Rendered', bg: LBLUE, fg: NAVY },
  sent: { label: 'Emailed', bg: '#E5F3EA', fg: '#1F6B3A' },
  send_failed: { label: 'Email failed', bg: '#FBE9E7', fg: '#A3341F' },
  failed: { label: 'Render failed', bg: '#FBE9E7', fg: '#A3341F' },
}
const longDay = (d) => {
  try { return new Date(`${d}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }) } catch { return d }
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

function Pill({ status }) {
  const s = STATUS[status] || { label: status, bg: '#eee', fg: '#333' }
  return <span style={{ background: s.bg, color: s.fg, borderRadius: 999, padding: '3px 10px', fontSize: 12.5, fontWeight: 700 }}>{s.label}</span>
}

function Copy({ text }) {
  const [done, setDone] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text).then(() => { setDone(true); setTimeout(() => setDone(false), 1500) }) }}
      style={{ border: `1px solid ${NAVY}`, background: done ? NAVY : '#fff', color: done ? '#fff' : NAVY, borderRadius: 8, padding: '8px 14px', fontWeight: 700, cursor: 'pointer', minHeight: 40 }}
    >{done ? 'Copied' : 'Copy caption and hashtags'}</button>
  )
}

function Reel({ reel, pass, onChanged }) {
  const langs = LANGS.filter(l => reel.scripts && reel.scripts[l.key])
  const [lang, setLang] = useState(langs[0]?.key || 'en')
  const [busy, setBusy] = useState('')
  const [note, setNote] = useState('')
  const s = (reel.scripts || {})[lang] || {}
  const v = (reel.videos || {})[lang]
  const meta = reel.meta?.render?.[lang]
  const err = (reel.errors || {})[lang]
  const text = `${s.caption || ''}\n\n${(s.hashtags || []).join(' ')}`.trim()

  const act = async (action, label) => {
    setBusy(action); setNote('')
    try {
      const j = await call(`/api/reels?action=${action}`, pass, { id: reel.id })
      setNote(j.ok === false ? (j.error || 'Something went wrong.') : label)
      onChanged()
    } catch (e) { setNote(String(e.message || e)) }
    setBusy('')
  }

  return (
    <article style={{ background: '#fff', borderRadius: 14, padding: 22, marginBottom: 22, boxShadow: '0 1px 3px rgba(1,2,33,.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 13, color: '#5a5f78' }}>{longDay(reel.day)}</div>
          <h2 style={{ margin: '4px 0 0', fontSize: 21, color: NAVY }}>{reel.story?.title_en || 'Untitled'}</h2>
        </div>
        <Pill status={reel.status} />
      </div>
      {reel.error && <p style={{ color: '#A3341F', margin: '10px 0 0' }}>{reel.error}</p>}
      {reel.sent_at && <p style={{ color: '#5a5f78', fontSize: 13, margin: '8px 0 0' }}>Emailed to {reel.sent_to} on {new Date(reel.sent_at).toLocaleString()}.</p>}

      <div role="tablist" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '16px 0' }}>
        {langs.map(l => (
          <button key={l.key} role="tab" aria-selected={lang === l.key} onClick={() => setLang(l.key)}
            style={{ border: 'none', borderRadius: 999, padding: '8px 14px', minHeight: 40, cursor: 'pointer', fontWeight: 700,
              background: lang === l.key ? NAVY : BG, color: lang === l.key ? '#fff' : NAVY }}>
            {l.label}{reel.videos?.[l.key] ? '' : ' (no video)'}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ width: 240, flex: '0 0 240px' }}>
          {v?.mp4
            ? <video key={v.mp4} src={v.mp4} poster={v.jpg || undefined} controls playsInline style={{ width: 240, aspectRatio: '9 / 16', borderRadius: 12, background: NAVY }} />
            : <div style={{ width: 240, aspectRatio: '9 / 16', borderRadius: 12, background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5a5f78', textAlign: 'center', padding: 16 }}>
                {err ? err : 'The video appears here once it has been rendered.'}
              </div>}
          {meta && <p style={{ fontSize: 12.5, color: '#5a5f78', margin: '8px 0 0' }}>{meta.seconds} seconds, {meta.voiced ? 'with voice-over' : 'no voice-over'}.</p>}
          {v?.mp4 && <a href={v.mp4} download style={{ display: 'inline-block', marginTop: 8, color: ACCENT, fontWeight: 700 }}>Download the video</a>}
        </div>
        <div style={{ flex: '1 1 320px', minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: NAVY, marginBottom: 6 }}>What she says</div>
          <ol style={{ margin: '0 0 16px', paddingLeft: 20, color: NAVY, lineHeight: 1.55 }}>
            {(s.scenes || []).map((sc, i) => <li key={i} style={{ marginBottom: 4 }}>{sc.big ? <strong>{sc.big}. </strong> : null}{sc.text}</li>)}
          </ol>
          <div style={{ fontWeight: 700, color: NAVY, marginBottom: 6 }}>Caption</div>
          <div style={{ whiteSpace: 'pre-wrap', background: BG, borderRadius: 10, padding: 14, color: NAVY, lineHeight: 1.55, marginBottom: 10 }}>{text}</div>
          <Copy text={text} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18, alignItems: 'center' }}>
        {Object.keys(reel.videos || {}).length > 0 && (
          <button disabled={!!busy} onClick={() => act('resend', 'The email has been sent again.')}
            style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 16px', fontWeight: 700, cursor: 'pointer', minHeight: 44 }}>
            {busy === 'resend' ? 'Sending...' : 'Send the email again'}
          </button>
        )}
        {['failed', 'send_failed', 'rendered', 'sent'].includes(reel.status) && (
          <button disabled={!!busy} onClick={() => act('rerender', 'It will be rendered again on the next daily run.')}
            style={{ background: '#fff', color: NAVY, border: `1px solid ${NAVY}`, borderRadius: 8, padding: '10px 16px', fontWeight: 700, cursor: 'pointer', minHeight: 44 }}>
            {busy === 'rerender' ? 'Working...' : 'Render it again'}
          </button>
        )}
        {note && <span style={{ color: NAVY }}>{note}</span>}
      </div>
    </article>
  )
}

export default function InternalReels() {
  const [pass, setPass] = useState(() => { try { return sessionStorage.getItem('reels_pass') || '' } catch { return '' } })
  const [entered, setEntered] = useState(false)
  const [reels, setReels] = useState([])
  const [live, setLive] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [health, setHealth] = useState(null)

  useEffect(() => { document.title = 'Instagram reels | 24/7 Spain' }, [])

  const load = useCallback(async (p) => {
    setBusy(true); setErr('')
    try {
      const j = await call('/api/reels?action=list', p)
      setReels(j.reels || []); setLive(!!j.live); setEntered(true)
      try { sessionStorage.setItem('reels_pass', p) } catch { /* private mode */ }
    } catch (e) {
      if (e.auth) setEntered(false)
      setErr(String(e.message || e))
    }
    setBusy(false)
  }, [])

  useEffect(() => { if (pass) load(pass) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const check = async () => {
    setHealth({ loading: true })
    try { setHealth(await call('/api/reels?action=health', pass)) } catch (e) { setHealth({ error: String(e.message || e) }) }
  }

  if (!entered) {
    return (
      <main style={{ minHeight: '100vh', background: BG, fontFamily: SANS, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <form onSubmit={(e) => { e.preventDefault(); load(pass) }} style={{ background: '#fff', borderRadius: 14, padding: 28, width: '100%', maxWidth: 380 }}>
          <h1 style={{ margin: '0 0 6px', color: NAVY, fontSize: 22 }}>Instagram reels</h1>
          <p style={{ margin: '0 0 16px', color: '#5a5f78' }}>Enter the internal password to see the daily videos.</p>
          <label htmlFor="pw" style={{ display: 'block', fontWeight: 700, color: NAVY, marginBottom: 6 }}>Password</label>
          <input id="pw" type="password" value={pass} onChange={e => setPass(e.target.value)} autoFocus
            style={{ width: '100%', boxSizing: 'border-box', padding: 12, borderRadius: 8, border: '1px solid #c9c7c2', fontSize: 16, marginBottom: 12 }} />
          {err && <p style={{ color: '#A3341F', margin: '0 0 12px' }}>{err}</p>}
          <button type="submit" disabled={busy} style={{ width: '100%', background: NAVY, color: '#fff', border: 'none', borderRadius: 8, padding: 12, fontWeight: 700, fontSize: 16, minHeight: 48, cursor: 'pointer' }}>
            {busy ? 'Opening...' : 'Open'}
          </button>
        </form>
      </main>
    )
  }

  const sent = reels.filter(r => r.status === 'sent').length
  return (
    <main style={{ minHeight: '100vh', background: BG, fontFamily: SANS, color: NAVY }}>
      <header style={{ background: NAVY, color: '#fff', padding: '28px 20px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div style={{ color: GOLD, fontWeight: 700, letterSpacing: 1, fontSize: 12.5, textTransform: 'uppercase' }}>Spain 24/7 Instagram</div>
          <h1 style={{ margin: '6px 0 8px', fontSize: 28 }}>Daily reels in six languages</h1>
          <p style={{ margin: 0, color: '#c8cbe0', maxWidth: 680, lineHeight: 1.55 }}>
            Every afternoon the best new idealista story becomes a short video with our presenter, in English, Norwegian, Swedish, German, French and Dutch, and the videos are emailed with their captions.
            {live ? ' The email goes to Pratik, with John and the posting agent in BCC.' : ' For now the email goes to Pratik only, until he approves it.'}
          </p>
          <div style={{ display: 'flex', gap: 28, marginTop: 18, flexWrap: 'wrap' }}>
            <div><div style={{ fontSize: 30, fontWeight: 700 }}>{reels.length}</div><div style={{ color: '#c8cbe0', fontSize: 13 }}>reels made</div></div>
            <div><div style={{ fontSize: 30, fontWeight: 700 }}>{sent}</div><div style={{ color: '#c8cbe0', fontSize: 13 }}>emailed</div></div>
          </div>
        </div>
      </header>
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '22px 20px 60px' }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={() => load(pass)} disabled={busy} style={{ background: '#fff', color: NAVY, border: `1px solid ${NAVY}`, borderRadius: 8, padding: '10px 16px', fontWeight: 700, cursor: 'pointer', minHeight: 44 }}>{busy ? 'Loading...' : 'Refresh'}</button>
          <button onClick={check} style={{ background: '#fff', color: NAVY, border: `1px solid ${NAVY}`, borderRadius: 8, padding: '10px 16px', fontWeight: 700, cursor: 'pointer', minHeight: 44 }}>Run health check</button>
        </div>
        {err && <div style={{ background: '#FBE9E7', color: '#A3341F', padding: 14, borderRadius: 10, marginBottom: 16 }}>{err}</div>}
        {health && (
          <div style={{ background: '#fff', borderRadius: 10, padding: 14, marginBottom: 18, fontSize: 14, lineHeight: 1.6 }}>
            {health.loading ? 'Checking...' : health.error ? <span style={{ color: '#A3341F' }}>{health.error}</span> : (
              <>
                <strong style={{ color: health.ok ? '#1F6B3A' : '#A3341F' }}>{health.ok ? 'Everything the reels need is in place.' : 'Something the reels need is missing.'}</strong>
                <div>Settings: {Object.entries(health.env || {}).map(([k, v]) => `${k} ${v ? 'set' : 'MISSING'}`).join(', ')}.</div>
                <div>Table: {health.table === true ? 'ready' : String(health.table)}. Video storage: {health.bucket === true ? 'ready' : String(health.bucket)}.</div>
                <div>Next story in line: {health.next_story || 'none yet'}.</div>
              </>
            )}
          </div>
        )}
        {reels.length === 0 && !busy && (
          <div style={{ background: '#fff', borderRadius: 14, padding: 28, textAlign: 'center' }}>
            <h2 style={{ marginTop: 0 }}>No reels yet</h2>
            <p style={{ color: '#5a5f78', margin: 0 }}>The first one is made on the next daily run, at about 14:20 Spanish time.</p>
          </div>
        )}
        {reels.map(r => <Reel key={r.id} reel={r} pass={pass} onChanged={() => load(pass)} />)}
      </div>
    </main>
  )
}
