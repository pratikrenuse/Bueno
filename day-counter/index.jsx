import { useState } from 'react';
import ToolShell, { Intro, Step, Options, Result, Panel, Rows, DateField, useCopy } from '../ToolShell.jsx';
import SourceNote, { ToolDisclaimer } from '../SourceNote.jsx';
import { rule } from '../rules/index.js';
import copyDict from './copy.js';
import { analyse, tripLength, tripIsValid, tripProblem, toDay } from './count.js';

// The rolling short-stay allowance, for owners who are now third-country nationals.
//
// The allowance and the window are read from the rules base and passed into count.js. No
// legal figure is typed in this file or in that one.
//
// The thing this tool exists to correct: the allowance is not an annual budget and it does
// not reset on 1 January. It is measured against the window preceding EACH day of stay, so
// a trip has to be tested on every one of its days. A count taken on the arrival date can
// read comfortably inside the limit while the same trip goes over before the reader flies
// home. count.js scans every day, and the result screen names the date.
//
// Two boundaries the tool must not blur. This is Schengen-wide, not Spain alone, so a week
// in France spends the same allowance. And it is an immigration rule, with nothing to say
// about tax residence, which is a separate and longer test.

const SHORT = rule('schengen.short_stay');
const EU_REG = rule('eu.registration_over_three_months');
const NIE_FORM = rule('nie.form');
const RESIDENCY = rule('residency.tests');
const GOLDEN = rule('visa.golden_closed');
const NON_LUCRATIVE = rule('visa.non_lucrative');

const LIMIT = SHORT.value.max_days;
const WINDOW = SHORT.value.window_days;

const STEPS = ['who', 'trips'];

// The allowance and the window belong in the copy as words, not as typed digits, so the
// intro strings carry placeholders and the figures come from the rules base like every
// other number on the page.
const fill = s => String(s).replace(/\{limit\}/g, LIMIT).replace(/\{window\}/g, WINDOW);

function fmt(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

function fmtShort(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function DayCounter() {
  const c = useCopy(copyDict);
  const [step, setStep] = useState('intro');
  const [who, setWho] = useState('');
  const [trips, setTrips] = useState([]);
  const [draft, setDraft] = useState({ start: '', end: '' });

  const idx = STEPS.indexOf(step);
  const progress = step === 'intro' ? 0 : step === 'result' ? 100 : ((idx + 1) / STEPS.length) * 100;

  const restart = () => {
    setWho(''); setTrips([]); setDraft({ start: '', end: '' }); setStep('intro');
  };

  const chooseWho = v => {
    setWho(v);
    // Free movement means there is no allowance to count, so that answer is the answer.
    setTimeout(() => setStep(v === 'eu' ? 'result' : 'trips'), 150);
  };

  // Both ends typed but the trip refused. Saying which of the two it was matters: a
  // mistyped year used to leave the Add button dead with a message about the wrong thing.
  const draftProblem = draft.start && draft.end ? tripProblem(draft) : null;
  const canAdd = tripIsValid(draft);

  const addTrip = () => {
    if (!canAdd) return;
    const next = [...trips, { start: draft.start, end: draft.end }]
      .sort((a, b) => toDay(a.start) - toDay(b.start));
    setTrips(next);
    setDraft({ start: '', end: '' });
  };
  const removeTrip = i => setTrips(trips.filter((_, n) => n !== i));

  const today = todayISO();
  const a = trips.length ? analyse({ trips, today, limitDays: LIMIT, windowDays: WINDOW }) : null;

  // Three different things can be true and they need three different answers. Over the
  // limit as at today. Inside it today but with a booked trip that goes over. And inside
  // it today after having gone over at some point in the dates entered, which the clean
  // version of this screen would otherwise quietly report as all clear.
  const over = a && a.overToday > 0;
  const futureBreach = a && a.breach && a.breachIsFuture && !over;
  const pastBreach = a && a.breach && !a.breachIsFuture && !over;

  const headline = !a ? ''
    : over ? `You are ${a.overToday} ${a.overToday === 1 ? 'day' : 'days'} over the limit today`
    : futureBreach ? `Your plan goes over on ${fmt(a.breach.date)}`
    : pastBreach ? `You are inside the limit today, but these dates went over`
    : `${a.remainingToday} of your ${LIMIT} days are still free`;

  const sub = !a ? ''
    : over ? `Today's window has ${a.usedToday} days of presence in it and the allowance is ${LIMIT}. This is a matter of record rather than a judgement call, so it is worth acting on now.`
    : futureBreach ? `You are inside the limit today at ${a.usedToday} days used. The trip you have planned takes the count to ${a.breach.used} on that date, which is ${a.breach.over} over.`
    : pastBreach ? `Today you have used ${a.usedToday} of ${LIMIT}, so the current window is fine. The dates you entered reached ${a.peak.used} on ${fmt(a.breach.date)}, and a past overstay does not stop mattering because the window has moved on.`
    : `Counted over the ${WINDOW} days ending today, you have used ${a.usedToday}. Nothing in the trips you have entered goes over.`;

  const tone = over || futureBreach || pastBreach ? 'warn' : 'good';

  return (
    <ToolShell title={c('headline')} progress={step === 'intro' ? null : progress}
      note="Guidance for property owners in Spain. Not immigration advice.">

      {step === 'intro' && (
        <Intro eyebrow={c('eyebrow')} headline={c('headline')} body={fill(c('body'))}
          points={c('points').map(fill)} cta={c('cta')} minutes={c('minutes')}
          onStart={() => setStep('who')} />
      )}

      {step === 'who' && (
        <Step n={1} of={2} question={c('q_who')} hint={c('q_who_hint')}>
          <Options items={[
            { value: 'eu', label: c('who_eu'), desc: c('who_eu_d') },
            { value: 'third', label: c('who_third'), desc: c('who_third_d') },
          ]} value={who} onChange={chooseWho} />
        </Step>
      )}

      {step === 'trips' && (
        <Step n={2} of={2} question={c('q_trips')} hint={c('q_trips_hint')}
          onBack={() => setStep('who')}
          onNext={() => setStep('result')}
          nextDisabled={trips.length === 0}
          nextLabel={c('see')}>

          <Panel title={trips.length ? `${trips.length} ${trips.length === 1 ? 'trip' : 'trips'} added` : 'Your trips'} kind="quiet">
            {trips.length === 0 && <p className="tk-para">{c('trip_none')}</p>}
            {trips.length > 0 && (
              <ul className="tk-rows" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {trips.map((t, i) => (
                  <li className="tk-row" key={`${t.start}-${t.end}-${i}`}>
                    <span>{fmtShort(t.start)} to {fmtShort(t.end)}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                      <span>{tripLength(t)} days</span>
                      <button type="button" className="btn-back"
                        style={{ minHeight: '48px', padding: '0 8px' }}
                        aria-label={`Remove the trip from ${fmtShort(t.start)} to ${fmtShort(t.end)}`}
                        onClick={() => removeTrip(i)}>
                        {c('trip_remove')}
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <DateField label={c('trip_start')} value={draft.start}
            onChange={v => setDraft(p => ({ ...p, start: v }))} />
          <DateField label={c('trip_end')} value={draft.end} hint={c('trip_end_hint')}
            min={draft.start || undefined}
            onChange={v => setDraft(p => ({ ...p, end: v }))} />

          {draftProblem === 'reversed' && <p className="tk-hint tk-hint-tight">{c('trip_bad')}</p>}
          {draftProblem === 'too_long' && <p className="tk-hint tk-hint-tight">{c('trip_too_long')}</p>}

          <button type="button" className="option-card tk-option" onClick={addTrip} disabled={!canAdd}
            style={{ opacity: canAdd ? 1 : 0.4, justifyContent: 'center' }}>
            <span className="tk-option-text" style={{ textAlign: 'center' }}>
              <span className="option-title">{c('trip_add')}</span>
            </span>
          </button>

          <SourceNote ids="schengen.entry_exit_days" label="Why both ends count" />
        </Step>
      )}

      {step === 'result' && who === 'eu' && (
        <Result headline={`The ${LIMIT}-day limit does not apply to you`} tone="good"
          onRestart={restart} restartLabel={c('restart')}
          sub="Free movement is not a visitor allowance, so there is nothing here to count. What does apply is a registration duty once you settle, and a tax test that applies to everyone.">

          <Panel title="What applies instead" kind="key">
            <p className="tk-para">
              Stay in Spain for more than {EU_REG.value.over_months} months and you are required to
              register in person in the {EU_REG.value.registry}. The application is made within{' '}
              {EU_REG.value.apply_within_months} months of arriving, on form {EU_REG.value.form}.
              You are given a certificate with your NIE on it. That is a residence formality, not a
              cap on your time in the country, and there is no day count behind it.
            </p>
            <p className="tk-para">
              That rule is the one written for EU and EEA nationals. Swiss nationals hold the same
              freedom to live here under a separate agreement, and the offices handle both, but
              confirm the procedure with your nearest oficina de extranjeria rather than assuming
              the paperwork is identical.
            </p>
            <SourceNote ids={['eu.registration_over_three_months', 'nie.form']} />
          </Panel>

          <Panel title="The one number that does apply to you">
            <p className="tk-para">
              Tax residence is a separate test with nothing to do with your passport. More than{' '}
              {RESIDENCY.value.days} days in Spain in a calendar year is one route into it, and
              having the centre of your economic interests here is another. Days away on short
              trips are added back to the count rather than taken off it, unless you can produce a
              certificate of tax residence somewhere else. If you are anywhere near the line, the
              treaty between Spain and your home country decides where you are resident, and that
              is a conversation to have with a gestor before the year ends rather than after.
            </p>
            <SourceNote ids={['residency.tests', 'residency.day_counting', 'residency.treaty_override']} />
          </Panel>

          <p className="tk-para">
            Note that form {NIE_FORM.value.eu_registration} is the EU registration certificate and
            form {NIE_FORM.value.nie} is the plain NIE. They are different procedures and asking
            for the wrong one is a wasted appointment.
          </p>
          <SourceNote ids="nie.form" />

          <ToolDisclaimer>
            This is guidance based on the published rules on the dates shown. It is not immigration
            or tax advice.
          </ToolDisclaimer>
        </Result>
      )}

      {step === 'result' && who !== 'eu' && a && (
        <Result headline={headline} sub={sub} tone={tone} onRestart={restart} restartLabel={c('restart')}>

          <Panel title="Where you stand today" kind="key">
            <Rows items={[
              { label: 'Window counted', value: `${fmtShort(a.windowFrom)} to ${fmtShort(today)}` },
              { label: 'Days used in that window', value: `${a.usedToday} of ${LIMIT}`, strong: true },
              { label: 'Days still free today', value: `${a.remainingToday}` },
              a.nextRefresh ? { label: 'Next day comes back', value: fmtShort(a.nextRefresh.date) } : null,
              a.fullReset ? { label: `All ${LIMIT} free again`, value: fmtShort(a.fullReset.date) } : null,
            ]} />
            <p className="tk-para">
              The allowance does not arrive in a lump on 1 January. Each day you spent drops out of
              the count exactly {WINDOW} days later, one at a time, so the figure above moves every
              day whether you travel or not. The two dates at the bottom assume you take no trips
              beyond the ones you have entered.
            </p>
            <SourceNote ids={['schengen.short_stay', 'schengen.entry_exit_days']} />
          </Panel>

          {a.breach && (
            <Panel title={a.breachIsFuture ? 'The date it goes over' : 'The day it went over'} kind="dark">
              <Rows items={[
                { label: 'Date', value: fmt(a.breach.date), strong: true },
                { label: 'Days used on that date', value: `${a.breach.used}` },
                { label: 'Over the allowance by', value: `${a.breach.over} ${a.breach.over === 1 ? 'day' : 'days'}` },
              ]} />
              <p className="tk-para">
                {a.breachIsFuture
                  ? `Cutting that trip short by ${a.breach.over} ${a.breach.over === 1 ? 'day' : 'days'} brings it back inside, as does moving it later. Changing the arrival date on its own may not be enough, because the count is tested again on every day of the trip and the pressure builds towards the end of it.`
                  : 'Going over is a matter of record, and it can affect a later entry or a residence application, so this is one for an immigration lawyer rather than a forum. Take the dates with you and say plainly what happened. There is no version of this that improves by being left.'}
              </p>
              {a.backWithinLimit && (
                <p className="tk-para">
                  On the trips entered here, and with no further travel, the count falls back to{' '}
                  {LIMIT} or under on {fmt(a.backWithinLimit.date)}.
                </p>
              )}
            </Panel>
          )}

          <Panel title="Trip by trip">
            <Rows items={a.perTrip.map(t => ({
              label: `${fmtShort(t.start)} to ${fmtShort(t.end)}${t.future ? ' (planned)' : ''}`,
              value: t.breachDate
                ? `${t.days} days, over from ${fmtShort(t.breachDate)}`
                : `${t.days} days, peak ${t.peakUsed} of ${LIMIT}`,
            }))} />
            <p className="tk-para">
              Peak is the highest the rolling count reaches on any single day of that trip. It is
              the number that matters, because the test is applied to the {WINDOW} days before
              every day you are in the country, not once per trip.
            </p>
            <SourceNote ids="schengen.short_stay" />
          </Panel>

          <Panel title="Two things this count is not" kind="quiet">
            <p className="tk-para">
              It is not a Spain count. The allowance is spent across the Schengen area as a whole,
              so a week in France or a weekend in Amsterdam comes out of the same {LIMIT} days as a
              week at the property. Add those trips above too, or the figure you are reading is
              optimistic.
            </p>
            <p className="tk-para">
              It is not the tax test. Tax residence turns on more than {RESIDENCY.value.days} days
              in Spain in a calendar year, or on the centre of your economic interests being here.
              A visitor inside the {LIMIT} days is nowhere near that first threshold, but the two
              are often confused, and short absences are added back into the tax count rather than
              taken off it.
            </p>
            <SourceNote ids={['residency.tests', 'residency.day_counting']} />
          </Panel>

          <Panel title={`If ${LIMIT} days is not enough`}>
            <p className="tk-para">
              Owners who run out of allowance every year are usually looking for a residence
              permit rather than a better spreadsheet. Time spent under a residence permit or a
              long-stay visa is not counted against this allowance at all, which is the whole
              point of getting one.
            </p>
            <p className="tk-para">
              The non-lucrative visa is the common route for someone not working in Spain. It asks
              for income or assets of {NON_LUCRATIVE.value.main_pct} percent of IPREM for the main
              applicant and {NON_LUCRATIVE.value.per_dependant_pct} percent for each dependant,
              which on the IPREM currently published works out at about{' '}
              {NON_LUCRATIVE.value.main_year.toLocaleString('en-GB')} euros a year for one person.
              It also makes you tax resident, so take the tax advice before the visa advice.
            </p>
            <p className="tk-para">
              There is a separate route for people working remotely for an employer outside Spain,
              with an income test set as a multiple of the Spanish minimum wage. We do not publish
              a euro figure for it, because the official instruction does not make clear which
              version of the minimum wage the multiple applies to, and the two readings are several
              hundred euros a month apart. Ask the consulate for the current figure in writing.
            </p>
            <p className="tk-para">
              The investor residence route closed to new applications on {fmt(GOLDEN.value)}.
              Anything you read that offers it as an option for a property purchase is out of date.
            </p>
            <SourceNote ids={['visa.golden_closed', 'visa.non_lucrative', 'schengen.entry_exit_days']} />
          </Panel>

          <ToolDisclaimer>
            This is a count based on the dates you entered and the published rules on the dates
            shown. It is not immigration advice, and the record that binds you is the one at the
            border.
          </ToolDisclaimer>
        </Result>
      )}
    </ToolShell>
  );
}
