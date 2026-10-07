"""Create the isolated Type Garden proof from the pinned source capture."""
import json
import re
from pathlib import Path

source = Path("reference/type-garden/index.html").read_text()
match = re.search(r'(<script type="__bundler/template">\s*)([\s\S]*?)(\s*</script>)', source)
assert match
page = json.loads(match[2])

def remove(pattern, count=1):
    global page
    page, found = re.subn(pattern, "", page, count=count)
    assert found == count, (pattern[:80], found)

remove(r'  <div data-tg="modes"[\s\S]*?\n  </div>\n')
remove(r'  <sc-if value="\{\{ isPoster \}\}"[\s\S]*?\n  </sc-if>\n')
remove(r'        <button data-tg="btn" sc-camel-on-click="\{\{ savePNG \}\}"[^\n]*\n')
remove(r'        <button data-tg="btn" sc-camel-on-click="\{\{ saveSVG \}\}"[^\n]*\n')
remove(r'\n<style>\n#tg-copy[\s\S]*?</script>\n')
page = page.replace("      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); e.shiftKey ? this.saveSVG() : this.savePNG(); }", "")
assert 'Copy code' not in page
assert '<div data-tg="modes"' not in page
assert '<div data-tg="poster"' not in page
assert '<button data-tg="btn"' not in page
assert 'saveSVG() : this.savePNG()' not in page
output = source[:match.start(2)] + json.dumps(page, ensure_ascii=True).replace('<', '\\u003c') + source[match.end(2):]
Path('.plannotator/type-garden/core-proof.html').write_text(output)
Path('.plannotator/type-garden/core-unpacked.html').write_text(page)
