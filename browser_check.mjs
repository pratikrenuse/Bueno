#!/usr/bin/env node
// Browser pass over the built site. Run it after npm run build:
//
//   node serve_dist.mjs &        serves dist on http://localhost:4180
//   node browser_check.mjs
//   node browser_check.mjs https://www.247spain.es    against production
//
// WHY THIS EXISTS
// check_seo.mjs reads the files. It cannot tell you whether the page a person sees says
// the same thing the file says. That gap matters more than usual here, because the static
// block written by seo/prerender.mjs is a no JavaScript fallback that React paints over.
// If the two ever say different things the fallback stops being a fallback and becomes
// cloaking, which is a real penalty and an easy one to earn by accident.
//
// So the assertions that matter are the boring ones: the rendered h1 is the static h1, the
// title the app sets is the title the file already carried, and the links are real links.
//
// Playwright needs a browser. If it is not installed: npx playwright install chromium

import { chromium } from 'playwright';
import { existsSync, readdirSync } from 'node:fs';
// Pure module, no React, so the gate can check the page against the same data the build
// used rather than against a number typed into this file.
import { provinceData } from './seo/hubs.js';

const B = (process.argv[2] || 'http://localhost:4180').replace(/\/+$/, '');

// Use whatever chromium is already on the machine before downloading one.
function launchOptions() {
  const dir = '/opt/pw-browsers';
  if (!existsSync(dir)) return {};
  const hit = readdirSync(dir).find(n => /^chromium-\d+$/.test(n));
  const exe = hit && `${dir}/${hit}/chrome-linux/chrome`;
  const opts = {
  args: [
    // Chromium phones home at startup (component updates, sign-in, safe browsing). Egress
    // here refuses those, so every launch waited on connections that were never going to
    // open. Nothing below changes how the page renders.
    '--disable-background-networking', '--disable-component-update', '--disable-sync',
    '--no-first-run', '--no-default-browser-check', '--disable-default-apps',
    '--disable-client-side-phishing-detection', '--metrics-recording-only',
  ],
  };
  return exe && existsSync(exe) ? { ...opts, executablePath: exe } : opts;
}

let pass = 0, fail = 0;
const ok = (n, c, extra = '') => c ? (pass++, console.log(`  ok   ${n}`)) : (fail++, console.log(`  FAIL ${n} ${extra}`));

const browser = await chromium.launch(launchOptions());


const HOST = new URL(B).host;
// Fonts, analytics and anything else off-host is aborted rather than waited on. The gate is
// about this site's own HTML and JavaScript, and a blocked third party turns every
// navigation into a timeout.
const offline = (page) => page.route('**/*', r => {
  try { return new URL(r.request().url()).host === HOST ? r.continue() : r.abort(); }
  catch { return r.abort(); }
});

async function visit(path, { width = 1280, height = 900 } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  await offline(page);
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  const res = await page.goto(B + path, { waitUntil: 'networkidle' });
  // The static block's h1 before hydration, taken from the raw HTML.
  const raw = await (await fetch(B + path)).text();
  const staticH1 = (raw.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [,''])[1].replace(/<[^>]+>/g,'').trim()
    .replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"');
  const staticTitle = (raw.match(/<title>([\s\S]*?)<\/title>/) || [,''])[1].trim()
    .replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"');
  return { page, ctx, errors, status: res.status(), staticH1, staticTitle };
}

// --- the three hub views -------------------------------------------------------
for (const path of ['/areas', '/areas/alicante', '/coast/costa-blanca', '/areas/baleares', '/no/areas', '/no/areas/alicante', '/de/coast/costa-del-sol']) {
  const v = await visit(path);
  const h1s = await v.page.locator('h1').allInnerTexts();
  const links = await v.page.locator('main a[href]').count();
  const title = await v.page.title();
  ok(`${path} 200 and one h1`, v.status === 200 && h1s.length === 1, `status ${v.status}, h1s ${JSON.stringify(h1s)}`);
  ok(`${path} rendered h1 equals the static block h1`, h1s[0]?.trim() === v.staticH1, `\n        rendered ${JSON.stringify(h1s[0])}\n        static   ${JSON.stringify(v.staticH1)}`);
  ok(`${path} client title equals the prerendered title`, title === v.staticTitle, `\n        client ${JSON.stringify(title)}\n        file   ${JSON.stringify(v.staticTitle)}`);
  ok(`${path} has real links out (${links})`, links >= 10, `only ${links}`);
  ok(`${path} no console errors`, v.errors.filter(e => !/503|Failed to load resource/.test(e)).length === 0, JSON.stringify(v.errors.slice(0,2)));
  await v.ctx.close();
}

// --- the province page links to town pages that exist --------------------------
{
  const v = await visit('/areas/alicante');
  const hrefs = await v.page.locator('.areas-town-links a').evaluateAll(as => as.map(a => a.getAttribute('href')));
  ok('province page links town pages', hrefs.length >= 40, `${hrefs.length} links`);
  let bad = [];
  for (const h of hrefs.slice(0, 12)) {
    const r = await fetch(B + h, { redirect: 'manual' });
    const t = await r.text();
    if (!/<h1/.test(t) || /<div id="root">\s*<\/div>/.test(t)) bad.push(h);
  }
  ok('those town pages have a prerendered h1', bad.length === 0, JSON.stringify(bad));
  // Every town in the province is on the page, and every one of them is a real link.
  // Towns with no page of their own would be named in .areas-mentions instead, which must
  // never contain a link, because a link there is a URL with no file behind it.
  const expected = provinceData('alicante', 'en');
  const rows = await v.page.locator('.areas-town').count();
  ok('the province page lists every town that has a page', rows === expected.towns.length,
    `${rows} rows on the page, ${expected.towns.length} towns with pages`);
  const mentionsEl = v.page.locator('.areas-mentions');
  const hasMentions = await mentionsEl.count();
  ok('nothing is named as uncovered while it has a page', hasMentions === (expected.mentions.length ? 1 : 0),
    `${hasMentions} mention blocks, ${expected.mentions.length} towns without a page`);
  if (hasMentions) {
    const links = await mentionsEl.locator('a').count();
    ok('a named town is never linked', links === 0, `${links} links inside the mentions block`);
  }
  await v.ctx.close();
}

// --- an unknown slug shows the index rather than inventing a place ---------------
{
  const v = await visit('/areas/not-a-province');
  const h1 = (await v.page.locator('h1').allInnerTexts())[0];
  ok('unknown province falls back to the index', /Every province and coast/i.test(h1 || ''), JSON.stringify(h1));
  await v.ctx.close();
}

// --- the directory path URLs, and the old query string --------------------------
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
    await offline(page);
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.goto(B + '/spain-directory/javea/plumber', { waitUntil: 'networkidle' });
  ok('/spain-directory/javea/plumber renders without throwing', errs.length === 0, JSON.stringify(errs.slice(0,2)));
  const townSel = await page.locator('select').count();
  ok('the trades page mounted', townSel > 0 || (await page.locator('h1').count()) > 0);
  await page.goto(B + '/spain-directory?town=javea&trade=plumber', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  const url = page.url();
  ok('an old query string link rewrites itself to the path form', /\/spain-directory\/javea\/plumber$/.test(url), url);
  await ctx.close();
}

// --- the rendered directory pages carry the links the file promised ---------------
// This is the one that matters most. Google renders the page, and the rendered page is
// what it crawls links from. Before PageLinks existed the rendered directory pages had no
// links out at all, so every town page was an orphan to the renderer no matter how many
// links the prerendered file contained.
for (const path of ['/spain-directory', '/spain-professionals', '/spain-directory/javea', '/spain-directory/javea/plumber', '/spain-professionals/marbella/lawyer', '/no/spain-directory']) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
    await offline(page);
  const thrown = [];
  page.on('pageerror', e => thrown.push(e.message));
  await page.goto(B + path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  ok(`${path} throws nothing`, thrown.length === 0, JSON.stringify(thrown.slice(0, 2)));

  // The links in the file, before React touched anything.
  const raw = await (await fetch(B + path)).text();
  const block = (raw.match(/<div class="seo-static">([\s\S]*?)<\/div>/) || [, ''])[1];
  const fileHrefs = [...block.matchAll(/href="([^"]+)"/g)].map(m => m[1]).filter(h => h.startsWith('/'));

  // The links on the page, after it did.
  const liveHrefs = await page.locator('.pagelinks a').evaluateAll(as => as.map(a => a.getAttribute('href')));

  ok(`${path} renders a link block after hydration`, liveHrefs.length > 0, `${liveHrefs.length} links`);

  // The file's town and category links must all survive into the rendered page. The
  // breadcrumb and a couple of hub links live elsewhere in the layout, so the test is
  // containment of the deep links, not set equality.
  const deep = fileHrefs.filter(h => /^\/(spain-directory|spain-professionals|areas|coast)\//.test(h));
  const missing = deep.filter(h => !liveHrefs.includes(h));
  ok(`${path} keeps every deep link the file promised`, missing.length === 0, `missing ${JSON.stringify(missing.slice(0, 4))}`);

  const errs = [];
  for (const h of liveHrefs.slice(0, 8)) {
    const r = await fetch(B + h);
    const t = await r.text();
    if (!/<link rel="canonical"/.test(t)) errs.push(h);
  }
  ok(`${path} link targets are prerendered pages`, errs.length === 0, JSON.stringify(errs));
  await ctx.close();
}

// --- the hub pages are not a clone of either directory surface -------------------
{
  const bg = async (p) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await offline(page);
    await page.goto(B + p, { waitUntil: 'networkidle' });
    const c = await page.locator('main').first().evaluate(el => getComputedStyle(el).backgroundColor);
    await ctx.close();
    return c;
  };
  const [areas, trades, pros] = await Promise.all([bg('/areas'), bg('/spain-directory'), bg('/spain-professionals')]);
  ok('areas does not share the trades surface colour', areas !== trades, `${areas} vs ${trades}`);
  console.log(`       areas ${areas} | trades ${trades} | pros ${pros}`);
}

// --- mobile: nothing overflows sideways, tap targets are reachable ---------------
{
  const v = await visit('/areas/alicante', { width: 390, height: 780 });
  const overflow = await v.page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok('no horizontal overflow on a 390px viewport', overflow <= 1, `${overflow}px`);
  const small = await v.page.locator('.areas-town-links a, .areas-door, .areas-siblings a').evaluateAll(
    as => as.filter(a => a.getBoundingClientRect().height < 40).map(a => a.textContent.trim() + ':' + Math.round(a.getBoundingClientRect().height))
  );
  ok('every hub link is at least 40px tall', small.length === 0, JSON.stringify(small.slice(0,5)));
  await v.ctx.close();
}

// --- every page in the app still mounts -------------------------------------------
// A component that is used but not imported does not fail vite build. It fails in the
// browser, on that one page, as a blank screen. That has happened here, so every route
// gets loaded and every uncaught error is a failure.
{
  const slugs = readdirSync('.', { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.') && d.name !== 'node_modules' && d.name !== 'dist')
    .filter(d => existsSync(`${d.name}/index.jsx`))
    .map(d => d.name);
  const paths = ['/', '/no', '/de', '/areas', ...slugs.map(s => `/${s}`)];
  const broken = [];
  for (const p of paths) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await offline(page);
    const thrown = [];
    page.on('pageerror', e => thrown.push(`${p}: ${e.message}`));
    await page.goto(B + p, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(350);
    const mounted = await page.evaluate(() => document.getElementById('root')?.children.length > 0);
    if (thrown.length) broken.push(...thrown);
    else if (!mounted) broken.push(`${p}: #root is empty after hydration`);
    await ctx.close();
  }
  ok(`all ${paths.length} app routes mount without throwing`, broken.length === 0, '\n        ' + broken.slice(0, 5).join('\n        '));
}

// --- every tool walked to its result screen ---------------------------------------
//
// Mounting is not working. A calculator that renders its intro screen and then throws on
// step three is broken in the only way that matters, and nothing above would notice. So
// this drives each tool the way a person does: take the first real choice on every screen,
// fill any number or date field with something valid, and keep going until a result
// appears or the steps run out.
//
// What it asserts at every step is deliberately blunt. Nothing thrown, and none of the four
// strings that mean a calculation went wrong on the way to the screen: NaN, undefined,
// Invalid Date, and a raw translation key that never resolved.
{
  const TOOLS = ['closing-up','contractor-check','cost-audit','day-counter','late-surcharge',
    'maintenance-schedule','mortgage-claim','pest-plan','rental-tax','rental-vat','sale-tax',
    'storm-claim','tax-calculator','utility-setup'];

  // The ten newer tools end on ToolShell's <Result> (.tk-result). The four older
  // calculators predate it and render their own .results-screen, and mortgage-claim also
  // has a legitimate "not eligible" ending. All of them count as having got there.
  const RESULT_SEL = '.tk-result, .results-screen, .status-badge';

  // Two of the older calculators put their result behind an email capture step. The walk
  // stops there rather than typing an address in: a harness that submits a form is a
  // harness that can put a fake lead in a real list the day somebody points it at
  // production. Reaching the gate proves every calculating step before it worked, which is
  // what this check is for.
  const GATE_SEL = 'input[type=email]:visible';

  const BAD = [
    { re: /\bNaN\b/, why: 'NaN reached the screen' },
    { re: /\bundefined\b/, why: 'undefined reached the screen' },
    { re: /Invalid Date/, why: 'an unparsed date reached the screen' },
    { re: /\[object [A-Z]/, why: 'an object was printed instead of a value' },
    { re: /\b(?:calc_[a-z_]+|cards|nav|home)\.[a-z_0-9]+\b/, why: 'a raw translation key was shown instead of words' },
  ];

  for (const tool of TOOLS) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
    const page = await ctx.newPage();
    await offline(page);
    const thrown = [];
    page.on('pageerror', e => thrown.push(e.message));
    await page.goto(`${B}/${tool}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);

    const seen = [];
    let reachedResult = false;
    let gated = false;

    for (let step = 0; step < 26; step++) {
      // Fill anything that wants a value before looking for something to click.
      for (const sel of ['input[type=number]', 'input[type=date]', 'input[type=text]']) {
        const fields = await page.locator(`${sel}:visible`).all();
        for (const f of fields) {
          const val = await f.inputValue().catch(() => '');
          if (val) continue;
          const type = await f.getAttribute('type');
          if (type === 'number') await f.fill('12000').catch(() => {});
          else if (type === 'date') {
            const min = await f.getAttribute('min');
            await f.fill(min && /^\d{4}-/.test(min) ? min : '2026-03-01').catch(() => {});
          } else await f.fill('100000').catch(() => {});
        }
      }
      for (const sel of ['select:visible']) {
        for (const s2 of await page.locator(sel).all()) {
          const opts = await s2.locator('option').all();
          if (opts.length > 1) await s2.selectOption({ index: 1 }).catch(() => {});
        }
      }

      const text = await page.locator('body').innerText().catch(() => '');
      seen.push(text);
      if (await page.locator(GATE_SEL).count()) { gated = true; break; }
      // Structural, not textual. Every tool's result screen is ToolShell's <Result>, which
      // renders .tk-result. Matching on the restart button's words instead was wrong: the
      // label is per tool ("Change my answers", "Start again"), so the first version
      // reported nine healthy tools as never reaching a result.
      if (await page.locator(RESULT_SEL).count()) reachedResult = true;

      // How a screen advances. Two families of markup live in this app and the harness has
      // to drive both, which took three goes to get right:
      //   - the ten ToolShell tools: .option-card for a choice, .btn-primary to continue
      //   - the four older calculators: .option-card, .choice-btn or .country-btn for a
      //     choice, .btn-primary or .btn-primary-outline to continue
      // Everything is scoped away from the header, nav and footer. The first version
      // clicked whatever button came first, which on the older calculators was the site
      // nav, so the walk left the tool on its very first click and then bounced between
      // pages for fifteen steps while reporting the tool healthy.
      const inTool = ':not(.site-nav *):not(.s247f *):not(header *)';
      const CHOICE = ['.option-card', '.choice-btn', '.country-btn'].map(c => `${c}:visible${inTool}`).join(', ');
      const GO = ['.btn-primary', '.btn-primary-outline'].map(c => `button${c}:visible${inTool}`).join(', ');

      let clicked = false;

      const choices = page.locator(CHOICE);
      if (await choices.count()) {
        const chosen = page.locator(CHOICE).locator('.selected');
        const anySelected = await page.locator(`${CHOICE}`).evaluateAll(
          els => els.some(e => e.classList.contains('selected'))
        ).catch(() => false);
        if (!anySelected) {
          await choices.first().click({ timeout: 2000 }).catch(() => {});
          clicked = true;
          await page.waitForTimeout(260);
        }
      }

      const go = page.locator(GO).filter({ hasNotText: /^(back|start again|restart)$/i });
      const gCount = await go.count();
      for (let i = 0; i < gCount; i++) {
        const b2 = go.nth(i);
        if (!(await b2.isEnabled().catch(() => false))) continue;
        await b2.click({ timeout: 2000 }).catch(() => {});
        clicked = true;
        break;
      }

      await page.waitForTimeout(320);
      const after = await page.locator('body').innerText().catch(() => '');
      if (!clicked) break;
      if (after === text && step > 1) break;   // the screen stopped moving
    }

    // Capture again AFTER the loop. The text inside the loop is read before that
    // iteration's click, so without this the result screen, which is the one screen most
    // worth checking, is never looked at. The first version of this harness had exactly
    // that hole and passed a tool with a deliberate NaN on its result.
    await page.waitForTimeout(400);
    const endText = await page.locator('body').innerText().catch(() => '');
    seen.push(endText);
    if (await page.locator(RESULT_SEL).count()) reachedResult = true;

    // Every screen the walk saw, not only the last one, because a bad value on step three
    // is just as broken as a bad value on the result.
    const finalText = seen.join('\n');
    const problems = BAD.filter(b => b.re.test(finalText)).map(b => `${b.why}: ${(finalText.match(b.re) || [])[0]}`);

    ok(`${tool} walks without throwing`, thrown.length === 0, JSON.stringify(thrown.slice(0, 2)));
    ok(`${tool} prints nothing broken`, problems.length === 0, JSON.stringify(problems.slice(0, 3)));
    ok(`${tool} gets past its intro screen`, seen.length > 2, `only ${seen.length} screens`);
    ok(`${tool} reaches a result or a lead gate`, reachedResult || gated,
      `walked ${seen.length} screens and reached neither`);
    if (gated) console.log(`       (${tool} stops at its email step, which the walk does not submit)`);
    await ctx.close();
  }
}

await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
