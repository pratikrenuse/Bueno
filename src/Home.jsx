import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useT, useLocale, LLink, useLocalisedPath } from '../i18n.jsx'
import LangSwitcher from '../LangSwitcher.jsx'
import { LOCALITIES, REGIONS } from '../spain-directory/localities.js'
import { CATEGORIES } from '../spain-directory/categories.js'
import { isForAudience, audienceLabels } from '../audiences.js'
import { buenoHome } from '../SiteFooter.jsx'
import { TOOL_COPY } from '../seo/copy.js'
import { WHATSAPP_GROUP_URL, WHATSAPP_CHANNEL_URL } from '../whatsapp.js'

// The owners' home page, rebuilt October 2026.
//
// The old page listed every tool as a card, three times over, in small type, with no
// pictures. Owners could not tell what the site was for. This page does one thing per
// section: four big photo cards for the four reasons owners come (tax, repairs, costs,
// leaving the house), the repairs search, four questions, a short list of other tools, the
// WhatsApp group and channel, and the sponsor. Copy lives under `home2` in the six locale
// files. The old `home.*` keys are still read by other pages (brand line, sponsor line).

const metaModules = import.meta.glob('../*/meta.js', { eager: true })
const OWNER_TOOLS = Object.values(metaModules)
  .map(m => m.default)
  .filter(m => isForAudience(m, 'owners') && m.active !== false)
  .sort((a, b) => a.order - b.order)

const NEEDS = [
  { key: 'tax',  path: '/tax-calculator', img: 'tax.jpg' },
  { key: 'fix',  path: '/spain-directory', img: 'repairs.jpg' },
  { key: 'cost', path: '/cost-audit',     img: 'costs.jpg' },
  { key: 'away', path: '/closing-up',     img: 'away.jpg' },
]
const NEED_PATHS = new Set(NEEDS.map(n => n.path).concat(['/spain-professionals']))
const FEATURED = ['/rental-tax', '/day-counter', '/sale-tax', '/storm-claim', '/maintenance-schedule', '/contractor-check']
const QUESTIONS = [
  ['q1', 'tax-on-a-spanish-property-you-do-not-rent-out'],
  ['q2', 'how-long-can-i-stay-in-spain-without-residency'],
  ['q3', 'who-pays-for-storm-damage-in-spain'],
  ['q4', 'filing-a-spanish-tax-return-late'],
]
const TRADES = ['plumber', 'electrician', 'locksmith', 'aircon', 'pool', 'builder']
const IMG = (f) => `/images/home/${f}`

function WaIcon({ className = 'h7-wa-ico' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.98L2 22l5.16-1.5A9.92 9.92 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.06.89.9-2.98-.2-.31a8.2 8.2 0 1 1 6.84 3.73Zm4.5-6.13c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.55.12-.16.25-.63.8-.78.97-.14.16-.29.18-.53.06a6.7 6.7 0 0 1-3.32-2.9c-.25-.43.25-.4.72-1.33.08-.16.04-.3-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47a.9.9 0 0 0-.65.3 2.73 2.73 0 0 0-.85 2.03c0 1.2.87 2.36 1 2.52.12.16 1.72 2.62 4.16 3.68 1.55.67 2.15.73 2.93.61.47-.07 1.46-.6 1.66-1.17.2-.58.2-1.07.14-1.17-.06-.1-.22-.16-.47-.28Z" />
    </svg>
  )
}

// Fades sections in as they scroll into view, and runs the number count-up once.
function useReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const els = root.querySelectorAll('.h7-rv')
    const countUp = (el) => {
      const end = +el.getAttribute('data-count')
      if (reduce) { el.textContent = String(end); return }
      let t0 = null
      const step = (t) => {
        if (!t0) t0 = t
        const p = Math.min((t - t0) / 1600, 1)
        el.textContent = String(Math.round(end * (1 - Math.pow(1 - p, 3))))
        if (p < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }
    if (!('IntersectionObserver' in window)) {
      els.forEach(el => { el.classList.add('in'); el.querySelectorAll('[data-count]').forEach(countUp) })
      return
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return
        e.target.classList.add('in')
        e.target.querySelectorAll('[data-count]').forEach(countUp)
        io.unobserve(e.target)
      })
    }, { threshold: 0.15 })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [rootRef])
}

function WhatsAppBar({ t, onClose }) {
  const ref = useRef(null)
  // The nav sits under the bar, so the page needs the bar's real height, which changes with
  // the language and the screen width.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const set = () => el.parentElement && el.parentElement.style.setProperty('--h7-bar', `${el.offsetHeight}px`)
    set()
    window.addEventListener('resize', set)
    return () => { window.removeEventListener('resize', set); el.parentElement && el.parentElement.style.removeProperty('--h7-bar') }
  }, [])
  return (
    <div className="h7-wa-bar" role="region" aria-label="WhatsApp" ref={ref}>
      <div className="h7-wrap">
        <p>
          <span className="h7-long">{t('home2.wa_bar_long')}</span>
          <span className="h7-short">{t('home2.wa_bar_short')}</span>
        </p>
        <a className="h7-wa-btn" href={WHATSAPP_GROUP_URL} target="_blank" rel="noopener">
          <WaIcon />
          <span className="h7-long">{t('home2.wa_btn_long')}</span>
          <span className="h7-short">{t('home2.wa_btn_short')}</span>
        </a>
        <button className="h7-wa-x" type="button" aria-label={t('home2.close')} onClick={onClose}>&times;</button>
      </div>
    </div>
  )
}

function FindSection({ t }) {
  const navigate = useNavigate()
  const lp = useLocalisedPath()
  const [town, setTown] = useState('')
  const [trade, setTrade] = useState('plumber')
  const bgRef = useRef(null)

  const grouped = useMemo(() => {
    const out = []
    for (const [key, label] of Object.entries(REGIONS)) {
      const items = LOCALITIES.filter(l => l.region === key).sort((a, b) => a.name.localeCompare(b.name))
      if (items.length) out.push({ key, label, items })
    }
    return out
  }, [])
  const trades = CATEGORIES.filter(c => TRADES.includes(c.slug))

  // Gentle parallax on the photo behind the search.
  useEffect(() => {
    const bg = bgRef.current
    if (!bg || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return
    const on = () => {
      const r = bg.parentElement.getBoundingClientRect()
      const y = Math.max(-80, Math.min(80, r.top * -0.12))
      bg.style.transform = `translateY(${y}px)`
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  const submit = (e) => {
    e.preventDefault()
    if (!town) return
    navigate(`${lp('/spain-directory')}?town=${town}&trade=${trade}`)
  }

  return (
    <section className="h7-find" id="find">
      <div className="h7-find-bg" ref={bgRef} style={{ backgroundImage: `url(${IMG('village.jpg')})` }} />
      <div className="h7-wrap">
        <div className="h7-head h7-rv">
          <h2>{t('home2.find_title')}</h2>
          <p>{t('home2.find_sub')}</p>
        </div>
        <form className="h7-find-box h7-rv" onSubmit={submit}>
          <div>
            <label htmlFor="h7-town">{t('home2.find_where')}</label>
            <select id="h7-town" value={town} onChange={(e) => setTown(e.target.value)} required>
              <option value="">{t('home2.find_pick')}</option>
              {grouped.map(g => (
                <optgroup key={g.key} label={g.label}>
                  {g.items.map(l => <option key={l.slug} value={l.slug}>{l.name}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="h7-trade">{t('home2.find_who')}</label>
            <select id="h7-trade" value={trade} onChange={(e) => setTrade(e.target.value)}>
              {trades.map(c => <option key={c.slug} value={c.slug}>{t(`calc_directory.cat_${c.slug}`)}</option>)}
            </select>
          </div>
          <button className="h7-btn h7-btn-primary" type="submit" disabled={!town}>
            {t('home2.find_cta')} <span className="h7-arr">&#8594;</span>
          </button>
        </form>
        <div className="h7-chips h7-rv">
          <span>{t('home2.find_pros_q')}</span>
          <LLink to="/spain-professionals">{t('home2.find_pros_link')}</LLink>
        </div>
      </div>
    </section>
  )
}

function ToolsSection({ t, locale }) {
  const [all, setAll] = useState(false)
  const name = (tool) => TOOL_COPY[tool.path.slice(1)]?.[locale]?.h1 || tool.title
  const featured = FEATURED.map(p => OWNER_TOOLS.find(x => x.path === p)).filter(Boolean)
  const rest = OWNER_TOOLS.filter(x => !NEED_PATHS.has(x.path) && !FEATURED.includes(x.path))
  const shown = all ? featured.concat(rest) : featured

  return (
    <section className="h7-tools" id="tools">
      <div className="h7-wrap">
        <div className="h7-head h7-rv"><h2>{t('home2.tools_title')}</h2></div>
        <div className="h7-tool-row">
          {shown.map((tool, i) => (
            <LLink key={tool.path} to={tool.path} className={`h7-tool h7-rv in s${i % 3}`}>
              <h3>{name(tool)}</h3>
            </LLink>
          ))}
        </div>
        {rest.length > 0 && (
          <button type="button" className="h7-more" onClick={() => setAll(a => !a)} aria-expanded={all}>
            {all ? t('home2.tools_less') : t('home2.tools_more')} <span className="h7-arr">{all ? '↑' : '→'}</span>
          </button>
        )}
      </div>
    </section>
  )
}

export default function Home() {
  const t = useT()
  const { locale } = useLocale()
  const lp = useLocalisedPath()
  const aud = audienceLabels(locale)
  const rootRef = useRef(null)
  const [bar, setBar] = useState(true)
  const [solid, setSolid] = useState(false)

  useReveal(rootRef)

  useEffect(() => {
    document.title = 'Spain 24/7 | Free tools for owners in Spain'
    const on = () => setSolid(window.scrollY > window.innerHeight * 0.75)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  const scrollTo = (id) => (e) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className={`h7${bar ? ' h7-bar-on' : ''}`} ref={rootRef}>

      {bar && <WhatsAppBar t={t} onClose={() => setBar(false)} />}

      <header className={`h7-nav${solid ? ' solid' : ''}`}>
        <div className="h7-wrap">
          <LLink to="/" className="h7-brand" aria-label="Spain 24/7">Spain 24<i>/</i>7</LLink>
          <nav className="h7-links" aria-label="Main">
            <a href="#needs" onClick={scrollTo('needs')}>{t('home2.nav_tools')}</a>
            <a href="#find" onClick={scrollTo('find')}>{t('home2.nav_repairs')}</a>
            <a href="#questions" onClick={scrollTo('questions')}>{t('home2.nav_questions')}</a>
            <LLink to="/guides">{t('home2.nav_guides')}</LLink>
            <LangSwitcher />
          </nav>
        </div>
      </header>

      <main>

        <section className="h7-hero" aria-label="Spain 24/7">
          <div className="h7-hero-bg" style={{ backgroundImage: `url(${IMG('hero.jpg')})` }} role="img" aria-label="White houses on a Spanish hillside at sunset" />
          <div className="h7-wrap">
            <div className="h7-hero-copy">
              <h1 className="h7-load d1">{t('home2.hero_title')} <em>{t('home2.hero_em')}</em></h1>
              <p className="h7-lead h7-load d2">{t('home2.hero_body')}</p>
              <div className="h7-ctas h7-load d3">
                <a className="h7-btn h7-btn-primary" href="#needs" onClick={scrollTo('needs')}>
                  {t('home2.hero_cta')} <span className="h7-arr">&#8594;</span>
                </a>
                <a className="h7-btn h7-btn-ghost" href="#find" onClick={scrollTo('find')}>{t('home2.hero_cta2')}</a>
              </div>
            </div>
          </div>
          <a className="h7-scroll" href="#needs" onClick={scrollTo('needs')} aria-label={t('home2.scroll')} />
        </section>

        <section className="h7-needs" id="needs">
          <div className="h7-wrap">
            <div className="h7-head h7-rv"><h2>{t('home2.needs_title')}</h2></div>
            <div className="h7-need-grid">
              {NEEDS.map((n, i) => (
                <LLink key={n.key} to={n.path} className={`h7-need h7-rv${i % 2 ? ' s1' : ''}`}>
                  <img src={IMG(n.img)} alt="" loading="lazy" />
                  <div className="h7-need-body">
                    <h3>{t(`home2.need_${n.key}_t`)}</h3>
                    <p>{t(`home2.need_${n.key}_b`)}</p>
                    <span className="h7-go">{t(`home2.need_${n.key}_cta`)} <span>&#8594;</span></span>
                  </div>
                </LLink>
              ))}
            </div>
          </div>
        </section>

        <section className="h7-stats-band">
          <div className="h7-wrap">
            <div className="h7-stats h7-rv">
              <div className="h7-stat"><b data-count={LOCALITIES.length}>{LOCALITIES.length}</b><span>{t('home2.stat_towns')}</span></div>
              <div className="h7-stat"><b data-count="190">190</b><span>{t('home2.stat_answers')}</span></div>
              <div className="h7-stat"><b data-count="6">6</b><span>{t('home2.stat_langs')}</span></div>
              <div className="h7-stat"><b>&euro;0</b><span>{t('home2.stat_free')}</span></div>
            </div>
          </div>
        </section>

        <FindSection t={t} />

        <section className="h7-qs" id="questions">
          <div className="h7-wrap">
            <div className="h7-head h7-rv"><h2>{t('home2.qs_title')}</h2></div>
            <div className="h7-qs-grid h7-rv">
              {QUESTIONS.map(([k, slug]) => (
                <a key={k} className="h7-q" href={lp(`/answers/${slug}`)}>
                  {t(`home2.${k}`)}<span className="h7-q-arr" aria-hidden="true">&#8594;</span>
                </a>
              ))}
            </div>
            <a className="h7-more h7-rv" href={lp('/answers')}>{t('home2.qs_more')} <span className="h7-arr">&#8594;</span></a>
          </div>
        </section>

        <ToolsSection t={t} locale={locale} />

        <section className="h7-comm" id="whatsapp">
          <div className="h7-wrap">
            <div className="h7-head h7-rv"><h2>{t('home2.comm_title')} <em>{t('home2.comm_em')}</em></h2></div>
            <div className="h7-comm-grid">
              <div className="h7-card dark h7-rv">
                <div className="h7-ic"><WaIcon className="" /></div>
                <h3>{t('home2.comm_group_t')}</h3>
                <p>{t('home2.comm_group_b')}</p>
                <a className="h7-btn h7-btn-light" href={WHATSAPP_GROUP_URL} target="_blank" rel="noopener">
                  {t('home2.comm_group_cta')} <span className="h7-arr">&#8594;</span>
                </a>
              </div>
              <div className="h7-card h7-rv s1">
                <div className="h7-ic"><WaIcon className="" /></div>
                <h3>{t('home2.comm_chan_t')}</h3>
                <p>{t('home2.comm_chan_b')}</p>
                <a className="h7-btn h7-btn-navy" href={WHATSAPP_CHANNEL_URL} target="_blank" rel="noopener">
                  {t('home2.comm_chan_cta')} <span className="h7-arr">&#8594;</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="h7-sponsor h7-rv" id="sponsor">
          <div className="h7-sponsor-img"><img src={IMG('couple.jpg')} alt="" loading="lazy" /></div>
          <div className="h7-sponsor-copy">
            <img className="h7-sponsor-logo" src={IMG('bueno-logo-white.png')} alt="Bueno" />
            <h2>{t('home2.sponsor_title')} <em>{t('home2.sponsor_em')}</em></h2>
            <p>{t('home2.sponsor_body')}</p>
            <a className="h7-btn h7-btn-primary" href={buenoHome(locale)} target="_blank" rel="noopener">
              {t('home2.sponsor_cta')} <span className="h7-arr">&#8594;</span>
            </a>
            <p className="h7-fine">{t('home2.sponsor_fine')}</p>
          </div>
        </section>

      </main>

      <footer className="h7-footer">
        <div className="h7-wrap">
          <div className="h7-foot">
            <div>
              <span className="h7-brand">Spain 24<i>/</i>7</span>
              <a className="h7-foot-sponsor" href={buenoHome(locale)} target="_blank" rel="noopener">
                <small>{t('home2.footer_sponsored')}</small>
                <img src={IMG('bueno-logo-white.png')} alt="Bueno" />
              </a>
            </div>
            <nav aria-label="Footer">
              <LLink to="/answers">{t('home2.footer_answers')}</LLink>
              <LLink to="/guides">{t('home2.footer_guides')}</LLink>
              <LLink to="/spain-directory">{t('nav.directory')}</LLink>
              <LLink to="/spain-professionals">{t('nav.professionals')}</LLink>
              <LLink to="/for-agents">{aud.for_agents}</LLink>
              <LLink to="/for-lawyers">{aud.for_lawyers}</LLink>
              <LLink to="/about">{t('home2.footer_about')}</LLink>
              <a href={WHATSAPP_GROUP_URL} target="_blank" rel="noopener">{t('home2.footer_wa_group')}</a>
              <a href={WHATSAPP_CHANNEL_URL} target="_blank" rel="noopener">{t('home2.footer_wa_channel')}</a>
            </nav>
          </div>
          <p className="h7-legal">{t('home2.footer_legal')}</p>
        </div>
      </footer>

    </div>
  )
}
