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

// The directory is the one tool with a use that starts before the visitor knows we have
// a tool. Somebody whose boiler has just failed is not going to scroll a grid of cards
// reading tags. So the two menus that start it live on the home page directly, right
// under the hero, and hand off to /spain-directory with the answer already loading.
const STRIP_CSS = `
.dir-strip { background: var(--light-blue); padding: 64px; }
@media (max-width: 900px) { .dir-strip { padding: 48px 24px; } }
.dir-strip-inner { max-width: 1100px; margin: 0 auto; }
.dir-strip h2 { font-family: var(--font-serif); font-size: clamp(24px, 3vw, 34px); font-weight: 400;
  color: var(--navy); line-height: 1.15; letter-spacing: -0.01em; margin: 0 0 10px; max-width: 620px; }
.dir-strip p.sub { font-family: var(--font-sans); font-size: 16px; font-weight: 300; line-height: 1.7;
  color: rgba(1,2,33,0.62); max-width: 56ch; margin: 0 0 28px; }
.dir-strip form { display: grid; grid-template-columns: 1.4fr 1fr auto; gap: 12px; align-items: end;
  max-width: 860px; }
@media (max-width: 780px) { .dir-strip form { grid-template-columns: 1fr; } }
.dir-strip label { display: block; font-family: var(--font-sans); font-size: 10px; font-weight: 500;
  letter-spacing: 0.14em; text-transform: uppercase; color: rgba(1,2,33,0.55); margin-bottom: 8px; }
.dir-strip select { width: 100%; min-height: 56px; padding: 16px 44px 16px 18px;
  font-family: var(--font-sans); font-size: 16px; color: var(--navy); background-color: var(--white);
  border: 1px solid rgba(1,2,33,0.14); border-radius: 12px; appearance: none; cursor: pointer;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23010221' stroke-width='1.6' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 18px center; }
.dir-strip select:focus { outline: 3px solid rgba(1,2,33,0.25); outline-offset: 1px; }
.dir-strip button { min-height: 56px; padding: 16px 32px; width: auto; margin-bottom: 0; white-space: nowrap; }
@media (max-width: 780px) { .dir-strip button { width: 100%; } }
`

function DirectoryStrip() {
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

  return (
    <section className="dir-strip">
      <style>{STRIP_CSS}</style>
      <div className="dir-strip-inner">
        <p className="home-section-eyebrow">{t('home.dir_eyebrow')}</p>
        <h2>{t('home.dir_title')}</h2>
        <p className="sub">{t('home.dir_sub')}</p>
        <form onSubmit={(e) => { e.preventDefault(); if (town) navigate(`${lp('/spain-directory')}?town=${town}&trade=${trade}`) }}>
          <div>
            <label htmlFor="home-dir-town">{tt('where_label')}</label>
            <select id="home-dir-town" value={town} onChange={(e) => setTown(e.target.value)}>
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
            <select id="home-dir-trade" value={trade} onChange={(e) => setTrade(e.target.value)}>
              {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{tt(`cat_${c.slug}`)}</option>)}
            </select>
          </div>
          <button type="submit" className="btn-primary" disabled={!town}>{tt('find_cta')}</button>
        </form>
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
      <DirectoryStrip />

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
