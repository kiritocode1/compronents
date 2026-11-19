#!/bin/sh
# Same seeded scenario on source and port, once per voice: switch voice the
# way the Sound buttons do, sweep the cursor over the tiling so necks close,
# draw a patch so signal pulses arrive at jacks, then dump the audio log.
set -e
D=$(cd "$(dirname "$0")/.." && pwd)
OUT=$D/evidence/audio
mkdir -p $OUT
BASE=https://fx-lab.compronents.localhost:1355/patch-cables
ev() { agent-browser --session $1 eval "(()=>{const c=document.querySelector('canvas');c.dispatchEvent(new PointerEvent('$2',{clientX:$3,clientY:$4,button:0,buttons:1,pointerId:1,pointerType:'mouse',bubbles:true}));return 1})()" >/dev/null; }
st() { agent-browser --session $1 eval "window.__step($2)" >/dev/null; }
run() { S=$1; U=$2; T=$3; V=$4; SET=$5
  agent-browser --session $S close >/dev/null 2>&1 || true
  agent-browser --session $S --init-script $D/verify/clock.js --init-script $D/verify/audio.js open "$U" >/dev/null
  agent-browser --session $S set viewport 1440 900 >/dev/null
  agent-browser --session $S wait 2500 >/dev/null
  agent-browser --session $S eval 'window.__seed(7)' >/dev/null
  st $S 120
  agent-browser --session $S eval "$SET" >/dev/null; agent-browser --session $S wait 300 >/dev/null
  st $S 10
  for x in 300 380 460 540 620 700 780 860 940; do ev $S pointermove $x 420; st $S 6; done
  ev $S pointerdown 500 600
  for x in 540 580 620 660 700; do ev $S pointermove $x 600; st $S 2; done
  ev $S pointerup 700 600; ev $S pointermove 1300 100; st $S 400
  agent-browser --session $S eval 'JSON.stringify(window.__alog)' | python3 -c 'import json,sys; print("\n".join(json.loads(json.loads(sys.stdin.read()))))' > $OUT/$T-$V.log
  agent-browser --session $S close >/dev/null
}
for V in mist pluck bloop acid; do
  run as "$BASE/source/" source $V "document.querySelector('[data-voice=$V]').click()"
  run ap "$BASE/" port $V "window.__setVoice('$V')"
  if cmp -s $OUT/source-$V.log $OUT/port-$V.log; then r=identical; else r=DIFFERENT; fi
  echo "$V lines=$(wc -l < $OUT/source-$V.log) notes=$(grep -c 'createGain()' $OUT/source-$V.log) $r"
done
