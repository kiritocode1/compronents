# Detect cells + connections on a grid of known pitch/phase; report stats
import sys, numpy as np
from PIL import Image, ImageFilter
d=sys.argv[1]; f=int(sys.argv[2]); p=float(sys.argv[3]); px=float(sys.argv[4]); py=float(sys.argv[5])
im=Image.open(f"{d}/f{f:03d}.png").convert("RGB").crop((0,0,1078,974))
a=np.asarray(im).astype(float)
bg=np.array([34,83,233.])
st=(np.abs(a-bg).sum(2)>90)  # stroke mask
H,W=st.shape
M=np.asarray(Image.open("/tmp/dhruv/mask100.png"))>0
def on(x,y,rad=1):
    x=int(round(x)); y=int(round(y))
    return st[max(0,y-rad):y+rad+1, max(0,x-rad):x+rad+1].any()
r=p/3; t=p/12
xs=np.arange(px%p, W, p); ys=np.arange(py%p, H, p)
cells={}
for j,y in enumerate(ys):
    for i,x in enumerate(xs):
        if x<r+2 or y<r+2 or x>W-r-3 or y>H-r-3: continue
        # cell present if stroke on ring at any of 4 diagonal points (diagonals are never covered by connections)
        diag=sum(on(x+r*c, y+r*s) for c,s in ((.7071,.7071),(-.7071,.7071),(.7071,-.7071),(-.7071,-.7071)))
        cen=on(x,y,0)
        cells[(i,j)]=(diag>=2) and not cen if M[int(y),int(x)] else None
stats={"full":0,"thin":0,"none":0}
for (i,j),present in cells.items():
    if not present: continue
    for di,dj in ((1,0),(0,1)):
        n=(i+di,j+dj)
        if not cells.get(n): continue
        x=xs[i]+di*p/2; y=ys[j]+dj*p/2
        ox,oy=(0,1) if di else (1,0)
        full=on(x-ox*r,y-oy*r) and on(x+ox*r,y+oy*r)
        span=max(1,int(round(p/6)))
        thin=any(st[int(round(y+oy*k)), int(round(x+ox*k))] for k in range(-span,span+1))
        k="full" if full else ("thin" if thin else "none")
        stats[k]+=1
vals=[v for v in cells.values() if v is not None]; pres=sum(vals); tot=len(vals)
print(f"frame {f} pitch {p}: cells present {pres}/{tot} ({pres/tot:.2f}) edges between present pairs", stats,
      {k:round(v/max(1,sum(stats.values())),2) for k,v in stats.items()})
