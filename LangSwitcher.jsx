import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocale, useSwitchLocalePath, SUPPORTED_LOCALES, LOCALE_LABELS } from '../lib/i18n.jsx';

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
    <div className="s247-lang" ref={ref}>
      <button
        className="s247-lang-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
      >
        {LOCALE_LABELS[locale]}
        <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true">
          <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      {open && (
        <ul className="s247-lang-menu" role="listbox">
          {SUPPORTED_LOCALES.map(loc => (
            <li key={loc}>
              <button
                role="option"
                aria-selected={loc === locale}
                className={loc === locale ? 'is-active' : ''}
                onClick={() => { setOpen(false); navigate(switchTo(loc)); }}
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
