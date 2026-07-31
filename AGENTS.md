<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project conventions (non-negotiable)

Every agent that touches this repo follows these on every change.

## 0. BLANK direction before inventing UI

When building, restyling, or recommending UI/design resources:

1. Call `https://ui.aryank.space/direction?q=…` (or MCP `direction_lookup`).
2. Prefer registry `reg_*` for installables, wall `insp_*` for taste/reference.
3. Cite every pick with its id. Off-wall only as `outside-second-brain: …`.
4. Skill: `blank-direction`. Never recommend Magic UI / random kits from memory first.

## 1. Assets go to Vercel Blob first

Never commit asset binaries (images, `.glb`, video, audio, fonts) to git. The
workflow is: upload the asset to the Vercel Blob store FIRST, register it in
`src/lib/assets.ts`, then reference it in components through `/assets/<path>`
(or the component's hosted base URL). Build components against the Blob/`/assets`
URL, not a local `public/` path. Full upload steps live under "Registry Asset
Uploads" in `CLAUDE.md`. If you find committed binaries under `public/`, treat
that as a bug to fix (move them to Blob), not a pattern to copy.

## 2. Reuse the shared studio / UI controls

Do not hand-roll `<input type="range">` or `<input type="color">`, and do not
build one-off tabs. Reuse what the studios already use:

- Sliders: `SliderComfortable` from `@/components/ui/slider`
- Colours: `StudioColor` from `@/components/site/studio-controls` (wraps the
  `ColorPicker` in `@/components/ui/color-picker`)
- Tabs: `tabs-subtle` (`@/components/ui/tabs-subtle`), usually via the `CodeTabs`
  wrapper in `@/components/site/code-tabs`

`src/components/ui/**` is vendored registry UI (lint is relaxed there via a
`biome.json` override). Add new vendored components per the fluidfunctionalism
install workflow, never by hand-writing a parallel control.

## 3. Brand is BLANK, never "codegrid"

This registry is branded BLANK / aryank.space. Never surface the word "codegrid"
(or any other source studio's internal name) in a preset, label, copy, or
component output. Use "BLANK" or a neutral, descriptive name instead.

## 4. Real copy, no em dashes

Text inside components must be real, specific copy that fits the component, never
lorem ipsum or throwaway filler. Never use em dashes (the long dash). Use commas,
colons, periods, semicolons, or parentheses instead. This applies to component
copy, headings, labels, preset names, and UX strings.

## 5. Backend items get a kit-style visualization that shows code AND behaviour

Every backend registry item (section "backend") ships with an animated
visualization on its `/backend/<name>` detail page, built strictly from Kit
Langton's visual vocabulary: the stateful task node, arrow connectors, the
odometer ref cell, the sliding finalizer scope stack, the schedule timeline, the
segmented outcome toggle, notification and error bubbles, the type stacks from
types.kitlangton.com, and the pentatonic sound cues. Never invent new infographic
styles (no bar meters, hash rings, or station lanes).

**A spec is not done until it shows all three of these together.** Behaviour
alone is a cartoon; code alone is a snippet. The pairing is the whole point:

1. **What it does**: nodes (or ref / scope / schedule) running the real
   sequence, with results that carry real data (values, balances, latencies).
2. **The code that does it**: a `code` line under the boxes. Every node that
   corresponds to a piece of that line sets `token` to the matching substring,
   so the token lights with its owner's state and hovering the node slides the
   highlight onto it. A code line with no wired tokens is half-built.
3. **The type it travels under**: `types` on each node: one `TypeNode` per
   step, rendered as a badge in the node's own column, tinted with the node's
   state. This is what makes the runtime value and its contract one unit instead
   of two diagrams.

Prefer a with/without variant toggle that shows the failure the component
prevents, and `{ v, bad: true }` ref values for writes that should not land.

- Engine: `src/components/site/effect-viz.tsx`. Archetypes: flow, ref, scope,
  schedule, types. Specs: `src/lib/backend-viz.ts`, one entry per item name.
- Type stacks and badges: `src/components/site/types-viz.tsx`. Shared chrome
  (run button, step ticks, segmented control): `src/components/site/viz-chrome.tsx`.
- One vocabulary: node badges, type stacks, and the code line all render through
  the same segmenter (`src/lib/type-tokens.ts`) and the same `MorphingSegments`
  renderer, so they share a palette and a morph. Never add a second syntax
  highlighter to the viz path.
- Adding a backend item means adding its spec too, or the page ships without a
  visualization. Pick the archetype that fits the concept.
- Reverse-engineered mechanics (exact springs, colors, per-state recipes) live in
  `docs/effect-visualization-guide.md` and `docs/types-visualization-guide.md`.
  Match those values; do not restyle.
