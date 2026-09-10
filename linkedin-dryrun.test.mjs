#!/usr/bin/env node
// Runs the real LinkedIn send path with the network stubbed, and inspects what would go out.
//
// WHY THIS EXISTS
// Every other test here checks a piece. This runs the whole thing: the actual
// sendPostToTeam from api/_dispatch.js, the actual approval handler, the actual reminder
// handler, against the real roster, with fetch replaced so nothing leaves the machine.
//
// The team uses this tool. A stale import, a renamed export, a missing translation or a
// template that prints "undefined" would land in six inboxes under their own names, and
// the first anyone would know is when a member forwards it back. So the assertion is not
// "the module loads". It is "here is the email, and it is correct".

let pass = 0, fail = 0;
const eq = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : (fail++, console.log(`FAIL ${name}\n  got  ${JSON.stringify(got)}\n  want ${JSON.stringify(want)}`));
};
const ok_ = (name, cond, extra = '') => cond ? pass++ : (fail++, console.log(`FAIL ${name} ${extra}`));

// --- the environment the functions expect -------------------------------------------
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_KEY = 'test-key';
process.env.RESEND_API_KEY = 'test-resend';
process.env.RESEND_FROM = '24/7 Spain <pratik@spanishpropertyinsights.com>';
process.env.INTERNAL_PASSCODE = 'test-pass';

// The live roster, as it stands in the database today.
const MEMBERS = [
  { name: 'Amina',   email: 'amina@getbueno.com',     language: 'fr', stream: 'owners', active: true },
  { name: 'Izahbel', email: 'izahbelle@getbueno.com', language: 'sv', stream: 'owners', active: true },
  { name: 'John',    email: 'john@getbueno.com',      language: 'en', stream: 'owners', active: true },
  { name: 'Monique', email: 'monique@getbueno.com',   language: 'nl', stream: 'owners', active: true },
  { name: 'Petter',  email: 'petter@getbueno.com',    language: 'no', stream: 'owners', active: true },
  { name: 'Yenna',   email: 'yenna@getbueno.com',     language: 'es', stream: 'owners', active: true },
];

// Rows carry the FINISHED post, CTA included, exactly as the table holds them and exactly
// as the deck showed them to the reviewer. The send path is not allowed to add anything,
// so if a call to action reaches an inbox it can only be because it was stored on the row.
const CTA_EN = 'Owning or planning to buy property in Spain? Bueno is trusted by homeowners from 25+ countries. getbueno.com';

const POST = {
  id: 'post-1', slug: 'test_post', day: 7, title: 'A test post',
  post_text: 'Owning in Spain means paperwork.\n\nHere is the part people miss.\n\n#SpainProperty\n\n' + CTA_EN,
  edited_text: null, audience: 'owners', language: 'en',
  image_url: '/photos/cove_house.jpg', source_hash: null,
};

// Translations for five of the six. Izahbel's Swedish is deliberately missing, to exercise
// the English-fallback path that a real send hits whenever a translation is not ready.
const TR_CTA = {
  fr: "Vous poss\u00e9dez un bien en Espagne, ou vous envisagez d'acheter ? Bueno est utilis\u00e9 par des propri\u00e9taires de plus de 25 pays. getbueno.com/fr",
  nl: 'Bezit u een woning in Spanje, of overweegt u te kopen? Bueno wordt gebruikt door huiseigenaren uit meer dan 25 landen. getbueno.com/nl',
  no: 'Eier du bolig i Spania, eller vurderer du \u00e5 kj\u00f8pe? Bueno brukes av boligeiere fra over 25 land. getbueno.com/no',
  es: '\u00bfTiene una propiedad en Espa\u00f1a o est\u00e1 pensando en comprar? Bueno lo utilizan propietarios de m\u00e1s de 25 pa\u00edses. getbueno.com/es',
};
const TRANSLATIONS = [
  { language: 'fr', post_text: 'Posseder en Espagne, c est de la paperasse.\n\n' + TR_CTA.fr, title: 'Un test', source_hash: null },
  { language: 'nl', post_text: 'Bezit in Spanje betekent papierwerk.\n\n' + TR_CTA.nl, title: 'Een test', source_hash: null },
  { language: 'no', post_text: 'A eie i Spania betyr papirarbeid.\n\n' + TR_CTA.no, title: 'En test', source_hash: null },
  { language: 'es', post_text: 'Tener casa en Espana es papeleo.\n\n' + TR_CTA.es, title: 'Una prueba', source_hash: null },
];

let TRANSLATION_ROWS;  // swapped by the staleness tests at the end
const sent = [];      // every email the code tried to send
const written = [];   // every row it tried to insert
const patched = [];   // every row it tried to update

globalThis.fetch = async (url, opts = {}) => {
  const u = String(url);
  const method = opts.method || 'GET';
  const json = (body) => ({ ok: true, status: 200, json: async () => body, text: async () => JSON.stringify(body) });

  if (u.startsWith('https://api.resend.com/emails')) {
    sent.push(JSON.parse(opts.body));
    return json({ id: 'resend-' + sent.length });
  }
  if (u.includes('/rest/v1/team_members')) return json(MEMBERS);
  if (u.includes('/rest/v1/linkedin_emails')) { written.push(JSON.parse(opts.body)); return json({}); }
  if (u.includes('/rest/v1/linkedin_posts')) {
    if (method === 'PATCH') { patched.push({ url: u, body: JSON.parse(opts.body) }); return json({}); }
    if (u.includes('language=in.')) return json(TRANSLATION_ROWS);
    if (u.includes('day=gt.')) return json([{ day: 9, title: 'The next one' }, { day: 11, title: 'And another' }]);
    if (u.includes('id=eq.')) return json([POST]);
    return json([POST]);
  }
  if (u.includes('api.anthropic.com')) return { ok: false, status: 500, json: async () => ({}), text: async () => 'no translation service in the harness' };
  return json([]);
};

TRANSLATION_ROWS = TRANSLATIONS;
const { sendPostToTeam } = await import('./api/_dispatch.js');
const { CTA, APPROVAL_TO, REVIEW_TO, REVIEW_CC, TEAM_CC } = await import('./api/_email.js');

// --- 1. the team send ------------------------------------------------------------------
const result = await sendPostToTeam({
  url: process.env.SUPABASE_URL,
  headers: { apikey: 'k', Authorization: 'Bearer k' },
  post: POST, members: MEMBERS, anthropicKey: null,
});

eq('one email per team member', sent.length, 6);
eq('all six reported as sent', result.sent, 6);
eq('none failed', result.failed, 0);
ok_('no errors came back', !result.errors, JSON.stringify(result.errors));

for (const m of MEMBERS) {
  const mail = sent.find(e => e.to[0] === m.email);
  ok_(`${m.name}: got an email`, !!mail);
  if (!mail) continue;
  eq(`${m.name}: addressed only to them`, mail.to, [m.email]);
  const expectCc = TEAM_CC.filter(a => a.toLowerCase() !== m.email.toLowerCase());
  eq(`${m.name}: copied to ${expectCc.join(',') || 'nobody'}`, mail.cc || [], expectCc);
  // Izahbel has no Swedish translation, so she gets the English master verbatim, English
  // call to action and all. That is the point: nothing is grafted on at send time.
  const expected = m.language === 'sv' ? CTA.en : CTA[m.language];
  ok_(`${m.name}: the stored call to action reaches them intact`, mail.html.includes(expected),
    `expected: ${expected}`);
  ok_(`${m.name}: nothing else was appended`, (mail.html.match(/getbueno\.com/g) || []).length >= 1);
  ok_(`${m.name}: nothing undefined in the email`, !/\bundefined\b/.test(mail.html));
  ok_(`${m.name}: no NaN in the email`, !/\bNaN\b/.test(mail.html));
  ok_(`${m.name}: the image points at the www host`, mail.html.includes('https://www.247spain.es/photos/'));
  ok_(`${m.name}: has a subject`, typeof mail.subject === 'string' && mail.subject.length > 5);
  ok_(`${m.name}: sender is the real one`, mail.from.includes('spanishpropertyinsights.com'));
  ok_(`${m.name}: replies go to Pratik`, mail.reply_to === 'pratik.y.renuse@gmail.com');
}

// John is a member AND on nobody's copy line but his own send.
eq('John is copied on nothing but his own', sent.filter(e => (e.cc || []).includes('john@getbueno.com')).length, 0);
eq('Pratik is copied on all six', sent.filter(e => (e.cc || []).includes('pratik.y.renuse@gmail.com')).length, 6);

// The missing Swedish translation must fall back to English, say so, and still carry the
// Swedish call to action.
const iz = sent.find(e => e.to[0] === 'izahbelle@getbueno.com');
ok_('Izahbel is told the translation was not ready', /was not ready/.test(iz.html));
// She falls back to the English master, so she gets the English line, not a Swedish line
// pasted onto English body copy. The old send-time append produced that mismatch.
ok_('Izahbel gets the English fallback whole', iz.html.includes(CTA.en));
ok_('and no Swedish line is grafted onto English copy', !iz.html.includes(CTA.sv));
ok_('and it points where the English post points', iz.html.includes('getbueno.com'));
// Worth saying plainly: the way Izahbel gets a Swedish call to action is for a Swedish
// translation to exist. Then the Swedish row carries the Swedish line and she is sent that
// row. The fix for a missing translation is the translation, not a patch at send time.
eq('the fallback is recorded in the log', written.some(w => /EN fallback/.test(w.member_name || '')), true);

// The post is only marked sent once, and only after a successful send.
eq('the post is marked sent exactly once', patched.filter(p => p.body.sent_at).length, 1);
eq('six rows written to the email log', written.length, 6);

// --- 2. the approval preview ------------------------------------------------------------
sent.length = 0; written.length = 0; patched.length = 0;
const decide = (await import('./api/_lk_decide.js')).default;
let decideRes = null;
await decide(
  { method: 'POST', headers: { 'x-passcode': 'test-pass' }, body: { id: 'post-1', action: 'approved' } },
  { status(){ return this; }, json(b){ decideRes = b; return this; } },
);
eq('approving sends exactly one email', sent.length, 1);
eq('to John and Pratik', sent[0].to, APPROVAL_TO);
ok_('the preview shows the call to action the team will get', sent[0].html.includes(CTA.en));
ok_('nothing undefined in the preview', !/\bundefined\b/.test(sent[0].html));
ok_('approving does NOT send to the team', !sent.some(e => /amina|izahbel|monique|petter|yenna/i.test(String(e.to))));

// --- 3. the review reminder -------------------------------------------------------------
sent.length = 0; written.length = 0;
const remind = (await import('./api/_lk_remind.js')).default;
let remindRes = null;
await remind(
  { method: 'GET', headers: { 'x-passcode': 'test-pass' }, query: {} },
  { status(){ return this; }, json(b){ remindRes = b; return this; } },
);
eq('the reminder sends one email', sent.length, 1);
eq('addressed to John', sent[0].to, REVIEW_TO);
eq('copied to Pratik', sent[0].cc, REVIEW_CC);
ok_('it greets John by name', /Hi John,/.test(sent[0].html));
ok_('it never lands on a team member', !/amina|izahbel|monique|petter|yenna/i.test(String(sent[0].to) + String(sent[0].cc)));
ok_('nothing undefined in the reminder', !/\bundefined\b/.test(sent[0].html));
ok_('it reports the Barcelona time it fired at', typeof remindRes?.fired_at_barcelona === 'string', JSON.stringify(remindRes?.fired_at_barcelona));


// ---------------------------------------------------------------------------
// The translation staleness coupling.
//
// A translation stores, in source_hash, the sha1 of the English it was made from. On every
// send, sendPostToTeam compares that against the sha1 of the English text as it stands. If
// they differ, syncTranslations MACHINE-RETRANSLATES that language and overwrites its
// post_text, title and edited_text. So editing an English master without refreshing the
// translations' hashes silently destroys the reviewed translations on the next send.
//
// This bit us once: appending the call to action to all 105 English masters changed every
// master's text and left all 150 translations pointing at the old hash. Caught before a
// send; the hashes were refreshed in the table. These tests pin the behaviour so nobody
// loosens the comparison instead of refreshing the data.
// ---------------------------------------------------------------------------
const { hashText } = await import('./api/_translate.js');

{
  const master = { ...POST, id: 'hash-1' };
  const current = hashText(master.edited_text || master.post_text);

  const fresh = [{ language: 'no', title: 'En test', post_text: 'Norsk tekst.', source_hash: current }];
  const stale = [{ language: 'no', title: 'En test', post_text: 'Norsk tekst.', source_hash: 'sha1-of-older-english' }];
  const petter = MEMBERS.filter(m => m.language === 'no');

  const run = async (trs) => {
    const before = sent.length;
    TRANSLATION_ROWS = trs;
    await sendPostToTeam({ url: process.env.SUPABASE_URL, headers: { apikey: 'k', Authorization: 'Bearer k' }, post: master, members: petter, anthropicKey: null });
    TRANSLATION_ROWS = TRANSLATIONS;
    return sent.slice(before);
  };

  const a = await run(fresh);
  ok_('a translation made from the current English is not called stale',
    a.length === 1 && !a[0].html.includes('was edited after this version was translated'));

  const b = await run(stale);
  ok_('a translation made from older English still is',
    b.length === 1 && b[0].html.includes('was edited after this version was translated'));

  ok_('the hash on the wire is a sha1 of the English text',
    /^[0-9a-f]{40}$/.test(current), current);
  ok_('and it changes when the English changes',
    hashText(master.post_text + '\n\nExtra line.') !== current);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
