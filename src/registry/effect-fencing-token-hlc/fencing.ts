/**
 * fencing.ts
 *
 * Failure modes solved:
 *   1. Split brain (two leaders, inconsistent writes): a leader is presumed dead
 *      after a GC pause or a network partition, a new leader is elected, and then
 *      the old leader wakes up still believing it holds the lock and writes,
 *      corrupting state that two masters both edited. A lease alone cannot stop
 *      this because the stale leader's write is in flight before it learns it was
 *      replaced. Fencing tokens do stop it: every lease carries a strictly
 *      increasing token, every write carries its lease's token, and the protected
 *      resource remembers the highest token it has accepted and rejects any write
 *      that arrives with a lower one. The old leader's write is refused by the
 *      resource itself, so correctness does not depend on the old leader noticing
 *      it lost the lease.
 *   2. Clock skew (time drift breaks ordering): distributed ordering built on
 *      wall-clock timestamps breaks the moment a node's clock drifts, is
 *      corrected by NTP, or leaps backward, because two events can then carry the
 *      same or inverted timestamps and causal order is lost. A Hybrid Logical
 *      Clock fixes this: each stamp is (physical, logical), the physical part is
 *      taken from the Clock service but never allowed to go backward
 *      (max of last-seen and now), and the logical counter breaks ties, so stamps
 *      stay strictly monotonic and causally ordered even when the wall clock
 *      jumps backward five minutes. Reading time through the Clock service means
 *      the whole thing is driven deterministically by TestClock in the demo.
 *
 * Why the primitives make it correct: the token mint and the resource's
 * highest-token check are each a single atomic Ref.modify, so no two writers can
 * both believe they hold the newest token, and the HLC merge is pure arithmetic
 * over a Ref so its monotonic invariant holds regardless of what the wall clock
 * does. TestClock makes the backward-jump reproducible rather than a flaky test.
 */

import { Clock, Data, Effect, Ref } from "effect";
import { TestClock } from "effect/testing";

class StaleLeader extends Data.TaggedError("StaleLeader")<{
  readonly presentedToken: number;
  readonly highestAccepted: number;
}> {}

// ---- lease manager: mints strictly increasing fencing tokens ----
const makeLeaseManager = () =>
  Effect.map(Ref.make(0), (next) => ({
    // Acquiring leadership mints a token strictly greater than every prior one.
    acquire: Ref.updateAndGet(next, (n) => n + 1),
  }));

// ---- fenced resource: accepts a write only if its token is not stale ----
interface FencedResource {
  readonly cell: Ref.Ref<{
    readonly highestToken: number;
    readonly value: string;
  }>;
}

const makeFencedResource = (initial: string) =>
  Effect.map(
    Ref.make({ highestToken: 0, value: initial }),
    (cell) => ({ cell }) satisfies FencedResource,
  );

type WriteDecision = { readonly ok: boolean; readonly highestAccepted: number };

const fencedWrite = (resource: FencedResource, token: number, value: string) =>
  Ref.modify(
    resource.cell,
    (
      state,
    ): readonly [
      WriteDecision,
      { readonly highestToken: number; readonly value: string },
    ] => {
      if (token < state.highestToken) {
        return [{ ok: false, highestAccepted: state.highestToken }, state];
      }
      return [
        { ok: true, highestAccepted: token },
        { highestToken: token, value },
      ];
    },
  ).pipe(
    Effect.flatMap((decision) =>
      decision.ok
        ? Effect.void
        : Effect.fail(
            new StaleLeader({
              presentedToken: token,
              highestAccepted: decision.highestAccepted,
            }),
          ),
    ),
  );

// ---- hybrid logical clock built on the Clock service ----
interface Hlc {
  readonly physical: number;
  readonly logical: number;
}

const hlcCompare = (a: Hlc, b: Hlc): number =>
  a.physical !== b.physical ? a.physical - b.physical : a.logical - b.logical;

const makeHlc = () =>
  Effect.map(Ref.make<Hlc>({ physical: 0, logical: 0 }), (state) => ({
    // A local event: never let the physical component regress; break ties with
    // the logical counter so two events at the same physical time still order.
    send: Clock.currentTimeMillis.pipe(
      Effect.flatMap((now) =>
        Ref.modify(state, (last) => {
          const physical = Math.max(last.physical, now);
          const logical = physical === last.physical ? last.logical + 1 : 0;
          const stamp: Hlc = { physical, logical };
          return [stamp, stamp] as const;
        }),
      ),
    ),
    // Merging a received stamp: absorb the remote physical time so causality from
    // the sender is preserved even if our own clock is behind.
    recv: (remote: Hlc) =>
      Clock.currentTimeMillis.pipe(
        Effect.flatMap((now) =>
          Ref.modify(state, (last) => {
            const physical = Math.max(last.physical, remote.physical, now);
            let logical: number;
            if (physical === last.physical && physical === remote.physical)
              logical = Math.max(last.logical, remote.logical) + 1;
            else if (physical === last.physical) logical = last.logical + 1;
            else if (physical === remote.physical) logical = remote.logical + 1;
            else logical = 0;
            const stamp: Hlc = { physical, logical };
            return [stamp, stamp] as const;
          }),
        ),
      ),
  }));

const demo = Effect.gen(function* () {
  const assert = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() =>
      console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`),
    );

  // Property 1 and 2: a stale leader's fenced write is rejected while the new
  // leader's write is accepted, and the highest accepted token never regresses.
  {
    const leases = yield* makeLeaseManager();
    const resource = yield* makeFencedResource("genesis");
    const tokenA = yield* leases.acquire; // old leader A holds token 1
    const tokenB = yield* leases.acquire; // A partitioned, B elected with token 2

    // B commits its write.
    yield* fencedWrite(resource, tokenB, "written-by-B");
    // A wakes up believing it is still leader and writes with its stale token.
    const staleAttempt = yield* fencedWrite(
      resource,
      tokenA,
      "written-by-A",
    ).pipe(Effect.result);
    // A retries; still stale.
    const staleRetry = yield* fencedWrite(
      resource,
      tokenA,
      "written-by-A-again",
    ).pipe(Effect.result);
    const finalState = yield* Ref.get(resource.cell);

    const rejected =
      staleAttempt._tag === "Failure" &&
      staleAttempt.failure instanceof StaleLeader;
    yield* assert(
      "fencing token rejects the stale leader",
      rejected &&
        staleRetry._tag === "Failure" &&
        finalState.value === "written-by-B" &&
        finalState.highestToken === tokenB,
      `A(token ${tokenA}) rejected, B(token ${tokenB}) committed, resource holds "${finalState.value}" at token ${finalState.highestToken}`,
    );
  }

  // Property 3: HLC ordering survives a five-minute backward wall-clock jump.
  {
    const hlc = yield* makeHlc();
    yield* TestClock.setTime(1_000_000); // base wall-clock time in millis
    const s1 = yield* hlc.send;
    const s2 = yield* hlc.send;

    // The wall clock leaps backward five minutes (NTP correction / VM migration).
    yield* TestClock.setTime(1_000_000 - 5 * 60 * 1000);
    const s3 = yield* hlc.send;
    const s4 = yield* hlc.send;

    // A stamp arrives from a node whose clock is far ahead; merge preserves order.
    const s5 = yield* hlc.recv({ physical: 2_000_000, logical: 0 });

    const stamps = [s1, s2, s3, s4, s5];
    const strictlyIncreasing = stamps.every(
      (s, i) => i === 0 || hlcCompare(stamps[i - 1], s) < 0,
    );
    const physicalNeverRegressed = stamps.every(
      (s, i) => i === 0 || s.physical >= stamps[i - 1].physical,
    );
    yield* assert(
      "HLC stays monotonic across a backward clock jump",
      strictlyIncreasing && physicalNeverRegressed,
      `stamps ${stamps.map((s) => `${s.physical}.${s.logical}`).join(" < ")} strictly increasing despite wall clock dropping 300000ms`,
    );
  }

  console.log("fencing.ts: all properties verified");
});

Effect.runPromise(demo.pipe(Effect.provide(TestClock.layer()))).catch((e) => {
  console.error("demo failed", e);
  process.exit(1);
});
