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

Upload assets through the admin-protected API:

```bash
curl -X POST http://localhost:3000/api/registry-assets \
  -H "Authorization: Bearer $REGISTRY_ASSET_ADMIN_TOKEN" \
  -F "pathname=animated-footer/blank-hand-right.png" \
  -F "file=@public/blank-hand-right.png" \
  -F "allowOverwrite=true"
```

List assets:

```bash
curl http://localhost:3000/api/registry-assets?prefix=animated-footer \
  -H "Authorization: Bearer $REGISTRY_ASSET_ADMIN_TOKEN"
```

Delete an asset:

```bash
curl -X DELETE http://localhost:3000/api/registry-assets/animated-footer/blank-hand-right.png \
  -H "Authorization: Bearer $REGISTRY_ASSET_ADMIN_TOKEN"
```

For the existing Animated Footer assets, upload these public files to Vercel
Blob with matching pathnames:

```txt
public/blank-hand-right.png -> animated-footer/blank-hand-right.png
public/blank-hand-left.png  -> animated-footer/blank-hand-left.png
```

The installable component defaults to the hosted Compronents asset route, so
consumer projects receive stable public URLs while this app can swap the backing
store to Blob without changing component source.
