// The parts of the directory personalisation that are pure functions: which language a
// visitor probably wants, what evidence we have that a business has served someone in it,
// and the order that produces.
//
// Kept out of useDirectory.js so they can be tested on their own, with no React and no
// DOM. See useDirectory.test.mjs. The hook is a thin wrapper around these.

export const SUPPORTED_PREF_LANGS = ['en', 'no', 'sv', 'da', 'de', 'fr', 'nl', 'fi'];

// The language a visitor most likely wants help in, before they tell us. The site locale
// is the best guess we have, and English is the honest default for everyone else.
export function defaultPrefLang(locale) {
  return SUPPORTED_PREF_LANGS.includes(locale) ? locale : 'en';
}

// Evidence that this business has served someone in `want`.
// Three states, deliberately: reviewed in that language, mentioned in a review, or
// nothing. "Nothing" is not "no". The page has to say so.
export function evidenceFor(provider, want) {
  if (!provider || !want) return null;
  const langs = provider.fit_langs || {};
  if (langs[want] > 0) return { kind: 'reviewed_in', count: langs[want] };
  // English is the fallback lingua franca. A Norwegian owner will take an English speaking
  // plumber, so a business reviewed in English is still a useful answer for them, marked
  // as the weaker thing it is.
  if (want !== 'en' && langs.en > 0) return { kind: 'reviewed_in_english', count: langs.en };
  const ev = (provider.fit_evidence || {}).language;
  if (ev) return { kind: 'mentioned', quote: ev.quote };
  return null;
}

const EVIDENCE_WEIGHT = { reviewed_in: 3, reviewed_in_english: 2, mentioned: 1 };

// Re-rank so businesses with evidence in the visitor's language come first, without
// throwing away the review ranking underneath. A business with no language evidence is
// not pushed to the bottom, it just loses the boost, because a plumber with 400 reviews
// and no foreign customers yet is still probably a good plumber.
export function rankForLanguage(providers, want) {
  const scored = providers.map((p, i) => {
    const ev = evidenceFor(p, want);
    const boost = ev ? EVIDENCE_WEIGHT[ev.kind] || 0 : 0;
    return { p, ev, boost, original: i, score: Number(p.score) || 0 };
  });
  scored.sort((a, b) => (b.boost - a.boost) || (b.score - a.score) || (a.original - b.original));
  return scored;
}
