// The news section on the 247spain.es home page, in all six languages.
//
//   GET  /api/news?action=public&lang=no   the latest stories for the page. No passcode: it is
//                                          public, read-only and cached at Vercel's edge.
//   POST /api/news?action=site             translates the stories the page will show (passcode).
//
// WHY (19 November 2026)
// Pratik: Spain 24/7 should carry the top news from the idealista digest in every language, so
// something new shows up on the site every day or two. The stories are the ones the digest
// already kept and checked; no new facts are added. The page shows each story's headline and
// summary in English, Norwegian, Swedish, German, French and Dutch, written once without the
// name of the newsletter it came from.
//
// HOW THE TRANSLATIONS ARE MADE
// Once per story, stored in news_items.site_copy, stamped in site_copy_of with a hash of the
// English it came from, so an edit in /internal-news gets a fresh translation. The digest asks
// for them right after it sorts an email (api/_news_process.js, feedDecks), and the public call
// asks again if it finds a story without one. A story is locked (site_lock) while it is being
// translated, so two calls never pay for the same translation. A story whose copy is not
// ready yet is left out, never shown in another language.
//
// This file reads and writes only news_items, through _news_db.js. The channel translations
// (translations, translations_of) belong to the WhatsApp flow and are never touched here.
import { createHash } from 'node:crypto';
import { gate, db, now } from './_news_db.js';
import { callClaude, parseJson, clean, BANNED, LANG_NAME, LANG_RULES } from './_news_sort.js';

export const SITE_LANGS = ['en', 'no', 'sv', 'de', 'fr', 'nl'];
const OTHER_LANGS = SITE_LANGS.filter(l => l !== 'en');
// The page never names the newsletter the stories come from (Pratik, 19 November 2026), so
// every language, English included, is rewritten once without it and checked in code.
export const SOURCE_NAME = /idealista/i;
export const SHOW = 6;          // stories on the page
export const MIN_SCORE = 4;     // the same bar as the LinkedIn posts (api/_lk_news.js)
export const DAYS = 21;         // nothing older than three weeks
const LOCK_MS = 3 * 60 * 1000;  // a lock older than this belongs to a run that died
const BUDGET_MS = 40000;
const PER_CALL = 3;
const SITE = 'https://www.247spain.es';

export const englishOf = (row) => (row.edited_en && row.edited_en.trim()) ? row.edited_en : (row.en || '');
export const siteHash = (row) => createHash('sha1')
  .update(`${row.title_en || ''}\n${englishOf(row)}`, 'utf8').digest('hex');
export const isFresh = (row) => !!row.site_copy && row.site_copy_of === siteHash(row)
  && SITE_LANGS.every(l => row.site_copy[l] && row.site_copy[l].title && row.site_copy[l].text);

// The stories the page shows, newest first: kept by the digest, useful enough, not rejected.
export async function candidates() {
  const since = new Date(Date.now() - DAYS * 864e5).toISOString().slice(0, 10);
  return db('items', `?select=id,received_on,position,is_proposal,status,title_en,en,edited_en,site_copy,site_copy_of,site_lock`
    + `&keep=eq.true&score=gte.${MIN_SCORE}&status=neq.rejected&received_on=gte.${since}`
    + `&title_en=not.is.null&order=received_on.desc,position.asc&limit=${SHOW * 2}`);
}

// What one story looks like on the page in one language, or null if that language is not ready.
export function storyFor(row, lang) {
  const base = { id: row.id, date: row.received_on, proposal: !!row.is_proposal };
  if (!isFresh(row)) return null;
  const c = row.site_copy[lang];
  return { ...base, title: c.title, text: c.text };
}

export function sitePrompt(rows) {
  const stories = rows.map(r => ({
    id: r.id,
    proposal: !!r.is_proposal,
    title: r.title_en,
    text: englishOf(r),
  }));
  return `Prepare these short property news items for the news section of Spain 24/7, a free website for people who own a home in Spain or are buying one, in English, Norwegian, Swedish, German, French and Dutch.

Each item has a headline (title) and a summary of two to four sentences (text).

First write the English version for the website: the same facts, but never name the newsletter, news site or property portal the story came from (for example idealista or idealista/news). Where a figure is that portal's own data, say "according to property portal data" or similar. Courts, governments, ministries, notaries, official statistics and named experts stay as they are. Then translate that English version into the other five languages.

Rules, all mandatory:
- Natural, calm, plain register, as a native-speaking journalist who knows Spanish property would write it. Not word for word.
- The headline stays short, like a news headline in that language.
- Keep every figure, date, percentage and name exactly. Keep Spanish terms such as IBI, NIE, ITP, VPO, Modelo 210 and plusvalía as they are.
- Add nothing that is not in the English and leave nothing out.
- Number style per language: ${Object.entries(LANG_RULES).map(([k, v]) => `${LANG_NAME[k]}: ${v}`).join('; ')}.
- Every sentence complete. No em dashes or en dashes, no emojis, no exclamation marks.
- Where "proposal" is true, the English says it is only a proposal and not law. Every translation must say that just as clearly.

Return ONLY valid JSON, one entry per id:
{"<id>": {"en": {"title": "...", "text": "..."}, "no": {...}, "sv": {...}, "de": {...}, "fr": {...}, "nl": {...}}}

Items:
${JSON.stringify(stories, null, 2)}`;
}

// Checks one item's translations; returns the cleaned copy or an error string.
export function checkCopy(raw) {
  if (!raw || typeof raw !== 'object') return { error: 'no translation came back' };
  const out = {};
  for (const l of SITE_LANGS) {
    const v = raw[l];
    const title = clean(v && v.title).replace(/!/g, '.');
    const text = clean(v && v.text).replace(/!/g, '.');
    const name = LANG_NAME[l] || 'English';
    if (!title || !text) return { error: `the ${name} version came back empty` };
    if (BANNED.test(title) || BANNED.test(text)) return { error: `the ${name} version names a company` };
    if (SOURCE_NAME.test(title) || SOURCE_NAME.test(text)) return { error: `the ${name} version names the source newsletter` };
    out[l] = { title, text };
  }
  return { copy: out };
}

// Takes the lock on each story that needs a translation and nobody is working on. Only the
// rows the PATCH actually changed come back, so two runs at once split the work, never share it.
async function lock(rows) {
  const stale = new Date(Date.now() - LOCK_MS).toISOString();
  const got = [];
  for (const r of rows) {
    const p = await db('items', `?id=eq.${encodeURIComponent(r.id)}&or=(site_lock.is.null,site_lock.lt.${encodeURIComponent(`"${stale}"`)})`, {
      method: 'PATCH', headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ site_lock: now() }),
    });
    if (p.ok && p.data.length) got.push(r);
  }
  return got;
}
const unlock = (id, patch = {}) => db('items', `?id=eq.${encodeURIComponent(id)}`, {
  method: 'PATCH', body: JSON.stringify({ ...patch, site_lock: null }),
});

export async function translateMissing({ budgetMs = BUDGET_MS } = {}) {
  const started = Date.now();
  const c = await candidates();
  if (!c.ok) return { ok: false, error: c.error };
  const todo = c.data.slice(0, SHOW).filter(r => !isFresh(r) && r.title_en && englishOf(r));
  const mine = await lock(todo);
  const done = [], failed = [];
  for (let i = 0; i < mine.length; i += PER_CALL) {
    const batch = mine.slice(i, i + PER_CALL);
    if (Date.now() - started > budgetMs) { for (const r of batch) await unlock(r.id); continue; }
    const r = await callClaude(sitePrompt(batch), { maxTokens: 8000 });
    const j = r.ok ? parseJson(r.text) : null;
    for (const row of batch) {
      const checked = j ? checkCopy(j[row.id]) : { error: r.ok ? 'the answer could not be read' : r.error };
      if (checked.copy) {
        await unlock(row.id, { site_copy: checked.copy, site_copy_of: siteHash(row) });
        done.push(row.title_en);
      } else {
        await unlock(row.id);
        failed.push({ story: row.title_en, error: String(checked.error).slice(0, 300) });
      }
    }
  }
  return { ok: true, translated: done.length, translated_titles: done, failed, waiting: todo.length - mine.length };
}

// Asks for the translations without waiting for them (the same pattern as feedDecks).
export async function pokeSite() {
  const pass = process.env.INTERNAL_PASSCODE;
  if (!pass) return;
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 1500);
  try {
    await fetch(`${process.env.NEWS_SITE || SITE}/api/news?action=site`, {
      method: 'POST', headers: { 'x-passcode': pass, 'Content-Type': 'application/json' }, body: '{}', signal: ctl.signal,
    });
  } catch { /* the next call, or the next email, picks it up */ } finally { clearTimeout(t); }
}

export async function publicNews(req, res) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });
    const asked = String((req.query && req.query.lang) || 'en').toLowerCase();
    const lang = SITE_LANGS.includes(asked) ? asked : 'en';
    const c = await candidates();
    if (!c.ok) {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(500).json({ error: c.error, stories: [] });
    }
    const top = c.data.slice(0, SHOW);
    const missing = top.some(r => !isFresh(r));
    if (missing) await pokeSite();
    const stories = top.map(r => storyFor(r, lang)).filter(Boolean);
    // Cached at the edge per language. Short while a translation is still coming, so it shows
    // up within a minute or two; fifteen minutes once everything is in.
    res.setHeader('Cache-Control', missing
      ? 'public, s-maxage=60, stale-while-revalidate=600'
      : 'public, s-maxage=900, stale-while-revalidate=86400');
    return res.json({ lang, updated: stories[0] ? stories[0].date : null, stories });
  } catch (e) {
    if (!res.headersSent) {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(500).json({ error: String((e && e.message) || e), stories: [] });
    }
  }
}

export async function site(req, res) {
  if (!gate(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  try {
    const out = await translateMissing();
    return res.status(out.ok ? 200 : 500).json(out);
  } catch (e) {
    return res.status(500).json({ error: String((e && e.message) || e) });
  }
}
