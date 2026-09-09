#!/usr/bin/env node
// Writes one static HTML file per published URL, after vite build.
//
// HOW IT WORKS, AND WHY IT IS THIS BORING
// There is no server rendering and no new framework. Each file is dist/index.html with two
// things swapped: the <head>, and the contents of <div id="root">. createRoot().render()
// replaces the children of #root when the app boots, so the block written here is a
// genuine no JavaScript fallback that React paints over a moment later. The app never sees
// it, so this cannot break the app.
//
// It is not cloaking, and it must stay that way: the block says the same thing the rendered
// page says. The method, language and honesty sentences are the ones the app itself prints.
//
// THE COMPLIANCE LINE
// No Google Places content goes into a static file. No business names, no addresses, no
// phone numbers, no ratings, no review text. Google's terms cap caching of Places content
// at 30 days and a file on a CDN indexed by a search engine is permanent publication. The
// listings load client side from /api/directory exactly as they do now. Every block this
// script writes is scanned before it is written, and anything that looks like a phone
// number or a review credit fails the build rather than shipping.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRoutes, NOINDEX_PATHS } from './routes.js';
import { buildHead } from './head.js';
import { loadTools } from './tools.mjs';
import { escapeHtml, HREFLANG, BLOCK, SITE_NAME } from './copy.js';
import { assertClean } from './compliance.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');

function crumbs(route, locale) {
  if (!route.breadcrumbs || route.breadcrumbs.length < 2) return '';
  const items = route.breadcrumbs.map((b, i) => {
    const last = i === route.breadcrumbs.length - 1;
    const inner = last
      ? `<span aria-current="page">${escapeHtml(b.name)}</span>`
      : `<a href="${escapeHtml(b.path)}">${escapeHtml(b.name)}</a>`;
    return `<li>${inner}</li>`;
  }).join('');
  return `<nav aria-label="${escapeHtml(BLOCK[locale].crumb)}"><ol>${items}</ol></nav>`;
}

export function staticBlock(route) {
  const locale = route.locale;
  const b = BLOCK[locale];
  const parts = [];
  parts.push('<div class="seo-static">');
  parts.push(crumbs(route, locale));
  parts.push(`<h1>${escapeHtml(route.h1)}</h1>`);
  for (const p of route.intro || []) parts.push(`<p>${escapeHtml(p)}</p>`);

  if (route.links && route.links.length) {
    parts.push(`<h2>${escapeHtml(b.links)}</h2>`);
    parts.push('<ul>' + route.links.map(l => {
      const note = l.note ? ` <span>${escapeHtml(l.note)}</span>` : '';
      return `<li><a href="${escapeHtml(l.href)}">${escapeHtml(l.label)}</a>${note}</li>`;
    }).join('') + '</ul>');
  }

  if (route.mentions && route.mentions.length) {
    parts.push(`<h2>${escapeHtml(b.also)}</h2>`);
    parts.push(`<p>${escapeHtml(route.mentions.join(', '))}.</p>`);
  }

  parts.push('</div>');
  const html = parts.join('\n      ');
  assertClean(html, route.path);
  return html;
}

function extractAssets(template) {
  const tags = [];
  const re = /<(script|link)\b[^>]*?(?:\/)?>(?:<\/script>)?/gi;
  for (const m of template.match(re) || []) {
    if (/\/assets\//.test(m)) tags.push(m.trim());
  }
  if (!tags.length) {
    throw new Error('No /assets/ script or stylesheet found in dist/index.html. Run vite build first.');
  }
  return tags.map(t => '    ' + t).join('\n');
}

function writePage(path, html) {
  const target = path === '/' ? join(DIST, 'index.html') : join(DIST, path, 'index.html');
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, html);
}

function render(template, { assets, headHtml, bodyHtml, lang }) {
  return template
    .replace(/<html[^>]*>/i, `<html lang="${lang}">`)
    .replace(/<head>[\s\S]*?<\/head>/i, `<head>\n${headHtml}\n  </head>`)
    .replace(/<div id="root">[\s\S]*?<\/div>/i, `<div id="root">\n      ${bodyHtml}\n    </div>`);
}

async function main() {
  if (!existsSync(join(DIST, 'index.html'))) {
    throw new Error('dist/index.html is missing. seo/prerender.mjs runs after vite build.');
  }
  const template = readFileSync(join(DIST, 'index.html'), 'utf8');
  const assets = extractAssets(template);

  const tools = await loadTools();
  const groupBySlug = Object.fromEntries(tools.map(t => [t.slug, t.group]));
  const routes = buildRoutes({ tools });

  let written = 0;
  for (const route of routes) {
    const headHtml = buildHead(route, { assets, group: groupBySlug[route.toolSlug] || '' });
    const bodyHtml = staticBlock(route);
    const html = render(template, { assets, headHtml, bodyHtml, lang: HREFLANG[route.locale] });
    assertClean(html.replace(/<script[\s\S]*?<\/script>/gi, ''), route.path);
    writePage(route.path, html);
    written++;
  }

  // The two internal routes are not in the route set, so they are in no sitemap and are
  // nobody's alternate. They still get a file, carrying a robots noindex, because a URL
  // that exists and says nothing is exactly the one a crawler guesses at.
  for (const path of NOINDEX_PATHS) {
    const route = {
      path, locale: 'en', kind: 'tool', noindex: true,
      title: `Internal | ${SITE_NAME}`,
      description: 'Internal page. Not for publication.',
      h1: 'Internal', intro: [], breadcrumbs: [], alternates: { en: `https://www.247spain.es${path}` },
    };
    const headHtml = buildHead(route, { assets });
    const html = render(template, { assets, headHtml, bodyHtml: '<div class="seo-static"></div>', lang: 'en' });
    writePage(path, html);
    written++;
  }

  const byKind = {};
  for (const r of routes) byKind[r.kind] = (byKind[r.kind] || 0) + 1;
  console.log(`prerender: ${written} files written to dist`);
  for (const [k, n] of Object.entries(byKind).sort()) console.log(`  ${k.padEnd(14)} ${n}`);
  console.log(`  ${'noindex'.padEnd(14)} ${NOINDEX_PATHS.length}`);
}

main().catch(err => { console.error('prerender failed:', err.message); process.exit(1); });
