#!/usr/bin/env node
// What Google actually shows us, pulled from Search Console, and what to write next.
//
//   GOOGLE_SERVICE_ACCOUNT_JSON='{...}' node seo/gsc_report.mjs [out-folder]
//
// Reads the last 28 days from the Search Analytics API for the domain property and writes
// gsc-report.md (and .json) with:
//   - the queries and pages that earn impressions, with clicks, CTR and average position
//   - pages ranking on page two (positions 8 to 20), where a better title or answer moves most
//   - question shaped queries that no answer on the site matches yet: the next answers to write
// The same service account as the sitemap resubmit (seo/submit.mjs) is used, read only scope.
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { googleAccessToken, GSC_PROPERTY } from './submit.mjs';
import { ANSWERS } from '../answers/answers.js';

const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
if (!raw) { console.error('gsc_report: set GOOGLE_SERVICE_ACCOUNT_JSON'); process.exit(1); }
const creds = JSON.parse(raw);
const out = process.argv[2] || '.';
const token = await googleAccessToken(creds, 'https://www.googleapis.com/auth/webmasters.readonly');
if (!token) { console.error('gsc_report: could not get an access token'); process.exit(1); }

const day = d => new Date(Date.now() - d * 864e5).toISOString().slice(0, 10);
async function query(dimensions, rowLimit = 500) {
  const r = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_PROPERTY)}/searchAnalytics/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ startDate: day(30), endDate: day(2), dimensions, rowLimit }),
  });
  if (!r.ok) throw new Error(`Search Console ${r.status}: ${await r.text()}`);
  return (await r.json()).rows || [];
}

const queries = await query(['query']);
const pages = await query(['page']);
const fmt = r => `${r.clicks} clicks, ${r.impressions} impressions, CTR ${(r.ctr * 100).toFixed(1)} percent, position ${r.position.toFixed(1)}`;

// A question we already answer, in any language, is not a gap.
const known = ANSWERS.flatMap(a => Object.values(a.q)).map(q => q.toLowerCase());
const words = q => new Set(q.toLowerCase().match(/[a-zà-ÿ0-9]{4,}/g) || []);
const covered = q => known.some(k => { const a = words(q), b = words(k); let n = 0; for (const w of a) if (b.has(w)) n++; return a.size && n / a.size >= 0.6; });
const QUESTION = /^(how|what|when|do|does|can|is|are|who|which|why|should|hvordan|hva|når|kan|må|hur|vad|när|måste|wie|was|wann|muss|kann|comment|quand|quel|quelle|faut|hoe|wat|wanneer|moet)\b/i;
const gaps = queries.filter(r => QUESTION.test(r.keys[0]) && !covered(r.keys[0])).slice(0, 60);
const pageTwo = pages.filter(r => r.position >= 8 && r.position <= 20).sort((a, b) => b.impressions - a.impressions).slice(0, 40);

const md = [
  `# Search Console report, ${day(30)} to ${day(2)}`, '',
  `## Top queries`, ...queries.slice(0, 50).map(r => `- ${r.keys[0]}: ${fmt(r)}`), '',
  `## Top pages`, ...pages.slice(0, 50).map(r => `- ${r.keys[0]}: ${fmt(r)}`), '',
  `## Pages on page two (positions 8 to 20), most impressions first`, ...pageTwo.map(r => `- ${r.keys[0]}: ${fmt(r)}`), '',
  `## Questions people search that no answer covers yet`, ...gaps.map(r => `- ${r.keys[0]}: ${fmt(r)}`), '',
].join('\n');

mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'gsc-report.md'), md);
writeFileSync(join(out, 'gsc-report.json'), JSON.stringify({ queries, pages, pageTwo, gaps }, null, 2));
console.log(`gsc_report: ${queries.length} queries, ${pages.length} pages, ${gaps.length} unanswered questions -> ${join(out, 'gsc-report.md')}`);
