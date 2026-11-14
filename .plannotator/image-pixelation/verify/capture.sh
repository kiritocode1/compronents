#!/usr/bin/env bash
# Read the canvas at every pixelation step on the source and the port (same
# photo, 1200x800 viewport) and diff them. Writes ../evidence/.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
out="$here/../evidence"
mkdir -p "$out"

save() { # stdin: json from __canvas(), $1 file
  node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const j=JSON.parse(s);const o=typeof j==="string"?JSON.parse(j):j;require("fs").writeFileSync(process.argv[1],Buffer.from(o.url.split(",")[1],"base64"));console.log(o.w+"x"+o.h)})' "$1"
}

run() {
  local who="$1" url="$2" click="$3"
  local ab=(agent-browser --session "pix-$who")
  "${ab[@]}" --init-script "$here/steps.js" set viewport 1200 800 >/dev/null
  "${ab[@]}" open "$url" >/dev/null
  "${ab[@]}" wait --load networkidle >/dev/null
  "${ab[@]}" wait 2500 >/dev/null
  echo "$who rest $("${ab[@]}" eval 'JSON.stringify(window.__canvas())' | save "$out/$who-rest.png")"
  "${ab[@]}" eval "$click" >/dev/null
  "${ab[@]}" wait 300 >/dev/null
  for i in 0 1 2 3 4; do
    echo "$who step$i $("${ab[@]}" eval 'JSON.stringify(window.__canvas())' | save "$out/$who-step$i.png")"
    "${ab[@]}" eval 'window.__next()' >/dev/null
    "${ab[@]}" wait 300 >/dev/null
  done
  "${ab[@]}" screenshot "$out/$who-end.png" >/dev/null
  "${ab[@]}" close >/dev/null || true
}

run source "https://lab.basement.studio/experiments/61.image-pixelation.tsx" \
  '[...document.querySelectorAll("button")].find(b=>/trigger pixel/i.test(b.textContent)).click()'
run port "https://lab.compronents.localhost:1355/image-pixelation/?source" \
  'document.querySelector("#root canvas").parentElement.click()'

for s in rest step0 step1 step2 step3 step4; do
  echo "$s $(magick compare -metric RMSE "$out/source-$s.png" "$out/port-$s.png" "$out/diff-$s.png" 2>&1 || true)"
done
