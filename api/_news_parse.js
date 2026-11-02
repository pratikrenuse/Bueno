// Turning a received newsletter into clean text Claude can read.
//
// Resend hands back the HTML of a received email, sometimes as a data: URI, and the text part
// is often null. idealista's emails also carry long runs of invisible padding characters
// (U+034F, U+200C, soft hyphens) after the preheader. All of that is stripped here, and every
// "Leer más" link is kept next to its story as [link: URL] so the review page can point at
// the original article.

// Senders whose emails are processed. Anything else that reaches the receiving address is
// stored as "ignored" and never sent to Claude. NEWS_ALLOWED_SENDERS (comma separated domains)
// adds more without a code change.
const BUILT_IN_SENDERS = ['idealista.com'];
export function allowedSenders() {
  const extra = String(process.env.NEWS_ALLOWED_SENDERS || '')
    .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  return [...BUILT_IN_SENDERS, ...extra];
}
export function addressOf(from) {
  const m = String(from || '').match(/<([^>]+)>/);
  return (m ? m[1] : String(from || '')).trim().toLowerCase();
}
export function isAllowedSender(from) {
  const addr = addressOf(from);
  const domain = addr.split('@')[1] || '';
  return allowedSenders().some(d => domain === d || domain.endsWith(`.${d}`));
}
export function sourceOf(from) {
  const domain = (addressOf(from).split('@')[1] || '').toLowerCase();
  if (domain.endsWith('idealista.com')) return 'idealista';
  return domain.split('.').slice(-2, -1)[0] || 'newsletter';
}

export function decodeDataUri(s) {
  const str = String(s || '');
  if (!str.startsWith('data:')) return str;
  const comma = str.indexOf(',');
  if (comma === -1) return '';
  const meta = str.slice(5, comma);
  const payload = str.slice(comma + 1);
  try {
    if (/;base64/i.test(meta)) return Buffer.from(payload, 'base64').toString('utf8');
    return decodeURIComponent(payload);
  } catch { return payload; }
}

const NAMED = {
  nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", ndash: '-', mdash: '-',
  hellip: '...', euro: '€', laquo: '«', raquo: '»', ldquo: '"', rdquo: '"', lsquo: "'", rsquo: "'",
  iquest: '¿', iexcl: '¡', ordm: 'º', ordf: 'ª', middot: '·', bull: '·', shy: '', zwnj: '', zwj: '',
  aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú', ntilde: 'ñ', uuml: 'ü',
  Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú', Ntilde: 'Ñ', Uuml: 'Ü',
  agrave: 'à', egrave: 'è', ograve: 'ò', ccedil: 'ç', Ccedil: 'Ç', copy: '©', reg: '®',
};
export function decodeEntities(s) {
  return String(s || '')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => safeChar(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => safeChar(parseInt(d, 10)))
    .replace(/&([a-z]+);/gi, (m, n) => (n in NAMED ? NAMED[n] : m));
}
function safeChar(code) {
  try { return String.fromCodePoint(code); } catch { return ''; }
}

// Characters used as invisible preheader padding. None of them carries meaning.
const INVISIBLE = /[\u00AD\u034F\u061C\u115F\u1160\u17B4\u17B5\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF\u3164]/g;

export function htmlToText(html) {
  let h = String(html || '');
  h = h.replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(head|style|script|title)[^>]*>[\s\S]*?<\/\1>/gi, ' ');
  // Keep article links next to their text.
  h = h.replace(/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, inner) => {
    const label = inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const url = decodeEntities(href).trim();
    if (!/^https?:\/\//i.test(url)) return ` ${label} `;
    if (/leer m[aá]s|read more|ver m[aá]s|accede/i.test(decodeEntities(label))) return ` ${label} [link: ${url}] `;
    return ` ${label} `;
  });
  h = h.replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|tr|li|h[1-6]|table|section|article)>/gi, '\n')
    .replace(/<(p|div|tr|li|h[1-6])\b[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');
  return tidy(decodeEntities(h));
}

export function tidy(text) {
  return String(text || '')
    .replace(INVISIBLE, '')
    .replace(/\r/g, '')
    .replace(/[ \t\u00A0\u2000-\u200A\u202F\u205F\u3000]+/g, ' ')
    .split('\n').map(l => l.trim()).join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// The text Claude reads. Prefer HTML (it carries the links), fall back to the text part.
export const MAX_CHARS = 30000;
export function emailText({ html, text, html_format } = {}) {
  let out = '';
  if (html) out = htmlToText(html_format === 'data_uri' || String(html).startsWith('data:') ? decodeDataUri(html) : html);
  if (!out && text) out = tidy(decodeEntities(text));
  // Footer boilerplate after the copyright line is never a story.
  const cut = out.search(/©\s*\d{4}|Para dejar de recibir/i);
  if (cut > 500) out = out.slice(0, cut).trim();
  return out.slice(0, MAX_CHARS);
}
