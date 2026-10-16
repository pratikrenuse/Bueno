# Facebook group posts: how the daily system works

One post goes out every day, in seven languages, to Facebook groups for foreign owners of
property in Spain. The goal is tax leads for Bueno. This file explains how a post gets from
written to published, and where each piece lives. Set up on 6 October 2026.

## The flow

1. **Posts are written ahead.** They live in `api/_fb_content.js`, each one in English,
   Norwegian, Swedish, Danish, German, French and Dutch. Since 15 October 2026 every post is
   pure value: no link, no Bueno, no 24/7 Spain and no tool in the text (only the English image carries the Bueno logo), because
   groups were removing anything promotional. The only invitation is a first comment that
   Poornima adds under her post (`COMMENT` in the same file), pointing at the WhatsApp
   community. Until `WHATSAPP_URL` is set there, the email tells her to skip the comment.
   When the deck opens, any post written since the last sync is added, and any post not yet
   emailed and not edited by Pratik is brought in line with the file. The **Sync posts** button
   (top right of the deck, added 15 October 2026) does the same on demand and says how many
   posts were new, how many were brought up to date and how many were retired. A post taken
   out of the writing is hidden and never queued, unless it already went out, in which case it
   stays on the dashboard as a record. Nothing is ever deleted and no decision, edit or send
   is overwritten.
2. **Pratik approves in `/internal-poornima`.** He reads the English, edits if it needs it and
   presses "Approve and queue". Approving does not send anything. The card then shows the
   post's place in the queue. He can approve as many as he likes in one sitting.
3. **One post goes out each day.** At 07:00 India time the Vercel cron in `vercel.json`
   calls `/api/fb?action=dispatch`, which emails the post at
   the front of the queue: To Pratik, with Poornima and John in BCC.
4. **The email carries everything she needs.** Under each language is the account that posts
   it (Account 1 to 7) and the groups it goes into that day, as links. Since 16 October 2026
   the email is written as a task brief for an agent: numbered steps, no greeting.
5. **She posts, adds the first comment if there is one, and records it** in her tracking
   sheet: the link to each post and whether it stayed up.

To switch on the first comment: create the WhatsApp community, put its invite link in
`WHATSAPP_URL` in `api/_fb_content.js`, commit and push.

## The deck's name, and who gets what

The deck lives at `/internal-poornima` since 8 October 2026, so the name says who the posts
are for. The old `/internal-pratik` address forwards there.

Since 15 October 2026 every email for the publisher is addressed To Pratik, with Poornima and
John (john@getbueno.com) in BCC, so both see Pratik's address and neither sees the other's.
The email itself never names Poornima ("Hi P,"). Replies come back to Pratik.

## Trying it first

The trial (`/api/fb?action=trial`, no longer a button since 12 Oct 2026) sends Pratik two emails and nobody else: the
instructions email, and the post that is next in line, exactly as Poornima would get it,
with that day's groups. Both say "Trial" at the top. Nothing is marked as sent.

The instructions (`/api/fb?action=intro`, no longer a button) send the real instructions email the same way: To Pratik, Poornima and John in BCC.
It asks first. The instructions list every group each account should join.

## The daily clock

Two Vercel crons in `vercel.json`, the same way the LinkedIn sends run: `/api/fb-dispatch` at
01:30 UTC (07:00 India time) and a catch-up, `/api/fb/dispatch`, at 12:00 UTC (17:30 India
time). The send goes once a day at most, so the catch-up only sends when the morning run did
not. Vercel signs both with `CRON_SECRET`, which `gateCron` accepts. On the Hobby plan each
may fire any time within its hour. Nothing is ever sent by a button: Pratik only approves.

## The order posts go out in

`QUEUE_ORDER` at the bottom of `api/_fb_content.js`. It alternates a Bueno post with a
24/7 Spain tax tool post for twenty days, then runs through the ten posts about the home
itself. A post that is not approved is skipped, so the queue never waits for one.

## Accounts, languages and groups

One account per language: 1 English, 2 Norwegian, 3 Swedish, 4 Danish, 5 German, 6 French,
7 Dutch. The groups are in `api/_fb_groups.js`, in the same order as the "Active groups"
sheet of the workbook, and both use the same rotation, so the email and the sheet agree.
Each language goes into one group on day 1, two on day 2 and three on days 3 to 5. From day 6
(16 October 2026) it grows by one group a day up to ten; a language with fewer groups posts in
all of them. `RAMP` and `MAX_PER_DAY` in `api/_fb_groups.js`.

The day number counts sends, not dates. Day 1 is the first post ever sent. A day with
nothing to send does not make any group miss its turn.

## Images

Every post has seven images, one per language, with the text on the image in that language.
They are the 24/7 Spain infographic format (the approved simple3 template), rendered by
`studio/renderer/fb_cards2.py` from `studio/facebook/cards2/<lang>.json` (six templates, transparent logo, photos in `studio/photos`) and committed under
`public/fb-cards/<post>/<lang>.jpg`. Since 15 October 2026 only the English image carries the Bueno logo. The six translated images carry no logo, no "Property Finance Simplified" and no mention of Bueno at all, because a translation can carry a mistake and that must never sit next to the Bueno name. `fb_cards2.py` enforces this whatever the card file says, and `fb_isolation.test.mjs` checks it. To change the text on an image, edit that language's card
file, run `python3 studio/renderer/fb_cards2.py all public/fb-cards`, and bump `CARD_VERSION`
in `api/_fb_images.js`.

## The start

9, 10 and 11 October 2026 are for joining the groups and getting the accounts going. The daily
send does nothing before `DAILY_START` (12 October 2026) unless it is forced. The instructions
email carries the day-by-day plan from 9 to 31 October.

## Danish

Danish posts are written in full like the others. Since posts carry no link, nothing in
them depends on 24/7 Spain having Danish pages.

## The dashboard

`/internal-poornima` has a Dashboard tab (`internal-poornima/Dashboard.jsx`, data from the
`dashboard` block of `/api/fb?action=posts`): whether today's email went, totals, every post
email sent with its groups, the queue with the date each post should go, failed sends and
parked posts. It has no send buttons. The deck opens on Review posts; the dashboard is the
second tab. Trial and instructions emails are not listed.

## When something goes wrong

- **Fewer than five days left.** After each send, if fewer than 5 approved posts are left,
  Pratik alone gets a reminder email to approve more.
- **Nothing is approved.** The publisher gets nothing and Pratik gets a short email.
- **The email could not be sent.** The site answers 500 and the failed run shows in the
  emails the repository owner. The post stays at the front of the queue for the next day.
- **A post was edited.** Its six translations are rebuilt from the edit when Pratik approves,
  so a problem shows while he is looking at it. If the rebuild fails the post goes back to
  "To review" and is not queued.

## By hand

All under `/api/fb?action=...`, with the internal password in the `x-passcode` header.

- `dispatch&dry=1` says which post would go next and to which groups, and sends nothing.
- `dispatch&force=1` sends the next post even though one already went out today.
- "Send again" on a sent card repeats a post that has already gone, with the same groups it
  had the first time. There is no send-now button; the crons do all sending.
- `seed` (the "Sync posts" button) writes the content into the table. It never
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
| Daily clock | Vercel cron in `vercel.json` |
| Table | `fb_posts` in Supabase. `send_day` was added on 6 October 2026 |
| Tests | `node fb_isolation.test.mjs`, `node fb_api.test.mjs`, `node fb_deck_check.mjs` |

## What the daily job relies on

`CRON_SECRET` in Vercel, already set for the LinkedIn crons.
