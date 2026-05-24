# Bueno Spanish Property Tax Calculator

A production-grade, AI-powered Modelo 210 tax calculator for foreign property owners in Spain.

Built with React + Vite. Deployed on Vercel. Leads captured in Supabase. AI report generated via Anthropic Claude.

---

## What it does

1. Guides the user through 6 questions about their property situation
2. Calculates their exact annual Modelo 210 liability
3. Identifies if they have outstanding unfiled years and estimates total liability
4. Captures their email (stored in Supabase)
5. Generates a personalised AI tax summary via Claude
6. CTAs to getbueno.com

---

## Tech stack

| Layer      | Tool                            |
|------------|---------------------------------|
| Frontend   | React 18 + Vite                 |
| Styling    | CSS custom properties (no Tailwind) |
| Fonts      | Playfair Display + DM Sans (Google Fonts) |
| API route  | Vercel serverless (`/api/generate-report.js`) |
| AI         | Anthropic Claude (server-side)  |
| Database   | Supabase (lead capture)         |
| Hosting    | Vercel                          |

---

## Local setup

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_ORG/bueno-tax-calculator.git
cd bueno-tax-calculator

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in your Supabase URL, anon key, and Anthropic key

# 4. Add the Bueno logo
# Copy Bueno_logo_Blue.jpg to /public/bueno-logo.jpg

# 5. Run locally
npm run dev
```

---

## Environment variables

| Variable                  | Where to set     | Description                     |
|---------------------------|------------------|---------------------------------|
| `ANTHROPIC_API_KEY`       | Vercel dashboard | Claude API key (server-side)    |
| `VITE_SUPABASE_URL`       | `.env.local`     | Your Supabase project URL       |
| `VITE_SUPABASE_ANON_KEY`  | `.env.local`     | Your Supabase anon (public) key |

**Important:** `ANTHROPIC_API_KEY` must NOT be prefixed with `VITE_`. It is only used server-side in the API route.

---
 
## Supabase setup

Run this SQL in your Supabase SQL editor:

```sql
CREATE TABLE tax_calculator_leads (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email           TEXT NOT NULL,
  country         TEXT,
  country_name    TEXT,
  property_use    TEXT,
  cadastral_value NUMERIC,
  rental_income   NUMERIC,
  filing_history  TEXT,
  annual_tax      NUMERIC,
  total_liability NUMERIC,
  years_unfiled   INTEGER,
  is_eu_eea       BOOLEAN,
  status          TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tax_calculator_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow inserts" ON tax_calculator_leads
  FOR INSERT TO anon WITH CHECK (true);
```

---

## Vercel deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# Settings > Environment Variables
# ANTHROPIC_API_KEY = sk-ant-...
# VITE_SUPABASE_URL = https://...
# VITE_SUPABASE_ANON_KEY = eyJ...
```

---

## Adding FS Siena font

If you have the FS Siena font licence:
1. Add the font files to `/public/fonts/`
2. Add `@font-face` declarations in `App.css` before the `:root` block
3. The CSS already references `'FS Siena'` first in the font stack

---

## Calculation methodology

**Non-rental properties (deemed income):**
- Taxable base = Cadastral value × 1.1% (if revised in last 10 years) or × 2%
- Tax = Taxable base × 19% (EU/EEA residents) or 24% (non-EU, including UK post-Brexit)

**Rental properties:**
- Tax = Gross rental income × 19% (EU/EEA) or 24% (non-EU)
- EU/EEA residents may deduct expenses; non-EU residents cannot

**Late filing surcharges:**
- Up to 3 months late: 5%
- 3–6 months: 10%
- 6–12 months: 15%
- Over 12 months: 20% + interest

Spain's AEAT can assess up to 4 prior years.

---

## Files

```
bueno-tax-calculator/
├── api/
│   └── generate-report.js   # Vercel serverless — Claude API call
├── public/
│   └── bueno-logo.jpg       # Add this manually from project assets
├── src/
│   ├── main.jsx             # React entry point
│   ├── App.jsx              # Root wrapper
│   ├── App.css              # All styles (Bueno brand system)
│   ├── TaxCalculator.jsx    # Main component — all steps + results
│   ├── taxCalculations.js   # Modelo 210 calculation logic
│   └── supabase.js          # Lead capture client
├── .env.example
├── index.html
├── package.json
├── vercel.json
└── README.md
```

---

## Disclaimer

This tool is for guidance only. It does not constitute legal or tax advice. Users should consult a qualified tax professional for their specific situation.
