import { Prisma } from "../generated/prisma/client";

/**
 * Soft delete plus audit trail as a single Prisma Client extension.
 *
 * Requires prisma >= 7.0.0 (7.0.0 shipped 2025-11-19, 7.8.0 is current).
 * v7 removed the client middleware API outright: `prisma.$use(async (params,
 * next) => next(params))` no longer exists, and the upgrade guide's only
 * instruction is "The client middleware API has been removed. If possible, use
 * Client Extensions". So extensions are not a nicer alternative to `$use`, they
 * are the sole interception point left, and everything a middleware used to do
 * has to be re-expressed in the `query` and `model` components below.
 *
 * v7 also moved the generated client out of `node_modules`. The import above
 * assumes the `prisma-client` generator with `output = "../src/generated/prisma"`;
 * change the path to match your `schema.prisma`, because `@prisma/client` no
 * longer resolves to a generated client.
 *
 * Two components, because one cannot do both jobs:
 *
 *   - `query` intercepts an operation but cannot change which operation runs.
 *     The `query(args)` callback it hands you is already bound to the incoming
 *     operation, so `delete` cannot be answered with an `update` from there.
 *     It is used here for read filtering and for recording writes.
 *   - `model` replaces the method itself, so `delete` can call `update` through
 *     `Prisma.getExtensionContext(this)`. The model component sits above the
 *     query pipeline, so the rewritten `update` is expected to pass back through
 *     the `query` component and land in the audit trail.
 *
 *     That last step is inference, not a documented guarantee: the docs show
 *     `getExtensionContext` for custom methods such as `exists`, never for
 *     overriding a built-in and calling a sibling built-in on the context. It is
 *     also the claim the whole soft-delete audit path rests on, since if the
 *     rewritten `update` bypasses `query`, deletes are soft but leave no audit
 *     row. Verify it once against your schema before trusting it: soft delete a
 *     row and assert an audit row exists. If it does not, record the audit row
 *     explicitly inside the `delete` override instead.
 *
 * Construct it per request. See `request-client.ts`.
 */

export type AuditActor = {
  /** Stable id of whoever is making the change. Use a sentinel like "system" for jobs, never null. */
  id: string;
  type: "user" | "service" | "system";
  /** Request correlation id, so an audit row can be joined back to a trace. */
  requestId?: string;
  ip?: string;
};

/**
 * The unextended client used to write audit rows.
 *
 * Deliberately NOT the extended client. Writing the audit row through the
 * extended client would re-enter this same extension and recurse, and the usual
 * fix (skip when `model === "AuditLog"`) is a guard that silently stops working
 * the moment someone renames the model. Taking the base client removes the
 * recursion entirely instead of policing it.
 */
type AuditSink = {
  auditLog: {
    create: (arg: { data: AuditEntry }) => Promise<unknown>;
  };
};

export type AuditEntry = {
  actorId: string;
  actorType: string;
  requestId: string | null;
  ip: string | null;
  model: string;
  operation: string;
  /** Ids touched, when the operation returns them. Empty for `*Many` results, which only return a count. */
  recordIds: string[];
  /** Serialized `where` so a batch operation is still reconstructable. */
  target: string | null;
  at: Date;
};

export type SoftDeleteAuditConfig = {
  actor: AuditActor;
  audit: AuditSink;
  /**
   * Models carrying a nullable `deletedAt DateTime?` column. Only these get the
   * read filter and the delete rewrite. Listing a model without the column turns
   * every read of it into a runtime error on an unknown field, so this is an
   * explicit allowlist rather than an inferred default.
   */
  softDeleteModels: readonly string[];
  /**
   * Operations recorded to the audit trail. Reads are excluded by default: a
   * read-heavy service writing an audit row per `findMany` doubles its write
   * volume to record nothing anyone reviews.
   */
  auditedOperations?: readonly string[];
};

const DEFAULT_AUDITED_OPERATIONS = [
  "create",
  "createMany",
  "createManyAndReturn",
  "update",
  "updateMany",
  "upsert",
  "delete",
  "deleteMany",
] as const;

/** Reads that must not see soft deleted rows. */
const FILTERED_READS = [
  "findUnique",
  "findUniqueOrThrow",
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "count",
  "aggregate",
  "groupBy",
] as const;

type WhereArgs = { where?: Record<string, unknown> } & Record<string, unknown>;

/**
 * Adds `deletedAt: null` without clobbering a caller supplied `deletedAt`.
 *
 * Keeping an explicit `deletedAt` intact is what makes a deliberate
 * `findMany({ where: { deletedAt: { not: null } } })` (a trash view, a restore
 * screen) still work through the extension.
 *
 * On `findUnique` this relies on extendedWhereUnique, which allows non-unique
 * fields alongside the unique selector and has been GA since Prisma 5.0. On
 * Prisma 4 this would be rejected at the type level.
 */
function excludeDeleted(args: WhereArgs): WhereArgs {
  const where = args.where ?? {};
  if ("deletedAt" in where) return args;
  return { ...args, where: { ...where, deletedAt: null } };
}

function idsFrom(result: unknown): string[] {
  if (Array.isArray(result)) {
    return result
      .map((row) => (row as { id?: unknown })?.id)
      .filter((id): id is string => typeof id === "string");
  }
  const id = (result as { id?: unknown })?.id;
  return typeof id === "string" ? [id] : [];
}

export function createSoftDeleteAudit(config: SoftDeleteAuditConfig) {
  const softDeletable = new Set(config.softDeleteModels);
  const audited = new Set<string>(
    config.auditedOperations ?? DEFAULT_AUDITED_OPERATIONS,
  );

  return Prisma.defineExtension({
    name: "soft-delete-audit",

    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (
            softDeletable.has(model) &&
            (FILTERED_READS as readonly string[]).includes(operation)
          ) {
            const result = await query(excludeDeleted(args as WhereArgs));
            return result;
          }

          const result = await query(args);

          if (!audited.has(operation)) return result;

          // Fire and forget on purpose. The audit sink is a separate connection
          // from the one that ran the write, so awaiting it would add its
          // latency to every write while still not making the pair atomic. If
          // the audit row must be atomic with the write, the audit insert
          // belongs in the same interactive transaction, or in a database
          // trigger. See the nested-write note in `request-client.ts`: a trigger
          // is the only option that also catches nested writes.
          void config.audit.auditLog
            .create({
              data: {
                actorId: config.actor.id,
                actorType: config.actor.type,
                requestId: config.actor.requestId ?? null,
                ip: config.actor.ip ?? null,
                model,
                operation,
                recordIds: idsFrom(result),
                target: (args as WhereArgs).where
                  ? JSON.stringify((args as WhereArgs).where)
                  : null,
                at: new Date(),
              },
            })
            .catch(() => {
              // Swallowed so an audit outage cannot fail a write that already
              // committed. Route this to your error reporter; a silent catch
              // here is the difference between a degraded audit trail and a
              // missing one nobody noticed.
            });

          return result;
        },
      },
    },

    model: {
      $allModels: {
        /**
         * `delete` becomes `update ... set deletedAt = now()`.
         *
         * The return shape matches: `delete` and `update` both resolve to the
         * row. `deleteMany` and `updateMany` both resolve to `{ count }`, so
         * callers do not have to change either.
         *
         * The cast is unavoidable at this level of genericity. `$allModels`
         * methods are declared once for every model, so there is no single
         * generated delegate type to name; `Prisma.getExtensionContext(this)`
         * returns the current model's delegate at runtime and `context.$name`
         * carries its name.
         */
        async delete<T>(this: T, args: WhereArgs) {
          const context = Prisma.getExtensionContext(this) as unknown as {
            $name?: string;
            update: (arg: WhereArgs) => Promise<unknown>;
            delete: (arg: WhereArgs) => Promise<unknown>;
          };
          if (!context.$name || !softDeletable.has(context.$name)) {
            return context.delete(args);
          }
          return context.update({ ...args, data: { deletedAt: new Date() } });
        },

        async deleteMany<T>(this: T, args: WhereArgs) {
          const context = Prisma.getExtensionContext(this) as unknown as {
            $name?: string;
            updateMany: (arg: WhereArgs) => Promise<unknown>;
            deleteMany: (arg: WhereArgs) => Promise<unknown>;
          };
          if (!context.$name || !softDeletable.has(context.$name)) {
            return context.deleteMany(args);
          }
          // Re-filter here: without it a second `deleteMany` re-stamps
          // `deletedAt` on rows already deleted, moving their deletion time
          // forward and corrupting any retention window computed from it.
          return context.updateMany({
            ...excludeDeleted(args),
            data: { deletedAt: new Date() },
          });
        },
      },
    },
  });
}
