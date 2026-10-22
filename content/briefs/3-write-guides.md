# Guide writing brief: 247spain.es long-form guides (English)

247spain.es is a free information site for foreign owners of property in Spain (Norwegian,
Swedish, German, Dutch, French, British) who live elsewhere. You write long-form guides that
Google ranks and AI assistants quote. Facts are sacred: the site's whole value is that every
figure is sourced.

Read first, fully: <REPO>/TASTE.md (the voice; follow it closely, it is based on the
human-written getbueno.com blog), <REPO>/ARTICLE_CORRECTIONS.md (errors in the old
articles you must not repeat), and every rules file in <REPO>/rules/*.json (the only
allowed source of facts; use only rules with status "verified"), and <REPO>/answers/answers.js
(existing answers; link the relevant ones by slug).

Source articles are in <REPO>/studio/articles/<name>.txt. Use them for the topic,
the structure, the reader's real worries and practical texture. Do NOT copy their sentences
(they are live on another site, so copying creates duplicate content). Do NOT carry over any
figure, date, rate, deadline, threshold, fee or legal claim from them unless the same fact is in
a verified rule you list. Old articles contain errors.

For each guide assigned to you, write <REPO>/guides/<slug>.json:
{
  "slug": "...", "topic": "...", "tool": "...", "order": <if given>,
  "rules": ["every verified rule id whose facts the guide uses"],
  "answers": ["slugs of existing answers that cover parts of this subject, 3 to 8"],
  "i18n": { "en": {
     "title": "SEO title, 20 to 65 characters, different from h1, contains the main search phrase",
     "description": "meta description, 110 to 155 characters, a complete sentence",
     "h1": "the page heading, plain and specific",
     "lead": "2 to 3 sentences that answer the core question directly, so it can be quoted alone",
     "sections": [ { "h2": "question-style or plain heading", "paras": ["paragraph", "paragraph"] } ]
  } }
}
Only "en" for now (translations come later).

Rules for the writing:
- 900 to 1,500 words of English in total. 6 to 10 sections, each 2 to 4 paragraphs of 40 to 110
  words. Headings phrased as the questions owners actually search where natural.
- Each section starts with its main point. Concrete: what happens, when, who does it, what it
  costs (only from rules), what people get wrong. Practical steps an owner abroad can take.
- Where a rule gives a figure, use it and keep its conditions. Where something varies by region
  or town and no rule gives the figure, say that it varies and who sets it; never guess.
- No em dashes or en dashes, no emoji, no brand or company names (never Bueno, no banks, no
  Revolut or Wise), no "revolutionary", no fear or penalty urgency. Complete natural sentences.
  "percent" as a word, euros as "1,000 euros". Calm, plain, warm, specific. Not legal advice:
  say what the law says, and where a professional is needed, say which kind (abogado, gestor,
  notary, administrador de fincas) without promoting anyone.
- Self-check each file with node: valid JSON, word count, sections/paras counts, title 20 to 65
  chars, description 110 to 155, no [—–], every rule id exists in rules/*.json with status
  "verified" (rules files have a "rules" array; some older files have other shapes, ignore
  those), every answer slug exists in answers/answers.js. Then run
  `cd <REPO> && node guide_check.mjs` (it will complain only that the other five
  languages are missing; that is expected, everything else must pass).
- Then re-read each guide against its rules sentence by sentence and delete any claim that is
  not supported.

Report: the guides written, word counts, and any topic area where the rules were too thin
(name what is missing). Only write files in <REPO>/guides/. Touch nothing else.
