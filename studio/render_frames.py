"""Render the 105 text-free LinkedIn frames.

Text-free is deliberate. One image serves all six languages, so nothing has to
be translated and no Norwegian post ends up with an English card over it.

Photo pool: studio/photos-brand, 15 unique licensed shots (Getty/iStock plus
Bueno's own), documented in studio/PHOTO_POOL.md. That is everything licensed
that exists locally; neither this container nor the desktop can reach a stock
library, so variety has to come from the pool rather than from more downloads.

Fifteen photos over 105 posts is seven reuses each, so three things vary:
the layout (four brand frames: full, inset, block, panel), the crop, and the
spacing of a photo's reuses inside each audience deck. A photo never appears
twice in the same layout with the same crop, and no two of the 105 images are
near-identical. studio/check_frames.py enforces all of that.
"""
import json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "renderer"))
os.environ.setdefault("STUDIO_PHOTOS", os.path.join(os.path.dirname(__file__), "photos-brand"))
import tpl
from simple3 import T, load

HERE = os.path.dirname(os.path.abspath(__file__))
MAN = "/home/claude/brief/manifest.json"
OUT = os.path.join(HERE, "out", "frames")
th = T(load(os.path.join(HERE, "themes", "247spain-bueno.json")))

photos = sorted(f for f in os.listdir(os.environ["STUDIO_PHOTOS"])
                if f.lower().endswith((".jpg", ".jpeg", ".png")))
n = len(photos)
man = json.load(open(MAN))
os.makedirs(OUT, exist_ok=True)

import numpy as np
from PIL import Image

FLAT = 3.4      # below this a crop is empty sky; the softest licensed photo tops out at 4.1
DUP = 3.2       # mean abs difference between two 64px frame thumbnails
GAP = 6         # posts that must separate two uses of one photo inside a deck

# Score every crop of every photo first, because how many posts a photo can
# carry depends on how many genuinely different crops it has, and because a crop
# that lands on empty sky reads as a mistake.
import numpy as np
from PIL import Image

FLAT = 3.4      # below this a crop is empty sky; the softest licensed photo tops out at 4.1
DUP = 3.0       # mean abs difference between two 64px thumbnails of the finished image
GAP = 6         # posts that must separate two uses of one photo inside a deck
FRAMES = ["full", "inset", "block", "panel"]
BAND = {"full": 1080 - tpl.FOOT, "inset": 760, "block": 1080, "panel": 790}

# Crops are scored once per photo, at the full-frame band. The spec is a focal
# point plus a zoom, so it carries over to the other three layouts, and scoring
# every photo against every layout separately took minutes for no gain.
cands, capacity = {}, {}
for photo in photos:
    ph = Image.open(os.path.join(os.environ["STUDIO_PHOTOS"], photo)).convert("RGB")
    ranked = [(d, spec, np.asarray(t, float))
              for d, spec, t in tpl.crop_candidates(ph, BAND["full"]) if d >= FLAT]
    keep = []
    for d, spec, t in ranked:
        if all(float(np.abs(t - k[2]).mean()) >= DUP for k in keep):
            keep.append((d, spec, t))
    cands[photo] = keep
    # four layouts multiply what one photo can carry, but only as far as it has
    # distinct crops to give
    capacity[photo] = min(len(keep) * len(FRAMES), 12)

# Quota per photo: a fair share, capped by how many distinct crops it can give.
# One licensed shot is a hazy infinity pool with almost nothing in frame, so it
# carries fewer posts than the rest rather than repeating itself.
total = len(man)
fair = -(-total // n)
quota = {p: min(capacity[p], fair) for p in photos}
short = total - sum(quota.values())
for p in sorted(photos, key=lambda x: -(capacity[x] - quota[x])):
    while short > 0 and quota[p] < capacity[p]:
        quota[p] += 1
        short -= 1
if short > 0:
    raise SystemExit(f"photo pool too thin: {short} posts have no distinct crop left")

# Lay the photos out per audience deck so one does not come back within GAP posts.
OFFSET = {"owners": 0, "agents": 5, "attorneys": 10}
order = sorted(photos, key=lambda p: (-quota[p], p))
plan, used = {}, {}
for aud in sorted({m["audience"] for m in man}, key=lambda a: -sum(
        1 for m in man if m["audience"] == a)):
    rows = sorted((m for m in man if m["audience"] == aud), key=lambda x: x["day"])
    i = OFFSET.get(aud, 0)
    last = {}
    for pos, m in enumerate(rows):
        for _ in range(len(order) * 6):
            p = order[i % len(order)]
            i += 1
            if used.get(p, 0) < quota[p] and pos - last.get(p, -GAP) >= GAP:
                break
        else:
            for _ in range(len(order) * 6):
                p = order[i % len(order)]
                i += 1
                if used.get(p, 0) < quota[p]:
                    break
            else:
                raise SystemExit("could not place " + m["slug"])
        used[p] = used.get(p, 0) + 1
        last[p] = pos
        plan[m["slug"]] = (p, used[p] - 1)

# Layout and crop per post: rotate the four frames so a photo's seven uses are
# spread across them, then take the best crop that is not close to one already
# chosen for that photo and layout.
taken, chosen = [], {}
for slug, (photo, occurrence) in sorted(plan.items(), key=lambda kv: (kv[1][1], kv[0])):
    frame = FRAMES[occurrence % len(FRAMES)]
    pool = cands[photo]
    best = None
    for detail, spec, thumb in pool:
        if (photo, frame, spec) in [(t[0], t[1], t[2]) for t in taken]:
            continue
        if any(t[1] == frame and float(np.abs(thumb - t[3]).mean()) < DUP for t in taken):
            continue
        best = (detail, spec, thumb)
        break
    if best is None:
        best = pool[occurrence % len(pool)]
    taken.append((photo, frame, best[1], best[2]))
    chosen[slug] = (frame, best[1])

for slug, (frame, spec) in chosen.items():
    tpl.t_brand_frame({"slug": slug, "photo": plan[slug][0], "frame": frame, "crop": spec},
                      th).save(os.path.join(OUT, slug + ".png"))

import collections
print(f"{len(chosen)} frames -> {OUT}")
print(f"{n} photos, used {min(used.values())}-{max(used.values())} times each")
print("layouts:", dict(collections.Counter(f for f, _ in chosen.values())))
