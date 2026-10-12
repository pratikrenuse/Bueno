import { useState } from 'react'

// The dashboard on /internal-poornima: what went to Poornima, what is waiting and when it
// will go, what failed, what is parked, and the totals. Everything comes from the
// `dashboard` block that /api/fb?action=posts returns, so it is the same data the daily
// email is built from. Not a route of its own: the folder's index.jsx renders it.

const LINK = { bueno: 'getbueno.com', spain247: '24/7 Spain' }

const day = (iso) => {
  if (!iso) return ''
  try { return new Date(`${iso}T00:00:00Z`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }) }
  catch { return iso }
}
const when = (iso) => {
  if (!iso) return ''
  try { return new Date(iso).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }
  catch { return iso }
}

function Groups({ groups }) {
  if (!groups || !groups.length) return null
  return (
    <details className="fbp-d-groups">
      <summary>{groups.reduce((n, l) => n + l.groups.length, 0)} groups</summary>
      {groups.map(l => (
        <div key={l.lang} className="fbp-d-glang">
          <b>{l.language}, Account {l.account}</b>
          {l.groups.length
            ? l.groups.map(g => <a key={g.url} href={g.url} target="_blank" rel="noopener noreferrer">{g.name}</a>)
            : <span>No group that day</span>}
        </div>
      ))}
    </details>
  )
}

export default function Dashboard({ dash, onReview }) {
  const [allUpcoming, setAllUpcoming] = useState(false)
  if (!dash) return <p className="fbp-wide">Loading the dashboard...</p>

  const t = dash.totals
  const up = allUpcoming ? dash.upcoming : dash.upcoming.slice(0, 10)
  const todaySent = dash.sent.find(s => String(s.sent_at).slice(0, 10) === dash.now.slice(0, 10))

  return (
    <div className="fbp-d">
      <section className={`fbp-d-today ${todaySent ? 'ok' : t.queued ? 'wait' : 'warn'}`}>
        {todaySent
          ? <p><b>Today's email went</b> at {when(todaySent.sent_at)}: {todaySent.hook}</p>
          : t.queued
            ? (dash.next_send_date === dash.now.slice(0, 10) && dash.morning_passed
              ? <p><b>Today's email goes out automatically between 17:30 and 18:30 India time.</b> {dash.upcoming[0].hook}</p>
              : <p><b>Next email: {day(dash.next_send_date)}, goes out automatically around 07:00 India time.</b> {dash.upcoming[0].hook}</p>)
            : <p><b>Nothing is approved, so nothing will go out.</b> Approve posts to fill the queue.</p>}
      </section>

      {t.queued > 0 && t.queued < 5 && (
        <section className="fbp-d-today warn">
          <p><b>Only {t.queued} approved {t.queued === 1 ? 'post is' : 'posts are'} left.</b> Approve more so the daily posts keep going. You also get an email reminder after each send while fewer than 5 are left.</p>
          <button className="fbp-d-btn" onClick={() => onReview('pending')}>Review posts</button>
        </section>
      )}

      <section className="fbp-d-tiles">
        <div className="fbp-d-tile"><span>Sent to Poornima</span><b>{t.sent}</b></div>
        <div className="fbp-d-tile"><span>Waiting in the queue</span><b>{t.queued}</b></div>
        <button className="fbp-d-tile" onClick={() => onReview('pending')}><span>To review</span><b>{t.to_review}</b></button>
        <button className="fbp-d-tile" onClick={() => onReview('posted')}><span>Marked live</span><b>{t.live}</b></button>
        <button className="fbp-d-tile" onClick={() => onReview('rejected')}><span>Parked</span><b>{t.parked}</b></button>
        <div className={`fbp-d-tile${t.failed ? ' bad' : ''}`}><span>Failed sends</span><b>{t.failed}</b></div>
      </section>

      <section className="fbp-d-facts">
        <p><b>{t.group_posts_sent}</b> group posts sent so far, across 7 accounts and 7 languages.</p>
        <p><b>{t.group_posts_queued}</b> more group posts are lined up in the queue.</p>
        <p>The queue lasts until <b>{dash.runs_until ? day(dash.runs_until) : 'nothing queued'}</b>.</p>
        <p>
          Sent so far: <b>{dash.split.sent.bueno || 0}</b> to getbueno.com and <b>{dash.split.sent.spain247 || 0}</b> to 24/7 Spain.
          Waiting: <b>{dash.split.queued.bueno || 0}</b> and <b>{dash.split.queued.spain247 || 0}</b>.
        </p>
        <p>Daily posting started on <b>{day(dash.daily_start)}</b>. Today is day <b>{dash.days_since_start}</b>.</p>
      </section>

      <section className="fbp-d-sec">
        <h2>Coming up</h2>
        {!dash.upcoming.length && <p className="fbp-d-empty">Nothing approved is waiting.</p>}
        {up.map(u => (
          <div key={u.id} className="fbp-d-row">
            <div className="fbp-d-when"><b>{day(u.date)}</b><span>Day {u.day}, number {u.pos}</span></div>
            <div className="fbp-d-what">
              <p>{u.hook}</p>
              <span className="fbp-d-meta">Links to {LINK[u.link]}{u.edited ? ', edited by you' : ''}</span>
              <Groups groups={u.groups} />
            </div>
          </div>
        ))}
        {dash.upcoming.length > 10 && (
          <button className="fbp-d-more" onClick={() => setAllUpcoming(v => !v)}>
            {allUpcoming ? 'Show the first ten' : `Show all ${dash.upcoming.length}`}
          </button>
        )}
      </section>

      <section className="fbp-d-sec">
        <h2>Sent to Poornima</h2>
        {!dash.sent.length && <p className="fbp-d-empty">No post has been emailed yet.</p>}
        {dash.sent.map(s => (
          <div key={s.id} className="fbp-d-row">
            <div className="fbp-d-when"><b>{when(s.sent_at)}</b><span>{s.day ? `Day ${s.day}` : ''}</span></div>
            <div className="fbp-d-what">
              <p>{s.hook}</p>
              <span className="fbp-d-meta">
                Links to {LINK[s.link]}. To {s.sent_to}, you copied.
                {s.live ? ` Marked live${s.posted_at ? ` ${when(s.posted_at)}` : ''}.` : ''}
              </span>
              <Groups groups={s.groups} />
            </div>
          </div>
        ))}
      </section>

      {dash.failed.length > 0 && (
        <section className="fbp-d-sec">
          <h2>Failed</h2>
          {dash.failed.map(f => (
            <div key={f.id} className="fbp-d-row bad">
              <div className="fbp-d-what"><p>{f.hook}</p><span className="fbp-d-meta">{f.error}</span></div>
            </div>
          ))}
        </section>
      )}

      <section className="fbp-d-sec">
        <h2>Parked</h2>
        {!dash.parked.length && <p className="fbp-d-empty">Nothing parked.</p>}
        {dash.parked.map(p => (
          <div key={p.id} className="fbp-d-row">
            <div className="fbp-d-what">
              <p>{p.hook}</p>
              <span className="fbp-d-meta">Links to {LINK[p.link]}.{p.reason ? ` Why: ${p.reason}` : ''}</span>
            </div>
          </div>
        ))}
      </section>

      <p className="fbp-d-foot">
        Shows the daily post emails. The trial and instructions emails are not listed.
        Every email goes out by itself, one a day at about 07:00 India time, with a second run at 17:30 if the morning one did not go.
      </p>
    </div>
  )
}
