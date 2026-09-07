import { useState, useEffect } from 'react';
import { useLocale, useT } from './i18n.jsx';
import LangSwitcher from './LangSwitcher.jsx';
import SiteFooter from './SiteFooter.jsx';
import SiteNav from './SiteNav.jsx';

// Shared frame for every tool built after the first five.
//
// The original calculators each carried their own header, progress bar, step chrome and
// footer. Six copies of the same markup meant a fix to one of them landed on one page.
// Everything structural lives here now, so a tool file contains only its questions, its
// arithmetic and its result.
//
// The shape every tool follows: intro, a small number of questions one to a screen, then
// a result that leads with the answer. That shape is deliberate. These readers are anxious
// about Spanish bureaucracy, so the emotional payoff we are aiming for is control: you now
// know where you stand, and what to do next.

export function useCopy(copy) {
  const { locale } = useLocale();
  const dict = copy[locale] || copy.en;
  return function c(path) {
    const get = (obj, p) => p.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
    const v = get(dict, path);
    if (v != null) return v;
    const fb = get(copy.en, path);
    return fb != null ? fb : path;
  };
}

function Brand({ white, sub }) {
  return (
    <div className="site-brand">
      <span className={`site-brand-name ${white ? 'white' : ''}`}>Spain 24/7</span>
      <span className={`site-brand-powered ${white ? 'white' : ''}`}>{sub}</span>
    </div>
  );
}

export default function ToolShell({ title, note, children, progress = null }) {
  const t = useT();

  useEffect(() => {
    if (typeof document !== 'undefined' && title) document.title = `${title} | Spain 24/7`;
  }, [title]);

  return (
    <div className="calc-shell">
      <header className="calc-header">
        <Brand sub={t('home.brand_sub')} />
        <div className="tk-header-right">
          <SiteNav active="tools" />
          <LangSwitcher />
        </div>
      </header>

      {progress != null && (
        <div className="tk-progress" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
          <div className="tk-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      )}

      <main className="step-screen">{children}</main>

      <SiteFooter note={note} />
    </div>
  );
}

// The opening screen. One promise, one button, and the two or three facts that tell a
// reader this was built by someone who knows the subject.
export function Intro({ eyebrow, headline, body, points, cta, onStart, minutes }) {
  return (
    <div className="step-inner tk-intro">
      {eyebrow && <div className="tk-eyebrow">{eyebrow}</div>}
      <h1 className="tk-intro-headline">{headline}</h1>
      {body && <p className="tk-intro-body">{body}</p>}
      {points && points.length > 0 && (
        <ul className="tk-points">
          {points.map((p, i) => <li key={i}>{p}</li>)}
        </ul>
      )}
      <div className="tk-intro-cta">
        <button className="btn-primary" onClick={onStart}>{cta}</button>
        {minutes && <span className="tk-minutes">{minutes}</span>}
      </div>
    </div>
  );
}

// One question, one screen. `hint` is where the reassurance goes, and it is not optional
// on any question a reader might not know the answer to.
export function Step({ n, of, question, hint, children, onBack, onNext, nextLabel, nextDisabled }) {
  return (
    <div className="step-inner">
      <div className="tk-step-meta">{of ? `Question ${n} of ${of}` : ''}</div>
      <h2 className="step-question">{question}</h2>
      {hint && <p className="tk-hint">{hint}</p>}
      <div className="tk-step-body">{children}</div>
      <div className="tk-step-nav">
        {onBack && <button className="btn-back" onClick={onBack}>Back</button>}
        {onNext && (
          <button className="btn-primary" onClick={onNext} disabled={nextDisabled}>
            {nextLabel || 'Continue'}
          </button>
        )}
      </div>
    </div>
  );
}

// A stack of choices. Cards rather than a native radio group, because the tap target is
// the whole card and these are read on phones on patchy Spanish wifi.
export function Options({ items, value, onChange, columns = 1 }) {
  return (
    <div className={columns > 1 ? 'tk-options tk-options-grid' : 'tk-options'} role="radiogroup">
      {items.map(item => {
        const selected = value === item.value;
        return (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={selected}
            className={`option-card tk-option${selected ? ' selected' : ''}`}
            onClick={() => onChange(item.value)}
          >
            <span className="tk-option-text">
              <span className="option-title">{item.label}</span>
              {item.desc && <span className="option-desc">{item.desc}</span>}
            </span>
            <span className="tk-option-mark" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}

export function NumberField({ label, value, onChange, prefix, suffix, placeholder, hint, min, max }) {
  return (
    <div className="input-group tk-field">
      {label && <label className="tk-label">{label}</label>}
      <div className="tk-input-wrap">
        {prefix && <span className="tk-affix">{prefix}</span>}
        <input
          className="value-input tk-input"
          type="number"
          inputMode="decimal"
          value={value}
          min={min}
          max={max}
          placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
        />
        {suffix && <span className="tk-affix tk-affix-end">{suffix}</span>}
      </div>
      {hint && <p className="tk-hint tk-hint-tight">{hint}</p>}
    </div>
  );
}

export function DateField({ label, value, onChange, hint, max, min }) {
  return (
    <div className="input-group tk-field">
      {label && <label className="tk-label">{label}</label>}
      <input className="value-input tk-input" type="date" value={value} min={min} max={max} onChange={e => onChange(e.target.value)} />
      {hint && <p className="tk-hint tk-hint-tight">{hint}</p>}
    </div>
  );
}

// The result. The answer is the biggest thing on the screen; the method is below it.
// `tone` drives the accent only, never the meaning, because colour alone must not carry
// information.
export function Result({ headline, sub, tone = 'neutral', children, onRestart, restartLabel }) {
  return (
    <div className="step-inner tk-result">
      <div className={`tk-verdict tk-verdict-${tone}`}>
        <h2 className="tk-verdict-headline">{headline}</h2>
        {sub && <p className="tk-verdict-sub">{sub}</p>}
      </div>
      {children}
      {onRestart && (
        <div className="tk-step-nav tk-restart">
          <button className="btn-back" onClick={onRestart}>{restartLabel || 'Start again'}</button>
        </div>
      )}
    </div>
  );
}

export function Panel({ title, children, kind = 'plain' }) {
  return (
    <section className={`tk-panel tk-panel-${kind}`}>
      {title && <h3 className="tk-panel-title">{title}</h3>}
      {children}
    </section>
  );
}

export function Rows({ items }) {
  return (
    <dl className="tk-rows">
      {items.filter(Boolean).map((r, i) => (
        <div className="tk-row" key={i}>
          <dt>{r.label}</dt>
          <dd className={r.strong ? 'tk-row-strong' : ''}>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

// Checklist output for the generator tools. Ticking is local to the browser session and
// is there so a reader can work down the list in one sitting, not as stored state.
export function Checklist({ groups, storageKey }) {
  const [done, setDone] = useState({});
  const toggle = k => setDone(d => ({ ...d, [k]: !d[k] }));
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const ticked = Object.values(done).filter(Boolean).length;

  return (
    <div className="tk-checklist">
      <div className="tk-checklist-head">
        <span className="tk-checklist-count">{ticked} of {total} done</span>
        <button className="tk-print" onClick={() => window.print()}>Print this list</button>
      </div>
      {groups.map((g, gi) => (
        <section className="tk-cl-group" key={gi}>
          <h3 className="tk-cl-title">{g.title}</h3>
          {g.note && <p className="tk-cl-note">{g.note}</p>}
          <ul className="tk-cl-items">
            {g.items.map((it, ii) => {
              const key = `${gi}-${ii}`;
              const text = typeof it === 'string' ? it : it.text;
              const why = typeof it === 'string' ? null : it.why;
              return (
                <li key={key} className={done[key] ? 'is-done' : ''}>
                  <label>
                    <input type="checkbox" checked={!!done[key]} onChange={() => toggle(key)} />
                    <span className="tk-cl-text">
                      {text}
                      {why && <span className="tk-cl-why">{why}</span>}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
