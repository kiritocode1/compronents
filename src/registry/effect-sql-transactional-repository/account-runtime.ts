/**
 * Wiring the ledger repository to a driver, and a transfer that handles the
 * repository's typed errors.
 *
 * The repository in account-repository.ts depends on SqlClient and never
 * constructs it. This file closes that gap two ways. It builds the repository's
 * own layer from its make effect, and it names where the SqlClient itself comes
 * from: a driver layer. The driver is the only part that is Postgres-specific, or
 * SQLite-specific, or a test double, and it is a separate install
 * (@effect/sql-pg, @effect/sql-sqlite-node, and so on) provided at the edge. The
 * repository code does not change when the driver does, which is the payoff of
 * depending on the SqlClient service rather than importing a concrete client.
 *
 * The SqlClient layer is intentionally not imported here, because the concrete
 * driver package is not a dependency of this component. In a real project the
 * composition is:
 *
 *   import { PgClient } from "@effect/sql-pg"
 *
 *   const DriverLive = PgClient.layer({ url: Redacted.make(process.env.DATABASE_URL!) })
 *   const RepositoryLive = AccountRepositoryLayer.pipe(Layer.provide(DriverLive))
 *
 * where AccountRepositoryLayer is the layer this file builds. Everything below
 * typechecks against the SqlClient service; only the driver line is swapped per
 * database.
 *
 * Every API is from effect@4.0.0-beta.98.
 */

import { Effect, Layer } from "effect";
import { AccountRepository } from "./account-repository.ts";

/**
 * The repository as a layer, built from the make effect the service declares.
 * Its remaining requirement is SqlClient, satisfied by a driver layer provided at
 * the edge (see the header). Layer.effect is curried: the tag first, then the
 * effect that produces the service.
 */
export const AccountRepositoryLayer = Layer.effect(AccountRepository)(
  AccountRepository.make,
);

/**
 * A transfer with its full error surface handled. The repository's transfer can
 * fail three declared ways plus a SqlError, and each is a typed value in the
 * error channel, matched by tag, not a thrown exception guessed at with a
 * try/catch. InsufficientFunds and AccountNotFound are the business outcomes a
 * caller acts on; a SqlError is infrastructure and is surfaced rather than
 * swallowed. Anything not in this list is a defect and is meant to page someone.
 *
 * The whole transfer either committed or rolled back before this Effect resolves,
 * because atomicity lives inside the repository's withTransaction, not here.
 */
export const runTransfer = (
  transferId: string,
  fromId: string,
  toId: string,
  amountMinor: number,
) =>
  Effect.gen(function* () {
    const repo = yield* AccountRepository;
    return yield* repo.transfer(transferId, fromId, toId, amountMinor).pipe(
      Effect.map((result) => ({ status: "committed" as const, ...result })),
      Effect.catchTags({
        InsufficientFunds: (error) =>
          Effect.succeed({
            status: "declined" as const,
            reason: "insufficient_funds" as const,
            balanceMinor: error.balanceMinor,
          }),
        AccountNotFound: (error) =>
          Effect.succeed({
            status: "declined" as const,
            reason: "account_not_found" as const,
            accountId: error.accountId,
          }),
      }),
    );
  });
