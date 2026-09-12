// The guarantee that the personal Facebook deck and the team LinkedIn deck cannot reach
// each other.
//
// This is not a style check. The instruction behind this surface was that content must
// never cross between the two, and that the team deck must not be touched or broken by
// anything done here. The cheapest way to keep a promise like that is to make the coupling
// impossible and then assert that it is still impossible on every run.
//
// Four things are asserted:
//   1. No file on either side imports a file from the other.
//   2. The new surface names exactly one table, and it is not one of theirs.
//   3. The new surface adds exactly one serverless function, so the deployment stays under
//      the Hobby plan limit that has bitten this repo before.
//   4. Every post the content module produces carries the right localised link and none of
//      the wording the brand rules forbid.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { IDEAS, LANGS, renderPost, linkFor } from './api/_fb_content.js';
import { imageOptionsFor, imageFor, IMAGE_KEYS } from './api/_fb_images.js';

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => cond ? pass++ : (fail++, console.log('FAIL', name, extra));

const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '');
// These files explain in comments exactly which tables they must stay away from, so a naive
// grep would flag the explanation as the offence. Strip comments first and check the code.
const code = (p) => read(p).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const importsOf = (src) => [...src.matchAll(/(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g)].map(m => m[1]);

// 1. Neither side imports the other, anywhere.
const apiFiles = readdirSync('./api').filter(f => f.endsWith('.js'));
const FB = apiFiles.filter(f => f === 'fb.js' || f.startsWith('_fb_'));
const LK = apiFiles.filter(f => f === 'linkedin.js' || f.startsWith('_lk_') || f.startsWith('linkedin'));

ok('the new surface has its own files', FB.length >= 6, FB.join(', '));
ok('the LinkedIn surface is still present', LK.length >= 8, String(LK.length));

// The strict form of the rule. A Facebook file may import its own siblings and nothing else
// in api/. Naming the LinkedIn files specifically would have missed api/_email.js, which is
// the LinkedIn program's shared email module and exactly the kind of thing that gets reached
// for when a second surface needs to send mail.
for (const f of FB) {
  const local = importsOf(code(`./api/${f}`)).filter(s => s.startsWith('.'));
  const bad = local.filter(s => !/^\.\/_fb_[a-z_]+\.js$/.test(s));
  ok(`api/${f} imports only its own siblings`, bad.length === 0, bad.join(', '));
}
for (const f of LK) {
  const bad = importsOf(code(`./api/${f}`)).filter(s => /_fb_|\bfb\.js\b/i.test(s));
  ok(`api/${f} imports nothing from the Facebook surface`, bad.length === 0, bad.join(', '));
}

const deck = code('./internal-pratik/index.jsx');
const teamDeck = code('./internal-linkedin/index.jsx');
ok('the personal deck calls no LinkedIn endpoint', !/api\/linkedin/.test(deck));
ok('the personal deck names no LinkedIn table', !/linkedin_posts|studio_packages/.test(deck));
ok('the team deck calls no Facebook endpoint', !/api\/fb\b|action=seed/.test(teamDeck));
ok('the team deck is still wired to its own API', /api\/linkedin/.test(teamDeck));

// 2. One table, named in one place, and it is not one of theirs.
const db = code('./api/_fb_db.js');
ok('the table is a constant, not a parameter', /export const TABLE = 'fb_posts'/.test(db));
for (const f of FB) {
  const src = code(`./api/${f}`);
  ok(`api/${f} names no other table`, !/linkedin_posts|studio_packages|linkedin_emails|team_members/.test(src));
}
const handlersNameTable = FB.filter(f => f !== '_fb_db.js' && /rest\/v1\//.test(code(`./api/${f}`)));
ok('only _fb_db.js builds a Supabase URL', handlersNameTable.length === 0, handlersNameTable.join(', '));

// 2b. The recipients are named once, in the email module, and nowhere else.
const email = code('./api/_fb_email.js');
ok('the publisher is the intern address', /himanshu1997bisht@gmail\.com/.test(email));
ok('Pratik is copied on every send', /export const SEND_CC = \[PRATIK\]/.test(email));
ok('the copy list is not empty', !/export const SEND_CC = \[\]/.test(email));
for (const f of FB.filter(x => x !== '_fb_email.js')) {
  ok(`api/${f} names no email address`, !/@[a-z0-9.-]+\.[a-z]{2,}/i.test(code(`./api/${f}`)));
}
ok('no team address appears anywhere in this surface',
   !FB.some(f => /john@getbueno\.com|maria@getbueno\.com/i.test(code(`./api/${f}`))));
ok('the deck itself names no email address', !/@[a-z0-9.-]+\.[a-z]{2,}/i.test(deck));

// 2c. Nothing is added to a post on the way out. What was approved is what is sent.
ok('the send path appends no call to action', !/withCta|CTA\b/.test(email + code('./api/_fb_decide.js')));

// 3. Exactly one new routed function. Files starting with "_" are not routes.
const routed = FB.filter(f => !f.startsWith('_'));
ok('the new surface costs one function slot', routed.length === 1, routed.join(', '));

// 4. The content itself.
const BANNED = /\b(Bueno|Sabadell|BBVA|CaixaBank|Santander|Unicaja|Iberdrola|Naturgy|Endesa|Revolut|Wise)\b/i;
const HYPE = /\b(revolutionary|disruptive|game.changing)\b/i;
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;

ok('twenty ideas', IDEAS.length === 20, String(IDEAS.length));
ok('six languages', LANGS.length === 6);
ok('every idea has images', IMAGE_KEYS.length === IDEAS.length && IDEAS.every(i => imageOptionsFor(i.key).length === 12));
ok('every idea has a distinct lead image', new Set(IDEAS.map(i => imageFor(i.key))).size === IDEAS.length);

const tools = new Set(IDEAS.map(i => i.tool));
ok('every tool folder named by an idea exists', [...tools].every(t => existsSync(`./${t}/index.jsx`)),
   [...tools].filter(t => !existsSync(`./${t}/index.jsx`)).join(', '));

const keys = new Set();
for (const idea of IDEAS) {
  ok(`${idea.key}: key is unique`, !keys.has(idea.key));
  keys.add(idea.key);
  ok(`${idea.key}: kind is one of two`, idea.kind === 'story' || idea.kind === 'informative');

  for (const lang of LANGS) {
    const t = renderPost(idea, lang);
    const at = `${idea.key}/${lang}`;
    ok(`${at}: written`, !!t);
    if (!t) continue;
    ok(`${at}: the link placeholder is resolved`, !t.includes('{link}'));
    ok(`${at}: links to this locale's page`, t.includes(linkFor(idea.tool, lang)));
    const wrong = LANGS.filter(l => l !== lang).map(l => linkFor(idea.tool, l))
      .filter(u => u !== linkFor(idea.tool, lang) && t.includes(u));
    ok(`${at}: links to no other locale`, wrong.length === 0, wrong.join(', '));
    ok(`${at}: no em or en dash`, !/[—–]/.test(t));
    ok(`${at}: no emoji`, !EMOJI.test(t));
    ok(`${at}: names no brand`, !BANNED.test(t), (t.match(BANNED) || [])[0] || '');
    ok(`${at}: no hype words`, !HYPE.test(t));
    const words = t.split(/\s+/).length;
    ok(`${at}: reads as a group post, not an essay`, words >= 90 && words <= 230, String(words));
  }
}

// Every figure in a post must be traceable. Rule ids are checked against the rules base.
const RULES = {};
for (const f of readdirSync('./rules')) {
  if (!f.endsWith('.json') || f.startsWith('_')) continue;
  for (const r of (JSON.parse(readFileSync(`./rules/${f}`, 'utf8')).rules || [])) if (r.id) RULES[r.id] = r;
}
for (const idea of IDEAS) {
  for (const id of idea.rules || []) {
    ok(`${idea.key}: rule ${id} exists`, !!RULES[id]);
    ok(`${idea.key}: rule ${id} is verified`, RULES[id] && RULES[id].status === 'verified',
       RULES[id] ? RULES[id].status : 'missing');
  }
}

// The first person here is a builder, not an owner. Pratik does not own property in Spain,
// so a post must never put that claim in his mouth.
const OWNS = /\b(my (flat|villa|apartment|house|place|property) in spain|when i bought (my|our)|our place in spain)\b/i;
for (const idea of IDEAS) {
  const t = renderPost(idea, 'en');
  ok(`${idea.key}: claims no property of his own`, !OWNS.test(t), (t.match(OWNS) || [])[0] || '');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
