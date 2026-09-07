import { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useT, LLink, useLocalisedPath } from '../i18n.jsx'
import LangSwitcher from '../LangSwitcher.jsx'
import { LOCALITIES, REGIONS } from '../spain-directory/localities.js'
import { CATEGORIES } from '../spain-directory/categories.js'

// Auto-discovers all tool meta.js files — no changes needed when adding new tools
const metaModules = import.meta.glob('../*/meta.js', { eager: true })
const ALL_TOOLS = Object.values(metaModules)
  .map(m => m.default)
  .sort((a, b) => a.order - b.order)

// Map a tool path to its i18n card key
const CARD_KEY = { '/tax-calculator': 'tax', '/cost-audit': 'cost', '/rental-tax': 'rental', '/mortgage-claim': 'claim', '/spain-directory': 'directory' }

// The directory is the one tool whose use starts before the visitor knows we have a
// tool. Somebody whose boiler has just failed is not going to scroll a grid of cards
// reading tags. So it gets its own section under the hero rather than a slot in the
// grid, and that section has to do more than hold a form: it has to show, in one glance,
// why this beats opening Google Maps yourself. The proof panel is that argument. It is
// not decoration, it is the ranking rule drawn out, and it is the honest reason a 4.7
// with four hundred reviews is a safer call than a 5.0 with three.
function DirectoryFeature() {
  const t = useT()
  const tt = (k) => t(`calc_directory.${k}`)
  const navigate = useNavigate()
  const lp = useLocalisedPath()
  const [town, setTown] = useState('')
  const [trade, setTrade] = useState('plumber')

  const grouped = useMemo(() => {
    const out = []
    for (const [key, label] of Object.entries(REGIONS)) {
      const items = LOCALITIES.filter(l => l.region === key).sort((a, b) => a.name.localeCompare(b.name))
      if (items.length) out.push({ key, label, items })
    }
    return out
  }, [])

  const go = (townSlug, tradeSlug) => navigate(`${lp('/spain-directory')}?town=${townSlug}&trade=${tradeSlug}`)

  return (
    <section className="dirfeat" id="directory">
      <div className="dirfeat-panel">

        <div>
          <p className="home-section-eyebrow" style={{ color: 'var(--gold)' }}>{t('home.dir_eyebrow')}</p>
          <h2 className="dirfeat-head">{t('home.dir_title')} <em>{t('home.dir_title_em')}</em></h2>
          <p className="dirfeat-sub">{t('home.dir_sub').replace('{count}', String(LOCALITIES.length))}</p>

          <form onSubmit={(e) => { e.preventDefault(); if (town) go(town, trade) }}>
            <div className="dirfeat-form">
              <div>
                <label htmlFor="home-dir-town">{tt('where_label')}</label>
                <select id="home-dir-town" className="dirfeat-select" value={town}
                  onChange={(e) => setTown(e.target.value)}>
                  <option value="">{tt('town_placeholder')}</option>
                  {grouped.map(g => (
                    <optgroup key={g.key} label={g.label}>
                      {g.items.map(l => <option key={l.slug} value={l.slug}>{l.name}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="home-dir-trade">{tt('trade_label')}</label>
                <select id="home-dir-trade" className="dirfeat-select" value={trade}
                  onChange={(e) => setTrade(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{tt(`cat_${c.slug}`)}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="btn-primary dirfeat-go" disabled={!town}>
              {tt('find_cta')}
            </button>
          </form>

          <div className="dirfeat-quick">
            <span>{tt('popular')}</span>
            {['torrevieja', 'marbella', 'javea', 'benidorm', 'palma', 'alicante'].map(slug => {
              const l = LOCALITIES.find(x => x.slug === slug)
              return l ? (
                <button key={slug} type="button" onClick={() => go(slug, trade)}>{l.name}</button>
              ) : null
            })}
          </div>
        </div>

        <div className="dirfeat-proof">
          <h3>{t('home.dir_proof_title')}</h3>

          <div className="dirfeat-bar-row">
            <div className="dirfeat-bar-top">
              <span><b>{t('home.dir_proof_a')}</b></span>
              <span className="dirfeat-verdict down">{t('home.dir_proof_a_verdict')}</span>
            </div>
            <div className="dirfeat-bar"><i className="down" /></div>
          </div>

          <div className="dirfeat-bar-row">
            <div className="dirfeat-bar-top">
              <span><b>{t('home.dir_proof_b')}</b></span>
              <span className="dirfeat-verdict up">{t('home.dir_proof_b_verdict')}</span>
            </div>
            <div className="dirfeat-bar"><i className="up" /></div>
          </div>

          <p className="dirfeat-caption">{t('home.dir_proof_caption')}</p>
        </div>

        <div className="dirfeat-stats">
          {[
            { n: String(LOCALITIES.length), l: t('home.dir_stat_towns') },
            { n: String(CATEGORIES.length), l: t('home.dir_stat_trades') },
            { n: t('home.dir_stat_free_n'), l: t('home.dir_stat_free') },
          ].map(s => (
            <div key={s.l}>
              <span className="dirfeat-stat-n">{s.n}</span>
              <span className="dirfeat-stat-l">{s.l}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

export default function Home() {
  const t = useT()
  const navRef          = useRef(null)
  const logoRef         = useRef(null)
  const brandNameRef    = useRef(null)
  const brandPoweredRef = useRef(null)

  useEffect(() => {
    document.title = 'Spain 24/7 | Free Tools'

    const hero = document.querySelector('.home-hero')
    if (!hero) return

    const observer = new IntersectionObserver((entries) => {
      const inHero = entries[0].isIntersecting
      if (navRef.current) {
        navRef.current.className = `home-nav ${inHero ? 'top' : 'scrolled'}`
      }
      if (brandNameRef.current) {
        brandNameRef.current.className = `site-brand-name ${inHero ? 'white' : ''}`
      }
      if (brandPoweredRef.current) {
        brandPoweredRef.current.className = `site-brand-powered ${inHero ? 'white' : ''}`
      }
      if (logoRef.current) {
        logoRef.current.src          = inHero ? '/images/bueno-logo-transparent.png' : '/images/bueno-logo-white.png'
        logoRef.current.style.filter = inHero ? 'brightness(0) invert(1)' : 'none'
        logoRef.current.style.opacity = inHero ? '0.6' : '0.7'
      }
    }, { threshold: 0.05 })

    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  return (
    <div>

      {/* NAV */}
      <nav className="home-nav top" ref={navRef}>
        <div className="site-brand">
          <span ref={brandNameRef} className="site-brand-name white">Spain 24/7</span>
          <span ref={brandPoweredRef} className="site-brand-powered white">
            {t('home.brand_sub')}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <LangSwitcher />
          <a href="https://getbueno.com" target="_blank" rel="noopener noreferrer" className="home-nav-cta">
            {t('home.nav_cta')} &#8594;
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="home-hero">
        <div className="home-hero-left">
          <div className="home-hero-inner">
            <div className="home-eyebrow">
              <span className="home-eyebrow-line" />
              <span className="home-eyebrow-text">{t('home.hero_eyebrow')}</span>
            </div>
            <h1 className="home-headline">
              {t('home.hero_title')} <em>{t('home.hero_em')}</em>
            </h1>
            <p className="home-body">
              {t('home.hero_body')}
            </p>
            <button className="btn-primary-outline" style={{ maxWidth: 280 }}
              onClick={() => document.getElementById('tools').scrollIntoView({ behavior: 'smooth' })}>
              {t('home.hero_cta')} &#8595;
            </button>
            <div className="home-trust">
              <span className="home-trust-item">{t('home.trust_free')}</span>
              <span className="home-trust-dot" />
              <span className="home-trust-item">{t('home.trust_account')}</span>
              <span className="home-trust-dot" />
              <span className="home-trust-item">{t('home.trust_trusted')}</span>
              <span className="home-trust-dot" />
              <span className="home-trust-item">{t('home.trust_lang')}</span>
            </div>
          </div>
        </div>
        <div className="home-hero-right">
          <img src="/images/hero-home.jpg" alt="Spanish property" />
        </div>

        {/* Scroll cue */}
        <div className="hero-scroll-cue"
          onClick={() => document.getElementById('tools').scrollIntoView({ behavior: 'smooth' })}>
          <span className="hero-scroll-cue-label">{t('home.scroll')}</span>
          <div className="hero-scroll-arrow">&#8595;</div>
        </div>

      </section>

      {/* DIRECTORY: the one tool people need before they know we have tools */}
      <DirectoryFeature />

      {/* TOOLS */}
      <section className="home-tools" id="tools">
        <p className="home-section-eyebrow">{t('home.tools_eyebrow')}</p>
        <h2 className="home-section-headline">{t('home.tools_heading')}</h2>
        <p className="home-section-sub">
          {t('home.tools_sub')}
        </p>

        <div className="tools-grid">

          {ALL_TOOLS.map((tool, i) => {
            const key = CARD_KEY[tool.path]
            return tool.active ? (
              <LLink key={tool.path} to={tool.path} className="tool-card">
                <span className={`tool-tag ${tool.tagStyle === 'gold' ? 'gold' : ''}`}>{t(`cards.${key}.tag`)}</span>
                <p className="tool-number">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="tool-title">{t(`cards.${key}.title`)}</h3>
                <p className="tool-desc">{t(`cards.${key}.desc`)}</p>
                <span className={`tool-link ${tool.ctaStyle === 'gold' ? 'gold' : ''}`}>{t(`cards.${key}.cta`)} &#8594;</span>
              </LLink>
            ) : (
              <div key={tool.path} className="tool-card disabled">
                <span className="tool-tag grey">{t('home.soon')}</span>
                <p className="tool-number">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="tool-title">{t(`cards.${key}.title`)}</h3>
                <p className="tool-desc">{t(`cards.${key}.desc`)}</p>
                <span className="tool-link muted">{t('home.soon_link')}</span>
              </div>
            )
          })}

          {/* Placeholder card always shown at end */}
          <div className="tool-card disabled">
            <span className="tool-tag grey">{t('home.soon')}</span>
            <p className="tool-number">{String(ALL_TOOLS.length + 1).padStart(2, '0')}</p>
            <h3 className="tool-title">{t('home.readiness_title')}</h3>
            <p className="tool-desc">
              {t('home.readiness_desc')}
            </p>
            <span className="tool-link muted">{t('home.soon_link')}</span>
          </div>

        </div>
      </section>

      {/* WHY */}
      <section className="home-why">
        <div>
          <p className="home-section-eyebrow" style={{ color: 'var(--gold)' }}>{t('home.why_eyebrow')}</p>
          <h2 className="home-section-headline" style={{ color: 'var(--white)', maxWidth: 240 }}>
            {t('home.why_heading')}
          </h2>
          <p className="home-section-sub" style={{ color: 'rgba(255,255,255,0.62)', marginBottom: 0 }}>
            {t('home.why_sub')}
          </p>
        </div>
        <div className="why-grid">
          {[
            { n: '01', title: t('home.why_1_t'), body: t('home.why_1_b') },
            { n: '02', title: t('home.why_2_t'), body: t('home.why_2_b') },
            { n: '03', title: t('home.why_3_t'), body: t('home.why_3_b') },
            { n: '04', title: t('home.why_4_t'), body: t('home.why_4_b') },
          ].map(item => (
            <div key={item.n}>
              <p className="why-item-number">{item.n}</p>
              <h3 className="why-item-title">{item.title}</h3>
              <p className="why-item-body">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BAND */}
      <section className="home-band">
        <p className="home-band-text">
          {t('home.band_text')} <em>{t('home.band_em')}</em>
        </p>
        <a href="https://getbueno.com" target="_blank" rel="noopener noreferrer" className="home-band-cta">
          {t('home.band_cta')} &#8594;
        </a>
      </section>

      {/* FOOTER */}
      <footer className="home-footer">
        <div className="site-brand">
          <span className="site-brand-name white" style={{ fontSize: 14 }}>Spain 24/7</span>
          <span className="site-brand-powered white">
            {t('home.brand_sub')}
          </span>
        </div>
        <div className="home-footer-links">
          <LLink to="/tax-calculator">{t('nav.tax')}</LLink>
          <LLink to="/cost-audit">{t('nav.cost')}</LLink>
          <LLink to="/spain-directory">{t('nav.directory')}</LLink>
        </div>
        <p className="home-footer-copy">
          {t('home.footer_copy')}
        </p>
      </footer>

    </div>
  )
}
