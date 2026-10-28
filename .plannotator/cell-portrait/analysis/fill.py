import numpy as np
from PIL import Image
fr=[81,85,89,93,97,101,105,109,113,117]
A=np.stack([np.asarray(Image.open(f"/tmp/dhruv/frames/f{f:03d}.png").convert("RGB")).astype(float) for f in fr])
med=np.median(A,0)
Image.fromarray(med.astype(np.uint8)).save("/tmp/dhruv/median_colour.png")
# deviation of each frame from median
dev=A-med
L=dev.mean(3)
print("per-frame mean abs dev", np.abs(dev).mean((1,2,3)).round(2))
# Inside-shape pixels: strongly darker? check distribution of luminance deviation within silhouette
M=np.asarray(Image.open("/tmp/dhruv/mask100.png"))>0
d=L[:,M].ravel()
hist,edges=np.histogram(d,bins=[-200,-60,-30,-15,-5,5,15,30,60,200])
for h,e0,e1 in zip(hist,edges[:-1],edges[1:]): print(f"{e0:5.0f}..{e1:4.0f}: {h/len(d):.3f}")
# relation: for pixels where dev is strongly positive (stroke) -> ratio towards white
s=dev.sum(3)>90
base=np.broadcast_to(med,A.shape)[s]; val=A[s]
alpha=((val-base)/(255-base+1e-6)).clip(0,1)
print("stroke alpha toward white (median per channel):", np.median(alpha,0).round(2), "n",s.sum())
