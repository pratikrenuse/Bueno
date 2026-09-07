import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useT, LLink, useLocale } from './i18n.jsx';
import LangSwitcher from './LangSwitcher.jsx';
import SiteFooter from './SiteFooter.jsx';
import { LOCALITIES, LOCALITY_BY_SLUG, REGIONS } from './spain-directory/localities.js';

// Spain 24/7 trade directory.
//
// The layout is two columns on desktop: a sticky control rail on the left, results on the
// right. The first version was one narrow column centred in a wide white page, which read
// as a phone layout stretched onto a monitor, and the six trades wrapped into five plus a
// lonely sixth. A vertical rail uses the width, cannot wrap badly, and keeps the town and
// the trade list on screen while you read down the results.
//
// The page ground is off-white and the cards are white, so a result is an object on a
// surface rather than white text blocks on white.
//
// Controls are a menu and a list, not a search box. Typing was the only way in originally,
// and a search box with no visible options gives a visitor nothing to react to.
//
// Town and trade are mirrored into the URL (?town=alicante&trade=plumber) so the home page
// can link straight to an answer, and so a result can be shared or indexed.
//
// Everything shown about a business comes from Google. Required and not to be removed:
// the visible "Ratings and reviews from Google Maps" line, and on every quote the
// reviewer's name, photo, profile link, and a link to the review itself (that link is the
// timestamp). The longer explanation of how results are ordered is also required, and
// lives in the rail's disclosure.

const STYLES = `
.dir-page { background: var(--off-white); flex: 1; padding: 118px 0 72px; }
.dir-layout { max-width: 1200px; margin: 0 auto; padding: 0 48px;
  display: grid; grid-template-columns: 264px 1fr; gap: 56px; align-items: start; }

/* ---- control rail ---- */
.dir-rail { position: sticky; top: 116px; }
.dir-rail-label { font-family: var(--font-sans); font-size: 9px; font-weight: 500;
  letter-spacing: 0.2em; text-transform: uppercase; color: var(--text-muted); margin: 0 0 10px; }
.dir-rail-town { font-family: var(--font-serif); font-size: 24px; font-weight: 400;
  color: var(--navy); line-height: 1.15; margin: 0 0 2px; }
.dir-rail-prov { font-family: var(--font-sans); font-size: 13px; font-weight: 300;
  color: var(--text-muted); display: block; margin-bottom: 8px; }
.dir-rail-change { font-family: var(--font-sans); font-size: 13px; color: var(--accent);
  background: none; border: 0; padding: 6px 0; cursor: pointer; text-decoration: underline; }
.dir-rail-sep { height: 1px; background: var(--border); margin: 24px 0; }
.dir-trades { display: flex; flex-direction: column; gap: 2px; }
.dir-trades button { display: flex; align-items: center; justify-content: space-between; gap: 10px;
  width: 100%; text-align: left; font-family: var(--font-sans); font-size: 15px; font-weight: 300;
  color: var(--navy); background: none; border: 0; border-radius: 10px; padding: 12px 14px;
  min-height: 46px; cursor: pointer; transition: all var(--transition); }
.dir-trades button:hover { background: rgba(1,2,33,0.05); }
.dir-trades button[aria-pressed="true"] { background: var(--navy); color: var(--white); font-weight: 400; }
.dir-trades button[aria-pressed="true"]::after { content: '\\2192'; }
.dir-trades button:disabled { opacity: 0.5; cursor: default; }

/* ---- results column ---- */
.dir-h1 { font-family: var(--font-serif); font-size: clamp(26px, 3.4vw, 40px); font-weight: 400;
  color: var(--navy); line-height: 1.12; letter-spacing: -0.01em; margin: 0 0 10px; }
.dir-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 26px;
  font-family: var(--font-sans); font-size: 13px; font-weight: 300; color: var(--text-muted); }
.dir-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--warm-grey); }

.dir-card { background: var(--white); border: 1px solid var(--border); border-radius: 18px;
  padding: 30px 32px; margin-bottom: 14px; }
.dir-card.top { border-color: var(--gold); box-shadow: 0 16px 40px rgba(1,2,33,0.06); }
.dir-rank { display: inline-flex; align-items: center; gap: 9px; font-family: var(--font-sans);
  font-size: 10px; font-weight: 500; letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--text-muted); margin-bottom: 12px; }
.dir-rank .num { display: inline-flex; align-items: center; justify-content: center;
  width: 21px; height: 21px; border-radius: 50%; background: rgba(1,2,33,0.07);
  color: var(--navy); font-size: 11px; letter-spacing: 0; }
.dir-card.top .dir-rank { color: #9A7B37; }
.dir-card.top .dir-rank .num { background: var(--gold); color: var(--navy); }
.dir-name { font-family: var(--font-serif); font-size: 26px; font-weight: 400; color: var(--navy);
  line-height: 1.18; letter-spacing: -0.01em; margin: 0 0 4px; }
.dir-addr { font-family: var(--font-sans); font-size: 13px; font-weight: 300;
  color: var(--text-muted); margin: 0 0 16px; }

.dir-rating { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
.dir-stars { color: var(--gold); font-size: 15px; letter-spacing: 1px; }
.dir-score { font-family: var(--font-serif); font-size: 22px; color: var(--navy); line-height: 1; }
.dir-count { font-family: var(--font-sans); font-size: 13px; font-weight: 300; color: var(--text-muted); }
.dir-langs { font-family: var(--font-sans); font-size: 12px; color: var(--navy);
  background: var(--light-blue); border-radius: 999px; padding: 5px 13px; }

.dir-actions { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
.dir-call { display: inline-flex; align-items: center; min-height: 50px; padding: 15px 28px;
  background: var(--navy); color: var(--white); border-radius: 14px; text-decoration: none;
  font-family: var(--font-sans); font-size: 12px; font-weight: 500; letter-spacing: 0.14em;
  text-transform: uppercase; transition: background var(--transition); }
.dir-call:hover { background: #1a1d4a; }
.dir-links { display: flex; gap: 18px; flex-wrap: wrap; }
.dir-links a { font-family: var(--font-sans); font-size: 13px; color: var(--accent);
  text-decoration: none; border-bottom: 1px solid transparent; padding: 5px 0; }
.dir-links a:hover { border-bottom-color: var(--accent); }
.dir-nophone { font-family: var(--font-sans); font-size: 13px; color: var(--text-muted); }

/* Reviews sit in an inset well so they read as quoted material, not more page. */
.dir-reviews { margin-top: 22px; padding: 20px 22px; background: var(--off-white); border-radius: 14px; }
.dir-quote + .dir-quote { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); }
.dir-quote-head { display: flex; align-items: center; gap: 9px; margin-bottom: 7px; flex-wrap: wrap; }
.dir-quote-head img { width: 24px; height: 24px; border-radius: 50%; }
.dir-quote-who { font-family: var(--font-sans); font-size: 13px; color: var(--navy); text-decoration: none; }
.dir-quote-who:hover { text-decoration: underline; }
.dir-quote-when { font-family: var(--font-sans); font-size: 12px; color: var(--text-muted); text-decoration: none; }
.dir-quote-when:hover { color: var(--accent); text-decoration: underline; }
.dir-quote-text { font-family: var(--font-sans); font-size: 14px; font-weight: 300; line-height: 1.7;
  color: var(--navy); margin: 0; }

.dir-result-label { font-family: var(--font-sans); font-size: 10px; font-weight: 500;
  letter-spacing: 0.16em; text-transform: uppercase; color: var(--accent); margin: 0 0 12px; }
.dir-more-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
  background: var(--white); border: 1px solid var(--border); border-radius: 14px;
  padding: 16px 20px; margin-bottom: 8px; }
.dir-more-row .n { font-family: var(--font-sans); font-size: 12px; color: var(--text-muted);
  min-width: 18px; }
.dir-more-row .nm { font-family: var(--font-serif); font-size: 18px; color: var(--navy);
  flex: 1 1 220px; line-height: 1.25; }
.dir-more-row .sc { font-family: var(--font-sans); font-size: 13px; color: var(--text-muted);
  white-space: nowrap; }
.dir-more-row .sc b { font-family: var(--font-serif); font-size: 17px; color: var(--navy); font-weight: 400; }
.dir-more-row a { font-family: var(--font-sans); font-size: 13px; color: var(--accent);
  text-decoration: none; white-space: nowrap; padding: 6px 0; }
.dir-more-row a:hover { text-decoration: underline; }

.dir-more-title { font-family: var(--font-sans); font-size: 10px; font-weight: 500;
  letter-spacing: 0.16em; text-transform: uppercase; color: var(--text-muted); margin: 0 0 12px; }
.dir-attrib { font-family: var(--font-sans); font-size: 12px; font-weight: 300;
  color: var(--text-muted); margin: 0 0 8px; }
.dir-more summary { font-family: var(--font-sans); font-size: 12px; color: var(--accent);
  cursor: pointer; list-style: none; padding: 6px 0; min-height: 34px; display: flex;
  align-items: center; gap: 7px; }
.dir-more summary::-webkit-details-marker { display: none; }
.dir-more summary::after { content: '+'; font-size: 14px; }
.dir-more[open] summary::after { content: '\\2212'; }
.dir-more-body { font-family: var(--font-sans); font-size: 12px; font-weight: 300; line-height: 1.7;
  color: var(--text-muted); padding: 6px 0 4px; }
.dir-more-body p { margin: 0 0 10px; }
.dir-more-body p:last-child { margin: 0; }
.dir-more-body strong { color: var(--navy); font-weight: 500; }

/* ---- the picker, shown before a search and when changing town ---- */
.dir-pick { max-width: 780px; margin: 0 auto; padding: 0 48px; }
.dir-lede { font-family: var(--font-sans); font-size: 17px; font-weight: 300; line-height: 1.75;
  color: var(--text-muted); max-width: 58ch; margin: 0 0 28px; }
.dir-form { display: grid; grid-template-columns: 1.4fr 1fr auto; gap: 12px; align-items: end; margin-bottom: 14px; }
.dir-field label { display: block; font-family: var(--font-sans); font-size: 10px; font-weight: 500;
  letter-spacing: 0.14em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px; }
.dir-select { width: 100%; min-height: 56px; padding: 16px 44px 16px 18px;
  font-family: var(--font-sans); font-size: 16px; color: var(--navy);
  background-color: var(--white); border: 1px solid var(--border); border-radius: 12px;
  appearance: none; cursor: pointer;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23010221' stroke-width='1.6' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 18px center; }
.dir-select:focus { outline: 3px solid rgba(91,127,204,0.35); outline-offset: 1px; border-color: var(--accent); }
.dir-go { min-height: 56px; padding: 16px 30px; white-space: nowrap; margin-bottom: 0; width: auto; }
.dir-quick { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.dir-quick > span { font-family: var(--font-sans); font-size: 11px; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--text-muted); margin-right: 2px; }
.dir-quick button { font-family: var(--font-sans); font-size: 13px; padding: 8px 16px; min-height: 38px;
  border: 1px solid var(--border); border-radius: 999px; background: var(--white); color: var(--navy);
  cursor: pointer; transition: all var(--transition); }
.dir-quick button:hover { border-color: var(--navy); background: var(--navy); color: var(--white); }

.dir-msg { font-family: var(--font-sans); font-size: 15px; font-weight: 300; line-height: 1.7;
  padding: 22px 24px; border-radius: 14px; }
.dir-msg.err { background: #FDF4F4; border: 1px solid #EBCFCF; color: #8A2F2F; }
.dir-msg.info { background: var(--white); border: 1px solid var(--border); color: var(--navy); }

.dir-skel { height: 150px; border-radius: 18px; margin-bottom: 14px; border: 1px solid var(--border);
  background: linear-gradient(90deg,#FFFFFF 25%,#F1F0EC 37%,#FFFFFF 63%); background-size: 400% 100%;
  animation: dirsheen 1.4s ease infinite; }
@keyframes dirsheen { 0% { background-position: 100% 0 } 100% { background-position: 0 0 } }
@media (prefers-reduced-motion: reduce) { .dir-skel { animation: none } }

@media (max-width: 1000px) {
  .dir-layout { grid-template-columns: 1fr; gap: 30px; padding: 0 24px; }
  .dir-rail { position: static; }
  .dir-trades { flex-direction: row; flex-wrap: wrap; gap: 8px; }
  .dir-trades button { width: auto; border: 1px solid var(--border); border-radius: 999px;
    padding: 9px 16px; min-height: 40px; font-size: 14px; }
  .dir-trades button[aria-pressed="true"]::after { content: none; }
  .dir-pick { padding: 0 24px; }
  .dir-form { grid-template-columns: 1fr; }
  .dir-go { width: 100%; }
  .dir-page { padding: 104px 0 56px; }
  .dir-card { padding: 24px 22px; }
}
`;

const QUICK = ['torrevieja', 'marbella', 'javea', 'benidorm', 'palma', 'alicante'];

// Intl gives localised language names for free, so a Norwegian reader sees "engelsk".
function langName(code, locale) {
  try { return new Intl.DisplayNames([locale], { type: 'language' }).of(code); }
  catch { return String(code || '').toUpperCase(); }
}

const STARS = (rating) => {
  const full = Math.round(Number(rating) || 0);
  return '★'.repeat(full) + '☆'.repeat(Math.max(0, 5 - full));
};

function Review({ rv, tt }) {
  return (
    <div className="dir-quote">
      <div className="dir-quote-head">
        {rv.author_photo && <img src={rv.author_photo} alt="" loading="lazy" />}
        {rv.author_uri
          ? <a className="dir-quote-who" href={rv.author_uri} target="_blank" rel="noopener noreferrer">{rv.author}</a>
          : <span className="dir-quote-who">{rv.author}</span>}
        {/* The date is the link to the review on Google Maps. Google requires that link;
            a separate blue "Read this review on Google Maps" line under every quote was
            six words of chrome for every fifteen words of content. */}
        {rv.uri
          ? <a className="dir-quote-when" href={rv.uri} target="_blank" rel="noopener noreferrer"
              title={tt('read_on_google')} aria-label={tt('read_on_google')}>{rv.relative}</a>
          : <span className="dir-quote-when">{rv.relative}</span>}
      </div>
      <p className="dir-quote-text">{rv.text}</p>
    </div>
  );
}

export default function DirectoryView({
  categories,          // the category set this page offers
  bySlug,              // that set as a slug lookup
  defaultCategory,     // what a visitor with no ?trade= gets
  path,                // this page's route, for the URL it writes back
  keys,                // which i18n strings name this page
  extraNote,           // optional extra line in the disclosure, e.g. for legal advice
}) {
  const t = useT();
  const tt = (k) => t(`calc_directory.${k}`);
  const { locale } = useLocale();
  const [params, setParams] = useSearchParams();

  const urlTown = params.get('town') || '';
  const urlTrade = params.get('trade') || '';
  const deepLinked = !!(LOCALITY_BY_SLUG[urlTown] && bySlug[urlTrade]);

  const [town, setTown] = useState(LOCALITY_BY_SLUG[urlTown] ? urlTown : '');
  const [trade, setTrade] = useState(bySlug[urlTrade] ? urlTrade : defaultCategory);
  const [picking, setPicking] = useState(!deepLinked);
  const [shown, setShown] = useState(null);
  const [state, setState] = useState('idle');
  const [providers, setProviders] = useState([]);
  const [message, setMessage] = useState('');

  const grouped = useMemo(() => {
    const out = [];
    for (const [key, label] of Object.entries(REGIONS)) {
      const items = LOCALITIES.filter(l => l.region === key).sort((a, b) => a.name.localeCompare(b.name));
      if (items.length) out.push({ key, label, items });
    }
    return out;
  }, []);

  useEffect(() => { document.title = `${tt(keys.metaTitle)} | Spain 24/7`; }, []);

  useEffect(() => {
    if (deepLinked) run(urlTown, urlTrade);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function run(townSlug, tradeSlug) {
    if (!townSlug) return;
    setState('loading');
    setMessage('');
    setProviders([]);
    setShown({ town: townSlug, trade: tradeSlug });
    setPicking(false);
    setParams({ town: townSlug, trade: tradeSlug }, { replace: true });
    try {
      const r = await fetch(`/api/directory?locality=${encodeURIComponent(townSlug)}&category=${encodeURIComponent(tradeSlug)}`);
      const raw = await r.text();
      let data;
      try { data = JSON.parse(raw); }
      catch { throw new Error(`${tt('err_unreadable')} (${r.status})`); }
      if (!r.ok) {
        setState('error');
        setMessage(data.message || data.error || `${tt('err_generic')} (${r.status})`);
        return;
      }
      setProviders(Array.isArray(data.providers) ? data.providers : []);
      setState('done');
    } catch (e) {
      setState('error');
      setMessage(String((e && e.message) || e));
    }
  }

  const shownTown = shown && LOCALITY_BY_SLUG[shown.town];
  const shownTrade = shown && shown.trade;
  const busy = state === 'loading';

  return (
    <div className="calc-shell">
      <style>{STYLES}</style>

      <header className="calc-header">
        <div className="site-brand">
          <span className="site-brand-name">Spain 24/7</span>
          <span className="site-brand-powered">{t('home.brand_sub')}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="calc-header-tag">{tt(keys.eyebrow)}</span>
          <LangSwitcher />
        </div>
      </header>

      <main className="dir-page">
        {picking ? (
          <div className="dir-pick">
            <div className="home-eyebrow" style={{ marginBottom: 16 }}>
              <span className="home-eyebrow-line" />
              <span className="home-eyebrow-text">{tt(keys.eyebrow)}</span>
            </div>
            <h1 className="dir-h1">{tt(keys.headline)}</h1>
            <p className="dir-lede">{tt(keys.lede)}</p>

            <form className="dir-form" onSubmit={(e) => { e.preventDefault(); run(town, trade); }}>
              <div className="dir-field">
                <label htmlFor="dir-town">{tt('where_label')}</label>
                <select id="dir-town" className="dir-select" value={town} onChange={(e) => setTown(e.target.value)}>
                  <option value="">{tt('town_placeholder')}</option>
                  {grouped.map(g => (
                    <optgroup key={g.key} label={g.label}>
                      {g.items.map(l => <option key={l.slug} value={l.slug}>{l.name}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="dir-field">
                <label htmlFor="dir-trade">{tt('trade_label')}</label>
                <select id="dir-trade" className="dir-select" value={trade} onChange={(e) => setTrade(e.target.value)}>
                  {categories.map(c => <option key={c.slug} value={c.slug}>{tt(`cat_${c.slug}`)}</option>)}
                </select>
              </div>
              <button type="submit" className="btn-primary dir-go" disabled={!town}>{tt('find_cta')}</button>
            </form>

            <div className="dir-quick">
              <span>{tt('popular')}</span>
              {QUICK.map(slug => {
                const l = LOCALITY_BY_SLUG[slug];
                return l ? (
                  <button key={slug} type="button" onClick={() => { setTown(slug); run(slug, trade); }}>{l.name}</button>
                ) : null;
              })}
            </div>
          </div>
        ) : (
          <div className="dir-layout">

            <aside className="dir-rail">
              <p className="dir-rail-label">{tt('where_label')}</p>
              <p className="dir-rail-town">{shownTown ? shownTown.name : ''}</p>
              <span className="dir-rail-prov">{shownTown ? shownTown.province : ''}</span>
              <button type="button" className="dir-rail-change" onClick={() => setPicking(true)}>
                {tt('change_town')}
              </button>

              <div className="dir-rail-sep" />

              <p className="dir-rail-label">{tt('trade_label')}</p>
              <div className="dir-trades">
                {categories.map(c => (
                  <button key={c.slug} type="button" aria-pressed={c.slug === shownTrade} disabled={busy}
                    onClick={() => { setTrade(c.slug); run(shown.town, c.slug); }}>
                    {tt(`cat_${c.slug}`)}
                  </button>
                ))}
              </div>

              <div className="dir-rail-sep" />

              <p className="dir-more-title">{tt('method_title')}</p>
              <p className="dir-attrib">{tt('powered_by')} Google Maps</p>
              <details className="dir-more">
                <summary>{tt('how_summary')}</summary>
                <div className="dir-more-body">
                  <p>{tt('method_1')}</p>
                  <p>{tt('method_2')}</p>
                  <p>{tt('method_3')}</p>
                  <p><strong>{tt('honest_title')}</strong> {tt('honest_1')}</p>
                  <p>{tt('honest_2')}</p>
                  {extraNote && <p><strong>{tt(extraNote)}</strong></p>}
                </div>
              </details>
            </aside>

            <div>
              <h1 className="dir-h1">
                {tt('results_headline')
                  .replace('{trade}', tt(`cat_${shownTrade}_pl`))
                  .replace('{town}', shownTown ? shownTown.name : '')}
              </h1>
              <div className="dir-meta">
                <span>{tt('meta_ranked')}</span>
                <span className="dir-dot" />
                <span>{tt('meta_free')}</span>
              </div>

              {busy && (
                <div aria-live="polite">
                  <div className="dir-skel" /><div className="dir-skel" /><div className="dir-skel" />
                </div>
              )}

              {state === 'error' && <div className="dir-msg err" role="alert">{message}</div>}

              {state === 'done' && providers.length === 0 && shownTown && (
                <div className="dir-msg info">
                  {tt('none_found').replace('{trade}', tt(`cat_${shownTrade}`)).replace('{town}', shownTown.name)}
                </div>
              )}

              {state === 'done' && providers.length > 0 && (
                <section aria-live="polite">
                  {providers.slice(0, 3).map((p, i) => {
                    const foreign = Object.keys(p.review_langs || {}).filter(l => l && l !== 'es');
                    const reviews = (p.reviews || []).slice(0, i === 0 ? 2 : 1);
                    return (
                      <article key={p.id} className={`dir-card ${i === 0 ? 'top' : ''}`}>
                        <p className="dir-rank">
                          <span className="num">{i + 1}</span>
                          {i === 0 ? tt('best_rated') : tt('rank_also')}
                        </p>
                        <h2 className="dir-name">{p.name}</h2>
                        {p.address && <p className="dir-addr">{p.address}</p>}

                        <div className="dir-rating">
                          <span className="dir-score">{Number(p.rating).toFixed(1)}</span>
                          <span className="dir-stars" aria-hidden="true">{STARS(p.rating)}</span>
                          <span className="dir-count">
                            {tt('review_count_line').replace('{count}', String(p.review_count))}
                          </span>
                          {/* Spanish reviews are the default and saying so tells a foreign
                              owner nothing. A review in English or German does. */}
                          {foreign.length > 0 && (
                            <span className="dir-langs">
                              {tt('langs_line').replace('{langs}', foreign.map(l => langName(l, locale)).join(', '))}
                            </span>
                          )}
                        </div>

                        <div className="dir-actions">
                          {p.phone
                            ? <a className="dir-call" href={`tel:${p.phone.replace(/\s/g, '')}`}>{tt('call')} {p.phone}</a>
                            : <span className="dir-nophone">{tt('no_phone')}</span>}
                          <span className="dir-links">
                            {p.website && <a href={p.website} target="_blank" rel="noopener noreferrer nofollow">{tt('website')}</a>}
                            {p.maps_uri && <a href={p.maps_uri} target="_blank" rel="noopener noreferrer">{tt('on_google')}</a>}
                          </span>
                        </div>

                        {reviews.length > 0 && (
                          <div className="dir-reviews">
                            {reviews.map((rv, ri) => <Review key={ri} rv={rv} tt={tt} />)}
                          </div>
                        )}
                      </article>
                    );
                  })}

                  {/* Everyone else Google returned, as one line each. Three full cards
                      is enough to compare properly; a list this size is there so the page
                      does not look like the town has one plumber. */}
                  {providers.length > 3 && (
                    <>
                      <p className="dir-result-label" style={{ marginTop: 30, marginBottom: 12 }}>
                        {tt('also_rated')}
                      </p>
                      {providers.slice(3).map((p, i) => (
                        <div className="dir-more-row" key={p.id}>
                          <span className="n">{i + 4}</span>
                          <span className="nm">{p.name}</span>
                          <span className="sc">
                            <b>{Number(p.rating).toFixed(1)}</b>{' '}
                            {tt('review_count_line').replace('{count}', String(p.review_count))}
                          </span>
                          {p.phone && <a href={`tel:${p.phone.replace(/\s/g, '')}`}>{p.phone}</a>}
                          {p.maps_uri && <a href={p.maps_uri} target="_blank" rel="noopener noreferrer">{tt('on_google')}</a>}
                        </div>
                      ))}
                    </>
                  )}

                  <p style={{ marginTop: 26, fontFamily: 'var(--font-sans)', fontSize: 13 }}>
                    <LLink to="/cost-audit" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                      {tt('cross_link')} &#8594;
                    </LLink>
                  </p>
                </section>
              )}
            </div>
          </div>
        )}
      </main>

      <SiteFooter note={tt('footer')} />
    </div>
  );
}
