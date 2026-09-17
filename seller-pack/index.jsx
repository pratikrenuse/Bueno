import { useState } from 'react';
import ToolShell, { Intro, useCopy } from '../ToolShell.jsx';
import SourceNote from '../SourceNote.jsx';
import { useLocale } from '../i18n.jsx';
import { rule } from '../rules/index.js';
import { useBrandProfile, BrandHeader, BrandSignature, hasProfile } from '../BrandProfile.jsx';
import { SITE_ORIGIN, localePath, LOCALES } from '../seo/copy.js';
import copyDict from './copy.js';
import {
  analyse, fill, fmtEUR, fmtNum, fmtDate,
  PACK, PACK_LANGS, MARKETING_KEYS, TYPE_KEYS, REVIEW_WEEKS,
} from './pack.js';
import { LETTER_LANG_LABELS } from '../deal-checklist/letter.js';

// Seller meeting pack, for estate agents.
//
// The agent's comparables go in, a document in the seller's language comes out. The only
// legal figure on the page is the non-resident retention, read from the rules base.
const RETENTION = rule('irnr.sale.retention').value.rate;

const blankComp = () => ({ label: '', status: 'asking', price: '', area: '', note: '' });

const START = {
  seller: '', meeting: '', residency: 'unsure',
  address: '', type: 'apartment', area: '', beds: '', baths: '', plot: '',
  hoped: '', low: '', high: '', reason: '',
  comps: [blankComp(), blankComp(), blankComp()],
  marketing: ['photos', 'plan', 'portals', 'languages', 'viewings'],
  review: 4,
};

function Field({ label, hint, children }) {
  return (
    <label className="tk-field sp-field">
      <span className="tk-label">{label}</span>
      {children}
      {hint && <span className="tk-hint tk-hint-tight">{hint}</span>}
    </label>
  );
}

export default function SellerPack() {
  const c = useCopy(copyDict);
  const { locale } = useLocale();
  const L = PACK[locale] || PACK.en;
  const { profile } = useBrandProfile();
  const [step, setStep] = useState('intro');
  const [f, setF] = useState(START);
  const [lang, setLang] = useState(PACK_LANGS.includes(locale) ? locale : 'en');

  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const setComp = (i, k, v) => setF(p => ({ ...p, comps: p.comps.map((x, j) => (j === i ? { ...x, [k]: v } : x)) }));
  const toggleMk = k => setF(p => ({ ...p, marketing: p.marketing.includes(k) ? p.marketing.filter(x => x !== k) : [...p.marketing, k] }));

  const r = analyse({ area: f.area, price: f.hoped, low: f.low, high: f.high, comps: f.comps });
  const canBuild = r.subjectArea > 0 && (r.hoped > 0 || r.low > 0 || r.high > 0);

  const P = PACK[lang] || PACK.en;
  const eur = n => fmtEUR(lang, n);
  const saleTaxUrl = SITE_ORIGIN + localePath(LOCALES.includes(lang) ? lang : 'en', '/sale-tax');

  const view = (to) => { setStep(to); if (typeof window !== 'undefined') window.scrollTo(0, 0); };

  return (
    <ToolShell title={c('title')} note={c('note')}>
      {step === 'intro' && (
        <Intro eyebrow={c('eyebrow')} headline={c('headline')} body={c('body')}
          points={c('points')} cta={c('cta')} minutes={c('minutes')} onStart={() => view('form')} />
      )}

      {step === 'form' && (
        <div className="step-inner sp-form">
          <h1 className="tk-intro-headline sp-form-title">{c('title')}</h1>

          <fieldset className="sp-set">
            <legend className="sp-legend">{c('sec_seller')}</legend>
            <div className="sp-grid">
              <Field label={c('f_seller')}><input className="value-input tk-input" maxLength={80} value={f.seller} onChange={e => set('seller', e.target.value)} /></Field>
              <Field label={c('f_meeting')}><input className="value-input tk-input" type="date" value={f.meeting} onChange={e => set('meeting', e.target.value)} /></Field>
              <Field label={c('f_packlang')} hint={c('f_packlang_hint')}>
                <select className="value-input tk-input dc-select" value={lang} onChange={e => setLang(e.target.value)}>
                  {PACK_LANGS.map(l => <option key={l} value={l}>{LETTER_LANG_LABELS[l]}</option>)}
                </select>
              </Field>
              <Field label={c('f_residency')}>
                <select className="value-input tk-input dc-select" value={f.residency} onChange={e => set('residency', e.target.value)}>
                  <option value="yes">{c('res_yes')}</option>
                  <option value="no">{c('res_no')}</option>
                  <option value="unsure">{c('res_unsure')}</option>
                </select>
              </Field>
            </div>
          </fieldset>

          <fieldset className="sp-set">
            <legend className="sp-legend">{c('sec_property')}</legend>
            <div className="sp-grid">
              <Field label={c('f_address')}><input className="value-input tk-input" maxLength={120} value={f.address} onChange={e => set('address', e.target.value)} /></Field>
              <Field label={c('f_type')}>
                <select className="value-input tk-input dc-select" value={f.type} onChange={e => set('type', e.target.value)}>
                  {TYPE_KEYS.map(k => <option key={k} value={k}>{L[`t_${k}`]}</option>)}
                </select>
              </Field>
              <Field label={c('f_area')}><input className="value-input tk-input" type="number" inputMode="decimal" min="0" value={f.area} onChange={e => set('area', e.target.value)} /></Field>
              <Field label={c('f_plot')}><input className="value-input tk-input" type="number" inputMode="decimal" min="0" value={f.plot} onChange={e => set('plot', e.target.value)} /></Field>
              <Field label={c('f_beds')}><input className="value-input tk-input" type="number" min="0" value={f.beds} onChange={e => set('beds', e.target.value)} /></Field>
              <Field label={c('f_baths')}><input className="value-input tk-input" type="number" min="0" value={f.baths} onChange={e => set('baths', e.target.value)} /></Field>
            </div>
          </fieldset>

          <fieldset className="sp-set">
            <legend className="sp-legend">{c('sec_price')}</legend>
            <div className="sp-grid">
              <Field label={c('f_hoped')}><input className="value-input tk-input" type="number" inputMode="decimal" min="0" value={f.hoped} onChange={e => set('hoped', e.target.value)} /></Field>
              <div />
              <Field label={c('f_low')}><input className="value-input tk-input" type="number" inputMode="decimal" min="0" value={f.low} onChange={e => set('low', e.target.value)} /></Field>
              <Field label={c('f_high')}><input className="value-input tk-input" type="number" inputMode="decimal" min="0" value={f.high} onChange={e => set('high', e.target.value)} /></Field>
            </div>
            <Field label={c('f_reason')} hint={c('f_reason_hint')}>
              <textarea className="value-input tk-input sp-textarea" rows={4} maxLength={900} value={f.reason} onChange={e => set('reason', e.target.value)} />
            </Field>
          </fieldset>

          <fieldset className="sp-set">
            <legend className="sp-legend">{c('sec_comps')}</legend>
            <p className="tk-hint">{c('comps_hint')}</p>
            {f.comps.map((cp, i) => (
              <div key={i} className="sp-comp">
                <span className="sp-comp-num">{i + 1}</span>
                <div className="sp-comp-grid">
                  <Field label={c('c_label')}><input className="value-input tk-input" maxLength={60} value={cp.label} onChange={e => setComp(i, 'label', e.target.value)} /></Field>
                  <Field label={c('c_status')}>
                    <select className="value-input tk-input dc-select" value={cp.status} onChange={e => setComp(i, 'status', e.target.value)}>
                      <option value="asking">{L.st_asking}</option>
                      <option value="sold">{L.st_sold}</option>
                    </select>
                  </Field>
                  <Field label={c('c_price')}><input className="value-input tk-input" type="number" inputMode="decimal" min="0" value={cp.price} onChange={e => setComp(i, 'price', e.target.value)} /></Field>
                  <Field label={c('c_area')}><input className="value-input tk-input" type="number" inputMode="decimal" min="0" value={cp.area} onChange={e => setComp(i, 'area', e.target.value)} /></Field>
                  <Field label={c('c_note')}><input className="value-input tk-input" maxLength={80} value={cp.note} onChange={e => setComp(i, 'note', e.target.value)} /></Field>
                </div>
                {f.comps.length > 1 && (
                  <button type="button" className="bp-link sp-remove"
                    onClick={() => setF(p => ({ ...p, comps: p.comps.filter((_, j) => j !== i) }))}>{c('remove')}</button>
                )}
              </div>
            ))}
            {f.comps.length < 8 && (
              <button type="button" className="btn-back sp-add" onClick={() => setF(p => ({ ...p, comps: [...p.comps, blankComp()] }))}>
                {c('add_comp')}
              </button>
            )}
          </fieldset>

          <fieldset className="sp-set">
            <legend className="sp-legend">{c('sec_plan')}</legend>
            <p className="tk-label">{c('f_marketing')}</p>
            <div className="sp-checks">
              {MARKETING_KEYS.map(k => (
                <label key={k} className="sp-check">
                  <input type="checkbox" checked={f.marketing.includes(k)} onChange={() => toggleMk(k)} />
                  <span>{L[`m_${k}`]}</span>
                </label>
              ))}
            </div>
            <p className="tk-label sp-gap">{c('f_review')}</p>
            <div className="dc-choice-row" role="radiogroup" aria-label={c('f_review')}>
              {REVIEW_WEEKS.map(n => (
                <button key={n} type="button" role="radio" aria-checked={f.review === n}
                  className={`dc-pill${f.review === n ? ' selected' : ''}`} onClick={() => set('review', n)}>
                  {c('weeks').replace('{n}', String(n))}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="tk-step-nav sp-nav">
            <button type="button" className="btn-back" onClick={() => view('intro')}>&#8592;</button>
            <button type="button" className="btn-primary" disabled={!canBuild} onClick={() => view('pack')}>{c('build')}</button>
          </div>
          {!canBuild && <p className="tk-hint tk-hint-tight">{c('need')}</p>}
        </div>
      )}

      {step === 'pack' && (
        <div className="step-inner sp-packwrap">
          <div className="sp-toolbar">
            <button type="button" className="btn-back" onClick={() => view('form')}>{c('edit')}</button>
            <button type="button" className="btn-primary" onClick={() => window.print()}>{c('print')}</button>
          </div>
          {!hasProfile(profile) && <p className="dc-noprofile">{c('no_profile')}</p>}

          <article className="sp-doc" lang={lang}>
            <BrandHeader profile={profile} />
            <header className="sp-doc-head">
              <h1 className="sp-doc-title">{P.doc_title}</h1>
              {f.address && <p className="sp-doc-address">{f.address}</p>}
              <p className="sp-doc-meta">
                {[f.seller && fill(P.prepared_for, { name: f.seller }), f.meeting && fill(P.meeting, { date: fmtDate(lang, f.meeting) })].filter(Boolean).join('  ·  ')}
              </p>
            </header>

            <section className="sp-sec">
              <h2 className="sp-h2">{P.s_property}</h2>
              <dl className="sp-facts">
                <div><dt>{P.l_type}</dt><dd>{P[`t_${f.type}`]}</dd></div>
                {r.subjectArea > 0 && <div><dt>{P.l_area}</dt><dd>{fmtNum(lang, r.subjectArea)} m²</dd></div>}
                {f.beds && <div><dt>{P.l_beds}</dt><dd>{f.beds}</dd></div>}
                {f.baths && <div><dt>{P.l_baths}</dt><dd>{f.baths}</dd></div>}
                {Number(f.plot) > 0 && <div><dt>{P.l_plot}</dt><dd>{fmtNum(lang, Number(f.plot))} m²</dd></div>}
              </dl>
            </section>

            <section className="sp-sec">
              <h2 className="sp-h2">{P.s_evidence}</h2>
              {r.rows.length > 0 && (
                <div className="sp-table-wrap">
                  <table className="sp-table">
                    <thead>
                      <tr><th>{P.h_home}</th><th>{P.h_status}</th><th className="num">{P.h_price}</th><th className="num">{P.h_area}</th><th className="num">{P.h_ppm}</th><th>{P.h_note}</th></tr>
                    </thead>
                    <tbody>
                      {r.rows.map((row, i) => (
                        <tr key={i}>
                          <td>{row.label || `#${i + 1}`}{row.sizeGap ? ' *' : ''}</td>
                          <td>{row.status === 'sold' ? P.st_sold : P.st_asking}</td>
                          <td className="num">{row.price ? eur(row.price) : ''}</td>
                          <td className="num">{row.area ? `${fmtNum(lang, row.area)} m²` : ''}</td>
                          <td className="num">{row.ppm != null ? eur(row.ppm) : ''}</td>
                          <td>{row.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {r.pricedCount === 0 && <p className="sp-p">{P.no_evidence}</p>}
              {r.medAsking != null && <p className="sp-p">{fill(P.med_asking, { x: eur(r.medAsking) })}</p>}
              {r.medSold != null && <p className="sp-p">{fill(P.med_sold, { x: eur(r.medSold) })}</p>}
              {r.subjectPpm != null && (
                <p className="sp-p sp-strong">
                  {fill(P.at_hoped, { p: eur(r.hoped), x: eur(r.subjectPpm) })}{' '}
                  {r.position && P[`pos_${r.position}`]}{' '}
                  {r.vsSold != null
                    ? fill(r.vsSold > 0 ? P.vs_sold_up : r.vsSold < 0 ? P.vs_sold_down : P.vs_sold_eq, { n: Math.abs(r.vsSold) })
                    : r.vsAsking != null
                      ? fill(r.vsAsking > 0 ? P.vs_ask_up : r.vsAsking < 0 ? P.vs_ask_down : P.vs_ask_eq, { n: Math.abs(r.vsAsking) })
                      : ''}
                </p>
              )}
              {r.anySizeGap && <p className="sp-small">{P.size_note}</p>}
              <div className="sp-limits">
                <h3 className="sp-h3">{P.limits_t}</h3>
                <ul>
                  <li>{P.limit_1}</li><li>{P.limit_2}</li><li>{P.limit_3}</li>
                </ul>
              </div>
            </section>

            {(r.low > 0 || r.high > 0 || f.reason.trim()) && (
              <section className="sp-sec">
                <h2 className="sp-h2">{P.s_price}</h2>
                {(r.low > 0 || r.high > 0) && (
                  <p className="sp-p sp-rec">
                    {r.low > 0 && r.high > 0 ? fill(P.rec_range, { lo: eur(r.low), hi: eur(r.high) })
                      : r.low > 0 ? fill(P.rec_from, { lo: eur(r.low) })
                      : fill(P.rec_upto, { hi: eur(r.high) })}
                    {r.lowPpm != null && r.highPpm != null && <> {fill(P.rec_ppm, { a: eur(r.lowPpm), b: eur(r.highPpm) })}</>}
                  </p>
                )}
                {f.reason.trim() && (
                  <div className="sp-note">
                    <h3 className="sp-h3">{P.notes_t}</h3>
                    {f.reason.trim().split(/\n+/).map((para, i) => <p key={i} className="sp-p">{para}</p>)}
                  </div>
                )}
              </section>
            )}

            {f.marketing.length > 0 && (
              <section className="sp-sec">
                <h2 className="sp-h2">{P.s_plan}</h2>
                <ul className="sp-list">
                  {MARKETING_KEYS.filter(k => f.marketing.includes(k)).map(k => <li key={k}>{P[`m_${k}`]}</li>)}
                </ul>
              </section>
            )}

            <section className="sp-sec">
              <h2 className="sp-h2">{P.s_review}</h2>
              <p className="sp-p">{fill(P.review, { n: f.review })}</p>
            </section>

            <section className="sp-sec">
              <h2 className="sp-h2">{P.s_costs}</h2>
              <ul className="sp-list">
                <li>{P.cost_fee}</li><li>{P.cost_plusvalia}</li><li>{P.cost_gain}</li><li>{P.cost_mortgage}</li><li>{P.cost_certs}</li>
              </ul>
            </section>

            {f.residency !== 'yes' && (
              <section className="sp-sec">
                <h2 className="sp-h2">{P.s_nonres}</h2>
                <p className="sp-p">{fill(P.nonres, { ret: RETENTION })}</p>
                <p className="sp-p">{fill(P.nonres_link, { url: saleTaxUrl.replace('https://', '') })}</p>
                <SourceNote ids="irnr.sale.retention" />
              </section>
            )}

            <footer className="sp-doc-foot">
              {hasProfile(profile) && (
                <div>
                  <p className="sp-small">{P.prepared_by}</p>
                  <BrandSignature profile={profile} />
                </div>
              )}
              <p className="sp-small">{P.disclaimer}</p>
            </footer>
          </article>
        </div>
      )}
    </ToolShell>
  );
}
