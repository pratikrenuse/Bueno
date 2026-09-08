import { chromium } from 'playwright';

const B = 'http://localhost:4180';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const errs = [];

// Anything that looks like an unresolved translation key, a rendered undefined, or the
// one thing this feature must never do: turn evidence into a claim about a business.
const CLAIM = /\b(?:speaks?|spoken|fluent in|talks?)\s+(?:english|norwegian|swedish|danish|german|french|dutch|finnish)\b/i;

async function shot(name, path, opts = {}) {
  const p = await b.newPage({ viewport: opts.viewport || { width: 1280, height: 1000 } });
  p.on('pageerror', e => errs.push(`${name} PAGEERROR: ${e.message}`));
  p.on('console', m => {
    const t = m.text();
    if (m.type() === 'error' && !/ERR_TUNNEL|font|Failed to load resource/i.test(t)) errs.push(`${name} console: ${t}`);
  });
  await p.goto(B + path, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(opts.wait || 1400);
  await p.screenshot({ path: `/tmp/shots/${name}.png`, fullPage: !!opts.full });

  const info = await p.evaluate(() => {
    const t = document.body.innerText;
    const keyish = [...new Set((t.match(/\b(?:calc_directory|cards|home|nav|common)\.[a-z0-9_]+/gi) || []))];
    const undef = [...new Set((t.match(/\bundefined\b|\bNaN\b|\[object Object\]/g) || []))];
    const cs = getComputedStyle(document.body);
    // Sample the dominant surface so we can prove the two pages are not the same page.
    // Sample the page's own container, not `main` or `body`, or the check compares the
    // browser default against itself and always passes.
    const main = document.querySelector('.trades-page, .pros-page');
    return {
      text: t.slice(0, 400),
      keyish, undef,
      bodyBg: cs.backgroundColor,
      mainBg: main ? getComputedStyle(main).backgroundColor : 'NO PAGE CONTAINER',
      pageClass: main ? main.className : null,
      chars: t.length,
      attribution: /Google Maps/i.test(t),
      reviewLinks: document.querySelectorAll('.dir-quote a').length,
      method: !!document.querySelector('.dir-more'),
      overflow: document.documentElement.scrollWidth > window.innerWidth + 2,
    };
  });

  if (info.keyish.length) errs.push(`${name} UNRESOLVED KEYS: ${info.keyish.join(', ')}`);
  if (info.undef.length) errs.push(`${name} BAD OUTPUT: ${info.undef.join(', ')}`);
  if (info.overflow) errs.push(`${name}: page scrolls horizontally`);
  const claim = info.text.match(CLAIM);
  if (claim) errs.push(`${name} TURNS EVIDENCE INTO A CLAIM: "${claim[0]}"`);
  console.log(`  ${name.padEnd(26)} bg=${(info.mainBg || '').padEnd(20)} chars=${String(info.chars).padEnd(6)} attrib=${info.attribution} method=${info.method} reviewLinks=${info.reviewLinks}`);
  await p.close();
  return info;
}

const RESULTS = '?town=javea&trade=';
await shot('dir-trades-landing', '/spain-directory', { full: true });
const tr = await shot('dir-trades-results', `/spain-directory${RESULTS}plumber`, { full: true, wait: 2200 });
const trNo = await shot('dir-trades-results-no', `/no/spain-directory${RESULTS}plumber`, { wait: 2200 });
await shot('dir-trades-mobile', `/spain-directory${RESULTS}plumber`, { viewport: { width: 390, height: 844 }, wait: 2200, full: true });

await shot('dir-pros-landing', '/spain-professionals', { full: true });
const pr = await shot('dir-pros-results', `/spain-professionals${RESULTS}lawyer`, { full: true, wait: 2200 });
await shot('dir-pros-mobile', `/spain-professionals${RESULTS}lawyer`, { viewport: { width: 390, height: 844 }, wait: 2200, full: true });

await b.close();

// The whole point of the rebuild: the two pages must not read as the same page.
if (tr.mainBg === 'NO PAGE CONTAINER' || pr.mainBg === 'NO PAGE CONTAINER') {
  errs.push('one of the directories has no page container class, so the surfaces cannot be compared');
} else if (tr.mainBg === pr.mainBg) {
  errs.push(`the two directories still share a dominant surface colour (${tr.mainBg}), which is the confusion we were asked to fix`);
}
for (const [n, i] of [['trades', tr], ['pros', pr]]) {
  if (!i.attribution) errs.push(`${n}: Google Maps attribution missing from the results view`);
  if (!i.method) errs.push(`${n}: the how-results-were-ordered disclosure is missing`);
  if (!i.reviewLinks) errs.push(`${n}: review quotes carry no links, which the terms require`);
}

console.log(errs.length ? '\nISSUES\n' + errs.join('\n') : '\nclean: no errors, no unresolved keys, no claims, attribution and method intact on both');
