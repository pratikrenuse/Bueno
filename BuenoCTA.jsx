import React from 'react';
import { useT } from '../lib/i18n.jsx';

/**
 * BuenoCTA — the only place on Spain 24/7 where Bueno is mentioned.
 * Render this on a tool's RESULT screen, after the user has seen their answer.
 *
 * Props:
 *   variant — "tax" (default). Picks copy from i18n bueno_cta.{variant}_title/body.
 *   href    — the destination URL (defaults to getbueno.com homepage).
 */
export default function BuenoCTA({ variant = 'tax', href = 'https://getbueno.com' }) {
  const t = useT();
  return (
    <aside className="s247-bueno-cta" aria-label="Bueno">
      <div className="s247-bueno-cta-mark">
        <img
          src="/images/bueno-b-icon.png"
          alt=""
          width="48"
          height="48"
          className="s247-bueno-cta-icon"
        />
        <img
          src="/images/bueno-wordmark.jpg"
          alt="Bueno"
          height="22"
          className="s247-bueno-cta-wordmark"
        />
      </div>
      <h3 className="s247-bueno-cta-title">{t(`bueno_cta.${variant}_title`)}</h3>
      <p className="s247-bueno-cta-body">{t(`bueno_cta.${variant}_body`)}</p>
      <a
        className="s247-bueno-cta-button"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {t('bueno_cta.button')}
      </a>
    </aside>
  );
}
