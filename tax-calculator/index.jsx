import { useState } from 'react';
import { calculateTax } from './taxCalculations';
import { saveLead } from './supabase';
import { useT, LLink } from '../i18n.jsx';
import LangSwitcher from '../LangSwitcher.jsx';

// code/flag/isEUEEA stay constant; display names come from i18n
const COUNTRIES = [
  { code: 'norway',         flag: '🇳🇴', isEUEEA: true  },
  { code: 'sweden',         flag: '🇸🇪', isEUEEA: true  },
  { code: 'denmark',        flag: '🇩🇰', isEUEEA: true  },
  { code: 'germany',        flag: '🇩🇪', isEUEEA: true  },
  { code: 'france',         flag: '🇫🇷', isEUEEA: true  },
  { code: 'netherlands',    flag: '🇳🇱', isEUEEA: true  },
  { code: 'united_kingdom', flag: '🇬🇧', isEUEEA: false },
  { code: 'belgium',        flag: '🇧🇪', isEUEEA: true  },
  { code: 'ireland',        flag: '🇮🇪', isEUEEA: true  },
  { code: 'finland',        flag: '🇫🇮', isEUEEA: true  },
  { code: 'austria',        flag: '🇦🇹', isEUEEA: true  },
  { code: 'iceland',        flag: '🇮🇸', isEUEEA: true  },
  { code: 'other_eu_eea',   flag: '🇪🇺', isEUEEA: true  },
  { code: 'other',          flag: '🌍', isEUEEA: false },
];

const PROPERTY_USE_CODES = ['personal', 'short_rental', 'long_rental', 'mixed'];
const FILING_CODES        = ['always', 'missed_some', 'never', 'unsure'];

const fmt = (n) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const TOTAL_STEPS = 6;
const progressForStep = (step) => {
  const map = { country: 1, property_use: 2, cadastral_value: 3, revision: 4, rental_income: 4, filing: 5, email: 6 };
  return ((map[step] || 0) / TOTAL_STEPS) * 100;
};

function Logo({ white, sub }) {
  return (
    <div className="site-brand">
      <span className={`site-brand-name ${white ? 'white' : ''}`}>Spain 24/7</span>
      <span className={`site-brand-powered ${white ? 'white' : ''}`}>{sub}</span>
    </div>
  );
}

export default function TaxCalculator() {
  const t  = useT();
  const tt = (k) => t('calc_tax.' + k);
  const tc = (k) => t('common.' + k);
  const countryName = (code) => t('countries.' + code);

  if (typeof document !== 'undefined') {
    document.title = `${t('cards.tax.title')} | Spain 24/7`;
  }

  const [step, setStep]             = useState('intro');
  const [form, setForm]             = useState({ country: '', countryName: '', propertyUse: '', cadastralValue: '', hadRecentRevision: null, rentalIncome: '', filingHistory: '', email: '' });
  const [results, setResults]       = useState(null);
  const [aiReport, setAiReport]     = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const [emailError, setEmailError] = useState('');

  const needsRevision = form.propertyUse === 'personal' || form.propertyUse === 'mixed';
  const needsRental   = form.propertyUse === 'short_rental' || form.propertyUse === 'long_rental' || form.propertyUse === 'mixed';
  const STEP_ORDER    = ['country', 'property_use', 'cadastral_value', 'revision', 'rental_income', 'filing', 'email'];

  const getNextStep = (c) => {
    if (c === 'cadastral_value') { if (needsRevision) return 'revision'; if (needsRental) return 'rental_income'; return 'filing'; }
    if (c === 'revision') return needsRental ? 'rental_income' : 'filing';
    const i = STEP_ORDER.indexOf(c); return STEP_ORDER[i + 1] || 'results';
  };
  const getPrevStep = (c) => {
    if (c === 'filing') { if (needsRental) return 'rental_income'; if (needsRevision) return 'revision'; return 'cadastral_value'; }
    if (c === 'rental_income') return needsRevision ? 'revision' : 'cadastral_value';
    const i = STEP_ORDER.indexOf(c); return i > 0 ? STEP_ORDER[i - 1] : 'intro';
  };

  const go   = (s) => setStep(s);
  const next = () => go(getNextStep(step));
  const back = () => go(step === 'country' ? 'intro' : getPrevStep(step));

  const selectCountry     = (c)    => { setForm(f => ({ ...f, country: c.code, countryName: countryName(c.code) })); setTimeout(() => go('property_use'), 160); };
  const selectPropertyUse = (code) => { setForm(f => ({ ...f, propertyUse: code })); setTimeout(() => go('cadastral_value'), 160); };
  const selectRevision    = (val)  => { setForm(f => ({ ...f, hadRecentRevision: val })); setTimeout(() => go(needsRental ? 'rental_income' : 'filing'), 160); };
  const selectFiling      = (code) => { setForm(f => ({ ...f, filingHistory: code })); setTimeout(() => go('email'), 160); };

  const handleEmailSubmit = async () => {
    if (!validateEmail(form.email)) { setEmailError(tt('email_invalid')); return; }
    setEmailError(''); setIsLoading(true); setStep('loading');
    const calc = calculateTax(form); setResults(calc);
    await saveLead({ email: form.email, formData: form, results: calc });
    try {
      const res  = await fetch('/api/generate-report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taxData: { countryName: form.countryName, taxRate: calc.taxRate, isEUEEA: calc.isEUEEA, propertyUse: form.propertyUse, annualTax: calc.annualTax, filingHistory: form.filingHistory, yearsUnfiled: calc.yearsUnfiled, totalLiability: calc.totalLiability } }) });
      const data = await res.json(); if (data.report) setAiReport(data.report);
    } catch (err) { console.error(err); }
    setIsLoading(false); setStep('results');
  };

  const stepNum  = { country: 1, property_use: 2, cadastral_value: 3, revision: 4, rental_income: needsRevision ? 5 : 4, filing: 5, email: 6 }[step];
  const isOnDark = step === 'intro';

  const resultHeadline = () => {
    if (!results) return '';
    if (results.yearsUnfiled === 0) return tt('headline_current');
    if (results.yearsUnfiled === 1) return tt('headline_unfiled_one');
    return tt('headline_unfiled_many').replace('{n}', results.yearsUnfiled);
  };

  const propertyUseTitle = (code) => tt(`use_${code}_t`);

  return (
    <div className="calc-shell">

      <header className="calc-header" style={isOnDark ? { background: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.1)', position: 'absolute' } : {}}>
        <Logo white={isOnDark} sub={t('home.brand_sub')} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {!isOnDark && !['loading','results'].includes(step) && <span className="calc-header-tag">{tt('header_tag')}</span>}
          <LangSwitcher />
        </div>
      </header>

      {!['intro','loading','results'].includes(step) && (
        <div className="progress-wrap">
          <div className="progress-inner">
            <span className="progress-label">{tc('step')} {stepNum} {tc('of')} {TOTAL_STEPS}</span>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${progressForStep(step)}%` }} /></div>
          </div>
        </div>
      )}

      {step === 'intro' && (
        <div className="intro-hero">
          <div className="intro-left">
            <div className="intro-hero-inner">
              <div className="intro-eyebrow"><span className="intro-eyebrow-line" /><span className="intro-eyebrow-text">{tt('intro_eyebrow')}</span></div>
              <h1 className="intro-headline">{tt('intro_h1')}<br />{tt('intro_h2')}<br />{tt('intro_h3')} <em>{tt('intro_em')}</em></h1>
              <p className="intro-body">{tt('intro_body')}</p>
              <div className="intro-cta-row">
                <button className="btn-primary-outline" onClick={() => go('country')}>{tt('intro_cta')} <span>&#8594;</span></button>
              </div>
              <div className="intro-trust-row">
                <span className="intro-trust-item">{tc('takes_2_min')}</span><span className="intro-trust-dot" />
                <span className="intro-trust-item">{tc('no_account')}</span><span className="intro-trust-dot" />
                <span className="intro-trust-item">{tc('free')}</span><span className="intro-trust-dot" />
                <span className="intro-trust-item">{tc('trusted')}</span>
              </div>
            </div>
          </div>
          <div className="intro-right">
            <img src="/images/hero.jpg" alt="Spanish property owners" />
          </div>
        </div>
      )}

      {step === 'country' && (
        <div className="step-screen"><div className="step-inner">
          <button className="btn-back" onClick={back}>&#8592; {tc('back')}</button>
          <p className="step-meta">{tc('question')} 1 {tc('of')} {TOTAL_STEPS}</p>
          <h2 className="step-question">{tt('country_q')}</h2>
          <p className="step-hint">{tt('country_hint')}</p>
          <div className="country-grid">
            {COUNTRIES.map(c => (
              <button key={c.code} className={`country-btn ${form.country === c.code ? 'selected' : ''}`} onClick={() => selectCountry(c)}>
                <span className="country-flag">{c.flag}</span><span>{countryName(c.code)}</span>
              </button>
            ))}
          </div>
        </div></div>
      )}

      {step === 'property_use' && (
        <div className="step-screen"><div className="step-inner">
          <button className="btn-back" onClick={back}>&#8592; {tc('back')}</button>
          <p className="step-meta">{tc('question')} 2 {tc('of')} {TOTAL_STEPS}</p>
          <h2 className="step-question">{tt('use_q')}</h2>
          <p className="step-hint">{tt('use_hint')}</p>
          <div className="option-stack">
            {PROPERTY_USE_CODES.map(code => (
              <button key={code} className={`option-card ${form.propertyUse === code ? 'selected' : ''}`} onClick={() => selectPropertyUse(code)}>
                <div><p className="option-title">{tt(`use_${code}_t`)}</p><p className="option-desc">{tt(`use_${code}_d`)}</p></div>
              </button>
            ))}
          </div>
        </div></div>
      )}

      {step === 'cadastral_value' && (
        <div className="step-screen"><div className="step-inner">
          <button className="btn-back" onClick={back}>&#8592; {tc('back')}</button>
          <p className="step-meta">{tc('question')} 3 {tc('of')} {TOTAL_STEPS}</p>
          <h2 className="step-question">{tt('cadastral_q')}</h2>
          <p className="step-hint">{tt('cadastral_hint')}</p>
          <div className="input-group">
            <div className="input-prefix-wrap">
              <span className="input-prefix">€</span>
              <input className="value-input" type="number" placeholder="0" min="0" value={form.cadastralValue}
                onChange={e => setForm(f => ({ ...f, cadastralValue: e.target.value }))} autoFocus />
            </div>
          </div>
          <button className="btn-primary" disabled={!form.cadastralValue || parseFloat(form.cadastralValue) <= 0} onClick={next}>{tc('continue')} <span className="arrow">&#8594;</span></button>
          <button className="btn-skip" onClick={() => { setForm(f => ({ ...f, cadastralValue: '100000' })); next(); }}>{tt('cadastral_skip')}</button>
        </div></div>
      )}

      {step === 'revision' && (
        <div className="step-screen"><div className="step-inner">
          <button className="btn-back" onClick={back}>&#8592; {tc('back')}</button>
          <p className="step-meta">{tc('question')} 4 {tc('of')} {TOTAL_STEPS}</p>
          <h2 className="step-question">{tt('revision_q')}</h2>
          <p className="step-hint">{tt('revision_hint')}</p>
          <div className="three-choice">
            {[{ val: true, label: tt('revision_yes') }, { val: false, label: tt('revision_no') }, { val: 'unsure', label: tt('revision_unsure') }].map(opt => (
              <button key={String(opt.val)} className={`choice-btn ${form.hadRecentRevision === opt.val ? 'selected' : ''}`} onClick={() => selectRevision(opt.val)}>{opt.label}</button>
            ))}
          </div>
        </div></div>
      )}

      {step === 'rental_income' && (
        <div className="step-screen"><div className="step-inner">
          <button className="btn-back" onClick={back}>&#8592; {tc('back')}</button>
          <p className="step-meta">{tc('question')} {needsRevision ? 5 : 4} {tc('of')} {TOTAL_STEPS}</p>
          <h2 className="step-question">{tt('rental_q')}</h2>
          <p className="step-hint">{tt('rental_hint')}</p>
          <div className="input-group">
            <div className="input-prefix-wrap">
              <span className="input-prefix">€</span>
              <input className="value-input" type="number" placeholder="0" min="0" value={form.rentalIncome}
                onChange={e => setForm(f => ({ ...f, rentalIncome: e.target.value }))} autoFocus />
            </div>
          </div>
          <button className="btn-primary" disabled={!form.rentalIncome || parseFloat(form.rentalIncome) <= 0} onClick={next}>{tc('continue')} <span className="arrow">&#8594;</span></button>
        </div></div>
      )}

      {step === 'filing' && (
        <div className="step-screen"><div className="step-inner">
          <button className="btn-back" onClick={back}>&#8592; {tc('back')}</button>
          <p className="step-meta">{tc('question')} 5 {tc('of')} {TOTAL_STEPS}</p>
          <h2 className="step-question">{tt('filing_q')}</h2>
          <p className="step-hint">{tt('filing_hint')}</p>
          <div className="option-stack">
            {FILING_CODES.map(code => (
              <button key={code} className={`option-card ${form.filingHistory === code ? 'selected' : ''}`} onClick={() => selectFiling(code)}>
                <div><p className="option-title">{tt(`filing_${code}_t`)}</p><p className="option-desc">{tt(`filing_${code}_d`)}</p></div>
              </button>
            ))}
          </div>
        </div></div>
      )}

      {step === 'email' && (
        <div className="step-screen"><div className="step-inner">
          <button className="btn-back" onClick={back}>&#8592; {tc('back')}</button>
          <p className="step-meta">{tc('question')} 6 {tc('of')} {TOTAL_STEPS}</p>
          <h2 className="step-question">{tt('email_q')}</h2>
          <p className="step-hint">{tt('email_hint')}</p>
          <div className="email-input-wrap">
            <input className={`email-input ${emailError ? 'error' : ''}`} type="email" placeholder="your@email.com"
              value={form.email} onChange={e => { setForm(f => ({ ...f, email: e.target.value })); if (emailError) setEmailError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleEmailSubmit()} autoFocus />
            {emailError && <p style={{ color: '#C0392B', fontSize: 12, marginTop: 6, fontFamily: 'var(--font-sans)' }}>{emailError}</p>}
          </div>
          <button className="btn-primary" onClick={handleEmailSubmit} disabled={!form.email}>{tt('email_cta')} <span className="arrow">&#8594;</span></button>
          <p className="privacy-note">{tt('email_privacy')}</p>
        </div></div>
      )}

      {step === 'loading' && (
        <div className="loading-screen">
          <div className="loading-spinner" />
          <p className="loading-title">{tt('loading_title')}</p>
          <p className="loading-sub">{tt('loading_sub')}</p>
        </div>
      )}

      {step === 'results' && results && (
        <div className="results-screen"><div className="results-inner">
          <StatusBadge status={results.status} tt={tt} />
          <h2 className="results-headline">{resultHeadline()}</h2>
          <p className="results-subline">{tt('subline').replace('{country}', form.countryName).replace('{use}', propertyUseTitle(form.propertyUse))}</p>

          <div className="tax-panel">
            <p className="tax-panel-label">{tt('panel_label')}</p>
            <p className="tax-panel-amount">{fmt(results.annualTax)}</p>
            <p className="tax-panel-period">{tt('panel_period')}</p>
            <div className="tax-panel-grid">
              <div><p className="tax-panel-item-label">{tt('panel_rate')}</p><p className="tax-panel-item-value">{results.taxRate}%</p></div>
              <div><p className="tax-panel-item-label">{tt('panel_residency')}</p><p className="tax-panel-item-value">{results.isEUEEA ? tt('panel_eu') : tt('panel_non_eu')}</p></div>
              {results.deemedIncome > 0 && <div><p className="tax-panel-item-label">{tt('panel_deemed')}</p><p className="tax-panel-item-value">{fmt(results.deemedIncome)} ({results.deemedIncomeRate}%)</p></div>}
              {results.rentalIncome > 0 && <div><p className="tax-panel-item-label">{tt('panel_rental_assessed')}</p><p className="tax-panel-item-value">{fmt(results.rentalIncome)}</p></div>}
            </div>
          </div>

          {results.yearsUnfiled > 0 && (
            <div className="liability-panel">
              <p className="liability-title">{tt('liability_title')}</p>
              <div className="liability-row"><span>{tt('liability_this_year')}</span><span>{fmt(results.annualTax)}</span></div>
              <div className="liability-row"><span>{tt('liability_unpaid')} ({results.yearsUnfiled} × {fmt(results.annualTax)})</span><span>{fmt(results.outstandingTax)}</span></div>
              {results.penalty > 0 && <div className="liability-row"><span>{tt('liability_penalty')}</span><span>{fmt(results.penalty)}</span></div>}
              <div className="liability-row"><span>{tt('liability_total')}</span><span>{fmt(results.totalLiability)}</span></div>
              <p className="liability-disclaimer">{tt('liability_disclaimer')}</p>
            </div>
          )}

          {aiReport && (
            <div className="ai-panel">
              <p className="ai-panel-label">{tt('ai_label')}</p>
              <div className="ai-panel-text">{aiReport.split('\n\n').filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}</div>
            </div>
          )}

          <div className="cta-panel">
            <p className="cta-eyebrow">{tt('cta_eyebrow')}</p>
            <p className="cta-title">{tt('cta_title')}</p>
            <p className="cta-body">{tt('cta_body')}</p>
            <a href="https://getbueno.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
              <button className="btn-primary" style={{ marginBottom: 0 }}>{tt('cta_button')} <span className="arrow">&#8594;</span></button>
            </a>
            <p className="cta-price">{tt('cta_price')}</p>
          </div>

          <button className="btn-skip" onClick={() => { setStep('intro'); setResults(null); setAiReport(''); setForm({ country: '', countryName: '', propertyUse: '', cadastralValue: '', hadRecentRevision: null, rentalIncome: '', filingHistory: '', email: '' }); }}>
            {tt('restart')}
          </button>

          <div style={{ textAlign: 'center', padding: '16px 0 4px', borderTop: '1px solid var(--border)', marginTop: 8 }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{tt('also_from')}</p>
            <LLink to="/cost-audit" style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--accent)', textDecoration: 'none' }}>
              {tt('cross_cost')} &#8594;
            </LLink>
          </div>
        </div></div>
      )}

      {!['intro'].includes(step) && (
        <footer className="calc-footer">{tt('footer')}</footer>
      )}

    </div>
  );
}

function StatusBadge({ status, tt }) {
  const labels = { current: tt('status_current'), at_risk: tt('status_at_risk'), overdue: tt('status_overdue') };
  return <div className={`status-badge ${status}`}><span className="status-dot" />{labels[status]}</div>;
}
