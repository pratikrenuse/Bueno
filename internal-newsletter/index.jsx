import { useEffect, useState, useCallback, useMemo } from 'react'
import { toHtml, toText, current } from '../api/_newsletter_render.js'

// Bueno newsletter review deck. Route: /internal-newsletter
// One issue every two weeks, in English, Norwegian and Swedish. John reads each issue
// exactly as readers will see it, edits anything in place, and approves. Approving emails
// Pratik the paste-ready text so he can schedule it in beehiiv.
// Same password as the other internal decks (INTERNAL_PASSCODE, studio_pass session key).
// No meta.js on purpose: never gets a public homepage card. Shares nothing with
// /internal-linkedin.

const NAVY = '#010221', GOLD = '#C9A96E', LBLUE = '#CBEFFF', ACCENT = '#5B7FCC'
const OFF = '#F8F7F4', RULE = '#E3E0DA', BODY = '#2B2E45'
const SANS = "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
const SERIF = "'FS Siena', Georgia, serif"
const LANGS = [['en', 'English'], ['no', 'Norsk'], ['sv', 'Svenska']]

const STATUS = {
  pending: { label: 'Waiting for review', bg: '#FBF3DF', fg: '#7a611c' },
  approved: { label: 'Approved, with Pratik', bg: '#E8F3E8', fg: '#2e7d32' },
  scheduled: { label: 'Scheduled in beehiiv', bg: '#E6EEFB', fg: '#2b4f9e' },
  rejected: { label: 'Sent back', bg: '#FAEDED', fg: '#b02a2a' },
}

const fmt = (iso, opts = { weekday: 'short', day: 'numeric', month: 'short' }) =>
  iso ? new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { ...opts, timeZone: 'UTC' }) : ''

async function call(pass, action, { method = 'GET', body, query = '' } = {}) {
  const r = await fetch(`/api/newsletter?action=${action}${query}`, {
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
  fontFamily: SANS, fontSize: 13, padding: '9px 16px', borderRadius: 22, cursor: 'pointer', minHeight: 38,
  border: kind === 'primary' ? `1px solid ${NAVY}` : kind === 'danger' ? '1px solid #d9a3a3' : `1px solid ${RULE}`,
  background: kind === 'primary' ? NAVY : '#fff', color: kind === 'primary' ? '#fff' : kind === 'danger' ? '#9b2c2c' : NAVY,
})

const lines = (arr) => (arr || []).join('\n\n')
const unlines = (s) => String(s || '').split(/\n\s*\n/).map(x => x.trim()).filter(Boolean)

function Field({ label, value, onChange, rows = 1, hint }) {
  const style = { width: '100%', fontFamily: SANS, fontSize: 14, lineHeight: 1.5, padding: '9px 11px', border: `1px solid ${RULE}`, borderRadius: 8, boxSizing: 'border-box', background: '#fff', color: NAVY }
  return (
    <label style={{ display: 'block', marginBottom: 14 }}>
      <span style={{ display: 'block', fontFamily: SANS, fontSize: 12, fontWeight: 600, color: NAVY, marginBottom: 5 }}>{label}</span>
      {rows > 1
        ? <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)} style={{ ...style, resize: 'vertical' }} />
        : <input value={value} onChange={e => onChange(e.target.value)} style={style} />}
      {hint && <span style={{ display: 'block', fontFamily: SANS, fontSize: 11, color: '#777', marginTop: 4 }}>{hint}</span>}
    </label>
  )
}

function Editor({ value, onSave, onCancel, saving }) {
  const [c, setC] = useState(() => JSON.parse(JSON.stringify(value)))
  const set = (path, v) => setC(prev => {
    const next = JSON.parse(JSON.stringify(prev)); let o = next
    for (let i = 0; i < path.length - 1; i++) o = o[path[i]]
    o[path[path.length - 1]] = v; return next
  })
  const H = ({ children }) => <h4 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 17, color: NAVY, margin: '26px 0 12px', borderTop: `1px solid ${RULE}`, paddingTop: 18 }}>{children}</h4>
  return (
    <div style={{ background: '#fff', border: `1px solid ${RULE}`, borderRadius: 12, padding: '6px 22px 22px' }}>
      <H>Email</H>
      <Field label="Subject line" value={c.subject} onChange={v => set(['subject'], v)} />
      <Field label="Preview text" value={c.preview} onChange={v => set(['preview'], v)} />
      <Field label="Welcome" rows={4} value={lines(c.intro)} onChange={v => set(['intro'], unlines(v))} hint="Leave a blank line between paragraphs." />
      <H>News</H>
      <Field label="Section heading" value={c.news_heading} onChange={v => set(['news_heading'], v)} />
      <Field label="Line under the heading" value={c.news_kicker} onChange={v => set(['news_kicker'], v)} />
      {c.news.map((n, i) => (
        <div key={i} style={{ background: OFF, borderRadius: 10, padding: '12px 14px 2px', marginBottom: 12 }}>
          <Field label={`Update ${i + 1} headline`} value={n.title} onChange={v => set(['news', i, 'title'], v)} />
          <Field label={`Update ${i + 1} text`} rows={3} value={n.body} onChange={v => set(['news', i, 'body'], v)} />
        </div>
      ))}
      <H>Bueno Tax</H>
      <Field label="Title" value={c.tax.title} onChange={v => set(['tax', 'title'], v)} />
      <Field label="Text" rows={6} value={lines(c.tax.paras)} onChange={v => set(['tax', 'paras'], unlines(v))} />
      <H>Guide</H>
      <Field label="Guide title" value={c.guide.title} onChange={v => set(['guide', 'title'], v)} />
      <Field label="Introduction" rows={4} value={c.guide.intro} onChange={v => set(['guide', 'intro'], v)} />
      <Field label="Key topics" rows={6} value={c.guide.topics.join('\n')} onChange={v => set(['guide', 'topics'], v.split('\n').map(x => x.trim()).filter(Boolean))} hint="One topic per line." />
      <Field label="Link to the guide PDF" value={c.guide.url} onChange={v => set(['guide', 'url'], v)} />
      <H>Region spotlight</H>
      <Field label="Title" value={c.region.title} onChange={v => set(['region', 'title'], v)} />
      <Field label="Text" rows={6} value={lines(c.region.paras)} onChange={v => set(['region', 'paras'], unlines(v))} />
      <Field label="Line about Bueno Property" value={c.region.note} onChange={v => set(['region', 'note'], v)} />
      <H>Reader's question</H>
      <Field label="Question" rows={2} value={c.question.q} onChange={v => set(['question', 'q'], v)} />
      <Field label="Answer" rows={12} value={lines(c.question.paras)} onChange={v => set(['question', 'paras'], unlines(v))} />
      <H>Survey (optional)</H>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: SANS, fontSize: 14, color: NAVY, marginBottom: 12 }}>
        <input type="checkbox" checked={!!c.survey.enabled} onChange={e => set(['survey', 'enabled'], e.target.checked)} /> Include a short survey in this issue
      </label>
      {c.survey.enabled && <>
        <Field label="Survey question" value={c.survey.question} onChange={v => set(['survey', 'question'], v)} />
        <Field label="Answer options" rows={4} value={(c.survey.options || []).join('\n')} onChange={v => set(['survey', 'options'], v.split('\n').map(x => x.trim()).filter(Boolean))} hint="One option per line. Set the poll up in beehiiv with the same options." />
      </>}
      <H>Get Bueno and sign-off</H>
      <Field label="Title" value={c.join.title} onChange={v => set(['join', 'title'], v)} />
      <Field label="Text" rows={5} value={c.join.body} onChange={v => set(['join', 'body'], v)} />
      <Field label="Last line" value={c.join.line} onChange={v => set(['join', 'line'], v)} />
      <Field label="Sign-off" rows={3} value={c.signoff.join('\n')} onChange={v => set(['signoff'], v.split('\n').map(x => x.trim()).filter(Boolean))} hint="One line each." />
      <div style={{ display: 'flex', gap: 10, marginTop: 18, position: 'sticky', bottom: 0, background: '#fff', padding: '12px 0' }}>
        <button style={btn('primary')} disabled={saving} onClick={() => onSave(c)}>{saving ? 'Saving...' : 'Save changes'}</button>
        <button style={btn()} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

export default function InternalNewsletter() {
  const [pass, setPass] = useState(() => { try { return sessionStorage.getItem('studio_pass') || '' } catch { return '' } })
  const [entered, setEntered] = useState(false)
  const [issues, setIssues] = useState([])
  const [live, setLive] = useState(false)
  const [sel, setSel] = useState(() => new URLSearchParams(window.location.search).get('issue') || '')
  const [lang, setLang] = useState('en')
  const [mode, setMode] = useState('view')       // view | edit | text
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [notice, setNotice] = useState('')
  const [rejecting, setRejecting] = useState(null)
  const [panel, setPanel] = useState(null)       // { kind: 'health'|'alert', data }
  const [copied, setCopied] = useState(false)

  const load = useCallback(async (p) => {
    setBusy(true); setErr('')
    try {
      let j = await call(p, 'issues')
      // First visit after a deploy: load the written issues without anyone pressing Sync.
      if (!j.issues.length) { await call(p, 'seed', { method: 'POST', body: {} }); j = await call(p, 'issues') }
      try { sessionStorage.setItem('studio_pass', p) } catch {}
      setEntered(true); setIssues(j.issues); setLive(!!j.emails_live)
      setSel(s => s && j.issues.some(i => i.issue_key === s) ? s : ((j.issues.find(i => i.status === 'pending') || j.issues[0] || {}).issue_key || ''))
    } catch (e) {
      if (e.status === 401) { setEntered(false); setErr('That password did not work.') } else setErr(e.message)
    }
    setBusy(false)
  }, [])

  useEffect(() => { if (pass) load(pass) }, []) // eslint-disable-line

  const issue = useMemo(() => issues.find(i => i.issue_key === sel), [issues, sel])
  const c = issue ? current(issue, lang) : null
  const edited = !!(issue && issue.edited && issue.edited[lang])
  const placeholder = !!(issue && issue.news_status === 'to_refresh')

  const replace = (row) => setIssues(list => list.map(i => i.issue_key === row.issue_key ? row : i))

  async function decide(action, extra = {}) {
    if (!issue) return
    setBusy(true); setErr(''); setNotice('')
    try {
      const j = await call(pass, 'decide', { method: 'POST', body: { key: issue.issue_key, action, ...extra } })
      if (j.issue) replace(j.issue)
      if (action === 'approved' || action === 'resend') {
        if (j.email?.ok && !j.email?.skipped) setNotice('Approved. Pratik has been emailed the final text in all three languages.')
        else if (j.email?.held) setNotice('Approved. Emails are switched off for now, so nothing was sent. The text Pratik will receive is under "Paste-ready text".')
        else if (j.email?.skipped) setNotice('Approved. Pratik already had this issue, so it was not emailed again.')
        else setErr(`Approved, but the email to Pratik failed: ${j.email?.error || 'unknown error'}`)
      }
      if (action === 'edit') { setMode('view'); setNotice(`Your ${LANGS.find(l => l[0] === extra.lang)[1]} changes are saved.`) }
      if (action === 'rejected') setRejecting(null)
    } catch (e) { setErr(e.message) }
    setBusy(false)
  }

  async function sync() {
    setBusy(true); setErr(''); setNotice('')
    try {
      const j = await call(pass, 'seed', { method: 'POST', body: {} })
      setNotice(`Synced. Added ${j.inserted.length}, refreshed ${j.refreshed.length}, left ${j.kept.length} untouched because they have been worked on.`)
      await load(pass)
    } catch (e) { setErr(e.message) }
    setBusy(false)
  }

  async function health() {
    setBusy(true); setErr('')
    try { setPanel({ kind: 'health', data: await call(pass, 'health') }) } catch (e) { setErr(e.message) }
    setBusy(false)
  }

  async function alertPreview() {
    if (!issue) return
    setBusy(true); setErr('')
    try { setPanel({ kind: 'alert', data: await call(pass, 'alert', { query: `&key=${issue.issue_key}&dry=1` }) }) } catch (e) { setErr(e.message) }
    setBusy(false)
  }

  async function copyText() {
    try { await navigator.clipboard.writeText(toText(c)); setCopied(true); setTimeout(() => setCopied(false), 1800) }
    catch { setErr('Your browser blocked copying. Select the text below and copy it by hand.') }
  }

  // Keyboard: J/K move between issues, 1/2/3 switch language, A approve, E edit.
  useEffect(() => {
    const onKey = (e) => {
      if (!entered || mode === 'edit' || rejecting || /input|textarea/i.test(e.target.tagName)) return
      const idx = issues.findIndex(i => i.issue_key === sel)
      if (e.key === 'j' && idx < issues.length - 1) setSel(issues[idx + 1].issue_key)
      if (e.key === 'k' && idx > 0) setSel(issues[idx - 1].issue_key)
      if (['1', '2', '3'].includes(e.key)) setLang(LANGS[+e.key - 1][0])
      if (e.key === 'e') setMode('edit')
      if (e.key === 'a' && issue?.status === 'pending' && !placeholder) decide('approved')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  useEffect(() => {
    if (!sel) return
    const u = new URL(window.location.href); u.searchParams.set('issue', sel)
    window.history.replaceState(null, '', u.toString())
  }, [sel])

  // ---------------------------------------------------------------------------------------
  if (!entered) {
    return (
      <div style={{ minHeight: '100vh', background: OFF, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <form onSubmit={e => { e.preventDefault(); load(pass) }} style={{ background: '#fff', border: `1px solid ${RULE}`, borderRadius: 14, padding: 32, width: '100%', maxWidth: 380 }}>
          <div style={{ fontFamily: SERIF, fontSize: 24, color: NAVY, marginBottom: 6 }}>Bueno Newsletter</div>
          <p style={{ fontFamily: SANS, fontSize: 14, color: BODY, margin: '0 0 18px' }}>Enter the team password to review the upcoming issues.</p>
          <input type="password" autoFocus value={pass} onChange={e => setPass(e.target.value)} placeholder="Password"
            style={{ width: '100%', boxSizing: 'border-box', padding: '11px 12px', fontSize: 15, border: `1px solid ${RULE}`, borderRadius: 8, marginBottom: 12 }} />
          <button type="submit" style={{ ...btn('primary'), width: '100%' }} disabled={busy}>{busy ? 'Checking...' : 'Open the newsletter tool'}</button>
          {err && <p style={{ color: '#b02a2a', fontFamily: SANS, fontSize: 13, marginTop: 12 }}>{err}</p>}
        </form>
      </div>
    )
  }

  const pendingCount = issues.filter(i => i.status === 'pending').length
  const next = issues.find(i => i.status !== 'scheduled' && i.send_date >= new Date().toISOString().slice(0, 10))

  return (
    <div style={{ minHeight: '100vh', background: OFF, fontFamily: SANS, color: NAVY }}>
      {/* Hero strip: the one thing that matters first. */}
      <div style={{ background: NAVY, color: '#fff', padding: '22px 20px' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '.28em', textTransform: 'uppercase', color: GOLD, marginBottom: 6 }}>Bueno Newsletter</div>
            <div style={{ fontFamily: SERIF, fontSize: 24 }}>
              {pendingCount ? `${pendingCount} issue${pendingCount === 1 ? '' : 's'} waiting for review` : 'Everything is reviewed'}
            </div>
            {next && <div style={{ fontSize: 13, color: LBLUE, marginTop: 4 }}>Next to go out: Newsletter {next.number} on {fmt(next.send_date, { weekday: 'long', day: 'numeric', month: 'long' })}</div>}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button style={{ ...btn(), background: 'transparent', color: '#fff', borderColor: '#3a3d5c' }} onClick={sync} disabled={busy}>Sync issues</button>
            <button style={{ ...btn(), background: 'transparent', color: '#fff', borderColor: '#3a3d5c' }} onClick={health} disabled={busy}>Run health check</button>
          </div>
        </div>
      </div>

      {!live && (
        <div style={{ background: '#FBF3DF', color: '#7a611c', fontSize: 13, padding: '9px 20px', textAlign: 'center' }}>
          Emails are switched off while the tool is being set up. Approving works and is saved, but nothing is emailed to anyone.
        </div>
      )}

      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '20px 16px 60px', display: 'grid', gridTemplateColumns: 'minmax(0,280px) minmax(0,1fr)', gap: 20 }} className="nl-grid">
        <style>{`@media (max-width: 820px){.nl-grid{grid-template-columns:1fr !important}}`}</style>

        {/* Issue list */}
        <div>
          {issues.length === 0 && (
            <div style={{ background: '#fff', border: `1px solid ${RULE}`, borderRadius: 12, padding: 18, fontSize: 14 }}>
              No issues stored yet. Press <b>Sync issues</b> to load the written issues.
            </div>
          )}
          {issues.map(i => {
            const s = STATUS[i.status] || STATUS.pending
            const on = i.issue_key === sel
            return (
              <button key={i.issue_key} onClick={() => { setSel(i.issue_key); setMode('view'); setRejecting(null) }}
                style={{ display: 'block', width: '100%', textAlign: 'left', background: '#fff', border: on ? `2px solid ${NAVY}` : `1px solid ${RULE}`, borderRadius: 12, padding: on ? '13px 15px' : '14px 16px', marginBottom: 10, cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: SERIF, fontSize: 18, color: NAVY }}>No. {i.number}</span>
                  <span style={{ fontSize: 12, color: '#666' }}>{fmt(i.send_date)}</span>
                </div>
                <div style={{ fontSize: 12.5, color: BODY, margin: '6px 0 8px', lineHeight: 1.4 }}>{i.content?.en?.guide?.title}</div>
                <span style={{ display: 'inline-block', fontSize: 11, padding: '3px 9px', borderRadius: 10, background: s.bg, color: s.fg }}>{s.label}</span>
                {i.news_status === 'to_refresh' && <span style={{ display: 'inline-block', fontSize: 11, padding: '3px 9px', borderRadius: 10, background: LBLUE, color: NAVY, marginLeft: 6 }}>News on {fmt(i.alert_date)}</span>}
              </button>
            )
          })}
          <p style={{ fontSize: 12, color: '#777', lineHeight: 1.5, marginTop: 14 }}>Keys: J and K move between issues, 1 2 3 switch language, E edits, A approves.</p>
        </div>

        {/* Selected issue */}
        <div>
          {err && <div style={{ background: '#FAEDED', color: '#9b2c2c', border: '1px solid #e9c2c2', borderRadius: 10, padding: '11px 14px', fontSize: 14, marginBottom: 14 }}>{err}</div>}
          {notice && <div style={{ background: '#E8F3E8', color: '#245c27', border: '1px solid #c6e0c7', borderRadius: 10, padding: '11px 14px', fontSize: 14, marginBottom: 14 }}>{notice}</div>}

          {panel && (
            <div style={{ background: '#fff', border: `1px solid ${RULE}`, borderRadius: 12, padding: 18, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <b style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 500 }}>{panel.kind === 'health' ? 'Health check' : 'The review email John and Pratik will receive'}</b>
                <button style={btn()} onClick={() => setPanel(null)}>Close</button>
              </div>
              {panel.kind === 'health' && panel.data.checks.map(ch => (
                <div key={ch.name} style={{ display: 'flex', gap: 10, fontSize: 13.5, padding: '7px 0', borderTop: `1px solid ${RULE}` }}>
                  <span style={{ color: ch.ok ? '#2e7d32' : '#b02a2a', fontWeight: 700, width: 18 }}>{ch.ok ? '✓' : '!'}</span>
                  <span style={{ flex: '0 0 230px' }}>{ch.name}</span><span style={{ color: '#555' }}>{ch.detail}</span>
                </div>
              ))}
              {panel.kind === 'alert' && <>
                <p style={{ fontSize: 13, margin: '0 0 8px' }}><b>Subject:</b> {panel.data.subject}</p>
                <div style={{ border: `1px solid ${RULE}`, borderRadius: 10, overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: panel.data.html || '' }} />
              </>}
            </div>
          )}

          {issue && c && <>
            <div style={{ background: '#fff', border: `1px solid ${RULE}`, borderRadius: 12, padding: '16px 18px', marginBottom: 14 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: SERIF, fontSize: 22 }}>Newsletter {issue.number}</div>
                  <div style={{ fontSize: 13, color: '#555', marginTop: 2 }}>
                    Goes out {fmt(issue.send_date, { weekday: 'long', day: 'numeric', month: 'long' })}. Review email to John and Pratik on {fmt(issue.alert_date, { weekday: 'long', day: 'numeric', month: 'long' })}.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {issue.status === 'pending' && <>
                    <button style={btn('primary')} disabled={busy || placeholder} title={placeholder ? 'The news for this issue is researched on its alert day.' : ''} onClick={() => decide('approved')}>Approve all three languages</button>
                    <button style={btn('danger')} disabled={busy} onClick={() => setRejecting({ note: '' })}>Send back</button>
                  </>}
                  {issue.status === 'approved' && <>
                    <button style={btn('primary')} disabled={busy} onClick={() => decide('scheduled')}>Mark as scheduled in beehiiv</button>
                    <button style={btn()} disabled={busy} onClick={() => decide('resend')}>Email Pratik again</button>
                  </>}
                  {issue.status !== 'pending' && <button style={btn()} disabled={busy} onClick={() => decide('pending')}>Undo</button>}
                </div>
              </div>
              {placeholder && <p style={{ fontSize: 13, background: LBLUE, borderRadius: 8, padding: '9px 12px', margin: '12px 0 0' }}>The three news updates for this issue are researched on {fmt(issue.alert_date, { weekday: 'long', day: 'numeric', month: 'long' })}, so they are current when it goes out. Everything else is ready to read and edit now.</p>}
              {issue.status === 'rejected' && issue.reject_note && <p style={{ fontSize: 13, color: '#9b2c2c', margin: '12px 0 0' }}>Sent back: {issue.reject_note}</p>}
              {issue.last_email && <p style={{ fontSize: 12, color: '#777', margin: '10px 0 0' }}>Last email: {issue.last_email.kind} at {new Date(issue.last_email.at).toLocaleString('en-GB')}, {issue.last_email.ok ? 'sent' : issue.last_email.held ? 'held because emails are off' : `failed (${issue.last_email.error})`}.</p>}
              {rejecting && (
                <div style={{ marginTop: 14 }}>
                  <Field label="What should change?" rows={3} value={rejecting.note} onChange={v => setRejecting({ note: v })} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={btn('danger')} disabled={busy} onClick={() => decide('rejected', { note: rejecting.note })}>Send back with this note</button>
                    <button style={btn()} onClick={() => setRejecting(null)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 12 }}>
              {LANGS.map(([k, label]) => (
                <button key={k} onClick={() => { setLang(k); if (mode === 'edit') setMode('view') }}
                  style={{ ...btn(lang === k ? 'primary' : 'ghost'), padding: '8px 16px' }}>
                  {label}{issue.edited && issue.edited[k] ? ' (edited)' : ''}
                </button>
              ))}
              <span style={{ flex: 1 }} />
              <button style={btn(mode === 'view' ? 'primary' : 'ghost')} onClick={() => setMode('view')}>Preview</button>
              <button style={btn(mode === 'edit' ? 'primary' : 'ghost')} onClick={() => setMode('edit')} disabled={issue.status === 'scheduled'}>Edit</button>
              <button style={btn(mode === 'text' ? 'primary' : 'ghost')} onClick={() => setMode('text')}>Paste-ready text</button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 13, marginBottom: 12, alignItems: 'center' }}>
              {c.guide.url && <a href={c.guide.url} target="_blank" rel="noreferrer" style={{ color: ACCENT }}>Open this issue's guide PDF</a>}
              <button style={{ ...btn(), padding: '6px 12px', minHeight: 32, fontSize: 12 }} onClick={alertPreview}>See the review email</button>
              {edited && <button style={{ ...btn(), padding: '6px 12px', minHeight: 32, fontSize: 12 }} onClick={() => decide('revert', { lang })}>Undo my edits in this language</button>}
            </div>

            {mode === 'edit' && <Editor key={`${issue.issue_key}-${lang}-${issue.updated_at}`} value={c} saving={busy} onCancel={() => setMode('view')} onSave={v => decide('edit', { lang, content: v })} />}

            {mode === 'text' && (
              <div style={{ background: '#fff', border: `1px solid ${RULE}`, borderRadius: 12, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: '#555' }}>This is exactly what Pratik receives for beehiiv.</span>
                  <button style={btn('primary')} onClick={copyText}>{copied ? 'Copied' : 'Copy text'}</button>
                </div>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: SANS, fontSize: 14, lineHeight: 1.55, color: BODY, margin: 0 }}>{toText(c)}</pre>
              </div>
            )}

            {mode === 'view' && (
              <div style={{ background: '#EDEBE6', borderRadius: 12, padding: '18px 10px' }}>
                <div style={{ maxWidth: 640, margin: '0 auto 10px', fontSize: 13, color: '#555', padding: '0 6px' }}>
                  <b style={{ color: NAVY }}>{c.subject}</b>{c.preview ? `  ·  ${c.preview}` : ''}
                </div>
                <div dangerouslySetInnerHTML={{ __html: toHtml(c) }} />
              </div>
            )}

            <details style={{ marginTop: 16, fontSize: 13 }}>
              <summary style={{ cursor: 'pointer', color: '#555' }}>Where the figures come from</summary>
              <ul style={{ lineHeight: 1.7 }}>
                {Object.entries(issue.sources || {}).flatMap(([k, arr]) => (arr || []).map(u => (
                  <li key={k + u}>{k}: {/^https?:/.test(u) ? <a href={u} target="_blank" rel="noreferrer" style={{ color: ACCENT }}>{u}</a> : u}</li>
                )))}
              </ul>
            </details>
          </>}
        </div>
      </div>
    </div>
  )
}
