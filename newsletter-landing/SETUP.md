# Bueno newsletter landing page (beehiiv)

Built the same way as superhuman.ai: beehiiv Website Builder, with custom HTML in **Embed** blocks and beehiiv's own **Signup** block in between. Signups land straight in beehiiv, so ads can point at newsletter.getbueno.com.

Open `preview.html` to see the full page. Each file in `blocks/` is pasted into one Embed block.

## Page order in beehiiv (Website Builder, Home page)

1. **Navbar** (native): Bueno logo (`247spain.es/images/pro/bueno-logo-navy.png`), links Archive and getbueno.com, button "Subscribe for free" in navy #010221.
2. **Section, 2 columns, white background, padding 70px top**
   - Left column: Embed `01-hero-text.html`, then native **Signup** block (button #5B7FCC, white text, radius 10px, height 54px, placeholder "Your email address", label "Subscribe for free"), then Embed `02-signup-note.html`.
   - Right column: Embed `03-phone.html`.
3. **Section, full width**: Embed `04-trust-strip.html`
4. **Section**: Embed `05-value-rows.html`
5. **Section**: Embed `06-inside.html`
6. **Section, background #010221 (navy)**: Embed `07-final-cta.html`, native **Signup** block (same style as above), Embed `08-final-note.html`.
7. **Footer** (native).

There is no Posts block on this page, so past issues are not shown.

Set every Embed block to width 100%, no border, padding 0, and section max width to full so the blocks control their own width.

## Assets used
- Fonts: FS Siena from `www.247spain.es/fonts/` (falls back to Georgia if the browser blocks it), DM Sans and IBM Plex Mono from Google Fonts.
- Images: `www.247spain.es/images/home/village.jpg` and the navy logo, already live on the site.

## Settings worth changing in beehiiv
- Settings > Website > SEO: title "The Bueno newsletter: Spanish property news for owners abroad", and a 1200x630 share image.
- Signup flow: send new subscribers to the latest post or a welcome page, not a blank thank-you.
- For ads, use UTM links (`?utm_source=meta&utm_campaign=...`); beehiiv records them per subscriber.
