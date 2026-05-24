import { useState, useEffect } from 'react';
import { calculateTax, isEUEEA } from './taxCalculations';
import { saveLead } from './supabase';

// ─── DATA ───────────────────────────────────────────────────────────────────

const COUNTRIES = [
  { code: 'norway',       name: 'Norway',         flag: '🇳🇴', isEUEEA: true  },
  { code: 'sweden',       name: 'Sweden',         flag: '🇸🇪', isEUEEA: true  },
  { code: 'denmark',      name: 'Denmark',        flag: '🇩🇰', isEUEEA: true  },
  { code: 'germany',      name: 'Germany',        flag: '🇩🇪', isEUEEA: true  },
  { code: 'france',       name: 'France',         flag: '🇫🇷', isEUEEA: true  },
  { code: 'netherlands',  name: 'Netherlands',    flag: '🇳🇱', isEUEEA: true  },
  { code: 'united_kingdom', name: 'United Kingdom', flag: '🇬🇧', isEUEEA: false },
  { code: 'belgium',      name: 'Belgium',        flag: '🇧🇪', isEUEEA: true  },
  { code: 'ireland',      name: 'Ireland',        flag: '🇮🇪', isEUEEA: true  },
  { code: 'finland',      name: 'Finland',        flag: '🇫🇮', isEUEEA: true  },
  { code: 'austria',      name: 'Austria',        flag: '🇦🇹', isEUEEA: true  },
  { code: 'iceland',      name: 'Iceland',        flag: '🇮🇸', isEUEEA: true  },
  { code: 'other_eu_eea', name: 'Other EU / EEA', flag: '🇪🇺', isEUEEA: true  },
  { code: 'other',        name: 'Other country',  flag: '🌍', isEUEEA: false },
];

const PROPERTY_USE = [
  {
    code: 'personal',
    title: 'Personal use only',
    desc: 'I use it myself. I do not rent it out.'
  },
  {
    code: 'short_rental',
    title: 'Short-term / holiday rental',
    desc: 'Rented to tourists or guests, usually by the week.'
  },
  {
    code: 'long_rental',
    title: 'Long-term rental',
    desc: 'Rented to tenants on a monthly or annual basis.'
  },
  {
    code: 'mixed',
    title: 'Mixed — personal and rental',
    desc: 'I use it part of the year and rent it out the rest.'
  },
];

const FILING_OPTIONS = [
  {
    code: 'always',
    title: 'Yes, every year',
    desc: 'I have filed Modelo 210 every year without exception.'
  },
  {
    code: 'missed_some',
    title: 'Not always',
    desc: 'I have missed one or more years.'
  },
  {
    code: 'never',
    title: 'No, never',
    desc: 'I have not filed a Spanish property tax return.'
  },
  {
    code: 'unsure',
    title: 'I am not sure',
    desc: 'I am not certain what Modelo 210 is or whether I have filed.'
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const fmt = (n) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0
  }).format(n);

const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

const STEP_ORDER = ['country', 'property_use', 'cadastral_value', 'revision', 'rental_income', 'filing', 'email', 'results'];
const TOTAL_STEPS = 6; // shown to user (not counting intro/email/results)

const progressForStep = (step) => {
  const map = {
    country: 1, property_use: 2, cadastral_value: 3,
    revision: 4, rental_income: 4, filing: 5, email: 6
  };
  return ((map[step] || 0) / TOTAL_STEPS) * 100;
};

// ─── LOGO ────────────────────────────────────────────────────────────────────

function BuenoLogo() {
  return (
    <div className="calc-logo">
      <img
        src="/bueno-logo.jpg"
        alt="Bueno"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'inline';
        }}
      />
      <span className="calc-logo-text" style={{ display: 'none' }}>BUENO</span>
    </div>
  );
}

// ─── STEP WRAPPER ─────────────────────────────────────────────────────────────

function StepWrapper({ step, stepNum, totalSteps, onBack, children }) {
  return (
    <div className="step-card" key={step}>
      {onBack && (
        <button className="btn-back" onClick={onBack}>
          &#8592; Back
        </button>
      )}
      {stepNum && (
        <p className="step-hint" style={{ marginBottom: 8, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Question {stepNum} of {totalSteps}
        </p>
      )}
      {children}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function TaxCalculator() {
  const [step, setStep]         = useState('intro');
  const [form, setForm]         = useState({
    country: '', countryName: '', propertyUse: '', cadastralValue: '',
    hadRecentRevision: null, rentalIncome: '', filingHistory: '', email: ''
  });
  const [results, setResults]   = useState(null);
  const [aiReport, setAiReport] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const needsRevision   = form.propertyUse === 'personal' || form.propertyUse === 'mixed';
  const needsRental     = form.propertyUse === 'short_rental' || form.propertyUse === 'long_rental' || form.propertyUse === 'mixed';

  const getNextStep = (current) => {
    if (current === 'cadastral_value') {
      if (needsRevision) return 'revision';
      if (needsRental)   return 'rental_income';
      return 'filing';
    }
    if (current === 'revision') {
      if (needsRental) return 'rental_income';
      return 'filing';
    }
    const idx = STEP_ORDER.indexOf(current);
    return STEP_ORDER[idx + 1] || 'results';
  };

  const getPrevStep = (current) => {
    if (current === 'filing') {
      if (needsRental)   return 'rental_income';
      if (needsRevision) return 'revision';
      return 'cadastral_value';
    }
    if (current === 'rental_income') {
      if (needsRevision) return 'revision';
      return 'cadastral_value';
    }
    const idx = STEP_ORDER.indexOf(current);
    return STEP_ORDER[idx - 1] || 'intro';
  };

  const go = (next) => setStep(next);
  const next = () => go(getNextStep(step));
  const back = () => go(step === 'country' ? 'intro' : getPrevStep(step));

  const selectCountry = (c) => {
    setForm(f => ({ ...f, country: c.code, countryName: c.name }));
    setTimeout(() => go('property_use'), 180);
  };

  const selectPropertyUse = (code) => {
    setForm(f => ({ ...f, propertyUse: code }));
    setTimeout(() => go('cadastral_value'), 180);
  };

  const selectRevision = (val) => {
    setForm(f => ({ ...f, hadRecentRevision: val }));
    setTimeout(() => go(needsRental ? 'rental_income' : 'filing'), 180);
  };

  const selectFiling = (code) => {
    setForm(f => ({ ...f, filingHistory: code }));
    setTimeout(() => go('email'), 180);
  };

  const handleEmailSubmit = async () => {
    if (!validateEmail(form.email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError('');
    setIsLoading(true);
    setStep('loading');

    const calc = calculateTax(form);
    setResults(calc);

    // Save lead to Supabase
    await saveLead({ email: form.email, formData: form, results: calc });

    // Generate AI report
    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taxData: {
            countryName:    form.countryName,
            taxRate:        calc.taxRate,
            isEUEEA:        calc.isEUEEA,
            propertyUse:    form.propertyUse,
            annualTax:      calc.annualTax,
            filingHistory:  form.filingHistory,
            yearsUnfiled:   calc.yearsUnfiled,
            totalLiability: calc.totalLiability,
          }
        })
      });
      const data = await res.json();
      if (data.report) setAiReport(data.report);
    } catch (err) {
      console.error('Failed to generate AI report:', err);
    }

    setIsLoading(false);
    setStep('results');
  };

  // ── RENDER ──────────────────────────────────────────────────────────────────

  return (
    <div className="calc-shell">

      {/* Header */}
      <header className="calc-header">
        <BuenoLogo />
        {step !== 'intro' && step !== 'loading' && (
          <span style={{ fontSize: 11, fontFamily: 'var(--font-sans)', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Free Tax Calculator
          </span>
        )}
      </header>

      {/* Progress bar */}
      {!['intro', 'loading', 'results'].includes(step) && (
        <div className="progress-bar-wrap">
          <p className="progress-label">Your progress</p>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progressForStep(step)}%` }} />
          </div>
        </div>
      )}

      {/* Step content */}
      <main className="step-outer">

        {/* ── INTRO ── */}
        {step === 'intro' && (
          <div className="intro-card">
            <span className="intro-tag">Free for foreign property owners</span>
            <h1 className="intro-headline">
              Do you know how much Spanish property tax you owe <em>this year?</em>
            </h1>
            <p className="intro-body">
              Most foreign property owners either underpay, miss the filing deadline, or have never filed at all.
              This calculator shows your exact Modelo 210 obligation in under 2 minutes.
            </p>
            <div className="intro-divider" />
            <div className="intro-cta-wrap">
              <button className="btn-primary" onClick={() => go('country')}>
                Calculate my tax
                <span className="arrow">&#8594;</span>
              </button>
              <div className="intro-trust">
                <span className="intro-trust-item">Takes 2 minutes</span>
                <span className="trust-dot" />
                <span className="intro-trust-item">No account needed</span>
                <span className="trust-dot" />
                <span className="intro-trust-item">Free</span>
              </div>
            </div>
          </div>
        )}

        {/* ── COUNTRY ── */}
        {step === 'country' && (
          <StepWrapper step={step} stepNum={1} totalSteps={TOTAL_STEPS} onBack={back}>
            <h2 className="step-question">Where do you live?</h2>
            <p className="step-hint">Your country of residence determines your tax rate in Spain.</p>
            <div className="country-grid">
              {COUNTRIES.map(c => (
                <button
                  key={c.code}
                  className={`country-btn ${form.country === c.code ? 'selected' : ''}`}
                  onClick={() => selectCountry(c)}
                >
                  <span className="country-flag">{c.flag}</span>
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </StepWrapper>
        )}

        {/* ── PROPERTY USE ── */}
        {step === 'property_use' && (
          <StepWrapper step={step} stepNum={2} totalSteps={TOTAL_STEPS} onBack={back}>
            <h2 className="step-question">How do you use your Spanish property?</h2>
            <p className="step-hint">This determines how your taxable income is calculated.</p>
            <div className="option-stack">
              {PROPERTY_USE.map(o => (
                <button
                  key={o.code}
                  className={`option-card ${form.propertyUse === o.code ? 'selected' : ''}`}
                  onClick={() => selectPropertyUse(o.code)}
                >
                  <div>
                    <p className="option-title">{o.title}</p>
                    <p className="option-desc">{o.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </StepWrapper>
        )}

        {/* ── CADASTRAL VALUE ── */}
        {step === 'cadastral_value' && (
          <StepWrapper step={step} stepNum={3} totalSteps={TOTAL_STEPS} onBack={back}>
            <h2 className="step-question">What is your property's cadastral value?</h2>
            <p className="step-hint">
              This is the official registered value used to calculate your tax. You will find it on your annual IBI (council tax) bill or nota simple.
            </p>
            <div className="input-group">
              <div className="input-prefix-wrap">
                <span className="input-prefix">€</span>
                <input
                  className="value-input"
                  type="number"
                  placeholder="0"
                  min="0"
                  value={form.cadastralValue}
                  onChange={e => setForm(f => ({ ...f, cadastralValue: e.target.value }))}
                  autoFocus
                />
              </div>
              <p className="input-help">
                Not sure where to find it? It is listed as "Valor catastral" on your IBI receipt.
              </p>
            </div>
            <button
              className="btn-primary"
              disabled={!form.cadastralValue || parseFloat(form.cadastralValue) <= 0}
              onClick={next}
            >
              Continue <span className="arrow">&#8594;</span>
            </button>
            <button className="btn-skip" onClick={() => {
              setForm(f => ({ ...f, cadastralValue: '100000' }));
              next();
            }}>
              Use a typical estimate (€100,000) and continue
            </button>
          </StepWrapper>
        )}

        {/* ── CADASTRAL REVISION ── */}
        {step === 'revision' && (
          <StepWrapper step={step} stepNum={4} totalSteps={TOTAL_STEPS} onBack={back}>
            <h2 className="step-question">Has your property's cadastral value been revised in the last 10 years?</h2>
            <p className="step-hint">
              A General Cadastral Revision changes your tax rate from 2% to 1.1%. If you are unsure, we will use 2% — the more common assumption.
            </p>
            <div className="three-choice">
              {[
                { val: true,    label: 'Yes, it has' },
                { val: false,   label: 'No, it has not' },
                { val: 'unsure', label: 'Not sure' },
              ].map(opt => (
                <button
                  key={String(opt.val)}
                  className={`choice-btn ${form.hadRecentRevision === opt.val ? 'selected' : ''}`}
                  onClick={() => selectRevision(opt.val)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </StepWrapper>
        )}

        {/* ── RENTAL INCOME ── */}
        {step === 'rental_income' && (
          <StepWrapper step={step} stepNum={needsRevision ? 5 : 4} totalSteps={TOTAL_STEPS} onBack={back}>
            <h2 className="step-question">What was your total rental income last year?</h2>
            <p className="step-hint">
              Enter your gross rental income before any expenses. If you rented it out for the first time this year, use your expected annual income.
            </p>
            <div className="input-group">
              <div className="input-prefix-wrap">
                <span className="input-prefix">€</span>
                <input
                  className="value-input"
                  type="number"
                  placeholder="0"
                  min="0"
                  value={form.rentalIncome}
                  onChange={e => setForm(f => ({ ...f, rentalIncome: e.target.value }))}
                  autoFocus
                />
              </div>
              <p className="input-help">
                Note: EU/EEA residents can deduct certain expenses. Non-EU residents (including UK) are taxed on gross income.
              </p>
            </div>
            <button
              className="btn-primary"
              disabled={!form.rentalIncome || parseFloat(form.rentalIncome) <= 0}
              onClick={next}
            >
              Continue <span className="arrow">&#8594;</span>
            </button>
          </StepWrapper>
        )}

        {/* ── FILING HISTORY ── */}
        {step === 'filing' && (
          <StepWrapper step={step} stepNum={5} totalSteps={TOTAL_STEPS} onBack={back}>
            <h2 className="step-question">Have you filed Modelo 210 before?</h2>
            <p className="step-hint">
              Modelo 210 is the Spanish non-resident property tax return. It is due by December 31 each year.
            </p>
            <div className="option-stack">
              {FILING_OPTIONS.map(o => (
                <button
                  key={o.code}
                  className={`option-card ${form.filingHistory === o.code ? 'selected' : ''}`}
                  onClick={() => selectFiling(o.code)}
                >
                  <div>
                    <p className="option-title">{o.title}</p>
                    <p className="option-desc">{o.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </StepWrapper>
        )}

        {/* ── EMAIL ── */}
        {step === 'email' && (
          <StepWrapper step={step} stepNum={6} totalSteps={TOTAL_STEPS} onBack={back}>
            <h2 className="step-question">Your tax report is ready.</h2>
            <p className="step-hint">
              Enter your email to receive your full breakdown, including a personalised summary of your specific situation.
            </p>
            <div className="email-input-wrap">
              <input
                className={`email-input ${emailError ? 'error' : ''}`}
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={e => {
                  setForm(f => ({ ...f, email: e.target.value }));
                  if (emailError) setEmailError('');
                }}
                onKeyDown={e => e.key === 'Enter' && handleEmailSubmit()}
                autoFocus
              />
              {emailError && (
                <p style={{ color: 'var(--error)', fontSize: 12, marginTop: 6, fontFamily: 'var(--font-sans)' }}>
                  {emailError}
                </p>
              )}
            </div>
            <button className="btn-primary" onClick={handleEmailSubmit} disabled={!form.email}>
              Show my results <span className="arrow">&#8594;</span>
            </button>
            <p className="privacy-note">
              We will not share your email or send spam. Powered by Bueno, trusted by 2,000+ foreign property owners in Spain.
            </p>
          </StepWrapper>
        )}

        {/* ── LOADING ── */}
        {step === 'loading' && (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p className="loading-title">Calculating your tax obligation</p>
            <p className="loading-sub">Preparing your personalised report...</p>
          </div>
        )}

        {/* ── RESULTS ── */}
        {step === 'results' && results && (
          <div className="results-card">
            <StatusBadge status={results.status} />
            <h2 className="results-headline">
              {results.yearsUnfiled === 0
                ? 'Here is your annual tax obligation.'
                : `You may have ${results.yearsUnfiled} year${results.yearsUnfiled > 1 ? 's' : ''} of unfiled returns.`}
            </h2>
            <p className="results-subline">
              Based on your answers — {form.countryName}, {PROPERTY_USE.find(p => p.code === form.propertyUse)?.title?.toLowerCase()}.
            </p>

            {/* Main tax card */}
            <div className="tax-summary-panel">
              <p className="tax-summary-label">Annual tax obligation</p>
              <p className="tax-summary-amount">{fmt(results.annualTax)}</p>
              <p className="tax-summary-period">Per year / Modelo 210 / deadline December 31</p>
              <div className="tax-summary-grid">
                <div>
                  <p className="tax-summary-item-label">Tax rate</p>
                  <p className="tax-summary-item-value">{results.taxRate}%</p>
                </div>
                <div>
                  <p className="tax-summary-item-label">Residency status</p>
                  <p className="tax-summary-item-value">{results.isEUEEA ? 'EU / EEA resident' : 'Non-EU resident'}</p>
                </div>
                {results.deemedIncome > 0 && (
                  <div>
                    <p className="tax-summary-item-label">Deemed income</p>
                    <p className="tax-summary-item-value">{fmt(results.deemedIncome)} ({results.deemedIncomeRate}%)</p>
                  </div>
                )}
                {results.rentalIncome > 0 && (
                  <div>
                    <p className="tax-summary-item-label">Rental income assessed</p>
                    <p className="tax-summary-item-value">{fmt(results.rentalIncome)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Liability breakdown if behind */}
            {results.yearsUnfiled > 0 && (
              <div className="liability-panel">
                <p className="liability-title">Outstanding liability estimate</p>
                <div className="liability-row">
                  <span>This year's tax</span>
                  <span>{fmt(results.annualTax)}</span>
                </div>
                <div className="liability-row">
                  <span>Unpaid years ({results.yearsUnfiled} x {fmt(results.annualTax)})</span>
                  <span>{fmt(results.outstandingTax)}</span>
                </div>
                {results.penalty > 0 && (
                  <div className="liability-row">
                    <span>Late payment surcharge (estimated)</span>
                    <span>{fmt(results.penalty)}</span>
                  </div>
                )}
                <div className="liability-row">
                  <span>Total potential liability</span>
                  <span>{fmt(results.totalLiability)}</span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12, fontFamily: 'var(--font-sans)' }}>
                  Estimates only. Actual amounts depend on your exact situation. Spain can assess up to 4 prior years.
                </p>
              </div>
            )}

            {/* AI report */}
            {aiReport && (
              <div className="ai-report-panel">
                <p className="ai-report-label">Your personalised summary</p>
                <div className="ai-report-text">
                  {aiReport.split('\n\n').filter(Boolean).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="cta-panel">
              <p className="cta-panel-title">Let Bueno handle this for you.</p>
              <p className="cta-panel-body">
                Bueno files your Modelo 210 in English, from start to finish. No Spanish forms. No tax office visits.
                If you have outstanding years, we can help you get compliant.
              </p>
              <a
                href="https://getbueno.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <button className="btn-primary" style={{ marginBottom: 0 }}>
                  Get started with Bueno <span className="arrow">&#8594;</span>
                </button>
              </a>
              <p className="cta-panel-price">€99/year includes tax filing, Spanish account, Visa card, and human support.</p>
            </div>

            {/* Restart */}
            <button
              className="btn-skip"
              onClick={() => {
                setStep('intro');
                setForm({
                  country: '', countryName: '', propertyUse: '', cadastralValue: '',
                  hadRecentRevision: null, rentalIncome: '', filingHistory: '', email: ''
                });
                setResults(null);
                setAiReport('');
              }}
            >
              Start a new calculation
            </button>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="calc-footer">
        For guidance only. Not legal or tax advice. Consult a qualified tax professional for your specific situation.
        Built by Bueno. getbueno.com
      </footer>

    </div>
  );
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const labels = {
    current:  'Filing up to date',
    at_risk:  'Possible outstanding returns',
    overdue:  'Outstanding returns likely',
  };
  return (
    <div className={`status-badge ${status}`}>
      <span className="status-dot" />
      {labels[status]}
    </div>
  );
}
