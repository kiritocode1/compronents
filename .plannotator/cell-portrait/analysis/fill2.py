import numpy as np
from PIL import Image
fr=[81,85,89,93,97,101,105,109,113,117]
A=np.stack([np.asarray(Image.open(f"/tmp/dhruv/frames/f{f:03d}.png").convert("RGB")).astype(float) for f in fr])
M=np.asarray(Image.open("/tmp/dhruv/mask100.png"))>0
p=10; px=3; py=4; r=3.33
H,W=M.shape
pres_c=[];abs_c=[];ring_c=[]
for y in range(py+20,H-20,p):
    for x in range(px+20,W-20,p):
        if not M[y-6:y+7,x-6:x+7].all(): continue
        cen=A[:,y,x,:]  # (10,3)
        Lc=cen.mean(1)
        ringv=np.stack([A[:,int(round(y+r*s)),int(round(x+r*t)),:] for s in(-.7071,.7071) for t in (-.7071,.7071)]).mean(0)  # (10,3)
        contrast=ringv.mean(1)-Lc
        pr=contrast>30; ab=np.abs(contrast)<8
        if pr.sum()>=2 and ab.sum()>=2:
            pres_c.append(cen[pr].mean(0)); abs_c.append(cen[ab].mean(0)); ring_c.append(ringv[pr].mean(0))
P=np.array(pres_c); B=np.array(abs_c); R=np.array(ring_c)
print("cells with both states:",len(P))
ratio=(P+1)/(B+1)
print("fill/image ratio median per channel", np.median(ratio,0).round(3))
# fit fill = k*image + c per channel
for ch,n in enumerate("RGB"):
    k,c=np.polyfit(B[:,ch],P[:,ch],1); print(n,"fill = %.3f*img + %.1f"%(k,c))
for ch,n in enumerate("RGB"):
    k,c=np.polyfit(B[:,ch],R[:,ch],1); print(n,"ring = %.3f*img + %.1f  (white-mix alpha ~ %.2f)"%(k,c,1-k))
# bucket by image luminance
Lb=B.mean(1)
for lo in range(0,256,40):
    s=(Lb>=lo)&(Lb<lo+40)
    if s.sum()>20: print(f"img lum {lo}-{lo+40}: n={s.sum()} img={B[s].mean(0).round()} fill={P[s].mean(0).round()} ring={R[s].mean(0).round()}")
