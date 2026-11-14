#!/usr/bin/env bash
# Capture matched frames of the source and the port under the virtual clock in
# clock.js, then diff them.
#
# usage: capture.sh [nonoise|noise|blank]
#   nonoise  (default) source vs port with the source sign (?original), film
#            noise off on both: the like-for-like diff
#   noise    the same with noise on (0.2), as shipped; random per frame
#   blank    the port with the BLANK sign, noise off and on; no source pass
#
# Alignment: the page is stepped one frame at a time (with a short real wait
# for loading) until its particles are uploaded. That frame is the first scene
# frame on both pages; the neon timeline starts with it, so frame 120 is
# t = 2s, the first flicker. Particle drift is pinned (uTime 0 on both) and the
# port draws the source's particle positions.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
mode="${1:-nonoise}"
out="$here/../evidence/$mode"
mkdir -p "$out"

SRC_BASE='https://lab.basement.studio/experiments/36.xero-scene.js'
PORT_BASE='https://lab.compronents.localhost:1355/xero-scene/'
case "$mode" in
  nonoise)
    SRC="$SRC_BASE?_config=%7B%22noiseOpacity%22%3A0%7D"
    PORT="$PORT_BASE?original&nonoise" ;;
  noise)
    SRC="$SRC_BASE"
    PORT="$PORT_BASE?original" ;;
  blank)
    PORT="$PORT_BASE?nonoise"
    PORT_NOISE="$PORT_BASE" ;;
  *) echo "unknown mode $mode" >&2; exit 1 ;;
esac

# name:frame pairs, captured cumulatively from the first scene frame.
# 060 dark, 121 first flash, 140 first fade, 150 second flash, 165 second
# fade, 200 dark gap, 260 and 300 the slow rise, 360 settled.
FRAMES=(f060:60 f121:121 f140:140 f150:150 f165:165 f200:200 f260:260 f300:300 f360:360)
CROP="1200x514+0+143"

read -r -d '' WAIT_SCENE <<'JS' || true
(async () => {
  for (let i = 0; i < 900; i++) {
    if (window.__pts) return i;
    __step(1);
    await new Promise((r) => setTimeout(r, 60));
  }
  return -1;
})()
JS

read -r -d '' STEP_SLOW <<'JS' || true
(async () => {
  for (let i = 0; i < 20; i++) {
    __step(1);
    await new Promise((r) => setTimeout(r, 40));
  }
  return 20;
})()
JS

read -r -d '' HIDE_PANEL <<'JS' || true
(() => {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (node.textContent.trim() !== "Vignette") continue;
    let el = node.parentElement;
    while (el.parentElement && el.parentElement !== document.body && !el.parentElement.querySelector("canvas")) el = el.parentElement;
    el.style.visibility = "hidden";
    return el.className.toString().slice(0, 40);
  }
  return "no panel";
})()
JS

shoot() {
  local who="$1" url="$2" init="$3" s="xero-$1-$mode-$$"
  local ab=(agent-browser --session "$s" --init-script "$init")
  "${ab[@]}" set viewport 1200 800 >/dev/null
  "${ab[@]}" open "$url" >/dev/null
  "${ab[@]}" wait --load networkidle >/dev/null
  echo "$who frames before scene: $("${ab[@]}" eval "$WAIT_SCENE")"
  "${ab[@]}" eval "$HIDE_PANEL" >/dev/null
  local done=1
  for pair in "${FRAMES[@]}"; do
    local name="${pair%%:*}" n="${pair##*:}"
    "${ab[@]}" eval "window.__step($((n - done)))" >/dev/null
    done=$n
    "${ab[@]}" screenshot "$out/$who-$name.png" >/dev/null
  done
  # Cursor. The first move while the orbit runs snaps the camera to the orbit
  # start pose (the source's gsap 3.11 context revert, see the component).
  # The second move eases to the cursor; y 400 is the vertical centre of both
  # the window (source) and the component box (port), so both read y = 0.
  # 2.5s after it the camera eases back towards the orbit start over 10s.
  "${ab[@]}" mouse move 600 400 >/dev/null
  "${ab[@]}" wait 300 >/dev/null
  "${ab[@]}" eval "window.__step($((420 - done)))" >/dev/null
  "${ab[@]}" screenshot "$out/$who-cursor.png" >/dev/null
  "${ab[@]}" mouse move 900 400 >/dev/null
  "${ab[@]}" wait 300 >/dev/null
  "${ab[@]}" eval "window.__step(12)" >/dev/null
  "${ab[@]}" screenshot "$out/$who-ease.png" >/dev/null
  # Frames 13..342 after the move. The 2.5s timer fires at frame 150; the
  # source's React state update it makes is flushed between tasks, so step
  # one frame per task across it.
  "${ab[@]}" eval "window.__step(135)" >/dev/null
  "${ab[@]}" eval "$STEP_SLOW" >/dev/null
  "${ab[@]}" eval "window.__step(175)" >/dev/null
  "${ab[@]}" screenshot "$out/$who-return.png" >/dev/null
  "${ab[@]}" eval 'JSON.stringify({uniforms: window.__uniforms, log: window.__log})' \
    | python3 -I -c 'import json,sys; print(json.dumps(json.loads(json.loads(sys.stdin.read()))))' > "$out/$who-log.json"
  if [ "$who" = "source" ]; then
    "${ab[@]}" eval 'JSON.stringify(window.__pts)' \
      | python3 -I -c 'import json,sys; print("window.__ptsInject = new Float32Array(" + json.loads(sys.stdin.read()) + ");")' > "$here/.inject.js"
  fi
  "${ab[@]}" close >/dev/null || true
  for f in "$out/$who"-*.png; do magick "$f" -crop "$CROP" +repage "$f"; done
}

if [ "$mode" = "blank" ]; then
  shoot port "$PORT" "$here/clock.js"
  out="$out-noise"; mkdir -p "$out"
  shoot port "$PORT_NOISE" "$here/clock.js"
  exit 0
fi

shoot source "$SRC" "$here/clock.js"
cat "$here/clock.js" "$here/.inject.js" > "$here/.clock-inject.js"
shoot port "$PORT" "$here/.clock-inject.js"

: > "$out/rmse.txt"
for f in "$out"/source-f*.png "$out"/source-cursor.png "$out"/source-ease.png "$out"/source-return.png; do
  state="${f##*/source-}"
  r=$(magick compare -metric RMSE "$f" "$out/port-$state" "$out/diff-$state" 2>&1 || true)
  echo "${state%.png} $r" | tee -a "$out/rmse.txt"
done
# Motion control: two source frames, to show what a real difference measures.
r=$(magick compare -metric RMSE "$out/source-f300.png" "$out/source-f360.png" null: 2>&1 || true)
echo "control source-f300-vs-f360 $r" | tee -a "$out/rmse.txt"
r=$(magick compare -metric RMSE "$out/source-f060.png" "$out/source-f121.png" null: 2>&1 || true)
echo "control source-f060-vs-f121 $r" | tee -a "$out/rmse.txt"
