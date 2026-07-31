@AGENTS.md

# Inspiration Search

The inspiration wall is 1100+ links. Agents should **recommend**, not dump.

- `/inspiration/recommend?q=<question>`: at most 3 picks with a why (~2KB).
  **Default for recommendations.** Multi-query expansion, facet boosts
  (kind/stack/useFor + category defaults), weak-match cutoff.
  Engine: `src/lib/inspiration-recommend.ts` + `inspiration-meta.ts`.
- `/inspiration/search?q=<question>`: ~12 ranked candidates (~4KB). Wider pool
  when recommend feels thin. Also `?category=<name>`, `?limit=`.
- `/inspiration/llms.txt`: ~3–6KB index (how to recommend, category counts).
  Safe to read whole. Test fails above 8KB. Foreign agents learn the protocol
  from this file.
- `/inspiration/llms-full.txt`: complete ~400KB dump. Never read to answer a
  question; it truncates and you recommend from a fragment.

Every link gets per-link facets at resolve time (`deriveLinkFacets` in
`inspiration-meta.ts`): title, host, named products, stack detection, plus
`CATEGORY_DEFAULTS`. Optional `kind` / `stack` / `useFor` on `InspirationLink`
are overrides only; you do not need to hand-tag new entries.

Agent contract (also in the global `second-brain` skill and the
`aryank-ui-inspiration` rule): call recommend before answering, cite only
Picks (max 3), say "nothing fits" rather than inventing off-wall junk.

Adding links to `src/lib/inspiration.ts` needs no separate indexing step; the
index is derived from `inspirationGroups` at runtime.

# Backend Visualizations

Every backend registry item gets a kit-style Effect visualization on its
`/backend/<name>` page, built only from Kit Langton's visual-effect vocabulary
(convention 5 in `AGENTS.md`). Engine: `src/components/site/effect-viz.tsx`.
Specs: `src/lib/backend-viz.ts` (one `VizEntry` per item name; a new backend
item is not done until its spec exists). Mechanics reference:
`docs/effect-visualization-guide.md`. The animation must teach the failure the
component prevents, not just decorate the page.

# Type Visualizations

The `types` archetype is kit's Visual Types vocabulary
([types.kitlangton.com](https://types.kitlangton.com)) as a fifth backend viz
archetype, next to flow/ref/scope/schedule. That site is NOT open source; it was
reverse-engineered from its bundle (extraction notes in `.types-analysis/`,
gitignored).

Use it when the failure a component prevents is **type-level** rather than
runtime: the mistake shows up in the contract instead of in a task node.

It composes with the runtime archetypes two ways, and both matter:

- **As a variant.** A `VizEntry` variant set can mix archetypes, so a segmented
  control can switch between a `flow` and a `types` view of the same item (see
  `effect-httpapi-derived-client`).
- **Inline, on the same clock.** Any spec can carry `typeStacks?: TypeStep[]` on
  its `Base`, rendered under the body and advanced by the same step clock, so
  the runtime picture and the contract that guards it play together with no
  click (see `effect-rpc-contract-transport`). A steps array shorter than the
  run holds its last entry. Supported for flow/ref/scope; `schedule` sweeps
  continuously and has no per-step index to sync to.

- Renderer: `src/components/site/types-viz.tsx` exports `TypeStacks`,
  `TypeBadge` and `MorphingSegments`, and owns no chrome. Stack kinds: expr,
  set, call, result, subset.
- **One vocabulary everywhere.** Node type badges (`node.types`), type stacks,
  and the code line under the boxes all render through the same segmenter and
  the same `MorphingSegments` renderer, so they share a palette and a morph.
  `code` accepts an array for per-step code, which then rewrites itself token by
  token as the run advances. Do not add a second syntax highlighter for viz
  code; `segmentType` handles comments and method chains.
- Shared chrome (run button, step ticks, segmented control):
  `src/components/site/viz-chrome.tsx`, used by both engines so neither imports
  the other.
- Segmenter: `src/lib/type-tokens.ts`. Its whole job is **stable segment ids**,
  which is what makes one type morph into the next instead of flickering.
  `tests/type-tokens.test.mjs` guards that; run it after touching the lexer.
- Sounds: `src/lib/types-viz-sounds.ts`, kit's Tone.js voices rebuilt on
  `@web-kits/audio` (same approach as `effect-viz-sounds.ts`, no new dependency).
- Mechanics reference: `docs/types-visualization-guide.md`.

# Backend Viz Completeness

Convention 5 in `AGENTS.md` is enforced by
`tests/backend-viz-completeness.test.mjs`: every spec must show what it does
(nodes), the code that does it (a `code` line with node `token`s wired), and the
type it travels under (`types` badges on nodes, or a `types` variant).

It is a **ratchet**, not a gate. 113 of 115 specs predate the rule and sit in
`KNOWN_GAPS`. New items must be complete; fixing an old one means deleting its
line from that list, and the test fails if a listed item is already complete. So
the backlog can only shrink.

`tests/alias-hooks.mjs` teaches `node --test` the `@/` alias, so tests import
app modules directly instead of grepping them as text.

# Registry Asset Uploads

Assets for installable registry components belong in Vercel Blob and should be
served through `/assets/<asset-path>`.

Current Blob store:

- Vercel project: `compronents`
- Store name: `compronents-registry-assets`
- Public asset route: `https://ui.aryank.space/assets/<asset-path>`

Before uploading from a fresh checkout:

```bash
vercel link --yes --project compronents
vercel env pull .env.local --yes
```

If `BLOB_READ_WRITE_TOKEN` is still missing, create/link the store, select
Production, Preview, and Development, then pull env again:

```bash
vercel blob store add compronents-registry-assets
vercel env pull .env.local --yes
```

Never print secrets and never commit `.env.local`.

For shell `curl` commands that need `REGISTRY_ASSET_ADMIN_TOKEN`:

```bash
set -a
source .env.local
set +a
```

Upload registry assets with stable nested pathnames. Do not add random suffixes.

```bash
vercel blob put public/blank-hand-right.png \
  --pathname animated-footer/blank-hand-right.png \
  --force true \
  --add-random-suffix false \
  --content-type image/png

vercel blob put public/blank-hand-left.png \
  --pathname animated-footer/blank-hand-left.png \
  --force true \
  --add-random-suffix false \
  --content-type image/png
```

For a new component asset:

1. Add the local fallback file under `public/`.
2. Register it in `src/lib/assets.ts`.
3. Upload it to Blob with a pathname like `<component>/<file>.<ext>`.
4. Confirm `vercel blob list --prefix <component> --limit 10` shows it.
5. Confirm `curl -I https://ui.aryank.space/assets/<asset-path>` redirects to
   `*.public.blob.vercel-storage.com`.
6. If the Blob store or env vars were newly linked, run
   `vercel deploy --prod --yes` before production verification.

The protected app API is also available:

```bash
curl -X POST https://ui.aryank.space/api/registry-assets \
  -H "Authorization: Bearer $REGISTRY_ASSET_ADMIN_TOKEN" \
  -F "pathname=<component>/<file>.<ext>" \
  -F "file=@public/<file>.<ext>" \
  -F "allowOverwrite=true"
```
