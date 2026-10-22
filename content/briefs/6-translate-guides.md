# Translate 247spain.es guides from English into LANGNAME (locale LANG)

Read first: <REPO>/TRANSLATIONS.md (glossary, do-not-translate, register: NO du, SV du,
DE Sie, FR vous, NL u), <REPO>/TASTE.md (voice), and skim the LANG versions in
<REPO>/answers/answers.js to match their established terminology and number style
(e.g. how "imputed income", "cadastral value", "non-resident", "community of owners", "percent",
euro amounts and thousands separators are written).

Input: the guide files <REPO>/guides/<slug>.json for the slugs listed below. Each has
i18n.en = { title, description, h1, lead, sections: [ { h2, paras: [...] } ] }.

For each slug write <WORK>/gtr/LANG/<slug>.json containing ONLY the translated object:
{ "title", "description", "h1", "lead", "sections": [ { "h2", "paras": [...] } ] }
with exactly the same number of sections and the same number of paragraphs per section as English.
Do not edit the guide files themselves.

Rules:
- Faithful: every number, date, deadline, percentage, condition and legal term survives exactly.
  Add nothing, drop nothing. Keep Spanish legal terms in Spanish where the English does (modelo
  210/211/650/718, IBI, NIE, TIE, IVA, ITP, AJD, plusvalia, nota simple, arras, escritura,
  Catastro, valor de referencia, morada, legitima, declaracion responsable, administrador de
  fincas, abogado, gestor, etc.).
- Native, natural, calm prose. Headings phrased the way a LANGNAME speaker would search.
- title: 20 to 65 characters, must differ from h1, contains the main search phrase in LANGNAME.
- description: 70 to 155 characters, one complete sentence.
- No em dash or en dash characters, no emoji, no brand or company names.
- After each file, run a node check: valid JSON, section/paragraph counts equal to English, title
  20..65 and != h1, description 70..155, no /[—–]/. Fix until clean. Save each file as soon as it
  passes so work is not lost.

Report "done" with the list of files and any terms you were unsure of.
