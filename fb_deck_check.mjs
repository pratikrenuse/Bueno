// Walks /internal-pratik in a real browser, against a stand-in API serving the rows the
// seed handler actually builds. It proves the page behind the password gate: that all six
// languages load, that the text shown is the text that will be copied, that the image
// picker only ever offers this post's own options, and that the retired /internal route
// still lands somewhere honest.
//
// It also asserts the thing that matters most about this surface: nothing on the page
// mentions, links to, or calls the team's LinkedIn deck.
import http from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { IDEAS, TRANSLATION_LANGS, renderPost, linkFor } from './api/_fb_content.js';
import { imageOptionsFor, imageFor } from './api/_fb_images.js';

const DIST = './dist';
const PORT = 4821;
const MIME = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.xml':'application/xml'};
const firstLine = (t) => (t.split('\n').find(l => l.trim()) || '').trim();

const ROWS = [];
let n = 0;
for (const idea of IDEAS) {
  const text = renderPost(idea, 'en');
  const translations = Object.fromEntries(TRANSLATION_LANGS.map(l => [l, renderPost(idea, l)]));
  ROWS.push({
    id: `row-${++n}`, idea_key: idea.key, language: 'en', tool_slug: idea.tool,
    tool_url: linkFor(idea.tool, 'en'), kind: idea.kind, hook: firstLine(text),
    post_text: text, translations, edited_text: null,
    image_url: imageFor(idea.key), image_options: imageOptionsFor(idea.key),
    rule_ids: idea.rules || [], status: 'pending', note: null, posted_at: null, sent_at: null,
  });
}

const DECISIONS = [];
const srv = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/api/fb') {
    const action = u.searchParams.get('action');
    if (action === 'decide') {
      // Record what the deck asked for, and answer the way the real handler would.
      let body = '';
      req.on('data', c => { body += c; });
      return req.on('end', () => {
        const b = JSON.parse(body || '{}');
        DECISIONS.push(b);
        const row = ROWS.find(r => r.id === b.id) || {};
        const patch = {};
        if (b.action === 'edit') patch.edited_text = String(b.text || '').trim();
        else if (b.action === 'image' || b.action === 'image_custom') patch.image_url = b.image;
        else if (b.action === 'note') patch.note = b.note;
        else if (b.action === 'rejected') { patch.status = 'rejected'; patch.reject_comment = b.comment ?? null; }
        else if (b.action === 'approved') { patch.status = 'approved'; patch.sent_at = '2026-09-11T09:00:00Z'; patch.sent_to = 'himanshu1997bisht@gmail.com, himanshubisht1407@gmail.com'; }
        else if (b.action) patch.status = b.action;
        Object.assign(row, patch);
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ ok: true, post: row, sent: b.action === 'approved' }));
      });
    }
    const status = u.searchParams.get('status') || 'all';
    const rows = status === 'all' ? ROWS : ROWS.filter(r => r.status === status);
    const counts = { pending: 0, approved: 0, rejected: 0, posted: 0, all: ROWS.length };
    for (const r of ROWS) if (counts[r.status] != null) counts[r.status] += 1;
    res.writeHead(200, { 'content-type': 'application/json' });
    return res.end(JSON.stringify({ posts: rows, counts, total: rows.length }));
  }
  let f = path.join(DIST, u.pathname);
  if (existsSync(f) && statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!existsSync(f)) f = path.join(DIST, u.pathname, 'index.html');
  if (!existsSync(f)) f = path.join(DIST, 'index.html');
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'text/plain' });
  res.end(readFileSync(f));
});
await new Promise(r => srv.listen(PORT, r));

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => cond ? pass++ : (fail++, console.log('FAIL', name, extra));

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 1000, height: 1500 } });
const consoleErrors = [];
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });

// The gate.
await page.goto(`http://127.0.0.1:${PORT}/internal-pratik`, { waitUntil: 'networkidle' });
ok('the deck is behind a password', (await page.locator('input[type=password]').count()) === 1);
ok('nothing is shown before the password', (await page.locator('.fbp-card').count()) === 0);

await page.fill('input[type=password]', 'anything');
await page.click('button[type=submit]');
await page.waitForSelector('.fbp-card', { timeout: 8000 });

ok('every idea is offered', (await page.locator('.fbp-card').count()) === IDEAS.length,
   String(await page.locator('.fbp-card').count()));

const texts = await page.locator('.fbp-text').allInnerTexts();
ok('the text shown is the English that will be sent',
   texts.every((t, i) => t.trim() === renderPost(IDEAS[i], 'en').trim()));
ok('every post carries its English link',
   texts.every((t, i) => t.includes(linkFor(IDEAS[i].tool, 'en'))));
ok('no em or en dash anywhere on the page', !/[\u2014\u2013]/.test(await page.locator('.fbp-list').innerText()));

// The dashboard.
ok('the dashboard shows progress', (await page.locator('.fbp-progress').count()) === 1);
ok('and how many are reviewed', /of \d+ reviewed|Everything reviewed/.test(await page.locator('.fbp-dash').innerText()));
ok('and the three outcome counts', /approved and emailed/.test(await page.locator('.fbp-stats').innerText())
   && /live/.test(await page.locator('.fbp-stats').innerText())
   && /parked/.test(await page.locator('.fbp-stats').innerText()));
ok('the status filter carries counts', /To review \(\d+\)/.test(await page.locator('.fbp-bar').innerText()));

// No language switcher anywhere. This is the thing that was explicitly removed.
{
  const bar = await page.locator('.fbp-bar').innerText();
  ok('the deck offers no language chips', !/Norsk|Svenska|Nederlands|Deutsch|Français/.test(bar), bar.slice(0, 120));
}

// The translations are there to look at, not to choose between.
{
  const card = page.locator('.fbp-card').first();
  ok('translations are hidden until asked for', (await page.locator('.fbp-trlist').count()) === 0);
  await card.locator('button', { hasText: 'See the other five languages' }).click();
  await page.waitForSelector('.fbp-trlist');
  ok('all five are there', (await card.locator('.fbp-trlist details').count()) === 5);
  const names = await card.locator('.fbp-trlist summary').allInnerTexts();
  ok('each is named', ['Norwegian', 'Swedish', 'German', 'French', 'Dutch'].every(n => names.includes(n)), names.join(', '));
  await card.locator('.fbp-trlist summary', { hasText: 'German' }).click();
  await page.waitForTimeout(150);
  const german = await card.locator('.fbp-trlist details', { hasText: 'German' }).locator('pre').innerText();
  ok('the German version is the German version', german.trim() === renderPost(IDEAS[0], 'de').trim());
  ok('and links to the German page', german.includes(linkFor(IDEAS[0].tool, 'de')));
  await card.locator('button', { hasText: 'Hide the other five languages' }).click();
  await page.waitForTimeout(150);
  ok('and they fold away again', (await page.locator('.fbp-trlist').count()) === 0);
}

// The image picker offers this post's own options and marks the one in use.
const first = page.locator('.fbp-card').first();
ok('no image grid until it is asked for', (await page.locator('.fbp-grid').count()) === 0);
await first.locator('button', { hasText: 'Change image' }).click();
await page.waitForSelector('.fbp-grid');
const shown = await page.locator('.fbp-grid .fbp-opt img').evaluateAll(els => els.map(e => e.src));
ok('the grid offers exactly this post options', shown.length === 12
   && shown.every(s => imageOptionsFor(IDEAS[0].key).includes(s)), String(shown.length));
ok('the one in use is marked', (await page.locator('.fbp-grid .fbp-inuse').count()) === 1);
await first.locator('button', { hasText: 'Change image' }).click();
await page.waitForTimeout(200);
ok('the grid closes again', (await page.locator('.fbp-grid').count()) === 0);

// Every post says where its facts came from, where it has any.
const withRules = IDEAS.filter(i => (i.rules || []).length).length;
ok('posts cite the rules behind them', (await page.locator('.fbp-rules').count()) === withRules,
   String(await page.locator('.fbp-rules').count()));

// The separation, as seen from the page itself.
const html = await page.content();
ok('the page never mentions the team deck', !/internal-linkedin|linkedin_posts/i.test(html));
ok('the page names no brand', !/\b(Bueno|Sabadell|BBVA|CaixaBank|Revolut|Wise)\b/i.test(await page.locator('.fbp-list').innerText()));

// The review loop: edit, then park, then approve. Approve is the send, so the card has to
// say so afterwards rather than leaving the reviewer guessing.
{
  const card = page.locator('.fbp-card').first();
  await card.locator('button', { hasText: 'Edit' }).first().click();
  await page.waitForSelector('.fbp-edit textarea');
  ok('editing opens with the current text',
     (await page.locator('.fbp-edit textarea').inputValue()).trim() === renderPost(IDEAS[0], 'en').trim());
  await page.locator('.fbp-edit textarea').fill('My own version of this post, long enough to be real.');
  await card.locator('button', { hasText: 'Save edit' }).click();
  await page.waitForTimeout(300);
  const sent = DECISIONS.find(d => d.action === 'edit');
  ok('the edit reaches the API', !!sent && sent.text.startsWith('My own version'));
  ok('the card shows the edit, not the original',
     (await card.locator('.fbp-text').innerText()).startsWith('My own version'));
  ok('and marks the post as edited', (await card.locator('.fbp-tag').count()) === 1);
}
{
  const card = page.locator('.fbp-card').nth(1);
  await card.locator('button', { hasText: 'Park' }).click();
  await page.waitForSelector('.fbp-park input');
  await page.locator('.fbp-park input').fill('reads too much like an ad');
  await card.locator('button', { hasText: 'Park it' }).click();
  await page.waitForTimeout(300);
  const parked = DECISIONS.find(d => d.action === 'rejected');
  ok('parking sends the reason', !!parked && parked.comment === 'reads too much like an ad');
  ok('the reason stays on the card', /reads too much like an ad/.test(await card.innerText()));
}
{
  const card = page.locator('.fbp-card').nth(2);
  await card.locator('input[placeholder^="Group name"]').fill('Brits in Spain');
  await card.locator('.fbp-text').click();
  await page.waitForTimeout(300);
  ok('the group instruction is saved', DECISIONS.some(d => d.action === 'note' && d.note === 'Brits in Spain'));

  await card.locator('button', { hasText: 'Approve and send' }).click();
  await page.waitForTimeout(500);
  ok('approving calls the API once', DECISIONS.filter(d => d.action === 'approved').length === 1);
  ok('the card names both publisher addresses',
     /himanshu1997bisht@gmail\.com/.test(await card.innerText())
     && /himanshubisht1407@gmail\.com/.test(await card.innerText()));
  ok('and offers to send again rather than approve twice',
     (await card.locator('button', { hasText: 'Approve and send' }).count()) === 0
     && (await card.locator('button', { hasText: 'Send again' }).count()) === 1);
}
{
  const card = page.locator('.fbp-card').nth(3);
  await card.locator('button', { hasText: 'Change image' }).click();
  await page.waitForSelector('.fbp-custom input');
  await page.locator('.fbp-custom input').fill('https://cdn.example.com/mine.png');
  await page.locator('.fbp-custom button', { hasText: 'Use it' }).click();
  await page.waitForTimeout(300);
  ok('a pasted image reaches the API',
     DECISIONS.some(d => d.action === 'image_custom' && d.image === 'https://cdn.example.com/mine.png'));
}

// Phone.
await page.setViewportSize({ width: 390, height: 1400 });
await page.waitForTimeout(300);
ok('no sideways scroll on a phone',
   !(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)));
await page.setViewportSize({ width: 1000, height: 1000 });

// The retired route.
await page.goto(`http://127.0.0.1:${PORT}/internal`, { waitUntil: 'networkidle' });
ok('the old Studio route says it is retired', /retired/i.test(await page.locator('h1').innerText()));
ok('and points at the personal deck', (await page.locator('a').first().getAttribute('href')) === '/internal-pratik');
ok('the old deck is gone, not hidden', (await page.locator('.fbp-card, .studio-card').count()) === 0);

// Pexels is blocked from this sandbox, which is a network fact and not a page fault.
const own = consoleErrors.filter(e => !/ERR_TUNNEL|ERR_NAME_NOT_RESOLVED|ERR_CONNECTION|fonts\.googleapis|plausible|pexels/i.test(e));
ok('no console errors of our own', own.length === 0, own.slice(0, 2).join(' | '));

await browser.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
