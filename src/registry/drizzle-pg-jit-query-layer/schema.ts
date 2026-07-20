/**
 * BLANK registry publishing schema.
 *
 * Pinned to drizzle-orm@1.0.0-rc.4.
 *
 * The casing decision lives on the table builder, not on the `drizzle()` call.
 * Before rc.1 you wrote `drizzle({ casing: "snake_case" })` AND repeated it in
 * drizzle-kit config; the two drifted and produced migrations that did not match
 * runtime SQL. rc.1 removed `casing` from DrizzleConfig entirely and moved it to
 * `snakeCase.table` / `camelCase.table`, so a table declares its own naming and
 * drizzle-kit reads the same source of truth.
 */

import { sql } from "drizzle-orm";
import * as d from "drizzle-orm/pg-core";

export const releaseChannel = d.pgEnum("release_channel", [
  "stable",
  "canary",
  "yanked",
]);

/**
 * `snakeCase.table` maps every camelCase TS key to snake_case in SQL.
 * `displayName` below becomes `display_name`; no `.name()` call per column.
 */
export const publishers = d.snakeCase.table(
  "publishers",
  {
    id: d.uuid().primaryKey().defaultRandom(),
    handle: d.text().notNull().unique(),
    displayName: d.text().notNull(),
    // `generatedAlwaysAsIdentity` columns and this default are both filtered out
    // of runtime inserts by rc.4; you never pass them to `.values()`.
    createdAt: d.timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [d.index("publishers_handle_idx").on(t.handle)],
);

export const packages = d.snakeCase.table(
  "packages",
  {
    id: d.uuid().primaryKey().defaultRandom(),
    publisherId: d
      .uuid()
      .notNull()
      .references(() => publishers.id, { onDelete: "cascade" }),
    slug: d.text().notNull(),
    summary: d.text().notNull(),
    // Stored as a real jsonb column; rc.1 codecs stop the double-stringify that
    // used to happen on bun-sql and neon-http.
    keywords: d.jsonb().$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    archivedAt: d.timestamp({ withTimezone: true }),
  },
  (t) => [
    d.uniqueIndex("packages_publisher_slug_idx").on(t.publisherId, t.slug),
  ],
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
    channel: releaseChannel().notNull().default("stable"),
    installCount: d.integer().notNull().default(0),
    publishedAt: d.timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    d.uniqueIndex("releases_package_version_idx").on(t.packageId, t.version),
    d.index("releases_published_at_idx").on(t.publishedAt.desc()),
  ],
);

export type Publisher = typeof publishers.$inferSelect;
export type NewRelease = typeof releases.$inferInsert;
