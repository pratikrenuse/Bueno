import { useState } from 'react';
import ToolShell, { Intro, Step, Options, Result, Panel, Rows, NumberField, useCopy } from '../ToolShell.jsx';
import SourceNote, { ToolDisclaimer } from '../SourceNote.jsx';
import { rule } from '../rules/index.js';
import { LLink } from '../i18n.jsx';
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

const fmt = n => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n || 0);
const fmtPrecise = n => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(n || 0);
const longDate = iso => {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

// The rate we hold covers its own year and, on that rule's own note, the year before it.
const RATE_KNOWN_FROM = `${INTEREST.value.year - 1}-01-01`;

export default function LateSurcharge() {
  const c = useCopy(copyDict);
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

  const returnName = kind === 'imputed' ? 'Imputed income, modelo 210' : 'Rental income, modelo 210';

  const headline = {
    penalty: c('result_penalty'),
    unknown: c('result_unknown'),
    notlate: `${c('result_notlate')}. This one is due ${longDate(deadlineISO)}`,
    surcharge: tax > 0
      ? `${fmt(surcharge + interestAmount)} on top of the tax, ${fmt(total)} in total`
      : `A ${band.percent} percent surcharge${band.interestApplies ? ', plus interest' : ''}`,
  }[branch];

  const sub = {
    penalty: 'Once the tax office has named this return, the surcharge for filing late of your own accord is no longer available. What follows is a sanction procedure, and it is a heavier regime. We are not going to put a percentage on it, and the reason is below.',
    unknown: 'Rental income for that year sat in the old quarterly regime, and we do not hold a confirmed filing window for it. We would rather tell you that than date your deadline by guesswork and build a surcharge on top of it.',
    notlate: 'Nothing is owed as a surcharge, because the window has not closed. There is one date below that is earlier than the one you were expecting, and it is worth reading.',
    surcharge: 'This is a recargo por declaracion extemporanea sin requerimiento previo: the surcharge for coming forward on your own. It is not a fine, and no penalty may be added on top of it.',
  }[branch];

  const tone = branch === 'penalty' ? 'warn' : branch === 'notlate' ? 'good' : branch === 'unknown' ? 'neutral' : 'warn';

  const opt = (k, n) => ({ value: k, label: c(`${n}_${k}`), desc: c(`${n}_${k}_d`) === `${n}_${k}_d` ? null : c(`${n}_${k}_d`) });

  return (
    <ToolShell title={c('headline')} progress={step === 'intro' ? null : progress}
      note="Guidance for property owners in Spain. Not tax advice.">

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
            items={years.map(y => ({ value: y, label: `${y}`, desc: `Filed during ${y + 1}` }))}
            value={a.year} onChange={v => advance('year', v)} />
        </Step>
      )}

      {step === 'amount' && (
        <Step n={3} of={STEPS.length} question={c('q_amount')} hint={c('q_amount_hint')} onBack={back}
          onNext={() => setStep('letter')} nextLabel="Continue">
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
              <Panel title="What you owe" kind="key">
                <Rows items={[
                  { label: 'Return', value: returnName },
                  { label: 'Tax year', value: `${a.year}` },
                  { label: 'The deadline the clock ran from', value: longDate(deadlineISO) },
                  { label: 'Month of delay you are in', value: `Month ${month}` },
                  { label: 'Surcharge', value: `${band.percent} percent${band.flat ? ', flat' : ''}`, strong: true },
                  tax > 0 && { label: 'Tax owed on the return', value: fmt(tax) },
                  tax > 0 && { label: 'Surcharge', value: fmtPrecise(surcharge) },
                  tax > 0 && interest && interest.pricedDays > 0 && { label: 'Late-payment interest', value: fmtPrecise(interestAmount) },
                  tax > 0 && { label: 'Total payable', value: fmtPrecise(total), strong: true },
                ]} />
                {tax === 0 && (
                  <p className="tk-para">
                    You did not give us the tax figure, so the percentage is as far as we can take
                    it. Put the amount from the return into this tool and it will do the rest.
                  </p>
                )}
                <SourceNote ids={['late.recargo.voluntary', dlId]} />
              </Panel>

              <Panel title="The name of the procedure, so you can say it out loud" kind="plain">
                <p className="tk-para">
                  You are filing a <strong>declaracion extemporanea sin requerimiento previo</strong>,
                  a late self-assessment made without a prior demand, and what you pay on top is a
                  <strong> recargo</strong>, a surcharge, under art. 27 of the Ley General
                  Tributaria. It is not a sancion and it is not a multa. If anyone tells you that
                  filing late of your own accord means a fine, that is the wrong word for this.
                </p>
                <p className="tk-para">
                  The surcharge starts at {RECARGO.value.base} percent and adds another
                  {' '}{RECARGO.value.per_month} percent for each complete month, to a maximum of
                  {' '}{RECARGO.value.max_within_12m} percent at twelve months. From month
                  {' '}{RECARGO.value.interest_from_month} it stops climbing and becomes a flat
                  {' '}{RECARGO.value.after_12m} percent, with late-payment interest running from
                  the day after the twelfth month.
                </p>
                <SourceNote ids="late.recargo.voluntary" />
              </Panel>

              <Panel title={`Pay on time and this drops by ${REDUCTION.value} percent`} kind="key">
                <p className="tk-para">
                  When the tax office notifies you of the surcharge it opens a payment window.
                  Pay the surcharge in full inside that window, with the tax debt itself settled,
                  and the surcharge is reduced by {REDUCTION.value} percent. It is the cheapest
                  {' '}{REDUCTION.value} percent available to you and it is lost by doing nothing.
                </p>
                {tax > 0 && (
                  <Rows items={[
                    { label: 'Surcharge as assessed', value: fmtPrecise(surcharge) },
                    { label: `Reduced by ${REDUCTION.value} percent`, value: fmtPrecise(reducedSurcharge), strong: true },
                    { label: 'Total if you pay inside the window', value: fmtPrecise(totalReduced), strong: true },
                  ]} />
                )}
                <SourceNote ids={['late.recargo.reduction', 'late.recargo.excludes_penalty']} />
              </Panel>

              {band.interestApplies && (
                <Panel title="Interest, and how far we can price it">
                  <p className="tk-para">
                    Past twelve months the surcharge goes flat and late-payment interest starts
                    running from the day after the twelfth month, which for you was
                    {' '}{longDate(interestStart(deadlineISO, RECARGO.value))}. The rate we hold is
                    {' '}{INTEREST.value.demora} percent for {INTEREST.value.year}, and the same
                    rate applied the year before.
                  </p>
                  {interest && interest.unpricedDays > 0 && (
                    <p className="tk-para">
                      Your delay reaches back further than the rate we hold. We have priced
                      {' '}{interest.pricedDays} days and left {interest.unpricedDays} days
                      unpriced rather than apply a rate to a period it did not cover, so treat the
                      interest line as understated by that stretch.
                    </p>
                  )}
                  <SourceNote ids="late.interest" />
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
              <Panel title="What has changed" kind="dark">
                <p className="tk-para">
                  The surcharge in art. 27 is the price of coming forward first. It is available
                  only where you file before the tax office asks. Once a demand naming this return
                  has gone out, that door is shut. What you are in now is a sanction procedure:
                  the conduct is treated as a tax infraction, and the charge is a proportional
                  fine on the amount left unpaid, together with late-payment interest.
                </p>
                <p className="tk-para">
                  It is a materially heavier regime than the surcharge, and the
                  {' '}{REDUCTION.value} percent reduction that goes with the surcharge is not part
                  of it.
                </p>
              </Panel>

              <Panel title="Why there is no number here" kind="quiet">
                <p className="tk-para">
                  We could not read the governing article of the Ley General Tributaria in full
                  from the official consolidated text, which truncates it. We hold an unconfirmed
                  minimum figure and we are not going to print it as though it were settled, as a
                  percentage in a headline is exactly how an unconfirmed figure becomes something
                  an owner repeats to their gestor. Take the letter to a professional and have the
                  proposed amount checked against the article itself.
                </p>
                <SourceNote ids="late.sancion.after_requerimiento" />
              </Panel>

              <Panel title="What to do this week" kind="key">
                <ol className="tk-ol">
                  <li>Read the deadline printed in the letter. That is now the date that governs
                      everything, and it is usually shorter than people assume.</li>
                  <li>Get the return itself filed and the tax paid if it is still outstanding. The
                      unpaid amount is what the fine is proportional to, so it is not a neutral
                      thing to leave sitting.</li>
                  <li>Take the letter to a gestor before you reply to it. A proposal is a proposal,
                      and the response window is where any argument about it belongs.</li>
                  <li>If the letter turns out not to be about this return or this year, come back
                      and answer that question differently. The two routes have nothing in common
                      and we will not show you both at once.</li>
                </ol>
              </Panel>
            </>
          )}

          {/* ------------------------------------------------------------------
              Branch three. Not late.
          ------------------------------------------------------------------ */}
          {branch === 'notlate' && (
            <>
              <Panel title="Your window" kind="key">
                <Rows items={[
                  { label: 'Return', value: returnName },
                  { label: 'Tax year', value: `${a.year}` },
                  opensISO && { label: 'Filing opens', value: longDate(opensISO) },
                  { label: 'Filing closes', value: longDate(deadlineISO), strong: true },
                  debitISO && { label: 'Direct debit closes', value: longDate(debitISO), strong: true },
                ]} />
                <SourceNote ids={dlId} />
              </Panel>
              <Panel title="Nothing is owed yet">
                <p className="tk-para">
                  The surcharge only starts once the filing window has closed. From the day after
                  it does, it begins at {RECARGO.value.base} percent and climbs
                  {' '}{RECARGO.value.per_month} percent a month. Filing early costs nothing and
                  removes the whole question.
                </p>
                <SourceNote ids="late.recargo.voluntary" />
              </Panel>
            </>
          )}

          {/* ------------------------------------------------------------------
              Branch four. We do not hold the deadline.
          ------------------------------------------------------------------ */}
          {branch === 'unknown' && (
            <>
              <Panel title="What we can tell you" kind="quiet">
                <p className="tk-para">
                  The surcharge ladder itself does not depend on the year. It starts at
                  {' '}{RECARGO.value.base} percent, adds {RECARGO.value.per_month} percent for each
                  complete month, caps at {RECARGO.value.max_within_12m} percent at twelve months,
                  and from month {RECARGO.value.interest_from_month} becomes a flat
                  {' '}{RECARGO.value.after_12m} percent with interest. The
                  {' '}{REDUCTION.value} percent reduction for paying inside the window applies the
                  same way.
                </p>
                <p className="tk-para">
                  What we cannot do is place your return on that ladder, because that needs the
                  filing deadline for a year we do not hold a verified window for. Ask your gestor
                  for the exact date the window closed, count the complete months from it, and the
                  ladder above gives you the rest.
                </p>
                <SourceNote ids={['late.recargo.voluntary', 'late.recargo.reduction']} />
              </Panel>
              <Panel title="If you also have a more recent year">
                <p className="tk-para">
                  Start again and pick {RENTAL_ANNUAL_FROM} or later. Those windows are in the
                  rules base and the tool will date them for you.
                </p>
              </Panel>
            </>
          )}

          {/* ------------------------------------------------------------------
              The direct debit gap. Shown on every branch that has a dated
              deadline, because it is the thing owners do not know.
          ------------------------------------------------------------------ */}
          {dlRule && gapDays != null && gapDays > 0 && (
            <Panel title="The gap almost nobody is told about" kind="dark">
              <p className="tk-para">
                Filing and paying by direct debit close on different days. For this return the
                filing window runs to {longDate(deadlineISO)}, but if you want the tax collected
                by direct debit the return has to be in by {longDate(debitISO)}. That is
                {' '}{gapDays} days earlier.
              </p>
              <p className="tk-para">
                Submit inside those last {gapDays} days and the return is on time, but the direct
                debit option has gone. Owners who assumed the money would be taken automatically
                discover months later that it never was, and the return that was filed on time
                becomes a debt that was paid late. If you are anywhere near the end of the window,
                pay by card or transfer and take the confirmation.
              </p>
              <SourceNote ids={dlId} />
            </Panel>
          )}

          {/* The one deadline in the rules base that is live right now. */}
          {kind === 'rental' && (
            <Panel title="One last quarterly return, and then it changes">
              <p className="tk-para">
                Rental filing moved off the quarterly cycle. The final quarterly return covers
                {' '}{LAST_QUARTERLY.value.quarter} and is filed between
                {' '}{longDate(LAST_QUARTERLY.value.file_from)} and
                {' '}{longDate(LAST_QUARTERLY.value.file_to)}. Rent accrued after that goes into
                the annual April window instead. If you have been filing quarterly out of habit,
                this is the last one, and the next date you need is in April.
              </p>
              <SourceNote ids={['deadline.rental.last_quarterly', 'deadline.rental.from_2026']} />
            </Panel>
          )}

          <Panel title="Two regimes, and we have shown you one" kind="quiet">
            <p className="tk-para">
              {branch === 'penalty'
                ? 'Everything above is the demanded route. The voluntary surcharge, the ladder and the reduction that goes with it are a different regime and none of it applies once a letter has arrived, so we have not shown you those figures here.'
                : 'Everything above is the voluntary route, which is the one you are on because no letter has arrived. If one does arrive before you file, none of these figures apply and the answer changes shape entirely. That is a reason to file first rather than a reason to worry.'}
            </p>
            <p className="tk-para">
              The tax itself is a separate question from what being late costs. If you are still
              working out what the return should have said, our{' '}
              <LLink to="/rental-tax">rental income tax calculator</LLink> and our{' '}
              <LLink to="/tax-calculator">non-resident tax calculator</LLink> handle that side.
            </p>
          </Panel>

          <ToolDisclaimer />
        </Result>
      )}
    </ToolShell>
  );
}
