import copy, json, html
import build_editions as be, build_templates as bt
from editions_data import E, BUENO_LINE
P=lambda n:'{{'+n+'}}'
tmpl={}
for L in ('en','no','sv'):
    c=copy.deepcopy(be.C[L])
    c.update(subject=P('SUBJECT'), preview=P('PREVIEW'), intro=[c['intro'][0], P('INTRO')],
      news=[(P(f'N{i}_T'),P(f'N{i}_B')) for i in (1,2,3)], tax_h=P('TAX_H'), tax=[P('TAX_1'),P('TAX_2')],
      guide_h=P('GUIDE_H'), guide_p=P('GUIDE_P'), guide_in=bt.GUIDE_IN[L], guide_list=[P(f'G{i}') for i in range(1,6)],
      region_h=P('REGION_H'), region=[P('R1'),P('R2'),BUENO_LINE[L]], q=P('Q'), a=[P(f'A{i}') for i in range(1,5)], foot=bt.FOOT[L])
    be.C[L+'_x']=c; be.GUIDE='{{{{GUIDE_URL}}}}'
    tmpl[L]=be.build(L+'_x').replace(f'lang="{L}_x"',f'lang="{L}"'); del be.C[L+'_x']
data={}
for ed in E:
    spec=json.load(open(bt.SPECS/f"{ed['guide']}.json")); data[ed['key']]={}
    for L in ('en','no','sv'):
        v=dict(TAX_H=ed['tax'][L][0], TAX_1=ed['tax'][L][1][0], TAX_2=ed['tax'][L][1][1], GUIDE_H=spec['title'][L], GUIDE_P=ed['guide_p'][L],
               REGION_H=ed['region_h'][L], R1=ed['region_t'][L][0], R2=ed['region_t'][L][1], Q=ed['q'][L],
               GUIDE_URL=bt.BASE.format(file=spec['file'],L=L.upper()))
        for i,t in enumerate(spec['topics'][L],1): v[f'G{i}']=t
        for i,t in enumerate(ed['a'][L],1): v[f'A{i}']=t
        v={k:(x if k in ('TAX_H','REGION_H','GUIDE_URL') else html.escape(x)) for k,x in v.items()}
        data[ed['key']][L]=v
# verify against full builds
full=json.load(open('templates/all.json'))
for k in data:
    for L in data[k]:
        h=tmpl[L]
        for n,x in data[k][L].items(): h=h.replace(P(n),x)
        assert h==full[k]['html'][L],(k,L)
json.dump({'tmpl':tmpl,'data':data},open('templates/compact.json','w'),ensure_ascii=False)
print([len(t) for t in tmpl.values()], len(json.dumps(data,ensure_ascii=False).encode()))
