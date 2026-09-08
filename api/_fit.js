// Non-resident fit signals, derived from the reviews we already fetch and display.
//
// WHY THIS EXISTS
// A foreign owner does not want the best plumber in Javea. They want the best plumber in
// Javea who will answer the phone in a language they speak, and who has dealt before with
// someone who is not standing in the property. Google ranks for neither. The reviews do
// carry both signals, and we already pay for them.
//
// THE HONESTY RULE, WHICH GOVERNS THIS WHOLE FILE
// Nothing here establishes a fact about a business. A business that has been reviewed in
// Norwegian has probably served a Norwegian customer. It has not told us it speaks
// Norwegian, and we must never write that it does. Every signal this file produces is
// EVIDENCE, carries the quote it came from, and is rendered as "a reviewer mentions",
// never as "speaks". If you are tempted to shorten a label to "English spoken", stop.
//
// HOW THE LANGUAGE TRICK WORKS
// We ask Google for reviews in English, so `text` is Google's English translation and
// `originalText` is what the reviewer actually typed. That gives us two different things
// from one call:
//   1. `originalText.languageCode` is the language the customer wrote in. A Norwegian
//      review is a Norwegian customer. That is the strongest signal on the page.
//   2. `text` is English whatever the source language, so ONE set of English patterns
//      catches a phrase in any of them. "De snakket engelsk med oss" arrives as "They
//      spoke English with us" and matches the same rule as an English reviewer saying it.
//
// SCOPE AND STORAGE
// These signals are derived from Places content, stored in the same cell as the reviews
// they came from, and expire with it on the same 30 day clock. They are only ever shown
// next to the review that produced them, with Google's attribution intact. See
// DIRECTORY_RUNBOOK.md for the terms this has to sit inside.

// Languages we can say something useful about. Keyed by the ISO code Google returns.
export const LANGUAGES = {
  en: { label: 'English', native: 'English' },
  no: { label: 'Norwegian', native: 'Norsk' },
  nb: { label: 'Norwegian', native: 'Norsk' },
  nn: { label: 'Norwegian', native: 'Norsk' },
  sv: { label: 'Swedish', native: 'Svenska' },
  da: { label: 'Danish', native: 'Dansk' },
  de: { label: 'German', native: 'Deutsch' },
  fr: { label: 'French', native: 'Francais' },
  nl: { label: 'Dutch', native: 'Nederlands' },
  fi: { label: 'Finnish', native: 'Suomi' },
  it: { label: 'Italian', native: 'Italiano' },
  es: { label: 'Spanish', native: 'Espanol' },
  ca: { label: 'Catalan', native: 'Catala' },
  ru: { label: 'Russian', native: 'Russkiy' },
  pl: { label: 'Polish', native: 'Polski' },
};

// Norwegian arrives as no, nb or nn depending on the reviewer. They are one language to
// a person choosing a plumber, so they are folded together before anything counts them.
const FOLD = { nb: 'no', nn: 'no' };
export const foldLang = (code) => {
  if (!code) return null;
  const base = String(code).toLowerCase().split('-')[0];
  return FOLD[base] || base;
};

// Spanish and Catalan are the local languages. A Spanish review is the default case and
// says nothing about whether a foreign owner will be understood, so it is never counted
// as a foreign-language signal.
const LOCAL = new Set(['es', 'ca', 'gl', 'eu']);
export const isForeignLang = (code) => {
  const f = foldLang(code);
  return !!f && !LOCAL.has(f);
};

// Phrases that appear in the ENGLISH TRANSLATION of a review. Order matters only for
// readability; every rule is tested against every review.
//
// Each rule is deliberately narrow. A pattern that fires on "English" alone would match
// "English Channel" and "old English style", so the patterns require the verb or the
// preposition that makes the meaning unambiguous. Precision beats recall here: a missed
// signal costs nothing, a wrong one costs trust.
const NAMED_LANGS = 'english|norwegian|swedish|danish|german|french|dutch|finnish|italian';

const RULES = [
  {
    key: 'language',
    // "spoke English", "speaks perfect English", "in English", "English speaking",
    // "communicated in German", "answered in Norwegian", "his English was excellent"
    patterns: [
      new RegExp(`\\b(?:speak|speaks|spoke|speaking|talk|talked|communicat\\w*|answer\\w*|repl\\w*|explain\\w*|wrote|writes|write)\\b[^.!?]{0,40}\\b(${NAMED_LANGS})\\b`, 'i'),
      new RegExp(`\\b(${NAMED_LANGS})[ -]speaking\\b`, 'i'),
      new RegExp(`\\bin (${NAMED_LANGS})\\b`, 'i'),
      new RegExp(`\\b(?:his|her|their|the)\\s+(${NAMED_LANGS})\\s+(?:was|is)\\b`, 'i'),
      new RegExp(`\\bno problem\\b[^.!?]{0,30}\\b(${NAMED_LANGS})\\b`, 'i'),
    ],
  },
  {
    key: 'remote',
    // The owner was not in the country, and it still worked.
    patterns: [
      { re: /\b(?:while|whilst)\s+(?:we|i)\s+(?:were|was)\s+(?:away|abroad|back home|in the uk|not there|out of the country)\b/i, ownNegation: true },
      // Self-negating on purpose: "we were not there" IS the signal, so the negation
      // guard must not veto it. Marked, rather than special-cased inside the guard.
      { re: /\b(?:we|i)\s+(?:were|was|am|are)\s+(?:not|n't)\s+(?:in spain|there|in the country|present)\b/i, ownNegation: true },
      /\b(?:we|i)\s+live\s+in\s+(?:the\s+)?(?:uk|england|scotland|wales|ireland|norway|sweden|denmark|germany|france|holland|netherlands|belgium|finland)\b/i,
      /\b(?:from|based in)\s+(?:the\s+)?(?:uk|norway|sweden|denmark|germany|france|netherlands|belgium|finland)\b/i,
      /\b(?:holiday|vacation|summer|second)\s+(?:home|house|apartment|flat|property)\b/i,
      /\bnon[- ]resident\b/i,
      /\b(?:before|until|when)\s+(?:we|i)\s+(?:arrive|arrived|got there|came out|flew out|return|returned)\b/i,
    ],
  },
  {
    key: 'updates',
    // Kept an absent owner informed. For someone a thousand miles away this is the whole
    // service, and it is invisible in a star rating.
    patterns: [
      /\bsent\s+(?:us|me)\s+(?:photos|pictures|photographs|videos|images|updates)\b/i,
      /\b(?:photos|pictures|video)\s+(?:of|by)\s+(?:the|each|every)\s+(?:work|job|stage|progress|repair)\b/i,
      /\bkept\s+(?:us|me)\s+(?:informed|updated|posted|in the loop)\b/i,
      /\b(?:updated|informed)\s+(?:us|me)\s+(?:daily|regularly|throughout|every step|at every)\b/i,
      /\b(?:by|via|over)\s+whatsapp\b/i,
      /\breplied?\s+(?:to (?:my|our) )?(?:email|message|whatsapp|text)s?\b/i,
    ],
  },
  {
    key: 'paperwork',
    // A written quote, a real invoice, payment by transfer. Non-residents need the paper
    // trail for tax and cannot settle in cash on the doorstep.
    patterns: [
      /\b(?:written|detailed|itemised|itemized|clear|proper)\s+(?:quote|quotation|estimate|invoice|bill)\b/i,
      /\b(?:quote|quotation|estimate|invoice|factura)\b[^.!?]{0,30}\b(?:in advance|beforehand|up front|by email|in writing)\b/i,
      /\b(?:bank\s+transfer|paid\s+(?:by|via)\s+transfer|invoiced\s+(?:us|me))\b/i,
      /\bno\s+(?:hidden|extra|surprise)\s+(?:costs?|charges?|fees?)\b/i,
      /\bstuck\s+to\s+the\s+(?:quote|price|estimate)\b/i,
    ],
  },
  {
    key: 'access',
    // Somebody let them in. Key holding, a neighbour, the administrador. The practical
    // problem of a locked empty house.
    patterns: [
      /\b(?:had|has|held|kept|took)\s+(?:a|the|our|my)\s+key\b/i,
      /\bkey[- ]?(?:holder|holding)\b/i,
      /\b(?:our|my|the)\s+neighbour\s+(?:let|gave|opened|met)\b/i,
      /\b(?:let|met)\s+(?:them|him|her)\s+in\b/i,
      /\b(?:administrador|community|concierge|caretaker)\b[^.!?]{0,20}\b(?:let|gave|opened)\b/i,
    ],
  },
];

// NEGATION, and why this is the most important function in the file.
//
// "They spoke English" and "They did not speak English at all" both contain the phrase
// the language rule looks for. Without this check the second one puts a positive language
// badge on a business whose reviewer was complaining about exactly that. That is not a
// missed signal, it is a false claim, and it is the one failure this feature cannot
// afford. The same applies to every other category: "never sent photos", "no written
// quote", "would not give an invoice".
//
// The approach is deliberately blunt. Isolate the sentence the match sits in, remove the
// fixed phrases where a negative word carries a positive meaning ("no problem", "no
// language barrier"), and if any negation or conditional cue survives, throw the match
// away. Blunt costs us some true positives. That is the right side to be wrong on.
const POSITIVE_NEGATIVES = /\bno(?:t)?\s+(?:a\s+)?(?:problem|issue|issues|trouble|bother|hassle|language barrier|barrier|delay|delays|extra|hidden|surprise)\w*/gi;

const NEGATION = /\b(?:not|n't|never|nobody|no one|none|zero|hardly|barely|without|lacks?|lacking|unable|cannot|couldn|didn|doesn|don|wasn|weren|isn|aren|struggl\w*|difficult|poor|awful|terrible|refus\w*|unfortunately|sadly|shame|disappoint\w*)\b/i;

// A wish or a suggestion is not a report of what happened.
const CONDITIONAL = /\b(?:would|should|could)\s+(?:be|have|had|speak|send|give|provide)\b|\bwish\w*\b|\bif only\b|\bhopefully\b|\bexpected\s+(?:them|him|her)\s+to\b/i;

// The sentence the match sits in, so a negation three sentences away does not veto a
// perfectly good signal.
function sentenceAround(text, index) {
  const before = text.lastIndexOf('.', index);
  const q = Math.max(text.lastIndexOf('!', index), text.lastIndexOf('?', index));
  const start = Math.max(before, q) + 1;
  const nextCandidates = ['.', '!', '?']
    .map(ch => text.indexOf(ch, index))
    .filter(i => i !== -1);
  const end = nextCandidates.length ? Math.min(...nextCandidates) + 1 : text.length;
  return text.slice(start, end);
}

export function isNegated(text, index) {
  const sentence = sentenceAround(String(text), index).replace(POSITIVE_NEGATIVES, ' ');
  return NEGATION.test(sentence) || CONDITIONAL.test(sentence);
}

// Cut a readable fragment around the match so the page can quote the evidence rather
// than assert the conclusion.
function snippet(text, match, width = 90) {
  const at = match.index ?? 0;
  const start = Math.max(0, at - Math.floor(width / 3));
  const end = Math.min(text.length, at + match[0].length + Math.floor((width * 2) / 3));
  let s = text.slice(start, end).trim();
  if (start > 0) s = `...${s}`;
  if (end < text.length) s = `${s}...`;
  return s;
}

// Run the rules over one review. Returns at most one hit per category, because three
// hits for "language" in one review is still one review mentioning language.
export function signalsForReview(review) {
  const text = String((review && review.text) || '');
  if (!text) return [];
  const out = [];
  for (const rule of RULES) {
    for (const p of rule.patterns) {
      // A pattern is either a bare regex, or an object that can opt out of the negation
      // guard because the negative word is part of the signal it is looking for.
      const re = p instanceof RegExp ? p : p.re;
      const ownNegation = p instanceof RegExp ? false : !!p.ownNegation;
      const m = re.exec(text);
      if (m && (ownNegation || !isNegated(text, m.index))) {
        out.push({ key: rule.key, quote: snippet(text, m), lang: foldLang(review.lang) });
        break;
      }
    }
  }
  return out;
}

// Build the whole fit profile for one business.
//
// `reviews` are the shaped reviews, ALL of them, not only the three the card shows. The
// caller keeps up to five for analysis and shows three, which doubles this signal for no
// extra Google spend.
export function fitProfile(reviews) {
  const list = Array.isArray(reviews) ? reviews : [];

  // Languages reviews were actually written in, foreign ones only.
  const langCounts = {};
  for (const r of list) {
    const f = foldLang(r.lang);
    if (f && isForeignLang(f)) langCounts[f] = (langCounts[f] || 0) + 1;
  }

  // Evidence, grouped by category, each keeping the first quote that produced it.
  const evidence = {};
  for (const r of list) {
    for (const s of signalsForReview(r)) {
      if (!evidence[s.key]) evidence[s.key] = { count: 0, quote: s.quote, lang: s.lang };
      evidence[s.key].count += 1;
    }
  }

  // A single number for ordering only, never shown as a score. It is deliberately coarse:
  // being reviewed in a foreign language is worth more than any phrase match, because a
  // review written in Norwegian is a Norwegian customer and a phrase is an inference.
  const foreignReviews = Object.values(langCounts).reduce((a, b) => a + b, 0);
  const fitScore = foreignReviews * 3
    + (evidence.language ? 2 : 0)
    + (evidence.remote ? 2 : 0)
    + (evidence.updates ? 1 : 0)
    + (evidence.paperwork ? 1 : 0)
    + (evidence.access ? 1 : 0);

  return {
    langs: langCounts,
    foreign_reviews: foreignReviews,
    analysed: list.length,
    evidence,
    fit: fitScore,
  };
}

// Does this business have evidence of serving someone who speaks `want`?
// Returns null when we have nothing, rather than false, because "we do not know" and
// "no" are different answers and the page says so.
export function languageEvidence(profile, want) {
  const w = foldLang(want);
  if (!w || !profile) return null;
  const n = (profile.langs && profile.langs[w]) || 0;
  if (n > 0) return { kind: 'reviewed_in', count: n, lang: w };
  const ev = profile.evidence && profile.evidence.language;
  if (ev) return { kind: 'mentioned', quote: ev.quote, lang: w };
  return null;
}
