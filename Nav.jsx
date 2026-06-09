import React, { useState } from 'react';
import { useT, LLink, useLocale } from '../lib/i18n.jsx';
import LangSwitcher from './LangSwitcher.jsx';

export default function Nav() {
  const t = useT();
  const { locale } = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <header className="s247-nav">
      <div className="s247-nav-inner">
        <LLink to="/" className="s247-wordmark" aria-label={t('site.name')}>
          <span className="s247-wordmark-main">SPAIN</span>
          <span className="s247-wordmark-accent">24/7</span>
        </LLink>

        <nav className={`s247-nav-links ${open ? 'is-open' : ''}`} onClick={() => setOpen(false)}>
          <LLink to="/tax-calculator">{t('nav.tax')}</LLink>
          <LLink to="/cost-audit">{t('nav.cost')}</LLink>
          <LLink to="/rental-tax">{t('nav.rental')}</LLink>
          <div className="s247-nav-lang"><LangSwitcher /></div>
        </nav>

        <button
          className="s247-nav-toggle"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen(v => !v)}
        >
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}
