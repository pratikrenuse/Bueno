import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLocale, useT } from '../i18n.jsx';
import SiteNav from '../SiteNav.jsx';
import SiteFooter from '../SiteFooter.jsx';
import LangSwitcher from '../LangSwitcher.jsx';
import { areasData, provinceData, coastData, HUB_PATHS } from './hubs.js';
import { UI, BLOCK, HUB_UI } from './copy.js';

// The three hub pages: /areas, /areas/<province>, /coast/<coast>.
//
// WHY THIS PAGE EXISTS
// Both directories choose a town with a <select>. A person can use one. A crawler cannot:
// a <select> is not a link and passes nothing on, so without this page all 1,862 town
// pages would be orphans, reachable only by typing the URL. This is the layer of real
// links that makes them findable, and it is the reason the town pages can rank at all.
//
// It is useful to a person too, which is the only reason it is worth building. Somebody who
// has just bought on the Costa Blanca does not know the name of their province and should
// not have to. They know the coast.
//
// WHERE THE WORDS COME FROM
// seo/hubs.js, which is also what the build reads to write the static HTML for this URL.
// One source, so the page and the prerendered fallback cannot drift apart. If they drifted
// the fallback would stop being a fallback and start being cloaking. Do not hand write
// copy in here.
//
// WHAT DOES NOT APPEAR HERE
// Nothing from Google. No business names, no ratings, no reviews, no counts of listings.
// Those load client side on the directory pages themselves, under Google's terms, and a
// static file that search engines index cannot honour the 30 day cache cap. Every number
// on this page is a count of our own towns from localities.js.

function Crumbs({ crumbs, locale }) {
  if (!crumbs || crumbs.length < 2) return null;
  return (
    <nav className="areas-crumbs" aria-label={BLOCK[locale].crumb}>
      <ol>
        {crumbs.map((c, i) => (
          <li key={c.path}>
            {i === crumbs.length - 1
              ? <span aria-current="page">{c.name}</span>
              : <Link to={c.path}>{c.name}</Link>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// One town, two doors. A town page is only ever a step on the way to a trade or a
// profession, so the row offers both rather than making the visitor guess which directory
// their problem belongs in.
function TownRow({ town, locale }) {
  const ui = UI[locale];
  return (
    <li className="areas-town">
      <span className="areas-town-name">{town.name}</span>
      <span className="areas-town-links">
        <Link to={`${HUB_PATHS.trades}/${town.slug}`}>{ui.trades}</Link>
        <Link to={`${HUB_PATHS.pros}/${town.slug}`}>{ui.pros}</Link>
      </span>
    </li>
  );
}

function DirectoryLinks({ locale }) {
  const ui = UI[locale];
  const h = HUB_UI[locale];
  const lp = p => (locale === 'en' ? p : `/${locale}${p}`);
  return (
    <section className="areas-section">
      <h2 className="areas-h2">{h.directories}</h2>
      <div className="areas-doors">
        <Link className="areas-door" to={lp(HUB_PATHS.trades)}>{ui.trades}</Link>
        <Link className="areas-door" to={lp(HUB_PATHS.pros)}>{ui.pros}</Link>
      </div>
    </section>
  );
}

// Towns with no page of their own are named, not linked. Naming them is true and useful:
// they are in the town menu and the directory covers them. Linking them would promise a
// URL that has no file behind it, which in a sitemap is worse than no page at all.
function Mentions({ names, locale }) {
  if (!names || !names.length) return null;
  return (
    <section className="areas-section">
      <h2 className="areas-h2">{BLOCK[locale].also}</h2>
      <p className="areas-mentions">{names.join(', ')}.</p>
    </section>
  );
}

function Head({ title, description }) {
  useEffect(() => {
    document.title = title;
    let tag = document.querySelector('meta[name="description"]');
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', 'description');
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', description);
  }, [title, description]);
  return null;
}

function Intro({ d, locale }) {
  return (
    <header className="areas-hero">
      <Crumbs crumbs={d.breadcrumbs} locale={locale} />
      <h1 className="areas-h1">{d.h1}</h1>
      {d.intro.map(p => <p key={p} className="areas-lede">{p}</p>)}
    </header>
  );
}

// --- /areas -----------------------------------------------------------------------------

function AreasIndex({ locale }) {
  const d = areasData(locale);
  const h = HUB_UI[locale];
  return (
    <>
      <Head title={d.title} description={d.description} />
      <Intro d={d} locale={locale} />

      <section className="areas-section">
        <h2 className="areas-h2">{h.byCoast}</h2>
        <ul className="areas-coasts">
          {d.coasts.map(c => (
            <li key={c.key}>
              <Link className="areas-coast" to={c.href}>
                <span className="areas-coast-name">{c.name}</span>
                <span className="areas-coast-meta">{c.provinces.join(', ')}</span>
                <span className="areas-coast-count">{h.townCount(c.townCount)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="areas-section">
        <h2 className="areas-h2">{h.byProvince}</h2>
        <ul className="areas-provinces">
          {d.provinces.map(p => (
            <li key={p.key}>
              <Link to={p.href}>
                <span className="areas-prov-name">{p.name}</span>
                <span className="areas-prov-count">{h.townCount(p.townCount)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <DirectoryLinks locale={locale} />
    </>
  );
}

// --- /areas/<province> and /coast/<coast> -------------------------------------------------

function Place({ d, locale, siblingLabel, siblings }) {
  const h = HUB_UI[locale];
  return (
    <>
      <Head title={d.title} description={d.description} />
      <Intro d={d} locale={locale} />

      {d.towns.length > 0 && (
        <section className="areas-section">
          <h2 className="areas-h2">{h.towns}</h2>
          <ul className="areas-towns">
            {d.towns.map(t => <TownRow key={t.slug} town={t} locale={locale} />)}
          </ul>
        </section>
      )}

      {siblings.length > 0 && (
        <section className="areas-section">
          <h2 className="areas-h2">{siblingLabel}</h2>
          <ul className="areas-siblings">
            {siblings.map(s => <li key={s.key}><Link to={s.href}>{s.name}</Link></li>)}
          </ul>
        </section>
      )}

      <Mentions names={d.mentions} locale={locale} />
      <DirectoryLinks locale={locale} />
    </>
  );
}

export default function Areas() {
  const { province, coast } = useParams();
  const { locale } = useLocale();
  const t = useT();
  const h = HUB_UI[locale];

  // An unknown province or coast slug has no page and no file, so there is nothing honest to
  // say about it. Show the index instead of inventing a place.
  const p = province ? provinceData(province, locale) : null;
  const c = coast ? coastData(coast, locale) : null;

  let view;
  if (p) view = <Place d={p} locale={locale} siblingLabel={h.byCoast} siblings={p.coasts} />;
  else if (c) view = <Place d={c} locale={locale} siblingLabel={h.provinces} siblings={c.provinces} />;
  else view = <AreasIndex locale={locale} />;

  return (
    <div className="calc-shell areas-shell">
      <header className="calc-header">
        <div className="site-brand">
          <span className="site-brand-name">Spain 24/7</span>
          <span className="site-brand-powered">{t('home.brand_sub')}</span>
        </div>
        <div className="areas-header-right">
          <SiteNav />
          <LangSwitcher />
        </div>
      </header>

      <main className="areas-page">
        <div className="areas-wrap">{view}</div>
      </main>

      <SiteFooter />
    </div>
  );
}
