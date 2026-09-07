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

  const r = step === 'result' ? assess(a) : null;
  const tone = r && (r.verdict === 'clear' ? 'good' : r.verdict === 'stop' || r.verdict === 'rework' ? 'warn' : 'neutral');
  const countLine = r && `${r.counts.red} red ${r.counts.red === 1 ? 'flag' : 'flags'}, ${r.counts.amber} unconfirmed, out of ${r.counts.total} questions.`;

  return (
    <ToolShell title={c('headline')} progress={step === 'intro' ? null : progress}
      note="Practical guidance for property owners in Spain. Not legal advice.">

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
            <p className="tk-para">
              A red flag is not proof of anything. It is something missing from the quote, and
              every one of them has a question that resolves it. What matters is how the
              contractor answers, not that you asked.
            </p>
          </Panel>

          <Checklist groups={buildGroups(r, c)} />

          <Panel title="If this turns out to be obra mayor rather than obra menor">
            <p className="tk-para">
              Spanish building work splits into two kinds, and which one you are doing changes
              who has to be involved before anyone lifts a tool. Obra menor is work that leaves
              the structure, the footprint and the use of the property alone: painting,
              retiling, replacing a window in the same opening at the same size, built in
              furniture, repairing a facade or a fence. Obra mayor is work that changes the
              structure, the volume, the layout or the use: new rooms or floors, extending the
              living space, adding a garage, enclosing a porch or veranda, digging out a
              basement, reinforcing beams or a roof. A swimming pool counts as an extension.
            </p>
            <p className="tk-para">
              Your ayuntamiento decides which category your job falls into, and municipalities
              draw the line in different places. Ask them, or have a technical architect ask,
              before you accept anybody else's view of it. A contractor who tells you no licence
              is needed is giving you an answer that was never his to give.
            </p>
            <p className="tk-para">What changes if it is obra mayor:</p>
            <ol className="tk-ol">
              <li>A technical project is required, drawn by an architect or a technical
                  architect (arquitecto tecnico), and proof of their registration goes into the
                  licence file. Your builder cannot draw it.</li>
              <li>The licence has to be granted before work starts. Processing time varies by
                  region and runs longer where the project is complex or a neighbour objects.</li>
              <li>The ayuntamiento charges fees and a construction tax on the licence. Both are
                  set municipally, so ask the town hall for the figures for your address rather
                  than working from a number you read somewhere.</li>
              <li>If the property is in a community of owners, or the work touches anything
                  communal, you need the community authorisation as well. It is issued as a
                  certificate and signed before a notary, and it may mean waiting for a meeting.</li>
              <li>At the end the architect issues the certificate of completion, the certificado
                  final de obra.</li>
              <li>If the work changed the built area, it then has to be declared before a notary
                  and entered in the land registry, so that the deeds describe the building that
                  is actually there.</li>
            </ol>
          </Panel>

          <Panel title="Why the deeds part matters later" kind="quiet">
            <p className="tk-para">
              Unlicensed work is usually invisible until you sell. At that point the notary and
              the buyer both want the extension to appear on the deeds, and a buyer's lawyer who
              finds built space that is not registered will either hold the price or hold the
              sale. There is a retrospective route through an antiquity certificate, but whether
              you qualify depends on how long ago the work was finished, the qualifying period
              differs by region and by when the work was done, and an architect has to attend to
              certify the age. It is slower and less certain than applying first, which is the
              entire argument for doing it in the right order.
            </p>
          </Panel>

          <ToolDisclaimer>
            This is practical guidance, not legal advice. It checks the quote in front of you,
            which is not the same as checking the contractor. Whether your particular job needs
            a licence, and which kind, is decided by your ayuntamiento, and for anything
            structural that answer should come from a technical architect before you sign.
          </ToolDisclaimer>
        </Result>
      )}
    </ToolShell>
  );
}
