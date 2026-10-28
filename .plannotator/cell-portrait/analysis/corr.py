import numpy as np
from PIL import Image, ImageFilter
bg=np.array([34,83,233.])
M=np.asarray(Image.open("/tmp/dhruv/mask100.png"))>0
lum=np.asarray(Image.open("/tmp/dhruv/frames/f100.png").convert("L").filter(ImageFilter.GaussianBlur(6))).astype(float)
p=14; px=13.5; py=1; r=p/3
pres=[];L=[]
for f in (53,57,61,65,69,125,129,133,137):
    a=np.asarray(Image.open(f"/tmp/dhruv/frames/f{f:03d}.png").convert("RGB")).astype(float)
    st=(np.abs(a-bg).sum(2)>90)
    H,W=st.shape
    for y in np.arange(py,H-8,p):
        for x in np.arange(px,W-8,p):
            if y<8 or x<8 or not M[int(y),int(x)]: continue
            d=0
            for c,s in ((.7071,.7071),(-.7071,.7071),(.7071,-.7071),(-.7071,-.7071)):
                xx=int(round(x+r*c)); yy=int(round(y+r*s))
                d+=st[yy-1:yy+2,xx-1:xx+2].any()
            pres.append(d>=2); L.append(lum[int(y),int(x)])
pres=np.array(pres); L=np.array(L)
print("overall presence",pres.mean().round(3),"n",len(pres))
for lo,hi in ((0,60),(60,100),(100,140),(140,180),(180,256)):
    s=(L>=lo)&(L<hi)
    print(f"lum {lo}-{hi}: n={s.sum()} presence={pres[s].mean():.3f}")
# finer bins + edge types by luminance
full=[];thin=[];EL=[]
for f in (53,57,61,65,69,125,129,133,137):
    a=np.asarray(Image.open(f"/tmp/dhruv/frames/f{f:03d}.png").convert("RGB")).astype(float)
    st=(np.abs(a-bg).sum(2)>90); H,W=st.shape
    def present(x,y):
        d=0
        for c,s in ((.7071,.7071),(-.7071,.7071),(.7071,-.7071),(-.7071,-.7071)):
            xx=int(round(x+r*c)); yy=int(round(y+r*s)); d+=st[yy-1:yy+2,xx-1:xx+2].any()
        return d>=2
    for y in np.arange(py,H-20,p):
        for x in np.arange(px,W-20,p):
            if y<20 or x<20 or not M[int(y),int(x)] or not M[int(y),int(x+p)]: continue
            if not (present(x,y) and present(x+p,y)): continue
            mx=x+p/2
            fu=st[int(round(y-r))-1:int(round(y-r))+2,int(round(mx))].any() and st[int(round(y+r))-1:int(round(y+r))+2,int(round(mx))].any()
            th=st[int(round(y))-2:int(round(y))+3,int(round(mx))].any()
            full.append(fu); thin.append(th and not fu); EL.append(lum[int(y),int(mx)])
full=np.array(full);thin=np.array(thin);EL=np.array(EL)
for lo in range(0,256,20):
    s=(L>=lo)&(L<lo+20); e=(EL>=lo)&(EL<lo+20)
    if s.sum()>30: print(f"lum {lo:3d}-{lo+20:3d}: cells n={s.sum():5d} present={pres[s].mean():.2f} | edges n={e.sum():4d} full={full[e].mean() if e.sum() else 0:.2f} thin={thin[e].mean() if e.sum() else 0:.2f}")
