import { useState } from 'react';
import ToolShell, { Intro, Panel, useCopy } from '../ToolShell.jsx';
import SourceNote, { ToolDisclaimer } from '../SourceNote.jsx';
import { rule } from '../rules/index.js';
import { useBrandProfile, BrandHeader, hasProfile } from '../BrandProfile.jsx';
import { LETTER_LANG_LABELS } from '../deal-checklist/letter.js';
import copyDict from './copy.js';
import { assess, inScope, DOC, DOC_LANGS, FLAG_KEYS, FUNDS_KEYS, PAYMENT_KEYS, fill } from './aml.js';

// Client due diligence file for estate agents.
//
// The thresholds and the retention period come from rules/professional.json. The page
// renders the source of every duty it states.
const SCOPE = rule('aml.obliged_agents').value;
const BO = rule('aml.beneficial_owner').value.ownership_pct;
const YEARS = rule('aml.retention').value.years;
['aml.sepblac_agents', 'aml.identification', 'aml.pep', 'aml.reporting'].forEach(id => rule(id));
const R = { leaseMonthly: SCOPE.lease_monthly_eur, leaseAnnual: SCOPE.lease_annual_eur };
const RULE_IDS = ['aml.obliged_agents', 'aml.sepblac_agents', 'aml.identification', 'aml.beneficial_owner', 'aml.pep', 'aml.reporting', 'aml.retention'];

const START = {
  op: 'sale', rent: '', side: 'buyer', clientName: '', property: '', clientType: 'person',
  idChecked: '', bo: '', pep: '', funds: '', fundsEvidence: '', payment: '', flags: [], by: '',
};

function Pills({ label, value, onChange, items }) {
  return (
    <div className="dc-choice">
      <p className="tk-label">{label}</p>
      <div className="dc-choice-row" role="radiogroup" aria-label={label}>
        {items.map(i => (
          <button key={i.value} type="button" role="radio" aria-checked={value === i.value}
            className={`dc-pill${value === i.value ? ' selected' : ''}`} onClick={() => onChange(i.value)}>{i.label}</button>
        ))}
      </div>
    </div>
  );
}

export default function AmlFile() {
  const c = useCopy(copyDict);
  const { profile } = useBrandProfile();
  const [started, setStarted] = useState(false);
  const [a, setA] = useState(START);
  const [lang, setLang] = useState('en');
  const set = (k, v) => setA(p => ({ ...p, [k]: v }));
  const toggleFlag = k => setA(p => ({ ...p, flags: p.flags.includes(k) ? p.flags.filter(x => x !== k) : [...p.flags, k] }));
  const yn = [{ value: 'yes', label: c('yes') }, { value: 'no', label: c('no') }];

  const res = assess(a, R);
  const D = DOC[lang];
  const today = new Date().toISOString().slice(0, 10);
  const answered = a.idChecked && a.pep && a.funds && a.fundsEvidence && a.payment && (a.clientType !== 'company' || a.bo);
  const scoped = inScope(a, R);
  const tone = { standard: 'good', enhanced: 'warn', stop: 'warn', out_of_scope: 'neutral' }[res.verdict];

  const checkVal = v => (v === 'yes' ? D.yes : v === 'no' ? D.no : D.unknown);

  return (
    <ToolShell title={c('title')} note={c('note')}>
      {!started && (
        <Intro eyebrow={c('eyebrow')} headline={c('headline')} body={c('body')} points={c('points')}
          cta={c('cta')} minutes={c('minutes')} onStart={() => setStarted(true)} />
      )}

      {started && (
        <div className="step-inner sp-form">
          <h1 className="tk-intro-headline sp-form-title">{c('title')}</h1>

          <fieldset className="sp-set">
            <legend className="sp-legend">{c('s_op')}</legend>
            <Pills label={c('f_op')} value={a.op} onChange={v => set('op', v)} items={[{ value: 'sale', label: c('op_sale') }, { value: 'lease', label: c('op_lease') }]} />
            {a.op === 'lease' && (
              <label className="tk-field sp-field"><span className="tk-label">{c('f_rent')}</span>
                <input className="value-input tk-input" type="number" min="0" inputMode="decimal" value={a.rent} onChange={e => set('rent', e.target.value)} />
                {!scoped && Number(a.rent) > 0 && <span className="tk-hint tk-hint-tight">{c('scope_out')}</span>}
              </label>
            )}
            <Pills label={c('f_side')} value={a.side} onChange={v => set('side', v)} items={['buyer', 'seller', 'both'].map(k => ({ value: k, label: c(`side_${k}`) }))} />
            <div className="sp-grid">
              <label className="tk-field sp-field"><span className="tk-label">{c('f_client')}</span>
                <input className="value-input tk-input" maxLength={80} value={a.clientName} onChange={e => set('clientName', e.target.value)} /></label>
              <label className="tk-field sp-field"><span className="tk-label">{c('f_property')}</span>
                <input className="value-input tk-input" maxLength={120} value={a.property} onChange={e => set('property', e.target.value)} /></label>
            </div>
          </fieldset>

          <fieldset className="sp-set">
            <legend className="sp-legend">{c('s_client')}</legend>
            <Pills label={c('f_type')} value={a.clientType} onChange={v => set('clientType', v)} items={[{ value: 'person', label: c('t_person') }, { value: 'company', label: c('t_company') }]} />
            <Pills label={c('f_id')} value={a.idChecked} onChange={v => set('idChecked', v)} items={yn} />
            {a.clientType === 'company' && (
              <Pills label={c('f_bo').replace('{bo}', String(BO))} value={a.bo} onChange={v => set('bo', v)} items={yn} />
            )}
            <Pills label={c('f_pep')} value={a.pep} onChange={v => set('pep', v)} items={[...yn, { value: 'unknown', label: c('not_checked') }]} />
          </fieldset>

          <fieldset className="sp-set">
            <legend className="sp-legend">{c('s_funds')}</legend>
            <Pills label={c('f_funds')} value={a.funds} onChange={v => set('funds', v)} items={FUNDS_KEYS.map(k => ({ value: k, label: c(`funds_${k}`) }))} />
            <Pills label={c('f_evidence')} value={a.fundsEvidence} onChange={v => set('fundsEvidence', v)} items={yn} />
            <Pills label={c('f_payment')} value={a.payment} onChange={v => set('payment', v)} items={PAYMENT_KEYS.map(k => ({ value: k, label: c(`pay_${k}`) }))} />
          </fieldset>

          <fieldset className="sp-set">
            <legend className="sp-legend">{c('s_flags')}</legend>
            <p className="tk-hint">{c('flags_hint')}</p>
            <div className="sp-checks">
              {FLAG_KEYS.map(k => (
                <label key={k} className="sp-check">
                  <input type="checkbox" checked={a.flags.includes(k)} onChange={() => toggleFlag(k)} />
                  <span>{c(`flag_${k}`)}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="sp-set">
            <legend className="sp-legend">{c('s_record')}</legend>
            <div className="sp-grid">
              <label className="tk-field sp-field"><span className="tk-label">{c('f_by')}</span>
                <input className="value-input tk-input" maxLength={80} value={a.by} onChange={e => set('by', e.target.value)} /></label>
              <label className="tk-field sp-field"><span className="tk-label">{c('f_doclang')}</span>
                <select className="value-input tk-input dc-select" value={lang} onChange={e => setLang(e.target.value)}>
                  {DOC_LANGS.map(l => <option key={l} value={l}>{LETTER_LANG_LABELS[l]}</option>)}
                </select></label>
            </div>
          </fieldset>

          {(answered || !scoped) && (
            <>
              <div className={`tk-verdict tk-verdict-${tone} aml-verdict`}>
                <h2 className="tk-verdict-headline">{c(`v_${res.verdict}`)}</h2>
              </div>
              <div className="sp-toolbar">
                <span />
                <button type="button" className="btn-primary" onClick={() => window.print()}>{c('print')}</button>
              </div>

              <article className="sp-doc" lang={lang}>
                <BrandHeader profile={profile} />
                <header className="sp-doc-head">
                  <h2 className="sp-doc-title">{D.title}</h2>
                  <p className="sp-doc-meta">{D.sub}</p>
                </header>
                <dl className="sp-facts aml-facts">
                  <div><dt>{D.f_client}</dt><dd>{a.clientName || ' '}</dd></div>
                  <div><dt>{D.f_op}</dt><dd>{D[`op_${a.op}`]} · {D[`side_${a.side}`]}</dd></div>
                  <div><dt>{D.f_prop}</dt><dd>{a.property || ' '}</dd></div>
                  <div><dt>{D.f_date}</dt><dd>{today}</dd></div>
                </dl>

                <p className="sp-p sp-strong aml-verdict-text">{D[`v_${res.verdict}`]}</p>
                {res.stops.length > 0 && <ul className="sp-list">{res.stops.map(s => <li key={s}>{D[s]}</li>)}</ul>}
                {res.reasons.length > 0 && <ul className="sp-list">{res.reasons.map(s => <li key={s}>{D[s]}</li>)}</ul>}

                <section className="sp-sec">
                  <h3 className="sp-h2">{D.s_checks}</h3>
                  <table className="sp-table">
                    <tbody>
                      <tr><td>{D[`t_${a.clientType}`]}</td><td /></tr>
                      <tr><td>{D.c_id}</td><td className="num">{checkVal(a.idChecked)}</td></tr>
                      <tr><td>{fill(D.c_bo, { bo: BO })}</td><td className="num">{a.clientType === 'company' ? checkVal(a.bo) : D.na}</td></tr>
                      <tr><td>{D.c_pep}</td><td className="num">{a.pep === 'unknown' || !a.pep ? D.unknown : D.yes}</td></tr>
                    </tbody>
                  </table>
                </section>

                <section className="sp-sec">
                  <h3 className="sp-h2">{D.s_funds}</h3>
                  <table className="sp-table">
                    <tbody>
                      <tr><td>{a.funds ? D[`funds_${a.funds}`] : D.unknown}</td><td /></tr>
                      <tr><td>{D.evidence}</td><td className="num">{checkVal(a.fundsEvidence)}</td></tr>
                      <tr><td>{a.payment ? D[`pay_${a.payment}`] : D.pay_unknown}</td><td /></tr>
                    </tbody>
                  </table>
                </section>

                <section className="sp-sec">
                  <h3 className="sp-h2">{D.s_flags}</h3>
                  {a.flags.length ? <ul className="sp-list">{FLAG_KEYS.filter(k => a.flags.includes(k)).map(k => <li key={k}>{D[`flag_${k}`]}</li>)}</ul> : <p className="sp-p">{D.flags_none}</p>}
                  <p className="sp-small">{D.flags_note}</p>
                </section>

                <section className="sp-sec">
                  <h3 className="sp-h2">{D.s_actions}</h3>
                  <ul className="sp-list">
                    {res.verdict === 'enhanced' && <li>{D.a_enhanced}</li>}
                    <li>{fill(D.a_keep, { years: YEARS })}</li>
                    <li>{D.a_report}</li>
                    <li>{D.a_internal}</li>
                  </ul>
                </section>

                <div className="aml-sign">
                  <div><span className="sp-small">{D.f_by}</span><p>{a.by || (hasProfile(profile) ? profile.name : '')}</p></div>
                  <div><span className="sp-small">{D.f_sign}</span><p className="aml-line" /></div>
                </div>

                <Panel title={c('sources_t')} kind="plain"><SourceNote ids={RULE_IDS} /></Panel>
                <ToolDisclaimer>{c('note')}</ToolDisclaimer>
              </article>
            </>
          )}
        </div>
      )}
    </ToolShell>
  );
}
