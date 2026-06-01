import { useState } from 'react';
import { Link } from 'react-router-dom';
import { calculateRentalTax } from './rentalTaxCalculations';

if (typeof document !== 'undefined') {
  document.title = 'Spanish Rental Income Tax Calculator | Spain 24/7';
}

const fmt = (n) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n || 0);

const fmtPct = (n) => `${(n * 100).toFixed(1)}%`;

const TOTAL_STEPS = 5; // residency, income, prorated expenses, annual expenses, depreciation

function Logo({ white }) {
  return (
    <div className="site-brand">
      <span className={`site-brand-name ${white ? 'white' : ''}`}>Spain 24/7</span>
      <span className={`site-brand-powered ${white ? 'white' : ''}`}>Powered by Bueno</span>
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
  const [step, setStep]       = useState('intro');
  const [form, setForm]       = useState({
    residency: '',
    rentalIncome: '', daysRented: '',
    // Prorated
    ibiTax: '', basura: '', ibiGarage: '',
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
      ibiTax: '', basura: '', ibiGarage: '',
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
        <Logo white={isOnDark} />
        {!isOnDark && step !== 'results' && (
          <span className="calc-header-tag">Rental Tax Calculator</span>
        )}
      </header>

      {/* Progress */}
      {!['intro', 'results'].includes(step) && (
        <div className="progress-wrap">
          <div className="progress-inner">
            <span className="progress-label">Step {stepNum} of {isEU ? TOTAL_STEPS : 2}</span>
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
                <span className="intro-eyebrow-text">Free rental tax calculator</span>
              </div>
              <h1 className="intro-headline">
                What is your actual<br />Spanish rental<br /><em>income tax?</em>
              </h1>
              <p className="intro-body">
                Most foreign property owners pay more rental tax than they need to.
                EU and EEA residents can deduct property costs, utilities, management fees,
                and depreciation. This calculator shows your exact liability after all legal deductions.
              </p>
              <div className="intro-cta-row">
                <button className="btn-primary-outline" style={{ maxWidth: 280 }}
                  onClick={() => setStep('residency')}>
                  Calculate my rental tax &#8594;
                </button>
              </div>
              <div className="intro-trust-row">
                <span className="intro-trust-item">Takes 3 minutes</span>
                <span className="intro-trust-dot" />
                <span className="intro-trust-item">No account needed</span>
                <span className="intro-trust-dot" />
                <span className="intro-trust-item">Free</span>
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
            <button className="btn-back" onClick={() => setStep('intro')}>&#8592; Back</button>
            <p className="step-meta">Question 1 of {isEU ? TOTAL_STEPS : 2}</p>
            <h2 className="step-question">Where do you live?</h2>
            <p className="step-hint">
              EU and EEA residents can deduct property expenses and pay 19% tax.
              UK and non-EU residents pay 24% on gross rental income with no deductions.
            </p>
            <div className="option-stack">
              {[
                { val: 'eu_eea', title: 'EU or EEA country',
                  desc: 'Norway, Sweden, Denmark, Germany, France, Netherlands, Belgium, Ireland, Finland, Austria, Iceland, or any other EU/EEA country.' },
                { val: 'non_eu', title: 'UK or non-EU country',
                  desc: 'United Kingdom, USA, Canada, Australia, or any country outside the EU/EEA.' },
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
            <button className="btn-back" onClick={() => setStep('residency')}>&#8592; Back</button>
            <p className="step-meta">Question 2 of {isEU ? TOTAL_STEPS : 2}</p>
            <h2 className="step-question">Your rental income and days.</h2>
            <p className="step-hint">
              Enter your total rental income and how many days the property was rented out last year.
            </p>
            <NumberInput label="Total rental income" hint="All income received from tenants or guests, in euros." value={form.rentalIncome} onChange={set('rentalIncome')} />
            <NumberInput label="Days rented out" hint="Total number of days the property was occupied by paying guests." value={form.daysRented} onChange={set('daysRented')} prefix="🗓" />
            <button className="btn-primary"
              disabled={!form.rentalIncome || parseFloat(form.rentalIncome) <= 0 || !form.daysRented || parseFloat(form.daysRented) <= 0}
              onClick={() => isEU ? setStep('prorated') : runCalc()}>
              {isEU ? 'Continue to expenses' : 'Calculate my tax'} <span className="arrow">&#8594;</span>
            </button>
            {!isEU && (
              <p className="privacy-note" style={{ marginTop: 12 }}>
                As a non-EU/UK resident, expenses are not deductible. Your tax is calculated on gross income at 24%.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── PRORATED EXPENSES (EU/EEA only) ── */}
      {step === 'prorated' && (
        <div className="step-screen">
          <div className="step-inner">
            <button className="btn-back" onClick={() => setStep('income')}>&#8592; Back</button>
            <p className="step-meta">Question 3 of {TOTAL_STEPS}</p>
            <h2 className="step-question">Annual property costs.</h2>
            <p className="step-hint">
              These are prorated: we divide each by 365 and multiply by your rental days.
              Enter the full annual amount. Leave blank if not applicable.
            </p>

            <ExpenseSection title="Property taxes">
              <NumberInput label="IBI property tax" value={form.ibiTax} onChange={set('ibiTax')} />
              <NumberInput label="Basura (waste collection)" value={form.basura} onChange={set('basura')} />
              <NumberInput label="IBI garage tax" value={form.ibiGarage} onChange={set('ibiGarage')} />
            </ExpenseSection>

            <ExpenseSection title="Other annual costs">
              <NumberInput label="Property insurance" value={form.insurance} onChange={set('insurance')} />
              <NumberInput label="Community fees" value={form.communityFees} onChange={set('communityFees')} />
              <NumberInput label="Mortgage interest" hint="Spanish annual bank statement required." value={form.mortgageInterest} onChange={set('mortgageInterest')} />
            </ExpenseSection>

            <ExpenseSection title="Utilities">
              <NumberInput label="Electricity" hint="Only if not charged to guests." value={form.electricity} onChange={set('electricity')} />
              <NumberInput label="Gas" value={form.gas} onChange={set('gas')} />
              <NumberInput label="Water" value={form.water} onChange={set('water')} />
              <NumberInput label="Internet" value={form.internet} onChange={set('internet')} />
              <NumberInput label="Alarm" value={form.alarm} onChange={set('alarm')} />
            </ExpenseSection>

            <button className="btn-primary" onClick={() => setStep('annual')}>
              Continue <span className="arrow">&#8594;</span>
            </button>
            <button className="btn-skip" onClick={() => setStep('annual')}>Skip — I have no prorated expenses</button>
          </div>
        </div>
      )}

      {/* ── ANNUAL EXPENSES (EU/EEA only) ── */}
      {step === 'annual' && (
        <div className="step-screen">
          <div className="step-inner">
            <button className="btn-back" onClick={() => setStep('prorated')}>&#8592; Back</button>
            <p className="step-meta">Question 4 of {TOTAL_STEPS}</p>
            <h2 className="step-question">Management and maintenance costs.</h2>
            <p className="step-hint">
              These are deducted in full, not prorated. They must relate directly to the rental activity and require an official invoice with IVA.
            </p>

            <NumberInput label="Maintenance and repairs" hint="Official invoice with IVA required. Only if property is used solely for rental." value={form.maintenance} onChange={set('maintenance')} />
            <NumberInput label="Property management fees" hint="Includes cleaning fees. Invoice with IVA required." value={form.managementFees} onChange={set('managementFees')} />
            <NumberInput label="Advertising" hint="Airbnb, Booking.com fees, or your own advertising costs." value={form.advertising} onChange={set('advertising')} />
            <NumberInput label="Legal and accounting fees" hint="Fees paid for legal or accounting services related to the rental." value={form.legalFees} onChange={set('legalFees')} />

            <button className="btn-primary" onClick={() => setStep('depreciation')}>
              Continue <span className="arrow">&#8594;</span>
            </button>
            <button className="btn-skip" onClick={() => setStep('depreciation')}>Skip — I have no management costs</button>
          </div>
        </div>
      )}

      {/* ── DEPRECIATION (EU/EEA only) ── */}
      {step === 'depreciation' && (
        <div className="step-screen">
          <div className="step-inner">
            <button className="btn-back" onClick={() => setStep('annual')}>&#8592; Back</button>
            <p className="step-meta">Question 5 of {TOTAL_STEPS}</p>
            <h2 className="step-question">Property depreciation.</h2>
            <p className="step-hint">
              You can deduct 3% per year of the building value (not land), prorated by rental days.
              Use cadastral values if you do not have purchase price and land split.
            </p>

            <NumberInput label="Property purchase price" hint="Or total cadastral property value (including land)." value={form.propertyValue} onChange={set('propertyValue')} />
            <NumberInput label="Land value" hint="Or cadastral land value. Depreciation applies only to the building, not the land." value={form.landValue} onChange={set('landValue')} />
            <NumberInput label="Annual furniture depreciation" hint="Enter 10% of your furniture purchase price. Furniture is written off over 10 years." value={form.furnitureDepr} onChange={set('furnitureDepr')} />

            <button className="btn-primary" onClick={runCalc}>
              Calculate my tax <span className="arrow">&#8594;</span>
            </button>
            <button className="btn-skip" onClick={runCalc}>Skip — I will not claim depreciation</button>
          </div>
        </div>
      )}

      {/* ── RESULTS ── */}
      {step === 'results' && results && (
        <div className="results-screen">
          <div className="results-inner">

            <div className={`status-badge ${results.taxable === 0 ? 'current' : results.totalDeductions > 0 ? 'current' : 'at_risk'}`}>
              <span className="status-dot" />
              {results.isEUEEA ? 'Deductions applied' : 'Non-EU rate — no deductions'}
            </div>

            <h2 className="results-headline">Your rental income tax for this year.</h2>
            <p className="results-subline">
              Based on {fmt(results.income)} rental income over {results.days} days.
            </p>

            {/* Main panel */}
            <div className="tax-panel">
              <p className="tax-panel-label">Tax owed</p>
              <p className="tax-panel-amount">{fmt(results.tax)}</p>
              <p className="tax-panel-period">Annual / Modelo 210 / deadline December 31</p>
              <div className="tax-panel-grid">
                <div>
                  <p className="tax-panel-item-label">Tax rate</p>
                  <p className="tax-panel-item-value">{results.taxRate}%</p>
                </div>
                <div>
                  <p className="tax-panel-item-label">Taxable income</p>
                  <p className="tax-panel-item-value">{fmt(results.taxable)}</p>
                </div>
                <div>
                  <p className="tax-panel-item-label">Gross rental income</p>
                  <p className="tax-panel-item-value">{fmt(results.income)}</p>
                </div>
                {results.isEUEEA && (
                  <div>
                    <p className="tax-panel-item-label">Total deductions</p>
                    <p className="tax-panel-item-value">{fmt(results.totalDeductions)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Deduction breakdown for EU/EEA */}
            {results.isEUEEA && results.totalDeductions > 0 && (
              <div className="breakdown-panel">
                <p className="breakdown-title">Deduction breakdown</p>
                {results.proratedExpenses > 0 && (
                  <div className="breakdown-row">
                    <span className="breakdown-row-label">Property costs (prorated by {Math.round(results.proRata * 100)}% rental days)</span>
                    <span className="breakdown-row-value">{fmt(results.proratedExpenses)}</span>
                  </div>
                )}
                {results.annualExpenses > 0 && (
                  <div className="breakdown-row">
                    <span className="breakdown-row-label">Management and maintenance</span>
                    <span className="breakdown-row-value">{fmt(results.annualExpenses)}</span>
                  </div>
                )}
                {results.buildingDepr > 0 && (
                  <div className="breakdown-row">
                    <span className="breakdown-row-label">Building depreciation (3% prorated)</span>
                    <span className="breakdown-row-value">{fmt(results.buildingDepr)}</span>
                  </div>
                )}
                {results.furnitureDepr > 0 && (
                  <div className="breakdown-row">
                    <span className="breakdown-row-label">Furniture depreciation (10% prorated)</span>
                    <span className="breakdown-row-value">{fmt(results.furnitureDepr)}</span>
                  </div>
                )}
                <div className="breakdown-row" style={{ fontWeight: 600 }}>
                  <span>Total deducted</span>
                  <span className="breakdown-row-value breakdown-row-value green">{fmt(results.totalDeductions)}</span>
                </div>
                {results.deductionsCapped && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10, fontFamily: 'var(--font-sans)', fontWeight: 300 }}>
                    Deductions capped at rental income. Expenses cannot create a tax refund.
                  </p>
                )}
              </div>
            )}

            {/* Non-EU note */}
            {!results.isEUEEA && (
              <div className="ai-panel" style={{ marginBottom: 16 }}>
                <p className="ai-panel-label">About your rate</p>
                <p className="ai-panel-text">
                  As a non-EU resident, Spain does not allow you to deduct property expenses from rental income.
                  You pay a flat 24% on gross rental income. If your country has a double taxation treaty with Spain,
                  you may be able to claim relief in your home country. Consult a tax advisor for your specific situation.
                </p>
              </div>
            )}

            {/* CTA */}
            <div className="cta-panel">
              <p className="cta-eyebrow">Bueno Tax Filing</p>
              <p className="cta-title">Let Bueno file your Modelo 210.</p>
              <p className="cta-body">
                Bueno files your Spanish rental income tax in English. We handle the quarterly and annual returns,
                ensure all deductions are correctly applied, and deal with the tax office on your behalf.
              </p>
              <a href="https://getbueno.com" target="_blank" rel="noopener noreferrer"
                style={{ textDecoration: 'none', display: 'block' }}>
                <button className="btn-primary" style={{ marginBottom: 0 }}>
                  Get started with Bueno <span className="arrow">&#8594;</span>
                </button>
              </a>
              <p className="cta-price">€99/year includes tax filing, Spanish account, Visa card, and human support.</p>
            </div>

            {/* Cross-links */}
            <div style={{ textAlign: 'center', padding: '16px 0 4px', borderTop: '1px solid var(--border)', marginTop: 8 }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Also from Spain 24/7</p>
              <Link to="/tax-calculator" style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--accent)', textDecoration: 'none', display: 'block', marginBottom: 6 }}>
                General Spanish property tax calculator &#8594;
              </Link>
              <Link to="/cost-audit" style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--accent)', textDecoration: 'none' }}>
                Check if you are overpaying on banking and energy &#8594;
              </Link>
            </div>

            <button className="btn-skip" onClick={restart}>Start a new calculation</button>
          </div>
        </div>
      )}

      {step !== 'intro' && (
        <footer className="calc-footer">
          Based on verified calculation model. For guidance only. Not legal or tax advice.
          Consult a qualified tax professional for your specific situation. Spain 24/7 by Bueno.
        </footer>
      )}

    </div>
  );
}
