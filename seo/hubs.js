// The three hub pages: /areas, /areas/<province>, /coast/<coast>.
//
// WHY THIS FILE EXISTS AT ALL
// Two things have to say the same words about a province: the static HTML the build writes
// for search engines, and the React page a visitor sees. If those two drift apart the
// static block stops being a fallback and starts being cloaking, which is a real penalty
// and an easy one to earn by accident.
//
// So neither one owns the content. This module does, and both read it: seo/routes.js for
// the prerendered block and the sitemap, seo/Areas.jsx for the rendered page. A change here
// lands in both or in neither.
//
// It is pure. No filesystem, no JSON imports, no React, so the Node build scripts and the
// browser bundle can both take it.
//
// WHY HUB PAGES EXIST AT ALL
// The town picker on both directory pages is a <select>. A crawler cannot use one and gets
// nothing from it, so without these pages every town page would be an orphan: reachable
// only by typing the URL, found late and trusted little. These pages are the internal
// linking layer that makes 1,862 town pages discoverable.

import { LOCALITIES, LOCALITY_BY_SLUG, REGIONS } from '../spain-directory/localities.js';
import { CATEGORIES, PROFESSIONALS } from '../spain-directory/categories.js';
import { PRIORITY_TOWNS, COASTS } from './priority.js';
import { S, UI, CAT_PL, PROFESSION_DOES, localePath, shortTownName, distinctTitle, fitDesc } from './copy.js';

// --- derived geography, computed once and shared -------------------------------------------

export const TOWNS_BY_REGION = {};
for (const l of LOCALITIES) (TOWNS_BY_REGION[l.region] ||= []).push(l);
for (const k of Object.keys(TOWNS_BY_REGION)) TOWNS_BY_REGION[k].sort((a, b) => a.name.localeCompare(b.name));

export const COASTS_BY_REGION = {};
for (const [key, c] of Object.entries(COASTS)) {
  for (const p of c.provinces) (COASTS_BY_REGION[p] ||= []).push(key);
}

export const PRIORITY_SET = new Set(PRIORITY_TOWNS);

// A typo in priority.js would put a 404 in the sitemap, which is worse than the page not
// existing at all. Fail at import time, in the build and in the dev server alike.
const missing = PRIORITY_TOWNS.filter(s => !LOCALITY_BY_SLUG[s]);
if (missing.length) {
  throw new Error(`seo/priority.js names ${missing.length} towns that are not in localities.js: ${missing.join(', ')}`);
}

export const HUB_PATHS = {
  trades: '/spain-directory',
  pros: '/spain-professionals',
};

// The two directories, and everything that differs between them in one place.
export const DIRECTORIES = {
  trades: { key: 'trades', path: HUB_PATHS.trades, cats: CATEGORIES, ui: 'trades', other: 'pros' },
  pros: { key: 'pros', path: HUB_PATHS.pros, cats: PROFESSIONALS, ui: 'pros', other: 'trades' },
};

// How many towns the hub page links into directly. Enough that a crawler arriving at the
// hub has somewhere to go, few enough that the page is still a page rather than a list.
export const HUB_TOWN_LINKS = 24;

const cap = str => (str ? str.charAt(0).toUpperCase() + str.slice(1) : str);

/** Everything the copy needs to know about one town, from localities.js only. */
export function townCtx(slug) {
  const l = LOCALITY_BY_SLUG[slug];
  const coastKey = (COASTS_BY_REGION[l.region] || [])[0] || null;
  return {
    slug,
    town: shortTownName(l.name),
    townFull: l.name,
    prov: l.province,
    region: l.region,
    coastKey,
    coast: coastKey ? COASTS[coastKey].name : null,
  };
}

// The town pages are English only, so a link to one is unprefixed whatever locale the hub
// page is being read in. Sending a Norwegian reader to /no/spain-directory/javea would be a
// URL with no file behind it.
function townPageLinks(towns, hubLabels) {
  const out = [];
  for (const t of towns) {
    const name = shortTownName(t.name);
    out.push({ href: `${HUB_PATHS.trades}/${t.slug}`, label: `${name}: ${hubLabels.trades}` });
    out.push({ href: `${HUB_PATHS.pros}/${t.slug}`, label: `${name}: ${hubLabels.pros}` });
  }
  return out;
}

// --- /areas ---------------------------------------------------------------------------------

export function areasData(locale) {
  const ui = UI[locale];
  const pack = S[locale].areas;
  const lp = p => localePath(locale, p);
  return {
    kind: 'areas-index',
    locale,
    path: lp('/areas'),
    // The title and description are computed here, not in routes.js, so that the title the
    // page sets on the client is the same string the prerendered file already carries.
    title: distinctTitle(pack.titles, `areas:${locale}`, pack.h1),
    description: fitDesc({ leads: pack.leads, tail: pack.tail }, `areas:${locale}`),
    h1: pack.h1,
    intro: pack.intro,
    navLinks: [
      ...Object.entries(REGIONS).map(([k, name]) => ({ href: lp(`/areas/${k}`), label: name })),
      ...Object.entries(COASTS).map(([k, c]) => ({ href: lp(`/coast/${k}`), label: c.name })),
      { href: lp(HUB_PATHS.trades), label: ui.trades },
      { href: lp(HUB_PATHS.pros), label: ui.pros },
    ],
    townLinks: [],
    mentions: [],
    breadcrumbs: [
      { name: ui.home, path: lp('/') },
      { name: ui.areas, path: lp('/areas') },
    ],
    // Split out so the page can render provinces and coasts as two separate groups while
    // the static block keeps them in one flat list.
    provinces: Object.entries(REGIONS).map(([k, name]) => ({
      key: k, name, href: lp(`/areas/${k}`),
      townCount: (TOWNS_BY_REGION[k] || []).length,
      pageCount: (TOWNS_BY_REGION[k] || []).filter(t => PRIORITY_SET.has(t.slug)).length,
    })),
    coasts: Object.entries(COASTS).map(([k, c]) => ({
      key: k, name: c.name, href: lp(`/coast/${k}`),
      provinces: c.provinces.map(p => REGIONS[p]),
      townCount: c.provinces.flatMap(p => TOWNS_BY_REGION[p] || []).length,
    })),
  };
}

// --- /areas/<province> ------------------------------------------------------------------------

export function provinceData(region, locale) {
  const provName = REGIONS[region];
  if (!provName) return null;

  const ui = UI[locale];
  const pack = S[locale].province;
  const lp = p => localePath(locale, p);

  const townsHere = TOWNS_BY_REGION[region] || [];
  const priorityHere = townsHere.filter(t => PRIORITY_SET.has(t.slug));
  const coastsHere = COASTS_BY_REGION[region] || [];
  const ctx = { prov: provName, townCount: townsHere.length, pageCount: priorityHere.length };

  return {
    kind: 'province-hub',
    locale,
    region,
    ctx,
    path: lp(`/areas/${region}`),
    title: distinctTitle(pack.titles(ctx), `province:${region}:${locale}`, pack.h1(ctx)),
    description: fitDesc({ leads: pack.leads(ctx), tail: pack.tail }, `province:${region}:${locale}`),
    h1: pack.h1(ctx),
    intro: [...pack.intro(ctx), S[locale].notes.free],
    navLinks: [
      { href: lp('/areas'), label: ui.areas },
      ...coastsHere.map(k => ({ href: lp(`/coast/${k}`), label: COASTS[k].name })),
      { href: lp(HUB_PATHS.trades), label: ui.trades },
      { href: lp(HUB_PATHS.pros), label: ui.pros },
    ],
    townLinks: townPageLinks(priorityHere, UI.en),
    // Towns with no page of their own are named rather than linked. Naming them is true and
    // useful. Linking them would put a URL in the sitemap with no file behind it.
    mentions: townsHere.filter(t => !PRIORITY_SET.has(t.slug)).map(t => shortTownName(t.name)),
    breadcrumbs: [
      { name: ui.home, path: lp('/') },
      { name: ui.areas, path: lp('/areas') },
      { name: provName, path: lp(`/areas/${region}`) },
    ],
    towns: priorityHere.map(t => ({ slug: t.slug, name: shortTownName(t.name) })),
    coasts: coastsHere.map(k => ({ key: k, name: COASTS[k].name, href: lp(`/coast/${k}`) })),
  };
}

// --- /coast/<coast> ----------------------------------------------------------------------------

export function coastData(coastKey, locale) {
  const coast = COASTS[coastKey];
  if (!coast) return null;

  const ui = UI[locale];
  const pack = S[locale].coast;
  const lp = p => localePath(locale, p);

  const townsHere = coast.provinces.flatMap(p => TOWNS_BY_REGION[p] || []);
  const priorityHere = townsHere.filter(t => PRIORITY_SET.has(t.slug));
  const provList = coast.provinces.map(p => REGIONS[p]).join(' and ');
  const ctx = {
    coast: coast.name,
    townCount: townsHere.length,
    pageCount: priorityHere.length,
    provList,
  };

  return {
    kind: 'coast-hub',
    locale,
    coastKey,
    ctx,
    path: lp(`/coast/${coastKey}`),
    title: distinctTitle(pack.titles(ctx), `coast:${coastKey}:${locale}`, pack.h1(ctx)),
    description: fitDesc({ leads: pack.leads(ctx), tail: pack.tail }, `coast:${coastKey}:${locale}`),
    h1: pack.h1(ctx),
    intro: [...pack.intro(ctx), S[locale].notes.free],
    navLinks: [
      { href: lp('/areas'), label: ui.areas },
      ...coast.provinces.map(p => ({ href: lp(`/areas/${p}`), label: REGIONS[p] })),
      { href: lp(HUB_PATHS.trades), label: ui.trades },
      { href: lp(HUB_PATHS.pros), label: ui.pros },
    ],
    townLinks: townPageLinks(priorityHere, UI.en),
    mentions: townsHere.filter(t => !PRIORITY_SET.has(t.slug)).map(t => shortTownName(t.name)),
    breadcrumbs: [
      { name: ui.home, path: lp('/') },
      { name: ui.areas, path: lp('/areas') },
      { name: coast.name, path: lp(`/coast/${coastKey}`) },
    ],
    towns: priorityHere.map(t => ({ slug: t.slug, name: shortTownName(t.name) })),
    provinces: coast.provinces.map(p => ({ key: p, name: REGIONS[p], href: lp(`/areas/${p}`) })),
  };
}

export { REGIONS, COASTS, PRIORITY_TOWNS };

// --- the links the two directory pages carry ------------------------------------------------
//
// THE POINT OF THESE
// The static block written by seo/prerender.mjs is replaced by React the moment the app
// boots. A crawler that executes JavaScript, which Google does, therefore sees the rendered
// page, and until now the rendered page had no links out at all: the town picker is a
// <select> and a <select> passes nothing on. So the links below are rendered on the page as
// well as written into the block, from this one definition, and the two agree by
// construction rather than by anyone remembering.

/** The links on /spain-directory and /spain-professionals themselves. */
export function directoryHubLinks(hubKey, locale) {
  const hub = DIRECTORIES[hubKey];
  const other = DIRECTORIES[hub.other];
  const ui = UI[locale];
  const lp = p => localePath(locale, p);

  const links = [
    { href: lp('/'), label: ui.home },
    { href: lp('/areas'), label: ui.areas },
    { href: lp(other.path), label: UI[locale][other.ui] },
    ...Object.entries(COASTS).map(([k, c]) => ({ href: lp(`/coast/${k}`), label: c.name })),
  ];
  // The town pages are English only, so only the English hub links straight into them.
  if (locale === 'en') {
    for (const slug of PRIORITY_TOWNS.slice(0, HUB_TOWN_LINKS)) {
      links.push({ href: `${hub.path}/${slug}`, label: townCtx(slug).town });
    }
  }
  return links;
}

/** The links on a town hub, /spain-directory/javea. English only, like the page. */
export function townHubLinks(hubKey, slug) {
  const hub = DIRECTORIES[hubKey];
  const other = DIRECTORIES[hub.other];
  const t = townCtx(slug);
  const siblings = PRIORITY_TOWNS
    .filter(s => s !== slug && LOCALITY_BY_SLUG[s].region === t.region)
    .slice(0, 6);

  return [
    ...hub.cats.map(c => ({
      href: `${hub.path}/${slug}/${c.slug}`,
      label: `${cap(CAT_PL.en[c.slug])} in ${t.town}`,
      note: hubKey === 'pros' ? PROFESSION_DOES[c.slug] : '',
    })),
    { href: `${other.path}/${slug}`, label: `${UI.en[other.ui]} in ${t.town}` },
    { href: `/areas/${t.region}`, label: t.prov },
    ...(t.coastKey ? [{ href: `/coast/${t.coastKey}`, label: t.coast }] : []),
    ...siblings.map(s => ({ href: `${hub.path}/${s}`, label: shortTownName(LOCALITY_BY_SLUG[s].name) })),
    { href: hub.path, label: UI.en[hub.ui] },
  ];
}

/** The links on a town and category page, /spain-directory/javea/plumber. */
export function townCategoryLinks(hubKey, slug, categorySlug) {
  const hub = DIRECTORIES[hubKey];
  const other = DIRECTORIES[hub.other];
  const t = townCtx(slug);

  return [
    ...hub.cats.filter(o => o.slug !== categorySlug).map(o => ({
      href: `${hub.path}/${slug}/${o.slug}`,
      label: `${cap(CAT_PL.en[o.slug])} in ${t.town}`,
    })),
    { href: `${hub.path}/${slug}`, label: `${UI.en[hub.ui]} in ${t.town}` },
    { href: `${other.path}/${slug}`, label: `${UI.en[other.ui]} in ${t.town}` },
    { href: `/areas/${t.region}`, label: t.prov },
    ...(t.coastKey ? [{ href: `/coast/${t.coastKey}`, label: t.coast }] : []),
  ];
}

/**
 * The links for whatever the directory page is currently showing.
 * Called by the page with its own state, and by routes.js for the prerendered block.
 */
export function directoryLinks({ hub, town, category, locale = 'en' }) {
  if (town && LOCALITY_BY_SLUG[town] && PRIORITY_SET.has(town)) {
    const cats = DIRECTORIES[hub].cats;
    if (category && cats.some(c => c.slug === category)) return townCategoryLinks(hub, town, category);
    return townHubLinks(hub, town);
  }
  return directoryHubLinks(hub, locale);
}
