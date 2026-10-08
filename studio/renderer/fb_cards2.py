"""Facebook post images, version 2 (October 2026).

Why a version 2:
- The Bueno logo was pasted from bueno-logo-white.png, which is a navy logo on a solid white
  box, so it sat on the photo as a white rectangle. Every logo now comes from the transparent
  lockup (Bueno-logo-Blue-payoff.png): navy as it is, white by tinting its alpha channel.
- Every card used the same skeleton (photo on top, three rows below). There are now six
  templates that differ in structure, not just in photo, and neighbouring posts never share one.
- The photo library grew from 10 to 16 licensed shots from Bueno Brand/Images.

Templates
  duotone   the approved Bueno Facebook format: light-blue duotone photo, numbered lines,
            navy footer band with the white logo
  pills     warm photo, headline, light-blue pills bleeding off the left edge, navy CTA pill
  fullbleed full photo, navy gradient, large white headline
  question  the reader's question set large on warm paper, the answer below, round photo
  split     photo on the left half, steps on a light-blue panel on the right
  date      one date or number set very large, photo band underneath

Card JSON (studio/facebook/cards2/<lang>.json):
  {"<post-key>": {"template": "duotone", "photo": "g04.jpg", "brand": "bueno"|"247",
                  "eyebrow": "...", "headline": ["...", "..."], "sub": "...",
                  "items": ["...", "...", "..."], "cta": "...", "big": "...", "big_label": "..."}}

Usage, from the repo root:
  python3 studio/renderer/fb_cards2.py one <key> <lang> out.jpg
  python3 studio/renderer/fb_cards2.py all public/fb-cards
"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

W = H = 1080
NAVY = (1, 2, 33)
LIGHT = (203, 239, 255)
ACCENT = (91, 127, 204)
GOLD = (201, 169, 110)
OFF = (248, 247, 244)
PALE = (244, 251, 255)
MUTED = (70, 74, 105)
FONTS = os.environ.get("FB_FONTS", "public/fonts")
PHOTOS = os.environ.get("FB_PHOTOS", "studio/photos")
LOGO = os.environ.get("FB_LOGO", "public/images/bueno-logo-transparent.png")
CARDS_DIR = os.environ.get("FB_CARDS2_DIR", "studio/facebook/cards2")
LANGS = ["en", "no", "sv", "da", "de", "fr", "nl"]

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

_fc = {}
def F(weight, size):
    k = (weight, size)
    if k not in _fc:
        _fc[k] = ImageFont.truetype(os.path.join(FONTS, f"FSSiena-{weight}.otf"), size)
    return _fc[k]

_m = ImageDraw.Draw(Image.new("RGB", (1, 1)))
def tw(s, f):
    b = _m.textbbox((0, 0), s, font=f); return b[2] - b[0]

def wrap(text, f, maxw):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if tw(t, f) <= maxw: cur = t
        else:
            if cur: lines.append(cur)
            cur = w
    if cur: lines.append(cur)
    return lines

def fit_lines(lines, weight, size, maxw, minsize=28):
    while size > minsize and any(tw(l, F(weight, size)) > maxw for l in lines):
        size -= 2
    return F(weight, size)

# ---------- logo ----------
_logo = {}
def logo(color, width):
    k = (color, width)
    if k not in _logo:
        src = Image.open(LOGO).convert("RGBA")
        a = src.getchannel("A")
        solid = Image.new("RGBA", src.size, color + (255,))
        solid.putalpha(a)
        h = int(src.height * width / src.width)
        _logo[k] = solid.resize((width, h), Image.LANCZOS)
    return _logo[k]

def put_logo(img, color, width, x, y, anchor="lt"):
    lg = logo(color, width)
    if anchor == "mt": x = x - lg.width // 2
    if anchor == "rt": x = x - lg.width
    img.alpha_composite(lg, (int(x), int(y)))
    return lg.height

# ---------- photos ----------
def photo(name, w, h, focus=0.5):
    im = Image.open(os.path.join(PHOTOS, name)).convert("RGB")
    return ImageOps.fit(im, (w, h), Image.LANCZOS, centering=(0.5, focus)).convert("RGBA")

def duotone(im, dark=(108, 163, 200), light=(244, 251, 255)):
    g = ImageOps.grayscale(im.convert("RGB"))
    return ImageOps.colorize(g, dark, light).convert("RGBA")

def vfade(im, start, end, top_opaque=True):
    """Alpha ramps from 255 to 0 between rows start and end (fraction of height)."""
    w, h = im.size
    a = Image.new("L", (1, h))
    for y in range(h):
        t = y / h
        if t <= start: v = 255
        elif t >= end: v = 0
        else: v = int(255 * (1 - (t - start) / (end - start)))
        a.putpixel((0, y), v if top_opaque else 255 - v)
    im.putalpha(a.resize((w, h)))
    return im

def rounded(im, r):
    m = Image.new("L", im.size, 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, im.width - 1, im.height - 1), r, fill=255)
    out = im.copy(); out.putalpha(m); return out

def gradient(w, h, top, bottom):
    g = Image.new("RGBA", (1, h))
    for y in range(h):
        t = y / max(1, h - 1)
        g.putpixel((0, y), tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3)) + (255,))
    return g.resize((w, h))

# ---------- shared bits ----------
def brand_mark(img, d, c, lang, on_dark, x=None, y=50, anchor="rt"):
    """Top corner mark. Bueno posts get the lockup; 24/7 Spain posts get the domain and
    'Sponsored by Bueno' with the small lockup under it."""
    col = (255, 255, 255) if on_dark else NAVY
    x = W - 64 if x is None else x
    if c.get("brand", "bueno") == "bueno":
        put_logo(img, col, 230, x, y, anchor)
    else:
        f = F("SemiBold", 24); s = "247spain.es"
        fs = F("Regular", 18); sp = SPONSOR[lang]
        def ax(width):
            return x - width if anchor == "rt" else (x - width // 2 if anchor == "mt" else x)
        d.text((ax(tw(s, f)), y), s, font=f, fill=col)
        d.text((ax(tw(sp, fs)), y + 34), sp, font=fs, fill=col)

def disclaimer(d, lang, x, y, on_dark=False, anchor="l"):
    f = F("Regular", 17); s = DISCLAIMER[lang]
    col = (205, 210, 225) if on_dark else (150, 154, 170)
    if anchor == "m": x = x - tw(s, f) // 2
    d.text((x, y), s, font=f, fill=col)

def eyebrow(d, text, x, y, col=ACCENT, size=22):
    f = F("SemiBold", size); cx = x
    for ch in text.upper():
        d.text((cx, y), ch, font=f, fill=col); cx += tw(ch, f) + 4
    return y + size + 18

def headline(d, lines, x, y, maxw, size=64, col=NAVY, weight="Medium", gap=1.18):
    f = fit_lines(lines, weight, size, maxw)
    for l in lines:
        d.text((x, y), l, font=f, fill=col); y += int(f.size * gap)
    return y

def para(d, text, x, y, maxw, size=30, col=MUTED, weight="Regular", gap=1.4):
    f = F(weight, size)
    for l in wrap(text, f, maxw):
        d.text((x, y), l, font=f, fill=col); y += int(size * gap)
    return y

# ---------- templates ----------
def t_duotone(c, lang):
    img = Image.new("RGBA", (W, H), PALE + (255,))
    ph = vfade(duotone(photo(c["photo"], W, 470, c.get("focus", 0.5))), 0.55, 1.0)
    img.alpha_composite(ph, (0, 0))
    d = ImageDraw.Draw(img)
    x = 64; y = 420
    y = eyebrow(d, c["eyebrow"], x, y, col=NAVY)
    y = headline(d, c["headline"], x, y, W - 128, size=60, weight="Regular")
    y += 6
    if c.get("sub"): y = para(d, c["sub"], x, y, W - 128, size=29, col=NAVY) + 8
    fn = F("SemiBold", 24); fi = F("Regular", 28)
    for i, it in enumerate(c["items"][:3]):
        d.line((x, y, W - x, y), fill=(190, 205, 220), width=2)
        d.text((x, y + 22), f"0{i+1}", font=fn, fill=NAVY)
        lines = wrap(it, fi, W - 2 * x - 64)
        ly = y + 20
        for l in lines: d.text((x + 64, ly), l, font=fi, fill=NAVY); ly += 36
        y = max(ly, y + 60) + 12
    d.line((x, y, W - x, y), fill=(190, 205, 220), width=2)
    d.rectangle((0, H - 128, W, H), fill=NAVY)
    if c.get("cta"):
        f = F("Medium", 27); d.text(((W - tw(c["cta"], f)) // 2, H - 112), c["cta"], font=f, fill=(255, 255, 255))
    if c.get("brand", "bueno") == "bueno":
        put_logo(img, (255, 255, 255), 230, W // 2, H - 64, "mt")
    else:
        brand_mark(img, d, c, lang, True, x=W // 2, y=H - 66, anchor="mt")
    disclaimer(d, lang, x, H - 160)
    return img

def t_pills(c, lang):
    img = Image.new("RGBA", (W, H), PALE + (255,))
    ph = vfade(photo(c["photo"], W, 520, c.get("focus", 0.45)), 0.62, 1.0)
    img.alpha_composite(ph, (0, 0))
    d = ImageDraw.Draw(img)
    x = 70; y = 455
    y = headline(d, c["headline"], x, y, W - 140, size=58, weight="Regular", gap=1.15) + 18
    fi = F("Regular", 29)
    for it in c["items"][:2]:
        lines = wrap(it, fi, 820)
        ph_h = 46 + 38 * len(lines)
        pw = max(tw(l, fi) for l in lines) + 150
        d.rounded_rectangle((-40, y, pw, y + ph_h), ph_h // 2, fill=(222, 243, 255))
        d.rounded_rectangle((x - 6, y + 22, x - 1, y + ph_h - 22), 3, fill=NAVY)
        ly = y + 22
        for l in lines: d.text((x + 16, ly), l, font=fi, fill=NAVY); ly += 38
        y += ph_h + 18
    cy = y
    if c.get("cta"):
        f = F("Medium", 29); cw = tw(c["cta"], f) + 100
        cy = y + 8
        d.rounded_rectangle(((W - cw) // 2, cy, (W + cw) // 2, cy + 72), 36, fill=NAVY)
        d.text(((W - tw(c["cta"], f)) // 2, cy + 19), c["cta"], font=f, fill=(255, 255, 255))
    if c.get("brand", "bueno") == "bueno":
        by = (cy + 100) if c.get("cta") else (y + 20)
        put_logo(img, NAVY, 240, W // 2, by, "mt")
    else:
        by = (cy + 96) if c.get("cta") else (y + 20)
        brand_mark(img, d, c, lang, False, x=W // 2, y=by, anchor="mt")
    disclaimer(d, lang, W // 2, H - 40, anchor="m")
    return img

def t_fullbleed(c, lang):
    img = photo(c["photo"], W, H, c.get("focus", 0.5))
    shade = gradient(W, H, (1, 2, 33), (1, 2, 33))
    a = Image.new("L", (1, H))
    for yy in range(H):
        t = yy / H
        a.putpixel((0, yy), 0 if t < 0.32 else int(225 * min(1, (t - 0.32) / 0.42)))
    shade.putalpha(a.resize((W, H)))
    img.alpha_composite(shade)
    top = gradient(W, 180, (1, 2, 33), (1, 2, 33)); ta = Image.new("L", (1, 180))
    for yy in range(180): ta.putpixel((0, yy), int(120 * (1 - yy / 180)))
    top.putalpha(ta.resize((W, 180))); img.alpha_composite(top)
    d = ImageDraw.Draw(img)
    brand_mark(img, d, c, lang, True, x=64, y=56, anchor="lt")
    x = 64
    hf = fit_lines(c["headline"], "Medium", 76, W - 128)
    sub_lines = wrap(c.get("sub", ""), F("Regular", 31), W - 128) if c.get("sub") else []
    total = len(c["headline"]) * int(hf.size * 1.12) + 30 + len(sub_lines) * 44 + 60
    y = H - 90 - total
    y = eyebrow(d, c["eyebrow"], x, y, col=LIGHT)
    for l in c["headline"]: d.text((x, y), l, font=hf, fill=(255, 255, 255)); y += int(hf.size * 1.12)
    d.line((x, y + 14, x + 90, y + 14), fill=GOLD, width=4); y += 36
    for l in sub_lines: d.text((x, y), l, font=F("Regular", 31), fill=(232, 238, 250)); y += 44
    disclaimer(d, lang, x, H - 56, on_dark=True)
    return img

def t_question(c, lang):
    img = Image.new("RGBA", (W, H), OFF + (255,))
    d = ImageDraw.Draw(img)
    x = 72
    d.text((x - 6, 40), "“", font=F("Bold", 200), fill=GOLD)
    y = 210
    q = c["headline"]
    qf = fit_lines(q, "Medium", 70, W - 150)
    for l in q: d.text((x, y), l, font=qf, fill=NAVY); y += int(qf.size * 1.14)
    y += 26
    d.line((x, y, x + 110, y), fill=GOLD, width=4); y += 40
    y = para(d, c["sub"], x, y, 680, size=36, col=NAVY, weight="Medium", gap=1.36)
    y += 10
    for it in c.get("items", [])[:2]:
        y = para(d, it, x, y + 12, 560, size=30, col=MUTED, gap=1.38)
    r = 300
    circ = photo(c["photo"], r, r, c.get("focus", 0.5))
    m = Image.new("L", (r, r), 0); ImageDraw.Draw(m).ellipse((0, 0, r - 1, r - 1), fill=255)
    circ.putalpha(m)
    img.alpha_composite(circ, (W - r - 56, H - r - 150))
    if c.get("brand", "bueno") == "bueno":
        put_logo(img, NAVY, 230, x, H - 100)
    else:
        brand_mark(img, d, c, lang, False, x=x, y=H - 110, anchor="lt")
    disclaimer(d, lang, x, H - 44)
    return img

def t_split(c, lang):
    img = Image.new("RGBA", (W, H), (234, 247, 255, 255))
    pw = 470
    img.alpha_composite(photo(c["photo"], pw, H, c.get("focus", 0.5)), (0, 0))
    d = ImageDraw.Draw(img)
    x = pw + 56; mw = W - x - 56; y = 170
    y = eyebrow(d, c["eyebrow"], x, y, size=21)
    y = headline(d, c["headline"], x, y, mw, size=56, weight="Medium", gap=1.16) + 34
    fnum = F("SemiBold", 44); fi = F("Regular", 30)
    for i, it in enumerate(c["items"][:3]):
        d.text((x, y - 4), str(i + 1), font=fnum, fill=GOLD)
        ly = y
        for l in wrap(it, fi, mw - 50): d.text((x + 48, ly), l, font=fi, fill=NAVY); ly += 40
        y = ly + 34
    if c.get("cta"):
        y = max(y, H - 250)
        para(d, c["cta"], x, y, mw, size=26, col=ACCENT, weight="Medium")
    if c.get("brand", "bueno") == "bueno":
        put_logo(img, NAVY, 220, x, H - 110)
    else:
        brand_mark(img, d, c, lang, False, x=x, y=H - 120, anchor="lt")
    disclaimer(d, lang, x, H - 50)
    return img

def t_date(c, lang):
    img = gradient(W, H, (247, 252, 255), (198, 231, 248))
    d = ImageDraw.Draw(img)
    x = 70; y = 70
    if c.get("brand", "bueno") == "bueno": put_logo(img, NAVY, 220, x, y)
    else: brand_mark(img, d, c, lang, False, x=x, y=y, anchor="lt")
    y = 190
    y = eyebrow(d, c["big_label"], x, y)
    bf = fit_lines([c["big"]], "Medium", 170, W - 140, minsize=80)
    d.text((x - 6, y - 20), c["big"], font=bf, fill=NAVY); y += int(bf.size * 1.0) + 10
    d.line((x, y, x + 110, y), fill=GOLD, width=4); y += 34
    hl = wrap(" ".join(c["headline"]), F("Medium", 44), W - 140)
    y = headline(d, hl, x, y, W - 140, size=44, weight="Medium", gap=1.2) + 8
    if c.get("sub"): y = para(d, c["sub"], x, y, W - 140, size=31, col=MUTED)
    band = rounded(photo(c["photo"], W - 140, 330, c.get("focus", 0.5)), 28)
    img.alpha_composite(band, (x, H - 330 - 96))
    disclaimer(d, lang, x, H - 58)
    return img

TEMPLATES = {"duotone": t_duotone, "pills": t_pills, "fullbleed": t_fullbleed,
             "question": t_question, "split": t_split, "date": t_date}

def normalise(card):
    """Headline and items are lists of lines; a plain string is accepted and becomes one line."""
    c = dict(card)
    for k in ("headline", "items"):
        if isinstance(c.get(k), str): c[k] = [c[k]]
    return c

def render(card, lang, out):
    card = normalise(card)
    img = TEMPLATES[card["template"]](card, lang).convert("RGB")
    img.save(out, "JPEG", quality=88, optimize=True, progressive=True)
    return out

def load(lang):
    with open(os.path.join(CARDS_DIR, f"{lang}.json"), encoding="utf-8") as f: return json.load(f)

def main():
    if sys.argv[1] == "one":
        key, lang, out = sys.argv[2:5]; print(render(load(lang)[key], lang, out))
    elif sys.argv[1] == "all":
        outdir = sys.argv[2]; n = 0
        for lang in LANGS:
            p = os.path.join(CARDS_DIR, f"{lang}.json")
            if not os.path.exists(p): continue
            for key, card in load(lang).items():
                os.makedirs(os.path.join(outdir, key), exist_ok=True)
                render(card, lang, os.path.join(outdir, key, f"{lang}.jpg")); n += 1
        print("rendered", n)

if __name__ == "__main__":
    main()
