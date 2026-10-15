// The LinkedIn deck images, as agreed 22 September 2026, with the Bueno cards of
// 15 October 2026.
//
// Every pending post has its own photograph with only the Bueno lockup on it. No
// photograph is used by two posts. The seven posts already approved or rejected keep
// exactly the frame they were decided on. Fifty posts (CARD_SLUGS) open on a Bueno card
// instead, with their frame kept as the second option so the deck can switch back.
import { existsSync } from 'node:fs';
import { imageFor, imageOptionsFor, PHOTO_SOURCE, DECIDED_SLUGS, PHOTO_FRAME_BASE, CARD_SLUGS, cardUrl, CARD_LANGS, cardInLanguage, plainFrame } from './api/_lk_images.js';
import { memberEmail } from './api/_dispatch.js';
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

// The frame each post had before the cards, which stays among its options.
const frameOf = (p) => DECIDED_SLUGS.has(p.slug) ? `/posts/${p.slug}.jpg` : `${PHOTO_FRAME_BASE}${p.slug}.jpg`;

eq('50 posts carry a Bueno card', CARD_SLUGS.size, 50);
for (const s of CARD_SLUGS) {
  ok_(`${s}: card slug is a real post`, posts.some(p => p.slug === s));
  ok_(`${s}: card image is in public/li-cards`, existsSync(`public/li-cards/${s}.jpg`));
}
for (const aud of ['owners', 'agents', 'attorneys']) {
  const n = posts.filter(p => p.audience === aud && CARD_SLUGS.has(p.slug)).length;
  ok_(`${aud}: some posts carry cards`, n > 0);
}

for (const p of posts) {
  const opts = imageOptionsFor(p.audience, p.day);
  if (CARD_SLUGS.has(p.slug)) {
    eq(`${p.slug}: opens on its Bueno card`, imageFor(p.audience, p.day), cardUrl(p.slug));
    eq(`${p.slug}: card first in the options`, opts[0], cardUrl(p.slug));
    eq(`${p.slug}: frame kept as second option`, opts[1], frameOf(p));
  } else {
    eq(`${p.slug}: keeps its frame`, imageFor(p.audience, p.day), frameOf(p));
    eq(`${p.slug}: frame is first in the options`, opts[0], frameOf(p));
    ok_(`${p.slug}: no card in its options`, !opts.some(u => u.startsWith('/li-cards/')));
  }
  eq(`${p.slug}: no duplicate options`, new Set(opts).size, opts.length);
}
for (const p of pending) {
  ok_(`${p.slug}: has a source photograph`, Number.isInteger(PHOTO_SOURCE[p.slug]));
}

const src = Object.values(PHOTO_SOURCE);
eq('one source photograph per pending post', src.length, 98);
eq('no source photograph used twice', new Set(src).size, 98);
const frames = pending.map(frameOf);
eq('no two pending posts share a frame', new Set(frames).size, 98);
const defaults = posts.map(p => imageFor(p.audience, p.day));
eq('no two posts open on the same image', new Set(defaults).size, 105);

// Every card exists in all six team languages.
for (const s of CARD_SLUGS) for (const l of CARD_LANGS.filter(l => l !== 'en')) {
  ok_(`${s}/${l}: translated card exists`, existsSync(`public/li-cards/${l}/${s}.jpg`));
  eq(`${s}/${l}: language address`, cardInLanguage(cardUrl(s), l), `/li-cards/${l}/${s}.jpg?v=2`);
}

// The member email: the card in the member's language, and in a translated email the
// plain photograph frame offered as a backup. English and photo posts are unchanged.
{
  const p = posts.find(x => x.slug === 'nota_simple');
  const row = { ...p, image_url: imageFor(p.audience, p.day), image_options: imageOptionsFor(p.audience, p.day) };
  const mail = (lang) => memberEmail({ member: { name: 'Test' }, post: row, text: 'x', lang, stream: 'owners', upcoming: [], translated: true, stale: false });
  for (const l of ['nl', 'sv', 'no', 'es', 'fr']) {
    const h = mail(l);
    ok_(`${l}: email shows the ${l} card`, h.includes(`https://www.247spain.es/li-cards/${l}/nota_simple.jpg?v=2`));
    ok_(`${l}: email offers the plain frame`, h.includes(`${PHOTO_FRAME_BASE}nota_simple.jpg`));
    ok_(`${l}: no English card in a translated email`, !h.includes('/li-cards/nota_simple.jpg'));
  }
  const en = mail('en');
  ok_('en: email shows the English card', en.includes('https://www.247spain.es/li-cards/nota_simple.jpg?v=2'));
  ok_('en: no backup image in the English email', !en.includes(`${PHOTO_FRAME_BASE}nota_simple.jpg`));
  eq('plain frame of a card post is its photograph frame', plainFrame(row), `${PHOTO_FRAME_BASE}nota_simple.jpg`);

  const q = posts.find(x => x.slug === 'tourist_license');
  const qrow = { ...q, image_url: imageFor(q.audience, q.day), image_options: imageOptionsFor(q.audience, q.day) };
  const qh = memberEmail({ member: { name: 'T' }, post: qrow, text: 'x', lang: 'nl', stream: 'owners', upcoming: [], translated: true, stale: false });
  eq('photo post: one image only in a translated email', (qh.match(/<img /g) || []).length, 1);
  ok_('photo post: keeps its frame', qh.includes(`${PHOTO_FRAME_BASE}tourist_license.jpg`));
}

console.log(`\n${pass} passed, ${fails.length} failed`);
fails.forEach(f => console.log('FAIL ' + f));
process.exit(fails.length ? 1 : 0);
