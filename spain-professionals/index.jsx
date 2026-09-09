import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useT, useLocale, LLink } from '../i18n.jsx';
import LangSwitcher from '../LangSwitcher.jsx';
import SiteNav from '../SiteNav.jsx';
import SiteFooter from '../SiteFooter.jsx';
import { useDirectory, SUPPORTED_PREF_LANGS } from '../useDirectory.js';
import { Method, OnGoogle, LanguageEvidence, FitSignals, Review, STARS, langName } from '../DirectoryCompliance.jsx';
import { PROFESSIONALS, PROFESSIONAL_BY_SLUG } from '../spain-directory/categories.js';
import { LOCALITY_BY_SLUG } from '../spain-directory/localities.js';
import ProfessionNote from './ProfessionNote.jsx';
import { doesKey, nameKey, pluralKey } from './professions.js';
import PageLinks from '../seo/PageLinks.jsx';

// Spain 24/7 property professionals.
//
// THE JOB THIS PAGE DOES
// Somebody is about to sign for a property, or has just inherited one, or cannot work out
// why the community keeps billing them. They are choosing a person they will deal with for
// years and getting it wrong is expensive. Nothing is on fire. They will read.
//
// They also do not know what half of these people are. A Norwegian owner has no idea what
// a gestoría is, how it differs from an abogado, or why an administrador de fincas keeps
// emailing them.
//
// Everything below follows from those two sentences, and it is why this page no longer
// shares a component with /spain-directory. A burst pipe is an emergency and the trades
// page is built for it: dark, dense, phone first. This one is the opposite on purpose.
// Light, warm, spacious, editorial. If a visitor could confuse the two, both are worse.
//
// WHAT IS ON THE SCREEN, IN ORDER OF SIZE
//   Landing: the problem, then one primary action, then the eight professions explained.
//   Results: the honest language sentence, then the profession explainer, then the names.
// The phone number is present and is deliberately NOT dominant. Nobody rings a lawyer in
// a panic at midnight; they read, they compare, and then they write an email.
//
// COMPARISON, NOT A LIST
// Every result renders the same three cells in the same order, and empty values render as
// a stated absence rather than a gap, so the eye can run down a column and compare like
// with like. That is why "No phone number listed" and "No language evidence" are printed
// rather than skipped.
//
// THE RULES THE SPLIT DOES NOT RELAX
//   - ranking, town list and language preference come from useDirectory.js,
//   - everything Google's terms require comes from DirectoryCompliance.jsx,
//   - no map, ever, beside Places content,
//   - evidence is never turned into a claim. "Reviewed twice in Norwegian", never "Speaks
//     Norwegian". No evidence means we do not know, and the page says so in those words.

const QUICK = ['torrevieja', 'marbella', 'javea', 'benidorm', 'palma', 'alicante'];

const telHref = (phone) => `tel:${String(phone).replace(/[^\d+]/g, '')}`;

// The language control.
//
// It is the value proposition, so it is never a sidebar filter. On the landing it sits in
// the search panel at the same weight as the town, and in the results it stays on screen.
// Changing it re-ranks from data already in memory: no refetch, no spinner, the list
// reorders as the menu closes.
function LangPicker({ value, onChange, id, size = 'lg' }) {
  const t = useT();
  const { locale } = useLocale();
  return (
    <div className={`pros-lang pros-lang-${size}`}>
      <label className="pros-field-label" htmlFor={id}>{t('calc_directory.pref_label')}</label>
      <select id={id} className="pros-select" value={value} onChange={(e) => onChange(e.target.value)}>
        {SUPPORTED_PREF_LANGS.map(code => (
          <option key={code} value={code}>{langName(code, locale)}</option>
        ))}
      </select>
    </div>
  );
}

// The one honest sentence the page exists to produce.
//
// "Four of these nine have been reviewed by someone writing in Norwegian." Built from
// counts, never rounded up, and when the answer is none it says none plainly rather than
// hiding itself. English gets its own three strings, because a visitor who wants help in
// English would otherwise read "in English or English", which is not a sentence.
function matchSentence(tt, withEvidence, total, langLabel, prefLang) {
  if (!total) return null;
  const en = prefLang === 'en';
  if (withEvidence === 0) {
    return { tone: 'none', text: en ? tt('pro_match_none_en') : tt('match_none').replace('{lang}', langLabel) };
  }
  if (withEvidence >= total) {
    return {
      tone: 'all',
      text: (en ? tt('pro_match_all_en') : tt('match_all'))
        .replace('{total}', String(total)).replace('{lang}', langLabel),
    };
  }
  return {
    tone: 'some',
    text: (en ? tt('pro_match_some_en') : tt('match_some'))
      .replace('{n}', String(withEvidence)).replace('{total}', String(total)).replace('{lang}', langLabel),
  };
}

// One result, as a row of the same three cells every other result has.
//
// Two review quotes rather than the trades page's one, more address and credential detail,
// and the phone as plain text rather than a filled block. A reader here is comparing, and
// the longer read is the correct one.
function ResultRow({ item, prefLang, tt }) {
  const { p, ev } = item;
  const reviews = (p.reviews || []).slice(0, 2);
  const headingId = `pros-n-${p.id}`;

  return (
    <article className="pros-row" aria-labelledby={headingId}>
      <div className="pros-cell pros-cell-who">
        <h3 className="pros-name" id={headingId}>{p.name}</h3>
        <p className="pros-addr">{p.address || tt('pro_no_address')}</p>
        <p className="pros-contact">
          {p.phone
            ? <a className="pros-phone" href={telHref(p.phone)}>{p.phone}</a>
            : <span className="pros-absent">{tt('no_phone')}</span>}
        </p>
        <p className="pros-links">
          {p.website && (
            <a href={p.website} target="_blank" rel="noopener noreferrer nofollow">{tt('website')}</a>
          )}
          <OnGoogle uri={p.maps_uri} />
        </p>
      </div>

      <div className="pros-cell pros-cell-rating">
        <span className="pros-sr">{tt('pro_col_rating')}</span>
        <span className="pros-score">{p.rating != null ? Number(p.rating).toFixed(1) : '-'}</span>
        <span className="pros-stars" aria-hidden="true">{STARS(p.rating)}</span>
        <span className="pros-count">
          {tt('review_count_line').replace('{count}', String(p.review_count || 0))}
        </span>
      </div>

      <div className="pros-cell pros-cell-lang">
        <span className="pros-sr">{tt('pro_col_lang')}</span>
        <LanguageEvidence evidence={ev} want={prefLang} />
        <FitSignals evidence={p.fit_evidence} limit={3} />
      </div>

      {reviews.length > 0 && (
        <div className="pros-quotes">
          <p className="pros-quotes-label">{tt('pro_reviews_label')}</p>
          {reviews.map((rv, i) => <Review key={i} rv={rv} variant="pros" />)}
        </div>
      )}
    </article>
  );
}

export default function SpainProfessionals() {
  const t = useT();
  const tt = (k) => t(`calc_directory.${k}`);
  const { locale } = useLocale();
  const [params] = useSearchParams();

  const d = useDirectory({
    bySlug: PROFESSIONAL_BY_SLUG,
    defaultCategory: 'real-estate',
    path: '/spain-professionals',
  });

  // A visitor who arrived from the home page with ?trade=gestoria has already told us what
  // they think they need, so the landing shows that explainer straight away. A visitor with
  // no trade in the URL has told us nothing, and the default is ours rather than theirs, so
  // we show the eight and let them choose.
  const [declared, setDeclared] = useState(!!PROFESSIONAL_BY_SLUG[params.get('trade')]);
  const [needTown, setNeedTown] = useState(false);
  const townRef = useRef(null);

  useEffect(() => { document.title = `${tt('prof_meta_title')} | Spain 24/7`; }, [locale]);

  const langLabel = langName(d.prefLang, locale);
  const townName = d.shownTown ? d.shownTown.name : '';
  // A deep linked visit renders the results shell for one frame before run() has set the
  // shown selection, so everything below falls back to the pending one rather than
  // printing a raw translation key for that frame.
  const shownTrade = d.shownTrade || d.trade;
  const sentence = matchSentence(tt, d.withEvidence, d.total, langLabel, d.prefLang);
  const tradeLabel = (slug) => tt(pluralKey(slug));

  function choose(slug) {
    d.setTrade(slug);
    setDeclared(true);
    if (d.town) { d.run(d.town, slug); return; }
    setNeedTown(true);
    if (townRef.current) {
      townRef.current.focus();
      townRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }

  const ctaLabel = d.town && LOCALITY_BY_SLUG[d.town]
    ? tt('pro_cta_full').replace('{trade}', tradeLabel(d.trade)).replace('{town}', LOCALITY_BY_SLUG[d.town].name)
    : tt('pro_cta').replace('{trade}', tradeLabel(d.trade));

  return (
    <div className="calc-shell pros-shell">
      <header className="calc-header">
        <div className="site-brand">
          <span className="site-brand-name">Spain 24/7</span>
          <span className="site-brand-powered">{t('home.brand_sub')}</span>
        </div>
        <div className="pros-header-right">
          <SiteNav active="pros" />
          <LangSwitcher />
        </div>
      </header>

      <main className="pros-page">
        {d.picking ? (
          /* ------------------------------ landing ------------------------------ */
          <div className="pros-wrap">
            <div className="pros-hero">
              {d.shown && (
                <button type="button" className="pros-back" onClick={() => d.setPicking(false)}>
                  {tt('pro_back_results')}
                </button>
              )}
              <p className="pros-eyebrow">{tt('prof_eyebrow')}</p>
              <h1 className="pros-h1">{tt('pro_land_h1')}</h1>
              <p className="pros-lede">{tt('pro_land_lede')}</p>
            </div>

            <section className="pros-panel" aria-labelledby="pros-form-title">
              <h2 className="pros-panel-title" id="pros-form-title">{tt('pro_form_title')}</h2>

              <form
                className="pros-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!d.town) { setNeedTown(true); if (townRef.current) townRef.current.focus(); return; }
                  d.run(d.town, d.trade);
                }}
              >
                <LangPicker id="pros-lang" value={d.prefLang} onChange={d.setPrefLang} />

                <div className="pros-field">
                  <label className="pros-field-label" htmlFor="pros-town">{tt('where_label')}</label>
                  <select
                    id="pros-town" className="pros-select" ref={townRef} value={d.town}
                    aria-describedby={needTown && !d.town ? 'pros-town-hint' : undefined}
                    onChange={(e) => { d.setTown(e.target.value); setNeedTown(false); }}
                  >
                    <option value="">{tt('town_placeholder')}</option>
                    {d.grouped.map(g => (
                      <optgroup key={g.key} label={g.label}>
                        {g.items.map(l => <option key={l.slug} value={l.slug}>{l.name}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div className="pros-field">
                  <label className="pros-field-label" htmlFor="pros-trade">{tt('trade_label')}</label>
                  <select
                    id="pros-trade" className="pros-select" value={d.trade}
                    onChange={(e) => { d.setTrade(e.target.value); setDeclared(true); }}
                  >
                    {PROFESSIONALS.map(c => (
                      <option key={c.slug} value={c.slug}>{tt(nameKey(c.slug))}</option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="pros-cta">{ctaLabel}</button>
              </form>

              <p className="pros-lang-help">{tt('pref_help')}</p>

              {needTown && !d.town && (
                <p className="pros-hint" id="pros-town-hint" role="status">{tt('pro_need_town')}</p>
              )}

              <div className="pros-quick">
                <span>{tt('popular')}</span>
                {QUICK.map(slug => {
                  const l = LOCALITY_BY_SLUG[slug];
                  return l ? (
                    <button key={slug} type="button"
                      onClick={() => { d.setTown(slug); setNeedTown(false); d.run(slug, d.trade); }}>
                      {l.name}
                    </button>
                  ) : null;
                })}
              </div>
            </section>

            {declared && <ProfessionNote slug={d.trade} />}

            <section className="pros-who" aria-labelledby="pros-who-title">
              <h2 className="pros-section-title" id="pros-who-title">{tt('pro_who_title')}</h2>
              <p className="pros-section-lede">{tt('pro_who_lede')}</p>

              <ul className="pros-who-grid">
                {PROFESSIONALS.map((c, i) => (
                  <li className="pros-who-item" key={c.slug}>
                    <span className="pros-who-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="pros-who-name">{tt(nameKey(c.slug))}</h3>
                    <p className="pros-who-text">{tt(doesKey(c.slug))}</p>
                    <button type="button" className="pros-who-go" onClick={() => choose(c.slug)}>
                      {d.town && LOCALITY_BY_SLUG[d.town]
                        ? tt('pro_choose_in').replace('{town}', LOCALITY_BY_SLUG[d.town].name)
                        : tt('pro_choose')}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        ) : (
          /* ------------------------------ results ------------------------------ */
          <div className="pros-wrap">
            <div className="pros-crumb">
              <button type="button" className="pros-back" onClick={() => d.setPicking(true)}>
                {tt('pro_see_all')}
              </button>
            </div>

            <h1 className="pros-h1 pros-h1-results">
              {tt('pro_results_h1')
                .replace('{trade}', tradeLabel(shownTrade))
                .replace('{town}', townName)}
            </h1>
            <p className="pros-town-line">
              {d.shownTown ? d.shownTown.province : ''}
              <button type="button" className="pros-change" onClick={() => d.setPicking(true)}>
                {tt('change_town')}
              </button>
            </p>

            {/* The answer, before the method. The live region is always mounted, because a
                region that appears at the same moment as its content is not reliably
                announced. */}
            <div className="pros-live" aria-live="polite">
              {d.state === 'done' && sentence && (
                <div className={`pros-verdict pros-verdict-${sentence.tone}`}>
                  <p className="pros-verdict-text">{sentence.text}</p>
                  <p className="pros-sorted">{tt('sorted_note')}</p>
                </div>
              )}
            </div>

            <div className="pros-controls">
              <LangPicker id="pros-lang-r" value={d.prefLang} onChange={d.setPrefLang} size="sm" />
              <div className="pros-field pros-field-sm">
                <label className="pros-field-label" htmlFor="pros-trade-r">{tt('trade_label')}</label>
                <select
                  id="pros-trade-r" className="pros-select" value={shownTrade} disabled={d.busy}
                  onChange={(e) => { d.setTrade(e.target.value); d.run(d.shown ? d.shown.town : d.town, e.target.value); }}
                >
                  {PROFESSIONALS.map(c => (
                    <option key={c.slug} value={c.slug}>{tt(nameKey(c.slug))}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Before the names mean anything. */}
            <ProfessionNote slug={shownTrade} />

            {d.busy && (
              <div>
                <p className="pros-loading" role="status">{tt('loading')}</p>
                <div className="pros-skel" /><div className="pros-skel" /><div className="pros-skel" />
              </div>
            )}

            {d.state === 'error' && <div className="pros-msg pros-msg-err" role="alert">{d.message}</div>}

            {d.state === 'done' && d.total === 0 && d.shownTown && (
              <div className="pros-msg pros-msg-info">
                {tt('none_found')
                  .replace('{trade}', tt(nameKey(shownTrade)))
                  .replace('{town}', d.shownTown.name)}
              </div>
            )}

            {d.state === 'done' && d.total > 0 && (
              <section className="pros-results">
                {d.total < 3 && (
                  <p className="pros-thin">{tt('pro_thin').replace('{n}', String(d.total))}</p>
                )}

                <div className="pros-colhead" aria-hidden="true">
                  <span>{tt('pro_col_business')}</span>
                  <span>{tt('pro_col_rating')}</span>
                  <span>{tt('pro_col_lang')}</span>
                </div>

                {d.ranked.map(item => (
                  <ResultRow key={item.p.id} item={item} prefLang={d.prefLang} tt={tt} />
                ))}
              </section>
            )}

            {d.state === 'done' && (
              <div className="pros-method">
                <Method extraNote="prof_note" />
              </div>
            )}

            <p className="pros-cross">
              <LLink to="/cost-audit">{tt('cross_link')} &#8594;</LLink>
            </p>
          </div>
        )}
        {/* Same reason as the trades page: React replaces the prerendered block, and a
            <select> is not a link. These are the only links a crawler sees. */}
        <PageLinks hub="pros" town={d.urlTown} category={d.urlTrade} locale={locale} />
      </main>

      <SiteFooter note={tt('footer')} />
    </div>
  );
}
