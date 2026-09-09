// The <head> for one route.
//
// Everything is absolute. A relative canonical is a canonical a crawler can read two ways,
// and an hreflang set that is not absolute is ignored outright.
//
// The hreflang rule is the one worth stating twice: a locale only appears here if that URL
// genuinely exists in the route set. Pointing hreflang at a 404 does not degrade to
// "ignored", it invalidates the whole cluster, so the English only town pages emit no
// hreflang at all rather than a set with five broken members.

import {
  SITE_ORIGIN, SITE_NAME, DEFAULT_LOCALE, HREFLANG, OG_LOCALE, escapeHtml, absolute,
} from './copy.js';

const jsonld = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

function softwareCategory(group) {
  return group === 'tax' || group === 'money' ? 'FinanceApplication' : 'BusinessApplication';
}

/**
 * @param {object} route      one entry from buildRoutes()
 * @param {object} opts
 * @param {string} opts.assets  the script and stylesheet tags Vite injected, kept verbatim
 * @param {string} opts.group   the tool group, for the SoftwareApplication category
 */
export function buildHead(route, { assets = '', group = '' } = {}) {
  const url = absolute(route.path);
  const locales = Object.keys(route.alternates || {});
  const out = [];

  out.push('<meta charset="UTF-8" />');
  out.push('<meta name="viewport" content="width=device-width, initial-scale=1.0" />');
  out.push('<meta name="theme-color" content="#010221" />');
  out.push(`<title>${escapeHtml(route.title)}</title>`);
  out.push(`<meta name="description" content="${escapeHtml(route.description)}" />`);
  out.push(route.noindex
    ? '<meta name="robots" content="noindex, nofollow" />'
    : '<meta name="robots" content="index, follow, max-image-preview:large" />');
  out.push(`<link rel="canonical" href="${escapeHtml(url)}" />`);

  // One locale in the family means there is nothing to alternate with. Emitting a lone
  // self referencing hreflang would be noise, and emitting the other five would be a lie.
  if (locales.length > 1) {
    for (const l of locales) {
      out.push(`<link rel="alternate" hreflang="${HREFLANG[l]}" href="${escapeHtml(route.alternates[l])}" />`);
    }
    const fallback = route.alternates[DEFAULT_LOCALE] || route.alternates[locales[0]];
    out.push(`<link rel="alternate" hreflang="x-default" href="${escapeHtml(fallback)}" />`);
  }

  out.push(`<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`);
  out.push(`<meta property="og:title" content="${escapeHtml(route.title)}" />`);
  out.push(`<meta property="og:description" content="${escapeHtml(route.description)}" />`);
  out.push(`<meta property="og:url" content="${escapeHtml(url)}" />`);
  out.push(`<meta property="og:type" content="${route.kind === 'home' ? 'website' : 'article'}" />`);
  out.push(`<meta property="og:locale" content="${OG_LOCALE[route.locale]}" />`);
  for (const l of locales) {
    if (l !== route.locale) out.push(`<meta property="og:locale:alternate" content="${OG_LOCALE[l]}" />`);
  }

  out.push('<meta name="twitter:card" content="summary" />');
  out.push(`<meta name="twitter:title" content="${escapeHtml(route.title)}" />`);
  out.push(`<meta name="twitter:description" content="${escapeHtml(route.description)}" />`);

  // --- structured data ---------------------------------------------------------------------
  const blocks = [];

  if (route.kind === 'home') {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_ORIGIN + '/',
      inLanguage: HREFLANG[route.locale],
      description: route.description,
    });
  }

  if (route.kind === 'tool') {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: route.h1,
      url,
      applicationCategory: softwareCategory(group),
      operatingSystem: 'Web browser',
      inLanguage: HREFLANG[route.locale],
      description: route.description,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    });
  }

  if (Array.isArray(route.breadcrumbs) && route.breadcrumbs.length > 1) {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: route.breadcrumbs.map((b, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: b.name,
        item: absolute(b.path),
      })),
    });
  }

  for (const b of blocks) {
    out.push(`<script type="application/ld+json">${jsonld(b)}</script>`);
  }

  out.push('<link rel="icon" type="image/png" href="/favicon.png" />');
  out.push('<link rel="preconnect" href="https://fonts.googleapis.com" />');
  out.push('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />');
  out.push('<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />');
  out.push('<link rel="preload" href="/fonts/FSSiena-Regular.otf" as="font" type="font/otf" crossorigin />');
  out.push('<link rel="preload" href="/fonts/FSSiena-Light.otf" as="font" type="font/otf" crossorigin />');
  out.push('<script async src="https://plausible.io/js/pa-Gw3gtefi2StGsS22K9V3j.js"></script>');
  out.push('<script>window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()</script>');

  if (assets) out.push(assets);

  return out.map(l => '    ' + l).join('\n');
}
