import { useState } from 'react';
import ToolShell, { Intro, Step, Options, Result, Panel, Rows, DateField, useCopy } from '../ToolShell.jsx';
import SourceNote, { ToolDisclaimer } from '../SourceNote.jsx';
import { rule } from '../rules/index.js';
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

export default function StormClaim() {
  const c = useCopy(copyDict);
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
      note="Guidance for property owners in Spain. Not insurance advice.">

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
          <SourceNote ids="consorcio.wind_threshold" label="Where 120 comes from" />
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
          onNext={() => setStep('result')} nextDisabled={!a.when || whenIsFuture} nextLabel="See the answer">
          <DateField label="The day you found out" value={a.when} onChange={v => setA(p => ({ ...p, when: v }))}
            max={today}
            hint={whenIsFuture ? 'That date is still to come. The clock starts on the day you found out, so it cannot be later than today.' : null} />
        </Step>
      )}

      {step === 'result' && (
        <Result headline={headline} tone={tone} onRestart={restart} restartLabel={c('restart')}
          sub={
            verdict === 'consorcio' ? 'You claim from the Consorcio de Compensacion de Seguros, a state body, not from the company that sold you the policy. Your insurer is not the one who decides this.'
            : verdict === 'insurer' ? 'This is ordinary damage under your own policy. The Consorcio only handles the specific extraordinary events listed in the law, and this is not one of them.'
            : verdict === 'uninsured' ? 'Consorcio cover is not standalone. It only exists on top of an ordinary policy, so with no policy in force there is nothing behind it.'
            : 'The law draws the line at a gust speed, so the answer is a matter of record rather than judgement. Here is how to settle it.'
          }>

          {verdict === 'consorcio' && (
            <>
              <Panel title="What to do" kind="key">
                <ol className="tk-ol">
                  <li>Contact the Consorcio directly, or ask your insurer or broker to file it for you. Both routes are valid.</li>
                  <li>Photograph everything before you clear up, and keep receipts for anything urgent you have to fix immediately.</li>
                  <li>Have your policy number ready. The Consorcio pays against the cover in that policy, so it needs to see it.</li>
                </ol>
              </Panel>
              <Panel title="The part that catches owners out">
                <p className="tk-para">
                  The Consorcio pays up to the sums insured in your ordinary policy, not up to the
                  value of the damage. If the building is insured for less than it would cost to
                  rebuild, the shortfall carries straight through to this claim in the same
                  proportion. It is worth checking that figure now rather than at the point of a
                  loss.
                </p>
              </Panel>
              <SourceNote ids={['consorcio.perils', 'consorcio.precondition', 'consorcio.wind_threshold']} />
            </>
          )}

          {verdict === 'insurer' && (
            <>
              <Panel title="Why this one is not a Consorcio matter" kind="quiet">
                <p className="tk-para">
                  The Consorcio covers a closed list: earthquake and seaquake, extraordinary
                  flooding, volcanic eruption, atypical cyclonic storm, and falling meteorites,
                  plus terrorism and civil disorder. Everything else, including ordinary rain,
                  hail, wind below the threshold and any water coming from inside the building,
                  is the private insurer's. A burst pipe is never a Consorcio claim.
                </p>
              </Panel>
              <SourceNote ids={['consorcio.perils', 'consorcio.exclusions']} />
            </>
          )}

          {verdict === 'uninsured' && (
            <Panel title="What this means" kind="quiet">
              <p className="tk-para">
                The surcharge that funds the Consorcio is collected automatically inside an
                ordinary home insurance premium. There is nothing separate to buy, and equally
                nothing to fall back on when there is no policy. Note also that a new policy
                carries a waiting period, so cover does not start on the day you sign.
              </p>
            </Panel>
          )}

          {verdict === 'unknown' && (
            <>
              <Panel title="How to settle it" kind="key">
                <ol className="tk-ol">
                  <li>Find the official gust record for that date and location. AEMET, the Spanish
                      met office, publishes it. Local press reporting an average wind speed is not
                      the same measurement and is not what the law uses.</li>
                  <li>The test is a gust <strong>exceeding {WIND.value} km/h</strong>, measured over
                      three seconds. Above that it is a Consorcio claim. At or below it, it is your
                      insurer's.</li>
                  <li>If it is close, file with both. They will sort out between them which one
                      pays, and filing with the wrong one first costs you time you may not have.</li>
                </ol>
              </Panel>
              <SourceNote ids="consorcio.wind_threshold" />
            </>
          )}

          {verdict !== 'uninsured' && (
            <Panel title="Your deadline" kind={lateWarning ? 'dark' : 'quiet'}>
              <Rows items={[
                { label: 'You found out', value: days == null ? 'not given' : new Date(a.when + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) },
                { label: 'Days since', value: days == null ? 'unknown' : `${days}` },
                { label: 'Notification window', value: `${NOTIFY.value} days from finding out`, strong: true },
              ]} />
              <p className="tk-para">
                {lateWarning
                  ? 'You are past the standard window, which is a reason to file today rather than a reason not to file. The clock runs from when you knew, not from the date of the storm, and for an owner who was abroad those are rarely the same day. Say clearly in the claim when and how you found out.'
                  : 'The clock runs from when you found out, not from the date of the storm. For an owner abroad those are rarely the same day, and it is worth saying so explicitly when you file.'}
              </p>
              <SourceNote ids="consorcio.notification" />
            </Panel>
          )}

          <ToolDisclaimer />
        </Result>
      )}
    </ToolShell>
  );
}
