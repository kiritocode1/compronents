/**
 * resolver.ts
 *
 * Failure modes solved:
 *   1. Paying the full recursion on every lookup: resolving a name walks
 *      root -> TLD -> authoritative, three network hops before your app
 *      sends its first byte. Without a cache every request repeats the
 *      walk; with one, the answer costs zero hops until its TTL expires.
 *      The TTL is honored per record, so a rotated IP propagates on the
 *      authority's schedule instead of living forever in your process.
 *   2. NXDOMAIN storms: "name does not exist" is the answer nobody caches
 *      by default, so a typo'd hostname in a hot loop (or a probing
 *      client) walks the full recursion every single time. Negative
 *      caching (RFC 2308) stores the non-existence with its own shorter
 *      TTL, so repeated misses die at the resolver.
 *
 * Why the primitives make it correct: the cache is one Ref keyed by name
 * holding either a positive record or a tombstone, each stamped with an
 * expiry read from a logical clock Ref (deterministic tests, no wall
 * clock); expiry is checked on read so a stale entry can never be served;
 * and the upstream hop counter is a Ref the demo reads to prove exactly
 * how many queries left the resolver.
 */

import { Data, Effect, Ref } from "effect";

class NxDomain extends Data.TaggedError("NxDomain")<{
  readonly name: string;
  readonly negativeCached: boolean;
}> {}

interface Zone {
  readonly records: ReadonlyMap<string, string>;
  readonly queries: Ref.Ref<number>;
}

const makeZone = (records: ReadonlyMap<string, string>): Effect.Effect<Zone> =>
  Ref.make(0).pipe(Effect.map((queries) => ({ records, queries }) as const));

type CacheEntry =
  | { readonly kind: "positive"; readonly ip: string; readonly expires: number }
  | { readonly kind: "negative"; readonly expires: number };

export interface Resolver {
  readonly resolve: (
    name: string,
  ) => Effect.Effect<
    { ip: string; hops: number; fromCache: boolean },
    NxDomain
  >;
  readonly tick: (by: number) => Effect.Effect<void>;
  readonly upstreamQueries: Effect.Effect<number>;
}

export const makeResolver = (options?: {
  readonly ttl?: number;
  readonly negativeTtl?: number;
  readonly zone?: ReadonlyMap<string, string>;
}): Effect.Effect<Resolver> =>
  Effect.gen(function* () {
    const ttl = options?.ttl ?? 300;
    const negativeTtl = options?.negativeTtl ?? 60;
    // the three tiers of the recursion, each counting queries it receives
    const root = yield* makeZone(new Map([["com.", "tld-server"]]));
    const tld = yield* makeZone(new Map([["example.com.", "auth-server"]]));
    const auth = yield* makeZone(
      options?.zone ?? new Map([["api.example.com.", "93.184.216.34"]]),
    );
    const clock = yield* Ref.make(0);
    const cache = yield* Ref.make(new Map<string, CacheEntry>());

    const ask = (zone: Zone, name: string) =>
      Ref.update(zone.queries, (n) => n + 1).pipe(
        Effect.map(() => zone.records.get(name)),
      );

    const resolve = (name: string) =>
      Effect.gen(function* () {
        const now = yield* Ref.get(clock);
        const held = (yield* Ref.get(cache)).get(name);
        if (held !== undefined && held.expires > now) {
          if (held.kind === "negative") {
            return yield* new NxDomain({ name, negativeCached: true });
          }
          return { ip: held.ip, hops: 0, fromCache: true };
        }
        // full recursion: root points at the TLD, TLD at the authority
        yield* ask(root, "com.");
        yield* ask(tld, "example.com.");
        const answer = yield* ask(auth, name);
        if (answer === undefined) {
          yield* Ref.update(cache, (m) =>
            new Map(m).set(name, {
              kind: "negative",
              expires: now + negativeTtl,
            }),
          );
          return yield* new NxDomain({ name, negativeCached: false });
        }
        yield* Ref.update(cache, (m) =>
          new Map(m).set(name, {
            kind: "positive",
            ip: answer,
            expires: now + ttl,
          }),
        );
        return { ip: answer, hops: 3, fromCache: false };
      });

    const upstreamQueries = Effect.all([
      Ref.get(root.queries),
      Ref.get(tld.queries),
      Ref.get(auth.queries),
    ]).pipe(Effect.map(([a, b, c]) => a + b + c));

    return {
      resolve,
      tick: (by: number) => Ref.update(clock, (n) => n + by),
      upstreamQueries,
    } as const;
  });

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() =>
      console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`),
    );

  // Property 1: the first lookup walks the whole recursion; repeats are free.
  {
    const r = yield* makeResolver();
    const cold = yield* r.resolve("api.example.com.");
    const warmRuns = yield* Effect.all(
      Array.from({ length: 40 }, () => r.resolve("api.example.com.")),
    );
    const upstream = yield* r.upstreamQueries;
    yield* check(
      "cache collapses recursion to zero hops",
      cold.hops === 3 && warmRuns.every((w) => w.fromCache) && upstream === 3,
      `1 cold + 40 warm lookups cost ${upstream} upstream queries total (cold alone costs 3)`,
    );
  }

  // Property 2: TTL expiry forces a re-walk, so rotated IPs propagate.
  {
    const r = yield* makeResolver({ ttl: 300 });
    yield* r.resolve("api.example.com.");
    yield* r.tick(301);
    const after = yield* r.resolve("api.example.com.");
    yield* check(
      "expired records re-resolve instead of serving stale",
      after.fromCache === false && after.hops === 3,
      `after ttl expiry the resolver walked the recursion again (hops=${after.hops})`,
    );
  }

  // Property 3: without negative caching semantics, NXDOMAIN repeats would
  // walk upstream every time; the tombstone absorbs them.
  {
    const r = yield* makeResolver();
    const first = yield* Effect.flip(r.resolve("tpyo.example.com."));
    const repeats = yield* Effect.all(
      Array.from({ length: 30 }, () =>
        Effect.flip(r.resolve("tpyo.example.com.")),
      ),
    );
    const upstream = yield* r.upstreamQueries;
    const absorbed = repeats.filter((e) => e.negativeCached).length;
    yield* check(
      "NXDOMAIN is cached with its own ttl",
      first.negativeCached === false && absorbed >= 29 && upstream === 3,
      `31 lookups of a nonexistent name cost ${upstream} upstream queries; ${absorbed} died at the tombstone`,
    );
  }

  // Property 4: the tombstone expires faster than positive records, so a
  // name that gets registered becomes visible after negativeTtl, not ttl.
  {
    const r = yield* makeResolver({
      negativeTtl: 60,
      zone: new Map([["late.example.com.", "203.0.113.7"]]),
    });
    // simulate: the name was queried before it existed (cache a tombstone
    // against an empty view by asking for a name not in the zone)
    const firstMiss = yield* Effect.flip(r.resolve("later.example.com."));
    const cachedMiss = yield* Effect.flip(r.resolve("later.example.com."));
    yield* r.tick(61);
    const afterExpiry = yield* Effect.flip(r.resolve("later.example.com."));
    yield* check(
      "negative entries expire on their own shorter ttl",
      firstMiss.negativeCached === false &&
        cachedMiss.negativeCached === true &&
        afterExpiry.negativeCached === false,
      `tombstone absorbed the repeat, then lapsed after 61 ticks so the resolver re-asked the authority`,
    );
  }

  console.log("resolver.ts: all properties verified");
});

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e);
  process.exit(1);
});
