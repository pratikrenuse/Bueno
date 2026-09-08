# Spain 24/7 Trades Directory - runbook

`/spain-directory` shows the best reviewed plumbers, electricians, locksmiths, air
conditioning engineers, pool services and builders in 660 Spanish localities across all 52 provinces, ranked from
Google reviews.

Two things shipped together. The directory itself, and a consolidation of the LinkedIn
endpoints that had to happen first because the deployment was sitting on the Hobby plan's
12 function limit with no room left.

---

## Setup

**Commit and push. Then add one environment variable. That is the whole of it.**

There is no database to create and no SQL to run. `api/directory.js` makes its own
Supabase Storage bucket (`directory-cache`) the first time it needs one, using the
service key already in the environment.

### The one variable

Vercel, project settings, Environment Variables:

| Name | Value |
|---|---|
| `GOOGLE_PLACES_KEY` | see below |
| `DIRECTORY_DAILY_BUDGET` | optional, defaults to 30 |

**Environment variable changes do not apply until you redeploy.** Vercel, Deployments,
latest, Redeploy.

### Getting the key

This part cannot be scripted, because it is a Google billing account.

1. console.cloud.google.com, new project, for example `spain247-tools`.
2. Enable billing on it. The card is required even though normal use stays free.
3. APIs and Services, Library, enable **Places API (New)**. Not the legacy Places API.
4. Credentials, Create credentials, API key.
5. Restrict it: Application restrictions **None** (the key is only ever used server side
   from the Vercel function, so a referrer restriction would break it), API restrictions
   **Places API (New)** only.
6. Set the two guards, which matter more than the restriction:
   - Billing, Budgets and alerts, new budget, **5 EUR**, alerts at 50/90/100%.
   - APIs and Services, Places API (New), Quotas, daily request cap **50**. This is the
     hard stop. Even a total misconfiguration cannot bill more than a few euro.

### Check it

```
https://<site>/api/directory?health=1&pass=<INTERNAL_PASSCODE>
```

Reports every env var, whether the cache bucket exists yet, and how much of today's
budget is left. Spends no Google credit. Before the first lookup it will say the bucket
is "not created yet", which is correct and not an error.

Then open `/spain-directory`, pick Javea, pick Plumber. First request for any pair takes
a second or two because it calls Google. Everything after that is instant.

---

## What changed to the LinkedIn tool

Nothing about how it behaves. Worth reading anyway, because the file layout moved.

The eight `api/linkedin-*.js` handlers were copied byte for byte to `api/_lk_<action>.js`
and are now served by one function, `api/linkedin/[action].js`. Vercel does not route
files whose name starts with `_`, so the whole LinkedIn surface costs one function slot
instead of eight.

| Before | After |
|---|---|
| 12 deployed functions (at the cap) | 6 deployed functions |
| `api/linkedin-posts.js` | `api/_lk_posts.js`, served by `api/linkedin/[action].js` |

Every original URL still works. `vercel.json` rewrites `/api/linkedin-decide` to
`/api/linkedin/decide` and so on for all eight, so the review deck needed no change,
approval links already sitting in inboxes keep working, and the two crons now point at
`/api/linkedin/dispatch` and `/api/linkedin/remind` on their existing schedules.

The nine original `api/linkedin-*.js` files are still in the repo but listed in
`.vercelignore`, so they are not deployed. Leave them for one release as a fallback, then
delete them; nothing imports them.

**Rollback if LinkedIn misbehaves:** delete the eight `api/linkedin-*.js` lines from
`.vercelignore` and delete `api/linkedin/[action].js`. That restores the old routing
exactly. It puts you back at 12 functions, so remove `api/directory.js` at the same time.

---

## What it costs

Zero, and the design is what keeps it there rather than good intentions.

Google bills per API call, not per visitor. One `(locality, trade)` pair is one object in
the bucket, refreshed at most once every 30 days, so a locality with a thousand visitors
in a month still costs one Google call. Thirty days is also the longest Google's terms
allow their content to be cached, so the cheapest behaviour and the compliant behaviour
are the same behaviour.

One call gets everything. Text Search (New) returns name, address, phone, website,
rating, review count and review text in a single response, so there is no second Place
Details lookup. That call bills as Enterprise + Atmosphere: **1,000 free per month**, $40
per 1,000 after.

- 660 localities x 6 trades = **3,960 objects**, but that number never becomes a bill:
  it is the size of the catalogue, not the spend. A cell only costs a Google call when
  somebody actually opens it, and then not again for 30 days.
- `DIRECTORY_DAILY_BUDGET` of 30 caps the month at 900 even if something goes wrong.
- Both sit inside the 1,000 free allowance.

The daily budget, not the length of the list, is what keeps this free. Coverage can grow
as far as you like; `DIRECTORY_DAILY_BUDGET` is the ceiling, and the Google Cloud budget
cap behind it is the hard stop.

`spain-directory/localities.js` is generated (see the header comment in that file).
Hand-added resort towns under the population threshold are kept verbatim on every rebuild.
**Never rename or renumber a slug**: slugs are in live URLs and are the cache keys, so
changing one breaks shared links and orphans a cell you already paid an API call for.

---

## What must not be removed

Google's terms are why several things on the page look the way they do.

- The "Ratings and reviews from Google Maps" line under the results.
- On every quoted review: the reviewer's name, photo, profile link, and the link to the
  review itself on Google Maps.
- The "How these were ordered" block. Google requires a plain statement of how results
  were ordered and filtered.
- The 30-day rule. `api/directory.js` deletes an object older than 30 days on sight and
  refetches. If it cannot refetch it, it reports the locality as temporarily unavailable.
  Do not "fix" that by serving the stale copy.

One more, ours rather than Google's: the "What this is, and what it is not" block. We
have not met these businesses and have not checked their licences or insurance. The page
says so, and it should keep saying so.

**Do not put these results on a map.** Google Places content may be displayed with no map
at all, which is what we do, but never alongside a non-Google map. Adding Leaflet or
Mapbox to that page would breach the terms.

---

## Language matching, and the honesty rule behind it

The directories now answer a question Google does not: has this business already served
somebody who writes in your language.

`api/_fit.js` derives two things from the reviews we already fetch and pay for.

**The language a review was written in.** We ask Google for reviews in English, so `text`
comes back translated and `originalText.languageCode` is what the customer actually typed.
A review written in Norwegian is a Norwegian customer. That is the strongest signal on the
page and it costs nothing extra.

**Phrases in the review text.** Because `text` arrives in English whatever the source
language, one set of English patterns catches a phrase in any of them. Five categories:
language, remote ownership, updates to an absent owner, written quotes and invoices, and
access to an empty property.

### The rule that governs all of it

None of this establishes a fact about a business. A business reviewed in Norwegian has
probably served a Norwegian customer. **It has not told us it speaks Norwegian, and the
page must never say that it does.**

- The page says "Reviewed twice in Norwegian", never "Speaks Norwegian".
- It says "A reviewer mentions English", never "English spoken".
- No evidence means **we do not know**, not "no", and the page says so in those words.
- Every signal is shown with the quote it came from.

`DirectoryCompliance.jsx` renders all of this. Do not write a second badge component.

### Negation is why this is safe

"They spoke English" and "They did not speak English at all" contain the same phrase. The
negation guard in `_fit.js` isolates the sentence around a match, removes the fixed phrases
where a negative word carries a positive meaning ("no problem", "no hidden costs"), and
discards the match if any negation or conditional cue survives. It is deliberately blunt
and loses some true positives. That is the right side to be wrong on: a missed signal costs
nothing, a false one puts a claim on a business the evidence does not support.

Two patterns opt out, because the negative word IS the signal ("we were not there"). They
are marked `ownNegation: true` rather than special-cased inside the guard.

`node api/_fit.test.mjs` covers 75 cases, most of them negatives.

### One thing to check with Google before this scales

These signals are derived from Places content, stored in the same cell as the reviews they
came from, expire on the same 30 day clock, and are only ever shown next to the review that
produced them with attribution intact. That is our reading of the terms and it is a
reasonable one. It has not been confirmed with Google. Before this feature is promoted
heavily, somebody should confirm that deriving and briefly storing an attribute from review
text sits inside the Maps Platform terms, because the answer changes the design rather than
the wording.

---

## The two directories are now two pages

They used to share `DirectoryView.jsx`, which kept the ranking and the attribution rules in
one place and made a plumber page and a lawyer page look identical. Visitors said it was
confusing, and a burst pipe and choosing a lawyer are not the same job.

- **Logic stays shared** in `useDirectory.js` and `directory-ranking.js`: the town list, the
  fetch, the URL round trip, the language preference, the ranking.
- **Compliance stays shared** in `DirectoryCompliance.jsx`: attribution, the per-review
  author and links, the ordering disclosure, the language and fit labels. A redesign of
  either page cannot quietly drop one of them.
- **Presentation is split.** `/spain-directory` is navy, dense, phone first, minimal
  reading. `/spain-professionals` is off-white, spacious, a column-aligned comparison with
  an explainer for each profession. `shots-dir.mjs` fails if the two pages ever share a
  dominant surface colour again.

`DirectoryView.jsx` is dead. Nothing imports it. Keep it one release as a reference for the
old markup, then delete it.

### Ranking with a language preference

`rankForLanguage` sorts by evidence band first, then by the Bayesian review score inside
each band. A business with no language evidence is not buried; it keeps its place among the
others that also have none, in rating order, because a plumber with 400 reviews and no
foreign customers yet is still probably a good plumber.

`node directory-ranking.test.mjs` covers 22 cases.

### Cache version

`CACHE_VERSION` is `v4`. The bump was needed because the stored cell shape changed: it now
carries `fit_langs`, `fit_evidence`, `fit` and `reviews_analysed`. v3 cells are simply not
read. There is no migration and none is needed, because a cell is at most 30 days old.

We now analyse five reviews per business and display three. Google returns up to five in
the response we already pay for, so this doubled the signal for no extra spend, which is
why the analysed count is reported on the page.

### Testing the directories without spending a Google call

`places.googleapis.com` is not reachable from the build environment. `mockserve.mjs` serves
`dist/` with an SPA fallback and a stubbed `/api/directory` whose fixture exercises every
branch: a business reviewed in Norwegian, one reviewed only in English, one with a phrase
mention and no foreign review, and one with nothing at all. `shots-dir.mjs` drives both
directories against it and fails on an unresolved translation key, a rendered `undefined`,
horizontal overflow, a missing attribution or ordering disclosure, a review quote with no
links, or any sentence that turns evidence into a claim.

### What the language work did and did not cost

Nothing in the language matching adds a Google call.

- Analysing five reviews instead of three reads more of a response we already paid for.
- The language re-ranking is client side.
- Two pages instead of one still hit one endpoint and the same cells.

Two things did change the exposure, and neither is structural.

**The v3 to v4 bump invalidated every cached cell.** Cells refetch on first visit, capped
at 30 a day. Only cells somebody actually opens are refetched, so this is a wave the size
of real demand, not the size of the catalogue.

**The professionals page is now worth visiting.** More traffic means more distinct cells
opened, which means more calls. That is demand, not design.

### The budget counts the call, not the cache write

`bumpBudget` used to sit inside the same try as the cache write. If the write threw, the
budget was never incremented, so a call that Google had already billed went uncounted, and
the next visitor to that cell spent another one. During a Supabase outage the soft budget
would have done nothing and only the daily quota on the Google key would have stopped it.

The counter is now incremented as soon as the Google call returns, before the cache write
is attempted, because the money has already left by then. `bumpBudget` swallows its own
errors so it can never fail a visitor's request.

### The failure mode is availability, not cost

Cost is capped twice over: the soft daily budget, and the hard daily quota on the Google
key. What gives first is not the bill, it is the visitor. Past 30 distinct new cells in one
day the endpoint returns a 503 saying the locality is being refreshed. As the directories
get better that becomes more likely, not less.

If that starts happening, raising `DIRECTORY_DAILY_BUDGET` is the answer, and the daily
quota on the Google key has to move with it or the quota rejects instead. What it costs:

| Daily budget | Worst case per month | Billable above the free 1,000 | Cost |
|---|---|---|---|
| 30 (current) | 930 | none | free |
| 50 (current Google quota) | 1,550 | 550 | about 22 USD |
| 100 | 3,100 | 2,100 | about 84 USD |
| 200 | 6,200 | 5,200 | about 208 USD |

Those are worst cases, not forecasts. Real spend is the number of distinct cells actually
opened, which has never been close to the cap.

---

## The LinkedIn deck broke in production, and why nothing caught it

`/api/linkedin-posts` answered **200 with the SPA's index.html**. The deck parses JSON, so
it showed "Server error 200: <!doctype html>".

The direct path `/api/linkedin/posts` did the same, which rules out the rewrites. Meanwhile
`/api/directory` returned JSON and `/api/internal-packages` returned 401, so functions were
deploying fine. One function was missing from the deployment: `api/linkedin/[action].js`.

A 200 with an HTML body is the worst failure shape available. No error page, nothing in the
logs, no alert. The only symptom is a screen somewhere saying "Server error 200", and only
when somebody opens it.

**A second failure was hiding behind the same cause.** Both LinkedIn crons pointed at
`/api/linkedin/dispatch` and `/api/linkedin/remind`. With no function there they fired into
the SPA and did nothing, silently, on schedule, for as long as this has been broken.

### The fix

The router is now `api/linkedin.js`. A plain filename at the api root, no nested folder, no
square brackets, and the action arrives as an ordinary query parameter that a rewrite
supplies. Two rewrites replace the previous eight:

```
/api/linkedin/:action   ->  /api/linkedin?action=:action
/api/linkedin-:action   ->  /api/linkedin?action=:action
```

Behaviour is unchanged. Handlers still live beside it as `api/_lk_<action>.js`, the whole
surface is still one function rather than eight, and every legacy URL still works so
approval links already in inboxes keep working. The crons point back at the legacy paths,
which the second rewrite handles.

Square brackets are glob metacharacters. Vercel's own dynamic-route convention uses them,
so they are legitimate, but they are mangled by enough tooling in between that betting the
whole LinkedIn surface on one bracketed filename in a nested folder was a bad trade for no
benefit. `api/linkedin/[action].js` is now in `.vercelignore`. **Delete `api/linkedin/` by
hand once the new router has run for a cycle**; this session cannot delete files.

### Two gates so this cannot happen again

**`node check_api.mjs`** reads the real `/api` tree, `.vercelignore` and `vercel.json`, and
fails on: more than 12 functions counted the way Vercel counts them; any URL that must
return JSON resolving to index.html; a rewrite pointing at a function that does not exist;
a cron that does not resolve to a function; a test file inside `/api`; or a glob
metacharacter in a filename. Recreating the exact production state makes it report 20
errors, including both silent crons.

**`node smoke.mjs`** hits the deployed site and asserts every endpoint returns JSON rather
than HTML. A 401 is a pass, because it proves a function ran. An HTML body is a fail
whatever the status code. Run it against production after every deploy:

```
node smoke.mjs                        # https://www.247spain.es
node smoke.mjs http://localhost:4180  # a local build
```

### The process failure worth naming

Everything was verified against a local build and a mocked API, and reported green. A local
build cannot tell you whether a function reached the deployment, and a mock cannot tell you
anything about production at all. "The build passes" and "the site works" are different
claims and only the second one matters. `smoke.mjs` is the one that makes the second claim,
and it is the check that was missing.
