#!/usr/bin/env bash
# Deterministic equivalence: on the live source and on the port, take over
# requestAnimationFrame, seed Math.random (mulberry32, seed 42), replay the
# same 60-frame pointer path, then dump the cursor canvas. Identical PNGs and
# identical Math.random call counts mean the port draws the same strokes.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
out="$here/../evidence"
mkdir -p "$out"
LAB="https://scribble-lab.compronents.localhost:1355/.plannotator/scribble-cursor/index.html"
SRC="https://scribble-cursor.framer.website/"

HOOK='window.__q=[];window.requestAnimationFrame=cb=>{window.__q.push(cb);return window.__q.length};1'
RUN='(()=>{let s=42;let calls=0;Math.random=()=>{calls++;s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
for(let k=0;k<60;k++){const a=k/6;window.dispatchEvent(new PointerEvent("pointermove",{clientX:735+300*Math.cos(a),clientY:400+150*Math.sin(2*a),bubbles:true}));const cbs=window.__q.splice(0);cbs.forEach(cb=>cb(1000+k*16.667));}
const c=[...document.querySelectorAll("canvas")].find(c=>c.style.zIndex==="99999");return JSON.stringify({calls,w:c.width,h:c.height,png:c.toDataURL()})})()'

run() {
  local who="$1" url="$2"
  local ab=(agent-browser --session "scb-eq-$who")
  "${ab[@]}" set viewport 1470 800 >/dev/null
  "${ab[@]}" open "$url" >/dev/null
  "${ab[@]}" wait --load networkidle >/dev/null
  "${ab[@]}" wait 500 >/dev/null
  "${ab[@]}" eval "$HOOK" >/dev/null
  "${ab[@]}" wait 300 >/dev/null
  "${ab[@]}" eval "$RUN" > "$out/equiv-$who.json"
  "${ab[@]}" close >/dev/null || true
  /usr/bin/python3 -I - "$out/equiv-$who.json" "$out/equiv-$who.png" <<'PY'
import json, sys, base64
raw = json.load(open(sys.argv[1]))
d = json.loads(raw) if isinstance(raw, str) else raw
open(sys.argv[2], "wb").write(base64.b64decode(d["png"].split(",", 1)[1]))
print(sys.argv[2].rsplit("/", 1)[1], "random calls:", d["calls"], "canvas:", d["w"], "x", d["h"])
PY
}

run source "$SRC"
run port "$LAB"
magick compare -metric AE "$out/equiv-source.png" "$out/equiv-port.png" "$out/equiv-diff.png" 2>&1 || true
echo " differing pixels"
