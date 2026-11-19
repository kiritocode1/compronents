#!/bin/sh
# Headless synth vs the pinned source, same seeded clock and pointer path.
# Source: Clear before the first frame and before the resize to 1440x900 (its
# rebuild would otherwise carry the tiles over as closed cells; the synth has none), then one
# off-diagonal click to start the audio, then sweeps at three speeds.
set -e
D=$(cd "$(dirname "$0")/.." && pwd)
OUT=$D/evidence/synth
mkdir -p $OUT
BASE=https://fx-lab.compronents.localhost:1355/patch-cables
st() { agent-browser --session $1 eval "window.__step($2)" >/dev/null; }
run() { S=$1; U=$2; T=$3; V=$4; PRE=$5; TGT=$6
  ev() { agent-browser --session $S eval "(()=>{const c=$TGT;c.dispatchEvent(new PointerEvent('$1',{clientX:$2,clientY:$3,button:0,buttons:1,pointerId:1,pointerType:'mouse',bubbles:true}));return 1})()" >/dev/null; }
  agent-browser --session $S close >/dev/null 2>&1 || true
  agent-browser --session $S --init-script $D/verify/clock.js --init-script $D/verify/audio.js open "$U" >/dev/null
  agent-browser --session $S eval "$PRE" >/dev/null
  agent-browser --session $S set viewport 1440 900 >/dev/null
  agent-browser --session $S wait 2500 >/dev/null
  agent-browser --session $S eval 'window.__alog.push("MARK");window.__seed(11)' >/dev/null
  st $S 5
  ev pointermove 746 444; ev pointerdown 746 444; st $S 3; ev pointerup 746 444; st $S 90
  # slow sweep, 8px a frame
  x=200; while [ $x -le 700 ]; do ev pointermove $x 300; st $S 1; x=$((x+8)); done
  # medium, 30px a frame
  x=1300; while [ $x -ge 300 ]; do ev pointermove $x 600; st $S 1; x=$((x-30)); done
  # frantic zigzag, 90px a frame
  for k in 1 2 3; do for p in "200 150" "500 800" "800 120" "1100 780" "1350 200" "1000 500" "600 300" "250 700"; do ev pointermove $p; st $S 1; done; done
  st $S 200
  agent-browser --session $S eval 'JSON.stringify(window.__alog)' | python3 -c 'import json,sys; print("\n".join(json.loads(json.loads(sys.stdin.read()))))' > $OUT/$T-$V.log
  agent-browser --session $S close >/dev/null
}
for V in mist pluck bloop acid; do
  run ss "$BASE/source/" source $V "document.getElementById('pClear').click();document.querySelector('[data-voice=$V]').click()" "document.querySelector('canvas')"
  run sp "$BASE/cursor-synth/?voice=$V" synth $V "dispatchEvent(new KeyboardEvent('keydown'))" "document.body"
  # The source's voice button plays a preview note; drop the lines it adds before the click so both start at the first gesture.
  python3 norm.py $OUT/source-$V.log > $OUT/source-$V.norm; python3 norm.py $OUT/synth-$V.log > $OUT/synth-$V.norm
  if cmp -s $OUT/source-$V.norm $OUT/synth-$V.norm; then r=identical; else r=DIFFERENT; fi
  echo "$V notes=$(grep -c createStereoPanner $OUT/source-$V.norm)/$(grep -c createStereoPanner $OUT/synth-$V.norm) lines=$(wc -l < $OUT/source-$V.norm) $r"
done
