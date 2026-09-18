"""Checks the 105 text-free LinkedIn frames. Run after any re-render.

What it enforces, each rule from something that actually went wrong:

1. The photo pool has no duplicate images. Six pairs of the same photo under
   different names is what made the first render look repetitive.
2. No greyscale photo in the pool. One was, and it read as off-brand against a
   warm set.
3. No two of the 105 finished images are near-identical.
4. No image is nearly flat, which is what a crop that landed on empty sky is.
5. Every image is 1080x1080, carries the Bueno lockup whole and uncropped, and
   uses only brand colours in the non-photographic areas.
"""
import glob, os, sys
import numpy as np
from PIL import Image

D = os.path.dirname(os.path.abspath(__file__))
POOL = os.path.join(D, "photos-brand")
FRAMES = sorted(glob.glob(os.path.join(D, "out", "frames", "*.png")))
NAVY, HIGHLIGHT, CANVAS, GOLD = (1, 2, 33), (203, 239, 255), (248, 247, 244), (201, 169, 110)
fails = []


def near(pixel, colour, tol=8):
    return all(abs(int(a) - b) <= tol for a, b in zip(pixel, colour))


pool = sorted(f for f in os.listdir(POOL) if f.lower().endswith((".jpg", ".jpeg", ".png")))
sig = {f: np.asarray(Image.open(os.path.join(POOL, f)).convert("L").resize((48, 48)), float)
       for f in pool}
for i, a in enumerate(pool):
    for b in pool[i + 1:]:
        if float(np.abs(sig[a] - sig[b]).mean()) < 8:
            fails.append(f"duplicate photos in the pool: {a} and {b} are the same image")
for f in pool:
    a = np.asarray(Image.open(os.path.join(POOL, f)).convert("RGB").resize((64, 64)), float)
    if float(np.abs(a - a.mean(axis=2, keepdims=True)).mean()) < 3:
        fails.append(f"greyscale photo in the pool: {f}")


def layout_of(im):
    """Which of the four brand frames this is, read off the pixels."""
    px = im.load()
    if near(px[5, 5], NAVY) and near(px[5, 1075], NAVY) and not near(px[1075, 5], NAVY):
        return "block"
    if near(px[5, 1020], NAVY) and near(px[5, 860], HIGHLIGHT):
        return "panel"
    if near(px[5, 1020], NAVY):
        return "full"
    if near(px[5, 5], CANVAS):
        return "inset"
    return "unknown"


thumbs = {}
for p in FRAMES:
    name = os.path.basename(p)
    im = Image.open(p).convert("RGB")
    if im.size != (1080, 1080):
        fails.append(f"{name}: {im.size}, expected 1080x1080")
        continue
    lay = layout_of(im)
    if lay == "unknown":
        fails.append(f"{name}: does not match any of the four brand frames")
        continue
    # the photographic area, and the box the lockup sits in
    photo_box, logo_box, dark = {
        "full":  ((0, 0, 1080, 912), (0, 912, 1080, 1080), True),
        "panel": ((0, 0, 1080, 790), (0, 912, 1080, 1080), True),
        "inset": ((72, 72, 1008, 832), (72, 872, 1008, 1040), False),
        "block": ((470, 0, 1080, 1080), (0, 0, 470, 1080), True),
    }[lay]
    g = np.asarray(im.convert("L").crop(photo_box).resize((160, 160)), float)
    detail = float(np.abs(np.diff(g, axis=0)).mean() + np.abs(np.diff(g, axis=1)).mean())
    if detail < 3.4:
        fails.append(f"{name}: the photograph is nearly flat ({detail:.1f}), likely empty sky")
    thumbs[name] = np.asarray(im.convert("L").resize((64, 64)), float)

    logo = np.asarray(im.convert("L").crop(logo_box), float)
    ink = logo > 200 if dark else logo < 90
    # the side block holds a narrower lockup than the full-width bar, so it has
    # fewer lit pixels by design
    floor = 2500 if lay == "block" else 4000
    if ink.sum() < floor:
        fails.append(f"{name}: the lockup is missing or too faint ({int(ink.sum())} px)")
    else:
        cols, rows = np.where(ink.any(axis=0))[0], np.where(ink.any(axis=1))[0]
        w, h = logo_box[2] - logo_box[0], logo_box[3] - logo_box[1]
        if cols[0] < 4 or cols[-1] > w - 5 or rows[0] < 2 or rows[-1] > h - 3:
            fails.append(f"{name}: the lockup touches the edge of its panel, so it is cropped")

    # brand colours only, outside the photograph
    px = im.load()
    if lay in ("full", "panel") and not near(px[540, 1000], NAVY):
        fails.append(f"{name}: the base bar is not brand navy")
    if lay == "panel" and not near(px[60, 860], HIGHLIGHT):
        fails.append(f"{name}: the panel is not brand light blue")
    if lay == "inset" and not near(px[20, 540], CANVAS):
        fails.append(f"{name}: the field is not brand off-white")
    if lay == "block" and not near(px[200, 540], NAVY):
        fails.append(f"{name}: the side block is not brand navy")

names = list(thumbs)
for i, a in enumerate(names):
    for b in names[i + 1:]:
        if float(np.abs(thumbs[a] - thumbs[b]).mean()) < 3.0:
            fails.append(f"near-identical images: {a} and {b}")

counts = {}
for p in FRAMES:
    counts[layout_of(Image.open(p).convert("RGB"))] = counts.get(
        layout_of(Image.open(p).convert("RGB")), 0) + 1
print(f"{len(FRAMES)} frames, {len(pool)} photos, layouts {counts}")
for f in fails:
    print("FAIL", f)
print("OK" if not fails else f"{len(fails)} problems")
sys.exit(1 if fails else 0)
