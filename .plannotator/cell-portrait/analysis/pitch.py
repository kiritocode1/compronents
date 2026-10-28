import sys, numpy as np
from PIL import Image
d=sys.argv[1]
bg=np.array([34,83,233])
prev=None
for i in range(1,181):
    a=np.asarray(Image.open(f"{d}/f{i:03d}.png").convert("RGB")).astype(np.int16)
    if prev is not None and np.abs(a-prev).mean()<1.5: prev=a; continue
    prev=a
    # stroke mask: brightness above bg
    m=(np.abs(a-bg).sum(2)>60).astype(float)
    reg=m[150:800, 250:850]
    best=[]
    for axis in (0,1):
        p=reg.mean(axis=axis); p=p-p.mean()
        ac=np.correlate(p,p,'full')[len(p)-1:]
        ac/=ac[0]+1e-9
        # first strong peak after lag 5
        lags=range(6,120)
        pk=max(lags,key=lambda l: ac[l] if ac[l]>ac[l-1] and ac[l]>=ac[l+1] else -9)
        best.append((pk, round(ac[pk],2)))
    # stroke color: brightest pixels
    px=a[m>0]
    top=px[px.sum(1)>np.percentile(px.sum(1),90)].mean(0).round() if len(px) else None
    print(i, best, top, f"cov={m.mean():.3f}")
