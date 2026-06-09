import React from 'react';
import { useT, LLink } from '../lib/i18n.jsx';

export default function Footer() {
  const t = useT();
  const year = new Date().getFullYear();
  return (
    <footer className="s247-footer">
      <div className="s247-footer-inner">
        <div className="s247-footer-brand">
          <div className="s247-footer-wordmark">
            <span className="s247-wordmark-main">SPAIN</span>
            <span className="s247-wordmark-accent">24/7</span>
          </div>
          <p className="s247-footer-tagline">{t('footer.tagline')}</p>
        </div>

        <nav className="s247-footer-links" aria-label="Footer">
          <LLink to="/tax-calculator">{t('nav.tax')}</LLink>
          <LLink to="/cost-audit">{t('nav.cost')}</LLink>
          <LLink to="/rental-tax">{t('nav.rental')}</LLink>
        </nav>
      </div>
      <div className="s247-footer-bottom">
        <span>© {year} Spain 24/7</span>
        <span>{t('footer.rights')}</span>
      </div>
    </footer>
  );
}
