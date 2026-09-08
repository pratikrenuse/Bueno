import { chromium } from 'playwright';

// The rename made two menu labels longer, and German turns them into Reparaturen and
// Immobilienexperten. The risk is not that they read badly, it is that they wrap to two
// lines or push the language switcher off a phone. Checked in every locale at both widths.

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const errs = [];

for (const loc of ['', '/no', '/sv', '/de', '/fr', '/nl']) {
  for (const [w, h, tag] of [[1280, 900, 'desktop'], [390, 844, 'mobile']]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    p.on('pageerror', e => errs.push(`${loc || '/en'} ${tag} PAGEERROR: ${e.message}`));
    await p.goto('http://localhost:4180' + loc + '/spain-directory', { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(900);

    const r = await p.evaluate(() => {
      const nav = document.querySelector('.site-nav');
      // getClientRects() returns one box per line box for an inline element, so more than
      // one means the label actually wrapped. Measuring height against a guess was wrong:
      // padding made every link taller than the threshold, including ones never touched.
      const links = [...document.querySelectorAll('.site-nav-link')].map(a => ({
        t: a.innerText.trim(),
        lines: a.getClientRects().length,
      }));
      const header = document.querySelector('.calc-header');
      return {
        labels: links.map(l => l.t),
        wrapped: links.filter(l => l.lines > 1).map(l => l.t),
        navRight: nav ? Math.round(nav.getBoundingClientRect().right) : null,
        headerRight: header ? Math.round(header.getBoundingClientRect().right) : null,
        overflow: document.documentElement.scrollWidth > window.innerWidth + 2,
        navVisible: nav ? getComputedStyle(nav).display !== 'none' : false,
        stale: /\b(Trades Directory|Property Professionals)\b/.test(document.body.innerText),
      };
    });

    if (r.overflow) errs.push(`${loc || '/en'} ${tag}: page scrolls horizontally`);
    if (r.stale) errs.push(`${loc || '/en'} ${tag}: an old section name is still on the page`);
    if (r.navVisible && r.wrapped.length) errs.push(`${loc || '/en'} ${tag}: menu label wraps to two lines: ${r.wrapped.join(', ')}`);
    if (r.navVisible && r.navRight > r.headerRight) errs.push(`${loc || '/en'} ${tag}: menu overflows the header`);

    if (tag === 'desktop') console.log(`  ${(loc || '/en').padEnd(5)} ${r.labels.join('  |  ')}`);
    else console.log(`        mobile: nav ${r.navVisible ? 'shown' : 'hidden'}, wrapped=${r.wrapped.length}, overflow=${r.overflow}`);
    await p.close();
  }
}

await b.close();
console.log(errs.length ? '\nISSUES\n' + errs.join('\n') : '\nmenu clean in all six languages at desktop and 390px');
