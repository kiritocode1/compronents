# Perpendicular coverage profile at the midpoint between horizontally adjacent present cells.
import sys, numpy as np
from PIL import Image
d,f,p,px,py=sys.argv[1],int(sys.argv[2]),float(sys.argv[3]),float(sys.argv[4]),float(sys.argv[5])
a=np.asarray(Image.open(f"{d}/f{f:03d}.png").convert("RGB").crop((0,0,1078,974))).astype(float)
M=np.asarray(Image.open("/tmp/dhruv/mask100.png"))>0
cov=np.clip((a[...,0]-34)/221,0,1); st=cov>0.35
r=p/3
def present(x,y):
    d=0
    for c,s in ((.7071,.7071),(-.7071,.7071),(.7071,-.7071),(-.7071,-.7071)):
        xx=int(round(x+r*c)); yy=int(round(y+r*s)); d+=st[yy-1:yy+2,xx-1:xx+2].any()
    return d>=2
widths=[]
H,W=st.shape
for y in np.arange(py,H-p,p):
    for x in np.arange(px,W-2*p,p):
        if y<p or x<p or not (M[int(y),int(x)] and M[int(y),int(x+p)]): continue
        if not (present(x,y) and present(x+p,y)): continue
        mx=int(round(x+p/2)); col=st[int(y-r-2):int(y+r+3),mx]
        idx=np.nonzero(col)[0]
        if len(idx)==0: continue
        widths.append(idx.max()-idx.min()+1)  # outer extent of the bridge incl. strokes
w=np.array(widths)
print(f"{d.split('/')[-1]} f{f} pitch {p}: n={len(w)}  extent histogram (px:count):", dict(zip(*np.unique(w,return_counts=True))))
