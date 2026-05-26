import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

// Auto-discovers all tool meta.js files — no changes needed when adding new tools
const metaModules = import.meta.glob('../*/meta.js', { eager: true })
const ALL_TOOLS = Object.values(metaModules)
  .map(m => m.default)
  .sort((a, b) => a.order - b.order)

export default function Home() {
  const navRef  = useRef(null)
  const logoRef = useRef(null)

  useEffect(() => {
    document.title = 'Spanish Property Insights | Free Tools | Bueno'

    const hero = document.querySelector('.home-hero')
    if (!hero) return

    const observer = new IntersectionObserver((entries) => {
      const inHero = entries[0].isIntersecting
      if (navRef.current) {
        navRef.current.className = `home-nav ${inHero ? 'top' : 'scrolled'}`
      }
      if (logoRef.current) {
        logoRef.current.src    = inHero ? '/images/bueno-logo-transparent.png' : '/images/bueno-logo-white.png'
        logoRef.current.style.filter = inHero ? 'brightness(0) invert(1)' : 'none'
      }
    }, { threshold: 0.05 })

    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  return (
    <div>

      {/* NAV */}
      <nav className="home-nav top" ref={navRef}>
        <div className="home-nav-logo">
          <img ref={logoRef} src="/images/bueno-logo-transparent.png" alt="Bueno | Property Simplified"
               style={{ filter: 'brightness(0) invert(1)' }} />
        </div>
        <a href="https://getbueno.com" target="_blank" rel="noopener noreferrer" className="home-nav-cta">
          Get Bueno &#8594;
        </a>
      </nav>

      {/* HERO */}
      <section className="home-hero">
        <div className="home-hero-left">
          <div className="home-hero-inner">
            <div className="home-eyebrow">
              <span className="home-eyebrow-line" />
              <span className="home-eyebrow-text">Powered by Bueno</span>
            </div>
            <h1 className="home-headline">
              Know your Spanish<br />property <em>inside out.</em>
            </h1>
            <p className="home-body">
              Free tools for foreign property owners in Spain.
              Understand your tax obligations, check if you are overpaying,
              and manage everything with confidence.
            </p>
            <button className="home-scroll-btn"
              onClick={() => document.getElementById('tools').scrollIntoView({ behavior: 'smooth' })}>
              <span className="home-scroll-line" />
              Explore the tools
            </button>
            <div className="home-trust">
              <span className="home-trust-item">100% free</span>
              <span className="home-trust-dot" />
              <span className="home-trust-item">No account needed</span>
              <span className="home-trust-dot" />
              <span className="home-trust-item">Trusted by 2,000+ owners</span>
              <span className="home-trust-dot" />
              <span className="home-trust-item">English language</span>
            </div>
          </div>
        </div>
        <div className="home-hero-right">
          <img src="/images/hero-home.jpg" alt="Spanish property" />
        </div>
      </section>

      {/* TOOLS */}
      <section className="home-tools" id="tools">
        <p className="home-section-eyebrow">Free Tools</p>
        <h2 className="home-section-headline">Everything you need to know about your Spanish property.</h2>
        <p className="home-section-sub">
          Built for foreign property owners who want clarity without the complexity.
          All tools are free, take under 2 minutes, and require no account.
        </p>

        <div className="tools-grid">

          {ALL_TOOLS.map((tool, i) => (
            tool.active ? (
              <Link key={tool.path} to={tool.path} className="tool-card">
                <span className={`tool-tag ${tool.tagStyle === 'gold' ? 'gold' : ''}`}>{tool.tag}</span>
                <p className="tool-number">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="tool-title">{tool.title}</h3>
                <p className="tool-desc">{tool.description}</p>
                <span className={`tool-link ${tool.ctaStyle === 'gold' ? 'gold' : ''}`}>{tool.cta} &#8594;</span>
              </Link>
            ) : (
              <div key={tool.path} className="tool-card disabled">
                <span className="tool-tag grey">Coming Soon</span>
                <p className="tool-number">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="tool-title">{tool.title}</h3>
                <p className="tool-desc">{tool.description}</p>
                <span className="tool-link muted">Coming soon</span>
              </div>
            )
          ))}

          {/* Placeholder card always shown at end */}
          <div className="tool-card disabled">
            <span className="tool-tag grey">Coming Soon</span>
            <p className="tool-number">{String(ALL_TOOLS.length + 1).padStart(2, '0')}</p>
            <h3 className="tool-title">Property Readiness Assessment</h3>
            <p className="tool-desc">
              A full health check of your Spanish property setup across banking,
              tax compliance, energy, insurance, and property management.
              Know exactly where your gaps are.
            </p>
            <span className="tool-link muted">Coming soon</span>
          </div>

        </div>
      </section>

      {/* WHY BUENO */}
      <section className="home-why">
        <div>
          <p className="home-section-eyebrow" style={{ color: 'var(--gold)' }}>Why Bueno</p>
          <h2 className="home-section-headline" style={{ color: 'var(--white)', maxWidth: 240 }}>
            Property simplified.
          </h2>
          <p className="home-section-sub" style={{ color: 'rgba(255,255,255,0.45)', marginBottom: 0 }}>
            These tools are powered by Bueno, the platform built for foreign property owners in Spain.
          </p>
        </div>
        <div className="why-grid">
          {[
            { n: '01', title: 'Human support, not bots',    body: 'Real people who speak your language. English, Norwegian, Swedish, Danish, German, and French. Issues resolved within hours.' },
            { n: '02', title: 'Transparent fees',           body: '€99 per year, all-inclusive. No hidden charges. Most members save more than the membership cost in the first year.' },
            { n: '03', title: 'Everything in one place',    body: 'Spanish IBAN, Visa card, energy switching, Modelo 210 filing, property platform, and the Bueno Club perks programme.' },
            { n: '04', title: 'Built for non-residents',    body: 'No Spanish tax residency required. No branch visits. Open your account in minutes from anywhere in the world.' },
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
          Ready to stop overpaying and start managing your Spanish property <em>with confidence?</em>
        </p>
        <a href="https://getbueno.com" target="_blank" rel="noopener noreferrer" className="home-band-cta">
          Join Bueno &#8594;
        </a>
      </section>

      {/* FOOTER */}
      <footer className="home-footer">
        <div className="home-footer-logo">
          <img src="/images/bueno-logo-transparent.png" alt="Bueno | Property Simplified" />
        </div>
        <div className="home-footer-links">
          <a href="https://getbueno.com" target="_blank" rel="noopener noreferrer">getbueno.com</a>
          <Link to="/tax-calculator">Tax Calculator</Link>
          <Link to="/cost-audit">Cost Audit</Link>
        </div>
        <p className="home-footer-copy">
          &copy; 2025 Bueno. For guidance only. Not legal or tax advice.
        </p>
      </footer>

    </div>
  )
}
