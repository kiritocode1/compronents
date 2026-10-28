import sys
from PIL import Image
src,out,x,y,w,h,s=sys.argv[1],sys.argv[2],*map(int,sys.argv[3:8])
Image.open(src).convert("RGB").crop((x,y,x+w,y+h)).resize((w*s,h*s),Image.NEAREST).save(out)
