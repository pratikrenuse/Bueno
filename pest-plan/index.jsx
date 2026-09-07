import { useState } from 'react';
import ToolShell, { Intro, Step, Options, Result, Panel, Checklist, useCopy } from '../ToolShell.jsx';
import { ToolDisclaimer } from '../SourceNote.jsx';
import copyDict from './copy.js';
import { buildProfile } from './profile.js';

// Which pests a Spanish property is likely to get, and what to do about each one.
//
// No legal constants, so nothing here reads from the rules base. The constraint on this
// tool is a different one: every species, sign and treatment comes from one published guide
// and nothing has been added to it. Where the guide is silent about a region, the result
// screen says so in its own panel rather than filling the gap. See profile.js.

// The value is what profile.js branches on. The key is what copy.js is keyed by, because a
// dot path cannot carry a hyphen.
const REGIONS = [
  { value: 'costa-blanca', key: 'costa_blanca' },
  { value: 'costa-del-sol', key: 'costa_del_sol' },
  { value: 'balearics', key: 'balearics' },
  { value: 'canaries', key: 'canaries' },
  { value: 'inland', key: 'inland' },
  { value: 'north', key: 'north' },
];

const STEPS = ['region', 'type', 'around', 'empty', 'season'];
const EMPTY = { region: '', type: '', around: [], empty: '', season: '' };

export default function PestPlan() {
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

  const toggleAround = v => {
    if (v === 'none') return set('around', ['none']);
    setA(p => {
      const without = p.around.filter(x => x !== 'none');
      return { ...p, around: without.includes(v) ? without.filter(x => x !== v) : [...without, v] };
    });
  };

  const opt = (k, n) => ({
    value: k,
    label: c(`${n}_${k}`),
    desc: c(`${n}_${k}_d`) === `${n}_${k}_d` ? null : c(`${n}_${k}_d`),
  });

  const p = step === 'result' ? buildProfile(a, c) : null;

  // "Cockroaches, rats and mosquitoes." The answer, before any of the method.
  const verdict = () => {
    const names = p.top.map(x => x.name.toLowerCase());
    const joined = `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
    return joined.charAt(0).toUpperCase() + joined.slice(1);
  };

  // "Ranked for a house with a garden and a pool, on the Costa Blanca, left empty for
  // months at a time, in summer."
  const profileLine = () => {
    const bits = [c(`s_type_${a.type}`)];
    const around = a.around.filter(x => x !== 'none');
    if (around.length) {
      const parts = around.map(k => c(`s_around_${k}`));
      const list = parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
      bits[0] = `${bits[0]} ${c('s_with')} ${list}`;
    }
    bits.push(c(`s_region_${a.region.replace(/-/g, '_')}`));
    if (a.empty === 'yes') bits.push(c('s_empty'));
    bits.push(c(`s_season_${a.season}`));
    return `${c('result_sub_pre')} ${bits.join(', ')}.`;
  };

  return (
    <ToolShell title={c('headline')} progress={step === 'intro' ? null : progress}
      note="Practical guidance for property owners in Spain. Not legal advice.">

      {step === 'intro' && (
        <Intro
          eyebrow={c('eyebrow')} headline={c('headline')} body={c('body')}
          points={c('points')} cta={c('cta')} minutes={c('minutes')}
          onStart={() => setStep('region')}
        />
      )}

      {step === 'region' && (
        <Step n={1} of={5} question={c('q_region')} hint={c('q_region_hint')}>
          <Options items={REGIONS.map(r => ({ ...opt(r.key, 'region'), value: r.value }))}
            value={a.region} onChange={v => advance('region', v)} />
        </Step>
      )}

      {step === 'type' && (
        <Step n={2} of={5} question={c('q_type')} onBack={back}>
          <Options items={['apartment', 'house'].map(k => opt(k, 'type'))}
            value={a.type} onChange={v => advance('type', v)} />
        </Step>
      )}

      {step === 'around' && (
        <Step n={3} of={5} question={c('q_around')} hint={c('q_around_hint')} onBack={back}
          onNext={() => setStep('empty')} nextDisabled={a.around.length === 0}>
          <div className="tk-options">
            {['garden', 'pool', 'trees', 'none'].map(k => {
              const on = a.around.includes(k);
              return (
                <button key={k} type="button" aria-pressed={on}
                  className={`option-card tk-option${on ? ' selected' : ''}`}
                  onClick={() => toggleAround(k)}>
                  <span className="tk-option-text">
                    <span className="option-title">{c(`around_${k}`)}</span>
                  </span>
                  <span className="tk-option-mark" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </Step>
      )}

      {step === 'empty' && (
        <Step n={4} of={5} question={c('q_empty')} hint={c('q_empty_hint')} onBack={back}>
          <Options items={[
            { value: 'yes', label: c('empty_yes') },
            { value: 'no', label: c('empty_no') },
          ]} value={a.empty} onChange={v => advance('empty', v)} />
        </Step>
      )}

      {step === 'season' && (
        <Step n={5} of={5} question={c('q_season')} hint={c('q_season_hint')} onBack={back}>
          <Options items={['summer', 'spring', 'autumn', 'winter'].map(k => opt(k, 'season'))}
            value={a.season} onChange={v => advance('season', v)} columns={2} />
        </Step>
      )}

      {step === 'result' && p && (
        <Result
          headline={verdict()}
          sub={profileLine()}
          tone={p.ratsHigh ? 'warn' : 'neutral'}
          onRestart={() => { setA(EMPTY); setStep('intro'); }}
          restartLabel={c('restart')}>

          {p.isWinter && (
            <Panel title={c('winter_title')} kind="quiet">
              <p className="tk-para">{c('winter_body')}</p>
            </Panel>
          )}

          {p.top.map(pest => (
            <Panel key={pest.key} title={`${pest.rank}. ${pest.name}`} kind="plain">
              <p className="tk-para">{pest.why}</p>
              <p className="tk-para"><strong>{c('sign_lead')}</strong></p>
              <ul className="tk-ol">
                {pest.signs.map((s, si) => <li key={si}>{s}</li>)}
              </ul>
              <p className="tk-para"><strong>{c('do_lead')}</strong> {pest.action}</p>
            </Panel>
          ))}

          <Panel title={c('rest_title')} kind="quiet">
            <p className="tk-para">{c('rest_note')}</p>
            <ul className="tk-ol">
              {p.rest.map(pest => (
                <li key={pest.key}><strong>{pest.name}.</strong> {pest.signs[0]}</li>
              ))}
            </ul>
          </Panel>

          <Panel title={c('signs_title')}>
            <p className="tk-para">{c('signs_note')}</p>
            <ul className="tk-ol">
              {p.generalSigns.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </Panel>

          <Panel title={c('prevention_title')} kind="key">
            <p className="tk-para">{c('prevention_note')}</p>
          </Panel>

          <Checklist groups={p.prevention} />

          <Panel title={c('diy_title')}>
            <ul className="tk-ol">
              {p.diy.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </Panel>

          <Panel title={c('pro_title')} kind="dark">
            <ul className="tk-ol">
              {p.pro.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </Panel>

          <Panel
            title={p.coverage.kind === 'named' ? c('cov_named_title')
              : p.coverage.kind === 'partial' ? c('cov_partial_title')
              : c('cov_none_title')}
            kind="quiet">
            <p className="tk-para">{p.coverage.body}</p>
          </Panel>

          <ToolDisclaimer>
            This is prevention guidance drawn from a published guide to pests in Spanish
            homes, not a survey of your property. It names no product and no treatment
            beyond what that guide names. Anything already established, and anything
            involving rodents, is a job for a licensed pest control company who can see it.
          </ToolDisclaimer>
        </Result>
      )}
    </ToolShell>
  );
}
