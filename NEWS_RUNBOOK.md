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
7. Poornima's daily email (api/_fb_dispatch.js) uses the oldest approved story as the WhatsApp
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
