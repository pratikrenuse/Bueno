// The tool list, read from disk at build time.
//
// This is the one thing the browser and Node do differently: the app finds tools with
// import.meta.glob, which only exists inside Vite. So the glob lives here, in a Node only
// module, and routes.js takes the result as an argument. Adding a tool still means nothing
// more than a new folder with index.jsx and meta.js.

import { readdirSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const SKIP = new Set(['node_modules', 'dist', 'public', 'src', 'api', 'seo', 'studio', 'rules', '.git']);

export async function loadTools() {
  const out = [];
  for (const name of readdirSync(ROOT, { withFileTypes: true })) {
    if (!name.isDirectory() || SKIP.has(name.name) || name.name.startsWith('.')) continue;
    const metaPath = join(ROOT, name.name, 'meta.js');
    if (!existsSync(metaPath)) continue;
    const mod = await import(pathToFileURL(metaPath).href);
    const meta = mod.default || {};
    if (meta.active === false) continue;

    // Whether the tool's own screens run through the translation layer. Ten of the sixteen
    // do not, and a locale prefixed page for one of those says so in its static block
    // rather than implying a translation that is not there.
    const indexPath = join(ROOT, name.name, 'index.jsx');
    const src = existsSync(indexPath) ? readFileSync(indexPath, 'utf8') : '';
    const translated = /\buseT\s*\(/.test(src) || /\buseLocale\s*\(/.test(src);

    out.push({
      slug: name.name,
      path: meta.path || `/${name.name}`,
      title: meta.title || name.name,
      description: meta.description || '',
      order: meta.order ?? 99,
      group: meta.group || 'other',
      tag: meta.tag || '',
      translated,
    });
  }
  out.sort((a, b) => a.order - b.order);
  return out;
}
