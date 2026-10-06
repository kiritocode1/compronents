"""Rebuild the Type Garden core HTML from the pinned source capture."""
import json
import re
import sys
from pathlib import Path

SOURCE = Path("reference/type-garden/index.html")
OUTPUT = Path("reference/type-garden/core.html")
source = SOURCE.read_text()
match = re.search(r'(<script type="__bundler/template">\s*)([\s\S]*?)(\s*</script>)', source)
if match is None:
    raise ValueError("Type Garden bundle template is missing")
page = json.loads(match[2])


def remove(pattern):
    global page
    page, count = re.subn(pattern, "", page, count=1)
    if count != 1:
        raise ValueError(f"Type Garden source changed: {pattern[:80]}")


remove(r'  <div data-tg="modes"[\s\S]*?\n  </div>\n')
remove(r'  <sc-if value="\{\{ isPoster \}\}"[\s\S]*?\n  </sc-if>\n')
remove(r'        <button data-tg="btn" sc-camel-on-click="\{\{ savePNG \}\}"[^\n]*\n')
remove(r'        <button data-tg="btn" sc-camel-on-click="\{\{ saveSVG \}\}"[^\n]*\n')
remove(r'\n<style>\n#tg-copy[\s\S]*?</script>\n')

changes = [
    ("      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); e.shiftKey ? this.saveSVG() : this.savePNG(); }", ""),
    ("    if (document.fonts) document.fonts.load(`700 100px ${this.F}`).then(() => { this.cache = {}; this.layout(); this.buildPoster(); }).catch(() => {});", "    if (document.fonts) document.fonts.load(`700 100px ${this.F}`).then(() => { this.cache = {}; this.layout(); }).catch(() => {});"),
    ("    this.buildPoster();\n    const loop", "    const loop"),
    ("    setTimeout(() => this.glyphs(), 1500);\n", ""),
]
for before, after in changes:
    if page.count(before) != 1:
        raise ValueError(f"Type Garden source changed: {before[:80]}")
    page = page.replace(before, after)

for removed in ('Copy code', '<div data-tg="modes"', '<div data-tg="poster"', '<button data-tg="btn"'):
    if removed in page:
        raise ValueError(f"Removed control remains: {removed}")

bundled = source[:match.start(2)] + json.dumps(page, ensure_ascii=True).replace("<", "\\u003c") + source[match.end(2):]
if "--check" in sys.argv:
    if not OUTPUT.exists() or OUTPUT.read_text() != bundled:
        raise SystemExit("Type Garden core.html differs from pinned source. Run python3 scripts/build-type-garden.py")
    print("Type Garden core.html matches the pinned source and control removals")
else:
    OUTPUT.write_text(bundled)
    print(f"Wrote {OUTPUT}")
