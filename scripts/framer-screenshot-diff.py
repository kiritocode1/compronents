#!/usr/bin/env python3
"""Compare matched source/port captures. Requires Pillow; masks only page chrome."""
import argparse
import json
from pathlib import Path
from PIL import Image, ImageChops

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("baseline", type=Path)
parser.add_argument("current", type=Path)
parser.add_argument("--output", type=Path, required=True)
parser.add_argument("--mobile", action="store_true", help="Use the documented 390x844 chrome masks")
args = parser.parse_args()
baseline = Image.open(args.baseline).convert("RGB")
current = Image.open(args.current).convert("RGB")
if baseline.size != current.size:
    parser.error(f"Dimensions differ: {baseline.size} vs {current.size}. Recapture at a matched viewport.")
expected = (390, 844) if args.mobile else (1280, 577)
if baseline.size != expected:
    parser.error(f"Expected {expected}, got {baseline.size}. Update the capture setup, not the tolerance.")
boxes = [(230, 780, 390, 844), (340, 390, 390, 455), (330, 0, 390, 70), (0, 760, 80, 844)] if args.mobile else [(1110, 500, 1280, 577), (1220, 250, 1280, 330), (1220, 0, 1280, 70), (0, 500, 80, 577)]
diff = ImageChops.difference(baseline, current)
for box in boxes:
    diff.paste((0, 0, 0), box)
pixels = list(diff.get_flattened_data())
compared = len(pixels) - sum((x2-x1)*(y2-y1) for x1, y1, x2, y2 in boxes)
changed = sum(max(pixel) > 2 for pixel in pixels)
result = {
    "baseline": str(args.baseline), "current": str(args.current), "viewport": expected,
    "maskedChrome": boxes, "perChannelTolerance": 2, "maximumChangedPercent": 0.1,
    "changedPixels": changed, "comparedPixels": compared, "changedPercent": changed / compared * 100,
    "meanAbsoluteChannelError": sum(sum(pixel) for pixel in pixels) / (compared * 3),
    "maxChannelDelta": max(max(pixel) for pixel in pixels), "passed": changed / compared <= 0.001,
}
args.output.parent.mkdir(parents=True, exist_ok=True)
diff.save(args.output.with_suffix(".png"))
args.output.with_suffix(".json").write_text(json.dumps(result, indent=2) + "\n")
print(json.dumps(result, indent=2))
raise SystemExit(0 if result["passed"] else 1)
