// Shared translation helper for the LinkedIn program.
// Translates an approved English master into a team language using the Claude API,
// following the locked glossary in TRANSLATIONS.md. Used by /api/linkedin-translate
// and, just in time, by /api/linkedin-dispatch so an edited post never goes out stale.
import crypto from 'node:crypto';

export const LANGS = {
  nl: { name: 'Dutch', address: 'formal "u"', numbers: 'thousands with a period (100.000), decimals and percent with a comma (1,1%)' },
  sv: { name: 'Swedish', address: 'informal "du"', numbers: 'thousands with a space (100 000), decimals and percent with a comma and space (1,1 %)' },
  no: { name: 'Norwegian Bokmal', address: 'informal "du"', numbers: 'thousands with a space (100 000), decimals and percent with a comma (1,1 %)' },
  es: { name: 'Spanish (Spain)', address: 'informal "tu"', numbers: 'thousands with a period (100.000), decimals and percent with a comma (1,1 %)' },
  fr: { name: 'French', address: 'formal "vous"', numbers: 'thousands with a space (100 000), decimals and percent with a comma (1,1 %)' },
};

const GLOSSARY = {
  nl: 'non-resident=niet-resident, property=woning, property owner=eigenaar, cadastral value=kadastrale waarde, rental income=huurinkomen, electricity=elektriciteit, tax return=aangifte, deduction=aftrek, mortgage=hypotheek, fees=kosten, deadline=deadline, account=rekening',
  sv: 'non-resident=icke-resident, property=fastighet, property owner=fastighetsagare, cadastral value=taxeringsvarde, rental income=hyresintakt, electricity=el, tax return=deklaration, deduction=avdrag, mortgage=bolan, fees=avgifter, account=konto, EU/EEA residents=Bosatta i EU och EES',
  no: 'non-resident=ikke-resident, property=bolig, property owner=boligeier, cadastral value=ligningsverdi, rental income=leieinntekt, electricity=strom, tax return=skattemelding, deduction=fradrag, mortgage=boliglan, fees=gebyrer, deadline=frist, account=konto',
  es: 'use the native Spanish terms directly (arras, Nota Simple, plusvalia, escritura publica, Ley de Propiedad Horizontal, Agencia Tributaria) with correct accents',
  fr: 'non-resident=non-resident, property=bien (immobilier), property owner=proprietaire, cadastral value=valeur cadastrale, rental income=revenu locatif, electricity=electricite, tax return=declaration, deduction=deduction, mortgage=pret immobilier, fees=frais, deadline=echeance, account=compte',
};

const KEEP = 'Bueno, Spain 24/7, Modelo 210, IBAN, Visa, IBI, Basura, IVA, NIE, valor catastral, and every Spanish legal term used in the source (arras, Nota Simple, plusvalia, escritura publica, Ley de Propiedad Horizontal, declaracion responsable, Consorcio de Compensacion de Seguros)';

export const hashText = (s) => crypto.createHash('sha1').update(String(s)).digest('hex');

// Accepts the common env var spellings so a naming mismatch never silently disables
// automatic translation.
export const getApiKey = () =>
  process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_KEY || '';

export async function translatePost({ apiKey, lang, title, text }) {
  const L = LANGS[lang];
  if (!L) throw new Error(`Unsupported language: ${lang}`);

  const prompt = `Translate this LinkedIn post into ${L.name}.

Rules, all mandatory:
- Not a literal translation. It must read as if written by a native ${L.name} speaker who knows Spanish property, keeping the warm, spoken, human register of the English.
- Address the reader with ${L.address}.
- Number formatting: ${L.numbers}. The euro symbol goes before the amount.
- Do NOT translate: ${KEEP}.
- Preferred terms: ${GLOSSARY[lang]}.
- Preserve EVERY number, date, deadline, law name, percentage and worked example exactly.
- Keep the same paragraph breaks and blank lines.
- Keep the final hashtag line EXACTLY as it appears in the English, untranslated.
- No em dashes, no en dashes, no emojis. Never describe Bueno as a bank.
- Keep the first line punchy and under 200 characters.

Return ONLY valid JSON, no other text, in this exact shape:
{"title": "<translated title, max 45 characters>", "post_text": "<the full translated post>"}

English title: ${title}

English post:
${text}`;

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      // Sonnet 5 by default (good at nuanced translation, roughly 1 cent per post per
      // language). Set TRANSLATE_MODEL=claude-haiku-4-5-20251001 in Vercel to halve that.
      model: process.env.TRANSLATE_MODEL || 'claude-sonnet-5',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Claude API ${r.status}: ${JSON.stringify(j).slice(0, 300)}`);
  const raw = (j.content && j.content[0] && j.content[0].text || '').trim();
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error(`Unexpected model output: ${raw.slice(0, 200)}`);

  let out;
  try { out = JSON.parse(raw.slice(start, end + 1)); }
  catch (e) { throw new Error(`Could not parse model JSON: ${raw.slice(0, 200)}`); }
  if (!out.post_text) throw new Error('Model returned no post_text');

  // Safety net on the house rules the model must never break.
  out.post_text = String(out.post_text).replace(/[—–]/g, ',');
  out.title = String(out.title || title).slice(0, 45);
  return out;
}

// Ensures translation rows for one English master are present and current.
// Returns { updated: [...], failed: [...], skipped: [...] }.
export async function syncTranslations({ apiKey, url, headers, post, langs }) {
  const sourceText = post.edited_text || post.post_text;
  const want = hashText(sourceText);
  const result = { updated: [], failed: [], skipped: [] };

  const tr = await fetch(
    `${url}/rest/v1/linkedin_posts?slug=eq.${encodeURIComponent(post.slug)}&audience=eq.${post.audience}&language=in.(${langs.join(',')})&select=id,language,source_hash`,
    { headers });
  if (!tr.ok) throw new Error(`Supabase translations read ${tr.status}: ${await tr.text()}`);
  const existing = {};
  (await tr.json()).forEach(t => { existing[t.language] = t; });

  for (const lang of langs) {
    const row = existing[lang];
    if (row && row.source_hash === want) { result.skipped.push(lang); continue; }
    try {
      const out = await translatePost({ apiKey, lang, title: post.title, text: sourceText });
      const body = {
        slug: post.slug, batch: post.batch, day: post.day, language: lang, member: '',
        audience: post.audience, title: out.title, post_text: out.post_text,
        image_url: post.image_url, status: 'approved', source_hash: want,
        edited_text: null, updated_at: new Date().toISOString(),
      };
      const w = row
        ? await fetch(`${url}/rest/v1/linkedin_posts?id=eq.${row.id}`, {
            method: 'PATCH', headers: { ...headers, Prefer: 'return=minimal' }, body: JSON.stringify(body) })
        : await fetch(`${url}/rest/v1/linkedin_posts`, {
            method: 'POST', headers: { ...headers, Prefer: 'return=minimal' }, body: JSON.stringify(body) });
      if (!w.ok) throw new Error(`Supabase write ${w.status}: ${await w.text()}`);
      result.updated.push(lang);
    } catch (e) {
      result.failed.push(`${lang}: ${String((e && e.message) || e).slice(0, 160)}`);
    }
  }
  return result;
}
