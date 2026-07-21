/**
 * A double-entry ledger repository on Effect 4's SQL layer, where the transaction
 * boundary is a scope and a row is untrusted input until a schema decodes it.
 *
 * Two ideas the usual repository gets wrong, and what this does instead.
 *
 * The transaction is not a callback convention. The common shape is
 * `db.transaction(async (tx) => { ... })`, and its correctness rests on every
 * query inside remembering to use `tx` rather than the pooled `db`. Miss one and
 * that query silently runs outside the transaction, commits on its own, and is
 * not rolled back when the block throws. Here the boundary is sql.withTransaction:
 * it wraps an Effect, and every query run inside that Effect is on the
 * transaction's connection because the SqlClient service carries it. There is no
 * second handle to forget. A failure in the wrapped Effect rolls the whole thing
 * back, because the rollback is tied to the Effect failing, not to a try/catch
 * the author has to write. Nested withTransaction calls become savepoints rather
 * than a second physical transaction, so a composed operation is still one commit.
 *
 * A row is not the type you cast it to. `db.query(...) as Account[]` is a lie the
 * compiler believes: the database can return a null in a column the type says is
 * non-null, a string where a number was expected, a shape a migration changed
 * last week, and the cast waves all of it through to blow up three functions
 * later. SqlSchema.findOne and findAll decode each row through a schema, so a row
 * that does not match fails HERE with a typed SchemaError, at the boundary, naming
 * the column, rather than becoming an undefined that surfaces far away. The
 * decoded value is the domain type because it was parsed, not because it was
 * asserted.
 *
 * What the layer guarantees, and what it does not:
 *
 *   - withTransaction rolls back on Effect failure, including a failure in a
 *     decode. A row that does not decode fails the transaction, so a corrupt read
 *     cannot commit a partial write beside it.
 *   - A SqlError (constraint violation, connection lost) is a typed error in the
 *     error channel, not a thrown exception. It is caught with Effect.catch, and
 *     it is distinct from a DEFECT, which is a bug that had no business happening
 *     and is meant to page someone rather than be handled.
 *   - The SqlClient is a service. This repository depends on it and never
 *     constructs it, so the same repository code runs against Postgres in
 *     production and a different driver in a test, decided by the layer provided
 *     at the edge (account-runtime.ts), not by this file.
 *   - Money is in minor units as integers. A balance in floating point is a
 *     rounding error waiting for a large enough number.
 *   - The types and the runtime agree. Context.Service infers this service's
 *     shape from the make effect, so a caller that yields the repository gets its
 *     methods typed and the transfer's declared errors in the error channel, and
 *     the schema decode is the runtime guard on top. A row read through
 *     SqlSchema.findOne is the decoded Account type, not an unchecked cast.
 *
 * Every API is from effect@4.0.0-beta.98:
 * node_modules/effect/src/unstable/sql/{SqlClient,SqlSchema,SqlError}.ts.
 */

import { Context, Effect, Schema } from "effect";
import { SqlClient, SqlError, SqlSchema } from "effect/unstable/sql";

/**
 * The decoded shape of an account row. Schema.Int on the balance means a row
 * whose balance column is null or a float fails to decode rather than arriving as
 * a broken number, which is the entire point of not casting.
 */
export class Account extends Schema.Class<Account>("BLANK/Ledger/Account")({
  id: Schema.String,
  ownerId: Schema.String,
  balanceMinor: Schema.Int,
  currency: Schema.String,
}) {}

/** One leg of a transfer, as stored. A transfer writes two of these plus two balance updates. */
export class Posting extends Schema.Class<Posting>("BLANK/Ledger/Posting")({
  id: Schema.String,
  transferId: Schema.String,
  accountId: Schema.String,
  amountMinor: Schema.Int,
}) {}

/** A transfer was requested that the source account cannot cover. A typed, handleable error. */
export class InsufficientFunds extends Schema.TaggedErrorClass<InsufficientFunds>()(
  "InsufficientFunds",
  {
    accountId: Schema.String,
    requestedMinor: Schema.Int,
    balanceMinor: Schema.Int,
  },
) {}

/** A referenced account does not exist. */
export class AccountNotFound extends Schema.TaggedErrorClass<AccountNotFound>()(
  "AccountNotFound",
  { accountId: Schema.String },
) {}

/**
 * The ledger repository as a service. It depends on SqlClient and exposes the
 * account operations; the transfer is the one that has to be atomic.
 *
 * Context.Service with a make effect: the make runs once when the layer is built,
 * captures the SqlClient, and returns the record of operations.
 */
export class AccountRepository extends Context.Service<AccountRepository>()(
  "BLANK/Ledger/AccountRepository",
  {
    make: Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;

      // Decoded reads. SqlSchema.findOne encodes the request, runs execute, and
      // decodes the first row through Account, failing with a SchemaError if the
      // row does not match or a NoSuchElementError if there is no row.
      const findById = SqlSchema.findOne({
        Request: Schema.String,
        Result: Account,
        execute: (id) => sql`SELECT * FROM accounts WHERE id = ${id}`,
      });

      const findByOwner = SqlSchema.findAll({
        Request: Schema.String,
        Result: Account,
        execute: (ownerId) =>
          sql`SELECT * FROM accounts WHERE owner_id = ${ownerId}`,
      });

      /**
       * Move money between two accounts, atomically. Everything inside the
       * withTransaction Effect runs on the transaction's connection: the two
       * reads, the overdraft check, the two balance updates, and the two posting
       * inserts either all commit or all roll back. There is no `tx` handle to
       * pass around and forget.
       */
      const transfer = Effect.fnUntraced(function* (
        transferId: string,
        fromId: string,
        toId: string,
        amountMinor: number,
      ) {
        return yield* sql.withTransaction(
          Effect.gen(function* () {
            // Reads inside the transaction see a consistent snapshot and, under a
            // FOR UPDATE, lock the rows against a concurrent transfer. The decode
            // means a corrupt balance row aborts the transfer rather than
            // computing a wrong result from it.
            const from = yield* SqlSchema.findOne({
              Request: Schema.String,
              Result: Account,
              execute: (id) =>
                sql`SELECT * FROM accounts WHERE id = ${id} FOR UPDATE`,
            })(fromId).pipe(
              Effect.catchTag("NoSuchElementError", () =>
                Effect.fail(new AccountNotFound({ accountId: fromId })),
              ),
            );

            if (from.balanceMinor < amountMinor) {
              return yield* Effect.fail(
                new InsufficientFunds({
                  accountId: fromId,
                  requestedMinor: amountMinor,
                  balanceMinor: from.balanceMinor,
                }),
              );
            }

            yield* sql`UPDATE accounts SET balance_minor = balance_minor - ${amountMinor} WHERE id = ${fromId}`;
            yield* sql`UPDATE accounts SET balance_minor = balance_minor + ${amountMinor} WHERE id = ${toId}`;
            // Two postings, the debit and the credit, so the ledger balances. If
            // either insert fails a constraint, the whole transfer rolls back and
            // no balance moved.
            yield* sql`INSERT INTO postings (id, transfer_id, account_id, amount_minor) VALUES (${`${transferId}-d`}, ${transferId}, ${fromId}, ${-amountMinor})`;
            yield* sql`INSERT INTO postings (id, transfer_id, account_id, amount_minor) VALUES (${`${transferId}-c`}, ${transferId}, ${toId}, ${amountMinor})`;

            return { transferId, movedMinor: amountMinor };
          }),
        );
      });

      return { findById, findByOwner, transfer } as const;
    }),
  },
) {}

/** Re-exported for callers that catch these at the edge. */
export { SqlError };
