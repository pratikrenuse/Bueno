import { useEffect } from 'react';
import { useT, useLocale, LLink } from '../i18n.jsx';
import LangSwitcher from '../LangSwitcher.jsx';
import SiteNav from '../SiteNav.jsx';
import SiteFooter from '../SiteFooter.jsx';
import { useDirectory, SUPPORTED_PREF_LANGS } from '../useDirectory.js';
import { Method, OnGoogle, LanguageEvidence, FitSignals, Review, langName } from '../DirectoryCompliance.jsx';
import { CATEGORIES, CATEGORY_BY_SLUG } from './categories.js';
import { LOCALITY_BY_SLUG } from './localities.js';
import { pickEvidenceReview, position, telHref } from './trades-helpers.js';
import PageLinks from '../seo/PageLinks.jsx';

// Spain 24/7 trades directory.
//
// THE JOB THIS PAGE DOES
// A pipe has burst. The owner is in Oslo, it is Sunday, and there is water coming through
// the ceiling of a flat they cannot see. They do not want to read. They want a phone
// number for someone who will understand them.
//
// Everything below follows from that, and it is why this page no longer shares a
// component with /spain-professionals. Choosing a lawyer is a decision and you want a
// calm comparison. A burst pipe is not a decision. So that page is light, spacious and
// editorial, and this one is dark, dense and fast, and the two are meant to be
// impossible to confuse.
//
// The rules the split does NOT relax:
//   - the ranking, the town list and the language preference come from useDirectory.js,
//   - everything Google's terms require comes from DirectoryCompliance.jsx,
//   - no map, ever, next to Places content,
//   - evidence is never turned into a claim. "Reviewed twice in Norwegian", never
//     "Speaks Norwegian". No evidence means we do not know, and the page says so.
//
// WHAT IS BIGGEST ON THE SCREEN
// The phone number. One per row, a filled light blue block on navy, tall enough to hit
// with a thumb while holding a phone in the other hand. Everything else on the row is
// deliberately smaller than it, including the business name.

const QUICK = ['torrevieja', 'marbella', 'javea', 'benidorm', 'palma', 'alicante'];

// The language control. It is the value proposition, so it is never a sidebar filter: in
// the landing state it sits in the hero at hero size, and in the results state it stays
// on screen in the sticky bar. Changing it re-ranks from data already in memory, so the
// list reorders as the menu closes.
function LangPicker({ value, onChange, id, size }) {
  const t = useT();
  const { locale } = useLocale();
  return (
    <div className={`trades-lang trades-lang-${size}`}>
      <label className="trades-lang-label" htmlFor={id}>{t('calc_directory.pref_label')}</label>
      <select id={id} className="trades-lang-select" value={value} onChange={(e) => onChange(e.target.value)}>
        {SUPPORTED_PREF_LANGS.map(code => (
          <option key={code} value={code}>{langName(code, locale)}</option>
        ))}
      </select>
    </div>
  );
}

// The one honest sentence the whole page exists to produce.
//
// "Four of these nine have been reviewed by someone writing in Norwegian." It is built
// from counts, never rounded up, and when the answer is none it says none plainly rather
// than hiding the sentence. A separate set of strings covers the case where the visitor
// wants English, because "in English or English" is not a sentence.
function matchSentence(tt, withEvidence, total, langLabel, prefLang) {
  if (!total) return null;
  const en = prefLang === 'en';
  if (withEvidence === 0) {
    return {
      tone: 'none',
      text: en ? tt('trades_match_none_en') : tt('match_none').replace('{lang}', langLabel),
    };
  }
  if (withEvidence >= total) {
    return {
      tone: 'all',
      text: (en ? tt('trades_match_all_en') : tt('match_all'))
        .replace('{total}', String(total)).replace('{lang}', langLabel),
    };
  }
  return {
    tone: 'some',
    text: (en ? tt('trades_match_some_en') : tt('match_some'))
      .replace('{n}', String(withEvidence)).replace('{total}', String(total)).replace('{lang}', langLabel),
  };
}

// One result. Position, name, language evidence, a compact rating unit, the address, the
// phone number as the single primary action, and only then the quieter things.
function ResultRow({ item, index, prefLang, tt }) {
  const { p, ev } = item;
  const review = pickEvidenceReview(p, ev, prefLang);
  const headingId = `trades-n-${p.id || index}`;

  return (
    <article className="trades-row" aria-labelledby={headingId}>
      <p className="trades-pos" aria-hidden="true">{position(index)}</p>

      <div className="trades-main">
        <h3 className="trades-name" id={headingId}>{p.name}</h3>

        <div className="trades-facts">
          <span className="trades-rate">
            <span className="trades-star" aria-hidden="true">&#9733;</span>
            <b>{p.rating != null ? Number(p.rating).toFixed(1) : '-'}</b>
            <span>{tt('review_count_line').replace('{count}', String(p.review_count || 0))}</span>
          </span>
          <LanguageEvidence evidence={ev} want={prefLang} />
        </div>

        {p.address && <p className="trades-addr">{p.address}</p>}
      </div>

      <div className="trades-act">
        {p.phone ? (
          <a
            className="trades-call"
            href={telHref(p.phone)}
            aria-label={tt('trades_call_aria').replace('{name}', p.name || '').replace('{phone}', p.phone)}
          >
            <span className="trades-call-word">{tt('call')}</span>
            <span className="trades-call-num">{p.phone}</span>
          </a>
        ) : (
          <span className="trades-nophone">{tt('no_phone')}</span>
        )}
        <span className="trades-links">
          {p.website && (
            <a href={p.website} target="_blank" rel="noopener noreferrer nofollow">{tt('website')}</a>
          )}
          <OnGoogle uri={p.maps_uri} />
        </span>
      </div>

      <div className="trades-extra">
        <FitSignals evidence={p.fit_evidence} limit={2} />
        {review && <Review rv={review} variant="trades" />}
      </div>
    </article>
  );
}

export default function SpainDirectory() {
  const t = useT();
  const tt = (k) => t(`calc_directory.${k}`);
  const { locale } = useLocale();

  const d = useDirectory({
    bySlug: CATEGORY_BY_SLUG,
    defaultCategory: 'plumber',
    path: '/spain-directory',
  });

  useEffect(() => { document.title = `${tt('meta_title')} | Spain 24/7`; }, [locale]);

  const langLabel = langName(d.prefLang, locale);
  const sentence = matchSentence(tt, d.withEvidence, d.total, langLabel, d.prefLang);
  const townName = d.shownTown ? d.shownTown.name : '';

  return (
    <div className="calc-shell trades-shell">
      <header className="calc-header on-dark trades-header">
        <div className="site-brand">
          <span className="site-brand-name white">Spain 24/7</span>
          <span className="site-brand-powered white">{t('home.brand_sub')}</span>
        </div>
        <div className="trades-header-right">
          <SiteNav active="trades" />
          <LangSwitcher />
        </div>
      </header>

      <main className="trades-page">

        {d.picking ? (
          /* ---------------- landing ---------------- */
          <div className="trades-hero">
            {d.shown && (
              <button type="button" className="trades-back" onClick={() => d.setPicking(false)}>
                {tt('trades_back_results')}
              </button>
            )}

            <p className="trades-eyebrow">{tt('trades_eyebrow')}</p>
            <h1 className="trades-h1">{tt('trades_headline')}</h1>
            <p className="trades-lede">{tt('trades_lede')}</p>

            {/* The language control is the hero, not a filter. A visitor on /no/ already
                sees Norwegian selected, because that is the whole point of the page. */}
            <LangPicker id="trades-lang-hero" size="hero" value={d.prefLang} onChange={d.setPrefLang} />
            <p className="trades-lang-help">{tt('pref_help')}</p>

            <form
              className="trades-form"
              onSubmit={(e) => { e.preventDefault(); d.run(d.town, d.trade); }}
            >
              <div className="trades-field">
                <label htmlFor="trades-town">{tt('where_label')}</label>
                <select
                  id="trades-town" className="trades-select"
                  value={d.town} onChange={(e) => d.setTown(e.target.value)}
                >
                  <option value="">{tt('town_placeholder')}</option>
                  {d.grouped.map(g => (
                    <optgroup key={g.key} label={g.label}>
                      {g.items.map(l => <option key={l.slug} value={l.slug}>{l.name}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="trades-field">
                <label htmlFor="trades-trade">{tt('trade_label')}</label>
                <select
                  id="trades-trade" className="trades-select"
                  value={d.trade} onChange={(e) => d.setTrade(e.target.value)}
                >
                  {CATEGORIES.map(c => (
                    <option key={c.slug} value={c.slug}>{tt(`cat_${c.slug}`)}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="trades-go" disabled={!d.town}>{tt('find_cta')}</button>
            </form>

            <div className="trades-quick">
              <span>{tt('popular')}</span>
              {QUICK.map(slug => {
                const l = LOCALITY_BY_SLUG[slug];
                return l ? (
                  <button key={slug} type="button" onClick={() => { d.setTown(slug); d.run(slug, d.trade); }}>
                    {l.name}
                  </button>
                ) : null;
              })}
            </div>

            <ul className="trades-proof">
              <li>{tt('trades_proof_1')}</li>
              <li>{tt('trades_proof_2')}</li>
              <li>{tt('trades_proof_3')}</li>
              <li>{tt('trades_proof_4')}</li>
            </ul>
          </div>
        ) : (
          /* ---------------- results ----------------
             `shown` is set inside run(), which the hook calls from an effect on a deep
             linked visit, so there is one render before it exists. Guarded rather than
             defaulted, because a heading built from a null trade would flash an
             untranslated key. */
          d.shown && <>
            {/* Sticky, so the trade you need and the language you need it in are still
                reachable after four rows of scrolling. */}
            <div className="trades-bar">
              <div className="trades-bar-in">
                <div className="trades-bar-top">
                  <button type="button" className="trades-town-btn" onClick={() => d.setPicking(true)}>
                    <span className="trades-town-name">{townName}</span>
                    <span className="trades-town-change">{tt('trades_new_search')}</span>
                  </button>
                  <LangPicker id="trades-lang-bar" size="bar" value={d.prefLang} onChange={d.setPrefLang} />
                </div>

                <div className="trades-chips" role="group" aria-label={tt('trade_label')}>
                  {CATEGORIES.map(c => (
                    <button
                      key={c.slug} type="button"
                      aria-pressed={c.slug === d.shownTrade}
                      disabled={d.busy}
                      onClick={() => { d.setTrade(c.slug); d.run(d.shown.town, c.slug); }}
                    >
                      {tt(`cat_${c.slug}`)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="trades-results">
              <h1 className="trades-h2">
                {tt('results_headline')
                  .replace('{trade}', tt(`cat_${d.shownTrade}_pl`))
                  .replace('{town}', townName)}
              </h1>

              {d.busy && (
                <div aria-live="polite">
                  <p className="trades-loading">{tt('loading')}</p>
                  <div className="trades-skel" /><div className="trades-skel" /><div className="trades-skel" />
                </div>
              )}

              {d.state === 'error' && (
                <div className="trades-msg err" role="alert">
                  <span className="trades-msg-label">{tt('trades_error_label')}</span>
                  {d.message}
                </div>
              )}

              {d.state === 'done' && d.total === 0 && d.shownTown && (
                <div className="trades-msg" role="status">
                  {tt('none_found')
                    .replace('{trade}', tt(`cat_${d.shownTrade}`))
                    .replace('{town}', townName)}
                </div>
              )}

              {d.state === 'done' && d.total > 0 && (
                <section aria-live="polite">
                  {/* The answer first, the method afterwards. This sentence is the
                      product; the ordering note under it stops anyone reading the list
                      as a straight rating order. */}
                  {sentence && (
                    <p className={`trades-match trades-match-${sentence.tone}`}>{sentence.text}</p>
                  )}
                  <p className="trades-sorted">{tt('sorted_note')}</p>

                  {d.total < 3 && (
                    <p className="trades-thin">
                      {tt('trades_thin').replace('{town}', townName)}
                    </p>
                  )}

                  <div className="trades-list">
                    {d.ranked.map((item, i) => (
                      <ResultRow
                        key={item.p.id || i}
                        item={item} index={i} prefLang={d.prefLang} tt={tt}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Required on every results view, and it may not be hidden. It sits below
                  the list, where it is fully readable but not competing with a column of
                  phone numbers. */}
              {(d.state === 'done' || d.state === 'error') && (
                <div className="trades-method">
                  <Method />
                  <p className="trades-cross">
                    <LLink to="/cost-audit">{tt('cross_link')} &#8594;</LLink>
                  </p>
                </div>
              )}
            </div>
          </>
        )}
        {/* The links out. They are on the page, not only in the prerendered HTML, because
            React replaces that HTML the moment it boots and the town picker is a <select>,
            which passes nothing to a crawler. Without this every town page is an orphan. */}
        <PageLinks hub="trades" town={d.urlTown} category={d.urlTrade} locale={locale} className="pagelinks-dark" />
      </main>

      <SiteFooter note={tt('footer')} />
    </div>
  );
}
