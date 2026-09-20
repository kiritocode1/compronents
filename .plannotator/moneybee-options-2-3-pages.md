# Moneybee options 2 and 3 as BLANK pages

## Goal

Moneybee chose option 1, while options 2 and 3 only exist inside the Moneybee project.
Add both unused directions to the BLANK Pages catalog as installable, full-screen page entries without redesigning them.
Prove both previews render, their media resolves through Vercel Blob, and the registry tests and production build pass.

## Shape

```text
moneybees option 2 -> Moneybee Alpine Page -> /pages/moneybee-alpine-page
moneybees option 3 -> Moneybee Editorial Page -> /pages/moneybee-editorial-page
```

## Files

| File | Today | After |
| --- | --- | --- |
| `src/registry/moneybee-alpine-page/index.tsx` | missing | installable port of Moneybee option 2, with the existing GSAP interactions and page content |
| `src/registry/moneybee-alpine-page/styles.ts` | missing | scoped option 2 CSS, including its Blob-hosted Satoshi font faces |
| `src/registry/moneybee-editorial-page/index.tsx` | missing | installable port of Moneybee option 3 and its existing interactive sections |
| `src/registry/moneybee-editorial-page/content.ts` | missing | option 3 navigation, cards, plans, FAQs, posts, and asset references under one stable Blob prefix |
| `src/registry/moneybee-editorial-page/motion.ts` | missing | option 3 GSAP timelines and scroll interactions |
| `src/registry/moneybee-editorial-page/styles.ts` | missing | the existing option 3 stylesheet, scoped to the registry page |
| `src/components/demos/moneybee-alpine-page.tsx` | missing | full-screen preview that renders the exact Alpine registry source |
| `src/components/demos/moneybee-editorial-page.tsx` | missing | full-screen preview that renders the exact Editorial registry source |
| `src/components/demos/index.tsx` | no Moneybee page demos | registers both previews |
| `src/lib/registry.ts` | no Moneybee page entries | adds two installable `pages` records with their shipped files and GSAP dependency |
| `src/lib/registry-groups.ts` | no grouping for the new pages | places both entries under `Editorial and typographic` |
| `src/lib/assets.ts` | no Moneybee media manifest | registers the option 2 and option 3 images, videos, SVGs, and Satoshi fonts at stable Blob paths |
| Vercel Blob `moneybee-alpine-page/**` | missing | contains the 33 option 2 assets copied from the Moneybee project |
| Vercel Blob `moneybee-editorial-page/**` | missing | contains the 46 option 3 assets copied from the Moneybee project |

## Real choices

The ports keep the selected source code separate instead of merging both designs into a shared abstraction. Their structures and motion systems are unrelated, and a shared layer would make each install harder to understand.

```diff
+ src/registry/moneybee-alpine-page/
+   index.tsx
+   styles.ts
+
+ src/registry/moneybee-editorial-page/
+   index.tsx
+   content.ts
+   motion.ts
+   styles.ts
```

Asset binaries stay out of the Compronents repository. The installed pages use stable public URLs, while the BLANK site can proxy the same paths through `/assets`.

```diff
- src="/option-2/hero.mp4"
+ src={`${ASSET_BASE}/hero.mp4`}

- src="/option-3/hero-image.avif"
+ src={`${ASSET_BASE}/hero-image.avif`}
```

Both registry demos import the exact source shipped by the registry.

```diff
+ import MoneybeeAlpinePage from "@/registry/moneybee-alpine-page";
+ export default function MoneybeeAlpinePageDemo() {
+   return <MoneybeeAlpinePage />;
+ }
```

## What I am not doing

- I am not changing Moneybee option 1 or removing options 2 and 3 from the Moneybee repo.
- I am not redesigning, combining, or generalising the two rejected directions.
- I am not adding bespoke studio controls. The Pages detail route already uses the full-screen iframe preview.
- I am not committing the 79 media and font files to Compronents.
- I am not touching the existing uncommitted `src/lib/inspiration.ts` change.
