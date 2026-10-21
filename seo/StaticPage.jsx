import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useLocale, useT } from '../i18n.jsx';
import SiteNav from '../SiteNav.jsx';
import SiteFooter from '../SiteFooter.jsx';
import LangSwitcher from '../LangSwitcher.jsx';

// The catch-all route.
//
// WHY THIS EXISTS
// Some published pages have no React component of their own: the answers hub, every answer,
// the about page. They exist only as the static block seo/prerender.mjs writes into #root.
// Before this component, the app booted, matched nothing (or matched /:lang and drew the home
// page), and React wiped the block. A visitor saw an empty page, and so did Google, which
// renders JavaScript before it judges a page. The answers layer was invisible to the one
// reader it was built for.
//
// Now: if the page arrived with a static block, this shows exactly that block inside the
// site's own header and footer. Same words, same links, so it cannot drift into cloaking.
// If the visitor navigated here inside the app, the block is fetched from the static file.
//
// And if there is no static block at all, the URL is not a page. That used to answer with the
// home page and a 200, which search engines count as a soft 404. It now says so, and tells
// crawlers not to index it.

const NOT_FOUND = {
  en: { h1: 'This page does not exist', p: 'The address may have changed, or it was typed slightly wrong. Everything on the site starts from the home page.', home: 'Go to the home page', answers: 'Questions and answers' },
  no: { h1: 'Denne siden finnes ikke', p: 'Adressen kan ha endret seg, eller den ble skrevet litt feil. Alt på nettstedet starter fra forsiden.', home: 'Gå til forsiden', answers: 'Spørsmål og svar' },
  sv: { h1: 'Den här sidan finns inte', p: 'Adressen kan ha ändrats, eller så skrevs den lite fel. Allt på webbplatsen utgår från startsidan.', home: 'Gå till startsidan', answers: 'Frågor och svar' },
  de: { h1: 'Diese Seite gibt es nicht', p: 'Die Adresse hat sich vielleicht geändert, oder sie wurde leicht falsch eingegeben. Alles auf der Website beginnt auf der Startseite.', home: 'Zur Startseite', answers: 'Fragen und Antworten' },
  fr: { h1: "Cette page n'existe pas", p: "L'adresse a peut-être changé, ou elle a été mal saisie. Tout le site part de la page d'accueil.", home: "Aller à la page d'accueil", answers: 'Questions et réponses' },
  nl: { h1: 'Deze pagina bestaat niet', p: 'Het adres is misschien veranderd, of het is net verkeerd ingetypt. Alles op de site begint op de startpagina.', home: 'Naar de startpagina', answers: 'Vragen en antwoorden' },
};

// Read once, before React replaces #root. src/main.jsx calls this first.
let INITIAL = null;
export function captureStaticBlock() {
  // Vercel answers an unknown URL with the home page file, block and all. A block only counts
  // if the page's own canonical says it belongs to this address.
  const strip = p => (p.replace(/\/+$/, '') || '/');
  const here = strip(window.location.pathname);
  const canon = document.querySelector('link[rel="canonical"]');
  let owner = null;
  try { owner = canon ? strip(new URL(canon.href).pathname) : null; } catch { owner = null; }
  const el = document.querySelector('#root .seo-static');
  INITIAL = { path: window.location.pathname, html: el && owner === here ? el.innerHTML : '' };
}

function setNoindex(on) {
  let m = document.querySelector('meta[name="robots"]');
  if (on) {
    if (!m) { m = document.createElement('meta'); m.setAttribute('name', 'robots'); document.head.appendChild(m); }
    m.setAttribute('content', 'noindex, nofollow');
  }
}

export default function StaticPage() {
  const { pathname } = useLocation();
  const { locale } = useLocale();
  const t = useT();
  const initial = INITIAL && INITIAL.path === pathname ? INITIAL.html : null;
  const [state, setState] = useState(() => (initial != null
    ? { status: initial ? 'ok' : 'missing', html: initial }
    : { status: 'loading', html: '' }));

  useEffect(() => {
    if (INITIAL && INITIAL.path === pathname) {
      setState({ status: INITIAL.html ? 'ok' : 'missing', html: INITIAL.html });
      return;
    }
    let live = true;
    setState({ status: 'loading', html: '' });
    fetch(pathname, { headers: { Accept: 'text/html' } })
      .then(r => r.text())
      .then(text => {
        if (!live) return;
        const doc = new DOMParser().parseFromString(text, 'text/html');
        const el = doc.querySelector('#root .seo-static');
        const title = doc.querySelector('title');
        const canon = doc.querySelector('link[rel="canonical"]');
        const strip = p => (p.replace(/\/+$/, '') || '/');
        let owner = null;
        try { owner = canon ? strip(new URL(canon.getAttribute('href'), window.location.origin).pathname) : null; } catch { owner = null; }
        if (el && el.innerHTML.trim() && owner === strip(pathname)) {
          if (title) document.title = title.textContent;
          setState({ status: 'ok', html: el.innerHTML });
        } else setState({ status: 'missing', html: '' });
      })
      .catch(() => live && setState({ status: 'missing', html: '' }));
    return () => { live = false; };
  }, [pathname]);

  useEffect(() => {
    if (state.status === 'missing') {
      setNoindex(true);
      document.title = `${NOT_FOUND[locale].h1} | Spain 24/7`;
    }
    if (state.status === 'ok') window.scrollTo(0, 0);
  }, [state.status, locale]);

  const nf = NOT_FOUND[locale] || NOT_FOUND.en;
  const prefix = locale === 'en' ? '' : `/${locale}`;

  return (
    <div className="calc-shell areas-shell">
      <header className="calc-header">
        <Link to={prefix || '/'} className="site-brand" style={{ textDecoration: 'none' }}>
          <span className="site-brand-name">Spain 24/7</span>
          <span className="site-brand-powered">{t('home.brand_sub')}</span>
        </Link>
        <div className="areas-header-right">
          <SiteNav />
          <LangSwitcher />
        </div>
      </header>

      <main className="areas-page">
        {state.status === 'ok' && (
          <article className="areas-wrap static-page" dangerouslySetInnerHTML={{ __html: state.html }} />
        )}
        {state.status === 'missing' && (
          <div className="areas-wrap static-page">
            <h1>{nf.h1}</h1>
            <p>{nf.p}</p>
            <ul>
              <li><Link to={prefix || '/'}>{nf.home}</Link></li>
              <li><a href={`${prefix}/answers`}>{nf.answers}</a></li>
            </ul>
          </div>
        )}
        {state.status === 'loading' && <div className="areas-wrap static-page" aria-busy="true" />}
      </main>

      <SiteFooter />
    </div>
  );
}
