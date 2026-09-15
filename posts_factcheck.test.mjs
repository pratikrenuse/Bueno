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
  [/\bNRA\b/,                                   'registry.annulled: there is no national rental registration number'],
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
    /(no|not a) 48-hour rule/i.test(p.post_text) || /48 hours (from notification )?to (act|comply)/i.test(p.post_text),
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
for (const p of english) {
  ok_(`${p.audience} day ${p.day}: reads as prose`,
    !/\.\.|\.\s*,|,\s*\.|\.\s+[a-z]/.test(p.post_text), p.title);
}

// --------------------------------------------------- the translation staleness coupling
// A translation stores the sha1 of the English it was made from. sendPostToTeam compares
// it with the English as it stands and machine-retranslates on a mismatch. So a corrected
// English master MUST leave its translations mismatched, or the next send quietly delivers
// the old wrong figures in five languages.
const hashText = (s) => crypto.createHash('sha1').update(String(s)).digest('hex');
const masterHash = new Map(owners.map(p => [p.slug, hashText(withCta(p.post_text, 'en'))]));
eq('150 translation rows', translations.length, 150);
ok_('every translation carries a source hash', translations.every(t => /^[0-9a-f]{40}$/.test(t.source_hash || '')));
const current = translations.filter(t => t.source_hash === masterHash.get(t.slug));
const stale = translations.filter(t => t.source_hash !== masterHash.get(t.slug));
eq('every translation is either current or queued for rebuild', current.length + stale.length, 150);
ok_('the stale set is a whole number of posts', stale.length % 5 === 0, String(stale.length));
// A translation that is current must be clean on the language-neutral numbers too, because
// nothing will rebuild it.
const NEUTRAL = [[/36\.5/, 'the 36.5 percent succession rate'], [/\bNRA\b/, 'the annulled national number'],
                 [/4,000 to 60,000|111,000/, 'the unsourced fine bands'], [/\bEX-18\b/, 'EX-18 where EX-15 is meant']];
for (const [re, what] of NEUTRAL) {
  const hit = current.filter(t => re.test(t.post_text));
  ok_(`no current translation carries ${what}`, hit.length === 0, hit.map(t => `${t.slug} ${t.language}`).join(', '));
}

console.log(`\n${pass} passed, ${fails.length} failed`);
fails.forEach(f => console.log('FAIL ' + f));
process.exit(fails.length ? 1 : 0);
