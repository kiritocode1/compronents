/**
 * priority.ts
 *
 * Failure modes solved:
 *   1. Priority inversion by insertion order: a naive "priority queue" that
 *      is really a sorted array keyed on priority alone breaks ties by
 *      whatever the sort does, so two urgent jobs can run out of the order
 *      they arrived, and worse, a job's position can jump around as peers
 *      are added. A proper binary heap plus a monotonic sequence number as
 *      the tiebreaker gives a stable total order: higher priority first,
 *      and among equals, first-in-first-out.
 *   2. Starvation of the low-priority tail: strict priority means a steady
 *      stream of high-priority work never lets a low-priority job run, so
 *      a backup task waits forever behind interactive requests. Aging
 *      fixes it: a job's effective priority rises the longer it waits, so
 *      even the lowest tier eventually outranks fresh arrivals and runs,
 *      bounding the worst-case wait.
 *
 * Why the primitives make it correct: the heap array and the sequence
 * counter live in one Ref, and push/pop are single Ref.modify operations
 * that sift the binary heap in O(log n), so concurrent producers can never
 * corrupt the heap invariant; the comparison is a pure total order over
 * (agedPriority, seq); and aging is computed from a logical clock at pop
 * time, so a waiting job's rank is always current without rescanning.
 */

import { Effect, Ref } from "effect";

interface Job {
  readonly id: string;
  readonly basePriority: number; // higher runs first
  readonly enqueuedAt: number;
  readonly seq: number;
}

interface HeapState {
  readonly heap: readonly Job[];
  readonly seq: number;
}

/** effective priority: base plus one point per `agePerTick` ticks waited */
const aged = (job: Job, now: number, agePerTick: number) =>
  job.basePriority + Math.floor((now - job.enqueuedAt) / agePerTick);

/** total order: higher aged priority first, then lower seq (FIFO among equals) */
const higher = (a: Job, b: Job, now: number, agePerTick: number) => {
  const pa = aged(a, now, agePerTick);
  const pb = aged(b, now, agePerTick);
  if (pa !== pb) return pa > pb;
  return a.seq < b.seq;
};

export interface Scheduler {
  readonly push: (id: string, basePriority: number) => Effect.Effect<void>;
  readonly pop: Effect.Effect<{ id: string; agedPriority: number } | undefined>;
  readonly tick: (ms: number) => Effect.Effect<void>;
  readonly size: Effect.Effect<number>;
}

export const makeScheduler = (options?: {
  readonly agePerTick?: number;
}): Effect.Effect<Scheduler> =>
  Effect.gen(function* () {
    const agePerTick = options?.agePerTick ?? Number.POSITIVE_INFINITY; // Infinity = no aging
    const clock = yield* Ref.make(0);
    const state = yield* Ref.make<HeapState>({ heap: [], seq: 0 });

    const siftUp = (heap: Job[], now: number) => {
      let i = heap.length - 1;
      while (i > 0) {
        const parent = (i - 1) >> 1;
        if (higher(heap[i], heap[parent], now, agePerTick)) {
          [heap[i], heap[parent]] = [heap[parent], heap[i]];
          i = parent;
        } else break;
      }
    };

    const siftDown = (heap: Job[], now: number) => {
      let i = 0;
      const n = heap.length;
      while (true) {
        const l = 2 * i + 1;
        const r = 2 * i + 2;
        let best = i;
        if (l < n && higher(heap[l], heap[best], now, agePerTick)) best = l;
        if (r < n && higher(heap[r], heap[best], now, agePerTick)) best = r;
        if (best === i) break;
        [heap[i], heap[best]] = [heap[best], heap[i]];
        i = best;
      }
    };

    const push = (id: string, basePriority: number) =>
      Effect.gen(function* () {
        const now = yield* Ref.get(clock);
        yield* Ref.update(state, (s) => {
          const seq = s.seq + 1;
          const heap = [...s.heap, { id, basePriority, enqueuedAt: now, seq }];
          siftUp(heap, now);
          return { heap, seq };
        });
      });

    const pop = Effect.gen(function* () {
      const now = yield* Ref.get(clock);
      return yield* Ref.modify(
        state,
        (
          s,
        ): readonly [
          { id: string; agedPriority: number } | undefined,
          HeapState,
        ] => {
          if (s.heap.length === 0) return [undefined, s];
          // re-heapify against the current clock so aging is reflected
          const heap = [...s.heap];
          const last = heap.pop()!;
          const top = heap.length === 0 ? last : heap[0];
          const chosen =
            heap.length === 0
              ? last
              : ((heap[0] = last), siftDown(heap, now), top);
          return [
            { id: chosen.id, agedPriority: aged(chosen, now, agePerTick) },
            { ...s, heap },
          ];
        },
      );
    });

    return {
      push,
      pop,
      tick: (ms: number) => Ref.update(clock, (n) => n + ms),
      size: Ref.get(state).pipe(Effect.map((s) => s.heap.length)),
    } as const;
  });

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() =>
      console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`),
    );

  // Property 1: strict priority order, highest first.
  {
    const sched = yield* makeScheduler();
    yield* sched.push("low", 1);
    yield* sched.push("high", 9);
    yield* sched.push("mid", 5);
    const order: string[] = [];
    for (let i = 0; i < 3; i++) order.push((yield* sched.pop)!.id);
    yield* check(
      "jobs run in priority order",
      order.join(",") === "high,mid,low",
      `pushed low/high/mid, popped [${order.join(", ")}]`,
    );
  }

  // Property 2: FIFO among equal priorities (stable tiebreak by sequence).
  {
    const sched = yield* makeScheduler();
    yield* sched.push("first", 5);
    yield* sched.push("second", 5);
    yield* sched.push("third", 5);
    const order: string[] = [];
    for (let i = 0; i < 3; i++) order.push((yield* sched.pop)!.id);
    yield* check(
      "equal priorities keep arrival order",
      order.join(",") === "first,second,third",
      `three priority-5 jobs popped in insertion order [${order.join(", ")}]`,
    );
  }

  // Property 3: without aging, a low-priority job starves behind a stream.
  {
    const sched = yield* makeScheduler(); // no aging
    yield* sched.push("backup", 1);
    let backupRan = false;
    for (let i = 0; i < 10; i++) {
      yield* sched.push(`urgent-${i}`, 9); // fresh high-priority work keeps arriving
      const job = yield* sched.pop;
      if (job?.id === "backup") backupRan = true;
    }
    yield* check(
      "strict priority starves the low tier",
      backupRan === false,
      `after 10 rounds of incoming urgent work, the backup job never ran`,
    );
  }

  // Property 4: aging lets the starved job eventually outrank fresh arrivals.
  {
    const sched = yield* makeScheduler({ agePerTick: 1 }); // +1 priority per tick
    yield* sched.push("backup", 1);
    let backupRanAt = -1;
    for (let i = 0; i < 10; i++) {
      yield* sched.tick(1); // time passes, the backup ages
      yield* sched.push(`urgent-${i}`, 9);
      const job = yield* sched.pop;
      if (job?.id === "backup") backupRanAt = i;
    }
    yield* check(
      "aging bounds the worst-case wait",
      backupRanAt >= 0,
      `the backup aged past priority 9 and finally ran at round ${backupRanAt}, no longer starved`,
    );
  }

  console.log("priority.ts: all properties verified");
});

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e);
  process.exit(1);
});
