import { useState } from 'react';
import { Link } from 'react-router-dom';
import { calculateTax } from './taxCalculations';
import { saveLead } from './supabase';

const COUNTRIES = [
  { code: 'norway',        name: 'Norway',         flag: '🇳🇴', isEUEEA: true  },
  { code: 'sweden',        name: 'Sweden',         flag: '🇸🇪', isEUEEA: true  },
  { code: 'denmark',       name: 'Denmark',        flag: '🇩🇰', isEUEEA: true  },
  { code: 'germany',       name: 'Germany',        flag: '🇩🇪', isEUEEA: true  },
  { code: 'france',        name: 'France',         flag: '🇫🇷', isEUEEA: true  },
  { code: 'netherlands',   name: 'Netherlands',    flag: '🇳🇱', isEUEEA: true  },
  { code: 'united_kingdom',name: 'United Kingdom', flag: '🇬🇧', isEUEEA: false },
  { code: 'belgium',       name: 'Belgium',        flag: '🇧🇪', isEUEEA: true  },
  { code: 'ireland',       name: 'Ireland',        flag: '🇮🇪', isEUEEA: true  },
  { code: 'finland',       name: 'Finland',        flag: '🇫🇮', isEUEEA: true  },
  { code: 'austria',       name: 'Austria',        flag: '🇦🇹', isEUEEA: true  },
  { code: 'iceland',       name: 'Iceland',        flag: '🇮🇸', isEUEEA: true  },
  { code: 'other_eu_eea',  name: 'Other EU / EEA', flag: '🇪🇺', isEUEEA: true  },
  { code: 'other',         name: 'Other country',  flag: '🌍', isEUEEA: false },
];

const PROPERTY_USE = [
  { code: 'personal',     title: 'Personal use only',          desc: 'I use it myself. I do not rent it out.' },
  { code: 'short_rental', title: 'Short-term / holiday rental', desc: 'Rented to tourists or guests, usually by the week.' },
  { code: 'long_rental',  title: 'Long-term rental',           desc: 'Rented to tenants on a monthly or annual basis.' },
  { code: 'mixed',        title: 'Mixed — personal and rental', desc: 'I use it part of the year and rent it out the rest.' },
];

const FILING_OPTIONS = [
  { code: 'always',      title: 'Yes, every year',  desc: 'I have filed Modelo 210 every year without exception.' },
  { code: 'missed_some', title: 'Not always',       desc: 'I have missed one or more years.' },
  { code: 'never',       title: 'No, never',        desc: 'I have not filed a Spanish property tax return.' },
  { code: 'unsure',      title: 'I am not sure',    desc: 'I am not certain what Modelo 210 is or whether I have filed.' },
];

const fmt = (n) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const TOTAL_STEPS = 6;
const progressForStep = (step) => {
  const map = { country: 1, property_use: 2, cadastral_value: 3, revision: 4, rental_income: 4, filing: 5, email: 6 };
  return ((map[step] || 0) / TOTAL_STEPS) * 100;
};

function Logo({ white }) {
  return (
    <div className="calc-logo-wrap">
      <img
        className="calc-logo-img"
        src={white ? '/images/bueno-logo-transparent.png' : '/images/bueno-logo-white.png'}
        alt="Bueno | Property Simplified"
        style={white ? { filter: 'brightness(0) invert(1)' } : {}}
      />
    </div>
  );
}

export default function TaxCalculator() {
  // Set page title
  if (typeof document !== 'undefined') {
    document.title = 'Spanish Property Tax Calculator | Bueno';
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

  const selectCountry     = (c)    => { setForm(f => ({ ...f, country: c.code, countryName: c.name })); setTimeout(() => go('property_use'), 160); };
  const selectPropertyUse = (code) => { setForm(f => ({ ...f, propertyUse: code })); setTimeout(() => go('cadastral_value'), 160); };
  const selectRevision    = (val)  => { setForm(f => ({ ...f, hadRecentRevision: val })); setTimeout(() => go(needsRental ? 'rental_income' : 'filing'), 160); };
  const selectFiling      = (code) => { setForm(f => ({ ...f, filingHistory: code })); setTimeout(() => go('email'), 160); };

  const handleEmailSubmit = async () => {
    if (!validateEmail(form.email)) { setEmailError('Please enter a valid email address.'); return; }
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

  return (
    <div className="calc-shell">

      <header className="calc-header" style={isOnDark ? { background: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.1)', position: 'absolute' } : {}}>
        <Logo white={isOnDark} />
        {!isOnDark && !['loading','results'].includes(step) && <span className="calc-header-tag">Free Tax Calculator</span>}
      </header>

      {!['intro','loading','results'].includes(step) && (
        <div className="progress-wrap">
          <div className="progress-inner">
            <span className="progress-label">Step {stepNum} of {TOTAL_STEPS}</span>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${progressForStep(step)}%` }} /></div>
          </div>
        </div>
      )}

      {step === 'intro' && (
        <div className="intro-hero">
          <div className="intro-left">
            <div className="intro-hero-inner">
              <div className="intro-eyebrow"><span className="intro-eyebrow-line" /><span className="intro-eyebrow-text">Free for foreign property owners</span></div>
              <h1 className="intro-headline">How much Spanish<br />property tax do<br />you owe <em>this year?</em></h1>
              <p className="intro-body">Most foreign property owners underpay, miss the deadline, or have never filed at all. This calculator shows your exact Modelo 210 obligation in under 2 minutes.</p>
              <div className="intro-cta-row">
                <button className="btn-primary-outline" onClick={() => go('country')}>Calculate my tax <span>&#8594;</span></button>
              </div>
              <div className="intro-trust-row">
                <span className="intro-trust-item">Takes 2 minutes</span><span className="intro-trust-dot" />
                <span className="intro-trust-item">No account needed</span><span className="intro-trust-dot" />
                <span className="intro-trust-item">Free</span><span className="intro-trust-dot" />
                <span className="intro-trust-item">Trusted by 2,000+ owners</span>
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
          <button className="btn-back" onClick={back}>&#8592; Back</button>
          <p className="step-meta">Question 1 of {TOTAL_STEPS}</p>
          <h2 className="step-question">Where do you live?</h2>
          <p className="step-hint">Your country of residence determines your tax rate in Spain.</p>
          <div className="country-grid">
            {COUNTRIES.map(c => (
              <button key={c.code} className={`country-btn ${form.country === c.code ? 'selected' : ''}`} onClick={() => selectCountry(c)}>
                <span className="country-flag">{c.flag}</span><span>{c.name}</span>
              </button>
            ))}
          </div>
        </div></div>
      )}

      {step === 'property_use' && (
        <div className="step-screen"><div className="step-inner">
          <button className="btn-back" onClick={back}>&#8592; Back</button>
          <p className="step-meta">Question 2 of {TOTAL_STEPS}</p>
          <h2 className="step-question">How do you use your Spanish property?</h2>
          <p className="step-hint">This determines how your taxable income is calculated.</p>
          <div className="option-stack">
            {PROPERTY_USE.map(o => (
              <button key={o.code} className={`option-card ${form.propertyUse === o.code ? 'selected' : ''}`} onClick={() => selectPropertyUse(o.code)}>
                <div><p className="option-title">{o.title}</p><p className="option-desc">{o.desc}</p></div>
              </button>
            ))}
          </div>
        </div></div>
      )}

      {step === 'cadastral_value' && (
        <div className="step-screen"><div className="step-inner">
          <button className="btn-back" onClick={back}>&#8592; Back</button>
          <p className="step-meta">Question 3 of {TOTAL_STEPS}</p>
          <h2 className="step-question">What is your property's cadastral value?</h2>
          <p className="step-hint">Find it on your annual IBI (council tax) bill, listed as "Valor catastral".</p>
          <div className="input-group">
            <div className="input-prefix-wrap">
              <span className="input-prefix">€</span>
              <input className="value-input" type="number" placeholder="0" min="0" value={form.cadastralValue}
                onChange={e => setForm(f => ({ ...f, cadastralValue: e.target.value }))} autoFocus />
            </div>
          </div>
          <button className="btn-primary" disabled={!form.cadastralValue || parseFloat(form.cadastralValue) <= 0} onClick={next}>Continue <span className="arrow">&#8594;</span></button>
          <button className="btn-skip" onClick={() => { setForm(f => ({ ...f, cadastralValue: '100000' })); next(); }}>Use a typical estimate (€100,000) and continue</button>
        </div></div>
      )}

      {step === 'revision' && (
        <div className="step-screen"><div className="step-inner">
          <button className="btn-back" onClick={back}>&#8592; Back</button>
          <p className="step-meta">Question 4 of {TOTAL_STEPS}</p>
          <h2 className="step-question">Has your cadastral value been revised in the last 10 years?</h2>
          <p className="step-hint">A General Cadastral Revision changes your tax rate from 2% to 1.1%. If unsure, we use 2% — the more conservative assumption.</p>
          <div className="three-choice">
            {[{ val: true, label: 'Yes, it has' }, { val: false, label: 'No, it has not' }, { val: 'unsure', label: 'Not sure' }].map(opt => (
              <button key={String(opt.val)} className={`choice-btn ${form.hadRecentRevision === opt.val ? 'selected' : ''}`} onClick={() => selectRevision(opt.val)}>{opt.label}</button>
            ))}
          </div>
        </div></div>
      )}

      {step === 'rental_income' && (
        <div className="step-screen"><div className="step-inner">
          <button className="btn-back" onClick={back}>&#8592; Back</button>
          <p className="step-meta">Question {needsRevision ? 5 : 4} of {TOTAL_STEPS}</p>
          <h2 className="step-question">What was your total rental income last year?</h2>
          <p className="step-hint">Enter gross rental income before expenses. EU/EEA residents may deduct costs. UK and non-EU residents are taxed on gross income.</p>
          <div className="input-group">
            <div className="input-prefix-wrap">
              <span className="input-prefix">€</span>
              <input className="value-input" type="number" placeholder="0" min="0" value={form.rentalIncome}
                onChange={e => setForm(f => ({ ...f, rentalIncome: e.target.value }))} autoFocus />
            </div>
          </div>
          <button className="btn-primary" disabled={!form.rentalIncome || parseFloat(form.rentalIncome) <= 0} onClick={next}>Continue <span className="arrow">&#8594;</span></button>
        </div></div>
      )}

      {step === 'filing' && (
        <div className="step-screen"><div className="step-inner">
          <button className="btn-back" onClick={back}>&#8592; Back</button>
          <p className="step-meta">Question 5 of {TOTAL_STEPS}</p>
          <h2 className="step-question">Have you filed Modelo 210 before?</h2>
          <p className="step-hint">Modelo 210 is the Spanish non-resident property tax return, due by December 31 each year.</p>
          <div className="option-stack">
            {FILING_OPTIONS.map(o => (
              <button key={o.code} className={`option-card ${form.filingHistory === o.code ? 'selected' : ''}`} onClick={() => selectFiling(o.code)}>
                <div><p className="option-title">{o.title}</p><p className="option-desc">{o.desc}</p></div>
              </button>
            ))}
          </div>
        </div></div>
      )}

      {step === 'email' && (
        <div className="step-screen"><div className="step-inner">
          <button className="btn-back" onClick={back}>&#8592; Back</button>
          <p className="step-meta">Question 6 of {TOTAL_STEPS}</p>
          <h2 className="step-question">Your tax report is ready.</h2>
          <p className="step-hint">Enter your email to receive your full breakdown and a personalised summary of your situation.</p>
          <div className="email-input-wrap">
            <input className={`email-input ${emailError ? 'error' : ''}`} type="email" placeholder="your@email.com"
              value={form.email} onChange={e => { setForm(f => ({ ...f, email: e.target.value })); if (emailError) setEmailError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleEmailSubmit()} autoFocus />
            {emailError && <p style={{ color: '#C0392B', fontSize: 12, marginTop: 6, fontFamily: 'var(--font-sans)' }}>{emailError}</p>}
          </div>
          <button className="btn-primary" onClick={handleEmailSubmit} disabled={!form.email}>Show my results <span className="arrow">&#8594;</span></button>
          <p className="privacy-note">We will not share your email. Powered by Bueno, trusted by 2,000+ foreign property owners in Spain.</p>
        </div></div>
      )}

      {step === 'loading' && (
        <div className="loading-screen">
          <div className="loading-spinner" />
          <p className="loading-title">Calculating your tax obligation</p>
          <p className="loading-sub">Preparing your personalised report</p>
        </div>
      )}

      {step === 'results' && results && (
        <div className="results-screen"><div className="results-inner">
          <StatusBadge status={results.status} />
          <h2 className="results-headline">
            {results.yearsUnfiled === 0 ? 'Here is your annual tax obligation.' : `You may have ${results.yearsUnfiled} year${results.yearsUnfiled > 1 ? 's' : ''} of unfiled returns.`}
          </h2>
          <p className="results-subline">{form.countryName} resident. {PROPERTY_USE.find(p => p.code === form.propertyUse)?.title}.</p>

          <div className="tax-panel">
            <p className="tax-panel-label">Annual tax obligation</p>
            <p className="tax-panel-amount">{fmt(results.annualTax)}</p>
            <p className="tax-panel-period">Per year — Modelo 210 — deadline December 31</p>
            <div className="tax-panel-grid">
              <div><p className="tax-panel-item-label">Tax rate</p><p className="tax-panel-item-value">{results.taxRate}%</p></div>
              <div><p className="tax-panel-item-label">Residency</p><p className="tax-panel-item-value">{results.isEUEEA ? 'EU / EEA' : 'Non-EU'}</p></div>
              {results.deemedIncome > 0 && <div><p className="tax-panel-item-label">Deemed income</p><p className="tax-panel-item-value">{fmt(results.deemedIncome)} ({results.deemedIncomeRate}%)</p></div>}
              {results.rentalIncome > 0 && <div><p className="tax-panel-item-label">Rental income assessed</p><p className="tax-panel-item-value">{fmt(results.rentalIncome)}</p></div>}
            </div>
          </div>

          {results.yearsUnfiled > 0 && (
            <div className="liability-panel">
              <p className="liability-title">Outstanding liability estimate</p>
              <div className="liability-row"><span>This year's tax</span><span>{fmt(results.annualTax)}</span></div>
              <div className="liability-row"><span>Unpaid years ({results.yearsUnfiled} × {fmt(results.annualTax)})</span><span>{fmt(results.outstandingTax)}</span></div>
              {results.penalty > 0 && <div className="liability-row"><span>Late payment surcharge (estimated)</span><span>{fmt(results.penalty)}</span></div>}
              <div className="liability-row"><span>Total potential liability</span><span>{fmt(results.totalLiability)}</span></div>
              <p className="liability-disclaimer">Estimates only. Spain can assess up to 4 prior years. Consult a tax professional for your exact position.</p>
            </div>
          )}

          {aiReport && (
            <div className="ai-panel">
              <p className="ai-panel-label">Your personalised summary</p>
              <div className="ai-panel-text">{aiReport.split('\n\n').filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}</div>
            </div>
          )}

          <div className="cta-panel">
            <p className="cta-eyebrow">Bueno Tax Filing</p>
            <p className="cta-title">Let Bueno handle this for you.</p>
            <p className="cta-body">Bueno files your Modelo 210 in English, from start to finish. No Spanish forms, no tax office visits. If you have outstanding years, we can help you get compliant.</p>
            <a href="https://getbueno.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
              <button className="btn-primary" style={{ marginBottom: 0 }}>Get started with Bueno <span className="arrow">&#8594;</span></button>
            </a>
            <p className="cta-price">€99/year includes tax filing, Spanish account, Visa card, and human support.</p>
          </div>

          <button className="btn-skip" onClick={() => { setStep('intro'); setResults(null); setAiReport(''); setForm({ country: '', countryName: '', propertyUse: '', cadastralValue: '', hadRecentRevision: null, rentalIncome: '', filingHistory: '', email: '' }); }}>
            Start a new calculation
          </button>

          <div style={{ textAlign: 'center', padding: '16px 0 4px', borderTop: '1px solid var(--border)', marginTop: 8 }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Also from Bueno</p>
            <Link to="/cost-audit" style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--accent)', textDecoration: 'none' }}>
              Check if you are overpaying on banking and energy &#8594;
            </Link>
          </div>
        </div></div>
      )}

      {!['intro'].includes(step) && (
        <footer className="calc-footer">For guidance only. Not legal or tax advice. Consult a qualified tax professional for your specific situation. Built by Bueno. getbueno.com</footer>
      )}

    </div>
  );
}

function StatusBadge({ status }) {
  const labels = { current: 'Filing up to date', at_risk: 'Possible outstanding returns', overdue: 'Outstanding returns likely' };
  return <div className={`status-badge ${status}`}><span className="status-dot" />{labels[status]}</div>;
}
