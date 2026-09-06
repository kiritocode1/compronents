# Inspiration search verification

The website and Inspiration MCP tools call `src/lib/inspiration/retrieve.ts`. Search uses the current database records, explicit catalog descriptions, optional source passages, and owner preferences. Inherited stack tags do not establish technology support.

## Production setup and agent imports

Production uses `compronents-inspiration` in the existing Neon integration on
the `blankspacets` Vercel team. It is connected to the `compronents` project with
the `INSPIRATION_` environment-variable prefix. The database started on the Free
plan. The existing `DATABASE_URL` continues to belong to mint-me.

Use the production CLI for live catalog additions. It requires Vercel CLI
access to that team and uses a pinned CLI version with `env run` support:

```sh
pnpm inspiration:production health
pnpm inspiration:production import --dry-run
pnpm inspiration:production import
pnpm inspiration:production inspect '<canonical-url>'
pnpm inspiration:production explain 'Exact title' --limit 5
```

This command loads credentials into the child process without saving an env
file. `NODE_ENV=production` prevents accidental fallback to a local database.
Vercel may warn that owner/session Secret values cannot be pulled. These CLI
operations need the integration's database connection, not a browser session;
do not copy the unavailable secrets into local files to silence that warning.

Initialize a new dedicated database with `pnpm inspiration:production migrate`
before importing. Imports are repeatable and preserve preferences and passages.
They currently read the whole catalog, so inspect concurrent source edits first.
The shared `/inspo` command in `.claude/commands/inspo.md` requires this import
and database inspection. Source commits alone do not update hosted records.

Before declaring a production setup ready, verify all of the following:

- Health reports `neon` and the expected resource count.
- Vercel Production has `INSPIRATION_DATABASE_URL`,
  `INSPIRATION_OWNER_PASSWORD`, `INSPIRATION_SESSION_SECRET`, and
  `INSPIRATION_ORIGIN=https://ui.aryank.space`.
- Redeploy after adding environment variables; existing deployments retain
  their earlier environment.
- The deployed search API reports `postgres`, and exact lookup returns the
  imported resource ID. A successful `catalog` response is fallback behavior.
- Owner sign-in succeeds, a preference survives reload, and sign-out succeeds.
  Restore any test preference to its previous value.

## Local setup

Use Node 24 or newer and `pnpm install`. Before starting the app:

```sh
pnpm inspiration import --dry-run
pnpm inspiration import
pnpm inspiration health
pnpm test:inspiration-search
portless list
portless
```

The default URL is `https://compronents.localhost`. Reuse an existing route. An unprivileged TLS proxy may include its configured port, as reported by `portless list`.

Local state lives in `.inspiration-local`. PGlite permits one process per database. Run CLI commands before the server, or set `INSPIRATION_LOCAL_DB` to a separate path for verification. Tests create isolated databases. A lock error means another process owns that database; do not remove a live lock or kill another session.

`INSPIRATION_DATABASE_URL` is the only hosted database connection this feature accepts. The existing `DATABASE_URL` belongs to a different feature.

## Feature map

| Feature | Reach it | Verify |
| --- | --- | --- |
| Search | Open `/inspiration`, unlock the reader gate, enter a query and submit Search | `react query caching` leads with TkDodo's blog; `RAG retrieval` returns RAG resources |
| Exact lookup and typos | Same form, or `pnpm inspiration explain "spriteshet"` | Spritesheet pointer translate ranks first; an exact title, URL or citation remains directly accessible |
| Exclusions | Search `animated icons without React for Vue` | lucide-motion-vue appears; React-only Animate Icons does not |
| Design intent | Search `less vibe coded` or `like linear` | Design references appear; database customers and linear gradients do not establish a design match |
| Owner session | Expand Owner sign in and enter the owner password | Owner preferences enabled and the context field appear |
| Preferences | Expand Sources and preference on a result; choose Prefer, a rating and Save preference | Reload and verify the saved value; changing it to Avoid removes broad matches, while an exact lookup remains available |
| Context | Enter a context before submitting Search | A scoped preference overrides the global value only in that context |
| Source evidence | Expand Sources, or use `pnpm inspiration inspect <id-or-url>` | Every excerpt retains its source URL, heading, fetch date and snapshot hash; catalog-only results say so |
| MCP | Start `mcp/blank-direction/server.mjs` with `BLANK_DIRECTION_URL` set to the local route | `inspiration_search` and the website API return the same ordered IDs for identical mode, limit, filters and viewer |
| Ingestion | `pnpm inspiration enqueue <id>`, then `pnpm inspiration ingest --limit 1` | Inspect passages and `pnpm inspiration jobs`; a failed fetch keeps the previous successful source version |

Use `pnpm inspiration help` for all available CLI commands. Ingestion is an explicit operation and performs network requests. The retrieval checks do not crawl the catalog.

## Owner access and proxies

In local development the owner password falls back to the existing `INSPIRATION_PASSWORD`. Production requires `INSPIRATION_OWNER_PASSWORD` and an `INSPIRATION_SESSION_SECRET` of at least 32 characters. Configure these through the environment; do not put credentials in fixtures, screenshots, exports or documentation.

The same-origin guard uses `INSPIRATION_ORIGIN` when explicitly configured. In local development it also accepts the origin supplied by portless through `PORTLESS_URL`. Otherwise it uses the request URL. It does not trust `X-Forwarded-Host` or `X-Forwarded-Proto`. If a reverse proxy causes a 403 for a legitimate write, configure `INSPIRATION_ORIGIN` to the exact public origin, including any nonstandard port.

`INSPIRATION_MCP_TOKEN` permits owner reads and outcome feedback. Preference writes require a signed browser session and a matching origin. Reader-gate cookies and MCP tokens cannot save owner preferences.

## Checks and limits

```sh
pnpm test:inspiration-search
pnpm exec tsc --noEmit --pretty false
pnpm inspiration explain "RAG retrieval" --mode recommend
```

The focused suite uses real catalog acceptance cases plus isolated persistence, access, source-publication and fallback tests. These cases guide development; they are not a held-out measure of general search accuracy. The older search suites exercise the preserved legacy modules and cannot validate the new database ranker by themselves.

Local retrieval supports lexical search, bounded spelling correction, known intent rewrites and explicit constraints. It does not infer arbitrary semantic relationships. Upstash remains optional and requires separate configuration and evaluation. Missing source passages mean a result has only its catalog description as evidence.

Anonymous requests can fall back to catalog search during a database outage. Owner requests fail with 503 so an outage cannot silently ignore Avoid preferences. On a stale preference revision, reload before saving again.
