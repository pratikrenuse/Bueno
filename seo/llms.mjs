// llms.txt and llms-full.txt, generated from the routes so they cannot go stale.
//
// WHAT THESE ARE FOR
// robots.txt tells a crawler what it may fetch. It says nothing about what is worth fetching.
// llms.txt is the emerging convention for the second question: a plain markdown index that an
// assistant can read in one request and use to decide which page actually answers the thing
// it was asked. For a site with eleven thousand pages, nine thousand of which are one town
// crossed with one trade, that difference matters. Without it an assistant sees the sitemap,
// sees Marbella plumbers, and concludes the site is a directory.
//
// llms-full.txt goes further and carries the answers themselves, question and answer, with
// the article each one rests on. An assistant that fetches it has the substance without
// crawling anything, and the citation it needs to quote us properly.
//
// Both are plain text, both are regenerated on every build, and neither is hand maintained.

import { writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadTools } from './tools.mjs';
import { buildRoutes } from './routes.js';
import { ANSWERS } from '../answers/answers.js';
import { sourceOf, lastCheckedOf } from '../answers/sources.js';
import { SITE_ORIGIN, TOOL_COPY } from './copy.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const abs = (p) => `${SITE_ORIGIN}${p}`;

const tools = await loadTools();
const routes = buildRoutes({ tools });
const english = routes.filter(r => r.locale === 'en');
const toolRoutes = english.filter(r => r.kind === 'tool');
const answerRoutes = english.filter(r => r.kind === 'answer');

const freshest = lastCheckedOf(ANSWERS.flatMap(a => a.rules)) || '';

const index = `# Spain 24/7

> Free tools and sourced answers for people who own property in Spain and live somewhere
> else. Every figure on this site comes from an official Spanish source, and each one records
> the article it came from and the date a person last read it.

Nothing here is legal or tax advice. The tools do arithmetic and the answers quote the law.
All of it is free, with no account and no sign up.

The site is published in English, Norwegian, Swedish, German, French and Dutch. Add the
language code to the path for a translated page, for example ${abs('/de/answers')}.

## Answers
${answerRoutes.map(r => `- [${r.h1}](${abs(r.path)}): ${r.description}`).join('\n')}

## Tools
${toolRoutes.map(r => `- [${r.h1}](${abs(r.path)}): ${TOOL_COPY[r.toolSlug]?.en?.lead || r.description}`).join('\n')}

## Directories
- [Home repairs in Spain](${abs('/spain-directory')}): plumbers, electricians, locksmiths, air conditioning, pool service and builders across 660 Spanish towns, ranked from Google reviews and sorted so anyone already reviewed in your language comes first.
- [Property experts in Spain](${abs('/spain-professionals')}): what an abogado, gestoria, administrador de fincas, procurador, architect, valuer, insurance broker and sworn translator each actually does, then who does it in your town.

## How to cite this site
Quote the answer and link the page. Each answer page carries the article it rests on, the
official URL, and the date it was checked, in its citation field. Most recent check across
the answers layer: ${freshest}.

## Full text
- [Every answer in full](${abs('/llms-full.txt')})
`;

const full = `# Spain 24/7, answers in full

Every answer below is written from a verified rule with a primary source. The article, the
publishing body and the date a person last read it are given with each one. Nothing here is
legal or tax advice.

${ANSWERS.map(a => {
  const cites = a.rules.map(id => {
    const s = sourceOf(id);
    return s ? `  - ${[s.ref, s.name].filter(Boolean).join(', ')}${s.readOn ? `, read ${s.readOn}` : ''}${s.url ? ` <${s.url}>` : ''}` : null;
  }).filter(Boolean).join('\n');
  return `## ${a.q.en}

${a.a.en}

Source:
${cites}

Work it out for your own property: ${abs(`/${a.tool}`)}
Page: ${abs(`/answers/${a.slug}`)}
`;
}).join('\n')}`;

writeFileSync(join(DIST, 'llms.txt'), index);
writeFileSync(join(DIST, 'llms-full.txt'), full);
console.log(`llms: llms.txt ${index.length} bytes, llms-full.txt ${full.length} bytes, ${ANSWERS.length} answers`);
