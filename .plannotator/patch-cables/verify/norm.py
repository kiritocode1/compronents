# Keep log lines after MARK and renumber node ids by first appearance, so two
# pages that built different setup graphs can be compared note by note.
import re, sys
lines = open(sys.argv[1]).read().split("\n")
lines = lines[lines.index("MARK") + 1:]
ids = {}
def sub(m):
    k = m.group(0)
    if k not in ids: ids[k] = f"{m.group(1)}#{len(ids)}"
    return ids[k]
print("\n".join(re.sub(r"(\w+)#\d+", sub, l) for l in lines))
