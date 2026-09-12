// Keeping the five translations honest when the English changes.
//
// WHY THIS EXISTS AT ALL
// Pratik reviews English. He edits English. Then one approval sends six versions to the
// person who publishes them. If the translations were simply whatever was written months
// ago, an edit to the English would quietly ship a German paragraph he had just deleted.
// That is the exact failure the LinkedIn programme had, and it went unnoticed for weeks.
//
// So every set of translations records the sha1 of the English it was made from. If the
// final English still hashes to that, the stored set is used and nothing is called. If it
// does not, the set is rebuilt from the English that is actually going out.
//
// This file talks to the Anthropic API directly rather than importing api/_translate.js.
// That module belongs to the LinkedIn programme and carries its per-member copy and its
// call to action; this surface shares nothing with it.
import { createHash } from 'node:crypto';
import { TRANSLATION_LANGS, LANG_NAME, linkFor } from './_fb_content.js';

export const hashOf = (text) => createHash('sha1').update(String(text ?? ''), 'utf8').digest('hex');

export const isCurrent = (row, finalText) =>
  !!row.translations_of
  && row.translations_of === hashOf(finalText)
  && TRANSLATION_LANGS.every(l => row.translations && typeof row.translations[l] === 'string' && row.translations[l].trim());

// The house rules a translation may never break, checked on the way out rather than hoped
// for in the prompt. A translation that breaks one is rejected and the stored one is kept,
// because a correct old sentence beats a wrong new one.
const BANNED = /\b(Bueno|Sabadell|BBVA|CaixaBank|Santander|Unicaja|Iberdrola|Naturgy|Endesa|Revolut|Wise)\b/i;
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;

export function checkTranslation(text, lang, tool) {
  if (!text || !text.trim()) return 'empty';
  if (/[—–]/.test(text)) return 'contains an em or en dash';
  if (EMOJI.test(text)) return 'contains an emoji';
  if (BANNED.test(text)) return `names ${(text.match(BANNED) || [])[0]}`;
  if (!text.includes(linkFor(tool, lang))) return 'does not carry the localised link';
  return null;
}

const PROMPT = (english, tool) => `You are translating one Facebook post for property owners in Spain.

It is written by one person, in the first person, to be read in a Facebook group. It is
deliberately conversational: short uneven sentences, contractions, an aside or two. Translate
the voice, not only the words. A stiff, official sounding translation is a failed translation.

Rules you must not break:
- Keep every figure, period, article reference and Spanish legal term exactly as it is.
- No em dashes, no en dashes, no emoji.
- Do not name any company or bank.
- Replace the URL with the localised one given below for that language. Nothing else changes.
- Keep the paragraph breaks where they are.

The URLs to use:
${TRANSLATION_LANGS.map(l => `  ${l} (${LANG_NAME[l]}): ${linkFor(tool, l)}`).join('\n')}

The English post:
---
${english}
---

Return only a JSON object, no other text, shaped exactly:
{${TRANSLATION_LANGS.map(l => `"${l}": "..."`).join(', ')}}`;

/**
 * Translate one post into the five languages.
 * Returns { ok: true, translations, hash } or { ok: false, error }.
 */
export async function translate(english, tool) {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_KEY;
  if (!apiKey) return { ok: false, error: 'Missing env var: ANTHROPIC_API_KEY' };

  let raw;
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.TRANSLATE_MODEL || 'claude-sonnet-5',
        max_tokens: 8000,
        messages: [{ role: 'user', content: PROMPT(english, tool) }],
      }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: `Anthropic ${r.status}: ${JSON.stringify(j).slice(0, 300)}` };
    raw = (j.content || []).map(c => c.text || '').join('');
  } catch (e) {
    return { ok: false, error: String((e && e.message) || e) };
  }

  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1) return { ok: false, error: `Unexpected output: ${raw.slice(0, 200)}` };

  let parsed;
  try { parsed = JSON.parse(raw.slice(start, end + 1)); }
  catch { return { ok: false, error: `Could not parse the output: ${raw.slice(0, 200)}` }; }

  const out = {};
  const problems = [];
  for (const lang of TRANSLATION_LANGS) {
    const text = String(parsed[lang] ?? '').trim();
    const problem = checkTranslation(text, lang, tool);
    if (problem) { problems.push(`${lang}: ${problem}`); continue; }
    out[lang] = text;
  }
  if (problems.length) return { ok: false, error: `The translation broke the house rules. ${problems.join('; ')}` };

  return { ok: true, translations: out, hash: hashOf(english) };
}
