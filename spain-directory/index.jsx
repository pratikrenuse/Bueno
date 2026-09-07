import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useT, LLink } from '../i18n.jsx';
import LangSwitcher from '../LangSwitcher.jsx';
import { LOCALITIES, LOCALITY_BY_SLUG, REGIONS } from './localities.js';
import { CATEGORIES, CATEGORY_BY_SLUG } from './categories.js';

// Spain 24/7 trade directory.
//
// The screen answers one question a property owner has at a bad moment: who do I call.
// So the controls are two dropdowns and a button, which is a shape everyone has used
// before and nobody has to learn. Typing was the only way in the first version and it
// was not obvious enough: a search box with no visible options gives the visitor nothing
// to react to. A select shows there are 94 towns before you touch it.
//
// The layout uses the site's own step-screen / step-inner / option-card classes rather
// than its own. That is not only for looks: .calc-header is position:fixed, and
// .step-screen is what reserves the 130px of top padding that stops the headline
// disappearing underneath it.
//
// Town and trade are mirrored into the URL (?town=javea&trade=plumber) so the home page
// can link straight to a result, and so a result can be shared or indexed.
//
// Everything shown about a business comes from Google. We have not met these people and
// the page says so, in the same calm voice as the rest of the site. Google's terms
// require the attribution under the results, the reviewer's name, photo and profile link
// on each quote, a link to the review itself, and a plain statement of how results were
// ordered. All of that is below and must not be removed.

const STYLES = `
.dir-form { display: grid; grid-template-columns: 1.4fr 1fr auto; gap: 12px; align-items: end;
  margin-bottom: 14px; }
@media (max-width: 720px) { .dir-form { grid-template-columns: 1fr; } }
.dir-field label { display: block; font-family: var(--font-sans); font-size: 10px; font-weight: 500;
  letter-spacing: 0.14em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px; }
.dir-select { width: 100%; min-height: 56px; padding: 16px 44px 16px 18px;
  font-family: var(--font-sans); font-size: 16px; color: var(--navy);
  background: var(--white); border: 1px solid var(--border); border-radius: 12px;
  appearance: none; cursor: pointer;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23010221' stroke-width='1.6' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 18px center; }
.dir-select:focus { outline: 3px solid rgba(91,127,204,0.35); outline-offset: 1px; border-color: var(--accent); }
.dir-go { min-height: 56px; padding: 16px 30px; white-space: nowrap; margin-bottom: 0; width: auto; }
@media (max-width: 720px) { .dir-go { width: 100%; } }

.dir-quick { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 42px; }
.dir-quick-label { font-family: var(--font-sans); font-size: 12px; color: var(--text-muted); margin-right: 4px; }
.dir-chip { font-family: var(--font-sans); font-size: 13px; padding: 8px 16px; min-height: 38px;
  border: 1px solid var(--border); border-radius: 999px; background: var(--white);
  color: var(--navy); cursor: pointer; transition: all var(--transition); }
.dir-chip:hover { border-color: var(--navy); background: var(--navy); color: var(--white); }

.dir-switch { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 36px; }
.dir-switch button { font-family: var(--font-sans); font-size: 13px; padding: 9px 18px; min-height: 40px;
  border: 1px solid var(--border); border-radius: 999px; background: var(--white);
  color: var(--navy); cursor: pointer; transition: all var(--transition); }
.dir-switch button:hover { border-color: var(--navy); }
.dir-switch button[aria-pressed="true"] { background: var(--navy); border-color: var(--navy); color: var(--white); }

.dir-result-label { font-family: var(--font-sans); font-size: 10px; font-weight: 500;
  letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent); margin: 0 0 14px; }

.dir-card { background: var(--white); border: 1px solid var(--border); border-radius: 18px;
  padding: 32px; margin-bottom: 16px; }
.dir-card.top { border: 1px solid var(--gold); box-shadow: 0 14px 40px rgba(1,2,33,0.07); }
.dir-rank { display: inline-flex; align-items: center; gap: 10px; font-family: var(--font-sans);
  font-size: 10px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--text-muted); margin-bottom: 14px; }
.dir-rank .num { display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; border-radius: 50%; background: var(--navy); color: var(--white);
  font-size: 11px; letter-spacing: 0; }
.dir-card.top .dir-rank { color: #9A7B37; }
.dir-card.top .dir-rank .num { background: var(--gold); color: var(--navy); }
.dir-name { font-family: var(--font-serif); font-size: 25px; font-weight: 400; color: var(--navy);
  line-height: 1.2; letter-spacing: -0.01em; margin: 0 0 6px; }
.dir-addr { font-family: var(--font-sans); font-size: 14px; font-weight: 300;
  color: var(--text-muted); margin: 0 0 18px; }
.dir-stars { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 22px; }
.dir-score { font-family: var(--font-serif); font-size: 30px; color: var(--navy); line-height: 1; }
.dir-count { font-family: var(--font-sans); font-size: 14px; font-weight: 300; color: var(--text-muted); }
.dir-langs { font-family: var(--font-sans); font-size: 12px; color: var(--navy);
  background: var(--light-blue); border-radius: 999px; padding: 6px 14px; }
.dir-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 6px; }
.dir-call { display: inline-flex; align-items: center; min-height: 52px; padding: 16px 30px;
  background: var(--navy); color: var(--white); border-radius: 14px; text-decoration: none;
  font-family: var(--font-sans); font-size: 12px; font-weight: 500; letter-spacing: 0.14em;
  text-transform: uppercase; transition: background var(--transition); }
.dir-call:hover { background: #1a1d4a; }
.dir-secondary { display: inline-flex; align-items: center; min-height: 52px; padding: 16px 24px;
  border: 1px solid var(--border); border-radius: 14px; text-decoration: none; color: var(--navy);
  font-family: var(--font-sans); font-size: 12px; font-weight: 500; letter-spacing: 0.14em;
  text-transform: uppercase; background: var(--white); transition: all var(--transition); }
.dir-secondary:hover { border-color: var(--navy); }
.dir-quote { border-top: 1px solid var(--border); padding-top: 18px; margin-top: 20px; }
.dir-quote-head { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; flex-wrap: wrap; }
.dir-quote-head img { width: 26px; height: 26px; border-radius: 50%; }
.dir-quote-who { font-family: var(--font-sans); font-size: 13px; color: var(--navy); text-decoration: none; }
.dir-quote-who:hover { text-decoration: underline; }
.dir-quote-when { font-family: var(--font-sans); font-size: 12px; color: var(--text-muted); }
.dir-quote-text { font-family: var(--font-sans); font-size: 15px; font-weight: 300; line-height: 1.7;
  color: var(--navy); margin: 0 0 8px; }
.dir-quote-link { font-family: var(--font-sans); font-size: 12px; color: var(--accent); text-decoration: none; }

.dir-note { background: var(--off-white); border: 1px solid var(--border); border-radius: 18px;
  padding: 28px 30px; margin-top: 32px; font-family: var(--font-sans); font-size: 14px;
  font-weight: 300; line-height: 1.75; color: var(--navy); }
.dir-note h3 { font-family: var(--font-sans); font-size: 10px; font-weight: 500; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--text-muted); margin: 0 0 12px; }
.dir-note p { margin: 0 0 12px; }
.dir-note p:last-child { margin: 0; }
.dir-attrib { display: flex; align-items: center; gap: 6px; font-size: 13px;
  color: var(--text-muted); margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border); }

.dir-msg { font-family: var(--font-sans); font-size: 15px; font-weight: 300; line-height: 1.7;
  padding: 24px 26px; border-radius: 14px; }
.dir-msg.err { background: #FDF4F4; border: 1px solid #EBCFCF; color: #8A2F2F; }
.dir-msg.info { background: var(--off-white); border: 1px solid var(--border); color: var(--navy); }

.dir-skel { height: 150px; border-radius: 18px; margin-bottom: 16px; border: 1px solid var(--border);
  background: linear-gradient(90deg,#FAFAF8 25%,#F0EFEB 37%,#FAFAF8 63%); background-size: 400% 100%;
  animation: dirsheen 1.4s ease infinite; }
@keyframes dirsheen { 0% { background-position: 100% 0 } 100% { background-position: 0 0 } }
@media (prefers-reduced-motion: reduce) { .dir-skel { animation: none } }
`;

// Towns a foreign owner is most likely to want, offered as one-click shortcuts so the
// page is usable without opening a menu at all.
const QUICK = ['torrevieja', 'marbella', 'javea', 'benidorm', 'palma', 'alicante'];

const STARS = (rating) => {
  const full = Math.round(Number(rating) || 0);
  return '★'.repeat(full) + '☆'.repeat(Math.max(0, 5 - full));
};

export default function SpainDirectory() {
  const t = useT();
  const tt = (k) => t(`calc_directory.${k}`);
  const [params, setParams] = useSearchParams();

  const urlTown = params.get('town') || '';
  const urlTrade = params.get('trade') || '';

  const [town, setTown] = useState(LOCALITY_BY_SLUG[urlTown] ? urlTown : '');
  const [trade, setTrade] = useState(CATEGORY_BY_SLUG[urlTrade] ? urlTrade : 'plumber');
  const [shown, setShown] = useState(null); // {town, trade} actually being displayed
  const [state, setState] = useState('idle'); // idle | loading | done | error
  const [providers, setProviders] = useState([]);
  const [message, setMessage] = useState('');

  // Towns grouped by coast, so a menu of 94 entries reads as eight short lists.
  const grouped = useMemo(() => {
    const out = [];
    for (const [key, label] of Object.entries(REGIONS)) {
      const items = LOCALITIES.filter(l => l.region === key).sort((a, b) => a.name.localeCompare(b.name));
      if (items.length) out.push({ key, label, items });
    }
    return out;
  }, []);

  useEffect(() => { document.title = `${tt('meta_title')} | Spain 24/7`; }, []);

  // A link that already names a town and trade runs the lookup on arrival, which is what
  // makes the home page shortcut land on an answer rather than on an empty form.
  useEffect(() => {
    if (LOCALITY_BY_SLUG[urlTown] && CATEGORY_BY_SLUG[urlTrade]) run(urlTown, urlTrade);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function run(townSlug, tradeSlug) {
    if (!townSlug) return;
    setState('loading');
    setMessage('');
    setProviders([]);
    setShown({ town: townSlug, trade: tradeSlug });
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

      <main className="step-screen">
        <div className="step-inner" style={{ maxWidth: 780 }}>

          <div className="home-eyebrow" style={{ marginBottom: 18 }}>
            <span className="home-eyebrow-line" />
            <span className="home-eyebrow-text">{tt('eyebrow')}</span>
          </div>

          <h1 className="step-question" style={{ marginBottom: 14 }}>{tt('headline')}</h1>

          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 17, fontWeight: 300,
            lineHeight: 1.75, color: 'var(--text-muted)', maxWidth: '58ch', margin: '0 0 34px' }}>
            {tt('lede')}
          </p>

          {/* Two menus and a button. Nothing to learn. */}
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
                {CATEGORIES.map(c => (
                  <option key={c.slug} value={c.slug}>{tt(`cat_${c.slug}`)}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn-primary dir-go" disabled={!town}>
              {tt('find_cta')}
            </button>
          </form>

          <div className="dir-quick">
            <span className="dir-quick-label">{tt('popular')}</span>
            {QUICK.map(slug => {
              const l = LOCALITY_BY_SLUG[slug];
              if (!l) return null;
              return (
                <button key={slug} type="button" className="dir-chip"
                  onClick={() => { setTown(slug); run(slug, trade); }}>
                  {l.name}
                </button>
              );
            })}
          </div>

          {state === 'loading' && (
            <div aria-live="polite">
              <p className="dir-result-label">{tt('loading')}</p>
              <div className="dir-skel" /><div className="dir-skel" /><div className="dir-skel" />
            </div>
          )}

          {state === 'error' && <div className="dir-msg err" role="alert">{message}</div>}

          {state === 'done' && shownTown && (
            <section aria-live="polite">
              {/* Once there are results, switching trade is one tap rather than a trip
                  back to the menu. This is the fast path people actually use. */}
              <div className="dir-switch">
                {CATEGORIES.map(c => (
                  <button key={c.slug} type="button" aria-pressed={c.slug === shownTrade}
                    onClick={() => { setTrade(c.slug); run(shown.town, c.slug); }}>
                    {tt(`cat_${c.slug}`)}
                  </button>
                ))}
              </div>

              {providers.length === 0 ? (
                <div className="dir-msg info">
                  {tt('none_found').replace('{trade}', tt(`cat_${shownTrade}`)).replace('{town}', shownTown.name)}
                </div>
              ) : (
                <>
                  <p className="dir-result-label">
                    {tt('results_label').replace('{trade}', tt(`cat_${shownTrade}`)).replace('{town}', shownTown.name)}
                  </p>

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
                        <span aria-hidden="true" style={{ color: 'var(--gold)', fontSize: 16 }}>{STARS(p.rating)}</span>
                        <span className="dir-count">
                          {tt('rating_line').replace('{rating}', Number(p.rating).toFixed(1)).replace('{count}', String(p.review_count))}
                        </span>
                        {Object.keys(p.review_langs || {}).length > 0 && (
                          <span className="dir-langs">
                            {tt('langs_line').replace('{langs}', Object.entries(p.review_langs)
                              .map(([l, n]) => `${n} ${l.toUpperCase()}`).join(', '))}
                          </span>
                        )}
                      </div>

                      <div className="dir-actions">
                        {p.phone
                          ? <a className="dir-call" href={`tel:${p.phone.replace(/\s/g, '')}`}>{tt('call')} {p.phone}</a>
                          : <span className="dir-secondary" aria-disabled="true">{tt('no_phone')}</span>}
                        {p.website && <a className="dir-secondary" href={p.website} target="_blank" rel="noopener noreferrer nofollow">{tt('website')}</a>}
                        {p.maps_uri && <a className="dir-secondary" href={p.maps_uri} target="_blank" rel="noopener noreferrer">{tt('on_google')}</a>}
                      </div>

                      {(p.reviews || []).slice(0, 2).map((rv, ri) => (
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
                      <p className="dir-result-label" style={{ marginTop: 34 }}>{tt('also_rated')}</p>
                      {rest.map(p => (
                        <article key={p.id} className="dir-card" style={{ padding: 24 }}>
                          <h2 className="dir-name" style={{ fontSize: 19 }}>{p.name}</h2>
                          <div className="dir-stars" style={{ marginBottom: 14 }}>
                            <span className="dir-score" style={{ fontSize: 21 }}>{Number(p.rating).toFixed(1)}</span>
                            <span className="dir-count">
                              {tt('rating_line').replace('{rating}', Number(p.rating).toFixed(1)).replace('{count}', String(p.review_count))}
                            </span>
                          </div>
                          <div className="dir-actions" style={{ marginBottom: 0 }}>
                            {p.phone && <a className="dir-secondary" href={`tel:${p.phone.replace(/\s/g, '')}`}>{p.phone}</a>}
                            {p.maps_uri && <a className="dir-secondary" href={p.maps_uri} target="_blank" rel="noopener noreferrer">{tt('on_google')}</a>}
                          </div>
                        </article>
                      ))}
                    </>
                  )}

                  {/* Google requires that we say how these were ordered and filtered, and
                      that the Google Maps mark appears with the content. */}
                  <div className="dir-note">
                    <h3>{tt('method_title')}</h3>
                    <p>{tt('method_1')}</p>
                    <p>{tt('method_2')}</p>
                    <p>{tt('method_3')}</p>
                    <div className="dir-attrib">
                      <span>{tt('powered_by')}</span>
                      <strong style={{ color: 'var(--navy)', fontWeight: 500 }}>Google Maps</strong>
                    </div>
                  </div>
                </>
              )}
            </section>
          )}

          <div className="dir-note">
            <h3>{tt('honest_title')}</h3>
            <p>{tt('honest_1')}</p>
            <p>{tt('honest_2')}</p>
          </div>

          <p style={{ marginTop: 30, fontFamily: 'var(--font-sans)', fontSize: 13 }}>
            <LLink to="/cost-audit" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
              {tt('cross_link')} &#8594;
            </LLink>
          </p>

        </div>
      </main>

      <footer className="calc-footer">{tt('footer')}</footer>
    </div>
  );
}
