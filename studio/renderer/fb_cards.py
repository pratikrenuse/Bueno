"""Facebook group post images, one per post per language.

Built on simple3.py, the 24/7 Spain editorial renderer that Pratik approved in July 2026
(photo led, FS Siena, thin gold rules, five rotating layouts). Two things differ:

1. The mark. A 24/7 Spain tool post carries "247spain.es" and, under it, "Sponsored by Bueno"
   in the post's language. A Bueno tax post carries the Bueno lockup instead. Since
   October 2026 every Facebook post names Bueno, and the image does too.
2. Languages. Seven of them, each with its own disclaimer line, so the Norwegian post gets a
   Norwegian image and not the English one.

Text comes from studio/facebook/cards/<lang>.json, one file per language with the same keys
and the same layout and photo for each post, so all seven images of a post look alike.

Usage, from the repo root:
  python3 studio/renderer/fb_cards.py all public/fb-cards
  python3 studio/renderer/fb_cards.py one <post-key> <lang> out.jpg
"""
import json, os, sys
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import simple3 as s3

LANGS = ["en", "no", "sv", "da", "de", "fr", "nl"]
CARDS_DIR = os.environ.get("FB_CARDS_DIR", "studio/facebook/cards")
THEME = {
    "name": "fb-cards",
    "colors": {"primary": [1, 2, 33], "card_bg": [255, 255, 255], "canvas": [248, 247, 244],
               "highlight": [203, 239, 255], "accent": [91, 127, 204], "gold": [201, 169, 110],
               "muted": [45, 47, 80], "detail": [110, 115, 145], "hairline": [215, 215, 222],
               "footer_text": [255, 255, 255], "footer_sub": [150, 165, 200]},
    "fonts_dir": "public/fonts",
    "fonts": {"bold": "FSSiena-Bold.otf", "semibold": "FSSiena-SemiBold.otf",
              "medium": "FSSiena-Medium.otf", "regular": "FSSiena-Regular.otf"},
    "footer": {"type": "wordmark_247", "payoff": "", "domain": "247spain.es"},
}
DISCLAIMER = {
    "en": "General information, not tax advice.",
    "no": "Generell informasjon, ikke skatterådgivning.",
    "sv": "Allmän information, inte skatterådgivning.",
    "da": "Generel information, ikke skatterådgivning.",
    "de": "Allgemeine Information, keine Steuerberatung.",
    "fr": "Information générale, pas un conseil fiscal.",
    "nl": "Algemene informatie, geen belastingadvies.",
}
SPONSOR = {
    "en": "Sponsored by Bueno", "no": "Sponset av Bueno", "sv": "Sponsras av Bueno",
    "da": "Sponsoreret af Bueno", "de": "Gesponsert von Bueno", "fr": "Sponsorisé par Bueno",
    "nl": "Gesponsord door Bueno",
}
_LOGOS = {}

def _logo(white):
    key = "white" if white else "navy"
    if key not in _LOGOS:
        path = "public/images/bueno-logo-white.png" if white else "public/images/bueno-logo-transparent.png"
        _LOGOS[key] = Image.open(path).convert("RGBA")
    return _LOGOS[key]

def mark(d, th, c, W, on_photo_top=False, disc_y=1042, disc_x=None):
    img = getattr(d, "_image", None)
    lang = c.get("language", "en")
    col = (255, 255, 255) if on_photo_top else (158, 162, 178)
    if c.get("brand") == "bueno" and img is not None:
        logo = _logo(on_photo_top)
        lw = 190
        lh = int(logo.height * lw / logo.width)
        lg = logo.resize((lw, lh), Image.LANCZOS)
        img.paste(lg, (W - s3.MX - lw, 44), lg)
    else:
        f = th.f("medium", 20)
        s = "247spain.es"
        d.text((W - s3.MX - s3.tw(s, f), 46), s, font=f, fill=col)
        fs = th.f("regular", 16)
        sp = SPONSOR.get(lang, SPONSOR["en"])
        d.text((W - s3.MX - s3.tw(sp, fs), 74), sp, font=fs, fill=col)
    fd = th.f("regular", 16)
    d.text((disc_x if disc_x is not None else s3.MX, disc_y), DISCLAIMER.get(lang, DISCLAIMER["en"]), font=fd, fill=(182, 185, 196))

s3.mark = mark
TH = s3.T(THEME)

def load_cards(lang):
    with open(os.path.join(CARDS_DIR, f"{lang}.json"), encoding="utf-8") as f:
        return json.load(f)

def render(card, lang, out):
    c = dict(card)
    c["language"] = lang
    tmp = out + ".png"
    s3.render_image(c, TH, tmp)
    Image.open(tmp).convert("RGB").save(out, "JPEG", quality=86, optimize=True, progressive=True)
    os.remove(tmp)
    return out

def main():
    mode = sys.argv[1]
    if mode == "all":
        outdir = sys.argv[2]
        n = 0
        for lang in LANGS:
            cards = load_cards(lang)
            for key, card in cards.items():
                os.makedirs(os.path.join(outdir, key), exist_ok=True)
                render(card, lang, os.path.join(outdir, key, f"{lang}.jpg"))
                n += 1
        print("rendered", n)
    elif mode == "one":
        key, lang, out = sys.argv[2], sys.argv[3], sys.argv[4]
        print(render(load_cards(lang)[key], lang, out))

if __name__ == "__main__":
    main()
