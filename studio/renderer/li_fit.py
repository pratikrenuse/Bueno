"""Checks that every LinkedIn card's text fits its template before it is rendered.

fb_cards2.py places text at fixed positions and does not stop a long line from running
into the small print, the logo or the photo. Translations run longer than English, so this
walks the same layout maths as each template and reports any card whose text would
collide. li_cards.py refuses to render while anything is reported.

  python3 studio/renderer/li_fit.py      prints the problems and exits 1 if there are any
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fb_cards2 as fb

W = H = fb.W

def _lines(text, weight, size, maxw):
    return fb.wrap(text, fb.F(weight, size), maxw)

def problems(card):
    c = fb.normalise(card)
    t = c["template"]; out = []
    if c.get("eyebrow") and fb.tw(c["eyebrow"].upper(), fb.F("SemiBold", 22)) + 4 * len(c["eyebrow"]) > W - 140:
        out.append("eyebrow too wide")
    if t == "duotone":
        y = 420 + 40
        f = fb.fit_lines(c["headline"], "Regular", 60, W - 128)
        if f.size < 50: out.append("headline shrinks too far")
        y += len(c["headline"]) * int(f.size * 1.18) + 6
        if c.get("sub"): y += len(_lines(c["sub"], "Regular", 29, W - 128)) * int(29 * 1.4) + 8
        for it in c["items"][:3]:
            n = len(_lines(it, "Regular", 28, W - 128 - 64))
            y = max(y + 20 + 36 * n, y + 60) + 12
        if y > H - 172: out.append(f"duotone text ends at {y}, small print at {H-160}")
    elif t == "split":
        x = 470 + 56; mw = W - x - 56; y = 170 + 39
        f = fb.fit_lines(c["headline"], "Medium", 56, mw)
        if f.size < 44: out.append("headline shrinks too far")
        y += len(c["headline"]) * int(f.size * 1.16) + 34
        for it in c["items"][:3]:
            y += len(_lines(it, "Regular", 30, mw - 50)) * 40 + 34
        if y > H - 130: out.append(f"split text ends at {y}, logo at {H-110}")
    elif t == "question":
        f = fb.fit_lines(c["headline"], "Medium", 70, W - 150)
        if f.size < 52: out.append("headline shrinks too far")
        y = 210 + len(c["headline"]) * int(f.size * 1.14) + 66
        sub_end = y + len(_lines(c["sub"], "Medium", 36, 680)) * int(36 * 1.36)
        y = sub_end + 10
        for it in c.get("items", [])[:2]:
            y += 12 + len(_lines(it, "Regular", 30, 560)) * int(30 * 1.38)
        if sub_end > H - 300 - 150: out.append(f"question sub runs into the photo ({sub_end})")
        if y > H - 120: out.append(f"question text ends at {y}, logo at {H-100}")
    elif t == "pills":
        f = fb.fit_lines(c["headline"], "Regular", 58, W - 140)
        if f.size < 48: out.append("headline shrinks too far")
        y = 455 + len(c["headline"]) * int(f.size * 1.15) + 18
        for it in c["items"][:2]:
            y += 46 + 38 * len(_lines(it, "Regular", 29, 820)) + 18
        if y + 20 + 40 > H - 50: out.append(f"pills run into the logo ({y})")
    elif t == "date":
        bf = fb.fit_lines([c["big"]], "Medium", 170, W - 140, minsize=80)
        y = 190 + 40 + int(bf.size) + 10 + 34
        hl = fb.wrap(" ".join(c["headline"]), fb.F("Medium", 44), W - 140)
        y += len(hl) * int(44 * 1.2) + 8
        if c.get("sub"): y += len(_lines(c["sub"], "Regular", 31, W - 140)) * int(31 * 1.4)
        if y > H - 330 - 96 - 8: out.append(f"date text ends at {y}, photo at {H-426}")
    return out

def main():
    import json
    import li_cards
    bad = 0
    for lang in li_cards.LANGS:
        for slug, card in li_cards.load(lang).items():
            if card.get("reuse"): continue
            for p in problems(card):
                bad += 1; print(f"{lang} {slug}: {p}")
    print("fit problems:", bad)
    sys.exit(1 if bad else 0)

if __name__ == "__main__":
    main()
