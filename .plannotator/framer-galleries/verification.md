# Verified implementation

Three independent pure React/TypeScript registry components. No source HTML imports, Framer runtime, iframe implementation or remote compiled JavaScript. Pinned source files are evidence only.

## Runnable previews

- [Warped Gallery](https://compronents.localhost:1355/components/warped-gallery/preview)
- [Hover Bloom](https://compronents.localhost:1355/components/hover-bloom/preview)
- [Fluid Refraction](https://compronents.localhost:1355/components/fluid-refraction/preview)

## Fidelity evidence

Desktop comparisons use 1280 × 577, DPR 1. Mobile comparisons use 390 × 844, DPR 1. Original gallery video paused at one second. Only documented page chrome is masked. Per-channel tolerance is 2, maximum changed percentage 0.1. See [capture conditions](comparison-conditions.md).

| Component | Desktop changed pixels | Mobile changed pixels | Scope |
| --- | --- | --- | --- |
| Warped Gallery | 0 / 710,310 | 0 / 304,750 | Resting layout, original responsive media and video frame |
| Hover Bloom | 0 / 710,310 | 0 / 304,750 | Seed 42, one press, 240 manually advanced frames |
| Fluid Refraction | 0 / 710,310 | 0 / 304,750 | Resting cover image |

Reports and diff images: `gallery-diff`, `gallery-mobile-diff`, `bloom-diff`, `bloom-mobile-diff`, `fluid-diff`, `fluid-mobile-diff`, each with `.json` and `.png` extensions in this directory.

The pixel comparisons do not establish active gallery or fluid motion parity. GLSL is byte-for-byte source-tested, and layout functions are compared against the pinned original. Live pointer and keyboard interactions executed without browser errors. Responsive resize checks passed. The downloaded original JPEG/PNG files were insufficient for fidelity because Framer negotiates browser-specific optimized images. Final demo assets use browser-fetched representations uploaded to Blob. Browser media hashes are pinned in `reference/bold-lychee/browser-media.json`.

## Runtime and lifecycle

[Runtime results](runtime.json): desktop and mobile mounting, gallery keyboard navigation, bloom press and visible painting, fluid pointer input, canvas resize and no browser errors. All component containers stay within viewport bounds. The existing preview shell reports mobile document horizontal overflow, while each component remains correctly sized. That unrelated shared shell was not changed.

[Lifecycle results](lifecycle.json): two independent instances of each WebGL renderer, gallery wheel isolation, resize, fluid settings update and gallery controller replacement. After disposal, zero live textures, framebuffers, programs, shaders, buffers, observers and queued animation frames. This tests renderer controllers, not React prop reconciliation or exception rollback.

Fallback checks: gallery retains eight links and seven images when WebGL is unavailable; fluid displays its loaded image. Reduced-motion checks confirm preference recognition and paused gallery videos. Fluid renders with reduced motion, but active simulation cessation was not separately measured. Touch press for mobile bloom is covered by seeded parity; full touch drag, interruption, React prop changes and failure-path allocation rollback remain unverified.

Repeatable commands:

```sh
node scripts/verify-framer-components.mjs check all
node scripts/verify-framer-components.mjs bloom-parity
node scripts/verify-framer-components.mjs bloom-parity mobile
node scripts/verify-framer-lifecycle.mjs
```

## Engineering gates

- `npm test`: 1,078 passed, zero failures.
- `npm run typecheck:registry`: passed.
- `npx tsc --noEmit`: passed.
- Scoped Biome check: passed, 24 files.
- `npm run build`: exit 0, 3,226 generated pages. Existing Next tracing warning remains.

Logs are in this directory. No commit or push was performed. The existing edit to `src/lib/inspiration.ts` was left untouched.

## Recordings and remaining evidence gaps

[Webreel config](webreel.config.json), validation and dry run passed. The initial odd-height MP4 encode failed with EPIPE. The retry at 1280 × 578 encoded all three files. Playback confirmed [bloom growth](videos/grow-watercolor-blooms.mp4), duration 3.15 seconds.

Gallery and fluid recordings are not valid motion evidence. Playback showed only 0.083 and 0.15 seconds despite longer scripted paths. Investigation found Webreel capture starvation, not missing pause actions. The configuration and logs are retained, but those two recordings must be repaired before claiming recorded motion verification. Interactive checks remain valid execution evidence, not proof of exact active-motion parity.

## Preserved API decisions

Typed project data for Warped Gallery, normal container composition and explicit sizing. Fluid accepts supplied image or video. Bloom is procedural and needs no image assets. Static media fallbacks, reduced motion, local pointer coordinates and disposal are permitted departures. Framer/editor chrome is absent from component implementations.
