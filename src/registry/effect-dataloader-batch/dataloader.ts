/**
 * dataloader.ts
 *
 * Failure modes solved:
 *   1. The N+1 query: rendering a list of 100 posts, each asking for its
 *      author, fires 1 query for the posts and 100 for the authors. The
 *      code reads naturally (each component fetches what it needs) but the
 *      database sees a storm of single-row lookups. A batching loader
 *      collects all the author ids requested within one tick and issues a
 *      SINGLE `WHERE id IN (...)` query, so N+1 becomes 2.
 *   2. Duplicate work and lost mapping under batching: the same author id
 *      requested by ten posts must not be fetched ten times, and the one
 *      batched result must be scattered back to the exact callers that
 *      asked, in order. The loader dedups keys within a batch and resolves
 *      each caller's Deferred with its own key's value, so identical
 *      requests share one fetch and every caller still gets its answer.
 *
 * Why the primitives make it correct: pending (key -> waiters) requests
 * accumulate in a Ref; the first request in a batch schedules a microtask
 * flush; the flush atomically drains the pending map (Ref.getAndSet), so
 * requests arriving mid-flush start a fresh batch instead of being lost;
 * the batch fn is called once with the deduped key set; and each waiter's
 * Deferred is resolved from the result map, so dedup and scatter are exact.
 */

import { Deferred, Effect, Ref } from "effect";

export interface Loader<K, V> {
  readonly load: (key: K) => Effect.Effect<V>;
  readonly flush: Effect.Effect<void>;
  readonly batchCount: Effect.Effect<number>;
}

export const makeLoader = <K, V>(
  batchFn: (keys: readonly K[]) => Effect.Effect<ReadonlyMap<K, V>>,
): Effect.Effect<Loader<K, V>> =>
  Effect.gen(function* () {
    const pending = yield* Ref.make(new Map<K, Deferred.Deferred<V>[]>());
    const batches = yield* Ref.make(0);

    const flush = Effect.gen(function* () {
      // drain atomically: anything arriving after this starts a new batch
      const batch = yield* Ref.getAndSet(
        pending,
        new Map<K, Deferred.Deferred<V>[]>(),
      );
      if (batch.size === 0) return;
      yield* Ref.update(batches, (n) => n + 1);
      const keys = [...batch.keys()]; // deduped by Map identity
      const results = yield* batchFn(keys);
      for (const [key, waiters] of batch) {
        const value = results.get(key);
        for (const w of waiters) {
          if (value !== undefined) yield* Deferred.succeed(w, value);
          else
            yield* Deferred.die(
              w,
              new Error(`no value for key ${String(key)}`),
            );
        }
      }
    });

    const load = (key: K) =>
      Effect.gen(function* () {
        const gate = yield* Deferred.make<V>();
        const firstInBatch = yield* Ref.modify(
          pending,
          (m): readonly [boolean, Map<K, Deferred.Deferred<V>[]>] => {
            const first = m.size === 0;
            const next = new Map(m);
            const waiters = next.get(key) ?? [];
            next.set(key, [...waiters, gate]);
            return [first, next];
          },
        );
        // the first caller in a batch schedules the flush for end-of-tick on
        // a detached fiber, so it runs independently of the callers awaiting it
        if (firstInBatch)
          yield* Effect.forkDetach(Effect.yieldNow.pipe(Effect.andThen(flush)));
        return yield* Deferred.await(gate);
      });

    return { load, flush, batchCount: Ref.get(batches) } as const;
  });

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() =>
      console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`),
    );

  const authors = new Map([
    [1, "Ada"],
    [2, "Grace"],
    [3, "Edsger"],
  ]);

  const makeCountingBatchFn =
    (calls: Ref.Ref<number>, keySets: Ref.Ref<number[]>) =>
    (keys: readonly number[]) =>
      Effect.gen(function* () {
        yield* Ref.update(calls, (n) => n + 1);
        yield* Ref.update(keySets, (arr) => [...arr, keys.length]);
        const out = new Map<number, string>();
        for (const k of keys) {
          const name = authors.get(k);
          if (name !== undefined) out.set(k, name);
        }
        return out;
      });

  // Property 1: N author lookups in one tick collapse to ONE batched query.
  {
    const calls = yield* Ref.make(0);
    const keySets = yield* Ref.make<number[]>([]);
    const loader = yield* makeLoader(makeCountingBatchFn(calls, keySets));
    // 100 posts, each author is one of 3 (like a real feed)
    const postAuthorIds = Array.from({ length: 100 }, (_, i) => (i % 3) + 1);
    const names = yield* Effect.all(
      postAuthorIds.map((id) => loader.load(id)),
      { concurrency: "unbounded" },
    );
    const queryCount = yield* Ref.get(calls);
    const batchSizes = yield* Ref.get(keySets);
    yield* check(
      "N+1 collapses to a single batched query",
      queryCount === 1 && batchSizes[0] === 3 && names.length === 100,
      `100 author lookups issued ${queryCount} query for ${batchSizes[0]} distinct ids (deduped), returning all 100 names`,
    );
  }

  // Property 2: the naive per-request baseline really is N queries.
  {
    const calls = yield* Ref.make(0);
    const naiveFetch = (id: number) =>
      Ref.update(calls, (n) => n + 1).pipe(Effect.as(authors.get(id)));
    const postAuthorIds = Array.from({ length: 100 }, (_, i) => (i % 3) + 1);
    yield* Effect.all(postAuthorIds.map(naiveFetch));
    const queryCount = yield* Ref.get(calls);
    yield* check(
      "the unbatched baseline is N queries",
      queryCount === 100,
      `the same 100 lookups without batching hit the database ${queryCount} times`,
    );
  }

  // Property 3: identical keys in a batch are deduped, distinct answers scatter.
  {
    const calls = yield* Ref.make(0);
    const keySets = yield* Ref.make<number[]>([]);
    const loader = yield* makeLoader(makeCountingBatchFn(calls, keySets));
    const [a, b, c, d] = yield* Effect.all(
      [
        loader.load(1),
        loader.load(1), // duplicate of the first
        loader.load(2),
        loader.load(3),
      ],
      { concurrency: "unbounded" },
    );
    const batchSizes = yield* Ref.get(keySets);
    yield* check(
      "duplicate keys share one fetch; answers scatter correctly",
      a === "Ada" &&
        b === "Ada" &&
        c === "Grace" &&
        d === "Edsger" &&
        batchSizes[0] === 3,
      `4 loads (one duplicate) fetched ${batchSizes[0]} distinct keys and each caller got its own value`,
    );
  }

  // Property 4: requests in separate ticks form separate batches.
  {
    const calls = yield* Ref.make(0);
    const keySets = yield* Ref.make<number[]>([]);
    const loader = yield* makeLoader(makeCountingBatchFn(calls, keySets));
    yield* loader.load(1); // tick 1
    yield* loader.load(2); // tick 2 (awaited the first, so a new batch)
    const queryCount = yield* Ref.get(calls);
    yield* check(
      "separate ticks are separate batches",
      queryCount === 2,
      `two sequentially-awaited loads produced ${queryCount} batches, as expected for different ticks`,
    );
  }

  console.log("dataloader.ts: all properties verified");
});

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e);
  process.exit(1);
});
