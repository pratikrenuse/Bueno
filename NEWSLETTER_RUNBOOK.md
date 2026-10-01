# Bueno newsletter: how the system works

The Bueno newsletter goes out every other Thursday, in English, Norwegian and Swedish. This
file explains how an issue gets from written to scheduled, and where each piece lives.

## The flow

1. **Issues are written ahead.** Each issue lives in `api/_newsletter_issues.js`. It holds
   only the parts that change: three news items, the guide, the region spotlight, the
   reader's question and an optional survey. The fixed parts (welcome, Bueno Tax, Get Bueno,
   sign-off) are in `api/_newsletter_shell.js`. Nothing repeats: `api/_newsletter_registry.js`
   lists every guide, region and reader topic used in issues 4 to 12, and the health check
   fails if a new issue reuses one.
2. **Every issue has its own branded guide.** Guides are built with `studio/guides/render.py`
   from a spec in `studio/guides/specs/`, in the design of the Non-resident Property Tax guide.
   The PDFs land in `public/newsletter-guides/` and are served at
   `https://www.247spain.es/newsletter-guides/`. robots.txt keeps them out of search.
3. **News is researched close to the send date.** Six days before an issue (the Friday before
   the Thursday), the GitHub workflow `newsletter-research.yml` runs
   `studio/newsletter/research.mjs`. It researches the latest Spanish property news and the
   region figures with live web search, writes them into the issue in all three languages,
   then asks the site to send the review email.
4. **John and Pratik get the review email.** "This is the newsletter for Thursday 22
   October", with a button straight to that issue, the password, and what is in it. It goes
   to John and Pratik only.
5. **John reviews in `/internal-newsletter`.** Same password as the other internal decks. He
   reads the issue exactly as readers will see it, switches between the three languages,
   edits anything in place, and presses Approve. The issues after the next one are there too,
   so several can be approved in one sitting.
6. **Pratik gets the final text.** Approving emails Pratik the paste-ready text for all three
   languages, with the guide links. He schedules it in beehiiv and presses "Mark as scheduled".

## Emails are off until launch

Nothing is emailed to anyone while the Vercel variable `NEWSLETTER_EMAILS_LIVE` is not
`true`. Approving still works and is saved, and the deck shows exactly what each email would
contain ("See the review email" and "Paste-ready text"). To launch:

1. In Vercel, add `NEWSLETTER_EMAILS_LIVE` = `true` and redeploy.
2. Move `studio/newsletter/newsletter-research.yml` into `.github/workflows/` (it is parked
   outside so it cannot run), uncomment its `schedule:` lines, and add the repository secrets
   `CRON_SECRET` and `ANTHROPIC_API_KEY` in GitHub (same values as in Vercel).

## Making the next batch

When the runway in the health check drops to two issues, ask Claude to write the next batch.
For each issue it adds a spec to `studio/guides/specs/`, renders the three PDFs, adds the
issue to `api/_newsletter_issues.js` and the guide to `api/_newsletter_registry.js`. After
deploying, press **Sync issues** in the deck. Sync never overwrites an issue John has edited,
approved or that has been emailed.

## Where everything is

| What | Where |
|---|---|
| Review deck | `internal-newsletter/index.jsx` (route `/internal-newsletter`, no homepage card) |
| API, one function | `api/newsletter.js`, handlers in `api/_nl_*.js` |
| Table | `newsletter_issues` in Supabase, schema in `studio/newsletter/newsletter_schema.sql` |
| Text and HTML rendering | `api/_newsletter_render.js` (used by the deck and the emails, so both match) |
| Guide renderer | `studio/guides/render.py`, specs in `studio/guides/specs/`, assets in `studio/guides/assets/` |
| Research job | `studio/newsletter/research.mjs` and `studio/newsletter/newsletter-research.yml` (parked until launch) |
| Tests | `node newsletter.test.mjs` |

## Actions

All under `/api/newsletter?action=...`, gated by the internal password (header `x-passcode`)
or `Authorization: Bearer CRON_SECRET`.

- `issues` lists every issue.
- `seed` (POST) writes the written issues into the table without overwriting anyone's work.
- `decide` (POST) handles edit, revert, approved, rejected, pending, scheduled and resend.
- `alert` sends the review email for the issue that is due. `dry=1` only builds it.
- `news` returns the issue that needs research (GET) or writes researched news (POST).
- `health` checks env vars, the table, repeats, guide links and runway.
