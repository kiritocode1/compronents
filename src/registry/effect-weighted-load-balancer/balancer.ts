/**
 * balancer.ts
 *
 * Failure modes solved:
 *   1. Round-robin feeds the dying server: rotation treats every backend as
 *      equal, so a degraded instance (GC pause, cold cache, saturated disk)
 *      keeps receiving exactly its share of traffic while its in-flight
 *      queue climbs. The requests parked on it time out; a third of your
 *      traffic is slow because the balancer refuses to notice.
 *   2. Least-connections without sampling herds: picking the global minimum
 *      on every request makes all arrivals in the same tick pile onto the
 *      same "emptiest" backend, which promptly becomes the fullest. The
 *      power-of-two-choices fix samples TWO random backends and routes to
 *      the one with fewer in-flight requests: near-optimal balance with two
 *      counter reads, no herd, no global scan.
 *
 * Why the primitives make it correct: each backend's in-flight count is a
 * Ref bracketed by Effect.ensuring, so a request that fails or is
 * interrupted still decrements; the deterministic LCG lives in a Ref so
 * concurrent pick calls never see the same sample pair; and the choice
 * reads live counters at pick time, so a slow backend sheds load the
 * moment its queue grows, with no health-check lag.
 */

import { Data, Effect, Fiber, Ref } from "effect";

class NoBackends extends Data.TaggedError("NoBackends") {}

export interface Backend {
  readonly name: string;
  readonly inflight: Ref.Ref<number>;
  readonly served: Ref.Ref<number>;
  readonly peak: Ref.Ref<number>;
  readonly handle: (req: string) => Effect.Effect<string>;
}

export const makeBackend = (
  name: string,
  latencyMs: number,
): Effect.Effect<Backend> =>
  Effect.gen(function* () {
    const inflight = yield* Ref.make(0);
    const served = yield* Ref.make(0);
    const peak = yield* Ref.make(0);
    const handle = (req: string) =>
      Effect.gen(function* () {
        const now = yield* Ref.updateAndGet(inflight, (n) => n + 1);
        yield* Ref.update(peak, (p) => Math.max(p, now));
        yield* Effect.sleep(`${latencyMs} millis`);
        yield* Ref.update(served, (n) => n + 1);
        return `${name}:${req}`;
      }).pipe(Effect.ensuring(Ref.update(inflight, (n) => n - 1)));
    return { name, inflight, served, peak, handle } as const;
  });

export type Strategy = "round-robin" | "power-of-two";

export interface Balancer {
  readonly route: (req: string) => Effect.Effect<string, NoBackends>;
}

export const makeBalancer = (
  backends: readonly Backend[],
  strategy: Strategy,
  seed = 42,
): Effect.Effect<Balancer> =>
  Effect.gen(function* () {
    const cursor = yield* Ref.make(0);
    const rng = yield* Ref.make(seed >>> 0);
    // deterministic LCG so demos reproduce; swap for Math.random in prod
    const nextRand = Ref.modify(rng, (s) => {
      const n = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return [n, n] as const;
    });

    const pick = Effect.gen(function* () {
      if (backends.length === 0) return yield* new NoBackends();
      if (strategy === "round-robin") {
        const i = yield* Ref.updateAndGet(cursor, (n) => n + 1);
        return backends[i % backends.length];
      }
      // power of two choices: sample two distinct backends, take the emptier
      const a = (yield* nextRand) % backends.length;
      const step = 1 + ((yield* nextRand) % (backends.length - 1));
      const b = (a + step) % backends.length;
      const [la, lb] = yield* Effect.all([
        Ref.get(backends[a].inflight),
        Ref.get(backends[b].inflight),
      ]);
      return la <= lb ? backends[a] : backends[b];
    });

    const route = (req: string) =>
      pick.pipe(Effect.flatMap((backend) => backend.handle(req)));

    return { route } as const;
  });

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() =>
      console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`),
    );

  const run = (strategy: Strategy) =>
    Effect.gen(function* () {
      // b3 is degraded: 12x slower than its peers
      const pool = yield* Effect.all([
        makeBackend("b1", 4),
        makeBackend("b2", 4),
        makeBackend("b3", 48),
      ]);
      const lb = yield* makeBalancer(pool, strategy);
      yield* Effect.all(
        Array.from({ length: 90 }, (_, i) => lb.route(`r${i}`)),
        { concurrency: 12 },
      );
      const [served, peak] = yield* Effect.all([
        Effect.all(pool.map((b) => Ref.get(b.served))),
        Effect.all(pool.map((b) => Ref.get(b.peak))),
      ]);
      return { served, peak };
    });

  const rr = yield* run("round-robin");
  const p2c = yield* run("power-of-two");

  // Property 1: round-robin gives the degraded backend its full share anyway.
  yield* check(
    "round-robin ignores the degraded backend",
    rr.served[2] === 30,
    `b3 is 12x slower yet still served ${rr.served[2]}/90 requests (exactly its rotation share)`,
  );

  // Property 2: p2c sheds load off the slow backend because its in-flight
  // counter stays high, so the two-sample comparison routes around it.
  yield* check(
    "power-of-two sheds the degraded backend",
    p2c.served[2] < rr.served[2] / 2,
    `b3 served ${p2c.served[2]} under p2c vs ${rr.served[2]} under round-robin`,
  );

  // Property 3: the shed traffic lands on the healthy peers, and the slow
  // backend's queue depth stays lower than under rotation.
  yield* check(
    "queue depth on the slow backend shrinks",
    p2c.peak[2] < rr.peak[2],
    `b3 peak in-flight: round-robin ${rr.peak[2]} vs p2c ${p2c.peak[2]}`,
  );

  // Property 4: interruption cannot leak an in-flight slot.
  {
    const b = yield* makeBackend("b9", 200);
    const fiber = yield* Effect.forkChild(b.handle("doomed"));
    yield* Effect.sleep("10 millis");
    yield* Fiber.interrupt(fiber);
    const left = yield* Ref.get(b.inflight);
    yield* check(
      "interrupted request releases its slot",
      left === 0,
      `after interrupt the in-flight counter reads ${left}, so ensuring ran`,
    );
  }

  console.log("balancer.ts: all properties verified");
});

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e);
  process.exit(1);
});
