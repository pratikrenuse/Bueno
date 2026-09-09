import { useState } from 'react';
import { calculateTax, imputedRateRuleId, usesImputed, usesRent, displayable } from './taxCalculations';
import { deadlineDate, directDebitGapDays } from '../late-surcharge/calc.js';
import { saveLead } from './supabase';
import { useT, LLink, useLocale } from '../i18n.jsx';
import SourceNote from '../SourceNote.jsx';
import { rule, ruleStatus } from '../rules/index.js';
import copyDict from './copy.js';
import LangSwitcher from '../LangSwitcher.jsx';
import SiteFooter from '../SiteFooter.jsx';
import SiteNav from '../SiteNav.jsx';
import enDict from '../en.json';

// The non-resident property tax calculator, on the rules base.
//
// Every figure this screen prints is read below through rule(), with its source shown next
// to it. Two of the things it used to print were simply wrong and are worth naming, because
// the same mistakes are all over the internet.
//
// It told rental and mixed-use owners the deadline was 31 December. That is the imputed
// income window and it has never been the rental one. The window depends on the accrual
// year, which is why this tool now asks for the year, and the router that picks the rule is
// the one late-surcharge already uses so the two tools cannot drift apart.
//
// It taxed EU and EEA rent on the gross amount while the hint above the input said costs
// were deductible, and while the rental-tax tool on this same site deducted them. This tool
// still does not ask for costs, so it still reports the gross basis. The difference is that
// it now says so on the screen, next to the number, and links to the tool that does the
// deduction. A calculator may be less precise than its neighbour. It may not disagree with
// it in silence.

const COUNTRIES = [
  { code: 'norway',         abbr: 'NO',  isEUEEA: true  },
  { code: 'sweden',         abbr: 'SE',  isEUEEA: true  },
  { code: 'denmark',        abbr: 'DK',  isEUEEA: true  },
  { code: 'germany',        abbr: 'DE',  isEUEEA: true  },
  { code: 'france',         abbr: 'FR',  isEUEEA: true  },
  { code: 'netherlands',    abbr: 'NL',  isEUEEA: true  },
  { code: 'united_kingdom', abbr: 'UK',  isEUEEA: false },
  { code: 'belgium',        abbr: 'BE',  isEUEEA: true  },
  { code: 'ireland',        abbr: 'IE',  isEUEEA: true  },
  { code: 'finland',        abbr: 'FI',  isEUEEA: true  },
  { code: 'austria',        abbr: 'AT',  isEUEEA: true  },
  { code: 'iceland',        abbr: 'IS',  isEUEEA: true  },
  { code: 'other_eu_eea',   abbr: 'EU',  isEUEEA: true  },
  { code: 'other',          abbr: 'INT', isEUEEA: false },
];

const PROPERTY_USE_CODES = ['personal', 'short_rental', 'long_rental', 'mixed'];
const FILING_CODES        = ['always', 'missed_some', 'never', 'unsure'];

// Read once, at module load. rule() throws rather than return an unverified figure, so a
// missing or downgraded rule stops the build instead of reaching a reader.
const RATES     = rule('irnr.rates');
const SPECIAL   = rule('irnr.imputed.rate_special_2023_2025');
const STANDING  = rule('irnr.imputed.rate_standing');
const RECARGO   = rule('late.recargo.voluntary');

// The accrual years this tool offers. The current year plus the three before it, which is
// the span the deadline and rate rules actually cover between them.
const THIS_YEAR = new Date().getFullYear();
const YEARS = [0, 1, 2, 3].map(n => THIS_YEAR - n);

const fmt = (n) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n || 0);
const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const longDate = (iso) => {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
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
  const { locale } = useLocale();
  const tt = (k) => t('calc_tax.' + k);
  const tc = (k) => t('common.' + k);
  const c  = (k) => {
    const dict = copyDict[locale] || copyDict.en;
    return dict[k] != null ? dict[k] : (copyDict.en[k] != null ? copyDict.en[k] : k);
  };
  const countryName = (code) => t('countries.' + code);

  if (typeof document !== 'undefined') {
    document.title = `${t('cards.tax.title')} | Spain 24/7`;
  }

  const [step, setStep]             = useState('intro');
  const [form, setForm]             = useState({ country: '', countryName: '', taxYear: '', propertyUse: '', cadastralValue: '', hadRecentRevision: null, rentalIncome: '', filingHistory: '', email: '' });
  const [results, setResults]       = useState(null);
  const [aiReport, setAiReport]     = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const [emailError, setEmailError] = useState('');

  // Whether the rules base can price imputed income for the year chosen. The 1.1 percent
  // rate is stated for a named list of years; anything after them lands on a rule that is
  // unverified today, and an unverified figure does not get shown in any form.
  const rateRuleId       = imputedRateRuleId(form.taxYear, SPECIAL.value.years);
  const imputedSupported = !!rateRuleId && displayable(ruleStatus(rateRuleId));

  const needsImputed = usesImputed(form.propertyUse) && imputedSupported;
  const needsRental  = usesRent(form.propertyUse);

  // The questions this owner actually gets, in order. Derived rather than mapped, so the
  // counter cannot say "question 5 of 6" on a path that has four questions.
  const sequence = ['country', 'tax_year', 'property_use']
    .concat(needsImputed ? ['cadastral_value', 'revision'] : [])
    .concat(needsRental ? ['rental_income'] : [])
    .concat(['filing', 'email']);

  const total   = sequence.length;
  const stepNum = sequence.indexOf(step) + 1;

  const go   = (s) => setStep(s);
  const next = () => go(sequence[sequence.indexOf(step) + 1] || 'results');
  const back = () => {
    const i = sequence.indexOf(step);
    go(i <= 0 ? 'intro' : sequence[i - 1]);
  };

  // The next step after an answer that changes the sequence has to be worked out from the
  // answer itself, because state has not settled by the time this runs.
  const afterUse = (code) => {
    const imputedNeeded = usesImputed(code) && imputedSupported;
    if (imputedNeeded) return 'cadastral_value';
    if (usesRent(code)) return 'rental_income';
    return 'filing';
  };
  const afterYear = () => 'property_use';

  const selectCountry     = (c2)   => { setForm(f => ({ ...f, country: c2.code, countryName: countryName(c2.code) })); setTimeout(() => go('tax_year'), 160); };
  const selectYear        = (y)    => { setForm(f => ({ ...f, taxYear: String(y) })); setTimeout(() => go(afterYear()), 160); };
  const selectPropertyUse = (code) => { setForm(f => ({ ...f, propertyUse: code })); setTimeout(() => go(afterUse(code)), 160); };
  const selectRevision    = (val)  => { setForm(f => ({ ...f, hadRecentRevision: val })); setTimeout(() => go(needsRental ? 'rental_income' : 'filing'), 160); };
  const selectFiling      = (code) => { setForm(f => ({ ...f, filingHistory: code })); setTimeout(() => go('email'), 160); };

  const handleEmailSubmit = async () => {
    if (!validateEmail(form.email)) { setEmailError(tt('email_invalid')); return; }
    setEmailError(''); setIsLoading(true); setStep('loading');
    const calc = calculateTax(form, {
      rates: RATES.value,
      special: SPECIAL.value,
      standing: STANDING.value,
      statusOf: ruleStatus,
    });
    setResults(calc);
    const enCountryName = (enDict.countries && enDict.countries[form.country]) || form.countryName;
    await saveLead({ email: form.email, formData: { ...form, countryName: enCountryName }, results: calc });
    // No summary is requested where there is no figure to summarise.
    if (calc.annualTax != null) {
      try {
        const res  = await fetch('/api/generate-report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taxData: { countryName: form.countryName, taxRate: calc.taxRate, isEUEEA: calc.isEUEEA, propertyUse: form.propertyUse, annualTax: calc.annualTax, filingHistory: form.filingHistory, yearsUnfiled: calc.yearsUnfiled, totalLiability: calc.totalLiability } }) });
        const data = await res.json(); if (data.report) setAiReport(data.report);
      } catch (err) { console.error(err); }
    }
    setIsLoading(false); setStep('results');
  };

  const isOnDark = step === 'intro';

  const resultHeadline = () => {
    if (!results) return '';
    if (results.yearsUnfiled === 0) return tt('headline_current');
    if (results.yearsUnfiled === 1) return tt('headline_unfiled_one');
    return tt('headline_unfiled_many').replace('{n}', results.yearsUnfiled);
  };

  const propertyUseTitle = (code) => tt(`use_${code}_t`);

  // A figure, or a range where the tool honestly cannot narrow it.
  const money = (low, high) => (high != null && high > low ? `${fmt(low)} to ${fmt(high)}` : fmt(low));

  const restart = () => {
    setStep('intro'); setResults(null); setAiReport('');
    setForm({ country: '', countryName: '', taxYear: '', propertyUse: '', cadastralValue: '', hadRecentRevision: null, rentalIncome: '', filingHistory: '', email: '' });
  };

  return (
    <div className="calc-shell">

      <header className="calc-header" style={isOnDark ? { background: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.1)', position: 'absolute' } : {}}>
        <Logo white={isOnDark} sub={t('home.brand_sub')} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {!isOnDark && !['loading','results'].includes(step) && <span className="calc-header-tag">{tt('header_tag')}</span>}
          <SiteNav active="tools" /><LangSwitcher />
        </div>
      </header>

      {!['intro','loading','results'].includes(step) && (
        <div className="progress-wrap">
          <div className="progress-inner">
            <span className="progress-label">{tc('step')} {stepNum} {tc('of')} {total}</span>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${(stepNum / total) * 100}%` }} /></div>
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
            <img src="/images/hero-tax.jpg" alt="Spanish property owners" />
          </div>
        </div>
      )}

      {step === 'country' && (
        <div className="step-screen"><div className="step-inner">
          <button className="btn-back" onClick={back}>&#8592; {tc('back')}</button>
          <p className="step-meta">{tc('question')} {stepNum} {tc('of')} {total}</p>
          <h2 className="step-question">{tt('country_q')}</h2>
          <p className="step-hint">{tt('country_hint')}</p>
          <div className="country-grid">
            {COUNTRIES.map(c2 => (
              <button key={c2.code} className={`country-btn ${form.country === c2.code ? 'selected' : ''}`} onClick={() => selectCountry(c2)}>
                <span className="country-flag">{c2.abbr}</span><span>{countryName(c2.code)}</span>
              </button>
            ))}
          </div>
        </div></div>
      )}

      {step === 'tax_year' && (
        <div className="step-screen"><div className="step-inner">
          <button className="btn-back" onClick={back}>&#8592; {tc('back')}</button>
          <p className="step-meta">{tc('question')} {stepNum} {tc('of')} {total}</p>
          <h2 className="step-question">{c('year_q')}</h2>
          <p className="step-hint">{c('year_hint')}</p>
          <div className="three-choice">
            {YEARS.map(y => (
              <button key={y} className={`choice-btn ${form.taxYear === String(y) ? 'selected' : ''}`} onClick={() => selectYear(y)}>{y}</button>
            ))}
          </div>
        </div></div>
      )}

      {step === 'property_use' && (
        <div className="step-screen"><div className="step-inner">
          <button className="btn-back" onClick={back}>&#8592; {tc('back')}</button>
          <p className="step-meta">{tc('question')} {stepNum} {tc('of')} {total}</p>
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
          <p className="step-meta">{tc('question')} {stepNum} {tc('of')} {total}</p>
          <h2 className="step-question">{tt('cadastral_q')}</h2>
          <p className="step-hint">{tt('cadastral_hint')}</p>
          <div className="input-group">
            <div className="input-prefix-wrap">
              <span className="input-prefix">€</span>
              <input className="value-input" type="number" placeholder="0" min="0" value={form.cadastralValue}
                onChange={e => setForm(f => ({ ...f, cadastralValue: e.target.value }))} autoFocus />
            </div>
          </div>
          <SourceNote ids="irnr.imputed.base" label="Why the cadastral value and not the price you paid" />
          <button className="btn-primary" disabled={!form.cadastralValue || parseFloat(form.cadastralValue) <= 0} onClick={next}>{tc('continue')} <span className="arrow">&#8594;</span></button>
          <button className="btn-skip" onClick={() => { setForm(f => ({ ...f, cadastralValue: '100000' })); next(); }}>{tt('cadastral_skip')}</button>
        </div></div>
      )}

      {step === 'revision' && (
        <div className="step-screen"><div className="step-inner">
          <button className="btn-back" onClick={back}>&#8592; {tc('back')}</button>
          <p className="step-meta">{tc('question')} {stepNum} {tc('of')} {total}</p>
          <h2 className="step-question">{rateRuleId === 'irnr.imputed.rate_special_2023_2025' ? c('revision_q_since') : tt('revision_q')}</h2>
          <p className="step-hint">{rateRuleId === 'irnr.imputed.rate_special_2023_2025' ? c('revision_hint_since') : tt('revision_hint')}</p>
          <div className="three-choice">
            {[{ val: true, label: c('revision_yes') }, { val: false, label: c('revision_no') }, { val: 'unsure', label: c('revision_unsure') }].map(opt => (
              <button key={String(opt.val)} className={`choice-btn ${form.hadRecentRevision === opt.val ? 'selected' : ''}`} onClick={() => selectRevision(opt.val)}>{opt.label}</button>
            ))}
          </div>
          {rateRuleId && <SourceNote ids={rateRuleId} label="The rule this question comes from" />}
        </div></div>
      )}

      {step === 'rental_income' && (
        <div className="step-screen"><div className="step-inner">
          <button className="btn-back" onClick={back}>&#8592; {tc('back')}</button>
          <p className="step-meta">{tc('question')} {stepNum} {tc('of')} {total}</p>
          <h2 className="step-question">{tt('rental_q')}</h2>
          <p className="step-hint">{tt('rental_hint')}</p>
          <div className="input-group">
            <div className="input-prefix-wrap">
              <span className="input-prefix">€</span>
              <input className="value-input" type="number" placeholder="0" min="0" value={form.rentalIncome}
                onChange={e => setForm(f => ({ ...f, rentalIncome: e.target.value }))} autoFocus />
            </div>
          </div>
          <SourceNote ids="irnr.rental.deductibility" label="What may be deducted, and by whom" />
          <button className="btn-primary" disabled={!form.rentalIncome || parseFloat(form.rentalIncome) <= 0} onClick={next}>{tc('continue')} <span className="arrow">&#8594;</span></button>
        </div></div>
      )}

      {step === 'filing' && (
        <div className="step-screen"><div className="step-inner">
          <button className="btn-back" onClick={back}>&#8592; {tc('back')}</button>
          <p className="step-meta">{tc('question')} {stepNum} {tc('of')} {total}</p>
          <h2 className="step-question">{tt('filing_q')}</h2>
          <p className="step-hint">{c('filing_hint')}</p>
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
          <p className="step-meta">{tc('question')} {stepNum} {tc('of')} {total}</p>
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
          <h2 className="results-headline">
            {results.annualTax == null
              ? c('not_covered_title').replace('{year}', results.year)
              : resultHeadline()}
          </h2>
          <p className="results-subline">{tt('subline').replace('{country}', form.countryName).replace('{use}', propertyUseTitle(form.propertyUse))}</p>

          {results.annualTax != null && (
            <div className="tax-panel">
              <p className="tax-panel-label">{tt('panel_label')}</p>
              <p className="tax-panel-amount">{money(results.annualTaxLow, results.annualTaxHigh)}</p>
              <p className="tax-panel-period">{c('panel_period_year').replace('{year}', results.year)}</p>
              <div className="tax-panel-grid">
                <div><p className="tax-panel-item-label">{tt('panel_rate')}</p><p className="tax-panel-item-value">{results.taxRate}%</p></div>
                <div><p className="tax-panel-item-label">{tt('panel_residency')}</p><p className="tax-panel-item-value">{results.isEUEEA ? tt('panel_eu') : tt('panel_non_eu')}</p></div>
                {results.imputed && results.imputed.supported && (
                  <div><p className="tax-panel-item-label">{tt('panel_deemed')}</p><p className="tax-panel-item-value">{fmt(results.imputed.income)} ({results.imputed.ratePercent}%)</p></div>
                )}
                {results.rental && results.rental.income > 0 && (
                  <div><p className="tax-panel-item-label">{tt('panel_rental_assessed')}</p><p className="tax-panel-item-value">{fmt(results.rental.income)}</p></div>
                )}
              </div>
            </div>
          )}

          {results.imputed && results.imputed.supported && (
            <section className="tk-panel tk-panel-quiet">
              <h3 className="tk-panel-title">{c('panel_rate_basis')}</h3>
              {results.imputed.rateAssumed && (
                <p className="tk-para">
                  {c('rate_assumed')
                    .replace('{high}', results.imputed.ratePercent)
                    .replace('{low}', results.imputed.otherRatePercent)}
                </p>
              )}
              <SourceNote ids={[results.imputed.rateRuleId, 'irnr.imputed.base', 'irnr.rates']} />
            </section>
          )}

          {results.imputed && !results.imputed.supported && (
            <section className="tk-panel tk-panel-key">
              <h3 className="tk-panel-title">{c('not_covered_title').replace('{year}', results.year)}</h3>
              {results.propertyUse === 'mixed' && <p className="tk-para">{c('not_covered_mixed')}</p>}
              <p className="tk-para">{c('not_covered_body')}</p>
              <SourceNote ids="irnr.imputed.rate_special_2023_2025" label="The years the lower rate is stated for" />
            </section>
          )}

          {results.rental && (
            <section className="tk-panel tk-panel-quiet">
              <h3 className="tk-panel-title">{c('gross_title')}</h3>
              <p className="tk-para">{results.rental.costsDeductible ? c('gross_eu') : c('gross_non_eu')}</p>
              {results.rental.costsDeductible && (
                <p className="tk-para">
                  <LLink to="/rental-tax">{c('gross_link')} &#8594;</LLink>
                </p>
              )}
              <SourceNote ids={['irnr.rental.deductibility', 'irnr.rates']} />
            </section>
          )}

          {results.isRange && (
            <section className="tk-panel tk-panel-quiet">
              <h3 className="tk-panel-title">{c('mixed_title')}</h3>
              <p className="tk-para">{c('mixed_body')}</p>
            </section>
          )}

          <DeadlinePanel results={results} c={c} />

          {results.yearsUnfiled > 0 && results.annualTax != null && (
            <div className="liability-panel">
              <p className="liability-title">{tt('liability_title')}</p>
              <div className="liability-row"><span>{tt('liability_this_year')}</span><span>{money(results.annualTaxLow, results.annualTaxHigh)}</span></div>
              <div className="liability-row"><span>{tt('liability_unpaid')} ({results.yearsUnfiled} × {money(results.annualTaxLow, results.annualTaxHigh)})</span><span>{money(results.outstandingTax, results.outstandingTaxHigh)}</span></div>
              <div className="liability-row"><span>{tt('liability_total')}</span><span>{money(results.totalLiability, results.totalLiabilityHigh)}</span></div>
              <p className="liability-disclaimer">{c('liability_disclaimer')}</p>
            </div>
          )}

          {results.yearsUnfiled > 0 && (
            <section className="tk-panel tk-panel-quiet">
              <h3 className="tk-panel-title">{c('surcharge_title')}</h3>
              <p className="tk-para">
                {c('surcharge_body')
                  .replace('{base}', RECARGO.value.base)
                  .replace('{per_month}', RECARGO.value.per_month)
                  .replace('{max}', RECARGO.value.max_within_12m)
                  .replace('{from_month}', RECARGO.value.interest_from_month)
                  .replace('{flat}', RECARGO.value.after_12m)}
              </p>
              <p className="tk-para">
                <LLink to="/late-surcharge">{c('surcharge_link')} &#8594;</LLink>
              </p>
              <SourceNote ids={['late.recargo.voluntary', 'late.recargo.excludes_penalty']} />
            </section>
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

          <button className="btn-skip" onClick={restart}>{tt('restart')}</button>

          <div style={{ textAlign: 'center', padding: '16px 0 4px', borderTop: '1px solid var(--border)', marginTop: 8 }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{tt('also_from')}</p>
            <LLink to="/cost-audit" style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--accent)', textDecoration: 'none' }}>
              {tt('cross_cost')} &#8594;
            </LLink>
          </div>
        </div></div>
      )}

      <SiteFooter note={tt('footer')} />

    </div>
  );
}

// When this return is filed. One block per return the owner actually has, because a
// mixed-use year carries two of them with different windows.
function DeadlinePanel({ results, c }) {
  const ids = [];
  const blocks = [];

  const build = (label, id) => {
    if (!id) return null;
    const r = rule(id);
    const from = r.value.file_from ? deadlineDate(results.year, r.value.file_from) : null;
    const to   = r.value.file_to ? deadlineDate(results.year, r.value.file_to) : null;
    const debit = r.value.direct_debit_to ? deadlineDate(results.year, r.value.direct_debit_to) : null;
    const gap = directDebitGapDays(results.year, r.value.file_to, r.value.direct_debit_to);
    ids.push(id);
    return { label, from, to, debit, gap };
  };

  const imputed = results.deadlines.imputed ? build(c('deadline_imputed_label'), results.deadlines.imputed) : null;
  const rental  = results.deadlines.rental ? build(c('deadline_rental_label'), results.deadlines.rental) : null;
  if (imputed) blocks.push(imputed);
  if (rental) blocks.push(rental);

  const rentalUnknown = results.rental && !results.deadlines.rental;
  const lastQuarterly = results.deadlines.rental === 'deadline.rental.from_2026' ? rule('deadline.rental.last_quarterly') : null;

  if (!blocks.length && !rentalUnknown) return null;

  return (
    <section className="tk-panel tk-panel-key">
      <h3 className="tk-panel-title">{c('deadline_title')}</h3>
      <dl className="tk-rows">
        {blocks.map(b => (
          <div className="tk-row" key={b.label}>
            <dt>{b.label}</dt>
            <dd>{c('deadline_window').replace('{from}', longDate(b.from)).replace('{to}', longDate(b.to))}</dd>
          </div>
        ))}
      </dl>
      {blocks.filter(b => b.debit).map(b => (
        <p className="tk-para" key={`d-${b.label}`}>
          {blocks.length > 1 ? `${b.label}. ` : ''}
          {c('deadline_debit').replace('{date}', longDate(b.debit)).replace('{n}', b.gap)}
        </p>
      ))}
      {rentalUnknown && <p className="tk-para">{c('deadline_rental_unknown')}</p>}
      {lastQuarterly && <p className="tk-para">{lastQuarterly.statement}</p>}
      <SourceNote ids={ids.concat(lastQuarterly ? ['deadline.rental.last_quarterly'] : [])} />
    </section>
  );
}

function StatusBadge({ status, tt }) {
  const labels = { current: tt('status_current'), at_risk: tt('status_at_risk'), overdue: tt('status_overdue') };
  return <div className={`status-badge ${status}`}><span className="status-dot" />{labels[status]}</div>;
}
