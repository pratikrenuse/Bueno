import { chromium } from 'playwright';

// Walk each tool by always taking the first unselected choice, then Continue if one is
// enabled, until a result screen appears. Deliberately dumb: this is a smoke test for
// "does every path render something sane", not a functional test. The functional tests
// live next to the arithmetic in count.test.mjs and calc.test.mjs.

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const errs = [];

async function walk(name, path, fills) {
  const p = await b.newPage({ viewport: { width: 1280, height: 1000 } });
  p.on('pageerror', e => errs.push(`${name} PAGEERROR: ${e.message}`));
  p.on('console', m => {
    const t = m.text();
    if (m.type() === 'error' && !/ERR_TUNNEL|font|Failed to load resource/i.test(t)) errs.push(`${name} console: ${t}`);
  });

  await p.goto('http://localhost:4180' + path, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(700);

  for (let i = 0; i < 26; i++) {
    if (await p.locator('.tk-result').count()) break;
    for (const [sel, val] of Object.entries(fills)) {
      const f = p.locator(sel);
      if (await f.count()) {
        const first = f.first();
        if (!(await first.inputValue())) await first.fill(val);
      }
    }
    // Prefer Continue when it is enabled, so a multi-select step is not looped forever
    // by an option that clears the others.
    const cont = p.locator('button.btn-primary:not([disabled])');
    const choice = p.locator('button.tk-option:not(.selected)');
    if (await cont.count()) { await cont.last().click(); await p.waitForTimeout(300); continue; }
    if (await choice.count()) { await choice.first().click(); await p.waitForTimeout(300); continue; }
    break;
  }

  await p.waitForTimeout(600);
  await p.screenshot({ path: `/tmp/shots/r-${name}.png`, fullPage: true });

  const info = await p.evaluate(() => {
    const t = document.body.innerText;
    const hits = [];
    for (const re of [/\bundefined\b/g, /\bNaN\b/g, /\[object Object\]/g, /cards\.\w+/g]) {
      const m = t.match(re);
      if (m) hits.push(...new Set(m));
    }
    // Any source link must actually point somewhere.
    const badLinks = [...document.querySelectorAll('.tk-source-list a')]
      .filter(a => !/^https?:\/\//.test(a.getAttribute('href') || '')).length;
    return { onResult: !!document.querySelector('.tk-result'), hits, badLinks, chars: t.length,
             sources: document.querySelectorAll('.tk-source').length,
             keyPanels: document.querySelectorAll('.tk-panel-key').length,
             disclaimer: !!document.querySelector('.tk-disclaimer') };
  });

  if (!info.onResult) errs.push(`${name}: never reached a result screen`);
  if (info.hits.length) errs.push(`${name} BAD OUTPUT: ${info.hits.join(', ')}`);
  if (info.badLinks) errs.push(`${name}: ${info.badLinks} source link(s) with no URL`);
  if (info.onResult && !info.disclaimer) errs.push(`${name}: result screen has no disclaimer`);
  // Emphasis: one unmissable element per screen. More than one highlighted panel and the
  // squint test fails, because nothing dominates.
  if (info.keyPanels > 1) errs.push(`${name}: ${info.keyPanels} highlighted panels on one result screen, only one may dominate`);
  console.log(`  ${name.padEnd(20)} result=${String(info.onResult).padEnd(5)} sources=${info.sources} key=${info.keyPanels} chars=${info.chars}`);
  await p.close();
}

const NUM = { 'input[type=number]': '250000' };
const DATE = { 'input[type=date]': '2026-06-15' };

for (const [n, path, f] of [
  ['closing-up', '/closing-up', {}],
  ['storm-claim', '/storm-claim', DATE],
  ['maintenance', '/maintenance-schedule', {}],
  ['pest-plan', '/pest-plan', {}],
  ['utility-setup', '/utility-setup', {}],
  ['contractor-check', '/contractor-check', {}],
  ['day-counter', '/day-counter', DATE],
  ['sale-tax', '/sale-tax', { ...NUM, ...DATE }],
  ['rental-vat', '/rental-vat', {}],
  ['late-surcharge', '/late-surcharge', NUM],
]) await walk(n, path, f);

await b.close();
console.log(errs.length ? '\nISSUES\n' + errs.join('\n') : '\nclean: every tool reached a result, no undefined or NaN rendered, every source link resolves');
