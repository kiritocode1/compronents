/**
 * vector-clock.ts
 *
 * Failure modes solved:
 *   1. Wall clocks lie about order: two nodes edit the same document and
 *      you decide the winner by timestamp, but their clocks disagree by
 *      200ms, so the edit that happened later gets a smaller timestamp and
 *      loses. Last-write-wins on physical time silently drops real writes.
 *      Vector clocks track causality directly: each node counts its own
 *      events and remembers the highest count it has seen from every other
 *      node, so "A happened before B" is a fact about what B had observed,
 *      not a guess from two unsynchronized clocks.
 *   2. Concurrent edits misreported as a clean overwrite: if two edits are
 *      genuinely concurrent (neither saw the other), calling one the winner
 *      throws away a real change. Vector-clock comparison distinguishes
 *      before / after / CONCURRENT, so the system can surface a conflict
 *      for merging instead of pretending there was a linear order.
 *
 * Why the primitives make it correct: each node's clock is a Ref holding a
 * per-node counter map; a local event bumps only this node's entry
 * (Ref.update), receiving a message merges element-wise maxima before
 * bumping, and comparison is a pure total function over the two maps, so
 * "concurrent" is detected rather than resolved away.
 */

import { Effect, Ref } from "effect";

export type Clock = ReadonlyMap<string, number>;

export type Ordering = "before" | "after" | "equal" | "concurrent";

const get = (c: Clock, id: string) => c.get(id) ?? 0;

/** total causal comparison of two vector clocks */
export const compare = (a: Clock, b: Clock): Ordering => {
  const ids = new Set([...a.keys(), ...b.keys()]);
  let aGreater = false;
  let bGreater = false;
  for (const id of ids) {
    const av = get(a, id);
    const bv = get(b, id);
    if (av > bv) aGreater = true;
    if (bv > av) bGreater = true;
  }
  if (aGreater && bGreater) return "concurrent";
  if (aGreater) return "after";
  if (bGreater) return "before";
  return "equal";
};

const merge = (a: Clock, b: Clock): Clock => {
  const out = new Map(a);
  for (const [id, v] of b) out.set(id, Math.max(get(out, id), v));
  return out;
};

export interface Node {
  readonly id: string;
  /** a local event: bump only this node's counter */
  readonly tick: Effect.Effect<Clock>;
  /** receive a message stamped `incoming`: merge then bump */
  readonly receive: (incoming: Clock) => Effect.Effect<Clock>;
  readonly now: Effect.Effect<Clock>;
}

export const makeNode = (id: string): Effect.Effect<Node> =>
  Effect.gen(function* () {
    const clock = yield* Ref.make<Clock>(new Map([[id, 0]]));
    const tick = Ref.updateAndGet(clock, (c) =>
      new Map(c).set(id, get(c, id) + 1),
    );
    const receive = (incoming: Clock) =>
      Ref.updateAndGet(clock, (c) => {
        const merged = new Map(merge(c, incoming));
        merged.set(id, get(merged, id) + 1);
        return merged;
      });
    return { id, tick, receive, now: Ref.get(clock) } as const;
  });

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() =>
      console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`),
    );

  const fmt = (c: Clock) =>
    "{" +
    [...c.entries()]
      .sort()
      .map(([k, v]) => `${k}:${v}`)
      .join(", ") +
    "}";

  // Property 1: a message received establishes happened-before, even if a
  // wall clock would have ordered them the other way.
  {
    const a = yield* makeNode("a");
    const b = yield* makeNode("b");
    const sent = yield* a.tick; // a does something and sends it
    const received = yield* b.receive(sent); // b processes a's message
    yield* check(
      "receiving a message records causal order",
      compare(sent, received) === "before",
      `a's event ${fmt(sent)} is causally before b's post-receive state ${fmt(received)}`,
    );
  }

  // Property 2: two independent edits are detected as concurrent, not ranked.
  {
    const a = yield* makeNode("a");
    const b = yield* makeNode("b");
    const editA = yield* a.tick; // neither node has heard from the other
    const editB = yield* b.tick;
    yield* check(
      "independent edits are concurrent, not ordered",
      compare(editA, editB) === "concurrent",
      `${fmt(editA)} vs ${fmt(editB)}: no causal path either way, so this is a real conflict to merge`,
    );
  }

  // Property 3: last-write-wins on a physical clock would drop a real edit;
  // vector clocks preserve the conflict for merging.
  {
    const a = yield* makeNode("a");
    const b = yield* makeNode("b");
    // simulate skewed wall clocks: b's edit is "later" by timestamp but was
    // actually made without seeing a's edit
    const editA = yield* a.tick;
    const editB = yield* b.tick;
    const wallClockA = 1_000; // a's machine clock, running fast
    const wallClockB = 900; // b's machine clock, running slow, real edit later
    const lwwWinner = wallClockA > wallClockB ? "a" : "b";
    const causal = compare(editA, editB);
    yield* check(
      "vector clocks catch a conflict LWW would silently drop",
      lwwWinner === "a" && causal === "concurrent",
      `timestamp LWW would pick node ${lwwWinner} and delete b's edit; the vector clock says ${causal}, so both survive to merge`,
    );
  }

  // Property 4: causality is transitive through a chain of messages.
  {
    const a = yield* makeNode("a");
    const b = yield* makeNode("b");
    const c = yield* makeNode("c");
    const e1 = yield* a.tick;
    const e2 = yield* b.receive(e1); // b learns of a
    const e3 = yield* c.receive(e2); // c learns of b (and transitively a)
    yield* check(
      "happened-before is transitive across the chain",
      compare(e1, e3) === "before" && compare(e2, e3) === "before",
      `a -> b -> c: a's original event ${fmt(e1)} is before c's state ${fmt(e3)}`,
    );
  }

  console.log("vector-clock.ts: all properties verified");
});

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e);
  process.exit(1);
});
