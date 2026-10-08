# Facebook group posts: how the daily system works

One post goes out every day, in seven languages, to Facebook groups for foreign owners of
property in Spain. The goal is tax leads for Bueno. This file explains how a post gets from
written to published, and where each piece lives. Set up on 6 October 2026.

## The flow

1. **Posts are written ahead.** They live in `api/_fb_content.js`, each one in English,
   Norwegian, Swedish, Danish, German, French and Dutch. There are two kinds. Twenty point at
   a free tool on 24/7 Spain and close with one line saying the site is sponsored by Bueno.
   Ten are about Bueno's own tax filing service and link to getbueno.com.
2. **Pratik approves in `/internal-poornima`.** He reads the English, edits if it needs it and
   presses "Approve and queue". Approving does not send anything. The card then shows the
   post's place in the queue. He can approve as many as he likes in one sitting.
3. **One post goes out each day.** At 09:00 India time the GitHub workflow
   `.github/workflows/fb-daily.yml` calls `/api/fb?action=dispatch`, which emails the post at
   the front of the queue to Poornima with Pratik copied.
4. **The email carries everything she needs.** Under each language is the account that posts
   it (Account 1 to 7) and the three to five groups it goes into that day, as links.
5. **She posts and records it** in the "Daily plan" sheet of
   `Claude outputs/247Spain_Facebook_Groups_and_Daily_Plan.xlsx`.

## The deck's name, and who gets what

The deck lives at `/internal-poornima` since 8 October 2026, so the name says who the posts
are for. The old `/internal-pratik` address forwards there. Every email that goes to Poornima
copies Pratik, and replies come back to him.

## Trying it first

"Send me a trial" in the deck header sends Pratik two emails and nobody else: the
instructions email, and the post that is next in line, exactly as Poornima would get it,
with that day's groups. Both say "Trial" at the top. Nothing is marked as sent.

"Send Poornima the instructions" sends the real instructions email to her, copied to Pratik.
It asks first. The instructions list every group each account should join.

## Switching the daily send on

The workflow file is parked at `studio/facebook/fb-daily.yml`, because the tool that wrote
it is not allowed to write into `.github/workflows/`. Move it to
`.github/workflows/fb-daily.yml` and commit, and the daily send is on. Until then nothing
goes out by itself, and "Send it today" in the deck is the way to send a post.

## The order posts go out in

`QUEUE_ORDER` at the bottom of `api/_fb_content.js`. It alternates a Bueno post with a
24/7 Spain tax tool post for twenty days, then runs through the ten posts about the home
itself. A post that is not approved is skipped, so the queue never waits for one.

## Accounts, languages and groups

One account per language: 1 English, 2 Norwegian, 3 Swedish, 4 Danish, 5 German, 6 French,
7 Dutch. The groups are in `api/_fb_groups.js`, in the same order as the "Active groups"
sheet of the workbook, and both use the same rotation, so the email and the sheet agree.
Each language goes into one group on day 1, two on day 2, and three every day after that.
Three is the most a single account posts in on one day. To add or drop a group, change the module and the workbook together.

The day number counts sends, not dates. Day 1 is the first post ever sent. A day with
nothing to send does not make any group miss its turn.

## Images

Every post has seven images, one per language, with the text on the image in that language.
They are the 24/7 Spain infographic format (the approved simple3 template), rendered by
`studio/renderer/fb_cards2.py` from `studio/facebook/cards2/<lang>.json` (six templates, transparent logo, photos in `studio/photos`) and committed under
`public/fb-cards/<post>/<lang>.jpg`. Tool posts carry "247spain.es" and "Sponsored by Bueno";
Bueno posts carry the Bueno lockup. To change the text on an image, edit that language's card
file, run `python3 studio/renderer/fb_cards2.py all public/fb-cards`, and bump `CARD_VERSION`
in `api/_fb_images.js`.

## The start

9, 10 and 11 October 2026 are for joining the groups and getting the accounts going. The daily
send does nothing before `DAILY_START` (12 October 2026) unless it is forced. The instructions
email carries the day-by-day plan from 9 to 31 October.

## Danish

24/7 Spain has no Danish pages. A Danish tool post links to the English tool and says so,
and its sponsor line gives getbueno.com/dk. A Danish Bueno post links to Bueno's own Danish
tax page.

## When something goes wrong

- **Nothing is approved.** The publisher gets nothing and Pratik gets a short email.
- **The email could not be sent.** The site answers 500, the GitHub job fails and GitHub
  emails the repository owner. The post stays at the front of the queue for the next day.
- **A post was edited.** Its six translations are rebuilt from the edit when Pratik approves,
  so a problem shows while he is looking at it. If the rebuild fails the post goes back to
  "To review" and is not queued.

## By hand

All under `/api/fb?action=...`, with the internal password in the `x-passcode` header.

- `dispatch&dry=1` says which post would go next and to which groups, and sends nothing.
- `dispatch&force=1` sends the next post even though one already went out today.
- In the deck, "Send it today" sends one approved post ahead of the queue, and "Send again"
  repeats a post that has already gone, with the same groups it had the first time.
- `seed` (the "Load the latest writing" button) writes the content into the table. It never
  overwrites a decision, an edit or the record of a send.

## Where everything is

| What | Where |
|---|---|
| Review deck | `internal-poornima/index.jsx` (route `/internal-poornima`, no homepage card). `/internal-pratik` forwards here |
| Trial and instructions | `api/_fb_trial.js` |
| API, one function | `api/fb.js`, handlers in `api/_fb_*.js` |
| Posts and queue order | `api/_fb_content.js` |
| Groups and accounts | `api/_fb_groups.js` |
| Queue and daily send | `api/_fb_queue.js`, `api/_fb_dispatch.js` |
| The email | `api/_fb_email.js` (the only file that holds an email address) |
| Daily clock | `.github/workflows/fb-daily.yml` |
| Table | `fb_posts` in Supabase. `send_day` was added on 6 October 2026 |
| Tests | `node fb_isolation.test.mjs`, `node fb_api.test.mjs`, `node fb_deck_check.mjs` |

## What the daily job relies on

The repository secret `SUPABASE_SERVICE_KEY`, which the studio workflows already use. The job
sends its sha256 and the site compares it with the same key in Vercel. If that secret is
missing the job says so and fails.
