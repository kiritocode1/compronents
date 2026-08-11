@AGENTS.md

# Pre-push gates

**Pushing to `main` is a production release.** The Vercel git integration builds
every commit on `main` as `target: production` and re-aliases `ui.aryank.space`.
There is no staging branch and no manual promote step, so the pre-push checks are
the only checks. Run all four before pushing, not after:

```bash
npm test                          # 900+ tests: registry integrity, viz completeness
npm run typecheck:registry
npx biome check <changed paths>   # repo-wide `npm run lint` has pre-existing
                                  # errors in old upload scripts; scope it
npm run build                     # the only gate that type-checks the whole app
```

`npm run build` is not optional and the first three do not stand in for it.
`typecheck:registry` runs against `tsconfig.check.json`, which excludes app files
including `src/lib/component-meta.ts`: a type error there passes every other gate
and fails only in `next build`.

After pushing, check `vercel ls --yes` rather than the site. A failed build shows
`● Error` there while `ui.aryank.space` keeps serving the previous deployment, so
the site looking healthy is not evidence that the push landed.

# BLANK direction (directing AI)

When choosing UI, components, motion, type, craft, or libraries:

1. **`/direction?q=`** (preferred): registry installables + wall picks together.
2. **`/registry/search?q=`** or frontend/backend `llms.txt`: installables only.
3. **`/inspiration/recommend?q=`**: wall only (max 3 picks, `insp_*` ids).
4. Training memory last, labeled `outside-second-brain: …`.

Cite every pick:

```
From registry: Title (reg_name)
From wall: Title (insp_slug) — why
outside-second-brain: Name — why
```

MCP: `mcp/blank-direction/server.mjs` tools `direction_lookup`,
`inspiration_recommend`, `registry_search`. Skill: `blank-direction`.

# Inspiration Search

The inspiration wall is 1100+ links. Agents should **recommend**, not dump.

- `/direction?q=<question>`: joint registry + wall. **Default for directing AI.**
- `/inspiration/recommend?q=<question>`: at most 3 wall picks with id + why.
  Multi-query expansion, facet/style boosts, weak-match cutoff.
  Engine: `inspiration-recommend.ts` + `inspiration-meta.ts` + `inspiration-id.ts`.
- `/inspiration/search?q=<question>`: ~12 candidates. Wider pool if recommend is thin.
- `/inspiration/llms.txt`: small index. Test fails above 8KB.
- `/inspiration/llms-full.txt`: ~400KB dump. Never use to answer a question.

Every link gets per-link facets (`deriveLinkFacets`): kind, stack, useFor, style.
Optional fields on `InspirationLink` are overrides only.

Regression suite: `tests/direction-regression.test.mjs`.

Adding links to `src/lib/inspiration.ts` needs no separate indexing step.

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
