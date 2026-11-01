# Watercolor implementation verification

Local page: https://compronents.localhost:1355/components/watercolor

## Source and fidelity

Pinned original: ../reference/assets/index-2ZPewFcs.js and Settings-DyGoQMeO.js, from https://watercolor.bizar.ro/.

The original fluid simulation and WGSL determined the implementation. The approved changes scope rendering and pointer input to the component box, move controls below the canvas, remove source branding and debug UI, and make wheel and keyboard shortcuts opt-in.

`node .plannotator/watercolor/verify-source.mjs` passes. All 10 WGSL strings are byte-identical to the pinned bundle. All tuning defaults match, with the original top-level hue and rainbow activation exposed as separate React props.

Fixed-frame comparison used the pinned original engine and the transpiled port in the same browser. It bypasses automatic scheduling for both engines and drives the same pointer coordinates for 24 paint frames and one release frame at 1/60 second. Conditions: 640 x 480 CSS pixels, DPR 2, low quality, 384 x 288 paint grid. Tolerance: zero channel difference.

Result: 0 differing pixels out of 1,228,800; maximum channel difference 0. All 1,228,800 pixels were opaque. source-stroke.png and port-stroke.png are the captured frames; stroke-diff.png is their all-black difference image. This establishes the tested stroke at these settings, not every possible input or browser.

The first capture attempt awaited GPU completion before copying the canvas and captured transparent buffers. That result was rejected. The corrected capture copies synchronously after submit, verifies opacity, and was visually inspected to contain the painted stroke.

Reproduction: run prepare-comparison.cjs, evaluate comparison-setup.js in a disposable browser document at the stated viewport, then evaluate compare-frames.js. The script exports the pinned original class without modifying its rendering logic. The generated setup script is a local verification artifact, not a shipped component.

## Runtime and controls

- WebGPU initializes and paints through the component's pointer handlers.
- All 51 original tuning sliders were changed using keyboard events on the actual shared controls. Every value reached the live engine. Per-control before/after results: control-checks.json.
- Hue changed from 330 to 329. Brush scale changed from 1 to 1.05. Rainbow switched off.
- Paper changed to #DAE8F0 in both the engine settings and component background through StudioColor.
- Low quality rebuilt the mobile paint grid to 204 x 312 for a 340 x 520 canvas.
- Reset restored default paper and spread settings.
- New sheet replaced the simulation textures. Wash clean started the wipe at progress 0.
- Studio wheel and keyboard shortcuts are disabled; fullscreen enables both. Fullscreen bracket input changed scale to 1.35 and wheel input changed hue to 342 with default prevented.
- Right-button input entered smudge mode. Pointer cancellation ended it.
- Simulated GPU device loss stopped the engine and displayed the fallback output.
- The panel is below the canvas. At a 390-pixel viewport the canvas is 340 pixels wide and panel content fits. The shared page header overflows horizontally; the shared API table is wider than its container. Those existing site components were not changed.
- No unexpected console errors appeared during the inspected studio checks. Device destruction was intentional for the fallback check.

## Static checks

- Full `tsc --noEmit`: passed.
- Registry integrity: 633 passed, 0 failed.
- Biome check of the seven new component, studio, demo and preview files: passed.
- `git diff --check`: passed.

## Limits

Real touch-device behavior and an actual WebGPU-unsupported browser were not tested. The unavailable state was exercised through GPU device loss. Reduced-motion uses the original 0.35 force multiplier; a separate OS reduced-motion run was not performed. No production build, deployment, commit or push was performed.

## Human review

Plannotator implementation review returned `decision: approved`, with no changes requested.
