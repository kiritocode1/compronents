import json, numpy as np
impl=json.loads(json.loads(open("/tmp/dhruv/impl_timeline.json").read()))
# video: CSS cell size per frame (video px / 2), from the pitch analysis; colour alpha normalised
steps={1:36,5:35,7:34,9:33,10:32,12:31,13:30,14:29,15:28,16:27,17:26,18:25,19:24,21:23,22:22,23:21,24:20,25:19,26:18,28:17,29:16,31:15,32:14,34:13,36:12,38:11,40:10,43:9,46:8,51:7,73:6,75:5,122:6,123:7,139:8,144:9,147:10,149:11,151:12,153:13,154:14,156:15,157:16,158:17,159:18,161:19,162:20,163:21,164:22,165:24,166:25,167:26,168:27,169:28,170:29,171:30,172:31,173:32,174:33,175:34,177:35,179:36}
video=[]; cur=36
for f in range(1,181):
    cur=steps.get(f,cur); video.append(cur)
col={72:0,73:.07,74:.3,75:.7,76:.86,77:.98,117:1,118:.98,119:.95,120:.81,121:.6,122:.15,123:0}
diff=[(f+1,video[f],impl[f][0]) for f in range(180) if video[f]!=impl[f][0]]
print("frames where rounded cell size differs:",len(diff),"of 180")
print("max |delta| px:", max([abs(a-b) for _,a,b in diff], default=0))
print("diffs:",diff)
print("colour alpha  frame: video / preview")
for f,v in col.items(): print(f"  {f}: {v:.2f} / {impl[f-1][1]:.2f}")
