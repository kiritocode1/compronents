# Blur Study Box, exact port with a batched renderer

## Goal

The source renders 64 separate 96-sample proxy meshes and falls to 2.29 FPS at a 3840 by 2160 backing canvas.
The port keeps the same Box3D simulation, shader formula, controls, export, dimensions, colours, seed and pointer drag, but submits the bodies as one instanced vgpu draw.
We prove it with a reduced-motion screenshot diff, source-constant tests, the exact Box3D WASM hash, payload numbers and the same 5 second stress trace.

## Render change

```text
today   Box3D -> 64 meshes -> 64 draws x 96 samples -> canvas
after   Box3D -> instance buffer -> 1 draw x 96 samples -> canvas
```

The body effect is a depth integral. Each proxy fragment samples a 3D capsule 96 times along Z. Distance behind the pane widens the gaussian and lowers its opacity. The 64 alpha results composite over `#d9ddd6`. The port keeps that mechanism and only changes how the GPU receives the bodies.

## Files

| File | Today | After |
| --- | --- | --- |
| `package.json` | Has Three.js, but no direct small WebGPU renderer or Box3D package | Adds `vgpu@0.4.0`, `box3d-wasm@0.2.0` and the source's `tweakpane@4.0.5` |
| `pnpm-lock.yaml` | Does not resolve those packages | Pins the three exact package versions |
| `reference/blur-study-box/index.html` | Missing | Pins the live source HTML |
| `reference/blur-study-box/index-Bd5woOhd.css` | Missing | Pins the live source CSS byte for byte |
| `reference/blur-study-box/index-ZcimBb73.js` | Missing | Pins the live entry bundle byte for byte |
| `reference/blur-study-box/preload-helper-IyGHrOW_.js` | Missing | Pins the source's Three.js and TSL bundle byte for byte |
| `reference/blur-study-box/physics-CIMFmMej.js` | Missing | Pins the source's Box3D scene and shader graph byte for byte |
| `reference/blur-study-box/rolldown-runtime-CbXtAM7H.js` | Missing | Pins the source runtime imported by the physics bundle |
| `reference/blur-study-box/source.json` | Missing | Records URLs, hashes, package versions, viewport and the measured payload baseline without committing the WASM binary |
| `reference/blur-study-box/mechanics.json` | Missing | Records every render, camera, shader, physics and control constant extracted from the pin |
| `src/registry/blur-study-box/index.tsx` | Missing | Mounts the full-bleed canvas, exact status and Tweakpane chrome, lazy-loads the engine, and tears it down on unmount |
| `src/registry/blur-study-box/engine.ts` | Missing | Runs the exact seeded Box3D world, writes one fixed instance buffer per frame, preserves drag and pop timing, and owns resize plus reduced-motion state |
| `src/registry/blur-study-box/shader.ts` | Missing | Translates the pinned TSL graph to WGSL with the same 96 samples and alpha blend, then adds only sub-byte early exits |
| `src/registry/blur-study-box/png.ts` | Missing | Preserves the source's tiled, stripe-streamed PNG export and 300 DPI metadata without holding a full 24K image in memory |
| `src/components/demos/blur-study-box.tsx` | Missing | Mounts the component at full viewport height with no extra design |
| `src/components/demos/index.tsx` | Has no Blur Study Box demo | Imports and registers the new demo |
| `src/lib/registry.ts` | Has no installable Blur Study Box item | Adds the component, its four files and exact dependencies |
| `src/lib/component-meta.ts` | Has no usage notes for this component | Documents the depth integral, Box3D drag and optional `className` only |
| `tests/blur-study-box.test.mjs` | Missing | Checks pin hashes, shader and physics constants, one-draw structure, and the installed Box3D WASM hash |

## Code choices

### Keep the source's physics binary and random sequence

The downloaded WASM hash is `5a469ad8...d73f98`, which matches `box3d-wasm@0.2.0/dist/box3d.wasm` byte for byte. The port imports the standard build directly, so thread detection cannot select a different solver.

```diff
- const scene = await import("./physics-CIMFmMej.js")
+ const { default: createBox3D } = await import("box3d-wasm/standard")
+ const Box3D = await createBox3D()
+ const random = mulberry32(1327115068)
+ const world = new Box3D.World({
+   gravity: { x: 0, y: -11, z: 0 },
+   enableSleep: true,
+   enableContinuous: true,
+ })
```

The same 64 capsules use the same dimensions, damping, density, impulses, fixed `1 / 60` step and four substeps. Pointer drag still casts through the Box3D world and applies the same damped spring at the hit point.

### Batch the proxy meshes, do not lower quality

From wall: vgpu (`insp_vgpu`). Its instance-step geometry and mutable fixed-size buffer fit this effect. I am adopting that mechanism. I am not adopting a lower sample count, lower DPR, adaptive resolution or another blur model.

```diff
- for (let index = 0; index < 64; index += 1) {
-   const material = make96SampleMaterial(bodyUniforms[index])
-   scene.add(new Mesh(proxyPlane, material))
- }
- renderer.render(scene, camera)
+ const proxies = geometry(gpu, {
+   topology: "triangle-strip",
+   vertexCount: 4,
+   instanceCount: 65,
+   buffers: [quadCorners, { stepMode: "instance", data: bodyFrames }],
+ })
+ const study = draw(gpu, {
+   shader: BLUR_STUDY_SHADER,
+   geometry: proxies,
+   blend: "alpha",
+   instances: 65,
+ })
+ proxies.buffers[1].write(bodyFrames)
+ frame.pass({ target: studyTarget, clear: BACKGROUND }, study)
```

Instance zero is the floor hairline. Instances 1 through 64 are the capsules. They keep source order, and every body has the same colour, so alpha composition remains order-independent.

### Keep the 96-step depth integral

The translated shader retains the source formulas and interleaved gradient noise constants. Two exits remove work only when the maximum remaining contribution is below half an 8-bit output step.

```wgsl
var transmittance = 1.0;
for (var sample = 0u; sample < 96u; sample += 1u) {
  if (transmittance < 0.002) { break; }

  let ramp = pow(clamp(depthBehindPane / max(params.blurDistance, 0.001), 0.0, 1.0), params.blurCurve);
  let width = 0.004 + ramp * params.blur;
  let gaussian = exp(-0.5 * pow(max(capsuleSdf(point), 0.0) / width, 2.0));
  let absorption = 1.0 - exp(-(gaussian * stepDepth * params.volumeDensity));
  alpha += transmittance * absorption * 0.96 * exp(-ramp * params.opacityFalloff);
  transmittance *= 1.0 - absorption;
}
```

A reduced-motion screenshot fixes the simulation before its first step. The full 1280 by 720 result is diffed against `/tmp/compronents-kelly-reference/original-paused-1280x720.png`. If the early exits change a visible pixel beyond the agreed perceptual threshold, they come out before anything else changes.

### Keep heavy browser code out of the initial component chunk

```diff
- import { init, draw, frameLoop, geometry, surface } from "vgpu"
- import createBox3D from "box3d-wasm/standard"
+ useEffect(() => {
+   let stop: undefined | (() => void)
+   void import("./engine").then(({ startBlurStudyBox }) => {
+     stop = startBlurStudyBox(root, canvas)
+   })
+   return () => stop?.()
+ }, [])
```

This follows the local Next.js 16 lazy-loading guide. The WebGPU, physics and Tweakpane code loads only when the client component mounts. The renderer owns one GPU handle, one canvas surface, one MSAA target, one instance geometry and one frame loop, all disposed together.

### Verification

1. Run the focused fidelity test, registry integrity test, typecheck and production build.
2. Start the app through portless and open `https://compronents.localhost/components/blur-study-box/preview` in Agent Browser.
3. Set the same 1280 by 720 viewport, scale 1 and reduced motion. Compare the full screenshot against the pinned live baseline and report the mismatch percentage.
4. Test pause, reset, a setting change, body drag and a 2048 PNG export through browser controls.
5. Repeat the source stress case at a 1920 by 1080 viewport and scale 2 for 5 seconds. Report source versus port FPS, frame-time percentiles, transfer bytes and decoded bytes. The source baseline is 2.29 FPS, 468,539 transferred bytes and 1,601,580 decoded bytes.

## What I am not doing

- No colour, spacing, type, control label, camera, body count, body timing or animation change.
- No lower render resolution, sample-count reduction, quality toggle or adaptive quality.
- No replacement physics engine. The exact Box3D standard WASM stays in use.
- No new art, copy, route shell, sound or design treatment.
- No binary asset enters git. The WASM comes from the pinned npm package.
- No work on the other frosted-pane studies.
