# Label enclosed near-white regions of the opaque illustration so true background pockets can be picked by eye.
import numpy as np, sys
from PIL import Image, ImageDraw
from collections import deque
src=sys.argv[1]
im=Image.open(src).convert("RGB")
s=0.36
sm=im.resize((int(im.width*s),int(im.height*s)),Image.LANCZOS)
a=np.asarray(sm).astype(int); H,W,_=a.shape
near=(np.abs(a-255)<=24).all(2)
lab=-np.ones((H,W),int); comps=[]
for y in range(H):
    for x in range(W):
        if lab[y,x]>=0 or not near[y,x]: continue
        q=deque([(y,x)]); lab[y,x]=len(comps); pts=[]; edge=False
        while q:
            cy,cx=q.popleft(); pts.append((cy,cx))
            if cy in (0,H-1) or cx in (0,W-1): edge=True
            for dy,dx in ((1,0),(-1,0),(0,1),(0,-1)):
                ny,nx=cy+dy,cx+dx
                if 0<=ny<H and 0<=nx<W and lab[ny,nx]<0 and near[ny,nx]:
                    lab[ny,nx]=len(comps); q.append((ny,nx))
        comps.append((len(pts),edge,pts))
out=np.asarray(sm).copy()
vis=Image.fromarray(out); d=ImageDraw.Draw(vis)
cols=[(255,0,0),(0,200,0),(255,140,0),(160,0,255),(0,160,255),(255,0,160),(120,90,0),(0,120,120)]
k=0
for idx,(n,edge,pts) in sorted(enumerate(comps),key=lambda t:-t[1][0]):
    if edge or n<150: continue
    c=cols[k%len(cols)]
    for (y,x) in pts: vis.putpixel((x,y),c)
    ys,xs=zip(*pts); d.text((int(np.mean(xs)),int(np.mean(ys))),str(k),fill=(0,0,0))
    print(k, "area",n, "bbox(orig px)", (int(min(xs)/s),int(min(ys)/s),int(max(xs)/s),int(max(ys)/s)), "seed", (int(xs[0]/s),int(ys[0]/s)))
    k+=1
vis.save("/tmp/dhruv/pockets.png")
