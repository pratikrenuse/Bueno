# Adding content in six languages

The site publishes nothing in fewer than six languages (en, no, sv, de, fr, nl) and nothing that
is not backed by a verified rule. This folder is the pipeline that made 190 answers and 31 guides
in October 2026, written so the next batch is a repeat, not a rebuild.

`<REPO>` in the briefs is the repo root. `<WORK>` is any scratch folder outside the repo.

| Step | Brief | Output |
|---|---|---|
| 1. Verify new rules from official sources and draft English answers | briefs/1-research-rules-and-answers.md | rules/<area>.json, <WORK>/answers_<area>.json |
| 2. Fact check the English answers against the rules, apply fixes | briefs/2-fact-check-answers.md | <WORK>/factcheck.json |
| 3. Write English guides from verified rules only | briefs/3-write-guides.md | guides/<slug>.json (en) |
| 4. Fact check and fix the English guides in place | briefs/4-fact-check-guides.md | edited guides |
| 5. Translate answers, one agent per language | briefs/5-translate-answers.md | <WORK>/tr_<lang>.json |
| 6. Translate guides, one agent per language | briefs/6-translate-guides.md | <WORK>/gtr/<lang>/<slug>.json |
| 7. Merge | `node content/merge-answers.mjs <WORK>` and `node content/merge-guides.mjs <WORK>/gtr` | answers.js, guides |
| 8. Gate | `npm test` then `npm run build` | must be fully green |

Fact check BEFORE translating. Correcting English after translation means re-translating the
corrected entries in all five languages.

The gates that hold the line: `validate_rules.mjs` (rule shape and sources), `aeo_check.mjs`
(answers), `guide_check.mjs` (guides), `locale_check.mjs` (every page family in all six
languages, reciprocal hreflang, nothing left in English), `check_seo.mjs` (unique titles and
descriptions across all pages), `browser_check.mjs` (every route renders).

Steps 1 to 6 run in parallel per area and per language. Give every agent its own uniquely named
check script; a shared scratch file gets overwritten.
