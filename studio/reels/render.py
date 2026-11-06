"""Spain 24/7 Instagram reels: one short vertical video per language from one script.

Runs in the GitHub Action (.github/workflows/reels-render.yml). It asks the site for the
reel that is waiting (/api/reels?action=jobs), renders a 1080x1920 MP4 per language
with the presenter photos in studio/reels/model, a voice-over and the words on screen,
uploads each video straight to Supabase Storage through a signed URL the site hands out,
and tells the site it is done (/api/reels?action=done). The site then sends the email.

The Action signs its calls with a hash of the Supabase service key (see TOKEN below).

Local test:  python studio/reels/render.py --local spec.json out_dir
"""
import asyncio
import hashlib
import json
import math
import os
import random
import subprocess
import sys
import tempfile
import urllib.error
import urllib.request

from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
FONTS = os.path.join(ROOT, "public", "fonts")
LOGO_WHITE = os.path.join(ROOT, "public", "images", "brand", "spain247-logo-white.png")
LOGO_NAVY = os.path.join(ROOT, "public", "images", "brand", "spain247-logo-navy.png")
MODEL = os.path.join(HERE, "model")

SITE = os.environ.get("REELS_SITE", "https://www.247spain.es")
# The same hash api/_reels.js computes from the Supabase service key. The key is a GitHub
# secret already used by the Studio render workflow; only its hash is ever sent.
_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")
TOKEN = hashlib.sha256(f"{_KEY}:reels-render".encode()).hexdigest() if _KEY else ""

W, H, FPS = 1080, 1920, 30
NAVY = (1, 2, 33)
LIGHT_BLUE = (203, 239, 255)
ACCENT = (91, 127, 204)
GOLD = (201, 169, 110)
OFF_WHITE = (248, 247, 244)
WHITE = (255, 255, 255)
MUTED = (150, 156, 186)

# Instagram covers roughly the top 220 px (header) and the bottom 380 px (caption, buttons).
SAFE_TOP, SAFE_BOTTOM = 230, H - 400
MARGIN = 72

# Neural voices, all female, so the voice fits the presenter in every language.
VOICES = {
    "en": "en-GB-SoniaNeural",
    "no": "nb-NO-PernilleNeural",
    "sv": "sv-SE-SofieNeural",
    "de": "de-DE-KatjaNeural",
    "fr": "fr-FR-DeniseNeural",
    "nl": "nl-NL-FennaNeural",
}

# Words drawn by the renderer itself, so they never depend on a model's translation.
LABELS = {
    "en": {"eyebrow": "Spain property news", "meaning": "What it means for you", "source": "Source", "sponsor": "Sponsored by Bueno"},
    "no": {"eyebrow": "Eiendomsnytt fra Spania", "meaning": "Hva det betyr for deg", "source": "Kilde", "sponsor": ""},
    "sv": {"eyebrow": "Bostadsnytt från Spanien", "meaning": "Vad det betyder för dig", "source": "Källa", "sponsor": ""},
    "de": {"eyebrow": "Immobiliennews aus Spanien", "meaning": "Was das für Sie bedeutet", "source": "Quelle", "sponsor": ""},
    "fr": {"eyebrow": "Actualité immobilière en Espagne", "meaning": "Ce que cela change pour vous", "source": "Source", "sponsor": ""},
    "nl": {"eyebrow": "Vastgoednieuws uit Spanje", "meaning": "Wat het voor u betekent", "source": "Bron", "sponsor": ""},
}

_font_cache = {}


def font(weight, size):
    key = (weight, size)
    if key not in _font_cache:
        _font_cache[key] = ImageFont.truetype(os.path.join(FONTS, f"FSSiena-{weight}.otf"), size)
    return _font_cache[key]


def wrap(draw, text, fnt, width):
    lines, line = [], ""
    for word in str(text).split():
        trial = f"{line} {word}".strip()
        if draw.textlength(trial, font=fnt) <= width or not line:
            line = trial
        else:
            lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def fit(draw, text, weight, size, width, max_h, leading=1.22, min_size=34):
    """Largest font size (down from size) at which text fits the box."""
    while size >= min_size:
        f = font(weight, size)
        lines = wrap(draw, text, f, width)
        h = len(lines) * size * leading
        if h <= max_h:
            return f, lines, size
        size -= 2
    f = font(weight, min_size)
    return f, wrap(draw, text, f, width), min_size


def draw_lines(draw, xy, lines, fnt, size, fill, leading=1.22, align="left", width=None):
    x, y = xy
    for ln in lines:
        lx = x
        if align == "center" and width:
            lx = x + (width - draw.textlength(ln, font=fnt)) / 2
        draw.text((lx, y), ln, font=fnt, fill=fill)
        y += size * leading
    return y


def rounded_mask(size, radius):
    m = Image.new("L", size, 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=255)
    return m


def circle_photo(path, d):
    im = Image.open(path).convert("RGB")
    s = min(im.size)
    # Faces sit in the upper middle of every presenter photo.
    left = (im.width - s) // 2
    top = max(0, int(im.height * 0.04))
    top = min(top, im.height - s)
    im = im.crop((left, top, left + s, top + s)).resize((d, d), Image.LANCZOS)
    m = Image.new("L", (d, d), 0)
    ImageDraw.Draw(m).ellipse((0, 0, d - 1, d - 1), fill=255)
    out = Image.new("RGBA", (d, d), (0, 0, 0, 0))
    out.paste(im, (0, 0), m)
    return out


class Panel:
    """A photo in a rounded inset panel with a slow push-in (Ken Burns)."""

    def __init__(self, path, box, radius=36, zoom=0.08, focus_y=0.30):
        self.box = box
        self.w, self.h = box[2] - box[0], box[3] - box[1]
        im = Image.open(path).convert("RGB")
        # Cover-crop to the panel's aspect ratio, keeping the face (upper part) in frame.
        ar = self.w / self.h
        if im.width / im.height > ar:
            nw = int(im.height * ar)
            im = im.crop(((im.width - nw) // 2, 0, (im.width - nw) // 2 + nw, im.height))
        else:
            nh = int(im.width / ar)
            top = int((im.height - nh) * focus_y)
            im = im.crop((0, top, im.width, top + nh))
        # Work at panel size plus the zoom margin, never smaller than the source allows.
        self.src = im.resize((int(self.w * (1 + zoom)), int(self.h * (1 + zoom))), Image.LANCZOS)
        self.zoom = zoom
        self.mask = rounded_mask((self.w, self.h), radius)

    def frame(self, t):
        z = 1 + self.zoom * (1 - t)  # starts wide-ish, ends close
        cw, ch = self.src.width / z, self.src.height / z
        cx, cy = self.src.width / 2, self.src.height * 0.45
        x0, y0 = max(0, cx - cw / 2), max(0, cy - ch / 2)
        x0 = min(x0, self.src.width - cw)
        y0 = min(y0, self.src.height - ch)
        return self.src.resize((self.w, self.h), Image.BILINEAR, box=(x0, y0, x0 + cw, y0 + ch))

    def paste(self, base, t):
        base.paste(self.frame(t), self.box[:2], self.mask)


def ease(x):
    x = max(0.0, min(1.0, x))
    return 1 - (1 - x) ** 3


class Scene:
    """One scene: a static background, an optional moving photo, a text layer that slides in."""

    def __init__(self, bg, text_layer, panel=None, extras=()):
        self.bg = bg
        self.text = text_layer
        self.panel = panel
        self.extras = extras

    def render(self, t, local_s):
        frame = self.bg.copy()
        if self.panel:
            self.panel.paste(frame, t)
        for im, xy in self.extras:
            frame.paste(im, xy, im)
        a = ease(local_s / 0.55)
        if a > 0:
            layer = self.text
            if a < 1:
                layer = layer.copy()
                alpha = layer.getchannel("A").point(lambda v: int(v * a))
                layer.putalpha(alpha)
            dy = int(36 * (1 - a))
            frame.paste(layer, (0, dy), layer)
        return frame


def progress(frame, frac):
    d = ImageDraw.Draw(frame)
    d.rectangle((0, 0, W, 8), fill=(30, 32, 60))
    d.rectangle((0, 0, int(W * frac), 8), fill=GOLD)


# ---------- layouts ----------

def layout_hook(lang, sc, photo):
    L = LABELS[lang]
    bg = Image.new("RGB", (W, H), NAVY)
    panel = Panel(photo, (MARGIN, SAFE_TOP, W - MARGIN, 1110))
    txt = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(txt)
    y = 1160
    d.rectangle((MARGIN, y + 12, MARGIN + 54, y + 16), fill=GOLD)
    d.text((MARGIN + 74, y - 6), L["eyebrow"].upper(), font=font("SemiBold", 30), fill=GOLD)
    f, lines, size = fit(d, sc["text"], "Bold", 78, W - 2 * MARGIN, SAFE_BOTTOM - (y + 60))
    draw_lines(d, (MARGIN, y + 60), lines, f, size, WHITE, leading=1.15)
    return Scene(bg, txt, panel)


def layout_fact_a(lang, sc, photo):
    bg = Image.new("RGB", (W, H), OFF_WHITE)
    avatar = circle_photo(photo, 180)
    txt = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(txt)
    d.text((MARGIN + 210, SAFE_TOP + 52), "Spain 24/7", font=font("Bold", 42), fill=NAVY)
    d.text((MARGIN + 210, SAFE_TOP + 104), LABELS[lang]["eyebrow"], font=font("Regular", 30), fill=ACCENT)
    y = SAFE_TOP + 300
    big = (sc.get("big") or "").strip()
    if big:
        bf, blines, bsize = fit(d, big, "Bold", 230, W - 2 * MARGIN, 300, leading=1.0, min_size=110)
        y = draw_lines(d, (MARGIN, y), blines[:1], bf, bsize, NAVY, leading=1.05)
        d.rectangle((MARGIN, y + 20, MARGIN + 140, y + 30), fill=GOLD)
        y += 80
    f, lines, size = fit(d, sc["text"], "Medium", 74, W - 2 * MARGIN, SAFE_BOTTOM - y)
    draw_lines(d, (MARGIN, y), lines, f, size, NAVY)
    return Scene(bg, txt, None, extras=[(avatar, (MARGIN, SAFE_TOP))])


def layout_fact_b(lang, sc, photo):
    bg = Image.new("RGB", (W, H), LIGHT_BLUE)
    panel = Panel(photo, (500, SAFE_TOP, W - MARGIN, 1000), focus_y=0.1, zoom=0.06)
    txt = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(txt)
    d.text((MARGIN, SAFE_TOP + 4), "Spain 24/7", font=font("Bold", 40), fill=NAVY)
    ef, elines, esize = fit(d, LABELS[lang]["eyebrow"], "Regular", 30, 380, 120, min_size=24)
    draw_lines(d, (MARGIN, SAFE_TOP + 58), elines, ef, esize, ACCENT)
    big = (sc.get("big") or "").strip()
    if big:
        bf, blines, bsize = fit(d, big, "Bold", 150, 390, 420, leading=1.0, min_size=70)
        yb = 1000 - len(blines) * bsize * 1.02
        draw_lines(d, (MARGIN, yb), blines, bf, bsize, NAVY, leading=1.02)
    d.rectangle((MARGIN, 1040, MARGIN + 140, 1050), fill=GOLD)
    y = 1090
    f, lines, size = fit(d, sc["text"], "Medium", 66, W - 2 * MARGIN, SAFE_BOTTOM - y)
    draw_lines(d, (MARGIN, y), lines, f, size, NAVY)
    return Scene(bg, txt, panel)


def layout_meaning(lang, sc, photo):
    bg = Image.new("RGB", (W, H), NAVY)
    panel = Panel(photo, (MARGIN + 260, SAFE_TOP, W - MARGIN, 900), focus_y=0.2)
    bd = ImageDraw.Draw(bg)
    bd.rectangle((MARGIN, SAFE_TOP, MARGIN + 10, 900), fill=GOLD)
    txt = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(txt)
    lf, llines, lsize = fit(d, LABELS[lang]["meaning"], "Bold", 52, 200, 640, leading=1.15, min_size=30)
    draw_lines(d, (MARGIN + 36, SAFE_TOP + 10), llines, lf, lsize, GOLD, leading=1.15)
    y = 980
    f, lines, size = fit(d, sc["text"], "Medium", 72, W - 2 * MARGIN, SAFE_BOTTOM - y)
    draw_lines(d, (MARGIN, y), lines, f, size, WHITE)
    return Scene(bg, txt, panel)


def layout_outro(lang, sc, photo, source):
    L = LABELS[lang]
    bg = Image.new("RGB", (W, H), NAVY)
    avatar = circle_photo(photo, 300)
    txt = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(txt)
    logo = Image.open(LOGO_WHITE).convert("RGBA")
    lw = 560
    logo = logo.resize((lw, int(logo.height * lw / logo.width)), Image.LANCZOS)
    y = SAFE_TOP + 420
    txt.paste(logo, ((W - lw) // 2, y), logo)
    y += logo.height + 70
    f, lines, size = fit(d, sc["text"], "Medium", 64, W - 2 * MARGIN, 420)
    y = draw_lines(d, (MARGIN, y), lines, f, size, WHITE, align="center", width=W - 2 * MARGIN)
    y += 40
    url = "247spain.es"
    uf = font("Bold", 48)
    d.text(((W - d.textlength(url, font=uf)) / 2, y), url, font=uf, fill=GOLD)
    y += 80
    small = font("Regular", 28)
    for line in [f"{L['source']}: {source}" if source else "", L["sponsor"]]:
        if line:
            d.text(((W - d.textlength(line, font=small)) / 2, y), line, font=small, fill=MUTED)
            y += 44
    return Scene(bg, txt, None, extras=[(avatar, ((W - 300) // 2, SAFE_TOP + 60))])


# ---------- audio ----------

def probe_duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                         capture_output=True, text=True)
    try:
        return float(out.stdout.strip())
    except ValueError:
        return 0.0


async def _tts(text, voice, path):
    import edge_tts  # installed by the workflow
    await edge_tts.Communicate(text, voice, rate="+4%").save(path)


def tts(text, lang, path):
    """Returns the clip's length in seconds, or 0 when no voice could be made."""
    try:
        asyncio.run(_tts(text, VOICES[lang], path))
        d = probe_duration(path)
        return d if d > 0.3 else 0.0
    except Exception as e:  # no network, rate limit, missing package: the video goes out silent
        print(f"  voice failed for {lang}: {e}")
        return 0.0


def estimate(text):
    words = len(str(text).split())
    return max(2.6, words / 2.5)


# ---------- one video ----------

def render_video(spec, out_path, cover_path=None, seed=0):
    lang = spec["lang"]
    scenes = spec["scenes"]
    rnd = random.Random(seed)
    portraits = sorted(f for f in os.listdir(MODEL) if f.startswith("portrait_"))
    scenic = ["laptop.jpg", "presenting.jpg", "seaside.jpg", "cafe.jpg", "collage_main.jpg"]
    rnd.shuffle(portraits)
    rnd.shuffle(scenic)
    work = tempfile.mkdtemp(prefix=f"reel_{lang}_")

    # Voice first, because each scene lasts as long as its sentence plus a short pause.
    voiced = True
    clips, durs = [], []
    for i, sc in enumerate(scenes):
        p = os.path.join(work, f"v{i}.mp3")
        d = tts(sc["text"], lang, p) if voiced else 0.0
        if d == 0.0:
            voiced = False
        clips.append(p)
        durs.append(d)
    if not voiced:
        durs = [estimate(sc["text"]) for sc in scenes]
    pads = [0.55 if i < len(scenes) - 1 else 1.4 for i in range(len(scenes))]
    lens = [d + p for d, p in zip(durs, pads)]
    total = sum(lens)

    built = []
    fact_n = 0
    for i, sc in enumerate(scenes):
        k = sc.get("kind")
        if k == "hook":
            built.append(layout_hook(lang, sc, os.path.join(MODEL, portraits[0])))
        elif k == "fact":
            fn = layout_fact_a if fact_n % 2 == 0 else layout_fact_b
            photo = portraits[(fact_n + 1) % len(portraits)] if fn is layout_fact_a else scenic[fact_n % len(scenic)]
            built.append(fn(lang, sc, os.path.join(MODEL, photo)))
            fact_n += 1
        elif k == "meaning":
            built.append(layout_meaning(lang, sc, os.path.join(MODEL, scenic[-1])))
        else:
            built.append(layout_outro(lang, sc, os.path.join(MODEL, portraits[-1]), spec.get("source", "")))

    silent = os.path.join(work, "video.mp4")
    ff = subprocess.Popen([
        "ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
        "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "veryfast", "-crf", "24",
        "-maxrate", "2400k", "-bufsize", "4800k", "-pix_fmt", "yuv420p", silent,
    ], stdin=subprocess.PIPE)
    elapsed = 0.0
    for idx, (scene, ln) in enumerate(zip(built, lens)):
        n = int(round(ln * FPS))
        for f in range(n):
            local = f / FPS
            frame = scene.render(f / max(1, n - 1), local)
            progress(frame, (elapsed + local) / total)
            if cover_path and idx == 0 and f == int(1.2 * FPS):
                frame.save(cover_path, quality=88)
            ff.stdin.write(frame.tobytes())
        elapsed += ln
    ff.stdin.close()
    if ff.wait() != 0:
        raise RuntimeError("ffmpeg failed while encoding frames")

    if voiced:
        parts = []
        for i, (c, ln) in enumerate(zip(clips, lens)):
            w = os.path.join(work, f"a{i}.wav")
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", c, "-af", f"apad=whole_dur={ln:.3f}",
                            "-t", f"{ln:.3f}", "-ar", "44100", "-ac", "2", w], check=True)
            parts.append(w)
        lst = os.path.join(work, "list.txt")
        with open(lst, "w") as fh:
            fh.write("".join(f"file '{p}'\n" for p in parts))
        audio = os.path.join(work, "voice.wav")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", audio], check=True)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", silent, "-i", audio, "-c:v", "copy", "-c:a", "aac",
                        "-b:a", "128k", "-shortest", "-movflags", "+faststart", out_path], check=True)
    else:
        # Instagram treats a video with no audio track oddly, so a silent track goes in.
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", silent, "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo",
                        "-c:v", "copy", "-c:a", "aac", "-shortest", "-movflags", "+faststart", out_path], check=True)
    return {"seconds": round(total, 1), "voiced": voiced, "bytes": os.path.getsize(out_path)}


# ---------- the site ----------

def call(action, payload=None, method="POST"):
    url = f"{SITE}/api/reels?action={action}"
    data = json.dumps(payload or {}).encode() if method == "POST" else None
    req = urllib.request.Request(url, data=data, method=method, headers={
        "x-reels-token": TOKEN, "Content-Type": "application/json", "User-Agent": "spain247-reels-render",
    })
    try:
        with urllib.request.urlopen(req, timeout=90) as r:
            return json.loads(r.read().decode() or "{}")
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"{action}: HTTP {e.code} {e.read().decode(errors='replace')[:400]}") from None


def put_file(upload_url, path, ctype):
    with open(path, "rb") as fh:
        body = fh.read()
    req = urllib.request.Request(upload_url, data=body, method="PUT", headers={"Content-Type": ctype, "x-upsert": "true"})
    with urllib.request.urlopen(req, timeout=180) as r:
        r.read()


def run():
    if not TOKEN:
        sys.exit("SUPABASE_SERVICE_KEY is not set (GitHub secret)")
    # The site writes today's script (and translates it) when the Action asks, so one
    # schedule drives everything and the site needs no extra cron.
    # A script that fails the code checks is simply written again, up to three times.
    for attempt in range(3):
        try:
            out = call("plan")
            print("plan", json.dumps(out)[:400])
            break
        except Exception as e:
            print(f"plan attempt {attempt + 1} failed: {e}")
    try:
        print("translate", json.dumps(call("translate"))[:600])
    except Exception as e:
        print(f"translate failed: {e}")
    jobs = call("jobs", method="GET").get("jobs", [])
    print(f"{len(jobs)} reel(s) to render")
    for job in jobs:
        rid = job["id"]
        videos, errors, meta = {}, {}, {}
        for lang, spec in job["scripts"].items():
            try:
                out = os.path.join(tempfile.gettempdir(), f"{rid}_{lang}.mp4")
                cover = os.path.join(tempfile.gettempdir(), f"{rid}_{lang}.jpg")
                info = render_video({**spec, "lang": lang}, out, cover, seed=hash(rid) & 0xffff)
                print(f"  {lang}: {info}")
                for path, kind, ctype in ((out, "mp4", "video/mp4"), (cover, "jpg", "image/jpeg")):
                    signed = call("upload-url", {"id": rid, "lang": lang, "kind": kind})
                    put_file(signed["upload_url"], path, ctype)
                    videos.setdefault(lang, {})[kind] = signed["public_url"]
                meta[lang] = info
            except Exception as e:
                errors[lang] = str(e)[:300]
                print(f"  {lang} failed: {e}")
        print("done", json.dumps(call("done", {"id": rid, "videos": videos, "meta": meta, "errors": errors}))[:400])


if __name__ == "__main__":
    if len(sys.argv) >= 4 and sys.argv[1] == "--local":
        spec = json.load(open(sys.argv[2]))
        os.makedirs(sys.argv[3], exist_ok=True)
        for lang, s in spec["scripts"].items():
            o = os.path.join(sys.argv[3], f"{lang}.mp4")
            print(lang, render_video({**s, "lang": lang}, o, os.path.join(sys.argv[3], f"{lang}.jpg")))
    else:
        run()
