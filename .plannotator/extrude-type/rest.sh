#!/bin/sh
# Lab-only: render the rest state with a query, report tones, and build the matched close-up.
cd "$(dirname "$0")"
agent-browser set viewport 1440 900 >/dev/null
agent-browser open "file://$PWD/play.html?intro=0&$1" >/dev/null
agent-browser wait 1000 >/dev/null
agent-browser screenshot shots/rest.png >/dev/null
echo "paper #$(magick shots/rest.png -crop 40x40+20+20 +repage -resize 1x1\! -format '%[hex:p{0,0}]' info:) $(magick shots/rest.png -crop 600x200+100+560 +repage txt:- | python3 -I bright.py 0.05 letters) $(magick shots/rest.png -crop 600x200+100+560 +repage txt:- | python3 -I dark.py 0.05 restshadow)"
magick shots/rest.png -crop 360x180+120+560 +repage -filter Lanczos -resize 222% /tmp/cr.png
magick /tmp/cp.png /tmp/cr.png -append shots/closeup.png
