#!/usr/bin/env python3
"""
Bueno guide renderer.

Turns one guide spec (JSON) into a branded A4 PDF per language, in the exact visual language
of the Non-resident Property Tax guide (Sep 2026): navy cover with photo, FS Siena, gold
eyebrow rules, light-blue tags, navy logo footer, support-photo CTA page and navy back cover.

Usage:
  python3 studio/guides/render.py studio/guides/specs/<slug>.json            # all languages
  python3 studio/guides/render.py studio/guides/specs/<slug>.json --lang en  # one language
Output: public/newsletter-guides/Bueno-Guide-<File>-<LANG>.pdf (HTML previews in studio/guides/out/)

The spec holds every string per language: {"en": "...", "no": "...", "sv": "..."}.
A plain string is used for every language (numbers, euro amounts).
Every page is checked for overflow; the render fails loudly if any page spills.
"""
import json, sys, html, base64, pathlib, argparse

ROOT = pathlib.Path(__file__).resolve().parent
ASSETS = ROOT / 'assets'
OUT = ROOT / 'out'                                   # HTML previews (not committed)
PDF_OUT = ROOT.parent.parent / 'public' / 'newsletter-guides'  # served at www.247spain.es/newsletter-guides/

def data_uri(p, mime):
    return f"data:{mime};base64,{base64.b64encode(pathlib.Path(p).read_bytes()).decode()}"

FONT_FACES = ''.join(
    f"@font-face{{font-family:'FS Siena';src:url('{data_uri(ASSETS/'fonts'/f'FSSiena-{w}.otf','font/otf')}') format('opentype');font-weight:{n};}}"
    for w, n in [('Light', 300), ('Regular', 400), ('Medium', 500), ('SemiBold', 600)]
)

_img_cache = {}
def photo(name):
    if name not in _img_cache:
        _img_cache[name] = data_uri(ASSETS / 'photos' / f'{name}.jpg', 'image/jpeg')
    return _img_cache[name]

LOGO_WHITE = data_uri(ASSETS / 'logo-white.png', 'image/png')
LOGO_NAVY = data_uri(ASSETS / 'logo-navy.png', 'image/png')

# Fixed strings that are part of the brand shell, not of any one guide.
SHELL = {
    'back': {
        'en': 'One platform for your home in Spain. Your account, insurance, energy, tax filing and currency exchange, with a team that speaks your language.',
        'no': 'Én plattform for boligen din i Spania. Konto, forsikring, strøm, skattemelding og valutaveksling, med et team som snakker ditt språk.',
        'sv': 'En plattform för ditt hem i Spanien. Konto, försäkring, el, skattedeklaration och valutaväxling, med ett team som talar ditt språk.',
    },
    'disclaimer': {
        'en': 'This guide is for educational purposes only. Please consult independent professionals before making any decisions.',
        'no': 'Denne guiden er kun ment som informasjon. Rådfør deg med uavhengige fagfolk før du tar beslutninger.',
        'sv': 'Den här guiden är endast avsedd som information. Rådgör med oberoende experter innan du fattar beslut.',
    },
    'pricing': {'en': 'Pricing', 'no': 'Pris', 'sv': 'Pris'},
}

LANG = 'en'
def t(v):
    """Pick the current language from a {en,no,sv} dict, or return a plain value."""
    if isinstance(v, dict):
        if LANG not in v:
            raise SystemExit(f'Missing "{LANG}" text in: {json.dumps(v, ensure_ascii=False)[:160]}')
        return v[LANG]
    return v

def e(v):
    return html.escape(str(t(v)))

CSS = FONT_FACES + """
:root{--navy:#010221;--gold:#C9A96E;--light:#CBEFFF;--accent:#5B7FCC;--off:#F8F7F4;--rule:#E3E0DA;--body:#2B2E45;}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#fff}
body{font-family:'FS Siena',Georgia,serif;color:var(--navy);-webkit-print-color-adjust:exact;print-color-adjust:exact}
@page{size:A4;margin:0}
.page{width:210mm;height:297mm;position:relative;overflow:hidden;page-break-after:always;background:var(--off)}
.page:last-child{page-break-after:auto}
.inner{position:absolute;left:20mm;right:20mm;top:19mm;bottom:28mm;overflow:hidden}
.eyebrow{display:flex;align-items:center;gap:10px;font-size:7.6px;letter-spacing:.32em;text-transform:uppercase;font-weight:600;color:var(--navy);margin-bottom:9px}
.eyebrow:before{content:'';width:26px;height:1.6px;background:var(--gold);display:block}
.eyebrow b{font-weight:600;margin-right:2px}
h1{font-weight:400;font-size:29px;line-height:1.28;letter-spacing:.005em;margin-bottom:16px}
h2{font-weight:500;font-size:16px;line-height:1.35;margin:0 0 10px}
.lead{font-size:11.4px;line-height:2.0;color:var(--body);margin-bottom:24px;max-width:150mm}
p{font-size:10.1px;line-height:2.0;color:var(--body)}
p+p{margin-top:6px}
.glance{background:#fff;border-radius:6px;border-left:4px solid var(--navy);padding:22px 28px 14px;margin-bottom:22px}
.glance h3{font-weight:600;font-size:11px;margin-bottom:12px}
.glance li,.dash li{list-style:none;display:flex;gap:16px;align-items:baseline;font-size:9.6px;line-height:1.7;color:var(--body);padding:9px 0;border-bottom:1px solid var(--rule)}
.glance li:last-child,.dash li:last-child{border-bottom:0}
.glance li:before,.dash li:before{content:'';flex:0 0 12px;height:1.6px;background:var(--gold);transform:translateY(-3px)}
.photo{width:100%;border-radius:6px;background-size:cover;background-position:center;margin-bottom:22px}
.num{display:grid;grid-template-columns:42px 1fr;padding:18px 0 20px;border-bottom:1px solid var(--rule)}
.num:first-child{padding-top:6px}
.num:last-child{border-bottom:0}
.num .n{font-size:15px;font-weight:400}
.num h4{font-size:11.5px;font-weight:600;margin-bottom:6px;line-height:1.5}
.tag{display:inline-block;margin-top:10px;background:var(--light);color:var(--navy);font-size:6.8px;font-weight:600;letter-spacing:.24em;text-transform:uppercase;padding:5px 12px;border-radius:20px}
.formula{display:flex;align-items:stretch;gap:8px;margin:6px 0 26px}
.formula .box{flex:1;background:#fff;border:1px solid var(--rule);border-radius:6px;padding:14px 8px;text-align:center}
.formula .box small{display:block;font-size:6.4px;letter-spacing:.28em;text-transform:uppercase;color:#8a8c99;margin-bottom:6px;font-weight:600}
.formula .box span{font-size:11px;line-height:1.35}
.formula .op{align-self:center;font-size:12px;color:#8a8c99}
.formula .res{background:var(--navy);color:#fff;border-color:var(--navy)}
.formula .res small{color:var(--gold)}
.def{display:grid;grid-template-columns:44mm 1fr;gap:16px;padding:12px 0;border-bottom:1px solid var(--rule)}
.def:last-child{border-bottom:0}
.def dt{font-size:9.6px;font-weight:600;line-height:2}
.callout{background:var(--light);border-radius:6px;padding:20px 24px;font-size:9.8px;line-height:1.9;color:var(--navy);margin:18px 0 22px}
.headed .it{padding:10px 0 12px;border-bottom:1px solid var(--rule)}
.headed .it:first-child{padding-top:2px}
.headed .it:last-child{border-bottom:0}
.headed h4{font-size:10.5px;font-weight:600;margin-bottom:4px}
.dates{background:var(--navy);border-radius:6px;padding:24px 22px;display:grid;gap:22px;margin:8px 0 30px}
.dates .c h5{color:#fff;font-weight:400;font-size:12.5px;margin-bottom:10px}
.dates .c h5:after{content:'';display:block;width:22px;height:1.6px;background:var(--gold);margin-top:10px}
.dates .c p{color:#d9dbe6;font-size:8.6px;line-height:1.9}
.rates h3{font-weight:400;font-size:16px;margin-bottom:6px}
.rate{display:grid;grid-template-columns:40mm 1fr;gap:16px;padding:14px 0;border-bottom:1px solid var(--rule)}
.rate:last-child{border-bottom:0}
.rate .big{font-size:15px;line-height:1.3}
.steps .s{display:grid;grid-template-columns:30px 1fr;padding:11px 0;border-bottom:1px solid var(--rule);font-size:9.4px;color:var(--body);line-height:1.7}
.steps .s b{font-size:7.6px;font-weight:600;letter-spacing:.12em;color:var(--navy);padding-top:2px}
.foot{position:absolute;left:20mm;right:20mm;bottom:12mm;border-top:1px solid #D9D6CF;padding-top:10px;display:flex;justify-content:space-between;align-items:center}
.foot img{height:19px}
.foot span{font-size:7px;letter-spacing:.24em;font-weight:600}
/* cover */
.cover{background:var(--navy)}
.cover .img{position:absolute;left:0;right:0;top:0;height:56.5%;background-size:cover;background-position:center}
.cover .txt{position:absolute;left:16mm;right:48mm;bottom:34mm}
.cover .eyebrow{color:var(--gold);margin-bottom:14px}
.cover h1{color:#fff;font-size:34px;line-height:1.3;margin-bottom:20px}
.cover .sub{color:#e4e6ef;font-size:11.5px;line-height:2.05;max-width:135mm}
.cover .logo{position:absolute;left:16mm;bottom:15mm;height:33px}
/* example */
.ex .band{position:absolute;left:0;right:0;top:0;height:39%;background-size:cover;background-position:center}
.ex .card{position:absolute;left:10mm;right:10mm;top:21.5%;background:#fff;border-radius:6px;box-shadow:0 6px 24px rgba(1,2,33,.10);padding:26px 24px 20px}
.ex .row{display:flex;justify-content:space-between;align-items:flex-start;padding:11px 0;border-bottom:1px solid var(--rule)}
.ex .row b{display:block;font-size:9.4px;font-weight:600}
.ex .row small{display:block;font-size:7.6px;color:#8a8c99;margin-top:2px}
.ex .row .v{font-size:10.5px;white-space:nowrap;padding-left:12px}
.ex .total{display:flex;justify-content:space-between;align-items:baseline;border-top:2px solid var(--navy);margin-top:6px;padding-top:16px}
.ex .total b{font-size:10px;font-weight:600}
.ex .total .v{font-size:22px}
.ex .note{text-align:right;font-size:7px;color:#8a8c99;margin-top:8px}
.ex .foot{left:10mm;right:10mm}
/* cta */
.cta .side{position:absolute;left:0;top:0;bottom:0;width:30%;background-size:cover;background-position:58% center;filter:grayscale(1)}
.cta .inner{left:calc(30% + 12mm);right:16mm;top:19mm;bottom:12mm}
.cta .price{background:#fff;border:1px solid var(--rule);border-radius:6px;padding:16px 18px;margin:22px 0}
.cta .price .eyebrow{font-size:6.6px;margin-bottom:6px}
.cta .price .amt{font-size:20px;margin-bottom:8px}
.btn{display:inline-block;background:var(--navy);color:#fff;font-size:8.6px;padding:11px 22px;border-radius:30px}
.cta .disc{position:absolute;left:0;right:0;bottom:0;font-size:6.4px;color:#8a8c99;line-height:1.7}
/* back */
.back{background:var(--navy)}
.back .c{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 30mm}
.back img{height:62px;margin-bottom:28px}
.back .rule{width:26px;height:1.6px;background:var(--gold);margin-bottom:28px}
.back p{color:#e4e6ef;font-size:9.6px;max-width:110mm}
.back .url{position:absolute;bottom:20mm;left:0;right:0;text-align:center;color:#fff;font-size:7px;letter-spacing:.32em;font-weight:600}
"""

import re as _re
SCALE = 1.5  # type scale, tuned against the Sep 2026 tax guide
_ff, _rest = CSS[:len(FONT_FACES)], CSS[len(FONT_FACES):]
CSS = _ff + _re.sub(r'(\d+(?:\.\d+)?)px', lambda m: (f"{float(m.group(1))*SCALE:.1f}px" if float(m.group(1))>2.5 else m.group(0)), _rest)

def eyebrow(v, num=None):
    n = f'<b>{html.escape(num)}</b> ' if num else ''
    return f'<div class="eyebrow">{n}{e(v)}</div>' if v else ''

def paras(lst):
    return ''.join(f'<p>{e(x)}</p>' for x in (lst or []))

def block(b):
    k = b['type']
    if k == 'section':
        return eyebrow(b.get('eyebrow'), b.get('num')) + f'<h1>{e(b["title"])}</h1>' + (f'<div class="lead">{e(b["lead"])}</div>' if b.get('lead') else '')
    if k == 'h2':
        return f'<h2>{e(b["text"])}</h2>'
    if k == 'para':
        return f'<p style="margin-bottom:14px">{e(b["text"])}</p>'
    if k == 'glance':
        return f'<div class="glance"><h3>{e(b["title"])}</h3><ul>' + ''.join(f'<li>{e(i)}</li>' for i in b['items']) + '</ul></div>'
    if k == 'dash':
        return '<ul class="dash" style="margin-bottom:18px">' + ''.join(f'<li>{e(i)}</li>' for i in b['items']) + '</ul>'
    if k == 'photo':
        return f'<div class="photo" style="height:{b.get("h",62)}mm;background-image:url({photo(b["src"])});background-position:{b.get("pos","center")}"></div>'
    if k == 'numbered':
        out = ''
        for i, it in enumerate(b['items']):
            n = it.get('n') or f'{b.get("start",1)+i:02d}'
            tag = f'<span class="tag">{e(it["tag"])}</span>' if it.get('tag') else ''
            out += f'<div class="num"><div class="n">{n}</div><div><h4>{e(it["title"])}</h4>{paras(it.get("paras"))}{tag}</div></div>'
        return f'<div class="numbered">{out}</div>'
    if k == 'formula':
        parts = []
        for i, bx in enumerate(b['boxes']):
            if i: parts.append(f'<div class="op">{html.escape(b.get("ops",["×"]*9)[i-1])}</div>')
            parts.append(f'<div class="box"><small>{e(bx["label"])}</small><span>{e(bx["value"])}</span></div>')
        parts.append('<div class="op">=</div>')
        parts.append(f'<div class="box res"><small>{e(b["result"]["label"])}</small><span>{e(b["result"]["value"])}</span></div>')
        return f'<div class="formula">{"".join(parts)}</div>'
    if k == 'deflist':
        return '<dl>' + ''.join(f'<div class="def"><dt>{e(r[0])}</dt><dd><p>{e(r[1])}</p></dd></div>' for r in b['rows']) + '</dl>'
    if k == 'callout':
        return f'<div class="callout">{e(b["text"])}</div>'
    if k == 'headed':
        return '<div class="headed">' + ''.join(f'<div class="it"><h4>{e(i["title"])}</h4>{paras(i.get("paras") or [i["text"]])}</div>' for i in b['items']) + '</div>'
    if k == 'dates':
        cols = b['cols']
        return f'<div class="dates" style="grid-template-columns:repeat({len(cols)},1fr)">' + ''.join(f'<div class="c"><h5>{e(c["date"])}</h5><p>{e(c["text"])}</p></div>' for c in cols) + '</div>'
    if k == 'rates':
        head = f'<h3>{e(b["title"])}</h3>' if b.get('title') else ''
        intro = f'<p style="margin-bottom:8px">{e(b["intro"])}</p>' if b.get('intro') else ''
        return f'<div class="rates">{head}{intro}' + ''.join(f'<div class="rate"><div class="big">{e(r[0])}</div><p>{e(r[1])}</p></div>' for r in b['rows']) + '</div>'
    if k == 'space':
        return f'<div style="height:{b.get("h",8)}mm"></div>'
    raise SystemExit(f'Unknown block type: {k}')

def foot(n):
    return f'<div class="foot"><img src="{LOGO_NAVY}"><span>{n:02d}</span></div>'

def page(p, n, spec):
    k = p['type']
    if k == 'cover':
        return (f'<section class="page cover"><div class="img" style="background-image:url({photo(p["photo"])});background-position:{p.get("pos","center")}"></div>'
                f'<div class="txt">{eyebrow(p["eyebrow"])}<h1>{e(p["title"])}</h1><div class="sub">{e(p["sub"])}</div></div>'
                f'<img class="logo" src="{LOGO_WHITE}"></section>')
    if k == 'content':
        return f'<section class="page"><div class="inner" data-check>{"".join(block(b) for b in p["blocks"])}</div>{foot(n)}</section>'
    if k == 'example':
        def exrow(r):
            note = f'<small>{e(r["note"])}</small>' if r.get('note') else ''
            return f'<div class="row"><div><b>{e(r["label"])}</b>{note}</div><div class="v">{e(r["value"])}</div></div>'
        rows = ''.join(exrow(r) for r in p['rows'])
        note = f'<div class="note">{e(p["calc"])}</div>' if p.get('calc') else ''
        lead = f'<p style="margin-bottom:14px">{e(p["lead"])}</p>' if p.get('lead') else ''
        return (f'<section class="page ex"><div class="band" style="background-image:url({photo(p["photo"])});background-position:{p.get("pos","center")}"></div>'
                f'<div class="card" data-check>{eyebrow(p["eyebrow"], p.get("num"))}<h1 style="font-size:24px;margin-bottom:10px">{e(p["title"])}</h1>{lead}{rows}'
                f'<div class="total"><b>{e(p["total"]["label"])}</b><span class="v">{e(p["total"]["value"])}</span></div>{note}</div>{foot(n)}</section>')
    if k == 'cta':
        steps = ''.join(f'<div class="s"><b>{i+1:02d}</b><span>{e(s)}</span></div>' for i, s in enumerate(p['steps']))
        return (f'<section class="page cta"><div class="side" style="background-image:url({photo(p.get("photo","support"))})"></div>'
                f'<div class="inner" data-check>{eyebrow(p["eyebrow"], p.get("num"))}<h1>{e(p["title"])}</h1><p style="margin-bottom:12px">{e(p["lead"])}</p>'
                f'<div class="steps">{steps}</div>'
                f'<div class="price"><div class="eyebrow">{e(SHELL["pricing"])}</div><div class="amt">{e(p["price"])}</div><p>{e(p["price_note"])}</p></div>'
                f'<span class="btn">{e(p["button"])}</span><div class="disc">{e(SHELL["disclaimer"])}</div></div></section>')
    if k == 'back':
        url = {'en': 'GETBUENO.COM', 'no': 'GETBUENO.COM/NO', 'sv': 'GETBUENO.COM/SE'}[LANG]
        return (f'<section class="page back"><div class="c"><img src="{LOGO_WHITE}"><div class="rule"></div>'
                f'<p>{e(SHELL["back"])}</p></div><div class="url">{url}</div></section>')
    raise SystemExit(f'Unknown page type: {k}')

def build_html(spec):
    body = ''.join(page(p, i + 1, spec) for i, p in enumerate(spec['pages']))
    return f'<!doctype html><html lang="{LANG}"><head><meta charset="utf-8"><title>{e(spec["meta_title"])}</title><style>{CSS}</style></head><body>{body}</body></html>'

def render(spec_path, langs):
    global LANG
    from playwright.sync_api import sync_playwright
    spec = json.loads(pathlib.Path(spec_path).read_text())
    OUT.mkdir(exist_ok=True)
    PDF_OUT.mkdir(parents=True, exist_ok=True)
    results = []
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        pg = browser.new_page()
        for lang in langs:
            LANG = lang
            doc = build_html(spec)
            (OUT / f'{spec["file"]}-{lang.upper()}.html').write_text(doc)
            pg.set_content(doc, wait_until='load')
            pg.evaluate('document.fonts.ready')
            over = pg.evaluate("""() => [...document.querySelectorAll('[data-check]')].map((el,i)=>{
                const page=[...document.querySelectorAll('.page')].indexOf(el.closest('.page'))+1;
                const box=el.getBoundingClientRect(); let max=0;
                for (const c of el.querySelectorAll('*')) { const r=c.getBoundingClientRect(); if (r.height) max=Math.max(max,r.bottom); }
                const limit = el.classList.contains('card') ? el.closest('.page').querySelector('.foot').getBoundingClientRect().top - 8 : box.bottom;
                return {page, spill: Math.round(max - limit)};
            }).filter(x => x.spill > 0)""")
            if over:
                raise SystemExit(f'[{lang}] content overflows on pages: {over}')
            out = PDF_OUT / f'Bueno-Guide-{spec["file"]}-{lang.upper()}.pdf'
            pg.pdf(path=str(out), format='A4', print_background=True, margin={'top': '0', 'right': '0', 'bottom': '0', 'left': '0'})
            results.append(str(out))
        browser.close()
    return results

if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('spec')
    ap.add_argument('--lang', action='append')
    a = ap.parse_args()
    for f in render(a.spec, a.lang or ['en', 'no', 'sv']):
        print(f)
