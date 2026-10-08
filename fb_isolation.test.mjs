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
import { IDEAS, LANGS, TRANSLATION_LANGS, renderPost, linkFor, SPONSOR, BUENO_TOOL, QUEUE_ORDER, queueIndex } from './api/_fb_content.js';
import { GROUPS, ACCOUNT, groupsFor, perDay, MAX_PER_DAY, DAILY_START } from './api/_fb_groups.js';
import { imageOptionsFor, imageFor, IMAGE_KEYS, cardFor } from './api/_fb_images.js';

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
  const node = importsOf(code(`./api/${f}`)).filter(s => !s.startsWith('.'));
  ok(`api/${f} pulls in no third party module`, node.every(s => s.startsWith('node:')), node.join(', '));
}
for (const f of LK) {
  const bad = importsOf(code(`./api/${f}`)).filter(s => /_fb_|\bfb\.js\b/i.test(s));
  ok(`api/${f} imports nothing from the Facebook surface`, bad.length === 0, bad.join(', '));
}

const deck = code('./internal-poornima/index.jsx');
const moved = code('./internal-pratik/index.jsx');
ok('the old route only forwards to the new one', /\/internal-poornima/.test(moved) && !/api\/fb/.test(moved));
ok('neither deck folder has a meta.js, so neither is on a grid or in a sitemap',
   !existsSync('./internal-poornima/meta.js') && !existsSync('./internal-pratik/meta.js'));
const teamDeck = code('./internal-linkedin/index.jsx');
ok('the personal deck calls no LinkedIn endpoint', !/api\/linkedin/.test(deck));
ok('the deck asks for no language', !/action=posts[^`'"]*lang=/.test(deck));
ok('the deck has no language switcher', !/setLang|Nederlands|Svenska|Norsk\b/.test(deck));
ok('the deck shows a dashboard', /fbp-progress/.test(deck) && /reviewed/.test(deck));
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
ok('the publisher address is there',
   /poornimanirwal@gmail\.com/.test(email));
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
// Bueno came off this list in October 2026: every post now names it, on purpose. The rest
// are the companies no post may ever name.
const BANNED = /\b(Sabadell|BBVA|CaixaBank|Santander|Unicaja|Iberdrola|Naturgy|Endesa|Revolut|Wise)\b/i;
const HYPE = /\b(revolutionary|disruptive|game.changing)\b/i;
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;

const BUENO_IDEAS = IDEAS.filter(i => i.tool === BUENO_TOOL);
const TOOL_IDEAS = IDEAS.filter(i => i.tool !== BUENO_TOOL);
ok('thirty ideas', IDEAS.length === 30, String(IDEAS.length));
ok('twenty point at a 24/7 Spain tool', TOOL_IDEAS.length === 20, String(TOOL_IDEAS.length));
ok('ten are about the Bueno tax service', BUENO_IDEAS.length === 10, String(BUENO_IDEAS.length));
ok('seven languages', LANGS.length === 7 && LANGS.includes('da'));
ok('six of them are translations', TRANSLATION_LANGS.length === 6 && !TRANSLATION_LANGS.includes('en'));
ok('every idea has an image', IMAGE_KEYS.length === IDEAS.length && IDEAS.every(i => imageOptionsFor(i.key).length === 1));
ok('every idea has its own image', new Set(IDEAS.map(i => imageFor(i.key))).size === IDEAS.length);
// One image per post per language, with the text on it in that language. The files must
// exist in the repo, or the email would show a broken image.
for (const idea of IDEAS) {
  for (const lang of LANGS) {
    const url = cardFor(idea.key, lang);
    ok(`${idea.key}/${lang}: the image address is this language's`, url.includes(`/fb-cards/${idea.key}/${lang}.jpg`));
    const file = `./public/fb-cards/${idea.key}/${lang}.jpg`;
    ok(`${idea.key}/${lang}: the image file exists`, existsSync(file) && readFileSync(file).length > 20000, file);
  }
  ok(`${idea.key}: seven different images`, new Set(LANGS.map(l => cardFor(idea.key, l))).size === LANGS.length);
}
for (const lang of LANGS) {
  // Since 8 October 2026 the images come from fb_cards2.py and studio/facebook/cards2.
  const cards = JSON.parse(read(`./studio/facebook/cards2/${lang}.json`) || '{}');
  ok(`${lang}: the image text exists for every post`, IDEAS.every(i => cards[i.key] && cards[i.key].template && cards[i.key].headline && cards[i.key].photo));
  ok(`${lang}: every photo exists`, IDEAS.every(i => cards[i.key] && existsSync(`./studio/photos/${cards[i.key].photo}`)));
  ok(`${lang}: the image text has no dash`, !/[\u2014\u2013]/.test(JSON.stringify(cards)));
  ok(`${lang}: the image text never calls anything a bank`, !/\b(bank|banque|banco)/i.test(JSON.stringify(cards)));
}

const tools = new Set(TOOL_IDEAS.map(i => i.tool));
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
    ok(`${at}: names no other company`, !BANNED.test(t), (t.match(BANNED) || [])[0] || '');
    ok(`${at}: names Bueno`, /\bBueno\b/.test(t));
    ok(`${at}: never calls Bueno a bank`, !/Bueno[^.\n]*\bban(k|que|co)\b/i.test(t));
    if (idea.tool === BUENO_TOOL) {
      ok(`${at}: links to getbueno.com`, linkFor(idea.tool, lang).startsWith('https://getbueno.com/'));
      ok(`${at}: a Bueno post carries no sponsor line`, !t.includes(SPONSOR[lang]));
    } else {
      ok(`${at}: ends with this language's sponsor line`, t.endsWith(SPONSOR[lang]));
      ok(`${at}: links to 24/7 Spain`, linkFor(idea.tool, lang).startsWith('https://www.247spain.es/'));
    }
    ok(`${at}: no hype words`, !HYPE.test(t));
    const words = t.split(/\s+/).length;
    // French and German run longer than English for the same content, which is a property of
    // the languages and not of the writing. The band is on the English; translations get room.
    // The sponsor line added in October 2026 is a dozen words, so the bands moved with it.
    const cap = lang === 'en' ? 245 : 270;
    ok(`${at}: reads as a group post, not an essay`, words >= 90 && words <= cap, String(words));
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

// Danish. 24/7 Spain has no Danish pages, so a Danish tool post links to the English tool
// and says so, and a Danish Bueno post links to Bueno's own Danish page.
for (const idea of TOOL_IDEAS) {
  ok(`${idea.key}/da: links to the English tool`, linkFor(idea.tool, 'da') === linkFor(idea.tool, 'en'));
}
ok('the Danish sponsor line says the tool is in English and gives the Danish Bueno address',
   /engelsk/.test(SPONSOR.da) && /getbueno\.com\/dk/.test(SPONSOR.da));
ok('a Danish Bueno post links to the Danish tax page', linkFor(BUENO_TOOL, 'da') === 'https://getbueno.com/dk/ejendomslosninger/ejendomsskat/');
ok('each language has its own Bueno tax page', new Set(LANGS.map(l => linkFor(BUENO_TOOL, l))).size === LANGS.length);

// The Bueno posts speak as the team. None of them may slip into one person's "I built".
for (const idea of BUENO_IDEAS) {
  const t = renderPost(idea, 'en');
  ok(`${idea.key}: is not one person's "I built"`, !/\bI (built|made|wrote|got)\b/.test(t));
  ok(`${idea.key}: no penalty flavoured urgency`, !/\b(fined|a fine of|penalt(y|ies) of|before it is too late|act now|last chance)\b/i.test(t));
}
{
  const asWe = BUENO_IDEAS.filter(i => /\b(we|we're|we'll|our)\b/i.test(renderPost(i, 'en'))).length;
  ok('the Bueno posts speak as we', asWe >= BUENO_IDEAS.length - 1, `${asWe} of ${BUENO_IDEAS.length}`);
}

// Neighbouring posts never share an image template (Pratik, 8 October 2026: the images all looked the same).
{
  const c2 = JSON.parse(read('./studio/facebook/cards2/en.json') || '{}');
  const tpl = QUEUE_ORDER.map(k => c2[k] && c2[k].template);
  ok('no two posts in a row share an image template', tpl.every((t, i) => i === 0 || t !== tpl[i - 1]), tpl.join(','));
}

// THE QUEUE. Every idea has exactly one place in it, and it opens by alternating a Bueno
// post with a 24/7 Spain post, which is the mix Pratik asked for.
ok('every idea is in the queue once', QUEUE_ORDER.length === IDEAS.length
   && new Set(QUEUE_ORDER).size === IDEAS.length && IDEAS.every(i => QUEUE_ORDER.includes(i.key)));
{
  const toolOf = Object.fromEntries(IDEAS.map(i => [i.key, i.tool]));
  const first20 = QUEUE_ORDER.slice(0, 20).map(k => toolOf[k] === BUENO_TOOL);
  ok('the first twenty days alternate Bueno and 24/7 Spain', first20.every((b, i) => b === (i % 2 === 0)), first20.join(','));
  ok('an unknown key sorts last', queueIndex('nope') === QUEUE_ORDER.length);
}

// THE GROUPS. Seven accounts, one per language, and a rotation that matches the workbook.
ok('posting starts on 12 October 2026, after three days of joining groups', DAILY_START === '2026-10-12');
ok('seven accounts, numbered 1 to 7', LANGS.every(l => ACCOUNT[l] >= 1 && ACCOUNT[l] <= 7)
   && new Set(LANGS.map(l => ACCOUNT[l])).size === 7);
for (const lang of LANGS) {
  const list = GROUPS[lang] || [];
  ok(`${lang}: has groups`, list.length >= 8, String(list.length));
  ok(`${lang}: every group is a Facebook group link`, list.every(([n, u]) => n && /^https:\/\/www\.facebook\.com\/groups\/[^\s]+$/.test(u)));
  ok(`${lang}: no group is listed twice`, new Set(list.map(g => g[1].toLowerCase().replace(/\/$/, ''))).size === list.length);
  // Never more than three a day, and a gentle start: one group on day 1, two on day 2.
  ok(`${lang}: day 1 is one group`, groupsFor(lang, 1).length === 1);
  ok(`${lang}: day 2 is two groups`, groupsFor(lang, 2).length === 2);
  ok(`${lang}: no day is ever more than three`, Array.from({ length: 60 }, (_, i) => groupsFor(lang, i + 1).length).every(n => n >= 1 && n <= MAX_PER_DAY));
  ok(`${lang}: the cap is three`, MAX_PER_DAY === 3 && perDay(lang, 10) === 3);
  for (let d = 1; d <= 30; d += 1) {
    const g = groupsFor(lang, d);
    if (new Set(g.map(x => x.url)).size !== g.length) ok(`${lang}: day ${d} never repeats a group`, false);
  }
  const d1 = groupsFor(lang, 1), d2 = groupsFor(lang, 2);
  ok(`${lang}: day 2 moves on from day 1`, !d2.some(g => g.url === d1[0].url));
  const seen = new Set();
  let d = 1;
  while (seen.size < list.length && d < 200) { for (const g of groupsFor(lang, d)) seen.add(g.url); d += 1; }
  ok(`${lang}: the rotation reaches every group`, seen.size === list.length, `${seen.size} of ${list.length}`);
  // A group is not posted in again before every other group on the list has had its turn.
  const firstRepeat = (() => { const s = new Set(); for (let k = 1; k < 200; k += 1) for (const g of groupsFor(lang, k)) { if (s.has(g.url)) return s.size; s.add(g.url); } return 0; })();
  ok(`${lang}: no group comes round again early`, firstRepeat === list.length, `${firstRepeat} of ${list.length}`);
}
{
  const all = LANGS.flatMap(l => (GROUPS[l] || []).map(g => g[1].toLowerCase().replace(/\/$/, '')));
  ok('no group belongs to two accounts', new Set(all).size === all.length);
}

// THE VOICE. The first version of this content was correct and read like a reference note,
// which is the one failure none of the other assertions here would catch. Contractions are a
// crude proxy for spoken English, but a crude proxy beats none: a post with no contractions
// at all has almost certainly drifted back into the old register.
{
  const english = IDEAS.map(i => renderPost(i, 'en'));
  const withContractions = english.filter(t => /\b\w+'(s|t|re|ve|ll|d|m)\b/.test(t)).length;
  ok('the English reads as someone speaking', withContractions >= IDEAS.length - 2,
     `${withContractions} of ${IDEAS.length} posts use contractions`);
  const opensOnAThesis = english.filter(t => /^(There are|These are|It is important|The following)/.test(t)).length;
  ok('no post opens by announcing its own thesis', opensOnAThesis === 0, String(opensOnAThesis));
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
