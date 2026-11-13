#!/bin/sh
# Lab-only: a longer hover dwell over one spot, so towers reach full height before capture.
cd "$(dirname "$0")"
agent-browser set viewport 1440 900 >/dev/null
agent-browser open "file://$PWD/play.html?intro=0&$1" >/dev/null
agent-browser wait 800 >/dev/null
for r in 1 2 3; do for x in 520 580 640 700 760 700 640 580; do agent-browser mouse move $x 400 >/dev/null; done; done
agent-browser wait 300 >/dev/null
agent-browser screenshot shots/tune.png >/dev/null
