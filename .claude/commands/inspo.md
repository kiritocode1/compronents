---
description: Save pasted links to the Inspiration database and catalog with verified descriptions
argument-hint: <url> [url...]
allowed-tools: Read, Edit, Bash, WebFetch, WebSearch
---

Save each URL in `$ARGUMENTS` to the Inspiration database and its
source-controlled catalog. If arguments are empty, use the URLs the user
pasted most recently. Claude Code, Codex and Grok share these instructions.

## Fixed destination

Always start here, including when invoked from another project:

```sh
cd /Users/blank/Desktop/CREATE/compronents
git status --short
pnpm inspiration:production health
```

Every relative path and command below belongs to this repo. Read its
`AGENTS.md`. Never edit or commit in the invoking project. Scratch files go in
`/tmp`. Read each file end to end before editing it.

`pnpm inspiration:production` uses the existing Vercel Neon integration for
`blankspacets/compronents`. It loads production variables into the command's
process without writing a local credentials file. It sets `NODE_ENV=production`
so a missing `INSPIRATION_DATABASE_URL` fails instead of falling back to PGlite.
Vercel CLI authentication is required. Never substitute `DATABASE_URL`, which
belongs to mint-me. Never print, copy into instructions, or retain credentials.

Use `pnpm inspiration` only when the user explicitly requests local work. It
loads `.env.local` and uses `.inspiration-local` when no hosted URL is set.
For local work, replace `inspiration:production` in the commands below with
`inspiration`; report that the deployed site has not been updated.

Report the destination returned by health, `neon` or `local`. A local write
does not update the deployed site. When the user expects a live addition and
only local storage is available, finish source curation but report the hosted
write as pending. Do not call the addition delivered.

A lock error means another process owns PGlite. Do not remove a live lock,
kill another server, or switch to a test database to claim the save worked.
An unreachable database is an incomplete write. Missing tables in an intended,
dedicated hosted database can be initialized with `pnpm inspiration:production migrate`.

## Curate each link

1. Dedupe both the source catalog and database. Use `rg -n -F` for the exact URL
   and bare domain in `src/lib/inspiration.ts`, then run
   `pnpm inspiration:production inspect '<canonical-url>'` for the matching entry.
   `canonicalUrl` in `src/lib/inspiration/catalog.ts` strips fragments and
   tracking parameters while preserving path case, meaningful queries and
   trailing slashes. Do not invent a different URL normalization.
   If the catalog has the link but the database does not, import and verify it.
   If only the database has it, inspect its existing description and identity
   before restoring a catalog entry. Do not overwrite curated facts blindly.
   Report "already present" only after confirming both records.

2. Read the actual source. Fetch it, then search once for missing facts if the
   response is thin or needs JavaScript. Follow the repo's browser workflow
   when a rendered page is necessary. Documentation lookups for a named
   library or service must follow the repo's Context7 rule first. Never write
   from the URL or training memory alone.

3. Write two to four factual sentences. Say what it is and what someone would
   use it for, then include useful specifics found at the source. Check author
   attribution against the domain. Drop unsupported claims. Preserve the
   source's name, use real copy, and avoid marketing language and em dashes.

4. Choose an existing group using `GROUP_USAGE` and the group titles in
   `src/lib/inspiration.ts`. Preserve the taxonomy. Ask before creating a group.

5. Set source-backed facets. The database retains explicit fields separately
   from inferred metadata. Do not copy inferred technology tags into explicit
   fields without evidence.

   - Set lowercase `useFor` on every new entry. Prefer five to eight short,
     literal phrases for distinct supported intents. Do not invent capabilities
     or add words solely to force a query match. Scoring weights can change;
     verify the current database retrieval instead of relying on old numbers.
   - Set `stack` for technologies the resource supports. A passing mention or
     customer logo is not proof of a dependency or integration.
   - Set `kind` when needed to select the correct agent action. In
     `resolveEngagement`, the first matching kind wins in this order: skill,
     video, course, asset, demo, portfolio, gallery, essay, library, tool.
     An essay means read it, a library means search its catalog, a tool means
     run or evaluate it. Inspect the resolved action after importing.
   - Keep `style` for resources selected by appearance. Preserve existing
     category defaults; leave it unset for infrastructure and reference material.

6. Insert at the top of the group's `links` array. Browse and outage fallback
   still read this file, so a database write alone is not sufficient today.

   ```ts
   {
     title: "Name",
     href: "https://example.com/",
     dateAdded: "YYYY-MM-DD",
     kind: "library",
     stack: ["react"],
     useFor: ["supported use case", "another supported intent"],
     description: "A factual description based on the inspected source.",
   },
   ```

   Use today's date, the project's own name, and the supplied URL with only
   tracking parameters removed. Omit facet overrides that are unnecessary.

## Import and verify

Review the source diff before importing. The current import reads the entire
catalog. Do not import another agent's unfinished catalog edits or revert them;
resolve that conflict first and report any blocked write.

```sh
pnpm exec biome check --write src/lib/inspiration.ts
pnpm inspiration:production import --dry-run
pnpm inspiration:production import
pnpm inspiration:production health
pnpm inspiration:production inspect '<canonical-url>'
```

The dry run counts catalog records and writes nothing. It does not prove that
credentials, schema, or the write work. The actual import upserts catalog data
and preserves stored preferences and source passages. Confirm the resource ID,
metadata and `engagement` action from the database inspection output.

Run representative retrieval checks against the same database:

```sh
pnpm inspiration:production explain 'Exact title' --mode search --limit 5
pnpm inspiration:production explain 'supported intent' --mode recommend --limit 3
pnpm inspiration:production explain 'a natural-language request' --mode search --limit 5
pnpm inspiration:production explain 'adjacent unsupported intent' --mode recommend --limit 3
pnpm test:inspiration-search
```

Exact lookup should return the saved resource first. Check at least two
supported intents and two adjacent negative queries. Report actual ranks and
misses. Correct inaccurate metadata, but do not pad factual descriptions to
satisfy the ranker. The old synchronous `recommendInspiration` and
`discoverInspiration` functions cannot prove this database workflow worked.

Queue source extraction after a successful import:

```sh
pnpm inspiration:production enqueue <res_id>
pnpm inspiration:production jobs
```

Queued extraction is not fetched source evidence. Run
`pnpm inspiration:production ingest --limit 1` when ingestion is part of the request, then
inspect the passages and job result. A failed fetch must remain visible and
must not erase the last successful source version.

For a hosted write, also query the deployed `/inspiration/search` endpoint with
`q=<exact-title>&format=json&limit=5`. Confirm the same ID and
`provider: "postgres"` or `"hybrid"`. A `"catalog"` response does not prove a
hosted database write. Git push is separate from database import and cannot
substitute for it.

Commit or push only when the user requests it. Stage only this task's edits.
Report one line per link with its name, group, resource ID, destination,
database write result, retrieval results, and extraction state. Call out any
pending hosted write or failed retrieval instead of saying it is done.
