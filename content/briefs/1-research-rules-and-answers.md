# Research brief: new verified rules + answers for 247spain.es

247spain.es is a free information site for foreign (non-resident) owners of property in Spain
(Norwegian, Swedish, German, Dutch, French, British). Its credibility rests on a rules base:
every fact on the site comes from a rule that records the law article, the official URL, and
the date a person read it. Answer engines (Google AI Overviews, ChatGPT, Perplexity, Claude)
cite pages like this. You are expanding the base in ONE area (given below) and drafting answers.

Repo: <REPO>. Read first: rules/README.md, rules/_schema.json, two existing rules
files (rules/irnr.json, rules/limitation-periods.json) for shape and tone, validate_rules.mjs,
TASTE.md (voice), and <WORK>/existing.json (existing rule ids and questions: do not
duplicate them; you may reference existing verified rule ids in answers).

## Step 1: research and write rules
- Use WebFetch / WebSearch. ONLY official primary sources count for status "verified":
  boe.es (consolidated texts, use the act.php?id=... page; long pages truncate, so use the
  WebFetch offset parameter or fetch the article anchor until you have read the actual article
  text), sede.agenciatributaria.gob.es / agenciatributaria.es, ministry sites (hacienda.gob.es,
  inclusion.gob.es, exteriores.gob.es, mjusticia.gob.es / mjusticia), catastro, regional official
  gazettes (DOGV, BOJA, BOIB, BOC, DOGC, BORM) and regional government sites, EUR-Lex for EU law.
- A rule is "verified" only if you read the exact supporting text on that official page in this
  session. Otherwise "partial" (with the caveat in notes) or leave it out. Never invent.
- Write a NEW file rules/<FILE>.json: { "domain": "...", "rules": [ ... ] }, each rule with
  id (dotted, unique, prefixed by your area), statement, value, unit, status, source {name, ref,
  url, source_dated, read_on: "2026-10-22"}, review_by (ISO date, 2027-06-01 typical; sooner for
  figures that change yearly), notes.
- No em or en dashes, no emoji, never name a company or brand (no banks, no Bueno).
- Run `cd <REPO> && node validate_rules.mjs` and fix until it passes. Do not edit
  any other existing file.

## Step 2: draft answers (only from verified rules)
Write <WORK>/answers_<FILE>.json:
{ "new": [ { "slug", "tool", "topic", "rules": [ids], "q", "a" } ] }
- Aim for as many genuinely useful questions as the verified rules support (typically 15 to 30),
  phrased the way an owner actually types into Google ("Do I...", "How much...", "What is the
  deadline...", "Can I..."), max 90 characters, ending with "?".
- Answer 45 to 100 words (hard limit 35 to 110), first sentence answers directly, then the
  conditions and the one thing people get wrong. Every claim must come from the statement/notes
  of the rules you list (1 to 4 ids, your new ones and/or existing verified ones). Write
  "percent" as a word and euros like "1,000 euros". Complete natural sentences only.
- topic: one of tax, selling, buying, letting, community, home, insurance, legal-claims, inheritance,
  residency.
- tool: the most relevant existing folder that has index.jsx in <REPO> (e.g.
  purchase-costs, tax-calculator, rental-tax, rental-vat, sale-tax, cost-audit, inheritance-roadmap,
  your-rights, day-counter, utility-setup, closing-up, contractor-check, deal-checklist,
  poa-planner, seller-pack, aml-file, storm-claim, late-surcharge, maintenance-schedule).
- slugs: lowercase-hyphenated, unique, not clashing with existing ones.
- Self-check with a node script: valid JSON, word counts, "?" endings, no [—–], every rule id
  exists and is verified (new file or rules dir), tool folders exist.

Report back: number of rules (verified / partial), number of answers, and anything you could not
verify. Be concise.
