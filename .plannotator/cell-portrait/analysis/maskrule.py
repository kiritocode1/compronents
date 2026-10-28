import numpy as np
from PIL import Image
from collections import deque
R=np.asarray(Image.open("/Users/blank/Desktop/CREATE/compronents/.plannotator/cell-portrait/preview/dhruv-rebuilt.png")).astype(float)
A=R[...,3]/255
bg=np.array([34,83,233.])
def outside(f):
    a=np.asarray(Image.open(f"/tmp/dhruv/frames/f{f:03d}.png").convert("RGB")).astype(float)
    wall=np.abs(a-bg).sum(2)>40
    H,W=wall.shape; seen=np.zeros_like(wall)
    q=deque([(0,0),(0,W-1)]); seen[0,0]=seen[0,W-1]=True
    while q:
        y,x=q.popleft()
        for dy,dx in ((1,0),(-1,0),(0,1),(0,-1)):
            yy,xx=y+dy,x+dx
            if 0<=yy<H and 0<=xx<W and not seen[yy,xx] and not wall[yy,xx]:
                seen[yy,xx]=True; q.append((yy,xx))
    return seen
for f,p in ((1,72),(10,64),(19,48),(26,36)):
    out=outside(f)
    cx,cy=539,539.5
    res={k:[0,0] for k in ("cov0.3","cov0.4","cov0.5","cov0.6","cov0.7","centre")}
    for j in range(-8,8):
        for i in range(-8,8):
            x0,y0=cx+i*p,cy+j*p
            xc,yc=int(x0+p/2),int(y0+p/2)
            if not (0<=yc<974 and 0<=xc<1078) or y0+p>974: continue
            truth = not out[yc,xc]
            ax,ay,bx,by=max(0,int(round(x0))),max(0,int(round(y0))),min(1078,int(round(x0+p))),min(1078,int(round(y0+p)))
            cov=A[ay:by,ax:bx].mean()
            for k,pred in (("cov0.3",cov>.3),("cov0.4",cov>.4),("cov0.5",cov>.5),("cov0.6",cov>.6),("cov0.7",cov>.7),("centre",A[yc,xc]>.5)):
                res[k][0]+= (pred==truth); res[k][1]+=1
    print(f"frame {f} pitch {p}:", {k:f"{a}/{b}" for k,(a,b) in res.items()})
