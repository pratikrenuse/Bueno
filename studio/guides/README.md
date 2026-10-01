# Bueno guide renderer

Every newsletter issue carries one branded guide, built in the exact design of the
Non-resident Property Tax guide (Sep 2026): navy cover with a Mediterranean photo, FS Siena,
gold eyebrow rules, light-blue tags, the Bueno logo in every footer, the support-photo call to
action page and the navy back cover.

```
python3 studio/guides/render.py studio/guides/specs/<slug>.json            # EN, NO and SV
python3 studio/guides/render.py studio/guides/specs/<slug>.json --lang sv  # one language
```

PDFs are written to `public/newsletter-guides/Bueno-Guide-<file>-<LANG>.pdf`. The render fails
with the page number if any text spills past the footer, so a guide can never ship clipped.

**Spec format.** See any file in `specs/`. Every string is `{"en": ..., "no": ..., "sv": ...}`.
Page types: `cover`, `content`, `example` (photo band with a card of rows and a total), `cta`,
`back`. Content blocks: `section`, `glance`, `photo`, `numbered`, `formula`, `deflist`,
`callout`, `headed`, `dates`, `rates`, `dash`, `para`, `h2`, `space`.

**Assets.** `assets/logo-white.png` and `assets/logo-navy.png` are the logos taken from the
original guide. `assets/fonts/` is FS Siena. `assets/photos/` are web-sized copies of the
Getty and iStock photos in `Bueno Brand/Images`. Needs Python 3 and Playwright with Chromium.
