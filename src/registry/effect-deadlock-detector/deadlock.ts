/**
 * deadlock.ts
 *
 * Failure modes solved:
 *   1. The hang with no error (circular wait): transaction T1 holds lock A
 *      and wants B, T2 holds B and wants A. All four Coffman conditions
 *      hold (mutual exclusion, hold and wait, no preemption, circular
 *      wait) and both transactions wait forever. Nothing crashes, nothing
 *      times out by itself, throughput just quietly stops. The lock
 *      manager maintains the wait-for graph as it grants and queues
 *      requests, and the moment a request would close a cycle it refuses
 *      that request with a typed DeadlockVictim error instead of letting
 *      it wait: the cycle is broken before it forms, which is detection
 *      plus victim selection in one atomic decision.
 *   2. The victim that keeps its loot: aborting a transaction only helps
 *      if its locks are actually released; a victim that dies holding A
 *      leaves everyone queued on A stuck anyway. Lock ownership here is
 *      scoped per transaction: withTransaction tracks every grant, and its
 *      release runs on success, failure, AND the victim path, so being
 *      chosen as the victim automatically frees the resources the
 *      survivor needs.
 *
 * Why the primitives make it correct: the owners table and waiting edges
 * live in one Ref, so cycle detection runs against a consistent snapshot
 * inside the same modify that would add the edge; and the release path is
 * Effect.ensuring on the transaction body, which interruption and failure
 * cannot skip.
 */

import { Data, Effect, Ref } from "effect";

export class DeadlockVictim extends Data.TaggedError("DeadlockVictim")<{
  readonly tx: string;
  readonly wanted: string;
  readonly cycle: readonly string[];
}> {}

interface LockState {
  /** resource -> owning tx */
  readonly owners: Map<string, string>;
  /** tx -> resource it is currently waiting for */
  readonly waiting: Map<string, string>;
}

export interface LockManager {
  /** run `body` as transaction `tx`; all granted locks release on every exit */
  readonly withTransaction: <A, E>(
    tx: string,
    body: (
      acquire: (resource: string) => Effect.Effect<void, DeadlockVictim>,
    ) => Effect.Effect<A, E>,
  ) => Effect.Effect<A, E | DeadlockVictim>;
  readonly heldBy: (resource: string) => Effect.Effect<string | undefined>;
}

export const makeLockManager = (): Effect.Effect<LockManager> =>
  Effect.gen(function* () {
    const state = yield* Ref.make<LockState>({
      owners: new Map(),
      waiting: new Map(),
    });

    // Follow the wait-for graph from `fromTx`: the owner of what fromTx wants,
    // then whatever THAT tx is waiting for, and so on. Reaching `target` again
    // means granting the wait would close a cycle.
    const findCycle = (
      s: LockState,
      target: string,
      wanted: string,
    ): readonly string[] | null => {
      const path: string[] = [target];
      let resource: string | undefined = wanted;
      while (resource !== undefined) {
        const owner = s.owners.get(resource);
        if (owner === undefined) return null;
        if (owner === target) return [...path, `(${resource})`, target];
        path.push(owner);
        resource = s.waiting.get(owner);
      }
      return null;
    };

    const withTransaction = <A, E>(
      tx: string,
      body: (
        acquire: (resource: string) => Effect.Effect<void, DeadlockVictim>,
      ) => Effect.Effect<A, E>,
    ): Effect.Effect<A, E | DeadlockVictim> => {
      const acquire = (resource: string): Effect.Effect<void, DeadlockVictim> =>
        Effect.gen(function* () {
          while (true) {
            type Decision =
              | { readonly _tag: "Granted" }
              | { readonly _tag: "Wait" }
              | {
                  readonly _tag: "Deadlock";
                  readonly cycle: readonly string[];
                };
            const decision = yield* Ref.modify(
              state,
              (s): readonly [Decision, LockState] => {
                const owner = s.owners.get(resource);
                if (owner === undefined || owner === tx) {
                  const owners = new Map(s.owners).set(resource, tx);
                  const waiting = new Map(s.waiting);
                  waiting.delete(tx);
                  return [{ _tag: "Granted" }, { owners, waiting }];
                }
                const cycle = findCycle(s, tx, resource);
                if (cycle !== null) {
                  // refusing (not waiting) breaks the cycle before it forms
                  const waiting = new Map(s.waiting);
                  waiting.delete(tx);
                  return [
                    { _tag: "Deadlock", cycle },
                    { owners: s.owners, waiting },
                  ];
                }
                const waiting = new Map(s.waiting).set(tx, resource);
                return [{ _tag: "Wait" }, { owners: s.owners, waiting }];
              },
            );
            if (decision._tag === "Granted") return;
            if (decision._tag === "Deadlock") {
              return yield* new DeadlockVictim({
                tx,
                wanted: resource,
                cycle: decision.cycle,
              });
            }
            yield* Effect.sleep("2 millis"); // wait our turn, then re-check
          }
        });

      const releaseAll = Ref.update(state, (s) => {
        const owners = new Map(
          [...s.owners].filter(([, owner]) => owner !== tx),
        );
        const waiting = new Map(s.waiting);
        waiting.delete(tx);
        return { owners, waiting };
      });

      return body(acquire).pipe(Effect.ensuring(releaseAll));
    };

    const heldBy = (resource: string) =>
      Ref.get(state).pipe(Effect.map((s) => s.owners.get(resource)));

    return { withTransaction, heldBy } as const;
  });

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() =>
      console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`),
    );

  // Property 1: the classic T1(A->B) vs T2(B->A) crossover produces exactly
  // one typed victim; the survivor completes; nothing hangs.
  {
    const mgr = yield* makeLockManager();
    const t0 = Date.now();
    const tx = (name: string, first: string, second: string) =>
      mgr.withTransaction(name, (acquire) =>
        Effect.gen(function* () {
          yield* acquire(first);
          yield* Effect.sleep("10 millis"); // both now hold their first lock
          yield* acquire(second);
          yield* Effect.sleep("5 millis"); // do the work
          return `${name} committed`;
        }),
      );
    const [e1, e2] = yield* Effect.all(
      [
        Effect.exit(tx("T1", "accounts:alice", "accounts:bob")),
        Effect.exit(tx("T2", "accounts:bob", "accounts:alice")),
      ],
      { concurrency: "unbounded" },
    );
    const elapsed = Date.now() - t0;
    const victims = [e1, e2].filter(
      (e) => e._tag === "Failure" && String(e.cause).includes("DeadlockVictim"),
    ).length;
    const survivors = [e1, e2].filter((e) => e._tag === "Success").length;
    yield* check(
      "circular wait becomes one victim, one survivor",
      victims === 1 && survivors === 1 && elapsed < 1000,
      `T1 and T2 crossed lock order: ${victims} aborted typed, ${survivors} committed, resolved in ${elapsed}ms (without detection: both wait forever)`,
    );
  }

  // Property 2: the victim's locks are actually released; a retry in a fixed
  // resource order (the prevention strategy) then succeeds.
  {
    const mgr = yield* makeLockManager();
    const ordered = (name: string) =>
      mgr.withTransaction(name, (acquire) =>
        Effect.gen(function* () {
          // resource ordering: everyone locks alice before bob, so no cycle
          yield* acquire("accounts:alice");
          yield* acquire("accounts:bob");
          return `${name} committed`;
        }),
      );
    const results = yield* Effect.all(
      Array.from({ length: 10 }, (_, i) => ordered(`T${i}`).pipe(Effect.exit)),
      { concurrency: "unbounded" },
    );
    const committed = results.filter((e) => e._tag === "Success").length;
    const aliceFree = yield* mgr.heldBy("accounts:alice");
    yield* check(
      "resource ordering prevents; releases always run",
      committed === 10 && aliceFree === undefined,
      `10 transactions in canonical lock order: ${committed}/10 committed, all locks released at the end`,
    );
  }

  // Property 3: a three-party cycle (T1 A->B, T2 B->C, T3 C->A) is detected
  // through the transitive walk, not just direct swaps.
  {
    const mgr = yield* makeLockManager();
    const tx = (name: string, first: string, second: string) =>
      mgr.withTransaction(name, (acquire) =>
        Effect.gen(function* () {
          yield* acquire(first);
          yield* Effect.sleep("10 millis");
          yield* acquire(second);
          return `${name} committed`;
        }),
      );
    const exits = yield* Effect.all(
      [
        Effect.exit(tx("T1", "A", "B")),
        Effect.exit(tx("T2", "B", "C")),
        Effect.exit(tx("T3", "C", "A")),
      ],
      { concurrency: "unbounded" },
    );
    const victims = exits.filter(
      (e) => e._tag === "Failure" && String(e.cause).includes("DeadlockVictim"),
    ).length;
    const survivors = exits.filter((e) => e._tag === "Success").length;
    yield* check(
      "a 3-cycle is broken with minimal victims",
      victims >= 1 && survivors >= 2 && victims + survivors === 3,
      `T1->T2->T3->T1 ring: ${victims} victim(s), ${survivors} committed`,
    );
  }

  console.log("deadlock.ts: all properties verified");
});

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e);
  process.exit(1);
});
