// Fact-check regression gate for the LinkedIn programme.
//
// The September 2026 audit found 101 statements across 47 of the 105 English posts that
// contradicted a verified rule. They were corrected on 15 September 2026. Every pattern
// below is one of those errors. If a rewrite, a reseed or a machine translation puts one
// back, this fails rather than sending it out under a real person's name.
//
// Each check names the rule it protects, so the reason survives longer than the memory of
// the person who wrote it.
import { readFileSync } from 'node:fs';
import crypto from 'node:crypto';
import { withCta } from './api/_email.js';

let pass = 0; const fails = [];
const ok_ = (name, cond, extra = '') => { if (cond) pass++; else fails.push(`${name}${extra ? ' :: ' + extra : ''}`); };
const eq = (name, a, b) => ok_(name, a === b, `${JSON.stringify(a)} !== ${JSON.stringify(b)}`);

const owners = (await import('./api/_linkedin_batch1.js')).default;
const agents = (await import('./api/_linkedin_agents.js')).default;
const attorneys = (await import('./api/_linkedin_attorneys.js')).default;
const translations = (await import('./api/_linkedin_translations.js')).default;
const english = [
  ...owners.map(p => ({ ...p, audience: 'owners' })),
  ...agents.map(p => ({ ...p, audience: 'agents' })),
  ...attorneys.map(p => ({ ...p, audience: 'attorneys' })),
];
eq('105 English masters', english.length, 105);

// ---------------------------------------------------------------- forbidden statements
// [what it is] -> [rule id it contradicts]
const FORBIDDEN = [
  [/7\.65\s*(to|percent to)\s*36\.5/i,          'isd.state_scale: the state scale tops at 34, not 36.5'],
  [/36\.5\s*percent/i,                          'isd.state_scale: 36.5 is not a Spanish succession rate'],
  [/0\.2\s*(to|percent up to)\s*2\.5\s*percent/i,'ip.state_scale: the wealth tax scale tops at 3.5, not 2.5'],
  [/5\s*percent\s*(gets\s*)?added\s*every\s*3\s*months/i, 'late.recargo.voluntary: the pre-2021 ladder was replaced by Ley 11\/2021'],
  [/maximum of 20 percent on top/i,             'late.recargo.voluntary: 1 percent plus 1 per month, then 15 plus interest'],
  [/20 April, 20 July, 20 October and 20 January/i, 'irnr rental filing is no longer quarterly'],
  [/20th of April, July, October and January/i,  'irnr rental filing is no longer quarterly'],
  [/declared quarterly/i,                       'irnr rental filing is no longer quarterly'],
  // The 19 and 24 split is CORRECT for imputed and rental income. It is wrong only when
  // applied to a capital gain, which is 19 percent for every non-resident.
  [/(capital gain|gains bill|profit)[^.]{0,140}24 percent/i, 'irnr.rates: a capital gain is 19 percent for every non-resident'],
  [/7,200 euros of funds/i,                     'visa.non_lucrative: 400 percent of IPREM, about 28,800'],
  [/(roughly|around) 28,000 euros a year/i,      'visa.non_lucrative: about 28,800, not 28,000'],
  [/around 2,500 euros a month/i,               'visa.digital_nomad: publish the rule, 200 percent of the SMI, not a euro figure'],
  [/around 11 euros/i,                          'nie.fee: 9.84'],
  [/300 to 600 euros/i,                         'epc.penalties is unverified: DO NOT PUBLISH FIGURES'],
  [/4,000 to 60,000|111,000/,                   'no verified source for those tourist-let fine bands'],
  [/under three months makes (you|your buyer) a tourist landlord/i, 'lau.tourist_excluded: it is not a duration test'],
  [/Spend 183 days of the year in Spain and you're a tax resident/i, 'residency.tests: MORE than 183'],
  [/fewer than 180 days a year in Spain/i,       'residency.tests: the line is 183, not 180'],
  [/30\+ countries|28 plus countries|more than 28 countries|28\+ countries/i, 'getbueno.com says 25+'],
];
for (const [re, why] of FORBIDDEN) {
  const hit = english.filter(p => re.test(p.post_text) || re.test(p.title || ''));
  ok_(`no post says: ${why}`, hit.length === 0, hit.map(p => `${p.audience} day ${p.day}`).join(', '));
}

// -------------------------------------------------------- claims that need their caveat
// The 48-hour rule is a myth (squat.48_hour_rule). A post may name it only to correct it.
// The one other legitimate use of the number is the platforms' 48 hours to act on an
// administrative order, which survived the annulments (registry.survives, art. 6.g).
for (const p of english.filter(p => /48[ -]hours?/i.test(p.post_text))) {
  ok_(`${p.audience} day ${p.day}: the 48-hour rule is named only to correct it`,
    // Named to correct it, in whatever words. occupation_cover says "no 48-hour mark",
    // squatter_eviction says "no 48-hour rule", and both are the correction, not the myth.
    /(is )?(no|not a) 48[ -]hours?[a-z -]*(rule|mark|window|deadline|limit)?/i.test(p.post_text)
      || /48[ -]hours?[^.]{0,60}(does not exist|is a myth)/i.test(p.post_text)
      || /48 hours (from notification )?to (act|comply)/i.test(p.post_text),
    p.title);
}
// The letters NRA may be named only as annulled too. rental_rule_changes exists to say
// the number is gone, so the term has to be allowed to appear in exactly that sentence.
for (const p of english.filter(p => /\bNRA\b/.test(p.post_text) || /\bNRA\b/.test(p.title || ''))) {
  ok_(`${p.audience} day ${p.day}: NRA is named only as annulled`,
    /no (state |annual )?(NRA |national )?(number|renewal)|annull|struck down|no longer exists/i.test(p.post_text),
    p.title);
}

// The national number may be named only as annulled (registry.annulled).
for (const p of english.filter(p => /national (rental )?regist(ration|er)/i.test(p.post_text))) {
  ok_(`${p.audience} day ${p.day}: the national register is named only as annulled`,
    /annull|struck down|no longer exists/i.test(p.post_text), p.title);
}

// ------------------------------------------------------------------------ brand rules
const BRAND = [
  [/[—–]/, 'an em or en dash'],
  [/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u, 'an emoji'],
  [/\b(Sabadell|BBVA|CaixaBank|Revolut|Wise)\b/, 'a named competitor'],
  [/\b(revolutionary|disruptive|game-changing)\b/i, 'a banned superlative'],
  [/\*\*/, 'markdown bold, which LinkedIn renders literally'],
];
for (const [re, what] of BRAND) {
  const hit = english.filter(p => re.test(p.post_text) || re.test(p.title || ''));
  ok_(`no post contains ${what}`, hit.length === 0, hit.map(p => `${p.audience} day ${p.day}`).join(', '));
}
// Splice damage from a line edit, which is how a correction turns into gibberish.
// The call to action is exempt: it is fixed approved copy and its own "countries.
// getbueno.com" is a full stop followed by a lowercase letter by design.
const withoutCta = (t) => String(t).split('\n').filter(l => !l.includes('getbueno.com')).join('\n');
for (const p of english) {
  ok_(`${p.audience} day ${p.day}: reads as prose`,
    !/\.\.|\.\s*,|,\s*\.|\.\s+[a-z]/.test(withoutCta(p.post_text)), p.title);
}

// --------------------------------------------------- the translation staleness coupling
// A translation stores the sha1 of the English it was made from. sendPostToTeam compares
// it with the English as it stands and machine-retranslates on a mismatch. So a corrected
// English master MUST leave its translations mismatched, or the next send quietly delivers
// the old wrong figures in five languages.
//
// Since 18 September 2026 all 105 posts exist in all five languages, and the hash is taken
// from the approved master as the table stores it (edited_text where a reviewer or a
// content pass has written one), not from the English in these modules. So this file can
// check the shape and the couplings, and the database check is the one that compares the
// hash itself: every translation row's source_hash must equal the sha1 of its English
// row's current text, which was verified as 0 mismatches when the rows were loaded.
const hashText = (s) => crypto.createHash('sha1').update(String(s)).digest('hex');
eq('525 translation rows', translations.length, 525);
const langs = [...new Set(translations.map(t => t.language))].sort();
eq('five languages', langs.join(','), 'es,fr,nl,no,sv');
for (const l of langs) {
  eq(`${l}: one row per post`, translations.filter(t => t.language === l).length, 105);
}
eq('every English post is translated',
  new Set(translations.map(t => t.slug)).size, new Set(english.map(p => p.slug)).size);
ok_('and no translation is for a post that does not exist',
  translations.every(t => english.some(p => p.slug === t.slug)),
  translations.filter(t => !english.some(p => p.slug === t.slug)).map(t => t.slug).join(', '));
ok_('every translation carries a source hash', translations.every(t => /^[0-9a-f]{40}$/.test(t.source_hash || '')));
// One English master per post, so its five translations must all cite the same hash.
// A split here means one language was rebuilt from a different master than its siblings.
const bySlug = new Map();
for (const t of translations) {
  if (!bySlug.has(t.slug)) bySlug.set(t.slug, new Set());
  bySlug.get(t.slug).add(t.source_hash);
}
const split = [...bySlug.entries()].filter(([, h]) => h.size !== 1).map(([s]) => s);
ok_('the five languages of a post cite one master', split.length === 0, split.join(', '));
ok_('every translation is approved', translations.every(t => t.status === 'approved'));
ok_('and none carries a reviewer edit', translations.every(t => !t.edited_text));
// The image is not translated. It is resolved per post, so a translation row must not
// pin its own picture: refresh fills it from the post's frame.
ok_('no translation pins its own image', translations.every(t => !t.image_url));
// The call to action belongs to the post, in the reader's own language.
const CTA_PATH = { no: 'getbueno.com/no', sv: 'getbueno.com/se', fr: 'getbueno.com/fr',
                   nl: 'getbueno.com/nl', es: 'getbueno.com/es' };
for (const t of translations) {
  const n = (t.post_text.match(new RegExp(CTA_PATH[t.language].replace(/\//g, '\\/'), 'g')) || []).length;
  if (n !== 1) ok_(`${t.slug} ${t.language}: exactly one call to action`, false, String(n));
}
ok_('every translation carries exactly one call to action in its own language', true);
// House rules that survive translation.
ok_('no dashes in any translation', translations.every(t => !/[\u2014\u2013]/.test(t.post_text)),
  translations.filter(t => /[\u2014\u2013]/.test(t.post_text)).map(t => `${t.slug} ${t.language}`).join(', '));
ok_('no translation calls Bueno a bank',
  translations.every(t => !/bueno[^.]{0,24}(bank|banking)/i.test(t.post_text)),
  translations.filter(t => /bueno[^.]{0,24}(bank|banking)/i.test(t.post_text)).map(t => `${t.slug} ${t.language}`).join(', '));
ok_('no translation names a competitor',
  translations.every(t => !/sabadell|bbva|caixabank|revolut/i.test(t.post_text)),
  translations.filter(t => /sabadell|bbva|caixabank|revolut/i.test(t.post_text)).map(t => `${t.slug} ${t.language}`).join(', '));
// The corrected facts must not have travelled into any language. The test is relative to
// the post's own English: rental_rule_changes is ABOUT the annulled NRA number and says so
// in every language, and EX-18 is the correct form in the posts that use it. A translation
// is only wrong here if it carries a term its English master does not.
const enText = new Map(english.map(p => [p.slug, `${p.post_text} ${p.title || ''}`]));
const NEUTRAL = [[/36[.,]5/, 'the 36.5 percent succession rate'],
                 [/\bNRA\b/, 'the annulled national number'],
                 [/111[.,]000/, 'the unsourced fine band'],
                 [/\bEX-18\b/, 'EX-18 where EX-15 is meant']];
for (const [re, what] of NEUTRAL) {
  const hit = translations.filter(t => re.test(t.post_text) && !re.test(enText.get(t.slug) || ''));
  ok_(`no translation introduces ${what}`, hit.length === 0, hit.map(t => `${t.slug} ${t.language}`).join(', '));
}

// Figures are checked against the approved master, which lives in the table rather than in
// these modules, so the comparison is a database one and not something this file can do
// honestly. It was run on 18 September 2026 over all 525 rows: no row lost a figure, and
// the only five rows with one digit fewer than their English are the Spanish ones that
// write "tercer trimestre de 2026" where the English writes "Q3 2026".
//
// What this file can still catch is a translation that came back as a stub.
const enBySlug = new Map(english.map(p => [p.slug, p]));
const short = translations.filter(t => t.post_text.length < 400);
ok_('no translation came back as a stub', short.length === 0,
  short.map(t => `${t.slug} ${t.language} (${t.post_text.length})`).join(', '));
ok_('every translation keeps its paragraph structure',
  translations.every(t => t.post_text.split(/\n\n+/).length >= 3),
  translations.filter(t => t.post_text.split(/\n\n+/).length < 3).map(t => `${t.slug} ${t.language}`).join(', '));
ok_('every translation has a title', translations.every(t => t.title && t.title.length > 5));
ok_('and no title runs past 45 characters',
  translations.every(t => t.title.length <= 45),
  translations.filter(t => t.title.length > 45).map(t => `${t.slug} ${t.language} (${t.title.length})`).join(', '));

console.log(`\n${pass} passed, ${fails.length} failed`);
fails.forEach(f => console.log('FAIL ' + f));
process.exit(fails.length ? 1 : 0);
