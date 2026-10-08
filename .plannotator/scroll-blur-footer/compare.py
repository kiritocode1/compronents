"""Compare matched 1280x577 captures at scrollY=0, blur strengths 0 and 1."""
import json
import sys
from pathlib import Path
from PIL import Image, ImageChops

output = Path(__file__).parent
results = []
implementation = "--implementation" in sys.argv
prefix = "implementation" if implementation else "proposed"
for state, source_name, proposed_name in [
    ("rest", "source-top.png", f"{prefix}-rest.png"),
    ("full-blur", "source-full-blur.png", f"{prefix}-full-blur.png"),
]:
    source = Image.open(Path("reference/scroll-blur-footer") / source_name).convert("RGB")
    proposed = Image.open(output / proposed_name).convert("RGB")
    assert source.size == proposed.size == (1280, 577)
    diff = ImageChops.difference(source, proposed)
    # Hosting badge only. It is outside the requested component.
    ignored = [(1110, 510, 1280, 577)]
    if implementation:
        # Existing registry close button and Next dev indicator are not the effect.
        ignored += [(1220, 0, 1280, 60), (0, 510, 65, 577)]
    changed = total = 0
    for y in range(577):
        for x in range(1280):
            if any(left <= x < right and top <= y < bottom for left, top, right, bottom in ignored):
                continue
            total += 1
            if max(diff.getpixel((x, y))) > 8:
                changed += 1
    diff.save(output / f"{prefix}-{state}-diff.png")
    results.append({
        "state": state, "viewport": [1280, 577],
        "strength": 0 if state == "rest" else 1,
        "ignoredBadge": ignored, "channelTolerance": 8,
        "maxChangedPercent": 0.1, "changedPixels": changed,
        "comparedPixels": total, "changedPercent": changed / total * 100,
        "pass": changed / total * 100 <= 0.1,
    })
result_name = "implementation-comparison.json" if implementation else "comparison.json"
(output / result_name).write_text(json.dumps(results, indent=2))
print(json.dumps(results, indent=2))
