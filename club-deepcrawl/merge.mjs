// Merges the shard outputs into club-deepcrawl/results.json (one record per venue website).
import { readdir, readFile, writeFile } from 'node:fs/promises';

const dir = new URL('./out/', import.meta.url);
const files = (await readdir(dir)).filter(f => /^part-\d+\.json$/.test(f));
const all = [];
for (const f of files) all.push(...JSON.parse(await readFile(new URL(f, dir), 'utf8')));
const count = (s) => all.filter(r => r.status === s).length;
const summary = {
  finished_at: new Date().toISOString(),
  sites: all.length,
  with_email: all.filter(r => r.emails?.length).length,
  ok: count('ok') + count('ok_time_limit'),
  blocked: count('blocked'),
  unreachable: all.filter(r => !/^ok/.test(r.status || '')).length,
};
await writeFile(new URL('./results.json', import.meta.url), JSON.stringify({ summary, results: all }));
console.log(JSON.stringify(summary));
