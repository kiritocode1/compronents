# Ring energy in colour phase: mean luma excess on the ring band vs. the cell centre, for detected present cells.
import numpy as np, sys
from PIL import Image
def stats(path, px, py, p=10):
    a=np.asarray(Image.open(path).convert("RGB")).astype(float)[:974]
    L=a@np.array([.2126,.7152,.0722])
    M=np.asarray(Image.open("/tmp/dhruv/mask100.png"))>0
    r=p/3; out=[]
    ang=np.linspace(0,2*np.pi,24,endpoint=False)
    for y in np.arange(py+20,960,p):
        for x in np.arange(px+20,1060,p):
            if not M[int(y)-6:int(y)+7,int(x)-6:int(x)+7].all(): continue
            ring=np.mean([L[int(round(y+r*np.sin(t))),int(round(x+r*np.cos(t)))] for t in ang])
            # band integral: sum over radial offsets of excess
            prof=[np.mean([L[int(round(y+rr*np.sin(t))),int(round(x+rr*np.cos(t)))] for t in ang]) for rr in np.arange(r-2,r+2.01,0.5)]
            base=L[int(y),int(x)]
            out.append((ring-base, (np.array(prof)-base).clip(0).sum()*0.5))
    o=np.array(out); pres=o[:,0]>20
    return pres.mean(), np.median(o[pres,0]), np.median(o[pres,1])
for name,path,px,py in (("video","/tmp/dhruv/frames/f100.png",3,4),("preview",sys.argv[1],int(sys.argv[2]),int(sys.argv[3]))):
    fr,e,band=stats(path,px,py)
    print(f"{name}: present-frac {fr:.2f}  ring-minus-centre luma {e:.1f}  integrated band excess {band:.1f}")
