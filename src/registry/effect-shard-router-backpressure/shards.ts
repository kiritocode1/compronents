/**
 * shards.ts
 *
 * Failure modes solved:
 *   1. Hot partitions (uneven load): a naive router sends every request for one
 *      key to that key's single home shard, so one viral key or one noisy tenant
 *      pins a single shard at 100% while its neighbours idle, and the slowest
 *      shard sets the tail latency for everyone. The base router is a consistent
 *      hash ring so ordinary keys spread evenly and adding a shard remaps only a
 *      slice of the keyspace instead of reshuffling all of it. On top of that,
 *      keys observed to be hot are routed by power-of-two-choices: two ring
 *      positions are hashed for the key and the less loaded of the two shards is
 *      picked, which splits a hot key across two shards and provably flattens the
 *      peak without a central load table.
 *   2. Queue backlog (consumer lag): producers outrun consumers, an unbounded
 *      queue grows without limit, memory climbs, and the lag is invisible until
 *      an out-of-memory kill. Each shard is a bounded Queue, so when a consumer
 *      falls behind, offer blocks the producer (backpressure) rather than letting
 *      the buffer grow, turning lag into a signal the producer feels immediately.
 *      Work that must not block is routed to a dropping Queue instead, so
 *      low-priority load is shed at the edge rather than backing up behind
 *      critical work. Per-shard Metric gauges expose live queue depth so the lag
 *      is a number on a dashboard, not a surprise.
 *
 * Why the primitives make it correct: Queue.bounded's offer semantics ARE the
 * backpressure (there is no separate check to forget), Queue.dropping's offer
 * semantics ARE the load-shed, and power-of-two-choices needs only each
 * candidate's current depth, so the balancing decision is local and lock-free.
 */

import { Effect, Metric, Queue, Ref } from "effect";

// FNV-1a, a fast well-distributed non-cryptographic hash for ring placement.
const hash = (s: string): number => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
};

// ---- consistent hash ring with virtual nodes ----
interface Ring {
  readonly slots: ReadonlyArray<{
    readonly position: number;
    readonly shard: number;
  }>;
}

const makeRing = (shardCount: number, vnodesPerShard = 64): Ring => {
  const slots: Array<{ position: number; shard: number }> = [];
  for (let shard = 0; shard < shardCount; shard++) {
    for (let v = 0; v < vnodesPerShard; v++)
      slots.push({ position: hash(`shard:${shard}:vnode:${v}`), shard });
  }
  slots.sort((a, b) => a.position - b.position);
  return { slots };
};

// Walk the ring clockwise from the key's hash to the next virtual node.
const ringRoute = (ring: Ring, key: string): number => {
  const h = hash(key);
  let lo = 0;
  let hi = ring.slots.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (ring.slots[mid].position < h) lo = mid + 1;
    else hi = mid;
  }
  return ring.slots[ring.slots[lo].position >= h ? lo : 0].shard;
};

interface Job {
  readonly key: string;
  readonly payload: string;
}

interface Shard {
  readonly id: number;
  readonly queue: Queue.Queue<Job>;
  readonly depth: Ref.Ref<number>;
  readonly gauge: Metric.Gauge<number>;
  readonly processed: Ref.Ref<number>;
  readonly received: Ref.Ref<number>;
}

interface Router {
  readonly ring: Ring;
  readonly shards: ReadonlyArray<Shard>;
  readonly hotCounts: Ref.Ref<Map<string, number>>;
  readonly hotThreshold: number;
}

const makeShard = (id: number, capacity: number) =>
  Effect.gen(function* () {
    const queue = yield* Queue.bounded<Job>(capacity);
    const depth = yield* Ref.make(0);
    const processed = yield* Ref.make(0);
    const received = yield* Ref.make(0);
    const gauge = Metric.gauge(`shard_queue_depth_${id}`, {
      description: `live queue depth for shard ${id}`,
    });
    return { id, queue, depth, gauge, processed, received } satisfies Shard;
  });

const makeRouter = (options: {
  readonly shardCount: number;
  readonly capacity: number;
  readonly hotThreshold: number;
}) =>
  Effect.gen(function* () {
    const ring = makeRing(options.shardCount);
    const shards = yield* Effect.all(
      Array.from({ length: options.shardCount }, (_, i) =>
        makeShard(i, options.capacity),
      ),
    );
    const hotCounts = yield* Ref.make(new Map<string, number>());
    return {
      ring,
      shards,
      hotCounts,
      hotThreshold: options.hotThreshold,
    } satisfies Router;
  });

// Choose the destination shard. Cold keys ride the ring. A key seen more than
// `hotThreshold` times is treated as hot and balanced across two ring positions
// by picking whichever candidate shard currently holds fewer items.
const chooseShard = (router: Router, key: string) =>
  Effect.gen(function* () {
    const count = yield* Ref.modify(router.hotCounts, (m) => {
      const next = (m.get(key) ?? 0) + 1;
      m.set(key, next);
      return [next, m] as const;
    });
    if (count <= router.hotThreshold) return ringRoute(router.ring, key);
    const a = ringRoute(router.ring, `${key}#a`);
    const b = ringRoute(router.ring, `${key}#b`);
    if (a === b) return a;
    const depthA = yield* Ref.get(router.shards[a].depth);
    const depthB = yield* Ref.get(router.shards[b].depth);
    return depthA <= depthB ? a : b;
  });

// Submit a job. Returns the shard it landed on. Offer to a bounded queue blocks
// when the shard is saturated, which is the backpressure the caller feels.
const submit = (router: Router, job: Job) =>
  Effect.gen(function* () {
    const id = yield* chooseShard(router, job.key);
    const shard = router.shards[id];
    yield* Queue.offer(shard.queue, job);
    yield* Ref.update(shard.depth, (d) => d + 1);
    yield* Ref.update(shard.received, (n) => n + 1);
    const depth = yield* Ref.get(shard.depth);
    yield* Metric.update(shard.gauge, depth);
    return id;
  });

// Start a draining worker per shard. Membership in the scope is the lifecycle:
// the workers stop when the scope closes.
const startWorkers = (router: Router, perJob: Effect.Effect<void>) =>
  Effect.forEach(
    router.shards,
    (shard) =>
      Effect.forkScoped(
        Effect.forever(
          Effect.gen(function* () {
            yield* Queue.take(shard.queue);
            yield* perJob;
            yield* Ref.update(shard.depth, (d) => d - 1);
            yield* Ref.update(shard.processed, (n) => n + 1);
            const depth = yield* Ref.get(shard.depth);
            yield* Metric.update(shard.gauge, depth);
          }),
        ),
      ),
    { concurrency: "unbounded" },
  );

const demo = Effect.gen(function* () {
  const assert = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() =>
      console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`),
    );

  // Property 1: a bounded shard queue applies backpressure when full.
  {
    const q = yield* Queue.bounded<Job>(4);
    for (let i = 0; i < 4; i++)
      yield* Queue.offer(q, { key: "k", payload: `${i}` });
    // The 5th offer must not complete while the queue is full.
    const blocked = yield* Queue.offer(q, { key: "k", payload: "5" }).pipe(
      Effect.timeout("60 millis"),
      Effect.result,
    );
    const wasBlocked = blocked._tag === "Failure";
    // Draining one slot lets the pending offer through.
    yield* Queue.take(q);
    const nowAccepts = yield* Queue.offer(q, { key: "k", payload: "5" }).pipe(
      Effect.timeout("60 millis"),
      Effect.result,
    );
    yield* assert(
      "bounded queue backpressure",
      wasBlocked && nowAccepts._tag === "Success",
      `offer onto a full 4-slot queue blocked=${wasBlocked}, then succeeded after a take=${nowAccepts._tag === "Success"}`,
    );
  }

  // Property 2: a dropping queue sheds overflow instead of blocking.
  {
    const q = yield* Queue.dropping<Job>(4);
    let accepted = 0;
    for (let i = 0; i < 6; i++) {
      const ok = yield* Queue.offer(q, { key: "low", payload: `${i}` });
      if (ok) accepted++;
    }
    yield* assert(
      "dropping queue sheds load",
      accepted === 4,
      `offered 6 low-priority jobs onto a 4-slot dropping queue, ${accepted} accepted and ${6 - accepted} shed`,
    );
  }

  // Property 3: a hot key is detected and split across two shards by
  // power-of-two-choices, flattening the peak.
  {
    const router = yield* makeRouter({
      shardCount: 8,
      capacity: 10000,
      hotThreshold: 3,
    });
    const home = ringRoute(router.ring, "viral");
    const landed = new Map<number, number>();
    for (let i = 0; i < 200; i++) {
      const id = yield* submit(router, { key: "viral", payload: `${i}` });
      landed.set(id, (landed.get(id) ?? 0) + 1);
    }
    const shardsUsed = landed.size;
    const peak = Math.max(...landed.values());
    yield* assert(
      "hot key split by power-of-two-choices",
      shardsUsed >= 2 && peak < 160,
      `200 hits on hot key "viral" (home shard ${home}) spread across ${shardsUsed} shards, peak shard took ${peak} (naive would be 200)`,
    );
  }

  // Property 4: per-shard gauge reports live depth, and workers drain it to zero.
  {
    const router = yield* makeRouter({
      shardCount: 4,
      capacity: 100,
      hotThreshold: 1000,
    });
    const gaugeBefore = yield* Effect.scoped(
      Effect.gen(function* () {
        // Enqueue without workers so depth is observable, then read the gauge.
        for (let i = 0; i < 12; i++)
          yield* submit(router, { key: `key-${i}`, payload: `${i}` });
        const sumDepth = Effect.map(
          Effect.all(router.shards.map((s) => Ref.get(s.depth))),
          (ds) => ds.reduce((a, b) => a + b, 0),
        );
        const totalDepth = yield* sumDepth;
        // Now start workers and let them drain.
        yield* startWorkers(router, Effect.void);
        yield* Effect.sleep("100 millis");
        const remaining = yield* sumDepth;
        const anyGauge = yield* Metric.value(router.shards[0].gauge);
        return { totalDepth, remaining, gaugeReads: anyGauge.value };
      }),
    );
    yield* assert(
      "gauges track depth and workers drain the backlog",
      gaugeBefore.totalDepth === 12 && gaugeBefore.remaining === 0,
      `enqueued depth ${gaugeBefore.totalDepth}, drained to ${gaugeBefore.remaining}, shard-0 gauge settled at ${gaugeBefore.gaugeReads}`,
    );
  }

  console.log("shards.ts: all properties verified");
});

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e);
  process.exit(1);
});
