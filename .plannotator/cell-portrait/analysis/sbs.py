# sbs.py out.png scale f1,f2,... : video frame (top) vs implementation frame (bottom), cropped to the video's 1078x974
import sys
from PIL import Image, ImageDraw
out,scale,fs=sys.argv[1],float(sys.argv[2]),[int(x) for x in sys.argv[3].split(",")]
W,H=int(1078*scale),int(974*scale)
sheet=Image.new("RGB",(W*len(fs),H*2+24),(20,20,20))
d=ImageDraw.Draw(sheet)
for k,f in enumerate(fs):
    v=Image.open(f"/tmp/dhruv/frames/f{f:03d}.png").convert("RGB").resize((W,H),Image.LANCZOS)
    m=Image.open(f"/tmp/dhruv/impl/f{f:03d}.png").convert("RGB").crop((0,0,1078,974)).resize((W,H),Image.LANCZOS)
    sheet.paste(v,(k*W,0)); sheet.paste(m,(k*W,H+24))
    d.text((k*W+6,H+6),f"frame {f}  t={(f-1)/30:.2f}s   top: video   bottom: preview",fill=(255,255,0))
sheet.save(out)
