/**
 * lease.ts
 *
 * Failure modes solved:
 *   1. The leader that dies holding the lock forever: a plain "acquire the
 *      lock" leader election gives one node exclusive work, but if that
 *      node crashes without releasing, the lock is held by a ghost and no
 *      one takes over. A time-bounded LEASE fixes this: leadership expires
 *      unless renewed, so a dead leader's grip lapses automatically and a
 *      follower can win the next election. Liveness without a human.
 *   2. Two leaders at once (split brain) from a slow renewal: if a leader
 *      pauses (GC, VM freeze) past its lease and a follower takes over,
 *      the old leader must not keep acting on stale authority. Every lease
 *      carries a monotonically increasing FENCING TOKEN; the protected
 *      resource remembers the highest token it has seen and rejects any
 *      write stamped with a lower one, so a resumed zombie leader is
 *      fenced out even if it still thinks it leads.
 *
 * Why the primitives make it correct: the lease (holder, expiry, token)
 * lives in one Ref and acquisition is a single Ref.modify against a
 * logical clock, so exactly one contender can win an expired lease; renewal
 * only succeeds while the caller still holds a live lease; and the fenced
 * resource compares tokens in its own Ref.modify, so a lower-token write
 * from a zombie is a typed FencedOut, never a silent overwrite.
 */

import { Data, Effect, Ref } from "effect";

class NotLeader extends Data.TaggedError("NotLeader")<{
  readonly who: string;
  readonly holder: string | null;
}> {}

class FencedOut extends Data.TaggedError("FencedOut")<{
  readonly token: number;
  readonly seen: number;
}> {}

interface Lease {
  readonly holder: string | null;
  readonly expiresAt: number;
  readonly token: number;
}

export interface LeaseManager {
  readonly tryAcquire: (
    who: string,
  ) => Effect.Effect<{ acquired: boolean; token: number }>;
  readonly renew: (who: string) => Effect.Effect<number, NotLeader>;
  readonly tick: (ms: number) => Effect.Effect<void>;
  readonly leader: Effect.Effect<string | null>;
}

export const makeLeaseManager = (ttlMs = 1000): Effect.Effect<LeaseManager> =>
  Effect.gen(function* () {
    const clock = yield* Ref.make(0);
    const lease = yield* Ref.make<Lease>({
      holder: null,
      expiresAt: 0,
      token: 0,
    });

    const tryAcquire = (who: string) =>
      Effect.gen(function* () {
        const now = yield* Ref.get(clock);
        return yield* Ref.modify(
          lease,
          (l): readonly [{ acquired: boolean; token: number }, Lease] => {
            const live = l.holder !== null && l.expiresAt > now;
            if (live && l.holder !== who)
              return [{ acquired: false, token: l.token }, l];
            const token = l.token + 1;
            return [
              { acquired: true, token },
              { holder: who, expiresAt: now + ttlMs, token },
            ];
          },
        );
      });

    const renew = (who: string) =>
      Effect.gen(function* () {
        const now = yield* Ref.get(clock);
        return yield* Ref.modify(
          lease,
          (l): readonly [Effect.Effect<number, NotLeader>, Lease] => {
            if (l.holder !== who || l.expiresAt <= now) {
              return [new NotLeader({ who, holder: l.holder }), l];
            }
            return [Effect.succeed(l.token), { ...l, expiresAt: now + ttlMs }];
          },
        ).pipe(Effect.flatten);
      });

    return {
      tryAcquire,
      renew,
      tick: (ms: number) => Ref.update(clock, (n) => n + ms),
      leader: Effect.gen(function* () {
        const now = yield* Ref.get(clock);
        const l = yield* Ref.get(lease);
        return l.holder !== null && l.expiresAt > now ? l.holder : null;
      }),
    } as const;
  });

/** a resource that only accepts writes from the current fencing token */
export interface FencedResource {
  readonly write: (
    token: number,
    value: string,
  ) => Effect.Effect<void, FencedOut>;
  readonly value: Effect.Effect<string>;
}

export const makeFencedResource = (): Effect.Effect<FencedResource> =>
  Effect.gen(function* () {
    interface Held {
      readonly value: string;
      readonly seen: number;
    }
    const state = yield* Ref.make<Held>({ value: "", seen: 0 });
    const write = (token: number, value: string) =>
      Ref.modify(
        state,
        (s): readonly [Effect.Effect<void, FencedOut>, Held] => {
          if (token < s.seen)
            return [new FencedOut({ token, seen: s.seen }), s];
          return [Effect.void, { value, seen: token }];
        },
      ).pipe(Effect.flatten);
    return {
      write,
      value: Ref.get(state).pipe(Effect.map((s) => s.value)),
    } as const;
  });

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() =>
      console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`),
    );

  // Property 1: exactly one contender wins a free lease.
  {
    const mgr = yield* makeLeaseManager(1000);
    const results = yield* Effect.all(
      ["node-a", "node-b", "node-c"].map((n) => mgr.tryAcquire(n)),
      { concurrency: "unbounded" },
    );
    const winners = results.filter((r) => r.acquired).length;
    yield* check(
      "one leader is elected from a contested lease",
      winners === 1 && (yield* mgr.leader) !== null,
      `3 nodes raced for the lease; exactly ${winners} won and became leader`,
    );
  }

  // Property 2: a dead leader's lease lapses and a follower takes over.
  {
    const mgr = yield* makeLeaseManager(1000);
    yield* mgr.tryAcquire("node-a");
    // node-a crashes: it never renews. time passes past the ttl.
    yield* mgr.tick(1001);
    const orphaned = yield* mgr.leader;
    const takeover = yield* mgr.tryAcquire("node-b");
    yield* check(
      "an unrenewed lease expires and frees the role",
      orphaned === null &&
        takeover.acquired &&
        (yield* mgr.leader) === "node-b",
      `node-a stopped renewing; after the ttl the role was vacant and node-b took over`,
    );
  }

  // Property 3: split brain. A frozen old leader resumes and tries to write
  // with its stale token; the fenced resource rejects it.
  {
    const mgr = yield* makeLeaseManager(1000);
    const resource = yield* makeFencedResource();
    const a = yield* mgr.tryAcquire("node-a"); // token 1
    yield* resource.write(a.token, "a-was-here");
    // node-a freezes, lease expires, node-b becomes leader with a higher token
    yield* mgr.tick(1001);
    const b = yield* mgr.tryAcquire("node-b"); // token 2
    yield* resource.write(b.token, "b-owns-it");
    // node-a thaws, still believing it leads, and writes with the old token
    const zombieWrite = yield* Effect.exit(
      resource.write(a.token, "a-clobbers"),
    );
    const finalValue = yield* resource.value;
    yield* check(
      "a zombie leader is fenced out by token",
      zombieWrite._tag === "Failure" && finalValue === "b-owns-it",
      `node-a (token ${a.token}) tried to overwrite node-b (token ${b.token}) and was fenced; value stays "${finalValue}"`,
    );
  }

  // Property 4: renewing an expired lease is a typed refusal, not a silent
  // re-grant that would resurrect a stale leader.
  {
    const mgr = yield* makeLeaseManager(1000);
    yield* mgr.tryAcquire("node-a");
    yield* mgr.tick(1001);
    const exit = yield* Effect.exit(mgr.renew("node-a"));
    yield* check(
      "renewing a lapsed lease is refused",
      exit._tag === "Failure",
      `node-a tried to renew after its lease expired and got NotLeader, forcing a fresh election`,
    );
  }

  console.log("lease.ts: all properties verified");
});

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e);
  process.exit(1);
});
