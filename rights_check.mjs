// Walks the new section in a real browser: every situation, to a result, checking that
// each one shows a sourced period and never claims the reader is covered.
import http from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const DIST = './dist';
const MIME = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.xml':'application/xml','.txt':'text/plain'};
const srv = http.createServer((req,res)=>{
  const u = new URL(req.url,'http://x');
  let f = path.join(DIST, u.pathname);
  if (existsSync(f) && statSync(f).isDirectory()) f = path.join(f,'index.html');
  if (!existsSync(f)) f = path.join(DIST, u.pathname, 'index.html');
  if (!existsSync(f)) f = path.join(DIST,'index.html');
  res.writeHead(200,{'content-type':MIME[path.extname(f)]||'text/plain'});
  res.end(readFileSync(f));
});
await new Promise(r=>srv.listen(4611,r));

let pass=0, fail=0;
const ok=(n,c,x='')=>c?pass++:(fail++,console.log('FAIL',n,x));

const { SITUATIONS } = await import('./your-rights/situations.js');
const COPY = (await import('./your-rights/copy.js')).default;
const LOCALES = ['en', 'no', 'sv', 'de', 'fr', 'nl'];
// The section carries no reader-facing English of its own, so the harness reads its
// expectations from the same copy the page does. A label that drifts fails the click
// rather than passing quietly against a hardcoded string.
const L = (loc, key) => COPY[loc].sit[key];
const browser = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport:{width:1100,height:1500} });
const badReq = [];
page.on('requestfailed', r => { if (r.url().includes('127.0.0.1')) badReq.push(r.url()); });
const consoleErrors = [];
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });

await page.goto('http://127.0.0.1:4611/your-rights', { waitUntil:'networkidle' });

// The static block a search engine and a no-JS reader see must match the rendered page.
const staticHtml = readFileSync('./dist/your-rights/index.html','utf8');
const staticH1 = (staticHtml.match(/<h1[^>]*>(.*?)<\/h1>/s)||[])[1] || '';
const renderedH1 = await page.locator('h1').first().innerText();
ok('the page prerenders an h1', staticH1.trim().length > 0, staticH1);
ok('rendered h1 matches the prerendered one',
   staticH1.replace(/<[^>]+>/g,'').trim() === renderedH1.trim(), `${staticH1} :: ${renderedH1}`);

// The fourth menu item, on this page and on the other three.
for (const [url, label] of [['/your-rights','Your rights'], ['/spain-professionals','Your rights'], ['/spain-directory','Your rights']]) {
  await page.goto(`http://127.0.0.1:4611${url}`, { waitUntil:'networkidle' });
  const n = await page.locator('.site-nav-link, .yr .site-nav-link').filter({ hasText: label }).count();
  ok(`${url}: the fourth menu item is present`, n >= 1, String(n));
}
await page.goto('http://127.0.0.1:4611/no/your-rights', { waitUntil:'networkidle' });
ok('the menu item is translated on a locale page',
   (await page.getByText('Rettighetene dine').count()) >= 1);

await page.goto('http://127.0.0.1:4611/your-rights', { waitUntil:'networkidle' });
// All four destinations must be legible against the dark header, not just the current one.
const navColours = await page.$$eval('.yr-head .site-nav-link', els =>
  els.map(e => ({ text: e.textContent.trim(), colour: getComputedStyle(e).color })));
ok('the header carries all four destinations', navColours.length === 4, JSON.stringify(navColours.map(n=>n.text)));
const tooDark = navColours.filter(n => {
  const [r,g,b] = (n.colour.match(/\d+/g) || []).map(Number);
  return (r + g + b) < 200;   // near enough to the navy background to be unreadable
});
ok('none of them is invisible against the navy', tooDark.length === 0, JSON.stringify(tooDark));

ok('nothing is shown before a choice is made',
   (await page.locator('.yr-result').count()) === 0);
ok('every situation is offered',
   (await page.locator('.yr-choice').count()) === SITUATIONS.length,
   String(await page.locator('.yr-choice').count()));

const BANNED = /\b(Bueno|Sabadell|BBVA|CaixaBank|Santander|Unicaja|Iberdrola|Naturgy|Endesa|Revolut|Wise)\b/i;

for (const s of SITUATIONS) {
  await page.locator('.yr-choice').filter({ hasText: L('en', s.key).label }).first().click();
  await page.waitForSelector('.yr-result', { timeout: 5000 });
  const body = await page.locator('.yr-result').innerText();

  ok(`${s.key}: shows a result`, body.length > 300, String(body.length));
  ok(`${s.key}: shows at least one period`,
     (await page.locator('.yr-result .yr-period').count()) >= 1);
  ok(`${s.key}: every period cites its article`,
     (await page.locator('.yr-result .yr-src').count()) >= (await page.locator('.yr-result .yr-period').count()));
  ok(`${s.key}: all four steps render`,
     (await page.locator('.yr-result .yr-step').count()) === 4);
  ok(`${s.key}: says what to gather`,
     (await page.locator('.yr-result .yr-eth li').count()) === L('en', s.key).evidence.length);
  ok(`${s.key}: offers the policy search words`,
     (await page.locator('.yr-result .yr-terms code').count()) >= 10);
  ok(`${s.key}: routes to a professional`,
     (await page.locator('.yr-result a.yr-cta').count()) === 1);

  // It must never tell anyone they are covered, or that they will win.
  ok(`${s.key}: never claims the reader is covered`,
     !/\byou are covered\b|\byou will win\b|\bwe guarantee\b/i.test(body), body.slice(0,120));
  ok(`${s.key}: names no brand`, !BANNED.test(body), (body.match(BANNED)||[])[0] || '');
  ok(`${s.key}: no em or en dash`, !/[—–]/.test(body));

  // The repealed arbitration route must be shown as gone, never as an option.
  ok(`${s.key}: the struck down arbitration article is marked as unavailable`,
     (await page.locator('.yr-result .yr-struck').count()) === 1);

  await page.locator('.yr-choice').filter({ hasText: L('en', s.key).label }).first().click();
  await page.waitForTimeout(120);
  ok(`${s.key}: clicking again closes it`, (await page.locator('.yr-result').count()) === 0);
}

// The harshest clock must actually be surfaced on the situation it belongs to.
await page.locator('.yr-choice').filter({ hasText: L('en', 'hidden_defect').label }).first().click();
await page.waitForSelector('.yr-result');
const hidden = await page.locator('.yr-result').innerText();
ok('the six month hidden defects clock is shown', /6 months/.test(hidden), hidden.slice(0,200));
ok('and it says the clock starts at handover, not discovery',
   /handed over/i.test(hidden));

// Phone check.
await page.setViewportSize({ width: 390, height: 1200 });
await page.waitForTimeout(200);
const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
ok('no sideways scroll on a phone', !overflow);

ok('no failed requests to the app', badReq.length === 0, badReq.join(', '));
// Google Fonts and the analytics script are blocked from this sandbox, not by the app.
const ownErrors = consoleErrors.filter(e => !/ERR_TUNNEL_CONNECTION_FAILED|ERR_NAME_NOT_RESOLVED|fonts\.googleapis|plausible/i.test(e));
ok('no console errors of our own', ownErrors.length === 0, ownErrors.slice(0,2).join(' | '));

// EVERY LANGUAGE, NOT JUST ENGLISH.
// The standing rule for this site is that nothing ships in one language. This walk opens
// each locale, checks the h1 against the prerendered block for that locale, opens a
// situation using that language's own label, and then asserts that not one English string
// from the page chrome survived. A missing translation would fall back to English and read
// as a pass everywhere else; here it fails.
const CHROME = ['lede','notAdvice','q','step1','step2','step3','step4','watchLabel','findPrefix','gatherNote','whoNote','cta'];
await page.setViewportSize({ width: 1100, height: 1500 });
for (const loc of LOCALES.filter(l => l !== 'en')) {
  const url = `http://127.0.0.1:4611/${loc}/your-rights`;
  await page.goto(url, { waitUntil:'networkidle' });

  const staticFile = readFileSync(`./dist/${loc}/your-rights/index.html`,'utf8');
  const sH1 = ((staticFile.match(/<h1[^>]*>(.*?)<\/h1>/s)||[])[1] || '').replace(/<[^>]+>/g,'').trim();
  const rH1 = (await page.locator('h1').first().innerText()).trim();
  ok(`${loc}: rendered h1 matches the prerendered one`, sH1 === rH1, `${sH1} :: ${rH1}`);
  ok(`${loc}: the h1 is this locale's own`, rH1 === COPY[loc].h1, `${rH1} :: ${COPY[loc].h1}`);

  ok(`${loc}: every situation is offered`,
     (await page.locator('.yr-choice').count()) === SITUATIONS.length);

  for (const s of SITUATIONS) {
    const n = await page.locator('.yr-choice').filter({ hasText: L(loc, s.key).label }).count();
    ok(`${loc}/${s.key}: the choice carries this locale's label`, n >= 1, L(loc, s.key).label);
  }

  const s0 = SITUATIONS[1];   // the community decision: three rules, a caveat and a chapter
  await page.locator('.yr-choice').filter({ hasText: L(loc, s0.key).label }).first().click();
  await page.waitForSelector('.yr-result', { timeout: 5000 });
  const body = await page.locator('.yr-result').innerText();

  ok(`${loc}/${s0.key}: shows a result`, body.length > 300, String(body.length));
  ok(`${loc}/${s0.key}: shows a sourced period`,
     (await page.locator('.yr-result .yr-period').count()) >= 1
     && (await page.locator('.yr-result .yr-src').count()) >= 1);
  ok(`${loc}/${s0.key}: says what to gather in this language`,
     (await page.locator('.yr-result .yr-eth li').count()) === L(loc, s0.key).evidence.length);
  ok(`${loc}/${s0.key}: the watch line is translated`, body.includes(L(loc, s0.key).watch.slice(0, 40)));
  ok(`${loc}/${s0.key}: the repealed article is still marked as gone`,
     (await page.locator('.yr-result .yr-struck').count()) === 1);
  ok(`${loc}/${s0.key}: no em or en dash`, !/[\u2014\u2013]/.test(body));
  ok(`${loc}/${s0.key}: names no brand`, !BANNED.test(body), (body.match(BANNED)||[])[0] || '');

  // The Spanish search phrases are meant to stay Spanish. They are what the owner types
  // into a document written in Spanish, so finding them here is correct, not a leak.
  ok(`${loc}: the policy search words are still Spanish`,
     (await page.locator('.yr-result .yr-terms code').count()) >= 10);

  const full = await page.locator('.yr-main').innerText();
  const leaked = CHROME.filter(k => full.includes(COPY.en[k]) && COPY.en[k] !== COPY[loc][k]);
  ok(`${loc}: no English chrome survived`, leaked.length === 0, leaked.join(', '));

  const overflowed = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  ok(`${loc}: no sideways scroll`, !overflowed);
}

await page.setViewportSize({ width: 1100, height: 1500 });
await page.goto('http://127.0.0.1:4611/your-rights', { waitUntil:'networkidle' });
await page.locator('.yr-choice').filter({ hasText: L('en', 'community_decision').label }).first().click();
await page.waitForSelector('.yr-result');
await page.screenshot({ path:'/mnt/user-data/outputs/your_rights.png', fullPage:false });

await browser.close(); srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
