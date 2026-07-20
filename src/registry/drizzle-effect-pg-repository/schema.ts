/**
 * Schema and Relational Queries v2 graph for the Effect repository.
 *
 * Pinned to drizzle-orm@1.0.0-rc.4.
 *
 * `snakeCase.table` replaces the old `drizzle({ casing: "snake_case" })` option,
 * which rc.1 deleted from DrizzleConfig. Naming now lives with the table, so the
 * ORM and drizzle-kit read one source of truth instead of two settings that
 * drifted.
 */
import { defineRelations } from "drizzle-orm";
import * as d from "drizzle-orm/pg-core";

export const publishers = d.snakeCase.table("publishers", {
  id: d.uuid().primaryKey().defaultRandom(),
  handle: d.text().notNull().unique(),
  displayName: d.text().notNull(),
  createdAt: d.timestamp({ withTimezone: true }).notNull().defaultNow(),
});

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
    archivedAt: d.timestamp({ withTimezone: true }),
  },
  (t) => [
    d.uniqueIndex("packages_publisher_slug_idx").on(t.publisherId, t.slug),
  ],
);

export const schema = { publishers, packages };

/**
 * `defineRelations` is the RQBv2 graph, declared once over the whole schema
 * object rather than a `relations()` call per table. `optional: false` on a
 * relation backed by a NOT NULL foreign key narrows the result type, so
 * `pkg.publisher` is a Publisher and not `Publisher | null`.
 */
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
      optional: false,
    }),
  },
}));
