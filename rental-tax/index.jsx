import { useState } from 'react';
import { calculateRentalTax } from './rentalTaxCalculations';
import { useT, LLink } from '../i18n.jsx';
import LangSwitcher from '../LangSwitcher.jsx';

const fmt = (n) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n || 0);

const TOTAL_STEPS = 5; // residency, income, prorated expenses, annual expenses, depreciation

function Logo({ white, sub }) {
  return (
    <div className="site-brand">
      <span className={`site-brand-name ${white ? 'white' : ''}`}>Spain 24/7</span>
      <span className={`site-brand-powered ${white ? 'white' : ''}`}>{sub}</span>
    </div>
  );
}

function NumberInput({ label, hint, value, onChange, prefix = '€' }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: 'block',
        fontFamily: 'var(--font-sans)',
        fontSize: 13,
        fontWeight: 500,
        color: 'var(--navy)',
        marginBottom: 5,
        letterSpacing: '0.02em'
      }}>
        {label}
      </label>
      {hint && (
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 12,
          fontWeight: 300,
          color: 'var(--text-muted)',
          marginBottom: 6,
          lineHeight: 1.4
        }}>
          {hint}
        </p>
      )}
      <div className="input-prefix-wrap">
        <span className="input-prefix" style={{ fontSize: 16, padding: '12px 10px 12px 16px' }}>{prefix}</span>
        <input
          className="value-input"
          type="number"
          placeholder="0"
          min="0"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ fontSize: 18, padding: '12px 16px' }}
        />
      </div>
    </div>
  );
}

function ExpenseSection({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: 2,
      marginBottom: 12,
      overflow: 'hidden'
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'var(--off-white)',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'var(--font-sans)',
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--navy)',
        }}
      >
        {title}
        <span style={{ fontSize: 16, fontWeight: 300, opacity: 0.5 }}>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div style={{ padding: '16px 16px 4px' }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function RentalTaxCalculator() {
  const t  = useT();
  const tt = (k) => t('calc_rental.' + k);
  const tc = (k) => t('common.' + k);

  if (typeof document !== 'undefined') {
    document.title = `${t('cards.rental.title')} | Spain 24/7`;
  }

  const [step, setStep]       = useState('intro');
  const [form, setForm]       = useState({
    residency: '',
    rentalIncome: '', daysRented: '',
    // Prorated
    ibiTax: '', basura: '',
    insurance: '', communityFees: '', mortgageInterest: '',
    electricity: '', gas: '', water: '', internet: '', alarm: '',
    // Annual (not prorated)
    maintenance: '', managementFees: '', advertising: '', legalFees: '',
    // Depreciation
    propertyValue: '', landValue: '', furnitureDepr: '',
  });
  const [results, setResults] = useState(null);

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  const isEU      = form.residency === 'eu_eea';
  const stepNum   = { residency: 1, income: 2, prorated: 3, annual: 4, depreciation: 5 }[step];
  const isOnDark  = step === 'intro';

  const runCalc = () => {
    setResults(calculateRentalTax(form));
    setStep('results');
  };

  const restart = () => {
    setStep('intro');
    setResults(null);
    setForm({
      residency: '', rentalIncome: '', daysRented: '',
      ibiTax: '', basura: '',
      insurance: '', communityFees: '', mortgageInterest: '',
      electricity: '', gas: '', water: '', internet: '', alarm: '',
      maintenance: '', managementFees: '', advertising: '', legalFees: '',
      propertyValue: '', landValue: '', furnitureDepr: '',
    });
  };

  return (
    <div className="calc-shell">

      {/* Header */}
      <header className="calc-header"
        style={isOnDark ? { background: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.1)', position: 'absolute' } : {}}>
        <Logo white={isOnDark} sub={t('home.brand_sub')} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {!isOnDark && step !== 'results' && (
            <span className="calc-header-tag">{tt('header_tag')}</span>
          )}
          <LangSwitcher />
        </div>
      </header>

      {/* Progress */}
      {!['intro', 'results'].includes(step) && (
        <div className="progress-wrap">
          <div className="progress-inner">
            <span className="progress-label">{tc('step')} {stepNum} {tc('of')} {isEU ? TOTAL_STEPS : 2}</span>
            <div className="progress-track">
              <div className="progress-fill"
                style={{ width: `${(stepNum / (isEU ? TOTAL_STEPS : 2)) * 100}%` }} />
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
                <button className="btn-primary-outline" style={{ maxWidth: 280 }}
                  onClick={() => setStep('residency')}>
                  {tt('intro_cta')} &#8594;
                </button>
              </div>
              <div className="intro-trust-row">
                <span className="intro-trust-item">{tc('takes_3_min')}</span>
                <span className="intro-trust-dot" />
                <span className="intro-trust-item">{tc('no_account')}</span>
                <span className="intro-trust-dot" />
                <span className="intro-trust-item">{tc('free')}</span>
              </div>
            </div>
          </div>
          <div className="intro-right">
            <img src="/images/hero-tax.jpg" alt="Spanish rental property" />
          </div>
        </div>
      )}

      {/* ── RESIDENCY ── */}
      {step === 'residency' && (
        <div className="step-screen">
          <div className="step-inner">
            <button className="btn-back" onClick={() => setStep('intro')}>&#8592; {tc('back')}</button>
            <p className="step-meta">{tc('question')} 1 {tc('of')} {isEU ? TOTAL_STEPS : 2}</p>
            <h2 className="step-question">{tt('residency_q')}</h2>
            <p className="step-hint">
              {tt('residency_hint')}
            </p>
            <div className="option-stack">
              {[
                { val: 'eu_eea', title: tt('res_eu_t'), desc: tt('res_eu_d') },
                { val: 'non_eu', title: tt('res_noneu_t'), desc: tt('res_noneu_d') },
              ].map(o => (
                <button key={o.val}
                  className={`option-card ${form.residency === o.val ? 'selected' : ''}`}
                  onClick={() => { setForm(f => ({ ...f, residency: o.val })); setTimeout(() => setStep('income'), 160); }}>
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

      {/* ── INCOME ── */}
      {step === 'income' && (
        <div className="step-screen">
          <div className="step-inner">
            <button className="btn-back" onClick={() => setStep('residency')}>&#8592; {tc('back')}</button>
            <p className="step-meta">{tc('question')} 2 {tc('of')} {isEU ? TOTAL_STEPS : 2}</p>
            <h2 className="step-question">{tt('income_q')}</h2>
            <p className="step-hint">
              {tt('income_hint')}
            </p>
            <NumberInput label={tt('income_label')} hint={tt('income_label_hint')} value={form.rentalIncome} onChange={set('rentalIncome')} />
            <NumberInput label={tt('days_label')} hint={tt('days_hint')} value={form.daysRented} onChange={set('daysRented')} prefix="🗓" />
            <button className="btn-primary"
              disabled={!form.rentalIncome || parseFloat(form.rentalIncome) <= 0 || !form.daysRented || parseFloat(form.daysRented) <= 0}
              onClick={() => isEU ? setStep('prorated') : runCalc()}>
              {isEU ? tt('income_cta_eu') : tt('income_cta_noneu')} <span className="arrow">&#8594;</span>
            </button>
            {!isEU && (
              <p className="privacy-note" style={{ marginTop: 12 }}>
                {tt('noneu_note')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── PRORATED EXPENSES (EU/EEA only) ── */}
      {step === 'prorated' && (
        <div className="step-screen">
          <div className="step-inner">
            <button className="btn-back" onClick={() => setStep('income')}>&#8592; {tc('back')}</button>
            <p className="step-meta">{tc('question')} 3 {tc('of')} {TOTAL_STEPS}</p>
            <h2 className="step-question">{tt('prorated_q')}</h2>
            <p className="step-hint">
              {tt('prorated_hint')}
            </p>

            <ExpenseSection title={tt('section_taxes')}>
              <NumberInput label={tt('lbl_ibi')} value={form.ibiTax} onChange={set('ibiTax')} />
              <NumberInput label={tt('lbl_basura')} value={form.basura} onChange={set('basura')} />
            </ExpenseSection>

            <ExpenseSection title={tt('section_other')}>
              <NumberInput label={tt('lbl_insurance')} value={form.insurance} onChange={set('insurance')} />
              <NumberInput label={tt('lbl_community')} value={form.communityFees} onChange={set('communityFees')} />
              <NumberInput label={tt('lbl_mortgage_int')} hint={tt('hint_mortgage_int')} value={form.mortgageInterest} onChange={set('mortgageInterest')} />
            </ExpenseSection>

            <ExpenseSection title={tt('section_utilities')}>
              <NumberInput label={tt('lbl_electricity')} hint={tt('hint_electricity')} value={form.electricity} onChange={set('electricity')} />
              <NumberInput label={tt('lbl_gas')} value={form.gas} onChange={set('gas')} />
              <NumberInput label={tt('lbl_water')} value={form.water} onChange={set('water')} />
              <NumberInput label={tt('lbl_internet')} value={form.internet} onChange={set('internet')} />
              <NumberInput label={tt('lbl_alarm')} value={form.alarm} onChange={set('alarm')} />
            </ExpenseSection>

            <button className="btn-primary" onClick={() => setStep('annual')}>
              {tc('continue')} <span className="arrow">&#8594;</span>
            </button>
            <button className="btn-skip" onClick={() => setStep('annual')}>{tt('skip_prorated')}</button>
          </div>
        </div>
      )}

      {/* ── ANNUAL EXPENSES (EU/EEA only) ── */}
      {step === 'annual' && (
        <div className="step-screen">
          <div className="step-inner">
            <button className="btn-back" onClick={() => setStep('prorated')}>&#8592; {tc('back')}</button>
            <p className="step-meta">{tc('question')} 4 {tc('of')} {TOTAL_STEPS}</p>
            <h2 className="step-question">{tt('annual_q')}</h2>
            <p className="step-hint">
              {tt('annual_hint')}
            </p>

            <NumberInput label={tt('lbl_maintenance')} hint={tt('hint_maintenance')} value={form.maintenance} onChange={set('maintenance')} />
            <NumberInput label={tt('lbl_mgmt')} hint={tt('hint_mgmt')} value={form.managementFees} onChange={set('managementFees')} />
            <NumberInput label={tt('lbl_advertising')} hint={tt('hint_advertising')} value={form.advertising} onChange={set('advertising')} />
            <NumberInput label={tt('lbl_legal')} hint={tt('hint_legal')} value={form.legalFees} onChange={set('legalFees')} />

            <button className="btn-primary" onClick={() => setStep('depreciation')}>
              {tc('continue')} <span className="arrow">&#8594;</span>
            </button>
            <button className="btn-skip" onClick={() => setStep('depreciation')}>{tt('skip_annual')}</button>
          </div>
        </div>
      )}

      {/* ── DEPRECIATION (EU/EEA only) ── */}
      {step === 'depreciation' && (
        <div className="step-screen">
          <div className="step-inner">
            <button className="btn-back" onClick={() => setStep('annual')}>&#8592; {tc('back')}</button>
            <p className="step-meta">{tc('question')} 5 {tc('of')} {TOTAL_STEPS}</p>
            <h2 className="step-question">{tt('depreciation_q')}</h2>
            <p className="step-hint">
              {tt('depreciation_hint')}
            </p>

            <NumberInput label={tt('lbl_property_value')} hint={tt('hint_property_value')} value={form.propertyValue} onChange={set('propertyValue')} />
            <NumberInput label={tt('lbl_land_value')} hint={tt('hint_land_value')} value={form.landValue} onChange={set('landValue')} />
            <NumberInput label={tt('lbl_furniture')} hint={tt('hint_furniture')} value={form.furnitureDepr} onChange={set('furnitureDepr')} />

            <button className="btn-primary" onClick={runCalc}>
              {tt('calc_cta')} <span className="arrow">&#8594;</span>
            </button>
            <button className="btn-skip" onClick={runCalc}>{tt('skip_depr')}</button>
          </div>
        </div>
      )}

      {/* ── RESULTS ── */}
      {step === 'results' && results && (
        <div className="results-screen">
          <div className="results-inner">

            <div style={{
              background: 'rgba(201,169,110,0.12)',
              border: '1px solid var(--gold)',
              borderRadius: 2,
              padding: '12px 16px',
              marginBottom: 20,
              fontFamily: 'var(--font-sans)',
              fontSize: 12,
              color: 'var(--navy)',
              fontWeight: 300,
              lineHeight: 1.6
            }}>
              {tt('estimate_note')}
            </div>

            <div className={`status-badge ${results.taxable === 0 ? 'current' : results.totalDeductions > 0 ? 'current' : 'at_risk'}`}>
              <span className="status-dot" />
              {results.isEUEEA ? tt('status_eu') : tt('status_noneu')}
            </div>

            <h2 className="results-headline">{tt('result_headline')}</h2>
            <p className="results-subline">
              {tt('result_subline').replace('{income}', fmt(results.income)).replace('{days}', results.days)}
            </p>

            {/* Main panel */}
            <div className="tax-panel">
              <p className="tax-panel-label">{tt('panel_label')}</p>
              <p className="tax-panel-amount">{fmt(results.tax)}</p>
              <p className="tax-panel-period">{tt('panel_period')}</p>
              <div className="tax-panel-grid">
                <div>
                  <p className="tax-panel-item-label">{tt('panel_rate')}</p>
                  <p className="tax-panel-item-value">{results.taxRate}%</p>
                </div>
                <div>
                  <p className="tax-panel-item-label">{tt('panel_taxable')}</p>
                  <p className="tax-panel-item-value">{fmt(results.taxable)}</p>
                </div>
                <div>
                  <p className="tax-panel-item-label">{tt('panel_gross')}</p>
                  <p className="tax-panel-item-value">{fmt(results.income)}</p>
                </div>
                {results.isEUEEA && (
                  <div>
                    <p className="tax-panel-item-label">{tt('panel_deductions')}</p>
                    <p className="tax-panel-item-value">{fmt(results.totalDeductions)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Deduction breakdown for EU/EEA */}
            {results.isEUEEA && results.totalDeductions > 0 && (
              <div className="breakdown-panel">
                <p className="breakdown-title">{tt('breakdown_title')}</p>
                {results.proratedExpenses > 0 && (
                  <div className="breakdown-row">
                    <span className="breakdown-row-label">{tt('prop_costs').replace('{pct}', Math.round(results.proRata * 100))}</span>
                    <span className="breakdown-row-value">{fmt(results.proratedExpenses)}</span>
                  </div>
                )}
                {results.annualExpenses > 0 && (
                  <div className="breakdown-row">
                    <span className="breakdown-row-label">{tt('mgmt_row')}</span>
                    <span className="breakdown-row-value">{fmt(results.annualExpenses)}</span>
                  </div>
                )}
                {results.buildingDepr > 0 && (
                  <div className="breakdown-row">
                    <span className="breakdown-row-label">{tt('building_depr')}</span>
                    <span className="breakdown-row-value">{fmt(results.buildingDepr)}</span>
                  </div>
                )}
                {results.furnitureDepr > 0 && (
                  <div className="breakdown-row">
                    <span className="breakdown-row-label">{tt('furniture_depr')}</span>
                    <span className="breakdown-row-value">{fmt(results.furnitureDepr)}</span>
                  </div>
                )}
                <div className="breakdown-row" style={{ fontWeight: 600 }}>
                  <span>{tt('total_deducted')}</span>
                  <span className="breakdown-row-value breakdown-row-value green">{fmt(results.totalDeductions)}</span>
                </div>
                {results.deductionsCapped && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10, fontFamily: 'var(--font-sans)', fontWeight: 300 }}>
                    {tt('capped')}
                  </p>
                )}
              </div>
            )}

            {/* Non-EU note */}
            {!results.isEUEEA && (
              <div className="ai-panel" style={{ marginBottom: 16 }}>
                <p className="ai-panel-label">{tt('about_label')}</p>
                <p className="ai-panel-text">
                  {tt('about_body')}
                </p>
              </div>
            )}

            {/* CTA */}
            <div className="cta-panel">
              <p className="cta-eyebrow">{tt('cta_eyebrow')}</p>
              <p className="cta-title">{tt('cta_title')}</p>
              <p className="cta-body">
                {tt('cta_body')}
              </p>
              <a href="https://getbueno.com" target="_blank" rel="noopener noreferrer"
                style={{ textDecoration: 'none', display: 'block' }}>
                <button className="btn-primary" style={{ marginBottom: 0 }}>
                  {tt('cta_button')} <span className="arrow">&#8594;</span>
                </button>
              </a>
              <p className="cta-price">{tt('cta_price')}</p>
            </div>

            {/* Cross-links */}
            <div style={{ textAlign: 'center', padding: '16px 0 4px', borderTop: '1px solid var(--border)', marginTop: 8 }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{tt('also_from')}</p>
              <LLink to="/tax-calculator" style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--accent)', textDecoration: 'none', display: 'block', marginBottom: 6 }}>
                {tt('cross_tax')} &#8594;
              </LLink>
              <LLink to="/cost-audit" style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--accent)', textDecoration: 'none' }}>
                {tt('cross_cost')} &#8594;
              </LLink>
            </div>

            <button className="btn-skip" onClick={restart}>{tt('restart')}</button>
          </div>
        </div>
      )}

      {step !== 'intro' && (
        <footer className="calc-footer">
          {tt('footer')}
        </footer>
      )}

    </div>
  );
}
