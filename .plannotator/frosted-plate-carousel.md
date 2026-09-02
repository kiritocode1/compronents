# Frosted plate carousel

1:1 of the unveil.fr homepage carousel. Not the site around it.

Pin lives in `reference/unveil/`. Shader, camera, spacing, easings, and click
path were read out of `node0.CvEaJ_33.js`, not guessed from the screenshot.

## Goal, in three lines

The registry has no wrapping diagonal of frosted plates. `liquid-glass-carousel`
is a 2D row through a lens shader, a different machine. After this lands,
`/components/frosted-plate-carousel` scrolls, hovers, and clicks like unveil.fr.
Proof is a constants test against `reference/unveil/mechanics.json` plus a
browser pass of wheel, hover, click-to-square, and close.

## Diagram

```
today   none
after   wrap-x plates  ->  z = -x * 1.5a  ->  click y-rot to 0
```

Wheel and drag shift a single scroll number. Each plate's X wraps on that
number. Z is coupled to X, so the row is a receding diagonal, not a ring.
Click eases rotation Y from `-PI/6` to `0`, recenters X, dollies the camera.

## Mechanism

Each tile is a `BoxGeometry(W, H, 0.0175)`. Cover-fit UVs. The fragment shader
mixes a sharp texture with a 64px blur using a 0.15 UV-edge `smoothstep`. That
mix is the glass, not MeshPhysical transmission.

```
x = wrap(-F, F, (i - scroll/25 - drag) * 0.375)
z = aspect < 1 ? -x * 6 : -x * aspect * 1.5
rotation.y = -Math.PI / 6
```

`F` is `count * 0.375 / 2`. Plates with `|z| > 12.5` hide.

Click, from the pin:

```diff
- // idle: plates stay at -PI/6, camera at (0, 100/7.5, 35)
+ gsap.to(inner.position, { x: 0, ease: "expo.out", duration: 1.25 / 3 * 2 })
+ gsap.to(tile.position, {
+   x: 0,
+   ease: "expo.out",
+   duration: 1.25 / 3 * 2,
+   onUpdate: () => { tile.position.z = -tile.position.x * aspect * 1.5 },
+ })
+ gsap.to(tile.rotation, { y: 0, ease: "expo.inOut", duration: 1.25 })
+ gsap.to(camera.position, {
+   x: 0, y: 0, z: width < 640 ? 35 : 30,
+   ease: "expo.inOut", duration: 1.25,
+   onUpdate: () => camera.lookAt(0, 0, 0),
+ })
+ scene.scale -> 0.825
+ other tiles.visible = false
```

The original then `goto(/slug)`. We fire `onSelect(tile)` and stay in focus.
Escape or a second click on empty space reverses the same tweens. That close
path is the only addition.

## File table

| File | Today | After |
| --- | --- | --- |
| `reference/unveil/*` | pin of HTML, CSS, JS, shaders, `mechanics.json` | stays. source of truth for the test |
| `src/registry/frosted-plate-carousel.tsx` | missing | Three.js + GSAP component. Exact numbers from the pin |
| `src/components/demos/frosted-plate-carousel.tsx` | missing | fullscreen `#fafafa` stage, default stills |
| `src/components/demos/index.tsx` | no entry | registers the demo |
| `src/lib/registry.ts` | no item | `section: components`, `category: Animations`, deps `three`, `gsap` |
| `src/lib/registry-groups.ts` | sliders group ends at `fluid-reveal-carousel` | add `frosted-plate-carousel` next to `liquid-glass-carousel` |
| `src/lib/component-meta.ts` | no meta | nuance, api, editable background |
| `src/lib/assets.ts` | no ids | 12 ids pointing at existing liquid-glass-carousel stills. no new binaries |
| `tests/frosted-plate-carousel.test.mjs` | missing | reads the component and fails if FOV, spacing, shader, easings drift from `mechanics.json` |

## Choices already made

**Name.** `frosted-plate-carousel`. Not unveil. Convention 3.

**Images.** Reuse the 12 liquid-glass-carousel Blob stills. Build the blur
texture in-component by drawing each image into a 64px canvas, matching
unveil's `blurUpThumb`. Do not ship unveil's photographs.

**Copy.** Tile titles are real project lines on those stills, same as
`liquid-glass-carousel`. No UNVEIL®, no their project names.

**Camera FOV is 5.** That is not a typo. Combined with `z = 35` and
`y = 100/7.5` it is why the plates read large and almost orthographic.

**Hover.** Desktop inner group to `x: 2/3, y: -0.1` over 0.5s `expo.out`.
Mobile to `x: 0.325` vs `-0.325`. Invisible hit mesh scaled 1.5 on X.

**Title follow.** 0.65625rem, mix-blend exclusion, saturate(0) inner span,
pointer follow at lerp 0.1. Pin has this next to the raycaster. Keep it.

**Vignette.** Desktop-only 45deg `#fafafa` corner gradient at opacity 0.75.

**Studio.** None on first ship. Defaults are the 1:1. Background is an
editable color if we want a control later. Same as `liquid-glass-carousel`.

**Install pattern.** From registry: Liquid Glass Carousel
(`reg_liquid-glass-carousel`). Same three.js + gsap registry item, demo,
meta, Blob stills. The lens-row mechanic is rejected.

## What I am not doing

The unveil header, contact overlay, Overview/Index toggle, project pages,
preloader percent, or SvelteKit routing.

Physical glass, `MeshPhysicalMaterial`, or the liquid-glass lens shader.

New image uploads. The 12 existing stills are enough to prove the motion.

A studio panel. The pin is the look.

CSS 3D. The z-coupling and shader mix are the whole effect.

## Proof

`tests/frosted-plate-carousel.test.mjs` asserts the pin:

- FOV 5, spacing 0.375, thickness 0.0175, rotation `-Math.PI/6`
- shader `margin = 0.15`, `blurTexture.a *= 0.75`
- click durations `1.25 / 3 * 2` and `1.25`, easings `expo.out` / `expo.inOut`
- camera `(0, 100/7.5, 35)` idle, dolly z 30, lights 1.5 ambient + dir at `(0,25,50)`

Then a browser pass on `https://compronents.localhost/components/frosted-plate-carousel`:
wheel, hover shift, click squares the plate, Escape restores the diagonal.
