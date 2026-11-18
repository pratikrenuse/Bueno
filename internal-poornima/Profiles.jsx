import { useCallback, useEffect, useState } from 'react'

// The profile posts view on /internal-poornima (17 November 2026).
//
// One post a day goes out on the 28 Maria Lopez profiles (Instagram, Facebook, LinkedIn and X,
// seven languages each) in the daily task email, with nothing to approve. This shows what goes
// out when, lets Pratik watch every language's reel, and park a post he does not want sent.
// The Accounts view lists the 28 profiles and the persona each language is locked to.
// Data: /api/fb?action=profiles.

const NAVY = '#010221'
const ACCENT = '#5B7FCC'

const day = (iso) => {
  if (!iso) return ''
  try { return new Date(`${String(iso).slice(0, 10)}T00:00:00Z`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }) }
  catch { return iso }
}
const pill = (label, bg, fg) => (
  <span style={{ fontSize: 12, fontWeight: 600, background: bg, color: fg, borderRadius: 999, padding: '3px 10px' }}>{label}</span>
)
const btn = (primary) => ({
  background: primary ? NAVY : '#fff', color: primary ? '#fff' : NAVY, border: `1px solid ${primary ? NAVY : '#C9CCD6'}`,
  borderRadius: 8, padding: '8px 14px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', minHeight: 40,
})
const STATUS = {
  waiting: ['Goes out automatically', '#E9EEF9', '#2f4f9e'],
  sent: ['Sent', '#E8F3E8', '#2e7d32'],
  parked: ['Parked', '#FAEDED', '#b02a2a'],
}

function useData(pass) {
  const [data, setData] = useState(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const load = useCallback(async () => {
    setBusy(true); setErr('')
    try {
      const r = await fetch('/api/fb?action=profiles', { headers: { 'x-passcode': pass } })
      const raw = await r.text()
      let j
      try { j = JSON.parse(raw) } catch { throw new Error(`Server error ${r.status}: ${raw.slice(0, 200)}`) }
      if (j.error) throw new Error(j.error)
      setData(j)
    } catch (e) { setErr(String(e.message || e)) }
    setBusy(false)
  }, [pass])
  useEffect(() => { load() }, [load])
  return { data, err, busy, load, setErr }
}

function Post({ post, onAct, working }) {
  const [lang, setLang] = useState('en')
  const [open, setOpen] = useState(false)
  const l = post.langs.find(x => x.lang === lang) || post.langs[0]
  const [label, bg, fg] = STATUS[post.status]
  return (
    <article style={{ background: '#fff', border: '1px solid #E0DFDC', borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 200px) 1fr', gap: 0 }}>
        <div style={{ background: '#111' }}>
          {open
            ? <video key={l.video} src={l.video} poster={l.poster} controls autoPlay playsInline style={{ width: '100%', display: 'block' }} />
            : <button onClick={() => setOpen(true)} aria-label="Play the reel" style={{ padding: 0, border: 0, display: 'block', width: '100%', cursor: 'pointer', background: '#111' }}>
                <img src={l.poster} alt="" loading="lazy" style={{ width: '100%', display: 'block' }} />
              </button>}
        </div>
        <div style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <b style={{ color: NAVY }}>{post.date ? day(post.date) : 'Not scheduled'}</b>
            {pill(label, bg, fg)}
            {pill(post.audience, '#CBEFFF', NAVY)}
          </div>
          <div role="tablist" aria-label="Language" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '12px 0 4px' }}>
            {post.langs.map(x => (
              <button key={x.lang} role="tab" aria-selected={x.lang === lang} onClick={() => setLang(x.lang)}
                style={{ ...btn(x.lang === lang), padding: '5px 10px', minHeight: 32, fontSize: 12.5 }}>{x.label}</button>
            ))}
          </div>
          <p style={{ margin: '6px 0 0', fontSize: 12.5, color: '#55596b' }}>{l.persona}</p>
          <p style={{ margin: '8px 0 0', fontSize: 14.5, fontWeight: 600, color: NAVY, lineHeight: 1.5 }}>{l.overlay.join(' ')}</p>
          <p style={{ margin: '8px 0 0', whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.6, color: '#22263a' }}>{l.caption}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
            <a href={l.video} style={{ ...btn(false), textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>Download this reel</a>
            {post.status === 'waiting' && <button style={btn(false)} disabled={working} onClick={() => onAct(post.key, 'park')}>{working ? 'Parking...' : 'Park, do not send'}</button>}
            {post.status === 'parked' && <button style={btn(true)} disabled={working} onClick={() => onAct(post.key, 'unpark')}>{working ? 'Saving...' : 'Send it after all'}</button>}
          </div>
        </div>
      </div>
    </article>
  )
}

export default function Profiles({ pass, mode = 'posts' }) {
  const { data, err, busy, load, setErr } = useData(pass)
  const [working, setWorking] = useState(null)

  async function act(key, action) {
    setWorking(key); setErr('')
    try {
      const r = await fetch('/api/fb?action=profiles', {
        method: 'POST', headers: { 'x-passcode': pass, 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, action }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok || j.error) throw new Error(j.error || `Server error ${r.status}`)
      await load()
    } catch (e) { setErr(String(e.message || e)) }
    setWorking(null)
  }

  if (!data) return <div className="fbp-wide">{err ? <p className="fbp-err">{err}</p> : <p>Loading the profile posts...</p>}</div>

  if (mode === 'accounts') {
    return (
      <div className="fbp-wide" style={{ paddingBottom: 40 }}>
        <p style={{ fontSize: 14, color: '#22263a', lineHeight: 1.6 }}>
          Seven languages, four platforms each. Every language is locked to one persona, one profile picture and one language, and never changes.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {data.accounts.map(a => (
            <div key={a.lang} style={{ background: '#fff', border: '1px solid #E0DFDC', borderRadius: 12, padding: 14 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <img src={a.avatar} alt="" width="56" height="56" style={{ borderRadius: '50%', objectFit: 'cover' }} />
                <div><b style={{ color: NAVY }}>{a.label}</b><div style={{ fontSize: 12.5, color: '#55596b' }}>{a.persona}</div></div>
              </div>
              <table style={{ marginTop: 10, fontSize: 13, color: '#22263a', borderCollapse: 'collapse', width: '100%' }}>
                <tbody>
                  {[['Instagram', a.instagram, `@${a.instagram.handle}`], ['Facebook', a.facebook, a.facebook.name],
                    ['LinkedIn', a.linkedin, a.linkedin.name], ['X', a.x, `@${a.x.handle}`]].map(([p, acc, who]) => (
                    <tr key={p} style={{ borderTop: '1px solid #EDEBE6' }}>
                      <td style={{ padding: '6px 8px 6px 0', fontWeight: 700, color: NAVY, whiteSpace: 'nowrap', verticalAlign: 'top' }}>{p} {acc.n}</td>
                      <td style={{ padding: '6px 0' }}>{who}<div style={{ color: '#55596b', fontSize: 12 }}>{acc.login}</div>{acc.note && <div style={{ color: '#8a6d1f', fontSize: 12 }}>{acc.note}</div>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const waiting = data.posts.filter(p => p.status === 'waiting')
  const parked = data.posts.filter(p => p.status === 'parked')
  const sent = data.posts.filter(p => p.status === 'sent').sort((a, b) => (a.date < b.date ? 1 : -1))
  return (
    <div className="fbp-wide" style={{ paddingBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '6px 0 14px' }}>
        <p style={{ margin: 0, fontSize: 14, color: '#22263a', lineHeight: 1.6, flex: 1 }}>
          One post goes out every day at 7 am India time on all 28 profiles, by itself. Nothing needs approving. Park a post only if you do not want it sent.
        </p>
        <button className="fbp-chip" onClick={load} disabled={busy}>{busy ? 'Refreshing...' : 'Refresh'}</button>
      </div>
      {err && <p className="fbp-err">{err}</p>}
      {data.low && <p className="fbp-err">Only {data.waiting} post{data.waiting === 1 ? '' : 's'} left in this batch. Ask Claude for the next batch of reels.</p>}

      <h2 style={{ fontSize: 17, color: NAVY, margin: '18px 0 10px' }}>Coming up ({waiting.length})</h2>
      {waiting.length === 0 && <p style={{ fontSize: 14, color: '#22263a' }}>Nothing is left in this batch.</p>}
      {waiting.map(p => <Post key={p.key} post={p} onAct={act} working={working === p.key} />)}

      {parked.length > 0 && <>
        <h2 style={{ fontSize: 17, color: NAVY, margin: '26px 0 10px' }}>Parked ({parked.length})</h2>
        {parked.map(p => <Post key={p.key} post={p} onAct={act} working={working === p.key} />)}
      </>}

      <h2 style={{ fontSize: 17, color: NAVY, margin: '26px 0 10px' }}>Already sent ({sent.length})</h2>
      {sent.length === 0 && <p style={{ fontSize: 14, color: '#22263a' }}>Nothing has gone out yet.</p>}
      {sent.map(p => <Post key={p.key} post={p} onAct={act} working={false} />)}
    </div>
  )
}
