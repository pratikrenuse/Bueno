import { useEffect, useRef, useState } from 'react';
import { useT, useLocale } from './i18n.jsx';
import { whatsappChannel, WHATSAPP_CHANNEL_LIST, WHATSAPP_CHANNEL_URLS, WHATSAPP_OTHER_LANGS } from './whatsapp.js';

// Getting owners to follow the Spain 24/7 WhatsApp channel is the main thing the owner pages
// ask for, so every owner page carries it, not only the home page. SiteFooter renders the band
// and the floating button, which puts them on every tool, answer, guide and directory page.
// The copy is the home page's own translated copy (home2.*), so the six languages stay in step.

export function WaIcon({ className = 'waf-ico' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.98L2 22l5.16-1.5A9.92 9.92 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.06.89.9-2.98-.2-.31a8.2 8.2 0 1 1 6.84 3.73Zm4.5-6.13c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.55.12-.16.25-.63.8-.78.97-.14.16-.29.18-.53.06a6.7 6.7 0 0 1-3.32-2.9c-.25-.43.25-.4.72-1.33.08-.16.04-.3-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47a.9.9 0 0 0-.65.3 2.73 2.73 0 0 0-.85 2.03c0 1.2.87 2.36 1 2.52.12.16 1.72 2.62 4.16 3.68 1.55.67 2.15.73 2.93.61.47-.07 1.46-.6 1.66-1.17.2-.58.2-1.07.14-1.17-.06-.1-.22-.16-.47-.28Z" />
    </svg>
  );
}

// "The channel is also in these languages: English, Norsk ..." The reader's own channel is left
// out because the main button already goes there.
export function WhatsAppOtherLangs({ className = 'waf-langs' }) {
  const { locale } = useLocale();
  const own = WHATSAPP_CHANNEL_URLS[locale] ? locale : 'en';
  const others = WHATSAPP_CHANNEL_LIST.filter(c => c.code !== own);
  if (!others.length) return null;
  return (
    <p className={className}>
      <span>{WHATSAPP_OTHER_LANGS[locale] || WHATSAPP_OTHER_LANGS.en}</span>{' '}
      {others.map((c, i) => (
        <span key={c.code}>
          <a href={WHATSAPP_CHANNEL_URLS[c.code]} target="_blank" rel="noopener" lang={c.code}>{c.label}</a>
          {i < others.length - 1 ? ', ' : ''}
        </span>
      ))}
    </p>
  );
}

// The band above the footer.
export function WhatsAppBand({ onSeen }) {
  const t = useT();
  const { locale } = useLocale();
  const ref = useRef(null);

  // Tells the floating button to step aside while the band itself is on screen.
  useEffect(() => {
    const el = ref.current;
    if (!el || !onSeen || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => onSeen(e.isIntersecting), { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, [onSeen]);

  return (
    <section className="waf-band" id="whatsapp" aria-label="WhatsApp" ref={ref}>
      <div className="waf-inner">
        <div className="waf-ic"><WaIcon /></div>
        <div className="waf-copy">
          <h2>{t('home2.comm_title')} <em>{t('home2.comm_em')}</em></h2>
          <p>{t('home2.comm_chan_b')}</p>
          <WhatsAppOtherLangs />
        </div>
        <a className="waf-btn" href={whatsappChannel(locale)} target="_blank" rel="noopener">
          <WaIcon /> {t('home2.comm_chan_cta')}
        </a>
      </div>
    </section>
  );
}

const FLOAT_KEY = 's247-wa-float-closed';

// A small follow button in the corner. It waits until the reader has scrolled a little, hides
// while the band is visible, and once closed it stays closed for that browser.
export function WhatsAppFloat({ hidden }) {
  const t = useT();
  const { locale } = useLocale();
  const [closed, setClosed] = useState(() => {
    try { return window.localStorage.getItem(FLOAT_KEY) === '1'; } catch { return false; }
  });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 480);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  if (closed) return null;
  const close = () => {
    setClosed(true);
    try { window.localStorage.setItem(FLOAT_KEY, '1'); } catch { /* storage can be blocked */ }
  };

  return (
    <div className={`waf-float${scrolled && !hidden ? ' on' : ''}`} role="complementary" aria-label="WhatsApp">
      <a className="waf-float-btn" href={whatsappChannel(locale)} target="_blank" rel="noopener" aria-label={t('home2.wa_bar_short')}>
        <WaIcon />
        <span className="waf-float-txt">{t('home2.wa_bar_short')}</span>
      </a>
      <button className="waf-float-x" type="button" aria-label={t('home2.close')} onClick={close}>&times;</button>
    </div>
  );
}
