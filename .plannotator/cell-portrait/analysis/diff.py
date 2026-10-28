import sys, numpy as np
from PIL import Image
d=sys.argv[1]
prev=None
bg=None
for i in range(1,181):
    a=np.asarray(Image.open(f"{d}/f{i:03d}.png").convert("RGB")).astype(np.int16)
    if bg is None: bg=a[5,5].copy()
    m=0 if prev is None else np.abs(a-prev).mean()
    # fraction of pixels differing from bg by > 40
    nonbg=(np.abs(a-bg).sum(2)>40).mean()
    print(i, f"{m:6.2f}", f"nonbg={nonbg:.3f}", a.reshape(-1,3).mean(0).round(1))
    prev=a
print("bg",bg)
