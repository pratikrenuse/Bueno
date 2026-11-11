"""Builds the pre-built edition templates (HTML and plain text, EN/NO/SV) for the ten editions in editions_data.
Placeholders filled on send day: {{SUBJECT}} {{PREVIEW}} {{INTRO}} {{N1_T}} {{N1_B}} {{N2_T}} {{N2_B}} {{N3_T}} {{N3_B}} {{SOURCES}}.
Every value put into the HTML must be HTML-escaped first."""
import copy, json, pathlib
import build_editions as be
from editions_data import E, BUENO_LINE

SPECS = pathlib.Path('/home/claude/guide/studio/guides/specs')
BASE = 'https://www.247spain.es/newsletter-guides/Bueno-Guide-{file}-{L}.pdf'
FOOT = {'en': 'Regulated by Banco de España. Sources for the news in this edition: {{SOURCES}}.',
        'no': 'Regulert av Banco de España. Kilder til nyhetene i denne utgaven: {{SOURCES}}.',
        'sv': 'Reglerat av Banco de España. Källor till nyheterna i det här numret: {{SOURCES}}.'}
GUIDE_IN = {'en': 'Inside the guide you will find:', 'no': 'I guiden finner du:', 'sv': 'I guiden hittar du:'}

def make(ed):
    spec = json.load(open(SPECS / f"{ed['guide']}.json"))
    out = {'html': {}, 'text': {}, 'guide_urls': {}, 'guide_title': spec['title']}
    for L in ('en', 'no', 'sv'):
        c = copy.deepcopy(be.C[L])
        c.update(subject='{{SUBJECT}}', preview='{{PREVIEW}}', intro=[c['intro'][0], '{{INTRO}}'],
                 news=[('{{N1_T}}', '{{N1_B}}'), ('{{N2_T}}', '{{N2_B}}'), ('{{N3_T}}', '{{N3_B}}')],
                 tax_h=ed['tax'][L][0], tax=ed['tax'][L][1],
                 guide_h=spec['title'][L], guide_p=ed['guide_p'][L], guide_in=GUIDE_IN[L], guide_list=spec['topics'][L],
                 region_h=ed['region_h'][L], region=[*ed['region_t'][L], BUENO_LINE[L]],
                 q=ed['q'][L], a=ed['a'][L], foot=FOOT[L])
        be.C[L + '_x'] = c
        url = BASE.format(file=spec['file'], L=L.upper())
        be.GUIDE = url
        h = be.build(L + '_x').replace('lang="' + L + '_x"', f'lang="{L}"')
        t = be.text(L + '_x')
        del be.C[L + '_x']
        for s in (h, t):
            assert '—' not in s and '–' not in s, (ed['key'], L)
            for ph in ('{{SUBJECT}}', '{{INTRO}}', '{{N1_T}}', '{{N3_B}}', '{{SOURCES}}'):
                assert ph in s or (ph in ('{{SUBJECT}}',) and s is t), (ed['key'], L, ph)
        assert url in h
        out['html'][L], out['text'][L], out['guide_urls'][L] = h, t, url
    return out

if __name__ == '__main__':
    d = pathlib.Path('/home/claude/nl/templates'); d.mkdir(exist_ok=True)
    allout = {}
    for ed in E:
        o = make(ed); allout[ed['key']] = o
        for L in o['html']:
            (d / f"{ed['key']}-{L.upper()}.html").write_text(o['html'][L])
            (d / f"{ed['key']}-{L.upper()}.txt").write_text(o['text'][L])
        print(ed['key'], ed['guide'], len(o['html']['en']))
    json.dump(allout, open(d / 'all.json', 'w'), ensure_ascii=False)
