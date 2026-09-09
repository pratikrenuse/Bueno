#!/usr/bin/env node
// The build gate. Run it last: it reads what was actually written to dist rather than what
// the route builder intended, so a bug between the two is caught rather than hidden.
//
// Every rule here exists because breaking it is expensive and silent. A duplicate title
// across two thousand pages does not throw an error, it just quietly caps what the site can
// rank for. An hreflang pointing at a URL that does not exist does not degrade to being
// ignored, it invalidates the cluster. A sitemap entry with no file behind it spends crawl
// budget on a 404 and costs trust that takes months to earn back.
//
// Failing the build is the point. A broken deploy is recoverable in minutes. A site indexed
// wrongly is not.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRoutes, NOINDEX_PATHS } from './routes.js';
import { loadTools } from './tools.mjs';
import { FORBIDDEN } from './compliance.js';
import { SITE_ORIGIN, TITLE_MIN, TITLE_MAX, DESC_MIN, DESC_MAX } from './copy.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');

const errors = [];
const fail = (msg) => errors.push(msg);

// Only text we publish as text. The hashed JS and CSS bundles are excluded on purpose:
// minified code is full of long digit runs and would trip the phone number patterns on
// every build without ever having carried a listing.
const SCANNED = new Set(['.html', '.xml', '.txt', '.json']);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const pick = (html, re) => { const m = html.match(re); return m ? m[1].trim() : null; };
const decode = s => String(s)
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

async function main() {
  if (!existsSync(DIST)) { console.error('check_seo: no dist directory. Run the build first.'); process.exit(1); }

  const routes = buildRoutes({ tools: await loadTools() });
  const routeUrls = new Set(routes.map(r => SITE_ORIGIN + (r.path === '/' ? '/' : r.path)));
  const files = walk(DIST);

  // --- 1. Google Places data anywhere we publish text ------------------------------------
  for (const file of files) {
    if (!SCANNED.has(extname(file))) continue;
    const raw = readFileSync(file, 'utf8');
    const text = raw.replace(/<script[\s\S]*?<\/script>/gi, ' ');
    for (const f of FORBIDDEN) {
      const m = text.match(f.re);
      if (m) fail(`${relative(ROOT, file)}: looks like Google Places data, a ${f.name}: ${JSON.stringify(m[0])}`);
    }
  }

  // --- 2. every route has a file, and the file says what it should ------------------------
  const titles = new Map();
  const descriptions = new Map();
  let checked = 0;

  for (const route of routes) {
    const target = route.path === '/' ? join(DIST, 'index.html') : join(DIST, route.path, 'index.html');
    if (!existsSync(target)) { fail(`${route.path}: no file at ${relative(ROOT, target)}`); continue; }
    const html = readFileSync(target, 'utf8');
    checked++;

    const title = decode(pick(html, /<title>([\s\S]*?)<\/title>/i) || '');
    const desc = decode(pick(html, /<meta name="description" content="([^"]*)"/i) || '');
    const canonical = pick(html, /<link rel="canonical" href="([^"]*)"/i);
    const h1 = decode((pick(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i) || '').replace(/<[^>]+>/g, '').trim());

    if (!title) fail(`${route.path}: no <title>`);
    if (title.length > TITLE_MAX) fail(`${route.path}: title is ${title.length} characters, limit is ${TITLE_MAX}: ${JSON.stringify(title)}`);
    if (title.length < TITLE_MIN) fail(`${route.path}: title is ${title.length} characters, minimum is ${TITLE_MIN}: ${JSON.stringify(title)}`);

    if (!desc) fail(`${route.path}: no meta description`);
    else if (desc.length < DESC_MIN || desc.length > DESC_MAX) {
      fail(`${route.path}: description is ${desc.length} characters, allowed ${DESC_MIN} to ${DESC_MAX}: ${JSON.stringify(desc)}`);
    }

    if (!canonical) fail(`${route.path}: no canonical`);
    else if (!canonical.startsWith('https://')) fail(`${route.path}: canonical is not absolute: ${canonical}`);
    else if (!canonical.startsWith(SITE_ORIGIN + '/')) fail(`${route.path}: canonical is not on ${SITE_ORIGIN}: ${canonical}`);

    if (!h1) fail(`${route.path}: no <h1> in the static block`);
    else if (h1.toLowerCase() === title.toLowerCase()) fail(`${route.path}: <h1> is identical to <title>: ${JSON.stringify(h1)}`);

    if (title) {
      if (titles.has(title)) fail(`duplicate title on ${titles.get(title)} and ${route.path}: ${JSON.stringify(title)}`);
      else titles.set(title, route.path);
    }
    if (desc) {
      if (descriptions.has(desc)) fail(`duplicate description on ${descriptions.get(desc)} and ${route.path}: ${JSON.stringify(desc)}`);
      else descriptions.set(desc, route.path);
    }

    for (const m of html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/gi)) {
      const [, lang, href] = m;
      if (!routeUrls.has(decode(href))) {
        fail(`${route.path}: hreflang ${lang} points at ${href}, which is not a published URL`);
      }
    }
  }

  // --- 3. the two internal routes are noindex and are in nothing --------------------------
  for (const path of NOINDEX_PATHS) {
    const target = join(DIST, path, 'index.html');
    if (!existsSync(target)) { fail(`${path}: no file, so nothing declares it noindex`); continue; }
    const html = readFileSync(target, 'utf8');
    if (!/<meta name="robots" content="noindex/i.test(html)) fail(`${path}: is not marked noindex`);
    if (routeUrls.has(SITE_ORIGIN + path)) fail(`${path}: is in the route set and should not be`);
  }

  // --- 4. nothing in a sitemap without a file behind it -----------------------------------
  const indexPath = join(DIST, 'sitemap.xml');
  let sitemapUrls = 0;
  if (!existsSync(indexPath)) fail('dist/sitemap.xml is missing');
  else {
    const children = [...readFileSync(indexPath, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    if (!children.length) fail('dist/sitemap.xml lists no sitemaps');
    for (const child of children) {
      const name = child.replace(SITE_ORIGIN + '/', '');
      const childPath = join(DIST, name);
      if (!existsSync(childPath)) { fail(`sitemap index points at ${name}, which does not exist`); continue; }
      const locs = [...readFileSync(childPath, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
      if (locs.length > 50000) fail(`${name} has ${locs.length} urls, the protocol limit is 50000`);
      for (const loc of locs) {
        sitemapUrls++;
        const p = decode(loc).replace(SITE_ORIGIN, '') || '/';
        const target = p === '/' ? join(DIST, 'index.html') : join(DIST, p, 'index.html');
        if (!existsSync(target)) fail(`${name} lists ${loc}, which has no file in dist`);
        if (!routeUrls.has(decode(loc))) fail(`${name} lists ${loc}, which is not in the route set`);
      }
    }
  }

  // --- 5. robots ---------------------------------------------------------------------------
  const robots = join(DIST, 'robots.txt');
  if (!existsSync(robots)) fail('dist/robots.txt is missing');
  else {
    const txt = readFileSync(robots, 'utf8');
    for (const need of ['Disallow: /api/', 'Disallow: /internal', 'Disallow: /internal-linkedin', 'sitemap.xml']) {
      if (!txt.includes(need)) fail(`dist/robots.txt does not contain ${JSON.stringify(need)}`);
    }
  }

  console.log(`check_seo: ${checked} pages checked, ${titles.size} unique titles, ${descriptions.size} unique descriptions, ${sitemapUrls} sitemap urls`);
  if (errors.length) {
    console.error(`\ncheck_seo FAILED with ${errors.length} problem${errors.length === 1 ? '' : 's'}:\n`);
    for (const e of errors.slice(0, 40)) console.error('  ' + e);
    if (errors.length > 40) console.error(`  ...and ${errors.length - 40} more`);
    process.exit(1);
  }
  console.log('check_seo: clean');
}

main().catch(err => { console.error('check_seo failed to run:', err.message); process.exit(1); });
