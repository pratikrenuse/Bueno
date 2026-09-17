import { useMemo, useState } from 'react';
import ToolShell, { Intro, Step, Options, Result, Panel, Rows, useCopy } from '../ToolShell.jsx';
import SourceNote, { ToolDisclaimer } from '../SourceNote.jsx';
import { useLocale } from '../i18n.jsx';
import { rule } from '../rules/index.js';
import { useBrandProfile, BrandHeader, BrandSignature, hasProfile } from '../BrandProfile.jsx';
import copyDict from './copy.js';
import { buildDeal, DOC_LANGS } from './list.js';
import { buildLetter, LETTER_LANGS, LETTER_LANG_LABELS, DATE_LOCALE } from './letter.js';

// Sale readiness checklist, for agents and lawyers.
//
// Every figure is read from the rules base here and handed to list.js and letter.js, which
// contain no legal numbers of their own. A rule that stops being verified makes rule()
// throw, which fails the build rather than printing a stale rate.
const RET = rule('irnr.sale.retention').value;
const W210 = rule('deadline.210.sale').value;
const R = {
  retentionRate: RET.rate,
  retentionMonths: RET.deadline_months,
  saleOpensMonths: W210.opens_months_after,
  saleWindowMonths: W210.window_months,
  plusvaliaWorkingDays: rule('plusvalia.deadlines').value.sale_working_days,
  ivaNewBuild: rule('vat.newbuild.mainland').value,
  igicGeneral: rule('igic.canarias').value.general,
};

const EMPTY = {
  side: '', seller: '', buyer: '', property: '', region: '', finance: '',
  nie: '', account: '', signing: '',
  clientName: '', propertyRef: '', completion: '', recipient: 'buyer',
};

function dateFormatter(lang) {
  const f = new Intl.DateTimeFormat(DATE_LOCALE[lang] || 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  return iso => (iso ? f.format(new Date(`${iso}T12:00:00Z`)) : '');
}

function Choice({ label, value, onChange, items }) {
  return (
    <div className="dc-choice">
      <p className="tk-label">{label}</p>
      <div className="dc-choice-row" role="radiogroup" aria-label={label}>
        {items.map(i => (
          <button key={i.value} type="button" role="radio" aria-checked={value === i.value}
            className={`dc-pill${value === i.value ? ' selected' : ''}`} onClick={() => onChange(i.value)}>
            {i.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DealChecklist() {
  const c = useCopy(copyDict);
  const { locale } = useLocale();
  const { profile } = useBrandProfile();
  const [step, setStep] = useState('intro');
  const [a, setA] = useState(EMPTY);
  const [docLang, setDocLang] = useState('en');
  const [letterLang, setLetterLang] = useState(LETTER_LANGS.includes(locale) ? locale : 'en');
  const [done, setDone] = useState({});
  const [copied, setCopied] = useState(false);

  const steps = useMemo(() => [
    'side', 'seller',
    ...(a.side !== 'seller' ? ['buyer'] : []),
    'property',
    ...(a.property === 'newbuild' ? ['region'] : []),
    'finance',
    ...(a.side !== 'seller' ? ['papers'] : []),
    'signing', 'details',
  ], [a.side, a.property]);

  const idx = steps.indexOf(step);
  const progress = step === 'intro' ? null : step === 'result' ? 100 : ((idx + 1) / steps.length) * 100;
  const set = (k, v) => setA(p => ({ ...p, [k]: v }));
  const go = (from) => {
    const list = steps;
    const i = list.indexOf(from);
    setStep(list[i + 1] || 'result');
  };
  const advance = (k, v) => {
    const next = { ...a, [k]: v };
    setA(next);
    // Recompute the path with the new answer, since two answers add or remove a screen.
    const path = [
      'side', 'seller',
      ...(next.side !== 'seller' ? ['buyer'] : []),
      'property',
      ...(next.property === 'newbuild' ? ['region'] : []),
      'finance',
      ...(next.side !== 'seller' ? ['papers'] : []),
      'signing', 'details',
    ];
    const i = path.indexOf(k);
    setTimeout(() => setStep(path[i + 1] || 'result'), 150);
  };
  const back = () => setStep(idx <= 0 ? 'intro' : steps[idx - 1]);
  const n = idx + 1;
  const of = steps.length;

  const resOpts = ['resident', 'nonresident', 'unsure'].map(v => ({ value: v, label: c(`res_${v}`) }));
  const ynu = ['yes', 'no', 'unsure'].map(v => ({ value: v, label: c(v) }));

  const docFmt = dateFormatter(docLang);
  const letterFmt = dateFormatter(letterLang);
  const deal = step === 'result' ? buildDeal(a, R, docLang, docFmt) : null;
  const letter = step === 'result' ? buildLetter(a, R, letterLang, deal.dates, letterFmt) : null;

  const letterText = letter
    ? [letter.greeting, '', ...letter.paragraphs.flatMap(p => [p, '']), letter.regards,
       ...(hasProfile(profile) ? [profile.name, profile.role, profile.firm, profile.phone, profile.email].filter(Boolean) : []),
       '', letter.note].join('\n')
    : '';

  const copyLetter = async () => {
    try { await navigator.clipboard.writeText(letterText); setCopied(true); setTimeout(() => setCopied(false), 2500); }
    catch { setCopied(false); }
  };

  const restart = () => { setA(EMPTY); setDone({}); setStep('intro'); };

  return (
    <ToolShell title={c('title')} progress={progress}
      note={c('note')}>

      {step === 'intro' && (
        <Intro eyebrow={c('eyebrow')} headline={c('headline')} body={c('body')}
          points={c('points')} cta={c('cta')} minutes={c('minutes')} onStart={() => setStep('side')} />
      )}

      {step === 'side' && (
        <Step n={n} of={of} question={c('q_side')} onBack={back}>
          <Options value={a.side} onChange={v => advance('side', v)} items={[
            { value: 'buyer', label: c('side_buyer') },
            { value: 'seller', label: c('side_seller') },
            { value: 'both', label: c('side_both'), desc: c('side_both_d') },
          ]} />
        </Step>
      )}

      {step === 'seller' && (
        <Step n={n} of={of} question={c('q_seller')} hint={c('q_seller_hint')} onBack={back}>
          <Options value={a.seller} onChange={v => advance('seller', v)} items={resOpts} />
        </Step>
      )}

      {step === 'buyer' && (
        <Step n={n} of={of} question={c('q_buyer')} hint={c('q_buyer_hint')} onBack={back}>
          <Options value={a.buyer} onChange={v => advance('buyer', v)} items={resOpts} />
        </Step>
      )}

      {step === 'property' && (
        <Step n={n} of={of} question={c('q_property')} onBack={back}>
          <Options value={a.property} onChange={v => advance('property', v)} items={[
            { value: 'resale', label: c('prop_resale') },
            { value: 'newbuild', label: c('prop_newbuild') },
          ]} />
        </Step>
      )}

      {step === 'region' && (
        <Step n={n} of={of} question={c('q_region')} hint={c('q_region_hint')} onBack={back}>
          <Options value={a.region} onChange={v => advance('region', v)} items={[
            { value: 'mainland', label: c('region_mainland') },
            { value: 'canarias', label: c('region_canarias') },
          ]} />
        </Step>
      )}

      {step === 'finance' && (
        <Step n={n} of={of} question={c('q_finance')} onBack={back}>
          <Options value={a.finance} onChange={v => advance('finance', v)} items={[
            { value: 'cash', label: c('fin_cash') },
            { value: 'mortgage', label: c('fin_mortgage') },
            { value: 'undecided', label: c('fin_undecided') },
          ]} />
        </Step>
      )}

      {step === 'papers' && (
        <Step n={n} of={of} question={c('q_papers')} hint={c('q_papers_hint')} onBack={back}
          onNext={() => go('papers')} nextDisabled={!a.nie || !a.account}>
          <Choice label={c('papers_nie')} value={a.nie} onChange={v => set('nie', v)} items={ynu} />
          <Choice label={c('papers_account')} value={a.account} onChange={v => set('account', v)} items={ynu} />
        </Step>
      )}

      {step === 'signing' && (
        <Step n={n} of={of} question={c('q_signing')} onBack={back}>
          <Options value={a.signing} onChange={v => advance('signing', v)} items={[
            { value: 'person', label: c('sign_person') },
            { value: 'poa', label: c('sign_poa') },
            { value: 'undecided', label: c('sign_undecided') },
          ]} />
        </Step>
      )}

      {step === 'details' && (
        <Step n={n} of={of} question={c('q_details')} hint={c('q_details_hint')} onBack={back}
          onNext={() => setStep('result')} nextLabel={c('build')}>
          <div className="dc-form">
            <label className="tk-field">
              <span className="tk-label">{c('f_client')}</span>
              <input className="value-input tk-input" type="text" maxLength={80} value={a.clientName}
                onChange={e => set('clientName', e.target.value)} />
            </label>
            <label className="tk-field">
              <span className="tk-label">{c('f_property')}</span>
              <input className="value-input tk-input" type="text" maxLength={120} value={a.propertyRef}
                onChange={e => set('propertyRef', e.target.value)} />
            </label>
            <label className="tk-field">
              <span className="tk-label">{c('f_date')}</span>
              <input className="value-input tk-input" type="date" value={a.completion}
                onChange={e => set('completion', e.target.value)} />
              <span className="tk-hint tk-hint-tight">{c('f_date_hint')}</span>
            </label>
            <label className="tk-field">
              <span className="tk-label">{c('f_doclang')}</span>
              <select className="value-input tk-input dc-select" value={docLang} onChange={e => setDocLang(e.target.value)}>
                {DOC_LANGS.map(l => <option key={l} value={l}>{LETTER_LANG_LABELS[l]}</option>)}
              </select>
            </label>
            <label className="tk-field">
              <span className="tk-label">{c('f_letterlang')}</span>
              <select className="value-input tk-input dc-select" value={letterLang} onChange={e => setLetterLang(e.target.value)}>
                {LETTER_LANGS.map(l => <option key={l} value={l}>{LETTER_LANG_LABELS[l]}</option>)}
              </select>
            </label>
            {a.side === 'both' && (
              <Choice label={c('f_recipient')} value={a.recipient} onChange={v => set('recipient', v)} items={[
                { value: 'buyer', label: c('rec_buyer') },
                { value: 'seller', label: c('rec_seller') },
              ]} />
            )}
          </div>
        </Step>
      )}

      {step === 'result' && deal && (
        <Result headline={c('result_headline')} sub={c('result_sub')} onRestart={restart} restartLabel={c('restart')}>
          <div className="dc-doc">
            <BrandHeader profile={profile} />
            {!hasProfile(profile) && <p className="dc-noprofile">{c('no_profile')}</p>}
            {(a.clientName || a.propertyRef || deal.dates) && (
              <p className="dc-docline">
                {[a.clientName, a.propertyRef, deal.dates ? `${c('d_completion')}: ${docFmt(deal.dates.completion)}` : null].filter(Boolean).join('  ·  ')}
              </p>
            )}

            <div className="dc-actions">
              <button type="button" className="btn-primary" onClick={() => window.print()}>{c('print')}</button>
            </div>

            <Panel title={c('missing_t')} kind="key">
              {deal.missing.length
                ? <ul className="dc-missing">{deal.missing.map(m => <li key={m}>{m}</li>)}</ul>
                : <p className="tk-para">{c('missing_none')}</p>}
            </Panel>

            {deal.dates && (
              <Panel title={c('dates_t')}>
                <Rows items={[
                  { label: c('d_completion'), value: docFmt(deal.dates.completion) },
                  a.seller !== 'resident' && { label: c('d_211'), value: docFmt(deal.dates.d211), strong: true },
                  a.seller !== 'resident' && { label: c('d_210'), value: c('d_between').replace('{a}', docFmt(deal.dates.open210)).replace('{b}', docFmt(deal.dates.close210)) },
                  { label: c('d_pv'), value: docFmt(deal.dates.pv) },
                ]} />
                <p className="tk-hint tk-hint-tight">{c('d_pv_note')}</p>
              </Panel>
            )}

            <section className="dc-list" aria-labelledby="dc-list-t">
              <h2 id="dc-list-t" className="dc-h2">{c('checklist_t')}</h2>
              {deal.groups.map(g => (
                <div key={g.key} className="dc-group">
                  <h3 className="tk-cl-title">{g.title}</h3>
                  <ul className="tk-cl-items">
                    {g.items.map((it, i) => {
                      const k = `${g.key}-${i}`;
                      return (
                        <li key={k} className={done[k] ? 'is-done' : ''}>
                          <label>
                            <input type="checkbox" checked={!!done[k]} onChange={() => setDone(d => ({ ...d, [k]: !d[k] }))} />
                            <span className="tk-cl-text">
                              {it.text}
                              <span className="dc-who">{it.who.map(w => <span key={w} className="dc-who-tag">{w}</span>)}</span>
                              {it.why && <span className="tk-cl-why">{it.why}</span>}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </section>

            {deal.rules.length > 0 && (
              <Panel title={c('sources_t')} kind="plain">
                <SourceNote ids={deal.rules} />
              </Panel>
            )}

            <section className="dc-letter" aria-labelledby="dc-letter-t">
              <div className="dc-letter-head">
                <div>
                  <h2 id="dc-letter-t" className="dc-h2">{c('letter_t')}</h2>
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

            <ToolDisclaimer>{c('disclaimer')}</ToolDisclaimer>
          </div>
        </Result>
      )}
    </ToolShell>
  );
}
