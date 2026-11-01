# Watercolor: registry component + studio panel

## 1. Goal

- **Problem.** watercolor.bizar.ro is a full-window WebGPU page. Its tuning lives in a hidden `#debug` lil-gui and its controls (hue, size, rainbow, wash) are wheel and keyboard shortcuts.
- **Result.** A `watercolor` registry item that runs inside any box, with every parameter exposed as a prop and driven from the studio panel under the canvas. No overlay UI on the canvas.
- **Proof.** Same stroke on the original and the port at a matched viewport, screenshot diff, plus a check that each panel control changes the live sim.

Exact port, not a reinterpretation. Source is pinned in `.plannotator/watercolor/reference/` (HTML, CSS, main bundle, `Settings` chunk with every default, `Controls` chunk with every lil-gui range).

## 2. How it fits

```
studio panel (tabs: Brush / Water / Look / Sheet)
        │ props
        ▼
<Watercolor>  ── settings ref (read every frame, no re-create)
        │
        ▼
WatercolorEngine (port of class W + P)
        │ 10 compute passes + 1 render pass, WGSL byte-exact
        ▼
<canvas> sized to the component box (ResizeObserver)
```

## 3. Files

| File | Role |
| --- | --- |
| `src/registry/watercolor/index.tsx` | React component, props, imperative handle (`wash`, `clear`) |
| `src/registry/watercolor/engine.ts` | Port of the sim classes, element-scoped instead of window-scoped |
| `src/registry/watercolor/shaders.ts` | **Generated** from the bundle: shared prelude + 10 WGSL modules, verified to concatenate back to the originals byte for byte |
| `src/registry/watercolor/settings.ts` | `DEFAULT_SETTINGS` (verbatim from `Settings-DyGoQMeO.js`) + `CONTROL_RANGES` (verbatim from the lil-gui chunk) + pigment maths (OKLCH to absorption) |
| `src/components/studios/watercolor.tsx` | Control panel, same shell as `ink-field` (TabsSubtle, SliderComfortable, StudioColor) |
| demo, preview, `registry.ts`, `component-meta.ts`, `registry-groups.ts` | Standard wiring |

## 4. Decisions to approve

1. **Controls move to the panel.** Every lil-gui slider, using its original min/max/step (widened only where the default sits outside it: `dryBrush` 1.6 > 1.5, `spread.rate` 0.3 > 0.25). Plus the page's own controls as panel items: Hue slider, Brush size (0.3 to 3), Rainbow toggle, Wash clean button, New sheet button, Quality (Auto / High / Low).
2. **Canvas input stays.** Hold to paint, right-click to smudge. These are the component, not chrome.
3. **Wheel and keys become opt-in props** (`wheelControls`, `keyboardShortcuts`), **off in the studio, on in the fullscreen preview.** On a scrolling docs page, wheel-to-change-hue would trap page scroll, and global `R`/`D` would fire while typing elsewhere. Keys listen on the focused canvas, not `window`.
4. **Chrome is dropped.** Bizarro wordmark, download links, email and the "Controls" legend card are not ported. Credit lives in the registry description only, as the brand rule requires.
5. **Window → box.** The source sizes the sheet, brush radius and wash radius from `window.innerWidth/innerHeight`. The port uses the component's box, which is identical in the fullscreen preview. Paper colour goes on the component root instead of `document.documentElement`.
6. **New dev dependency: `@webgpu/types`.** TS 5.9's `lib.dom` has no WebGPU types and the engine touches ~30 of them. The alternative is a hand-written `.d.ts`, which is worse. Also listed in the registry item so consumers get it.
7. **Dropped as debug-only:** timestamp-query timing, `?capture` mode, the lil-gui itself. None affect the picture.
8. **No WebGPU:** the box shows the paper colour and one line of fallback text, as the source does.

## 5. Not covered / unverified

- Browsers without WebGPU (Firefox stable) only get the fallback.
- Pixel diff needs a WebGPU-capable Chrome under CDP; if headless Chrome has no adapter I will use a headed CDP Chrome per the port-fidelity notes.
- Brush stroke timing is rAF-driven in both, so a diff compares after an identical scripted pointer path, not frame-by-frame.
