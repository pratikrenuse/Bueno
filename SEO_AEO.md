# SEO and AEO for 247spain.es

Read this before any work on search traffic, Google ranking, or being cited by ChatGPT, Claude,
Perplexity or Google AI Overviews. It records what exists, what is set up, and how to carry on,
so a new session never starts from zero.

## Standing rule

Pratik does not do the SEO/AEO work himself. The session executes it end to end, deploys it,
and verifies it. No hand-off plans, no "you do this" lists, no multi-month timelines.

## What is already set up

| Thing | State |
|---|---|
| Google Search Console | Property `247spain.es` verified by DNS TXT. Use it for indexing numbers. |
| Indexing (21 Oct 2026) | 11.5K indexed. 10.2K "Discovered, currently not indexed" (crawl budget and authority, not quality). 27 "Crawled, not indexed". |
| Analytics | Plausible, `plausible.io/247spain.es`. About 25 Google visits a week in Oct 2026. |
| IndexNow | `seo/submit.mjs` runs last in `npm run build` and submits changed URLs (Bing, Yandex, Seznam, Naver). Key file `public/9800fa3e03e5c162747e4e89ec8d351a.txt`. |
| Sitemap | `seo/sitemap.mjs`, index of 4 files, about 22,100 URLs. `lastmod` comes from the content-hash ledger `seo/lastmod.json`. |
| llms.txt | `seo/llms.mjs` writes `llms.txt` and `llms-full.txt`. Google does not use them; other assistants may. |
| robots.txt | `public/robots.txt`. Everything open except `/api/` and `/internal*`. AI search crawlers named explicitly. |

Do not check indexing with a web search `site:` query. The search tool is not Google and it
returned zero on 21 Oct 2026 while Google had 11.5K pages indexed.

## How the pages are built

- Vite SPA. `seo/prerender.mjs` writes a static HTML file for every route in `seo/routes.js`, with
  its own head (`seo/head.js`) and a static block inside `#root`.
- React replaces `#root` on boot. Pages with no component of their own (answers, the answers hub,
  about) are shown by `seo/StaticPage.jsx`, which reuses the static block. It only trusts the
  block when the page canonical matches the URL. Anything else is a not-found page marked
  `noindex`. Before 21 Oct 2026 those pages rendered blank, so Google saw nothing on them.
- Locale prefixes in `src/App.jsx` are spelled out (`no`, `sv`, `de`, `fr`, `nl`). Never go back
  to a bare `/:lang` param; it swallowed `/answers` and every mistyped URL.

## The answers layer (the AEO core)

- `answers/answers.js`: 60 questions, six languages each. Fields: `slug`, `topic`, `tool`, `rules`,
  `q`, `a`.
- Every answer rests only on rules with status `verified` in `rules/`. `aeo_check.mjs` (in
  `npm test`) enforces it, plus 35 to 110 words, question ends in `?`, no dashes, no brand names,
  a topic, and the built page carrying FAQPage, dated Article, publisher and citations.
- Topics on the hub: tax, selling, buying, letting, community, insurance, legal-claims,
  inheritance, residency (`TOPIC_UI` in `seo/routes.js`).
- Each answer page shows its sources, "Checked against the official source on DATE", and links
  to up to 8 related answers and the About page.
- Titles over 95 characters fail `check_seo`. Keep translated questions short.
- To add answers: pick verified rules not yet used, write EN, translate into the five other
  languages with `TRANSLATIONS.md` and the terms already used in `answers.js`, run `npm test`.

## About page

`answers/about.js`, six languages, route kind `about`. Editor Pratik Renuse, sponsored by Bueno.
`seo/head.js` emits AboutPage, Person (editor) and Organization (with sponsor) schema; Articles
carry author and editor.

## Translations

Every tool must render in the page language, not only its title. The audit that found ten tools
showing English on /no /sv /de /fr /nl compared visible words per locale in a real browser. Rerun
it after adding a tool. Tool copy lives in `<tool>/copy.js` (or `<tool>/locales/*.js`), read with
`useCopy`. Shared text lives in `ToolShell.jsx` (CHROME) and `SourceNote.jsx` (WORDS).

## Verify before shipping

```
npm run build          vite, prerender, sitemap, llms, check_seo, IndexNow
npm test               all suites, including aeo_check and indexing_check
npm run serve &
node browser_check.mjs every route mounts and walks
```

Also open a few answer pages and an unknown URL in headless Chromium
(`executablePath: '/opt/pw-browsers/chromium'`) and confirm the answer text is visible and the
unknown URL is `noindex`.

## Deploying

- Production is Vercel, deploying `main` of github.com/pratikrenuse/Bueno.
- A cloud session clones the repo and pushes. Pushing to `main` needs Pratik to approve the
  permission prompt in the session. Ask for that approval in one line; do not leave finished work
  sitting on a side branch.
- Do not run git in Pratik's local copy (`~/Documents/GitHub/Bueno`); GitHub Desktop pulls.
- On the deploy commit, leave `seo/lastmod.json` uncommitted so the Vercel build marks changed
  pages with today's date and IndexNow submits them. Commit the regenerated ledger straight after.

## What moves rankings and citations (research, Oct 2026)

- Google AI Overviews and AI Mode use normal Google ranking. No special markup; llms.txt unused.
  Scaled near-duplicate pages risk the scaled content abuse policy.
- ChatGPT search uses OpenAI's OAI-SearchBot plus partner search (widely understood to include Bing).
  Copilot uses Bing. So Bing coverage matters: IndexNow, and Bing Webmaster Tools.
- Claude's web search uses Brave. Brave has no submission tool; real visitors drive discovery.
- Perplexity and AI answers in general cite Reddit, YouTube, LinkedIn and Wikipedia most.
  Off-site brand mentions are the strongest predictor of AI Overview visibility (Ahrefs, 75K brands).

## Open items

1. Off-site mentions: Reddit answers, LinkedIn articles, press, a getbueno.com link to the tools.
2. Bing Webmaster Tools: import the site from Search Console.
3. Native-speaker review of the AI translations.
4. Town pages stuck in "Discovered, not indexed": more internal links and unique per-town facts.
