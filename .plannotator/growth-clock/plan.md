# Growth Clock: registry component

## 1. Goal

- **Problem.** kitasenjudesign.com/clock/#02_growth ("Growth") is a full-window page inside the "12 o'clocks" gallery shell.
- **Result.** `growth-clock` registry item: the clock alone, filling its container, the source's defaults and 10 s preset cycle baked in.
- **Proof.** Source and port served side by side, both driven with the same seeded `Math.random`, frozen `Date` and fixed rAF timestamps, then pixel-diffed at matched frames.

Exact port. The source is one self-contained file, pinned at `reference/index.html` (plus the gallery page, `clocks.json`, `style.css`).

## 2. Mechanism

The ones digit of the wall-clock seconds is drawn as up to three closed loops (outline, upper hole, lower hole). Each frame splits long edges and randomly inserts nodes, then relaxes them with spring, align and grid-bucketed repulsion forces plus a decaying random kick, confined so growth cannot sink more than 3px into the glyph. When the second changes, every node eases to the next digit's outline in 0.1 s, the grown nodes are dropped, the loops flash a 0.2 white fill that fades over 0.3 s, and growth restarts.

```
wall clock second ──► target digit ──► beginMorph (0.1 s ease to new outline)
                                            │
            grow() split + insert ◄─────────┘ finishMorph (drop grown nodes, kick)
                   │
            relax() spring, align, repel, kick, confine
                   ▼
            draw() crosshair, quadratic loops, fading evenodd fill
```

## 3. Files

| File | Role |
| --- | --- |
| `src/registry/growth-clock.tsx` | Component: glyph rasterise/trace, sim, renderer, clock |
| `src/components/demos/growth-clock.tsx`, `previews/growth-clock.tsx` | Demo and fullscreen preview |
| `registry.ts`, `component-meta.ts`, `registry-groups.ts`, demo/preview indexes | Standard wiring |

No assets. The glyph font is the source's system stack (`900 "Helvetica Neue", Helvetica, Arial`).

## 4. Decisions

1. **Copied verbatim:** every constant in `P`, the three presets, Moore tracing, hole fill, smoothing, resampling, morph rotation search, forces, buffers, draw order and colours (`#0e0e0e`, `#efe9da`, crosshair `rgba(239,233,218,0.18)`).
2. **Canvas sizes to its container** (ResizeObserver), not `innerWidth/innerHeight`. Same `min(w, h) / 1000 * 0.94` framing, same DPR cap of 2.
3. **Dropped:** the GUI and HUD (both hidden by default in the source) and the window-level keyboard shortcuts, which would fire on any key anywhere on a page that hosts the demo. **Kept:** click to restart.
4. **Added:** rendering stops when offscreen or the tab is hidden. On resume the clock morphs to the current second, as the source does after a pause.
5. **Reduced motion:** no growth or kick; the current digit's plain outline snaps to the next digit each second with no fill flash.
6. **Props:** `settings?: Partial<GrowthClockSettings>` (the source's `P`), `presets` (default true), `background`, `className`, `style`.

## 5. Not covered yet

- Glyph shapes depend on the installed Helvetica; the diff runs on this Mac, where both pages get the same font.
- Touch not exercised on a device.
