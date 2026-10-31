import { useEffect, useRef, useState } from 'react';
import { useT, useLocale, LLink, LOCALE_LABELS } from './i18n.jsx';
import LangSwitcher from './LangSwitcher.jsx';
import { audienceLabels } from './audiences.js';
import { buenoHome } from './SiteFooter.jsx';
import { SITE_ORIGIN, localePath, LOCALES, TOOL_COPY } from './seo/copy.js';

// The frame shared by the estate agents' and lawyers' pages (October 2026). Each page has its
// own layout and its own CSS (.ag7 and .lw7 in src/App.css); this file only holds what both
// need: the WhatsApp bar, the header with the audience switch, the footer, the scroll reveal,
// and the "send this to your client" link logic.

export function WaIcon({ className = 'p7-wa-ico' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.98L2 22l5.16-1.5A9.92 9.92 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.06.89.9-2.98-.2-.31a8.2 8.2 0 1 1 6.84 3.73Zm4.5-6.13c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.55.12-.16.25-.63.8-.78.97-.14.16-.29.18-.53.06a6.7 6.7 0 0 1-3.32-2.9c-.25-.43.25-.4.72-1.33.08-.16.04-.3-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47a.9.9 0 0 0-.65.3 2.73 2.73 0 0 0-.85 2.03c0 1.2.87 2.36 1 2.52.12.16 1.72 2.62 4.16 3.68 1.55.67 2.15.73 2.93.61.47-.07 1.46-.6 1.66-1.17.2-.58.2-1.07.14-1.17-.06-.1-.22-.16-.47-.28Z" />
    </svg>
  );
}

// Fades in anything with .p7-rv (or .p7-watch) once it scrolls into view.
export function useReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = root.querySelectorAll('.p7-rv, .p7-watch');
    if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [rootRef]);
}

export function useSolidNav(limit = 120) {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const on = () => setSolid(window.scrollY > limit);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [limit]);
  return solid;
}

export function WhatsAppBar({ c, url, onClose }) {
  const ref = useRef(null);
  // The header sits under the bar, so the page needs the bar's real height.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const host = el.parentElement;
    const set = () => host && host.style.setProperty('--p7-bar', `${el.offsetHeight}px`);
    set();
    window.addEventListener('resize', set);
    return () => { window.removeEventListener('resize', set); host && host.style.removeProperty('--p7-bar'); };
  }, []);
  return (
    <div className="p7-wa-bar" role="region" aria-label="WhatsApp" ref={ref}>
      <div className="p7-wrap">
        <p><span className="p7-long">{c('bar_long')}</span><span className="p7-short">{c('bar_short')}</span></p>
        <a className="p7-wa-btn" href={url} target="_blank" rel="noopener">
          <WaIcon /><span className="p7-long">{c('bar_btn_long')}</span><span className="p7-short">{c('bar_btn_short')}</span>
        </a>
        <button className="p7-wa-x" type="button" aria-label={c('close')} onClick={onClose}>&times;</button>
      </div>
    </div>
  );
}

export function ProNav({ current, c, solid }) {
  const aud = audienceLabels(useLocale().locale);
  const jump = (id) => (e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <header className={`p7-nav${solid ? ' solid' : ''}`}>
      <div className="p7-wrap">
        <LLink to="/" className="p7-brand" aria-label="Spain 24/7">Spain 24<i>/</i>7</LLink>
        <nav className="p7-links" aria-label="Main">
          <span className="p7-aud" role="group" aria-label={aud.switch_label}>
            <LLink to="/">{aud.owners}</LLink>
            <LLink to="/for-agents" className={current === 'agents' ? 'on' : ''} aria-current={current === 'agents' ? 'page' : undefined}>{aud.agents}</LLink>
            <LLink to="/for-lawyers" className={current === 'lawyers' ? 'on' : ''} aria-current={current === 'lawyers' ? 'page' : undefined}>{aud.lawyers}</LLink>
          </span>
          <a href="#tools" onClick={jump('tools')}>{c('nav_tools')}</a>
          <a href="#share" onClick={jump('share')}>{c('nav_clients')}</a>
          <LangSwitcher />
        </nav>
      </div>
    </header>
  );
}

export function ProFooter({ c }) {
  const t = useT();
  const { locale } = useLocale();
  const aud = audienceLabels(locale);
  return (
    <footer className="p7-footer">
      <div className="p7-wrap">
        <div className="p7-foot">
          <div>
            <span className="p7-brand">Spain 24<i>/</i>7</span>
            <a className="p7-foot-sponsor" href={buenoHome(locale)} target="_blank" rel="noopener">
              <small>{t('home2.footer_sponsored')}</small>
              <img src="/images/home/bueno-logo-white.png" alt="Bueno" />
            </a>
          </div>
          <nav aria-label="Footer">
            <LLink to="/">{aud.owners}</LLink>
            <LLink to="/for-agents">{aud.for_agents}</LLink>
            <LLink to="/for-lawyers">{aud.for_lawyers}</LLink>
            <LLink to="/answers">{t('home2.footer_answers')}</LLink>
            <LLink to="/guides">{t('home2.footer_guides')}</LLink>
            <LLink to="/about">{t('home2.footer_about')}</LLink>
          </nav>
        </div>
        <p className="p7-legal">{c('legal')}</p>
      </div>
    </footer>
  );
}

// Client language state plus the link builder for "send this to your client".
export function useClientLinks() {
  const { locale } = useLocale();
  const [lang, setLang] = useState(locale);
  const url = (slug) => SITE_ORIGIN + localePath(lang, `/${slug}`);
  const name = (slug) => TOOL_COPY[slug]?.[locale]?.h1 || TOOL_COPY[slug]?.en?.h1 || slug;
  return { lang, setLang, url, name };
}

export function LangButtons({ lang, setLang, label, className = 'p7-langs' }) {
  return (
    <div className={className} role="group" aria-label={label}>
      {LOCALES.map(l => (
        <button key={l} type="button" className={lang === l ? 'on' : ''} aria-pressed={lang === l} onClick={() => setLang(l)}>
          {LOCALE_LABELS[l]}
        </button>
      ))}
    </div>
  );
}

export function CopyButton({ text, label, done, className = 'p7-copy' }) {
  const [state, setState] = useState('idle');
  const go = async () => {
    try { await navigator.clipboard.writeText(text); setState('done'); }
    catch { setState('fail'); }
    setTimeout(() => setState(st => (st === 'done' ? 'idle' : st)), 2000);
  };
  return (
    <>
      <button type="button" className={`${className}${state === 'done' ? ' done' : ''}`} onClick={go}>
        {state === 'done' ? done : label}
      </button>
      {state === 'fail' && <input className="p7-url" readOnly value={text} onFocus={e => e.target.select()} autoFocus />}
    </>
  );
}

export function useWaBar() {
  const [bar, setBar] = useState(true);
  return [bar, () => setBar(false)];
}
