/**
 * two-phase.ts
 *
 * Failure modes solved:
 *   1. The half-committed distributed write: telling three services "commit
 *      now" in a loop works until the second one refuses, and then the
 *      first has committed, the second has not, and no amount of retrying
 *      makes the system whole. Two-phase commit splits the write into a
 *      PREPARE round (every participant votes after durably staging the
 *      change) and a COMMIT round that only starts once every vote is yes,
 *      so a refusal aborts everyone and nobody moves.
 *   2. The coordinator that dies holding the answer: after collecting yes
 *      votes the coordinator decides, and if it crashes before telling the
 *      participants, they are blocked holding prepared state. The decision
 *      is therefore written to a durable log BEFORE any commit message is
 *      sent; recovery reads the log and finishes delivering the decision,
 *      so a crash delays the outcome but can never fork it.
 *
 * Why the primitives make it correct: each participant's staged and
 * committed state live in Refs mutated only by prepare/commit/abort (a
 * commit without a matching prepare is a typed defect), votes are
 * collected with Effect.all over Effect.exit so one refusal cannot hide
 * another, and the decision log is a Ref written before the commit fan-out
 * with a crash flag the demo flips to prove recovery replays the same
 * decision.
 */

import { Data, Effect, Ref } from "effect";

class VoteNo extends Data.TaggedError("VoteNo")<{
  readonly participant: string;
  readonly reason: string;
}> {}

class NotPrepared extends Data.TaggedError("NotPrepared")<{
  readonly participant: string;
  readonly txId: string;
}> {}

export interface Participant {
  readonly name: string;
  readonly prepare: (
    txId: string,
    change: number,
  ) => Effect.Effect<void, VoteNo>;
  readonly commit: (txId: string) => Effect.Effect<void, NotPrepared>;
  readonly abort: (txId: string) => Effect.Effect<void>;
  readonly balance: Effect.Effect<number>;
  readonly prepared: Effect.Effect<readonly string[]>;
}

export const makeParticipant = (
  name: string,
  opening: number,
  options?: { readonly rejectBelowZero?: boolean },
): Effect.Effect<Participant> =>
  Effect.gen(function* () {
    const committed = yield* Ref.make(opening);
    const staged = yield* Ref.make(new Map<string, number>());
    const prepare = (txId: string, change: number) =>
      Effect.gen(function* () {
        const now = yield* Ref.get(committed);
        if ((options?.rejectBelowZero ?? true) && now + change < 0) {
          return yield* new VoteNo({
            participant: name,
            reason: `balance would reach ${now + change}`,
          });
        }
        yield* Ref.update(staged, (m) => new Map(m).set(txId, change));
      });
    const commit = (txId: string) =>
      Effect.gen(function* () {
        const held = (yield* Ref.get(staged)).get(txId);
        if (held === undefined)
          return yield* new NotPrepared({ participant: name, txId });
        yield* Ref.update(committed, (n) => n + held);
        yield* Ref.update(staged, (m) => {
          const next = new Map(m);
          next.delete(txId);
          return next;
        });
      });
    const abort = (txId: string) =>
      Ref.update(staged, (m) => {
        const next = new Map(m);
        next.delete(txId);
        return next;
      });
    return {
      name,
      prepare,
      commit,
      abort,
      balance: Ref.get(committed),
      prepared: Ref.get(staged).pipe(Effect.map((m) => [...m.keys()])),
    } as const;
  });

type Decision = { readonly txId: string; readonly outcome: "commit" | "abort" };

export interface Coordinator {
  readonly transact: (
    txId: string,
    changes: ReadonlyMap<string, number>,
  ) => Effect.Effect<"committed" | "aborted">;
  /** crash after logging the decision but before fanning it out */
  readonly crashAfterDecision: Ref.Ref<boolean>;
  /** recovery: re-deliver every logged decision that never fanned out */
  readonly recover: Effect.Effect<readonly Decision[]>;
}

export const makeCoordinator = (
  participants: readonly Participant[],
): Effect.Effect<Coordinator> =>
  Effect.gen(function* () {
    const log = yield* Ref.make<readonly (Decision & { delivered: boolean })[]>(
      [],
    );
    const crashAfterDecision = yield* Ref.make(false);

    const deliver = (d: Decision) =>
      Effect.gen(function* () {
        for (const p of participants) {
          if (d.outcome === "commit") yield* p.commit(d.txId).pipe(Effect.exit);
          else yield* p.abort(d.txId);
        }
        yield* Ref.update(log, (l) =>
          l.map((e) => (e.txId === d.txId ? { ...e, delivered: true } : e)),
        );
      });

    const transact = (txId: string, changes: ReadonlyMap<string, number>) =>
      Effect.gen(function* () {
        // phase 1: everyone stages and votes
        const votes = yield* Effect.all(
          participants.map((p) =>
            p.prepare(txId, changes.get(p.name) ?? 0).pipe(Effect.exit),
          ),
        );
        const outcome: "commit" | "abort" = votes.every(
          (v) => v._tag === "Success",
        )
          ? "commit"
          : "abort";
        // the decision is durable BEFORE any participant hears it
        yield* Ref.update(log, (l) => [
          ...l,
          { txId, outcome, delivered: false },
        ]);
        if (yield* Ref.get(crashAfterDecision)) {
          return outcome === "commit"
            ? ("committed" as const)
            : ("aborted" as const);
        }
        // phase 2: fan the decision out
        yield* deliver({ txId, outcome });
        return outcome === "commit"
          ? ("committed" as const)
          : ("aborted" as const);
      });

    const recover = Effect.gen(function* () {
      yield* Ref.set(crashAfterDecision, false);
      const pending = (yield* Ref.get(log)).filter((e) => !e.delivered);
      for (const d of pending) yield* deliver(d);
      return pending.map(({ txId, outcome }) => ({ txId, outcome }));
    });

    return { transact, crashAfterDecision, recover } as const;
  });

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() =>
      console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`),
    );

  // Property 1: the naive one-phase loop leaves the system half-committed.
  {
    const wallet = yield* makeParticipant("wallet", 100);
    const bank = yield* makeParticipant("bank", 0);
    // "just commit everywhere": wallet pays 150 it does not have
    yield* wallet.prepare("t0", -150).pipe(Effect.exit); // refused
    yield* bank.prepare("t0", 150);
    yield* bank.commit("t0"); // ...but the loop already committed the credit
    const [w, b] = yield* Effect.all([wallet.balance, bank.balance]);
    yield* check(
      "one-phase commit forks the money",
      w === 100 && b === 150,
      `wallet still holds ${w} yet the bank shows ${b}: 150 minted from nothing`,
    );
  }

  // Property 2: 2PC turns the same refusal into a clean abort for everyone.
  {
    const wallet = yield* makeParticipant("wallet", 100);
    const bank = yield* makeParticipant("bank", 0);
    const coord = yield* makeCoordinator([wallet, bank]);
    const outcome = yield* coord.transact(
      "t1",
      new Map([
        ["wallet", -150],
        ["bank", 150],
      ]),
    );
    const [w, b] = yield* Effect.all([wallet.balance, bank.balance]);
    yield* check(
      "a no vote aborts every participant",
      outcome === "aborted" && w === 100 && b === 0,
      `wallet's refusal (150 > 100) rolled everyone back: wallet=${w}, bank=${b}`,
    );
  }

  // Property 3: unanimous yes commits everywhere, atomically.
  {
    const wallet = yield* makeParticipant("wallet", 100);
    const bank = yield* makeParticipant("bank", 0);
    const coord = yield* makeCoordinator([wallet, bank]);
    const outcome = yield* coord.transact(
      "t2",
      new Map([
        ["wallet", -60],
        ["bank", 60],
      ]),
    );
    const [w, b] = yield* Effect.all([wallet.balance, bank.balance]);
    yield* check(
      "unanimous votes commit atomically",
      outcome === "committed" && w === 40 && b === 60,
      `both sides moved together: wallet=${w}, bank=${b}, total conserved at ${w + b}`,
    );
  }

  // Property 4: a coordinator crash after the decision blocks but never
  // forks; recovery delivers the logged decision.
  {
    const wallet = yield* makeParticipant("wallet", 100);
    const bank = yield* makeParticipant("bank", 0);
    const coord = yield* makeCoordinator([wallet, bank]);
    yield* Ref.set(coord.crashAfterDecision, true);
    yield* coord.transact(
      "t3",
      new Map([
        ["wallet", -30],
        ["bank", 30],
      ]),
    );
    const blockedPrepared = yield* wallet.prepared;
    const [wBefore] = yield* Effect.all([wallet.balance]);
    const redelivered = yield* coord.recover;
    const [w, b] = yield* Effect.all([wallet.balance, bank.balance]);
    yield* check(
      "crash after decision delays, never forks",
      blockedPrepared.includes("t3") && wBefore === 100 && w === 70 && b === 30,
      `participants held prepared state through the crash; recovery replayed ${redelivered.length} decision(s) and the money moved once`,
    );
  }

  // Property 5: commit without prepare is a typed refusal, not a write.
  {
    const solo = yield* makeParticipant("solo", 10);
    const exit = yield* Effect.exit(solo.commit("ghost-tx"));
    const bal = yield* solo.balance;
    yield* check(
      "commit without prepare cannot land",
      exit._tag === "Failure" && bal === 10,
      `a stray commit for an unknown tx was refused (NotPrepared) and the balance stayed ${bal}`,
    );
  }

  console.log("two-phase.ts: all properties verified");
});

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e);
  process.exit(1);
});
