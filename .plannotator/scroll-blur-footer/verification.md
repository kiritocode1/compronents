# Verified implementation

Plan approved through Plannotator. Component, demo, fullscreen preview, asset registration and API metadata are implemented.

## Checks

- Desktop fullscreen, 1280 by 577: nested scrolling activates the overlay, observed peak strength 1.0020687561673556, then returns to exactly 0 at rest. Six layers, pointer events disabled, no desktop overflow.
- Keyboard: focused preview region and ArrowDown changed the internal scroll position.
- Reduced-motion preference changed while mounted: strength resets to 0 and stays there after scrolling.
- Mobile, 390 by 844: overlay height 150px, overlay and internal scroller both exactly 390px wide. The existing global site header extends to 479.875px and causes document scrollWidth 488px. This is outside the new component; it remains unfixed.
- Detail page: bounded demo, installation panel, API props and source-mechanism notes render.
- No browser console errors observed.
- All 1,090 tests passed. Registry typecheck, scoped Biome checks and production build passed before the final demo asset correction. Rerun output is recorded separately.
- Source tests check exact constants and rendered masks, then use real Motion to test nested scroll, inactivity, interruption, preference changes and cleanup.

## Visual comparison

[Implementation results](implementation-comparison.json), [rest capture](implementation-rest.png), [full-blur capture](implementation-full-blur.png), [mobile capture](implementation-mobile.png).

The desktop endpoint comparisons report 0 changed pixels among 719,215 compared pixels, with the original per-channel tolerance 8 and maximum changed fraction 0.1%. Ignore rectangles cover only the source hosting badge, registry close button and Next dev indicator. Capture viewport, scroll position and blur strength match the source.

The first Blob asset was a JPEG, while Chromium receives AVIF from Framer's content negotiation. That produced a failed comparison. Uploading the exact AVIF resolved it. No tolerance changes. A single 2048w source candidate with the original viewport sizes expression keeps the desktop responsive image geometry consistent.

Transition curves have source-value tests and working runtime checks, but no synchronized frame-by-frame comparison against the original. Mobile source pixel parity has not been measured. Reduced motion deliberately differs from the original by keeping the decorative blur off.

## Source and artifacts

Pinned source files are in `reference/scroll-blur-footer/`. Screenshots are local verification artifacts, not committed image assets. The only image used by the demo is uploaded to Blob and registered in `src/lib/assets.ts`. The installable component has no asset or remote runtime dependency.
