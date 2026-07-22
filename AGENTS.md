<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project conventions (non-negotiable)

Every agent that touches this repo follows these on every change.

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

## 5. Backend items get a kit-style Effect visualization

Every backend registry item (section "backend") ships with an animated
visualization on its `/backend/<name>` detail page, built strictly from Kit
Langton's visual-effect vocabulary (effect.kitlangton.com): the stateful task
node, arrow connectors, the odometer ref cell, the sliding finalizer scope
stack, the schedule timeline, the segmented outcome toggle, notification and
error bubbles, and the pentatonic sound cues. Never invent new infographic
styles (no bar meters, hash rings, or station lanes).

- Engine: `src/components/site/effect-viz.tsx` (archetypes: flow, ref, scope,
  schedule). Specs: `src/lib/backend-viz.ts`, one `VizEntry` keyed by item name.
- Adding a backend item means adding its spec too, or the page ships without a
  visualization. Pick the archetype that fits the concept.
- The animation must teach, not decorate: prefer a with/without variant toggle
  that shows the failure the component prevents, results that carry real data
  (values, balances, latencies), a `code` line whose tokens light with node
  state, and `{ v, bad: true }` ref values for writes that should not land.
- Reverse-engineered mechanics (exact springs, colors, per-state recipes) live
  in `docs/effect-visualization-guide.md`. Match those values; do not restyle.
