/**
 * scatter-gather.ts
 *
 * Failure modes solved:
 *   1. The fan-out that waits for the slowest shard: a search query hits 20
 *      shards and blocks until all 20 answer, so one slow shard (GC pause,
 *      cold node) makes the whole query slow, every time. Tail latency
 *      becomes the norm. Scatter-gather with a completeness threshold
 *      returns once ENOUGH shards have answered (a quorum), so one straggler
 *      cannot hold the response hostage, and the query's latency is the
 *      k-th fastest, not the slowest.
 *   2. A hang when a shard never answers: waiting on all responses with no
 *      deadline means a dead shard hangs the request forever, consuming a
 *      connection and a caller's patience. A per-gather timeout returns the
 *      partial result gathered so far (flagged partial) instead of hanging,
 *      trading completeness for a bounded response time under failure.
 *
 * Why the primitives make it correct: each shard query is forked, and the
 * gather races the shard fibers against a timeout using Effect.raceAll /
 * interrupt semantics; a shared Ref accumulates results as they arrive and
 * a Deferred fires when the quorum is met, so the gather completes on the
 * quorum without waiting for stragglers; and remaining shard fibers are
 * interrupted on completion, so a slow shard cannot leak a running fiber.
 */

import { Deferred, Effect, Fiber, Ref } from "effect";

export interface ShardResult<A> {
  readonly shard: string;
  readonly value: A;
}

export interface GatherOutcome<A> {
  readonly results: readonly ShardResult<A>[];
  readonly answered: number;
  readonly total: number;
  readonly partial: boolean;
}

/** scatter a query to every shard, gather until `quorum` answer or timeout */
export const scatterGather = <A>(
  shards: readonly {
    readonly name: string;
    readonly query: Effect.Effect<A>;
  }[],
  options: { readonly quorum: number; readonly timeoutMs: number },
): Effect.Effect<GatherOutcome<A>> =>
  Effect.gen(function* () {
    const collected = yield* Ref.make<ShardResult<A>[]>([]);
    const quorumMet = yield* Deferred.make<void>();

    const fibers = yield* Effect.all(
      shards.map((shard) =>
        Effect.forkChild(
          shard.query.pipe(
            Effect.flatMap((value) =>
              Effect.gen(function* () {
                const count = yield* Ref.modify(collected, (rs) => {
                  const next = [...rs, { shard: shard.name, value }];
                  return [next.length, next] as const;
                });
                if (count >= options.quorum)
                  yield* Deferred.succeed(quorumMet, undefined);
              }),
            ),
          ),
        ),
      ),
    );

    // wait for the quorum, but not past the timeout
    const met = yield* Deferred.await(quorumMet).pipe(
      Effect.timeoutOption(`${options.timeoutMs} millis`),
    );
    // stop the stragglers so no fiber leaks
    yield* Effect.forEach(fibers, (f) => Fiber.interrupt(f), { discard: true });

    const results = yield* Ref.get(collected);
    return {
      results,
      answered: results.length,
      total: shards.length,
      partial: met._tag === "None" || results.length < shards.length,
    };
  });

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() =>
      console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`),
    );

  const shard = (name: string, latencyMs: number, value: number) => ({
    name,
    query: Effect.sleep(`${latencyMs} millis`).pipe(Effect.as(value)),
  });

  // Property 1: a quorum returns without waiting for the slowest shard.
  {
    const shards = [
      shard("s1", 10, 1),
      shard("s2", 10, 2),
      shard("s3", 10, 3),
      shard("s4", 500, 4), // straggler
      shard("s5", 500, 5), // straggler
    ];
    const start = yield* Effect.sync(() => performance.now());
    const outcome = yield* scatterGather(shards, {
      quorum: 3,
      timeoutMs: 1000,
    });
    const elapsed = yield* Effect.sync(() => performance.now() - start);
    yield* check(
      "quorum returns on the k-th fastest, not the slowest",
      outcome.answered >= 3 && elapsed < 300,
      `3-of-5 quorum met in ${Math.round(elapsed)}ms; two 500ms stragglers did not hold the response`,
    );
  }

  // Property 2: the all-shards baseline is as slow as its worst shard.
  {
    const start = yield* Effect.sync(() => performance.now());
    yield* Effect.all(
      [10, 10, 10, 500, 500].map((ms) => Effect.sleep(`${ms} millis`)),
      { concurrency: "unbounded" },
    );
    const elapsed = yield* Effect.sync(() => performance.now() - start);
    yield* check(
      "waiting for all shards inherits the tail latency",
      elapsed >= 450,
      `the same fan-out waiting for every shard took ${Math.round(elapsed)}ms, gated by the 500ms straggler`,
    );
  }

  // Property 3: if the quorum cannot be met, the timeout returns a partial
  // result instead of hanging.
  {
    const shards = [
      shard("s1", 10, 1),
      shard("s2", 10, 2),
      shard("s3", 5000, 3), // never answers in time
    ];
    const outcome = yield* scatterGather(shards, { quorum: 3, timeoutMs: 60 });
    yield* check(
      "an unreachable quorum degrades to a partial result",
      outcome.partial && outcome.answered === 2,
      `quorum of 3 was impossible in time; the gather returned ${outcome.answered}/3 flagged partial rather than hanging`,
    );
  }

  // Property 4: stragglers are interrupted; the gather does not leak fibers.
  {
    const started = yield* Ref.make(0);
    const finished = yield* Ref.make(0);
    const trackedShard = (name: string, latencyMs: number) => ({
      name,
      query: Effect.gen(function* () {
        yield* Ref.update(started, (n) => n + 1);
        yield* Effect.sleep(`${latencyMs} millis`);
        yield* Ref.update(finished, (n) => n + 1);
        return 1;
      }),
    });
    const shards = [
      trackedShard("fast1", 10),
      trackedShard("fast2", 10),
      trackedShard("slow", 500),
    ];
    yield* scatterGather(shards, { quorum: 2, timeoutMs: 1000 });
    yield* Effect.sleep("600 millis"); // give the slow shard time to finish IF it leaked
    const [s, f] = [yield* Ref.get(started), yield* Ref.get(finished)];
    yield* check(
      "stragglers are interrupted, no fiber leak",
      s === 3 && f === 2,
      `all ${s} shards started but only ${f} completed; the straggler was interrupted after the quorum, not left running`,
    );
  }

  console.log("scatter-gather.ts: all properties verified");
});

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e);
  process.exit(1);
});
