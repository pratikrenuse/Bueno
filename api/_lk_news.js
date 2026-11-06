// POST /api/linkedin?action=news
//
// Turns the useful idealista/news stories into LinkedIn posts for the owners stream in
// /internal-linkedin.
//
// WHY (5 November 2026)
// Pratik: the idealista digest works well, so its content should now feed the team's
// LinkedIn deck too. Every story the digest kept with a usefulness score of 4 or 5 becomes
// one English master post, pending, for John to review like any other. Approving and sending
// are unchanged: the Tuesday and Thursday send takes news first (batch 100), because news
// goes stale, and each member gets it in their own language, translated at send time.
//
// WHAT IT READS AND WRITES
// Reads news_items and news_emails (the digest's tables, read only). Writes linkedin_posts,
// English masters only, slug news_<date>_<story id>, batch 100, day 101 upwards. The slug is
// the guard against doubles: a second run can only produce a row that already exists, and
// that insert is ignored. A Sync never touches these rows, because they are not in the
// source modules it reads.
//
// WHO CALLS IT
// The digest, straight after it has sorted a new email, and the deck's own load when a kept
// story has no post yet. One run writes what fits in 40 seconds and calls itself for the rest.
import { withCta } from './_email.js';
import { getApiKey } from './_translate.js';

export const NEWS_BATCH = 100;
export const FIRST_NEWS_DAY = 101;
export const MIN_SCORE = 4;
const SITE = 'https://www.247spain.es';
const BUDGET_MS = 40000;

export const isNewsSlug = (s) => typeof s === 'string' && s.startsWith('news_');
export const slugFor = (item) => `news_${String(item.received_on).replace(/-/g, '')}_${String(item.id).slice(0, 8)}`;
export const englishOf = (item) => (item.edited_en && item.edited_en.trim()) ? item.edited_en : (item.en || '');

// The image: a Bueno frame, the same branding as the rest of the deck (a licensed photograph
// above the navy BUENO | PROPERTY SIMPLIFIED band, no text, so one file is right in every
// language). Pratik, 5 November 2026: the images must be in Bueno's branding as they are.
// The frames come from public/posts, and only from posts that are no longer shown in the
// deck, so a news post never repeats the image of a post that was approved or sent.
//
// 6 November 2026, Pratik: the photos kept repeating. The 52 frames are only 15 licensed
// photographs (studio/PHOTO_POOL.md) in different layouts and crops, and the old order put
// the same photograph on neighbouring posts. This order takes one frame of each photograph in
// turn, so a photograph comes back only after at least ten others. The next two in the list
// are offered under "Change image" and are always different photographs too.
export const NEWS_FRAMES = [
  'alquiler_opcion_compra', 'costa_blanca_eight_towns', 'modelo210_scenarios', 'epc_certificates', 'accountant_non_resident',
  'gift_tax', 'leasehold_freehold', 'currency_transfer', 'free_banking_myth', 'cash_rules',
  'late_tax_penalties', 'buying_2026_compliance', 'credit_card_fees', 'irnr_who_pays', 'buying_fees',
  'direct_debit_switch', 'healthcare_access_owners', 'october_ibi_month', 'extension_deeds', 'brexit_buying',
  'hidden_bank_fees', 'noneu_tax_proposal', 'holiday_home_running_cost', 'pest_prevention_empty', 'community_fees',
  'seasonal_rental_roi', 'escritura_notary', 'frozen_account', 'retire_coast_shortlist', 'nie_to_dni',
  'owners_year', 'inheritance_foreign_law', 'tourist_license', 'landlord_tenant_issues', 'occupation_cover',
  'hidden_time_cost', 'property_insurance', 'inheritance_tax', 'seasonal_vs_tourist', 'invest_locations',
  'nota_simple', 'village_or_city_spain', 'spanish_citizenship', 'retirement_183_line', 'rural_property',
  'utilities_setup', 'squatter_signals', 'rental_rule_changes', 'spanish_lifestyle_owner', 'preventative_maintenance',
  's1_before_you_leave', 'solar_panels_costs',
];
export const framesFor = (day) => {
  const i = ((Number(day) - FIRST_NEWS_DAY) % NEWS_FRAMES.length + NEWS_FRAMES.length) % NEWS_FRAMES.length;
  return [0, 1, 2].map(k => `/posts/${NEWS_FRAMES[(i + k) % NEWS_FRAMES.length]}.jpg`);
};

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
  return `You write LinkedIn posts that members of a small team post on their own personal profiles. The readers are people who own a home in Spain or are thinking of buying one, mostly from Norway, Sweden, Germany, the Netherlands, France and the UK, aged 40 to 70.

Write ONE LinkedIn post about this Spanish property news story.

House style, all mandatory:
- Spoken register, the way a well-informed person explains something to a friend. Contractions throughout. Human, never robotic.
- Open with a hook that pulls the reader in. Not "Here is", not "The rule:", no colon-led setups, no label-style lines.
- Signal the reader indirectly inside a sentence, for example "if you own a place in Spain" or "if you're buying on the coast". Never a slapped-on label.
- Then what happened, with every figure, date and percentage exactly as in the story, and where it comes from (the court, the regional government, idealista's own data, the Ombudsman, and so on). Add no fact that is not in the story.
- Then what it means in practice for an owner or buyer, and anything sensible they can do or check.
- End on a clear takeaway, then a blank line, then exactly three hashtags on one line.
- 170 to 300 words, short paragraphs separated by blank lines. Every sentence complete and natural.
${item.is_proposal ? '- This is a proposal or a promise, not law. The post must say plainly that it is only a proposal and has not changed anything yet. Spain holds a general election on 29 November 2026 if that matters here.\n' : ''}- Never name a bank, an energy company or a fintech. No link. No emojis, no em dashes or en dashes, no exclamation marks, no fear or penalty-based urgency, no disclaimer line, no "save this for later", no invented personal anecdote, no mention of Bueno or 24/7 Spain.

Return ONLY valid JSON: {"title":"<a short headline in our words>","post":"..."}

Headline: ${item.title_en || item.title_es}
Our short summary: ${englishOf(item)}
${spanish ? `The story in Spanish, from the newsletter:\n${spanish}` : ''}`;
}

const BANNED = /\b(Bueno|Sabadell|BBVA|CaixaBank|Santander|Unicaja|Bankinter|ING|Iberdrola|Naturgy|Endesa|Repsol|Revolut|Wise)\b|24\/7|247spain/i;
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu;
export const tidyPost = (s) => String(s || '')
  .replace(/\s*[—–]\s*/g, ', ')
  .replace(EMOJI, '')
  .replace(/!/g, '.')
  .replace(/https?:\/\/\S+|www\.\S+/g, '')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

export function checkPost(text) {
  if (!text || text.split(/\s+/).length < 100) return 'too short';
  if (BANNED.test(text)) return `names ${(text.match(BANNED) || [])[0]}`;
  return null;
}

const models = () => [...new Set([process.env.NEWS_MODEL, 'claude-sonnet-5-5', process.env.TRANSLATE_MODEL, 'claude-sonnet-4-5'].filter(Boolean))];

async function claude(prompt) {
  const apiKey = getApiKey();
  if (!apiKey) return { ok: false, error: 'Missing env var: ANTHROPIC_API_KEY' };
  let last = '';
  for (const model of models()) {
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({ model, max_tokens: 2500, messages: [{ role: 'user', content: prompt }] }),
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
  let j;
  try { j = JSON.parse(r.text.slice(s, e + 1)); } catch { return { ok: false, error: 'Could not read the answer.' }; }
  const post = tidyPost(j.post);
  const problem = checkPost(post);
  if (problem) return { ok: false, error: `The post was not usable: ${problem}.` };
  return { ok: true, post, title: tidyPost(j.title || item.title_en).slice(0, 160) };
}

// One fixed key set, or PostgREST refuses the insert (PGRST102). The finished post, CTA
// included, exactly as the deck shows it and the team receives it.
export function rowFor(item, w, day) {
  return {
    slug: slugFor(item),
    batch: NEWS_BATCH,
    day,
    language: 'en',
    member: '',
    audience: 'owners',
    title: w.title,
    post_text: withCta(w.post, 'en'),
    image_url: framesFor(day)[0],
    image_options: framesFor(day),
    status: 'pending',
    source_hash: null,
  };
}

function db() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url) return { error: 'Missing env var: SUPABASE_URL (or VITE_SUPABASE_URL)' };
  if (!key) return { error: 'Missing env var: SUPABASE_SERVICE_KEY.' };
  return { url, H: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' } };
}

async function getJson(url, H) {
  const r = await fetch(url, { headers: H });
  const t = await r.text();
  if (!r.ok) return { ok: false, error: `Supabase ${r.status}: ${t.slice(0, 300)}` };
  try { return { ok: true, data: t ? JSON.parse(t) : [] }; } catch { return { ok: true, data: [] }; }
}

// Kept stories from the last two weeks, useful enough, with no LinkedIn post yet.
export async function missingStories() {
  const c = db();
  if (c.error) return { ok: false, error: c.error };
  const since = new Date(Date.now() - 14 * 864e5).toISOString();
  const [news, have] = await Promise.all([
    getJson(`${c.url}/rest/v1/news_items?select=id,email_id,received_on,title_es,title_en,en,edited_en,link,category,score,is_proposal,status&keep=eq.true&score=gte.${MIN_SCORE}&status=neq.rejected&created_at=gte.${encodeURIComponent(since)}&order=created_at.asc,position.asc&limit=60`, c.H),
    getJson(`${c.url}/rest/v1/linkedin_posts?select=slug,day&batch=eq.${NEWS_BATCH}&language=eq.en`, c.H),
  ]);
  if (!news.ok) return news;
  if (!have.ok) return have;
  const slugs = new Set(have.data.map(r => r.slug));
  const maxDay = have.data.reduce((m, r) => Math.max(m, Number(r.day) || 0), FIRST_NEWS_DAY - 1);
  return { ok: true, items: news.data.filter(i => !slugs.has(slugFor(i))), maxDay, c };
}

export async function poke(pass) {
  if (!pass) return;
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 2500);
  try {
    await fetch(`${process.env.NEWS_SITE || SITE}/api/linkedin?action=news`, {
      method: 'POST', headers: { 'x-passcode': pass, 'Content-Type': 'application/json' }, body: '{}', signal: ctl.signal,
    });
  } catch { /* the other run carries on by itself */ } finally { clearTimeout(t); }
}

export default async function handler(req, res) {
  try {
    const pass = req.headers['x-passcode'] || req.query.pass;
    if (pass !== process.env.INTERNAL_PASSCODE) return res.status(401).json({ error: 'unauthorized' });
    const started = Date.now();

    const m = await missingStories();
    if (!m.ok) return res.status(500).json({ error: m.error });
    if (req.query.dry === '1') return res.json({ ok: true, dry: true, would_write: m.items.map(i => i.title_en) });

    const { url, H } = m.c;
    const created = [];
    const failed = [];
    const bodies = new Map();
    let day = m.maxDay;
    for (const item of m.items) {
      if (Date.now() - started > BUDGET_MS) break;
      if (!bodies.has(item.email_id)) {
        const e = await getJson(`${url}/rest/v1/news_emails?select=body_text&email_id=eq.${encodeURIComponent(item.email_id)}`, H);
        bodies.set(item.email_id, e.ok && e.data[0] ? e.data[0].body_text : '');
      }
      const w = await writePost(item, passageFor(bodies.get(item.email_id), item.title_es));
      if (!w.ok) { failed.push({ story: item.title_en, error: w.error }); continue; }
      day += 1;
      const ins = await fetch(`${url}/rest/v1/linkedin_posts?on_conflict=slug,language,member`, {
        method: 'POST',
        headers: { ...H, Prefer: 'resolution=ignore-duplicates,return=minimal' },
        body: JSON.stringify([rowFor(item, w, day)]),
      });
      if (!ins.ok) return res.status(500).json({ error: `Supabase insert ${ins.status}: ${(await ins.text()).slice(0, 300)}`, created });
      created.push(w.title);
    }

    const remaining = m.items.length - created.length - failed.length;
    if (remaining > 0) await poke(pass);
    res.json({ ok: true, created: created.length, created_titles: created, failed, remaining });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
}
