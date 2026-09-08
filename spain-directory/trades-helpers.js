// Small pure helpers for the trades directory page.
//
// Everything shared with /spain-professionals lives in useDirectory.js and
// directory-ranking.js. What is here is specific to how THIS page shows a result: one
// review per business, at most, and only the review that actually carries the evidence.
//
// The old shared page showed up to three reviews per business. That is a reading
// experience. This page is for someone whose ceiling is leaking, so a quote only earns
// its place if it is the thing the language label or a fit signal came from.

// Norwegian arrives from Google as no, nb or nn. They are one language to a person
// choosing a plumber. Mirrors foldLang in api/_fit.js, kept as four lines here rather
// than importing the server file so the client bundle does not carry the rule engine.
const FOLD = { nb: 'no', nn: 'no' };

export function foldLang(code) {
  if (!code) return null;
  const base = String(code).toLowerCase().split('-')[0];
  return FOLD[base] || base;
}

// api/_fit.js wraps a snippet in leading and trailing ellipses. Strip them so the
// fragment can be matched back against the review text it was cut from.
function core(quote) {
  return String(quote || '').replace(/^\.{3}/, '').replace(/\.{3}$/, '').trim();
}

const SIGNAL_ORDER = ['language', 'remote', 'updates', 'paperwork', 'access'];

// The one review worth quoting for this business, or null.
//
// Order of preference:
//   1. The review that produced the language label, because that is the label the
//      visitor is here for and they should be able to read it for themselves.
//   2. The review a fit signal was cut from.
//   3. Nothing. A five star review saying "great service" tells a Norwegian owner in
//      Oslo less than the empty space would.
export function pickEvidenceReview(provider, evidence, want) {
  const reviews = Array.isArray(provider && provider.reviews) ? provider.reviews : [];
  if (!reviews.length) return null;

  if (evidence && (evidence.kind === 'reviewed_in' || evidence.kind === 'reviewed_in_english')) {
    const target = evidence.kind === 'reviewed_in' ? foldLang(want) : 'en';
    const hit = reviews.find(r => foldLang(r.lang) === target);
    if (hit) return hit;
  }

  const signals = (provider && provider.fit_evidence) || {};
  for (const key of SIGNAL_ORDER) {
    const fragment = core(signals[key] && signals[key].quote);
    if (fragment.length < 8) continue;
    const hit = reviews.find(r => String((r && r.text) || '').includes(fragment));
    if (hit) return hit;
  }

  return null;
}

// "01", "02", "03". Shown so the position in the list is a fact you can read at a glance
// rather than something you have to count.
export function position(i) {
  return String(i + 1).padStart(2, '0');
}

// tel: wants no spaces. Google returns them formatted for reading.
export function telHref(phone) {
  return `tel:${String(phone || '').replace(/[^\d+]/g, '')}`;
}
