#!/usr/bin/env bash
# Input check on both pages under the frozen clock from clock.js, so drag
# velocity is identical: a 10-frame drag of 340px to the left, a 700px wheel,
# then a click on the second card to the left. Each lands after 120 frames.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
out="$here/../evidence"

# Synthesised events dispatched at a point, bubbling to the carousel root.
read -r -d '' HELPERS <<'JS' || true
window.__ptr = (type, x, y) => {
  const el = document.elementFromPoint(x, y);
  el.dispatchEvent(new PointerEvent(type, { bubbles: true, clientX: x, clientY: y, pointerId: 7, button: 0, isPrimary: true, pointerType: "mouse" }));
};
window.__drag = () => {
  __ptr("pointerdown", 900, 400);
  for (let i = 1; i <= 10; i++) { __step(1); __ptr("pointermove", 900 - 34 * i, 400); }
  __ptr("pointerup", 560, 400);
  __step(120);
};
window.__wheel = () => {
  const root = document.querySelector("[aria-roledescription=carousel]");
  root.dispatchEvent(new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: 700, clientX: 600, clientY: 400 }));
  __step(6);
};
window.__click = () => { __ptr("pointerdown", 270, 400); __ptr("pointerup", 270, 400); __step(120); };
JS

run() {
  local who="$1" url="$2"
  local ab=(agent-browser --session "input-$who")
  "${ab[@]}" --init-script "$here/clock.js" set viewport 1200 800 >/dev/null
  "${ab[@]}" open "$url" >/dev/null
  "${ab[@]}" wait --load networkidle >/dev/null
  "${ab[@]}" wait 3500 >/dev/null
  "${ab[@]}" eval 'document.querySelectorAll(".__framer-badge,#__framer-badge-container").forEach(e=>e.style.display="none")' >/dev/null
  "${ab[@]}" eval "$HELPERS" >/dev/null
  "${ab[@]}" eval 'window.__freeze(1)' >/dev/null
  "${ab[@]}" eval 'window.__drag()' >/dev/null
  "${ab[@]}" screenshot "$out/input-$who-drag.png" >/dev/null
  "${ab[@]}" eval 'window.__wheel()' >/dev/null
  "${ab[@]}" wait 400 >/dev/null   # the source snaps the wheel goal on a real 150ms timer
  "${ab[@]}" eval 'window.__step(120)' >/dev/null
  "${ab[@]}" screenshot "$out/input-$who-wheel.png" >/dev/null
  "${ab[@]}" eval 'window.__click()' >/dev/null
  "${ab[@]}" screenshot "$out/input-$who-cardclick.png" >/dev/null
  "${ab[@]}" close >/dev/null || true
}

run source "https://phonestackcarousel.framer.website/"
run port "https://lab.compronents.localhost:1355/phone-stack-carousel/"

for s in drag wheel cardclick; do
  echo "$s $(magick compare -metric RMSE "$out/input-source-$s.png" "$out/input-port-$s.png" null: 2>&1 || true)"
done
magick \( "$out/input-source-drag.png" "$out/input-source-wheel.png" "$out/input-source-cardclick.png" +append \) \
  \( "$out/input-port-drag.png" "$out/input-port-wheel.png" "$out/input-port-cardclick.png" +append \) \
  -append -resize 40% "$out/input-strip.png"
