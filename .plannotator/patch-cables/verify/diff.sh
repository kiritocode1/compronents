#!/bin/sh
# Seeded-clock diff of the pinned source page and the port lab, 1440x900.
# Scenario: idle tiling (f1, f30, f120, f300), hover (f360), drag a patch and
# let ink and signal run (f480, f600). Pointer events go to the canvas.
set -e
D=$(cd "$(dirname "$0")/.." && pwd)
OUT=$D/evidence
CLOCK=$D/verify/clock.js
BASE=https://fx-lab.compronents.localhost:1355/patch-cables
snap() { agent-browser --session $1 eval 'document.querySelector("canvas").toDataURL()' | tr -d '"' | sed 's/^data:image\/png;base64,//' | base64 -d > $OUT/$2.png; }
ev() { agent-browser --session $1 eval "(()=>{const c=document.querySelector('canvas');c.dispatchEvent(new PointerEvent('$2',{clientX:$3,clientY:$4,button:0,buttons:1,pointerId:1,pointerType:'mouse',bubbles:true}));return 1})()" >/dev/null; }
cap() { S=$1; U=$2; T=$3
  agent-browser --session $S close >/dev/null 2>&1 || true
  agent-browser --session $S --init-script $CLOCK open "$U" >/dev/null
  agent-browser --session $S set viewport 1440 900 >/dev/null
  agent-browser --session $S wait 2500 >/dev/null
  agent-browser --session $S eval 'window.__seed(42)' >/dev/null
  prev=0
  for f in 1 30 120 300; do agent-browser --session $S eval "window.__step($((f-prev)))" >/dev/null; prev=$f; snap $S $T-f$f; done
  ev $S pointermove 560 430; agent-browser --session $S eval "window.__step(20)" >/dev/null
  ev $S pointermove 640 470; agent-browser --session $S eval "window.__step(40)" >/dev/null; snap $S $T-f360
  ev $S pointerdown 640 470
  for x in 680 720 760 800 840; do ev $S pointermove $x 470; agent-browser --session $S eval "window.__step(2)" >/dev/null; done
  ev $S pointerup 840 470; agent-browser --session $S eval "window.__step(110)" >/dev/null; snap $S $T-f480
  agent-browser --session $S eval "window.__step(120)" >/dev/null; snap $S $T-f600
  agent-browser --session $S close >/dev/null
}
cap ps "$BASE/source/" source
cap pp "$BASE/?voice=mist" port
for f in f1 f30 f120 f300 f360 f480 f600; do
  n=$(magick compare -metric AE $OUT/source-$f.png $OUT/port-$f.png $OUT/diff-$f.png 2>&1 || true)
  echo "$f differing_pixels=$n"
done
