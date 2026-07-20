import { PrismaClient } from "../generated/prisma/client";
import { type AuditActor, createSoftDeleteAudit } from "./soft-delete-audit";

/**
 * Per-request construction of the extended client, and the three things that
 * bite everyone migrating off `$use()`.
 *
 * Verified against prisma 7.8.0. `$use` was deleted in 7.0.0 (2025-11-19).
 *
 * The base client is a module singleton because it owns the connection pool.
 * The EXTENDED client is not, and must not be: `$extends` returns a NEW client
 * rather than mutating the receiver, and the extension closes over the actor.
 * Hoisting `basePrisma.$extends(createSoftDeleteAudit({ actor, ... }))` to
 * module scope freezes whichever actor happened to be in scope at import time
 * and attributes every subsequent write in the process to them. Under a
 * middleware this mistake was harder to make, because `$use` mutated one client
 * and the actor had to come from somewhere per call anyway.
 *
 * Building the extended client per request is cheap: no new connection, no new
 * pool, just a proxy over the same base client. Pool exhaustion comes from
 * constructing `new PrismaClient()` per request, which is a different mistake.
 */

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Reused across hot reloads in dev, where module re-evaluation would otherwise
// open a fresh pool on every save until the database refuses connections.
export const basePrisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = basePrisma;

const SOFT_DELETE_MODELS = ["User", "Project", "Document", "Comment"] as const;

export function prismaFor(actor: AuditActor) {
  return basePrisma.$extends(
    createSoftDeleteAudit({
      actor,
      // The unextended client writes the audit rows, so the audit insert cannot
      // re-enter the extension and recurse.
      audit: basePrisma as unknown as Parameters<
        typeof createSoftDeleteAudit
      >[0]["audit"],
      softDeleteModels: SOFT_DELETE_MODELS,
    }),
  );
}

export type RequestPrisma = ReturnType<typeof prismaFor>;

/**
 * CAVEAT 1: query extensions do NOT fire for nested reads and writes.
 *
 * The docs state it flatly: "The `query` extension type does not support nested
 * read and write operations." A nested write is a single top-level operation as
 * far as the extension is concerned, so only the outer one is intercepted.
 *
 *   await db.project.create({
 *     data: {
 *       name: "Migration",
 *       documents: { create: [{ title: "Plan" }] },   // INVISIBLE
 *     },
 *   });
 *
 * The extension sees `Project.create` once. The `Document` rows are created
 * without an audit entry. The same hole runs the other way on reads: an
 * `include` of a soft-delete model is NOT filtered, so
 * `project.findMany({ include: { documents: true } })` returns soft deleted
 * documents nested inside correctly filtered projects. This is the single most
 * common surprise when replacing `$use`, and it is not a bug you can patch from
 * inside the extension.
 *
 * Two fixes, in order of how much they actually hold:
 *
 *   a) Database triggers. An AFTER INSERT/UPDATE/DELETE trigger on each audited
 *      table writes the audit row inside the same transaction as the write, so
 *      it cannot be bypassed by a nested write, by raw SQL, by
 *      `$executeRaw`, or by a second service on the same database. This is the
 *      only option that is actually complete. The actor has to reach the
 *      trigger, which means setting a transaction-local variable
 *      (`SELECT set_config('app.actor_id', $1, true)`) as the first statement of
 *      an interactive transaction and reading it in the trigger function.
 *
 *   b) A repository seam. Forbid nested writes in application code and give
 *      every multi-table write an explicit function that performs each write as
 *      its own top-level operation inside `$transaction`. Cheaper than triggers
 *      and type-checkable, but it is a convention: it holds exactly as long as
 *      nobody reaches for `db` directly. Pair it with a lint rule banning
 *      nested `create`/`update` keys if the team is larger than a few people.
 *
 * For soft delete filtering specifically, there is a third option worth knowing:
 * a database VIEW that already excludes `deletedAt IS NOT NULL`, mapped with
 * `@@map`. Nested reads through it are filtered because the filtering is not in
 * the client at all.
 *
 * CAVEAT 2: client-level methods are not guaranteed on an extended client.
 *
 * "Client-level methods do not necessarily exist on extended clients. For these
 * clients you will need to first check for existence before using." That covers
 * `$connect`, `$disconnect`, `$on`, and `$use` in versions that still had it.
 * `$extends` returns a structurally different type, so code that reached for
 * `prisma.$connect()` before the migration has to guard:
 */
export async function warmUp(db: RequestPrisma) {
  if ("$connect" in db && typeof db.$connect === "function") {
    await db.$connect();
  }
}

/**
 * In practice, call `$connect` on the base client at startup instead. The
 * extended client is a per-request proxy and its lifecycle is not where
 * connection management belongs.
 *
 * CAVEAT 3: chaining is last-wins, and the rewritten delete is audited as an update.
 *
 * `prisma.$extends(a).$extends(b)` resolves conflicts in favour of the LAST
 * extension declared, so `b` overrides any component `a` defined at the same
 * key. Query extensions still run first-in-first-out around the operation, like
 * nested middleware, but a `model.$allModels.delete` in `b` simply replaces the
 * one in `a`. Put a soft-delete extension last if anything else in the chain
 * also touches `delete`, and never register two extensions that both rewrite it.
 *
 * A consequence inside this snippet: because `delete` is answered by calling
 * `update`, the audit row records `operation: "update"`, not `"delete"`. If the
 * distinction matters for compliance review, filter on
 * `data.deletedAt !== undefined` at the audit sink, or move to the trigger in
 * caveat 1(a), where the real DML is what gets recorded.
 *
 * Usage in a request handler:
 *
 * ```ts
 * const db = prismaFor({ id: session.userId, type: "user", requestId, ip });
 * await db.document.delete({ where: { id } });  // becomes an update, audited
 * await db.document.findMany();                 // soft deleted rows excluded
 * ```
 */
