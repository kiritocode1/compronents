#!/usr/bin/env bash
# Capture matched frames from the source and the port, then diff them.
# usage: capture.sh   (writes ../evidence/{source,port}-<state>.png and rmse.txt)
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
out="$here/../evidence"
mkdir -p "$out"

SRC="https://phonestackcarousel.framer.website/"
PORT="https://lab.compronents.localhost:1355/phone-stack-carousel/"

# frame counts after one ArrowRight, captured cumulatively
STEPS=(4 8 12 18 26 40 90)

shoot() {
  local who="$1" url="$2" s="carousel-$1"
  local ab=(agent-browser --session "$s")
  "${ab[@]}" --init-script "$here/clock.js" set viewport 1200 800 >/dev/null
  "${ab[@]}" open "$url" >/dev/null
  "${ab[@]}" wait --load networkidle >/dev/null
  "${ab[@]}" wait 3500 >/dev/null
  "${ab[@]}" eval 'document.querySelectorAll(".__framer-badge,#__framer-badge-container").forEach(e=>e.style.display="none")' >/dev/null
  "${ab[@]}" eval 'window.__freeze(1)' >/dev/null
  "${ab[@]}" eval 'window.__step(2)' >/dev/null
  "${ab[@]}" screenshot "$out/$who-settled.png" >/dev/null
  "${ab[@]}" eval 'document.querySelector("[aria-roledescription=carousel]").dispatchEvent(new KeyboardEvent("keydown",{key:"ArrowRight",bubbles:true}))' >/dev/null
  local done=0
  for n in "${STEPS[@]}"; do
    "${ab[@]}" eval "window.__step($((n - done)))" >/dev/null
    done=$n
    "${ab[@]}" screenshot "$out/$who-f$(printf %03d "$n").png" >/dev/null
  done
  "${ab[@]}" close >/dev/null || true
}

shoot source "$SRC"
shoot port "$PORT"

: > "$out/rmse.txt"
for f in "$out"/source-*.png; do
  state="${f##*/source-}"
  r=$(magick compare -metric RMSE "$f" "$out/port-$state" "$out/diff-$state" 2>&1 || true)
  echo "${state%.png} $r" | tee -a "$out/rmse.txt"
done
