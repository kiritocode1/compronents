# Same structural measurements on video frames and preview frames.
import subprocess, sys, re, numpy as np
from PIL import Image
P="/tmp/dhruv/venv/bin/python"
def phase(d,f,p):
    out=subprocess.run([P,"-I","/tmp/dhruv-scripts/phase.py",d,f"{f}:{p}"],capture_output=True,text=True).stdout
    m=re.search(r"x≡ ([\d.]+) y≡ ([\d.]+)",out); return float(m.group(1)),float(m.group(2))
def cells(d,f,p,px,py):
    out=subprocess.run([P,"-I","/tmp/dhruv-scripts/cells.py",d,str(f),str(p),str(px),str(py)],capture_output=True,text=True).stdout
    return out.strip().split(": ",1)[1]
def stroke(d,f):
    a=np.asarray(Image.open(f"{d}/f{f:03d}.png").convert("RGB")).astype(float)[:974]
    cov=np.clip((a[...,0]-34)/(255-34),0,1); ws=[]
    for y in range(150,850,3):
        row=cov[y,150:950]; on=row>0.15; i=0
        while i<len(row):
            if on[i]:
                j=i
                while j<len(row) and on[j]: j+=1
                if j-i<=8: ws.append(row[i:j].sum())
                i=j
            else: i+=1
    return np.median(ws)
for f,p in ((1,72),(5,70),(13,60),(36,24),(46,16),(61,14)):
    for name,d in (("video  ","/tmp/dhruv/frames"),("preview","/tmp/dhruv/impl")):
        px,py=phase(d,f,p)
        print(f"f{f:3d} pitch {p:2d} {name} stroke {stroke(d,f):.2f}px | {cells(d,f,p,px,py)}")
