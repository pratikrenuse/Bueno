# Spain 24/7 Trades Directory - runbook

`/spain-directory` shows the best reviewed plumbers, electricians, locksmiths, air
conditioning engineers, pool services and builders in 94 Spanish localities, ranked from
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

- 94 localities x 6 trades = **564 objects**, the worst case if every combination is
  viewed inside the same 30 days.
- `DIRECTORY_DAILY_BUDGET` of 30 caps the month at 900 even if something goes wrong.
- Both sit inside the 1,000 free allowance.

To add a locality, add one line to `spain-directory/localities.js`. Nothing else changes.
Under about 165 localities it stays free. Past that it is roughly $40 per additional
1,000 objects, and the Google Cloud budget cap is what guarantees no surprises either way.

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
