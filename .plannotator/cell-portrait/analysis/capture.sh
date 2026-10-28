#!/bin/zsh
# capture.sh <outdir> <frame numbers...> : seek preview to (f-1)/30 s and save canvas PNG as f%03d.png
out=$1; shift
mkdir -p $out
for f in "$@"; do
  t=$(python3 -c "print(($f-1)/30)")
  agent-browser eval "__cp.seek($t); document.getElementById('c').toDataURL('image/png')" \
    | python3 -c "import sys,json,base64; s=json.loads(sys.stdin.read()); open('$out/f%03d.png'%$f,'wb').write(base64.b64decode(s.split(',',1)[1]))"
done
