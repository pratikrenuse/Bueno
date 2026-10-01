#!/usr/bin/env node
// The fortnightly newsletter research job.
//
// Run by .github/workflows/newsletter-research.yml on the alert day (the Friday before each
// Thursday issue). It asks the site which issue is due, researches the latest Spanish
// property news for foreign owners with Claude and live web search, refreshes the region
// spotlight figures, writes everything into the issue in English, Norwegian and Swedish,
// and then asks the site to send the review email to John and Pratik.
//
// Safe by design:
//   - It only ever writes to an issue that is still pending (the API refuses anything else).
//   - It never sends anything itself. The review email goes through /api/newsletter?action=alert,
//     which holds every email while NEWSLETTER_EMAILS_LIVE is not true.
//   - DRY=1 prints what it found and writes nothing.
//
// Env: SITE (default https://www.247spain.es), CRON_SECRET, ANTHROPIC_API_KEY,
//      RESEARCH_MODEL (optional), DRY (optional).

const SITE = (process.env.SITE || 'https://www.247spain.es').replace(/\/$/, '');
const SECRET = process.env.CRON_SECRET;
const KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.RESEARCH_MODEL || 'claude-sonnet-4-5';
const DRY = process.env.DRY === '1';

if (!SECRET) throw new Error('CRON_SECRET is not set');
if (!KEY) throw new Error('ANTHROPIC_API_KEY is not set');

async function site(action, init = {}) {
  const r = await fetch(`${SITE}/api/newsletter?action=${action}${init.query || ''}`, {
    method: init.method || 'GET',
    headers: { Authorization: `Bearer ${SECRET}`, 'Content-Type': 'application/json' },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  const t = await r.text();
  let j; try { j = JSON.parse(t); } catch { throw new Error(`${action}: ${r.status} ${t.slice(0, 200)}`); }
  if (!r.ok) throw new Error(`${action}: ${r.status} ${j.error || t.slice(0, 200)}`);
  return j;
}

const RULES = `
Writing rules, all languages:
- Every sentence is a complete, natural sentence. No fragments, no label-style stubs.
- No em dashes. No emojis. Calm, factual tone. No fear or penalty-based urgency.
- Never call Bueno a bank. Do not mention Bueno at all in the news items.
- Never name a bank or fintech (Sabadell, BBVA, CaixaBank, Revolut, Wise) as a villain.
- Every number must come from a page you actually read in this search, published in the last 21 days, and you must give its URL.
- Prefer primary or established sources: INE, Notariado, Registradores, Banco de España, BOE, Agencia Tributaria, idealista, Fotocasa, Tinsa, major Spanish newspapers.
- Pick news that matters to foreigners who own or plan to buy a home in Spain: prices, sales, mortgages and Euribor, taxes and filing, rental rules, regional rules, buyers by nationality.
- Norwegian is Bokmål with "du". Swedish uses "du". Use "fastighet" and "fastighetsägare" in Swedish, "bolig" and "boligeier" in Norwegian. Numbers use a decimal comma and a space before % in NO and SV, and a space as thousands separator (€2 112). English uses 7.7% and €2,112.
- Headline: one sentence, under 90 characters. Body: two or three sentences, under 420 characters.
`;

async function research(due, recent) {
  const prompt = `You are researching Bueno Newsletter ${due.number}, which goes out on ${due.send_date} to foreign owners of property in Spain, mainly in Norway, Sweden, Germany, the UK and France.

Task 1. Find the three most important Spanish property news items from the last 14 days for these readers. Do not repeat these earlier headlines: ${JSON.stringify(recent.slice(-12))}.

Task 2. The region spotlight is "${due.region_title}". Its current text is:
${(due.region_paras || []).join('\n')}
Find the latest published figures for this region and rewrite the two paragraphs with them, keeping the same angle and length. If you cannot find newer figures, return the paragraphs unchanged.

${RULES}

Return ONLY a JSON object, no prose, in exactly this shape:
{"news":{"en":[{"title":"","body":""},{"title":"","body":""},{"title":"","body":""}],"no":[...3],"sv":[...3]},
 "region":{"en":["",""],"no":["",""],"sv":["",""]},
 "sources":{"news":["url","url","url"],"region":["url"]}}`;

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 6000,
      tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 12 }],
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(`Anthropic ${r.status}: ${JSON.stringify(j).slice(0, 300)}`);
  const text = (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
  const m = text.match(/\{[\s\S]*\}\s*$/) || text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error(`No JSON in the research answer: ${text.slice(0, 300)}`);
  return JSON.parse(m[0]);
}

function check(out) {
  const problems = [];
  for (const l of ['en', 'no', 'sv']) {
    const n = out.news?.[l];
    if (!Array.isArray(n) || n.length !== 3) problems.push(`news.${l} is not three items`);
    for (const it of n || []) {
      const all = `${it.title} ${it.body}`;
      if (/—/.test(all)) problems.push(`em dash in ${l}: ${it.title}`);
      if (/\bBueno\b/i.test(all)) problems.push(`Bueno named in news (${l})`);
    }
  }
  if (!out.sources?.news?.length) problems.push('no news sources');
  return problems;
}

const { due, recent_titles: recent = [] } = await site('news');
if (!due) { console.log('No issue needs research today.'); process.exit(0); }
console.log(`Researching Newsletter ${due.number} (${due.key}), going out ${due.send_date}.`);

let out, problems = ['not run'];
for (let attempt = 1; attempt <= 2 && problems.length; attempt++) {
  out = await research(due, recent);
  problems = check(out);
  if (problems.length) console.log(`Attempt ${attempt} needs another pass: ${problems.join('; ')}`);
}
if (problems.length) throw new Error(`Research did not pass the checks: ${problems.join('; ')}`);

if (DRY) { console.log(JSON.stringify(out, null, 2)); process.exit(0); }
await site('news', { method: 'POST', body: { key: due.key, news: out.news, region: out.region, sources: out.sources } });
console.log('News written into the issue.');
const alert = await site('alert', { query: `&key=${encodeURIComponent(due.key)}` });
console.log(alert.sent ? 'Review email sent to John and Pratik.' : `Review email not sent: ${alert.reason || alert.email?.error}`);
