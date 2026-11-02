// Tests for the newsletter digest (api/news.js and api/_news_*.js), and for the bridge that
// puts approved stories into the WhatsApp channel section of the Facebook daily email.
// Every network call is mocked: nothing here reaches Supabase, Resend or Claude.
import { readFileSync, readdirSync } from 'node:fs';
import { emailText, htmlToText, decodeDataUri, isAllowedSender, sourceOf, tidy } from './api/_news_parse.js';
import { normaliseStories, clean, sortPrompt, BANNED } from './api/_news_sort.js';
import { itemRow } from './api/_news_process.js';
import { resolveAction, ACTIONS } from './api/news.js';
import { channelFromNews, CHANNEL_LANGS, channelPostFor } from './api/_fb_whatsapp.js';
import { whatsappSection } from './api/_fb_email.js';

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => cond ? pass++ : (fail++, console.log('FAIL', name, extra));

// --- 1. Parsing the real 29 October idealista email ------------------------------------
const sample = readFileSync('./studio/news/idealista_2026-10-29.txt', 'utf8');
const t = emailText({ text: sample });
ok('the invisible preheader padding is gone', !/[͏‌­]/.test(t));
ok('no run of spaces is left from the padding', !/ {3,}/.test(t));
ok('the footer is cut', !/Para dejar de recibir/.test(t) && !/©\s*2000/.test(t));
ok('the stories are all still there', /39%/.test(t) && /34\.599/.test(t) && /Colau/.test(t) && /okupación/.test(t) && /Tribunal Supremo/.test(t));
ok('the text is shorter than the raw email', t.length < sample.length, `${t.length} of ${sample.length}`);

// HTML with links, entities and a data: URI, the way Resend can hand it back.
const html = '<html><head><style>.x{}</style></head><body><p>Las compraventas caen un 9,8&nbsp;%</p>'
  + '<a href="https://www.idealista.com/news/a1">Leer m&aacute;s</a><p>Otra noticia&#8230;</p>'
  + '<a href="https://www.idealista.com/x">Una casa</a><p>&copy; 2000-2026 idealista</p></body></html>';
const asText = htmlToText(html);
ok('html: a "Leer más" link is kept with its story', asText.includes('[link: https://www.idealista.com/news/a1]'), asText);
ok('html: other links keep only their text', asText.includes('Una casa') && !asText.includes('/x]'));
ok('html: entities are decoded', asText.includes('9,8 %') && asText.includes('Otra noticia…'));
ok('html: no style or tag is left', !/[<>]|\.x\{/.test(asText));
const uri = `data:text/html;base64,${Buffer.from(html).toString('base64')}`;
ok('a data: URI is decoded', decodeDataUri(uri) === html);
ok('emailText handles html_format data_uri', emailText({ html: uri, html_format: 'data_uri' }).includes('9,8 %'));
ok('emailText falls back to text when there is no html', emailText({ html: null, text: 'Hola &amp; adiós' }) === 'Hola & adiós');
ok('tidy collapses blank lines', tidy('a\n\n\n\n b') === 'a\n\nb');

// --- 2. Who is allowed in -------------------------------------------------------------
ok('idealista is allowed', isAllowedSender('idealista/news <news@diario.idealista.com>'));
ok('a stranger is not', !isAllowedSender('Someone <x@example.com>'));
ok('a look-alike domain is not', !isAllowedSender('x@idealista.com.evil.net') && !isAllowedSender('x@notidealista.com'));
process.env.NEWS_ALLOWED_SENDERS = 'example.org';
ok('NEWS_ALLOWED_SENDERS adds a domain', isAllowedSender('a@news.example.org'));
delete process.env.NEWS_ALLOWED_SENDERS;
ok('the source is named', sourceOf('news@diario.idealista.com') === 'idealista');

// --- 3. Claude's answer is checked in code ---------------------------------------------
const stories = normaliseStories({ stories: [
  { title_es: 'El esfuerzo para alquilar', title_en: 'Renting takes 39% of income', keep: true, score: 5, is_proposal: false,
    reason: 'Market data owners use', post: 'Renting now takes 39% of a typical household’s income — according to idealista.', link: 'https://www.idealista.com/news/a1' },
  { title_es: 'Hipoteca de CaixaBank', title_en: 'A fixed mortgage', keep: true, score: 3, post: 'CaixaBank keeps its fixed rate at 2.85%.' },
  { title_es: 'Harry Kane', keep: false, score: 1, reason: 'Celebrity home', post: '' },
  { title_es: 'Sin texto', keep: true, score: 4, post: '' },
] });
ok('four stories, in order', stories.length === 4 && stories.map(s => s.position).join() === '0,1,2,3');
ok('em dashes are taken out', !/[—–]/.test(stories[0].en || ''), stories[0].en);
ok('a kept story keeps its link', stories[0].link === 'https://www.idealista.com/news/a1');
ok('a post naming a bank is dropped', stories[1].keep === false && /company/.test(stories[1].reason));
ok('a dropped story has no post', stories[2].en === null && stories[2].keep === false);
ok('a "kept" story with no post is not kept', stories[3].keep === false);
ok('scores stay between 1 and 5', normaliseStories({ stories: [{ score: 99, keep: false }] })[0].score === 5);
ok('BANNED catches the companies', BANNED.test('via Revolut') && !BANNED.test('the notaries say'));
ok('clean takes emojis out', clean('Good news \u{1F3E0}') === 'Good news');
const prompt = sortPrompt({ text: 'X', subject: 'Está pasando', source: 'idealista', recentTitles: ['Old story'] });
ok('the prompt tells Claude to flag proposals', /proposal/i.test(prompt) && /not law yet/.test(prompt));
ok('the prompt forbids copying', /Never copy/.test(prompt));
ok('the prompt carries the recent titles', prompt.includes('- Old story'));
ok('the prompt never asks for Bueno', /Never mention Bueno/.test(prompt));

// --- 4. Rows for the bulk insert all have the same keys (PGRST102) ---------------------
const rows = stories.map(s => itemRow(s, { email_id: 'e1', source: 'idealista', received_on: '2026-10-29' }));
ok('every row has the identical key set', new Set(rows.map(r => Object.keys(r).sort().join(','))).size === 1);
ok('kept rows wait for review, dropped rows are skipped', rows[0].status === 'pending' && rows[2].status === 'skipped');

// --- 5. Router --------------------------------------------------------------------------
ok('the router knows its actions', ['inbound', 'items', 'decide', 'ingest', 'reprocess', 'health'].every(a => ACTIONS.includes(a)));
ok('?action=inbound resolves', resolveAction({ url: '/api/news?action=inbound', query: { action: 'inbound' } }) === 'inbound');
ok('/api/news/items resolves', resolveAction({ url: '/api/news/items', query: {} }) === 'items');
ok('an unknown action resolves to null', resolveAction({ url: '/api/news?action=drop', query: { action: 'drop' } }) === null);
const vercel = JSON.parse(readFileSync('./vercel.json', 'utf8'));
const iNews = vercel.rewrites.findIndex(r => r.source === '/api/news/:action');
const iAll = vercel.rewrites.findIndex(r => r.source === '/api/(.*)');
ok('the /api/news/:action rewrite exists and comes before the catch-all', iNews !== -1 && iNews < iAll);

// --- 6. The news surface stays self-contained ------------------------------------------
const code = (p) => readFileSync(p, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const importsOf = (src) => [...src.matchAll(/(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
const NEWS = readdirSync('./api').filter(f => f === 'news.js' || f.startsWith('_news_'));
for (const f of NEWS) {
  const bad = importsOf(code(`./api/${f}`)).filter(s => !(/^\.\/_news_[a-z_]+\.js$/.test(s) || s.startsWith('node:')));
  ok(`api/${f} imports only its own siblings`, bad.length === 0, bad.join(', '));
  ok(`api/${f} names no other surface's table`, !/linkedin_posts|fb_posts|studio_packages|newsletter_issues|team_members/.test(code(`./api/${f}`)));
}
ok('only _news_db.js builds a Supabase URL', NEWS.filter(f => f !== '_news_db.js' && /rest\/v1\//.test(code(`./api/${f}`))).length === 0);
ok('the news surface costs one function slot', NEWS.filter(f => !f.startsWith('_')).length === 1);
const deck = code('./internal-news/index.jsx');
ok('the deck calls only the news API', /\/api\/news/.test(deck) && !/\/api\/(fb|linkedin|newsletter)/.test(deck));
ok('the deck has no meta.js', !readdirSync('./internal-news').includes('meta.js'));
ok('the deck is noindex', /'\/internal-news'/.test(readFileSync('./seo/routes.js', 'utf8')));

// --- 7. The bridge into the WhatsApp channel section -----------------------------------
const full = { en: 'English text.', translations: { no: 'N', sv: 'S', de: 'D', fr: 'F', nl: 'NL' } };
const ch = channelFromNews(full);
ok('a complete story becomes a channel day', ch && CHANNEL_LANGS.every(l => ch[l]));
ok('the edited English wins', channelFromNews({ ...full, edited_en: 'Edited.' }).en === 'Edited.');
ok('a story missing a language is not used', channelFromNews({ en: 'x', translations: { no: 'N' } }) === null);
ok('no story means no channel day', channelFromNews(null) === null);
const handDay = Object.keys((await import('./api/_fb_whatsapp.js')).CHANNEL_POSTS)[0];
ok('a hand-written day wins over a story', !whatsappSection(handDay, { ...ch, en: 'FROM NEWS' }).includes('FROM NEWS') && !!channelPostFor(handDay));
const freeDay = '2031-01-01';
ok('on a free day the story is in the email', whatsappSection(freeDay, ch).includes('English text.') && whatsappSection(freeDay, ch).includes('post in the WhatsApp channels'));
ok('on a free day with no story there is no channel section', !whatsappSection(freeDay, null).includes('post in the WhatsApp channels'));

// --- 8. The webhook, end to end with every service mocked -------------------------------
const realFetch = globalThis.fetch;
const calls = [];
const store = { emails: [], items: [] };
const mailSent = [];
process.env.SUPABASE_URL = 'https://sb.test';
process.env.SUPABASE_SERVICE_KEY = 'svc';
process.env.RESEND_API_KEY = 're_test';
process.env.ANTHROPIC_API_KEY = 'sk-test';
process.env.INTERNAL_PASSCODE = 'pw';
const resendEmail = (from) => ({ id: 'em1', from, subject: 'Está pasando 29/10/2026', created_at: '2026-10-29T08:43:00Z', html: null, text: sample, headers: { from } });
let resendFrom = 'idealista/news <news@diario.idealista.com>';
const claudeAnswer = JSON.stringify({ stories: [
  { title_es: 'El esfuerzo para alquilar', title_en: 'Renting takes 39% of income', keep: true, score: 5, reason: 'Market data', post: 'Renting takes 39% of household income, according to idealista.' },
  { title_es: 'Harry Kane', keep: false, score: 1, reason: 'Celebrity home', post: '' },
] });
globalThis.fetch = async (url, init = {}) => {
  const u = String(url);
  calls.push(`${init.method || 'GET'} ${u}`);
  const reply = (status, body) => ({ ok: status < 300, status, json: async () => body, text: async () => JSON.stringify(body) });
  if (u.startsWith('https://api.resend.com/emails/receiving/')) return reply(200, resendEmail(resendFrom));
  if (u === 'https://api.resend.com/emails') { mailSent.push(JSON.parse(init.body)); return reply(200, { id: 'm1' }); }
  if (u.startsWith('https://api.anthropic.com/')) return reply(200, { content: [{ text: claudeAnswer }] });
  if (u.startsWith('https://sb.test/rest/v1/news_emails')) {
    if (init.method === 'POST') {
      const row = JSON.parse(init.body)[0];
      if (store.emails.some(e => e.email_id === row.email_id)) return reply(201, []);
      store.emails.push(row); return reply(201, [row]);
    }
    if (init.method === 'PATCH') { Object.assign(store.emails[store.emails.length - 1], JSON.parse(init.body)); return reply(200, []); }
    return reply(200, store.emails);
  }
  if (u.startsWith('https://sb.test/rest/v1/news_items')) {
    if (init.method === 'POST') { store.items.push(...JSON.parse(init.body)); return reply(201, []); }
    return reply(200, []);
  }
  return reply(404, { error: `unmocked ${u}` });
};
const mkRes = () => { const r = { code: 200, body: null, headersSent: false }; r.status = (c) => { r.code = c; return r; }; r.json = (b) => { r.body = b; r.headersSent = true; return r; }; return r; };
const { default: router } = await import('./api/news.js');
const hook = (id) => ({ method: 'POST', url: '/api/news?action=inbound', query: { action: 'inbound' }, headers: {}, body: { type: 'email.received', data: { email_id: id, subject: 'x' } } });

let res = mkRes();
await router(hook('em1'), res);
ok('webhook: the email is sorted', res.code === 200 && res.body.ok === true && res.body.stories === 2 && res.body.kept === 1, JSON.stringify(res.body));
ok('webhook: the stories are stored', store.items.length === 2 && store.items[0].status === 'pending' && store.items[1].status === 'skipped');
ok('webhook: the email is marked done', store.emails[0].status === 'done');
ok('webhook: Pratik is told, John copied', mailSent.length === 1 && mailSent[0].to.includes('pratik.y.renuse@gmail.com') && mailSent[0].cc.includes('john@getbueno.com'));
ok('webhook: the subject has no euro sign', !/€/.test(mailSent[0].subject));
const claudeCalls = calls.filter(c => c.includes('anthropic')).length;

res = mkRes();
await router(hook('em1'), res);
ok('webhook: a retry is a harmless duplicate', res.body.duplicate === true && calls.filter(c => c.includes('anthropic')).length === claudeCalls);

resendFrom = 'Someone <spam@example.com>';
res = mkRes();
await router(hook('em2'), res);
ok('webhook: a stranger is stored as ignored and never read by Claude', /allow list/.test(res.body.ignored || '') && store.emails.find(e => e.email_id === 'em2').status === 'ignored' && calls.filter(c => c.includes('anthropic')).length === claudeCalls);

res = mkRes();
await router({ method: 'POST', url: '/api/news?action=inbound', query: { action: 'inbound' }, headers: {}, body: { type: 'email.sent', data: {} } }, res);
ok('webhook: other events are ignored', res.code === 200 && /email\.sent/.test(res.body.ignored));

res = mkRes();
await router({ method: 'GET', url: '/api/news?action=items', query: { action: 'items' }, headers: {} }, res);
ok('the list needs the password', res.code === 401);

globalThis.fetch = realFetch;
console.log(`\nnews.test: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
