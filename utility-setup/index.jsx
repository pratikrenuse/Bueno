import { useState } from 'react';
import ToolShell, { Intro, Step, Options, Result, Panel, Rows, Checklist, useCopy } from '../ToolShell.jsx';
import SourceNote, { ToolDisclaimer } from '../SourceNote.jsx';
import { rule } from '../rules/index.js';
import copyDict from './copy.js';
import { buildSteps, buildGates, buildContacts } from './steps.js';

// Getting the utilities on at a Spanish property.
//
// Five processes, five different counters, and the thing prose hides is that two of them
// cannot start until something else has finished. The NIE gates every contract, the
// Spanish account gates the direct debits, and on a property that has been off supply the
// electrical installation certificate gates energisation. So the tool leads with what is
// blocked and by what, and only then gives the list.
//
// One rules-base figure appears here: the energy certificate. Validity is ten years except
// a G rating, which is five, and a large share of older coastal stock is rated E, F or G.
// It is read from rules/epc.json and shown with its source. The penalty band is deliberately
// absent: epc.penalties is unverified, so no figure for it reaches a user.

const EPC_VALIDITY = rule('epc.validity');
const STEPS = ['stage', 'supply', 'nie', 'account', 'type', 'plan'];
const EMPTY = { stage: '', supply: '', nie: '', account: '', type: '', plan: '' };

export default function UtilitySetup() {
  const c = useCopy(copyDict);
  const [step, setStep] = useState('intro');
  const [a, setA] = useState(EMPTY);

  const idx = STEPS.indexOf(step);
  const progress = step === 'intro' ? 0 : step === 'result' ? 100 : ((idx + 1) / STEPS.length) * 100;

  const advance = (k, v) => {
    setA(p => ({ ...p, [k]: v }));
    const i = STEPS.indexOf(k);
    setTimeout(() => setStep(STEPS[i + 1] || 'result'), 150);
  };
  const back = () => setStep(idx <= 0 ? 'intro' : STEPS[idx - 1]);

  const opt = (k, n) => ({ value: k, label: c(`${n}_${k}`), desc: c(`${n}_${k}_d`) === `${n}_${k}_d` ? null : c(`${n}_${k}_d`) });

  const gates = step === 'result' ? buildGates(a, c) : null;
  const headline = gates && c(`result_${gates.verdict}`);
  const sub = gates && c(`result_${gates.verdict}_sub`);
  const tone = gates && (gates.verdict === 'clear' ? 'good' : gates.verdict === 'nie' ? 'warn' : 'neutral');

  return (
    <ToolShell title={c('headline')} progress={step === 'intro' ? null : progress}
      note={c('shell_note')}>

      {step === 'intro' && (
        <Intro
          eyebrow={c('eyebrow')} headline={c('headline')} body={c('body')}
          points={c('points')} cta={c('cta')} minutes={c('minutes')}
          onStart={() => setStep('stage')}
        />
      )}

      {step === 'stage' && (
        <Step n={1} of={STEPS.length} question={c('q_stage')} hint={c('q_stage_hint')}>
          <Options items={['buying', 'owner'].map(k => opt(k, 'stage'))}
            value={a.stage} onChange={v => advance('stage', v)} />
        </Step>
      )}

      {step === 'supply' && (
        <Step n={2} of={STEPS.length} question={c('q_supply')} hint={c('q_supply_hint')} onBack={back}>
          <Options items={['live', 'dormant', 'off', 'unknown'].map(k => opt(k, 'supply'))}
            value={a.supply} onChange={v => advance('supply', v)} />
        </Step>
      )}

      {step === 'nie' && (
        <Step n={3} of={STEPS.length} question={c('q_nie')} hint={c('q_nie_hint')} onBack={back}>
          <Options items={['have', 'applied', 'none'].map(k => opt(k, 'nie'))}
            value={a.nie} onChange={v => advance('nie', v)} />
        </Step>
      )}

      {step === 'account' && (
        <Step n={4} of={STEPS.length} question={c('q_account')} hint={c('q_account_hint')} onBack={back}>
          <Options items={['spanish', 'foreign', 'none'].map(k => opt(k, 'account'))}
            value={a.account} onChange={v => advance('account', v)} />
        </Step>
      )}

      {step === 'type' && (
        <Step n={5} of={STEPS.length} question={c('q_type')} hint={c('q_type_hint')} onBack={back}>
          <Options items={['apartment', 'villa', 'rural'].map(k => opt(k, 'type'))}
            value={a.type} onChange={v => advance('type', v)} />
        </Step>
      )}

      {step === 'plan' && (
        <Step n={6} of={STEPS.length} question={c('q_plan')} hint={c('q_plan_hint')} onBack={back}>
          <Options items={['takeover', 'switch', 'unsure'].map(k => opt(k, 'plan'))}
            value={a.plan} onChange={v => advance('plan', v)} />
        </Step>
      )}

      {step === 'result' && (
        <Result headline={headline} sub={sub} tone={tone}
          onRestart={() => { setA(EMPTY); setStep('intro'); }}
          restartLabel={c('restart')}>

          <Panel title={c('gates_title')} kind="key">
            <Rows items={gates.rows} />
            <p className="tk-para">{c('gates_para')}</p>
          </Panel>

          <Panel title={c('who_title')} kind="quiet">
            <Rows items={buildContacts(c)} />
          </Panel>

          <Checklist groups={buildSteps(a, c)} />

          <Panel title={c('epc_title')}>
            <p className="tk-para">{c('epc_p1')}</p>
            <p className="tk-para">
              {c('epc_p2')
                .replace('{default_years}', EPC_VALIDITY.value.default_years)
                .replace('{g_years}', EPC_VALIDITY.value.rating_g_years)}
            </p>
            <SourceNote ids={['epc.requirement', 'epc.validity']} label={c('source_label')} />
            <p className="tk-para">{c('epc_p3')}</p>
          </Panel>

          <ToolDisclaimer>{c('disclaimer')}</ToolDisclaimer>
        </Result>
      )}
    </ToolShell>
  );
}
