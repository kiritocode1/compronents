/**
 * Typed query layer for drizzle-orm@1.0.0-rc.4.
 *
 * Two rc.1/rc.4 mechanics drive the shape of this file:
 *
 * 1. `jit: true` compiles a row mapper the first time a query is prepared and
 *    reuses it on every execute. Drizzle measured a 25 to 30 percent latency
 *    drop with it on. It only pays off if you hoist `.prepare()` to module
 *    scope, so prepared statements stop being a micro-optimisation and become
 *    the default way to write a hot read.
 * 2. `sql<T>` now preserves nullability through `.mapWith()` and gained an
 *    explicit `.nullable()`, so a computed column no longer needs a hand-written
 *    `T | null` annotation that nothing checks.
 */
import { and, eq, gte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { relations } from "./relations";
import { packages, releases } from "./schema";

export const db = drizzle({
  connection: process.env.DATABASE_URL!,
  relations,
  // Opt-in JIT mappers, added in 1.0.0-rc.1. Off by default because the first
  // prepare pays a compile cost; leave it off for one-shot scripts and
  // migrations, turn it on for a long-lived server process.
  jit: true,
});

/**
 * Hoisted prepared statement. The `sql.placeholder` names are bound per call,
 * the plan and the JIT mapper are built once for the process.
 */
const packageDetailQuery = db.query.packages
  .findFirst({
    where: {
      slug: sql.placeholder("slug"),
      publisher: { handle: sql.placeholder("handle") },
    },
    with: {
      publisher: { columns: { handle: true, displayName: true } },
      // The filtered relation from relations.ts: only stable releases, newest
      // first, no `where` repeated at the call site.
      stableReleases: {
        columns: { version: true, installCount: true, publishedAt: true },
        orderBy: { publishedAt: "desc" },
        limit: 20,
      },
    },
  })
  .prepare("package_detail");

export function packageDetail(handle: string, slug: string) {
  return packageDetailQuery.execute({ handle, slug });
}

/**
 * Aggregate read that leans on the rc.4 `sql` typing rules.
 *
 * `max(...)` over an empty group is genuinely NULL in Postgres. Before rc.4 the
 * `.mapWith(Number)` call silently erased that and the result typed as `number`;
 * now the callback sees the pre-decode type and `.nullable()` states the truth.
 */
const channelRollup = sql<number>`sum(${releases.installCount})`
  .mapWith(Number)
  .nullable();

const lastPublished = sql`max(${releases.publishedAt})`
  .mapWith((value: unknown) => new Date(value as string))
  .nullable();

export function channelStats(packageId: string, since: Date) {
  return db
    .select({
      channel: releases.channel,
      installs: channelRollup,
      lastPublishedAt: lastPublished,
      // `$count` is a builder, not a raw string, so it composes with the
      // codec system instead of returning a driver-shaped string.
      versions: sql<number>`count(${releases.version})`.mapWith(Number),
    })
    .from(releases)
    .where(
      and(eq(releases.packageId, packageId), gte(releases.publishedAt, since)),
    )
    .groupBy(releases.channel);
}

/**
 * rc.4 relaxed `insert().select()`: column order no longer has to match, and
 * columns with a default or a nullable type can be skipped entirely. This
 * backfill omits `id`, `channel`, `installCount` and `publishedAt` and lets the
 * table defaults fill them.
 */
export function forkReleasesInto(targetPackageId: string, sourceSlug: string) {
  return db.insert(releases).select(
    db
      .select({
        version: releases.version,
        // A raw `sql` field inside a subquery selection must be aliased; the
        // builder rejects it at the type level otherwise.
        packageId: sql<string>`${targetPackageId}::uuid`.as("package_id"),
      })
      .from(releases)
      .innerJoin(packages, eq(packages.id, releases.packageId))
      .where(
        and(eq(packages.slug, sourceSlug), eq(releases.channel, "stable")),
      ),
  );
}

export type PackageDetail = Awaited<ReturnType<typeof packageDetail>>;
export type ChannelStats = Awaited<ReturnType<typeof channelStats>>[number];
