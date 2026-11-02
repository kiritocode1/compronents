# Aura Carousel: registry component

## 1. Goal

- **Problem.** toolcraft.sh/demos/aura-carousel is a carousel inside a design-tool shell (control panel, toolbar, export, persistence).
- **Result.** `aura-carousel` registry item: just the carousel, the source's default settings baked in, cards from our existing Blob photos.
- **Proof.** Port fed the source's own PNGs, diffed against the source's WebGL canvas at the same scroll and backing size.

Exact port. Source pinned in `reference/` (page, entry, CSS, the carousel section of the beautified bundle, the CSS module).

## 2. How it fits

```
<section> DOM rail (3 copies, native scroll, mouse drag, wheel, arrows)
        │ one logical scroll value + smoothed velocity
        ▼
strip textures (cards + testimonials, painted once at 2x)
        │
        ▼
fragment shader (verbatim) ── warp, ripple, dispersion, aura, gate, fade
        ▼
<canvas> over the rail, DPR x renderScale
```

## 3. Files

| File | Role |
| --- | --- |
| `src/registry/aura-carousel.tsx` | Component, renderer, shader, input |
| `src/components/demos/aura-carousel.tsx`, `previews/aura-carousel.tsx` | Demo and fullscreen preview |
| `registry.ts`, `component-meta.ts`, `registry-groups.ts`, demo/preview indexes | Standard wiring |
| `assets.ts` | Figtree woff2 (source file, uploaded to Blob at `aura-carousel/`) |

## 4. Decisions

1. **Images.** Per your answer, the five branded source PNGs are replaced by `liquid-glass-carousel` img-12, 5, 8, 1, 9 from Blob. No new image uploads.
2. **Scrim.** Source cards bake a dark bottom into their pixels. The port draws an equivalent gradient (transparent at 45%, 0.42 at 72%, 0.86 at the bottom) so any photo keeps the white copy legible. `scrim={false}` turns it off.
3. **Rounded corners and cover-crop** are drawn in code; the source PNGs had them baked.
4. **Dropped:** control panel, toolbar, PNG export, localStorage persistence, render-pipeline instrumentation, the clean-text overlay (only used when Text effect is off, which the default never is).
5. **Vertical anchors** use `calc(50% - Npx)` instead of fixed px so the 714px block centres in any height. Identical at 1034px.
6. **Heading is `h2`**, not `h1`, so the component does not add a second page title.
7. **Props:** `title`, `cards`, `background`, `renderScale` (default 2, as the source), `scrim`.

## 5. Evidence (`evidence/`)

- `rest/`: port with source PNGs vs source, 1920x1034, DPR 1, both 3840x1376 backing, scroll 1856. Geometry identical for header, title, nav, rail and canvas host. Pixels: 99.92% identical; every difference above 3/255 sits in the card top/bottom corner rows, caused by the harness clipping the source's already-rounded PNGs a second time. Elsewhere max 3/255.
- `step2/`: same after two ArrowRight presses. Both land at 464. Same diff profile.
- `port-default-*.png`, `port-detail-page.png`: the shipped default.
- `interact.mjs`: drag 300px moves scroll by 300 and does not snap (source behaviour); horizontal wheel wraps and snaps after 480ms; vertical wheel passes through; no console errors.

## 6. Not covered

- Below 1472px the header is flush to the edges. That is the source's CSS (`width: min(1472px, 100%)`), kept as is. Proposal only: add side padding.
- Motion frames (velocity streak) were not pixel-diffed; they depend on frame timing. The code path is a line-for-line port.
- Touch scrolling was not exercised on a device.
- `renderScale` 2 on a DPR 2 screen renders 7680x2752 backing pixels during motion. Matches the source; not profiled.
