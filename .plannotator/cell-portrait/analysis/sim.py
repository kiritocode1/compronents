import math, json, itertools
steps={1:36,5:35,7:34,9:33,10:32,12:31,13:30,14:29,15:28,16:27,17:26,18:25,19:24,21:23,22:22,23:21,24:20,25:19,26:18,28:17,29:16,31:15,32:14,34:13,36:12,38:11,40:10,43:9,46:8,51:7,73:6,75:5,122:6,123:7,139:8,144:9,147:10,149:11,151:12,153:13,154:14,156:15,157:16,158:17,159:18,161:19,162:20,163:21,164:22,165:24,166:25,167:26,168:27,169:28,170:29,171:30,172:31,173:32,174:33,175:34,177:35,179:36}
video=[]; cur=36
for f in range(1,181):
    cur=steps.get(f,cur); video.append(cur)
col={72:0,73:.07,74:.3,75:.7,76:.86,77:.98,117:1,118:.98,119:.95,120:.81,121:.6,122:.15,123:0}
sine=lambda q:-(math.cos(math.pi*q)-1)/2
def run(T, offset):
    # frame f shows the timeline at t=(f-1)/30+offset
    out=[]
    for f in range(1,181):
        t=(f-1)/30+offset
        lc=math.log(36); c=0
        def tw(a,b,at,d,cur):
            if t<at: return cur
            q=min(1,(t-at)/d); return a+(b-a)*sine(q)
        lc=tw(math.log(36),math.log(7),*T["zoomIn"],lc)
        lc=tw(math.log(7),math.log(5),*T["detailIn"],lc)
        lc=tw(math.log(5),math.log(7),*T["detailOut"],lc)
        lc=tw(math.log(7),math.log(36),*T["zoomOut"],lc)
        c=tw(0,1,*T["colourIn"],c); c=tw(1,0,*T["colourOut"],c)
        out.append((round(math.exp(lc)),c))
    return out
def score(T,offset=0):
    o=run(T,offset)
    d=sum(1 for f in range(180) if o[f][0]!=video[f])
    ce=sum((o[f-1][1]-v)**2 for f,v in col.items())
    return d,ce,o
old={"zoomIn":(0,1.93),"detailIn":(2.37,.12),"colourIn":(2.38,.17),"colourOut":(3.88,.18),"detailOut":(3.97,.12),"zoomOut":(4.38,1.62)}
new={"zoomIn":(0,1.933),"detailIn":(2.34,.197),"colourIn":(2.39,.162),"colourOut":(3.926,.166),"detailOut":(3.997,.1),"zoomOut":(4.4,1.6)}
for name,T,off in (("current",old,0),("refit",new,1/60)):
    d,ce,o=score(T,off); print(f"{name}: cell-size mismatches {d}/180, colour SSE {ce:.3f}", [ (f+1,video[f],o[f][0]) for f in range(180) if o[f][0]!=video[f]])
# small search around refit zoom params
best=None
for zi in (1.9,1.92,1.933,1.95,1.97):
  for zs in (4.36,4.38,4.4,4.42):
    for zd in (1.58,1.6,1.62,1.64):
      if zs+zd>6.02: continue
      T=dict(new); T["zoomIn"]=(0,zi); T["zoomOut"]=(zs,zd)
      d,ce,_=score(T,1/60)
      if best is None or d<best[0]: best=(d,zi,zs,zd)
print("best zoom params (mismatches, zoomIn dur, zoomOut at, zoomOut dur):",best)
import numpy as np
best=[]
for off in (0,1/60,1/30):
  for zi in np.arange(1.85,2.01,0.01):
    for zs in np.arange(4.34,4.47,0.01):
      for zd in np.arange(1.54,1.67,0.01):
        if zs+zd>6.0+1e-9: continue
        T=dict(new); T["zoomIn"]=(0,zi); T["zoomOut"]=(zs,zd)
        d,ce,_=score(T,off)
        best.append((d,round(off*30,2),round(zi,2),round(zs,2),round(zd,2)))
best.sort(); print("top fits (mismatches, offset frames, zoomIn dur, zoomOut at, zoomOut dur):", best[:6])
T=dict(new); d,off,zi,zs,zd=best[0]; T["zoomIn"]=(0,zi); T["zoomOut"]=(zs,zd)
dd,ce,o=score(T,off/30); print("chosen:",T,"offset",off,"mismatches",dd,"colour SSE",round(ce,3))
print([(f+1,video[f],o[f][0]) for f in range(180) if o[f][0]!=video[f]])
F={"zoomIn":(0,1.91),"detailIn":(2.323,.197),"colourIn":(2.373,.162),"colourOut":(3.909,.166),"detailOut":(3.98,.1),"zoomOut":(4.39,1.61)}
d,ce,o=score(F,0); print("FINAL mismatches",d,"/180 (all ±1px)" if all(abs(o[f][0]-video[f])<=1 for f in range(180)) else "", "colour SSE",round(ce,3))
