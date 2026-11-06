// Tests for the Instagram reels (api/reels.js, api/_reels.js). Every outside service is
// mocked: Supabase, Claude and Resend. Run: node reels.test.mjs
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import crypto from 'node:crypto';

process.env.SUPABASE_URL = 'https://sb.test';
process.env.SUPABASE_SERVICE_KEY = 'service-key';
process.env.INTERNAL_PASSCODE = 'pass';
process.env.RESEND_API_KEY = 're_test';
process.env.ANTHROPIC_API_KEY = 'sk-test';

let failed = 0;
const ok = (name, cond, extra = '') => { if (cond) console.log(`  ok  ${name}`); else { failed++; console.log(`  FAIL ${name} ${extra}`); } };

// The live copy sits in .github/workflows; studio/reels holds the same file.
const WORKFLOW = existsSync('./.github/workflows/reels-render.yml') ? './.github/workflows/reels-render.yml' : './studio/reels/reels-render.yml';
const R = await import('./api/_reels.js');
const { resolveAction, ACTIONS } = await import('./api/reels.js');

// --- 1. routing and isolation ------------------------------------------------------------
ok('the router knows every reel action', ['plan', 'translate', 'jobs', 'upload-url', 'done', 'list', 'resend', 'rerender', 'health'].every(a => ACTIONS.includes(a)));
ok('/api/reels/upload-url resolves', resolveAction({ url: '/api/reels/upload-url', query: {} }) === 'upload-url');
ok('an unknown action is refused', resolveAction({ url: '/api/reels?action=x', query: { action: 'x' } }) === null);
const vercel = JSON.parse(readFileSync('./vercel.json', 'utf8'));
const iR = vercel.rewrites.findIndex(r => r.source === '/api/reels/:action');
ok('the /api/reels/:action rewrite comes before the catch-all', iR !== -1 && iR < vercel.rewrites.findIndex(r => r.source === '/api/(.*)'));
ok('api/news.js does not touch the reels', !/_reels/.test(readFileSync('./api/news.js', 'utf8')));
const reelCode = readFileSync('./api/_reels.js', 'utf8');
ok('the reels never write to news_items', !/newsDb\('items'[^)]*method/.test(reelCode) && !/PATCH[^\n]*news_items/.test(reelCode));
ok('no reel file, page or workflow names the publisher', !['./api/_reels.js', './api/reels.js', './api/_reels_facts.js', './internal-reels/index.jsx', './studio/reels/render.py', WORKFLOW]
  .some(p => /poornima/i.test(readFileSync(p, 'utf8').replace(/poornimanirwal@gmail\.com/g, ''))));
ok('the page has no meta.js', !readdirSync('./internal-reels').includes('meta.js'));
ok('the page is noindex', /'\/internal-reels'/.test(readFileSync('./seo/routes.js', 'utf8')));
ok('the workflow holds no key, only a secret reference', !/[0-9a-f]{40,}/.test(readFileSync(WORKFLOW, 'utf8')) && /secrets\.SUPABASE_SERVICE_KEY/.test(readFileSync(WORKFLOW, 'utf8')));
ok('until approved, the email goes to Pratik alone', R.LIVE === false && R.recipients().to.join() === 'pratik.y.renuse@gmail.com' && R.recipients().bcc.length === 0);

// --- 2. figures and checks ---------------------------------------------------------------
ok('number styles compare as digits', R.numbers('2,955 euros').join() === '2955' && R.numbers('2 955 kr').join() === '2955' && R.numbers('2.955 Euro').join() === '2955' && R.numbers('11,2 %').join() === '112');
const story = {
  id: '39bde8df-b01e-40cb-8c82-9c77fa70edda', title_en: 'Used home prices in Spain hit a record in October',
  en: "Used homes for sale in Spain cost on average 2,955 euros per square metre in October, up 11.2% on a year earlier, according to idealista's own data. That is the highest price since the company began keeping records.",
  is_proposal: false, score: 5,
};
const good = {
  hook: 'Second-hand homes in Spain have never been this expensive.',
  facts: [
    { big: '2,955 euros', text: "That is the average price per square metre of a used home for sale in October, according to idealista's own data." },
    { big: '11.2%', text: 'Prices are up 11.2% on a year earlier, the highest since idealista began keeping records.' },
  ],
  fact_id: 'valor_ref', meaning: 'If you own a home in Spain, it is probably worth more than you think.',
  caption: 'Second-hand homes in Spain have never been this expensive.\n\nMore lines.', hashtags: ['#SpainProperty', '#Spain', 'not a tag'],
};
let c = R.checkScript(structuredClone(good), story);
ok('a good script passes', c.ok, c.error);
ok('hashtags without # are dropped', c.ok && c.script.hashtags.length === 2);
c = R.checkScript({ ...structuredClone(good), facts: [{ big: '3,100 euros', text: 'x y' }, good.facts[1]] }, story);
ok('a figure the story does not have is taken off screen', c.ok && c.script.facts[0].big === '');
ok('a script naming a bank is refused', !R.checkScript({ ...structuredClone(good), meaning: 'Ask Santander about it.' }, story).ok);
ok('a script naming Bueno is refused', !R.checkScript({ ...structuredClone(good), caption: 'Bueno can help.' }, story).ok);
ok('an exclamation mark is refused', !R.checkScript({ ...structuredClone(good), hook: 'Record prices!' }, story).ok);
ok('a proposal must say it is a proposal', !R.checkScript(structuredClone(good), { ...story, is_proposal: true }).ok);
ok('em dashes are cleaned out', R.checkScript({ ...structuredClone(good), meaning: 'Owners gain — buyers pay.' }, story).script.meaning === 'Owners gain, buyers pay.');
const en = { ...R.checkScript(structuredClone(good), story).script, context: 'Ctx.' };
const scenes = R.toScenes(en, 'en');
ok('scenes run hook, two facts, context, meaning, outro', scenes.map(s => s.kind).join() === 'hook,fact,fact,fact,meaning,outro');
ok('the outro is the hand-written line', scenes.at(-1).text === R.OUTRO.en);
const de = { hook: 'H', facts: [{ big: '2.955 Euro', text: 'a' }, { big: '11,2 %', text: 'b' }], context: 'K', meaning: 'M', caption: 'C', hashtags: ['#Spanien'] };
ok('a translation with the same figures passes', R.checkTranslation(de, en).ok);
ok('a translation with a changed figure is refused', !R.checkTranslation({ ...de, facts: [{ big: '2.995 Euro', text: 'a' }, de.facts[1]] }, en).ok);
ok('a translation missing the context is refused', !R.checkTranslation({ ...de, context: '' }, en).ok);

// --- 3. the whole day, end to end, everything mocked ---------------------------------------
const table = [];
const sent = [];
const realFetch = globalThis.fetch;
const json = (b, status = 200) => new Response(JSON.stringify(b), { status, headers: { 'content-type': 'application/json' } });
globalThis.fetch = async (url, init = {}) => {
  url = String(url);
  const method = init.method || 'GET';
  if (url.startsWith('https://api.anthropic.com')) {
    const prompt = JSON.parse(init.body).messages[0].content;
    if (prompt.startsWith('Translate')) {
      const t = (l) => ({ ...de, hook: `${l} hook`, context: 'K' });
      return json({ content: [{ text: JSON.stringify({ no: t('no'), sv: t('sv'), de: t('de'), fr: t('fr'), nl: { ...t('nl'), facts: [{ big: '9 999', text: 'a' }, de.facts[1]] } }) }], stop_reason: 'end_turn' });
    }
    return json({ content: [{ text: JSON.stringify(good) }], stop_reason: 'end_turn' });
  }
  if (url.startsWith('https://api.resend.com')) { sent.push(JSON.parse(init.body)); return json({ id: 'em_1' }); }
  if (url.includes('/rest/v1/news_items')) return json([story, { ...story, id: 'x2', en: 'No numbers here.', score: 5 }]);
  if (url.includes('/rest/v1/reels')) {
    const q = new URL(url);
    const idEq = q.searchParams.get('id')?.replace('eq.', '');
    const dayEq = q.searchParams.get('day')?.replace('eq.', '');
    const st = q.searchParams.get('status')?.replace('eq.', '');
    if (method === 'POST') { const rows = JSON.parse(init.body).map(r => ({ id: crypto.randomUUID(), ...r })); table.push(...rows); return json(rows, 201); }
    if (method === 'PATCH') { const p = JSON.parse(init.body); table.filter(r => r.id === idEq).forEach(r => Object.assign(r, p)); return json([]); }
    return json(table.filter(r => (!idEq || r.id === idEq) && (!dayEq || r.day === dayEq) && (!st || r.status === st)));
  }
  if (url.includes('/storage/v1/bucket/reels')) return json({ id: 'reels' });
  if (url.includes('/storage/v1/object/upload/sign/')) return json({ url: `/object/upload/sign/reels/${url.split('/reels/')[1]}?token=abc` });
  return json({ error: `unmocked ${url}` }, 500);
};

const mkRes = () => { const r = { code: 200, body: null, headersSent: false }; r.status = (c) => { r.code = c; return r; }; r.json = (b) => { r.body = b; r.headersSent = true; return r; }; return r; };
const token = crypto.createHash('sha256').update('service-key:reels-render').digest('hex');
const req = (body = {}, headers = { 'x-reels-token': token }) => ({ headers, query: {}, body });

let res = mkRes(); await R.plan(req(), res);
ok('plan writes today\'s English script', res.code === 200 && table.length === 1 && table[0].status === 'planned', JSON.stringify(res.body));
ok('plan picks the story with figures', table[0].story_ids[0] === story.id);
ok('the chosen background fact is used word for word', table[0].scripts.en.scenes.some(s => s.text.startsWith('Since 2022 the Catastro reference value')));
res = mkRes(); await R.plan(req(), res);
ok('a second plan the same day does nothing', table.length === 1 && /already exists/.test(res.body.skipped));
res = mkRes(); await R.plan(req({}, { 'x-reels-token': 'f'.repeat(64) }), res);
ok('a wrong token is refused', res.code === 401);
res = mkRes(); await R.translate(req(), res);
ok('translate adds the languages that pass', res.code === 200 && ['en', 'no', 'sv', 'de', 'fr'].every(l => table[0].scripts[l]) && table[0].status === 'scripted', JSON.stringify(res.body));
ok('a language with a wrong figure is held back with a reason', !table[0].scripts.nl && /figure/.test(table[0].errors.nl));
ok('translated scenes end with that language\'s outro', table[0].scripts.de.scenes.at(-1).text === R.OUTRO.de);
res = mkRes(); await R.jobs(req(), res);
ok('jobs hands the render Action the scenes', res.body.jobs.length === 1 && res.body.jobs[0].scripts.sv.scenes.length === 6);
res = mkRes(); await R.uploadUrl(req({ id: table[0].id, lang: 'de', kind: 'mp4' }), res);
ok('upload-url gives a signed URL and the public URL', /^https:\/\/sb\.test\/storage\/v1\/object\/upload\/sign\/reels\/.+-de-.+\.mp4\?token=abc$/.test(res.body.upload_url) && /object\/public\/reels\/.+\.mp4$/.test(res.body.public_url), JSON.stringify(res.body));
res = mkRes(); await R.uploadUrl(req({ id: table[0].id, lang: 'xx', kind: 'mp4' }), res);
ok('upload-url refuses an unknown language', res.code === 400);
const videos = Object.fromEntries(['en', 'no', 'sv', 'de', 'fr'].map(l => [l, { mp4: `https://sb.test/v/${l}.mp4`, jpg: `https://sb.test/v/${l}.jpg` }]));
res = mkRes(); await R.done(req({ id: table[0].id, videos, meta: { en: { voiced: true, seconds: 38 } }, errors: {} }), res);
ok('done sends the email and marks the reel sent', res.body.ok && table[0].status === 'sent' && sent.length === 1, JSON.stringify(res.body));
const mail = sent[0];
ok('the email goes to Pratik only while testing', mail.to.join() === 'pratik.y.renuse@gmail.com' && !mail.bcc);
ok('every video is attached', mail.attachments.length === 5 && mail.attachments.every(a => /^spain247-\d{4}-\d\d-\d\d-[a-z]{2}\.mp4$/.test(a.filename) && a.path.startsWith('https://')));
ok('the subject has no euro sign', !/€/.test(mail.subject));
ok('the email carries the captions, not a link to a page', mail.html.includes('Second-hand homes in Spain') && !/internal-reels/.test(mail.html));
ok('the email says which language is missing', /No video today for Dutch/.test(mail.html));
ok('the email has no em dashes and does not name the publisher', !/[—–]/.test(mail.html) && !/poornima/i.test(mail.html));
ok('each language carries its WhatsApp channel link', mail.html.includes('0029VbEJaT8JkK79IG7nVZ1Y'));

globalThis.fetch = realFetch;
console.log(failed ? `\n${failed} failed` : '\nall reels tests passed');
process.exit(failed ? 1 : 0);
