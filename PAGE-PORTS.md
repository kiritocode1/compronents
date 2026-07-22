# Full-Page Template Ports

Tracking doc for porting the source sites in `~/Documents/full-pages/CGMWT*/`
into the registry as **real, editable, shadcn-installable React components**
(not iframes). Faithful to the source: all animations, fonts, media.

Commit per source on `main`. Validate every slice: `tsc --noEmit`, `biome check`,
`next build`, and load `/pages/<name>/preview` (200 + styled).

## Status

| Source (full-pages/…)                | Registry page             | Method       | Status |
| ------------------------------------ | ------------------------- | ------------ | ------ |
| CGMWTAPR2025 / format-archive        | `archive-commerce-page`   | React port   | ✅ done (current; replaced the static iframe) |
| CGMWTAUGUST2025 / terrene            | `interior-studio-page`    | React port   | ✅ done (current; replaced the static iframe) |
| CGMWTMAR2025 / nico-palmer           | `march-2025-template`     | React port   | ✅ done (pre-existing) |
| CGMWTFEB2026 / salle-blanche         | `dining-room-page`        | React port   | ✅ done (`684b40c`) |
| CGMWTSEPT2025 / negative-films        | `film-studio-page`        | React port   | ✅ done (`16628b0` + fixes) |
| CGMWTMAY2026 / deadlock-studios      | `dark-catalog-page`       | React port   | ✅ done (`afdd7c4` + `75039f9` + `4951bd0`) |
| CGMWTJAN2026 / deadspace             | `deadspace-page`          | React port   | ✅ done (`1f194a0` + current) |
| CGMWTMAY2025 / otis-valen            | `otis-valen-page`         | React port   | ✅ done (`2139f55`) |
| CGMWTAPR2026 / lemon-bureau          | `lemon-bureau-page`       | React port   | ✅ done (current) |
| CGMWTJUNE2025 / wu-wei               | `wu-wei-page`             | React port   | ✅ done (current) |
| CGMWTJULY2024 / damien-tsarantos     | `damien-tsarantos-page`   | React port   | ✅ done (current) |
| obys.agency (live)                   | `blnk-agency-page`        | React port   | ✅ done (BLNK rebrand, shared registry imagery) |

## Port recipe (per source)

Mirror `src/registry/march-2025-template/` and the two done ports.

1. **Read** the full source (pages + components + CSS). Note framework: Vite
   vanilla-JS, Vite/Next React, or plain HTML.
2. **Upload assets:** `node scripts/upload-template-assets.mjs <srcPublicDir> <name>`
   (reads `BLOB_READ_WRITE_TOKEN` from `.env.local`, `put()` at `<name>/<relpath>`,
   no committed binaries).
3. **Scope CSS:** `node scripts/scope-css.mjs <name> <cssfiles...>` → wrap into
   `src/registry/<name>/styles.ts` as `getXStyles(assetBase)` (JSON-stringified
   string). Replace root-relative `url(/…)` with `url(__ASSET_BASE__/…)` and have
   the getter `replaceAll("__ASSET_BASE__", assetBase)`. Append a `STRUCTURAL_STYLES`
   const for the root/viewport (`overflow-x:clip` on root, NOT `overflow:clip` on a
   wrapper — that breaks `position:sticky`/ScrollTrigger pin).
4. **Component:** `src/registry/<name>/index.tsx` — one `"use client"` component:
   `<main className="<name>"><style dangerouslySetInnerHTML><Shell/></main>`.
   ASSET_CONTEXT + `useAsset()`; lightweight router (6 routes) replacing next/vite
   routing; clip-path/overlay page transition replacing view-transitions; port each
   source script into a `useEffect`/`useGSAP` with cleanup (dispose Three, kill
   ScrollTriggers, remove listeners). Props: `assetBase`, `initialPath`, `className`,
   `style`. `import type * as React from "react"` for `React.*` types.
5. **Wire:** demo/preview/studio → `assetBase`/`initialPath` API; `registry.ts` entry
   (dir files: index.tsx registry:ui + styles.ts registry:lib, deps, category
   Animations); `component-meta.ts` (real API); `assets.ts` (generate from source dir).
6. **Validate + commit** the slice.

## Gotchas learned (all fixed — don't regress)

- **Scroll:** do NOT use `<ReactLenis root>`. The FullscreenPreview wraps pages in a
  `fixed inset-0 overflow-y-auto` container (its own scroller, not the window), so
  window-Lenis hijacks the wheel and nothing scrolls. Resolve that container from the
  concrete root element, set `ScrollTrigger.defaults({ scroller })`, then mount the
  source page only after the scroller is ready. If components mount first, some pins bind
  to `window` and scrolling feels like it is jumping against the sticky sections.
- **Global selectors:** effects using `document.querySelector`/`gsap.utils.toArray(".class")`
  match BOTH transition layers when two are mounted → e.g. dining's Footer crashed
  `POSTCARDS[5..9]` undefined ("reading 'x'"). Scope queries to the component's own
  section/root ref.
- **CSS tokenizer:** `scope-css.mjs` must be string/paren-aware — a `;` inside
  `url("…wght@400;700…")` truncated an @import and its unterminated quote nuked the
  WHOLE stylesheet (page rendered unstyled). Fixed in `a4184a6`.
- **WebGL CORS:** cross-origin Blob `<video>`/textures taint the canvas → `texImage2D`
  SecurityError. Add `crossOrigin="anonymous"` (Blob sends `access-control-allow-origin:*`)
  and set `TextureLoader.crossOrigin`. Guard `renderer.render` in try/catch → fall back
  to plain media.
- **Transition overlay:** if the source hides a full-screen overlay on load via JS,
  replicate it (mount-time `gsap.set(".transition-overlay", { scaleY: 0 })`), or the
  page sits stuck showing the overlay (film was full-red).
- **biome:** `src/registry/**` override relaxes noImgElement, useExhaustiveDependencies,
  noArrayIndexKey, useIterableCallbackReturn, noNonNullAssertion, and interactive-div
  a11y (portable ported templates). Keep useButtonType/useValidAnchor strict (fix inline).

## Detail-page preview

Page-section detail pages render a **bounded 640px iframe** of `/pages/<name>/preview`
via `PageIframePreview` (`2f70510`) instead of the heavy component inline.

## Branding

Replace "Codegrid"/"Built by Codegrid" with **BLANK**. No em dashes. Real copy only.
