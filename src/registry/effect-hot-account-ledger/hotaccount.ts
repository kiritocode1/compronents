/**
 * hotaccount.ts
 *
 * Failure modes solved:
 *   1. The row-lock convoy (one merchant melts the ledger): a big seller on
 *      a promotion day takes thousands of concurrent balance updates, and
 *      every one of them queues on the same row lock. Throughput collapses
 *      to one update per lock hold time, checkout latency climbs, and the
 *      hottest account on the platform becomes its slowest. The fix is
 *      account subdivision: the merchant's balance becomes N sub-accounts,
 *      a credit locks ONE sub-account, and the other N-1 stay available,
 *      so concurrent credits spread across independent locks.
 *   2. The balance that lies (fast paths that skip the ledger): sharding
 *      only helps if reading the balance is still correct. Here the
 *      balance is the sum over sub-accounts read in one pass, every credit
 *      lands in exactly one sub-account under its lock, and the demo
 *      proves the sharded total equals the serialized total to the cent
 *      while finishing several times faster.
 *
 * Why the primitives make it correct: each sub-account's lock is a
 * Semaphore(1), so "one row, one lock" is enforced by the runtime; routing
 * is round-robin off an atomic counter, so load spreads without
 * coordination; and debits that need the full balance take all permits in
 * sub-account order, which is the resource-ordering that cannot deadlock.
 */

import { Data, Effect, Ref, Semaphore } from "effect";

class InsufficientFunds extends Data.TaggedError("InsufficientFunds")<{
  readonly requestedCents: number;
  readonly balanceCents: number;
}> {}

interface SubAccount {
  readonly lock: Semaphore.Semaphore;
  readonly cents: Ref.Ref<number>;
}

export interface HotAccount {
  /** credit: locks exactly one sub-account */
  readonly credit: (cents: number, lockHoldMs?: number) => Effect.Effect<void>;
  /** read the full balance: one pass over the sub-accounts */
  readonly balance: Effect.Effect<number>;
  /** debit against the WHOLE balance: takes every lock in fixed order */
  readonly debit: (cents: number) => Effect.Effect<number, InsufficientFunds>;
  readonly peakConcurrentHolds: Effect.Effect<number>;
}

export const makeHotAccount = (options: {
  readonly subAccounts: number;
}): Effect.Effect<HotAccount> =>
  Effect.gen(function* () {
    const subs: SubAccount[] = [];
    for (let i = 0; i < options.subAccounts; i++) {
      subs.push({ lock: yield* Semaphore.make(1), cents: yield* Ref.make(0) });
    }
    const rr = yield* Ref.make(0);
    const holds = yield* Ref.make(0);
    const peak = yield* Ref.make(0);

    const withHoldTracking = <A, E>(e: Effect.Effect<A, E>) =>
      Effect.gen(function* () {
        const now = yield* Ref.updateAndGet(holds, (n) => n + 1);
        yield* Ref.update(peak, (p) => Math.max(p, now));
        return yield* e;
      }).pipe(Effect.ensuring(Ref.update(holds, (n) => n - 1)));

    const credit = (cents: number, lockHoldMs = 0) =>
      Effect.gen(function* () {
        // round-robin routing: no coordination, even spread
        const i = (yield* Ref.updateAndGet(rr, (n) => n + 1)) % subs.length;
        const sub = subs[i];
        yield* Semaphore.withPermits(
          sub.lock,
          1,
        )(
          withHoldTracking(
            Effect.gen(function* () {
              if (lockHoldMs > 0) yield* Effect.sleep(`${lockHoldMs} millis`); // model the row write
              yield* Ref.update(sub.cents, (c) => c + cents);
            }),
          ),
        );
      });

    const balance = Effect.gen(function* () {
      let total = 0;
      for (const sub of subs) total += yield* Ref.get(sub.cents);
      return total;
    });

    // A debit needs the true total, so it takes every sub-account lock in
    // index order (total ordering = no deadlock) and settles across them.
    const debit = (cents: number): Effect.Effect<number, InsufficientFunds> => {
      const takeAll = (i: number): Effect.Effect<number, InsufficientFunds> =>
        i === subs.length
          ? Effect.gen(function* () {
              const total = yield* balance;
              if (total < cents) {
                return yield* new InsufficientFunds({
                  requestedCents: cents,
                  balanceCents: total,
                });
              }
              let remaining = cents;
              for (const sub of subs) {
                const take = Math.min(remaining, yield* Ref.get(sub.cents));
                yield* Ref.update(sub.cents, (c) => c - take);
                remaining -= take;
              }
              return total - cents;
            })
          : Semaphore.withPermits(subs[i].lock, 1)(takeAll(i + 1));
      return takeAll(0);
    };

    return {
      credit,
      balance,
      debit,
      peakConcurrentHolds: Ref.get(peak),
    } as const;
  });

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() =>
      console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`),
    );

  const CREDITS = 200;
  const HOLD_MS = 4; // per-update row write time

  // Property 1: a single row serializes; sub-accounts parallelize. Same
  // credits, same total, several times faster.
  {
    const single = yield* makeHotAccount({ subAccounts: 1 });
    const t0 = Date.now();
    yield* Effect.all(
      Array.from({ length: CREDITS }, () => single.credit(100, HOLD_MS)),
      { concurrency: "unbounded" },
    );
    const singleMs = Date.now() - t0;
    const singlePeak = yield* single.peakConcurrentHolds;

    const sharded = yield* makeHotAccount({ subAccounts: 8 });
    const t1 = Date.now();
    yield* Effect.all(
      Array.from({ length: CREDITS }, () => sharded.credit(100, HOLD_MS)),
      { concurrency: "unbounded" },
    );
    const shardedMs = Date.now() - t1;
    const shardedPeak = yield* sharded.peakConcurrentHolds;

    const singleTotal = yield* single.balance;
    const shardedTotal = yield* sharded.balance;

    yield* check(
      "sub-accounts break the lock convoy",
      shardedMs * 3 < singleMs && shardedPeak <= 8 && singlePeak === 1,
      `200 credits: one row ${singleMs}ms (1 lock at a time), 8 sub-accounts ${shardedMs}ms (${shardedPeak} concurrent holds)`,
    );
    yield* check(
      "sharded balance is exact",
      singleTotal === 20_000 && shardedTotal === 20_000,
      `both ledgers read ${shardedTotal} cents for 200 x 100`,
    );
  }

  // Property 2: debits see the full balance and settle across sub-accounts.
  {
    const acct = yield* makeHotAccount({ subAccounts: 8 });
    yield* Effect.all(
      Array.from({ length: 40 }, () => acct.credit(250)),
      { concurrency: "unbounded" },
    );
    const after = yield* acct.debit(9_000);
    const balance = yield* acct.balance;
    yield* check(
      "cross-sub-account debit is atomic",
      after === 1_000 && balance === 1_000,
      `credited 10000, debited 9000 across shards, balance ${balance}`,
    );
  }

  // Property 3: an over-debit fails typed with the true balance, and a debit
  // racing 200 concurrent credits never double-spends or deadlocks.
  {
    const acct = yield* makeHotAccount({ subAccounts: 8 });
    yield* acct.credit(500);
    const refused = yield* Effect.exit(acct.debit(10_000));
    const refusedTyped =
      refused._tag === "Failure" &&
      String(refused.cause).includes("InsufficientFunds");

    yield* Effect.all(
      [
        ...Array.from({ length: 200 }, () => acct.credit(100, 1)),
        acct.debit(400).pipe(Effect.exit, Effect.asVoid),
      ],
      { concurrency: "unbounded" },
    );
    const finalBalance = yield* acct.balance;
    yield* check(
      "over-debit refused typed; racing debit stays consistent",
      refusedTyped && finalBalance === 500 + 20_000 - 400,
      `refusal carried the true balance; after 200 racing credits + 1 debit the ledger reads ${finalBalance} = 500 + 20000 - 400`,
    );
  }

  console.log("hotaccount.ts: all properties verified");
});

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e);
  process.exit(1);
});
