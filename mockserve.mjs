// Serves dist/ with an SPA fallback and a stubbed /api/directory, so both directories can
// be driven end to end in a browser without spending a Google call. The fixture is built
// to exercise every branch: a business reviewed in Norwegian, one reviewed only in
// English, one with a phrase mention and no foreign review, and one with nothing at all.
import http from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.otf': 'font/otf',
  '.jpg': 'image/jpeg', '.png': 'image/png' };

const rev = (author, text, lang, relative) => ({
  rating: 5, text, lang, relative, author,
  author_uri: 'https://maps.google.com/reviewer',
  author_photo: null,
  uri: 'https://maps.google.com/review',
  published: '2026-05-01T00:00:00Z',
});

const PROVIDERS = [
  {
    id: 'a', name: 'Fontaneria Costa Nord', address: 'Carrer del Port 14, Javea',
    rating: 4.7, review_count: 212, phone: '+34 965 000 001',
    website: 'https://example.com', maps_uri: 'https://maps.google.com/a', score: 4.62,
    fit_langs: { no: 2, en: 1 }, reviews_analysed: 5, fit: 11,
    fit_evidence: {
      language: { count: 1, quote: '...they spoke English with us the whole time...', lang: 'no' },
      remote: { count: 1, quote: '...fixed the leak while we were away in Norway...', lang: 'no' },
      updates: { count: 1, quote: '...sent us photos of each stage of the work...', lang: 'no' },
    },
    reviews: [
      rev('Ingrid H.', 'Fixed the leak while we were away in Norway and sent us photos of each stage. Could not ask for more.', 'no', '2 months ago'),
      rev('David P.', 'They spoke English with us the whole time and gave a written quote before starting.', 'en', '5 months ago'),
    ],
  },
  {
    id: 'b', name: 'Instalaciones Mediterraneo', address: 'Avenida del Pla 88, Javea',
    rating: 4.8, review_count: 96, phone: '+34 965 000 002',
    website: null, maps_uri: 'https://maps.google.com/b', score: 4.55,
    fit_langs: { en: 3 }, reviews_analysed: 5, fit: 11,
    fit_evidence: {
      paperwork: { count: 1, quote: '...gave a detailed written quote with no hidden costs...', lang: 'en' },
      access: { count: 1, quote: '...our neighbour let them in and all went fine...', lang: 'en' },
    },
    reviews: [
      rev('Sarah W.', 'Gave a detailed written quote with no hidden costs. Our neighbour let them in and all went fine.', 'en', '3 weeks ago'),
    ],
  },
  {
    id: 'c', name: 'Servicios Tecnicos Ribera', address: 'Calle Mayor 3, Javea',
    rating: 4.9, review_count: 41, phone: '+34 965 000 003',
    website: 'https://example.com', maps_uri: 'https://maps.google.com/c', score: 4.44,
    fit_langs: {}, reviews_analysed: 4, fit: 2,
    fit_evidence: { language: { count: 1, quote: '...no problem communicating in German...', lang: 'es' } },
    reviews: [rev('Miguel A.', 'Trabajo rapido y bien hecho. No problem communicating in German for my neighbour.', 'es', '1 month ago')],
  },
  {
    id: 'd', name: 'Reformas y Mantenimiento Vila', address: 'Poligono Industrial 21, Javea',
    rating: 4.6, review_count: 318, phone: '+34 965 000 004',
    website: null, maps_uri: 'https://maps.google.com/d', score: 4.53,
    fit_langs: {}, reviews_analysed: 5, fit: 0, fit_evidence: {},
    reviews: [rev('Carmen R.', 'Muy profesionales y puntuales, precio justo.', 'es', '2 weeks ago')],
  },
];

const ROOT = 'dist';

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/api/directory') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ providers: PROVIDERS, cached: true, refreshed_at: '2026-09-01T00:00:00Z' }));
    return;
  }
  let p = join(ROOT, url.pathname === '/' ? 'index.html' : url.pathname.slice(1));
  if (!existsSync(p) || statSync(p).isDirectory()) p = join(ROOT, 'index.html');
  res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' });
  res.end(readFileSync(p));
}).listen(4180, () => console.log('mock on 4180'));
