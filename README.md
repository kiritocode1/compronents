# Compronents

A personal shadcn-compatible registry for careful interface pieces: components,
full pages, backend snippets, and inspiration studies.

## Development

```bash
pnpm install
pnpm dev
```

The app runs on [http://localhost:3000](http://localhost:3000).

## Registry

- Catalog: `/r/registry.json`
- Item JSON: `/r/<name>.json`
- Current namespace: `@compronents`

Add an installable component by updating:

1. `src/registry/<name>.tsx`
2. `src/lib/registry.ts`
3. `src/components/demos/<name>.tsx`
4. `src/components/demos/index.tsx`
5. `src/lib/component-meta.ts`

If the component needs bespoke editing controls, add:

1. `src/components/studios/<name>.tsx`
2. `src/components/studios/index.tsx`
3. `studioPath` and `editable` metadata in `src/lib/component-meta.ts`

## Assets

Component assets are stored in Vercel Blob and served through the local asset
route:

```txt
/assets/<asset-path>
```

The public route resolves each asset in this order:

1. Vercel Blob object at `<asset-path>`
2. Local public fallback for development, when the asset is registered in
   `src/lib/assets.ts`

Required environment variables:

```txt
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
REGISTRY_ASSET_ADMIN_TOKEN=long-random-admin-token
```

Optional:

```txt
REGISTRY_ASSET_MAX_BYTES=26214400
```

The current project is linked to the `compronents-registry-assets` Blob store.
For a fresh checkout, pull the Vercel-provisioned environment before uploading:

```bash
vercel link --yes --project compronents
vercel env pull .env.local --yes
```

If the project has no Blob store yet, create and link one first:

```bash
vercel blob store add compronents-registry-assets
vercel env pull .env.local --yes
```

When prompted, link the store to `compronents` for Production, Preview, and
Development. Do not commit `.env.local` or print token values.

For the `curl` examples below, load the ignored local env into the current shell:

```bash
set -a
source .env.local
set +a
```

### Uploading assets

Use stable nested pathnames so component source can keep using
`/assets/<asset-path>`. The Blob upload must not add a random suffix.

For the existing Animated Footer hand assets:

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

You can also upload through the admin-protected app API:

```bash
curl -X POST http://localhost:3000/api/registry-assets \
  -H "Authorization: Bearer $REGISTRY_ASSET_ADMIN_TOKEN" \
  -F "pathname=animated-footer/blank-hand-right.png" \
  -F "file=@public/blank-hand-right.png" \
  -F "allowOverwrite=true"
```

For production API uploads, use the hosted API with the same bearer token:

```bash
curl -X POST https://ui.aryank.space/api/registry-assets \
  -H "Authorization: Bearer $REGISTRY_ASSET_ADMIN_TOKEN" \
  -F "pathname=animated-footer/blank-hand-right.png" \
  -F "file=@public/blank-hand-right.png" \
  -F "allowOverwrite=true"
```

### Verifying assets

List the Blob objects:

```bash
vercel blob list --prefix animated-footer --limit 10
```

Verify the app route resolves to Blob:

```bash
curl -I https://ui.aryank.space/assets/animated-footer/blank-hand-right.png
curl -I https://ui.aryank.space/assets/animated-footer/blank-hand-left.png
```

The `Location` header should point at
`https://<store-id>.public.blob.vercel-storage.com/...`.

The protected API should report `configured: true`:

```bash
curl https://ui.aryank.space/api/registry-assets?prefix=animated-footer \
  -H "Authorization: Bearer $REGISTRY_ASSET_ADMIN_TOKEN"
```

Delete an asset when needed:

```bash
curl -X DELETE http://localhost:3000/api/registry-assets/animated-footer/blank-hand-right.png \
  -H "Authorization: Bearer $REGISTRY_ASSET_ADMIN_TOKEN"
```

For any new component asset:

1. Put the local fallback in `public/`.
2. Register the asset in `src/lib/assets.ts`.
3. Use a nested Blob pathname like `<component-name>/<file-name>.<ext>`.
4. Upload with `vercel blob put ... --pathname <asset-path> --force true`.
5. Verify `/assets/<asset-path>` redirects to Blob on production.

If a Blob store or new env variable was just linked to the Vercel project,
redeploy once with `vercel deploy --prod --yes` so production functions receive
the new environment.

The installable component defaults to the hosted Compronents asset route, so
consumer projects receive stable public URLs while this app can swap the backing
store to Blob without changing component source.
