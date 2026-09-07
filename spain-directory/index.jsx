import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useT, LLink, useLocale } from '../i18n.jsx';
import LangSwitcher from '../LangSwitcher.jsx';
import SiteFooter from '../SiteFooter.jsx';
import { LOCALITIES, LOCALITY_BY_SLUG, REGIONS } from './localities.js';
import { CATEGORIES, CATEGORY_BY_SLUG } from './categories.js';

// Spain 24/7 trade directory.
//
// Two decisions drive this layout.
//
// First, the controls are two dropdowns and a button, a shape everyone has used before.
// The original version only let you type, and a search box with no visible options gives
// a visitor nothing to react to. A menu shows there are 94 towns before you touch it.
//
// Second, the form collapses once there are results. Leaving a full-size form, six
// shortcut chips and a lede sitting above the answer pushed the first plumber most of a
// screen down and left the page looking empty. After a search it becomes one line naming
// the town, and the answer starts near the top where it belongs.
//
// The layout uses the site's own step-screen / step-inner classes. That is not only for
// looks: .calc-header is position:fixed, and .step-screen is what reserves the 130px of
// top padding that stops the headline disappearing underneath it.
//
// Town and trade are mirrored into the URL (?town=javea&trade=plumber) so the home page
// can link straight to an answer, and so a result can be shared or indexed.
//
// Everything shown about a business comes from Google. Two things below are required and
// must not be removed: the visible "Ratings and reviews from Google Maps" line, and the
// reviewer name, photo, profile link and review link on every quote. The longer
// explanation of how results are ordered is also required by Google's terms, but it
// lives in a disclosure rather than a slab of grey text, because nobody was reading it
// where it was.

const STYLES = `
.dir-lede { font-family: var(--font-sans); font-size: 17px; font-weight: 300; line-height: 1.75;
  color: var(--text-muted); max-width: 58ch; margin: 0 0 26px; }

.dir-form { display: grid; grid-template-columns: 1.4fr 1fr auto; gap: 12px; align-items: end; margin-bottom: 14px; }
@media (max-width: 720px) { .dir-form { grid-template-columns: 1fr; } }
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
@media (max-width: 720px) { .dir-go { width: 100%; } }

.dir-quick { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 30px; }
.dir-quick > span { font-family: var(--font-sans); font-size: 11px; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--text-muted); margin-right: 2px; }
.dir-quick button, .dir-switch button { font-family: var(--font-sans); font-size: 13px;
  padding: 8px 16px; min-height: 38px; border: 1px solid var(--border); border-radius: 999px;
  background: var(--white); color: var(--navy); cursor: pointer; transition: all var(--transition); }
.dir-quick button:hover, .dir-switch button:hover { border-color: var(--navy); }

/* Once there are results this replaces the whole form. */
.dir-switch { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
.dir-switch button[aria-pressed="true"] { background: var(--navy); border-color: var(--navy); color: var(--white); }

.dir-result-label { font-family: var(--font-sans); font-size: 10px; font-weight: 500;
  letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent); margin: 0 0 12px; }

.dir-card { background: var(--white); border: 1px solid var(--border); border-radius: 18px;
  padding: 26px; margin-bottom: 12px; }
.dir-card.top { border: 1px solid var(--gold); box-shadow: 0 12px 34px rgba(1,2,33,0.07); }
.dir-rank { display: inline-flex; align-items: center; gap: 10px; font-family: var(--font-sans);
  font-size: 10px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--text-muted); margin-bottom: 12px; }
.dir-rank .num { display: inline-flex; align-items: center; justify-content: center;
  width: 21px; height: 21px; border-radius: 50%; background: var(--navy); color: var(--white);
  font-size: 11px; letter-spacing: 0; }
.dir-card.top .dir-rank { color: #9A7B37; }
.dir-card.top .dir-rank .num { background: var(--gold); color: var(--navy); }
.dir-name { font-family: var(--font-serif); font-size: 24px; font-weight: 400; color: var(--navy);
  line-height: 1.2; letter-spacing: -0.01em; margin: 0 0 4px; }
.dir-addr { font-family: var(--font-sans); font-size: 13px; font-weight: 300;
  color: var(--text-muted); margin: 0 0 14px; }
.dir-stars { display: flex; align-items: center; gap: 11px; flex-wrap: wrap; margin-bottom: 16px; }
.dir-score { font-family: var(--font-serif); font-size: 28px; color: var(--navy); line-height: 1; }
.dir-count { font-family: var(--font-sans); font-size: 13px; font-weight: 300; color: var(--text-muted); }
.dir-langs { font-family: var(--font-sans); font-size: 12px; color: var(--navy);
  background: var(--light-blue); border-radius: 999px; padding: 5px 13px; }
.dir-actions { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; }
.dir-links { display: flex; gap: 18px; flex-wrap: wrap; }
.dir-links a { font-family: var(--font-sans); font-size: 13px; color: var(--accent);
  text-decoration: none; border-bottom: 1px solid transparent; padding: 6px 0; }
.dir-links a:hover { border-bottom-color: var(--accent); }
.dir-nophone { font-family: var(--font-sans); font-size: 13px; color: var(--text-muted); }
.dir-h1 { font-family: var(--font-serif); font-size: clamp(25px, 3.6vw, 36px); font-weight: 400;
  color: var(--navy); line-height: 1.14; letter-spacing: -0.01em; margin: 0 0 10px; }
.dir-h1 em { font-style: italic; color: var(--accent); }
.dir-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 22px;
  font-family: var(--font-sans); font-size: 13px; font-weight: 300; color: var(--text-muted); }
.dir-meta button { font-family: var(--font-sans); font-size: 13px; color: var(--accent);
  background: none; border: 0; cursor: pointer; padding: 6px 0; text-decoration: underline; }
.dir-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--warm-grey); }
.dir-call { display: inline-flex; align-items: center; min-height: 50px; padding: 15px 28px;
  background: var(--navy); color: var(--white); border-radius: 14px; text-decoration: none;
  font-family: var(--font-sans); font-size: 12px; font-weight: 500; letter-spacing: 0.14em;
  text-transform: uppercase; transition: background var(--transition); }
.dir-call:hover { background: #1a1d4a; }
.dir-secondary { display: inline-flex; align-items: center; min-height: 50px; padding: 15px 22px;
  border: 1px solid var(--border); border-radius: 14px; text-decoration: none; color: var(--navy);
  font-family: var(--font-sans); font-size: 12px; font-weight: 500; letter-spacing: 0.14em;
  text-transform: uppercase; background: var(--white); transition: all var(--transition); }
.dir-secondary:hover { border-color: var(--navy); }
.dir-quote { border-top: 1px solid var(--border); padding-top: 15px; margin-top: 16px; }
.dir-quote-head { display: flex; align-items: center; gap: 9px; margin-bottom: 7px; flex-wrap: wrap; }
.dir-quote-head img { width: 24px; height: 24px; border-radius: 50%; }
.dir-quote-who { font-family: var(--font-sans); font-size: 13px; color: var(--navy); text-decoration: none; }
.dir-quote-who:hover { text-decoration: underline; }
.dir-quote-when { font-family: var(--font-sans); font-size: 12px; color: var(--text-muted); }
.dir-quote-text { font-family: var(--font-sans); font-size: 15px; font-weight: 300; line-height: 1.65;
  color: var(--navy); margin: 0 0 6px; }
.dir-quote-link { font-family: var(--font-sans); font-size: 12px; color: var(--accent); text-decoration: none; }

/* Attribution stays visible. The long explanation folds away. */
.dir-attrib { display: flex; align-items: center; gap: 6px; font-family: var(--font-sans);
  font-size: 12px; color: var(--text-muted); margin: 16px 0 0; }
.dir-more { margin-top: 14px; border-top: 1px solid var(--border); padding-top: 14px; }
.dir-more summary { font-family: var(--font-sans); font-size: 12px; font-weight: 500;
  letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent); cursor: pointer;
  list-style: none; padding: 8px 0; min-height: 38px; display: flex; align-items: center; gap: 8px; }
.dir-more summary::-webkit-details-marker { display: none; }
.dir-more summary::after { content: '+'; font-size: 15px; }
.dir-more[open] summary::after { content: '\\2212'; }
.dir-more-body { font-family: var(--font-sans); font-size: 14px; font-weight: 300; line-height: 1.75;
  color: var(--text-muted); padding-bottom: 8px; max-width: 62ch; }
.dir-more-body p { margin: 0 0 12px; }
.dir-more-body p:last-child { margin: 0; }
.dir-more-body strong { color: var(--navy); font-weight: 500; }

.dir-msg { font-family: var(--font-sans); font-size: 15px; font-weight: 300; line-height: 1.7;
  padding: 22px 24px; border-radius: 14px; }
.dir-msg.err { background: #FDF4F4; border: 1px solid #EBCFCF; color: #8A2F2F; }
.dir-msg.info { background: var(--off-white); border: 1px solid var(--border); color: var(--navy); }

.dir-skel { height: 140px; border-radius: 18px; margin-bottom: 12px; border: 1px solid var(--border);
  background: linear-gradient(90deg,#FAFAF8 25%,#F0EFEB 37%,#FAFAF8 63%); background-size: 400% 100%;
  animation: dirsheen 1.4s ease infinite; }
@keyframes dirsheen { 0% { background-position: 100% 0 } 100% { background-position: 0 0 } }
@media (prefers-reduced-motion: reduce) { .dir-skel { animation: none } }
`;

const QUICK = ['torrevieja', 'marbella', 'javea', 'benidorm', 'palma', 'alicante'];

// Intl gives us localised language names for free, so a Norwegian sees "engelsk".
function langName(code, locale) {
  try { return new Intl.DisplayNames([locale], { type: 'language' }).of(code); }
  catch { return String(code || '').toUpperCase(); }
}

const STARS = (rating) => {
  const full = Math.round(Number(rating) || 0);
  return '★'.repeat(full) + '☆'.repeat(Math.max(0, 5 - full));
};

export default function SpainDirectory() {
  const t = useT();
  const tt = (k) => t(`calc_directory.${k}`);
  const { locale } = useLocale();
  const [params, setParams] = useSearchParams();

  const urlTown = params.get('town') || '';
  const urlTrade = params.get('trade') || '';
  const deepLinked = !!(LOCALITY_BY_SLUG[urlTown] && CATEGORY_BY_SLUG[urlTrade]);

  const [town, setTown] = useState(LOCALITY_BY_SLUG[urlTown] ? urlTown : '');
  const [trade, setTrade] = useState(CATEGORY_BY_SLUG[urlTrade] ? urlTrade : 'plumber');
  const [formOpen, setFormOpen] = useState(!deepLinked);
  const [shown, setShown] = useState(null);
  const [state, setState] = useState('idle');
  const [providers, setProviders] = useState([]);
  const [message, setMessage] = useState('');

  // 94 towns grouped by coast reads as eight short lists instead of one long one.
  const grouped = useMemo(() => {
    const out = [];
    for (const [key, label] of Object.entries(REGIONS)) {
      const items = LOCALITIES.filter(l => l.region === key).sort((a, b) => a.name.localeCompare(b.name));
      if (items.length) out.push({ key, label, items });
    }
    return out;
  }, []);

  useEffect(() => { document.title = `${tt('meta_title')} | Spain 24/7`; }, []);

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
    setFormOpen(false);
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
  const top3 = providers.slice(0, 3);
  const rest = providers.slice(3);
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
          <span className="calc-header-tag">{tt('eyebrow')}</span>
          <LangSwitcher />
        </div>
      </header>

      <main className="step-screen" style={{ minHeight: 0 }}>
        <div className="step-inner" style={{ maxWidth: 780 }}>

          {formOpen && (
            <>
              <div className="home-eyebrow" style={{ marginBottom: 16 }}>
                <span className="home-eyebrow-line" />
                <span className="home-eyebrow-text">{tt('eyebrow')}</span>
              </div>
              <h1 className="step-question" style={{ marginBottom: 12 }}>{tt('headline')}</h1>
              <p className="dir-lede">{tt('lede')}</p>

              <form className="dir-form" onSubmit={(e) => { e.preventDefault(); run(town, trade); }}>
                <div className="dir-field">
                  <label htmlFor="dir-town">{tt('where_label')}</label>
                  <select id="dir-town" className="dir-select" value={town}
                    onChange={(e) => setTown(e.target.value)}>
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
                  <select id="dir-trade" className="dir-select" value={trade}
                    onChange={(e) => setTrade(e.target.value)}>
                    {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{tt(`cat_${c.slug}`)}</option>)}
                  </select>
                </div>
                <button type="submit" className="btn-primary dir-go" disabled={!town}>{tt('find_cta')}</button>
              </form>

              <div className="dir-quick">
                <span>{tt('popular')}</span>
                {QUICK.map(slug => {
                  const l = LOCALITY_BY_SLUG[slug];
                  return l ? (
                    <button key={slug} type="button" onClick={() => { setTown(slug); run(slug, trade); }}>
                      {l.name}
                    </button>
                  ) : null;
                })}
              </div>
            </>
          )}

{/* Once there are results the form above collapses into this. A deep link from the
              home page lands here with no form at all, so this headline is the only thing
              telling the visitor what they are looking at. It doubles as the page's H1. */}
          {!formOpen && shownTown && (
            <>
              <h1 className="dir-h1">
                {tt('results_headline')
                  .replace('{trade}', tt(`cat_${shownTrade}_pl`))
                  .replace('{town}', shownTown.name)}
              </h1>
              <div className="dir-meta">
                <span>{shownTown.province}</span>
                <span className="dir-dot" />
                <span>{tt('meta_ranked')}</span>
                <span className="dir-dot" />
                <button type="button" onClick={() => setFormOpen(true)}>{tt('change_town')}</button>
              </div>
            </>
          )}

          {/* Switching trade is one tap, and it stays put while results load. */}
          {!formOpen && shownTown && (
            <div className="dir-switch">
              {CATEGORIES.map(c => (
                <button key={c.slug} type="button" aria-pressed={c.slug === shownTrade} disabled={busy}
                  onClick={() => { setTrade(c.slug); run(shown.town, c.slug); }}>
                  {tt(`cat_${c.slug}`)}
                </button>
              ))}
            </div>
          )}

          {busy && (
            <div aria-live="polite">
              <p className="dir-result-label">{tt('loading')}</p>
              <div className="dir-skel" /><div className="dir-skel" /><div className="dir-skel" />
            </div>
          )}

          {state === 'error' && <div className="dir-msg err" role="alert">{message}</div>}

          {state === 'done' && shownTown && providers.length === 0 && (
            <div className="dir-msg info">
              {tt('none_found').replace('{trade}', tt(`cat_${shownTrade}`)).replace('{town}', shownTown.name)}
            </div>
          )}

          {state === 'done' && shownTown && providers.length > 0 && (
            <section aria-live="polite">
              {top3.map((p, i) => (
                <article key={p.id} className={`dir-card ${i === 0 ? 'top' : ''}`}>
                  <p className="dir-rank">
                    <span className="num">{i + 1}</span>
                    {i === 0 ? tt('best_rated') : tt('rank_also')}
                  </p>
                  <h2 className="dir-name">{p.name}</h2>
                  {p.address && <p className="dir-addr">{p.address}</p>}

                  <div className="dir-stars">
                    <span className="dir-score" aria-hidden="true">{Number(p.rating).toFixed(1)}</span>
                    <span aria-hidden="true" style={{ color: 'var(--gold)', fontSize: 15 }}>{STARS(p.rating)}</span>
                    <span className="dir-count">
                      {tt('rating_line').replace('{rating}', Number(p.rating).toFixed(1)).replace('{count}', String(p.review_count))}
                    </span>
{/* Spanish reviews are the default and saying so tells a foreign owner
                        nothing. A review written in English or German does tell them
                        something, so that is the only case worth a badge. */}
                    {(() => {
                      const foreign = Object.keys(p.review_langs || {}).filter(l => l && l !== 'es');
                      return foreign.length ? (
                        <span className="dir-langs">
                          {tt('langs_line').replace('{langs}', foreign.map(l => langName(l, locale)).join(', '))}
                        </span>
                      ) : null;
                    })()}
                  </div>

{/* One thing to press. Three uppercase pills wrapped onto two rows and
                      made every card look like a form. */}
                  <div className="dir-actions">
                    {p.phone
                      ? <a className="dir-call" href={`tel:${p.phone.replace(/\s/g, '')}`}>{tt('call')} {p.phone}</a>
                      : <span className="dir-nophone">{tt('no_phone')}</span>}
                    <span className="dir-links">
                      {p.website && <a href={p.website} target="_blank" rel="noopener noreferrer nofollow">{tt('website')}</a>}
                      {p.maps_uri && <a href={p.maps_uri} target="_blank" rel="noopener noreferrer">{tt('on_google')}</a>}
                    </span>
                  </div>

                  {(p.reviews || []).slice(0, i === 0 ? 2 : 1).map((rv, ri) => (
                    <div className="dir-quote" key={ri}>
                      <div className="dir-quote-head">
                        {rv.author_photo && <img src={rv.author_photo} alt="" loading="lazy" />}
                        {rv.author_uri
                          ? <a className="dir-quote-who" href={rv.author_uri} target="_blank" rel="noopener noreferrer">{rv.author}</a>
                          : <span className="dir-quote-who">{rv.author}</span>}
                        <span className="dir-quote-when">{rv.relative}</span>
                        {rv.lang && <span className="dir-quote-when">{rv.lang.toUpperCase()}</span>}
                      </div>
                      <p className="dir-quote-text">{rv.text}</p>
                      {rv.uri && <a className="dir-quote-link" href={rv.uri} target="_blank" rel="noopener noreferrer">{tt('read_on_google')}</a>}
                    </div>
                  ))}
                </article>
              ))}

              {rest.length > 0 && (
                <>
                  <p className="dir-result-label" style={{ marginTop: 26 }}>{tt('also_rated')}</p>
                  {rest.map(p => (
                    <article key={p.id} className="dir-card" style={{ padding: 20 }}>
                      <h2 className="dir-name" style={{ fontSize: 18 }}>{p.name}</h2>
                      <div className="dir-stars" style={{ marginBottom: 12 }}>
                        <span className="dir-score" style={{ fontSize: 20 }}>{Number(p.rating).toFixed(1)}</span>
                        <span className="dir-count">
                          {tt('rating_line').replace('{rating}', Number(p.rating).toFixed(1)).replace('{count}', String(p.review_count))}
                        </span>
                      </div>
                      <div className="dir-actions">
                        {p.phone && <a className="dir-secondary" href={`tel:${p.phone.replace(/\s/g, '')}`}>{p.phone}</a>}
                        {p.maps_uri && <a className="dir-secondary" href={p.maps_uri} target="_blank" rel="noopener noreferrer">{tt('on_google')}</a>}
                      </div>
                    </article>
                  ))}
                </>
              )}

              {/* Required by Google and stays visible. */}
              <p className="dir-attrib">
                {tt('powered_by')} <strong style={{ color: 'var(--navy)', fontWeight: 500 }}>Google Maps</strong>
              </p>

              {/* Also required, but folded away so it stops swallowing the page. */}
              <details className="dir-more">
                <summary>{tt('how_summary')}</summary>
                <div className="dir-more-body">
                  <p>{tt('method_1')}</p>
                  <p>{tt('method_2')}</p>
                  <p>{tt('method_3')}</p>
                  <p><strong>{tt('honest_title')}</strong> {tt('honest_1')}</p>
                  <p>{tt('honest_2')}</p>
                </div>
              </details>

              <p style={{ marginTop: 22, fontFamily: 'var(--font-sans)', fontSize: 13 }}>
                <LLink to="/cost-audit" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                  {tt('cross_link')} &#8594;
                </LLink>
              </p>
            </section>
          )}

        </div>
      </main>

      <SiteFooter note={tt('footer')} />
    </div>
  );
}
