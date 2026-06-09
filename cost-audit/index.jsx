import { useState } from 'react';
import { calculateAudit, BANKS, ENERGY_PROVIDERS } from './auditCalculations';
import { useT, LLink } from '../i18n.jsx';
import LangSwitcher from '../LangSwitcher.jsx';

const fmt = (n) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

const TOTAL_STEPS = 3;

const progressForStep = (step) => {
  const map = { bank: 1, mortgage: 2, energy: 3 };
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

export default function CostAudit() {
  const t  = useT();
  const tt = (k) => t('calc_cost.' + k);
  const tc = (k) => t('common.' + k);

  if (typeof document !== 'undefined') {
    document.title = `${t('cards.cost.title')} | Spain 24/7`;
  }

  const [step, setStep]       = useState('intro');
  const [form, setForm]       = useState({ bank: '', mortgage: '', energyProvider: '' });
  const [results, setResults] = useState(null);

  const go   = (s) => setStep(s);
  const back = () => {
    if (step === 'mortgage') go('bank');
    else if (step === 'energy') go('mortgage');
    else if (step === 'results') go('energy');
    else go('intro');
  };

  const selectBank     = (code) => { setForm(f => ({ ...f, bank: code })); setTimeout(() => go('mortgage'), 160); };
  const selectMortgage = (val)  => { setForm(f => ({ ...f, mortgage: val })); setTimeout(() => go('energy'), 160); };
  const selectEnergy   = (code) => {
    const updated = { ...form, energyProvider: code };
    setForm(updated);
    const calc = calculateAudit(updated);
    setResults(calc);
    setTimeout(() => go('results'), 160);
  };

  const isOnDark = step === 'intro';
  const stepNum  = { bank: 1, mortgage: 2, energy: 3 }[step];

  return (
    <div className="calc-shell">

      {/* Header */}
      <header className="calc-header"
        style={isOnDark ? { background: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.1)', position: 'absolute' } : {}}>
        <Logo white={isOnDark} sub={t('home.brand_sub')} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {!isOnDark && !['results'].includes(step) && (
            <span className="calc-header-tag">{tt('header_tag')}</span>
          )}
          <LangSwitcher />
        </div>
      </header>

      {/* Progress bar */}
      {!['intro', 'results'].includes(step) && (
        <div className="progress-wrap">
          <div className="progress-inner">
            <span className="progress-label">{tc('step')} {stepNum} {tc('of')} {TOTAL_STEPS}</span>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressForStep(step)}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* ── INTRO ── */}
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
              <p className="intro-body">
                {tt('intro_body')}
              </p>
              <div className="intro-cta-row">
                <button className="btn-primary-outline" onClick={() => go('bank')}>
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
            <img src="/images/hero.jpg" alt="Foreign property owners in Spain" />
          </div>
        </div>
      )}

      {/* ── BANK ── */}
      {step === 'bank' && (
        <div className="step-screen">
          <div className="step-inner">
            <button className="btn-back" onClick={back}>&#8592; {tc('back')}</button>
            <p className="step-meta">{tc('question')} 1 {tc('of')} {TOTAL_STEPS}</p>
            <h2 className="step-question">{tt('bank_q')}</h2>
            <p className="step-hint">{tt('bank_hint')}</p>
            <div className="option-stack">
              {BANKS.map(b => (
                <button
                  key={b.code}
                  className={`option-card ${form.bank === b.code ? 'selected' : ''}`}
                  onClick={() => selectBank(b.code)}
                >
                  <div><p className="option-title">{b.name}</p></div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MORTGAGE ── */}
      {step === 'mortgage' && (
        <div className="step-screen">
          <div className="step-inner">
            <button className="btn-back" onClick={back}>&#8592; {tc('back')}</button>
            <p className="step-meta">{tc('question')} 2 {tc('of')} {TOTAL_STEPS}</p>
            <h2 className="step-question">{tt('mortgage_q')}</h2>
            <p className="step-hint">{tt('mortgage_hint')}</p>
            <div className="option-stack">
              {[
                { val: 'yes', title: tt('mortgage_yes_t'), desc: tt('mortgage_yes_d') },
                { val: 'no',  title: tt('mortgage_no_t'),  desc: tt('mortgage_no_d') },
              ].map(o => (
                <button
                  key={o.val}
                  className={`option-card ${form.mortgage === o.val ? 'selected' : ''}`}
                  onClick={() => selectMortgage(o.val)}
                >
                  <div>
                    <p className="option-title">{o.title}</p>
                    <p className="option-desc">{o.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ENERGY ── */}
      {step === 'energy' && (
        <div className="step-screen">
          <div className="step-inner">
            <button className="btn-back" onClick={back}>&#8592; {tc('back')}</button>
            <p className="step-meta">{tc('question')} 3 {tc('of')} {TOTAL_STEPS}</p>
            <h2 className="step-question">{tt('energy_q')}</h2>
            <p className="step-hint">{tt('energy_hint')}</p>
            <div className="option-stack">
              {ENERGY_PROVIDERS.map(e => (
                <button
                  key={e.code}
                  className={`option-card ${form.energyProvider === e.code ? 'selected' : ''}`}
                  onClick={() => selectEnergy(e.code)}
                >
                  <div><p className="option-title">{e.name}</p></div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── RESULTS ── */}
      {step === 'results' && results && (
        <div className="results-screen">
          <div className="results-inner">

            {/* Status */}
            <div className={`status-badge ${results.netSavings > 0 ? 'at_risk' : 'current'}`}>
              <span className="status-dot" />
              {results.netSavings > 0 ? tt('status_over') : tt('status_ok')}
            </div>

            <h2 className="results-headline">
              {results.netSavings > 0
                ? tt('headline_over').replace('{amt}', fmt(results.netSavings))
                : tt('headline_ok')}
            </h2>
            <p className="results-subline">
              {tt('subline')
                .replace('{bank}', results.bankLabel)
                .replace('{mortgage}', results.hasMortgage ? tt('subline_with') : tt('subline_without'))}
            </p>

            {/* Savings hero */}
            {results.netSavings > 0 && (
              <div className="savings-hero">
                <p className="savings-hero-label">{tt('savings_label')}</p>
                <p className="savings-hero-amount">{fmt(results.netSavings)}</p>
                <p className="savings-hero-sub">{tt('savings_sub')}</p>
              </div>
            )}

            {/* Breakdown */}
            <div className="breakdown-panel">
              <p className="breakdown-title">{tt('breakdown_title')}</p>

              {/* Visual bar */}
              {results.totalCurrentCost > 0 && (
                <>
                  <div className="vs-bar">
                    <div
                      className="vs-bar-current"
                      style={{ width: `${(results.totalCurrentCost / (results.totalCurrentCost + 20)) * 100}%` }}
                    />
                    <div
                      className="vs-bar-bueno"
                      style={{ width: `${(results.buenoAnnualCost / (results.totalCurrentCost + 20)) * 100}%` }}
                    />
                  </div>
                  <div className="vs-labels">
                    <span>{tt('vs_current').replace('{amt}', fmt(results.totalCurrentCost))}</span>
                    <span>{tt('vs_bueno').replace('{amt}', fmt(results.buenoAnnualCost))}</span>
                  </div>
                </>
              )}

              {results.currentBankCost > 0 && (
                <div className="breakdown-row">
                  <span className="breakdown-row-label">{tt('bank_fees').replace('{bank}', results.bankLabel)}</span>
                  <span className="breakdown-row-value red">{fmt(results.currentBankCost)}/yr</span>
                </div>
              )}
              {results.currentBankCost === 0 && (
                <div className="breakdown-row">
                  <span className="breakdown-row-label">{tt('bank_fees').replace('{bank}', results.bankLabel)}</span>
                  <span className="breakdown-row-value green">{tt('already_zero')}</span>
                </div>
              )}
              {results.hasEnergy && results.energyOverpayment > 0 && (
                <div className="breakdown-row">
                  <span className="breakdown-row-label">{tt('energy_over')}</span>
                  <span className="breakdown-row-value red">{fmt(results.energyOverpayment)}/yr</span>
                </div>
              )}
              <div className="breakdown-row">
                <span className="breakdown-row-label">{tt('membership')}</span>
                <span className="breakdown-row-value">{fmt(results.buenoAnnualCost)}/yr</span>
              </div>
              <div className="breakdown-row" style={{ fontWeight: 600 }}>
                <span>{tt('net_saving')}</span>
                <span className="breakdown-row-value" style={{ color: results.netSavings > 0 ? '#1A7A4A' : 'inherit' }}>
                  {results.netSavings > 0 ? fmt(results.netSavings) : '-'}
                </span>
              </div>
            </div>

            {/* What Bueno includes */}
            <div className="ai-panel" style={{ marginBottom: 16 }}>
              <p className="ai-panel-label">{tt('included_label')}</p>
              <div className="ai-panel-text">
                <p>{tt('included_p1')}</p>
                <p>{tt('included_p2')}</p>
              </div>
            </div>

            {/* CTA */}
            <div className="cta-panel">
              <p className="cta-eyebrow">{tt('cta_eyebrow')}</p>
              <p className="cta-title">
                {results.netSavings > 0
                  ? tt('cta_title_over').replace('{amt}', fmt(results.netSavings))
                  : tt('cta_title_ok')}
              </p>
              <p className="cta-body">{tt('cta_body')}</p>
              <a href="https://getbueno.com" target="_blank" rel="noopener noreferrer"
                style={{ textDecoration: 'none', display: 'block' }}>
                <button className="btn-primary" style={{ marginBottom: 0 }}>
                  {tt('cta_button')} <span className="arrow">&#8594;</span>
                </button>
              </a>
              <p className="cta-price">{tt('cta_price')}</p>
            </div>

            {/* Also try tax calculator */}
            <div style={{
              textAlign: 'center',
              padding: '20px 0',
              borderTop: '1px solid var(--border)',
              marginBottom: 16
            }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
                {tt('also_from')}
              </p>
              <LLink to="/tax-calculator" style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                color: 'var(--accent)',
                textDecoration: 'none',
                letterSpacing: '0.04em'
              }}>
                {tt('cross_tax')} &#8594;
              </LLink>
            </div>

            <button className="btn-skip" onClick={() => {
              setStep('intro');
              setForm({ bank: '', mortgage: '', energyProvider: '' });
              setResults(null);
            }}>
              {tt('restart')}
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      {step !== 'intro' && (
        <footer className="calc-footer">
          {tt('footer')}
        </footer>
      )}

    </div>
  );
}
