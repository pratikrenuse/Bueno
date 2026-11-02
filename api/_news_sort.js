// Claude reads a newsletter, splits it into stories and decides which ones matter to people
// who own (or are buying) a home in Spain. Kept stories come back as a short English post
// for the Spain 24/7 WhatsApp channels, written in our own words. Translation into the five
// other channel languages happens only when a story is approved, so a rejected story costs
// nothing and an edited one is translated from the edit.

export const CHANNEL_LANGS = ['en', 'no', 'sv', 'de', 'fr', 'nl'];
const LANG_NAME = { no: 'Norwegian (Bokmål)', sv: 'Swedish', de: 'German', fr: 'French', nl: 'Dutch' };
const LANG_RULES = {
  no: 'address the reader as "du"; thousands with a space (49 319), decimals with a comma, a non-breaking space before % (3,4 %)',
  sv: 'address the reader as "du"; thousands with a space (49 319), decimals with a comma, a space before % (3,4 %)',
  de: 'address the reader as "Sie"; thousands with a period (49.319), decimals with a comma, a space before % (3,4 %)',
  fr: 'address the reader as "vous"; thousands with a space (49 319), decimals with a comma, a space before % (3,4 %)',
  nl: 'address the reader as "u"; thousands with a period (49.319), decimals with a comma, no space before % (3,4%)',
};

export const getApiKey = () =>
  process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_KEY || '';

// Tried in order. A model name the account does not have answers 404, and the next is tried,
// so a renamed model never stops the digest.
const models = () => [...new Set([
  process.env.NEWS_MODEL, 'claude-sonnet-5-5', process.env.TRANSLATE_MODEL, 'claude-sonnet-4-5',
].filter(Boolean))];

export async function callClaude(prompt, { maxTokens = 6000 } = {}) {
  const apiKey = getApiKey();
  if (!apiKey) return { ok: false, error: 'Missing env var: ANTHROPIC_API_KEY.' };
  let last = '';
  for (const model of models()) {
    let r, j;
    try {
      r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({ model, max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] }),
      });
      j = await r.json().catch(() => ({}));
    } catch (e) {
      return { ok: false, error: `Claude API request failed: ${String((e && e.message) || e)}` };
    }
    if (r.ok) {
      const text = (j.content || []).map(c => c.text || '').join('').trim();
      return { ok: true, text, model, stop: j.stop_reason };
    }
    last = `Claude API ${r.status} (${model}): ${JSON.stringify(j).slice(0, 300)}`;
    const notFound = r.status === 404 || (r.status === 400 && /model/i.test(JSON.stringify(j)));
    if (!notFound) break;
  }
  return { ok: false, error: last };
}

export function parseJson(raw) {
  const s = String(raw || '');
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  try { return JSON.parse(s.slice(start, end + 1)); } catch { return null; }
}

// House rules that are checked in code, not trusted to the model.
export const BANNED = /\b(Sabadell|BBVA|CaixaBank|Santander|Unicaja|Bankinter|ING|Iberdrola|Naturgy|Endesa|Repsol|Revolut|Wise)\b/;
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu;
export const clean = (s) => String(s || '')
  .replace(/\s*[\u2014\u2013]\s*/g, ', ')
  .replace(EMOJI, '')
  .replace(/[ \t]+\n/g, '\n')
  .trim();

export function sortPrompt({ text, subject, source, recentTitles = [] }) {
  return `You are the editor of Spain 24/7, a free information service for foreigners who own a home in Spain or are buying one. Most readers are Norwegian, Swedish, German, Dutch, French or British, aged 40 to 70, and many do not live in Spain all year.

Below is today's "${subject || 'newsletter'}" email from ${source || 'a Spanish property newsletter'}, in Spanish. Split it into its separate stories (ignore the header, the subscriber count, adverts marked "Publicidad", the "most viewed homes" box and the footer) and decide for each one whether it is worth a short post in our WhatsApp channels.

KEEP a story when it changes something for, or tells something useful to, a foreign owner or buyer:
- laws, taxes, decrees, court rulings and rules on buying, owning, selling, letting, holiday lets, inheritance, community fees, squatting, insurance, utilities or residence
- national or regional market data: prices, sales, rents, mortgage figures, housing supply, especially in areas foreigners own in (the Costas, the Balearic and Canary Islands, Valencia, Alicante, Málaga, Murcia, Catalonia, Andalusia, Madrid)
- political proposals that would affect owners, but only as proposals

DROP: celebrity and luxury homes, single listings, homes outside Spain, foreign countries' housing politics, company deals and corporate finance, appointments and reshuffles, curiosities, sport, adverts, any story that is mainly a specific bank's or company's product, and anything marked as a rumour unless it is a policy proposal that would affect owners.

${recentTitles.length ? `These stories were already handled in the last few days. If one appears again with nothing new, DROP it with the reason "already covered":\n${recentTitles.map(t => `- ${t}`).join('\n')}\n` : ''}
For each KEPT story write "post": the English text for the channel. Rules, all mandatory:
- 2 to 4 short sentences, plain and calm, the way a well-informed friend would say it out loud. Complete natural sentences only.
- Our own words. Never copy or closely paraphrase the newsletter's sentences.
- Keep every figure, date and percentage exactly as in the story. Do not add any fact that is not in the story.
- Say where the figure or decision comes from, using the original source the story names (for example "according to Spain's notaries", "according to the General Council of the Judiciary", "according to idealista's own data").
- A proposal, a candidate's promise, a draft or anything not yet in force must be called a proposal in the post, and the post must say it is not law yet. Spain holds a general election on 29 November 2026 if that is relevant.
- Say in the post why it matters to someone who owns or is buying a home in Spain, when that is not obvious.
- Never name a bank, an energy company or any other company. No em dashes or en dashes, no emojis, no hashtags, no links, no exclamation marks, no fear or penalty-based urgency. Never mention Bueno.

Return ONLY valid JSON in this exact shape, one entry per story in the order they appear:
{"stories":[{"title_es":"<the Spanish headline>","title_en":"<a short English headline in our words>","link":"<the story's link token, for example L3, if there is one, else empty>","category":"<one of: tax-and-law, market, letting, buying-selling, squatting, politics, other>","keep":true,"score":<1 to 5, how useful to our readers>,"is_proposal":<true if it is not yet law>,"reason":"<one plain sentence saying why it was kept or dropped>","post":"<the English post, or empty when dropped>"}]}

The email:
${text}`;
}

// Newsletter links are long tracking URLs (300+ characters each). Sent as they are, they
// double the size of Claude's answer and can cut it off mid-way. Each one is swapped for a
// short token before Claude reads the email, and swapped back afterwards.
export function shortenLinks(text) {
  const links = {};
  let n = 0;
  const out = String(text || '').replace(/\[link: (https?:\/\/[^\]\s]+)\]/g, (_, url) => {
    n += 1;
    links[`L${n}`] = url;
    return `[link: L${n}]`;
  });
  return { text: out, links };
}

export function normaliseStories(parsed, links = {}) {
  const list = (parsed && Array.isArray(parsed.stories)) ? parsed.stories : [];
  return list.map((s, i) => {
    const post = clean(s.post);
    let keep = !!s.keep && !!post;
    let reason = clean(s.reason);
    if (keep && BANNED.test(post)) { keep = false; reason = 'Dropped because the post would name a company, which our posts never do.'; }
    const raw = String(s.link || '').trim();
    const link = links[raw] || links[raw.replace(/^\[?link:\s*/i, '').replace(/\]$/, '')] || raw;
    return {
      position: i,
      title_es: clean(s.title_es).slice(0, 300),
      title_en: clean(s.title_en).slice(0, 200),
      link: /^https?:\/\//i.test(link) ? link : null,
      category: String(s.category || 'other').slice(0, 40),
      keep,
      score: Math.max(1, Math.min(5, Number(s.score) || 1)),
      is_proposal: !!s.is_proposal,
      reason: reason.slice(0, 500),
      en: keep ? post : null,
    };
  });
}

export async function sortStories(input) {
  const short = shortenLinks(input.text);
  const r = await callClaude(sortPrompt({ ...input, text: short.text }), { maxTokens: 16000 });
  if (!r.ok) return r;
  if (r.stop === 'max_tokens') return { ok: false, error: 'Claude\'s answer was cut off because the email was too long.' };
  const parsed = parseJson(r.text);
  if (!parsed) return { ok: false, error: `Could not read Claude's answer: ${r.text.slice(-200)}` };
  const stories = normaliseStories(parsed, short.links);
  if (!stories.length) return { ok: false, error: 'Claude found no stories in this email.' };
  return { ok: true, stories, model: r.model };
}

export function translatePrompt(en, isProposal) {
  return `Translate this short WhatsApp channel post for people who own a home in Spain into Norwegian, Swedish, German, French and Dutch.

Rules, all mandatory:
- Natural, calm, spoken register, as a native speaker who knows Spanish property would write it. Not word for word.
- Keep every figure, date, percentage and name exactly. Keep Spanish terms such as IBI, NIE, Modelo 210 and plusvalía as they are.
- Number style per language: ${Object.entries(LANG_RULES).map(([k, v]) => `${LANG_NAME[k]}: ${v}`).join('; ')}.
- Keep the same sentences and paragraph breaks. No em dashes or en dashes, no emojis, no hashtags.${isProposal ? '\n- The English says this is only a proposal and not law yet. Every translation must say that just as clearly.' : ''}

Return ONLY valid JSON: {"no":"...","sv":"...","de":"...","fr":"...","nl":"..."}

English post:
${en}`;
}

export async function translateItem(en, isProposal = false) {
  const r = await callClaude(translatePrompt(en, isProposal), { maxTokens: 4000 });
  if (!r.ok) return r;
  const j = parseJson(r.text);
  const out = {};
  for (const l of CHANNEL_LANGS.filter(x => x !== 'en')) {
    if (!j || !j[l] || !String(j[l]).trim()) return { ok: false, error: `The ${LANG_NAME[l]} translation came back empty.` };
    out[l] = clean(j[l]);
  }
  return { ok: true, translations: out, model: r.model };
}
