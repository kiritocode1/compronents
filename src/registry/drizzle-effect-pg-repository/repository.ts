/**
 * Effect v4 repository over drizzle-orm@1.0.0-rc.4.
 *
 * rc.1 shipped first-party Effect v4 support at `drizzle-orm/effect-postgres`.
 * The mechanic that changes how you structure code: an Effect query builder
 * `extends Effect.Effect<Result, EffectDrizzleQueryError, PgClient>`. There is
 * no `Effect.tryPromise` wrapper, no `.execute()` to remember. A `db.select()`
 * chain is already a value you can `yield*`, retry, race, or trace.
 *
 * The architecture decision here is where that error channel stops. The
 * repository is the seam: every method takes `EffectDrizzleQueryError` off the
 * error type and puts a domain error on it, so nothing above this file has to
 * know Postgres exists, and `PgClient` stays a requirement that the composed
 * layer satisfies exactly once.
 */

import { PgClient } from "@effect/sql-pg";
import { and, eq } from "drizzle-orm";
import * as PgDrizzle from "drizzle-orm/effect-postgres";
import { Context, Effect, Layer, Redacted, Schema } from "effect";
import { packages, publishers, relations } from "./schema";

export class PackageNotFound extends Schema.TaggedErrorClass<PackageNotFound>()(
  "PackageNotFound",
  { handle: Schema.String, slug: Schema.String },
) {}

export class RegistryUnavailable extends Schema.TaggedErrorClass<RegistryUnavailable>()(
  "RegistryUnavailable",
  { operation: Schema.Literals(["read", "write"]), cause: Schema.Defect() },
) {}

export interface PackageSummary {
  readonly slug: string;
  readonly summary: string;
  readonly publisherHandle: string;
}

export interface PackageRepositoryShape {
  readonly bySlug: (
    handle: string,
    slug: string,
  ) => Effect.Effect<PackageSummary, PackageNotFound | RegistryUnavailable>;
  readonly archive: (id: string) => Effect.Effect<void, RegistryUnavailable>;
}

export class PackageRepository extends Context.Service<
  PackageRepository,
  PackageRepositoryShape
>()("@blank/PackageRepository") {}

/**
 * `makeWithDefaults` builds the database and provides the no-op
 * `EffectLogger` / `EffectCache` services in one step, leaving only `PgClient`
 * in the requirement channel. Use `PgDrizzle.make` instead when you want to
 * supply a real logger or cache layer.
 */
export const PackageRepositoryLive = Layer.effect(PackageRepository)(
  Effect.gen(function* () {
    const db = yield* PgDrizzle.makeWithDefaults({ relations });

    const bySlug = Effect.fn("PackageRepository.bySlug")(function* (
      handle: string,
      slug: string,
    ) {
      // No `.execute()`, no `await`: the builder is the Effect. Its error
      // channel is EffectDrizzleQueryError, which the catch below removes.
      const rows = yield* db
        .select({
          slug: packages.slug,
          summary: packages.summary,
          publisherHandle: publishers.handle,
        })
        .from(packages)
        .innerJoin(publishers, eq(publishers.id, packages.publisherId))
        .where(and(eq(publishers.handle, handle), eq(packages.slug, slug)))
        .limit(1)
        .pipe(
          Effect.catchTag(
            "EffectDrizzleQueryError",
            (cause) => new RegistryUnavailable({ operation: "read", cause }),
          ),
        );

      const row = rows[0];
      if (row === undefined) {
        return yield* new PackageNotFound({ handle, slug });
      }
      return row;
    });

    const archive = Effect.fn("PackageRepository.archive")(function* (
      id: string,
    ) {
      yield* db
        .update(packages)
        .set({ archivedAt: new Date() })
        .where(eq(packages.id, id))
        .pipe(
          Effect.catchTag(
            "EffectDrizzleQueryError",
            (cause) => new RegistryUnavailable({ operation: "write", cause }),
          ),
        );
    });

    return { bySlug, archive } satisfies PackageRepositoryShape;
  }),
);

/**
 * `PgClient.layer` is the only piece that touches connection strings, so the
 * repository is testable by swapping this one layer for a pglite or container
 * backed client. Everything above depends on PackageRepository, not on Postgres.
 */
export const PostgresLive = PgClient.layer({
  url: Redacted.make(process.env.DATABASE_URL!),
});

export const RegistryLive = Layer.provide(PackageRepositoryLive, PostgresLive);
