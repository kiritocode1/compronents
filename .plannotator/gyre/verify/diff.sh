#!/bin/sh
# Seeded diff of the live Gyre studio (metalforge.xyz/gyre, 820x560 frame)
# and the port lab (820x560 box). Both engines are driven through their own
# debug handle: freeze, set appearance, place the hand, settle, setTime(t),
# then read the canvas back in the same task. Scenarios: name:appearance:t:hx:hy
set -e
D=$(cd "$(dirname "$0")/.." && pwd)
OUT=$D/evidence
PRESERVE=$D/../fx-verify/preserve.js
SCEN=${SCEN:-"d0:dark:0:0:0 d37:dark:3.7:0:0 dhand:dark:1.2:0.6:-0.5 l0:light:0:0:0 l20:light:2:-0.4:0.3"}
G='(window.__gyre||[...document.querySelectorAll("div")].find(e=>e.__gyre)?.__gyre)'
cap() { S=$1; U=$2; T=$3
  agent-browser --session $S close >/dev/null 2>&1 || true
  agent-browser --session $S --init-script $PRESERVE open "$U" >/dev/null
  agent-browser --session $S set viewport 1440 900 >/dev/null
  i=0; until [ "$(agent-browser --session $S eval "!!$G")" = "true" ]; do i=$((i+1)); [ $i -gt 60 ] && { echo "no engine on $U"; exit 1; }; sleep 0.5; done
  agent-browser --session $S eval "$G.debug.freeze(),1" >/dev/null
  sleep 0.3
  for s in $SCEN; do
    n=$(echo $s | cut -d: -f1); a=$(echo $s | cut -d: -f2); t=$(echo $s | cut -d: -f3); hx=$(echo $s | cut -d: -f4); hy=$(echo $s | cut -d: -f5)
    agent-browser --session $S eval "(()=>{const g=$G;g.set({appearance:'$a'});g.debug.hand($hx,$hy);g.debug.settle();g.debug.setTime($t);return g.canvas.toDataURL()})()" | tr -d '"' | sed 's/^data:image\/png;base64,//' | base64 -d > $OUT/$T-$n.png
  done
  agent-browser --session $S eval "JSON.stringify([devicePixelRatio,$G.canvas.width,$G.canvas.height,$G.stats()])"
  agent-browser --session $S close >/dev/null
}
cap gs https://metalforge.xyz/gyre source
cap gp https://lab.compronents.localhost:1355/gyre/ port
for s in $SCEN; do n=$(echo $s | cut -d: -f1)
  ae=$(magick compare -metric AE $OUT/source-$n.png $OUT/port-$n.png $OUT/diff-$n.png 2>&1 || true)
  rm=$(magick compare -metric RMSE $OUT/source-$n.png $OUT/port-$n.png null: 2>&1 || true)
  echo "$n differing_pixels=$ae rmse=$rm"
done
