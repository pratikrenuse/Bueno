import { useState } from 'react';
import ToolShell, { Intro, Step, Options, Result, Panel, Checklist, useCopy } from '../ToolShell.jsx';
import { ToolDisclaimer } from '../SourceNote.jsx';
import copyDict from './copy.js';
import { buildSchedule, hasUrgent } from './schedule.js';

// The maintenance year for one property.
//
// No legal constants, so nothing here reads from the rules base. What it does have to be
// careful about is dates: IBI, rubbish tax and community fees are all set locally and the
// months differ between municipalities, so this tool never states one. It tells the reader
// which office holds the answer and leaves a line on the schedule for it.

const STEPS = ['type', 'location', 'age', 'features', 'visits'];
const EMPTY = { type: '', location: '', age: '', features: [], visits: '' };

export default function MaintenanceSchedule() {
  const c = useCopy(copyDict);
  const [step, setStep] = useState('intro');
  const [a, setA] = useState(EMPTY);

  const idx = STEPS.indexOf(step);
  const progress = step === 'intro' ? 0 : step === 'result' ? 100 : ((idx + 1) / STEPS.length) * 100;

  const set = (k, v) => setA(p => ({ ...p, [k]: v }));
  const advance = (k, v) => {
    set(k, v);
    const i = STEPS.indexOf(k);
    setTimeout(() => setStep(STEPS[i + 1] || 'result'), 150);
  };
  const back = () => setStep(idx <= 0 ? 'intro' : STEPS[idx - 1]);

  const toggleFeature = v => {
    if (v === 'none') return set('features', ['none']);
    setA(p => {
      const without = p.features.filter(x => x !== 'none');
      return { ...p, features: without.includes(v) ? without.filter(x => x !== v) : [...without, v] };
    });
  };

  const opt = (k, n) => ({
    value: k,
    label: c(`${n}_${k}`),
    desc: c(`${n}_${k}_d`) === `${n}_${k}_d` ? null : c(`${n}_${k}_d`),
  });

  const urgent = step === 'result' && hasUrgent(a);

  return (
    <ToolShell title={c('headline')} progress={step === 'intro' ? null : progress}
      note="Practical guidance for property owners in Spain. Not legal advice.">

      {step === 'intro' && (
        <Intro
          eyebrow={c('eyebrow')} headline={c('headline')} body={c('body')}
          points={c('points')} cta={c('cta')} minutes={c('minutes')}
          onStart={() => setStep('type')}
        />
      )}

      {step === 'type' && (
        <Step n={1} of={5} question={c('q_type')}>
          <Options items={['apartment', 'house'].map(k => opt(k, 'type'))}
            value={a.type} onChange={v => advance('type', v)} />
        </Step>
      )}

      {step === 'location' && (
        <Step n={2} of={5} question={c('q_location')} hint={c('q_location_hint')} onBack={back}>
          <Options items={['coastal', 'inland'].map(k => opt(k, 'location'))}
            value={a.location} onChange={v => advance('location', v)} />
        </Step>
      )}

      {step === 'age' && (
        <Step n={3} of={5} question={c('q_age')} hint={c('q_age_hint')} onBack={back}>
          <Options items={['pre1980', '8090', '2000s', 'newer', 'unsure'].map(k => opt(k, 'age'))}
            value={a.age} onChange={v => advance('age', v)} />
        </Step>
      )}

      {step === 'features' && (
        <Step n={4} of={5} question={c('q_features')} hint={c('q_features_hint')} onBack={back}
          onNext={() => setStep('visits')} nextDisabled={a.features.length === 0}>
          <div className="tk-options">
            {['pool', 'garden', 'aircon', 'solar', 'boiler', 'none'].map(k => {
              const on = a.features.includes(k);
              return (
                <button key={k} type="button" aria-pressed={on}
                  className={`option-card tk-option${on ? ' selected' : ''}`}
                  onClick={() => toggleFeature(k)}>
                  <span className="tk-option-text">
                    <span className="option-title">{c(`feature_${k}`)}</span>
                  </span>
                  <span className="tk-option-mark" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </Step>
      )}

      {step === 'visits' && (
        <Step n={5} of={5} question={c('q_visits')} hint={c('q_visits_hint')} onBack={back}>
          <Options items={['monthly', 'few', 'rare'].map(k => opt(k, 'visits'))}
            value={a.visits} onChange={v => advance('visits', v)} />
        </Step>
      )}

      {step === 'result' && (
        <Result
          headline={c('result_headline')}
          sub={urgent ? c('result_sub') : c('result_sub_calm')}
          tone={urgent ? 'warn' : 'neutral'}
          onRestart={() => { setA(EMPTY); setStep('intro'); }}
          restartLabel={c('restart')}>

          <Checklist groups={buildSchedule(a, c)} />

          <Panel title={c('limit_title')} kind="quiet">
            <p className="tk-para">{c('limit_body')}</p>
          </Panel>

          <ToolDisclaimer>
            This is practical maintenance guidance, not legal, tax or insurance advice. What
            your policy covers is whatever your policy says, and the only dates that bind you
            are the ones your ayuntamiento, your community and your tax office publish.
          </ToolDisclaimer>
        </Result>
      )}
    </ToolShell>
  );
}
