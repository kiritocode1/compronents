import subprocess, re
P="/tmp/dhruv/venv/bin/python"
def phase(d,f,p):
    out=subprocess.run([P,"-I","/tmp/dhruv-scripts/phase.py",d,f"{f}:{p}"],capture_output=True,text=True).stdout
    m=re.search(r"x≡ ([\d.]+) y≡ ([\d.]+)",out); return m.group(1),m.group(2)
def counts(d,f,p):
    px,py=phase(d,f,p)
    out=subprocess.run([P,"-I","/tmp/dhruv-scripts/cells.py",d,str(f),str(p),px,py],capture_output=True,text=True).stdout
    m=re.search(r"\{'full': (\d+), 'thin': (\d+), 'none': (\d+)\}",out); return [int(x) for x in m.groups()]
bands={"coarse (70-60 video px)":[(1,72),(5,70),(7,68),(9,66),(12,62),(13,60)],"fine (14 video px)":[(53,14),(57,14),(61,14),(65,14),(69,14)]}
for band,fr in bands.items():
    for name,d in (("video","/tmp/dhruv/frames"),("preview","/tmp/dhruv/impl")):
        tot=[0,0,0]
        for f,p in fr:
            c=counts(d,f,p); tot=[a+b for a,b in zip(tot,c)]
        n=sum(tot); print(f"{band:24s} {name:8s} n={n:5d} full={tot[0]/n:.3f} thin={tot[1]/n:.3f}")
