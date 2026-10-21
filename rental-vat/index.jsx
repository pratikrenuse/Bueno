import { useState } from 'react';
import ToolShell, { Intro, Step, Options, Result, Panel, Rows, useCopy } from '../ToolShell.jsx';
import SourceNote, { ToolDisclaimer } from '../SourceNote.jsx';
import { rule, ruleStatus } from '../rules/index.js';
import { LLink, useLocale } from '../i18n.jsx';
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

const DATE_LOCALES = { en: 'en-GB', no: 'nb-NO', sv: 'sv-SE', de: 'de-DE', fr: 'fr-FR', nl: 'nl-NL' };

// Fills {name} placeholders in a copy string.
const fill = (s, vars = {}) => String(s).replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));

function fmtDate(iso, locale) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(DATE_LOCALES[locale] || 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Same markup as SourceNote, rendered by hand because the rule behind it is annulled and
// must not be fetched through rule(). Kept visually identical so the reader sees no
// difference between a source we can quote and one we have to explain.
function AnnulledSource({ r, label, checked, locale }) {
  if (!r) return null;
  return (
    <div className="tk-source">
      <span className="tk-source-label">{label}</span>
      <ul className="tk-source-list">
        <li>
          <a href={r.source.url} target="_blank" rel="noopener noreferrer">{r.source.ref}</a>
          <span className="tk-source-meta">{fill(checked, { name: r.source.name, date: fmtDate(r.source.read_on, locale) })}</span>
        </li>
      </ul>
    </div>
  );
}

export default function RentalVat() {
  const c = useCopy(copyDict);
  const { locale } = useLocale();
  const f = (k, vars) => fill(c(k), vars);
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
    ? f('band_exempt', { rate: RATE.value.exempt })
    : f('band_rate', { rate: bandPercent });

  const headline = {
    exempt: c('result_exempt'),
    exempt_check: c('result_exempt_check'),
    ten: c('result_ten'),
    twentyone: c('result_twentyone'),
  }[verdict];

  const tone = verdict === 'twentyone' ? 'warn' : verdict === 'ten' ? 'neutral' : 'good';

  const sub = c(`sub_${verdict}`);

  const src = c('source_label');
  const hotel = RATE.value.with_hotel_services;
  const other = RATE.value.other;

  return (
    <ToolShell title={c('headline')} progress={step === 'intro' ? null : progress}
      note={c('note')}>

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

          <Panel title={c('panel_band')} kind="key">
            <Rows items={[
              { label: c('row_iva'), value: bandLabel, strong: true },
              { label: c('row_decided'), value: verdict === 'twentyone' ? c('decided_twentyone') : verdict === 'ten' ? c('decided_ten') : c('decided_exempt') },
            ]} />
            <SourceNote ids="vat.letting" label={src} />
          </Panel>

          <Panel title={c('panel_why')} kind="plain">
            <p className="tk-para">{c(`why_${verdict}`)}</p>
          </Panel>

          <Panel title={c('panel_next')}>
            <ul className="tk-ol">
              {verdict !== 'ten' && verdict !== 'twentyone' && (
                <li>
                  <strong>{f('next_ten_lead', { rate: hotel })}</strong> {f('next_ten_body', { rate: hotel })}
                </li>
              )}
              {verdict !== 'twentyone' && (
                <li>
                  <strong>{f('next_21_lead', { rate: other })}</strong> {f('next_21_body', { rate: other })}
                </li>
              )}
              {verdict === 'ten' && (
                <li>
                  <strong>{f('next_back_lead', { rate: hotel })}</strong> {f('next_back_body', { rate: hotel })}
                </li>
              )}
              {verdict === 'twentyone' && (
                <li>
                  <strong>{f('next_out_lead', { rate: other })}</strong> {f('next_out_body', { rate: other })}
                </li>
              )}
            </ul>
            <SourceNote ids="vat.letting" label={src} />
          </Panel>

          <Panel title={c('panel_length')} kind="quiet">
            <p className="tk-para">
              {c('length_p1')} {c(`length_told.${a.stay}`) === `length_told.${a.stay}` ? '' : c(`length_told.${a.stay}`)}
            </p>
            <p className="tk-para">{c('length_p2')}</p>
            <SourceNote ids={['lau.seasonal_basis', 'lau.tourist_excluded']} label={src} />
          </Panel>

          <Panel title={f('panel_21', { rate: other })}>
            <p className="tk-para">{f('p21_1', { rate: other })}</p>
            <p className="tk-para">{f('p21_2', { rate: other })}</p>
            <SourceNote ids="vat.letting" label={src} />
          </Panel>

          {REGISTRY_STATUS === 'annulled' ? (
            <Panel title={c('panel_annulled')} kind="dark">
              <p className="tk-para">
                {ANNULMENT ? c('annulled_statement') : ''} {c('annulled_p1')}
              </p>
              <p className="tk-para">{c('annulled_p2')}</p>
              <AnnulledSource r={ANNULMENT} label={c('annulled_why_label')} checked={c('checked')} locale={locale} />
              <SourceNote ids={['registry.regional_unaffected', 'registry.survives']} label={c('still_applies_label')} />
            </Panel>
          ) : (
            <Panel title={c('panel_registry_changed')} kind="dark">
              <p className="tk-para">{c('registry_changed_p')}</p>
              <SourceNote ids={['registry.regional_unaffected', 'registry.survives']} label={src} />
            </Panel>
          )}

          <Panel title={c('panel_three')} kind="quiet">
            <p className="tk-para">{c('three_intro')}</p>
            <ol className="tk-ol">
              <li>
                <strong>{c('three_iva_lead')}</strong> {c('three_iva_body')}
              </li>
              <li>
                <strong>{c('three_income_lead')}</strong> {c('three_income_pre')}{' '}
                <LLink to="/rental-tax">{c('three_income_link')}</LLink> {c('three_income_post')}
              </li>
              <li>
                <strong>{c('three_licence_lead')}</strong> {c('three_licence_body')}
              </li>
            </ol>
          </Panel>

          <ToolDisclaimer>{c('disclaimer')}</ToolDisclaimer>
        </Result>
      )}
    </ToolShell>
  );
}
