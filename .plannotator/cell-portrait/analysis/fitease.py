import numpy as np, math
# CSS px value -> first frame shown (forward zoom-in)
fwd={35:5,34:7,33:9,32:10,31:12,30:13,29:14,28:15,27:16,26:17,25:18,24:19,23:21,22:22,21:23,20:24,19:25,18:26,17:28,16:29,15:31,14:32,13:34,12:36,11:38,10:40,9:43,8:46,7:51}
# reverse zoom-out: value -> first frame shown
rev={8:139,9:144,10:147,11:149,12:151,13:153,14:154,15:156,16:157,17:158,18:159,19:161,20:162,21:163,22:164,24:165,25:166,26:167,27:168,28:169,29:170,30:171,31:172,32:173,33:174,34:175,35:177,36:179}
def pw(n):
    i=lambda t:t**n; o=lambda t:1-(1-t)**n
    io=lambda t: (2*t)**n/2 if t<.5 else 1-(2-2*t)**n/2
    return i,o,io
E={}
for n,name in ((2,"power1"),(3,"power2"),(4,"power3"),(5,"power4")):
    i,o,io=pw(n); E[name+".in"]=i;E[name+".out"]=o;E[name+".inOut"]=io
E["sine.inOut"]=lambda t:-(math.cos(math.pi*t)-1)/2
E["sine.out"]=lambda t:math.sin(t*math.pi/2)
E["sine.in"]=lambda t:1-math.cos(t*math.pi/2)
E["expo.inOut"]=lambda t: 0 if t==0 else 1 if t==1 else (2**(20*t-10)/2 if t<.5 else (2-2**(-20*t+10))/2)
E["expo.out"]=lambda t: 1 if t==1 else 1-2**(-10*t)
E["circ.inOut"]=lambda t: (1-math.sqrt(1-(2*t)**2))/2 if t<.5 else (math.sqrt(1-(-2*t+2)**2)+1)/2
E["none"]=lambda t:t
spaces={"linear":lambda P:P,"log":math.log,"inv":lambda P:1/P}
def fit(data,a,b):
    # value at time: space(a)+(space(b)-space(a))*ease((t-s)/D); displayed=round(value). crossing of v+-0.5
    res=[]
    for sp,f in spaces.items():
        for en,e in E.items():
            best=None
            for D in np.arange(20,90,0.5):
                for s in np.arange(-10,60,0.5) if a>b else np.arange(120,175,0.5):
                    err=0
                    for v,fr in data.items():
                        # boundary between previous value and v
                        bnd = v+0.5 if a>b else v-0.5
                        q=(f(bnd)-f(a))/(f(b)-f(a))
                        # invert ease numerically
                        lo,hi=0.,1.
                        for _ in range(30):
                            m=(lo+hi)/2
                            if e(m)<q: lo=m
                            else: hi=m
                        tc=s+lo*D  # crossing time in frames
                        # displayed first at ceil(tc) -> compare to fr-0.5
                        err+=(tc-(fr-0.5))**2
                    if best is None or err<best[0]: best=(err,s,D)
            res.append((best[0],sp,en,best[1],best[2]))
    res.sort()
    return res[:8]
print("FORWARD 36->7")
for r in fit(fwd,36,7): print(" err=%.1f space=%s ease=%s start=%.1f dur=%.1f frames (%.2fs)"%(r[0],r[1],r[2],r[3],r[4],r[4]/30))
print("REVERSE 7->36")
for r in fit(rev,7,36): print(" err=%.1f space=%s ease=%s start=%.1f dur=%.1f frames (%.2fs)"%(r[0],r[1],r[2],r[3],r[4],r[4]/30))
