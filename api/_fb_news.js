// POST /api/fb?action=news
//
// Turns the useful idealista/news stories into Facebook group posts in this deck.
//
// WHY (5 November 2026)
// Pratik: the idealista digest works well, so its content should now feed this deck as
// well as the WhatsApp channels. Every story the digest kept with a usefulness score of 4 or
// 5 becomes one English post here, waiting for review like any written post. Approving it
// translates it into the six languages (the normal approve path) and puts it in the daily
// queue, where news goes ahead of the evergreen posts because news goes stale.
//
// WHAT IT READS AND WRITES
// Reads news_items and news_emails (the digest's tables, read only, for the story and the
// Spanish text it came from). Writes fb_posts and nothing else, one row per story, keyed
// news-<date>-<story id>. The key is the whole guard against doubles: a second run, or two
// runs at once, can only ever produce a row that already exists and is ignored.
//
// PARKED (5 November 2026)
// Pratik: hold the Facebook side, it is being reworked for the WhatsApp channels and
// Instagram. Nothing calls this route: the digest only pings LinkedIn, and the deck does not
// show or queue news- rows (api/_fb_queue.js still retires any key not in the written posts).
// When it is switched on, the digest should call it after sorting, and the deck should list
// and queue news- rows. One run writes what fits in 40 seconds and calls itself for the rest.
import { gate, rest, readBody } from './_fb_db.js';
import { readNews } from './_fb_db.js';
import { hashOf } from './_fb_translate.js';

export const NEWS_PREFIX = 'news-';
export const isNewsKey = (k) => typeof k === 'string' && k.startsWith(NEWS_PREFIX);
export const MIN_SCORE = 4;
const SITE = 'https://www.247spain.es';
const BUDGET_MS = 40000;

// Plain photographs from studio/photos, published at /photos by the build. No text and no
// logo on them, so the same image is right for every language.
export const PHOTOS = ['g00', 'g01', 'g02', 'g03', 'g04', 'g05', 'g06', 'g07', 'g08', 'g09', 'g10',
  'coast_bay', 'golden_coast', 'marina', 'pool_dusk', 'sunset_village', 'terrace_sunset'];
export const photoFor = (id) => {
  const n = parseInt(hashOf(id).slice(0, 8), 16);
  return `${SITE}/photos/${PHOTOS[n % PHOTOS.length]}.jpg`;
};

// The topic chip in the deck. Never shown in a post.
const TOPIC = {
  'tax-and-law': 'property news, tax and law', market: 'property news, the market',
  letting: 'property news, letting', 'buying-selling': 'property news, buying and selling',
  squatting: 'property news, squatting', politics: 'property news, politics', other: 'property news',
};

export const keyFor = (item) => `${NEWS_PREFIX}${item.received_on}-${String(item.id).slice(0, 8)}`;
export const englishOf = (item) => (item.edited_en && item.edited_en.trim()) ? item.edited_en : (item.en || '');

// The Spanish text of one story, cut from the stored email, so the post is written from the
// source and not only from the short channel summary.
export function passageFor(body, titleEs) {
  const text = String(body || '');
  const head = String(titleEs || '').slice(0, 50);
  const at = head ? text.indexOf(head) : -1;
  if (at === -1) return '';
  const rest = text.slice(at, at + 2400);
  const stop = rest.search(/Leer más|\[link:/);
  return (stop > 0 ? rest.slice(0, stop) : rest).trim();
}

export function newsPrompt(item, spanish) {
  return `You write Facebook posts for groups of people who own a home in Spain or are buying one. Most readers are Norwegian, Swedish, Danish, German, Dutch, French or British, aged 40 to 70, and many do not live in Spain all year. Group admins delete anything promotional, so a post must be so useful that they let it stay.

Write ONE post about this Spanish property news story.

How it must read:
- Open on the reader's own situation or question, not on the news outlet. The first line has to make an owner want to read the second.
- Then what happened, in plain words, with every figure, date and percentage exactly as in the story. Add no fact that is not in the story.
- Then what it means in practice for someone who owns or is buying a home in Spain, and if there is something sensible they can do or check, say it.
- End calmly, on a takeaway, not a question to the group and not a call to action.
- Conversational and human, the way a well-informed friend would explain it at the table. Contractions. Short, uneven sentences. Every sentence complete and natural, never a clipped label.
- 110 to 200 words, in short paragraphs separated by a blank line.
- Say where the figure or decision comes from in general words (the court, the regional government, the European Commission, the Ombudsman, the country's biggest property portal, the notaries). Never name a company, a bank, a portal, a news outlet or a website.
${item.is_proposal ? '- This is a proposal or a promise, not law. The post must say plainly that it is only a proposal and has not changed anything yet. Spain holds a general election on 29 November 2026 if that matters here.\n' : ''}- No link, no hashtags, no emojis, no em dashes or en dashes, no exclamation marks, no fear or penalty-based urgency, no "I built", no mention of Bueno or 24/7 Spain, no claim that the writer owns a property.

Return ONLY valid JSON: {"post":"..."}

Headline: ${item.title_en || item.title_es}
Our short summary: ${englishOf(item)}
${spanish ? `The story in Spanish, from the newsletter:\n${spanish}` : ''}`;
}

const BANNED = /\b(Bueno|idealista|Fotocasa|Sabadell|BBVA|CaixaBank|Santander|Unicaja|Bankinter|ING|Iberdrola|Naturgy|Endesa|Repsol|Revolut|Wise)\b|24\/7|247spain/i;
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu;
export const tidyPost = (s) => String(s || '')
  .replace(/\s*[—–]\s*/g, ', ')
  .replace(EMOJI, '')
  .replace(/!/g, '.')
  .replace(/^#\w+.*$/gm, '')
  .replace(/https?:\/\/\S+|www\.\S+/g, '')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

export function checkPost(text) {
  if (!text || text.split(/\s+/).length < 60) return 'too short';
  if (BANNED.test(text)) return `names ${(text.match(BANNED) || [])[0]}`;
  return null;
}

const models = () => [...new Set([process.env.NEWS_MODEL, 'claude-sonnet-5-5', process.env.TRANSLATE_MODEL, 'claude-sonnet-4-5'].filter(Boolean))];

async function claude(prompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_KEY;
  if (!apiKey) return { ok: false, error: 'Missing env var: ANTHROPIC_API_KEY' };
  let last = '';
  for (const model of models()) {
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({ model, max_tokens: 2000, messages: [{ role: 'user', content: prompt }] }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok) return { ok: true, text: (j.content || []).map(c => c.text || '').join('') };
      last = `Anthropic ${r.status} (${model}): ${JSON.stringify(j).slice(0, 200)}`;
      if (!(r.status === 404 || (r.status === 400 && /model/i.test(JSON.stringify(j))))) break;
    } catch (e) {
      return { ok: false, error: String((e && e.message) || e) };
    }
  }
  return { ok: false, error: last };
}

export async function writePost(item, spanish) {
  const r = await claude(newsPrompt(item, spanish));
  if (!r.ok) return r;
  const s = r.text.indexOf('{');
  const e = r.text.lastIndexOf('}');
  let post = '';
  try { post = JSON.parse(r.text.slice(s, e + 1)).post; } catch { return { ok: false, error: 'Could not read the answer.' }; }
  post = tidyPost(post);
  const problem = checkPost(post);
  if (problem) return { ok: false, error: `The post was not usable: ${problem}.` };
  return { ok: true, post };
}

// Every row carries the same keys, or PostgREST refuses it (PGRST102).
export function rowFor(item, post) {
  return {
    idea_key: keyFor(item),
    language: 'en',
    tool_slug: TOPIC[item.category] || TOPIC.other,
    // For Pratik only, as "Reference page" in the deck: the original story.
    tool_url: item.link || `${SITE}/`,
    // The table only allows story or informative; news is told apart by its key.
    kind: 'informative',
    hook: (post.split('\n').find(l => l.trim()) || '').trim(),
    post_text: post,
    translations: {},
    translations_of: null,
    image_url: photoFor(item.id),
    image_options: [photoFor(item.id)],
    rule_ids: [],
    status: 'pending',
    note: item.is_proposal ? 'This one is about a proposal, not a law.' : null,
    updated_at: new Date().toISOString(),
  };
}

// Kept stories from the last two weeks that are useful enough and have no post yet.
export async function missingStories(res) {
  const since = new Date(Date.now() - 14 * 864e5).toISOString();
  const news = await readNews(`?select=id,email_id,received_on,title_es,title_en,en,edited_en,link,category,score,is_proposal,status&keep=eq.true&score=gte.${MIN_SCORE}&status=neq.rejected&created_at=gte.${encodeURIComponent(since)}&order=created_at.asc,position.asc&limit=60`);
  if (!news.ok) return { ok: false, error: news.error };
  const have = await rest(res, `?select=idea_key&idea_key=like.${NEWS_PREFIX}*`);
  if (have === null) return null;
  const keys = new Set(have.map(r => r.idea_key));
  return { ok: true, items: news.data.filter(i => !keys.has(keyFor(i))) };
}

// Ask this same function to carry on with the rest, without waiting for it.
export async function poke(pass) {
  if (!pass) return;
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), 2500);
  try {
    await fetch(`${process.env.NEWS_SITE || SITE}/api/fb?action=news`, {
      method: 'POST', headers: { 'x-passcode': pass, 'Content-Type': 'application/json' }, body: '{}', signal: c.signal,
    });
  } catch { /* the other run carries on by itself */ } finally { clearTimeout(t); }
}

export default async function handler(req, res) {
  if (!gate(req, res)) return;
  const started = Date.now();
  const { dry } = { ...(req.query || {}), ...readBody(req) };

  const m = await missingStories(res);
  if (m === null) return;
  if (!m.ok) return res.status(500).json({ error: m.error });
  if (dry) return res.json({ ok: true, dry: true, would_write: m.items.map(i => i.title_en) });

  const created = [];
  const failed = [];
  const bodies = new Map();
  for (const item of m.items) {
    if (Date.now() - started > BUDGET_MS) break;
    if (!bodies.has(item.email_id)) {
      const e = await readNews(`?select=body_text&email_id=eq.${encodeURIComponent(item.email_id)}`, 'news_emails');
      bodies.set(item.email_id, e.ok && e.data[0] ? e.data[0].body_text : '');
    }
    const w = await writePost(item, passageFor(bodies.get(item.email_id), item.title_es));
    if (!w.ok) { failed.push({ story: item.title_en, error: w.error }); continue; }
    const out = await rest(res, '?on_conflict=idea_key,language', {
      method: 'POST',
      headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
      body: JSON.stringify([rowFor(item, w.post)]),
    });
    if (out === null) return;
    created.push(item.title_en);
  }

  const remaining = m.items.length - created.length - failed.length;
  if (remaining > 0) await poke(req.headers['x-passcode'] || (req.query && req.query.pass));
  res.json({ ok: true, created: created.length, created_titles: created, failed, remaining });
}
