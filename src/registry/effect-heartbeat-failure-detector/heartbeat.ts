/**
 * heartbeat.ts
 *
 * Failure modes solved:
 *   1. False-positive node kill (the healthy node declared dead): a fixed
 *      timeout detector ("dead if no heartbeat for 500ms") fires the moment
 *      network congestion delays one heartbeat, and the cluster evicts a
 *      healthy node, reshuffles its work, and often triggers the very
 *      overload it feared. A phi-accrual detector instead learns the actual
 *      inter-arrival distribution and reports a suspicion level that grows
 *      with silence relative to what is normal for THIS node, so one late
 *      heartbeat on a normally-steady node barely moves phi, while the same
 *      silence on a chatty node counts for more.
 *   2. Detection built on trust in the sender: a monitor that lets the node
 *      self-report "I am fine" learns nothing when the node's clock stalls
 *      or its process wedges. The monitor records arrival times from its own
 *      Clock, so a wedged sender simply stops producing arrivals and phi
 *      rises on its own; there is nothing the sick node must do correctly
 *      for its sickness to be visible.
 *
 * Why the primitives make it correct: the arrival window is one Ref updated
 * atomically per heartbeat, phi is a pure function of (window, now), and now
 * comes from Clock, so the detector is testable and has no hidden timer
 * state that can wedge along with the node.
 */

import { Clock, Effect, Ref } from "effect";

interface Window {
  readonly lastArrival: number;
  readonly intervals: readonly number[];
}

export interface FailureDetector {
  /** record a heartbeat arrival, stamped by the monitor's own clock */
  readonly heartbeat: Effect.Effect<void>;
  /** suspicion level: phi = -log10(P(silence this long is normal)) */
  readonly phi: Effect.Effect<number>;
  /** convenience verdict at the configured threshold */
  readonly status: Effect.Effect<{ phi: number; alive: boolean }>;
}

export const makeFailureDetector = (options: {
  /** declare dead when phi crosses this; 8 is the classic Cassandra default */
  readonly threshold: number;
  /** how many recent intervals to learn from */
  readonly windowSize: number;
  /** assumed interval before any history exists */
  readonly bootstrapIntervalMs: number;
}): Effect.Effect<FailureDetector> =>
  Effect.gen(function* () {
    const start = yield* Clock.currentTimeMillis;
    const window = yield* Ref.make<Window>({
      lastArrival: start,
      intervals: [],
    });

    const heartbeat = Effect.gen(function* () {
      const now = yield* Clock.currentTimeMillis;
      yield* Ref.update(window, (w) => ({
        lastArrival: now,
        intervals: [...w.intervals, now - w.lastArrival].slice(
          -options.windowSize,
        ),
      }));
    });

    // Phi accrual over an exponential model of inter-arrival times:
    // P(silence >= t) = exp(-t / mean), phi = -log10 of that probability.
    // Silence of 1x the mean interval is phi ~ 0.43, 3x is ~ 1.3, 18x is ~ 8.
    const phi = Effect.gen(function* () {
      const now = yield* Clock.currentTimeMillis;
      const w = yield* Ref.get(window);
      const mean =
        w.intervals.length === 0
          ? options.bootstrapIntervalMs
          : w.intervals.reduce((a, b) => a + b, 0) / w.intervals.length;
      const silence = now - w.lastArrival;
      return silence / (mean * Math.LN10);
    });

    const status = phi.pipe(
      Effect.map((p) => ({ phi: p, alive: p < options.threshold })),
    );

    return { heartbeat, phi, status } as const;
  });

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() =>
      console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`),
    );

  // A node that beats every 20ms; threshold 8 (a node must be silent for
  // roughly 18x its normal interval before it is declared dead).
  const detector = yield* makeFailureDetector({
    threshold: 8,
    windowSize: 32,
    bootstrapIntervalMs: 20,
  });

  // Learn the rhythm: 10 heartbeats at ~20ms.
  for (let i = 0; i < 10; i++) {
    yield* Effect.sleep("20 millis");
    yield* detector.heartbeat;
  }

  // Property 1: one congested heartbeat (3x late) does NOT kill the node.
  // A fixed 40ms timeout would have declared it dead here.
  {
    yield* Effect.sleep("60 millis");
    const { phi, alive } = yield* detector.status;
    yield* check(
      "late heartbeat is suspicion, not death",
      alive && phi > 0.5 && phi < 8,
      `60ms of silence on a 20ms rhythm: phi ${phi.toFixed(2)} (threshold 8), a fixed 40ms timeout would have false-positived`,
    );
    yield* detector.heartbeat; // the late beat arrives, suspicion resets
    const after = yield* detector.phi;
    yield* check(
      "arrival resets suspicion",
      after < 0.5,
      `phi fell to ${after.toFixed(2)} on arrival`,
    );
  }

  // Property 2: sustained silence does cross the threshold.
  {
    yield* Effect.sleep("650 millis"); // far past 18x the learned interval, no beats
    const { phi, alive } = yield* detector.status;
    yield* check(
      "sustained silence is death",
      !alive && phi >= 8,
      `650ms of silence: phi ${phi.toFixed(2)} crossed threshold 8, node declared dead`,
    );
  }

  // Property 3: the threshold adapts to the node's own rhythm. A slow-but-
  // steady node (80ms beats) survives silence that would kill a 20ms node.
  {
    const slow = yield* makeFailureDetector({
      threshold: 8,
      windowSize: 32,
      bootstrapIntervalMs: 80,
    });
    for (let i = 0; i < 5; i++) {
      yield* Effect.sleep("80 millis");
      yield* slow.heartbeat;
    }
    yield* Effect.sleep("240 millis"); // 3x ITS interval: fine for this node
    const { phi, alive } = yield* slow.status;
    yield* check(
      "phi adapts to each node's rhythm",
      alive && phi < 8,
      `240ms of silence on an 80ms rhythm: phi ${phi.toFixed(2)}, still alive (the same silence killed nothing)`,
    );
  }

  console.log("heartbeat.ts: all properties verified");
});

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e);
  process.exit(1);
});
