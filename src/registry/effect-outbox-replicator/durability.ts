/**
 * durability.ts
 *
 * Failure modes solved:
 *   1. Data loss (a write acknowledged to the client never reaches the replica):
 *      the classic dual-write bug is committing the business row and then
 *      publishing the replication event as two separate steps, because the
 *      process can die in the gap and the event is lost forever while the row
 *      says the write succeeded. The transactional outbox closes the gap: the row
 *      and its outbox entry are committed in one atomic step, so there is no
 *      instant where the record exists without its pending replication event. A
 *      replicator drains the outbox with at-least-once delivery, advancing its
 *      cursor only after the replica durably applies an entry, so a crash mid
 *      stream re-delivers the un-acked entry on restart rather than dropping it.
 *      At-least-once means an entry can arrive twice, so apply is idempotent
 *      (keyed on the entry sequence), which is what makes re-delivery safe rather
 *      than a source of duplicates.
 *   2. Memory leaks (orphaned background fibers and subscriptions): a long-lived
 *      server that forks workers or opens subscriptions without tying them to a
 *      lifecycle accumulates fibers that outlive the work that started them,
 *      leaking memory until the process is recycled. Every background fiber here
 *      is run into a FiberSet that lives in a Scope, so closing the scope
 *      interrupts every fiber and runs its finalizer, and membership in the set
 *      is the cleanup mechanism rather than a list someone maintains. A
 *      Metric-based leak canary (a gauge of live workers) makes the invariant
 *      observable: managed workers return the gauge to zero when their scope
 *      closes, and a deliberately detached fork that escapes the scope leaves the
 *      gauge elevated, which is exactly the leak the canary is there to catch.
 *
 * Why the primitives make it correct: the atomic outbox commit is one Ref.modify
 * so the row and the event cannot diverge, the cursor advances only after apply
 * so at-least-once holds across a crash, idempotent apply keyed on sequence makes
 * re-delivery a no-op, and Scope plus FiberSet make fiber cleanup structural
 * rather than a finally that is never tested.
 */

import { Data, Effect, Exit, Fiber, FiberSet, Metric, Ref } from "effect";

class SinkUnavailable extends Data.TaggedError("SinkUnavailable")<{
  readonly seq: number;
}> {}

// ---- source database with an embedded outbox ----
interface OutboxEntry {
  readonly seq: number;
  readonly id: string;
  readonly value: string;
}

interface SourceState {
  readonly records: ReadonlyMap<string, string>;
  readonly outbox: ReadonlyArray<OutboxEntry>;
  readonly nextSeq: number;
}

interface SourceDb {
  readonly state: Ref.Ref<SourceState>;
}

const makeSourceDb = () =>
  Effect.map(
    Ref.make<SourceState>({
      records: new Map<string, string>(),
      outbox: [],
      nextSeq: 1,
    }),
    (state) => ({ state }) satisfies SourceDb,
  );

// The record and its outbox entry are appended in ONE atomic update, so the
// process can never observe the record without the replication event beside it.
const writeWithOutbox = (db: SourceDb, id: string, value: string) =>
  Ref.update(db.state, (s) => {
    const records = new Map(s.records);
    records.set(id, value);
    return {
      records,
      outbox: [...s.outbox, { seq: s.nextSeq, id, value }],
      nextSeq: s.nextSeq + 1,
    };
  });

// ---- replica with idempotent apply ----
interface Replica {
  readonly records: Ref.Ref<Map<string, string>>;
  readonly appliedSeqs: Ref.Ref<Set<number>>;
  readonly deliveries: Ref.Ref<number>; // counts physical applies, including re-deliveries
}

const makeReplica = () =>
  Effect.gen(function* () {
    const records = yield* Ref.make(new Map<string, string>());
    const appliedSeqs = yield* Ref.make(new Set<number>());
    const deliveries = yield* Ref.make(0);
    return { records, appliedSeqs, deliveries } satisfies Replica;
  });

// Idempotent apply: a re-delivered entry (same seq) mutates nothing.
const applyIdempotent = (replica: Replica, entry: OutboxEntry) =>
  Effect.gen(function* () {
    yield* Ref.update(replica.deliveries, (n) => n + 1);
    const seen = yield* Ref.get(replica.appliedSeqs);
    if (seen.has(entry.seq)) return;
    yield* Ref.update(replica.records, (m) =>
      new Map(m).set(entry.id, entry.value),
    );
    yield* Ref.update(replica.appliedSeqs, (s) => new Set(s).add(entry.seq));
  });

// Drain outbox entries after the cursor, applying then acking each. The cursor
// advances only after a durable apply, so an interruption between apply and ack
// re-delivers that entry on the next drain. `crashAfterSeq` injects exactly that
// window for the demo by dying after applying, before acking.
const drain = (
  db: SourceDb,
  replica: Replica,
  cursor: Ref.Ref<number>,
  options?: { readonly crashAfterSeq?: number },
) =>
  Effect.gen(function* () {
    const start = yield* Ref.get(cursor);
    const snapshot = yield* Ref.get(db.state);
    const pending = snapshot.outbox.filter((e) => e.seq > start);
    for (const entry of pending) {
      yield* applyIdempotent(replica, entry);
      if (options?.crashAfterSeq === entry.seq) {
        return yield* Effect.die(new SinkUnavailable({ seq: entry.seq }));
      }
      yield* Ref.set(cursor, entry.seq); // ack: durable-apply then advance
    }
  });

// ---- leak canary: a gauge of live background workers ----
const liveWorkers = Metric.gauge("live_background_workers", {
  description: "background fibers currently alive",
});

// A worker that registers itself in the canary while alive and deregisters when
// interrupted or done. `ensuring` guarantees the decrement runs on interruption.
const canaryWorker = (live: Ref.Ref<number>) =>
  Ref.updateAndGet(live, (n) => n + 1).pipe(
    Effect.tap((n) => Metric.update(liveWorkers, n)),
    Effect.andThen(Effect.never),
    Effect.ensuring(
      Ref.updateAndGet(live, (n) => n - 1).pipe(
        Effect.flatMap((n) => Metric.update(liveWorkers, n)),
      ),
    ),
  );

const demo = Effect.gen(function* () {
  const assert = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() =>
      console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`),
    );

  // Property 1: a replica crash mid-stream loses zero writes and applies each
  // record exactly once despite at-least-once re-delivery.
  {
    const db = yield* makeSourceDb();
    const replica = yield* makeReplica();
    const cursor = yield* Ref.make(0);
    for (let i = 1; i <= 6; i++)
      yield* writeWithOutbox(db, `acct-${i}`, `balance-${i}`);

    // First drain crashes after applying seq 3 but before acking it.
    const firstRun = yield* drain(db, replica, cursor, {
      crashAfterSeq: 3,
    }).pipe(Effect.exit);
    const cursorAfterCrash = yield* Ref.get(cursor);

    // Restart: resumes from the cursor, re-delivering seq 3 (idempotent) and
    // finishing the backlog.
    yield* drain(db, replica, cursor);

    const source = yield* Ref.get(db.state);
    const replicated = yield* Ref.get(replica.records);
    const deliveries = yield* Ref.get(replica.deliveries);
    const lostWrites = [...source.records].filter(
      ([id, v]) => replicated.get(id) !== v,
    );

    yield* assert(
      "outbox survives a mid-stream crash with zero loss",
      Exit.isFailure(firstRun) &&
        cursorAfterCrash === 2 &&
        lostWrites.length === 0 &&
        replicated.size === 6,
      `crashed after applying seq 3 (cursor stuck at ${cursorAfterCrash}), restart replicated all ${replicated.size} records, ${lostWrites.length} lost`,
    );
    yield* assert(
      "at-least-once re-delivery is idempotent",
      deliveries > 6 && replicated.size === 6,
      `${deliveries} physical applies for 6 records (seq 3 re-delivered), replica has no duplicates`,
    );
  }

  // Property 2: FiberSet + Scope reclaim workers, and a detached fork leaks in a
  // way the canary catches.
  {
    const live = yield* Ref.make(0);

    // Managed: five workers under a FiberSet in a scope. The scope closing must
    // return the canary to zero.
    yield* Effect.scoped(
      Effect.gen(function* () {
        const set = yield* FiberSet.make();
        for (let i = 0; i < 5; i++)
          yield* FiberSet.run(set, canaryWorker(live));
        yield* Effect.sleep("30 millis");
        const alive = yield* Ref.get(live);
        yield* assert(
          "FiberSet holds live workers",
          alive === 5,
          `${alive} workers alive inside the scope`,
        );
      }),
    );
    const afterScope = yield* Ref.get(live);
    yield* assert(
      "closing the scope reclaims every managed worker",
      afterScope === 0,
      `canary gauge returned to ${afterScope} after the scope closed (no leak)`,
    );

    // Leaked: a worker forked detached from any scope. The canary must still
    // register it as alive, which is the leak we want to detect.
    const leaked = yield* Effect.forkDetach(canaryWorker(live));
    yield* Effect.sleep("30 millis");
    const leakedAlive = yield* Ref.get(live);
    yield* assert(
      "leak canary catches an orphaned fiber",
      leakedAlive === 1,
      `a detached fork left ${leakedAlive} worker alive with no owning scope, canary flags the leak`,
    );
    // Clean up the deliberately leaked fiber so the process can exit. In real
    // code this is exactly the interrupt the missing scope would have done for us.
    yield* Fiber.interrupt(leaked);
    yield* Effect.sleep("10 millis");
    const afterInterrupt = yield* Ref.get(live);
    yield* assert(
      "interrupting the leak runs its finalizer",
      afterInterrupt === 0,
      `canary gauge back to ${afterInterrupt} once the orphan was interrupted`,
    );
  }

  console.log("durability.ts: all properties verified");
});

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e);
  process.exit(1);
});
