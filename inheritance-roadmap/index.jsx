import { useState } from 'react';
import ToolShell, { Intro, Step, Options, Result, Panel, useCopy } from '../ToolShell.jsx';
import SourceNote, { ToolDisclaimer } from '../SourceNote.jsx';
import { useLocale } from '../i18n.jsx';
import { rule, itpResale } from '../rules/index.js';
import { useBrandProfile, BrandHeader, BrandSignature, hasProfile } from '../BrandProfile.jsx';
import { LETTER_LANGS, LETTER_LANG_LABELS, DATE_LOCALE } from '../deal-checklist/letter.js';
import { REGION_LABEL } from '../purchase-costs/handout.js';
import copyDict from './copy.js';
import { buildRoadmap, DOC_LANGS } from './roadmap.js';
import { buildHeirLetter } from './letter.js';

// Inheritance roadmap, for lawyers and the families they advise.
//
// Every period and rate comes from the rules base. The civil law rules are read here too,
// even where only their words are used, so that a change of status stops the build.
const ISD_DL = rule('isd.deadlines').value;
const PV_DL = rule('plusvalia.deadlines').value;
const SCALE = rule('isd.state_scale').value;
const FORAL = rule('succession.foral').value;
['succession.eu_election', 'succession.legitima', 'succession.spouse_usufruct', 'succession.gananciales_first',
  'isd.nonresident_option', 'isd.nonresident_which_region'].forEach(id => rule(id));

const R = {
  isdMonths: ISD_DL.death_months,
  isdExtension: ISD_DL.extension_months,
  pvMonths: PV_DL.death_months,
  pvExtendTo: PV_DL.extension_to_months,
  stateBottom: SCALE.bottom,
  stateTop: SCALE.top,
  foral: FORAL.map(x => ({ Aragon: 'Aragón', Cataluna: 'Cataluña', 'Pais Vasco': 'País Vasco' }[x] || x)),
};

const REGIONS = itpResale.map(r => r.region).sort((a, b) => (REGION_LABEL[a] || a).localeCompare(REGION_LABEL[b] || b));
const regionLabel = k => REGION_LABEL[k] || k;

const EMPTY = { residence: '', deceasedRegion: '', nationality: '', choice: '', heirs: '', assetsRegion: '', married: '', death: '', clientName: '' };

function pathFor(a) {
  return [
    'residence',
    ...(a.residence === 'spain' ? ['deceasedRegion'] : []),
    'nationality',
    ...(a.nationality === 'other' ? ['choice'] : []),
    'heirs',
    ...(a.residence === 'abroad' && a.heirs !== 'spain' ? ['assetsRegion'] : []),
    'married', 'details',
  ];
}

function dateFmt(lang) {
  const f = new Intl.DateTimeFormat(DATE_LOCALE[lang] || 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  return iso => (iso ? f.format(new Date(`${iso}T12:00:00Z`)) : '');
}

function RegionPick({ value, onChange, placeholder, onNext, label }) {
  return (
    <>
      <select className="value-input tk-input dc-select" aria-label={label} value={value} onChange={e => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        {REGIONS.map(r => <option key={r} value={r}>{regionLabel(r)}</option>)}
      </select>
      {onNext}
    </>
  );
}

export default function InheritanceRoadmap() {
  const c = useCopy(copyDict);
  const { locale } = useLocale();
  const { profile } = useBrandProfile();
  const [step, setStep] = useState('intro');
  const [a, setA] = useState(EMPTY);
  const [docLang, setDocLang] = useState('en');
  const [letterLang, setLetterLang] = useState(LETTER_LANGS.includes(locale) ? locale : 'en');
  const [copied, setCopied] = useState(false);

  const path = pathFor(a);
  const idx = path.indexOf(step);
  const progress = step === 'intro' ? null : step === 'result' ? 100 : ((idx + 1) / path.length) * 100;
  const set = (k, v) => setA(p => ({ ...p, [k]: v }));
  const next = (k, patch) => {
    const na = { ...a, ...patch };
    if (patch.nationality === 'spanish') na.choice = 'no';
    setA(na);
    const p = pathFor(na);
    setTimeout(() => setStep(p[p.indexOf(k) + 1] || 'result'), 150);
  };
  const back = () => setStep(idx <= 0 ? 'intro' : path[idx - 1]);
  const S = { n: idx + 1, of: path.length, onBack: back };
  const opts = (keys, prefix) => keys.map(k => ({ value: k, label: c(`${prefix}${k}`) }));

  const road = step === 'result' ? buildRoadmap(a, R, docLang, dateFmt(docLang), regionLabel) : null;
  const letter = road ? buildHeirLetter(a, R, road, letterLang, dateFmt(letterLang), regionLabel) : null;
  const letterText = letter ? [letter.greeting, '', ...letter.paragraphs.flatMap(p => [p, '']), letter.regards,
    ...(hasProfile(profile) ? [profile.name, profile.role, profile.firm, profile.phone, profile.email].filter(Boolean) : []), '', letter.note].join('\n') : '';
  const copyLetter = async () => {
    try { await navigator.clipboard.writeText(letterText); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { /* clipboard unavailable */ }
  };

  return (
    <ToolShell title={c('title')} note={c('note')} progress={progress}>
      {step === 'intro' && (
        <Intro eyebrow={c('eyebrow')} headline={c('headline')} body={c('body')} points={c('points')}
          cta={c('cta')} minutes={c('minutes')} onStart={() => setStep('residence')} />
      )}

      {step === 'residence' && (
        <Step {...S} question={c('q_residence')} hint={c('q_residence_hint')}>
          <Options value={a.residence} onChange={v => next('residence', { residence: v })} items={opts(['spain', 'abroad'], 'res_')} />
        </Step>
      )}

      {step === 'deceasedRegion' && (
        <Step {...S} question={c('q_deceased_region')} onNext={() => next('deceasedRegion', {})} nextDisabled={!a.deceasedRegion}>
          <RegionPick label={c('q_deceased_region')} value={a.deceasedRegion} onChange={v => set('deceasedRegion', v)} placeholder={c('region_ph')} />
        </Step>
      )}

      {step === 'nationality' && (
        <Step {...S} question={c('q_nationality')}>
          <Options value={a.nationality} onChange={v => next('nationality', { nationality: v })} items={opts(['spanish', 'other'], 'nat_')} />
        </Step>
      )}

      {step === 'choice' && (
        <Step {...S} question={c('q_choice')} hint={c('q_choice_hint')}>
          <Options value={a.choice} onChange={v => next('choice', { choice: v })} items={opts(['yes', 'no', 'nowill', 'unsure'], 'ch_')} />
        </Step>
      )}

      {step === 'heirs' && (
        <Step {...S} question={c('q_heirs')}>
          <Options value={a.heirs} onChange={v => next('heirs', { heirs: v })} items={opts(['spain', 'abroad', 'mixed'], 'heirs_')} />
        </Step>
      )}

      {step === 'assetsRegion' && (
        <Step {...S} question={c('q_assets_region')} hint={c('q_assets_region_hint')} onNext={() => next('assetsRegion', {})} nextDisabled={!a.assetsRegion}>
          <RegionPick label={c('q_assets_region')} value={a.assetsRegion} onChange={v => set('assetsRegion', v)} placeholder={c('region_ph')} />
        </Step>
      )}

      {step === 'married' && (
        <Step {...S} question={c('q_married')}>
          <Options value={a.married} onChange={v => next('married', { married: v })} items={[{ value: 'yes', label: c('yes') }, { value: 'no', label: c('no') }]} />
        </Step>
      )}

      {step === 'details' && (
        <Step {...S} question={c('q_details')} hint={c('q_details_hint')} onNext={() => setStep('result')} nextLabel={c('build')}>
          <div className="dc-form">
            <label className="tk-field"><span className="tk-label">{c('f_death')}</span>
              <input className="value-input tk-input" type="date" value={a.death} onChange={e => set('death', e.target.value)} /></label>
            <label className="tk-field"><span className="tk-label">{c('f_client')}</span>
              <input className="value-input tk-input" maxLength={80} value={a.clientName} onChange={e => set('clientName', e.target.value)} /></label>
            <label className="tk-field"><span className="tk-label">{c('f_doclang')}</span>
              <select className="value-input tk-input dc-select" value={docLang} onChange={e => setDocLang(e.target.value)}>
                {DOC_LANGS.map(l => <option key={l} value={l}>{LETTER_LANG_LABELS[l]}</option>)}
              </select></label>
            <label className="tk-field"><span className="tk-label">{c('f_letterlang')}</span>
              <select className="value-input tk-input dc-select" value={letterLang} onChange={e => setLetterLang(e.target.value)}>
                {LETTER_LANGS.map(l => <option key={l} value={l}>{LETTER_LANG_LABELS[l]}</option>)}
              </select></label>
          </div>
        </Step>
      )}

      {step === 'result' && road && (
        <Result headline={c('result_headline')} sub={c('result_sub')} onRestart={() => { setA(EMPTY); setStep('intro'); }} restartLabel={c('restart')}>
          <div className="dc-doc">
            <BrandHeader profile={profile} />
            {!hasProfile(profile) && <p className="dc-noprofile">{c('no_profile')}</p>}
            <div className="dc-actions"><button type="button" className="btn-primary" onClick={() => window.print()}>{c('print')}</button></div>

            {road.sections.map(s => (
              <Panel key={s.key} title={s.title} kind={s.key === 'law' ? 'key' : 'quiet'}>
                {s.lines.map((l, i) => <p key={i} className="tk-para ir-line">{l}</p>)}
              </Panel>
            ))}

            <section className="dc-list">
              <h2 className="dc-h2">{road.docsTitle}</h2>
              <ol className="ir-docs">
                {road.docs.map((d, i) => (
                  <li key={i}>
                    <span className="tk-cl-text">{d.text}</span>
                    <span className="dc-who">{d.who.map(w => <span key={w} className="dc-who-tag">{w}</span>)}</span>
                  </li>
                ))}
              </ol>
            </section>

            <Panel title={c('sources_t')} kind="plain"><SourceNote ids={road.rules} /></Panel>

            <section className="dc-letter">
              <div className="dc-letter-head">
                <div>
                  <h2 className="dc-h2">{c('letter_t')}</h2>
                  <p className="tk-hint tk-hint-tight">{c('letter_hint')}</p>
                </div>
                <button type="button" className="btn-back dc-copy" onClick={copyLetter}>{copied ? c('copied') : c('copy_letter')}</button>
              </div>
              <article className="dc-letter-body" lang={letterLang}>
                <div className="dc-print-only"><BrandHeader profile={profile} /></div>
                <p>{letter.greeting}</p>
                {letter.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
                <p>{letter.regards}</p>
                <BrandSignature profile={profile} />
                <p className="dc-letter-note">{letter.note}</p>
              </article>
            </section>
            <ToolDisclaimer>{c('note')}</ToolDisclaimer>
          </div>
        </Result>
      )}
    </ToolShell>
  );
}
