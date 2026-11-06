// Spain 24/7 Instagram reels: one short vertical video a day, in six languages, made from the
// best idealista story of the last few days plus, where it fits, one checked fact from our own
// fact base (api/_reels_facts.js). The presenter is the model in studio/reels/model.
//
// THE LOOP (one GitHub Action drives it, .github/workflows/reels-render.yml, daily)
//   plan        picks the story, Claude writes the English script       -> status planned
//   translate   Claude translates it into no, sv, de, fr, nl           -> status scripted
//   jobs        the Action reads the scripts and renders the videos
//   upload-url  the Action gets a signed Supabase Storage URL per file
//   done        the Action reports the files; this sends the email     -> status sent
//
// All behind the router api/reels.js. Page and checks (internal passcode): list, resend,
// rerender, health.
//
// Nothing here writes to news_items or any LinkedIn or Facebook table. It only reads stories.

import crypto from 'node:crypto';
import { db as newsDb, gate, now, readBody } from './_news_db.js';
import { callClaude, parseJson, clean, BANNED } from './_news_sort.js';
import { FACTS, factById } from './_reels_facts.js';

const PRATIK = 'pratik.y.renuse@gmail.com';
const JOHN = 'john@getbueno.com';
const AGENT = 'poornimanirwal@gmail.com';

// Test first: until Pratik has seen and approved the email, it goes to him alone.
// When he approves, set LIVE to true: To Pratik, BCC John and the agent.
export const LIVE = false;
export const recipients = () => (LIVE ? { to: [PRATIK], bcc: [JOHN, AGENT] } : { to: [PRATIK], bcc: [] });

export const LANGS = ['en', 'no', 'sv', 'de', 'fr', 'nl'];
const LANG_NAME = { en: 'English', no: 'Norwegian', sv: 'Swedish', de: 'German', fr: 'French', nl: 'Dutch' };
const LANG_RULES = {
  no: 'Norwegian (Bokmål): address the reader as "du"; thousands with a space (49 319), decimals with a comma, a space before % (3,4 %)',
  sv: 'Swedish: address the reader as "du"; thousands with a space (49 319), decimals with a comma, a space before % (3,4 %)',
  de: 'German: address the reader as "Sie"; thousands with a period (49.319), decimals with a comma, a space before % (3,4 %)',
  fr: 'French: address the reader as "vous"; thousands with a space (49 319), decimals with a comma, a space before % (3,4 %)',
  nl: 'Dutch: address the reader as "u"; thousands with a period (49.319), decimals with a comma, no space before % (3,4%)',
};

// Written by hand, not by a model, so the last line of every video is always right.
export const OUTRO = {
  en: 'Follow Spain 24/7 for one short update on Spanish property every day.',
  no: 'Følg Spain 24/7 for en kort oppdatering om eiendom i Spania hver dag.',
  sv: 'Följ Spain 24/7 för en kort uppdatering om bostäder i Spanien varje dag.',
  de: 'Folgen Sie Spain 24/7 und erhalten Sie jeden Tag ein kurzes Update zu Immobilien in Spanien.',
  fr: "Suivez Spain 24/7 pour recevoir chaque jour une courte actualité sur l'immobilier en Espagne.",
  nl: 'Volg Spain 24/7 voor elke dag een korte update over vastgoed in Spanje.',
};

// The free WhatsApp channel per language (WHATSAPP_CHANNELS.md). It goes in the page's bio.
const CHANNEL = {
  en: 'https://whatsapp.com/channel/0029VbDw27tDJ6Gyifoeqx0Z',
  no: 'https://whatsapp.com/channel/0029VbEWWkIKgsNxuHSBSK2s',
  sv: 'https://whatsapp.com/channel/0029VbDa6qR6GcGIMpzX4M0s',
  de: 'https://whatsapp.com/channel/0029VbEJaT8JkK79IG7nVZ1Y',
  fr: 'https://whatsapp.com/channel/0029VbEKRXM1t90g5DEHe83r',
  nl: 'https://whatsapp.com/channel/0029Vb99fU17T8beeFeOTf3b',
};

const BUCKET = 'reels';
const madridDay = (d = new Date()) => d.toLocaleDateString('en-CA', { timeZone: 'Europe/Madrid' });

// ---------- access ----------

// The render Action sends a hash of the Supabase service key, which it holds as a GitHub
// secret. The key never travels, and the hash opens nothing but these reel endpoints.
export const renderToken = () =>
  crypto.createHash('sha256').update(`${process.env.SUPABASE_SERVICE_KEY || ''}:reels-render`).digest('hex');

function allowed(req, res) {
  const t = String(req.headers['x-reels-token'] || '');
  if (t && process.env.SUPABASE_SERVICE_KEY && t.length === 64 && crypto.timingSafeEqual(Buffer.from(t), Buffer.from(renderToken()))) return true;
  return gate(req, res);
}

// ---------- storage ----------

function creds() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url) return { error: 'Missing env var: SUPABASE_URL (or VITE_SUPABASE_URL)' };
  if (!key) return { error: 'Missing env var: SUPABASE_SERVICE_KEY.' };
  return { url, key };
}

async function rest(path, init = {}) {
  const c = creds();
  if (c.error) return { ok: false, error: c.error };
  try {
    const r = await fetch(`${c.url}${path}`, {
      ...init,
      headers: { apikey: c.key, Authorization: `Bearer ${c.key}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
    });
    const text = await r.text();
    if (!r.ok) return { ok: false, status: r.status, error: `Supabase ${r.status}: ${text.slice(0, 300)}` };
    let data = [];
    try { data = text ? JSON.parse(text) : []; } catch { data = text; }
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: `Supabase request failed: ${String((e && e.message) || e)}` };
  }
}

const reels = (path = '', init = {}) => rest(`/rest/v1/reels${path}`, init);

async function ensureBucket() {
  const g = await rest(`/storage/v1/bucket/${BUCKET}`);
  if (g.ok) return { ok: true };
  return rest('/storage/v1/bucket', {
    method: 'POST', body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true, file_size_limit: 52428800 }),
  });
}

// ---------- choosing the story ----------

// Figures as digit strings, whatever the number style: "2,955", "2.955" and "2 955" are all
// "2955"; "11.2%" and "11,2 %" are both "112".
export const numbers = (s) => (String(s || '').match(/\d{1,3}(?:[ .,\u00a0\u202f]\d{3})+(?:[.,]\d+)?|\d+(?:[.,]\d+)?/g) || [])
  .map(x => x.replace(/\D/g, '')).filter(Boolean);

export async function pickStory() {
  const since = new Date(Date.now() - 4 * 864e5).toISOString();
  const [items, used] = await Promise.all([
    newsDb('items', `?select=id,title_en,title_es,en,score,category,is_proposal,link,source,created_at&keep=eq.true&created_at=gte.${encodeURIComponent(since)}&order=created_at.desc&limit=60`),
    reels('?select=story_ids&order=day.desc&limit=90'),
  ]);
  if (!items.ok) return { ok: false, error: items.error };
  if (!used.ok) return { ok: false, error: used.error };
  const taken = new Set(used.data.flatMap(r => r.story_ids || []));
  const list = items.data.filter(s => s.en && !taken.has(s.id) && !BANNED.test(s.en));
  if (!list.length) return { ok: true, story: null };
  // A reel needs figures to show, so stories with at least two numbers come first; then the
  // usefulness score Claude gave the story; then the newest.
  const rank = (s) => (numbers(s.en).length >= 2 ? 10 : 0) + (s.score || 1) + (s.is_proposal ? -0.5 : 0);
  list.sort((a, b) => rank(b) - rank(a) || String(b.created_at).localeCompare(String(a.created_at)));
  return { ok: true, story: list[0] };
}

// ---------- the English script ----------

export function scriptPrompt(story) {
  return `You write the script for a 35 to 45 second Instagram Reel for Spain 24/7, a free information service for foreigners who own a home in Spain or are buying one. Most viewers are Norwegian, Swedish, German, Dutch, French or British, aged 40 to 70. A calm, friendly presenter says every line, and the same words appear on screen.

Today's story, already checked and written in our own words:
Headline: ${story.title_en}
Story: ${story.en}
${story.is_proposal ? 'This is a PROPOSAL, not law. The script must say clearly that it is only a proposal and not law yet.\n' : ''}
Background facts you may use. They are checked. Use at most ONE, and only if it plainly helps someone understand what today's story means for them. If none fits, use none:
${FACTS.map(f => `- [${f.id}] (${f.topic}) ${f.text}`).join('\n')}

Write:
- "hook": one sentence of at most 12 words that makes an owner want to keep watching. State the news itself. No questions, no clickbait, no "you won't believe", no exclamation marks.
- "facts": two scenes. Each has "big", the single figure that scene is about exactly as the story gives it (for example "2,955 euros" or "11.2%"; empty string if that scene has no figure), and "text", one or two short sentences that say the figure and what it is. Say where the figure comes from, using the source the story names.
- "fact_id": the id of the background fact you chose, or an empty string.
- "meaning": one or two short sentences on what this means for someone who owns or is buying a home in Spain. Calm and practical. Do not invent advice the story does not support.
- "caption": the Instagram caption, 7 to 10 short lines with a blank line between paragraphs. First line restates the hook. Then the full story in plain words with every figure, then what it means for owners. Then the line "Follow Spain 24/7 for a short update on Spanish property every day." and then the line "Our free WhatsApp channel has the same news every morning. The link is in our bio."
- "hashtags": 6 to 8 hashtags in English, each a single word or joined words, starting with #, relevant to Spanish property and to the story.

Rules, all mandatory:
- Complete, natural spoken sentences, as a well-informed friend would say them out loud. No label fragments.
- Keep every figure, date and percentage exactly as in the story. Add no fact, figure or name that is not in the story or in the one background fact you chose.
- Never name a bank, an energy company or any other company (idealista may be named as a source). Never mention Bueno.
- No em dashes or en dashes, no emojis in any field, no exclamation marks, no fear or penalty-based urgency, no "revolutionary".
- Hook plus facts plus meaning together stay under 90 words.

Return ONLY valid JSON:
{"hook":"...","facts":[{"big":"...","text":"..."},{"big":"...","text":"..."}],"fact_id":"","meaning":"...","caption":"...","hashtags":["#..."]}`;
}

const words = (s) => String(s || '').split(/\s+/).filter(Boolean).length;

// Code checks what the prompt asks for. Returns { ok, script } or { ok:false, error }.
export function checkScript(raw, story) {
  if (!raw || typeof raw !== 'object') return { ok: false, error: 'Claude did not return a script.' };
  const facts = (Array.isArray(raw.facts) ? raw.facts : []).slice(0, 2).map(f => ({ big: clean(f && f.big), text: clean(f && f.text) }));
  const s = {
    hook: clean(raw.hook),
    facts,
    fact_id: factById(String(raw.fact_id || '').trim()) ? String(raw.fact_id).trim() : '',
    meaning: clean(raw.meaning),
    caption: clean(raw.caption),
    hashtags: (Array.isArray(raw.hashtags) ? raw.hashtags : []).map(h => clean(h).replace(/\s+/g, '')).filter(h => /^#\w/.test(h)).slice(0, 8),
  };
  if (!s.hook || facts.length < 2 || facts.some(f => !f.text) || !s.meaning || !s.caption) return { ok: false, error: 'The script is missing a part.' };
  const all = [s.hook, ...facts.map(f => f.text), s.meaning, s.caption].join(' ');
  if (BANNED.test(all) || /\bbueno\b/i.test(all)) return { ok: false, error: 'The script names a company or Bueno.' };
  if (/!/.test(all)) return { ok: false, error: 'The script has an exclamation mark.' };
  if (words([s.hook, ...facts.map(f => f.text), s.meaning].join(' ')) > 100) return { ok: false, error: 'The script is too long to say in under a minute.' };
  // Every figure on screen must be one the story has.
  const known = new Set(numbers(`${story.en} ${story.title_en}`));
  for (const f of facts) {
    if (f.big && numbers(f.big).some(n => !known.has(n))) f.big = '';
  }
  if (story.is_proposal && !/proposal|not (yet )?law|proposed/i.test(all)) return { ok: false, error: 'The story is a proposal, and the script does not say so.' };
  return { ok: true, script: s };
}

// The scenes the renderer draws, in order. The background fact is used word for word.
export function toScenes(s, lang, outro = OUTRO[lang]) {
  const scenes = [{ kind: 'hook', text: s.hook }];
  for (const f of s.facts) scenes.push({ kind: 'fact', big: f.big || '', text: f.text });
  if (s.context) scenes.push({ kind: 'fact', big: '', text: s.context });
  scenes.push({ kind: 'meaning', text: s.meaning });
  scenes.push({ kind: 'outro', text: outro });
  return scenes;
}

export async function plan(req, res) {
  if (!allowed(req, res)) return;
  const day = madridDay();
  const have = await reels(`?select=id,status&day=eq.${day}`);
  if (!have.ok) return res.status(500).json({ error: have.error });
  if (have.data.length) return res.json({ ok: true, skipped: `A reel for ${day} already exists (${have.data[0].status}).` });

  const p = await pickStory();
  if (!p.ok) return res.status(500).json({ error: p.error });
  if (!p.story) return res.json({ ok: true, skipped: 'No new idealista story in the last four days.' });
  const story = p.story;

  const r = await callClaude(scriptPrompt(story), { maxTokens: 2500 });
  if (!r.ok) return res.status(502).json({ error: r.error });
  const checked = checkScript(parseJson(r.text), story);
  if (!checked.ok) return res.status(422).json({ error: checked.error, story: story.title_en });
  const en = checked.script;
  const fact = factById(en.fact_id);
  if (fact) en.context = fact.text;

  const row = {
    day,
    status: 'planned',
    story_ids: [story.id],
    story: { id: story.id, title_en: story.title_en, title_es: story.title_es, en: story.en, link: story.link, source: story.source || 'idealista', is_proposal: !!story.is_proposal, fact_id: en.fact_id || null },
    scripts: { en: { ...en, source: 'idealista', scenes: toScenes(en, 'en') } },
    videos: {}, meta: { model: r.model }, errors: {}, error: null, updated_at: now(),
  };
  const ins = await reels('?on_conflict=day', { method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=representation' }, body: JSON.stringify([row]) });
  if (!ins.ok) return res.status(500).json({ error: ins.error });
  return res.json({ ok: true, day, story: story.title_en, hook: en.hook });
}

// ---------- translation ----------

export function translatePrompt(en) {
  const src = { hook: en.hook, facts: en.facts, context: en.context || '', meaning: en.meaning, caption: en.caption, hashtags: en.hashtags };
  return `Translate this Instagram Reel script for people who own a home in Spain into Norwegian, Swedish, German, French and Dutch. A presenter says the hook, the facts, the context and the meaning out loud, and the same words appear on screen.

Rules, all mandatory:
- Natural, calm, spoken register, as a native speaker who knows Spanish property would say it. Not word for word. Complete sentences.
- Keep every figure, date, percentage and name exactly. Keep Spanish terms such as IBI, NIE, Modelo 210 and plusvalía as they are. "Spain 24/7" stays as it is.
- Number style: ${Object.values(LANG_RULES).join('; ')}. Apply the same style to the "big" figures.
- "big" stays short: only the figure and its unit, in the target language (for example "2.955 Euro" in German).
- The caption keeps the same paragraphs and blank lines. Its last two lines say, in that language, that people can follow Spain 24/7 for a short update every day and that the free WhatsApp channel link is in the bio.
- Hashtags: 6 to 8 hashtags a native speaker in that country would search, about Spanish property and the story, each starting with #, no spaces.
- If the English says something is a proposal and not law, every translation says so just as clearly.
- No em dashes or en dashes, no emojis, no exclamation marks. Never mention Bueno or name any company except idealista.

Return ONLY valid JSON with exactly these keys: {"no":{...},"sv":{...},"de":{...},"fr":{...},"nl":{...}}, each with the same shape as the English:
${JSON.stringify(src)}`;
}

export function checkTranslation(t, en) {
  if (!t || typeof t !== 'object') return { ok: false, error: 'empty' };
  const facts = (Array.isArray(t.facts) ? t.facts : []).slice(0, en.facts.length).map(f => ({ big: clean(f && f.big), text: clean(f && f.text) }));
  const s = {
    hook: clean(t.hook), facts, context: en.context ? clean(t.context) : '', meaning: clean(t.meaning), caption: clean(t.caption),
    hashtags: (Array.isArray(t.hashtags) ? t.hashtags : []).map(h => clean(h).replace(/\s+/g, '')).filter(h => /^#[\p{L}\p{N}]/u.test(h)).slice(0, 8),
  };
  if (!s.hook || facts.length !== en.facts.length || facts.some(f => !f.text) || !s.meaning || !s.caption || (en.context && !s.context)) return { ok: false, error: 'missing a part' };
  for (let i = 0; i < facts.length; i++) {
    const want = numbers(en.facts[i].big).join('|');
    if (!en.facts[i].big) facts[i].big = '';
    else if (numbers(facts[i].big).join('|') !== want) return { ok: false, error: `figure "${facts[i].big}" does not match "${en.facts[i].big}"` };
  }
  const all = [s.hook, ...facts.map(f => f.text), s.context, s.meaning, s.caption].join(' ');
  if (BANNED.test(all) || /\bbueno\b/i.test(all)) return { ok: false, error: 'names a company' };
  return { ok: true, script: s };
}

export async function translate(req, res) {
  if (!allowed(req, res)) return;
  const q = await reels('?select=id,day,scripts,errors&status=eq.planned&order=day.asc&limit=1');
  if (!q.ok) return res.status(500).json({ error: q.error });
  if (!q.data.length) return res.json({ ok: true, skipped: 'Nothing waiting for translation.' });
  const row = q.data[0];
  const en = row.scripts.en;
  const r = await callClaude(translatePrompt(en), { maxTokens: 9000 });
  if (!r.ok) return res.status(502).json({ error: r.error });
  if (r.stop === 'max_tokens') return res.status(502).json({ error: 'The translation was cut off.' });
  const j = parseJson(r.text) || {};
  const scripts = { en };
  const errors = { ...(row.errors || {}) };
  for (const l of LANGS.filter(x => x !== 'en')) {
    const c = checkTranslation(j[l], en);
    if (c.ok) scripts[l] = { ...c.script, source: 'idealista', scenes: toScenes(c.script, l) };
    else errors[l] = `Translation: ${c.error}`;
  }
  const up = await reels(`?id=eq.${row.id}`, { method: 'PATCH', body: JSON.stringify({ scripts, errors, status: 'scripted', updated_at: now() }) });
  if (!up.ok) return res.status(500).json({ error: up.error });
  return res.json({ ok: true, day: row.day, languages: Object.keys(scripts), errors });
}

// ---------- the render Action ----------

export async function jobs(req, res) {
  if (!allowed(req, res)) return;
  const q = await reels('?select=id,day,scripts&status=eq.scripted&order=day.asc&limit=2');
  if (!q.ok) return res.status(500).json({ error: q.error });
  const list = q.data.map(r => ({
    id: r.id, day: r.day,
    scripts: Object.fromEntries(LANGS.filter(l => r.scripts[l]).map(l => [l, { source: r.scripts[l].source || 'idealista', scenes: r.scripts[l].scenes }])),
  }));
  return res.json({ jobs: list });
}

export async function uploadUrl(req, res) {
  if (!allowed(req, res)) return;
  const b = readBody(req);
  if (!/^[0-9a-f-]{36}$/i.test(String(b.id || '')) || !LANGS.includes(b.lang) || !['mp4', 'jpg'].includes(b.kind)) {
    return res.status(400).json({ error: 'Need id, lang and kind (mp4 or jpg).' });
  }
  const bk = await ensureBucket();
  if (!bk.ok) return res.status(500).json({ error: bk.error });
  const row = await reels(`?select=day&id=eq.${b.id}`);
  if (!row.ok || !row.data.length) return res.status(404).json({ error: 'No such reel.' });
  const path = `${row.data[0].day}/spain247-${row.data[0].day}-${b.lang}-${Date.now().toString(36)}.${b.kind}`;
  const s = await rest(`/storage/v1/object/upload/sign/${BUCKET}/${path}`, { method: 'POST', headers: { 'x-upsert': 'true' }, body: '{}' });
  if (!s.ok) return res.status(500).json({ error: s.error });
  const c = creds();
  const signed = s.data.url || s.data.signedURL || '';
  return res.json({
    upload_url: `${c.url}/storage/v1${signed.startsWith('/') ? '' : '/'}${signed}`,
    public_url: `${c.url}/storage/v1/object/public/${BUCKET}/${path}`,
  });
}

export async function done(req, res) {
  if (!allowed(req, res)) return;
  const b = readBody(req);
  if (!/^[0-9a-f-]{36}$/i.test(String(b.id || ''))) return res.status(400).json({ error: 'Need id.' });
  const q = await reels(`?select=*&id=eq.${b.id}`);
  if (!q.ok || !q.data.length) return res.status(404).json({ error: 'No such reel.' });
  const row = q.data[0];
  const videos = {};
  for (const [l, v] of Object.entries(b.videos || {})) if (LANGS.includes(l) && v && v.mp4) videos[l] = { mp4: String(v.mp4), jpg: v.jpg ? String(v.jpg) : '' };
  const errors = { ...(row.errors || {}) };
  for (const [l, e] of Object.entries(b.errors || {})) errors[l] = `Render: ${String(e).slice(0, 300)}`;
  const meta = { ...(row.meta || {}), render: b.meta || {} };
  const status = Object.keys(videos).length ? 'rendered' : 'failed';
  const up = await reels(`?id=eq.${row.id}`, { method: 'PATCH', body: JSON.stringify({ videos, errors, meta, status, updated_at: now() }) });
  if (!up.ok) return res.status(500).json({ error: up.error });
  if (status === 'failed') return res.json({ ok: false, error: 'No video was rendered.', errors });
  const sent = await sendReel({ ...row, videos, errors, meta });
  return res.json({ ok: sent.ok, sent, languages: Object.keys(videos) });
}

// ---------- the email ----------

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const SANS = 'Arial,Helvetica,sans-serif';

export function reelEmail(row) {
  const langs = LANGS.filter(l => row.videos && row.videos[l]);
  const voiced = langs.every(l => !row.meta?.render?.[l] || row.meta.render[l].voiced !== false);
  const title = row.story?.title_en || 'Spanish property news';
  const blocks = langs.map(l => {
    const s = row.scripts[l] || {};
    const v = row.videos[l];
    return `
  <div style="border-top:2px solid #010221;padding:16px 0 8px">
    <p style="margin:0 0 6px;font-size:16px;font-weight:bold">${LANG_NAME[l]}</p>
    <p style="margin:0 0 10px;color:#5a5f78">Post on the ${LANG_NAME[l]} Instagram page. The video is attached as spain247-${row.day}-${l}.mp4.</p>
    ${v.jpg ? `<img src="${esc(v.jpg)}" width="180" alt="" style="display:block;border-radius:8px;margin:0 0 12px">` : ''}
    <p style="margin:0 0 4px;font-weight:bold">Caption</p>
    <div style="white-space:pre-wrap;background:#F4F2EE;padding:12px;border-radius:6px;margin:0 0 10px">${esc(s.caption)}

${esc((s.hashtags || []).join(' '))}</div>
    <p style="margin:0;font-size:12.5px;color:#5a5f78">WhatsApp channel link for this page's bio: ${esc(CHANNEL[l])}</p>
  </div>`;
  }).join('');
  const missing = LANGS.filter(l => !langs.includes(l));
  const html = `<div style="font-family:${SANS};font-size:14px;line-height:1.6;color:#010221;max-width:600px">
  <p>Agent,</p>
  <p>Today's Instagram reel is ready in ${langs.length} ${langs.length === 1 ? 'language' : 'languages'}. It is about this: ${esc(title)}. Each video is attached to this email, so you can download it straight to your phone.</p>
  <p>Please post each one today as a Reel on the Instagram page for its language, and paste the caption and hashtags below it. Choose the opening frame with the headline as the cover.${voiced ? '' : ' These videos have no voice-over today, so add a calm track from the Instagram music library at a low volume.'} If the page's bio does not have its WhatsApp channel link yet, add the link given under that language.</p>
  ${missing.length ? `<p style="color:#8a6d1f">No video today for ${missing.map(l => LANG_NAME[l]).join(', ')}.</p>` : ''}
  ${blocks}
  <p style="color:#5a5f78;font-size:12.5px;margin-top:16px">Made from the idealista story "${esc(row.story?.title_es || title)}".</p>
</div>`;
  const attachments = langs.map(l => ({ filename: `spain247-${row.day}-${l}.mp4`, path: row.videos[l].mp4 }));
  return { subject: `Today's Instagram reels: ${title}`.replace(/€/g, 'euros').slice(0, 150), html, attachments };
}

export async function sendReel(row) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: 'Missing env var: RESEND_API_KEY' };
  const { subject, html, attachments } = reelEmail(row);
  const { to, bcc } = recipients();
  let out;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || '24/7 Spain <onboarding@resend.dev>',
        to, ...(bcc.length ? { bcc } : {}), subject, html, attachments, reply_to: PRATIK,
      }),
    });
    const j = await r.json().catch(() => ({}));
    out = r.ok ? { ok: true, id: j.id } : { ok: false, error: `Resend ${r.status}: ${JSON.stringify(j).slice(0, 300)}` };
  } catch (e) {
    out = { ok: false, error: `Resend request failed: ${String((e && e.message) || e)}` };
  }
  await reels(`?id=eq.${row.id}`, {
    method: 'PATCH',
    body: JSON.stringify(out.ok
      ? { status: 'sent', email_id: out.id, sent_to: LIVE ? 'Pratik, John (bcc), agent (bcc)' : 'Pratik only (test)', sent_at: now(), error: null, updated_at: now() }
      : { status: 'send_failed', error: out.error, updated_at: now() }),
  });
  return out;
}

// ---------- page ----------

export async function list(req, res) {
  if (!gate(req, res)) return;
  const q = await reels('?select=id,day,status,story,scripts,videos,meta,errors,error,sent_to,sent_at,created_at&order=day.desc&limit=40');
  if (!q.ok) return res.status(500).json({ error: q.error });
  return res.json({ reels: q.data, live: LIVE });
}

export async function resend(req, res) {
  if (!gate(req, res)) return;
  const b = readBody(req);
  const q = await reels(`?select=*&id=eq.${encodeURIComponent(String(b.id || ''))}`);
  if (!q.ok || !q.data.length) return res.status(404).json({ error: 'No such reel.' });
  if (!Object.keys(q.data[0].videos || {}).length) return res.status(400).json({ error: 'This reel has no videos yet.' });
  return res.json(await sendReel(q.data[0]));
}

// Puts a reel back in the render queue (for example after a render failed).
export async function rerender(req, res) {
  if (!gate(req, res)) return;
  const b = readBody(req);
  const up = await reels(`?id=eq.${encodeURIComponent(String(b.id || ''))}`, { method: 'PATCH', body: JSON.stringify({ status: 'scripted', updated_at: now() }) });
  if (!up.ok) return res.status(500).json({ error: up.error });
  return res.json({ ok: true });
}

export async function health(req, res) {
  if (!gate(req, res)) return;
  const env = {
    SUPABASE_URL: !!(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL),
    SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_KEY,
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    ANTHROPIC_API_KEY: !!(process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_KEY),
    INTERNAL_PASSCODE: !!process.env.INTERNAL_PASSCODE,
  };
  const [t, b, s] = await Promise.all([reels('?select=id&limit=1'), rest(`/storage/v1/bucket/${BUCKET}`), pickStory()]);
  return res.json({
    ok: Object.values(env).every(Boolean) && t.ok && b.ok,
    env, table: t.ok || t.error, bucket: b.ok || b.error,
    next_story: s.ok ? (s.story ? s.story.title_en : null) : s.error,
    live: LIVE, day: madridDay(),
  });
}
