"""Simple 3 renderer: one content JSON -> matching image (1080x1080) and video (1080x1920, 12s).
Usage (from repo root):
  python3 studio/renderer/simple3.py check studio/content/modelo210_en.json
  python3 studio/renderer/simple3.py image studio/content/modelo210_en.json studio/themes/247spain.json
  python3 studio/renderer/simple3.py video studio/content/modelo210_en.json studio/themes/247spain.json
Layout is code. Content and brand are data. If a budget fails, rendering refuses.
Layouts: rows | hero | path | flow (set "layout" in the content JSON, or slug hash decides).
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

def draw_footer(d,img,th,W,H,FOOT,scale=1.0):
    c=th.c; f=th.t["footer"]
    d.rectangle((0,H-FOOT,W,H),fill=c["primary"])
    MX=int(72*scale)
    if f["type"]=="wordmark_247":
        fw=th.f("bold",int(40*scale)); fp=th.f("medium",int(17*scale)); ls=max(2,int(3*scale))
        wm=[("24",c["footer_text"]),("/",c["gold"]),("7",c["footer_text"]),(" SPAIN",c["footer_text"])]
        x=MX; fy=H-FOOT+(FOOT-int(52*scale))//2
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
        img.paste(c["footer_text"],(MX,H-FOOT+(FOOT-lh)//2),wl)
    fu=th.f("regular",int(26*scale))
    d.text((W-MX-tw(f["domain"],fu),H-FOOT+int(17*scale)),f["domain"],font=fu,fill=c["footer_text"])
    if f.get("disclaimer"):
        fd=th.f("regular",int(17*scale))
        d.text((W-MX-tw(f["disclaimer"],fd),H-FOOT+int(62*scale)),f["disclaimer"],font=fd,fill=c["footer_sub"])

# ---------------- IMAGE (1080x1080) ----------------
LAYOUTS=["rows","hero","path","flow"]
def pick_layout(c):
    if c.get("layout") in LAYOUTS: return c["layout"]
    return LAYOUTS[sum(ord(ch) for ch in c["slug"])%len(LAYOUTS)]

def draw_header(d,c,th,W):
    cc=th.c
    f_eb=th.f("medium",22); ls=5
    ebw=sum(tw(x,f_eb) for x in c["eyebrow"])+ls*(len(c["eyebrow"])-1)
    x=(W-ebw)//2
    for ch in c["eyebrow"]:
        d.text((x,56),ch,font=f_eb,fill=cc["accent"]); x+=tw(ch,f_eb)+ls
    hl=c["headline"]
    if len(hl)==1:
        d.text(((W-tw(hl[0],th.f("semibold",52)))//2,98),hl[0],font=th.f("semibold",52),fill=cc["primary"]); return 190
    d.text(((W-tw(hl[0],th.f("semibold",50)))//2,94),hl[0],font=th.f("semibold",50),fill=cc["primary"])
    d.text(((W-tw(hl[1],th.f("semibold",50)))//2,158),hl[1],font=th.f("semibold",50),fill=cc["primary"])
    return 238

def card_shadow(img,box,r=30):
    W,H=img.size
    sh=Image.new("RGBA",(W,H),(0,0,0,0))
    sd=ImageDraw.Draw(sh)
    x0,y0,x1,y1=box
    sd.rounded_rectangle((x0,y0+7,x1,y1+7),r,fill=(1,2,33,30))
    sh=sh.filter(ImageFilter.GaussianBlur(16))
    img.paste(Image.new("RGB",(W,H),(0,0,0)),(0,0),sh)

def render_image_hero(c,th,outpath):
    """Row 1 becomes a giant stat/statement; rows 2-3 sit side by side below."""
    W=H=1080; MX=72; cc=th.c
    img=Image.new("RGB",(W,H),cc["canvas"])
    d=ImageDraw.Draw(img,"RGBA")
    head_h=draw_header(d,c,th,W)
    hero=c["rows"][0]
    f_lab=th.f("medium",24)
    lw_=tw(hero["label"].upper(),f_lab)
    ly=head_h+26
    d.rounded_rectangle(((W-lw_)/2-28,ly,(W+lw_)/2+28,ly+48),24,outline=cc["gold"],width=2)
    d.text(((W-lw_)/2,ly+9),hero["label"].upper(),font=f_lab,fill=cc["primary"])
    f_hero=th.f("bold",64)
    hy=ly+84
    for l in hero["fact"]:
        d.text(((W-tw(l,f_hero))//2,hy),l,font=f_hero,fill=cc["primary"]); hy+=84
    if hero.get("detail"):
        f_d=th.f("regular",26)
        d.text(((W-tw(hero["detail"],f_d))//2,hy+4),hero["detail"],font=f_d,fill=cc["detail"])
        hy+=48
    cw_=(W-2*MX-28)//2; ch_=300; cy0=hy+40
    for i,row in enumerate(c["rows"][1:3]):
        x0=MX+i*(cw_+28); x1=x0+cw_; y1=cy0+ch_
        card_shadow(img,(x0,cy0,x1,y1)); d=ImageDraw.Draw(img,"RGBA")
        d.rounded_rectangle((x0,cy0,x1,y1),30,fill=cc["card_bg"])
        ccx=x0+cw_//2
        d.ellipse((ccx-40,cy0+26,ccx+40,cy0+106),fill=cc["highlight"])
        icon(row["icon"],d,ccx,cy0+64,24,th)
        f_l2=th.f("semibold",27)
        d.text((ccx-tw(row["label"],f_l2)//2,cy0+118),row["label"],font=f_l2,fill=cc["primary"])
        f_f2=th.f("semibold",27)
        fy=cy0+164
        for l in row["fact"]:
            d.text((ccx-tw(l,f_f2)//2,fy),l,font=f_f2,fill=cc["primary"]); fy+=37
        if row.get("detail"):
            f_d2=th.f("regular",19)
            lines=[row["detail"]]
            if tw(row["detail"],f_d2)>cw_-48:
                ws=row["detail"].split(); mid=len(ws)//2
                lines=[" ".join(ws[:mid])," ".join(ws[mid:])]
            dy=y1-30-24*len(lines)
            for ln in lines:
                d.text((ccx-tw(ln,f_d2)//2,dy),ln,font=f_d2,fill=cc["detail"]); dy+=24
    draw_footer(d,img,th,W,H,112,scale=0.95)
    img.save(outpath); return outpath

def render_image_path(c,th,outpath):
    """Numbered vertical journey, airy, no boxes: line + gold number discs."""
    W=H=1080; MX=72; cc=th.c
    img=Image.new("RGB",(W,H),cc["canvas"])
    d=ImageDraw.Draw(img,"RGBA")
    head_h=draw_header(d,c,th,W)
    lx=178
    top=head_h+50; bot=930
    d.line((lx,top,lx,bot),fill=cc["hairline"],width=3)
    step=(bot-top)//3
    for i,row in enumerate(c["rows"]):
        ny=top+step//2+i*step
        d.ellipse((lx-37,ny-37,lx+37,ny+37),fill=cc["highlight"])
        d.ellipse((lx-37,ny-37,lx+37,ny+37),outline=cc["gold"],width=3)
        f_n=th.f("bold",30)
        d.text((lx-tw(str(i+1),f_n)//2,ny-21),str(i+1),font=f_n,fill=cc["primary"])
        tx=lx+86
        f_l=th.f("medium",24)
        d.text((tx,ny-74),row["label"].upper(),font=f_l,fill=cc["accent"])
        f_f=th.f("semibold",36)
        fy=ny-34
        for l in row["fact"]:
            d.text((tx,fy),l,font=f_f,fill=cc["primary"]); fy+=47
        if row.get("detail"):
            d.text((tx,fy+6),row["detail"],font=th.f("regular",23),fill=cc["detail"])
    draw_footer(d,img,th,W,H,112,scale=0.95)
    img.save(outpath); return outpath

def render_image_flow(c,th,outpath):
    """Flowchart look: zigzag connected cards with elbow arrows, like a process diagram."""
    W=H=1080; MX=72; cc=th.c
    img=Image.new("RGB",(W,H),cc["canvas"])
    d=ImageDraw.Draw(img,"RGBA")
    head_h=draw_header(d,c,th,W)
    cw_=620; ch_=196; vgap=52
    top=head_h+18
    xs=[MX, W-MX-cw_, MX]
    line_col=cc["hairline"]
    for i,row in enumerate(c["rows"]):
        x0=xs[i]; y0=top+i*(ch_+vgap); x1=x0+cw_; y1=y0+ch_
        if i<2:
            nx=xs[i+1]+ (110 if xs[i+1]==MX else cw_-110)
            sx=x0+ (cw_-110 if x0==MX else 110)
            my=y1+vgap//2
            d.line((sx,y1,sx,my),fill=line_col,width=4)
            d.line((sx,my,nx,my),fill=line_col,width=4)
            d.line((nx,my,nx,y1+vgap-14),fill=line_col,width=4)
            d.polygon([(nx-9,y1+vgap-16),(nx+9,y1+vgap-16),(nx,y1+vgap)],fill=cc["gold"])
            d.ellipse((sx-6,y1-2,sx+6,y1+10),fill=cc["gold"])
        card_shadow(img,(x0,y0,x1,y1),26); d=ImageDraw.Draw(img,"RGBA")
        d.rounded_rectangle((x0,y0,x1,y1),26,fill=cc["card_bg"])
        icx=x0+86
        d.ellipse((icx-44,y0+ch_//2-44,icx+44,y0+ch_//2+44),fill=cc["highlight"])
        icon(row["icon"],d,icx,y0+ch_//2,26,th)
        d.text((x0+22,y0+14),"0%d"%(i+1),font=th.f("bold",22),fill=cc["gold"])
        tx=x0+162
        f_l=th.f("medium",21)
        d.text((tx,y0+26),row["label"].upper(),font=f_l,fill=cc["accent"])
        f_f=th.f("semibold",30)
        fy=y0+60
        for l in row["fact"]:
            d.text((tx,fy),l,font=f_f,fill=cc["primary"]); fy+=39
        if row.get("detail"):
            d.text((tx,fy+8),row["detail"],font=th.f("regular",19),fill=cc["detail"])
    draw_footer(d,img,th,W,H,112,scale=0.95)
    img.save(outpath); return outpath

def render_image(c,th,outpath):
    layout=pick_layout(c)
    if layout=="hero": return render_image_hero(c,th,outpath)
    if layout=="path": return render_image_path(c,th,outpath)
    if layout=="flow": return render_image_flow(c,th,outpath)
    W=H=1080; MX=72
    cc=th.c
    img=Image.new("RGB",(W,H),cc["canvas"])
    d=ImageDraw.Draw(img,"RGBA")
    head_h=draw_header(d,c,th,W)
    rh=220; gap=22; ry=head_h+2
    split=MX+330
    for i,row in enumerate(c["rows"]):
        y0=ry; y1=ry+rh
        card_shadow(img,(MX,y0,W-MX,y1)); d=ImageDraw.Draw(img,"RGBA")
        d.rounded_rectangle((MX,y0,W-MX,y1),30,fill=cc["card_bg"])
        d.text((MX+30,y0+20),"0%d"%(i+1),font=th.f("bold",25),fill=cc["gold"])
        lcx=MX+178
        d.ellipse((lcx-42,y0+30,lcx+42,y0+114),fill=cc["highlight"])
        icon(row["icon"],d,lcx,y0+72,26,th)
        f_lab=th.f("semibold",29)
        d.text((lcx-tw(row["label"],f_lab)//2,y0+128),row["label"],font=f_lab,fill=cc["primary"])
        d.line((split+60,y0+30,split+60,y1-30),fill=cc["hairline"],width=2)
        rcx=(split+60+W-MX)//2
        f_f=th.f("semibold",35)
        fy=y0+34 if len(row["fact"])==2 else y0+58
        for l in row["fact"]:
            d.text((rcx-tw(l,f_f)//2,fy),l,font=f_f,fill=cc["primary"]); fy+=48
        if row.get("detail"):
            f_d=th.f("regular",22)
            d.text((rcx-tw(row["detail"],f_d)//2,y0+rh-58),row["detail"],font=f_d,fill=cc["detail"])
        ry+=rh+gap
    draw_footer(d,img,th,W,H,112,scale=0.95)
    img.save(outpath)
    return outpath

# ---------------- VIDEO (1080x1920, 12s) ----------------
def render_video_frames(c,th,frames_dir,fps=30,dur=12.0):
    W,H=1080,1920; MX=72
    cc=th.c
    shutil.rmtree(frames_dir,ignore_errors=True); os.makedirs(frames_dir)
    def sprite(): return Image.new("RGBA",(W,H),(0,0,0,0))
    head=sprite(); hd=ImageDraw.Draw(head)
    f_eb=th.f("medium",26); ls=6
    ebw=sum(tw(x,f_eb) for x in c["eyebrow"])+ls*(len(c["eyebrow"])-1)
    x=(W-ebw)//2
    for ch in c["eyebrow"]:
        hd.text((x,225),ch,font=f_eb,fill=cc["accent"]); x+=tw(ch,f_eb)+ls
    f_h=th.f("semibold",62)
    hy=280
    for l in c["headline"]:
        hd.text(((W-tw(l,f_h))//2,hy),l,font=f_h,fill=cc["primary"]); hy+=82
    rh=310; gap=40; ry0=530
    split=MX+360
    cards=[]; details=[]
    for i,row in enumerate(c["rows"]):
        sp=sprite()
        y0=ry0+i*(rh+gap); y1=y0+rh
        shl=Image.new("RGBA",(W,H),(0,0,0,0))
        sd=ImageDraw.Draw(shl)
        sd.rounded_rectangle((MX,y0+9,W-MX,y1+9),34,fill=(1,2,33,32))
        shl=shl.filter(ImageFilter.GaussianBlur(18))
        sp=Image.alpha_composite(sp,shl); d2=ImageDraw.Draw(sp)
        d2.rounded_rectangle((MX,y0,W-MX,y1),34,fill=cc["card_bg"])
        d2.text((MX+36,y0+26),"0%d"%(i+1),font=th.f("bold",30),fill=cc["gold"])
        lcx=MX+196
        d2.ellipse((lcx-54,y0+46,lcx+54,y0+154),fill=cc["highlight"])
        icon(row["icon"],d2,lcx,y0+100,29,th)
        f_lab=th.f("semibold",35)
        d2.text((lcx-tw(row["label"],f_lab)//2,y0+172),row["label"],font=f_lab,fill=cc["primary"])
        d2.line((split+70,y0+46,split+70,y1-46),fill=cc["hairline"],width=2)
        rcx=(split+70+W-MX)//2
        f_f=th.f("semibold",42)
        fy=y0+62 if len(row["fact"])==2 else y0+92
        for l in row["fact"]:
            d2.text((rcx-tw(l,f_f)//2,fy),l,font=f_f,fill=cc["primary"]); fy+=60
        cards.append(sp)
        det=sprite()
        if row.get("detail"):
            dd=ImageDraw.Draw(det)
            f_d=th.f("regular",26)
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
