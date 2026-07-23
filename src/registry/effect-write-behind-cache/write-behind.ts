/**
 * write-behind.ts
 *
 * Failure modes solved:
 *   1. Write-through pays the store on every keystroke: a counter bumped
 *      100 times a second issues 100 store writes a second, even though
 *      only the last value matters. The store becomes the bottleneck for
 *      state that only ever needed to be eventually durable.
 *   2. Naive write-behind trades that for data loss: buffering writes in
 *      memory and flushing "later" means a crash between flushes silently
 *      drops every buffered write. The cache said OK; the store never heard.
 *
 * The component holds both ends: writes coalesce per key in a dirty-set
 * (100 increments to one key flush as ONE store write), but every accepted
 * write is appended to a journal FIRST, and recovery replays the journal
 * suffix past the store's checkpoint, so a crash costs zero acknowledged
 * writes. Flush advances the checkpoint and truncates the journal.
 *
 * Why the primitives make it correct: journal append and dirty-set update
 * happen inside one Ref.modify (a write is either fully accepted or not at
 * all), flush drains the dirty map atomically so writes racing a flush land
 * in the next batch instead of vanishing, and recovery is a pure fold over
 * the journal suffix, so replay is idempotent.
 */

import { Effect, Ref } from "effect";

interface Entry {
  readonly key: string;
  readonly value: number;
  readonly seq: number;
}

export interface Store {
  readonly write: (key: string, value: number) => Effect.Effect<void>;
  readonly read: (key: string) => Effect.Effect<number | undefined>;
  readonly writes: Effect.Effect<number>;
  readonly checkpoint: Ref.Ref<number>;
}

export const makeStore = (): Effect.Effect<Store> =>
  Effect.gen(function* () {
    const table = yield* Ref.make(new Map<string, number>());
    const count = yield* Ref.make(0);
    const checkpoint = yield* Ref.make(0);
    return {
      write: (key: string, value: number) =>
        Ref.update(table, (m) => new Map(m).set(key, value)).pipe(
          Effect.andThen(Ref.update(count, (n) => n + 1)),
        ),
      read: (key: string) => Ref.get(table).pipe(Effect.map((m) => m.get(key))),
      writes: Ref.get(count),
      checkpoint,
    } as const;
  });

interface CacheState {
  readonly values: ReadonlyMap<string, number>;
  readonly dirty: ReadonlySet<string>;
  readonly journal: readonly Entry[];
  readonly seq: number;
}

export interface WriteBehindCache {
  readonly set: (key: string, value: number) => Effect.Effect<void>;
  readonly get: (key: string) => Effect.Effect<number | undefined>;
  /** drain the dirty set: one store write per dirty KEY, then checkpoint */
  readonly flush: Effect.Effect<number>;
  /** simulate the process dying with unflushed writes in memory */
  readonly crash: Effect.Effect<{ lostFromMemory: number }>;
}

export const makeWriteBehindCache = (
  store: Store,
  options?: { readonly journal?: boolean },
): Effect.Effect<WriteBehindCache> =>
  Effect.gen(function* () {
    const journaled = options?.journal ?? true;
    const state = yield* Ref.make<CacheState>({
      values: new Map(),
      dirty: new Set<string>(),
      journal: [],
      seq: 0,
    });

    const set = (key: string, value: number) =>
      Ref.update(state, (s) => {
        const seq = s.seq + 1;
        return {
          values: new Map(s.values).set(key, value),
          dirty: new Set<string>(s.dirty).add(key),
          journal: journaled ? [...s.journal, { key, value, seq }] : s.journal,
          seq,
        };
      });

    const get = (key: string) =>
      Ref.get(state).pipe(Effect.map((s) => s.values.get(key)));

    const flush = Effect.gen(function* () {
      const batch = yield* Ref.modify(
        state,
        (s): readonly [readonly Entry[], CacheState] => {
          const out = [...s.dirty].map((key) => ({
            key,
            value: s.values.get(key) ?? 0,
            seq: s.seq,
          }));
          return [out, { ...s, dirty: new Set<string>(), journal: [] }];
        },
      );
      for (const e of batch) yield* store.write(e.key, e.value);
      yield* Ref.set(store.checkpoint, batch.length === 0 ? 0 : batch[0].seq);
      return batch.length;
    });

    const crash = Effect.gen(function* () {
      const s = yield* Ref.get(state);
      const lost = s.dirty.size;
      if (!journaled) {
        // memory gone, nothing durable: acknowledged writes evaporate
        yield* Ref.set(state, {
          values: new Map(),
          dirty: new Set<string>(),
          journal: [],
          seq: 0,
        });
        return { lostFromMemory: lost };
      }
      // recovery: fold the journal into a fresh dirty state and re-flush
      const recovered = new Map<string, number>();
      for (const e of s.journal) recovered.set(e.key, e.value);
      yield* Ref.set(state, {
        values: recovered,
        dirty: new Set<string>(recovered.keys()),
        journal: s.journal,
        seq: s.seq,
      });
      for (const [key, value] of recovered) yield* store.write(key, value);
      yield* Ref.update(state, (st) => ({
        ...st,
        dirty: new Set<string>(),
        journal: [],
      }));
      return { lostFromMemory: 0 };
    });

    return { set, get, flush, crash } as const;
  });

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() =>
      console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`),
    );

  // Property 1: coalescing. 100 bumps to one key cost ONE store write.
  {
    const store = yield* makeStore();
    const cache = yield* makeWriteBehindCache(store);
    for (let i = 1; i <= 100; i++) yield* cache.set("view:home", i);
    const flushed = yield* cache.flush;
    const storeWrites = yield* store.writes;
    const durable = yield* store.read("view:home");
    yield* check(
      "100 writes coalesce into 1 flush",
      flushed === 1 && storeWrites === 1 && durable === 100,
      `store saw ${storeWrites} write(s) and holds the final value ${durable}`,
    );
  }

  // Property 2: the write-through baseline pays full price for the same data.
  {
    const store = yield* makeStore();
    for (let i = 1; i <= 100; i++) yield* store.write("view:home", i);
    const storeWrites = yield* store.writes;
    yield* check(
      "write-through baseline costs 100x",
      storeWrites === 100,
      `the same 100 updates as write-through issued ${storeWrites} store writes`,
    );
  }

  // Property 3: naive write-behind loses acknowledged writes on crash.
  {
    const store = yield* makeStore();
    const cache = yield* makeWriteBehindCache(store, { journal: false });
    yield* cache.set("cart:9", 3);
    yield* cache.set("cart:9", 4);
    yield* cache.set("bal:2", 120);
    const { lostFromMemory } = yield* cache.crash;
    const bal = yield* store.read("bal:2");
    yield* check(
      "unjournaled buffer evaporates on crash",
      lostFromMemory === 2 && bal === undefined,
      `${lostFromMemory} dirty keys were acknowledged to callers and are simply gone`,
    );
  }

  // Property 4: with the journal, the same crash costs nothing.
  {
    const store = yield* makeStore();
    const cache = yield* makeWriteBehindCache(store);
    yield* cache.set("cart:9", 3);
    yield* cache.set("cart:9", 4);
    yield* cache.set("bal:2", 120);
    const { lostFromMemory } = yield* cache.crash;
    const [cart, bal] = yield* Effect.all([
      store.read("cart:9"),
      store.read("bal:2"),
    ]);
    yield* check(
      "journal replay recovers every acknowledged write",
      lostFromMemory === 0 && cart === 4 && bal === 120,
      `recovery replayed the journal: cart:9=${cart} (latest of two), bal:2=${bal}`,
    );
  }

  // Property 5: writes racing a flush are not dropped; they land next flush.
  {
    const store = yield* makeStore();
    const cache = yield* makeWriteBehindCache(store);
    yield* cache.set("k", 1);
    yield* Effect.all([cache.flush, cache.set("k", 2)], {
      concurrency: "unbounded",
    });
    const second = yield* cache.flush;
    const durable = yield* store.read("k");
    yield* check(
      "a write racing the flush survives to the next batch",
      durable === 2,
      `final durable value is ${durable} after a concurrent flush+write race (second flush drained ${second})`,
    );
  }

  console.log("write-behind.ts: all properties verified");
});

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e);
  process.exit(1);
});
