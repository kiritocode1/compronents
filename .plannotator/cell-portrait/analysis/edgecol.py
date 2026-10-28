import numpy as np
from PIL import Image, ImageFilter
M=np.asarray(Image.open("/tmp/dhruv/mask100.png"))>0
img=np.asarray(Image.open("/tmp/dhruv/median_colour.png").filter(ImageFilter.GaussianBlur(3))).astype(float)
bg=np.array([34,83,233.])
p=14; px=13.5; py=1; r=p/3
rows=[]
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
            if y<20 or x<20 or not (M[int(y),int(x)] and M[int(y),int(x+p)]): continue
            if not (present(x,y) and present(x+p,y)): continue
            mx=x+p/2
            fu=st[int(round(y-r))-1:int(round(y-r))+2,int(round(mx))].any() and st[int(round(y+r))-1:int(round(y+r))+2,int(round(mx))].any()
            th=st[int(round(y))-2:int(round(y))+3,int(round(mx))].any()
            cd=np.abs(img[int(y),int(x)]-img[int(y),int(x+p)]).sum()
            rows.append((cd,fu,th and not fu))
R=np.array(rows,dtype=float)
for lo,hi in ((0,20),(20,40),(40,80),(80,160),(160,800)):
    s=(R[:,0]>=lo)&(R[:,0]<hi)
    if s.sum()>20: print(f"colour diff {lo}-{hi}: n={int(s.sum())} full={R[s,1].mean():.2f} thin={R[s,2].mean():.2f}")
