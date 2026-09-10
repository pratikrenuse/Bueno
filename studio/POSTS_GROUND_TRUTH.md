# Verified ground truth for the LinkedIn post audit

Everything below was checked directly, today, not recalled. Use it as the reference.

## What getbueno.com actually says (checked live)

- The homepage hero: "TRUSTED BY HOMEOWNERS FROM 25+ COUNTRIES"
- Norwegian page: "boligeiere fra over 25 land benytter våre tjenester"
- German page: "gewählt von Eigentümern in über 25 Ländern"
- So the site's public claim is **25+ countries**, in three languages.

**Conflicting numbers now in circulation, all of which cannot be right:**
- getbueno.com says 25+, in English, Swedish, Danish, Norwegian and German
- the internal project brief says 28+
- the draft CTA from Natascha says 30+
- attorneys post day 10 says "more than 28 countries"

Treat 25+ as the only publicly supported figure. Flag every other number as an overclaim.

## Locale pages on getbueno.com (all checked live, and read to confirm the language)

**The Nordic paths are COUNTRY codes, not language codes.** Swedish is /se, not /sv.
Danish is /dk, not /da. A first pass tested /sv, got a 404 and wrongly concluded there was
no Swedish site. There is one, and Sweden is a primary market.

| language | URL | status | confirmed by |
|---|---|---|---|
| English | https://getbueno.com | 200 | "TRUSTED BY HOMEOWNERS FROM 25+ COUNTRIES" |
| Swedish | https://getbueno.com/se | 200 | "husägare från över 25 länder använder våra tjänster" |
| Danish | https://getbueno.com/dk | 200 | "husejere fra over 25 lande bruger vores tjenester" |
| Norwegian | https://getbueno.com/no | 200 | "boligeiere fra over 25 land benytter våre tjenester" |
| German | https://getbueno.com/de | 200 | "gewählt von Eigentümern in über 25 Ländern" |
| French | https://getbueno.com/fr | 200 | "PROFITEZ DE VOTRE MAISON EN ESPAGNE" |
| Spanish | https://getbueno.com/es | 200 | "DISFRUTE DE SU CASA EN ESPAÑA" |
| Dutch | https://getbueno.com/nl | 200 | "GENIET VAN UW SPAANSE WONING" |

Eight languages, matching the site's own switcher: English, svenska, français, Deutsch,
español, dansk, norsk, Nederlands. Both the bare path and the trailing-slash form return 200.

`https://getbueno.com/sv` is a 404 and is not a Bueno locale. Do not use it.

## Product pages that exist

/products/, /products/currency-exchange/, /products/electricity/, /products/home-alarm/,
/products/insurance/, /products/insurance-car/, /products/insurance-property/,
/account-requirements/, /about/, /about/help/faq/, /blog/, /partners/, /ambassadors/

## Pricing on the site

The homepage shows several figures, not one: €49/yr, €99/yr, €169/yr, €299/yr, €30/yr, €29, €2.
There is a price list PDF at /media/zodb1l2b/product-price-list-may-2026.pdf.
So "99 euros a year" is ONE tier, not the whole story. Flag any post that presents €99 as
the single price without qualification, and say what the site actually shows.

## Licensing

"Licensed by the Bank of Spain via SEFIDE EDE S.L.U." is the approved wording.

## The rules base

/home/claude/bc/rules/*.json holds 88+ Spanish tax and property rules. Every entry carries a
value, a statement, a primary source URL, a read date and a status. Read
/home/claude/bc/rules/README.md and /home/claude/bc/CORRECTNESS_PROTOCOL.md first.

Statuses: verified (checked against a primary source), partial (partly confirmed),
unverified (NOT confirmed, must never be presented as fact), annulled, myth.
