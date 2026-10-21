import { useState } from 'react';
import ToolShell, { Intro, Step, Options, Result, Panel, Rows, DateField, useCopy } from '../ToolShell.jsx';
import SourceNote, { ToolDisclaimer } from '../SourceNote.jsx';
import { rule } from '../rules/index.js';
import { useLocale } from '../i18n.jsx';
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

// Number and date formatting follow the page language.
const INTL = { en: 'en-GB', no: 'nb-NO', sv: 'sv-SE', de: 'de-DE', fr: 'fr-FR', nl: 'nl-NL' };

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function DayCounter() {
  const c = useCopy(copyDict);
  const { locale } = useLocale();
  const intl = INTL[locale] || INTL.en;

  // The allowance and the window belong in the copy as words, not as typed digits, so the
  // strings carry placeholders and the figures come from the rules base like every other
  // number on the page. {limit} and {window} are always available; anything else is passed.
  const fill = (s, vars = {}) => {
    const all = { limit: LIMIT, window: WINDOW, ...vars };
    return String(s).replace(/\{(\w+)\}/g, (m, n) => (n in all ? all[n] : m));
  };
  const f = (k, vars) => fill(c(k), vars);

  function fmt(iso) {
    if (!iso) return '';
    const d = new Date(`${iso}T00:00:00Z`);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(intl, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  }

  function fmtShort(iso) {
    if (!iso) return '';
    const d = new Date(`${iso}T00:00:00Z`);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(intl, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  }

  const overDays = n => (n === 1 ? c('over_one') : f('over_n', { n }));

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
    : over ? (a.overToday === 1 ? c('head_over_one') : f('head_over', { n: a.overToday }))
    : futureBreach ? f('head_future', { date: fmt(a.breach.date) })
    : pastBreach ? c('head_past')
    : f('head_ok', { n: a.remainingToday });

  const sub = !a ? ''
    : over ? f('sub_over', { used: a.usedToday })
    : futureBreach ? f('sub_future', { used: a.usedToday, peak: a.breach.used, over: a.breach.over })
    : pastBreach ? f('sub_past', { used: a.usedToday, peak: a.peak.used, date: fmt(a.breach.date) })
    : f('sub_ok', { used: a.usedToday });

  const tone = over || futureBreach || pastBreach ? 'warn' : 'good';
  const src = c('source');

  return (
    <ToolShell title={c('headline')} progress={step === 'intro' ? null : progress}
      note={c('note')}>

      {step === 'intro' && (
        <Intro eyebrow={c('eyebrow')} headline={c('headline')} body={f('body')}
          points={c('points').map(p => fill(p))} cta={c('cta')} minutes={c('minutes')}
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

          <Panel title={trips.length ? (trips.length === 1 ? c('trips_added_one') : f('trips_added', { n: trips.length })) : c('trips_title')} kind="quiet">
            {trips.length === 0 && <p className="tk-para">{c('trip_none')}</p>}
            {trips.length > 0 && (
              <ul className="tk-rows" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {trips.map((t, i) => (
                  <li className="tk-row" key={`${t.start}-${t.end}-${i}`}>
                    <span>{f('trip_range', { from: fmtShort(t.start), to: fmtShort(t.end) })}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                      <span>{f('trip_days', { n: tripLength(t) })}</span>
                      <button type="button" className="btn-back"
                        style={{ minHeight: '48px', padding: '0 8px' }}
                        aria-label={f('trip_remove_aria', { from: fmtShort(t.start), to: fmtShort(t.end) })}
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

          <SourceNote ids="schengen.entry_exit_days" label={c('src_both_ends')} />
        </Step>
      )}

      {step === 'result' && who === 'eu' && (
        <Result headline={f('eu_head')} tone="good"
          onRestart={restart} restartLabel={c('restart')}
          sub={c('eu_sub')}>

          <Panel title={c('instead_title')} kind="key">
            <p className="tk-para">
              {f('instead_p1', {
                over: EU_REG.value.over_months,
                registry: EU_REG.value.registry,
                within: EU_REG.value.apply_within_months,
                form: EU_REG.value.form,
              })}
            </p>
            <p className="tk-para">{c('instead_p2')}</p>
            <SourceNote ids={['eu.registration_over_three_months', 'nie.form']} label={src} />
          </Panel>

          <Panel title={c('onenum_title')}>
            <p className="tk-para">{f('onenum_p', { days: RESIDENCY.value.days })}</p>
            <SourceNote ids={['residency.tests', 'residency.day_counting', 'residency.treaty_override']} label={src} />
          </Panel>

          <p className="tk-para">
            {f('nie_note', { eu: NIE_FORM.value.eu_registration, nie: NIE_FORM.value.nie })}
          </p>
          <SourceNote ids="nie.form" label={src} />

          <ToolDisclaimer>{c('eu_disclaimer')}</ToolDisclaimer>
        </Result>
      )}

      {step === 'result' && who !== 'eu' && a && (
        <Result headline={headline} sub={sub} tone={tone} onRestart={restart} restartLabel={c('restart')}>

          <Panel title={c('stand_title')} kind="key">
            <Rows items={[
              { label: c('row_window'), value: f('trip_range', { from: fmtShort(a.windowFrom), to: fmtShort(today) }) },
              { label: c('row_used'), value: f('row_used_value', { used: a.usedToday }), strong: true },
              { label: c('row_free'), value: `${a.remainingToday}` },
              a.nextRefresh ? { label: c('row_next'), value: fmtShort(a.nextRefresh.date) } : null,
              a.fullReset ? { label: f('row_all_free'), value: fmtShort(a.fullReset.date) } : null,
            ]} />
            <p className="tk-para">{f('stand_p')}</p>
            <SourceNote ids={['schengen.short_stay', 'schengen.entry_exit_days']} label={src} />
          </Panel>

          {a.breach && (
            <Panel title={a.breachIsFuture ? c('breach_title_future') : c('breach_title_past')} kind="dark">
              <Rows items={[
                { label: c('row_date'), value: fmt(a.breach.date), strong: true },
                { label: c('row_used_on'), value: `${a.breach.used}` },
                { label: c('row_over_by'), value: overDays(a.breach.over) },
              ]} />
              <p className="tk-para">
                {a.breachIsFuture
                  ? (a.breach.over === 1 ? c('breach_future_p_one') : f('breach_future_p', { n: a.breach.over }))
                  : c('breach_past_p')}
              </p>
              {a.backWithinLimit && (
                <p className="tk-para">{f('back_p', { date: fmt(a.backWithinLimit.date) })}</p>
              )}
            </Panel>
          )}

          <Panel title={c('bytrip_title')}>
            <Rows items={a.perTrip.map(t => ({
              label: f(t.future ? 'bytrip_label_planned' : 'bytrip_label', { from: fmtShort(t.start), to: fmtShort(t.end) }),
              value: t.breachDate
                ? f('bytrip_over', { n: t.days, date: fmtShort(t.breachDate) })
                : f('bytrip_peak', { n: t.days, peak: t.peakUsed }),
            }))} />
            <p className="tk-para">{f('bytrip_p')}</p>
            <SourceNote ids="schengen.short_stay" label={src} />
          </Panel>

          <Panel title={c('not_title')} kind="quiet">
            <p className="tk-para">{f('not_p1')}</p>
            <p className="tk-para">{f('not_p2', { days: RESIDENCY.value.days })}</p>
            <SourceNote ids={['residency.tests', 'residency.day_counting']} label={src} />
          </Panel>

          <Panel title={f('enough_title')}>
            <p className="tk-para">{c('enough_p1')}</p>
            <p className="tk-para">
              {f('enough_p2', {
                main: NON_LUCRATIVE.value.main_pct,
                dep: NON_LUCRATIVE.value.per_dependant_pct,
                amount: NON_LUCRATIVE.value.main_year.toLocaleString(intl),
              })}
            </p>
            <p className="tk-para">{c('enough_p3')}</p>
            <p className="tk-para">{f('enough_p4', { date: fmt(GOLDEN.value) })}</p>
            <SourceNote ids={['visa.golden_closed', 'visa.non_lucrative', 'schengen.entry_exit_days']} label={src} />
          </Panel>

          <ToolDisclaimer>{c('third_disclaimer')}</ToolDisclaimer>
        </Result>
      )}
    </ToolShell>
  );
}
