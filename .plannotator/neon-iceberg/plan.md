# Neon Iceberg: registry component

Port of toolcraft.sh/demos/neon-iceberg without the panel, timeline bar and export. Source pinned in `reference/`.

- Shaders, geometry, plate-thickness maths, framing (1200x1600 artboard, 200 px/unit, target y 0.66) and the orbit drag (PI/450 rad/px, blended pitch axis) are copied from the bundle. Defaults are the demo's saved state, not the panel slider defaults.
- Same three.js revision as the source (r185).
- Loop: plateGap * (1 - (1 - (t mod 2)/2)^4), as the source's looping timeline.
- Departures: artboard is contained in any box; when `playing` is false or reduced motion is on, the plates rest fully parted; rendering pauses offscreen.

## Evidence (`evidence/`)
- `t0/`: timeline at 0, both 2600x3640 backing at the source's 1.3 zoom. 99.92% of pixels identical; 7200 of 7457 differing are 1/255; the rest are single pixels on grid lines and grain cells.
- `mid/`: timeline at 1s (gap 0.103). 99.84% identical, 14210 of 15375 differing are 1/255.
- `drag.mjs`: drag on empty background does not orbit; drag on the block does. No console errors.

## Not covered
- The artboard framing leaves the iceberg in the lower middle of a wide box, as in the source's export frame.
- Touch orbit not exercised on a device.
