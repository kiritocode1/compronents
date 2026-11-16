#!/bin/sh
# Seeded-clock comparison of the Unfocused source page and the port lab.
# Frame 0 is the fully blurred first paint after load; later frames step the
# 2s focus pull at 60Hz. The WebGL canvas is read back and diffed.
set -e
D=$(cd "$(dirname "$0")/.." && pwd)
OUT=$D/unfocused/evidence
FRAMES="0 1 2 30 31 60 61 90 91 120 121 150"
cap() { # session url tag
  S=$1; U=$2; T=$3
  agent-browser --session $S close >/dev/null 2>&1 || true
  agent-browser --session $S --init-script $D/fx-verify/clock.js --init-script $D/fx-verify/preserve.js open "$U" >/dev/null
  agent-browser --session $S set viewport 1440 900 >/dev/null
  agent-browser --session $S wait 4000 >/dev/null
  prev=0
  for f in $FRAMES; do
    [ $f -gt $prev ] && agent-browser --session $S eval "window.__step($((f-prev)))" >/dev/null; prev=$f
    agent-browser --session $S eval 'document.querySelector("canvas").toDataURL()' | tr -d '"' | sed 's/^data:image\/png;base64,//' | base64 -d > $OUT/$T-f$f.png
  done
  agent-browser --session $S close >/dev/null
}
cap us https://unfocused.framer.website/ source
cap up https://fx-lab.compronents.localhost:1355/unfocused/ port
for f in $FRAMES; do
  n=$(magick compare -metric AE $OUT/source-f$f.png $OUT/port-f$f.png $OUT/diff-f$f.png 2>&1 || true)
  r=$(magick compare -metric RMSE $OUT/source-f$f.png $OUT/port-f$f.png null: 2>&1 || true)
  echo "f$f differing_pixels=$n rmse=$r"
done
