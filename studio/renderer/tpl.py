"""Template pack for the Spain 24/7 / Bueno post images.

Twelve 1080x1080 layouts built on the two designs Pratik approved:
the taxes card (photo band across the top, numbered hairline rows, navy
footer block) and the Facebook-group card (photo faded in from the right,
white pills bleeding off the left edge, one navy pill).

Everything is theme-driven and takes the SAME content JSON that
simple3.py already uses, so existing content files render unchanged:

    {"slug","language","eyebrow","headline":[..],"rows":[{label,fact:[..],detail}],
     "template": "band_rules", "photo": "coast_bay.jpg", "cta": "..."}

`template` picks the layout. Omit it and one is chosen from the slug, so a
feed never repeats the same layout twice running.

Branding comes from the theme's `footer` block, exactly as in simple3:
  footer.type == "wordmark_247"  -> the 24/7 SPAIN wordmark  (public posts)
  footer.type == "logo"          -> footer.logo_path lockup  (Bueno decks)

Usage (from repo root):
  python3 studio/renderer/tpl.py list
  python3 studio/renderer/tpl.py image studio/content/modelo210_en.json studio/themes/247spain.json
  python3 studio/renderer/tpl.py contact studio/themes/247spain-bueno.json   # sheet of all templates
"""
from PIL import Image, ImageDraw
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from simple3 import T, tw, cover, draw_footer, load  # noqa: E402

try:
    import numpy as np
except ImportError:                                   # pillow-only fallback
    np = None

W = H = 1080
MX = 84
PHOTOS_DIR = os.environ.get("STUDIO_PHOTOS", os.path.join(HERE, "..", "photos"))
OUTDIR = os.environ.get("STUDIO_OUT", os.path.join(HERE, "..", "out"))

TEMPLATES = [
    "band_rules", "pill_right", "band_pills", "rules_only",
    "stat_band", "split_rules", "card_stack", "quote_band",
    "checklist", "timeline", "compare", "number_hero",
]


# ---------------------------------------------------------------- helpers

def pick_template(c):
    t = c.get("template")
    if t in TEMPLATES:
        return t
    return TEMPLATES[sum(ord(ch) for ch in c.get("slug", "x")) % len(TEMPLATES)]


def get_photo(c):
    try:
        files = sorted(f for f in os.listdir(PHOTOS_DIR)
                       if f.lower().endswith((".jpg", ".jpeg", ".png")))
    except Exception:
        return None
    if not files:
        return None
    name = c["photo"] if c.get("photo") in files else \
        files[sum(ord(x) for x in c.get("slug", "x")) % len(files)]
    try:
        return Image.open(os.path.join(PHOTOS_DIR, name)).convert("RGB")
    except Exception:
        return None


def duotone(ph, size, shadow, light):
    """Flatten a photo into the brand's two blues. Keeps every card one family."""
    p = cover(ph, *size).convert("L")
    if np is not None:
        g = np.asarray(p, float) / 255.0
        sh = np.array(shadow, float)
        hi = np.array(light, float)
        out = sh[None, None, :] + (hi - sh)[None, None, :] * g[:, :, None]
        return Image.fromarray(out.clip(0, 255).astype("uint8"))
    lut = []
    for ch in range(3):
        lut += [int(shadow[ch] + (light[ch] - shadow[ch]) * i / 255.0) for i in range(256)]
    return p.convert("RGB").point(lut)


def fade_down(img, box, keep, fade):
    """Fade the bottom `fade` px of an image strip into nothing (alpha ramp)."""
    a = Image.new("L", img.size, 255)
    ad = ImageDraw.Draw(a)
    for i in range(fade):
        y = keep + i
        ad.line([(0, y), (img.size[0], y)], fill=int(255 * (1 - i / fade)))
    ad.rectangle([0, keep + fade, img.size[0], img.size[1]], fill=0)
    img.putalpha(a)
    return img


def fade_left(img, start, full):
    """Alpha 0 left of `start`, ramping to solid at `full`. The pill-card look."""
    a = Image.new("L", img.size, 0)
    ad = ImageDraw.Draw(a)
    span = max(1, full - start)
    for x in range(img.size[0]):
        v = 0 if x < start else min(1.0, (x - start) / span)
        ad.line([(x, 0), (x, img.size[1])], fill=int(255 * v))
    img.putalpha(a)
    return img


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


def shrink(th, kind, size, lines, maxw, floor=20):
    """Step the size down until the longest line fits."""
    while size > floor:
        f = th.f(kind, size)
        if max(tw(l, f) for l in lines) <= maxw:
            return f, size
        size -= 2
    return th.f(kind, floor), floor


def spaced(d, s, f, ls, x, y, col):
    cx = x
    for ch in s:
        d.text((cx, y), ch, font=f, fill=col)
        cx += tw(ch, f) + ls
    return cx - x


def pill(d, th, x, y, h_, text, font, bg, fg, pad=38, bleed=False, centre_w=None):
    r = h_ // 2
    w_ = tw(text, font)
    if centre_w:
        x0 = (W - (w_ + pad * 2)) // 2
        x1 = x0 + w_ + pad * 2
        tx = x0 + pad
    elif bleed:
        x0, x1, tx = -r, x + w_ + pad, x
    else:
        x0, x1, tx = x, x + w_ + pad * 2, x + pad
    d.rounded_rectangle([x0, y, x1, y + h_], radius=r, fill=bg)
    d.text((tx, y + h_ / 2), text, font=font, fill=fg, anchor="lm")
    return x1


def hairline(d, th, x, y, w_, alpha=46):
    d.rectangle([x, y, x + w_, y + 1], fill=th.c["hairline"])


def gold_rule(d, th, x, y, w_=64):
    d.rectangle((x, y, x + w_, y + 3), fill=th.c["gold"])


def eyebrow(d, th, c, y=None, col=None):
    y = 84 if y is None else y
    f = th.f("semibold", 21)
    spaced(d, c["eyebrow"].upper(), f, 6, MX, y, col or th.c["accent"])
    return y + 34


def headline(d, th, c, y, size=58, maxw=None, col=None):
    maxw = maxw or (W - MX * 2)
    lines = c["headline"]
    f, size = shrink(th, "semibold", size, lines, maxw)
    for l in lines:
        d.text((MX, y), l, font=f, fill=col or th.c["primary"])
        y += int(size * 1.22)
    return y


def footer_block(img, d, th, c, foot=132):
    """The navy bar at the base. simple3 already knows both brand marks."""
    draw_footer(d, img, th, W, H, foot, scale=0.62)
    return H - foot


def cta_line(d, th, c, y, col=None):
    if not c.get("cta"):
        return y
    lines, f = wrap(th, "medium", 24, c["cta"], W - MX * 2)
    for l in lines:
        d.text((MX, y), l, font=f, fill=col or th.c["accent"])
        y += 32
    return y


def base(th):
    img = Image.new("RGB", (W, H), th.c["canvas"])
    return img, ImageDraw.Draw(img)


def photo_band(img, th, c, top, height, fade=0):
    ph = get_photo(c)
    if ph is None:
        return False
    strip = duotone(ph, (W, height), (0x3E, 0x6C, 0x93), (0xE8, 0xF6, 0xFF))
    if fade:
        strip = fade_down(strip.convert("RGBA"), (0, 0, W, height), height - fade, fade)
        img.paste(strip, (0, top), strip)
    else:
        img.paste(strip, (0, top))
    return True


# ---------------------------------------------------------------- templates

def t_band_rules(c, th):
    """Approved taxes card. Photo band top, numbered hairline rows, navy footer."""
    img, d = base(th)
    photo_band(img, th, c, 0, 360, fade=110)
    y = eyebrow(d, th, c, 408)
    y = headline(d, th, c, y + 8, 56)
    if c.get("sub"):
        lines, f = wrap(th, "regular", 27, c["sub"], W - MX * 2)
        y += 10
        for l in lines:
            d.text((MX, y), l, font=f, fill=th.c["muted"])
            y += 34
    y += 22
    rowh = 92
    for i, row in enumerate(c["rows"]):
        hairline(d, th, MX, y, W - MX * 2)
        cy = y + rowh / 2
        d.text((MX, cy), f"0{i+1}", font=th.f("semibold", 22), fill=th.c["accent"], anchor="lm")
        fact = " ".join(row["fact"])
        f, _ = shrink(th, "regular", 27, [fact], W - MX * 2 - 70)
        d.text((MX + 62, cy), fact, font=f, fill=th.c["primary"], anchor="lm")
        y += rowh
    hairline(d, th, MX, y, W - MX * 2)
    footer_block(img, d, th, c)
    return img


def t_pill_right(c, th):
    """Approved Facebook-group card. Photo faded in from the right, pills on the left."""
    img, d = base(th)
    ph = get_photo(c)
    if ph is not None:
        sheet = duotone(ph, (W, H), (0x6C, 0xA3, 0xC8), (0xF4, 0xFB, 0xFF)).convert("RGBA")
        sheet = fade_left(sheet, int(W * 0.34), int(W * 0.66))
        img.paste(sheet, (0, 0), sheet)
        wash = Image.new("RGBA", (W, H), th.c["highlight"] + (46,))
        img.paste(wash, (0, 0), wash)
    y = eyebrow(d, th, c, 92)
    y = headline(d, th, c, y + 14, 58, maxw=int(W * 0.62))
    if c.get("sub"):
        lines, f = wrap(th, "regular", 26, c["sub"], int(W * 0.58))
        y += 16
        for l in lines:
            d.text((MX, y), l, font=f, fill=th.c["muted"])
            y += 34
    y = max(y + 36, 372)
    pf = th.f("regular", 26)
    for row in c["rows"]:
        pill(d, th, MX, y, 74, " ".join(row["fact"]), pf, (255, 255, 255), th.c["primary"], bleed=True)
        y += 96
    if c.get("cta"):
        pill(d, th, MX, y, 76, c["cta"], th.f("semibold", 27), th.c["primary"], (255, 255, 255), bleed=True)
    footer_block(img, d, th, c)
    return img


def t_band_pills(c, th):
    """Photo band across the top, pills below it."""
    img, d = base(th)
    photo_band(img, th, c, 0, 360, fade=90)
    y = eyebrow(d, th, c, 408)
    y = headline(d, th, c, y + 8, 54)
    y += 34
    pf = th.f("regular", 26)
    for row in c["rows"]:
        pill(d, th, MX, y, 72, " ".join(row["fact"]), pf, (255, 255, 255), th.c["primary"], bleed=True)
        y += 96
    footer_block(img, d, th, c)
    return img


def t_rules_only(c, th):
    """No photo. Pure type, hairline rows, generous air. For dense legal points."""
    img, d = base(th)
    y = eyebrow(d, th, c, 120)
    y = headline(d, th, c, y + 16, 66)
    gold_rule(d, th, MX, y + 24)
    y += 76
    for i, row in enumerate(c["rows"]):
        hairline(d, th, MX, y, W - MX * 2)
        y += 30
        spaced(d, row["label"].upper(), th.f("medium", 18), 3, MX, y, th.c["accent"])
        y += 32
        fact = " ".join(row["fact"])
        lines, f = wrap(th, "semibold", 30, fact, W - MX * 2)
        for l in lines:
            d.text((MX, y), l, font=f, fill=th.c["primary"])
            y += 40
        if row.get("detail"):
            lines, f = wrap(th, "regular", 21, row["detail"], W - MX * 2)
            for l in lines:
                d.text((MX, y), l, font=f, fill=th.c["detail"])
                y += 28
        y += 26
    footer_block(img, d, th, c)
    return img


def t_stat_band(c, th):
    """One big statement up top, two supporting rows, photo band at the bottom."""
    img, d = base(th)
    y = eyebrow(d, th, c, 96)
    y = headline(d, th, c, y + 14, 70)
    gold_rule(d, th, MX, y + 20)
    y += 70
    for row in c["rows"][:2]:
        spaced(d, row["label"].upper(), th.f("medium", 18), 3, MX, y, th.c["accent"])
        y += 30
        lines, f = wrap(th, "regular", 25, " ".join(row["fact"]), W - MX * 2)
        for l in lines:
            d.text((MX, y), l, font=f, fill=th.c["primary"])
            y += 34
        y += 20
    foot = 132
    bandh = H - foot - 620
    if bandh > 80:
        photo_band(img, th, c, 620, bandh)
    footer_block(img, d, th, c)
    return img


def t_split_rules(c, th):
    """Photo down the left half, numbered rows in the right column."""
    img, d = base(th)
    ph = get_photo(c)
    half = 430
    if ph is not None:
        img.paste(duotone(ph, (half, H - 132), (0x3E, 0x6C, 0x93), (0xE8, 0xF6, 0xFF)), (0, 0))
    x = half + 56
    colw = W - x - 56
    f = th.f("semibold", 20)
    spaced(d, c["eyebrow"].upper(), f, 5, x, 96, th.c["accent"])
    y = 140
    hf, hsize = shrink(th, "semibold", 44, c["headline"], colw)
    for l in c["headline"]:
        d.text((x, y), l, font=hf, fill=th.c["primary"])
        y += int(hsize * 1.2)
    y += 24
    for i, row in enumerate(c["rows"]):
        hairline(d, th, x, y, colw)
        y += 22
        d.text((x, y), f"0{i+1}", font=th.f("semibold", 19), fill=th.c["accent"])
        wl, wf = wrap(th, "regular", 24, " ".join(row["fact"]), colw - 48)
        yy = y
        for l in wl:
            d.text((x + 48, yy), l, font=wf, fill=th.c["primary"])
            yy += 32
        y = yy + 24
    footer_block(img, d, th, c)
    return img


def t_card_stack(c, th):
    """Three white cards on the light ground. Good for step-by-step points."""
    img, d = base(th)
    photo_band(img, th, c, 0, 262, fade=80)
    y = eyebrow(d, th, c, 306)
    y = headline(d, th, c, y + 8, 46)
    y += 22
    for row in c["rows"]:
        h_ = 132
        d.rounded_rectangle([MX, y, W - MX, y + h_], radius=18, fill=(255, 255, 255))
        spaced(d, row["label"].upper(), th.f("medium", 17), 3, MX + 32, y + 26, th.c["accent"])
        wl, wf = wrap(th, "semibold", 25, " ".join(row["fact"]), W - MX * 2 - 64)
        yy = y + 56
        for l in wl[:2]:
            d.text((MX + 32, yy), l, font=wf, fill=th.c["primary"])
            yy += 32
        y += h_ + 14
    footer_block(img, d, th, c)
    return img


def t_quote_band(c, th):
    """The headline set large inside a navy block. One point, said once."""
    img, d = base(th)
    photo_band(img, th, c, 0, 330, fade=80)
    top = 380
    d.rectangle([0, top, W, top + 300], fill=th.c["primary"])
    y = top + 52
    qf, qsize = shrink(th, "semibold", 46, c["headline"], W - MX * 2)
    for l in c["headline"]:
        d.text((MX, y), l, font=qf, fill=(255, 255, 255))
        y += int(qsize * 1.24)
    y = top + 330
    for row in c["rows"][:2]:
        wl, wf = wrap(th, "regular", 24, " ".join(row["fact"]), W - MX * 2)
        for l in wl:
            d.text((MX, y), l, font=wf, fill=th.c["primary"])
            y += 32
        y += 18
    footer_block(img, d, th, c)
    return img


def t_checklist(c, th):
    """Ticks instead of numbers. For the do-this-before-you-sign posts."""
    img, d = base(th)
    y = eyebrow(d, th, c, 110)
    y = headline(d, th, c, y + 14, 60)
    gold_rule(d, th, MX, y + 22)
    y += 74
    for row in c["rows"]:
        cy = y + 26
        d.ellipse([MX, cy - 17, MX + 34, cy + 17], outline=th.c["accent"], width=2)
        d.line([(MX + 10, cy), (MX + 16, cy + 7), (MX + 25, cy - 8)], fill=th.c["accent"], width=3)
        wl, wf = wrap(th, "regular", 27, " ".join(row["fact"]), W - MX * 2 - 64)
        yy = y + 8
        for l in wl:
            d.text((MX + 58, yy), l, font=wf, fill=th.c["primary"])
            yy += 36
        y = yy + 26
    bandh = H - 132 - max(y + 20, 700)
    if bandh > 90:
        photo_band(img, th, c, max(y + 20, 700), bandh)
    footer_block(img, d, th, c)
    return img


def t_timeline(c, th):
    """Dots on a vertical rule. For deadlines and anything with an order."""
    img, d = base(th)
    y = eyebrow(d, th, c, 110)
    y = headline(d, th, c, y + 14, 56)
    y += 46
    x = MX + 12
    rows = c["rows"]
    d.line([(x, y + 18), (x, y + (len(rows) - 1) * 130 + 18)], fill=th.c["hairline"], width=2)
    for row in rows:
        d.ellipse([x - 9, y + 9, x + 9, y + 27], fill=th.c["accent"])
        spaced(d, row["label"].upper(), th.f("medium", 18), 3, x + 46, y + 8, th.c["accent"])
        wl, wf = wrap(th, "semibold", 26, " ".join(row["fact"]), W - x - 46 - MX)
        yy = y + 42
        for l in wl[:2]:
            d.text((x + 46, yy), l, font=wf, fill=th.c["primary"])
            yy += 34
        y += 130
    bandh = H - 132 - max(y + 10, 720)
    if bandh > 90:
        photo_band(img, th, c, max(y + 10, 720), bandh)
    footer_block(img, d, th, c)
    return img


def t_compare(c, th):
    """Two columns: what people assume, what the rule says. Myth-busting posts."""
    img, d = base(th)
    y = eyebrow(d, th, c, 110)
    y = headline(d, th, c, y + 14, 54)
    y += 44
    colw = (W - MX * 2 - 44) // 2
    heads = c.get("columns", ["OFTEN ASSUMED", "WHAT APPLIES"])
    for i in range(2):
        cx = MX + i * (colw + 44)
        box = (255, 255, 255) if i else th.c["highlight"]
        d.rounded_rectangle([cx, y, cx + colw, y + 360], radius=18, fill=box)
        spaced(d, heads[i].upper(), th.f("medium", 17), 3, cx + 26, y + 26, th.c["accent"])
        body = c["rows"][i] if i < len(c["rows"]) else {"fact": [""]}
        wl, wf = wrap(th, "semibold", 25, " ".join(body["fact"]), colw - 52)
        yy = y + 66
        for l in wl:
            d.text((cx + 26, yy), l, font=wf, fill=th.c["primary"])
            yy += 33
        if body.get("detail"):
            wl, wf = wrap(th, "regular", 20, body["detail"], colw - 52)
            yy += 12
            for l in wl:
                d.text((cx + 26, yy), l, font=wf, fill=th.c["detail"])
                yy += 27
    bandh = H - 132 - (y + 400)
    if bandh > 90:
        photo_band(img, th, c, y + 400, bandh)
    footer_block(img, d, th, c)
    return img


def t_number_hero(c, th):
    """One figure, very large, with the sentence that makes it mean something."""
    img, d = base(th)
    photo_band(img, th, c, 0, 300, fade=90)
    y = eyebrow(d, th, c, 348)
    big = c.get("figure") or c["rows"][0]["fact"][0]
    if len(big) > 18:
        big = big[:18].rstrip()
    f, size = shrink(th, "bold", 150, [big], W - MX * 2)
    d.text((MX, y + 10), big, font=f, fill=th.c["primary"])
    y += int(size * 1.08) + 24
    y = headline(d, th, c, y, 40)
    y += 18
    for row in c["rows"][1:3]:
        wl, wf = wrap(th, "regular", 23, " ".join(row["fact"]), W - MX * 2)
        for l in wl:
            d.text((MX, y), l, font=wf, fill=th.c["detail"])
            y += 31
        y += 12
    footer_block(img, d, th, c)
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


# ---------------------------------------------------------------- cli

def main():
    if len(sys.argv) < 2 or sys.argv[1] == "list":
        print("\n".join(TEMPLATES))
        return
    cmd = sys.argv[1]
    if cmd == "image":
        c = load(sys.argv[2])
        th = T(load(sys.argv[3]))
        out = os.path.join(OUTDIR, f"{c['slug']}.png")
        p, name = render(c, th, out)
        print(f"{name} -> {p}")
    elif cmd == "contact":
        th = T(load(sys.argv[2]))
        c = load(os.path.join(HERE, "..", "content", "modelo210_en.json"))
        for name in TEMPLATES:
            cc = dict(c, template=name, slug=f"contact_{name}")
            print(render(cc, th, os.path.join(OUTDIR, f"contact_{name}.png"))[0])
    else:
        print(__doc__)


if __name__ == "__main__":
    main()
