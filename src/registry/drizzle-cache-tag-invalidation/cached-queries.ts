/**
 * Cached reads and tag-scoped invalidation for drizzle-orm@1.0.0-rc.4.
 *
 * `.$withCache(config?: { config?: CacheConfig; tag?: string; autoInvalidate?:
 * boolean } | false)` takes three independent decisions, and they are usually
 * confused with each other:
 *
 *   config          the TTL. Replaces the instance default, does not merge.
 *   tag             the cache key. Without it, the key is a hash of the SQL
 *                   text plus its bound parameters, which no other code can
 *                   name. With it, you chose a key, so `db.$cache.invalidate`
 *                   can target this exact read.
 *   autoInvalidate  defaults to true. When true the entry is indexed under the
 *                   tables the select touched, and any insert, update or delete
 *                   on one of them drops it. When false the entry is stored
 *                   under no tables at all, so nothing but its TTL or an
 *                   explicit invalidation will ever remove it.
 *
 * A tag is not a substitute for auto-invalidation and auto-invalidation is not a
 * substitute for a tag. Auto-invalidation is table-granular and fires on writes
 * Drizzle can see. A tag is how you reach one entry from a write Drizzle cannot
 * see, which, per the eligibility section at the bottom of this file, is a
 * larger category than it first appears.
 */
import { and, desc, eq, sql } from "drizzle-orm";
import { db, packages, packageTrends, releases } from "./cache";

/**
 * The catalogue page. Read constantly, written rarely, and correct to serve a
 * minute stale.
 *
 * No tag, so the key is the query hash. That is the right default: this read has
 * no write that needs to name it, and auto-invalidation on `packages` already
 * covers every mutation the ORM issues against the table.
 */
export function packageCatalogue() {
  return db
    .select({
      id: packages.id,
      slug: packages.slug,
      summary: packages.summary,
    })
    .from(packages)
    .orderBy(packages.slug)
    .$withCache({ config: { ex: 60 } });
}

/**
 * Per-package release list.
 *
 * This one carries a tag because a write elsewhere needs to reach it by name:
 * the install counter below bumps `releases` through raw SQL, which is invisible
 * to auto-invalidation. The tag is derived from the slug so the key space stays
 * one entry per package rather than one per parameter combination.
 *
 * `autoInvalidate` stays at its default of true. The tag and the table index are
 * both live, so an ORM write to `releases` and a manual `invalidate({ tags })`
 * both clear it.
 */
export const releaseListTag = (slug: string) => `releases:${slug}`;

export function releaseList(slug: string) {
  return db
    .select({
      version: releases.version,
      installCount: releases.installCount,
      publishedAt: releases.publishedAt,
    })
    .from(releases)
    .innerJoin(packages, eq(packages.id, releases.packageId))
    .where(eq(packages.slug, slug))
    .orderBy(desc(releases.publishedAt))
    .limit(50)
    .$withCache({ tag: releaseListTag(slug), config: { ex: 300 } });
}

/**
 * A deliberate eventual-consistency choice, and the only place `autoInvalidate:
 * false` belongs.
 *
 * This aggregate is expensive and its exact freshness does not matter. Turning
 * auto-invalidation off means the entry is never indexed under `releases`, so
 * the constant write traffic on that table stops evicting it every few seconds.
 * The 15 minute TTL is now the whole invalidation story, which is the point:
 * accept a bounded staleness window in exchange for a stable hit rate.
 */
export function installTotals() {
  return db
    .select({
      packageId: releases.packageId,
      installs: sql<number>`sum(${releases.installCount})`.mapWith(Number),
    })
    .from(releases)
    .groupBy(releases.packageId)
    .$withCache({ autoInvalidate: false, config: { ex: 900 } });
}

/**
 * A write that needs no invalidation code.
 *
 * Drizzle classifies every statement it builds. An insert, update or delete that
 * carries table metadata dispatches to `Cache.onMutate` with the tables it
 * touched, before the caller ever sees the result. `packageCatalogue` and
 * `releaseList` both index `packages`, so both are dropped by this one call and
 * neither is named here.
 */
export function publishRelease(packageId: string, version: string) {
  return db.insert(releases).values({ packageId, version });
}

/**
 * A write that needs invalidation code, because Drizzle cannot see it.
 *
 * `db.execute` produces no query metadata, so the cache extension skips the
 * statement entirely: it is neither cached nor treated as a mutation. Nothing
 * fires. The counter moves in Postgres and every cached read of `releases` keeps
 * serving the old number until its TTL expires.
 *
 * This is why `releaseList` has a tag. The invalidation is manual, it names the
 * exact entry, and it runs after the statement rather than beside it.
 */
export async function recordInstall(slug: string, version: string) {
  await db.execute(sql`
    update ${releases}
       set ${releases.installCount} = ${releases.installCount} + 1
      from ${packages}
     where ${packages.id} = ${releases.packageId}
       and ${packages.slug} = ${slug}
       and ${releases.version} = ${version}
  `);

  // `invalidate` accepts `{ tags }`, `{ tables }`, or both. Tables may be table
  // objects or bare names. This clears the one tagged entry and leaves the
  // untagged catalogue read alone, because the catalogue does not depend on
  // install counts.
  await db.$cache.invalidate({ tags: releaseListTag(slug) });
}

/**
 * Bulk maintenance. Same failure mode as `recordInstall`, wider blast radius, so
 * invalidate by table instead of enumerating tags that may not all be known.
 */
export async function reindexInstallCounts() {
  await db.execute(sql`select reindex_install_counts()`);
  await db.$cache.invalidate({ tables: [packages, releases] });
}

/* ------------------------------------------------------------------------- *
 * What cannot be cached, and what to do instead
 *
 * The cache extension does not apply to raw SQL, transactions, relational
 * queries, views, or the AWS Data API. That list is not a footnote; it decides
 * where the cache seam can physically sit, so it is worth being precise about
 * how each exclusion fails, because they do not fail the same way.
 *
 * 1. RAW SQL: fails open in both directions.
 *    A `db.execute` statement produces no metadata, so it is never served from
 *    the cache and never invalidates anything. The read side is harmless. The
 *    write side is the dangerous half and is the reason `recordInstall` above
 *    exists in this file at all: a raw write leaves stale entries behind
 *    silently, with no type error and no runtime warning. Every raw mutating
 *    statement in a cached codebase needs a paired `db.$cache.invalidate` call,
 *    and the pairing has to be enforced by review because nothing else enforces
 *    it. Keep raw writes rare and keep them in named functions like this one, so
 *    there is a single place the invalidation can live.
 *
 * 2. RELATIONAL QUERIES: fails closed, and it decides your query style.
 *    `.$withCache` is a method on the select builder. `db.query.packages
 *    .findMany()` does not have it, so a relational read simply cannot be
 *    cached, and there is no flag that changes this. This is the real
 *    architectural consequence of adopting the cache: any read hot enough to
 *    want caching has to be written as an explicit `db.select()` with joins,
 *    which is why `releaseList` above is a join and not a `with: { releases: ...
 *    }`. Decide per read, not per codebase. A nested tree read that is cheap
 *    stays relational and stays readable; a hot flat read becomes a select and
 *    gains a cache. Rewriting the whole layer into selects to make it uniformly
 *    cacheable trades a large amount of clarity for hits you did not measure.
 *
 * 3. VIEWS: fails silently, and this is the sharp edge.
 *    `db.select().from(packageTrends).$withCache(...)` compiles. It is a select
 *    builder, so the method exists and the response really is cached. What does
 *    not happen is invalidation: the used-table extraction recognises tables,
 *    subqueries and SQL fragments, and returns an empty list for a view. The
 *    entry is therefore indexed under no tables, exactly as if you had passed
 *    `autoInvalidate: false`, and no write to the underlying tables will ever
 *    drop it. If you cache a view read, you have opted into TTL-only
 *    invalidation whether you meant to or not. Either say so explicitly, or
 *    select from the base tables and let auto-invalidation work.
 *
 * 4. TRANSACTIONS: treat writes inside `db.transaction()` as uninvalidated.
 *    The documented exclusion list names transactions, so do not rely on a
 *    mutation inside a transaction callback reaching the cache provider. Invert
 *    the control: collect the affected tags in the callback and invalidate once
 *    after the transaction resolves, as `settleRelease` does below. That
 *    ordering is better regardless, because invalidating inside the callback
 *    would evict on work that a later rollback discards, and repopulate the
 *    cache from a transaction that never committed.
 *
 * 5. AWS DATA API: the cache is unavailable on that driver. If a deployment
 *    target uses it, the caching layer has to sit above Drizzle for that
 *    environment, not inside it.
 * ------------------------------------------------------------------------- */

/**
 * The transaction shape the note above prescribes: mutate inside, invalidate
 * after the commit, once.
 */
export async function settleRelease(
  packageId: string,
  slug: string,
  version: string,
) {
  await db.transaction(async (tx) => {
    await tx
      .update(releases)
      .set({ publishedAt: new Date() })
      .where(
        and(eq(releases.packageId, packageId), eq(releases.version, version)),
      );
  });

  await db.$cache.invalidate({
    tags: releaseListTag(slug),
    tables: [releases],
  });
}

/**
 * Kept as the counter-example named in point 3. It is not cached, on purpose.
 * Adding `.$withCache()` here would type-check, would cache, and would go stale
 * forever.
 */
export function trendingPackages() {
  return db
    .select()
    .from(packageTrends)
    .orderBy(desc(packageTrends.installs))
    .limit(20);
}
