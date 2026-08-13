# Settlement Layer Page — enterprise infrastructure template

A multi-page registry template built from a measured teardown of `cantor8.io`
(Webflow + GSAP + Lenis). One registry item, full routed experience, every
motion system rebuilt from the source's actual parameters.

Source capture lives in `.cantor8-analysis/` (gitignored): 24 page HTMLs, the
127KB Webflow stylesheet, 24 deduped custom JS blocks, full-page screenshots
at 1440px.

---

## Goal

Ship `settlement-layer-page` as a `section: "pages"` registry item that
reproduces the source's **craft** at high fidelity: layout structure, motion
mechanics, scroll choreography, color rhythm, and typographic scale.

## Scope boundary (read this first)

The ask was a 1:1 copy "including text". I am building the design and motion
1:1, and writing **original copy and branding** instead of reproducing the
source's.

Two reasons, and the second is not mine:

1. Cantor8 is a live commercial company. Their marketing prose, wordmark,
   product names (`C8 Vault`, `C8 Registry`, …), partner logos, blog articles,
   and image assets are their content. Republishing them in a public component
   registry that other people install is redistribution, not inspiration. This
   also applies to lightly-reworded versions — that is the same act with extra
   steps, so I am not doing that either.
2. `AGENTS.md` already forbids it independently. Convention 3: never surface a
   source studio's name in a preset, label, or component output. Convention 4:
   text inside components must be real, specific copy that fits the component.

So the template is BLANK-branded, describing a generic institutional
settlement/custody infrastructure product, with copy written for it. What is
reproduced 1:1: **every number below.**

**Anything here you want changed, cut it in review.**

---

## Design tokens (measured from source CSS)

```
--blue        #044ab3    primary sections
--blue-deep   #033a8c    pressed / gradient stop
--blue-abyss  #051e43    deepest panel
--accent      #0082f3    interactive accent
--accent-2    #2895f7    hover accent
--pixel-accent #6FE3FF   pixel-dissolve sparkle
--black       #151515    dark sections
--white       #ffffff
greys         #5d6c7b  #758696  #aaadb0  #c8c8c8  #e2e2e2
blue alpha ladder  044ab3 @ 00 / 14 / 1a / 26 / 40 / 4d / 59 / 66
```

Type: **PP Neue Montreal** (display) + **Fragment Mono** (mono/eyebrow).
Both already available — Neue Montreal is in this repo's Blob store from other
page templates; Fragment Mono is OFL via Google Fonts.

Breakpoints (Webflow standard, keep exactly): `991` / `767` / `479`.

---

## The ten motion systems, with source parameters

These are the deliverable. Each is rebuilt in React, not copied as a script.

1. **Smooth scroll spine.** Lenis `autoRaf: false`, `anchors: true`,
   `allowNestedScroll: true`. GSAP `ticker.lagSmoothing(0)` drives
   `lenis.raf(time * 1000)`. `lenis.on('scroll', ScrollTrigger.update)`.
   Resync on `load` and `document.fonts.ready`.

2. **Pixel dissolve transition** (the signature effect). `COLS 25`, `ROWS 6`,
   `REVEAL_RATIO 0.5`. Seeded minstd LCG (`t * 16807 % 2147483647`), seeds
   `100+i` pattern / `200+i` reveal order / `300+i` black order — deterministic
   across reloads. Bottom 2 rows always filled; rows 0/1/2+ appear at
   `0.34 / 0.50 / 0.70`; pixel type split `55% / 27% / 18%` (to-color /
   from-color / accent). Two phases: `p 0→0.5` reveals, `p 0.5→1` fills to
   solid. ScrollTrigger `start: 'bottom bottom'`, `end: 'top top'`,
   `invalidateOnRefresh`. Cell size `max(18, ceil(containerWidth / 25))`.

3. **Scroll pulse.** `SCROLL_STRETCH 6.0`, `SCROLL_SLOW_PAD 1200`,
   `SCROLL_LEAD 0`, `MOTION_DELAY 0.15`, `PULSE_EDGE 0.25`. Heading progress
   maps `startY = vh * 1.05` → `endY = vh * 0.12`.

4. **SVG path pulse** (travelling light along the staircase connectors).
   `seg = max(48, len * 0.045)`, `duration 3.4 + i * 0.15`, `ease 'none'`,
   `repeat -1`. Draw-in stagger `0.18`. Bubbles `duration 0.55`,
   `stagger 0.1`, `power2.out`. Trigger `top 85%`.

5. **Products drag carousel.** Momentum `lerp(current, target, 0.14)`,
   `rightInset = clientWidth * 0.15`, card-center math off viewport width.

6. **Line-reveal hover.** Desktop gate
   `(min-width: 992px) and (hover: hover) and (pointer: fine)`. Text wrapped in
   `.line-inner` carrying `data-text` for the duplicate masked layer.

7. **Partners pattern grid.** Fixed 8-cell placement pattern across 3 block
   rows, `min-width: 768px` only; below that, natural flow.

8. **Header logo/theme swap.** IntersectionObserver flips the header to its
   light variant over light sections, `min-width: 992px`.

9. **Hero radial burst.** Line-burst SVG, drawn on load, feeding into (4).

10. **Page-specific**: contact form + phone mask, career open-role counter,
    blog reading progress + copy-link, Splide 3.2.2 logo marquee.

---

## Page templates

Every page shares `header` + sections + `cta_box` + `footer`.

| Route | Sections |
|---|---|
| `/` | hero · built_for · products · cutting_edge · newsroom · cta |
| `/products` | products_scroll · product_transition · cta |
| `/products/[slug]` ×7 | hero · operational · properties · cta |
| `/company` | hero_about · black_cards · cta |
| `/partners` | partners_hero · partners_main · support_partners · cta |
| `/career` | hero_career |
| `/contact` | contact |
| `/newsroom` | news_page · cta |
| `/blog` | articles · cta |
| `/blog/[slug]` ×3 | article body · progress · cta |
| `/legal/[slug]` ×3 | prose |

Routing is internal to the component (same approach as
`archive-commerce-page`), served through the static-template-bundles catch-all.

---

## Files to touch

```
src/registry/settlement-layer-page/index.tsx      new — component + internal router
src/registry/settlement-layer-page/styles.ts      new — style factory
src/registry/settlement-layer-page/content.ts     new — original copy + nav data
src/components/studios/settlement-layer-page.tsx  new  (+ index.tsx registration)
src/components/previews/settlement-layer-page.tsx new  (+ index.tsx registration)
src/components/demos/settlement-layer-page.tsx    new  (+ index.tsx registration)
src/app/(static-template-bundles)/settlement-layer-page/[[...pathname]]/route.ts  new
src/lib/registry.ts                               edit — registry entry
```

Deps: `gsap`, `@gsap/react`, `lenis` — all already in the project. No new
dependency, so no pnpm install quirk.

Assets: any imagery is generated/neutral and uploaded to Blob per the
`AGENTS.md` #1 workflow, registered in `src/lib/assets.ts`, referenced through
`/assets/<path>`. No source imagery is redistributed.

---

## Build order

1. Shell: tokens, fonts, header/footer, Lenis+ScrollTrigger spine, router.
2. Pixel dissolve + scroll pulse + path pulse primitives (the hard three).
3. Home page, section by section, checked against the reference screenshot.
4. Products index + product detail template.
5. Company, partners, career, contact.
6. Newsroom, blog index, blog post, legal.
7. Responsive passes at 991 / 767 / 479.
8. Registry wiring + the four pre-push gates.

---

## Risks

- **Pixel dissolve reflow cost.** 150 divs recolored per scroll frame. Source
  mitigates with a per-element `__c` last-color cache and only writes on
  change — I will keep that, and bail out to a solid class at `p >= 0.997`.
- **Scroll length.** `SCROLL_STRETCH 6.0` plus `SLOW_PAD 1200` makes some
  sections very long. Faithful, but I will confirm it feels right rather than
  assuming the number transfers.
- **`archive-commerce-page` is 2455 lines.** This site is bigger. I will split
  into `content.ts` + section components rather than one monolith.
- **Long build.** Realistically several passes. I will land it in reviewable
  commits, not one drop.

## What I will not do

- Reproduce source marketing copy, product names, wordmark, partner logos,
  blog articles, or image assets (see scope boundary).
- Add a dependency the project does not already have.
- Push to `main` without the four gates in `CLAUDE.md` — pushing is a
  production release and re-aliases `ui.aryank.space`.
- Restyle the existing shared studio controls.
