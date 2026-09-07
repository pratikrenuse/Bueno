import { useState } from 'react';
import ToolShell, { Intro, Step, Options, Result, Panel, Rows, useCopy } from '../ToolShell.jsx';
import SourceNote, { ToolDisclaimer } from '../SourceNote.jsx';
import { rule, ruleStatus } from '../rules/index.js';
import { LLink } from '../i18n.jsx';
import registryFile from '../rules/rental-registry.json';
import copyDict from './copy.js';

// IVA on a Spanish holiday let. A router, not a calculator.
//
// The whole tool exists to correct one belief. Owners think a short let is a hotel and a
// long let is a home, so short means IVA. The law does not draw the line there. It draws
// it at what you supply and at who your customer is:
//
//   exempt              a residential let, art. 20.Uno.23
//   10 percent          accommodation with hotel-type complementary services
//   21 percent          neither of those, which in practice means you have let the
//                       property to a company that re-lets it on its own account
//
// The single most useful sentence in this tool is that a changeover clean between
// bookings is not a hotel-type service, and cleaning during the stay is. That one
// distinction moves an owner between exempt and 10 percent, and it is the one they get
// wrong.
//
// The second thing this tool must not do is repeat the 21 percent story. A rise to
// 21 percent on tourist lets has been proposed and has not been enacted. One of the
// articles this site grew out of implies otherwise. See the note on vat.letting.

const RATE = rule('vat.letting');

// The annulment is deliberately not readable through rule(). Its status is "annulled", and
// rule() throws on that so an annulled figure can never be rendered as if it were live.
// That guard is right, and this tool is the case it was written for: the annulment is not
// a value we are quoting, it is the reason a requirement no longer exists.
//
// So we check the status through the one reader that does not throw, and take the source
// metadata from the file itself. If the status ever changes back, the check below falls
// through to the ordinary SourceNote rather than silently keeping this hand-rolled copy.
const REGISTRY_STATUS = ruleStatus('registry.annulled');
const ANNULMENT = (registryFile.rules || []).find(r => r.id === 'registry.annulled');

const STEPS = ['services', 'sublease', 'stay'];

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Same markup as SourceNote, rendered by hand because the rule behind it is annulled and
// must not be fetched through rule(). Kept visually identical so the reader sees no
// difference between a source we can quote and one we have to explain.
function AnnulledSource({ r, label }) {
  if (!r) return null;
  return (
    <div className="tk-source">
      <span className="tk-source-label">{label || 'Source'}</span>
      <ul className="tk-source-list">
        <li>
          <a href={r.source.url} target="_blank" rel="noopener noreferrer">{r.source.ref}</a>
          <span className="tk-source-meta">{r.source.name}. Checked {fmtDate(r.source.read_on)}.</span>
        </li>
      </ul>
    </div>
  );
}

export default function RentalVat() {
  const c = useCopy(copyDict);
  const [step, setStep] = useState('intro');
  const [a, setA] = useState({ services: '', sublease: '', stay: '' });

  const idx = STEPS.indexOf(step);
  const progress = step === 'intro' ? 0 : step === 'result' ? 100 : ((idx + 1) / STEPS.length) * 100;

  const advance = (k, v) => {
    setA(p => ({ ...p, [k]: v }));
    const i = STEPS.indexOf(k);
    setTimeout(() => setStep(STEPS[i + 1] || 'result'), 150);
  };
  const back = () => setStep(idx <= 0 ? 'intro' : STEPS[idx - 1]);
  const restart = () => { setA({ services: '', sublease: '', stay: '' }); setStep('intro'); };

  const opt = (k, n) => ({ value: k, label: c(`${n}_${k}`), desc: c(`${n}_${k}_d`) === `${n}_${k}_d` ? null : c(`${n}_${k}_d`) });

  // --- the routing decision -------------------------------------------------
  // Order matters. The sublease question is asked second but decided first, because it
  // changes who your customer is. If a company takes the property and re-lets it, your
  // supply is to that company, and it is neither a residential let nor accommodation.
  const route = () => {
    if (a.sublease === 'yes') return 'twentyone';
    if (a.services === 'hotel') return 'ten';
    if (a.sublease === 'unsure') return 'exempt_check';
    return 'exempt';
  };
  const verdict = route();

  const bandPercent = {
    exempt: RATE.value.exempt,
    exempt_check: RATE.value.exempt,
    ten: RATE.value.with_hotel_services,
    twentyone: RATE.value.other,
  }[verdict];

  const bandLabel = verdict === 'exempt' || verdict === 'exempt_check'
    ? `Exempt, ${RATE.value.exempt} percent`
    : `${bandPercent} percent`;

  const headline = {
    exempt: c('result_exempt'),
    exempt_check: c('result_exempt_check'),
    ten: c('result_ten'),
    twentyone: c('result_twentyone'),
  }[verdict];

  const tone = verdict === 'twentyone' ? 'warn' : verdict === 'ten' ? 'neutral' : 'good';

  const sub = {
    exempt: 'A residential let is exempt from IVA. You do not add it to the rent, you do not file for it, and you cannot recover the IVA on what you spend on the property.',
    exempt_check: 'On what you have told us the let is exempt. The one thing that would change that is the agreement you are unsure about, so it is worth reading before you file anything.',
    ten: 'What you are supplying is accommodation with services, not a bare letting. That is the same treatment a guest house gets, and it is what the services during the stay create.',
    twentyone: 'Your customer is the company, not the guest. That supply is neither an exempt residential let nor an accommodation service, so it falls to the general rate.',
  }[verdict];

  return (
    <ToolShell title={c('headline')} progress={step === 'intro' ? null : progress}
      note="Guidance for property owners in Spain. Not tax advice.">

      {step === 'intro' && (
        <Intro eyebrow={c('eyebrow')} headline={c('headline')} body={c('body')}
          points={c('points')} cta={c('cta')} minutes={c('minutes')}
          onStart={() => setStep('services')} />
      )}

      {step === 'services' && (
        <Step n={1} of={STEPS.length} question={c('q_services')} hint={c('q_services_hint')}>
          <Options items={['hotel', 'changeover', 'none'].map(k => opt(k, 'services'))}
            value={a.services} onChange={v => advance('services', v)} />
        </Step>
      )}

      {step === 'sublease' && (
        <Step n={2} of={STEPS.length} question={c('q_sublease')} hint={c('q_sublease_hint')} onBack={back}>
          <Options items={['yes', 'no', 'unsure'].map(k => opt(k, 'sublease'))}
            value={a.sublease} onChange={v => advance('sublease', v)} />
        </Step>
      )}

      {step === 'stay' && (
        <Step n={3} of={STEPS.length} question={c('q_stay')} hint={c('q_stay_hint')} onBack={back}>
          <Options items={['nights', 'weeks', 'months', 'mixed'].map(k => opt(k, 'stay'))}
            value={a.stay} onChange={v => advance('stay', v)} />
        </Step>
      )}

      {step === 'result' && (
        <Result headline={headline} sub={sub} tone={tone} onRestart={restart} restartLabel={c('restart')}>

          <Panel title="Your band" kind="key">
            <Rows items={[
              { label: 'IVA on what you charge', value: bandLabel, strong: true },
              { label: 'What decided it', value: verdict === 'twentyone' ? 'Who your customer is' : verdict === 'ten' ? 'Services during the stay' : 'A bare letting, no services during the stay' },
            ]} />
            <SourceNote ids="vat.letting" />
          </Panel>

          <Panel title="Why" kind="plain">
            {verdict === 'exempt' && (
              <p className="tk-para">
                Letting a dwelling is exempt from IVA. The exemption is lost when you start
                supplying the things a hotel supplies: a reception, cleaning while the guests
                are in the property, changing the linen mid-stay, meals, laundry. Cleaning the
                property between one booking and the next is not one of those. It is how you
                get the property ready to let, not a service you give the guest during the
                stay, and it does not move you out of the exemption on its own.
              </p>
            )}
            {verdict === 'exempt_check' && (
              <p className="tk-para">
                Letting a dwelling is exempt. What would take you out of that exemption is not
                the cleaning or the bookings, it is a contract in which you let the property to
                a company so that the company can let it on again. Find the agreement and look
                at who the guest is contracting with. If the guest contracts with you, the
                exemption holds.
              </p>
            )}
            {verdict === 'ten' && (
              <p className="tk-para">
                You told us somebody goes into the property while guests are staying there.
                That is what the law means by hotel-type complementary services, and it turns
                a letting into an accommodation service. The rate is the reduced one, the same
                band hotels and guest houses sit in. Note the direction of travel: it is the
                service during the stay that does this, not the changeover clean and not the
                length of the booking.
              </p>
            )}
            {verdict === 'twentyone' && (
              <p className="tk-para">
                When you let the property to a company that then lets it out itself, the
                exemption for residential letting does not reach you, because your tenant is
                not living there. Nor are you supplying accommodation to a guest. What is left
                is the general rate. This catches owners on full-management arrangements who
                never realised the contract they signed was a sublease.
              </p>
            )}
          </Panel>

          <Panel title="What would move you into the next band">
            <ul className="tk-ol">
              {verdict !== 'ten' && verdict !== 'twentyone' && (
                <li>
                  <strong>Into {RATE.value.with_hotel_services} percent:</strong> starting to
                  supply something during the stay. A mid-week clean, a linen change halfway
                  through, breakfast, a laundry service, a staffed reception. One of them is
                  enough to change the question.
                </li>
              )}
              {verdict !== 'twentyone' && (
                <li>
                  <strong>Into {RATE.value.other} percent:</strong> signing the property over to
                  a company that re-lets it in its own name. Read any full-management contract
                  with that in mind before you sign it.
                </li>
              )}
              {verdict === 'ten' && (
                <li>
                  <strong>Back to exempt:</strong> stopping the services during the stay. A
                  changeover clean between bookings on its own does not keep you at
                  {' '}{RATE.value.with_hotel_services} percent.
                </li>
              )}
              {verdict === 'twentyone' && (
                <li>
                  <strong>Out of {RATE.value.other} percent:</strong> letting to the guest
                  directly rather than through a company that re-lets. Where you go from there
                  depends on whether you supply services during the stay.
                </li>
              )}
            </ul>
            <SourceNote ids="vat.letting" />
          </Panel>

          <Panel title="What the length of the stay actually decides" kind="quiet">
            <p className="tk-para">
              Nothing in the two articles behind this answer turns on how long a guest stays.
              The bands turn on what you supply and on who your customer is, and that is why
              this tool asked about the stay length last and then did not use it. You told us
              guests stay {c(`stay_${a.stay}`).toLowerCase()}.
            </p>
            <p className="tk-para">
              Where the length does matter is elsewhere. It helps decide whether you are letting
              by season, which sits under the rental law, or letting to tourists, which sits
              outside it and under your region's tourism rules. That boundary is drawn by
              regional law and by how the property is marketed, not by a number of nights
              written into national law. We do not hold a verified national definition of a
              short-term let, so this tool does not give you one.
            </p>
            <SourceNote ids={['lau.seasonal_basis', 'lau.tourist_excluded']} />
          </Panel>

          <Panel title="About the 21 percent you may have read about">
            <p className="tk-para">
              There has been a great deal written about IVA on tourist lets going to
              {' '}{RATE.value.other} percent. It is a proposal. Nothing has been enacted, and no
              change to the IVA treatment of short-term letting has taken effect. If you have
              read that the rate is rising and you should prepare for it, that article is ahead
              of the law. The bands above are the ones in force on the date shown.
            </p>
            <p className="tk-para">
              The one route into {RATE.value.other} percent that is real today is the one in this
              tool: letting the property to somebody who re-lets it.
            </p>
            <SourceNote ids="vat.letting" />
          </Panel>

          {REGISTRY_STATUS === 'annulled' ? (
            <Panel title="The national registration number is no longer a state requirement" kind="dark">
              <p className="tk-para">
                {ANNULMENT ? ANNULMENT.statement : ''} The Tribunal Supremo struck down the
                procedure on the ground that the State had no competence to create it, and the
                consolidated decree on the official gazette was updated to reflect that.
              </p>
              <p className="tk-para">
                What still binds you is the regional licence or registration for tourist
                letting. That was untouched by the judgments and remains fully in force. It
                varies by region and increasingly by municipality, so the register to check is
                your region's, not a national one. Two honest cautions. Platforms may still be
                asking you for a national number in practice, and the ministry's own pages had
                not been updated when we read them. The digital single window and the duties on
                platforms to share data survive the annulments, so the reporting side of this
                has not gone away.
              </p>
              <AnnulledSource r={ANNULMENT} label="Why we can say this" />
              <SourceNote ids={['registry.regional_unaffected', 'registry.survives']} label="What still applies" />
            </Panel>
          ) : (
            <Panel title="The national registration number" kind="dark">
              <p className="tk-para">
                The position on the national registration procedure has changed since this tool
                was written. Check the source below before acting on anything you have read
                about it.
              </p>
              <SourceNote ids={['registry.regional_unaffected', 'registry.survives']} />
            </Panel>
          )}

          <Panel title="Three separate questions, and this tool answered one" kind="quiet">
            <p className="tk-para">
              IVA, income tax and your licence are decided by three different sets of rules,
              and an answer to one tells you nothing about the other two. Being exempt from IVA
              does not mean there is no tax to pay. Holding a regional licence does not put you
              in a different IVA band.
            </p>
            <ol className="tk-ol">
              <li>
                <strong>IVA.</strong> Answered above. It is about what you supply and who your
                customer is.
              </li>
              <li>
                <strong>Income tax.</strong> Rent received by a non-resident owner is taxed
                separately, on a return of its own, with its own deadline. Our{' '}
                <LLink to="/rental-tax">rental income tax calculator</LLink> works that out.
              </li>
              <li>
                <strong>The licence.</strong> Regional, and increasingly municipal. There is no
                national tool to point you at because there is no longer a national requirement.
                Start with your region's tourist register, then check the town hall, and check
                your community of owners as well.
              </li>
            </ol>
          </Panel>

          <ToolDisclaimer />
        </Result>
      )}
    </ToolShell>
  );
}
