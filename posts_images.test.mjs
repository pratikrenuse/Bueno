// The LinkedIn deck images, as agreed 22 September 2026.
//
// Every pending post has its own photograph with only the Bueno lockup on it. No
// photograph is used by two posts. The seven posts already approved or rejected keep
// exactly the frame they were decided on.
import { imageFor, imageOptionsFor, PHOTO_SOURCE, DECIDED_SLUGS, PHOTO_FRAME_BASE } from './api/_lk_images.js';
import owners from './api/_linkedin_batch1.js';
import agents from './api/_linkedin_agents.js';
import attorneys from './api/_linkedin_attorneys.js';

let pass = 0; const fails = [];
const ok_ = (n, c, x = '') => { if (c) pass++; else fails.push(`${n}${x ? ' :: ' + x : ''}`); };
const eq = (n, a, b) => ok_(n, a === b, `${JSON.stringify(a)} !== ${JSON.stringify(b)}`);

const posts = [
  ...owners.map(p => ({ ...p, audience: 'owners' })),
  ...agents.map(p => ({ ...p, audience: 'agents' })),
  ...attorneys.map(p => ({ ...p, audience: 'attorneys' })),
];
eq('105 posts', posts.length, 105);
eq('7 decided posts', DECIDED_SLUGS.size, 7);

const pending = posts.filter(p => !DECIDED_SLUGS.has(p.slug));
const decided = posts.filter(p => DECIDED_SLUGS.has(p.slug));
eq('98 pending posts', pending.length, 98);
eq('every decided slug is a real post', decided.length, 7);

for (const p of decided) {
  eq(`${p.slug}: decided post keeps its frame`, imageFor(p.audience, p.day), `/posts/${p.slug}.jpg`);
}
for (const p of pending) {
  const u = imageFor(p.audience, p.day);
  eq(`${p.slug}: its own photograph frame`, u, `${PHOTO_FRAME_BASE}${p.slug}.jpg`);
  eq(`${p.slug}: frame is first in the options`, imageOptionsFor(p.audience, p.day)[0], u);
  ok_(`${p.slug}: has a source photograph`, Number.isInteger(PHOTO_SOURCE[p.slug]));
}

const src = Object.values(PHOTO_SOURCE);
eq('one source photograph per pending post', src.length, 98);
eq('no source photograph used twice', new Set(src).size, 98);
const frames = pending.map(p => imageFor(p.audience, p.day));
eq('no two pending posts share a frame', new Set(frames).size, 98);

console.log(`\n${pass} passed, ${fails.length} failed`);
fails.forEach(f => console.log('FAIL ' + f));
process.exit(fails.length ? 1 : 0);
