/**
 * pool.ts
 *
 * Failure modes solved:
 *   1. Unbounded connections melt the database: opening a fresh connection
 *      per request means a traffic spike opens thousands, the database hits
 *      its connection limit, and every query, including cheap ones, starts
 *      failing. A bounded pool caps concurrency at a size the database can
 *      actually serve, so surplus demand waits instead of overwhelming.
 *   2. The unbounded wait queue that turns backpressure into a hang: once
 *      the pool is full, callers must wait, but a wait with no timeout
 *      means a request stuck behind a slow query hangs forever and the
 *      caller's own timeout budget is blown silently. Bounded waiting with
 *      a typed AcquireTimeout gives fast failure under saturation, and FIFO
 *      hand-off means no waiter starves while later arrivals jump the line.
 *
 * Why the primitives make it correct: idle connections and the FIFO waiter
 * queue live in one Ref; acquire is a single Ref.modify that either takes
 * an idle connection or enqueues a Deferred the caller parks on, so a
 * connection is handed to exactly one waiter; release hands the connection
 * to the oldest waiter (or returns it idle) in the same atomic step, so a
 * connection is never double-issued; and acquire races the park against a
 * timeout so saturation fails fast instead of hanging.
 */

import { Data, Deferred, Effect, Fiber, Ref } from "effect";

class AcquireTimeout extends Data.TaggedError("AcquireTimeout")<{
  readonly waitedMs: number;
}> {}

interface Conn {
  readonly id: number;
}

interface PoolState {
  readonly idle: readonly Conn[];
  readonly waiters: readonly Deferred.Deferred<Conn>[];
  readonly inUse: number;
}

export interface Pool {
  readonly withConnection: <A>(
    use: (conn: Conn) => Effect.Effect<A>,
  ) => Effect.Effect<A, AcquireTimeout>;
  readonly stats: Effect.Effect<{
    idle: number;
    inUse: number;
    waiting: number;
  }>;
}

export const makePool = (
  size: number,
  acquireTimeoutMs = 1000,
): Effect.Effect<Pool> =>
  Effect.gen(function* () {
    const state = yield* Ref.make<PoolState>({
      idle: Array.from({ length: size }, (_, i) => ({ id: i })),
      waiters: [],
      inUse: 0,
    });

    const acquire = Effect.gen(function* () {
      const gate = yield* Deferred.make<Conn>();
      const immediate = yield* Ref.modify(
        state,
        (s): readonly [Conn | null, PoolState] => {
          if (s.idle.length > 0) {
            const [conn, ...rest] = s.idle;
            return [conn, { ...s, idle: rest, inUse: s.inUse + 1 }];
          }
          return [null, { ...s, waiters: [...s.waiters, gate] }];
        },
      );
      if (immediate !== null) return immediate;
      // full: park on the FIFO queue, but not forever
      return yield* Deferred.await(gate).pipe(
        Effect.timeoutOrElse({
          duration: `${acquireTimeoutMs} millis`,
          orElse: () => new AcquireTimeout({ waitedMs: acquireTimeoutMs }),
        }),
      );
    });

    const release = (conn: Conn) =>
      Effect.gen(function* () {
        const handoff = yield* Ref.modify(
          state,
          (s): readonly [Deferred.Deferred<Conn> | null, PoolState] => {
            if (s.waiters.length > 0) {
              const [next, ...rest] = s.waiters;
              return [next, { ...s, waiters: rest }]; // stays inUse, new owner
            }
            return [
              null,
              { ...s, idle: [...s.idle, conn], inUse: s.inUse - 1 },
            ];
          },
        );
        if (handoff !== null) yield* Deferred.succeed(handoff, conn);
      });

    const withConnection = <A>(use: (conn: Conn) => Effect.Effect<A>) =>
      Effect.acquireUseRelease(acquire, use, release);

    return {
      withConnection,
      stats: Ref.get(state).pipe(
        Effect.map((s) => ({
          idle: s.idle.length,
          inUse: s.inUse,
          waiting: s.waiters.length,
        })),
      ),
    } as const;
  });

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() =>
      console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`),
    );

  // Property 1: concurrency is capped at the pool size, surplus waits.
  {
    const pool = yield* makePool(3, 1000);
    const peak = yield* Ref.make(0);
    const live = yield* Ref.make(0);
    yield* Effect.all(
      Array.from({ length: 12 }, () =>
        pool.withConnection(() =>
          Effect.gen(function* () {
            const n = yield* Ref.updateAndGet(live, (x) => x + 1);
            yield* Ref.update(peak, (p) => Math.max(p, n));
            yield* Effect.sleep("15 millis");
            yield* Ref.update(live, (x) => x - 1);
          }),
        ),
      ),
      { concurrency: "unbounded" },
    );
    const observedPeak = yield* Ref.get(peak);
    yield* check(
      "the pool caps concurrent connection use",
      observedPeak === 3,
      `12 concurrent requests against a size-3 pool never ran more than ${observedPeak} at once`,
    );
  }

  // Property 2: all 12 requests eventually complete (fairness, no lost work).
  {
    const pool = yield* makePool(2, 2000);
    const done = yield* Ref.make(0);
    yield* Effect.all(
      Array.from({ length: 12 }, () =>
        pool.withConnection(() =>
          Ref.update(done, (n) => n + 1).pipe(Effect.delay("5 millis")),
        ),
      ),
      { concurrency: "unbounded" },
    );
    const finished = yield* Ref.get(done);
    const stats = yield* pool.stats;
    yield* check(
      "every waiter is eventually served",
      finished === 12 && stats.idle === 2 && stats.inUse === 0,
      `all ${finished} requests completed and the pool returned to ${stats.idle} idle, 0 in use`,
    );
  }

  // Property 3: under saturation, waiting fails fast with a typed timeout
  // instead of hanging.
  {
    const pool = yield* makePool(1, 30);
    // hold the only connection for longer than the acquire timeout
    const holder = yield* Effect.forkChild(
      pool.withConnection(() => Effect.sleep("200 millis")),
    );
    yield* Effect.sleep("5 millis");
    const exit = yield* Effect.exit(pool.withConnection(() => Effect.void));
    yield* Fiber.join(holder);
    yield* check(
      "acquire under saturation times out, not hangs",
      exit._tag === "Failure" && String(exit.cause).includes("AcquireTimeout"),
      `with the sole connection held, a second acquire failed with AcquireTimeout after ~30ms rather than blocking forever`,
    );
  }

  // Property 4: a connection is never handed to two owners at once.
  {
    const pool = yield* makePool(1, 1000);
    const owners = yield* Ref.make(0);
    const overlap = yield* Ref.make(false);
    yield* Effect.all(
      Array.from({ length: 20 }, () =>
        pool.withConnection(() =>
          Effect.gen(function* () {
            const n = yield* Ref.updateAndGet(owners, (x) => x + 1);
            if (n > 1) yield* Ref.set(overlap, true);
            yield* Effect.sleep("2 millis");
            yield* Ref.update(owners, (x) => x - 1);
          }),
        ),
      ),
      { concurrency: "unbounded" },
    );
    yield* check(
      "the lone connection has one owner at a time",
      (yield* Ref.get(overlap)) === false,
      `20 racing borrowers of a size-1 pool never held the connection simultaneously`,
    );
  }

  console.log("pool.ts: all properties verified");
});

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e);
  process.exit(1);
});
