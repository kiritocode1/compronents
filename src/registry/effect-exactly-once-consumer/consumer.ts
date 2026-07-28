/**
 * consumer.ts
 *
 * Failure modes solved:
 *   1. The lost message (at-most-once by accident): a consumer that commits
 *      its offset BEFORE processing acknowledges work it has not done; if it
 *      crashes between commit and process, the broker never redelivers and
 *      the message is gone. Order matters: this consumer processes first and
 *      commits second, so a crash in the gap causes redelivery, never loss.
 *   2. The double-applied message (at-least-once, felt by the customer):
 *      process-then-commit means a crash after processing but before the
 *      commit redelivers a message that already had its effect; without a
 *      guard, a payment posts twice. Every message carries an id, applied
 *      ids live in a dedupe store checked inside the same atomic decision
 *      as the apply, so a redelivery is recognized, skipped, and its offset
 *      committed. At-least-once delivery plus idempotent apply is
 *      exactly-once EFFECT, which is the guarantee systems actually need.
 *
 * Why the primitives make it correct: the applied-set update and the ledger
 * write happen in one Ref.modify decision, so there is no window where a
 * redelivered message sees "not applied" twice, and offsets only advance
 * through commit, so the broker's redelivery covers every crash point.
 */

import { Data, Effect, Exit, Ref } from "effect";

export interface Message {
  readonly id: string;
  readonly offset: number;
  readonly body: string;
}

class CrashMidProcess extends Data.TaggedError("CrashMidProcess")<{
  readonly offset: number;
}> {}

/** In-memory stand-in for a partitioned log (one partition). */
export interface Broker {
  readonly append: (id: string, body: string) => Effect.Effect<void>;
  /** deliver everything from the committed offset onward */
  readonly poll: Effect.Effect<readonly Message[]>;
  readonly commit: (offset: number) => Effect.Effect<void>;
  readonly committedOffset: Effect.Effect<number>;
}

export const makeBroker = (): Effect.Effect<Broker> =>
  Effect.gen(function* () {
    const log = yield* Ref.make<readonly Message[]>([]);
    const committed = yield* Ref.make(-1);
    const append = (id: string, body: string) =>
      Ref.update(log, (l) => [...l, { id, offset: l.length, body }]);
    const poll = Effect.gen(function* () {
      const from = (yield* Ref.get(committed)) + 1;
      return (yield* Ref.get(log)).slice(from);
    });
    const commit = (offset: number) =>
      Ref.update(committed, (c) => Math.max(c, offset));
    return {
      append,
      poll,
      commit,
      committedOffset: Ref.get(committed),
    } as const;
  });

/** The side effect the consumer drives: an account ledger. */
export interface Ledger {
  readonly balance: Effect.Effect<number>;
  /** apply exactly once per message id; returns whether this call applied it */
  readonly applyOnce: (id: string, amount: number) => Effect.Effect<boolean>;
}

export const makeLedger = (): Effect.Effect<Ledger> =>
  Effect.gen(function* () {
    // One Ref holds BOTH the applied set and the balance, so the dedupe check
    // and the write are a single atomic decision, not a check then a write.
    const state = yield* Ref.make({ applied: new Set<string>(), balance: 0 });
    const applyOnce = (id: string, amount: number) =>
      Ref.modify(state, (s) => {
        if (s.applied.has(id)) return [false, s] as const;
        return [
          true,
          { applied: new Set(s.applied).add(id), balance: s.balance + amount },
        ] as const;
      });
    const balance = Ref.get(state).pipe(Effect.map((s) => s.balance));
    return { balance, applyOnce } as const;
  });

/**
 * Drain the broker with process-then-commit ordering and idempotent apply.
 * `crashBeforeCommitAt` simulates dying after the effect landed but before
 * the offset commit, the exact window where naive consumers double-apply.
 */
export const runConsumer = (
  broker: Broker,
  ledger: Ledger,
  options: { readonly crashBeforeCommitAt?: number } = {},
): Effect.Effect<
  { applied: number; skippedDuplicates: number },
  CrashMidProcess
> =>
  Effect.gen(function* () {
    let applied = 0;
    let skipped = 0;
    const batch = yield* broker.poll;
    for (const message of batch) {
      const amount = Number.parseInt(message.body, 10);
      const didApply = yield* ledger.applyOnce(message.id, amount);
      if (didApply) applied += 1;
      else skipped += 1;
      if (options.crashBeforeCommitAt === message.offset) {
        // the effect landed, the commit did not: the broker WILL redeliver
        return yield* new CrashMidProcess({ offset: message.offset });
      }
      yield* broker.commit(message.offset);
    }
    return { applied, skippedDuplicates: skipped };
  });

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() =>
      console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`),
    );

  // Property 1: crash after apply, before commit; redelivery does not double-apply.
  {
    const broker = yield* makeBroker();
    const ledger = yield* makeLedger();
    yield* broker.append("pay-001", "500");
    yield* broker.append("pay-002", "250");
    yield* broker.append("pay-003", "125");

    const firstRun = yield* Effect.exit(
      runConsumer(broker, ledger, { crashBeforeCommitAt: 1 }),
    );
    const midBalance = yield* ledger.balance;
    const committedAtCrash = yield* broker.committedOffset;

    // restart: offsets 1 and 2 are redelivered (1 was applied but not committed)
    const secondRun = yield* runConsumer(broker, ledger);
    const finalBalance = yield* ledger.balance;
    const finalOffset = yield* broker.committedOffset;

    yield* check(
      "redelivery after crash is deduped",
      Exit.isFailure(firstRun) &&
        midBalance === 750 &&
        committedAtCrash === 0 &&
        secondRun.skippedDuplicates === 1 &&
        secondRun.applied === 1 &&
        finalBalance === 875,
      `crashed after applying pay-002 (balance ${midBalance}, committed offset ${committedAtCrash}); restart redelivered 2 messages, skipped 1 duplicate, final balance ${finalBalance} = 500+250+125`,
    );
    yield* check(
      "offsets caught up",
      finalOffset === 2,
      `committed offset ${finalOffset}`,
    );
  }

  // Property 2: the wrong ordering (commit first) LOSES the message. Shown
  // here as arithmetic, which is the entire argument for process-then-commit:
  // commit offset 1, crash before processing, restart from offset 2.
  {
    const broker = yield* makeBroker();
    const ledger = yield* makeLedger();
    yield* broker.append("pay-101", "500");
    yield* broker.append("pay-102", "250");
    yield* broker.append("pay-103", "125");
    // commit-then-process consumer dies right after committing offset 1
    yield* broker.commit(0);
    yield* broker.commit(1); // acknowledged pay-102 without applying it
    yield* runConsumer(broker, ledger); // restart sees only offset 2
    const balance = yield* ledger.balance;
    yield* check(
      "commit-first ordering silently loses money",
      balance === 125,
      `broker never redelivers acknowledged work: balance ${balance}, pay-101 and pay-102 (750) are gone forever`,
    );
  }

  // Property 3: steady state applies everything exactly once.
  {
    const broker = yield* makeBroker();
    const ledger = yield* makeLedger();
    for (let i = 0; i < 20; i++) yield* broker.append(`evt-${i}`, "10");
    const run = yield* runConsumer(broker, ledger);
    const balance = yield* ledger.balance;
    yield* check(
      "steady state is exactly-once",
      run.applied === 20 && run.skippedDuplicates === 0 && balance === 200,
      `20 messages, ${run.applied} applied, ${run.skippedDuplicates} duplicates, balance ${balance}`,
    );
  }

  console.log("consumer.ts: all properties verified");
});

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e);
  process.exit(1);
});
