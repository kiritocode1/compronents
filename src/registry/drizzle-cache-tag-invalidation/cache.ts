/**
 * Cache-enabled database module for drizzle-orm@1.0.0-rc.4.
 *
 * Drizzle's query cache is an opt-in extension configured through one field:
 * `DrizzleConfig.cache?: Cache`. `upstashCache` from `drizzle-orm/cache/upstash`
 * is the bundled implementation; it is a thin subclass of the abstract `Cache`
 * in `drizzle-orm/cache/core`, and `@upstash/redis` is a peer dependency
 * (`>=1.34.7` in the rc.4 manifest), not a transitive one. Install it yourself.
 *
 * The one decision that matters here is `global`. It selects the return value of
 * `Cache.strategy()`:
 *
 *   global: false (the default) -> strategy() === "explicit"
 *     Nothing is cached until a query calls `.$withCache()`. Every cached read
 *     is visible at its call site.
 *   global: true -> strategy() === "all"
 *     Every eligible select is cached and `.$withCache(false)` is how you opt a
 *     query out. A read that must be fresh now depends on a negation nobody
 *     remembers to write.
 *
 * This module keeps the default. The reason is the eligibility rules documented
 * in cached-queries.ts: a meaningful share of a real query layer is not eligible
 * at all, and under `global: true` those queries look cached, read as cached in
 * review, and silently are not.
 */
import { sql } from "drizzle-orm";
import { upstashCache } from "drizzle-orm/cache/upstash";
import { drizzle } from "drizzle-orm/node-postgres";
import * as d from "drizzle-orm/pg-core";

export const packages = d.snakeCase.table(
  "packages",
  {
    id: d.uuid().primaryKey().defaultRandom(),
    slug: d.text().notNull().unique(),
    summary: d.text().notNull(),
    keywords: d.jsonb().$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  },
  (t) => [d.index("packages_slug_idx").on(t.slug)],
);

export const releases = d.snakeCase.table(
  "releases",
  {
    id: d.uuid().primaryKey().defaultRandom(),
    packageId: d
      .uuid()
      .notNull()
      .references(() => packages.id, { onDelete: "cascade" }),
    version: d.text().notNull(),
    installCount: d.integer().notNull().default(0),
    publishedAt: d.timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    d.uniqueIndex("releases_package_version_idx").on(t.packageId, t.version),
  ],
);

/**
 * A view exists here to be the counter-example, not to be cached. See
 * `trendingPackages` in cached-queries.ts for why selecting from it is the one
 * case where `.$withCache()` type-checks and still does the wrong thing.
 */
export const packageTrends = d.pgView("package_trends").as((qb) =>
  qb
    .select({
      packageId: releases.packageId,
      installs: sql<number>`sum(${releases.installCount})`
        .mapWith(Number)
        .as("installs"),
    })
    .from(releases)
    .groupBy(releases.packageId),
);

export const db = drizzle({
  connection: process.env.DATABASE_URL!,
  cache: upstashCache({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    // `global` is omitted deliberately. It defaults to false, which is the
    // "explicit" strategy: opt in per query, never opt out.

    // Instance-wide default TTL. `CacheConfig` is passed through to the Redis
    // SET options, so the fields are Redis fields: `ex` (seconds), `px`
    // (milliseconds), `exat` / `pxat` (absolute Unix expiry), `keepTtl`, and
    // `hexOptions`. A per-query `.$withCache({ config })` replaces this object
    // rather than merging into it, so any query that overrides the TTL must
    // restate every field it still wants.
    config: { ex: 60 },
  }),
});

/**
 * Custom providers.
 *
 * `Cache` is exported as an abstract class from `drizzle-orm/cache/core` and
 * `upstashCache` has no privileged status; anything that implements the four
 * members can be passed to `cache` instead:
 *
 *   strategy(): "explicit" | "all"
 *   get(key, tables, isTag, isAutoInvalidate?): Promise<any[] | undefined>
 *   put(key, response, tables, isTag, config?): Promise<void>
 *   onMutate({ tags?, tables? }): Promise<void>
 *
 * Two contract details are easy to get wrong when writing one. `tables` in
 * `put` is the invalidation index: a write calls `onMutate` with table names,
 * and your provider is responsible for finding and dropping every key stored
 * under them. And `isTag` distinguishes a key you chose (`.$withCache({ tag })`)
 * from a hash of the SQL and its parameters, which is what a tag-scoped
 * invalidation needs to look up.
 *
 * A provider that ignores `tables` and relies purely on TTL is a legitimate
 * choice, not a broken one. It gives up read-your-writes and buys back the
 * bookkeeping. Make that trade on purpose.
 */
