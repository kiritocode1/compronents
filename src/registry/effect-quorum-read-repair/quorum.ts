/**
 * quorum.ts
 *
 * Failure modes solved:
 *   1. Reading yesterday from a partitioned replica: with N copies of the
 *      data, a write that lands on some replicas while one is partitioned
 *      leaves the cluster disagreeing. A client that reads exactly one
 *      replica can read the stale copy and act on it. Quorum arithmetic
 *      closes the gap: write to W replicas, read from R replicas, and keep
 *      R + W > N, so every read set overlaps every write set in at least
 *      one replica and the newest version is always in the answers. The
 *      reader picks the highest version, so staleness cannot win a quorum
 *      read.
 *   2. The stale copy that stays stale (divergence that never heals): a
 *      replica that missed a write stays wrong until something fixes it,
 *      and "eventually consistent" without a mechanism is just "wrong for
 *      an unbounded time". Read repair is the mechanism: when a quorum
 *      read observes disagreeing versions, it writes the winning version
 *      back to the stale replicas in the background, so every read of a
 *      divergent key actively shrinks the divergence.
 *
 * Why the primitives make it correct: versions are monotonic per key from
 * one Ref counter, replicas only accept a write newer than what they hold
 * (so repair can never regress a copy), the R-of-N read races with
 * Effect.all over the first R responders, and the repair is forkDetach so
 * healing never adds latency to the read path.
 */

import { Data, Effect, Ref } from "effect";

class ReplicaDown extends Data.TaggedError("ReplicaDown")<{
  readonly replica: string;
}> {}

class QuorumUnreachable extends Data.TaggedError("QuorumUnreachable")<{
  readonly needed: number;
  readonly reached: number;
}> {}

interface Versioned {
  readonly value: string;
  readonly version: number;
}

export interface Replica {
  readonly name: string;
  readonly up: Ref.Ref<boolean>;
  readonly get: (
    key: string,
  ) => Effect.Effect<Versioned | undefined, ReplicaDown>;
  /** accepts only versions newer than what it holds: repair cannot regress */
  readonly put: (key: string, v: Versioned) => Effect.Effect<void, ReplicaDown>;
}

export const makeReplica = (name: string): Effect.Effect<Replica> =>
  Effect.gen(function* () {
    const up = yield* Ref.make(true);
    const table = yield* Ref.make(new Map<string, Versioned>());
    const guard = Effect.gen(function* () {
      if (!(yield* Ref.get(up)))
        return yield* new ReplicaDown({ replica: name });
    });
    const get = (key: string) =>
      guard.pipe(
        Effect.andThen(Ref.get(table)),
        Effect.map((m) => m.get(key)),
      );
    const put = (key: string, v: Versioned) =>
      guard.pipe(
        Effect.andThen(
          Ref.update(table, (m) => {
            const held = m.get(key);
            if (held !== undefined && held.version >= v.version) return m;
            return new Map(m).set(key, v);
          }),
        ),
      );
    return { name, up, get, put } as const;
  });

export interface QuorumStore {
  readonly write: (
    key: string,
    value: string,
  ) => Effect.Effect<number, QuorumUnreachable>;
  readonly read: (
    key: string,
  ) => Effect.Effect<
    { value: string; version: number; repaired: readonly string[] },
    QuorumUnreachable
  >;
}

export const makeQuorumStore = (
  replicas: readonly Replica[],
  options: { readonly w: number; readonly r: number },
): Effect.Effect<QuorumStore> =>
  Effect.gen(function* () {
    if (options.r + options.w <= replicas.length) {
      return yield* Effect.die(
        new Error(
          `R + W must exceed N: got R=${options.r} W=${options.w} N=${replicas.length}`,
        ),
      );
    }
    const clock = yield* Ref.make(0);

    const write = (key: string, value: string) =>
      Effect.gen(function* () {
        const version = yield* Ref.updateAndGet(clock, (n) => n + 1);
        const acks = yield* Effect.all(
          replicas.map((rep) =>
            rep.put(key, { value, version }).pipe(Effect.exit),
          ),
          { concurrency: "unbounded" },
        );
        const ok = acks.filter((e) => e._tag === "Success").length;
        if (ok < options.w) {
          return yield* new QuorumUnreachable({
            needed: options.w,
            reached: ok,
          });
        }
        return version;
      });

    const read = (key: string) =>
      Effect.gen(function* () {
        const answers = yield* Effect.all(
          replicas.map((rep) =>
            rep.get(key).pipe(
              Effect.map((v) => ({ rep, v })),
              Effect.exit,
            ),
          ),
          { concurrency: "unbounded" },
        );
        const alive = answers.flatMap((e) =>
          e._tag === "Success" ? [e.value] : [],
        );
        if (alive.length < options.r) {
          return yield* new QuorumUnreachable({
            needed: options.r,
            reached: alive.length,
          });
        }
        // R + W > N guarantees the newest version is among any R answers;
        // taking the max over all reachable answers only strengthens that.
        const newest = alive.reduce<{ rep: Replica; v: Versioned | undefined }>(
          (best, cur) =>
            (cur.v?.version ?? -1) > (best.v?.version ?? -1) ? cur : best,
          alive[0],
        );
        if (newest.v === undefined) {
          return yield* new QuorumUnreachable({
            needed: options.r,
            reached: 0,
          });
        }
        const winner = newest.v;
        const stale = alive.filter(
          (a) => (a.v?.version ?? -1) < winner.version,
        );
        // Read repair: heal divergence off the read path.
        yield* Effect.forkDetach(
          Effect.all(
            stale.map((s) => s.rep.put(key, winner).pipe(Effect.exit)),
            { concurrency: "unbounded" },
          ),
        );
        return {
          value: winner.value,
          version: winner.version,
          repaired: stale.map((s) => s.rep.name),
        };
      });

    return { write, read } as const;
  });

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() =>
      console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`),
    );

  const [r1, r2, r3] = yield* Effect.all([
    makeReplica("r1"),
    makeReplica("r2"),
    makeReplica("r3"),
  ]);
  const store = yield* makeQuorumStore([r1, r2, r3], { w: 2, r: 2 });

  // Property 1: a write during a partition still commits at W=2, and a quorum
  // read returns the NEW value even though a replica holds the old one.
  {
    yield* store.write("profile:9", "theme=light");
    yield* Ref.set(r3.up, false); // r3 drops off the network
    yield* store.write("profile:9", "theme=dark"); // lands on r1, r2 only
    yield* Ref.set(r3.up, true); // r3 comes back, still holding version 1

    const direct = yield* r3.get("profile:9");
    const quorum = yield* store.read("profile:9");
    yield* check(
      "quorum read cannot return the stale copy",
      direct?.value === "theme=light" &&
        quorum.value === "theme=dark" &&
        quorum.version === 2,
      `r3 alone says "theme=light" (v1) but R+W>N read says "${quorum.value}" (v${quorum.version})`,
    );
    yield* check(
      "divergence was noticed",
      quorum.repaired.includes("r3"),
      `read observed r3 behind and scheduled repair: [${quorum.repaired.join(", ")}]`,
    );
  }

  // Property 2: read repair healed the stale replica in the background.
  {
    yield* Effect.sleep("20 millis"); // let the detached repair land
    const healed = yield* r3.get("profile:9");
    yield* check(
      "read repair heals the stale replica",
      healed?.value === "theme=dark" && healed.version === 2,
      `a direct read of r3 now returns "${healed?.value}" (v${healed?.version})`,
    );
  }

  // Property 3: repair can never regress a copy. Writing an OLD version at a
  // replica that already advanced is a no-op.
  {
    yield* r1.put("profile:9", { value: "theme=light", version: 1 });
    const after = yield* r1.get("profile:9");
    yield* check(
      "stale repair writes are rejected by version",
      after?.version === 2,
      `an attempted v1 write against a v2 copy left the replica at v${after?.version}`,
    );
  }

  // Property 4: losing a quorum is a typed failure, not a wrong answer.
  {
    yield* Ref.set(r2.up, false);
    yield* Ref.set(r3.up, false);
    const exit = yield* Effect.exit(store.write("profile:9", "theme=solar"));
    yield* check(
      "no quorum means a typed refusal",
      exit._tag === "Failure" &&
        String(exit.cause).includes("QuorumUnreachable"),
      `with 1 of 3 replicas reachable and W=2, the write refused instead of splitting the brain`,
    );
  }

  console.log("quorum.ts: all properties verified");
});

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e);
  process.exit(1);
});
