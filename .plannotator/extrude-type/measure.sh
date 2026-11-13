#!/bin/sh
# Lab-only: render a hover state with the given query, then report lit paper, raised top
# and darkest-shadow colours so they can be compared with the reference photo.
cd "$(dirname "$0")"
Q="$1"
agent-browser set viewport 1440 900 >/dev/null
agent-browser open "file://$PWD/play.html?intro=0&$Q" >/dev/null
agent-browser wait 800 >/dev/null
for x in 500 560 620 680 720 760; do agent-browser mouse move $x 470 >/dev/null; done
agent-browser wait 300 >/dev/null
agent-browser screenshot shots/tune.png >/dev/null
px() { magick shots/tune.png -crop "$1" +repage -resize 1x1\! -format "%[hex:p{0,0}]" info:; }
echo "paper-tl #$(px 40x40+20+20)  paper-br #$(px 40x40+1380+840)"
magick shots/tune.png -crop 420x260+520+420 +repage txt:- | python3 -I dark.py 0.04 "shadow-dark4%"
magick shots/tune.png -crop 600x200+100+620 +repage txt:- | python3 -I bright.py 0.05 "rest-letters top5%"
