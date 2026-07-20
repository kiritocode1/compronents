/**
 * Relational Queries v2 wiring for drizzle-orm@1.0.0-rc.4.
 *
 * `defineRelations` is a standalone graph over the schema object, not a
 * `relations()` call bolted onto each table. Foreign keys are declared once here
 * with explicit `from` / `to`, which is what lets rc.4's array-mode RQBv2 build a
 * single flat query instead of a lateral join per level.
 */
import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  publishers: {
    packages: r.many.packages({
      from: r.publishers.id,
      to: r.packages.publisherId,
    }),
  },
  packages: {
    publisher: r.one.publishers({
      from: r.packages.publisherId,
      to: r.publishers.id,
      // `optional: false` narrows the result type: `pkg.publisher` is
      // `Publisher`, not `Publisher | null`. Only correct because publisherId
      // is NOT NULL with an FK.
      optional: false,
    }),
    releases: r.many.releases({
      from: r.packages.id,
      to: r.releases.packageId,
    }),
    // A filtered relation: the same FK, pre-narrowed to one channel. Declaring
    // it here keeps the `where` out of every call site.
    stableReleases: r.many.releases({
      from: r.packages.id,
      to: r.releases.packageId,
      where: { channel: "stable" },
      alias: "stable_releases",
    }),
  },
  releases: {
    package: r.one.packages({
      from: r.releases.packageId,
      to: r.packages.id,
      optional: false,
    }),
  },
}));

export type Relations = typeof relations;
