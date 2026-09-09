// Every URL this site publishes, and everything each one needs to say.
//
// ONE PLACE, ON PURPOSE. The prerenderer, the sitemap and the build gate all read this
// list. If a URL is not here it does not get a file, does not get a sitemap entry and does
// not get claimed as anybody's hreflang alternate. That is the only way the three stay in
// agreement, and disagreement between them is what puts a 404 in a sitemap.
//
// WHAT IS PUBLISHED, AND WHAT IS NOT
// 660 towns times 14 categories times six languages is 55,440 pages. A domain with no
// authority is crawled in the thousands, so publishing tens of thousands of near identical
// pages gets a handful sampled, found thin, and the estimate of the whole site lowered.
// What ships instead: the static pages in all six locales, and 133 priority towns in
// English. seo/priority.js holds that list and widening it is a one line change.
//
// This module is pure. It reads no files and imports no JSON, so it is equally safe from a
// Node build script and from the browser bundle. The tool list is passed in rather than
// globbed here, because globbing is the one thing the two environments do differently.

import { LOCALITY_BY_SLUG, REGIONS } from '../spain-directory/localities.js';
import { CATEGORIES, PROFESSIONALS } from '../spain-directory/categories.js';
import { PRIORITY_TOWNS, COASTS } from './priority.js';
// The hub pages' words and links live in one module, read by this file for the prerendered
// block and by seo/Areas.jsx for the rendered page. Two copies of that content would drift,
// and a static block that no longer matches the page it fronts is cloaking.
import {
  TOWNS_BY_REGION, PRIORITY_SET, townCtx,
  areasData, provinceData, coastData,
  directoryHubLinks, townHubLinks, townCategoryLinks,
} from './hubs.js';
import {
  LOCALES, DEFAULT_LOCALE, SITE_NAME, UI, S, TOWN, TOOL_COPY, TOOL_TAIL,
  LOCALE_ENGLISH_NOTE, PROFESSION_DOES, CAT_NAME, CAT_PL,
  fitTitle, fitDesc, distinctTitle, shortTownName, localePath, absolute, hash,
} from './copy.js';

// Two routes the app serves and search engines must never index. They are not in the route
// set at all, which keeps them out of the sitemap and out of every hreflang block. The
// prerenderer still writes a file for each, carrying a robots noindex, because a URL that
// exists and says nothing is the one a crawler is most likely to guess at.
export const NOINDEX_PATHS = ['/internal', '/internal-linkedin'];

export const HUBS = {
  trades: { path: '/spain-directory', cats: CATEGORIES, ui: 'trades', pack: 'trades_hub', town: 'tradesHub' },
  pros: { path: '/spain-professionals', cats: PROFESSIONALS, ui: 'pros', pack: 'pros_hub', town: 'prosHub' },
};

const CHANGEFREQ = {
  home: 'weekly', 'category-hub': 'weekly', tool: 'monthly', 'areas-index': 'monthly',
  'province-hub': 'monthly', 'coast-hub': 'monthly', 'town-hub': 'weekly', 'town-category': 'weekly',
};
const PRIORITY = {
  home: 1.0, 'category-hub': 0.9, tool: 0.8, 'areas-index': 0.6,
  'province-hub': 0.5, 'coast-hub': 0.6, 'town-hub': 0.7, 'town-category': 0.6,
};

const cap = s => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

// --- derived geography -------------------------------------------------------------------

// The geography, the priority set and the town context all come from hubs.js, so the hub
// pages and the town pages are counting the same towns.

function coastClause(t) {
  if (!t.coast) return '';
  return `, ${TOWN.coastPreposition(t.coast)} ${t.coast}`;
}

// --- route assembly -----------------------------------------------------------------------

/**
 * Build the complete route set.
 *
 * @param {object} opts
 * @param {Array}  opts.tools  one entry per tool folder that has a meta.js, shaped
 *                             { slug, path, title, description, order, group, translated }.
 *                             Passed in rather than globbed so this module stays pure.
 * @returns {Array} one object per published URL.
 */
export function buildRoutes({ tools } = {}) {
  if (!Array.isArray(tools)) {
    throw new Error('buildRoutes needs the tool list. Node callers: await loadTools() from seo/tools.mjs.');
  }

  const hubPaths = new Set(Object.values(HUBS).map(h => h.path));
  const toolPages = tools
    .filter(t => !hubPaths.has(t.path) && !NOINDEX_PATHS.includes(t.path))
    .sort((a, b) => (a.order || 99) - (b.order || 99));

  const routes = [];
  const lp = localePath;

  const add = (r) => { routes.push(r); return r; };

  // --- home ------------------------------------------------------------------------------
  for (const locale of LOCALES) {
    const pack = S[locale].home;
    const ui = UI[locale];
    const path = lp(locale, '/');
    const links = [
      { href: lp(locale, HUBS.trades.path), label: ui.trades },
      { href: lp(locale, HUBS.pros.path), label: ui.pros },
      { href: lp(locale, '/areas'), label: ui.areas },
      ...toolPages.slice(0, 8).map(t => ({ href: lp(locale, t.path), label: TOOL_COPY[t.slug]?.[locale]?.h1 || t.title })),
    ];
    add({
      path, locale, kind: 'home', group: 'home',
      title: distinctTitle(pack.titles, `home:${locale}`, pack.h1),
      description: fitDesc({ leads: pack.leads, tail: pack.tail }, `home:${locale}`),
      h1: pack.h1,
      intro: pack.intro,
      breadcrumbs: [{ name: ui.home, path }],
      changefreq: CHANGEFREQ.home,
      priority: PRIORITY.home,
      links,
      alternates: {},
    });
  }

  // --- the 14 tool pages -------------------------------------------------------------------
  for (const t of toolPages) {
    for (const locale of LOCALES) {
      const ui = UI[locale];
      const copy = TOOL_COPY[t.slug]?.[locale];
      // A tool with no hand written copy still gets a page, using its own meta.js strings.
      // Better a plain English title than a missing one.
      const h1 = copy?.h1 || t.title;
      const lead = copy?.lead || t.description;
      const extra = copy?.extra || '';
      const path = lp(locale, t.path);
      const englishNote = (!t.translated && locale !== DEFAULT_LOCALE) ? LOCALE_ENGLISH_NOTE[locale] : '';
      const siblings = toolPages.filter(o => o.slug !== t.slug && o.group === t.group).slice(0, 5);
      add({
        path, locale, kind: 'tool', group: `tool:${t.slug}`,
        title: distinctTitle([`${h1} | ${SITE_NAME}`, `${h1}, ${SITE_NAME}`, h1], `tool:${t.slug}:${locale}`, h1),
        description: fitDesc({ leads: [lead], tail: [extra, ...TOOL_TAIL[locale]].filter(Boolean) }, `tool:${t.slug}:${locale}`),
        h1,
        intro: [lead, extra, englishNote].filter(Boolean),
        breadcrumbs: [{ name: ui.home, path: lp(locale, '/') }, { name: h1, path }],
        changefreq: CHANGEFREQ.tool,
        priority: locale === DEFAULT_LOCALE ? PRIORITY.tool : PRIORITY.tool - 0.1,
        links: [
          { href: lp(locale, '/'), label: ui.home },
          ...siblings.map(o => ({ href: lp(locale, o.path), label: TOOL_COPY[o.slug]?.[locale]?.h1 || o.title })),
          { href: lp(locale, HUBS.trades.path), label: ui.trades },
          { href: lp(locale, HUBS.pros.path), label: ui.pros },
        ],
        alternates: {},
        toolSlug: t.slug,
      });
    }
  }

  // --- the two category hubs -----------------------------------------------------------------
  for (const [hubKey, hub] of Object.entries(HUBS)) {
    for (const locale of LOCALES) {
      const ui = UI[locale];
      const pack = S[locale][hub.pack];
      const path = lp(locale, hub.path);
      // The same links the rendered page prints, from hubs.js. The town picker in the app
      // is a <select>, which is not a link and passes nothing on, so these are the only
      // way into the town pages.
      const links = directoryHubLinks(hubKey, locale);
      add({
        path, locale, kind: 'category-hub', group: `hub:${hubKey}`,
        title: distinctTitle(pack.titles, `hub:${hubKey}:${locale}`, pack.h1),
        description: fitDesc({ leads: pack.leads, tail: pack.tail }, `hub:${hubKey}:${locale}`),
        h1: pack.h1,
        intro: [...pack.intro, S[locale].notes.method, S[locale].notes.honest],
        breadcrumbs: [{ name: ui.home, path: lp(locale, '/') }, { name: ui[hub.ui], path }],
        changefreq: CHANGEFREQ['category-hub'],
        priority: locale === DEFAULT_LOCALE ? PRIORITY['category-hub'] : PRIORITY['category-hub'] - 0.1,
        links,
        alternates: {},
        hub: hubKey,
      });
    }
  }

  // --- /areas ------------------------------------------------------------------------------
  // The h1, the intro and the links come from hubs.js, which seo/Areas.jsx also reads. Only
  // the title, the description and the sitemap fields are decided here.
  for (const locale of LOCALES) {
    const d = areasData(locale);
    add({
      path: d.path, locale, kind: d.kind, group: 'areas',
      title: d.title,
      description: d.description,
      h1: d.h1,
      intro: d.intro,
      breadcrumbs: d.breadcrumbs,
      changefreq: CHANGEFREQ['areas-index'],
      priority: locale === DEFAULT_LOCALE ? PRIORITY['areas-index'] : PRIORITY['areas-index'] - 0.1,
      links: d.navLinks,
      alternates: {},
    });
  }

  // --- province hubs, 52 of them ---------------------------------------------------------------
  // The town links are English only, because the town pages are English only. On a locale
  // prefixed hub the block links provinces and coasts and stops there, rather than pointing
  // at a URL that has no file.
  for (const region of Object.keys(REGIONS)) {
    for (const locale of LOCALES) {
      const d = provinceData(region, locale);
      add({
        path: d.path, locale, kind: d.kind, group: `province:${region}`,
        title: d.title,
        description: d.description,
        h1: d.h1,
        intro: d.intro,
        breadcrumbs: d.breadcrumbs,
        changefreq: CHANGEFREQ['province-hub'],
        priority: locale === DEFAULT_LOCALE ? PRIORITY['province-hub'] : PRIORITY['province-hub'] - 0.1,
        links: locale === DEFAULT_LOCALE ? [...d.navLinks, ...d.townLinks] : d.navLinks,
        // Towns without a page of their own are named rather than linked. Naming them is
        // true and useful; linking them would put a URL in the sitemap that has no file.
        mentions: d.mentions,
        alternates: {},
      });
    }
  }

  // --- coast hubs, 9 of them ---------------------------------------------------------------
  for (const coastKey of Object.keys(COASTS)) {
    for (const locale of LOCALES) {
      const d = coastData(coastKey, locale);
      add({
        path: d.path, locale, kind: d.kind, group: `coast:${coastKey}`,
        title: d.title,
        description: d.description,
        h1: d.h1,
        intro: d.intro,
        breadcrumbs: d.breadcrumbs,
        changefreq: CHANGEFREQ['coast-hub'],
        priority: locale === DEFAULT_LOCALE ? PRIORITY['coast-hub'] : PRIORITY['coast-hub'] - 0.1,
        links: locale === DEFAULT_LOCALE ? [...d.navLinks, ...d.townLinks] : d.navLinks,
        mentions: d.mentions,
        alternates: {},
      });
    }
  }

  // --- the English town pages ------------------------------------------------------------------
  for (const slug of PRIORITY_TOWNS) {
    const t = townCtx(slug);
    const clause = coastClause(t);

    for (const [hubKey, hub] of Object.entries(HUBS)) {
      const pack = TOWN[hub.town];
      const path = `${hub.path}/${slug}`;
      const h1 = pack.h1(t);

      const intro = [`${t.townFull} is in the province of ${t.prov}${clause}.`];
      if (hubKey === 'trades') {
        intro.push(`Six trades are covered here: ${CATEGORIES.map(c => CAT_NAME.en[c.slug].toLowerCase()).join(', ')}.`);
      } else {
        intro.push('Eight professions, and the one you need is often not the one you expected.');
      }
      intro.push(S.en.notes.method, S.en.notes.lang, S.en.notes.honest, S.en.notes.loads);

      add({
        path, locale: 'en', kind: 'town-hub', group: `townhub:${hubKey}:${slug}`,
        title: distinctTitle(pack.titles(t), `townhub:${hubKey}:${slug}`, h1),
        description: fitDesc({ leads: pack.leads(t), tail: pack.tail }, `townhub:${hubKey}:${slug}`),
        h1,
        intro,
        breadcrumbs: [
          { name: UI.en.home, path: '/' },
          { name: UI.en[hub.ui], path: hub.path },
          { name: t.town, path },
        ],
        changefreq: CHANGEFREQ['town-hub'],
        priority: PRIORITY['town-hub'],
        links: townHubLinks(hubKey, slug),
        alternates: {},
        townSlug: slug, hub: hubKey,
      });

      // --- one page per category in that town -------------------------------------------------
      for (const c of hub.cats) {
        const catPl = CAT_PL.en[c.slug];
        const ctx = { ...t, catPl, CatPl: cap(catPl), cat: CAT_NAME.en[c.slug], prov: t.prov };
        const seed = `${hubKey}:${slug}:${c.slug}`;
        const cH1 = pack === TOWN.tradesHub ? TOWN.category.h1(ctx) : TOWN.category.h1(ctx);
        const catIntro = [`${ctx.CatPl} in ${t.townFull}, in the province of ${t.prov}${clause}.`];
        if (hubKey === 'pros') {
          catIntro.push(PROFESSION_DOES[c.slug]);
        } else {
          catIntro.push(`The list is built from a search for "${c.query}", the Spanish term these businesses list themselves under.`);
        }
        catIntro.push(S.en.notes.method, S.en.notes.lang, S.en.notes.honest);
        catIntro.push(hubKey === 'trades' ? S.en.notes.written : S.en.notes.loads);

        add({
          path: `${hub.path}/${slug}/${c.slug}`,
          locale: 'en', kind: 'town-category', group: `towncat:${hubKey}:${slug}:${c.slug}`,
          title: distinctTitle(TOWN.category.titles(ctx), seed, cH1),
          description: fitDesc({ leads: TOWN.category.leads(ctx), tail: TOWN.category.tail }, seed),
          h1: cH1,
          intro: catIntro,
          breadcrumbs: [
            { name: UI.en.home, path: '/' },
            { name: UI.en[hub.ui], path: hub.path },
            { name: t.town, path: `${hub.path}/${slug}` },
            { name: ctx.CatPl, path: `${hub.path}/${slug}/${c.slug}` },
          ],
          changefreq: CHANGEFREQ['town-category'],
          priority: PRIORITY['town-category'],
          links: townCategoryLinks(hubKey, slug, c.slug),
          alternates: {},
          townSlug: slug, hub: hubKey, categorySlug: c.slug,
        });
      }
    }
  }

  // --- hreflang groups ------------------------------------------------------------------------
  // A locale only gets an alternate where the URL genuinely exists. The English town pages
  // sit alone in their group, so they emit no hreflang at all and no other page claims them.
  const byGroup = new Map();
  for (const r of routes) {
    if (!byGroup.has(r.group)) byGroup.set(r.group, []);
    byGroup.get(r.group).push(r);
  }
  for (const r of routes) {
    const family = byGroup.get(r.group);
    r.alternates = {};
    for (const s of family) r.alternates[s.locale] = absolute(s.path);
  }

  return routes;
}

export { PRIORITY_TOWNS, COASTS, REGIONS };
