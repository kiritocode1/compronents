# Lab-only: mean colour of the darkest N% of pixels in an ImageMagick txt: dump on stdin.
import sys, re
frac = float(sys.argv[1]); label = sys.argv[2]
px = []
for line in sys.stdin:
    m = re.search(r"#([0-9A-Fa-f]{6})", line)
    if m:
        h = m.group(1); px.append(tuple(int(h[i:i+2], 16) for i in (0, 2, 4)))
px.sort(key=sum)
k = px[: max(1, int(len(px) * frac))]
print(label, "#%02X%02X%02X" % tuple(round(sum(p[i] for p in k) / len(k)) for i in range(3)))
