# Source comparison conditions

Set before numerical comparison.

- Chromium, viewport 1280 × 577, DPR 1 for HoverBloom and FluidRefraction. WarpedGallery first source capture is 1280 × 580; recapture both at 1280 × 577 before comparing.
- Source controls and installed demo controls use the actual published page settings.
- Bloom: fresh navigation, no pointer movement before capture. Replace random sampling with LCG seed 42 after initialization, capture one pointerdown at 640,500 and exactly 240 queued animation frames. Source's random ID allocation must remain in the sampling sequence.
- Fluid: resting-media comparison must wait for fluid to settle; active-motion parity requires seeded splats and identical frame timestamps, not independent random runs.
- Gallery: freeze video on a shared frame and wait for all media and font loads. Compare source-current media variants, not unrelated downsampled versions.
- Mask chrome only: source Framer badge, source editor affordance, registry close button, Next dev indicator. Rectangles for desktop 1280 × 577: x=1110..1280/y=500..577; x=1220..1280/y=250..330; x=1220..1280/y=0..70; x=0..80/y=500..577.
- Per-pixel max-channel difference <=2 counts as equal. Maximum allowed changed pixels 0.1% of unmasked pixels. Report actual error counts and mean absolute error. Never raise these limits to pass a comparison.
- Media readiness, browser chrome or viewport corrections may be made to the setup; record them explicitly. Random/dynamic differences remain unverified unless captured under matched conditions.
