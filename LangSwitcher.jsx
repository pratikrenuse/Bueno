import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocale, useSwitchLocalePath, SUPPORTED_LOCALES, LOCALE_LABELS } from './i18n.jsx';

// Lightweight language switcher. Self-contained inline styles so it drops into
// any existing nav (light or dark) without touching the surrounding design.
const SHORT = { en: 'EN', no: 'NO', sv: 'SV', de: 'DE', fr: 'FR', nl: 'NL' };

export default function LangSwitcher() {
  const { locale } = useLocale();
  const switchTo = useSwitchLocalePath();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select language"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '7px 12px', borderRadius: 999,
          border: '1px solid rgba(1,2,33,0.15)', background: '#FFFFFF',
          color: '#010221', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em',
          cursor: 'pointer', lineHeight: 1, fontFamily: 'inherit',
        }}
      >
        {SHORT[locale] || 'EN'}
        <svg width="9" height="6" viewBox="0 0 10 6" aria-hidden="true">
          <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      {open && (
        <ul
          role="listbox"
          style={{
            position: 'absolute', top: 'calc(100% + 6px)', right: 0, minWidth: 150,
            margin: 0, padding: 6, listStyle: 'none', background: '#FFFFFF',
            border: '1px solid rgba(1,2,33,0.12)', borderRadius: 10,
            boxShadow: '0 6px 24px rgba(1,2,33,0.14)', zIndex: 200,
          }}
        >
          {SUPPORTED_LOCALES.map(loc => (
            <li key={loc} style={{ margin: 0 }}>
              <button
                type="button"
                role="option"
                aria-selected={loc === locale}
                onClick={() => { setOpen(false); navigate(switchTo(loc)); }}
                style={{
                  width: '100%', textAlign: 'left', border: 0, cursor: 'pointer',
                  padding: '9px 10px', borderRadius: 6, fontSize: 14, fontFamily: 'inherit',
                  background: loc === locale ? 'rgba(91,127,204,0.10)' : 'transparent',
                  color: loc === locale ? '#5B7FCC' : '#010221',
                  fontWeight: loc === locale ? 600 : 400,
                }}
              >
                {LOCALE_LABELS[loc]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
