# Rebuild the source portrait from the colour-phase frames: strokes are always lighter than
# the underlying colour, so a low per-pixel percentile (by luma) across the 10 layouts drops them.
import numpy as np, sys
from PIL import Image
out=sys.argv[1]
fr=[81,85,89,93,97,101,105,109,113,117]
A=np.stack([np.asarray(Image.open(f"/tmp/dhruv/frames/f{f:03d}.png").convert("RGB")).astype(float) for f in fr])
Y=A@np.array([.2126,.7152,.0722])
k=0  # darkest of 10 layouts
idx=np.argsort(Y,0)[k]
rec=np.take_along_axis(A, idx[None,...,None].repeat(3,-1), 0)[0]
# grey opening (3x3 erode then dilate) removes the 1-2px light strokes that survive the minimum
def shift_stack(x):
    p=np.pad(x,((1,1),(1,1),(0,0)),mode="edge")
    return np.stack([p[1+dy:1+dy+x.shape[0],1+dx:1+dx+x.shape[1]] for dy in (-1,0,1) for dx in (-1,0,1)])
rec=shift_stack(shift_stack(rec).min(0)).max(0)
bg=np.array([34,83,233.])
alpha=(np.abs(rec-bg).sum(2)>60)
# square canvas 1078x1078: original grid centre sat at (539,539.5); bottom 104 rows were cropped by the video, extend them
H,W=alpha.shape; S=1078
canvas=np.zeros((S,S,4),np.uint8)
canvas[:H,:W,:3]=rec.clip(0,255).astype(np.uint8); canvas[:H,:W,3]=alpha*255
canvas[H:,:,:]=canvas[H-1:H-1-(S-H):-1,:,:]  # mirror the last rows
Image.fromarray(canvas,"RGBA").save(out)
print("saved",out,canvas.shape)
