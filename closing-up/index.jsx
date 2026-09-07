import { useState } from 'react';
import ToolShell, { Intro, Step, Options, Result, Checklist, useCopy } from '../ToolShell.jsx';
import { ToolDisclaimer } from '../SourceNote.jsx';
import copyDict from './copy.js';
import { buildList } from './list.js';

// Closing up an empty Spanish home.
//
// No legal constants, so nothing here depends on the rules base. What it does depend on is
// getting the squatter section right: there is no 48-hour rule in Spanish law, and this
// tool must never imply one. See rules/squatting.json and ARTICLE_CORRECTIONS.md.

const STEPS = ['away', 'season', 'type', 'extras', 'checker'];

export default function ClosingUp() {
  const c = useCopy(copyDict);
  const [step, setStep] = useState('intro');
  const [a, setA] = useState({ away: '', season: '', type: '', extras: [], checker: '' });

  const idx = STEPS.indexOf(step);
  const progress = step === 'intro' ? 0 : step === 'result' ? 100 : ((idx + 1) / STEPS.length) * 100;

  const set = (k, v) => setA(p => ({ ...p, [k]: v }));
  const advance = (k, v) => {
    set(k, v);
    const i = STEPS.indexOf(k);
    setTimeout(() => setStep(STEPS[i + 1] || 'result'), 150);
  };
  const back = () => setStep(idx <= 0 ? 'intro' : STEPS[idx - 1]);

  const toggleExtra = v => {
    if (v === 'none') return set('extras', ['none']);
    setA(p => {
      const without = p.extras.filter(x => x !== 'none');
      return { ...p, extras: without.includes(v) ? without.filter(x => x !== v) : [...without, v] };
    });
  };

  const opt = (k, n) => ({ value: k, label: c(`${n}_${k}`), desc: c(`${n}_${k}_d`) === `${n}_${k}_d` ? null : c(`${n}_${k}_d`) });

  return (
    <ToolShell title={c('headline')} progress={step === 'intro' ? null : progress}
      note="Practical guidance for property owners in Spain. Not legal advice.">

      {step === 'intro' && (
        <Intro
          eyebrow={c('eyebrow')} headline={c('headline')} body={c('body')}
          points={c('points')} cta={c('cta')} minutes={c('minutes')}
          onStart={() => setStep('away')}
        />
      )}

      {step === 'away' && (
        <Step n={1} of={5} question={c('q_away')} hint={c('q_away_hint')}>
          <Options items={['short', 'medium', 'long'].map(k => opt(k, 'away'))}
            value={a.away} onChange={v => advance('away', v)} />
        </Step>
      )}

      {step === 'season' && (
        <Step n={2} of={5} question={c('q_season')} hint={c('q_season_hint')} onBack={back}>
          <Options items={['summer', 'winter', 'shoulder'].map(k => opt(k, 'season'))}
            value={a.season} onChange={v => advance('season', v)} />
        </Step>
      )}

      {step === 'type' && (
        <Step n={3} of={5} question={c('q_type')} onBack={back}>
          <Options items={['apartment', 'villa'].map(k => opt(k, 'type'))}
            value={a.type} onChange={v => advance('type', v)} />
        </Step>
      )}

      {step === 'extras' && (
        <Step n={4} of={5} question={c('q_extras')} hint={c('q_extras_hint')} onBack={back}
          onNext={() => setStep('checker')} nextDisabled={a.extras.length === 0}>
          <div className="tk-options">
            {['pool', 'garden', 'aircon', 'none'].map(k => {
              const on = a.extras.includes(k);
              return (
                <button key={k} type="button" aria-pressed={on}
                  className={`option-card tk-option${on ? ' selected' : ''}`}
                  onClick={() => toggleExtra(k)}>
                  <span className="tk-option-text">
                    <span className="option-title">{c(`extra_${k}`)}</span>
                  </span>
                  <span className="tk-option-mark" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </Step>
      )}

      {step === 'checker' && (
        <Step n={5} of={5} question={c('q_checker')} hint={c('q_checker_hint')} onBack={back}>
          <Options items={[
            { value: 'yes', label: c('checker_yes') },
            { value: 'no', label: c('checker_no') },
          ]} value={a.checker} onChange={v => advance('checker', v)} />
        </Step>
      )}

      {step === 'result' && (
        <Result headline={c('result_headline')} sub={c('result_sub')}
          onRestart={() => { setA({ away: '', season: '', type: '', extras: [], checker: '' }); setStep('intro'); }}
          restartLabel={c('restart')}>
          <Checklist groups={buildList(a, c)} />
          <ToolDisclaimer>
            This is practical guidance, not legal advice. If the property is already occupied
            by someone who should not be there, that is a legal matter and time matters, so
            speak to a Spanish lawyer rather than working from a checklist.
          </ToolDisclaimer>
        </Result>
      )}
    </ToolShell>
  );
}
