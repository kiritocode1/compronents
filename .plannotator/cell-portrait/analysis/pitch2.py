import sys, numpy as np
from PIL import Image, ImageFilter
d=sys.argv[1]
for i in [int(x) for x in sys.argv[2].split(",")]:
    im=Image.open(f"{d}/f{i:03d}.png").convert("L")
    a=np.asarray(im).astype(float)
    b=np.asarray(im.filter(ImageFilter.GaussianBlur(4))).astype(float)
    hp=a-b
    reg=hp[200:800, 300:800]
    out=[]
    for axis in (0,1):
        p=reg.mean(axis=axis)  # profile
        # use 2D autocorr along axis via FFT on rows
        r = reg if axis==1 else reg.T
        F=np.fft.rfft(r - r.mean(1,keepdims=True), axis=1, n=2*r.shape[1])
        ac=np.fft.irfft(F*np.conj(F), axis=1)[:, :r.shape[1]].mean(0)
        ac/=ac[0]
        cands=[l for l in range(5,60) if ac[l]>ac[l-1] and ac[l]>=ac[l+1]]
        best=max(cands,key=lambda l:ac[l])
        out.append((best, round(float(ac[best]),2)))
    print(i,out)
