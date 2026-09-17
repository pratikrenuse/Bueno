import { useState } from 'react';
import ToolShell, { Intro, Panel, Rows, useCopy } from '../ToolShell.jsx';
import SourceNote, { ToolDisclaimer } from '../SourceNote.jsx';
import { useLocale } from '../i18n.jsx';
import { rule, itpResale, ajdNewBuild, valorReferencia } from '../rules/index.js';
import { useBrandProfile, BrandHeader, hasProfile } from '../BrandProfile.jsx';
import { LETTER_LANG_LABELS } from '../deal-checklist/letter.js';
import { fmtEUR } from '../seller-pack/pack.js';
import copyDict from './copy.js';
import { computeCosts } from './costs.js';
import { H, HANDOUT_LANGS, REGION_LABEL, fill } from './handout.js';

// Buying costs by region.
//
// The tables come straight from the rules base. rule() is called for the two national
// rates, so the page fails the build rather than render a figure whose status has changed.
const IVA = rule('vat.newbuild.mainland');
const IGIC = rule('igic.canarias');
const T = { itp: itpResale, ajd: ajdNewBuild, iva: IVA.value, igic: IGIC.value.general };
const REGIONS = itpResale.map(r => r.region).sort((a, b) => (REGION_LABEL[a] || a).localeCompare(REGION_LABEL[b] || b));

function fmtDate(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function PurchaseCosts() {
  const c = useCopy(copyDict);
  const { locale } = useLocale();
  const { profile } = useBrandProfile();
  const [started, setStarted] = useState(false);
  const [region, setRegion] = useState('');
  const [kind, setKind] = useState('resale');
  const [price, setPrice] = useState('');
  const [client, setClient] = useState('');
  const [lang, setLang] = useState(HANDOUT_LANGS.includes(locale) ? locale : 'en');
  const [copied, setCopied] = useState(false);

  const res = computeCosts({ region, kind, price }, T);
  const h = H[lang] || H.en;
  const eur = n => fmtEUR(lang, n);
  const regionName = REGION_LABEL[region] || region;
  const ready = region && Number(price) > 0;

  const rateText = r => (r.banded ? fill(h.r_banded, { e: String(r.effective).replace('.', lang === 'en' ? '.' : ',') }) : fill(h.r_flat, { r: String(r.flat).replace('.', lang === 'en' ? '.' : ',') }));
  const gapText = g => fill(h[`g_${g}`], { region: regionName });
  const notes = [
    ...res.gaps.map(gapText),
    h.minimum,
    h.reduced,
    ...(kind === 'newbuild' && region === 'Canarias' ? [h.canarias] : []),
  ];

  const handoutText = [
    h.title,
    client ? fill(h.for, { name: client }) : null,
    '',
    fill(h.intro, { kind: h[`k_${kind}`], price: eur(Number(price)), region: regionName }),
    '',
    ...res.lines.map(l => `${h[`l_${l.key}`]}: ${eur(l.amount)} (${rateText(l.rate)})`),
    res.lines.length ? `${h.total}: ${eur(res.total)}` : null,
    '',
    ...notes,
    '',
    h.other_t,
    ...h.other.map(x => `- ${x}`),
    h.other_note,
    '',
    ...(hasProfile(profile) ? [profile.name, profile.firm, profile.phone, profile.email].filter(Boolean) : []),
    h.note,
  ].filter(x => x !== null).join('\n');

  const copy = async () => {
    try { await navigator.clipboard.writeText(handoutText); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { /* clipboard unavailable */ }
  };

  return (
    <ToolShell title={c('title')} note={c('note')}>
      {!started && (
        <Intro eyebrow={c('eyebrow')} headline={c('headline')} body={c('body')}
          points={c('points')} cta={c('cta')} minutes={c('minutes')} onStart={() => setStarted(true)} />
      )}

      {started && (
        <div className="step-inner sp-packwrap">
          <h1 className="tk-intro-headline sp-form-title">{c('title')}</h1>
          <div className="sp-grid pc-form">
            <label className="tk-field sp-field">
              <span className="tk-label">{c('f_region')}</span>
              <select className="value-input tk-input dc-select" value={region} onChange={e => setRegion(e.target.value)}>
                <option value="">{c('f_region_ph')}</option>
                {REGIONS.map(r => <option key={r} value={r}>{REGION_LABEL[r] || r}</option>)}
              </select>
            </label>
            <label className="tk-field sp-field">
              <span className="tk-label">{c('f_price')}</span>
              <input className="value-input tk-input" type="number" inputMode="decimal" min="0" value={price} onChange={e => setPrice(e.target.value)} />
            </label>
            <div className="sp-field">
              <p className="tk-label">{c('f_kind')}</p>
              <div className="dc-choice-row" role="radiogroup" aria-label={c('f_kind')}>
                {['resale', 'newbuild'].map(k => (
                  <button key={k} type="button" role="radio" aria-checked={kind === k}
                    className={`dc-pill${kind === k ? ' selected' : ''}`} onClick={() => setKind(k)}>{c(`kind_${k}`)}</button>
                ))}
              </div>
            </div>
            <label className="tk-field sp-field">
              <span className="tk-label">{c('f_lang')}</span>
              <select className="value-input tk-input dc-select" value={lang} onChange={e => setLang(e.target.value)}>
                {HANDOUT_LANGS.map(l => <option key={l} value={l}>{LETTER_LANG_LABELS[l]}</option>)}
              </select>
            </label>
            <label className="tk-field sp-field">
              <span className="tk-label">{c('f_client')}</span>
              <input className="value-input tk-input" maxLength={80} value={client} onChange={e => setClient(e.target.value)} />
            </label>
          </div>

          {!ready && <p className="tk-hint">{c('empty')}</p>}

          {ready && (
            <>
              <div className="sp-toolbar">
                <button type="button" className="btn-back" onClick={copy}>{copied ? c('copied') : c('copy')}</button>
                <button type="button" className="btn-primary" onClick={() => window.print()}>{c('print')}</button>
              </div>
              {!hasProfile(profile) && <p className="dc-noprofile">{c('pro_hint')}</p>}
              <article className="sp-doc" lang={lang}>
                <BrandHeader profile={profile} />
                <header className="sp-doc-head">
                  <h2 className="sp-doc-title">{h.title}</h2>
                  {client && <p className="sp-doc-meta">{fill(h.for, { name: client })}</p>}
                  <p className="sp-p">{fill(h.intro, { kind: h[`k_${kind}`], price: eur(Number(price)), region: regionName })}</p>
                </header>

                {res.lines.length > 0 && (
                  <section className="sp-sec">
                    <Rows items={[
                      ...res.lines.map(l => ({ label: `${h[`l_${l.key}`]} · ${rateText(l.rate)}`, value: eur(l.amount) })),
                      { label: h.total, value: eur(res.total), strong: true },
                    ]} />
                  </section>
                )}

                <section className="sp-sec">
                  {notes.map((n, i) => <p key={i} className="sp-p">{n}</p>)}
                  {res.caveats.map((cv, i) => <p key={`c${i}`} className="sp-small">{cv.notes}</p>)}
                </section>

                <section className="sp-sec">
                  <h3 className="sp-h2">{h.other_t}</h3>
                  <ul className="sp-list">{h.other.map(x => <li key={x}>{x}</li>)}</ul>
                  <p className="sp-small">{h.other_note}</p>
                </section>

                <Panel title={c('sources_t')} kind="plain">
                  <div className="tk-source">
                    <ul className="tk-source-list">
                      {res.sources.map(s => (
                        <li key={s.key}>
                          <a href={s.source.url} target="_blank" rel="noopener noreferrer">{s.source.ref}</a>
                          <span className="tk-source-meta">{s.source.name}. Checked {fmtDate(s.source.read_on)}.</span>
                        </li>
                      ))}
                      <li>
                        <a href={valorReferencia.source.url} target="_blank" rel="noopener noreferrer">{valorReferencia.source.ref}</a>
                        <span className="tk-source-meta">{valorReferencia.source.name}. Checked {fmtDate(valorReferencia.source.read_on)}.</span>
                      </li>
                    </ul>
                  </div>
                  {kind === 'newbuild' && region !== 'Ceuta' && region !== 'Melilla' && (
                    <SourceNote ids={region === 'Canarias' ? 'igic.canarias' : 'vat.newbuild.mainland'} />
                  )}
                </Panel>
                <ToolDisclaimer>{h.note}</ToolDisclaimer>
              </article>
            </>
          )}
        </div>
      )}
    </ToolShell>
  );
}
