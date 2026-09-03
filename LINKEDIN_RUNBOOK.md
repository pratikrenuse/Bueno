# LinkedIn team posting: runbook

The team posts on their personal LinkedIn every weekday. John approves posts in English once,
and each member receives that same post in their own language, ready to copy.

Deck: **https://247spain.es/internal-linkedin** (team password, same as the studio).

---

## Go live: four steps

### 1. Supabase, one time

SQL Editor, run everything in `studio/linkedin_schema.sql`. It is idempotent, so it is safe if
parts already ran. Then fill in the roster emails:

```sql
update team_members set email='monique@getbueno.com'   where name='Monique';
update team_members set email='izahbelle@getbueno.com' where name='Izahbel';
update team_members set email='petter@getbueno.com'    where name='Petter';
update team_members set email='yenna@getbueno.com'     where name='Yenna';
update team_members set email='amina@getbueno.com'     where name='Amina';
update team_members set email='felix@getbueno.com'     where name='Felix';
```

### 2. Vercel environment variables

| Variable | Value | Needed for |
|---|---|---|
| `SUPABASE_URL` | the BUENO project URL | everything |
| `SUPABASE_SERVICE_KEY` | service role key | everything |
| `INTERNAL_PASSCODE` | the shared team password | deck access |
| `RESEND_API_KEY` | Resend key | sending email |
| `RESEND_FROM` | `24/7 Spain <pratik@spanishpropertyinsights.com>` | sending from a verified domain |
| `ANTHROPIC_API_KEY` | Claude API key | auto-updating translations after an edit |
| `TRANSLATE_MODEL` | optional, e.g. `claude-haiku-4-5-20251001` | cheaper translations |

Environment variable changes only take effect after a **Redeploy**.

### 3. Push

Commit and push in GitHub Desktop. Vercel deploys automatically.

### 4. Load the content

Open the deck, press **Sync new posts** once. This loads 75 English posts and 150 translations.
Safe to press again later: decisions and edits are never overwritten.

---

## How it runs

The team publishes on **Tuesdays and Thursdays**.

1. **John reviews** in the deck. Approve, Reject with a note, or Edit the text directly.
   Keyboard: `J`/`K` move, `A` approve, `R` reject, `E` edit, `C` copy.
2. **Approving sends immediately.** The post goes to every member of that stream, each in
   their own language, with the image attached and Pratik and John on copy. John and Pratik
   also get a separate record of what was sent.
3. **Reminders to John** go out Sunday and Tuesday at 17:00 UTC, ahead of each posting day.
   They list what is pending, what is approved, and link straight to the deck. If nothing
   needs attention, no reminder is sent.
4. **A catch-up run** on Monday and Wednesday at 08:00 UTC picks up anything approved that
   never reached the team, for example during a Resend outage. Normally it finds nothing.
5. Replies to any of these emails go to pratik.y.renuse@gmail.com.

Approve only when you are happy for the team to have it. There is no undo on a sent email.

---

## The Dashboard tab

- Per stream: approved, rejected, pending, emailed counts.
- Every rejection with John's note.
- Team roster, flagging anyone missing an email.
- The last 100 emails sent, with failures and reasons.
- **Run health check**: verifies env vars, database, content, roster and translation coverage.
  Read only, sends nothing, spends nothing. Run this first if anything looks wrong.
- **Preview today's send**: shows exactly what would go to whom, in which language. Sends nothing.
- **Send now**: runs the dispatch immediately.
- **Refresh translations**: regenerates translations for approved posts whose English changed.

---

## How translations stay correct

Each translation stores a fingerprint of the English text it was made from. When John edits an
approved post, the fingerprint stops matching and the translation is known to be stale. Before
the next send, the dispatch regenerates it through the Claude API using the glossary in
`TRANSLATIONS.md`.

Cost is roughly one cent per post per language, and only when a post was actually edited.
Untouched posts cost nothing.

If the Claude API key is missing or a call fails, nothing breaks and nothing goes out silently
wrong: the member still receives the post, with a visible note that the English was edited after
that version was made, and the dispatch result names exactly who was affected.

---

## Content

- 75 English master posts: 30 for property owners, 30 for real estate agents, 15 for attorneys.
- Every fact traces to the blog articles in `studio/articles/` (81 full articles).
- Partner posts (every fifth day in the agents and attorneys streams) carry the Bueno
  after-sales message, using only approved product facts.
- 38 posts have a photo, served from `/photos/` and attached to the email.
- Owners stream is translated into Dutch, Swedish, Norwegian, Spanish and French.
  The agents and attorneys streams are translated on demand, once members are assigned
  to those streams.

Content lives in `api/_linkedin_batch1.js` (owners), `_linkedin_agents.js`, `_linkedin_attorneys.js`
and `_linkedin_translations.js`. These are generated files: regenerate them, do not hand-edit.

---

## Stream assignment

Each team member belongs to one stream, set in `team_members.stream`. All six currently sit on
`owners`. To move someone:

```sql
update team_members set stream='agents' where name='Felix';
```

A stream with no members is skipped by the dispatch.
