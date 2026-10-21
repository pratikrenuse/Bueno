import { useState } from 'react';
import ToolShell, { Intro, Step, Options, Result, Panel, Rows, DateField, useCopy } from '../ToolShell.jsx';
import SourceNote, { ToolDisclaimer } from '../SourceNote.jsx';
import { rule } from '../rules/index.js';
import { useLocale } from '../i18n.jsx';
import copyDict from './copy.js';
import { daysSince, isFutureDate, todayISO } from './calc.js';

// Who pays for storm damage in Spain.
//
// The whole tool turns on one number: extraordinary wind is a gust EXCEEDING 120 km/h,
// measured as a three-second gust (art. 2 RD 300/2004). Below that it is the private
// insurer's problem, above it the Consorcio's. That number is not typed here; it is read
// from the rules base, so if it ever changes, this tool changes with it.
//
// The second thing the tool must get right is the precondition: Consorcio cover only
// exists where there is an ordinary policy, and the payout is capped at that policy's sums
// insured. An uninsured property has no cover at all, which is the answer nobody wants and
// the one it would be dishonest to soften.

const WIND = rule('consorcio.wind_threshold');
const PERILS = rule('consorcio.perils');
const PRECONDITION = rule('consorcio.precondition');
const EXCLUSIONS = rule('consorcio.exclusions');
const NOTIFY = rule('consorcio.notification');

const CONSORCIO_CAUSES = ['flood', 'quake', 'volcano'];

const DATE_LOCALES = { en: 'en-GB', no: 'nb-NO', sv: 'sv-SE', de: 'de-DE', fr: 'fr-FR', nl: 'nl-NL' };

// Fills {name} placeholders in a copy string.
const fill = (s, vars = {}) => String(s).replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));

export default function StormClaim() {
  const c = useCopy(copyDict);
  const { locale } = useLocale();
  const src = c('source_label');
  const [step, setStep] = useState('intro');
  const [a, setA] = useState({ cause: '', wind: '', policy: '', when: '' });

  const needsWind = a.cause === 'wind';
  const order = ['cause', ...(needsWind ? ['wind'] : []), 'policy', 'when'];
  const idx = order.indexOf(step);
  const progress = step === 'intro' ? 0 : step === 'result' ? 100 : ((idx + 1) / order.length) * 100;

  const advance = (k, v) => {
    const nextA = { ...a, [k]: v };
    setA(nextA);
    const seq = ['cause', ...(nextA.cause === 'wind' ? ['wind'] : []), 'policy', 'when'];
    const i = seq.indexOf(k);
    setTimeout(() => setStep(seq[i + 1] || 'result'), 150);
  };
  const back = () => setStep(idx <= 0 ? 'intro' : order[idx - 1]);
  const restart = () => { setA({ cause: '', wind: '', policy: '', when: '' }); setStep('intro'); };

  // --- the routing decision -------------------------------------------------
  const route = () => {
    if (a.policy === 'no') return 'uninsured';
    if (CONSORCIO_CAUSES.includes(a.cause)) return 'consorcio';
    if (a.cause === 'wind') {
      if (a.wind === 'over') return 'consorcio';
      if (a.wind === 'under') return 'insurer';
      return 'unknown';
    }
    return 'insurer';
  };
  const verdict = route();
  const today = todayISO();
  const whenIsFuture = isFutureDate(a.when, today);
  const days = daysSince(a.when, today);
  const lateWarning = days != null && days > NOTIFY.value;

  const opt = (k, n) => ({ value: k, label: c(`${n}_${k}`), desc: c(`${n}_${k}_d`) === `${n}_${k}_d` ? null : c(`${n}_${k}_d`) });

  const headline = {
    consorcio: c('result_consorcio'),
    insurer: c('result_insurer'),
    uninsured: c('result_uninsured'),
    unknown: c('result_unknown'),
  }[verdict];

  const tone = verdict === 'uninsured' ? 'warn' : verdict === 'consorcio' ? 'good' : 'neutral';

  return (
    <ToolShell title={c('headline')} progress={step === 'intro' ? null : progress}
      note={c('note')}>

      {step === 'intro' && (
        <Intro eyebrow={c('eyebrow')} headline={c('headline')} body={c('body')}
          points={c('points')} cta={c('cta')} minutes={c('minutes')}
          onStart={() => setStep('cause')} />
      )}

      {step === 'cause' && (
        <Step n={1} of={order.length} question={c('q_cause')} hint={c('q_cause_hint')}>
          <Options items={['flood', 'wind', 'quake', 'volcano', 'hail', 'other'].map(k => opt(k, 'cause'))}
            value={a.cause} onChange={v => advance('cause', v)} />
        </Step>
      )}

      {step === 'wind' && (
        <Step n={2} of={order.length} question={c('q_wind')} hint={c('q_wind_hint')} onBack={back}>
          <Options items={[
            { value: 'over', label: c('wind_over') },
            { value: 'under', label: c('wind_under') },
            { value: 'unknown', label: c('wind_unknown') },
          ]} value={a.wind} onChange={v => advance('wind', v)} />
          <SourceNote ids="consorcio.wind_threshold" label={fill(c('wind_source_label'), { n: WIND.value })} />
        </Step>
      )}

      {step === 'policy' && (
        <Step n={needsWind ? 3 : 2} of={order.length} question={c('q_policy')} hint={c('q_policy_hint')} onBack={back}>
          <Options items={[
            { value: 'yes', label: c('policy_yes') },
            { value: 'unsure', label: c('policy_unsure') },
            { value: 'no', label: c('policy_no') },
          ]} value={a.policy} onChange={v => advance('policy', v)} />
        </Step>
      )}

      {step === 'when' && (
        <Step n={order.length} of={order.length} question={c('q_when')} hint={c('q_when_hint')} onBack={back}
          onNext={() => setStep('result')} nextDisabled={!a.when || whenIsFuture} nextLabel={c('next_label')}>
          <DateField label={c('date_label')} value={a.when} onChange={v => setA(p => ({ ...p, when: v }))}
            max={today}
            hint={whenIsFuture ? c('date_future_hint') : null} />
        </Step>
      )}

      {step === 'result' && (
        <Result headline={headline} tone={tone} onRestart={restart} restartLabel={c('restart')}
          sub={c(`sub_${verdict}`)}>

          {verdict === 'consorcio' && (
            <>
              <Panel title={c('panel_todo')} kind="key">
                <ol className="tk-ol">
                  {c('todo').map((t, i) => <li key={i}>{t}</li>)}
                </ol>
              </Panel>
              <Panel title={c('panel_catch')}>
                <p className="tk-para">{c('catch_p')}</p>
              </Panel>
              <SourceNote ids={['consorcio.perils', 'consorcio.precondition', 'consorcio.wind_threshold']} label={src} />
            </>
          )}

          {verdict === 'insurer' && (
            <>
              <Panel title={c('panel_not_consorcio')} kind="quiet">
                <p className="tk-para">{c('not_consorcio_p')}</p>
              </Panel>
              <SourceNote ids={['consorcio.perils', 'consorcio.exclusions']} label={src} />
            </>
          )}

          {verdict === 'uninsured' && (
            <Panel title={c('panel_means')} kind="quiet">
              <p className="tk-para">{c('means_p')}</p>
            </Panel>
          )}

          {verdict === 'unknown' && (
            <>
              <Panel title={c('panel_settle')} kind="key">
                <ol className="tk-ol">
                  <li>{c('settle_1')}</li>
                  <li>{c('settle_2_pre')} <strong>{fill(c('settle_2_strong'), { n: WIND.value })}</strong>{c('settle_2_post')}</li>
                  <li>{c('settle_3')}</li>
                </ol>
              </Panel>
              <SourceNote ids="consorcio.wind_threshold" label={src} />
            </>
          )}

          {verdict !== 'uninsured' && (
            <Panel title={c('panel_deadline')} kind={lateWarning ? 'dark' : 'quiet'}>
              <Rows items={[
                { label: c('row_found'), value: days == null ? c('not_given') : new Date(a.when + 'T00:00:00').toLocaleDateString(DATE_LOCALES[locale] || 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) },
                { label: c('row_days'), value: days == null ? c('unknown') : `${days}` },
                { label: c('row_window'), value: fill(c('window_value'), { n: NOTIFY.value }), strong: true },
              ]} />
              <p className="tk-para">
                {lateWarning ? c('late_p') : c('ontime_p')}
              </p>
              <SourceNote ids="consorcio.notification" label={src} />
            </Panel>
          )}

          <ToolDisclaimer>{c('disclaimer')}</ToolDisclaimer>
        </Result>
      )}
    </ToolShell>
  );
}
