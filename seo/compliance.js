// The compliance line, in code.
//
// No Google Places content may appear in a prerendered static file. No business names, no
// addresses, no phone numbers, no ratings, no review text. Google's terms cap caching of
// Places content at 30 days, and a static file on a CDN indexed by a search engine is in
// practice permanent publication: it would breach the terms and it would be impossible to
// expire.
//
// The listings load client side from /api/directory exactly as they do now. That is both
// compliant and perfectly indexable, because the page still has a unique title, heading and
// body about plumbers in Javea.
//
// These patterns are the mechanical half of that rule. They cannot catch a business name,
// so the real protection is that no code path puts API data into a static file. They exist
// to catch the day somebody adds one.

export const FORBIDDEN = [
  { name: 'international phone number', re: /\+\d{1,3}[\s.\-]?\d[\d\s.\-]{6,}\d/ },
  { name: 'Spanish phone number', re: /\b[6-9]\d{2}[\s.\-]\d{2}[\s.\-]\d{2}[\s.\-]\d{2}\b/ },
  { name: 'grouped phone number', re: /\b\d{3}[\s.\-]\d{3}[\s.\-]\d{3}\b/ },
  { name: 'bare nine digit phone number', re: /\b[6-9]\d{8}\b/ },
  { name: 'tel: link', re: /tel:\+?\d/ },
  { name: 'review credit string', re: /Google reviews from/i },
];

export function assertClean(html, where) {
  for (const f of FORBIDDEN) {
    const m = html.match(f.re);
    if (m) {
      throw new Error(`Google Places data in a static file. ${where} contains what looks like a ${f.name}: ${JSON.stringify(m[0])}`);
    }
  }
}
