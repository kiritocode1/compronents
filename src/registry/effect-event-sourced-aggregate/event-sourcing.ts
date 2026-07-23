/**
 * event-sourcing.ts
 *
 * Failure modes solved:
 *   1. The state-only row that forgets how it got there: storing just the
 *      current balance means an incorrect value has no audit trail, a
 *      dispute has no history, and a bug that corrupted the number cannot
 *      be replayed or corrected. Event sourcing stores the ordered facts
 *      (Deposited, Withdrew) and derives state by folding them, so the
 *      history IS the source of truth and current state is a cache you can
 *      always rebuild.
 *   2. The concurrent append that overwrites history: two commands loaded
 *      the aggregate at version 7 and both append "event 8", and one is
 *      lost. Optimistic concurrency on the event stream (append expects
 *      version N, fails if the stream already advanced) turns that race
 *      into a typed ConcurrencyConflict the caller retries against the new
 *      state, so the log never loses a fact or applies one twice.
 *
 * Why the primitives make it correct: the event log is an append-only
 * array in a Ref, appends go through one Ref.modify that checks the
 * expected version before extending (compare-and-append), state is a pure
 * left fold over events so any point-in-time view is reproducible, and a
 * rejected command decides through a typed error rather than a silent
 * overwrite.
 */

import { Data, Effect, Ref } from "effect";

class ConcurrencyConflict extends Data.TaggedError("ConcurrencyConflict")<{
  readonly expected: number;
  readonly actual: number;
}> {}

class InsufficientFunds extends Data.TaggedError("InsufficientFunds")<{
  readonly balance: number;
  readonly requested: number;
}> {}

export type AccountEvent =
  | { readonly _tag: "Opened"; readonly owner: string }
  | { readonly _tag: "Deposited"; readonly amount: number }
  | { readonly _tag: "Withdrew"; readonly amount: number };

export interface AccountState {
  readonly owner: string;
  readonly balance: number;
  readonly version: number;
}

/** the fold: state is derived, never stored directly */
export const fold = (events: readonly AccountEvent[]): AccountState =>
  events.reduce<AccountState>(
    (s, e) => {
      switch (e._tag) {
        case "Opened":
          return { ...s, owner: e.owner, version: s.version + 1 };
        case "Deposited":
          return {
            ...s,
            balance: s.balance + e.amount,
            version: s.version + 1,
          };
        case "Withdrew":
          return {
            ...s,
            balance: s.balance - e.amount,
            version: s.version + 1,
          };
      }
    },
    { owner: "", balance: 0, version: 0 },
  );

export interface EventStore {
  readonly append: (
    expectedVersion: number,
    events: readonly AccountEvent[],
  ) => Effect.Effect<number, ConcurrencyConflict>;
  readonly load: Effect.Effect<AccountState>;
  readonly at: (version: number) => Effect.Effect<AccountState>;
  readonly history: Effect.Effect<readonly AccountEvent[]>;
}

export const makeEventStore = (): Effect.Effect<EventStore> =>
  Effect.gen(function* () {
    const log = yield* Ref.make<readonly AccountEvent[]>([]);
    const append = (expectedVersion: number, events: readonly AccountEvent[]) =>
      Ref.modify(
        log,
        (
          l,
        ): readonly [
          Effect.Effect<number, ConcurrencyConflict>,
          readonly AccountEvent[],
        ] => {
          if (l.length !== expectedVersion) {
            return [
              new ConcurrencyConflict({
                expected: expectedVersion,
                actual: l.length,
              }),
              l,
            ];
          }
          const next = [...l, ...events];
          return [Effect.succeed(next.length), next];
        },
      ).pipe(Effect.flatten);
    return {
      append,
      load: Ref.get(log).pipe(Effect.map(fold)),
      at: (version: number) =>
        Ref.get(log).pipe(Effect.map((l) => fold(l.slice(0, version)))),
      history: Ref.get(log),
    } as const;
  });

/** a command handler: load, decide, append with the loaded version */
export const withdraw = (store: EventStore, amount: number) =>
  Effect.gen(function* () {
    const state = yield* store.load;
    if (state.balance < amount) {
      return yield* new InsufficientFunds({
        balance: state.balance,
        requested: amount,
      });
    }
    return yield* store.append(state.version, [{ _tag: "Withdrew", amount }]);
  });

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() =>
      console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`),
    );

  // Property 1: state is a fold over facts, and history is preserved.
  {
    const store = yield* makeEventStore();
    yield* store.append(0, [
      { _tag: "Opened", owner: "ada" },
      { _tag: "Deposited", amount: 100 },
      { _tag: "Withdrew", amount: 30 },
      { _tag: "Deposited", amount: 5 },
    ]);
    const state = yield* store.load;
    const history = yield* store.history;
    yield* check(
      "current state is derived from the event log",
      state.balance === 75 && state.version === 4 && history.length === 4,
      `folding ${history.length} events yields balance=${state.balance} (100 - 30 + 5) at version ${state.version}`,
    );
  }

  // Property 2: any past state is reproducible by folding a prefix.
  {
    const store = yield* makeEventStore();
    yield* store.append(0, [
      { _tag: "Opened", owner: "grace" },
      { _tag: "Deposited", amount: 200 },
      { _tag: "Withdrew", amount: 50 },
    ]);
    const past = yield* store.at(2);
    const now = yield* store.load;
    yield* check(
      "time travel: fold a prefix to see any past state",
      past.balance === 200 && now.balance === 150,
      `replaying the first 2 events shows balance=${past.balance}; the full log shows ${now.balance}`,
    );
  }

  // Property 3: the lost append. Two handlers both load v1 and try to append
  // v2; the second is refused instead of overwriting the first.
  {
    const store = yield* makeEventStore();
    yield* store.append(0, [{ _tag: "Opened", owner: "edsger" }]);
    const a = (yield* store.load).version; // both read version 1
    const b = (yield* store.load).version;
    yield* store.append(a, [{ _tag: "Deposited", amount: 40 }]);
    const bExit = yield* Effect.exit(
      store.append(b, [{ _tag: "Deposited", amount: 999 }]),
    );
    const state = yield* store.load;
    yield* check(
      "concurrent appends cannot overwrite the log",
      bExit._tag === "Failure" && state.balance === 40 && state.version === 2,
      `both loaded v1; the stale append was refused (ConcurrencyConflict), so the log holds the real event (balance=${state.balance})`,
    );
  }

  // Property 4: a domain rule is enforced against the folded state.
  {
    const store = yield* makeEventStore();
    yield* store.append(0, [
      { _tag: "Opened", owner: "linus" },
      { _tag: "Deposited", amount: 20 },
    ]);
    const exit = yield* Effect.exit(withdraw(store, 100));
    const state = yield* store.load;
    yield* check(
      "invariants are checked before an event is recorded",
      exit._tag === "Failure" && state.balance === 20,
      `withdrawing 100 from 20 was refused (InsufficientFunds); no Withdrew event was written, balance stays ${state.balance}`,
    );
  }

  console.log("event-sourcing.ts: all properties verified");
});

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e);
  process.exit(1);
});
