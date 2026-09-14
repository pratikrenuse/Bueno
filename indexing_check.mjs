// The indexing layer, checked.
//
// Two things can quietly break here and neither shows up as a failed build. The lastmod
// ledger can start claiming everything changed, which is what it exists to prevent. And the
// IndexNow key file can stop matching its own filename, which turns every submission into a
// silent 403. Both are cheap to assert and expensive to discover.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { contentHash, resolveLastmod, readLedger } from './seo/lastmod.mjs';
import { findKey, changedUrls } from './seo/submit.mjs';

let pass = 0, fail = 0;
const ok = (n, c, x = '') => c ? pass++ : (fail++, console.log('FAIL', n, x));

// --- the ledger ---------------------------------------------------------------------------
const route = (over = {}) => ({
  path: '/x', title: 'T', description: 'D', h1: 'H',
  intro: ['one'], links: [{ href: '/a', label: 'A' }], ...over,
});

ok('the same content hashes the same', contentHash(route()) === contentHash(route()));
ok('a changed heading changes the hash', contentHash(route()) !== contentHash(route({ h1: 'Other' })));
ok('changed body text changes the hash', contentHash(route()) !== contentHash(route({ intro: ['two'] })));
ok('a changed title changes the hash', contentHash(route()) !== contentHash(route({ title: 'Other' })));
ok('link order does not change the hash',
   contentHash(route({ links: [{ href: '/a', label: 'A' }, { href: '/b', label: 'B' }] }))
   === contentHash(route({ links: [{ href: '/b', label: 'B' }, { href: '/a', label: 'A' }] })));

// The whole point: a rebuild that changes nothing must report nothing.
{
  const routes = [route({ path: '/a' }), route({ path: '/b' })];

  const first = resolveLastmod(routes, { now: '2026-01-01', previous: {} });
  ok('the first run seeds without claiming changes', first.seeded && first.changed.length === 0);
  ok('and dates everything that day', Object.values(first.ledger).every(v => v.date === '2026-01-01'));

  // A rebuild that changes nothing is the common case, and the one that must stay silent.
  const again = resolveLastmod(routes, { now: '2026-02-01', previous: first.ledger });
  ok('an unchanged rebuild reports nothing', again.changed.length === 0);
  ok('and keeps the old dates', Object.values(again.ledger).every(v => v.date === '2026-01-01'));

  // One page edited means one page announced, not two.
  const edited = [route({ path: '/a' }), route({ path: '/b', h1: 'Rewritten' })];
  const third = resolveLastmod(edited, { now: '2026-03-01', previous: first.ledger });
  ok('only the edited page is reported', third.changed.length === 1 && third.changed[0] === '/b',
     third.changed.join(', '));
  ok('the edited page gets today', third.ledger['/b'].date === '2026-03-01');
  ok('the untouched page keeps its own date', third.ledger['/a'].date === '2026-01-01');

  // A brand new page is a change worth announcing.
  const grown = [...routes, route({ path: '/c' })];
  const fourth = resolveLastmod(grown, { now: '2026-04-01', previous: first.ledger });
  ok('a new page is announced', fourth.changed.includes('/c'));

  // A deleted page is noted but never submitted: there is nothing to crawl.
  const shrunk = [route({ path: '/a' })];
  const fifth = resolveLastmod(shrunk, { now: '2026-05-01', previous: first.ledger });
  ok('a removed page is tracked separately', fifth.removed.includes('/b') && !fifth.changed.includes('/b'));
}

// --- the real ledger on disk ----------------------------------------------------------------
const ledger = readLedger();
ok('the ledger is committed and populated', Object.keys(ledger).length > 1000, String(Object.keys(ledger).length));
ok('every entry carries a hash and a date',
   Object.values(ledger).every(v => v && typeof v.hash === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v.date)));

// --- the IndexNow key -----------------------------------------------------------------------
const key = findKey();
ok('there is exactly one key file in public/', !!key,
   readdirSync('./public').filter(f => /^[a-f0-9]{8,128}\.txt$/i.test(f)).join(', ') || 'none');
if (key) {
  ok('the key file contains its own key, which is what stops a 403',
     readFileSync(`./public/${key.file}`, 'utf8').trim() === key.key);
  ok('the key is long enough to be accepted', key.key.length >= 8 && key.key.length <= 128);
  ok('the key file is published to dist', existsSync(`./dist/${key.file}`));
}

// --- what a build would submit --------------------------------------------------------------
if (existsSync('./dist/changed-urls.json')) {
  const c = changedUrls();
  ok('the changed list is an array', Array.isArray(c.changed));
  ok('every url is absolute and on the right host',
     c.changed.every(u => u.startsWith('https://www.247spain.es/')), c.changed.slice(0, 2).join(', '));
  ok('a build never announces the whole site', c.seeded || c.changed.length < 500, String(c.changed.length));
  // The sitemap and the submission have to agree, or one of them is lying.
  if (existsSync('./dist/sitemap-pages.xml')) {
    const xml = readFileSync('./dist/sitemap-pages.xml', 'utf8');
    const dates = [...xml.matchAll(/<lastmod>(.*?)<\/lastmod>/g)].map(m => m[1]);
    ok('every lastmod is a plain date, not a function or a placeholder',
       dates.every(d => /^\d{4}-\d{2}-\d{2}$/.test(d)), dates.find(d => !/^\d{4}-\d{2}-\d{2}$/.test(d)) || '');
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
