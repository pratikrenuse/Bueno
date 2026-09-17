# Post image templates (studio/renderer/tpl.py)

Twelve 1080x1080 layouts, all built on the two cards Pratik approved in September 2026:
the Bueno taxes card (photo band across the top, numbered hairline rows, navy footer block)
and the Facebook-group card (photo faded in from the right, white pills bleeding off the
left edge, one navy pill).

`simple3.py` is untouched and still works. `tpl.py` reads the same content JSON, so any
existing content file renders through either renderer.

## Running it

    python3 studio/renderer/tpl.py list
    python3 studio/renderer/tpl.py image studio/content/<file>.json studio/themes/247spain.json
    python3 studio/renderer/tpl.py contact studio/themes/247spain.json     # one card per template

Output lands in `studio/out/`. Override with `STUDIO_OUT`, photos with `STUDIO_PHOTOS`.

## Content schema

    {
      "slug": "owners_02_imputed_tax_en",
      "language": "en",
      "template": "band_rules",          // omit and it is picked from the slug
      "photo": "cove_house.jpg",         // omit and it is picked from the slug
      "eyebrow": "MODELO 210 · IMPUTED INCOME",
      "headline": ["line one", "line two"],
      "sub": "optional single sentence under the headline",
      "figure": "0.2 to 3.5%",           // number_hero only
      "columns": ["OFTEN ASSUMED", "WHAT APPLIES"],   // compare only
      "cta": "optional",                 // pill_right only
      "rows": [{"label": "...", "fact": ["..."], "detail": "..."}]
    }

Leaving `template` out spreads layouts across a feed automatically, which is what the
no-repeated-layout rule wants. Set it explicitly when a specific post needs a specific shape.

## The twelve

| Template | Shape | Use it for |
|---|---|---|
| `band_rules` | Photo band top, numbered hairline rows, navy footer | The default. Three flat facts in order. |
| `pill_right` | Photo faded in from the right, pills bleeding off the left | Offers and anything with a price or a claim |
| `band_pills` | Photo band top, pills below | Softer version of band_rules |
| `rules_only` | No photo, pure type, hairline rows | Dense legal points where a photo is noise |
| `stat_band` | Big statement up top, two rows, photo band at the base | One claim that needs backing |
| `split_rules` | Photo down the left half, rows on the right | Portrait-ish photos |
| `card_stack` | Three white cards on the light ground | Step by step |
| `quote_band` | Headline set large inside a navy block | Correcting a myth. One point, said once. |
| `checklist` | Ticks instead of numbers | Do this before you sign |
| `timeline` | Dots on a vertical rule | Deadlines and anything with an order |
| `compare` | Two columns, assumed against applies | Myth-busting with the real rule beside it |
| `number_hero` | One figure very large | A rate, a threshold, a fee |

## Surfaces

Every card is built on one of seven surfaces, taken from the brand palette, so a
feed is not 105 pale blue gradients:

| Surface | What it is |
|---|---|
| `ivory` | Off-white #F8F7F4 |
| `sky` | Light Blue #CBEFFF |
| `sand` | Warm Grey #D4CFC8 |
| `navy` | Navy #010221, type reversed to white automatically |
| `photo_top` | Duotone photo band across the top, fading into the surface |
| `photo_wash` | Duotone photo faded in from the right |
| `photo_side` | Duotone photo down the left column |

`SURFACES` in `tpl.py` lists which surfaces suit which template, and one is
picked from the slug unless the content file names a `surface`. Note that
`photo_top` costs 448px of height, so templates carrying a headline plus three
blocks (`stat_band`, `card_stack`, `checklist`) are not offered it.

`Skin` resolves ink, label, rule and chip colours from the surface, so contrast
is never guessed and navy cards reverse correctly.

## Layout rules

Three rules the file enforces, each from a correction:

1. **Type sits on a grid.** Every string goes through `txt()`, baseline-anchored
   at `MX`. Mixing top-anchored and baseline-anchored calls in one card drifts
   the left edge and the rhythm. Vertical movement goes through `Flow`.
2. **No dead space.** `grow()` picks the largest size that fits rather than a
   fixed one, and `fit_block()` centres a stack in its space instead of
   clustering it under the headline with a hole above the bar. `room_for()`
   drops a trailing row rather than drawing it clipped.
3. **The lockup is untouchable.** Pasted whole, never cropped, never
   re-typeset. If the payoff reads small, raise `LOGO_W` and `FOOT`.

## Branding

Branding comes from the theme's `footer` block, which `simple3.draw_footer` already handles:

- `studio/themes/247spain.json` renders the 24/7 SPAIN wordmark. Use it for anything public.
- `studio/themes/247spain-bueno.json` renders the Bueno lockup and `getbueno.com`.

**The Bueno theme is for the /internal-linkedin team deck images only**, on Pratik's
instruction of 17 September 2026. Note that this overrides the standing rule that the
247spain pipeline stays info-only with no Bueno mention. The /internal-pratik deck and
anything published on 247spain.es keep the 247spain theme.

## Adding a template

Write `t_<name>(c, th) -> PIL.Image`, add the name to `TEMPLATES` and the function to
`RENDERERS`. Keep to the palette in the theme, keep the left margin at `MX`, and finish
with `footer_block(...)` so the brand mark stays consistent.
