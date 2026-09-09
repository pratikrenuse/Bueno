# Getting Spain 24/7 into search results

The site is a Vite single-page app on Vercel. Today every URL serves the same `index.html`
with one title, one description, and no sitemap. Google can render the JavaScript, so it
sees the app, but every page looks identical in the index and nothing links the deep pages
together. That is the whole problem.

## The decision that was made, and why

660 towns x 14 categories x 6 languages is 55,440 pages. We are publishing about 2,000
instead: 133 priority towns x 14 categories in English, plus province, coast and category
hubs and the 20 static pages in all six languages.

A domain with no authority gets a crawl budget in the thousands. Publish 55,000
near-identical pages and Googlebot samples a few, finds them thin, and lowers its estimate
of the whole site. `seo/priority.js` holds the town list and expanding it is a one line
change once pages start ranking.

## THE COMPLIANCE LINE, WHICH IS NOT NEGOTIABLE

**No Google Places content may appear in a prerendered static file.** No business names, no
addresses, no phone numbers, no ratings, no review text.

Google's terms cap caching of Places content at 30 days. A static HTML file sitting on a
CDN and indexed by search engines is, in practice, permanent publication. Baking listings
into it would breach the terms and would also be impossible to expire.

So the static HTML carries **our own content only**: the town, its province and coast, what
that trade or profession does, what to ask, what it typically involves. The listings load
client side from `/api/directory` exactly as they do now. That is both compliant and
perfectly indexable, because the page still has a unique title, heading and body about
"plumbers in Javea".

If you are ever unsure whether something can go in a static file, ask: did it come from
Google? If yes, it does not go in.

## How prerendering works here, and why it is done this way

No React server rendering. No new framework. The build writes one static HTML file per URL
by taking `dist/index.html` and replacing two things:

1. **The `<head>`**, with a title, description, canonical, hreflang set, Open Graph and
   JSON-LD unique to that URL.
2. **The contents of `<div id="root">`**, with a block of real, readable HTML about that
   page.

`createRoot(...).render(...)` replaces the children of `#root` when the app boots, so that
static block is a genuine no-JavaScript fallback that React paints over. It is not cloaking:
it says the same thing the rendered page says. It must stay that way. Never put text in the
static block that the app does not also show.

This is deliberately boring. It cannot break the app, because the app never sees it.

## URL shape

Paths, not query strings. A query string cannot be a static file, cannot be a canonical URL
and is not reliably indexed.

```
/spain-directory                       category hub, trades
/spain-directory/javea                 town hub, every trade in that town
/spain-directory/javea/plumber         the page that should rank
/spain-professionals/javea/lawyer
/areas                                 all provinces
/areas/alicante                        province hub
/coast/costa-blanca                    coast hub
/no/spain-directory/javea/plumber      any of the above, in one of six locales
```

Old `?town=javea&trade=plumber` links still resolve and rewrite themselves to the path
form. That is already wired in `useDirectory.js`. Do not remove it.

Locale prefixes: English is unprefixed, the other five are `/no`, `/sv`, `/de`, `/fr`,
`/nl`.

## Every page needs

- **Title** under about 60 characters, unique, the specific thing first. "Plumbers in Javea,
  ranked from Google reviews" beats "Spain 24/7 | Plumbers".
- **Description** 140 to 160 characters, unique, a reason to click rather than a summary.
- **Canonical**, absolute, `https://www.247spain.es/...`.
- **hreflang** for all six locales plus `x-default`, all absolute, and every one of them
  must point at a URL that actually exists.
- **Open Graph** title, description, url, type, locale.
- **JSON-LD**: `WebSite` on the home page, `BreadcrumbList` on anything nested,
  `SoftwareApplication` on a tool page, `FAQPage` only where the page really does answer
  those questions on screen.
- **A real H1** in the static block, different from the title tag.
- **Internal links out.** A page nothing links to is a page Google finds late and trusts
  little. The town picker is a `<select>`, which is not a link and passes nothing, which is
  why the hub pages exist.

## Brand rules, without exception

- No em dashes anywhere, in copy or code comments. No emojis.
- This is Spain 24/7. Never mention Bueno, and never name a bank, insurer or utility.
- No "revolutionary", "disruptive", "game-changing". No fear-based urgency. No overpromising.
- Short, natural sentences. Each earns its place.
- Colours only from the tokens in `src/App.css`. Never a new hex.
- Never claim a business speaks a language. The directory says "reviewed in Norwegian",
  never "speaks Norwegian", and SEO copy must not undo that.

## Honesty, which matters more here than usual

SEO copy is where sites lie. Do not write "the best plumbers in Javea, hand picked by our
team". We have not met them and the page says so. Do not invent a number of businesses, an
average price, or a response time. If a page cannot say something specific and true about
its town, it should say something specific and true about the trade instead.

Templated is fine. Fabricated is not.

## The hub pages, and the one thing that is easy to get wrong

`/areas`, `/areas/<province>` and `/coast/<coast>` exist because the town picker on both
directories is a `<select>`. A person can use one. A crawler cannot: it is not a link and
it passes nothing on. Without the hubs, all 1,862 town pages are orphans.

The subtler half of the same problem: `createRoot().render()` replaces the static block the
moment the app boots, and Google renders JavaScript. So a page whose only links live in the
prerendered HTML has no links at all as far as the renderer is concerned. That is why
`seo/PageLinks.jsx` prints the same links on the page itself.

Both copies come from `seo/hubs.js`, which is the only place hub content is defined.
`seo/routes.js` reads it for the file, the React pages read it for the screen. Do not hand
write copy or links into either one: if the two ever disagree, the static block stops being
a fallback and becomes cloaking.

## Verify

```
npm run build                       vite, prerender, sitemap, check_seo
npm test                            rules, fit, ranking, router, api surface
npm run serve &                     serves dist the way Vercel does
node browser_check.mjs              rendered page vs the file it came from
node smoke.mjs                      against production, AFTER the deploy
```

`browser_check.mjs` needs a browser: `npx playwright install chromium` once.

Two of these catch things nothing else does. `browser_check.mjs` compares the rendered h1
to the static h1 and fails on drift, and it loads every route in the app, because a
component that is used but never imported passes `vite build` and fails as a blank screen
in the browser. `smoke.mjs` asks production whether each page arrived as its own file with
its own canonical, which is the only way to know the prerendered files are actually being
served ahead of the catch-all rewrite.
