#!/usr/bin/env bash
# Builds xero-blank.glb from the pinned source model.
#
#   1. Emission texture (Cartel_emission_2_low, 1024x1024 progressive JPEG,
#      4:2:0, quality 91): the wordmark and the "DISPLAY TYPEFACE" line are
#      painted white inside one MCU-aligned 432x112 block (x 272..703,
#      y 448..559). The block is dropped back in with `jpegtran -drop`, which
#      copies every other DCT block untouched, so the grey falloff outside the
#      block decodes to the same pixels as the source.
#   2. The sign's normal map (Cartel_NB_low) is removed. It only embosses the
#      wordmark, and the sign material has no direct light and envMapIntensity
#      0, so it never changes a pixel.
#   3. Image names lose the source typeface name.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
repo="$(cd "$here/../../.." && pwd)"
src="$repo/reference/xero-scene/xero.glb"
out="$here/../xero-blank.glb"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

node "$here/glb.mjs" extract "$src" "$work"
em="$work/img3.jpeg"

# Letters: wordmark x 285..697, y 455..518; subtitle x 374..607, y 535..546.
# Both padded by 4px and painted white; the rest of the block keeps its pixels.
BX=272 BY=448 BW=432 BH=112
magick "$em" -crop "${BW}x${BH}+${BX}+${BY}" +repage \
  -fill white \
  -draw "rectangle $((285 - 4 - BX)),$((455 - 4 - BY)) $((697 + 4 - BX)),$((518 + 4 - BY))" \
  -draw "rectangle $((374 - 4 - BX)),$((535 - 4 - BY)) $((607 + 4 - BX)),$((546 + 4 - BY))" \
  "$work/block.ppm"
cjpeg -quality 91 -sample 2x2,1x1,1x1 "$work/block.ppm" > "$work/block.jpg"
jpegtran -copy none -optimize -progressive -drop "+${BX}+${BY}" "$work/block.jpg" "$em" > "$work/img3-clean.jpeg"

node "$here/glb.mjs" build "$src" "$work/img3-clean.jpeg" "$out"

# Check: outside the block the decoded texture must equal the source.
magick "$em" -depth 8 gray:"$work/a.gray"
magick "$work/img3-clean.jpeg" -depth 8 gray:"$work/b.gray"
python3 -I - "$work/a.gray" "$work/b.gray" "$BX" "$BY" "$BW" "$BH" <<'PY'
import sys
import numpy as np
a = np.fromfile(sys.argv[1], np.uint8).reshape(1024, 1024).astype(int)
b = np.fromfile(sys.argv[2], np.uint8).reshape(1024, 1024).astype(int)
x, y, w, h = map(int, sys.argv[3:7])
outside = np.ones_like(a, bool)
outside[y:y + h, x:x + w] = False
d = np.abs(a - b)
print(f"outside block: max diff {d[outside].max()}, changed px {(d[outside] > 0).sum()}")
print(f"inside block: darkest px {b[y:y + h, x:x + w].min()}")
PY
ls -la "$out"
