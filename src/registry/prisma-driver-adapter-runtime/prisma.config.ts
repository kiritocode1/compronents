/**
 * Root Prisma config for Prisma ORM 7.x (verified against prisma@7.8.0 and
 * @prisma/config@7.8.0).
 *
 * v7.0.0 (2025-11-19) made this file the single place the CLI reads. It
 * replaces the `--schema` and `--url` flags and, importantly, replaces the
 * automatic `.env` loading that v6 did for you. Nothing here loads a dotenv
 * file on its own: the `import "dotenv/config"` line below is the load-bearing
 * part, and dropping it is why `env("DATABASE_URL")` comes back empty on a
 * machine where the variable is only in `.env`. In CI, where the variable is
 * already in the real environment, that import is a no-op.
 *
 * `prisma/config` re-exports `defineConfig` and `env` from `@prisma/config`.
 * `env()` is not a lazy reference: it reads `process.env` at module evaluation
 * time and returns a `string`, so it throws at config load if the variable is
 * missing rather than failing later inside a migration.
 *
 * The datasource block is only consulted by CLI commands that talk to a
 * database (`migrate`, `db push`, `db pull`, `studio`). The runtime client does
 * not read this file at all; it gets its connection from the driver adapter in
 * `client.ts`. Those are two separate connection paths, which is why the URL
 * appears in both places.
 *
 * `directUrl` is gone in v7. The v6 pattern of `url` (pooled, through pgbouncer
 * or similar) plus `directUrl` (unpooled, for migrations) collapses into this
 * one `url`, and it should be the direct connection: migrations issue DDL and
 * advisory locks that a transaction-mode pooler will break. The pooled URL now
 * belongs only to the runtime adapter.
 */
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },

  datasource: {
    // Direct, unpooled connection. See the note on directUrl above.
    url: env("DATABASE_MIGRATION_URL"),

    // Only set this if the migration user cannot create databases, which is
    // the usual case on managed Postgres. Prisma needs a scratch database to
    // diff against; without this it tries to create and drop one itself.
    shadowDatabaseUrl: env("DATABASE_SHADOW_URL"),
  },
});

/**
 * The matching generator block in prisma/schema.prisma. Both changes are
 * required in v7:
 *
 * ```prisma
 * generator client {
 *   provider = "prisma-client"
 *   output   = "../src/generated/prisma"
 * }
 * ```
 *
 * `prisma-client-js` (the Rust-engine generator) is replaced by `prisma-client`,
 * the TypeScript client that became the default in v7. `output` is now
 * mandatory: there is no implicit write into node_modules/.prisma, so the
 * generated client is a real directory in your source tree and every import
 * moves from `@prisma/client` to that path. Add it to .gitignore and generate
 * in CI, or commit it; either works, but decide once.
 */
