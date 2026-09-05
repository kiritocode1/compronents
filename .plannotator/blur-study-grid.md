# Blur Study Grid, exact port with a batched renderer

## Goal

The source aims 100 capsules at the cursor behind a frosted pane and issues one 96-sample draw per capsule, which falls to 11.97 FPS at a 3840 by 2160 backing canvas.
The port keeps the same tracking model, shader formula, defaults, dimensions, colours, seed and camera framing, but submits the capsules as one instanced vgpu draw.
We prove it with a reduced-motion screenshot diff against the pinned live baseline, source-constant tests, payload numbers and the same 5 second stress trace.

## Render change

```text
today   pointer -> 100 proxy meshes -> 100 draws x 96 samples -> canvas
after   pointer -> 1 instance buffer -> 1 draw  x 96 samples -> canvas
```

Each capsule is a proxy quad whose fragment walks a 96-step depth integral through a capsule SDF. Distance behind the pane widens the gaussian and lowers its opacity, and the 100 alpha results composite over `#d9ddd6`. The port keeps that mechanism and only changes how the GPU receives the bodies.

## What this study is

It is the sibling of `blur-study-box`, from the same four-study set, and it calls the same TSL material factory with the same `capsule` and `flat` variants. Two things differ, and they are the whole component:

1. **No physics.** There is no Box3D world, no gravity and no drag. Every capsule sits on a fixed grid cell and only rotates.
2. **Every capsule aims at the cursor.** One smoothed pointer position drives all 100 axes, so the grid reads as a field of needles turning to follow the reader.

```js
// the entire motion model, from volumetric-grid-cDnqNbdP.js
world.lerp(target, 1 - Math.exp(-dt * (2 + trackingSpeed * 14)))
axis.set(world.x - home.x, world.y - home.y, paneZ - home.z)
axis.normalize().multiplyScalar(max(rodLength * 0.5 - rodRadius, 0.001))
```

`home.z = depthSeed * depthSpread`, and `depthSeed` is `mulberry32(1327115068)() - 0.5` per cell. That single seeded value is why some capsules read sharp and others read as soft smudges.

## Files

| File | Today | After |
| --- | --- | --- |
| `reference/blur-study-grid/index.html` | Missing | Pins the live source HTML |
| `reference/blur-study-grid/index-HUOrf7ht.js` | Missing | Pins the live entry bundle byte for byte |
| `reference/blur-study-grid/volumetric-grid-cDnqNbdP.js` | Missing | Pins the scene and shader graph, lazy-loaded and absent from the HTML |
| `reference/blur-study-grid/three.webgpu-D6sQuvt_.js` | Missing | Pins the source's Three.js r185 WebGPU and TSL bundle |
| `reference/blur-study-grid/index-Bd5woOhd.css` | Missing | Pins the source CSS, byte identical to the box study's pin |
| `reference/blur-study-grid/source.json` | Missing | Records URLs, hashes, viewport and the measured payload and FPS baseline |
| `reference/blur-study-grid/mechanics.json` | Missing | Records every render, camera, shader, grid and tracking constant extracted from the pin |
| `src/registry/blur-study-grid/index.tsx` | Missing | Mounts the full-bleed canvas and status chrome, lazy-loads the engine, tears it down on unmount |
| `src/registry/blur-study-grid/engine.ts` | Missing | Builds the seeded 10 by 10 grid, tracks the pointer, writes one instance buffer per frame, owns resize and reduced-motion state |
| `src/registry/blur-study-grid/shader.ts` | Missing | The box study's WGSL with the floor branch and `kind` attribute removed, same 96 samples and same alpha blend |
| `src/registry/blur-study-grid/png.ts` | Missing | Copy of the box study's tiled, stripe-streamed PNG export so the item installs standalone |
| `src/components/demos/blur-study-grid.tsx` | Missing | Mounts the component at a fixed demo height with no extra design |
| `src/components/previews/blur-study-grid.tsx` | Missing | Mounts it full-screen for the preview route |
| `src/components/demos/index.tsx` | Has no Blur Study Grid demo | Imports and registers the new demo |
| `src/components/previews/index.tsx` | Has no Blur Study Grid preview | Imports and registers the new preview |
| `src/components/studios/blur-study-grid.tsx` | Missing | Rebuilds the source's control panel outside the preview with the shared studio controls |
| `src/components/studios/index.tsx` | Has no Blur Study Grid studio | Registers the studio so the detail page shows it instead of the plain demo stage |
| `src/lib/registry.ts` | Has no installable Blur Study Grid item | Adds the component, its four files and `vgpu@0.4.0` |
| `src/lib/registry-groups.ts` | Lists `blur-study-box` under 3D and WebGL scenes | Adds `blur-study-grid` next to it |
| `src/lib/component-meta.ts` | Has no usage notes for this component | Documents the tracking model, the settings prop and `className` only |
| `tests/blur-study-grid.test.mjs` | Missing | Checks pin hashes, grid and shader constants, and the one-draw structure |

No `package.json` change. `vgpu@0.4.0` is already a dependency from the box study, and this study has no physics, so nothing new is installed.

## Code choices

### Reuse the shader that is already proven, minus the floor

Both studies call `O(params, 96, "flat", "capsule")` in the source. The pinned graph and the box study's WGSL agree line for line, so this is a deletion, not a translation. The grid has no floor hairline, which removes the only branch in the fragment.

```diff
- @location(3) @interpolate(flat) kind: f32,
- if (input.kind > 0.5) {
-   let edge = input.proxySize - abs(input.localPosition);
-   ...
-   return vec4f(0.42326767, 0.4677838, 0.42326767, 0.72 * params.showFloor * coverage);
- }
- let texel = fwidth(input.localPosition);
```

The 96-step integral, the interleaved gradient noise, the `0.004` base width, the `0.96` alpha ceiling, the `vec3f(0.008)` body colour and both early exits stay exactly as they are. Dropping the hairline also drops the `fwidth` call, which WGSL required in uniform control flow and which every capsule fragment was paying for.

### One instanced draw, and the instance buffer is the only per-frame write

```diff
- for (let index = 0; index < 100; index += 1) {
-   const material = make96SampleMaterial(uniforms[index])
-   scene.add(new Mesh(proxyPlane, material))
- }
+ const studyGeometry = geometry(gpu, {
+   topology: "triangle-strip",
+   vertexCount: 4,
+   instanceCount: BODY_COUNT,
+   buffers: [
+     { attributes: { corner: "float32x2" },
+       data: new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]) },
+     { attributes: { center: "float32x3", axis: "float32x3", proxySize: "float32x2" },
+       data: instanceData, stepMode: "instance" },
+   ],
+ })
```

Instances are the 100 capsules in source order. Every body carries the same colour, so alpha composition stays order independent. Following the box study, `corner` spans `[-1, 1]` and `proxySize` is therefore the half extent:

```js
const reach = rodRadius + 3 * (0.004 + blur)
proxySize = [Math.abs(axis.x) + reach, Math.abs(axis.y) + reach]
```

### Keep the source's camera framing exactly

The grid is framed by span, not by field of view, and the mobile branch only widens the vertical span.

```js
const minimumHorizontalSpan = 26 + 3          // 29
const verticalSpan = 23.5 + (isMobile ? 7 : 4) // 30.5 or 27.5
const height = Math.max(verticalSpan, minimumHorizontalSpan / aspect)
const width = height * aspect
```

Cells sit at `x = (column - 4.5) * 2.3` and `y = (4.5 - row) * 2`, which is the source's centring arithmetic with `columns = rows = 10` substituted.

### The control panel leaves the component and becomes a studio

The source ships a Tweakpane panel inside the artwork. The component must not: a registry item that mounts its own GUI is unusable inside a host layout. So the panel comes out of the component entirely, and the same controls are rebuilt outside the preview as `src/components/studios/blur-study-grid.tsx`, using the shared studio controls the other studios use.

```diff
- import { Pane } from "tweakpane"
- pane.addFolder({ title: "Diffusion" })
+ // src/components/studios/blur-study-grid.tsx
+ <SliderComfortable
+   variant="scrubber"
+   label="Amount"
+   value={settings.blur}
+   onChange={(value) => update("blur", value)}
+   min={0.02} max={0.6} step={0.01}
+   formatValue={(value) => value.toFixed(2)}
+ />
```

The studio keeps the source's three folders as the three columns of the existing studio grid, with every label, range and step taken from the pinned bundle:

| Section | Control | Setting | Min | Max | Step |
| --- | --- | --- | --- | --- | --- |
| Diffusion | Amount | `blur` | 0.02 | 0.6 | 0.01 |
| Diffusion | Ramp curve | `blurCurve` | 0.35 | 4 | 0.05 |
| Diffusion | Ramp distance | `blurDistance` | 0.25 | 4 | 0.05 |
| Diffusion | Pane Z | `paneZ` | -3 | 4 | 0.05 |
| Diffusion | Opacity falloff | `opacityFalloff` | 0 | 4 | 0.05 |
| Diffusion | Volume density | `volumeDensity` | 1 | 10 | 0.1 |
| Diffusion | Dither | `ditherStrength` | 0 | 1 | 0.05 |
| Capsules | Length | `rodLength` | 2 | 6 | 0.05 |
| Capsules | Radius | `rodRadius` | 0.15 | 0.8 | 0.01 |
| Capsules | Depth spread | `depthSpread` | 0 | 3 | 0.05 |
| Motion | Tracking | `trackingSpeed` | 0.05 | 2 | 0.05 |

The component still takes `settings` as a prop, so installing it without the studio keeps every value configurable. The source's persisted `localStorage` key is not carried over, because a registry component should not write to a host's storage.

### Live settings, because a slider must not restart the study

This is the one thing the studio changes about the component. `blur-study-box` serialises its settings into the mount effect, so a changed value tears the engine down and rebuilds it. That is fine for a component driven by a fixed prop and wrong for one driven by a dragged slider: every tick would drop the GPU context and rebuild the grid.

The source never rebuilds. Its update function reads the settings object each frame and writes uniforms, so the port does the same through a handle.

```diff
- const settingsKey = JSON.stringify(settings ?? null);
- useEffect(() => { /* ...mount engine... */ }, [settingsKey]);
+ useEffect(() => { /* ...mount engine once... */ }, []);
+
+ // Settings reach the running engine as a uniform write, never a remount.
+ useEffect(() => {
+   handleRef.current?.setSettings(settings ?? {});
+ }, [settings]);
```

`setSettings` merges over the live state and the next frame picks it up, exactly like the source's `F()`. Only `depthSpread` and the capsule dimensions change instance geometry, and those are already recomputed per frame.

### Keep the heavy runtime out of the initial chunk

```diff
- import { init, draw, frameLoop, geometry, surface } from "vgpu"
+ useEffect(() => {
+   let stop: undefined | (() => void)
+   void import("./engine").then(({ startBlurStudyGrid }) => { stop = startBlurStudyGrid(...) })
+   return () => stop?.()
+ }, [])
```

Reduced motion holds the simulation at its first frame, which is what makes the baseline diff deterministic: with no pointer event the tracked position stays at world origin and every capsule aims at the pane centre.

## Verification

1. Run the focused fidelity test, the registry integrity tests, `npm run typecheck:registry`, scoped Biome and `npm run build`.
2. Serve through portless and open `https://compronents.localhost/components/blur-study-grid/preview` in Agent Browser.
3. At 1280 by 720, scale 1, reduced motion, diff the full screenshot against `/tmp/compronents-kelly-grid-reference/original-paused-1280x720.png` and report the mismatch percentage.
4. Move the pointer across the field and confirm the tracking lag and the per-cell depth read match the source side by side.
5. Drag every studio slider through its full range and confirm the study updates live, the canvas never blanks, and the FPS readout does not dip, which is what proves settings are a uniform write and not a remount.
6. Repeat the stress case at a 3840 by 2160 backing for 5 seconds and report source versus port FPS and frame-time percentiles. The measured source baseline is 11.97 FPS, p50 83.3 ms, p95 100.2 ms, against 57.84 FPS at 1920 by 1080. Payload baseline is 6 resources, 260,702 transferred bytes and 1,050,823 decoded bytes.

## What I am not doing

- No colour, spacing, type, camera, body count, grid spacing, default or timing change.
- No lower sample count, lower DPR, adaptive resolution or quality toggle.
- No control panel inside the component, no Tweakpane dependency, no `localStorage` persistence, no route switcher from the source page. The controls live in the studio only.
- No shared module between this and `blur-study-box`. Registry items install independently, so the shader and PNG encoder are copied rather than imported across components.
- No new dependency. `vgpu@0.4.0` is already installed.
- No binary asset enters git.
- No work on the other two studies in the set.

## Outcome, measured after implementation

The fidelity goal held. The performance premise did not.

**Fidelity.** Against the pinned baseline at 1280 by 720, scale 1, reduced motion, over the study region: mean absolute difference 0.38/255, maximum 2/255, no pixel differing by more than 2/255. The capsule ink bounding box is identical at three ink thresholds, and ink area differs by at most 0.34%, which is boundary wobble from the dither. Repeated with the pointer parked at (1050, 180) once tracking settled: same bounding boxes, same 2/255 ceiling. Camera framing, grid spacing, seeded depth and the tracking model are exact.

**Performance.** The port is not faster. Interleaved runs, five pairs, production build:

| Backing store | Source | Port | Delta |
| --- | --- | --- | --- |
| 1920 by 1080 | 60.33 FPS | 60.08 FPS | -0.4%, both vsync locked |
| 3840 by 2160 | 23.38 FPS | 21.44 FPS | -8.3% |

The plan assumed this study was draw-call bound, as `blur-study-box` was. It is not: it is fragment bound, so removing ninety-nine draw submissions bought nothing measurable, and the remaining cost is the ninety-six sample integral itself.

The first build measured -18.7%. Two hypotheses were tested and rejected: removing the loop's `break` changed nothing, and removing the offscreen target plus blit pass changed nothing. The cause was the loop itself. The source's TSL graph is built by a JS `for` loop, so its compiled shader carries ninety-six inlined sample blocks; the port had a real WGSL loop. Emitting the body ninety-six times, the way the source does, recovered -18.7% to -8.3%. The `break` went with it, since the source has no early exit either, which makes the shipped shader closer to the source than the first version was.

The gap scales with pixel count, so it is per-fragment and not fixed overhead. It is invisible at realistic viewport sizes.
