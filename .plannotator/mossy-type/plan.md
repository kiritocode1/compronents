# Mossy Type, exact-source component

## Goal
Package the linked Moss Type scene as an installable `mossy-type` component in the Text effects registry. Preserve its WebGL renderer, typography, six presets, dock, input, motion, and export behavior. Check the running component against pinned source screenshots at 1280 × 577, plus mobile and interaction states.

## Source and representative proof
- Pinned source: `reference/mossy-type/index.html`, `index.css`, `index.js`. Source screenshots: `.plannotator/mossy-type/source-desktop.png`, `source-moss.png`, `source-blossom.png` at 1280 × 577.
- Mechanism: typing updates glyph meshes built from font outlines; instanced geometry grows moss or preset-specific plants on the glyph surface. Pointer, wind, and time drive the scene. The source compiled bundle includes its renderer and six kits, so a substitute Canvas filter would drift.
- Representative visual state: `.plannotator/mossy-type/source-moss.png`. It shows the real WebGL MOSS result and dock. `source-blossom.png` shows a preset change on the same text.
- Implementation choice: an iframe-backed React component hosts the pinned page's exact DOM, CSS, and runtime, with the runtime and font files on the project's asset store. This confines global selectors, keyboard listeners, WebGL lifetime, and source CSS to the component. The source app is preserved rather than reconstructed from a screenshot. The wrapper owns the frame size and accessible title.

## Files and responsibilities
| File | Change |
| --- | --- |
| `src/registry/mossy-type.tsx` | Client component rendering a full-size isolated frame with pinned document markup and linked hosted source files. |
| `src/components/demos/mossy-type.tsx`, `src/components/demos/index.tsx` | Bounded 680px demo and binding. |
| `src/lib/registry.ts`, `src/lib/registry-groups.ts`, `src/lib/component-meta.ts` | Registry entry, Text effects group, documented API and asset URLs. |
| `src/lib/assets.ts` | Register JS, CSS, and five font assets, if the asset mapping requires it. |
| `reference/mossy-type/*` | Pinned original HTML, CSS and JS. Screenshots remain in `.plannotator/mossy-type/`, not the shipped asset tree. |
| Vercel Blob `mossy-type/*` | Host the exact JS, CSS, and original font files before the component references them. |

## Decision-bearing details
- Keep the source's `#stage`, hidden textarea, dock, popovers, copy, and CSS values. Do not replace the font faces or animate a 2D mask instead of meshes.
- Serve the compiled bundle as an asset rather than importing it into the site's React module graph. Its top-level await and global DOM queries assume the dedicated document. Use a frame with a base URL so its `./fonts/*.woff` references resolve to the uploaded originals.
- Keep the source's credit link and copy inside the reproduction. The registry shell remains BLANK-branded.
- The frame is self-contained and must not intercept keyboard input outside itself. On unmount, the frame removes the renderer and event listeners with its document.

## Checks and limits
- Verify assets resolve, type `MOSS`, switch to Blossom Wreath, change font and size, clear, and export PNG. Inspect desktop/mobile screenshots and reduced-motion behavior. Compare the dock/typography/layout at matched viewport; random growth prevents a strict identical pixel comparison for glyph pixels, so compare region masks and report the measured diff rather than assert identity.
- The original bundle is compiled and not authored as maintainable TypeScript. This is an explicit trade-off for the requested exact reproduction; future feature changes should use a separate authored implementation. Source updates are pinned, not fetched live.
- Verified implementation: `.plannotator/mossy-type/local-moss.png` and `local-blossom.png`; desktop dock and credit compare at 0 pixels over threshold 24 in matched regions. Animated glyphs differ at 14,672 / 49,500 pixels because the source uses random instances and the screenshots were not captured at a shared simulation time. Mobile `local-mobile-final.png` shows the preview close button moved below the dock; the source's own toolbar is unchanged. Source/mobile hint region compares at 0 differing pixels.
- `tests/mossy-type.test.mjs` compares every source body element/attribute/label against the component document. Hosted JS/CSS SHA-256 equal the pinned source. Registry/portrayal tests pass, TypeScript and Biome checks pass. PNG export produced a 2560 × 1154 file from the 1280 × 577 preview.
- The original site has no published license located yet; confirm redistribution rights before a public release if required. Other-browser video export has not been checked.
