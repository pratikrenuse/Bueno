# Spain 24/7 — Foundation Rebuild (drop-in files)

This bundle is the **foundation layer** for the 247spain.es rebuild. It does three things:

1. Removes Bueno from the public-facing site (nav, home, footer)
2. Adds path-based i18n: `/` (EN), `/no/` (NO), `/sv/` (SV)
3. Introduces a single `<BuenoCTA />` component — the only Bueno surface, designed to drop into tool **result** screens (Modelo 210 first)

The auto-discovery glob in `src/App.jsx` is preserved. Tool folders at `/tools/<slug>/index.jsx` are picked up automatically — no manual route edits.

---

## Files

```
src/
├── App.jsx                          ← REPLACE existing
├── styles.css                       ← REPLACE existing (or merge into your existing globals)
├── i18n/
│   ├── en.json                      ← NEW
│   ├── no.json                      ← NEW
│   └── sv.json                      ← NEW
├── lib/
│   └── i18n.jsx                     ← NEW  (LocaleProvider, useT, LLink, LangSwitcher hooks)
├── components/
│   ├── Layout.jsx                   ← NEW
│   ├── Nav.jsx                      ← NEW  (replaces old nav)
│   ├── Footer.jsx                   ← NEW
│   ├── LangSwitcher.jsx             ← NEW
│   └── BuenoCTA.jsx                 ← NEW  (only Bueno surface)
└── pages/
    └── Home.jsx                     ← REPLACE existing

public/images/
├── bueno-b-icon.png                 ← NEW (from /mnt/project/Bueno_app_icon.png)
└── bueno-wordmark.jpg               ← NEW (from /mnt/project/Bueno_logo_Blue.jpg)
```

The existing FS Siena font files in `public/fonts/` are reused — no changes needed.

---

## Install

`react-router-dom` v6.4+ is required (we use `createBrowserRouter` + `ScrollRestoration`). If you're on the older `BrowserRouter` API, upgrade:

```bash
npm install react-router-dom@^6.22
```

Make sure `src/main.jsx` imports the new styles:

```jsx
import './styles.css';
import App from './App.jsx';
```

---

## How i18n works

- Default locale is English at `/`. Norwegian at `/no/...`. Swedish at `/sv/...`.
- Any page reads strings via the `useT()` hook: `t('hero.title')`.
- All internal links use `<LLink to="/tax-calculator">` instead of `<Link>` — it auto-prefixes the active locale.
- The `<LangSwitcher />` in the nav rewrites the current path into the target locale, preserving the page you're on.
- Add a new string: edit all three JSON files in `src/i18n/`. Falls back to EN if a key is missing in NO/SV.

---

## How tools opt into i18n

Inside any tool's `index.jsx`, import the same hooks:

```jsx
import { useT, useLocale } from '../../src/lib/i18n.jsx';

export default function TaxCalculator() {
  const t = useT();
  const { locale } = useLocale();
  // ...
}
```

Then add tool-specific strings under a `tools.tax.*` namespace in each `i18n/*.json`.

---

## How the Bueno CTA works

Render `<BuenoCTA variant="tax" />` on the **result screen** of the Modelo 210 calculator (after the user sees their tax figure). Today it's the only place Bueno appears.

```jsx
import BuenoCTA from '../../src/components/BuenoCTA.jsx';

// inside the result section:
<BuenoCTA variant="tax" href="https://getbueno.com/modelo-210" />
```

Add more variants later (`cost`, `rental`) by adding `bueno_cta.cost_title`, `bueno_cta.cost_body` etc. to the JSON files.

---

## What's next (subsequent turns)

1. **Modelo 210 Tax Calculator** — rebuild result screen, plug in `<BuenoCTA variant="tax">`, wire to i18n
2. **Property Cost Audit** — same treatment
3. **Rental Tax** — same treatment
4. Replace lead-capture email copy with localised Norwegian/Swedish versions
5. Hreflang tags in `index.html` for SEO across locales

Confirm which tool to rebuild first and I'll deliver it next.
