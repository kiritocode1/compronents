#!/usr/bin/env bash
# Real-time capture of the source, the port with the source glyphs (?original)
# and the port with BLANK glyphs, at the same delays after load, cropped to
# the 1200x514 canvas. Physics is randomised on both, so these are compared
# by measurement (colour, dither pitch, landing time, pile), not pixel diff.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
out="$here/../evidence"
mkdir -p "$out"
TIMES=(1500 2500 3500 9000)

run() {
  local who="$1" url="$2"
  local ab=(agent-browser --session "rain-$who")
  "${ab[@]}" set viewport 1200 800 >/dev/null
  "${ab[@]}" open "$url" >/dev/null
  "${ab[@]}" wait --load networkidle >/dev/null
  "${ab[@]}" eval 'window.__t0 = performance.now(); document.hidden' >/dev/null
  local prev=0
  for t in "${TIMES[@]}"; do
    "${ab[@]}" wait $((t - prev)) >/dev/null
    prev=$t
    "${ab[@]}" screenshot "$out/$who-full-$t.png" >/dev/null
    local y
    y=$("${ab[@]}" eval 'Math.round([...document.querySelectorAll("canvas")].sort((a,b)=>b.offsetWidth-a.offsetWidth)[0].getBoundingClientRect().top)')
    magick "$out/$who-full-$t.png" -crop "1200x514+0+${y//\"/}" +repage "$out/$who-$t.png"
    rm "$out/$who-full-$t.png"
  done
  "${ab[@]}" close >/dev/null || true
}

run source "https://lab.basement.studio/experiments/34.svg-rain.js"
run original "https://lab.compronents.localhost:1355/svg-rain/?original"
run blank "https://lab.compronents.localhost:1355/svg-rain/"

for t in "${TIMES[@]}"; do
  magick "$out/source-$t.png" "$out/original-$t.png" "$out/blank-$t.png" -append -resize 50% "$out/col-$t.png"
done
magick "$out"/col-*.png +append "$out/strip.png"
