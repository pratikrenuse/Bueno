"""Reel templates for the Maria Lopez profiles (English drafts for approval, Day 2 onwards).

Four looks, all silent-friendly (the words carry the video), 1080x1920, persona photos only:

  captions  Hormozi-style: the sentence builds word by word in huge heavy caps, the word being
            "said" lights up yellow and punches in, photo cuts every sentence with a flash.
  data      Hook, then a full-screen data card: the key numbers count up and bars grow,
            then the takeaway. Built for posts with a surprising number.
  notes     A phone-notes style card over her photo, typed out line by line with a cursor,
            like she is writing it for you. Most personal of the four.
  myth      "Most people think this." crossed out, then what the data says, then what she
            would do. Strong pattern break.

    python3 studio/personas/templates.py captions data notes myth
"""
import os
import re
import subprocess
import sys

from PIL import Image, ImageDraw, ImageFilter, ImageFont

import render_reels as rr
from render_reels import W, H, FPS, ROOT, ease_out, ease_back, ease_in_out

HERE = os.path.dirname(os.path.abspath(__file__))
F900 = os.path.join(HERE, "fonts", "Inter-900.ttf")
F800 = os.path.join(HERE, "fonts", "Inter-800.ttf")
F700 = os.path.join(HERE, "fonts", "Inter-700.ttf")
F500 = os.path.join(HERE, "fonts", "Inter-500.ttf")
YELLOW = (255, 221, 0)
GREEN = (52, 211, 120)
RED = (255, 77, 77)
INK = (18, 20, 30)
_fonts = {}


def font(path, size):
    k = (path, size)
    if k not in _fonts:
        _fonts[k] = ImageFont.truetype(path, size)
    return _fonts[k]


def hot(word):
    return bool(re.search(r"\d", word))


def alpha(img, a):
    if a >= 0.999:
        return img
    img = img.copy()
    img.putalpha(img.getchannel("A").point(lambda v: int(v * a)))
    return img


def paste_center(f, spr, cx, cy, scale=1.0, a=1.0):
    if a <= 0.01:
        return
    if abs(scale - 1) > 0.004:
        spr = spr.resize((max(1, int(spr.size[0] * scale)), max(1, int(spr.size[1] * scale))), Image.BILINEAR)
    spr = alpha(spr, a)
    f.alpha_composite(spr, (int(cx - spr.size[0] / 2), int(cy - spr.size[1] / 2)))


def text_sprite(text, fnt, fill, stroke=0, stroke_fill=(0, 0, 0), shadow=True, pad=24):
    probe = ImageDraw.Draw(Image.new("RGB", (4, 4)))
    l, t, r, b = probe.textbbox((0, 0), text, font=fnt, stroke_width=stroke)
    w, h = r - l + pad * 2, b - t + pad * 2
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    if shadow:
        sh = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        ImageDraw.Draw(sh).text((pad - l, pad - t + 6), text, font=fnt, fill=(0, 0, 0, 170), stroke_width=stroke, stroke_fill=(0, 0, 0, 170))
        img.alpha_composite(sh.filter(ImageFilter.GaussianBlur(9)))
    ImageDraw.Draw(img).text((pad - l, pad - t), text, font=fnt, fill=fill, stroke_width=stroke, stroke_fill=stroke_fill)
    return img


def wrap_tokens(tokens, fnt, maxw, extra=0):
    probe = ImageDraw.Draw(Image.new("RGB", (4, 4)))
    space = probe.textlength(" ", font=fnt) + extra
    rows, cur, cw = [], [], 0
    for t in tokens:
        tw = probe.textlength(t, font=fnt)
        if cur and cw + space + tw > maxw:
            rows.append(cur)
            cur, cw = [], 0
        cw += (space if cur else 0) + tw
        cur.append(t)
    if cur:
        rows.append(cur)
    return rows, space


class Bg:
    """Persona photos that keep moving, with cuts."""

    def __init__(self, photos):
        self.scenes = [rr.Scene(p, rr.MOVES[i % 3]) for i, p in enumerate(photos)]
        self.blurred = {}

    def at(self, i, p, punch=0.0, blur=0):
        f = self.scenes[i % len(self.scenes)].at(p, punch)
        if blur:
            small = f.resize((W // 4, H // 4), Image.BILINEAR).filter(ImageFilter.GaussianBlur(blur // 4))
            f = small.resize((W, H), Image.BILINEAR)
            f = Image.alpha_composite(f, Image.new("RGBA", (W, H), (8, 10, 20, 120)))
        return f


def chrome(f, t, total, head):
    """No name, profile picture or progress bar on the video (Pratik, 18 Nov 2026)."""
    return None


def flash(f, since_cut):
    if 0 <= since_cut < 0.12:
        a = int(170 * (1 - since_cut / 0.12))
        f.alpha_composite(Image.new("RGBA", (W, H), (255, 255, 255, a)))


def encode(frame, seconds, out):
    os.makedirs(os.path.dirname(out), exist_ok=True)
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
           "-r", str(FPS), "-i", "-", "-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=44100",
           "-shortest", "-c:v", "libx264", "-preset", "veryfast", "-crf", "22", "-pix_fmt", "yuv420p",
           "-c:a", "aac", "-b:a", "64k", "-movflags", "+faststart", out]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for k in range(int(FPS * seconds)):
        p.stdin.write(frame(k / FPS).convert("RGB").tobytes())
    p.stdin.close()
    if p.wait():
        raise RuntimeError("ffmpeg failed")


# --- 1. captions (Hormozi style) --------------------------------------------------------

def captions(post):
    """post: {photos, avatar, sentences: [str]}"""
    bg, head = Bg(post["photos"]), rr.make_header(post["avatar"])
    size = 104
    fnt = font(F900, size)
    blocks, t = [], 0.3
    for s in post["sentences"]:
        words = s.upper().split()
        rows, space = wrap_tokens(words, fnt, W - 140)
        lh = int(size * 1.12)
        top = 1180 - lh * len(rows) // 2
        probe = ImageDraw.Draw(Image.new("RGB", (4, 4)))
        items = []
        for r, row in enumerate(rows):
            rw = sum(probe.textlength(w, font=fnt) for w in row) + space * (len(row) - 1)
            x = (W - rw) / 2
            for w in row:
                ww = probe.textlength(w, font=fnt)
                items.append({"w": w, "cx": x + ww / 2, "cy": top + r * lh + lh / 2,
                              "white": text_sprite(w, fnt, (255, 255, 255), 9, (0, 0, 0)),
                              "lit": text_sprite(w, fnt, YELLOW if not hot(w) else GREEN, 9, (0, 0, 0))})
                x += ww + space
        per = 0.30
        dur = 0.25 + per * len(items) + 1.0
        blocks.append({"start": t, "end": t + dur, "items": items, "per": per})
        t += dur
    total = t + 0.2

    def frame(tt):
        bi = max([i for i, b in enumerate(blocks) if tt >= b["start"]] or [0])
        b = blocks[bi]
        local = tt - b["start"]
        f = bg.at(bi, min(1, max(0, local / (b["end"] - b["start"]))), punch=0.1 * (1 - ease_out(local / 0.35)) if bi else 0)
        for i, it in enumerate(b["items"]):
            p = (local - 0.15 - i * b["per"]) / 0.16
            if p <= 0:
                continue
            speaking = 0 <= local - 0.15 - i * b["per"] < b["per"]
            s = 1.0 + 0.22 * (1 - ease_out(p)) + (0.06 if speaking else 0)
            dy = 0
            if hot(it["w"]) and 0 < local - 0.15 - i * b["per"] < 0.3:
                dy = 7 * ((-1) ** int(tt * 40))
            paste_center(f, it["lit"] if speaking or hot(it["w"]) else it["white"], it["cx"], it["cy"] + dy, s, ease_out(p * 2))
        flash(f, local if bi else -1)
        chrome(f, tt, total, head)
        return f
    return frame, total


# --- 2. data card ----------------------------------------------------------------------

def data(post):
    """post: {photos, avatar, hook, stats: [(label, value, unit, decimals, note, colour)], takeaway, outro}"""
    bg, head = Bg(post["photos"]), rr.make_header(post["avatar"])
    hook = rr.Line(post["hook"], 0)
    take = rr.Line(post["takeaway"], 1)
    outro = rr.Line(post["outro"], 2)
    T = [0, 3.0, 9.4, 12.4, 15.2]
    lab_f, val_f, note_f = font(F700, 42), font(F900, 128), font(F700, 38)

    def card(f, local):
        a = ease_out(local / 0.4)
        y0 = 560 + int((1 - a) * 80)
        d = ImageDraw.Draw(f)
        panel = Image.new("RGBA", (W - 120, 900), (0, 0, 0, 0))
        ImageDraw.Draw(panel).rounded_rectangle((0, 0, W - 121, 899), 44, fill=(255, 255, 255, 245))
        f.alpha_composite(alpha(panel, a), (60, y0))
        for k, (label, val, unit, dec, note, col) in enumerate(post["stats"]):
            st = 0.5 + k * 2.6
            p = ease_out((local - st) / 1.4)
            if local < st:
                continue
            yy = y0 + 60 + k * 420
            d.text((120, yy), label, font=lab_f, fill=(90, 94, 110))
            v = val * p
            txt = f"{v:,.{dec}f}".replace(",", " ") if dec == 0 else f"{v:.{dec}f}"
            if val < 0:
                txt = txt.replace("-", "−")
            d.text((116, yy + 56), txt + unit, font=val_f, fill=col)
            # bar
            bw = (W - 240) * p * (0.35 if val < 0 else 1.0)
            d.rounded_rectangle((120, yy + 220, W - 120, yy + 244), 12, fill=(234, 236, 242))
            d.rounded_rectangle((120, yy + 220, 120 + max(24, bw), yy + 244), 12, fill=col)
            if local > st + 1.3:
                na = ease_out((local - st - 1.3) / 0.4)
                nw = d.textlength(note, font=note_f) + 44
                pill = Image.new("RGBA", (int(nw), 66), (0, 0, 0, 0))
                ImageDraw.Draw(pill).rounded_rectangle((0, 0, int(nw) - 1, 65), 33, fill=YELLOW + (255,))
                ImageDraw.Draw(pill).text((22, 11), note, font=note_f, fill=INK)
                f.alpha_composite(alpha(pill, na), (120, yy + 274))

    def frame(t):
        i = max(k for k in range(4) if t >= T[k])
        local = t - T[i]
        p = local / (T[i + 1] - T[i])
        if i == 0:
            f = bg.at(0, p)
            hook.draw(f, local, T[1] - T[0])
        elif i == 1:
            f = bg.at(1, p, blur=40)
            card(f, local)
        elif i == 2:
            f = bg.at(2, p, punch=0.08 * (1 - ease_out(local / 0.5)))
            take.draw(f, local, T[3] - T[2])
        else:
            f = bg.at(3, p, punch=0.08 * (1 - ease_out(local / 0.5)))
            outro.draw(f, local, T[4] - T[3])
        if i:
            flash(f, local)
        chrome(f, t, T[-1], head)
        return f
    return frame, T[-1]


# --- 3. notes card ---------------------------------------------------------------------

def notes(post):
    """post: {photos, avatar, title, lines: [str], sign}"""
    bg, head = Bg(post["photos"]), rr.make_header(post["avatar"])
    tf, lf = font(F800, 54), font(F500, 44)
    maxw = W - 120 - 120
    probe = ImageDraw.Draw(Image.new("RGB", (4, 4)))

    def wrap(text, fnt):
        rows, _ = wrap_tokens(text.split(), fnt, maxw)
        return [" ".join(r) for r in rows]

    title_rows = wrap(post["title"], tf)
    blocks = [wrap(l, lf) for l in post["lines"]] + [wrap(post["sign"], lf)]
    cps = 34.0  # characters per second
    t, sched = 0.9, []
    for bi, rows in enumerate(blocks):
        for r in rows:
            sched.append((t, bi, r))
            t += len(r) / cps + 0.05
        t += 0.55
    total = t + 1.6
    card_h = 70 + len(title_rows) * 70 + 20 + sum(len(b) * 60 + 26 for b in blocks) + 40
    top = max(330, 1500 - card_h)

    def frame(tt):
        cut = 0 if tt < total * 0.45 else 1
        f = bg.at(cut, (tt if not cut else tt - total * 0.45) / (total * 0.55))
        if cut:
            flash(f, tt - total * 0.45)
        a = ease_out((tt - 0.2) / 0.5)
        y = top + int((1 - a) * 120)
        panel = Image.new("RGBA", (W - 120, card_h), (0, 0, 0, 0))
        pd = ImageDraw.Draw(panel)
        pd.rounded_rectangle((0, 0, W - 121, card_h - 1), 40, fill=(255, 252, 242, 250))
        pd.rounded_rectangle((0, 0, W - 121, 16), 8, fill=(255, 205, 60, 255))
        f.alpha_composite(alpha(panel, a), (60, y))
        if a < 0.3:
            return chrome(f, tt, total, head) or f
        d = ImageDraw.Draw(f)
        yy = y + 60
        for r in title_rows:
            d.text((120, yy), r, font=tf, fill=INK)
            yy += 70
        yy += 20
        cursor, last = None, None
        line_y = {}
        cy = yy
        for bi, rows in enumerate(blocks):
            for r in rows:
                line_y.setdefault(bi, []).append(cy)
                cy += 60
            cy += 26
        idx = {}
        for (st, bi, r) in sched:
            k = idx.get(bi, 0)
            idx[bi] = k + 1
            if tt < st:
                continue
            n = min(len(r), int((tt - st) * cps))
            shown = r[:n]
            yrow = line_y[bi][k]
            col = (60, 62, 76) if bi < len(blocks) - 1 else (150, 120, 40)
            x = 120
            # numbers bold
            for part in re.split(r"(\S*\d\S*)", shown):
                if not part:
                    continue
                fn = font(F800, 44) if hot(part) else lf
                d.text((x, yrow), part, font=fn, fill=INK if hot(part) else col)
                x += d.textlength(part, font=fn)
            if n < len(r) and cursor is None:
                cursor = (x + 4, yrow)
            last = (x + 4, yrow)
        if cursor is None:
            cursor = last
        if cursor and int(tt * 2.4) % 2 == 0:
            d.rectangle((cursor[0], cursor[1] + 4, cursor[0] + 5, cursor[1] + 54), fill=(255, 170, 0))
        chrome(f, tt, total, head)
        return f
    return frame, total


# --- 4. myth vs reality ----------------------------------------------------------------

def myth(post):
    """post: {photos, avatar, parts: [(label, colour, [lines]), ...], strike_first}"""
    bg, head = Bg(post["photos"]), rr.make_header(post["avatar"])
    lab_f = font(F800, 46)
    big = font(F900, 92)
    parts = []
    t = 0.0
    for k, (label, col, lines) in enumerate(post["parts"]):
        sprs = []
        for ln in lines:
            rows, _ = wrap_tokens(ln.split(), big, W - 160)
            sprs.append([text_sprite(" ".join(r), big, (255, 255, 255), 6, (0, 0, 0)) for r in rows])
        dur = 1.0 + 1.5 * len(lines) + (1.4 if k == 0 else 0.9)
        parts.append({"start": t, "end": t + dur, "label": label, "col": col, "lines": sprs})
        t += dur
    total = t

    def frame(tt):
        i = max(k for k, p in enumerate(parts) if tt >= p["start"])
        P = parts[i]
        local = tt - P["start"]
        f = bg.at(i, local / (P["end"] - P["start"]), punch=0.1 * (1 - ease_out(local / 0.4)) if i else 0)
        d = ImageDraw.Draw(f)
        # label pill slides in from the left
        la = ease_out(local / 0.35)
        lw = int(d.textlength(P["label"], font=lab_f) + 60)
        pill = Image.new("RGBA", (lw, 84), (0, 0, 0, 0))
        ImageDraw.Draw(pill).rounded_rectangle((0, 0, lw - 1, 83), 42, fill=P["col"] + (255,))
        ImageDraw.Draw(pill).text((30, 14), P["label"], font=lab_f, fill=INK if P["col"] != RED else (255, 255, 255))
        f.alpha_composite(alpha(pill, la), (int((W - lw) / 2 - (1 - la) * 300), 900))
        y = 1030
        for j, rows in enumerate(P["lines"]):
            st = 0.45 + j * 1.5
            p = (local - st) / 0.35
            for r in rows:
                if p > 0:
                    paste_center(f, r, W / 2, y + r.size[1] / 2 - 24, 1 + 0.25 * (1 - ease_back(p)), ease_out(p * 1.5))
                y += r.size[1] - 34
            y += 26
            if i == 0 and post.get("strike_first") and j == len(P["lines"]) - 1:
                sp = ease_out((local - st - 0.9) / 0.35)
                if sp > 0:
                    x0 = 110
                    yy = 1030 + (y - 1030) / 2 - 20
                    d.rounded_rectangle((x0, yy - 8, x0 + (W - 2 * x0) * sp, yy + 8), 8, fill=RED + (255,))
        if i:
            flash(f, local)
        chrome(f, tt, total, head)
        return f
    return frame, total


DAY2 = {
    "avatar": "public/ig-setup/EN_Spain24x7.jpg",
    "photos": ["Claude outputs/Maria NE Lopez/model_07.jpg", "Claude outputs/Maria NE Lopez/model_20.jpg",
               "Claude outputs/Maria NE Lopez/model_02.jpg", "Claude outputs/Maria NE Lopez/model_10.jpg",
               "Claude outputs/Maria NE Lopez/model_23.jpg"],
}

POSTS = {
    "captions": dict(DAY2, sentences=[
        "Everyone keeps asking me if prices are about to drop.",
        "Sales just fell 13.4% in one month.",
        "Prices still hit a record of 2,955 euros per square metre.",
        "Here is what that means for you.",
    ]),
    "data": dict(DAY2,
        hook="Everyone keeps asking me if prices are about to drop.",
        stats=[("Home sales in September, year on year", -13.4, "%", 1, "The biggest fall since May 2024", RED),
               ("Price per square metre in October", 2955, " €", 0, "A new record, up 11.2% in a year", GREEN)],
        takeaway="Fewer sales does not mean cheaper homes.",
        outro="So should you wait? My honest take is in the caption."),
    "notes": dict(DAY2,
        title="What I tell friends who ask if Spanish prices will drop",
        lines=["Sales fell 13.4% in September, the biggest drop since May 2024.",
               "Prices still hit a record: 2,955 euros per square metre.",
               "Fewer sales does not mean cheaper homes.",
               "Valuers don't see prices settling before 2028."],
        sign="Maria"),
    "myth": dict(DAY2, strike_first=True, parts=[
        ("Most people think this", (255, 255, 255), ["Prices are about to drop."]),
        ("Here is what the data says", YELLOW, ["Sales fell 13.4% in September.", "Prices hit a record anyway."]),
        ("Here is what I would do", GREEN, ["Stop waiting for a crash.", "Negotiate the details instead."]),
    ]),
}

TEMPLATES = {"captions": captions, "data": data, "notes": notes, "myth": myth}

if __name__ == "__main__":
    for name in sys.argv[1:] or list(TEMPLATES):
        frame, total = TEMPLATES[name](POSTS[name])
        out = os.path.join("/mnt/user-data/outputs/templates", f"Day2_English_{name}.mp4")
        encode(frame, total, out)
        frame(total * 0.6).convert("RGB").resize((540, 960)).save(out.replace(".mp4", ".jpg"), quality=85)
        print(name, round(total, 1), "s", flush=True)
