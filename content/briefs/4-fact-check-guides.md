# Independent fact check of 247spain.es guides (English), fix in place

You check long-form guides for foreign owners of Spanish property. The site's credibility rests on
every fact being supported by a verified rule. For each guide file listed below
(<REPO>/guides/<slug>.json, English in i18n.en):
1. Load every rule it lists in "rules" from <REPO>/rules/*.json (match objects by "id"
   anywhere in the file; use statement, value, notes, source).
2. Read every sentence. Every number, date, deadline, percentage, fee, condition, legal effect,
   office or procedure must be supported by one of those rules (or by another VERIFIED rule in the
   rules folder, in which case add its id to "rules"). Partial, unverified, myth or annulled rules do
   not count as support, except that a sentence saying a widely repeated claim is a myth or has been
   annulled is fine if the rule says so.
3. Fix problems directly in the file: delete or soften unsupported or overstated claims, restore
   dropped conditions, fix arithmetic. Keep the voice (TASTE.md), no em/en dashes, no brand names,
   complete sentences. Keep each paragraph 40 to 110 words and each section 2 to 4 paragraphs; keep
   the total between 900 and 1,500 words (shorten rather than pad). Do not change slug, topic, tool,
   order or answers, except to remove an answer slug that does not exist in answers/answers.js.
4. After editing, run `cd <REPO> && node guide_check.mjs` and make sure nothing fails
   for your guides except the five missing translations.

Write a short log to <WORK>/gfc_NAME.md: per guide, what you changed and why (one line
each). Report the number of changes per guide.
