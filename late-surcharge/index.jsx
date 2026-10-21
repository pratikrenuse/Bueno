import { useState } from 'react';
import ToolShell, { Intro, Step, Options, Result, Panel, Rows, NumberField, useCopy } from '../ToolShell.jsx';
import SourceNote, { ToolDisclaimer } from '../SourceNote.jsx';
import { rule } from '../rules/index.js';
import { LLink, useLocale } from '../i18n.jsx';
import copyDict from './copy.js';
import {
  deadlineRuleId, deadlineDate, directDebitGapDays, RENTAL_ANNUAL_FROM,
  monthOfDelay, surchargePercent, surchargeAmount, applyReduction,
  interestStart, interestEstimate,
} from './calc.js';

// What a late modelo 210 actually costs.
//
// There are two regimes here and they must never appear on the same screen as one
// calculation. Filing late of your own accord is a surcharge: it starts at 1 percent,
// climbs a point a month, and no penalty may be added on top of it. Filing after the tax
// office has written to you is not that at all. The surcharge route closes and the conduct
// becomes an infraction, handled through a sanction procedure. Blending the two produces a
// number that is wrong in both directions at once, so this tool routes on that question
// and shows one outcome or the other.
//
// The demanded branch deliberately carries no headline percentage. art. 191 LGT could not
// be read verbatim, the rule that holds it is marked partial, and a figure we could not
// confirm does not go in front of a reader as if we had. SourceNote renders that caveat
// for us. We describe the shape of it and stop.
//
// The other thing this tool exists to say: for the imputed income return, direct debit
// closes eight days before filing does. That gap is how an owner comes to believe they
// have paid when they have not, and no article we have seen mentions it.

const RECARGO = rule('late.recargo.voluntary');
const REDUCTION = rule('late.recargo.reduction');
const INTEREST = rule('late.interest');
const LAST_QUARTERLY = rule('deadline.rental.last_quarterly');

const STEPS = ['return', 'year', 'amount', 'letter'];

// Number and date formatting follow the page language. The euro sign and the arithmetic
// are the same everywhere; only the separators and month names change.
const INTL = { en: 'en-GB', no: 'nb-NO', sv: 'sv-SE', de: 'de-DE', fr: 'fr-FR', nl: 'nl-NL' };

// Copy carries two light markers: **bold** and [label](/path) for a link to another tool.
// Anything else is plain text, so a translation cannot inject markup.
function Rich({ text }) {
  const parts = String(text).split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((p, i) => {
    const b = /^\*\*([^*]+)\*\*$/.exec(p);
    if (b) return <strong key={i}>{b[1]}</strong>;
    const l = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(p);
    if (l) return <LLink key={i} to={l[2]}>{l[1]}</LLink>;
    return p;
  });
}

// The rate we hold covers its own year and, on that rule's own note, the year before it.
const RATE_KNOWN_FROM = `${INTEREST.value.year - 1}-01-01`;

export default function LateSurcharge() {
  const c = useCopy(copyDict);
  const { locale } = useLocale();
  const intl = INTL[locale] || INTL.en;
  // Copy lookup with {placeholder} substitution.
  const f = (k, vars = {}) => String(c(k)).replace(/\{(\w+)\}/g, (m, n) => (n in vars ? vars[n] : m));
  const fmt = n => new Intl.NumberFormat(intl, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n || 0);
  const fmtPrecise = n => new Intl.NumberFormat(intl, { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(n || 0);
  const longDate = iso => {
    if (!iso) return '';
    const d = new Date(`${iso}T00:00:00`);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(intl, { day: 'numeric', month: 'long', year: 'numeric' });
  };
  const [step, setStep] = useState('intro');
  const [a, setA] = useState({ return: '', year: '', amount: '', letter: '' });

  const idx = STEPS.indexOf(step);
  const progress = step === 'intro' ? 0 : step === 'result' ? 100 : ((idx + 1) / STEPS.length) * 100;

  const advance = (k, v) => {
    setA(p => ({ ...p, [k]: v }));
    const i = STEPS.indexOf(k);
    setTimeout(() => setStep(STEPS[i + 1] || 'result'), 150);
  };
  const back = () => setStep(idx <= 0 ? 'intro' : STEPS[idx - 1]);
  const restart = () => { setA({ return: '', year: '', amount: '', letter: '' }); setStep('intro'); };

  const today = new Date().toISOString().slice(0, 10);
  const thisYear = new Date().getFullYear();
  const years = [0, 1, 2, 3, 4, 5].map(n => thisYear - n);

  // --- the deadline the clock ran from --------------------------------------
  const kind = a.return;
  const dlId = deadlineRuleId(kind, a.year);
  const dlRule = dlId ? rule(dlId) : null;
  const deadlineISO = dlRule ? deadlineDate(a.year, dlRule.value.file_to) : null;
  const opensISO = dlRule && dlRule.value.file_from ? deadlineDate(a.year, dlRule.value.file_from) : null;
  const debitISO = dlRule && dlRule.value.direct_debit_to ? deadlineDate(a.year, dlRule.value.direct_debit_to) : null;
  const gapDays = dlRule ? directDebitGapDays(a.year, dlRule.value.file_to, dlRule.value.direct_debit_to) : null;

  // --- the voluntary arithmetic ---------------------------------------------
  const month = deadlineISO ? monthOfDelay(deadlineISO, today) : 0;
  const band = surchargePercent(month, RECARGO.value);
  const tax = Number(a.amount) > 0 ? Number(a.amount) : 0;
  const surcharge = surchargeAmount(tax, band.percent);
  const reducedSurcharge = applyReduction(surcharge, REDUCTION.value);
  const interest = band.interestApplies && deadlineISO
    ? interestEstimate({
        taxDue: tax,
        fromISO: interestStart(deadlineISO, RECARGO.value),
        toISO_: today,
        ratePercent: INTEREST.value.demora,
        rateKnownFromISO: RATE_KNOWN_FROM,
      })
    : null;
  const interestAmount = interest ? interest.amount : 0;
  const total = tax + surcharge + interestAmount;
  const totalReduced = tax + reducedSurcharge + interestAmount;

  const branch =
    a.letter === 'yes' ? 'penalty'
    : !dlId ? 'unknown'
    : month === 0 ? 'notlate'
    : 'surcharge';

  const returnName = kind === 'imputed' ? c('return_name_imputed') : c('return_name_rental');

  const headline = {
    penalty: c('result_penalty'),
    unknown: c('result_unknown'),
    notlate: `${c('result_notlate')}. ${f('head_notlate_due', { date: longDate(deadlineISO) })}`,
    surcharge: tax > 0
      ? f('head_amount', { extra: fmt(surcharge + interestAmount), total: fmt(total) })
      : f(band.interestApplies ? 'head_pct_interest' : 'head_pct', { pct: band.percent }),
  }[branch];

  const sub = c(`sub_${branch}`);

  const tone = branch === 'penalty' ? 'warn' : branch === 'notlate' ? 'good' : branch === 'unknown' ? 'neutral' : 'warn';

  const opt = (k, n) => ({ value: k, label: c(`${n}_${k}`), desc: c(`${n}_${k}_d`) === `${n}_${k}_d` ? null : c(`${n}_${k}_d`) });

  // Shared placeholder sets for the ladder paragraphs.
  const ladder = {
    base: RECARGO.value.base, per_month: RECARGO.value.per_month, max: RECARGO.value.max_within_12m,
    from_month: RECARGO.value.interest_from_month, flat: RECARGO.value.after_12m, pct: REDUCTION.value,
  };
  const src = c('source');

  return (
    <ToolShell title={c('headline')} progress={step === 'intro' ? null : progress}
      note={c('note')}>

      {step === 'intro' && (
        <Intro eyebrow={c('eyebrow')} headline={c('headline')} body={c('body')}
          points={c('points')} cta={c('cta')} minutes={c('minutes')}
          onStart={() => setStep('return')} />
      )}

      {step === 'return' && (
        <Step n={1} of={STEPS.length} question={c('q_return')} hint={c('q_return_hint')}>
          <Options items={['imputed', 'rental'].map(k => opt(k, 'return'))}
            value={a.return} onChange={v => advance('return', v)} />
        </Step>
      )}

      {step === 'year' && (
        <Step n={2} of={STEPS.length} question={c('q_year')} hint={c('q_year_hint')} onBack={back}>
          <Options columns={2}
            items={years.map(y => ({ value: y, label: `${y}`, desc: f('year_filed', { year: y + 1 }) }))}
            value={a.year} onChange={v => advance('year', v)} />
        </Step>
      )}

      {step === 'amount' && (
        <Step n={3} of={STEPS.length} question={c('q_amount')} hint={c('q_amount_hint')} onBack={back}
          onNext={() => setStep('letter')} nextLabel={c('next')}>
          <NumberField label={c('amount_label')} prefix="EUR" min={0}
            placeholder="0"
            hint={c('amount_skip')}
            value={a.amount} onChange={v => setA(p => ({ ...p, amount: v }))} />
        </Step>
      )}

      {step === 'letter' && (
        <Step n={4} of={STEPS.length} question={c('q_letter')} hint={c('q_letter_hint')} onBack={back}>
          <Options items={['no', 'yes'].map(k => opt(k, 'letter'))}
            value={a.letter} onChange={v => advance('letter', v)} />
        </Step>
      )}

      {step === 'result' && (
        <Result headline={headline} sub={sub} tone={tone} onRestart={restart} restartLabel={c('restart')}>

          {/* ------------------------------------------------------------------
              Branch one. Voluntary. A surcharge, and nothing else.
          ------------------------------------------------------------------ */}
          {branch === 'surcharge' && (
            <>
              <Panel title={c('owe_title')} kind="key">
                <Rows items={[
                  { label: c('row_return'), value: returnName },
                  { label: c('row_year'), value: `${a.year}` },
                  { label: c('row_deadline'), value: longDate(deadlineISO) },
                  { label: c('row_month'), value: f('row_month_value', { n: month }) },
                  { label: c('row_surcharge'), value: f(band.flat ? 'row_pct_flat' : 'row_pct', { pct: band.percent }), strong: true },
                  tax > 0 && { label: c('row_tax'), value: fmt(tax) },
                  tax > 0 && { label: c('row_surcharge'), value: fmtPrecise(surcharge) },
                  tax > 0 && interest && interest.pricedDays > 0 && { label: c('row_interest'), value: fmtPrecise(interestAmount) },
                  tax > 0 && { label: c('row_total'), value: fmtPrecise(total), strong: true },
                ]} />
                {tax === 0 && <p className="tk-para">{c('owe_no_tax')}</p>}
                <SourceNote ids={['late.recargo.voluntary', dlId]} label={src} />
              </Panel>

              <Panel title={c('name_title')} kind="plain">
                <p className="tk-para"><Rich text={c('name_p1')} /></p>
                <p className="tk-para">{f('name_p2', ladder)}</p>
                <SourceNote ids="late.recargo.voluntary" label={src} />
              </Panel>

              <Panel title={f('reduce_title', { pct: REDUCTION.value })} kind="key">
                <p className="tk-para">{f('reduce_p', { pct: REDUCTION.value })}</p>
                {tax > 0 && (
                  <Rows items={[
                    { label: c('row_assessed'), value: fmtPrecise(surcharge) },
                    { label: f('row_reduced', { pct: REDUCTION.value }), value: fmtPrecise(reducedSurcharge), strong: true },
                    { label: c('row_total_window'), value: fmtPrecise(totalReduced), strong: true },
                  ]} />
                )}
                <SourceNote ids={['late.recargo.reduction', 'late.recargo.excludes_penalty']} label={src} />
              </Panel>

              {band.interestApplies && (
                <Panel title={c('interest_title')}>
                  <p className="tk-para">
                    {f('interest_p1', {
                      date: longDate(interestStart(deadlineISO, RECARGO.value)),
                      rate: INTEREST.value.demora,
                      year: INTEREST.value.year,
                    })}
                  </p>
                  {interest && interest.unpricedDays > 0 && (
                    <p className="tk-para">
                      {f('interest_p2', { priced: interest.pricedDays, unpriced: interest.unpricedDays })}
                    </p>
                  )}
                  <SourceNote ids="late.interest" label={src} />
                </Panel>
              )}
            </>
          )}

          {/* ------------------------------------------------------------------
              Branch two. A letter has arrived. A different regime entirely, and
              deliberately no arithmetic.
          ------------------------------------------------------------------ */}
          {branch === 'penalty' && (
            <>
              <Panel title={c('changed_title')} kind="dark">
                <p className="tk-para">{c('changed_p1')}</p>
                <p className="tk-para">{f('changed_p2', { pct: REDUCTION.value })}</p>
              </Panel>

              <Panel title={c('nonumber_title')} kind="quiet">
                <p className="tk-para">{c('nonumber_p')}</p>
                <SourceNote ids="late.sancion.after_requerimiento" label={src} />
              </Panel>

              <Panel title={c('week_title')} kind="key">
                <ol className="tk-ol">
                  {c('week_steps').map((t, i) => <li key={i}>{t}</li>)}
                </ol>
              </Panel>
            </>
          )}

          {/* ------------------------------------------------------------------
              Branch three. Not late.
          ------------------------------------------------------------------ */}
          {branch === 'notlate' && (
            <>
              <Panel title={c('window_title')} kind="key">
                <Rows items={[
                  { label: c('row_return'), value: returnName },
                  { label: c('row_year'), value: `${a.year}` },
                  opensISO && { label: c('row_opens'), value: longDate(opensISO) },
                  { label: c('row_closes'), value: longDate(deadlineISO), strong: true },
                  debitISO && { label: c('row_debit'), value: longDate(debitISO), strong: true },
                ]} />
                <SourceNote ids={dlId} label={src} />
              </Panel>
              <Panel title={c('nothing_title')}>
                <p className="tk-para">{f('nothing_p', ladder)}</p>
                <SourceNote ids="late.recargo.voluntary" label={src} />
              </Panel>
            </>
          )}

          {/* ------------------------------------------------------------------
              Branch four. We do not hold the deadline.
          ------------------------------------------------------------------ */}
          {branch === 'unknown' && (
            <>
              <Panel title={c('cantell_title')} kind="quiet">
                <p className="tk-para">{f('cantell_p1', ladder)}</p>
                <p className="tk-para">{c('cantell_p2')}</p>
                <SourceNote ids={['late.recargo.voluntary', 'late.recargo.reduction']} label={src} />
              </Panel>
              <Panel title={c('recent_title')}>
                <p className="tk-para">{f('recent_p', { year: RENTAL_ANNUAL_FROM })}</p>
              </Panel>
            </>
          )}

          {/* ------------------------------------------------------------------
              The direct debit gap. Shown on every branch that has a dated
              deadline, because it is the thing owners do not know.
          ------------------------------------------------------------------ */}
          {dlRule && gapDays != null && gapDays > 0 && (
            <Panel title={c('gap_title')} kind="dark">
              <p className="tk-para">
                {f('gap_p1', { deadline: longDate(deadlineISO), debit: longDate(debitISO), days: gapDays })}
              </p>
              <p className="tk-para">{f('gap_p2', { days: gapDays })}</p>
              <SourceNote ids={dlId} label={src} />
            </Panel>
          )}

          {/* The one deadline in the rules base that is live right now. */}
          {kind === 'rental' && (
            <Panel title={c('quarterly_title')}>
              <p className="tk-para">
                {f('quarterly_p', {
                  quarter: LAST_QUARTERLY.value.quarter,
                  from: longDate(LAST_QUARTERLY.value.file_from),
                  to: longDate(LAST_QUARTERLY.value.file_to),
                })}
              </p>
              <SourceNote ids={['deadline.rental.last_quarterly', 'deadline.rental.from_2026']} label={src} />
            </Panel>
          )}

          <Panel title={c('regimes_title')} kind="quiet">
            <p className="tk-para">
              {branch === 'penalty' ? c('regimes_penalty') : c('regimes_voluntary')}
            </p>
            <p className="tk-para"><Rich text={c('regimes_links')} /></p>
          </Panel>

          <ToolDisclaimer>{c('disclaimer')}</ToolDisclaimer>
        </Result>
      )}
    </ToolShell>
  );
}
