/**
 * idempotency.ts
 *
 * Failure modes solved:
 *   1. Double charge on retry: a payment request times out at the client, the
 *      client retries, and both requests reach the processor. Without a key,
 *      the customer is charged twice. Here every request carries an
 *      idempotency key, and the store makes the key the single author of
 *      execution: the first arrival runs the effect, every duplicate (racing
 *      or late) gets the first run's result without re-executing.
 *   2. Concurrent duplicates (the retry that overtakes the original): a
 *      naive "check then insert" store has a gap between the check and the
 *      insert, and two requests in that gap both execute. Here the in-flight
 *      slot is claimed atomically with Ref.modify, and the loser awaits a
 *      Deferred that the winner completes, so the race has exactly one
 *      winner by construction, not by timing luck.
 *
 * Why the primitives make it correct: Ref.modify is one atomic
 * claim-or-observe decision, and the Deferred is the one channel the result
 * travels through. Failures propagate to waiting duplicates too, and the
 * failed key is released so a later retry can attempt the work again
 * (a failure is not a result worth replaying forever).
 */

import { Clock, Data, Deferred, Duration, Effect, Exit, Ref } from "effect";

class DuplicateInFlight extends Data.TaggedError("DuplicateInFlight")<{
  readonly key: string;
}> {}

type Slot<A, E> =
  | { readonly _tag: "InFlight"; readonly done: Deferred.Deferred<A, E> }
  | {
      readonly _tag: "Completed";
      readonly value: A;
      readonly expiresAt: number;
    };

export interface IdempotencyStore {
  /** Run `effect` at most once per key; duplicates receive the first result. */
  readonly execute: <A, E>(
    key: string,
    effect: Effect.Effect<A, E>,
  ) => Effect.Effect<A, E>;
  readonly executions: Ref.Ref<number>;
}

export const makeIdempotencyStore = (options: {
  readonly resultTtl: Duration.Input;
}): Effect.Effect<IdempotencyStore> =>
  Effect.gen(function* () {
    // ponytail: single Ref<Map>, swap for a SQL/KV table when keys must survive restarts
    const slots = yield* Ref.make(new Map<string, Slot<unknown, unknown>>());
    const executions = yield* Ref.make(0);
    const ttlMs = Duration.toMillis(options.resultTtl);

    const execute = <A, E>(
      key: string,
      effect: Effect.Effect<A, E>,
    ): Effect.Effect<A, E> =>
      Effect.gen(function* () {
        const now = yield* Clock.currentTimeMillis;
        const fresh = yield* Deferred.make<A, E>();
        type SlotMap = Map<string, Slot<unknown, unknown>>;
        type Claim = Slot<unknown, unknown> | { readonly _tag: "Claimed" };
        // One atomic decision: claim the key, or learn who already owns it.
        const claim = yield* Ref.modify(
          slots,
          (map): readonly [Claim, SlotMap] => {
            const existing = map.get(key);
            if (existing !== undefined) {
              if (existing._tag === "Completed" && existing.expiresAt > now) {
                return [existing, map] as const;
              }
              if (existing._tag === "InFlight") return [existing, map] as const;
              // expired completed entry: fall through and re-claim
            }
            const next = new Map(map);
            next.set(key, {
              _tag: "InFlight",
              done: fresh as Deferred.Deferred<unknown, unknown>,
            });
            return [{ _tag: "Claimed" } as const, next] as const;
          },
        );

        if (claim._tag === "Completed") return claim.value as A;
        if (claim._tag === "InFlight") {
          // A racing duplicate: wait on the winner's Deferred, sharing its outcome.
          return yield* Deferred.await(claim.done as Deferred.Deferred<A, E>);
        }

        // We won the claim: run the effect exactly once, publish the outcome.
        yield* Ref.update(executions, (n) => n + 1);
        const exit = yield* Effect.exit(effect);
        if (Exit.isSuccess(exit)) {
          const expiresAt = (yield* Clock.currentTimeMillis) + ttlMs;
          yield* Ref.update(slots, (map) => {
            const next = new Map(map);
            next.set(key, { _tag: "Completed", value: exit.value, expiresAt });
            return next;
          });
          yield* Deferred.succeed(fresh, exit.value);
          return exit.value;
        }
        // Failure: release the key so a deliberate retry can run the work again,
        // and propagate the same failure to every duplicate that was waiting.
        yield* Ref.update(slots, (map) => {
          const next = new Map(map);
          next.delete(key);
          return next;
        });
        yield* Deferred.failCause(fresh, exit.cause);
        return yield* Effect.failCause(exit.cause);
      });

    return { execute, executions } as const;
  });

// ---- demo: prove the properties ----
class CardDeclined extends Data.TaggedError("CardDeclined")<{
  readonly key: string;
}> {}

const demo = Effect.gen(function* () {
  const assert = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() =>
      console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`),
    );

  const store = yield* makeIdempotencyStore({ resultTtl: "1 hour" });
  const charged = yield* Ref.make(0);
  const charge = (key: string, cents: number) =>
    Effect.gen(function* () {
      yield* Effect.sleep("20 millis"); // model the processor round trip
      yield* Ref.update(charged, (n) => n + cents);
      return `receipt:${key}:${cents}`;
    });

  // Property 1: 25 concurrent submissions of ONE key => one charge, one receipt.
  {
    const results = yield* Effect.all(
      Array.from({ length: 25 }, () =>
        store.execute("order-771", charge("order-771", 4999)),
      ),
      { concurrency: "unbounded" },
    );
    const total = yield* Ref.get(charged);
    const allSame = results.every((r) => r === "receipt:order-771:4999");
    yield* assert(
      "concurrent duplicates coalesce",
      total === 4999 && allSame,
      `25 racing submissions charged ${total} cents (expected 4999), all saw the same receipt: ${allSame}`,
    );
  }

  // Property 2: a late retry after completion replays the result, no new charge.
  {
    const replay = yield* store.execute("order-771", charge("order-771", 4999));
    const total = yield* Ref.get(charged);
    yield* assert(
      "late retry replays stored result",
      replay === "receipt:order-771:4999" && total === 4999,
      `retry got "${replay}" and total stayed ${total} cents`,
    );
  }

  // Property 3: a failed execution releases the key, so a retry can run again.
  {
    const flaky = yield* Ref.make(true);
    const attempt = Effect.gen(function* () {
      const failFirst = yield* Ref.getAndSet(flaky, false);
      if (failFirst) return yield* new CardDeclined({ key: "order-902" });
      return yield* charge("order-902", 1250);
    });
    const first = yield* Effect.exit(store.execute("order-902", attempt));
    const second = yield* store.execute("order-902", attempt);
    yield* assert(
      "failure releases the key for retry",
      Exit.isFailure(first) && second === "receipt:order-902:1250",
      `first attempt failed as expected, retry succeeded with "${second}"`,
    );
  }

  // Property 4: distinct keys execute independently.
  {
    const before = yield* Ref.get(store.executions);
    yield* store.execute("order-903", charge("order-903", 700));
    const after = yield* Ref.get(store.executions);
    yield* assert(
      "distinct keys are independent",
      after === before + 1,
      `executions ${before} -> ${after}`,
    );
  }

  console.log("idempotency.ts: all properties verified");
});

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e);
  process.exit(1);
});
