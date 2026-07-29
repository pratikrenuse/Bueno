"""Simple 3 renderer v3: one content JSON -> matching image (1080x1080) and video.
Editorial design: photography-led, flat, left-aligned FS Siena, thin gold rules,
no icon discs, no navy footer bar. Discreet 247spain.es mark only.

Layout names kept for content compatibility; their designs are:
  rows / photo -> EDITORIAL   photo across the top, facts below
  flow         -> SPLIT       photo left half, text column right
  hero         -> STAT        big statement + photo band at the bottom
  path         -> MINIMAL     pure typography, no photo
If the photos folder is missing, photo layouts degrade gracefully to typographic
versions, so a render run never fails.

Usage (from repo root):
  python3 studio/renderer/simple3.py check studio/content/modelo210_en.json
  python3 studio/renderer/simple3.py image studio/content/modelo210_en.json studio/themes/247spain.json
  python3 studio/renderer/simple3.py video studio/content/modelo210_en.json studio/themes/247spain.json
"""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import json, os, shutil, sys

HERE=os.path.dirname(os.path.abspath(__file__))
OUTDIR=os.path.join(HERE,"..","out")

BUDGETS={"eyebrow":34,"headline_line":24,"label":14,"fact_line":26,"detail":52,
         "headline_lines":2,"fact_lines":2,"rows":3}

def load(p):
    with open(p) as f: return json.load(f)

def validate(c):
    errs=[]
    def chk(name,s,lim):
        if len(s)>lim: errs.append(f"{name}: {len(s)}>{lim} chars: '{s}'")
    chk("eyebrow",c["eyebrow"],BUDGETS["eyebrow"])
    if not 1<=len(c["headline"])<=BUDGETS["headline_lines"]:
        errs.append("headline: must be 1-2 lines")
    for i,l in enumerate(c["headline"]): chk(f"headline[{i}]",l,BUDGETS["headline_line"])
    if len(c["rows"])!=BUDGETS["rows"]: errs.append("rows: exactly 3 required")
    for r,row in enumerate(c["rows"]):
        chk(f"row{r}.label",row["label"],BUDGETS["label"])
        if not 1<=len(row["fact"])<=BUDGETS["fact_lines"]:
            errs.append(f"row{r}.fact: must be 1-2 lines")
        for i,l in enumerate(row["fact"]): chk(f"row{r}.fact[{i}]",l,BUDGETS["fact_line"])
        chk(f"row{r}.detail",row.get("detail",""),BUDGETS["detail"])
    return errs

class T:
    def __init__(self,theme):
        self.t=theme
        self.c={k:tuple(v) for k,v in theme["colors"].items()}
        self.fd=theme["fonts_dir"]; self.fm=theme["fonts"]
        self._cache={}
    def f(self,kind,size):
        k=(kind,size)
        if k not in self._cache:
            self._cache[k]=ImageFont.truetype(os.path.join(self.fd,self.fm[kind]),size)
        return self._cache[k]

meas=ImageDraw.Draw(Image.new("RGB",(1,1)))
def tw(s,fo):
    b=meas.textbbox((0,0),s,font=fo); return b[2]-b[0]
def ease(t): return 1-(1-t)**3

def fit(th,kind,size,texts,maxw,min_size=13):
    if isinstance(texts,str): texts=[texts]
    while size>min_size:
        f=th.f(kind,size)
        if all(tw(t,f)<=maxw for t in texts): return f
        size-=1
    return th.f(kind,min_size)

# kept for the video renderer
def icon(name,d,cx,cy,s,th):
    NAVY=th.c["primary"]; GOLD=th.c["gold"]
    w=max(4,int(s/6))
    if name=="house":
        d.polygon([(cx-s,cy),(cx,cy-s*0.9),(cx+s,cy)],outline=NAVY,width=w)
        d.rectangle((cx-s*0.7,cy,cx+s*0.7,cy+s*0.8),outline=NAVY,width=w)
    elif name=="euro":
        d.ellipse((cx-s,cy-s,cx+s,cy+s),outline=NAVY,width=w)
        f=th.f("semibold",int(s*1.35))
        d.text((cx-tw("€",f)//2,cy-int(s*0.95)),"€",font=f,fill=NAVY)
    elif name=="calendar":
        d.rounded_rectangle((cx-s,cy-s*0.75,cx+s,cy+s*0.75),int(s/4),outline=NAVY,width=w)
        d.line((cx-s,cy-s*0.25,cx+s,cy-s*0.25),fill=NAVY,width=w)
        d.line((cx-s*0.45,cy-s*1.0,cx-s*0.45,cy-s*0.55),fill=NAVY,width=w)
        d.line((cx+s*0.45,cy-s*1.0,cx+s*0.45,cy-s*0.55),fill=NAVY,width=w)
        d.ellipse((cx+s*0.25-s/5,cy+s*0.2-s/5,cx+s*0.25+s/5,cy+s*0.2+s/5),fill=GOLD)
    elif name=="document":
        d.rounded_rectangle((cx-s*0.7,cy-s,cx+s*0.7,cy+s),int(s/5),outline=NAVY,width=w)
        for dy in (-s*0.4,0,s*0.4):
            d.line((cx-s*0.4,cy+dy,cx+s*0.4,cy+dy),fill=NAVY,width=max(3,w-2))
    elif name=="key":
        d.ellipse((cx-s,cy-s*0.45,cx-s*0.1,cy+s*0.45),outline=NAVY,width=w)
        d.line((cx-s*0.1,cy,cx+s,cy),fill=NAVY,width=w)
        d.line((cx+s*0.6,cy,cx+s*0.6,cy+s*0.4),fill=NAVY,width=w)
        d.line((cx+s*0.95,cy,cx+s*0.95,cy+s*0.5),fill=NAVY,width=w)
    elif name=="percent":
        d.line((cx-s*0.7,cy+s*0.7,cx+s*0.7,cy-s*0.7),fill=NAVY,width=w)
        d.ellipse((cx-s*0.9,cy-s*0.9,cx-s*0.25,cy-s*0.25),outline=NAVY,width=w)
        d.ellipse((cx+s*0.25,cy+s*0.25,cx+s*0.9,cy+s*0.9),outline=NAVY,width=w)

# kept for the video renderer
def draw_footer(d,img,th,W,H,FOOT,scale=1.0):
    c=th.c; f=th.t["footer"]
    d.rectangle((0,H-FOOT,W,H),fill=c["primary"])
    MXf=int(72*scale)
    if f["type"]=="wordmark_247":
        fw=th.f("bold",int(40*scale)); fp=th.f("medium",int(17*scale)); ls=max(2,int(3*scale))
        wm=[("24",c["footer_text"]),("/",c["gold"]),("7",c["footer_text"]),(" SPAIN",c["footer_text"])]
        x=MXf; fy=H-FOOT+(FOOT-int(52*scale))//2
        for t_,col in wm:
            d.text((x,fy),t_,font=fw,fill=col); x+=tw(t_,fw)
        bx=x+int(26*scale)
        d.rectangle((bx,fy+4,bx+2,fy+int(46*scale)),fill=c["footer_text"])
        cx=bx+int(26*scale)
        for ch in f["payoff"]:
            d.text((cx,fy+int(15*scale)),ch,font=fp,fill=c["highlight"]); cx+=tw(ch,fp)+ls
    else:
        logo=Image.open(f["logo_path"])
        a=logo.split()[3]
        wl=Image.new("RGBA",logo.size,c["footer_text"]+(255,)); wl.putalpha(a)
        lw=int(380*scale); lh=int(logo.height*lw/logo.width)
        wl=wl.resize((lw,lh))
        img.paste(c["footer_text"],(MXf,H-FOOT+(FOOT-lh)//2),wl)
    fu=th.f("regular",int(26*scale))
    d.text((W-MXf-tw(f["domain"],fu),H-FOOT+int(17*scale)),f["domain"],font=fu,fill=c["footer_text"])
    if f.get("disclaimer"):
        fd=th.f("regular",int(17*scale))
        d.text((W-MXf-tw(f["disclaimer"],fd),H-FOOT+int(62*scale)),f["disclaimer"],font=fd,fill=c["footer_sub"])

# ---------------- IMAGE (1080x1080), editorial v3 ----------------
LAYOUTS=["rows","hero","path","flow","photo"]
PHOTOS_DIR=os.environ.get("STUDIO_PHOTOS","studio/photos")
MX=84

def pick_layout(c):
    if c.get("layout") in LAYOUTS: return c["layout"]
    return LAYOUTS[sum(ord(ch) for ch in c["slug"])%len(LAYOUTS)]

def get_photo(c):
    try:
        files=sorted(f for f in os.listdir(PHOTOS_DIR) if f.lower().endswith((".jpg",".jpeg",".png")))
    except Exception:
        return None
    if not files: return None
    fname=c.get("photo") if c.get("photo") in files else files[sum(ord(x) for x in c["slug"])%len(files)]
    try: return Image.open(os.path.join(PHOTOS_DIR,fname)).convert("RGB")
    except Exception: return None

def cover(ph,w,h):
    r=max(w/ph.width,h/ph.height)
    p=ph.resize((int(ph.width*r)+1,int(ph.height*r)+1))
    return p.crop(((p.width-w)//2,(p.height-h)//2,(p.width-w)//2+w,(p.height-h)//2+h))

def spaced(d,s,f,ls,x,y,col):
    cx=x
    for ch in s:
        d.text((cx,y),ch,font=f,fill=col); cx+=tw(ch,f)+ls
    return cx-x

DISCLAIMERS={"en":"General information, not advice.","no":"Generell informasjon.","sv":"Allmän information."}

def mark(d,th,c,W,on_photo_top=False,disc_y=1042,disc_x=None):
    """Discreet branding: small domain top right, tiny disclaimer bottom left."""
    f=th.f("medium",20)
    s="247spain.es"
    col=(255,255,255) if on_photo_top else (158,162,178)
    d.text((W-MX-tw(s,f),52),s,font=f,fill=col)
    dis=DISCLAIMERS.get(c.get("language","en"),DISCLAIMERS["en"])
    fd=th.f("regular",16)
    d.text((disc_x if disc_x is not None else MX,disc_y),dis,font=fd,fill=(182,185,196))

def facts_block(d,th,c,x,y,colw,fact_size=29,label_size=19,detail_size=19,gap=26,two_line=False):
    cc=th.c
    for row in c["rows"]:
        fl=th.f("medium",label_size)
        spaced(d,row["label"].upper(),fl,3,x,y,cc["accent"])
        y+=label_size+9
        if two_line:
            ff=fit(th,"semibold",fact_size,row["fact"],colw)
            for l in row["fact"]:
                d.text((x,y),l,font=ff,fill=cc["primary"]); y+=fact_size+8
        else:
            fact=" ".join(row["fact"])
            ff=fit(th,"semibold",fact_size,fact,colw)
            d.text((x,y),fact,font=ff,fill=cc["primary"]); y+=fact_size+9
        if row.get("detail"):
            fdt=fit(th,"regular",detail_size,row["detail"],colw)
            d.text((x,y),row["detail"],font=fdt,fill=cc["detail"]); y+=detail_size+6
        y+=gap
    return y

def gold_rule(d,th,x,y,w=64):
    d.rectangle((x,y,x+w,y+3),fill=th.c["gold"])

def render_editorial(c,th,outpath):
    """Photo across the top, editorial text below. rows + photo layouts."""
    W=H=1080; cc=th.c
    img=Image.new("RGB",(W,H),cc["canvas"])
    d=ImageDraw.Draw(img,"RGBA")
    ph=get_photo(c)
    if ph:
        img.paste(cover(ph,W,470),(0,0)); d=ImageDraw.Draw(img,"RGBA")
        ty=506
    else:
        ty=150
    mark(d,th,c,W,on_photo_top=bool(ph))
    f_eb=th.f("medium",21)
    spaced(d,c["eyebrow"],f_eb,4,MX,ty,cc["accent"]); ty+=44
    f_h=fit(th,"semibold",52 if ph else 66,c["headline"],W-2*MX)
    for l in c["headline"]:
        d.text((MX,ty),l,font=f_h,fill=cc["primary"]); ty+=(60 if ph else 78)
    ty+=16; gold_rule(d,th,MX,ty); ty+=34
    facts_block(d,th,c,MX,ty,W-2*MX,fact_size=29 if ph else 33,gap=24 if ph else 34)
    img.save(outpath); return outpath

def render_split(c,th,outpath):
    """Photo left half, text column right. flow layout."""
    W=H=1080; cc=th.c
    ph=get_photo(c)
    if not ph: return render_minimal(c,th,outpath)
    img=Image.new("RGB",(W,H),cc["canvas"])
    img.paste(cover(ph,470,H),(0,0))
    d=ImageDraw.Draw(img,"RGBA")
    x=540; colw=W-x-MX
    mark(d,th,c,W,disc_x=x)
    y=104
    f_eb=th.f("medium",20)
    spaced(d,c["eyebrow"],f_eb,3,x,y,cc["accent"]); y+=42
    f_h=fit(th,"semibold",44,c["headline"],colw)
    for l in c["headline"]:
        d.text((x,y),l,font=f_h,fill=cc["primary"]); y+=54
    y+=14; gold_rule(d,th,x,y); y+=32
    facts_block(d,th,c,x,y,colw,fact_size=26,label_size=18,detail_size=18,gap=28,two_line=True)
    img.save(outpath); return outpath

def render_minimal(c,th,outpath):
    """Pure typography, generous whitespace. path layout."""
    W=H=1080; cc=th.c
    img=Image.new("RGB",(W,H),cc["canvas"])
    d=ImageDraw.Draw(img,"RGBA")
    mark(d,th,c,W)
    y=140
    f_eb=th.f("medium",22)
    spaced(d,c["eyebrow"],f_eb,5,MX,y,cc["accent"]); y+=52
    f_h=fit(th,"semibold",72,c["headline"],W-2*MX)
    for l in c["headline"]:
        d.text((MX,y),l,font=f_h,fill=cc["primary"]); y+=86
    y+=18; gold_rule(d,th,MX,y,90); y+=44
    for i,row in enumerate(c["rows"]):
        fn=th.f("regular",44)
        d.text((MX,y-2),str(i+1),font=fn,fill=cc["gold"])
        tx=MX+64
        fl=th.f("medium",19)
        spaced(d,row["label"].upper(),fl,3,tx,y,cc["accent"])
        fact=" ".join(row["fact"])
        ff=fit(th,"semibold",31,fact,W-tx-MX)
        d.text((tx,y+28),fact,font=ff,fill=cc["primary"])
        yy=y+70
        if row.get("detail"):
            fdt=fit(th,"regular",20,row["detail"],W-tx-MX)
            d.text((tx,yy),row["detail"],font=fdt,fill=cc["detail"]); yy+=30
        y=yy+34
    img.save(outpath); return outpath

def render_stat(c,th,outpath):
    """Big statement, supporting facts, photo band across the bottom. hero layout."""
    W=H=1080; cc=th.c
    img=Image.new("RGB",(W,H),cc["canvas"])
    d=ImageDraw.Draw(img,"RGBA")
    ph=get_photo(c)
    band=300 if ph else 0
    mark(d,th,c,W,disc_y=(H-band-38) if ph else 1042)
    y=96
    f_eb=th.f("medium",21)
    spaced(d,c["eyebrow"],f_eb,4,MX,y,cc["accent"]); y+=44
    f_h=fit(th,"semibold",40,c["headline"],W-2*MX)
    for l in c["headline"]:
        d.text((MX,y),l,font=f_h,fill=cc["primary"]); y+=50
    y+=18; gold_rule(d,th,MX,y); y+=34
    hero=c["rows"][0]
    fl=th.f("medium",20)
    spaced(d,hero["label"].upper(),fl,3,MX,y,cc["accent"]); y+=32
    f_big=fit(th,"bold",58,hero["fact"],W-2*MX)
    for l in hero["fact"]:
        d.text((MX,y),l,font=f_big,fill=cc["primary"]); y+=f_big.size+12
    if hero.get("detail"):
        fdt=fit(th,"regular",21,hero["detail"],W-2*MX)
        d.text((MX,y),hero["detail"],font=fdt,fill=cc["detail"]); y+=34
    y+=26
    colw=(W-2*MX-56)//2
    for i,row in enumerate(c["rows"][1:3]):
        x=MX+i*(colw+56)
        fl2=th.f("medium",18)
        spaced(d,row["label"].upper(),fl2,3,x,y,cc["accent"])
        ff=fit(th,"semibold",24,row["fact"],colw)
        yy=y+28
        for l in row["fact"]:
            d.text((x,yy),l,font=ff,fill=cc["primary"]); yy+=32
        if row.get("detail"):
            fdt=fit(th,"regular",17,row["detail"],colw)
            d.text((x,yy+2),row["detail"],font=fdt,fill=cc["detail"])
    if ph:
        img.paste(cover(ph,W,band),(0,H-band))
    img.save(outpath); return outpath

def render_image(c,th,outpath):
    layout=pick_layout(c)
    if layout in ("rows","photo"): return render_editorial(c,th,outpath)
    if layout=="flow": return render_split(c,th,outpath)
    if layout=="path": return render_minimal(c,th,outpath)
    return render_stat(c,th,outpath)  # hero

# ---------------- VIDEO (1080x1920, 12s) ----------------
def render_video_frames(c,th,frames_dir,fps=30,dur=12.0):
    W,H=1080,1920; MXv=72
    cc=th.c
    shutil.rmtree(frames_dir,ignore_errors=True); os.makedirs(frames_dir)
    def sprite(): return Image.new("RGBA",(W,H),(0,0,0,0))
    def card_shadow_v(sp,box,r=34):
        shl=Image.new("RGBA",(W,H),(0,0,0,0))
        sd=ImageDraw.Draw(shl)
        x0,y0,x1,y1=box
        sd.rounded_rectangle((x0,y0+9,x1,y1+9),r,fill=(1,2,33,32))
        return Image.alpha_composite(sp,shl.filter(ImageFilter.GaussianBlur(18)))
    head=sprite(); hd=ImageDraw.Draw(head)
    f_eb=th.f("medium",26); ls=6
    ebw=sum(tw(x,f_eb) for x in c["eyebrow"])+ls*(len(c["eyebrow"])-1)
    x=(W-ebw)//2
    for ch in c["eyebrow"]:
        hd.text((x,225),ch,font=f_eb,fill=cc["accent"]); x+=tw(ch,f_eb)+ls
    f_h=fit(th,"semibold",62,c["headline"],W-140)
    hy=280
    for l in c["headline"]:
        hd.text(((W-tw(l,f_h))//2,hy),l,font=f_h,fill=cc["primary"]); hy+=82
    rh=310; gap=40; ry0=530
    split=MXv+360
    cards=[]; details=[]
    for i,row in enumerate(c["rows"]):
        sp=sprite()
        y0=ry0+i*(rh+gap); y1=y0+rh
        sp=card_shadow_v(sp,(MXv,y0,W-MXv,y1))
        d2=ImageDraw.Draw(sp)
        d2.rounded_rectangle((MXv,y0,W-MXv,y1),34,fill=cc["card_bg"])
        d2.text((MXv+36,y0+26),"0%d"%(i+1),font=th.f("bold",30),fill=cc["gold"])
        lcx=MXv+196
        d2.ellipse((lcx-54,y0+46,lcx+54,y0+154),fill=cc["highlight"])
        icon(row["icon"],d2,lcx,y0+100,29,th)
        f_lab=fit(th,"semibold",35,row["label"],300)
        d2.text((lcx-tw(row["label"],f_lab)//2,y0+172),row["label"],font=f_lab,fill=cc["primary"])
        d2.line((split+70,y0+46,split+70,y1-46),fill=cc["hairline"],width=2)
        rcx=(split+70+W-MXv)//2
        cellw=(W-MXv)-(split+70)-36
        f_f=fit(th,"semibold",42,row["fact"],cellw)
        fy=y0+62 if len(row["fact"])==2 else y0+92
        for l in row["fact"]:
            d2.text((rcx-tw(l,f_f)//2,fy),l,font=f_f,fill=cc["primary"]); fy+=60
        cards.append(sp)
        det=sprite()
        if row.get("detail"):
            dd=ImageDraw.Draw(det)
            f_d=fit(th,"regular",26,row["detail"],cellw)
            dd.text((rcx-tw(row["detail"],f_d)//2,y0+rh-72),row["detail"],font=f_d,fill=cc["detail"])
        details.append(det)
    FOOT=150
    foot=sprite(); fd_=ImageDraw.Draw(foot)
    draw_footer(fd_,foot,th,W,H,FOOT,scale=1.15)
    BG=Image.new("RGB",(W,H),cc["canvas"])
    def put(base,sp,alpha,dy):
        if alpha<=0: return base
        tmp=sp
        if dy:
            tmp=Image.new("RGBA",(W,H),(0,0,0,0))
            tmp.paste(sp,(0,int(dy)),sp)
        if alpha<255:
            tmp=tmp.copy()
            tmp.putalpha(tmp.split()[3].point(lambda v:int(v*alpha/255)))
        return Image.alpha_composite(base,tmp)
    def appear(t,start,dur_=0.55):
        return max(0.0,min(1.0,(t-start)/dur_))
    T_HEAD=0.25; T_CARDS=[1.3,4.1,6.9]; T_FOOT=9.6; DET_LAG=0.5
    N=int(dur*fps)
    for k in range(N):
        t=k/fps
        base=BG.convert("RGBA")
        e=ease(appear(t,T_HEAD,0.6))
        base=put(base,head,int(255*e),(1-e)*50)
        for ci in range(3):
            e=ease(appear(t,T_CARDS[ci],0.6))
            base=put(base,cards[ci],int(255*e),(1-e)*80)
            ed=ease(appear(t,T_CARDS[ci]+DET_LAG,0.5))
            base=put(base,details[ci],int(255*ed),(1-ed)*20)
        e=ease(appear(t,T_FOOT,0.6))
        base=put(base,foot,int(255*e),(1-e)*FOOT)
        frame=base.convert("RGB")
        z=1.0+0.022*(t/dur)
        cw,ch=int(W/z),int(H/z)
        frame=frame.crop(((W-cw)//2,(H-ch)//2,(W-cw)//2+cw,(H-ch)//2+ch)).resize((W,H))
        frame.save(frames_dir+"/f%05d.jpg"%k,quality=93,subsampling=0)
    return N

if __name__=="__main__":
    mode=sys.argv[1]
    c=load(sys.argv[2])
    errs=validate(c)
    if errs:
        print("BUDGET FAIL:"); [print(" -",e) for e in errs]; sys.exit(1)
    if mode=="check":
        print("budgets OK"); sys.exit(0)
    th=T(load(sys.argv[3]))
    os.makedirs(OUTDIR,exist_ok=True)
    if mode=="image":
        p=os.path.join(OUTDIR,"%s_%s.png"%(c["slug"],th.t["name"]))
        print("wrote",render_image(c,th,p))
    elif mode=="video":
        n=render_video_frames(c,th,"/tmp/s3frames")
        print("frames",n)
