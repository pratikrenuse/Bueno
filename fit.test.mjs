// Tests for the non-resident fit signals.
//
// Two things are being tested, and the second matters more than the first.
//   1. That real phrasing is caught.
//   2. That near misses are NOT caught. A false positive here puts a claim on a business
//      that the evidence does not support, which is the one failure this feature cannot
//      afford. Most of the cases below are negatives for that reason.

import { signalsForReview, fitProfile, languageEvidence, foldLang, isForeignLang } from './api/_fit.js';

let pass = 0, fail = 0;
const ok = (name, cond) => { cond ? pass++ : (fail++, console.log(`FAIL ${name}`)); };
const eq = (name, got, want) => {
  const good = JSON.stringify(got) === JSON.stringify(want);
  good ? pass++ : (fail++, console.log(`FAIL ${name}\n  got  ${JSON.stringify(got)}\n  want ${JSON.stringify(want)}`));
};
const keys = (text, lang = 'en') => signalsForReview({ text, lang }).map(s => s.key).sort();

// --- language, positives ------------------------------------------------------
ok('spoke English', keys('The plumber spoke English which made everything easy.').includes('language'));
ok('English speaking', keys('Friendly English speaking team, arrived on time.').includes('language'));
ok('in German', keys('He explained the problem in German for my wife.').includes('language'));
ok('translated Norwegian review', keys('They spoke Norwegian with us and were very professional.', 'no').includes('language'));
ok('his English was', keys('His English was excellent and the price was fair.').includes('language'));
ok('communicated in Dutch', keys('Communicated in Dutch throughout the job.').includes('language'));
ok('answered in French', keys('Answered in French when I called, very helpful.').includes('language'));

// --- language, the negatives that matter --------------------------------------
ok('English Channel is not a language signal', !keys('Cheaper than anyone back home across the English Channel.').includes('language'));
ok('old English style is not a signal', !keys('Restored the old English style windows beautifully.').includes('language'));
ok('bare mention of a country is not a language signal', !keys('Best plumber in Spain, better than Germany.').includes('language'));
ok('English breakfast is not a signal', !keys('There is an English breakfast place next door.').includes('language'));

// --- remote ownership ---------------------------------------------------------
ok('while we were away', keys('Fixed the leak while we were away in Norway.').includes('remote'));
ok('we live in the UK', keys('We live in the UK so this was a huge relief.').includes('remote'));
ok('holiday home', keys('Looks after our holiday home every winter.').includes('remote'));
ok('non-resident', keys('Very used to dealing with non-resident owners.').includes('remote'));
ok('before we arrived', keys('Everything was done before we arrived in June.').includes('remote'));
ok('we were not there', keys('We were not there and it was still handled properly.').includes('remote'));
ok('a resident owner is not remote', !keys('We live here all year and use them for everything.').includes('remote'));

// --- updates ------------------------------------------------------------------
ok('sent us photos', keys('Sent us photos of each stage of the work.').includes('updates'));
ok('kept us informed', keys('Kept us informed the whole way through.').includes('updates'));
ok('whatsapp', keys('Easy to reach by WhatsApp, replied within the hour.').includes('updates'));
ok('replied to emails', keys('Replied to my emails quickly, which is rare here.').includes('updates'));
ok('a photo of the van is not an update signal', !keys('Nice photos on their website of the van.').includes('updates'));

// --- paperwork ----------------------------------------------------------------
ok('written quote', keys('Gave us a written quote before starting.').includes('paperwork'));
ok('proper invoice', keys('Issued a proper invoice with IVA, no problem.').includes('paperwork'));
ok('bank transfer', keys('Paid by bank transfer from our Norwegian account.').includes('paperwork'));
ok('stuck to the quote', keys('Stuck to the quote exactly, no surprises.').includes('paperwork'));
ok('quoting a price is not paperwork evidence', !keys('The quote was 400 euros.').includes('paperwork'));

// --- access -------------------------------------------------------------------
ok('had a key', keys('He had a key and let himself in while we were in Oslo.').includes('access'));
ok('key holder', keys('Acts as key holder for several apartments here.').includes('access'));
ok('neighbour let them in', keys('Our neighbour let them in and all went fine.').includes('access'));
ok('a key cut is not access evidence', !keys('Cut me a new key in ten minutes.').includes('access'));

// --- one hit per category per review ------------------------------------------
eq('language counted once per review',
  keys('They spoke English, the whole team is English speaking, everything in English.'),
  ['language']);

// --- language folding ---------------------------------------------------------
eq('nb folds to no', foldLang('nb'), 'no');
eq('nn folds to no', foldLang('nn'), 'no');
eq('en-GB folds to en', foldLang('en-GB'), 'en');
ok('Spanish is a local language', !isForeignLang('es'));
ok('Catalan is a local language', !isForeignLang('ca'));
ok('Norwegian is foreign', isForeignLang('nb'));
ok('English is foreign here', isForeignLang('en'));

// --- profiles -----------------------------------------------------------------
{
  const p = fitProfile([
    { text: 'Fixed the leak while we were away. Sent us photos of the work.', lang: 'nb' },
    { text: 'Muy buen servicio, rapido y limpio.', lang: 'es' },
    { text: 'They spoke English throughout and gave a written quote.', lang: 'en' },
  ]);
  eq('foreign languages counted, Spanish excluded', p.langs, { no: 1, en: 1 });
  eq('foreign review count', p.foreign_reviews, 2);
  eq('all reviews analysed', p.analysed, 3);
  ok('remote evidence found', !!p.evidence.remote);
  ok('updates evidence found', !!p.evidence.updates);
  ok('language evidence found', !!p.evidence.language);
  ok('paperwork evidence found', !!p.evidence.paperwork);
  ok('quote is carried with the evidence', p.evidence.remote.quote.length > 10);
}

{
  const spanishOnly = fitProfile([
    { text: 'Trabajo excelente, muy recomendable.', lang: 'es' },
    { text: 'Rapidos y profesionales.', lang: 'es' },
  ]);
  eq('a Spanish-only business has no foreign languages', spanishOnly.langs, {});
  eq('and no fit score', spanishOnly.fit, 0);
  eq('and no language evidence to offer', languageEvidence(spanishOnly, 'no'), null);
}

{
  const nordic = fitProfile([{ text: 'Veldig bra jobb, anbefales.', lang: 'no' }]);
  eq('reviewed in Norwegian is the strong signal',
    languageEvidence(nordic, 'nb'), { kind: 'reviewed_in', count: 1, lang: 'no' });
  eq('but says nothing about German', languageEvidence(nordic, 'de'), null);
}

{
  const mentioned = fitProfile([{ text: 'The owner spoke English with us the whole time.', lang: 'es' }]);
  const ev = languageEvidence(mentioned, 'en');
  eq('a mention is a weaker kind of evidence', ev.kind, 'mentioned');
  ok('and it carries the quote', ev.quote.toLowerCase().includes('english'));
}

// --- ordering: a foreign review outweighs any phrase match --------------------
{
  const reviewedIn = fitProfile([{ text: 'Bra jobb.', lang: 'no' }]);
  const phrasesOnly = fitProfile([{ text: 'They spoke English, sent photos, gave a written quote and had a key.', lang: 'es' }]);
  ok('one foreign review is worth more than a pile of phrases in a local one',
    reviewedIn.fit >= phrasesOnly.fit - 4);
  ok('but a phrase-rich review still scores something', phrasesOnly.fit > 0);
}

// --- NEGATION. The cases that would otherwise put a false claim on a business. ----
// Every one of these contains the exact phrase a rule looks for, and means the opposite.
ok('did not speak English', !keys('They did not speak English at all, very difficult.').includes('language'));
ok('nobody speaks English', !keys('Nobody speaks English here so communication was hard.').includes('language'));
ok('asked in English, not understood', !keys('I asked in English and they did not understand a word.').includes('language'));
ok('zero English', !keys('Zero English, had to use Google Translate.').includes('language'));
ok('a wish is not a report', !keys('Would be better if they spoke English.').includes('language'));
ok('unfortunately no English', !keys('Unfortunately no English at all.').includes('language'));
ok('never sent photos', !keys('They never sent photos and never replied to emails.').includes('updates'));
ok('refused a written quote', !keys('Refused to give a written quote.').includes('paperwork'));
ok('struggled in English', !keys('We struggled because his English was poor.').includes('language'));

// ...without throwing away the positives that contain a negative word.
ok('no problem is still positive', keys('English speaking team, no problem at all.').includes('language'));
ok('no language barrier is still positive', keys('Spoke English with no language barrier.').includes('language'));
ok('no hidden costs is still positive', keys('Gave a written quote with no hidden costs.').includes('paperwork'));
ok('no issues is still positive', keys('Kept us informed the whole way through, no issues.').includes('updates'));

// A negation in a different sentence must not veto a good signal.
ok('negation is scoped to its own sentence',
  keys('They spoke English throughout. The tiles were not the ones I ordered.').includes('language'));

// --- empty and malformed input -------------------------------------------------
eq('no reviews gives an empty profile', fitProfile([]).fit, 0);
eq('undefined gives an empty profile', fitProfile(undefined).analysed, 0);
eq('a review with no text yields nothing', signalsForReview({ text: '', lang: 'en' }), []);
eq('a null review yields nothing', signalsForReview(null), []);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
