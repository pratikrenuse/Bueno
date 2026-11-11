// Bueno Club deep email check, run on your own Mac. Nothing here touches Vercel, GitHub
// or 247spain.es. It only reads the venues' own public websites over your internet.
//
//   cd ~/Documents/GitHub/Bueno && caffeinate -i node club-deepcrawl/run-all.mjs
//
// Needs Node 18 or newer. Saves progress to club-deepcrawl/results.json every 100 sites, so if
// it stops (Mac asleep, Wi-Fi drop, Ctrl+C) just run the same command again and it carries on.
import { readFile, writeFile, rename } from 'node:fs/promises';
import { deepCrawl } from './deepcrawl.mjs';

const MAX_PAGES = parseInt(process.env.MAX_PAGES || '25', 10);
const PARALLEL = parseInt(process.env.PARALLEL || '30', 10);
const here = (f) => new URL(f, import.meta.url);

if (typeof fetch !== 'function') {
  console.log('This needs Node 18 or newer. Install the LTS version from https://nodejs.org and run the command again.');
  process.exit(1);
}

const sites = JSON.parse(await readFile(here('./sites.json'), 'utf8'));
let saved = { results: [] };
try { saved = JSON.parse(await readFile(here('./results.json'), 'utf8')); } catch { /* first run */ }
const results = saved.results || [];
const done = new Set(results.map(r => r.id));
const todo = sites.filter(s => !done.has(s.id));
console.log(`${sites.length} venue websites. ${done.size} already checked, ${todo.length} to go. Reading up to ${MAX_PAGES} pages each, ${PARALLEL} sites at a time.`);

const started = Date.now();
let next = 0, finished = 0, sinceSave = 0, saving = Promise.resolve();

const save = () => {
  saving = saving.then(async () => {
    const summary = {
      saved_at: new Date().toISOString(), sites: sites.length, checked: results.length,
      with_email: results.filter(r => r.emails?.length).length,
      blocked: results.filter(r => r.status === 'blocked').length,
    };
    const tmp = here('./results.tmp.json');
    await writeFile(tmp, JSON.stringify({ summary, results }));
    await rename(tmp, here('./results.json'));
  });
  return saving;
};

async function worker() {
  while (next < todo.length) {
    const site = todo[next++];
    let r;
    try {
      // Hard stop per website so one site that never answers cannot hold up the run.
      r = await Promise.race([
        deepCrawl(site, { maxPages: MAX_PAGES, budgetMs: 60000, pageMs: 9000, concurrency: 4 }),
        new Promise(res => setTimeout(() => res({ id: site.id, website: site.website, status: 'timeout', pages: 0, emails: [] }), 90000)),
      ]);
    } catch (e) {
      r = { id: site.id, website: site.website, status: 'error', error: String(e?.message || e), pages: 0, emails: [] };
    }
    results.push({ ...r, tab: site.tab, town: site.town });
    finished += 1; sinceSave += 1;
    if (sinceSave >= 100) { sinceSave = 0; save(); }
    if (finished % 50 === 0 || finished === todo.length) {
      const min = (Date.now() - started) / 60000;
      const rate = finished / Math.max(min, 0.01);
      const left = Math.round((todo.length - finished) / rate);
      console.log(`${finished}/${todo.length} checked in ${min.toFixed(1)} min, about ${left} min to go`);
    }
  }
}

const keepAlive = setInterval(() => {}, 10000);
process.on('beforeExit', () => save());
process.on('SIGINT', async () => { console.log('\nStopping. Saving what is done so far...'); await save(); process.exit(0); });
await Promise.all(Array.from({ length: PARALLEL }, worker));
await save();
clearInterval(keepAlive);
console.log(`Finished. ${results.length} websites checked, ${results.filter(r => r.emails?.length).length} with at least one email. Tell Claude it is done.`);
