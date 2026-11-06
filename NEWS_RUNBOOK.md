# Newsletter digest runbook (idealista/news to the WhatsApp channels)

Built 2 November 2026 at John's request: read the daily idealista/news emails, keep what is
useful to foreign owners, translate it, and use it for the Spain 24/7 WhatsApp channels.

## How it flows

1. idealista/news sends its email to our Resend receiving address (`<anything>@<id>.resend.app`).
2. Resend calls `POST https://www.247spain.es/api/news?action=inbound` (event `email.received`).
3. The endpoint fetches the email back from Resend with our own key, checks the sender is on
   the allow list (idealista.com, plus `NEWS_ALLOWED_SENDERS`), and claims it by its Resend id
   so a webhook retry can never sort it twice.
4. Claude splits it into stories, drops celebrity homes, ads, company news and stories outside
   Spain, and writes a short English channel post for each story worth keeping. Proposals are
   flagged and the post says they are not law. Posts naming a bank or an energy company are
   dropped in code.
5. Pratik gets a short email (John copied) listing the kept stories, with a button to
   `/internal-news`.
6. Approving a story translates it into Norwegian, Swedish, German, French and Dutch.
7. The daily posting email (api/_fb_dispatch.js) uses the oldest approved story as the WhatsApp
   channel post on any day without a hand-written post in `api/_fb_whatsapp.js`, then marks it
   as used. A hand-written day always wins.

## One-time setup in Resend

1. Resend, Emails, Receiving tab, three dots, "Receiving address". Copy the `.resend.app`
   domain. Pick any address on it, for example `idealista@<id>.resend.app`.
2. Resend, Webhooks, Add Webhook. URL `https://www.247spain.es/api/news?action=inbound`,
   event `email.received`.
3. Subscribe that address to idealista/news on idealista.com (or forward the newsletter to it
   from admin@getbueno.com with a mail rule).

No new Vercel env var is needed. It uses RESEND_API_KEY, RESEND_FROM, ANTHROPIC_API_KEY,
SUPABASE_URL, SUPABASE_SERVICE_KEY and INTERNAL_PASSCODE, which are all already set.
Optional: `NEWS_MODEL` to pick the Claude model, `NEWS_ALLOWED_SENDERS` (comma separated
domains) to accept another newsletter.

## Tables (created 2 November 2026, project zwdkmqzlrhwihijgqgzl)

- `news_emails`: one row per received email. Status `processing`, `done`, `failed`, `ignored`.
- `news_items`: one row per story. Status `pending`, `approved`, `used`, `rejected`, `skipped`.

## Checks

- `GET /api/news?action=health&pass=<INTERNAL_PASSCODE>` reports env vars, tables and the
  last email, read-only.
- A failed email shows in red at the top of `/internal-news` with a "Try again" button.
- "Paste a newsletter" on the page sorts any newsletter text by hand, without email.
- `node news.test.mjs` runs everything with Supabase, Resend and Claude mocked.

## Feeding the LinkedIn deck (5 November 2026)

Every kept story with a score of 4 or 5 also becomes an English master post for the owners
stream in `/internal-linkedin` (`api/_lk_news.js`): slug `news_<date>_<story id>`, batch 100,
day 101 upwards, written from the story and the Spanish text it came from, with the usual
Bueno line at the end. The image is a Bueno frame from `public/posts` (photo above the navy
Bueno band, no text), taken in turn from posts that are no longer shown. John reviews it like
any other post. The Tuesday and Thursday send takes approved news first, and each member gets
it in their own language at send time.

The written series that was never approved is kept in Supabase but no longer shown in the
deck, the dashboard or the reminder email. Approved and rejected posts show as before.

How it is triggered: after an email is sorted, `api/_news_process.js` calls
`/api/linkedin?action=news` without waiting. The deck also checks on load for a kept story
without a post and starts the writer. One run writes what fits in 40 seconds and calls itself
for the rest. The slug stops any story being written twice.

Read-only check: `/api/linkedin?action=news&dry=1&pass=...` lists the stories that would be written.

The Facebook deck is parked: `api/_fb_news.js` exists, but nothing calls it and the deck does
not show or queue news rows until it is switched on.

## The WhatsApp channels, approved by Pratik (6 November 2026)

Nothing goes into the channels unless Pratik approves it. Every kept story from the last week
shows by itself in the Facebook deck's "WhatsApp channels" view (`Channels.jsx` in its folder,
`/api/fb?action=channels`), with a photo from `studio/photos` (plain, no text, no logo, the same
in every language). He can approve it, change the photo, or set it aside ("Not for the
channels", status skipped, so it stays kept and the LinkedIn deck is not affected). Approving
calls `/api/news?action=decide`, which translates it into the five other channel languages.

The daily task email (`api/_fb_dispatch.js`, 01:30 and 12:00 UTC) carries the approved story
that has waited longest: for each of the six channels the photo, a download link and the text.
When there is no Facebook post in the queue, the email still goes out with only the WhatsApp
tasks in it. With nothing approved, nothing goes to the publisher. Each day is recorded in
`wa_channel_sends`, so the channels never get two posts on one day. The hand-written days in
`api/_fb_whatsapp.js` are no longer sent (WRITTEN_CHANNEL_POSTS_ON is false).

Pratik alone gets a reminder on the morning run when fewer than three approved posts are left,
with how many stories wait for his review. Tests: `node channels.test.mjs`.
