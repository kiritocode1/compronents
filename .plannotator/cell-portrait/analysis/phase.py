# For each frame with known pitch, find the grid phase where cell centres sit (minimum stroke energy at centre, ring at r)
import sys, numpy as np
from PIL import Image, ImageFilter
d=sys.argv[1]
pairs=[tuple(map(int,s.split(":"))) for s in sys.argv[2].split(",")]
for f,p in pairs:
    im=Image.open(f"{d}/f{f:03d}.png").convert("L")
    a=np.asarray(im).astype(float)
    hp=a-np.asarray(im.filter(ImageFilter.GaussianBlur(max(2,p/6)))).astype(float)
    hp=np.clip(hp,0,None)[100:900,150:950]
    H,W=hp.shape
    best=None
    # ring template score: stroke energy on ring of radius p/3 minus energy at centre
    r=p/3
    ang=np.linspace(0,2*np.pi,64,endpoint=False)
    for ox in range(p):
        for oy in range(p):
            xs=np.arange(ox,W,p); ys=np.arange(oy,H,p)
            X,Y=np.meshgrid(xs,ys)
            ring=0
            for t in ang:
                xx=np.clip((X+r*np.cos(t)).round().astype(int),0,W-1)
                yy=np.clip((Y+r*np.sin(t)).round().astype(int),0,H-1)
                ring+=hp[yy,xx].mean()
            ring/=len(ang)
            cen=hp[Y,X].mean()
            s=ring-cen
            if best is None or s>best[0]: best=(s,ox,oy)
    s,ox,oy=best
    # convert to full-frame coords
    print(f, p, "centre phase x≡", (ox+150)%p, "y≡", (oy+100)%p, "score", round(s,2))
