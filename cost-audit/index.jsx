import { useState } from 'react';
import { Link } from 'react-router-dom';
import { calculateAudit, BANKS, ENERGY_PROVIDERS } from './auditCalculations';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const fmt = (n) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

const TOTAL_STEPS = 3;

const progressForStep = (step) => {
  const map = { bank: 1, mortgage: 2, energy: 3 };
  return ((map[step] || 0) / TOTAL_STEPS) * 100;
};

// ─── LOGO ────────────────────────────────────────────────────────────────────

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

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function CostAudit() {
  if (typeof document !== 'undefined') {
    document.title = 'Spanish Property Cost Audit | Bueno';
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
        <Logo white={isOnDark} />
        {!isOnDark && !['results'].includes(step) && (
          <span className="calc-header-tag">Free Cost Audit</span>
        )}
      </header>

      {/* Progress bar */}
      {!['intro', 'results'].includes(step) && (
        <div className="progress-wrap">
          <div className="progress-inner">
            <span className="progress-label">Step {stepNum} of {TOTAL_STEPS}</span>
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
                <span className="intro-eyebrow-text">Free for foreign property owners</span>
              </div>
              <h1 className="intro-headline">
                Are you overpaying<br />for your Spanish<br /><em>property?</em>
              </h1>
              <p className="intro-body">
                Most foreign owners overpay by €200-400 every year without knowing it.
                This 2-minute audit shows exactly where your money is going and what you could save.
              </p>
              <div className="intro-cta-row">
                <button className="btn-primary-outline" onClick={() => go('bank')}>
                  Start my free audit <span>&#8594;</span>
                </button>
              </div>
              <div className="intro-trust-row">
                <span className="intro-trust-item">Takes 2 minutes</span>
                <span className="intro-trust-dot" />
                <span className="intro-trust-item">No account needed</span>
                <span className="intro-trust-dot" />
                <span className="intro-trust-item">Free</span>
                <span className="intro-trust-dot" />
                <span className="intro-trust-item">Trusted by 2,000+ owners</span>
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
            <button className="btn-back" onClick={back}>&#8592; Back</button>
            <p className="step-meta">Question 1 of {TOTAL_STEPS}</p>
            <h2 className="step-question">Which Spanish bank do you currently use?</h2>
            <p className="step-hint">This determines your current annual account fees.</p>
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
            <button className="btn-back" onClick={back}>&#8592; Back</button>
            <p className="step-meta">Question 2 of {TOTAL_STEPS}</p>
            <h2 className="step-question">Do you have a mortgage on your Spanish property?</h2>
            <p className="step-hint">Banks typically waive fees for mortgage holders. This affects your current cost.</p>
            <div className="option-stack">
              {[
                { val: 'yes', title: 'Yes, I have a mortgage', desc: 'My Spanish bank holds the mortgage on this property.' },
                { val: 'no',  title: 'No mortgage',           desc: 'I own the property outright or financed it elsewhere.' },
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
            <button className="btn-back" onClick={back}>&#8592; Back</button>
            <p className="step-meta">Question 3 of {TOTAL_STEPS}</p>
            <h2 className="step-question">Who is your Spanish electricity provider?</h2>
            <p className="step-hint">Bueno Energy customers save up to 50% on electricity bills. This shows your potential saving.</p>
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
              {results.netSavings > 0 ? 'You are likely overpaying' : 'Your costs look competitive'}
            </div>

            <h2 className="results-headline">
              {results.netSavings > 0
                ? `You could save ${fmt(results.netSavings)} this year.`
                : 'Your current setup is already competitive.'}
            </h2>
            <p className="results-subline">
              Based on your {results.bankLabel} account {results.hasMortgage ? 'with mortgage' : 'without mortgage'}.
            </p>

            {/* Savings hero */}
            {results.netSavings > 0 && (
              <div className="savings-hero">
                <p className="savings-hero-label">Estimated annual saving with Bueno</p>
                <p className="savings-hero-amount">{fmt(results.netSavings)}</p>
                <p className="savings-hero-sub">per year — after Bueno membership of €99</p>
              </div>
            )}

            {/* Breakdown */}
            <div className="breakdown-panel">
              <p className="breakdown-title">Where the savings come from</p>

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
                    <span>Current ({fmt(results.totalCurrentCost)}/yr)</span>
                    <span>With Bueno ({fmt(results.buenoAnnualCost)}/yr)</span>
                  </div>
                </>
              )}

              {results.currentBankCost > 0 && (
                <div className="breakdown-row">
                  <span className="breakdown-row-label">{results.bankLabel} annual fees</span>
                  <span className="breakdown-row-value red">{fmt(results.currentBankCost)}/yr</span>
                </div>
              )}
              {results.currentBankCost === 0 && (
                <div className="breakdown-row">
                  <span className="breakdown-row-label">{results.bankLabel} annual fees</span>
                  <span className="breakdown-row-value green">Already €0</span>
                </div>
              )}
              {results.hasEnergy && results.energyOverpayment > 0 && (
                <div className="breakdown-row">
                  <span className="breakdown-row-label">Energy overpayment vs Bueno Energy</span>
                  <span className="breakdown-row-value red">{fmt(results.energyOverpayment)}/yr</span>
                </div>
              )}
              <div className="breakdown-row">
                <span className="breakdown-row-label">Bueno membership</span>
                <span className="breakdown-row-value">{fmt(results.buenoAnnualCost)}/yr</span>
              </div>
              <div className="breakdown-row" style={{ fontWeight: 600 }}>
                <span>Net saving with Bueno</span>
                <span className="breakdown-row-value" style={{ color: results.netSavings > 0 ? '#1A7A4A' : 'inherit' }}>
                  {results.netSavings > 0 ? fmt(results.netSavings) : '—'}
                </span>
              </div>
            </div>

            {/* What Bueno includes */}
            <div className="ai-panel" style={{ marginBottom: 16 }}>
              <p className="ai-panel-label">What is included in Bueno</p>
              <div className="ai-panel-text">
                <p>
                  Your €99 Bueno membership includes a Spanish IBAN account, Visa debit card, multilingual human support,
                  Bueno Energy switching, Modelo 210 tax filing, and the Bueno Club perks programme.
                </p>
                <p>
                  Unlike traditional Spanish banks, there are no hidden charges, no language barriers,
                  and no unexpected fees. Everything is transparent from day one.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="cta-panel">
              <p className="cta-eyebrow">Switch to Bueno</p>
              <p className="cta-title">
                {results.netSavings > 0
                  ? `Start saving ${fmt(results.netSavings)} this year.`
                  : 'Simplify your Spanish property finances.'}
              </p>
              <p className="cta-body">
                Open your Bueno account in minutes. No Spanish residency required.
                Human support in English, Norwegian, Swedish, Danish, German, and French.
              </p>
              <a href="https://getbueno.com" target="_blank" rel="noopener noreferrer"
                style={{ textDecoration: 'none', display: 'block' }}>
                <button className="btn-primary" style={{ marginBottom: 0 }}>
                  Open my Bueno account <span className="arrow">&#8594;</span>
                </button>
              </a>
              <p className="cta-price">€99/year. Cancel anytime. Setup takes under 10 minutes.</p>
            </div>

            {/* Also try tax calculator */}
            <div style={{
              textAlign: 'center',
              padding: '20px 0',
              borderTop: '1px solid var(--border)',
              marginBottom: 16
            }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
                Also from Bueno
              </p>
              <Link to="/tax-calculator" style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                color: 'var(--accent)',
                textDecoration: 'none',
                letterSpacing: '0.04em'
              }}>
                Calculate your Spanish property tax obligation &#8594;
              </Link>
            </div>

            <button className="btn-skip" onClick={() => {
              setStep('intro');
              setForm({ bank: '', mortgage: '', energyProvider: '' });
              setResults(null);
            }}>
              Start a new audit
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      {step !== 'intro' && (
        <footer className="calc-footer">
          Estimates based on published bank tariffs and average energy consumption. For guidance only. Built by Bueno. getbueno.com
        </footer>
      )}

    </div>
  );
}
