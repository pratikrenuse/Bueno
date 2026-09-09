# i18n key audit — Spain 24/7 (/home/claude/bc)

## 1. How lookup actually behaves (this determines what counts as a bug)

`/home/claude/bc/i18n.jsx:32-41` — `useT()`:

```
const v = get(dict, path);
if (v != null) return v;
const fallback = get(en, path);
return fallback != null ? fallback : path;
```

Three-stage: **active locale → en.json → the raw key string**.

Consequences for this audit:

- A key missing from a non-English locale but present in `en.json` is **never** a raw-key bug.
  English is rendered instead. The requested **GAP** category is structurally impossible in this
  codebase, and there are zero GAP findings.
- A key is only user-visible as a raw string if it is missing from **en.json as well**.
- `/home/claude/bc/ToolShell.jsx:19-28` — `useCopy(copyDict)` is a second, independent
  mechanism over per-tool `copy.js` files (not the locale JSON). It has the identical
  three-stage shape: `copy[locale] → copy.en → the key`. Same rule applies.

## 2. Numbers

| | |
|---|---|
| Locale files checked | 6 (en, no, sv, de, fr, nl) |
| Leaf keys in each locale file | **574 in every one of the six** |
| Key-set divergence between locales | **0** — no locale has a key the others lack, in either direction |
| Distinct locale-JSON keys resolved from source and checked | **562** |
| Locale-JSON keys missing from en.json | 5 (all in dead files — section 3) |
| Locale-JSON keys missing from a non-English locale only | **0** |
| `useCopy` keys resolved and checked across 10 tools | **350** |
| `useCopy` keys missing from their tool's `copy.en` | **0** |
| Fully dynamic keys that could not be enumerated | **0** |

## 3. BROKEN — keys missing from en.json

Five keys are absent from all six locale files. Both files that use them are **unreachable**:
nothing in the app imports either, so no user can be shown these raw keys today. They are
latent, not live.

| Key | Use site | Missing from |
|---|---|---|
| `footer.tagline` | `/home/claude/bc/Footer.jsx:15` | en, no, sv, de, fr, nl |
| `footer.rights` | `/home/claude/bc/Footer.jsx:26` | en, no, sv, de, fr, nl |
| `bueno_cta.tax_title` | `/home/claude/bc/BuenoCTA.jsx:24` (` t(`bueno_cta.${variant}_title`) `, `variant` defaults to `"tax"`) | en, no, sv, de, fr, nl |
| `bueno_cta.tax_body` | `/home/claude/bc/BuenoCTA.jsx:25` | en, no, sv, de, fr, nl |
| `bueno_cta.button` | `/home/claude/bc/BuenoCTA.jsx:32` | en, no, sv, de, fr, nl |

Why they are not reachable:

- **`Footer.jsx`** — every page imports `SiteFooter.jsx` instead. `/home/claude/bc/SiteFooter.jsx:15-17`
  already documents this: *"The old root-level Footer.jsx is dead: nothing imported it … and its
  footer.* translation keys never existed."* Confirmed: 9 files import `SiteFooter.jsx`, zero import
  `Footer.jsx`.
- **`BuenoCTA.jsx`** — grep for `BuenoCTA` across all `.jsx`/`.js` returns only its own definition
  and its own doc comment. It is never rendered. Its own header calls it *"the only place on
  Spain 24/7 where Bueno is mentioned"*, which is currently nowhere.

If either component is ever wired up, all five keys ship as raw strings in every language.
Either add the keys or delete the two files.

One more dead component worth flagging in the same breath: **`/home/claude/bc/DirectoryView.jsx`**
is not imported by anything either. It reads `calc_directory.eyebrow / headline / lede` via a
`keys` prop that no caller supplies (see section 5).

## 4. GAP — none

Zero. Requires (a) a key present in en.json but absent from another locale, and (b) no English
fallback. Neither holds: all six locale files carry an identical 574-key set, and `useT` falls
back to English regardless.

## 5. COSMETIC — English shown as fallback

**Locale JSON: none.** All six files are in exact key parity, so nothing falls through to English
at the `useT` layer.

**`useCopy` layer: 10 whole tools, by design.** Every per-tool `copy.js` exports a dict with a
single locale:

`closing-up`, `day-counter`, `contractor-check`, `pest-plan`, `storm-claim`,
`maintenance-schedule`, `late-surcharge`, `rental-vat`, `sale-tax`, `utility-setup`
— each `export default { en: {...} }`, no `no`/`sv`/`de`/`fr`/`nl`.

So `copy[locale] || copy.en` at `/home/claude/bc/ToolShell.jsx:21` resolves to English for every
non-English visitor on all ten tools. Not a raw-key bug, and the code says it is deliberate
(`/home/claude/bc/closing-up/copy.js:3`, `/home/claude/bc/contractor-check/copy.js:3`:
*"Other locales fall back to en until…"*). Recording it because it is the single largest
untranslated surface in the app: 350 strings.

Two related notes, both correct as written and neither a bug:

- `/home/claude/bc/src/Home.jsx:30-38` — `useCardText()` compares the lookup result against the
  key and falls back to the tool's own `meta.js` English strings. Only 6 of the tools have
  `cards.*` entries (`CARD_KEY` at line 25); the rest render meta.js English. All 24
  `cards.<key>.<field>` combinations resolved were present in all six locales.
- `/home/claude/bc/closing-up/index.jsx:39`, `/home/claude/bc/contractor-check/index.jsx:45`,
  `/home/claude/bc/pest-plan/index.jsx:55`, and the equivalents in `storm-claim`,
  `maintenance-schedule`, `late-surcharge`, `rental-vat`, `utility-setup` use the
  `c(k) === k ? null : c(k)` idiom for optional `_d` descriptions. That is a deliberate
  miss-test, not an accident, and it suppresses the raw key correctly.

## 6. Dynamic keys — how each was resolved

Every template-literal and helper-built key was resolved to a finite set and checked. None
remained unenumerable.

| Pattern | Site | Resolved from |
|---|---|---|
| `` t(`calc_directory.${k}`) `` via `tt` | `src/Home.jsx:50,172`, `spain-directory/index.jsx:145`, `spain-professionals/index.jsx:156`, `spain-professionals/ProfessionNote.jsx:19`, `DirectoryCompliance.jsx:30,59,99,131` | wrapper prefix + literal call sites |
| `` tt(`cat_${slug}`) `` / `_pl` | `src/Home.jsx:95,200`, `spain-directory/index.jsx:218,271,281,302`, `spain-professionals/index.jsx:264,302,356,377`, `ProfessionNote.jsx:28` | `CATEGORIES` (6) + `PROFESSIONALS` (8) in `spain-directory/categories.js` |
| `` tt(`does_${slug}`) `` | `src/Home.jsx:201` | `PROFESSIONALS` (8) |
| `tt(nameKey/doesKey/pluralKey/partKey/askKey(slug))` | `spain-professionals/index.jsx:183,264,302,303,356,377`, `ProfessionNote.jsx:22,28,33,34` | `spain-professionals/professions.js` × 8 slugs → `cat_`, `cat_*_pl`, `pro_does_`, `pro_when_`, `pro_cost_`, `pro_ask_` |
| `` tt(`fit_${k}`) `` | `DirectoryCompliance.jsx:139` | `FIT_ORDER = ['remote','updates','paperwork','access']` (line 124) |
| `tt(cond ? 'lang_reviewed_one' : 'lang_reviewed_many')` and the `lang_english_*` pair | `DirectoryCompliance.jsx:109,117` | ternary, both branches checked |
| `tt(extraNote)` | `DirectoryCompliance.jsx:74` | only live caller is `spain-professionals/index.jsx:402` passing `"prof_note"` — present |
| `` t(`home.group_${g}`) `` | `src/Home.jsx:251` | `GROUPS` (line 29), filtered by `counts[g]` |
| `` t(`cards.${key}.${field}`) `` | `src/Home.jsx:34` | `CARD_KEY` (6) × `{tag,title,desc,cta}` |
| `` t(`bueno_cta.${variant}_*`) `` | `BuenoCTA.jsx:24,25` | `variant` default `"tax"`; no caller exists |
| `` tt(`year_${code}_t`) ``, `` `claim_${code}_t/_d` ``, `tt('row_' + type)` | `mortgage-claim/index.jsx:92,166,207,208,284` | `YEAR_CODES`, `CLAIM_CODES` in `mortgageCalculations.js:41,43`; row types `setup/floor/insurance` |
| `` tt(`use_${code}_t/_d`) ``, `` `filing_${code}_t/_d` ``, `t('countries.' + code)` | `tax-calculator/index.jsx:113,168,184,249` | `PROPERTY_USE_CODES`, `FILING_CODES`, `COUNTRIES` (14) at lines 11-29 |
| `` c(`${current.id}_${o.value}`) ``, `` c(`q_${id}`) ``, `` c(`result_${verdict}`) `` | `contractor-check/index.jsx:44,45,68,76` | 12 `QUESTIONS` + their options in `flags.js`; 5 verdicts (`flags.js:240-245`) |
| `` c(`s_type_/s_around_/s_region_/s_season_`) `` | `pest-plan/index.jsx:70-79` | `REGIONS` (`index.jsx:16-24`) + option arrays |
| `` c(`result_${gates.verdict}`) `` | `utility-setup/index.jsx:43,44` | `steps.js:33` → `nie / installer / account / clear` |
| `` c(`stay_${a.stay}`) ``, and the `opt(k, n)` label builders in all 10 shell tools | `rental-vat/index.jsx:249` and equivalents | literal option arrays at each call site |

All of the above resolved to keys that exist. `seo/Areas.jsx` does not use the locale JSON for
its body copy at all — it reads `UI` / `BLOCK` / `HUB_UI` from `/home/claude/bc/seo/copy.js`,
which was checked separately and carries all six locales.

## 7. Dead weight — keys in en.json nothing references

13 of the 574 English keys are unreachable. (Four more that look unused — `lang_reviewed_one`,
`lang_reviewed_many`, `lang_english_one`, `lang_english_many` — are in fact used through the
ternaries at `DirectoryCompliance.jsx:109,117` and are **not** dead.)

Each is present in all six locales, so removing one means removing six lines.

| Key | Why dead |
|---|---|
| `calc_directory.eyebrow` | only read via `keys.eyebrow` in the unimported `DirectoryView.jsx:320` |
| `calc_directory.headline` | same — `DirectoryView.jsx:322` |
| `calc_directory.lede` | same — `DirectoryView.jsx:323` |
| `calc_directory.prof_headline` | the professionals-side `keys` object for the same dead component |
| `calc_directory.prof_lede` | same |
| `calc_directory.no_locality` | no reference anywhere in `.jsx`/`.js` |
| `calc_directory.rating_line` | no reference |
| `calc_directory.results_label` | no reference |
| `calc_directory.where_placeholder` | no reference (`town_placeholder` is the one in use) |
| `home.group_buying` | `GROUPS` lists `buying` (`src/Home.jsx:29`) but no `meta.js` declares `group: 'buying'`, so `counts.buying` is undefined and the filter drops it |
| `home.readiness_title` | no reference |
| `home.readiness_desc` | no reference |
| `nav.language` | no reference (`LangSwitcher.jsx` uses `LOCALE_LABELS` from `i18n.jsx`) |

## 8. Verdict

The live app is clean. Every one of the 562 locale-JSON keys that a user can reach resolves in
all six languages, and all six locale files are in exact key parity (574 keys each, zero drift).
All 350 `useCopy` keys resolve in their tool's `copy.en`. No user is shown a raw key anywhere.

The only real defects are housekeeping:

1. Three dead files (`Footer.jsx`, `BuenoCTA.jsx`, `DirectoryView.jsx`) holding 5 references to
   keys that exist in no locale — a trap for whoever revives them.
2. 13 orphan keys × 6 locales = 78 lines of dead translation.
3. Ten tools rendering English to non-English visitors because their `copy.js` files carry only
   `en` — intended, but it is 350 untranslated strings and worth a decision.
