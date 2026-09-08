// Tests for the personalisation logic. The hook itself needs React, so the two pure
// functions that decide what a visitor sees are exported separately and tested here.
//
// What is being protected: the order results appear in, and the three-state answer to
// "has this business served someone who speaks my language". The third state is "we do
// not know", and collapsing it into "no" is the failure mode that would make the page
// lie by omission.

import { evidenceFor, rankForLanguage, defaultPrefLang, SUPPORTED_PREF_LANGS } from './directory-ranking.js';

let pass = 0, fail = 0;
const eq = (name, got, want) => {
  const good = JSON.stringify(got) === JSON.stringify(want);
  good ? pass++ : (fail++, console.log(`FAIL ${name}\n  got  ${JSON.stringify(got)}\n  want ${JSON.stringify(want)}`));
};
const ok = (name, cond) => { cond ? pass++ : (fail++, console.log(`FAIL ${name}`)); };

const p = (name, score, langs = {}, evidence = {}) =>
  ({ name, score, fit_langs: langs, fit_evidence: evidence });

// --- defaults ------------------------------------------------------------------
eq('a Norwegian visitor defaults to Norwegian', defaultPrefLang('no'), 'no');
eq('a Swedish visitor defaults to Swedish', defaultPrefLang('sv'), 'sv');
eq('an unsupported locale defaults to English', defaultPrefLang('pt'), 'en');
eq('no locale defaults to English', defaultPrefLang(undefined), 'en');
ok('Danish and Finnish are offered even without a site locale',
  SUPPORTED_PREF_LANGS.includes('da') && SUPPORTED_PREF_LANGS.includes('fi'));

// --- the three states of evidence ----------------------------------------------
eq('reviewed in the language asked for',
  evidenceFor(p('a', 5, { no: 2 }), 'no'), { kind: 'reviewed_in', count: 2 });

eq('reviewed in English is the weaker fallback for a Norwegian',
  evidenceFor(p('b', 5, { en: 3 }), 'no'), { kind: 'reviewed_in_english', count: 3 });

eq('for an English speaker, English is the primary match not the fallback',
  evidenceFor(p('c', 5, { en: 3 }), 'en'), { kind: 'reviewed_in', count: 3 });

{
  const ev = evidenceFor(p('d', 5, {}, { language: { quote: 'They spoke English with us' } }), 'no');
  eq('a mention is the weakest state', ev.kind, 'mentioned');
  ok('and it carries its quote', ev.quote.includes('English'));
}

eq('no evidence returns null, which is "we do not know", not "no"',
  evidenceFor(p('e', 5, {}, {}), 'no'), null);
eq('Spanish-only reviews give no evidence', evidenceFor(p('f', 5, {}), 'no'), null);
eq('a missing provider is handled', evidenceFor(null, 'no'), null);
eq('a missing language is handled', evidenceFor(p('g', 5, { no: 1 }), null), null);

// --- ranking --------------------------------------------------------------------
{
  const list = [
    p('best rated, no foreign customers', 4.9),
    p('mid rated, reviewed in Norwegian', 4.5, { no: 2 }),
    p('good rated, reviewed in English', 4.7, { en: 1 }),
  ];
  const order = rankForLanguage(list, 'no').map(r => r.p.name);
  eq('a Norwegian review beats an English one, which beats none',
    order,
    ['mid rated, reviewed in Norwegian', 'good rated, reviewed in English', 'best rated, no foreign customers']);
}

{
  // The rating ranking still decides within a boost band, so we are re-ordering rather
  // than replacing the review ranking.
  const list = [
    p('lower rated with Norwegian', 4.1, { no: 1 }),
    p('higher rated with Norwegian', 4.8, { no: 1 }),
  ];
  eq('within the same evidence band the better reviewed one still wins',
    rankForLanguage(list, 'no').map(r => r.p.name),
    ['higher rated with Norwegian', 'lower rated with Norwegian']);
}

{
  // A business with no foreign evidence must not be buried. It keeps its place among the
  // others that also have none, in rating order.
  const list = [
    p('no evidence, weak', 4.0),
    p('no evidence, strong', 4.9),
    p('evidence', 4.2, { no: 1 }),
  ];
  const order = rankForLanguage(list, 'no').map(r => r.p.name);
  eq('unmatched businesses stay in rating order below the matches',
    order, ['evidence', 'no evidence, strong', 'no evidence, weak']);
}

{
  // Changing the language a visitor asks for changes the order. That is the feature.
  const list = [
    p('Nordic specialist', 4.4, { no: 3 }),
    p('German specialist', 4.4, { de: 3 }),
  ];
  eq('a Norwegian sees the Nordic one first',
    rankForLanguage(list, 'no')[0].p.name, 'Nordic specialist');
  eq('a German sees the German one first',
    rankForLanguage(list, 'de')[0].p.name, 'German specialist');
}

{
  const list = [p('a', 4.5), p('b', 4.9)];
  eq('with no evidence anywhere the order is untouched rating order',
    rankForLanguage(list, 'no').map(r => r.p.name), ['b', 'a']);
  eq('and nothing is reported as matching', rankForLanguage(list, 'no').filter(r => r.ev).length, 0);
}

eq('an empty list ranks to an empty list', rankForLanguage([], 'no'), []);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
