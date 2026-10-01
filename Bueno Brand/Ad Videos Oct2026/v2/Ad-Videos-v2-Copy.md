# Ad videos v2, October refresh (29 September 2026)

Seven videos, 1080x1080 at 30 fps, silent so they work muted in the feed.

These replace the four videos in the parent folder. Those were photo backgrounds with text laid over them, which is not the house style. These are built on the templates from the September batch, plus three new ones.

Type is FS Siena Bold for headlines, Regular for body, per `Bueno_UI_Standard.md`. Palette is Navy #010221, Light Blue #CBEFFF, Accent Blue #5B7FCC, cream and the pale blue gradient. Real logo lockup on every frame. CTA pill on every end card with getbueno.com in bold, matching the September batch exactly.

Copy rules applied throughout: complete sentences, no fragments, no fear or penalty urgency, no em dashes, no emojis, no competitor named or implied negatively, informal "du", € before the amount, and the words "bank" and "banking" never used for Bueno.

---

## Templates used

**From your September batch**

| Template | Rebuilt as |
|---|---|
| Chat | NO-Chat-Brevet |
| Quiz | SV-Quiz-TreFragor |
| Huskeliste, checklist | SV-Huskeliste-Modelo210, and inside two others |
| Kinetic type | used as connective tissue in four of the seven |

**New, built this run**

| Template | What it does | Used in |
|---|---|---|
| Calendar flip | A date card physically flips from one date to another. Made for news that changes a deadline. | NO-Kalender-20April |
| Document translate | A Spanish letter card resolves line by line into plain Norwegian. Shows the core value rather than claiming it. | NO-Brevet-Oversatt |
| Comparison rows | Two columns fill in row by row, doing it yourself against Bueno. No competitor is named. | NO-Sammenligning-Skatt |
| Stat count | A number counts up from zero and lands on a fact. | NO-Tall-28Land |

---

## The seven videos

### 1. NO-Chat-Brevet.mp4, 26 seconds, Norwegian
A customer messages about a Spanish letter they cannot read, and the team answers in Norwegian. Ends on "Du skriver til ekte mennesker, og de svarer på norsk."
Angle: human support in your own language, named on 22 September as a key selling point that has never headlined an ad.

### 2. NO-Kalender-20April.mp4, 20 seconds, Norwegian
The rental tax deadline card flips from 20. januar to 20. april, then the checklist shows what Bueno does about it.
**Do not publish until John confirms the 20 April date in writing.** The entire video rests on it.

### 3. SV-Quiz-TreFragor.mp4, 20 seconds, Swedish
Three yes or no questions, then three answer cards, then "Då är Bueno värt en titt."
Angle: qualifies the viewer before pitching. Priced as "under €2 i veckan" rather than €99 a year, which reads smaller.

### 4. SV-Huskeliste-Modelo210.mp4, 20 seconds, Swedish
Modelo 210 broken into four steps that tick off one by one.
Angle: tax first for Sweden, per Isabella's advice, because Swedish budget does not scale on the account alone.

### 5. NO-Brevet-Oversatt.mp4, 19 seconds, Norwegian
A real-looking Agencia Tributaria letter, then the same card in plain Norwegian.
Angle: the single clearest demonstration of what Bueno does. This is the one I would test first.

### 6. NO-Sammenligning-Skatt.mp4, 17 seconds, Norwegian
Five rows comparing doing Modelo 210 yourself against having Bueno do it. Language, who fills it in, what happens if something is unclear, how you know it is filed, and next year.
No competitor is named or implied, per the rules.

### 7. NO-Tall-28Land.mp4, 18 seconds, Norwegian
28+ counts up, then €99, then what is included.

---

## Two things I found in your existing material

1. The September quiz video says "spansk **bankkonto**". `Bueno_UI_Standard.md` says never to use "bank" or "banking". It refers to the customer's own account rather than to Bueno, so it may be deliberate, but it reads against the rule. I used "spanska konto" in the new Swedish quiz.
2. The `NO-Video-Copy.md` note says pressing Bekreft throws a "details[1].Value" error at the end of all three screen recordings. That is still flagged for the product team and has not been mentioned since.

## Before these run

1. **John reads the Norwegian.** Five videos. Same check he did not complete on the six existing ads on 29 September: "I didn't screen the text in detail."
2. **Isabel reads the Swedish.** Two videos.
3. **John confirms 20 April in writing.** Blocks video 2 only.
4. **Nothing was uploaded to Meta.** No campaign, ad set, ad or audience was created or changed.

## Further templates worth building next

Ones I did not build because they need assets or facts I do not have:

- **App screen recording**, the strongest format you have, used in NO-UX-FasteTrekk and NO-UX-TreSpraak. Needs new recordings of the current app.
- **Customer story card**, a quote with attribution. Blocked on Petter, asked 1 September, 28 days ago.
- **Map or coverage**, showing the 28 countries filling in.
- **Cost stack**, small charges stacking up over a year against one fixed price. Needs vetted numbers.
- **Before and after inbox**, a pile of Spanish letters resolving into one tidy app list.
- **Seasonal calendar**, the tax year laid out with the dates Bueno handles for you.

## How these were made

Rendered frame by frame with Pillow and encoded with ffmpeg, from the real assets in this folder. No AI video generation and no voiceover, because no such tool is connected to this session. The render code is reproducible, so new copy can be dropped into the same templates in minutes.
