"""Template pack for the Spain 24/7 / Bueno post images.

Twelve 1080x1080 layouts built on the two cards Pratik approved: the taxes card
(band across the top, numbered hairline rows, brand bar at the base) and the
Facebook-group card (photo faded in from the right, pills bleeding off the left).

Three rules the whole file obeys, each one from a correction:

1. TYPE SITS ON A GRID. Every string is drawn baseline-anchored ("ls") at the
   same left margin MX through txt(). Never mix anchors: top-anchored and
   baseline-anchored calls in one card drift a few pixels apart and read as
   sloppy. Vertical movement goes through Flow, which advances by explicit
   leading, so the rhythm is identical on all twelve.

2. SURFACES VARY. A feed of identical pale blue gradients is monotonous, so each
   card is built on one of six surfaces drawn from the brand palette, rotated by
   slug: ivory, sky, navy, sand, photo band, photo wash. Text colour follows the
   surface automatically.

3. THE LOCKUP IS UNTOUCHABLE. It is pasted whole and unmodified. Never crop it,
   never re-typeset PROPERTY SIMPLIFIED. Too small? Raise LOGO_W and FOOT.

Content JSON is the same shape simple3.py uses, so existing files still render:

    {"slug","language","eyebrow","headline":[..],"sub","figure","columns","cta",
     "rows":[{label,fact:[..],detail}], "template":"band_rules",
     "surface":"navy", "photo":"coast_bay.jpg"}

Leave `template` and `surface` out and both are picked from the slug, which is
what keeps a 105-post feed from repeating itself.

Usage (from repo root):
  python3 studio/renderer/tpl.py list
  python3 studio/renderer/tpl.py image studio/content/modelo210_en.json studio/themes/247spain.json
  python3 studio/renderer/tpl.py contact studio/themes/247spain-bueno.json
"""
from PIL import Image, ImageDraw
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from simple3 import T, tw, cover, load  # noqa: E402

try:
    import numpy as np
except ImportError:
    np = None

W = H = 1080
MX = 88                 # the one left margin; nothing sits left of this but bleeds
FOOT = 168              # brand bar height, sized to hold the lockup whole
LOGO_W = 600            # lockup width in the bar; raise it and raise FOOT with it
TOP = 96                # first baseline zone
PHOTOS_DIR = os.environ.get("STUDIO_PHOTOS", os.path.join(HERE, "..", "photos"))
OUTDIR = os.environ.get("STUDIO_OUT", os.path.join(HERE, "..", "out"))

TEMPLATES = [
    "band_rules", "pill_right", "band_pills", "rules_only",
    "stat_band", "split_rules", "card_stack", "quote_band",
    "checklist", "timeline", "compare", "number_hero",
]

# Which surfaces suit which template. Rotated by slug so a feed mixes.
SURFACES = {
    "band_rules":  ["photo_top", "ivory", "sand"],
    "pill_right":  ["photo_wash", "sky", "navy"],
    "band_pills":  ["photo_top", "sky", "ivory"],
    "rules_only":  ["ivory", "navy", "sand"],
    "stat_band":   ["ivory", "sky", "sand"],
    "split_rules": ["photo_side", "photo_side", "photo_side"],
    "card_stack":  ["sky", "sand", "ivory"],
    "quote_band":  ["navy", "photo_top", "ivory"],
    "checklist":   ["ivory", "sand", "sky"],
    "timeline":    ["ivory", "sky", "navy"],
    "compare":     ["sand", "ivory", "sky"],
    "number_hero": ["navy", "sky", "ivory"],
}


# ------------------------------------------------------------------ palette

def hsh(s):
    return sum(ord(ch) * (i + 7) for i, ch in enumerate(s))


def pick_template(c):
    t = c.get("template")
    if t in TEMPLATES:
        return t
    return TEMPLATES[hsh(c.get("slug", "x")) % len(TEMPLATES)]


def pick_surface(c, name):
    s = c.get("surface")
    opts = SURFACES[name]
    return s if s in ("ivory", "sky", "navy", "sand", "photo_top",
                      "photo_wash", "photo_side") else opts[hsh(c.get("slug", "x")) % len(opts)]


class Skin:
    """Colours for one card, resolved from the surface so contrast is never guessed."""

    def __init__(self, th, surface):
        c = th.c
        self.surface = surface
        self.dark = surface == "navy"
        if surface == "navy":
            self.bg = c["primary"]
            self.ink = (255, 255, 255)
            self.soft = c["highlight"]
            self.label = c["highlight"]
            self.rule = (255, 255, 255, 60)
            self.chip = (255, 255, 255)
            self.chip_ink = c["primary"]
        else:
            self.bg = {"ivory": c["canvas"], "sky": c["highlight"],
                       "sand": (0xD4, 0xCF, 0xC8)}.get(surface, c["canvas"])
            self.ink = c["primary"]
            self.soft = c["detail"]
            self.label = c["accent"]
            self.rule = c["hairline"]
            self.chip = (255, 255, 255)
            self.chip_ink = c["primary"]
        self.gold = c["gold"]
        self.bar = c["primary"] if surface != "navy" else (0x0B, 0x0D, 0x33)


# ------------------------------------------------------------------ drawing

def txt(d, x, y, s, font, fill):
    """The only text call in this file. Baseline-anchored, so left edges align."""
    d.text((x, y), s, font=font, fill=fill, anchor="ls")


def tracked(d, x, y, s, font, fill, ls=6):
    cx = x
    for ch in s:
        d.text((cx, y), ch, font=font, fill=fill, anchor="ls")
        cx += tw(ch, font) + ls
    return cx - x


class Flow:
    """Vertical cursor. Everything advances through here, so rhythm is uniform."""

    def __init__(self, y=TOP):
        self.y = y

    def line(self, lead):
        self.y += lead
        return self.y

    def gap(self, n):
        self.y += n
        return self.y


def wrap(th, kind, size, text, maxw):
    f = th.f(kind, size)
    words, lines, cur = text.split(), [], ""
    for w_ in words:
        t = (cur + " " + w_).strip()
        if tw(t, f) <= maxw or not cur:
            cur = t
        else:
            lines.append(cur)
            cur = w_
    if cur:
        lines.append(cur)
    return lines, f


def shrink(th, kind, size, lines, maxw, floor=22):
    while size > floor:
        f = th.f(kind, size)
        if max(tw(l, f) for l in lines) <= maxw:
            return f, size
        size -= 2
    return th.f(kind, floor), floor


def grow(th, kind, lines, maxw, lo=30, hi=92):
    """Pick the largest size that still fits. This is what kills dead space."""
    best = lo
    for size in range(lo, hi + 1, 2):
        f = th.f(kind, size)
        if max(tw(l, f) for l in lines) <= maxw:
            best = size
        else:
            break
    return th.f(kind, best), best


def duotone(ph, size, shadow, light):
    p = cover(ph, *size).convert("L")
    if np is not None:
        g = np.asarray(p, float) / 255.0
        sh, hi = np.array(shadow, float), np.array(light, float)
        out = sh[None, None, :] + (hi - sh)[None, None, :] * g[:, :, None]
        return Image.fromarray(out.clip(0, 255).astype("uint8"))
    lut = []
    for ch in range(3):
        lut += [int(shadow[ch] + (light[ch] - shadow[ch]) * i / 255.0) for i in range(256)]
    return p.convert("RGB").point(lut)


def get_photo(c):
    try:
        files = sorted(f for f in os.listdir(PHOTOS_DIR)
                       if f.lower().endswith((".jpg", ".jpeg", ".png")))
    except Exception:
        return None
    if not files:
        return None
    name = c["photo"] if c.get("photo") in files else files[hsh(c.get("slug", "x")) % len(files)]
    try:
        return Image.open(os.path.join(PHOTOS_DIR, name)).convert("RGB")
    except Exception:
        return None


def alpha_ramp(strip, keep, fade, axis="y"):
    a = Image.new("L", strip.size, 255)
    ad = ImageDraw.Draw(a)
    n = strip.size[1] if axis == "y" else strip.size[0]
    for i in range(fade):
        v = int(255 * (1 - i / fade))
        p = keep + i
        if axis == "y":
            ad.line([(0, p), (strip.size[0], p)], fill=v)
        else:
            ad.line([(p, 0), (p, strip.size[1])], fill=v)
    if axis == "y":
        ad.rectangle([0, keep + fade, strip.size[0], strip.size[1]], fill=0)
    else:
        ad.rectangle([keep + fade, 0, strip.size[0], strip.size[1]], fill=0)
    strip = strip.convert("RGBA")
    strip.putalpha(a)
    return strip


def build(th, c, name):
    """Lay the surface down and return the canvas, drawer, skin and content top."""
    sk = Skin(th, pick_surface(c, name))
    img = Image.new("RGB", (W, H), sk.bg)
    top = TOP
    ph = get_photo(c)

    if sk.surface == "photo_top" and ph is not None:
        bandh = 372
        strip = duotone(ph, (W, bandh), (0x2E, 0x5A, 0x80), (0xE8, 0xF6, 0xFF))
        img.paste(alpha_ramp(strip, bandh - 130, 130), (0, 0),
                  alpha_ramp(strip, bandh - 130, 130))
        top = bandh + 76
    elif sk.surface == "photo_wash" and ph is not None:
        sheet = duotone(ph, (W, H), (0x6C, 0xA3, 0xC8), (0xF4, 0xFB, 0xFF))
        a = Image.new("L", (W, H), 0)
        ad = ImageDraw.Draw(a)
        for x in range(W):
            v = 0 if x < W * 0.36 else min(1.0, (x - W * 0.36) / (W * 0.30))
            ad.line([(x, 0), (x, H)], fill=int(255 * v))
        sheet = sheet.convert("RGBA")
        sheet.putalpha(a)
        img.paste(sheet, (0, 0), sheet)
    elif sk.surface == "photo_side" and ph is not None:
        colw = 404
        img.paste(duotone(ph, (colw, H - FOOT), (0x2E, 0x5A, 0x80), (0xE8, 0xF6, 0xFF)), (0, 0))

    return img, ImageDraw.Draw(img), sk, top


def brand_bar(img, d, th, sk):
    """The bar at the base. The lockup goes in whole; see the module docstring."""
    f = th.t["footer"]
    top, mid = H - FOOT, H - FOOT + FOOT // 2
    d.rectangle([0, top, W, H], fill=sk.bar)
    if f.get("type") == "wordmark_247":
        fw = th.f("bold", 48)
        x = MX
        for piece, col in (("24", (255, 255, 255)), ("/", th.c["gold"]),
                           ("7 SPAIN", (255, 255, 255))):
            d.text((x, mid), piece, font=fw, fill=col, anchor="lm")
            x += tw(piece, fw)
        if f.get("payoff"):
            d.rectangle([x + 30, mid - 33, x + 32, mid + 33], fill=(255, 255, 255))
            tracked(d, x + 60, mid + 7, f["payoff"], th.f("medium", 18), (255, 255, 255), 3)
    else:
        logo = Image.open(f["logo_path"]).convert("RGBA")
        lw = f.get("logo_width", LOGO_W)
        lh = round(logo.height * lw / logo.width)
        logo = logo.resize((lw, lh), Image.LANCZOS)
        mark = Image.new("RGBA", logo.size, (255, 255, 255, 255))
        mark.putalpha(logo.split()[3])
        img.paste(mark, (MX, mid - lh // 2), mark)
    if f.get("domain"):
        d.text((W - MX, mid), f["domain"], font=th.f("medium", 29),
               fill=(255, 255, 255), anchor="rm")


def eyebrow(d, th, sk, c, fl):
    if not c.get("eyebrow"):
        return
    fl.line(22)
    tracked(d, MX, fl.y, c["eyebrow"].upper(), th.f("semibold", 21), sk.label, 6)
    fl.gap(20)


def headline(d, th, sk, c, fl, colw=None, lo=38, hi=76):
    colw = colw or (W - MX * 2)
    f, size = grow(th, "semibold", c["headline"], colw, lo, hi)
    for l in c["headline"]:
        fl.line(int(size * 1.02))
        txt(d, MX, fl.y, l, f, sk.ink)
        fl.gap(int(size * 0.24))
    return size


def subline(d, th, sk, c, fl, colw=None, size=27):
    if not c.get("sub"):
        return
    colw = colw or (W - MX * 2)
    lines, f = wrap(th, "regular", size, c["sub"], colw)
    fl.gap(10)
    for l in lines:
        fl.line(int(size * 1.35))
        txt(d, MX, fl.y, l, f, sk.soft)


def facts(c):
    return [" ".join(r["fact"]) for r in c["rows"]]


def room_for(fl, n, lo, bottom=None):
    """How many of n stacked items actually fit. Drawing a clipped row is worse
    than dropping it, so callers trim to this."""
    bottom = bottom if bottom is not None else H - FOOT - 36
    return max(1, min(n, (bottom - fl.y) // lo))


def fit_block(fl, n, lo, hi, bottom=None):
    """Pitch and start for n stacked items.

    Centres the stack in the space it has. Without this a card with three short
    rows clusters them under the headline and leaves a hole above the brand bar,
    which is the dead space Pratik flagged.
    """
    bottom = bottom if bottom is not None else H - FOOT - 36
    avail = max(0, bottom - fl.y)
    pitch = max(lo, min(hi, avail // max(1, n)))
    slack = avail - pitch * n
    if slack > 0:
        fl.gap(min(slack, slack // 2 + 8))
    return pitch


# ------------------------------------------------------------------ templates

def t_band_rules(c, th):
    img, d, sk, top = build(th, c, "band_rules")
    fl = Flow(top)
    eyebrow(d, th, sk, c, fl)
    headline(d, th, sk, c, fl, lo=40, hi=64)
    subline(d, th, sk, c, fl)
    fl.gap(30)
    rows = facts(c)
    pitch = fit_block(fl, len(rows) + 0.4, 78, 116, bottom=H - FOOT - 44)
    num = th.f("semibold", 22)
    for i, r in enumerate(rows):
        d.rectangle([MX, fl.y, W - MX, fl.y + 1], fill=sk.rule)
        base = fl.y + pitch // 2 + 10
        txt(d, MX, base, f"0{i+1}", num, sk.label)
        f, _ = shrink(th, "regular", 28, [r], W - MX * 2 - 74)
        txt(d, MX + 74, base, r, f, sk.ink)
        fl.gap(pitch)
    d.rectangle([MX, fl.y, W - MX, fl.y + 1], fill=sk.rule)
    brand_bar(img, d, th, sk)
    return img


def t_pill_right(c, th):
    img, d, sk, top = build(th, c, "pill_right")
    colw = int(W * 0.60) if sk.surface == "photo_wash" else W - MX * 2
    fl = Flow(top)
    eyebrow(d, th, sk, c, fl)
    headline(d, th, sk, c, fl, colw=colw, lo=42, hi=68)
    subline(d, th, sk, c, fl, colw=colw, size=26)
    fl.gap(34)
    rows = facts(c)
    if c.get("cta"):
        rows = rows + [c["cta"]]
    pitch = fit_block(fl, len(rows), 88, 116)
    ph_ = pitch - 20
    for i, r in enumerate(rows):
        last = c.get("cta") and i == len(rows) - 1
        f, _ = shrink(th, "semibold" if last else "regular", 27, [r], colw - 60)
        bg = sk.ink if last else sk.chip
        fg = sk.bg if last else sk.chip_ink
        wpx = tw(r, f)
        d.rounded_rectangle([-ph_ // 2, fl.y, MX + wpx + 40, fl.y + ph_],
                            radius=ph_ // 2, fill=bg)
        d.text((MX, fl.y + ph_ / 2), r, font=f, fill=fg, anchor="lm")
        fl.gap(pitch)
    brand_bar(img, d, th, sk)
    return img


def t_band_pills(c, th):
    img, d, sk, top = build(th, c, "band_pills")
    fl = Flow(top)
    eyebrow(d, th, sk, c, fl)
    headline(d, th, sk, c, fl, lo=40, hi=62)
    subline(d, th, sk, c, fl)
    fl.gap(30)
    rows = facts(c)
    pitch = fit_block(fl, len(rows), 86, 112)
    ph_ = pitch - 20
    for r in rows:
        f, _ = shrink(th, "regular", 27, [r], W - MX * 2 - 60)
        d.rounded_rectangle([-ph_ // 2, fl.y, MX + tw(r, f) + 40, fl.y + ph_],
                            radius=ph_ // 2, fill=sk.chip)
        d.text((MX, fl.y + ph_ / 2), r, font=f, fill=sk.chip_ink, anchor="lm")
        fl.gap(pitch)
    brand_bar(img, d, th, sk)
    return img


def t_rules_only(c, th):
    """No photo. Type does all the work, so it runs large."""
    img, d, sk, top = build(th, c, "rules_only")
    fl = Flow(top + 20)
    eyebrow(d, th, sk, c, fl)
    headline(d, th, sk, c, fl, lo=48, hi=82)
    fl.gap(18)
    d.rectangle([MX, fl.y, MX + 72, fl.y + 4], fill=sk.gold)
    fl.gap(40)
    rows, avail = c["rows"], (H - FOOT - 40) - fl.y
    block = avail // max(1, len(rows))
    for r in rows:
        y0 = fl.y
        d.rectangle([MX, y0, W - MX, y0 + 1], fill=sk.rule)
        fl.line(44)
        tracked(d, MX, fl.y, r["label"].upper(), th.f("medium", 18), sk.label, 3)
        lines, f = wrap(th, "semibold", 32, " ".join(r["fact"]), W - MX * 2)
        for l in lines:
            fl.line(43)
            txt(d, MX, fl.y, l, f, sk.ink)
        if r.get("detail"):
            dl, df = wrap(th, "regular", 22, r["detail"], W - MX * 2)
            for l in dl:
                fl.line(31)
                txt(d, MX, fl.y, l, df, sk.soft)
        fl.y = y0 + block
    brand_bar(img, d, th, sk)
    return img


def t_stat_band(c, th):
    img, d, sk, top = build(th, c, "stat_band")
    fl = Flow(top)
    eyebrow(d, th, sk, c, fl)
    headline(d, th, sk, c, fl, lo=50, hi=84)
    fl.gap(16)
    d.rectangle([MX, fl.y, MX + 72, fl.y + 4], fill=sk.gold)
    fl.gap(40)
    for r in c["rows"][:room_for(fl, 2, 150, bottom=H - FOOT - 40)]:
        fl.line(30)
        tracked(d, MX, fl.y, r["label"].upper(), th.f("medium", 18), sk.label, 3)
        lines, f = wrap(th, "regular", 27, " ".join(r["fact"]), W - MX * 2)
        for l in lines:
            fl.line(38)
            txt(d, MX, fl.y, l, f, sk.ink)
        fl.gap(24)
    ph = get_photo(c)
    band_top = max(fl.y + 34, 700)
    if (ph is not None and sk.surface != "photo_top"
            and band_top >= fl.y + 30 and H - FOOT - band_top >= 110):
        img.paste(duotone(ph, (W, H - FOOT - band_top), (0x2E, 0x5A, 0x80),
                          (0xE8, 0xF6, 0xFF)), (0, band_top))
    brand_bar(img, d, th, sk)
    return img


def t_split_rules(c, th):
    img, d, sk, top = build(th, c, "split_rules")
    x = 404 + 56
    colw = W - x - 56

    class L(Flow):
        pass
    fl = L(TOP + 14)
    if c.get("eyebrow"):
        fl.line(22)
        tracked(d, x, fl.y, c["eyebrow"].upper(), th.f("semibold", 19), sk.label, 5)
        fl.gap(18)
    f, size = grow(th, "semibold", c["headline"], colw, 32, 52)
    for l in c["headline"]:
        fl.line(int(size * 1.04))
        txt(d, x, fl.y, l, f, sk.ink)
        fl.gap(int(size * 0.22))
    fl.gap(28)
    rows, avail = facts(c), (H - FOOT - 40) - fl.y
    block = avail // max(1, len(rows))
    num = th.f("semibold", 19)
    for i, r in enumerate(rows):
        y0 = fl.y
        d.rectangle([x, y0, W - 56, y0 + 1], fill=sk.rule)
        fl.line(40)
        txt(d, x, fl.y, f"0{i+1}", num, sk.label)
        lines, rf = wrap(th, "regular", 25, r, colw - 52)
        first = True
        for l in lines:
            if not first:
                fl.line(34)
            txt(d, x + 52, fl.y, l, rf, sk.ink)
            first = False
        fl.y = y0 + block
    brand_bar(img, d, th, sk)
    return img


def t_card_stack(c, th):
    img, d, sk, top = build(th, c, "card_stack")
    fl = Flow(top)
    eyebrow(d, th, sk, c, fl)
    headline(d, th, sk, c, fl, lo=38, hi=58)
    fl.gap(26)
    rows = c["rows"][:room_for(fl, len(c["rows"]), 122, bottom=H - FOOT - 30)]
    pitch = fit_block(fl, len(rows), 122, 168, bottom=H - FOOT - 30)
    ch = pitch - 18
    for r in rows:
        y0 = fl.y
        d.rounded_rectangle([MX, y0, W - MX, y0 + ch], radius=18, fill=(255, 255, 255))
        tracked(d, MX + 34, y0 + 42, r["label"].upper(), th.f("medium", 17),
                th.c["accent"], 3)
        lines, f = wrap(th, "semibold", 27, " ".join(r["fact"]), W - MX * 2 - 68)
        yy = y0 + 84
        for l in lines[:2]:
            txt(d, MX + 34, yy, l, f, th.c["primary"])
            yy += 36
        fl.y = y0 + pitch
    brand_bar(img, d, th, sk)
    return img


def t_quote_band(c, th):
    """One point, said once, large. The card that earns its whitespace."""
    img, d, sk, top = build(th, c, "quote_band")
    fl = Flow(top + 30)
    eyebrow(d, th, sk, c, fl)
    fl.gap(14)
    headline(d, th, sk, c, fl, lo=54, hi=92)
    fl.gap(22)
    d.rectangle([MX, fl.y, MX + 72, fl.y + 4], fill=sk.gold)
    fl.gap(46)
    for r in c["rows"][:2]:
        lines, f = wrap(th, "regular", 27, " ".join(r["fact"]), W - MX * 2)
        for l in lines:
            fl.line(38)
            txt(d, MX, fl.y, l, f, sk.soft)
        fl.gap(20)
    brand_bar(img, d, th, sk)
    return img


def t_checklist(c, th):
    img, d, sk, top = build(th, c, "checklist")
    fl = Flow(top)
    eyebrow(d, th, sk, c, fl)
    headline(d, th, sk, c, fl, lo=44, hi=72)
    fl.gap(18)
    d.rectangle([MX, fl.y, MX + 72, fl.y + 4], fill=sk.gold)
    fl.gap(44)
    rows = facts(c)[:room_for(fl, len(c["rows"]), 96, bottom=H - FOOT - 40)]
    block = fit_block(fl, len(rows), 96, 140, bottom=H - FOOT - 40)
    for r in rows:
        y0 = fl.y
        cy = y0 + 26
        d.ellipse([MX, cy - 19, MX + 38, cy + 19], outline=sk.label, width=2)
        d.line([(MX + 11, cy + 1), (MX + 18, cy + 9), (MX + 28, cy - 9)],
               fill=sk.label, width=3)
        lines, f = wrap(th, "regular", 28, r, W - MX * 2 - 70)
        yy = y0 + 36
        for l in lines:
            txt(d, MX + 64, yy, l, f, sk.ink)
            yy += 38
        fl.y = y0 + block
    brand_bar(img, d, th, sk)
    return img


def t_timeline(c, th):
    img, d, sk, top = build(th, c, "timeline")
    fl = Flow(top)
    eyebrow(d, th, sk, c, fl)
    headline(d, th, sk, c, fl, lo=42, hi=66)
    fl.gap(46)
    rows = c["rows"]
    block = fit_block(fl, len(rows), 116, 158, bottom=H - FOOT - 40)
    x = MX + 11
    d.line([(x, fl.y + 10), (x, fl.y + (len(rows) - 1) * block + 10)],
           fill=sk.rule, width=2)
    for r in rows:
        y0 = fl.y
        d.ellipse([x - 10, y0, x + 10, y0 + 20], fill=sk.label)
        tracked(d, MX + 54, y0 + 18, r["label"].upper(), th.f("medium", 18), sk.label, 3)
        lines, f = wrap(th, "semibold", 28, " ".join(r["fact"]), W - MX - 54 - MX)
        yy = y0 + 58
        for l in lines[:2]:
            txt(d, MX + 54, yy, l, f, sk.ink)
            yy += 37
        fl.y = y0 + block
    brand_bar(img, d, th, sk)
    return img


def t_compare(c, th):
    img, d, sk, top = build(th, c, "compare")
    fl = Flow(top)
    eyebrow(d, th, sk, c, fl)
    headline(d, th, sk, c, fl, lo=40, hi=62)
    fl.gap(40)
    colw = (W - MX * 2 - 40) // 2
    heads = c.get("columns", ["OFTEN ASSUMED", "WHAT APPLIES"])
    boxh = (H - FOOT - 40) - fl.y
    for i in range(2):
        cx = MX + i * (colw + 40)
        fill = (255, 255, 255) if i else th.c["highlight"]
        d.rounded_rectangle([cx, fl.y, cx + colw, fl.y + boxh], radius=18, fill=fill)
        tracked(d, cx + 30, fl.y + 44, heads[i].upper(), th.f("medium", 17),
                th.c["accent"], 3)
        body = c["rows"][i] if i < len(c["rows"]) else {"fact": [""]}
        lines, f = wrap(th, "semibold", 27, " ".join(body["fact"]), colw - 60)
        yy = fl.y + 92
        for l in lines:
            txt(d, cx + 30, yy, l, f, th.c["primary"])
            yy += 36
        if body.get("detail"):
            dl, df = wrap(th, "regular", 21, body["detail"], colw - 60)
            yy += 14
            for l in dl:
                txt(d, cx + 30, yy, l, df, th.c["detail"])
                yy += 29
    brand_bar(img, d, th, sk)
    return img


def t_number_hero(c, th):
    big = c.get("figure") or c["rows"][0]["fact"][0]
    if len(big) > 18:
        # Never truncate a sentence into nonsense. Hand it to stat_band, on a flat
        # surface: stat_band needs the height a photo band would eat.
        surf = c.get("surface")
        return t_stat_band(dict(c, surface=surf if surf in ("ivory", "sky", "sand")
                                else "ivory"), th)
    img, d, sk, top = build(th, c, "number_hero")
    fl = Flow(top + 10)
    eyebrow(d, th, sk, c, fl)
    f, size = grow(th, "bold", [big], W - MX * 2, 90, 190)
    fl.line(int(size * 0.98))
    txt(d, MX, fl.y, big, f, sk.ink)
    fl.gap(int(size * 0.22))
    hf, hsize = grow(th, "semibold", c["headline"], W - MX * 2, 30, 46)
    for l in c["headline"]:
        fl.line(int(hsize * 1.06))
        txt(d, MX, fl.y, l, hf, sk.ink)
    fl.gap(30)
    for r in c["rows"][1:3]:
        lines, rf = wrap(th, "regular", 25, " ".join(r["fact"]), W - MX * 2)
        for l in lines:
            fl.line(35)
            txt(d, MX, fl.y, l, rf, sk.soft)
        fl.gap(14)
    brand_bar(img, d, th, sk)
    return img


RENDERERS = {
    "band_rules": t_band_rules, "pill_right": t_pill_right, "band_pills": t_band_pills,
    "rules_only": t_rules_only, "stat_band": t_stat_band, "split_rules": t_split_rules,
    "card_stack": t_card_stack, "quote_band": t_quote_band, "checklist": t_checklist,
    "timeline": t_timeline, "compare": t_compare, "number_hero": t_number_hero,
}


def render(c, th, outpath):
    name = pick_template(c)
    img = RENDERERS[name](c, th)
    os.makedirs(os.path.dirname(outpath) or ".", exist_ok=True)
    img.save(outpath)
    return outpath, name


def main():
    if len(sys.argv) < 2 or sys.argv[1] == "list":
        for t in TEMPLATES:
            print(f"{t:14s} surfaces: {', '.join(dict.fromkeys(SURFACES[t]))}")
        return
    cmd = sys.argv[1]
    if cmd == "image":
        c = load(sys.argv[2])
        th = T(load(sys.argv[3]))
        p, name = render(c, th, os.path.join(OUTDIR, f"{c['slug']}.png"))
        print(f"{name} -> {p}")
    elif cmd == "contact":
        th = T(load(sys.argv[2]))
        c = load(os.path.join(HERE, "..", "content", "modelo210_en.json"))
        for name in TEMPLATES:
            for i, surf in enumerate(dict.fromkeys(SURFACES[name])):
                cc = dict(c, template=name, surface=surf, slug=f"c_{name}_{surf}")
                print(render(cc, th, os.path.join(OUTDIR, f"c_{name}_{surf}.png"))[0])
    else:
        print(__doc__)


if __name__ == "__main__":
    main()
