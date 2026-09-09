#!/usr/bin/env node
// Serves dist the way Vercel does: a real file if one exists at that path, otherwise the
// SPA shell. That distinction is the whole point, because the prerendered files only help
// if they are found before the catch-all.
//
//   node serve_dist.mjs        http://localhost:4180
//
// /api returns 503 JSON. There are no functions here, and answering with HTML would hide
// exactly the failure smoke.mjs exists to catch.

import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(resolve(dirname(fileURLToPath(import.meta.url))), 'dist');
const PORT = Number(process.argv[2] || 4180);
const TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.xml': 'application/xml',
  '.txt': 'text/plain', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
};

if (!existsSync(DIST)) {
  console.error('no dist directory. Run npm run build first.');
  process.exit(1);
}

createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url.startsWith('/api/')) {
    res.writeHead(503, { 'content-type': 'application/json' });
    res.end('{"error":"serve_dist has no serverless functions"}');
    return;
  }
  let p = join(DIST, url);
  if (existsSync(p) && statSync(p).isDirectory()) p = join(p, 'index.html');
  if (!existsSync(p) || statSync(p).isDirectory()) p = join(DIST, 'index.html');
  res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' });
  res.end(readFileSync(p));
}).listen(PORT, () => console.log(`serving dist on http://localhost:${PORT}`));
