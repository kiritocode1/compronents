#!/bin/sh
# Seeded-clock comparison of the halftone source page and the port lab.
# Both pages load on real time, then step identical 60Hz frames; the dot
# canvas (transparent, no UI) is read back with toDataURL and diffed.
set -e
D=$(cd "$(dirname "$0")/.." && pwd)
OUT=$D/halftone/evidence
CLOCK=$D/fx-verify/clock.js
cap() { # session url tag
  S=$1; U=$2; T=$3
  agent-browser --session $S close >/dev/null 2>&1 || true
  agent-browser --session $S --init-script $CLOCK open "$U" >/dev/null
  agent-browser --session $S set viewport 1440 900 >/dev/null
  agent-browser --session $S wait 4000 >/dev/null
  prev=0
  for f in 1 30 120 300; do
    agent-browser --session $S eval "window.__step($((f-prev)))" >/dev/null; prev=$f
    agent-browser --session $S eval 'document.querySelector("canvas").toDataURL()' | tr -d '"' | sed 's/^data:image\/png;base64,//' | base64 -d > $OUT/$T-f$f.png
  done
  agent-browser --session $S eval '(()=>{const r=document.querySelector("canvas").parentElement;r.dispatchEvent(new PointerEvent("pointermove",{clientX:560,clientY:430,bubbles:true}));return 1})()' >/dev/null
  agent-browser --session $S eval "window.__step(60)" >/dev/null
  agent-browser --session $S eval 'document.querySelector("canvas").toDataURL()' | tr -d '"' | sed 's/^data:image\/png;base64,//' | base64 -d > $OUT/$T-lens.png
  agent-browser --session $S close >/dev/null
}
cap hs https://thehalftonepro.framer.website/ source
cap hp https://fx-lab.compronents.localhost:1355/halftone/ port
for f in f1 f30 f120 f300 lens; do
  n=$(magick compare -metric AE $OUT/source-$f.png $OUT/port-$f.png $OUT/diff-$f.png 2>&1 || true)
  echo "$f differing_pixels=$n"
done
