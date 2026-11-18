"""Persona reels: one short vertical video per post and language for the Maria Lopez profiles.

Reads studio/personas/plan.json (written by plan.mjs from api/_fb_profiles.js) and renders
public/persona-reels/<post>/<lang>.mp4 plus a poster <lang>.jpg. Runs on a computer, not on the
site: it needs ffmpeg and the persona photos in "Claude outputs/".

What a reel looks like, built to read as a personal post, not an ad:
  - three scenes, each a different photo of the same persona, full screen and always moving
    (slow zoom and drift, a different direction per scene), joined by a quick zoom-and-fade cut
  - her profile picture and name slide in at the top, with story-style progress bars above
  - each scene says one line of the post; the words pop in one by one, big and bold,
    numbers lit up in yellow, and the line lifts away before the next cut
  - the last line gets a yellow underline that sweeps across once it is complete
No logo, no brand, no website. 13 seconds, 1080x1920, H.264 with a silent audio track.

    python3 studio/personas/render_reels.py              render everything missing
    python3 studio/personas/render_reels.py --force      render everything again
    python3 studio/personas/render_reels.py --only KEY   one post
    python3 studio/personas/render_reels.py --only KEY --lang en   one reel
"""
import json
import math
import os
import re
import subprocess
import sys

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT = os.path.join(ROOT, "public", "persona-reels")
FONT_BOLD = os.path.join(HERE, "fonts", "Inter-700.ttf")
FONT_MED = os.path.join(HERE, "fonts", "Inter-500.ttf")

W, H, FPS, SECONDS = 1080, 1920, 30, 13
NAME = "Maria Lopez"
YELLOW = (255, 214, 64)
# Scene boundaries (seconds). Scene n runs SCENES[n] .. SCENES[n + 1].
SCENES = [0.0, 3.6, 7.8, SECONDS]
CUT = 0.42           # length of the cut between scenes
POP = 0.30           # how long one word takes to pop in
TEXT_START = 0.25    # first word, seconds after the scene starts
OUT_LEAD = 0.45      # the line starts lifting away this long before the next cut
# Instagram covers about the top 220 px and the bottom 400 px with its own buttons.
TEXT_CENTER = [1180, 1200, 1200]
# Each scene moves differently: (zoom from, zoom to, drift x, drift y) as fractions of the frame.
MOVES = [(1.18, 1.04, 0.00, -0.03), (1.05, 1.17, 0.035, 0.0), (1.16, 1.05, -0.035, 0.02)]


def font(path, size):
    return ImageFont.truetype(path, size)


def ease_out(x):
    x = max(0.0, min(1.0, x))
    return 1 - (1 - x) ** 3


def ease_back(x):
    x = max(0.0, min(1.0, x))
    c = 1.9
    return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2


def ease_in_out(x):
    x = max(0.0, min(1.0, x))
    return 3 * x * x - 2 * x * x * x


def cover(img, w, h, focus_y=0.35):
    iw, ih = img.size
    scale = max(w / iw, h / ih)
    nw, nh = int(iw * scale + 0.5), int(ih * scale + 0.5)
    img = img.resize((nw, nh), Image.LANCZOS)
    left = (nw - w) // 2
    top = int(max(0, min(nh - h, (nh - h) * focus_y)))
    return img.crop((left, top, left + w, top + h))


def circle(img, d):
    img = ImageOps.fit(img, (d, d), Image.LANCZOS, centering=(0.5, 0.35))
    mask = Image.new("L", (d, d), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, d - 1, d - 1), fill=255)
    out = Image.new("RGBA", (d, d), (0, 0, 0, 0))
    out.paste(img, (0, 0), mask)
    return out


# --- Photos ------------------------------------------------------------------------------

class Scene:
    """One photo, prepared once at 1.2x the frame so every frame is a cheap affine crop."""
    PAD = 1.2

    def __init__(self, path, move):
        img = Image.open(os.path.join(ROOT, path)).convert("RGB")
        self.src = cover(img, int(W * self.PAD), int(H * self.PAD))
        self.move = move
        # Darken top and bottom so white text always reads, without a box.
        shade = Image.new("L", (1, H))
        for y in range(H):
            top = max(0.0, 1 - y / 520) * 150
            mid = 70
            low = max(0.0, (y - 700) / (H - 700)) * 170
            shade.putpixel((0, y), int(min(230, mid + top + low)))
        self.shade = Image.merge("RGBA", [Image.new("L", (W, H), 8)] * 3 + [shade.resize((W, H))])

    def at(self, p, punch=0.0):
        """The photo at progress p (0..1) through its scene; punch adds a quick extra zoom."""
        z0, z1, dx, dy = self.move
        e = ease_in_out(p)
        z = (z0 + (z1 - z0) * e) * (1 + punch)
        sw, sh = self.src.size
        # Visible window in source pixels (the whole source is the frame at zoom 1), drifted.
        vw, vh = sw / z, sh / z
        cx = sw / 2 + dx * sw * (e - 0.5)
        cy = sh / 2 + dy * sh * (e - 0.5)
        cx = min(max(cx, vw / 2), sw - vw / 2)
        cy = min(max(cy, vh / 2), sh - vh / 2)
        a = vw / W
        frame = self.src.transform((W, H), Image.AFFINE, (a, 0, cx - vw / 2, 0, a, cy - vh / 2), resample=Image.BILINEAR)
        frame = frame.convert("RGBA")
        frame.alpha_composite(self.shade)
        return frame


# --- Words -------------------------------------------------------------------------------

def is_number(word):
    return bool(re.search(r"\d", word))


def layout_words(text, size, maxw, center_y):
    """Break a line into words with their final positions. Returns (words, block box)."""
    fnt = font(FONT_BOLD, size)
    probe = ImageDraw.Draw(Image.new("RGB", (10, 10)))
    space = probe.textlength(" ", font=fnt)
    # Keep a number and its unit together ("16 %", "26 531", "9.000 euro").
    raw = text.split()
    tokens = []
    for w in raw:
        if tokens and (re.fullmatch(r"%|euro|euros|Euro", w) or (re.fullmatch(r"\d{3}[.,]?", w) and re.fullmatch(r"\d{1,3}", tokens[-1]))):
            tokens[-1] = tokens[-1] + " " + w
        else:
            tokens.append(w)
    def widths(t):
        # Numbers sit on a yellow pill, so they need a little more room.
        return probe.textlength(t, font=fnt) + (30 if is_number(t) else 0)

    def wrap_at(limit):
        rows, cur, curw = [], [], 0
        for t in tokens:
            tw = widths(t)
            if cur and curw + space + tw > limit:
                rows.append((cur, curw))
                cur, curw = [], 0
            curw = curw + (space if cur else 0) + tw
            cur.append((t, tw))
        if cur:
            rows.append((cur, curw))
        return rows

    # Balanced rows: the narrowest width that still needs no more rows, so no lonely last word.
    rows = wrap_at(maxw)
    lim = maxw
    while lim > 300:
        trial = wrap_at(lim - 20)
        if len(trial) > len(rows):
            break
        rows, lim = trial, lim - 20
    lh = int(size * 1.22)
    top = center_y - lh * len(rows) // 2
    words = []
    for r, (row, rw) in enumerate(rows):
        x = (W - rw) / 2
        for t, tw in row:
            pad = 15 if is_number(t) else 0
            words.append({"text": t, "x": x + pad, "y": top + r * lh, "w": tw - 2 * pad})
            x += tw + space
    box = (min(w["x"] for w in words), top, max(w["x"] + w["w"] for w in words), top + lh * len(rows))
    return words, box, fnt, lh


def word_image(text, fnt, size, hot):
    """One word as an RGBA sprite: white (or dark on a yellow pill for numbers) with a soft shadow."""
    probe = ImageDraw.Draw(Image.new("RGB", (10, 10)))
    tw = int(probe.textlength(text, font=fnt)) + 1
    padx, pady = (18, 8) if hot else (6, 6)
    sw, sh = tw + padx * 2 + 24, int(size * 1.3) + pady * 2 + 24
    img = Image.new("RGBA", (sw, sh), (0, 0, 0, 0))
    ox, oy = 12 + padx, 12 + pady
    if hot:
        d = ImageDraw.Draw(img)
        d.rounded_rectangle((12, 12 + int(size * 0.08), 12 + tw + padx * 2, 12 + int(size * 1.18) + pady * 2), 16, fill=YELLOW + (255,))
        d.text((ox, oy), text, font=fnt, fill=(16, 18, 30))
        return img, ox, oy
    shadow = Image.new("RGBA", (sw, sh), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).text((ox, oy + 4), text, font=fnt, fill=(0, 0, 0, 200))
    shadow = shadow.filter(ImageFilter.GaussianBlur(7))
    img.alpha_composite(shadow)
    ImageDraw.Draw(img).text((ox, oy), text, font=fnt, fill=(255, 255, 255), stroke_width=2, stroke_fill=(0, 0, 0, 90))
    return img, ox, oy


class Line:
    def __init__(self, text, scene_no):
        size = 92 if scene_no == 0 else 78
        self.words, self.box, fnt, self.lh = layout_words(text, size, W - 150, TEXT_CENTER[scene_no])
        self.sprites = [word_image(w["text"], fnt, size, is_number(w["text"])) for w in self.words]
        n = len(self.words)
        self.stagger = min(0.16, 1.5 / max(1, n))
        self.last = scene_no == len(SCENES) - 2

    def done_at(self):
        return TEXT_START + self.stagger * (len(self.words) - 1) + POP

    def draw(self, f, t, scene_len):
        """t is seconds since the scene started."""
        leave = 0.0
        if not self.last:
            leave = ease_out((t - (scene_len - OUT_LEAD - CUT / 2)) / OUT_LEAD)
        for i, (w, (spr, ox, oy)) in enumerate(zip(self.words, self.sprites)):
            p = (t - TEXT_START - i * self.stagger) / POP
            if p <= 0:
                continue
            s = 0.55 + 0.45 * ease_back(p)
            a = ease_out(p * 1.6) * (1 - leave)
            if a <= 0.01:
                continue
            lift = (1 - ease_out(p)) * 46 + leave * 90
            sp = spr
            if abs(s - 1) > 0.004:
                sp = spr.resize((max(1, int(spr.size[0] * s)), max(1, int(spr.size[1] * s))), Image.BILINEAR)
            if a < 0.999:
                sp = sp.copy()
                sp.putalpha(sp.getchannel("A").point(lambda v, a=a: int(v * a)))
            cx = w["x"] - ox + spr.size[0] / 2
            cy = w["y"] - oy + spr.size[1] / 2 + lift
            f.alpha_composite(sp, (int(cx - sp.size[0] / 2), int(cy - sp.size[1] / 2)))
        if self.last:
            u = ease_out((t - self.done_at() - 0.15) / 0.6)
            if u > 0:
                x0, _, x1, y1 = self.box
                d = ImageDraw.Draw(f)
                d.rounded_rectangle((x0, y1 + 10, x0 + (x1 - x0) * u, y1 + 22), 6, fill=YELLOW + (255,))


# --- Header ------------------------------------------------------------------------------

def make_header(avatar_path):
    avatar = Image.open(os.path.join(ROOT, avatar_path)).convert("RGB")
    head = Image.new("RGBA", (W, 150), (0, 0, 0, 0))
    ring = Image.new("RGBA", (112, 112), (0, 0, 0, 0))
    ImageDraw.Draw(ring).ellipse((0, 0, 111, 111), fill=(255, 255, 255, 255))
    head.alpha_composite(ring, (60, 18))
    head.alpha_composite(circle(avatar, 100), (66, 24))
    d = ImageDraw.Draw(head)
    d.text((196, 40), NAME, font=font(FONT_BOLD, 42), fill=(255, 255, 255), stroke_width=1, stroke_fill=(0, 0, 0, 80))
    return head


def draw_progress(f, t):
    d = ImageDraw.Draw(f)
    n, gap, x0, y = len(SCENES) - 1, 12, 60, 236
    seg = (W - 2 * x0 - gap * (n - 1)) / n
    for i in range(n):
        a, b = SCENES[i], SCENES[i + 1]
        p = max(0.0, min(1.0, (t - a) / (b - a)))
        xs = x0 + i * (seg + gap)
        d.rounded_rectangle((xs, y, xs + seg, y + 7), 4, fill=(255, 255, 255, 90))
        if p > 0:
            d.rounded_rectangle((xs, y, xs + max(8, seg * p), y + 7), 4, fill=(255, 255, 255, 240))


# --- Frames ------------------------------------------------------------------------------

def frame_maker(item):
    photos = item.get("photos") or [item["photo"]] * 3
    scenes = [Scene(p, MOVES[i]) for i, p in enumerate(photos)]
    lines = [Line(text, i) for i, text in enumerate(item["lines"])]
    head = make_header(item["avatar"])
    n = len(scenes)

    def scene_frame(i, t):
        a, b = SCENES[i], SCENES[i + 1]
        local = t - a
        # A quick zoom punch at the start of every scene after the first.
        punch = 0.0 if i == 0 else 0.08 * (1 - ease_out(local / 0.6))
        f = scenes[i].at(local / (b - a), punch)
        lines[i].draw(f, local, b - a)
        return f

    def frame(t):
        i = max(k for k in range(n) if t >= SCENES[k])
        f = scene_frame(i, t)
        # Cut: the outgoing scene zooms on and fades out over the first part of the incoming one.
        if i > 0 and t - SCENES[i] < CUT:
            p = (t - SCENES[i]) / CUT
            prev = scene_frame(i - 1, t)
            f = Image.blend(prev, f, ease_out(p))
        # Header slides down at the start and stays.
        hy = int(260 - (1 - ease_out(t / 0.5)) * 60)
        hl = head
        if t < 0.5:
            hl = head.copy()
            hl.putalpha(head.getchannel("A").point(lambda v, a=ease_out(t / 0.5): int(v * a)))
        f.alpha_composite(hl, (0, hy))
        draw_progress(f, t)
        return f.convert("RGB")

    return frame


def render(item, force=False):
    d = os.path.join(OUT, item["key"])
    os.makedirs(d, exist_ok=True)
    mp4 = os.path.join(d, f"{item['lang']}.mp4")
    jpg = os.path.join(d, f"{item['lang']}.jpg")
    if not force and os.path.exists(mp4) and os.path.exists(jpg):
        return "skipped"
    frame = frame_maker(item)
    # Poster: the hook, fully on screen.
    frame(SCENES[1] - 0.8).resize((540, 960), Image.LANCZOS).save(jpg, quality=82)
    cmd = [
        "ffmpeg", "-y", "-loglevel", "error",
        "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
        "-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=44100",
        "-shortest", "-c:v", "libx264", "-preset", "veryfast", "-crf", "24", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "64k", "-movflags", "+faststart", mp4,
    ]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for k in range(FPS * SECONDS):
        p.stdin.write(frame(k / FPS).tobytes())
    p.stdin.close()
    if p.wait() != 0:
        raise RuntimeError(f"ffmpeg failed for {item['key']}/{item['lang']}")
    return "rendered"


def main():
    args = sys.argv[1:]
    force = "--force" in args
    only = args[args.index("--only") + 1] if "--only" in args else None
    lang = args[args.index("--lang") + 1] if "--lang" in args else None
    plan = json.load(open(os.path.join(HERE, "plan.json"), encoding="utf-8"))
    for it in plan["items"]:
        if only and it["key"] != only:
            continue
        if lang and it["lang"] != lang:
            continue
        print(it["key"], it["lang"], render(it, force), flush=True)


if __name__ == "__main__":
    main()
