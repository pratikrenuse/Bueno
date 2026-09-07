# Correctness protocol for Spain 24/7 tools

You asked for zero mistakes. Zero mistakes is not achievable by being careful. It is
achievable, to the extent it is achievable at all, by making it structurally impossible
for an unverified number to reach a user. That is what this protocol does.

Read the honest limits at the bottom before treating any of this as a guarantee.

## 1. Nothing is hardcoded

No tool contains a rate, threshold, deadline or percentage in its own source. Every one
of them comes from `rules/*.json`. A tool that needs a number it cannot find in the rules
base does not ship.

## 2. Every rule carries five things

Value, plain statement, primary source URL that was actually read, the date shown on that
source, and a status. The schema is in `rules/_schema.json`. A rule missing any of them
fails validation.

## 3. Only primary sources verify

A rule is `verified` only if it was read on boe.es, an AEAT or ministry site, an official
regional tax agency or gazette, a college of notaries or registrars, or the EU official
journal. A law firm blog, a property portal, a relocation site or a news article is a lead
for finding the primary source. It is never a verification. Our own articles are leads too.

Statuses in use:

- `verified`. Read on a primary source.
- `partial`. Substance confirmed, but a specific article could not be read verbatim, or it
  is a reasoned reading rather than a quoted statement.
- `unverified`. Could not be confirmed. **Must not appear in any output.**
- `annulled`. Was law, has been struck down.
- `myth`. Widely repeated, and false.

## 4. What a tool may and may not say

A tool may state a `verified` rule. It may state a `partial` rule with the caveat carried
in the rule's own notes. It may not state an `unverified` rule at all, in any form, not
even as "roughly" or "typically". Where a rule is unverified for the user's region, the
tool says so by name: "We do not have a confirmed rate for Asturias" beats a plausible
number every time.

Where the law gives a range, the tool outputs a range. Where the law gives a maximum, the
tool says maximum. Where the answer depends on a municipal ordinance, the tool computes
what it can and names the ordinance the user must check.

## 5. Every figure shows its source on the page

Not in a footnote, not in a legal page. Next to the number. Source name, the article, and
the date it was verified. If a user cannot click through to the BOE page behind a figure,
the figure does not belong on the screen.

## 6. Review dates are enforced, not aspirational

Every rule has `review_by`. A build after that date fails, or the tool renders the figure
with a visible "needs review" state. Rates pegged to IPREM, SMI, the interest rate and the
regional tax tables get a January review. Nothing sits unchecked for a year by accident.

## 7. Worked examples are unit tests

Where an official source publishes a worked example, it becomes a test. AEAT's own imputed
income example, `45,986.60 x 2% x 24% x 365/365 = 220.73`, is a test case. The Balearic and
Aragonese cumulative cuota columns are test cases for the banded scales. A change to the
rules base that breaks a published example fails the build.

## 8. Boundaries are tested, not assumed

Every threshold gets a test either side of it: 182 and 184 days, 119 and 121 km/h, 12 and
13 months late, 2,999,999 and 3,000,001 euros. Most real errors live at the edge, not in
the middle.

## 9. Separate steps stay separate

Three specific traps, each of which produces a plausible wrong answer:

- Matrimonial property regime and forced heirship are two calculations, not one. Liquidate
  the community first, then divide the estate.
- The voluntary late-filing surcharge and the penalty after a demand are two branches. Never
  blend them.
- The wealth tax `hecho imponible` threshold and the point where tax actually starts are two
  different numbers. Model both.

## 10. Every tool states what it is not

One line, on the results screen, not buried: this is an estimate based on published rules
as at a stated date, it is not tax or legal advice, and the figure that binds the user is
the one their gestor or the tax office produces. That line is not a disclaimer to hide
behind. It is true, and it is the difference between a helpful tool and a liability.

## 11. Nothing ships on a blocked rule

Where verification found a blocker, the tool does not ship in that form. See
`TOOL_STATUS.md`. Two tools are dead outright, several are conditional.

---

## The honest limits

I can make it impossible for an unverified figure to reach a user. I cannot promise the
underlying law will not change the week after we ship, and Spanish property law is changing
unusually fast right now: three of the rules verified today were altered inside the last
eighteen months, and one of them was struck down by the Supreme Court four months ago.

I also cannot promise that a `verified` rule is correctly applied to a particular person's
facts. The rules base says what the law is. It cannot know whether a given municipality
revised its cadastral values, what a specific community's estatutos say, or which of two
readings a tax inspector will take. That is why every tool needs the line in item 10, and
why the honest ceiling on a free public calculator is "accurate rules, correctly applied to
what you told us" rather than "your tax bill".

Nine items in `OPEN_QUESTIONS.md` could not be closed from a primary source, mostly because
BOE's consolidated texts of long codes truncate before the relevant article. Someone with a
browser can close most of them in about an hour. Until then those rules are `partial` and
the tools that depend on them carry the caveat.
