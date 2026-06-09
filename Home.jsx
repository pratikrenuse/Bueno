import React from 'react';
import { useT, LLink } from '../lib/i18n.jsx';

export default function Home() {
  const t = useT();

  const toolCards = [
    { slug: '/tax-calculator', key: 'tax' },
    { slug: '/cost-audit',     key: 'cost' },
    { slug: '/rental-tax',     key: 'rental' },
  ];

  return (
    <>
      {/* Hero */}
      <section className="s247-hero">
        <div className="s247-hero-inner">
          <div className="s247-hero-eyebrow">{t('hero.eyebrow')}</div>
          <h1 className="s247-hero-title">{t('hero.title')}</h1>
          <p className="s247-hero-sub">{t('hero.sub')}</p>
          <div className="s247-hero-actions">
            <LLink to="/tax-calculator" className="s247-btn s247-btn-primary">
              {t('tool.tax.cta')}
            </LLink>
            <a href="#tools" className="s247-btn s247-btn-ghost">
              {t('nav.tools')} ↓
            </a>
          </div>
        </div>
        <div className="s247-hero-orb" aria-hidden="true" />
      </section>

      {/* Tools */}
      <section id="tools" className="s247-tools">
        <div className="s247-section-inner">
          <header className="s247-section-head">
            <h2>{t('tools.heading')}</h2>
            <p>{t('tools.sub')}</p>
          </header>
          <div className="s247-tool-grid">
            {toolCards.map(({ slug, key }) => (
              <LLink to={slug} key={key} className="s247-tool-card">
                <div className="s247-tool-card-num">0{toolCards.findIndex(c => c.key === key) + 1}</div>
                <h3>{t(`tool.${key}.title`)}</h3>
                <p>{t(`tool.${key}.desc`)}</p>
                <span className="s247-tool-card-cta">
                  {t(`tool.${key}.cta`)} →
                </span>
              </LLink>
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="s247-why">
        <div className="s247-section-inner s247-why-inner">
          <h2>{t('why.heading')}</h2>
          <p>{t('why.body')}</p>
        </div>
      </section>
    </>
  );
}
