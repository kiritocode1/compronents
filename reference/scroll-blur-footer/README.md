# Scroll blur footer source

Captured 2026-10-08 from https://scrollingblur.framer.website/.

- `index.html` contains the published HTML and compiled CSS.
- `main.mjs` maps routes to published page chunks.
- `page.mjs` contains the blur component inline as `P`.
- `motion.mjs` is the published animation runtime imported by that page.

The source uses six backdrop layers with blur coefficients 2, 4, 6, 8, 10 and 12px. Masks cover successive sixths of the overlay. Scroll activity drives strength toward 1 with stiffness 300 and damping 30. After 180ms of inactivity it returns to 0 with stiffness 80 and damping 26. The bottom overlay is 150px tall and has z-index 7.

The React port preserves these values and uses the npm `motion` package instead of published Framer modules. It adds reduced-motion handling and explicit cleanup. No source-host JavaScript loads at runtime.

## Demo image

Source URL:

https://framerusercontent.com/images/QaPKJVIGqlVdLI4luv7VueVzR0.jpg?scale-down-to=2048&width=5120&height=2880

Chromium negotiates AVIF through its image Accept header. The JPEG returned to a default curl request is not visually equivalent for screenshot comparison. The AVIF response is uploaded without conversion to:

https://zs4kp2p2okhfnarl.public.blob.vercel-storage.com/scroll-blur-footer/gradient.avif

SHA-256: `bc3a3b3fcc704d3e9101e92a12d904e63085120e8447c4fc74b119a5fbe10b64`.

The installable overlay needs no image. This asset is only for the catalog demo and fullscreen preview. Redistribution rights have not been established from the public source.

Screenshot evidence and comparison scripts are under `.plannotator/scroll-blur-footer/`. Captures are verification artifacts and should not be committed as asset binaries.
