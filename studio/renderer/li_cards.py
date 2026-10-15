"""LinkedIn post images in the Bueno card style (15 October 2026).

Pratik asked for half of the /internal-linkedin posts to carry the same branded cards as the
/internal-poornima Facebook posts instead of a stock photograph. This script draws them with
the SAME templates as studio/renderer/fb_cards2.py, which it imports and never changes, so
the Facebook images and their renderer stay exactly as they are.

Differences from the Facebook cards:
- Every card carries the Bueno logo.
- The small print reads "General information, not legal or tax advice." in the card's
  language, because the LinkedIn posts also cover contracts, inheritance and planning law.
- A card can reuse a Facebook image when the topic and facts are the same ("reuse": key).
  It is drawn from that Facebook card's JSON in the same language, so the pictures match.
  Spanish has no Facebook cards, so es.json carries those two cards written out in full.

One image per team language: English plus the five languages the team posts in.
Card JSON: studio/linkedin/cards/<lang>.json, keyed by the LinkedIn post slug. The layout
(template, photo) comes from en.json; the other files carry the translated text.
Output:    public/li-cards/<slug>.jpg for English, public/li-cards/<lang>/<slug>.jpg for the
           others, served at https://www.247spain.es/li-cards/...

Usage, from the repo root:
  python3 studio/renderer/li_cards.py all
  python3 studio/renderer/li_cards.py one <slug> <lang> out.jpg
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fb_cards2 as fb

CARDS_DIR = os.environ.get("LI_CARDS_DIR", "studio/linkedin/cards")
OUT = os.environ.get("LI_OUT", "public/li-cards")
LANGS = ["en", "nl", "sv", "no", "es", "fr"]
SMALL_PRINT = {
    "en": "General information, not legal or tax advice.",
    "nl": "Algemene informatie, geen juridisch of belastingadvies.",
    "sv": "Allmän information, inte juridisk rådgivning eller skatterådgivning.",
    "no": "Generell informasjon, ikke juridisk rådgivning eller skatterådgivning.",
    "es": "Información general, no es asesoramiento legal ni fiscal.",
    "fr": "Information générale, pas un conseil juridique ou fiscal.",
}

def load(lang):
    with open(os.path.join(CARDS_DIR, f"{lang}.json"), encoding="utf-8") as f:
        return json.load(f)

def render(slug, card, lang, out):
    if card.get("reuse"):
        # Drawn from the Facebook card's own JSON, with the Facebook small print, which
        # gives the same picture as public/fb-cards/<key>/<lang>.jpg.
        fbcard = fb.load(lang)[card["reuse"]]
        return fb.render(dict(fbcard, logo=True), lang, out)
    # fb_cards2 reads its small print from DISCLAIMER[lang]. Set it for this one render and
    # put the Facebook value back afterwards, so nothing else ever sees the change.
    had = lang in fb.DISCLAIMER
    saved = fb.DISCLAIMER.get(lang)
    fb.DISCLAIMER[lang] = SMALL_PRINT[lang]
    try:
        return fb.render(dict(card, logo=True), lang, out)
    finally:
        if had: fb.DISCLAIMER[lang] = saved
        else: del fb.DISCLAIMER[lang]

def out_path(slug, lang):
    return os.path.join(OUT, f"{slug}.jpg") if lang == "en" else os.path.join(OUT, lang, f"{slug}.jpg")

def main():
    if sys.argv[1] == "one":
        slug, lang, out = sys.argv[2:5]; print(render(slug, load(lang)[slug], lang, out))
    elif sys.argv[1] == "all":
        import li_fit
        bad = [(l, s, p) for l in LANGS for s, c in load(l).items() if not c.get("reuse")
               for p in li_fit.problems(c)]
        if bad:
            for l, s, p in bad: print(f"{l} {s}: {p}")
            sys.exit("Text does not fit on some cards. Shorten it in studio/linkedin/cards and run again.")
        n = 0
        for lang in LANGS:
            os.makedirs(os.path.dirname(out_path("x", lang)), exist_ok=True)
            for slug, card in load(lang).items():
                render(slug, card, lang, out_path(slug, lang)); n += 1
        print("rendered", n)

if __name__ == "__main__":
    main()
