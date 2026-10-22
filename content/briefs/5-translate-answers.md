Translate new content for 247spain.es (free information site for foreign owners of property in Spain) from English into LANGNAME (locale code LANG).

Read first:
- <REPO>/TRANSLATIONS.md (glossary, do-not-translate list, register: NO du, SV du, DE Sie, FR vous, NL u).
- <REPO>/answers/answers.js : the existing 20 answers already have a LANG version. Match their terminology, register and style exactly (e.g. how they render "imputed income", "cadastral value", "non-resident", "percent", "modelo 210", euros).
- <REPO>/TASTE.md for voice.

Source: every <WORK>/answers_*.json file (field "new": items with slug, q, a). Translate every item.

Rules:
- Translate meaning faithfully. Add nothing, drop nothing: these are legal/tax facts and every number, date, threshold and condition must survive exactly. Keep Spanish legal terms in Spanish as the English does (modelo 210/211/718, morada, allanamiento de morada, usurpacion, tercio de mejora, sociedad de gananciales, vecindad civil, declaracion responsable, Registro Central de Extranjeros, EX-15, EX-18, IGIC, IVA, IBI, NIE, Consorcio, burofax, plusvalia, legitima).
- Questions must read as what a native speaker would actually type into Google, and must end with "?" (French: space before ? like existing FR answers).
- Each answer must be 35 to 110 words (count by whitespace). Keep the answer-first structure.
- No em dash or en dash characters anywhere. No emojis. Do not add any brand names. Complete natural sentences only.
- Questions must stay at most 95 characters.

Output: write <WORK>/tr_LANG.json with shape
{ "answers": { "<slug>": { "q": "...", "a": "..." }, ... every slug } }
Then run a node check: every slug present, word counts 35..110, q ends with "?", no /[—–]/. Fix until clean. Report only "done" plus any term you were unsure of.
