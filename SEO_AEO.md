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
| robots.txt | `public/robots.txt`. Everything open except `/api/` and `/internal*`. AI search crawlers named explicitly. `Content-Signal: search=yes, ai-input=yes, ai-train=yes`. |
| Google sitemap ping | `seo/submit.mjs` resubmits the sitemap to Search Console through the API on every production build (`sitemaps.submit`, property `sc-domain:247spain.es`, falls back to the URL-prefix property). Needs env var `GOOGLE_SERVICE_ACCOUNT_JSON` in Vercel and the service account added as an Owner in Search Console. Google has no indexing push for ordinary pages; this is the most it accepts. |
| Weekly GSC report | `seo/gsc_report.mjs`, run by `.github/workflows/gsc-report.yml` (source copy in `seo/workflows/`, since remote tools cannot write `.github`) every Monday 06:00 UTC (and on demand). Top queries, top pages, page-two pages (positions 8 to 20) and question queries no answer covers yet. Uploaded as a workflow artifact, nothing committed. Needs GitHub secret `GOOGLE_SERVICE_ACCOUNT_JSON`. Use its "not covered" list to pick the next answers. |
| Markdown copies | Every answer, guide, both hubs and the about page also exist as `<url>.md` (frontmatter: title, canonical_url, language, last_checked). Each HTML page links its copy with `<link rel="alternate" type="text/markdown">`; llms.txt says so. |
| Clickable sources | Answers and guides link each official source (BOE, AEAT, Catastro and so on) by URL, from the rules' `source.url`. Statistics plus primary-source links are what the GEO research found raises citation. |

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

## Adding more content

Follow `content/README.md`: the eight step pipeline (verify rules, draft, fact check, translate
per language, merge with `content/merge-answers.mjs` and `content/merge-guides.mjs`, gate with
`npm test`). `locale_check.mjs` fails the build if any page family is missing a language.

## Guides (long form)

- `guides/<slug>.json`, one file per guide with all six languages in `i18n`, loaded by
  `guides/index.js` (node only). Routes `/guides` (hub by topic) and `/guides/<slug>`, rendered
  by `seo/StaticPage.jsx` from the prerendered block, with Article schema, sources and a checked date.
- 31 guides as of 22 Oct 2026 (buying, tax, selling, letting, community, home, insurance, claims,
  inheritance, residency). Every fact rests on verified rules listed in `rules`. `guide_check.mjs`
  (in `npm test`) enforces six languages, matching structure, title and description lengths, no
  dashes, no brands, verified rules and existing answer links. Only fully translated guides publish.
- Workflow that worked: research verified rules first, write English from rules only (old
  articles in `studio/articles` for topic and structure, never their figures), independent fact
  check against the rules, then translate per language, then merge and run the gates.

## Rules base growth (22 Oct 2026)

New verified files: `rules/buying.json`, `owning.json`, `letting.json`, `residency.json`,
`inheritance.json` (about 170 verified rules). `answers/sources.js` finds rules anywhere in a
file (any object with id and status). 190 answers in six languages.

Watch list: Real Decreto-ley 28/2026 and 29/2026 (leases, rent updates, short-stay VAT from
1 December 2026) await validation by Congress; rules are partial with review_by 2026-11-30.
If confirmed, update the letting rules, the rental-vat tool and the answers on holiday-let IVA.
`lau.2025_2026_reform` is outdated and marked partial.

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

- Claude writes the finished, tested changes straight into Pratik's local folder
  `/Users/pratikrenuse/Documents/GitHub/Bueno`. Pratik commits and pushes from GitHub Desktop, and
  Vercel deploys `main`.
- Never push from a cloud session, and never create branches or pull requests. Building and testing
  in a cloud clone is fine; the result goes into the local folder.
- Do not run git in the local folder.
- Do not overwrite `seo/lastmod.json` from a local build. The Vercel build works out which pages
  changed and IndexNow submits them.

## What moves rankings and citations (research, Oct 2026)

- Google AI Overviews and AI Mode use normal Google ranking. No special markup; llms.txt unused.
  Scaled near-duplicate pages risk the scaled content abuse policy.
- ChatGPT search uses OpenAI's OAI-SearchBot plus partner search (widely understood to include Bing).
  Copilot uses Bing. So Bing coverage matters: IndexNow, and Bing Webmaster Tools.
- Claude's web search uses Brave. Brave has no submission tool; real visitors drive discovery.
- Perplexity and AI answers in general cite Reddit, YouTube, LinkedIn and Wikipedia most.
  Off-site brand mentions are the strongest predictor of AI Overview visibility (Ahrefs, 75K brands).

## Checked against the "11 AEO optimizations" post (22 Oct 2026)

- Accessibility tree: axe-core on home, hubs, answers, guides and all 25 tools in a real browser.
  No unnamed buttons, links or form fields, no images without alt. Missing `<main>` on the home page
  and four calculators was fixed (`.calc-main`). OpenAI says ChatGPT Atlas reads ARIA, so keep it clean.
- Raw HTML: AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Meta) do not run JavaScript. Tool pages
  now carry their top 3 verified answers in the prerendered HTML (`faq` on tool routes,
  `.tool-faq` in the static block) and show the same text to visitors above the footer
  (`SiteFooter.jsx` via `seo/toolFaq.js`). Question as the H2, short answer under it.
- robots.txt names `meta-webindexer` (Meta AI search citations) and `meta-externalagent`.
- Internal links: zero broken across 23,075 pages, except `/favicon.png`, which every page
  references and does not exist. Needs a Spain 24/7 icon (brand decision, not made yet).

## Open items

0. One-time Search Console API setup (needs Pratik's Google login): service account with the
   Search Console API enabled, added as Owner of `sc-domain:247spain.es`, key JSON in Vercel env
   and GitHub secret `GOOGLE_SERVICE_ACCOUNT_JSON`. Until then the ping and the report skip quietly.
1. Off-site mentions: Reddit answers, LinkedIn articles, press, a getbueno.com link to the tools.
2. Bing Webmaster Tools: import the site from Search Console.
3. Native-speaker review of the AI translations.
4. Town pages stuck in "Discovered, not indexed": more internal links and unique per-town facts.
