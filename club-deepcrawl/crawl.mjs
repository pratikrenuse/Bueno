// Bueno Club deep email check, run by .github/workflows/club-deepcrawl.yml on GitHub's servers.
// It never touches Vercel or 247spain.es, so the live site cannot be affected.
//
// Reads club-deepcrawl/sites.json, takes its share of the venues (SHARD of SHARDS), reads up to
// MAX_PAGES pages of each venue's own website and writes club-deepcrawl/out/part-<SHARD>.json.
// The collect job then merges every part into club-deepcrawl/results.json.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { deepCrawl } from './deepcrawl.mjs';

const SHARD = parseInt(process.env.SHARD || '0', 10);
const SHARDS = parseInt(process.env.SHARDS || '1', 10);
const MAX_PAGES = parseInt(process.env.MAX_PAGES || '25', 10);
const PARALLEL = parseInt(process.env.PARALLEL || '15', 10);
const LIMIT = parseInt(process.env.LIMIT || '0', 10); // for a quick test run

const all = JSON.parse(await readFile(new URL('./sites.json', import.meta.url), 'utf8'));
let mine = all.filter((_, i) => i % SHARDS === SHARD);
if (LIMIT) mine = mine.slice(0, LIMIT);

const results = [];
let next = 0, done = 0;
const started = Date.now();

async function worker() {
  while (next < mine.length) {
    const site = mine[next++];
    let r;
    try {
      r = await deepCrawl(site, { maxPages: MAX_PAGES, budgetMs: 60000, pageMs: 9000, concurrency: 5 });
    } catch (e) {
      r = { id: site.id, website: site.website, status: 'error', error: String(e?.message || e), pages: 0, emails: [] };
    }
    results.push({ ...r, tab: site.tab, town: site.town });
    done += 1;
    if (done % 25 === 0 || done === mine.length) {
      const min = ((Date.now() - started) / 60000).toFixed(1);
      console.log(`shard ${SHARD}: ${done}/${mine.length} sites in ${min} min`);
    }
  }
}

await Promise.all(Array.from({ length: PARALLEL }, worker));
await mkdir(new URL('./out/', import.meta.url), { recursive: true });
await writeFile(new URL(`./out/part-${SHARD}.json`, import.meta.url), JSON.stringify(results));
const withEmail = results.filter(r => r.emails?.length).length;
console.log(`shard ${SHARD} finished: ${results.length} sites, ${withEmail} with at least one email`);
