# pair.py out f x y w h zoom : same crop of video frame and preview frame, side by side
import sys
from PIL import Image
out,f,x,y,w,h,z=sys.argv[1],int(sys.argv[2]),*map(int,sys.argv[3:8])
a=Image.open(f"/tmp/dhruv/frames/f{f:03d}.png").convert("RGB").crop((x,y,x+w,y+h)).resize((w*z,h*z),Image.NEAREST)
b=Image.open(f"/tmp/dhruv/impl/f{f:03d}.png").convert("RGB").crop((x,y,x+w,y+h)).resize((w*z,h*z),Image.NEAREST)
s=Image.new("RGB",(w*z*2+12,h*z),(0,0,0)); s.paste(a,(0,0)); s.paste(b,(w*z+12,0)); s.save(out)
