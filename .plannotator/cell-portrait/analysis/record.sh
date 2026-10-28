#!/bin/zsh
# record.sh <outdir> : capture 180 frames (30fps, 6s loop) from the open preview in batches of 10
out=$1; mkdir -p $out
for b in $(seq 0 17); do
  agent-browser eval "JSON.stringify(Array.from({length:10},(_,k)=>{__cp.seek(($b*10+k)/30); return document.getElementById('c').toDataURL('image/jpeg',0.92)}))" \
  | python3 -c "
import sys,json,base64
arr=json.loads(json.loads(sys.stdin.read()))
for k,s in enumerate(arr): open('$out/f%03d.jpg'%($b*10+k+1),'wb').write(base64.b64decode(s.split(',',1)[1]))
"
done
ls $out | wc -l
