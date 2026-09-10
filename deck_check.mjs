// Loads the built deck in a real browser, feeds it real rows through a mock API, and
// checks what a reviewer actually sees: the CTA inside the post text, the photograph
// under it, and no credit anywhere.
import http from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const DIST = './dist';
const D = JSON.parse(readFileSync('./studio/real_rows.json','utf8'));
const rows = [
  { id:'r1', slug:'free_banking_myth', day:23, batch:1, member:'', audience:'owners',
    language:'en', title:D.master.title, post_text:D.master.post_text, edited_text:null,
    status:'pending', image_url:D.master.image_url, reject_comment:null, sent_at:null },
  { id:'r2', slug:'free_banking_myth', day:23, batch:1, member:'', audience:'owners',
    language:'no', title:D.translations[0].title, post_text:D.translations[0].post_text,
    edited_text:null, status:'approved', image_url:D.translations[0].image_url,
    reject_comment:null, sent_at:null },
];

const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
const srv = http.createServer(async (req,res)=>{
  const u = new URL(req.url,'http://x');
  if (u.pathname.startsWith('/api/linkedin-posts')) {
    res.writeHead(200,{'content-type':'application/json'}); return res.end(JSON.stringify({posts:rows}));
  }
  if (u.pathname.startsWith('/api/')) { res.writeHead(200,{'content-type':'application/json'}); return res.end('{"ok":true}'); }
  const { statSync } = await import('node:fs');
  let f = path.join(DIST, u.pathname);
  const isDir = existsSync(f) && statSync(f).isDirectory();
  if (!existsSync(f) || isDir) f = path.join(DIST, u.pathname, 'index.html');
  if (!existsSync(f)) f = path.join(DIST, 'index.html');
  res.writeHead(200,{'content-type':MIME[path.extname(f)]||'text/plain'});
  res.end(readFileSync(f));
});
await new Promise(r=>srv.listen(4599,r));

let pass=0, fail=0;
const ok=(n,c,x='')=>c?pass++:(fail++,console.log('FAIL',n,x));

const browser = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport:{width:1180,height:1400} });
// The sandbox has no route to the Pexels CDN, so the real bytes cannot arrive here. Serve a
// clearly-marked placeholder for the exact URL the deck asks for. What is under test is the
// URL the deck requests and where it puts it, not the photograph, which was checked separately.
await page.route('**://images.pexels.com/**', route =>
  route.fulfill({ status:200, contentType:'image/jpeg', body: readFileSync('./studio/placeholder.jpg') }));
// The deck's gate only guards the API, which this harness serves openly. Seed the session
// value it looks for so the harness lands on the deck itself.
await page.addInitScript(() => sessionStorage.setItem('studio_pass','harness'));
const failedReqs=[];
page.on('requestfailed', r => failedReqs.push(r.url()));
await page.goto('http://127.0.0.1:4599/internal-linkedin', { waitUntil:'networkidle' });
await page.getByRole('button',{name:/open the deck/i}).click();
await page.waitForSelector('img[src*="images.pexels.com"]', { state:'visible', timeout: 20000 });

// The deck folds anything past ~240 chars behind "see more", exactly as LinkedIn does.
// Every one of these posts is far longer than that, so the call to action is below the
// fold. Check the collapsed state first, then expand and check again.
const collapsed = await page.evaluate(() => document.body.innerText);
const seeMore = page.getByText('see more').first();
const hasFold = await seeMore.count() > 0;
ok('long posts are folded, as on LinkedIn', hasFold);
ok('the call to action is NOT visible before expanding', !collapsed.includes('getbueno.com'));
if (hasFold) { await seeMore.click(); await page.waitForTimeout(300); }

const card = await page.evaluate(() => {
  const img = document.querySelector('img[src*="images.pexels.com"]');
  const art = img.closest('article') || img.parentElement;
  return { text: art.innerText, imgSrc: img.getAttribute('src'), imgAlt: img.getAttribute('alt'),
           imgs: art.querySelectorAll('img').length,
           imgTop: img.getBoundingClientRect().top,
           textTop: (art.querySelector('div[style*="pre-wrap"]') || art).getBoundingClientRect().top };
});
const body = await page.evaluate(() => document.body.innerText);

ok('the deck renders a post card', !!card.text && card.text.length > 200);
ok('the card shows the call to action in the post text', card.text.includes('getbueno.com'));
ok('with the exact stored wording', card.text.includes('Bueno is trusted by homeowners from 25+ countries'));
ok('the photograph is the stored Pexels one', card.imgSrc === D.master.image_url, card.imgSrc);
ok('the image sits below the text, where LinkedIn puts it', card.imgTop > card.textTop,
   `image at ${Math.round(card.imgTop)}, text at ${Math.round(card.textTop)}`);
ok('the image carries no caption', card.imgAlt === '');
ok('one image per card', card.imgs === 1, String(card.imgs));
ok('no photographer credit anywhere on the page',
   !/photographer|photo credit|courtesy of|unsplash/i.test(body) && !/pexels/i.test(body));
// fonts.googleapis.com and plausible.io are blocked from this sandbox, not by the app.
const ownFailures = failedReqs.filter(u => u.includes('127.0.0.1'));
ok('no request to the app itself failed', ownFailures.length === 0, ownFailures.join(', '));

await page.screenshot({ path:'./studio/deck_card.png', fullPage:false });
await browser.close(); srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
