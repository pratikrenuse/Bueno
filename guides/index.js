// Long-form guides. One JSON file per guide in this folder, all six languages inside it.
//
// WHY GUIDES AS WELL AS ANSWERS
// An answer is one quotable paragraph. A guide is the whole subject: how buying works, what
// owning costs every year, what happens when an owner dies. Google rewards depth on a topic,
// and an assistant asked a broad question looks for a page that covers it. Each guide links
// down to the answers it contains and the tool that does the arithmetic, and they link back.
//
// EVERY FACT IS SOURCED
// `rules` lists the rule ids the guide relies on. guide_check.mjs refuses a guide whose rules
// are missing or not verified, and the page shows those sources under the text.
//
// NODE ONLY. Read by seo/routes.js and seo/llms.mjs at build time, never by the browser.

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));

export const GUIDES = readdirSync(DIR)
  .filter(f => f.endsWith('.json'))
  .sort()
  .map(f => JSON.parse(readFileSync(join(DIR, f), 'utf8')))
  .sort((a, b) => (a.order || 99) - (b.order || 99) || a.slug.localeCompare(b.slug));
