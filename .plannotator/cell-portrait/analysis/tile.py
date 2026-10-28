import sys, numpy as np
from PIL import Image, ImageDraw
d, out, x, y, w, h, scale, cols = sys.argv[1], sys.argv[2], *map(int, sys.argv[3:7]), float(sys.argv[7]), int(sys.argv[8])
idx = [int(s) for s in sys.argv[9].split(",")]
tw, th = int(w*scale), int(h*scale)
rows = (len(idx)+cols-1)//cols
sheet = Image.new("RGB", (cols*tw, rows*th), (0,0,0))
for k,i in enumerate(idx):
    im = Image.open(f"{d}/f{i:03d}.png").convert("RGB").crop((x,y,x+w,y+h)).resize((tw,th), Image.LANCZOS)
    ImageDraw.Draw(im).text((4,4), str(i), fill=(255,255,0))
    sheet.paste(im, ((k%cols)*tw, (k//cols)*th))
sheet.save(out)
