# How to add a tool

A tool is a folder at the repo root containing `index.jsx`, `meta.js` and, if it has much
copy, `copy.js`. `App.jsx` and `Home.jsx` discover it through a Vite glob. Nothing else is
edited. Never ask anyone to touch `App.jsx`.

Two reference tools, one of each shape:

- `closing-up/` is a generator. Five questions, then a printable checklist built by a pure
  function in `list.js`. No legal constants.
- `storm-claim/` is a router. Four questions, a verdict, and every figure read from the
  rules base with its source shown on the page.

Read both before writing a third.

## ToolShell API

```jsx
import ToolShell, { Intro, Step, Options, Result, Panel, Rows,
                    NumberField, DateField, Checklist, useCopy } from '../ToolShell.jsx';
import SourceNote, { ToolDisclaimer } from '../SourceNote.jsx';
```

`ToolShell({ title, note, progress, children })` gives header, sticky nav, language
switcher, progress bar and footer. `progress` is 0 to 100, or null to hide the bar.

`Intro({ eyebrow, headline, body, points, cta, minutes, onStart })`

`Step({ n, of, question, hint, children, onBack, onNext, nextLabel, nextDisabled })`
One question per screen. `hint` is where reassurance goes and is not optional on a question
the reader might not know the answer to.

`Options({ items, value, onChange, columns })` where items are
`{ value, label, desc }`. Whole card is the tap target.

`NumberField({ label, value, onChange, prefix, suffix, placeholder, hint, min, max })`
`DateField({ label, value, onChange, hint, min, max })`

`Result({ headline, sub, tone, children, onRestart, restartLabel })`
`tone` is 'neutral' | 'good' | 'warn' and drives the accent stripe only. Colour never
carries meaning on its own.

`Panel({ title, kind, children })` where kind is 'plain' | 'quiet' | 'key' | 'dark'.
`Rows({ items })` where items are `{ label, value, strong }`.
`Checklist({ groups })` where groups are `{ title, note, items }` and an item is a string
or `{ text, why }`.

Extra classes available: `tk-para` for a paragraph inside a Panel, `tk-ol` for an ordered
list inside a Panel.

## The rules base

```js
import { rule, ruleStatus } from '../rules/index.js';
const WIND = rule('consorcio.wind_threshold');   // WIND.value === 120
```

`rule(id)` throws on an unknown id, and throws on a rule whose status is unverified,
annulled or myth. That is deliberate: an unverified figure must never reach a user. If a
tool needs to handle that case gracefully, call `ruleStatus(id)` first and render its own
"we do not cover this yet" state.

**No rate, threshold, deadline or percentage may be typed into a tool file.** If the number
you need is not in `rules/`, the tool does not ship with that number in it. Say so in your
report rather than inventing one.

Every figure a tool displays must render `<SourceNote ids="..." />` near it. One id or an
array. A rule with status `partial` renders its own caveat automatically.

Every result screen ends with `<ToolDisclaimer />`.

## Copy

Put user-facing text in `copy.js` as `{ en: { ... } }` and read it with
`const c = useCopy(copyDict)`. Dot paths work. Other locales fall back to English until
translated, so English is the only one you write.

## Brand rules, without exception

- No em dashes anywhere, in copy or in code comments. Use a full stop, a comma, or "and".
- No emojis.
- This site is Spain 24/7. Never mention Bueno, Currencies Direct or Energy Nordic.
- Never name a bank, insurer, utility or competitor. Figures taken from an article that
  named a company keep the figure and drop the name.
- No "revolutionary", "disruptive", "game-changing". No fear-based urgency. No overpromising.
- Short, natural sentences. Each earns its place.
- Colours only from the palette already in App.css: `--navy #010221`, `--light-blue #CBEFFF`,
  `--accent #5B7FCC`, `--gold #C9A96E`, `--off-white #F8F7F4`, `--text-muted #6B7280`.
  Never introduce a new hex.

## C.L.E.A.R.

Before you finish, score the screen you built 0 to 5 on each of Copywriting, Layout,
Emphasis, Accessibility, Reward, and fix the lowest first.

- **Copywriting.** The benefit is obvious in two seconds. If a competitor could reuse your
  exact words, they are too vague. Result screens lead with the answer, not the method.
- **Layout.** One question per screen, 640px column, tight spacing inside a group and
  generous between groups.
- **Emphasis.** One unmissable primary action per screen. Squint at it: the most important
  thing must still dominate.
- **Accessibility.** 48px minimum tap targets, 4.5:1 text contrast, never colour alone,
  disable an action that cannot succeed. `--accent` is for fills and large text, never for
  small body copy on white.
- **Reward.** These readers are anxious about Spanish bureaucracy. The payoff we want is
  control: they now know where they stand and what to do next. Say the honest answer even
  when it is unwelcome, and always say what to do about it.

## Honesty

If the source material does not support a number, the tool does not state one. A range
stays a range. A maximum is labelled a maximum. Where an answer depends on a municipal
ordinance, compute what you can and name the ordinance the reader must check. "We do not
have a confirmed figure for your region" is a better answer than a plausible one.

## Verify before you report done

```
cd /home/claude/bc
export PATH="/home/claude/buildcheck/node_modules/.bin:$PATH"
esbuild src/main.jsx */index.jsx */meta.js --bundle --outdir=/tmp/out --format=esm --jsx=automatic \
  --external:react --external:react-dom --external:react-dom/client --external:react-router-dom \
  --external:@supabase/supabase-js --external:/fonts/* --external:/images/* --external:*.png --external:*.jpg \
  --loader:.css=css
```

This must pass. `--bundle` matters: without it esbuild only parses and never resolves
imports, which is how a broken import reached production once already.
