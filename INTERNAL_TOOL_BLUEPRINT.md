# Blueprint: building an internal review-and-send tool

The LinkedIn tool (`/internal-linkedin`) and the Instagram studio (`/internal`) are the same
shape. This document is the recipe, so the next one takes hours instead of days.

The shape: **content is generated ahead of time, a human approves it in a deck, and approved
items are delivered on a schedule.** Everything else is detail.

---

## 1. The five pieces

| Piece | What it is | Example |
|---|---|---|
| Content modules | Plain data, generated, never hand-edited | `api/_linkedin_batch1.js` |
| A table | One row per item, with status and decision | `linkedin_posts` |
| A review deck | Password-gated page, no public card | `internal-linkedin/index.jsx` |
| Endpoints | Read, decide, sync, send, remind, health | `api/linkedin-*.js` |
| Schedules | Vercel crons for the recurring parts | `vercel.json` |

---

## 2. Repo conventions that are not obvious

**Route discovery.** A folder at the repo root with `index.jsx` becomes a route automatically
via the glob in `src/App.jsx`. Add `meta.js` only if it should appear on the public homepage.
Internal tools deliberately have no `meta.js`.

**Files in `/api` starting with `_` are not deployed as functions.** This is the single most
useful fact in the repo. Put shared helpers and generated data in `_name.js` files: they can be
imported freely and cost nothing against the function limit.

**ESM everywhere.** `package.json` has `"type": "module"`, so every API file uses
`export default async function handler(req, res)`. `module.exports` fails at runtime.

**Static assets for emails.** Files must be reachable by URL, so the build copies them:
`"build": "mkdir -p public/photos && cp studio/photos/*.jpg public/photos/ && vite build"`.

---

## 3. Vercel Hobby limits, which fail *after* the build

A deployment can be rejected once the build has already printed "Build Completed", so the build
log looks green while the site keeps serving the previous version. Symptoms look exactly like
"my sync is broken".

- **12 serverless functions maximum.** Count `api/*.js` that do not start with `_`. Use
  `.vercelignore` to drop dead endpoints, or merge several utilities behind one `?action=` route.
- **2 cron jobs maximum.** Combine days into one entry: `"0 15 * * 0,2"` is one cron that fires
  Sunday and Tuesday, not two.
- **Crons run in UTC** and ignore Spanish daylight saving. 06:00 UTC is 08:00 Barcelona in
  summer and 07:00 in winter. Revisit both schedules when the clocks change.

---

## 4. Supabase rules learned the hard way

**Every row in a bulk insert must have an identical key set**, or PostgREST returns
`PGRST102: All object keys must match`. Never build rows by spreading source objects and
stripping fields, because the next new field breaks it again. Build each row explicitly:

```js
const norm = (p, defaults = {}) => ({
  slug: p.slug, batch: p.batch ?? 1, day: p.day ?? null,
  language: p.language || 'en', member: p.member || '',
  audience: p.audience || defaults.audience || 'owners',
  title: p.title || null, post_text: p.post_text,
  image_url: p.image_url ?? null, status: p.status || defaults.status || 'pending',
  source_hash: p.source_hash ?? null,
});
```

Before handing over, simulate the exact payload and assert
`new Set(rows.map(r => Object.keys(r).sort().join(','))).size === 1`.

**Sync must never delete then re-insert.** A failure between the two empties the user's deck.
Read what exists, insert only what is missing, then PATCH the rows nobody has touched. Rows that
are approved, rejected or hand-edited are never overwritten.

**Upserts need a unique constraint** matching the `on_conflict` target, e.g.
`unique (slug, language, member)`.

---

## 5. The deck UI

Built on the C.L.E.A.R. framework (see `Bueno_UI_Standard.md`). What made this one work:

- The item is rendered **exactly as it will appear on the destination platform**, including the
  fold, so the reviewer judges the real thing rather than a form field.
- One primary action per card. Approve is the only filled navy button.
- Rejection takes an inline note, never a browser `prompt()`.
- Keyboard review: `J`/`K` to move, `A` approve, `R` reject, `E` edit, `C` copy. A reviewer with
  60 items needs this.
- Optimistic updates with rollback: the card flips instantly, and reverts with a visible error if
  the save fails.
- A dashboard that opens with the one thing that matters (what is pending, what happens next),
  then supporting detail underneath.
- A **health check endpoint** that verifies env vars, tables, seeded content, roster and
  coverage, read-only. It turns "it is broken" into a specific answer in one click.

---

## 6. Email

Shared helpers live in `api/_email.js`: `sendMail`, the card `shell`, `esc`, `OVERSIGHT`,
and a `COPY` map holding every user-facing string per language.

- Use a **verified sending domain**. Resend's sandbox sender only reaches the account owner,
  which looks like silent failure.
- Set `reply_to` to a real human.
- Log every send to a table (`linkedin_emails`) with status and error text. The dashboard reads it.
- Put recipients who need oversight on `cc`, not a second email.
- Say plainly what an email is and is not. The approval email states "Internal preview. Not sent
  to the team." because ambiguity there causes real mistakes.

---

## 7. Content generation and translation

- Facts come from a named source, and each generated item records which one
  (`source_article` / `source_slug`). This makes verification mechanical rather than a matter of
  trust.
- Always run an **independent verification pass** over generated content: a second agent that
  only checks claims against the named source and reports violations. It has caught invented
  figures, unsourced experience claims and overstatements every single time.
- Translations are rows in the same table keyed by language, seeded ahead of time, and stamped
  with `source_hash`, the SHA1 of the English they were made from. When the English changes, the
  hash stops matching and the translation is regenerated automatically before sending.
- Degrade loudly, never silently: if a translation is missing, the recipient still gets the item
  with a visible note, and the API response names exactly who was affected.

---

## 8. Handover checklist

1. Match the module system (ESM here).
2. Every handler wrapped in try/catch, returning JSON errors, with a named guard per env var.
3. Every UI fetch parses text then JSON and surfaces the error in a red box. Never an endless
   "Loading…".
4. Syntax-check everything before handover: `node --check` on each endpoint, and esbuild in
   **bundle** mode on the JSX so undefined identifiers are caught, not just syntax.
5. Simulate the database payload and the branch logic with fixtures.
6. State plainly that env var changes need a redeploy.
7. Give the user complete, copy-pasteable SQL. Not a file reference.
