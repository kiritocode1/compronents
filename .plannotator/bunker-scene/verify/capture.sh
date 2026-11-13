#!/usr/bin/env bash
# Capture matched frames of the source and the port (?original, so both show
# the B U N K E R letters) under the virtual clock in clock.js, then diff them.
#
# usage: capture.sh [nonoise|noise]
#   nonoise  (default) both pages without film noise, the like-for-like diff
#   noise    film noise on, as shipped
# Both modes hold the particle drift still (uParticleVelocity 0): the source's
# R3F clock starts frames before its model loads, the port's at its first
# scene frame, so their uTime differs by however long the GLB took.
#
# Alignment: the page is stepped one frame at a time (with a short real wait
# for loading) until its particles are uploaded. That frame is the first scene
# frame on both pages and the first tick of the sun timeline. Frame numbers
# below count from it: 150 is t = 2.5s, the first flicker.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
mode="${1:-nonoise}"
out="$here/../evidence/$mode"
mkdir -p "$out"

if [ "$mode" = "noise" ]; then
  SRC='https://lab.basement.studio/experiments/32.bunker-scene.js?_config=%7B%22uParticleVelocity%22%3A0%7D'
  PORT="https://lab.compronents.localhost:1355/bunker-scene/?original&still"
else
  SRC='https://lab.basement.studio/experiments/32.bunker-scene.js?_config=%7B%22noise%22%3Afalse%2C%22uParticleVelocity%22%3A0%7D'
  PORT="https://lab.compronents.localhost:1355/bunker-scene/?original&nonoise&still"
fi

# name:frame pairs, captured cumulatively. 152 on, 155 off, 158 on, 165 off,
# 180 lit (flicker done).
FRAMES=(f060:60 f152:152 f155:155 f158:158 f165:165 f180:180)
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

read -r -d '' HIDE_PANEL <<'JS' || true
(() => {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (node.textContent.trim() !== "fogNear") continue;
    let el = node.parentElement;
    while (el.parentElement && el.parentElement !== document.body && !el.parentElement.querySelector("canvas")) el = el.parentElement;
    el.style.visibility = "hidden";
    return el.className.toString().slice(0, 40);
  }
  return "no panel";
})()
JS

shoot() {
  local who="$1" url="$2" init="$3" s="bunker-$1-$mode"
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
  "${ab[@]}" mouse move 600 400 >/dev/null
  "${ab[@]}" wait 500 >/dev/null
  "${ab[@]}" eval "window.__step($((240 - done)))" >/dev/null
  "${ab[@]}" screenshot "$out/$who-settled.png" >/dev/null
  if [ "$who" = "source" ]; then
    "${ab[@]}" eval 'JSON.stringify(window.__pts)' | python3 -c 'import json,sys; print("window.__ptsInject = new Float32Array(" + json.loads(sys.stdin.read()) + ");")' > "$here/.inject.js"
  fi
  "${ab[@]}" close >/dev/null || true
  for f in "$out/$who"-*.png; do magick "$f" -crop "$CROP" +repage "$f"; done
}

shoot source "$SRC" "$here/clock.js"
cat "$here/clock.js" "$here/.inject.js" > "$here/.clock-inject.js"
shoot port "$PORT" "$here/.clock-inject.js"

: > "$out/rmse.txt"
for f in "$out"/source-*.png; do
  state="${f##*/source-}"
  r=$(magick compare -metric RMSE "$f" "$out/port-$state" "$out/diff-$state" 2>&1 || true)
  echo "${state%.png} $r" | tee -a "$out/rmse.txt"
done
