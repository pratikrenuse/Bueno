import { useState, useEffect } from 'react';
import { calculateClaim, YEAR_CODES, CLAIM_CODES } from './mortgageCalculations';
import { saveLead } from './supabase';
import { useT, LLink } from '../i18n.jsx';
import LangSwitcher from '../LangSwitcher.jsx';

const fmt = (n) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

const TOTAL_STEPS = 4;
const progressForStep = (step) => {
  const map = { year: 1, amount: 2, claims: 3, email: 4 };
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

export default function MortgageClaim() {
  const t  = useT();
  const tt = (k) => t('calc_claim.' + k);
  const tc = (k) => t('common.' + k);

  if (typeof document !== 'undefined') {
    document.title = `${t('cards.claim.title')} | Spain 24/7`;
  }

  const [step, setStep]         = useState('intro');
  const [form, setForm]         = useState({ year: '', mortgage: '', claims: [], unsure: false, email: '' });
  const [results, setResults]   = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [emailError, setError]  = useState('');

  // Each step change should land at the top so the headline and total are seen
  // first, rather than keeping the previous step's scroll position.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
    }
  }, [step]);

  const go = (s) => setStep(s);

  const back = () => {
    if (step === 'amount') go('year');
    else if (step === 'claims') go('amount');
    else if (step === 'email') go('claims');
    else if (step === 'ineligible') go('year');
    else go('intro');
  };

  const selectYear = (code) => {
    setForm(f => ({ ...f, year: code }));
    const eligible = code !== '2020_later' && code !== 'none';
    setTimeout(() => go(eligible ? 'amount' : 'ineligible'), 160);
  };

  const toggleClaim = (code) => {
    setForm(f => ({ ...f, unsure: false, claims: f.claims.includes(code) ? f.claims.filter(c => c !== code) : [...f.claims, code] }));
  };
  const chooseUnsure = () => setForm(f => ({ ...f, unsure: true, claims: [] }));

  const canContinueClaims = form.unsure || form.claims.length > 0;

  const handleEmailSubmit = async () => {
    if (!validateEmail(form.email)) { setError(tt('email_invalid')); return; }
    setError(''); setLoading(true); setStep('loading');
    const calc = calculateClaim(form);
    setResults(calc);
    await saveLead({ email: form.email, formData: form, results: calc });
    setTimeout(() => { setLoading(false); setStep('results'); }, 900);
  };

  const restart = () => {
    setStep('intro');
    setForm({ year: '', mortgage: '', claims: [], unsure: false, email: '' });
    setResults(null);
  };

  const isOnDark = step === 'intro';
  const stepNum  = { year: 1, amount: 2, claims: 3, email: 4 }[step];

  const rowLabel = (type) => tt('row_' + type);

  return (
    <div className="calc-shell">

      {/* Header */}
      <header className="calc-header"
        style={isOnDark ? { background: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.1)', position: 'absolute' } : {}}>
        <Logo white={isOnDark} sub={t('home.brand_sub')} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {!isOnDark && !['loading', 'results', 'ineligible'].includes(step) && (
            <span className="calc-header-tag">{tt('header_tag')}</span>
          )}
          <LangSwitcher />
        </div>
      </header>

      {/* Progress */}
      {!['intro', 'loading', 'results', 'ineligible'].includes(step) && (
        <div className="progress-wrap">
          <div className="progress-inner">
            <span className="progress-label">{tc('step')} {stepNum} {tc('of')} {TOTAL_STEPS}</span>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressForStep(step)}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* INTRO */}
      {step === 'intro' && (
        <div className="intro-hero">
          <div className="intro-left">
            <div className="intro-hero-inner">
              <div className="intro-eyebrow">
                <span className="intro-eyebrow-line" />
                <span className="intro-eyebrow-text">{tt('intro_eyebrow')}</span>
              </div>
              <h1 className="intro-headline">
                {tt('intro_h1')}<br />{tt('intro_h2')}<br /><em>{tt('intro_em')}</em>
              </h1>
              <p className="intro-body">{tt('intro_body')}</p>
              <div className="intro-cta-row">
                <button className="btn-primary-outline" onClick={() => go('year')}>
                  {tt('intro_cta')} <span>&#8594;</span>
                </button>
              </div>
              <div className="intro-trust-row">
                <span className="intro-trust-item">{tc('takes_2_min')}</span>
                <span className="intro-trust-dot" />
                <span className="intro-trust-item">{tc('no_account')}</span>
                <span className="intro-trust-dot" />
                <span className="intro-trust-item">{tc('free')}</span>
                <span className="intro-trust-dot" />
                <span className="intro-trust-item">{tc('trusted')}</span>
              </div>
            </div>
          </div>
          <div className="intro-right">
            <img src="/images/hero-home.jpg" alt="Foreign property owners in Spain" />
          </div>
        </div>
      )}

      {/* YEAR */}
      {step === 'year' && (
        <div className="step-screen"><div className="step-inner">
          <button className="btn-back" onClick={back}>&#8592; {tc('back')}</button>
          <p className="step-meta">{tc('question')} 1 {tc('of')} {TOTAL_STEPS}</p>
          <h2 className="step-question">{tt('year_q')}</h2>
          <p className="step-hint">{tt('year_hint')}</p>
          <div className="option-stack">
            {YEAR_CODES.map(code => (
              <button key={code} className={`option-card ${form.year === code ? 'selected' : ''}`} onClick={() => selectYear(code)}>
                <div><p className="option-title">{tt(`year_${code}_t`)}</p></div>
              </button>
            ))}
          </div>
        </div></div>
      )}

      {/* AMOUNT */}
      {step === 'amount' && (
        <div className="step-screen"><div className="step-inner">
          <button className="btn-back" onClick={back}>&#8592; {tc('back')}</button>
          <p className="step-meta">{tc('question')} 2 {tc('of')} {TOTAL_STEPS}</p>
          <h2 className="step-question">{tt('amount_q')}</h2>
          <p className="step-hint">{tt('amount_hint')}</p>
          <div className="input-group">
            <div className="input-prefix-wrap">
              <span className="input-prefix">&euro;</span>
              <input className="value-input" type="number" placeholder="0" min="0" value={form.mortgage}
                onChange={e => setForm(f => ({ ...f, mortgage: e.target.value }))} autoFocus />
            </div>
          </div>
          <button className="btn-primary" disabled={!form.mortgage || parseFloat(form.mortgage) <= 0} onClick={() => go('claims')}>
            {tc('continue')} <span className="arrow">&#8594;</span>
          </button>
          <button className="btn-skip" onClick={() => { setForm(f => ({ ...f, mortgage: '150000' })); go('claims'); }}>
            {tt('amount_skip')}
          </button>
        </div></div>
      )}

      {/* CLAIMS (multi-select) */}
      {step === 'claims' && (
        <div className="step-screen"><div className="step-inner">
          <button className="btn-back" onClick={back}>&#8592; {tc('back')}</button>
          <p className="step-meta">{tc('question')} 3 {tc('of')} {TOTAL_STEPS}</p>
          <h2 className="step-question">{tt('claims_q')}</h2>
          <p className="step-hint">{tt('claims_hint')}</p>
          <div className="option-stack">
            {CLAIM_CODES.map(code => (
              <button key={code} className={`option-card ${!form.unsure && form.claims.includes(code) ? 'selected' : ''}`} onClick={() => toggleClaim(code)}>
                <div>
                  <p className="option-title">{tt(`claim_${code}_t`)}</p>
                  <p className="option-desc">{tt(`claim_${code}_d`)}</p>
                </div>
              </button>
            ))}
            <button className={`option-card ${form.unsure ? 'selected' : ''}`} onClick={chooseUnsure}>
              <div>
                <p className="option-title">{tt('claim_unsure_t')}</p>
                <p className="option-desc">{tt('claim_unsure_d')}</p>
              </div>
            </button>
          </div>
          <button className="btn-primary" disabled={!canContinueClaims} onClick={() => go('email')}>
            {tt('claims_cta')} <span className="arrow">&#8594;</span>
          </button>
        </div></div>
      )}

      {/* EMAIL */}
      {step === 'email' && (
        <div className="step-screen"><div className="step-inner">
          <button className="btn-back" onClick={back}>&#8592; {tc('back')}</button>
          <p className="step-meta">{tc('question')} 4 {tc('of')} {TOTAL_STEPS}</p>
          <h2 className="step-question">{tt('email_q')}</h2>
          <p className="step-hint">{tt('email_hint')}</p>
          <div className="email-input-wrap">
            <input className={`email-input ${emailError ? 'error' : ''}`} type="email" placeholder="your@email.com"
              value={form.email} onChange={e => { setForm(f => ({ ...f, email: e.target.value })); if (emailError) setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleEmailSubmit()} autoFocus />
            {emailError && <p style={{ color: '#C0392B', fontSize: 12, marginTop: 6, fontFamily: 'var(--font-sans)' }}>{emailError}</p>}
          </div>
          <button className="btn-primary" onClick={handleEmailSubmit} disabled={!form.email}>
            {tt('email_cta')} <span className="arrow">&#8594;</span>
          </button>
          <p className="privacy-note">{tt('email_privacy')}</p>
        </div></div>
      )}

      {/* LOADING */}
      {step === 'loading' && (
        <div className="loading-screen">
          <div className="loading-spinner" />
          <p className="loading-title">{tt('loading_title')}</p>
          <p className="loading-sub">{tt('loading_sub')}</p>
        </div>
      )}

      {/* INELIGIBLE */}
      {step === 'ineligible' && (
        <div className="results-screen"><div className="results-inner">
          <div className="status-badge current"><span className="status-dot" />{tt('ineligible_status')}</div>
          <h2 className="results-headline">{tt('ineligible_headline')}</h2>
          <p className="results-subline">{tt('ineligible_body')}</p>
          <div className="cta-panel">
            <p className="cta-eyebrow">{tt('also_from')}</p>
            <p className="cta-title">{tt('ineligible_cta')}</p>
            <LLink to="/tax-calculator" style={{ textDecoration: 'none', display: 'block' }}>
              <button className="btn-primary" style={{ marginBottom: 10 }}>{tt('cross_tax')} <span className="arrow">&#8594;</span></button>
            </LLink>
            <LLink to="/cost-audit" style={{
              display: 'block', textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: 13,
              color: 'var(--accent)', textDecoration: 'none', letterSpacing: '0.04em'
            }}>
              {tt('cross_cost')} &#8594;
            </LLink>
          </div>
          <button className="btn-skip" onClick={restart}>{tt('restart')}</button>
        </div></div>
      )}

      {/* RESULTS */}
      {step === 'results' && results && results.eligible && (
        <div className="results-screen"><div className="results-inner">

          <div className="status-badge at_risk"><span className="status-dot" />{tt('status_eligible')}</div>

          <h2 className="results-headline">{tt('headline').replace('{amt}', fmt(results.total))}</h2>
          <p className="results-subline">{tt('subline').replace('{year}', tt(`year_${results.bandCode}_t`))}</p>

          {/* Hero amount */}
          <div className="savings-hero">
            <p className="savings-hero-label">{tt('panel_label')}</p>
            <p className="savings-hero-amount">{fmt(results.total)}</p>
            <p className="savings-hero-sub">{tt('range_line').replace('{low}', fmt(results.low)).replace('{high}', fmt(results.high))}</p>
          </div>

          {/* Breakdown */}
          <div className="breakdown-panel">
            <p className="breakdown-title">{tt('breakdown_title')}</p>
            {results.items.map(item => (
              <div className="breakdown-row" key={item.type}>
                <span className="breakdown-row-label">{rowLabel(item.type)}</span>
                <span className="breakdown-row-value">{fmt(item.amount)}</span>
              </div>
            ))}
            <div className="breakdown-row" style={{ fontWeight: 600 }}>
              <span>{tt('row_total')}</span>
              <span className="breakdown-row-value" style={{ color: '#1A7A4A' }}>{fmt(results.total)}</span>
            </div>
          </div>

          {/* How claims work */}
          <div className="ai-panel" style={{ marginBottom: 16 }}>
            <p className="ai-panel-label">{tt('how_label')}</p>
            <div className="ai-panel-text">
              <p>{tt('how_p1')}</p>
              <p>{tt('how_p2')}</p>
            </div>
          </div>

          {/* CTA */}
          <div className="cta-panel">
            <p className="cta-eyebrow">{tt('cta_eyebrow')}</p>
            <p className="cta-title">{tt('cta_title')}</p>
            <p className="cta-body">{tt('cta_body')}</p>
            <a href="https://getbueno.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
              <button className="btn-primary" style={{ marginBottom: 0 }}>{tt('cta_button')} <span className="arrow">&#8594;</span></button>
            </a>
            <p className="cta-price">{tt('cta_price')}</p>
          </div>

          {/* Cross-links */}
          <div style={{ textAlign: 'center', padding: '20px 0', borderTop: '1px solid var(--border)', marginBottom: 16 }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>{tt('also_from')}</p>
            <LLink to="/tax-calculator" style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--accent)', textDecoration: 'none', letterSpacing: '0.04em' }}>
              {tt('cross_tax')} &#8594;
            </LLink>
          </div>

          <button className="btn-skip" onClick={restart}>{tt('restart')}</button>
        </div></div>
      )}

      {/* Footer */}
      {step !== 'intro' && (
        <footer className="calc-footer">{tt('footer')}</footer>
      )}

    </div>
  );
}
