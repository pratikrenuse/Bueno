# Bueno newsletter: how the system works

The Bueno newsletter goes out every second Monday at 08:00 IST, in English, Norwegian and Swedish,
sent by Resend from a cloud scheduled task (no Mac needed). The section "Pre-built editions and the
Monday send" at the end is the current process. The older beehiiv flow below is kept for reference.

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

## The fortnightly issue (from 10 Nov 2026)

Every issue is built from the idealista stories that arrived since the last issue, and every
issue gets a NEW guide. No older guide is ever reused.

1. **News.** Take the stories in Supabase `news_items` since the last issue and pick the three
   most shareable for foreign owners (records, new rules, court rulings, fines). Heading plus
   2 to 3 sentences each.
2. **Guide (new every issue).** Pick a topic that fits the issue's news and is not in
   `PAST` or `GUIDES` in `api/_newsletter_registry.js`. Write a new spec in
   `studio/guides/specs/<slug>.json` from the matching articles in `studio/articles/`,
   updating every fact to current law (check the BOE / Agencia Tributaria, never copy an
   article's figures blindly, and follow the editorial rules). EN, NO and SV.
   Render with `python3 studio/guides/render.py studio/guides/specs/<slug>.json` (the Sep 2026
   tax-guide design: navy cover, FS Siena, real Bueno logo and Bueno Brand photos, no pink or
   sunset covers). The render must pass the overflow check, then every page is looked at.
   Add the guide to `GUIDES` with its source articles and build date.
3. **Region, reader's question, subject.** Region not used before in `PAST`; reader's question
   tied to the top story; subject "This Week in Spanish Property: <top story>, Plus More Updates".
4. **Send.** Resend, from "Bueno Newsletter <pratik@spanishpropertyinsights.com>".
   To Pratik only until he says "launch on Resend"; then Pratik and John.

First issue built this way: 10 Nov 2026, guide `community-fees` (from the articles
community-fees, hoa-rules and direct-debit).

## Pre-built editions and the Monday send (from 23 Nov 2026)

Everything except the three news stories is built ahead. Ten editions are ready, 23 Nov 2026 to
29 Mar 2027, each with a NEW guide in EN, NO and SV.

| Send date | Guide | Region |
|---|---|---|
| 23 Nov 2026 | ibi-tax | Canary Islands |
| 7 Dec 2026 | property-insurance | Torrevieja and Orihuela Costa |
| 21 Dec 2026 | utilities-setup | Valencia |
| 4 Jan 2027 | local-tax-office | Murcia and the Costa Cálida |
| 18 Jan 2027 | buying-fees | Almería |
| 1 Feb 2027 | landlord-tenant-issues | Costa de la Luz |
| 15 Feb 2027 | extension-deeds | Madrid |
| 1 Mar 2027 | epc | Balearic Islands |
| 15 Mar 2027 | seasonal-vs-tourist-rentals | Costa Brava |
| 29 Mar 2027 | preventative-maintenance | Costa Dorada |

The Nov and Dec editions carry the "2025 return due by 31 December" tax block. From January the
block gives the 2027 dates (Modelo 210 from 1 April to 31 December 2027; rent from Oct to Dec 2026
declared 1 to 20 April 2027), checked against the AEAT.

**Where it lives (Supabase):**
- `newsletter_settings.template` holds the email shell per language, `template_tokens` the shared
  inline styles. `newsletter_template(lang)` expands them.
- `newsletter_editions` has one row per edition with status `prepared`, `fields` (guide, region,
  reader's question and tax block per language, already HTML-escaped) and `guide_urls`.
- `newsletter_render(edition_key, lang, vals)` returns the finished HTML. `vals` is plain text for
  SUBJECT, PREVIEW, INTRO, N1_T, N1_B, N2_T, N2_B, N3_T, N3_B and SOURCES; it is escaped inside the
  function, and the function refuses to return HTML with an unfilled placeholder.
- `newsletter_articles`: each guide article is `selected` with `used_on` = its send date. Approving
  in `/internal-newsletter` marks it `approved`; after the send it is `used`.

**The Monday send (cloud scheduled task "Bueno Newsletter: fortnightly Monday send"):**
1. Runs every Monday at 08:00 IST and stops unless the date is a whole number of 14-day steps from
   23 Nov 2026, or there is a `prepared` edition for today.
2. Picks the three most shareable `news_items` since the last edition, writes headline and body in
   EN, NO and SV, plus subject ("This Week in Spanish Property: <top story>, Plus More Updates"),
   preview and the second intro paragraph.
3. Renders each language with `newsletter_render`, sends via Resend from
   "Bueno Newsletter <pratik@spanishpropertyinsights.com>" to `newsletter_settings.recipients`
   (Pratik only until launch; the dashboard "Launch: add John" switch adds John).
4. Stores stories, subjects, HTML and Resend ids on the edition, sets it to `sent`, marks the article
   `used`, and sends a push notification.

**Source files:** `studio/newsletter/prebuilt/` (edition copy in `editions_data.py`, guide scripts
`g1` to `g10`, template builders). Guide specs are in `studio/guides/specs/`, PDFs in
`public/newsletter-guides/`. The guide links only work once the repo is pushed.

**Next batch:** when two prepared editions are left, ask Claude for the next ten.
