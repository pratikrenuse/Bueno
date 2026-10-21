import { useState } from 'react';
import ToolShell, { Intro, Step, Options, Result, Panel, Rows, Checklist, useCopy } from '../ToolShell.jsx';
import { ToolDisclaimer } from '../SourceNote.jsx';
import copyDict from './copy.js';
import { QUESTIONS, assess, buildGroups } from './flags.js';

// Checking a builder quote before signing it.
//
// No legal constants, so nothing here touches the rules base. Three things this tool must
// never do, and they are all things the source articles do:
//
//   1. State a fine. There is no verified figure for building or certificate penalties.
//   2. State the ICIO rate. It is municipal and unverified, so the tool says the
//      ayuntamiento charges fees and a construction tax on the licence, and stops there.
//   3. State how long ago work has to have been finished to be legalised retrospectively.
//      The period differs by region and by when the work was done, and quoting the wrong
//      one to an owner deciding whether to buy would be worse than saying nothing.
//
// The obra mayor and obra menor distinction is described qualitatively for the same
// reason: the classification is the ayuntamiento decision, not ours and not the builder's.

const IDS = QUESTIONS.map(q => q.id);
const EMPTY = Object.fromEntries(IDS.map(id => [id, '']));

export default function ContractorCheck() {
  const c = useCopy(copyDict);
  const [step, setStep] = useState('intro');
  const [a, setA] = useState(EMPTY);

  const idx = IDS.indexOf(step);
  const progress = step === 'intro' ? 0 : step === 'result' ? 100 : ((idx + 1) / IDS.length) * 100;

  const advance = (id, v) => {
    setA(p => ({ ...p, [id]: v }));
    const i = IDS.indexOf(id);
    setTimeout(() => setStep(IDS[i + 1] || 'result'), 150);
  };
  const back = () => setStep(idx <= 0 ? 'intro' : IDS[idx - 1]);

  const current = QUESTIONS.find(q => q.id === step);
  const items = current
    ? current.options.map(o => ({
        value: o.value,
        label: c(`${current.id}_${o.value}`),
        desc: c(`${current.id}_${o.value}_d`) === `${current.id}_${o.value}_d` ? null : c(`${current.id}_${o.value}_d`),
      }))
    : [];

  const r = step === 'result' ? assess(a, c) : null;
  const tone = r && (r.verdict === 'clear' ? 'good' : r.verdict === 'stop' || r.verdict === 'rework' ? 'warn' : 'neutral');
  const countLine = r && c(r.counts.red === 1 ? 'count_line_one' : 'count_line_many')
    .replace('{red}', r.counts.red).replace('{amber}', r.counts.amber).replace('{total}', r.counts.total);

  return (
    <ToolShell title={c('headline')} progress={step === 'intro' ? null : progress}
      note={c('shell_note')}>

      {step === 'intro' && (
        <Intro
          eyebrow={c('eyebrow')} headline={c('headline')} body={c('body')}
          points={c('points')} cta={c('cta')} minutes={c('minutes')}
          onStart={() => setStep(IDS[0])}
        />
      )}

      {current && (
        <Step
          n={idx + 1} of={IDS.length}
          question={c(`q_${current.id}`)} hint={c(`q_${current.id}_hint`)}
          onBack={idx === 0 ? undefined : back}
        >
          <Options items={items} value={a[current.id]} onChange={v => advance(current.id, v)} />
        </Step>
      )}

      {step === 'result' && (
        <Result headline={c(`result_${r.verdict}`)} sub={`${countLine} ${c(`result_${r.verdict}_sub`)}`}
          tone={tone} onRestart={() => { setA(EMPTY); setStep('intro'); }} restartLabel={c('restart')}>

          <Panel title={c('score_title')} kind="key">
            <Rows items={[
              { label: c('score_red'), value: `${r.counts.red}`, strong: r.counts.red > 0 },
              { label: c('score_amber'), value: `${r.counts.amber}` },
              { label: c('score_clear'), value: `${r.counts.clear}` },
              { label: c('score_total'), value: `${r.counts.total}` },
            ]} />
            <p className="tk-para">{c('score_para')}</p>
          </Panel>

          <Checklist groups={buildGroups(r, c)} />

          <Panel title={c('obra_title')}>
            <p className="tk-para">{c('obra_p1')}</p>
            <p className="tk-para">{c('obra_p2')}</p>
            <p className="tk-para">{c('obra_lead')}</p>
            <ol className="tk-ol">
              {c('obra_steps').map((t, i) => <li key={i}>{t}</li>)}
            </ol>
          </Panel>

          <Panel title={c('deeds_title')} kind="quiet">
            <p className="tk-para">{c('deeds_p')}</p>
          </Panel>

          <ToolDisclaimer>{c('disclaimer')}</ToolDisclaimer>
        </Result>
      )}
    </ToolShell>
  );
}
