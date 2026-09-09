#!/usr/bin/env node
// Writes dist/sitemap.xml as an index, plus one dist/sitemap-<group>.xml per group.
//
// A sitemap index rather than one file, because the protocol caps a single sitemap at
// 50,000 URLs and because splitting by kind makes Search Console useful: coverage is
// reported per sitemap, so a problem with the town pages shows up as a problem with the
// town pages rather than as a number on one line.
//
// Nothing is listed here that the prerenderer did not write. check_seo.mjs proves that
// after the fact, because a 404 in a sitemap costs more trust than a missing page does.

import { writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRoutes } from './routes.js';
import { loadTools } from './tools.mjs';
import { SITE_ORIGIN, escapeHtml } from './copy.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const MAX_PER_FILE = 45000;

const GROUP_OF = {
  home: 'pages', tool: 'pages', 'category-hub': 'pages', 'areas-index': 'pages',
  'province-hub': 'areas', 'coast-hub': 'areas',
  'town-hub': 'towns', 'town-category': 'directory',
};

const ROBOTS = `# Spain 24/7
# Everything is open except the API and the two internal routes.

User-agent: *
Allow: /
Disallow: /api/
Disallow: /internal
Disallow: /internal-linkedin

Sitemap: ${SITE_ORIGIN}/sitemap.xml
`;

function urlset(routes, lastmod) {
  const body = routes.map(r => {
    const loc = SITE_ORIGIN + (r.path === '/' ? '/' : r.path);
    const alts = Object.entries(r.alternates || {});
    const links = alts.length > 1
      ? alts.map(([l, href]) => `\n    <xhtml:link rel="alternate" hreflang="${l}" href="${escapeHtml(href)}" />`).join('')
      : '';
    return `  <url>
    <loc>${escapeHtml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority.toFixed(1)}</priority>${links}
  </url>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`;
}

function index(files, lastmod) {
  const body = files.map(f => `  <sitemap>
    <loc>${SITE_ORIGIN}/${f}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</sitemapindex>
`;
}

async function main() {
  const lastmod = new Date().toISOString().slice(0, 10);
  const routes = buildRoutes({ tools: await loadTools() });

  const grouped = new Map();
  for (const r of routes) {
    const g = GROUP_OF[r.kind] || 'pages';
    if (!grouped.has(g)) grouped.set(g, []);
    grouped.get(g).push(r);
  }

  const files = [];
  for (const [g, list] of [...grouped].sort()) {
    for (let i = 0; i * MAX_PER_FILE < list.length; i++) {
      const chunk = list.slice(i * MAX_PER_FILE, (i + 1) * MAX_PER_FILE);
      const name = i === 0 ? `sitemap-${g}.xml` : `sitemap-${g}-${i + 1}.xml`;
      writeFileSync(join(DIST, name), urlset(chunk, lastmod));
      files.push(name);
      console.log(`sitemap: ${name.padEnd(24)} ${chunk.length} urls`);
    }
  }

  writeFileSync(join(DIST, 'sitemap.xml'), index(files, lastmod));
  console.log(`sitemap: sitemap.xml             index of ${files.length} files, ${routes.length} urls`);

  // public/robots.txt is the source of truth and Vite copies it. This is the safety net for
  // the case where the copy did not happen, because a missing robots.txt means a missing
  // sitemap reference, which means nothing gets discovered.
  const robotsPath = join(DIST, 'robots.txt');
  if (!existsSync(robotsPath) || !readFileSync(robotsPath, 'utf8').includes('sitemap.xml')) {
    writeFileSync(robotsPath, ROBOTS);
    console.log('sitemap: robots.txt written (public/robots.txt was not copied)');
  } else {
    console.log('sitemap: robots.txt already in place from public/');
  }
}

main().catch(err => { console.error('sitemap failed:', err.message); process.exit(1); });
