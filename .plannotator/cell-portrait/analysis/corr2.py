import numpy as np
from PIL import Image
R=np.asarray(Image.open("/Users/blank/Desktop/CREATE/compronents/.plannotator/cell-portrait/preview/dhruv-rebuilt.png")).astype(float)
bg=np.array([34,83,233.])
def cells(p, px, py, frames):
    r=p/3; out=[]
    for f in frames:
        a=np.asarray(Image.open(f"/tmp/dhruv/frames/f{f:03d}.png").convert("RGB")).astype(float)
        st=(np.abs(a-bg).sum(2)>90); H,W=st.shape
        for y in np.arange(py,H-p,p):
            for x in np.arange(px,W-p,p):
                if y<p or x<p: continue
                x0,x1,y0,y1=int(x-p/2),int(x+p/2),int(y-p/2),int(y+p/2)
                al=R[y0:y1,x0:x1,3].mean()/255
                if al<0.5: continue
                rgb=R[y0:y1,x0:x1,:3].reshape(-1,3).mean(0)
                lum=(rgb@np.array([.2126,.7152,.0722]))/255
                d=0
                for c,s in ((.7071,.7071),(-.7071,.7071),(.7071,-.7071),(-.7071,-.7071)):
                    xx=int(round(x+r*c)); yy=int(round(y+r*s)); d+=st[yy-1:yy+2,xx-1:xx+2].any()
                out.append((lum,d>=2))
    return np.array(out,float)
D=np.concatenate([cells(14,13.5,1,(53,57,61,65,69,125,129,133,137)), cells(24,23,23,(36,37)), cells(36,17,17,(26,))])
print("n",len(D),"presence",D[:,1].mean().round(3))
for lo in np.arange(0,1,0.05):
    s=(D[:,0]>=lo)&(D[:,0]<lo+.05)
    if s.sum()>25: print(f"lum {lo:.2f}-{lo+.05:.2f}: n={int(s.sum()):5d} presence={D[s,1].mean():.2f}")
