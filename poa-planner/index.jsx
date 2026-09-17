import { useState } from 'react';
import ToolShell, { Intro, Panel, useCopy } from '../ToolShell.jsx';
import SourceNote, { ToolDisclaimer } from '../SourceNote.jsx';
import { useLocale } from '../i18n.jsx';
import { rule } from '../rules/index.js';
import { useBrandProfile, BrandHeader, BrandSignature, hasProfile } from '../BrandProfile.jsx';
import { LETTER_LANGS, LETTER_LANG_LABELS } from '../deal-checklist/letter.js';
import copyDict from './copy.js';
import { buildPlan, buildPoaLetter, COUNTRY_KEYS, COUNTRY_ES, DOC_LANGS, PURPOSE_KEYS } from './plan.js';

// Power of attorney planner, for lawyers and agents.
//
// Which countries are Apostille parties is read from the rules base, and the two partial
// rules on consular and foreign notarial powers render their caveats with the sources.
const R = { apostille: rule('poa.apostille_parties').value };
['poa.consular', 'poa.foreign_notary'].forEach(id => rule(id));

function Pills({ label, value, onChange, items }) {
  return (
    <div className="dc-choice">
      <p className="tk-label">{label}</p>
      <div className="dc-choice-row" role="radiogroup" aria-label={label}>
        {items.map(i => (
          <button key={i.value} type="button" role="radio" aria-checked={value === i.value}
            className={`dc-pill${value === i.value ? ' selected' : ''}`} onClick={() => onChange(i.value)}>{i.label}</button>
        ))}
      </div>
    </div>
  );
}

export default function PoaPlanner() {
  const c = useCopy(copyDict);
  const { locale } = useLocale();
  const { profile } = useBrandProfile();
  const [started, setStarted] = useState(false);
  const [a, setA] = useState({ country: '', purposes: [], consulate: 'unsure', language: 'other', clientName: '' });
  const [docLang, setDocLang] = useState('en');
  const [letterLang, setLetterLang] = useState(LETTER_LANGS.includes(locale) ? locale : 'en');
  const [copied, setCopied] = useState(false);
  const set = (k, v) => setA(p => ({ ...p, [k]: v }));
  const toggle = k => setA(p => ({ ...p, purposes: p.purposes.includes(k) ? p.purposes.filter(x => x !== k) : [...p.purposes, k] }));

  const countries = c('countries');
  const uiCountry = k => (k === 'other' ? c('country_other') : countries[k] || k);
  const docCountry = k => (docLang === 'es' ? COUNTRY_ES[k] || k : k);
  const ready = a.country && a.purposes.length > 0;
  const plan = ready ? buildPlan(a, R, docLang, docCountry) : null;
  const letter = plan ? buildPoaLetter(a, plan, letterLang) : null;
  const letterText = letter ? [letter.greeting, '', ...letter.paragraphs.flatMap(p => [p, '']), letter.regards,
    ...(hasProfile(profile) ? [profile.name, profile.role, profile.firm, profile.phone, profile.email].filter(Boolean) : []), '', letter.note].join('\n') : '';
  const copyLetter = async () => {
    try { await navigator.clipboard.writeText(letterText); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { /* clipboard unavailable */ }
  };

  return (
    <ToolShell title={c('title')} note={c('note')}>
      {!started && (
        <Intro eyebrow={c('eyebrow')} headline={c('headline')} body={c('body')} points={c('points')}
          cta={c('cta')} minutes={c('minutes')} onStart={() => setStarted(true)} />
      )}

      {started && (
        <div className="step-inner sp-form">
          <h1 className="tk-intro-headline sp-form-title">{c('title')}</h1>
          <div className="sp-grid">
            <label className="tk-field sp-field"><span className="tk-label">{c('q_country')}</span>
              <select className="value-input tk-input dc-select" value={a.country} onChange={e => set('country', e.target.value)}>
                <option value="" />
                {COUNTRY_KEYS.map(k => <option key={k} value={k}>{uiCountry(k)}</option>)}
              </select></label>
            <label className="tk-field sp-field"><span className="tk-label">{c('f_client')}</span>
              <input className="value-input tk-input" maxLength={80} value={a.clientName} onChange={e => set('clientName', e.target.value)} /></label>
          </div>

          <p className="tk-label sp-gap">{c('q_purposes')}</p>
          <p className="tk-hint tk-hint-tight">{c('q_purposes_hint')}</p>
          <div className="sp-checks">
            {PURPOSE_KEYS.map(k => (
              <label key={k} className="sp-check">
                <input type="checkbox" checked={a.purposes.includes(k)} onChange={() => toggle(k)} />
                <span>{c(`purpose_${k}`)}</span>
              </label>
            ))}
          </div>

          <div className="sp-gap">
            <Pills label={c('q_consulate')} value={a.consulate} onChange={v => set('consulate', v)} items={['yes', 'no', 'unsure'].map(k => ({ value: k, label: c(`c_${k}`) }))} />
            <Pills label={c('q_language')} value={a.language} onChange={v => set('language', v)} items={['spanish', 'bilingual', 'other'].map(k => ({ value: k, label: c(`l_${k}`) }))} />
          </div>

          <div className="sp-grid">
            <label className="tk-field sp-field"><span className="tk-label">{c('f_doclang')}</span>
              <select className="value-input tk-input dc-select" value={docLang} onChange={e => setDocLang(e.target.value)}>
                {DOC_LANGS.map(l => <option key={l} value={l}>{LETTER_LANG_LABELS[l]}</option>)}
              </select></label>
            <label className="tk-field sp-field"><span className="tk-label">{c('f_letterlang')}</span>
              <select className="value-input tk-input dc-select" value={letterLang} onChange={e => setLetterLang(e.target.value)}>
                {LETTER_LANGS.map(l => <option key={l} value={l}>{LETTER_LANG_LABELS[l]}</option>)}
              </select></label>
          </div>

          {!ready && <p className="tk-hint">{c('need')}</p>}

          {plan && (
            <>
              <div className="sp-toolbar"><span /><button type="button" className="btn-primary" onClick={() => window.print()}>{c('print')}</button></div>
              <article className="sp-doc" lang={docLang}>
                <BrandHeader profile={profile} />
                <section className="sp-sec">
                  <h2 className="sp-h2">{plan.recTitle}</h2>
                  <p className="sp-p sp-rec">{plan.rec}</p>
                  {plan.translation && <p className="sp-p">{plan.translation}</p>}
                </section>
                <div className="poa-routes">
                  {plan.routes.map(r => (
                    <section key={r.key} className={`poa-route${r.preferred ? ' preferred' : ''}`}>
                      {r.preferred && <span className="hub-badge gold">{c('preferred')}</span>}
                      <h3 className="sp-h3">{r.title}</h3>
                      <ol className="sp-list">{r.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
                    </section>
                  ))}
                </div>
                <section className="sp-sec">
                  <h2 className="sp-h2">{plan.powersTitle}</h2>
                  <ul className="sp-list">{plan.powers.map((p, i) => <li key={i}>{p}</li>)}</ul>
                </section>
                <section className="sp-sec">
                  <h2 className="sp-h2">{plan.tipsTitle}</h2>
                  <ul className="sp-list">{plan.tips.map((p, i) => <li key={i}>{p}</li>)}</ul>
                </section>
                <Panel title={c('sources_t')} kind="plain"><SourceNote ids={plan.rules} /></Panel>
              </article>

              <section className="dc-letter">
                <div className="dc-letter-head">
                  <h2 className="dc-h2">{c('letter_t')}</h2>
                  <button type="button" className="btn-back dc-copy" onClick={copyLetter}>{copied ? c('copied') : c('copy_letter')}</button>
                </div>
                <article className="dc-letter-body" lang={letterLang}>
                  <div className="dc-print-only"><BrandHeader profile={profile} /></div>
                  <p>{letter.greeting}</p>
                  {letter.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
                  <p>{letter.regards}</p>
                  <BrandSignature profile={profile} />
                  <p className="dc-letter-note">{letter.note}</p>
                </article>
              </section>
              <ToolDisclaimer>{c('note')}</ToolDisclaimer>
            </>
          )}
        </div>
      )}
    </ToolShell>
  );
}
