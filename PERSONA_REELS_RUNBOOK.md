# Persona profile posts: how the daily reels work

Set up on 17 November 2026. Deck: `/internal-poornima` (Profile posts and Accounts tabs).

## What goes out

Every day, one post goes out on all 28 Maria Lopez profiles: Instagram, Facebook, LinkedIn and
X, seven languages each (English, Norwegian, Swedish, Danish, German, French, Dutch). Each
language gets:

- a 12 second vertical reel: the profile's own picture and the name Maria Lopez at the top,
  one photo of the same persona as a large card, and three lines appearing one after another;
- a caption for Instagram, Facebook and LinkedIn, with three hashtags;
- a short text for X (under 280 characters).

Written as a woman who lives in Spain sharing what she has learned, never as a business. Only
topics for foreign owners and estate agents in Spain. No brand, no site, no link.

## Nothing to approve

The daily task email (api/_fb_dispatch.js) carries the next post in `PROFILE_ORDER` that has
not gone out and is not parked. It goes To the publisher with Pratik in CC, nobody else, at
07:00 India time, with a catch-up at 12:00 UTC if the morning run failed. A post is only kept
out if Pratik presses "Park, do not send" in the deck.

When fewer than 2 posts are left in the batch, Pratik alone gets a short email to ask Claude
for the next batch.

**First run: a 7-day trial, 18 to 24 November 2026.** Seven posts, one a day, each written from
that week's idealista news in Maria's own voice (hook, what it means, what to do, a question back).
Reels: three scenes with three different photos of the same persona, moving full screen, words
popping in one by one, numbers on yellow. Render with `node studio/personas/plan.mjs` then
`python3 studio/personas/render_reels.py --force`, and bump REELS_VERSION in api/_fb_profiles.js.

## The persona lock (never break it)

`api/_fb_profiles.js` is the one place that decides it:

| Language | Persona | Profile picture |
|---|---|---|
| English | Maria NE Lopez | public/ig-setup/EN_Spain24x7.jpg |
| Norwegian | Maria NE Lopez | public/ig-setup/NO_p.jpg |
| Swedish | Maria SD Lopez | public/ig-setup/SV_ibex.jpg |
| Dutch | Maria SD Lopez | public/ig-setup/NL_xyz.jpg |
| Danish | Maria SD Lopez | public/ig-setup/DA_hindi.jpg |
| French | Maria FG Lopez | public/ig-setup/FR_gmp.jpg |
| German | Maria FG Lopez | public/ig-setup/DE_pr.jpg |

A language only ever uses photos from its own persona's list in `studio/personas/photos.json`.
Languages that share a persona show different photos on the same day, and a photo does not come
back on one account until its list has gone round. `fb_profiles.test.mjs` checks all of this,
plus every reel file, every account and every line of text.

The 28 accounts and their logins are in `PROFILES` in the same file (from Pratik's sheet).
Account numbers differ per platform, so everything is matched by language.

## Making the next batch

1. Add the new posts to `PROFILE_POSTS` in `api/_fb_profiles.js` (all seven languages; every
   line on screen a complete sentence; facts only from `api/_reels_facts.js` or another checked
   source, listed in `facts`). Add them at the end so the order of what is left does not change.
2. `node studio/personas/plan.mjs` writes `studio/personas/plan.json`.
3. `python3 studio/personas/render_reels.py` renders only the reels that are missing, into
   `public/persona-reels/<post>/<lang>.mp4` and a poster `.jpg`. It needs ffmpeg and the persona
   photos in "Claude outputs/". About 1 MB per reel.
4. `node fb_profiles.test.mjs`, then commit and push in GitHub Desktop.

## Where everything is

| What | Where |
|---|---|
| Posts, accounts, persona lock | `api/_fb_profiles.js` |
| Deck data | `api/_fb_profiles_view.js` (`/api/fb?action=profiles`) |
| Deck | `internal-poornima/Profiles.jsx` |
| Daily email | `dailyTasksBody`, `profileSection` in `api/_fb_email.js` |
| Daily send | `api/_fb_dispatch.js` |
| What went out, what is parked | Supabase table `persona_posts` (post_key, parked, sent_on) |
| Reels | `public/persona-reels/`, made by `studio/personas/` |
| Fonts in the reels | Inter (SIL Open Font License), `studio/personas/fonts/` |
