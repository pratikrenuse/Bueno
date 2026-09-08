# Rebuilding the two directories

The two directories shared one component, `DirectoryView.jsx`. That kept the ranking and
Google's attribution rules in one place, and it made a plumber page and a lawyer page look
like the same page. Visitors told us it was confusing, and they were right: a burst pipe
and choosing a lawyer are not the same job.

So the logic stays shared and the presentation splits in two.

## What is shared, and must not be re-implemented

**`useDirectory.js`** is the hook. It owns the town list, the fetch, the URL round trip,
the language preference and the ranking.

```js
import { useDirectory } from '../useDirectory.js';

const d = useDirectory({ bySlug, defaultCategory, path });
```

It returns:

| | |
|---|---|
| `town, setTown, trade, setTrade` | current selection |
| `grouped` | localities grouped by region, for the picker |
| `picking, setPicking` | whether the picker or the results are showing |
| `prefLang, setPrefLang(code)` | the language the visitor wants help in |
| `run(townSlug, tradeSlug)` | fetch and show |
| `state` | `idle` / `loading` / `done` / `error`, and `busy` for convenience |
| `ranked` | the results, each `{ p, ev, boost, score }` |
| `shownTown, shownTrade, message, total` | |
| `withEvidence` | how many results have a review in the visitor's language or English |
| `withAnyEvidence` | as above, plus results where a reviewer merely mentioned language |

`ranked[i].p` is the business. `ranked[i].ev` is the language evidence, or `null`.

`SUPPORTED_PREF_LANGS` is the list to offer in the language control:
`en, no, sv, da, de, fr, nl, fi`.

## What each business now carries

On top of the fields the old page used (`name`, `address`, `rating`, `review_count`,
`phone`, `website`, `maps_uri`, `reviews`), the API now returns:

- `fit_langs`. `{ no: 2, en: 1 }`, the foreign languages its reviews were written in.
  Spanish and Catalan are never counted, because a Spanish review is the default case.
- `fit_evidence`. `{ language, remote, updates, paperwork, access }`, each
  `{ count, quote, lang }`. The quote is the fragment of the review it came from.
- `reviews_analysed`. how many reviews were read to produce that. We analyse five and
  show three.
- `fit`. a coarse ordering number. Never display it. It is not a score.

## The honesty rule, which is not negotiable

None of this establishes a fact about a business. A business reviewed in Norwegian has
probably served a Norwegian customer. It has **not told us it speaks Norwegian**.

- Write "Reviewed twice in Norwegian". Never "Speaks Norwegian".
- Write "A reviewer mentions English". Never "English spoken".
- No evidence means **we do not know**, not "no". The page says so in those words.
- Every fit signal is shown with the quote it came from, so a reader can judge it.

`DirectoryCompliance.jsx` already renders all of this correctly. Use it. Do not write your
own badge.

## Compliance components, all required

```js
import { Review, Attribution, Method, OnGoogle, LanguageEvidence, FitSignals, STARS, langName }
  from '../DirectoryCompliance.jsx';
```

- `<Review rv={r} variant="..." />`. one quoted review with the author's name, photo,
  profile link and a link to the review. Google requires all four. Do not strip any of
  them to tidy a card.
- `<Attribution />`. the "powered by Google Maps" line. Required, and it may not be
  styled into invisibility.
- `<Method extraNote="..." />`. how results were ordered and filtered, plus our own note
  that we have not met these businesses. Required. Must appear on every results view.
- `<OnGoogle uri={p.maps_uri} />`. link to the business on Google Maps.
- `<LanguageEvidence evidence={ev} want={prefLang} />`. the language label.
- `<FitSignals evidence={p.fit_evidence} />`. the other signals with their quotes.

**Never put results on a map.** Google Places content may be shown with no map, which is
what we do, but never beside a non-Google map. Adding Leaflet or Mapbox breaches the terms.

## i18n

Strings live under `calc_directory.*` in the six locale files. The language and fit strings
already exist in all six: `lang_*`, `fit_*`, `pref_label`, `pref_help`, `match_none`,
`match_some`, `match_all`, `sorted_note`, `method_lang`, `honest_lang`.

Any NEW key you add must be added to **all six** files (`en, no, sv, de, fr, nl`), not just
English. Keep them under `calc_directory`.

## Brand rules, without exception

- No em dashes anywhere, in copy or in code comments. No emojis.
- This is Spain 24/7. Never mention Bueno, or name any bank, insurer or utility.
- No "revolutionary", "disruptive", "game-changing". No fear-based urgency. No overpromising.
- Colours only from the tokens in `src/App.css`: `--navy #010221`, `--light-blue #CBEFFF`,
  `--accent #5B7FCC`, `--gold #C9A96E`, `--off-white #F8F7F4`, `--warm-grey #D4CFC8`,
  `--text-muted #6B7280`. Never introduce a new hex.
- `--accent` is for fills and large text. At 14px on white it does not reach 4.5:1, so it
  is never used for small body copy.

## C.L.E.A.R.

Score the screens you build 0 to 5 on Copywriting, Layout, Emphasis, Accessibility and
Reward, fix the lowest first, and report the scores.

- One unmissable primary action per screen. Squint at it: the most important thing must
  still dominate.
- 48px minimum tap targets, 4.5:1 text contrast, never colour alone.
- Result screens lead with the answer, not the method.

## Verify before reporting done

```
cd /home/claude/bc
npx vite build
```

must pass, and

```
node directory-ranking.test.mjs
node api/_fit.test.mjs
```

must both still pass. Do not change files outside your own page, the CSS block you add,
and the six locale files.
