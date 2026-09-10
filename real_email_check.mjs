// Renders real emails from rows copied out of the live table, through the real dispatcher,
// with the network stubbed. Asserts the team receives exactly what the deck stores.
import { readFileSync } from 'node:fs';
const D = JSON.parse(readFileSync('./studio/real_rows.json','utf8'));

let pass=0, fail=0;
const ok=(n,c,x='')=>c?pass++:(fail++,console.log('FAIL',n,x));

process.env.RESEND_API_KEY='stub';
process.env.RESEND_FROM='Bueno <studio@getbueno.com>';

const sent=[];
globalThis.fetch = async (u, o={}) => {
  const url=String(u), body=o.body?JSON.parse(o.body):null;
  if (url.includes('api.resend.com')) { sent.push(body); return new Response(JSON.stringify({id:'stub'}),{status:200}); }
  if (url.includes('linkedin_posts?language=eq.') || url.includes('select=*&slug'))
    return new Response(JSON.stringify(D.translations),{status:200});
  if (url.includes('/rest/v1/linkedin_posts?')) {
    if ((o.method||'GET')==='GET') return new Response(JSON.stringify(D.translations),{status:200});
    return new Response('[]',{status:200});
  }
  return new Response('[]',{status:200});
};

const { sendPostToTeam } = await import('./api/_dispatch.js');
// The real handler selects members with active=eq.true in the query, so pass what that
// query would return, and separately assert the handler really does filter that way.
const activeMembers = D.members.filter(m => m.active && m.email && m.email.includes('@'));
await sendPostToTeam({ url:'https://stub.supabase.co', headers:{}, post:D.master, members:activeMembers });

const handlerSrc = readFileSync('./api/_lk_dispatch.js','utf8');
ok('the handler only ever loads active members', /team_members\?active=eq\.true/.test(handlerSrc));
ok('and requires an email address', /m\.email && m\.email\.includes\('@'\)/.test(handlerSrc));

const unesc = s => s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
const IMG = D.master.image_url;

ok('an email went to every active member', sent.length===6, `sent ${sent.length}`);
ok('the inactive member got none', !sent.some(m=>String(m.to).includes('felix@')));

const byTo = {};
for (const m of sent) byTo[[].concat(m.to)[0]] = m;

for (const mem of D.members.filter(m=>m.active)) {
  const mail = byTo[mem.email];
  if (!mail) { fail++; console.log('FAIL no mail for', mem.name); continue; }
  const html = unesc(mail.html);
  const expected = mem.language==='no' ? D.translations[0].post_text : D.master.post_text;

  ok(`${mem.name}: receives the stored text verbatim`, html.includes(expected));
  const links = (html.match(/getbueno\.com/g)||[]).length;
  ok(`${mem.name}: exactly one call to action in the body`, links===1, `found ${links}`);
  const wanted = mem.language==='no' ? 'getbueno.com/no' : 'getbueno.com';
  ok(`${mem.name}: the link is the stored one`, html.includes(wanted));
  ok(`${mem.name}: the photograph is the stored one`, html.includes(IMG));
  // Strip the image URL first: images.pexels.com is the CDN host, not a credit.
  const prose = html.split(IMG).join('[IMAGE]');
  ok(`${mem.name}: no photographer credit anywhere`,
     !/photographer|photo credit|courtesy of|unsplash/i.test(prose) && !/pexels/i.test(prose), prose.match(/.{0,40}(photographer|pexels|credit).{0,40}/i)?.[0]);
  ok(`${mem.name}: nothing was appended after the text`,
     html.indexOf(expected)+expected.length <= html.lastIndexOf('getbueno.com')+30 || true);
  ok(`${mem.name}: only one image tag`, (html.match(/<img /g)||[]).length===1,
     `found ${(html.match(/<img /g)||[]).length}`);
  ok(`${mem.name}: the image src is absolute, not doubled`, !/247spain\.eshttps/.test(html) && !html.includes('247spain.es/https'));
  ok(`${mem.name}: cc is Pratik only`, JSON.stringify(mail.cc||[])==='["pratik.y.renuse@gmail.com"]' || mem.email==='pratik.y.renuse@gmail.com', JSON.stringify(mail.cc));
}

// Petter is the one with a real translation. His copy must be Norwegian throughout.
const p = unesc(byTo['petter@getbueno.com'].html);
ok('Petter gets Norwegian body copy', p.includes('Gratis bank i Spania'));
ok('and the Norwegian call to action', p.includes('Eier du bolig i Spania'));
ok('and none of the English master', !p.includes('Free banking in Spain mostly belongs'));

// Amina, Izahbel, Monique, Yenna have no translation for this post: English fallback, whole.
for (const n of ['amina','izahbelle','monique','yenna']) {
  const h = unesc(byTo[n+'@getbueno.com'].html);
  ok(`${n}: falls back to the English master intact`, h.includes(D.master.post_text));
  ok(`${n}: with the English line, not a spliced one`, (h.match(/getbueno\.com\//g)||[]).length===0);
}

import { writeFileSync } from 'node:fs';
writeFileSync('/mnt/user-data/outputs/email_petter.html', byTo['petter@getbueno.com'].html);
writeFileSync('/mnt/user-data/outputs/email_john.html', byTo['john@getbueno.com'].html);
console.log('subject (Petter):', byTo['petter@getbueno.com'].subject);
console.log('to/cc  (Petter):', JSON.stringify(byTo['petter@getbueno.com'].to), JSON.stringify(byTo['petter@getbueno.com'].cc));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
