@AGENTS.md

# Inspiration Search

The inspiration wall is 1080+ links served in three tiers:

- `/inspiration/search?q=<question>`: ~12 ranked entries (~4KB). The default.
  Also `?category=<name>`, `?limit=`, and no params for the category index.
- `/inspiration/llms.txt`: a ~3KB index (what the directory is, how to search,
  every category and count). Safe to read whole. Keep it small; a test fails
  above 8KB. It is the only thing foreign agents (Codex, Grok, Cursor) reliably
  fetch, so the search instructions live there.
- `/inspiration/llms-full.txt`: the complete ~400KB dump. Never read this to
  answer a question; it truncates and you recommend from a fragment.

Retrieval is BM25 (`src/lib/inspiration-search.ts`), so it matches on shared
vocabulary. Ask two or three differently worded queries and merge, then pick
by meaning: the ranking produces candidates, you do the judging. When a
response says no entry uses a given word, that is the signal to reword rather
than trust the order.

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
