import { useCallback, useEffect, useMemo, useState } from 'react'
import LegacyDeck from './LegacyDeck.jsx'

// /internal-newsletter: the Bueno Newsletter dashboard.
//
// One edition every two weeks (from Tue 10 Nov 2026), in English, Norwegian and Swedish.
// Each edition is built from the top three idealista stories and a NEW guide written from
// one blog article. This page keeps track of all of it:
//   - which article each guide came from, and which articles are still free to use
//   - every edition, its subject lines, stories, guide PDFs and who it was sent to
//   - whether John is on the send list yet ("launch")
// Same password as the other internal tools (INTERNAL_PASSCODE, studio_pass session key).
// No meta.js on purpose: never on the homepage, never in the sitemap.

const NAVY = '#010221', GOLD = '#C9A96E', LBLUE = '#CBEFFF', ACCENT = '#5B7FCC'
const BG = '#F8F7F4', RULE = '#E3E0DA', BODY = '#2B2E45', MUTED = '#6B6F85'
const SANS = "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
const SERIF = "'FS Siena', Georgia, serif"
const LANGS = [['en', 'English'], ['no', 'Norsk'], ['sv', 'Svenska']]

const A_STATUS = {
  available: { label: 'Available', bg: '#EEF1F6', fg: '#3b4a66' },
  selected: { label: 'Picked, waiting for you', bg: '#FBF3DF', fg: '#7a611c' },
  approved: { label: 'Approved', bg: '#E6EEFB', fg: '#2b4f9e' },
  used: { label: 'Used', bg: '#E8F3E8', fg: '#2e7d32' },
}
const E_STATUS = {
  draft: { label: 'Draft', bg: '#EEF1F6', fg: '#3b4a66' },
  test_sent: { label: 'Test sent to Pratik', bg: '#FBF3DF', fg: '#7a611c' },
  approved: { label: 'Approved', bg: '#E6EEFB', fg: '#2b4f9e' },
  sent: { label: 'Sent', bg: '#E8F3E8', fg: '#2e7d32' },
}
const LINKS = [['en_doc', 'EN doc'], ['en_web', 'EN blog'], ['no_doc', 'NO doc'], ['no_web', 'NO blog'], ['sv_doc', 'SV doc'], ['sv_web', 'SV blog']]

const fmt = (iso, o = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) =>
  iso ? new Date(`${String(iso).slice(0, 10)}T12:00:00Z`).toLocaleDateString('en-GB', { ...o, timeZone: 'UTC' }) : ''

async function call(pass, { method = 'GET', body, query = '' } = {}) {
  const r = await fetch(`/api/newsletter?action=dashboard${query}`, {
    method,
    headers: { 'x-passcode': pass, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await r.text()
  let j
  try { j = JSON.parse(text) } catch { throw new Error(`Server returned ${r.status} without JSON. The newsletter function may not be deployed yet.`) }
  if (!r.ok) { const e = new Error(j.error || `Error ${r.status}`); e.status = r.status; throw e }
  return j
}

const btn = (kind = 'ghost') => ({
  fontFamily: SANS, fontSize: 13, padding: '8px 15px', borderRadius: 22, cursor: 'pointer', minHeight: 36,
  border: kind === 'primary' ? `1px solid ${NAVY}` : kind === 'danger' ? '1px solid #d9a3a3' : `1px solid ${RULE}`,
  background: kind === 'primary' ? NAVY : '#fff', color: kind === 'primary' ? '#fff' : kind === 'danger' ? '#9b2c2c' : NAVY,
})
const Chip = ({ s }) => <span style={{ display: 'inline-block', fontFamily: SANS, fontSize: 11.5, fontWeight: 600, padding: '3px 10px', borderRadius: 12, background: s.bg, color: s.fg, whiteSpace: 'nowrap' }}>{s.label}</span>
const Card = ({ children, style }) => <div style={{ background: '#fff', border: `1px solid ${RULE}`, borderRadius: 12, padding: '18px 20px', ...style }}>{children}</div>
const A = ({ href, children }) => <a href={href} target="_blank" rel="noreferrer" style={{ color: ACCENT, fontFamily: SANS, fontSize: 13, textDecoration: 'none', marginRight: 12 }}>{children}</a>

function Stat({ n, label, onClick, active }) {
  return (
    <button onClick={onClick} style={{ textAlign: 'left', background: active ? LBLUE : '#fff', border: `1px solid ${active ? ACCENT : RULE}`, borderRadius: 12, padding: '14px 16px', cursor: 'pointer', minWidth: 0 }}>
      <div style={{ fontFamily: SERIF, fontSize: 28, color: NAVY, lineHeight: 1 }}>{n}</div>
      <div style={{ fontFamily: SANS, fontSize: 12.5, color: MUTED, marginTop: 6 }}>{label}</div>
    </button>
  )
}

function Edition({ e, pass, onApprove, busy }) {
  const [open, setOpen] = useState(false)
  const [lang, setLang] = useState('en')
  const [html, setHtml] = useState(null)
  const [err, setErr] = useState('')
  async function preview() {
    setOpen(o => !o)
    if (html) return
    try { const j = await call(pass, { query: `&edition=${encodeURIComponent(e.edition_key)}` }); setHtml(j.html || {}) } catch (x) { setErr(x.message) }
  }
  const s = E_STATUS[e.status] || E_STATUS.draft
  return (
    <Card style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'baseline' }}>
        <div style={{ fontFamily: SERIF, fontSize: 19, color: NAVY }}>{fmt(e.send_date)}</div>
        <Chip s={s} />
      </div>
      <div style={{ fontFamily: SANS, fontSize: 14, color: BODY, margin: '8px 0 12px', lineHeight: 1.5 }}>{(e.subject || {}).en}</div>
      <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: NAVY, marginBottom: 4 }}>Top three idealista stories</div>
      <ol style={{ margin: '0 0 12px 18px', padding: 0, fontFamily: SANS, fontSize: 13.5, color: BODY, lineHeight: 1.6 }}>
        {(e.stories || []).map((st, i) => <li key={i}>{st.link ? <a href={st.link} target="_blank" rel="noreferrer" style={{ color: BODY }}>{st.title}</a> : st.title}</li>)}
      </ol>
      <div style={{ fontFamily: SANS, fontSize: 13, color: BODY, marginBottom: 6 }}>
        <b>Guide article:</b> {e.article_slug || 'not set'} &nbsp; <b>Region:</b> {e.region || 'not set'}
      </div>
      <div style={{ marginBottom: 6 }}>
        {LANGS.map(([k, n]) => (e.guide_urls || {})[k] && <A key={k} href={e.guide_urls[k]}>Guide PDF {n}</A>)}
      </div>
      <div style={{ fontFamily: SANS, fontSize: 12.5, color: MUTED, marginBottom: 12 }}>
        Sent to: {(e.recipients || []).join(', ') || 'nobody yet'}{e.note ? ` · ${e.note}` : ''}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button style={btn()} onClick={preview}>{open ? 'Hide the emails' : 'See the emails'}</button>
        {e.status === 'test_sent' && <button style={btn('primary')} disabled={busy} onClick={() => onApprove(e.edition_key)}>Approve this edition</button>}
      </div>
      {open && (
        <div style={{ marginTop: 14 }}>
          {err && <div style={{ color: '#9b2c2c', fontFamily: SANS, fontSize: 13 }}>{err}</div>}
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {LANGS.map(([k, n]) => <button key={k} onClick={() => setLang(k)} style={{ ...btn(lang === k ? 'primary' : 'ghost'), minHeight: 30, padding: '5px 12px' }}>{n}</button>)}
          </div>
          <div style={{ fontFamily: SANS, fontSize: 12.5, color: MUTED, marginBottom: 8 }}>Subject: {(e.subject || {})[lang]}</div>
          {html && html[lang]
            ? <iframe title={`edition-${lang}`} srcDoc={html[lang]} style={{ width: '100%', height: 900, border: `1px solid ${RULE}`, borderRadius: 8, background: BG }} />
            : html && <div style={{ fontFamily: SANS, fontSize: 13, color: MUTED }}>The email for this language is not stored in the database. For 10 Nov 2026 it is in "Claude outputs/Newsletter 2026-11-10" in the repo and in your inbox. Later editions are stored here automatically.</div>}
        </div>
      )}
    </Card>
  )
}

export default function InternalNewsletter() {
  const [pass, setPass] = useState(() => { try { return sessionStorage.getItem('studio_pass') || '' } catch { return '' } })
  const [entered, setEntered] = useState(false)
  const [data, setData] = useState(null)
  const [tab, setTab] = useState('editions')
  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [notice, setNotice] = useState('')

  const load = useCallback(async (p) => {
    setBusy(true); setErr('')
    try {
      const j = await call(p)
      try { sessionStorage.setItem('studio_pass', p) } catch {}
      setEntered(true); setData(j)
    } catch (e) {
      if (e.status === 401) { setEntered(false); setErr('That password did not work.') } else setErr(e.message)
    }
    setBusy(false)
  }, [])
  useEffect(() => { if (pass) load(pass) }, []) // eslint-disable-line

  async function act(body, message) {
    setBusy(true); setErr(''); setNotice('')
    try { const j = await call(pass, { method: 'POST', body }); setData(j); if (message) setNotice(message) } catch (e) { setErr(e.message) }
    setBusy(false)
  }

  const articles = data ? data.articles : []
  const waiting = articles.filter(a => a.status === 'selected')
  const shown = useMemo(() => articles.filter(a =>
    (filter === 'all' || a.status === filter) && (!q || a.title.toLowerCase().includes(q.toLowerCase()))), [articles, filter, q])
  const groups = useMemo(() => {
    const g = {}
    for (const a of shown) (g[a.category] = g[a.category] || []).push(a)
    return Object.entries(g)
  }, [shown])

  const page = { minHeight: '100vh', background: BG, padding: '28px 18px 60px', boxSizing: 'border-box' }
  const wrap = { maxWidth: 980, margin: '0 auto' }

  if (!entered) {
    return (
      <div style={page}><div style={{ ...wrap, maxWidth: 420, paddingTop: 80 }}>
        <Card>
          <div style={{ fontFamily: SERIF, fontSize: 24, color: NAVY, marginBottom: 6 }}>Bueno Newsletter</div>
          <div style={{ fontFamily: SANS, fontSize: 14, color: MUTED, marginBottom: 16 }}>Enter the internal password to open the dashboard.</div>
          <form onSubmit={e => { e.preventDefault(); load(pass) }}>
            <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Password" autoFocus
              style={{ width: '100%', boxSizing: 'border-box', fontFamily: SANS, fontSize: 15, padding: '11px 12px', border: `1px solid ${RULE}`, borderRadius: 8, marginBottom: 12 }} />
            <button type="submit" disabled={busy || !pass} style={{ ...btn('primary'), width: '100%', minHeight: 44 }}>{busy ? 'Opening…' : 'Open the dashboard'}</button>
          </form>
          {err && <div style={{ color: '#9b2c2c', fontFamily: SANS, fontSize: 13, marginTop: 10 }}>{err}</div>}
        </Card>
      </div></div>
    )
  }

  const rec = (data.settings && data.settings.recipients) || {}
  const launched = !!rec.launched
  const tabs = [['editions', 'Editions'], ['articles', 'Articles'], ['legacy', 'October plan (paused)']]

  return (
    <div style={page}><div style={wrap}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
        <div>
          <div style={{ fontFamily: SANS, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: GOLD, fontWeight: 700 }}>Internal</div>
          <h1 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 30, color: NAVY, margin: '4px 0 6px' }}>Bueno Newsletter</h1>
          <div style={{ fontFamily: SANS, fontSize: 14, color: BODY }}>
            Next edition: <b>{fmt(data.next_send)}</b>, every two weeks, in English, Norwegian and Swedish.
          </div>
        </div>
        <Card style={{ padding: '12px 16px' }}>
          <div style={{ fontFamily: SANS, fontSize: 12.5, color: MUTED, marginBottom: 6 }}>Each edition is emailed to</div>
          <div style={{ fontFamily: SANS, fontSize: 14, color: NAVY, fontWeight: 600, marginBottom: 8 }}>{launched ? 'Pratik and John' : 'Pratik only (test mode)'}</div>
          <button style={btn(launched ? 'ghost' : 'primary')} disabled={busy}
            onClick={() => act({ op: 'set-launch', launched: !launched }, launched ? 'Back to test mode. Editions go to Pratik only.' : 'Launched. From the next edition, John gets every newsletter too.')}>
            {launched ? 'Back to Pratik only' : 'Launch: add John'}
          </button>
        </Card>
      </div>

      {notice && <div style={{ background: '#E8F3E8', color: '#2e7d32', fontFamily: SANS, fontSize: 13.5, padding: '10px 14px', borderRadius: 8, marginBottom: 12 }}>{notice}</div>}
      {err && <div style={{ background: '#FAEDED', color: '#9b2c2c', fontFamily: SANS, fontSize: 13.5, padding: '10px 14px', borderRadius: 8, marginBottom: 12 }}>{err}</div>}

      {waiting.length > 0 && (
        <Card style={{ borderColor: GOLD, marginBottom: 18 }}>
          <div style={{ fontFamily: SERIF, fontSize: 19, color: NAVY, marginBottom: 4 }}>Waiting for your approval</div>
          <div style={{ fontFamily: SANS, fontSize: 13.5, color: MUTED, marginBottom: 12 }}>These articles were turned into a guide for an edition. Approve one to mark it as used for good, or reject it to free it up again.</div>
          {waiting.map(a => {
            const ed = (data.editions || []).find(e => e.article_slug === a.slug)
            return (
              <div key={a.slug} style={{ borderTop: `1px solid ${RULE}`, padding: '12px 0', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ minWidth: 0, flex: '1 1 380px' }}>
                  <div style={{ fontFamily: SANS, fontSize: 14.5, color: NAVY, fontWeight: 600 }}>{a.title}</div>
                  <div style={{ fontFamily: SANS, fontSize: 12.5, color: MUTED, margin: '3px 0 6px' }}>{a.used_in}{a.note ? ` · ${a.note}` : ''}</div>
                  {ed && LANGS.map(([k, n]) => (ed.guide_urls || {})[k] && <A key={k} href={ed.guide_urls[k]}>Guide {n}</A>)}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={btn('danger')} disabled={busy} onClick={() => act({ op: 'reject-article', slug: a.slug }, `${a.title} is free to use again.`)}>Reject</button>
                  <button style={btn('primary')} disabled={busy} onClick={() => act({ op: 'approve-article', slug: a.slug }, `Approved. ${a.title} is now the guide for that edition.`)}>Approve</button>
                </div>
              </div>
            )
          })}
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 20 }}>
        <Stat n={data.counts.available} label="Articles still free to use" active={tab === 'articles' && filter === 'available'} onClick={() => { setTab('articles'); setFilter('available') }} />
        <Stat n={data.counts.selected} label="Picked, waiting for you" active={tab === 'articles' && filter === 'selected'} onClick={() => { setTab('articles'); setFilter('selected') }} />
        <Stat n={data.counts.approved} label="Approved" active={tab === 'articles' && filter === 'approved'} onClick={() => { setTab('articles'); setFilter('approved') }} />
        <Stat n={data.counts.used} label="Already used" active={tab === 'articles' && filter === 'used'} onClick={() => { setTab('articles'); setFilter('used') }} />
        <Stat n={(data.editions || []).length} label="Editions so far" active={tab === 'editions'} onClick={() => setTab('editions')} />
      </div>

      <div role="tablist" style={{ display: 'flex', gap: 6, borderBottom: `1px solid ${RULE}`, marginBottom: 16, flexWrap: 'wrap' }}>
        {tabs.map(([k, n]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            style={{ fontFamily: SANS, fontSize: 14, padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer', color: tab === k ? NAVY : MUTED, fontWeight: tab === k ? 700 : 400, borderBottom: `2px solid ${tab === k ? NAVY : 'transparent'}`, marginBottom: -1 }}>{n}</button>
        ))}
      </div>

      {tab === 'editions' && (
        (data.editions || []).length
          ? data.editions.map(e => <Edition key={e.edition_key} e={e} pass={pass} busy={busy} onApprove={k => act({ op: 'approve-edition', key: k }, 'Edition approved.')} />)
          : <Card><div style={{ fontFamily: SANS, color: MUTED }}>No editions yet.</div></Card>
      )}

      {tab === 'articles' && (
        <div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14, alignItems: 'center' }}>
            {['all', 'available', 'selected', 'approved', 'used'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ ...btn(filter === f ? 'primary' : 'ghost'), minHeight: 32, padding: '6px 13px' }}>
                {f === 'all' ? `All (${data.counts.all})` : `${A_STATUS[f].label} (${data.counts[f]})`}
              </button>
            ))}
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search articles" aria-label="Search articles"
              style={{ flex: '1 1 200px', fontFamily: SANS, fontSize: 14, padding: '8px 12px', border: `1px solid ${RULE}`, borderRadius: 20 }} />
          </div>
          {groups.map(([cat, list]) => (
            <Card key={cat} style={{ marginBottom: 14, padding: '6px 20px' }}>
              <div style={{ fontFamily: SERIF, fontSize: 17, color: NAVY, padding: '12px 0 6px' }}>{cat}</div>
              {list.map(a => (
                <div key={a.slug} style={{ borderTop: `1px solid ${RULE}`, padding: '11px 0', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: '1 1 380px', minWidth: 0 }}>
                    <div style={{ fontFamily: SANS, fontSize: 14, color: NAVY }}>{a.title}</div>
                    <div style={{ fontFamily: SANS, fontSize: 12, color: MUTED, margin: '3px 0 4px' }}>
                      {a.used_in || (a.has_text ? 'Text copy in the repo, ready to build a guide from.' : 'No text copy in the repo yet.')}
                    </div>
                    <div>{LINKS.map(([k, n]) => (a.links || {})[k] && <A key={k} href={a.links[k]}>{n}</A>)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Chip s={A_STATUS[a.status] || A_STATUS.available} />
                    {a.status === 'available' && <button style={btn()} disabled={busy} onClick={() => act({ op: 'pick-article', slug: a.slug, date: data.next_send }, `${a.title} is picked for the ${fmt(data.next_send)} edition.`)}>Use next</button>}
                    {a.status === 'available' && <button style={btn()} disabled={busy} onClick={() => act({ op: 'mark-used', slug: a.slug }, `${a.title} is marked as used.`)}>Mark used</button>}
                    {a.status !== 'available' && <button style={btn()} disabled={busy} onClick={() => act({ op: 'make-available', slug: a.slug }, `${a.title} is free to use again.`)}>Make available</button>}
                  </div>
                </div>
              ))}
            </Card>
          ))}
          {!groups.length && <Card><div style={{ fontFamily: SANS, color: MUTED }}>No articles match.</div></Card>}
        </div>
      )}

      {tab === 'legacy' && <div style={{ margin: '0 -18px' }}><LegacyDeck /></div>}
    </div></div>
  )
}
