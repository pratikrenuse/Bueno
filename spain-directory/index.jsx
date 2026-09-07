import { useState, useEffect, useRef, useMemo } from 'react';
import { useT, LLink } from '../i18n.jsx';
import LangSwitcher from '../LangSwitcher.jsx';
import { LOCALITIES, searchLocalities } from './localities.js';
import { CATEGORIES } from './categories.js';

// Spain 24/7 trade directory.
//
// The whole screen answers one question a property owner has at a bad moment: who do I
// call. So the scan path is deliberately linear. Where are you, what broke, here are
// three numbers and the reason we picked them. Nothing else competes for attention.
//
// Everything shown about a business comes from Google. We have not met these people and
// the page says so, in the same calm voice as the rest of the site. Google's terms
// require the attribution that appears under the results, the reviewer's name, photo and
// profile link on each quote, a link to the review itself, and a plain statement of how
// results were ordered. All of that is below and must not be removed.

const STYLES = `
.dir-wrap { max-width: 860px; margin: 0 auto; padding: 0 24px 80px; }
.dir-step-label { font-family: var(--font-sans); font-size: 12px; letter-spacing: 1.4px;
  text-transform: uppercase; color: var(--accent); margin: 0 0 10px; }
.dir-h1 { font-size: clamp(30px, 5vw, 46px); line-height: 1.1; margin: 0 0 14px; }
.dir-lede { font-size: 17px; line-height: 1.6; color: #4a4f63; max-width: 56ch; margin: 0 0 36px; }

.dir-search-wrap { position: relative; margin-bottom: 8px; }
.dir-search { width: 100%; padding: 18px 20px; font-size: 17px; font-family: var(--font-sans);
  border: 1px solid #cfd3de; border-radius: 12px; background: #fff; color: #010221; }
.dir-search:focus { outline: 3px solid rgba(91,127,204,0.4); outline-offset: 1px; border-color: #5B7FCC; }
.dir-listbox { position: absolute; z-index: 20; left: 0; right: 0; top: calc(100% + 6px);
  background: #fff; border: 1px solid #cfd3de; border-radius: 12px; overflow: hidden;
  box-shadow: 0 18px 40px rgba(1,2,33,0.14); max-height: 320px; overflow-y: auto; }
.dir-option { display: block; width: 100%; text-align: left; padding: 14px 18px; min-height: 48px;
  border: 0; background: none; cursor: pointer; font-family: var(--font-sans); font-size: 15px; color: #010221; }
.dir-option:hover, .dir-option[aria-selected="true"] { background: #CBEFFF; }
.dir-option span { color: #6b7085; font-size: 13px; margin-left: 8px; }

.dir-chosen { display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  padding: 14px 18px; background: #F4F7FC; border: 1px solid #dde3ef; border-radius: 12px; margin-bottom: 32px; }
.dir-chosen-name { font-weight: 600; font-size: 16px; }
.dir-change { background: none; border: 0; color: #5B7FCC; font-family: var(--font-sans);
  font-size: 14px; cursor: pointer; text-decoration: underline; padding: 8px; min-height: 44px; }

.dir-trades { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 40px; }
.dir-trade { padding: 20px 18px; min-height: 76px; text-align: left; cursor: pointer;
  background: #fff; border: 1px solid #dde3ef; border-radius: 12px;
  font-family: var(--font-sans); font-size: 16px; color: #010221; transition: border-color .15s, background .15s; }
.dir-trade:hover { border-color: #5B7FCC; background: #F4F7FC; }
.dir-trade[aria-pressed="true"] { background: #010221; border-color: #010221; color: #fff; }
.dir-trade:focus-visible { outline: 3px solid rgba(91,127,204,0.5); outline-offset: 2px; }

.dir-card { border: 1px solid #dde3ef; border-radius: 14px; padding: 26px; margin-bottom: 16px; background: #fff; }
.dir-card.top { border: 2px solid #C9A96E; padding: 25px; }
.dir-rank { display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-sans);
  font-size: 12px; letter-spacing: 1.2px; text-transform: uppercase; color: #6b7085; margin-bottom: 10px; }
.dir-rank .num { display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; border-radius: 50%; background: #010221; color: #fff; font-size: 12px; letter-spacing: 0; }
.dir-card.top .dir-rank { color: #8a6d28; }
.dir-card.top .dir-rank .num { background: #C9A96E; color: #010221; }
.dir-name { font-size: 22px; line-height: 1.25; margin: 0 0 6px; }
.dir-addr { font-size: 14px; color: #6b7085; margin: 0 0 16px; }
.dir-stars { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; margin-bottom: 18px; }
.dir-score { font-size: 26px; font-weight: 600; }
.dir-count { font-size: 14px; color: #6b7085; }
.dir-langs { font-size: 13px; color: #3f6b3f; background: #EDF6ED; border: 1px solid #cfe3cf;
  border-radius: 999px; padding: 4px 12px; }
.dir-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
.dir-call { display: inline-flex; align-items: center; min-height: 48px; padding: 12px 26px;
  background: #010221; color: #fff; border-radius: 10px; text-decoration: none;
  font-family: var(--font-sans); font-size: 16px; font-weight: 600; }
.dir-call:hover { background: #1b1d3d; }
.dir-secondary { display: inline-flex; align-items: center; min-height: 48px; padding: 12px 20px;
  border: 1px solid #cfd3de; border-radius: 10px; text-decoration: none; color: #010221;
  font-family: var(--font-sans); font-size: 15px; background: #fff; }
.dir-secondary:hover { border-color: #5B7FCC; color: #5B7FCC; }
.dir-quote { border-top: 1px solid #eef1f6; padding-top: 16px; margin-top: 4px; }
.dir-quote-head { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.dir-quote-head img { width: 28px; height: 28px; border-radius: 50%; }
.dir-quote-who { font-family: var(--font-sans); font-size: 13px; color: #010221; text-decoration: none; }
.dir-quote-who:hover { text-decoration: underline; }
.dir-quote-when { font-size: 12px; color: #8b8fa0; }
.dir-quote-text { font-size: 15px; line-height: 1.6; color: #33384a; margin: 0; }
.dir-quote-link { font-size: 12px; color: #5B7FCC; text-decoration: none; }

.dir-note { background: #F8F7F4; border: 1px solid #e6e3dc; border-radius: 12px;
  padding: 20px 22px; margin-top: 32px; font-size: 14px; line-height: 1.65; color: #4a4f63; }
.dir-note h3 { font-size: 14px; margin: 0 0 8px; letter-spacing: 0.3px; }
.dir-note p { margin: 0 0 10px; }
.dir-note p:last-child { margin: 0; }
.dir-attrib { display: flex; align-items: center; gap: 8px; font-family: var(--font-sans);
  font-size: 13px; color: #6b7085; margin-top: 18px; }
.dir-msg { padding: 22px; border-radius: 12px; font-size: 15px; line-height: 1.6; }
.dir-msg.err { background: #FDF2F2; border: 1px solid #F3CFCF; color: #8A2F2F; }
.dir-msg.info { background: #F4F7FC; border: 1px solid #dde3ef; color: #33384a; }
.dir-skel { height: 132px; border-radius: 14px; margin-bottom: 16px;
  background: linear-gradient(90deg,#f2f4f8 25%,#e8ebf2 37%,#f2f4f8 63%); background-size: 400% 100%;
  animation: dirsheen 1.3s ease infinite; }
@keyframes dirsheen { 0% { background-position: 100% 0 } 100% { background-position: 0 0 } }
@media (prefers-reduced-motion: reduce) { .dir-skel { animation: none } }
`;

const STARS = (rating) => {
  const full = Math.round(Number(rating) || 0);
  return '★'.repeat(full) + '☆'.repeat(Math.max(0, 5 - full));
};

export default function SpainDirectory() {
  const t = useT();
  const tt = (k) => t(`calc_directory.${k}`);

  const [query, setQuery] = useState('');
  const [locality, setLocality] = useState(null);
  const [category, setCategory] = useState(null);
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [state, setState] = useState('idle'); // idle | loading | done | error
  const [providers, setProviders] = useState([]);
  const [message, setMessage] = useState('');
  const boxRef = useRef(null);

  const matches = useMemo(() => searchLocalities(query), [query]);

  useEffect(() => { document.title = `${tt('meta_title')} | Spain 24/7`; }, []);

  useEffect(() => {
    const onClick = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function choose(l) {
    setLocality(l);
    setQuery('');
    setOpen(false);
    setCategory(null);
    setProviders([]);
    setState('idle');
    setMessage('');
  }

  function onKeyDown(e) {
    if (!open || !matches.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, matches.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); choose(matches[cursor]); }
    else if (e.key === 'Escape') { setOpen(false); }
  }

  async function load(cat) {
    setCategory(cat);
    setState('loading');
    setMessage('');
    setProviders([]);
    try {
      const r = await fetch(`/api/directory?locality=${encodeURIComponent(locality.slug)}&category=${encodeURIComponent(cat.slug)}`);
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
        <LangSwitcher />
      </header>

      <main className="dir-wrap">
        <p className="dir-step-label">{tt('eyebrow')}</p>
        <h1 className="dir-h1">{tt('headline')}</h1>
        <p className="dir-lede">{tt('lede')}</p>

        {/* Step 1: where */}
        {!locality && (
          <div className="dir-search-wrap" ref={boxRef}>
            <label htmlFor="dir-town" className="dir-step-label">{tt('where_label')}</label>
            <input
              id="dir-town"
              className="dir-search"
              type="text"
              autoComplete="off"
              role="combobox"
              aria-expanded={open && matches.length > 0}
              aria-controls="dir-town-list"
              aria-autocomplete="list"
              placeholder={tt('where_placeholder')}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setOpen(true); setCursor(0); }}
              onFocus={() => setOpen(true)}
              onKeyDown={onKeyDown}
            />
            {open && matches.length > 0 && (
              <ul id="dir-town-list" className="dir-listbox" role="listbox">
                {matches.map((l, i) => (
                  <li key={l.slug} role="option" aria-selected={i === cursor}>
                    <button type="button" className="dir-option" aria-selected={i === cursor}
                      onMouseEnter={() => setCursor(i)} onClick={() => choose(l)}>
                      {l.name}<span>{l.province}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {query.length >= 2 && matches.length === 0 && (
              <p className="dir-msg info" style={{ marginTop: 12 }}>
                {tt('no_locality').replace('{count}', String(LOCALITIES.length))}
              </p>
            )}
          </div>
        )}

        {/* Step 2: what broke */}
        {locality && (
          <>
            <div className="dir-chosen">
              <span className="dir-chosen-name">{locality.name}</span>
              <span style={{ color: '#6b7085', fontSize: 14 }}>{locality.province}</span>
              <button type="button" className="dir-change" onClick={() => { setLocality(null); setCategory(null); setProviders([]); setState('idle'); }}>
                {tt('change_town')}
              </button>
            </div>

            <p className="dir-step-label">{tt('trade_label')}</p>
            <div className="dir-trades">
              {CATEGORIES.map(c => (
                <button key={c.slug} type="button" className="dir-trade"
                  aria-pressed={category && category.slug === c.slug}
                  onClick={() => load(c)}>
                  {tt(`cat_${c.slug}`)}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 3: who to call */}
        {state === 'loading' && (
          <div aria-live="polite">
            <p className="dir-step-label">{tt('loading')}</p>
            <div className="dir-skel" /><div className="dir-skel" /><div className="dir-skel" />
          </div>
        )}

        {state === 'error' && (
          <div className="dir-msg err" role="alert">{message}</div>
        )}

        {state === 'done' && providers.length === 0 && (
          <div className="dir-msg info">
            {tt('none_found').replace('{trade}', tt(`cat_${category.slug}`)).replace('{town}', locality.name)}
          </div>
        )}

        {state === 'done' && providers.length > 0 && (
          <section aria-live="polite">
            <p className="dir-step-label">
              {tt('results_label').replace('{trade}', tt(`cat_${category.slug}`)).replace('{town}', locality.name)}
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
                  <span aria-hidden="true" style={{ color: '#C9A96E', fontSize: 17 }}>{STARS(p.rating)}</span>
                  <span className="dir-count">
                    {tt('rating_line').replace('{rating}', Number(p.rating).toFixed(1)).replace('{count}', String(p.review_count))}
                  </span>
                  {Object.keys(p.review_langs || {}).length > 0 && (
                    <span className="dir-langs">
                      {tt('langs_line').replace('{langs}', Object.entries(p.review_langs).map(([l, n]) => `${n} ${l.toUpperCase()}`).join(', '))}
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
                <p className="dir-step-label" style={{ marginTop: 32 }}>{tt('also_rated')}</p>
                {rest.map(p => (
                  <article key={p.id} className="dir-card">
                    <h2 className="dir-name" style={{ fontSize: 18 }}>{p.name}</h2>
                    <div className="dir-stars" style={{ marginBottom: 12 }}>
                      <span className="dir-score" style={{ fontSize: 18 }}>{Number(p.rating).toFixed(1)}</span>
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

            {/* Google requires that we say how these were ordered and filtered, and that
                the Google Maps mark appears with the content. It is also just honest. */}
            <div className="dir-note">
              <h3>{tt('method_title')}</h3>
              <p>{tt('method_1')}</p>
              <p>{tt('method_2')}</p>
              <p>{tt('method_3')}</p>
              <div className="dir-attrib">
                <span>{tt('powered_by')}</span>
                <strong style={{ color: '#010221', fontWeight: 600 }}>Google Maps</strong>
              </div>
            </div>
          </section>
        )}

        <div className="dir-note" style={{ marginTop: 24 }}>
          <h3>{tt('honest_title')}</h3>
          <p>{tt('honest_1')}</p>
          <p>{tt('honest_2')}</p>
        </div>

        <p style={{ marginTop: 32, fontFamily: 'var(--font-sans)', fontSize: 13 }}>
          <LLink to="/cost-audit" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
            {tt('cross_link')} &#8594;
          </LLink>
        </p>
      </main>

      <footer className="calc-footer">{tt('footer')}</footer>
    </div>
  );
}
