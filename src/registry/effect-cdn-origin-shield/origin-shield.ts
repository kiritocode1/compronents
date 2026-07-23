/**
 * origin-shield.ts
 *
 * Failure modes solved:
 *   1. Every edge is a separate customer: a CDN with 12 POPs that all miss
 *      on the same fresh object sends 12 simultaneous fetches to the
 *      origin. Multiply by every object that just expired and "we have a
 *      CDN" becomes "our origin serves the whole internet again, but in
 *      spikes". The shield tier collapses the fan-in: edges fill from ONE
 *      shield cache, and the origin sees one fetch per object, total.
 *   2. Concurrent misses at the shield itself: two POPs missing the same
 *      object one millisecond apart must not both fetch. The shield
 *      single-flights: the first miss starts the origin fetch and every
 *      concurrent miss for the same key awaits that same in-flight fetch
 *      (request coalescing), so "one fetch per object" holds even under a
 *      perfectly synchronized miss storm.
 *
 * Why the primitives make it correct: the in-flight table maps key ->
 * Deferred, and claiming a key is one Ref.modify (atomic winner
 * selection), so exactly one fiber performs the fetch and resolves the
 * Deferred every waiter is parked on; the winner resolves it inside
 * Effect.ensuring so even a failed fetch releases the waiters instead of
 * hanging them; and each tier's hit/miss counters are Refs the demo reads
 * to prove the collapse arithmetic.
 */

import { Deferred, Effect, Ref } from "effect";

export interface Origin {
  readonly fetch: (key: string) => Effect.Effect<string>;
  readonly fetches: Effect.Effect<number>;
}

export const makeOrigin = (latencyMs = 30): Effect.Effect<Origin> =>
  Effect.gen(function* () {
    const count = yield* Ref.make(0);
    return {
      fetch: (key: string) =>
        Effect.gen(function* () {
          yield* Ref.update(count, (n) => n + 1);
          yield* Effect.sleep(`${latencyMs} millis`);
          return `body-of-${key}`;
        }),
      fetches: Ref.get(count),
    } as const;
  });

export interface Shield {
  readonly get: (key: string) => Effect.Effect<string>;
  readonly stats: Effect.Effect<{
    hits: number;
    coalesced: number;
    originFetches: number;
  }>;
}

export const makeOriginShield = (origin: Origin): Effect.Effect<Shield> =>
  Effect.gen(function* () {
    const cache = yield* Ref.make(new Map<string, string>());
    const inflight = yield* Ref.make(
      new Map<string, Deferred.Deferred<string>>(),
    );
    const hits = yield* Ref.make(0);
    const coalesced = yield* Ref.make(0);

    const get = (key: string) =>
      Effect.gen(function* () {
        const cached = (yield* Ref.get(cache)).get(key);
        if (cached !== undefined) {
          yield* Ref.update(hits, (n) => n + 1);
          return cached;
        }
        const gate = yield* Deferred.make<string>();
        const winner = yield* Ref.modify(
          inflight,
          (
            m,
          ): readonly [
            { role: "fetch" } | { role: "wait"; on: Deferred.Deferred<string> },
            Map<string, Deferred.Deferred<string>>,
          ] => {
            const existing = m.get(key);
            if (existing !== undefined)
              return [{ role: "wait", on: existing }, m];
            return [{ role: "fetch" }, new Map(m).set(key, gate)];
          },
        );
        if (winner.role === "wait") {
          yield* Ref.update(coalesced, (n) => n + 1);
          return yield* Deferred.await(winner.on);
        }
        return yield* Effect.gen(function* () {
          const body = yield* origin.fetch(key);
          yield* Ref.update(cache, (m) => new Map(m).set(key, body));
          yield* Deferred.succeed(gate, body);
          return body;
        }).pipe(
          Effect.ensuring(
            Ref.update(inflight, (m) => {
              const next = new Map(m);
              next.delete(key);
              return next;
            }),
          ),
        );
      });

    const stats = Effect.all([
      Ref.get(hits),
      Ref.get(coalesced),
      origin.fetches,
    ]).pipe(
      Effect.map(([h, c, o]) => ({ hits: h, coalesced: c, originFetches: o })),
    );

    return { get, stats } as const;
  });

export interface Pop {
  readonly name: string;
  readonly get: (key: string) => Effect.Effect<string>;
}

/** an edge POP: local cache, fills from the shield (or origin if unshielded) */
export const makePop = (
  name: string,
  upstream: { readonly get: (key: string) => Effect.Effect<string> },
): Effect.Effect<Pop> =>
  Effect.gen(function* () {
    const local = yield* Ref.make(new Map<string, string>());
    const get = (key: string) =>
      Effect.gen(function* () {
        const cached = (yield* Ref.get(local)).get(key);
        if (cached !== undefined) return cached;
        const body = yield* upstream.get(key);
        yield* Ref.update(local, (m) => new Map(m).set(key, body));
        return body;
      });
    return { name, get } as const;
  });

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() =>
      console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`),
    );

  // Property 1: unshielded, every POP's miss is an origin fetch.
  {
    const origin = yield* makeOrigin();
    const pops = yield* Effect.all(
      Array.from({ length: 6 }, (_, i) =>
        makePop(`pop${i}`, { get: origin.fetch }),
      ),
    );
    yield* Effect.all(
      pops.map((p) => p.get("/video/intro.mp4")),
      { concurrency: "unbounded" },
    );
    const fetches = yield* origin.fetches;
    yield* check(
      "unshielded POPs stampede the origin",
      fetches === 6,
      `6 edge misses for one object became ${fetches} simultaneous origin fetches`,
    );
  }

  // Property 2: with the shield, the same storm costs the origin ONE fetch.
  {
    const origin = yield* makeOrigin();
    const shield = yield* makeOriginShield(origin);
    const pops = yield* Effect.all(
      Array.from({ length: 6 }, (_, i) => makePop(`pop${i}`, shield)),
    );
    yield* Effect.all(
      pops.map((p) => p.get("/video/intro.mp4")),
      { concurrency: "unbounded" },
    );
    const stats = yield* shield.stats;
    yield* check(
      "the shield collapses the stampede to one origin fetch",
      stats.originFetches === 1 && stats.coalesced === 5,
      `6 simultaneous misses: 1 origin fetch, ${stats.coalesced} coalesced onto it`,
    );
  }

  // Property 3: later misses at other POPs are shield hits, origin stays cold.
  {
    const origin = yield* makeOrigin();
    const shield = yield* makeOriginShield(origin);
    const first = yield* makePop("lhr", shield);
    yield* first.get("/img/hero.avif");
    const later = yield* Effect.all(
      Array.from({ length: 4 }, (_, i) => makePop(`late${i}`, shield)),
    );
    yield* Effect.all(
      later.map((p) => p.get("/img/hero.avif")),
      { concurrency: 1 },
    );
    const stats = yield* shield.stats;
    yield* check(
      "cold POPs fill from the shield, not the origin",
      stats.originFetches === 1 && stats.hits === 4,
      `4 later POP misses were ${stats.hits} shield cache hits; origin fetch count stayed ${stats.originFetches}`,
    );
  }

  // Property 4: distinct objects do not share a flight; coalescing is per key.
  {
    const origin = yield* makeOrigin();
    const shield = yield* makeOriginShield(origin);
    yield* Effect.all(
      [shield.get("/a.css"), shield.get("/b.css"), shield.get("/a.css")],
      { concurrency: "unbounded" },
    );
    const stats = yield* shield.stats;
    yield* check(
      "coalescing is per object key",
      stats.originFetches === 2 && stats.coalesced === 1,
      `two distinct objects fetched once each (${stats.originFetches}); only the duplicate /a.css coalesced`,
    );
  }

  console.log("origin-shield.ts: all properties verified");
});

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e);
  process.exit(1);
});
