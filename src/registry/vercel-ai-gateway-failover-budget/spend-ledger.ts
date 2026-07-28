/**
 * spend-ledger.ts
 *
 * An admission-control budget for AI Gateway calls that counts money the
 * gateway actually billed, not tokens you happened to receive.
 *
 * Failure modes solved:
 *
 *   1. The spend you never saw. AI Gateway records a generation's final status
 *      server-side. From the gateway docs shipped in @ai-sdk/gateway@4.0.31:
 *      "the generation ID is injected on the first content chunk, so you can
 *      capture it early in the stream ... since the gateway records the final
 *      status server-side, you can use the generation ID to look up the
 *      results (including cost, token usage, and finish reason) later via
 *      getGenerationInfo()." The corollary is the bug: a stream that dies
 *      mid-flight bills you and returns no usage object, so a ledger that
 *      meters `result.usage` after a successful await counts zero for the
 *      calls most likely to be expensive. Release the hold on error and the
 *      budget reads healthy while the invoice climbs.
 *
 *   2. Tokens are not dollars. With gateway `models: [...]` fallbacks or
 *      `sort: "cost"`, the model that served the request is chosen at request
 *      time and is not the one you priced. Cached, reasoning, and
 *      cache-creation tokens each bill differently again. GatewayGenerationInfo
 *      carries `totalCost` in USD directly, so the only correct meter is the
 *      one that reconciles against it.
 *
 *   3. The runaway agent loop. Each turn looks affordable on its own, and
 *      nothing between turn 3 and turn 300 says stop. Metering after the fact
 *      cannot stop anything; a hold taken BEFORE the call, counted against the
 *      cap while in flight, is what turns a runaway loop into a refused
 *      admission instead of a billing incident.
 *
 *   4. Float drift in the ledger itself. Costs arrive as USD floats and a few
 *      thousand additions of 0.0021 do not sum to what you expect. Everything
 *      here is integer micro-dollars internally; USD is a boundary format.
 *
 * Pure logic, no network, no SDK imports. Run it: `bun run spend-ledger.ts`.
 * The routing half lives in routing-policy.ts.
 */

const MICROS_PER_USD = 1_000_000;

const toMicros = (usd: number): number => Math.round(usd * MICROS_PER_USD);
const toUsd = (micros: number): number => micros / MICROS_PER_USD;

export type HoldStatus = "open" | "reconciled" | "written-off";

export interface Hold {
  readonly id: string;
  readonly label: string;
  status: HoldStatus;
  /** Pessimistic amount reserved up front, in micro-dollars. */
  readonly reservedMicros: number;
  /** Real cost once known, in micro-dollars. */
  settledMicros: number | null;
  /** The gateway's generation id, once the first chunk revealed it. */
  generationId: string | null;
  readonly openedAt: number;
}

export interface AdmissionRefused {
  readonly ok: false;
  readonly reason: "cap-would-be-breached";
  readonly capUsd: number;
  readonly wouldReachUsd: number;
}

export interface AdmissionGranted {
  readonly ok: true;
  readonly hold: Hold;
}

export interface SpendLedgerOptions {
  readonly capUsd: number;
  /**
   * Reserved per call. Set it to a realistic worst case for your longest
   * allowed completion, not an average: an under-sized hold is a cap that
   * only bites after the money is gone.
   */
  readonly holdUsd: number;
  /**
   * A hold open longer than this is presumed to be a call whose result never
   * came back. sweep() writes it off at the full reserved amount, which is the
   * only direction that cannot understate the bill.
   */
  readonly staleHoldMs: number;
  readonly now?: () => number;
}

export interface SpendLedger {
  /** Reserve budget before the call. Refuses rather than letting it through. */
  readonly admit: (label: string) => AdmissionGranted | AdmissionRefused;
  /** Attach the gateway generation id the moment the first chunk carries it. */
  readonly recordGeneration: (holdId: string, generationId: string) => void;
  /** Replace a hold with the gateway's own totalCost. */
  readonly reconcile: (holdId: string, actualUsd: number) => void;
  /**
   * Write off stale holds and return the generation ids still owed a
   * getGenerationInfo() lookup. A hold with no generation id at all was a call
   * that never reached the gateway, so it is released rather than written off.
   */
  readonly sweep: () => { writtenOff: string[]; needsLookup: string[] };
  readonly committedUsd: () => number;
  /** Committed plus everything still reserved. This is what the cap guards. */
  readonly exposureUsd: () => number;
  readonly openHolds: () => Hold[];
}

export function createSpendLedger(options: SpendLedgerOptions): SpendLedger {
  const now = options.now ?? Date.now;
  const capMicros = toMicros(options.capUsd);
  const holdMicros = toMicros(options.holdUsd);
  const holds = new Map<string, Hold>();
  let committedMicros = 0;
  let seq = 0;

  const outstandingMicros = (): number => {
    let sum = 0;
    for (const hold of holds.values()) {
      if (hold.status === "open") sum += hold.reservedMicros;
    }
    return sum;
  };

  const exposureMicros = (): number => committedMicros + outstandingMicros();

  return {
    admit: (label) => {
      const projected = exposureMicros() + holdMicros;
      if (projected > capMicros) {
        return {
          ok: false,
          reason: "cap-would-be-breached",
          capUsd: options.capUsd,
          wouldReachUsd: toUsd(projected),
        };
      }
      seq += 1;
      const hold: Hold = {
        id: `hold_${seq}`,
        label,
        status: "open",
        reservedMicros: holdMicros,
        settledMicros: null,
        generationId: null,
        openedAt: now(),
      };
      holds.set(hold.id, hold);
      return { ok: true, hold };
    },

    recordGeneration: (holdId, generationId) => {
      const hold = holds.get(holdId);
      if (hold) hold.generationId = generationId;
    },

    reconcile: (holdId, actualUsd) => {
      const hold = holds.get(holdId);
      if (!hold || hold.status !== "open") return;
      hold.status = "reconciled";
      hold.settledMicros = toMicros(actualUsd);
      committedMicros += hold.settledMicros;
    },

    sweep: () => {
      const deadline = now() - options.staleHoldMs;
      const writtenOff: string[] = [];
      const needsLookup: string[] = [];
      for (const hold of holds.values()) {
        if (hold.status !== "open" || hold.openedAt > deadline) continue;
        if (hold.generationId === null) {
          // No generation id means the request never reached the gateway, so
          // there is nothing to be billed for. Release it.
          holds.delete(hold.id);
          continue;
        }
        hold.status = "written-off";
        hold.settledMicros = hold.reservedMicros;
        committedMicros += hold.reservedMicros;
        writtenOff.push(hold.id);
        needsLookup.push(hold.generationId);
      }
      return { writtenOff, needsLookup };
    },

    committedUsd: () => toUsd(committedMicros),
    exposureUsd: () => toUsd(exposureMicros()),
    openHolds: () =>
      [...holds.values()].filter((hold) => hold.status === "open"),
  };
}

// ---------------------------------------------------------------------------
// demo: bun run spend-ledger.ts
// ---------------------------------------------------------------------------

let failures = 0;

function check(name: string, ok: boolean, detail: string): void {
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}\n      ${detail}`);
}

const usd = (n: number) => `$${n.toFixed(4)}`;

function demo(): void {
  // 1. The meter everyone writes: sum usage after the await, skip the failures.
  //    Two of six turns die mid-stream. The gateway billed all six.
  {
    const perTurnUsd = [0.019, 0.024, 0.031, 0.022, 0.028, 0.02];
    const diedMidStream = new Set([2, 4]);
    let metered = 0;
    for (const [turn, cost] of perTurnUsd.entries()) {
      if (diedMidStream.has(turn)) continue; // no usage object, nothing counted
      metered += cost;
    }
    const actuallyBilled = perTurnUsd.reduce((a, b) => a + b, 0);
    check(
      "post-hoc usage metering undercounts every dropped stream",
      metered < actuallyBilled &&
        Math.abs(actuallyBilled - metered - 0.059) < 1e-9,
      `meter read ${usd(metered)} against a real bill of ${usd(actuallyBilled)}, missing ${usd(actuallyBilled - metered)}`,
    );
  }

  // 2. The same six turns through the ledger. The two dropped streams captured
  //    a generation id from their first chunk, so the sweep writes them off and
  //    hands back the ids to reconcile against getGenerationInfo().
  {
    let clock = 5_000_000;
    const ledger = createSpendLedger({
      capUsd: 1,
      holdUsd: 0.05,
      staleHoldMs: 120_000,
      now: () => clock,
    });
    const perTurnUsd = [0.019, 0.024, 0.031, 0.022, 0.028, 0.02];
    const diedMidStream = new Set([2, 4]);
    for (const [turn, cost] of perTurnUsd.entries()) {
      const admission = ledger.admit(`turn-${turn}`);
      if (!admission.ok) break;
      // First content chunk carries providerMetadata.gateway.generationId.
      ledger.recordGeneration(admission.hold.id, `gen_01JQE${turn}`);
      if (diedMidStream.has(turn)) continue; // stream died; hold stays open
      ledger.reconcile(admission.hold.id, cost);
    }
    const before = ledger.committedUsd();
    clock += 200_000;
    const swept = ledger.sweep();
    check(
      "dropped streams stay on the books and surface for lookup",
      swept.writtenOff.length === 2 &&
        swept.needsLookup.join(",") === "gen_01JQE2,gen_01JQE4" &&
        ledger.committedUsd() > before,
      `swept 2 stale holds, committed ${usd(before)} -> ${usd(ledger.committedUsd())}, owed lookups: ${swept.needsLookup.join(", ")}`,
    );
  }

  // 3. Reconciling below the hold frees capacity. A cheap turn should not keep
  //    reserving a worst case it did not use.
  {
    const ledger = createSpendLedger({
      capUsd: 0.2,
      holdUsd: 0.05,
      staleHoldMs: 60_000,
    });
    const a = ledger.admit("turn-0");
    if (!a.ok) throw new Error("first admission must succeed");
    const exposureWhileOpen = ledger.exposureUsd();
    ledger.reconcile(a.hold.id, 0.004);
    check(
      "reconciling under the hold returns the difference to the cap",
      exposureWhileOpen === 0.05 && ledger.exposureUsd() === 0.004,
      `exposure ${usd(exposureWhileOpen)} while in flight, ${usd(ledger.exposureUsd())} once the real cost was known`,
    );
  }

  // 4. A reasoning-heavy turn overshoots the hold. The cap must be enforced
  //    against what happened, not what was estimated.
  {
    const ledger = createSpendLedger({
      capUsd: 0.2,
      holdUsd: 0.05,
      staleHoldMs: 60_000,
    });
    const a = ledger.admit("deep-turn");
    if (!a.ok) throw new Error("first admission must succeed");
    ledger.reconcile(a.hold.id, 0.18); // long reasoning trace, 3.6x the hold
    const next = ledger.admit("turn-1");
    check(
      "an overshooting turn tightens the cap immediately",
      ledger.committedUsd() === 0.18 && !next.ok,
      `committed ${usd(ledger.committedUsd())} against a ${usd(0.2)} cap, next admission refused`,
    );
  }

  // 5. Admission control on a genuine runaway. 500 turns, a $5 cap, a $0.05
  //    hold, every turn reconciling at exactly the hold. It stops at 100 and
  //    the cap is never exceeded, which post-hoc metering cannot promise.
  {
    const ledger = createSpendLedger({
      capUsd: 5,
      holdUsd: 0.05,
      staleHoldMs: 60_000,
    });
    let admitted = 0;
    let refusal: AdmissionRefused | null = null;
    for (let turn = 0; turn < 500; turn += 1) {
      const admission = ledger.admit(`runaway-${turn}`);
      if (!admission.ok) {
        refusal = admission;
        break;
      }
      admitted += 1;
      ledger.recordGeneration(admission.hold.id, `gen_run_${turn}`);
      ledger.reconcile(admission.hold.id, 0.05);
    }
    check(
      "a runaway loop is refused admission before it breaches the cap",
      admitted === 100 &&
        ledger.committedUsd() === 5 &&
        refusal?.reason === "cap-would-be-breached",
      `admitted ${admitted} of 500 turns, committed ${usd(ledger.committedUsd())}, turn ${admitted} refused at ${usd(refusal?.wouldReachUsd ?? 0)}`,
    );
  }

  // 6. In-flight calls count against the cap. Ten concurrent turns on a $0.4
  //    cap with a $0.05 hold admits eight and refuses the ninth, before any
  //    of them have returned a cost.
  {
    const ledger = createSpendLedger({
      capUsd: 0.4,
      holdUsd: 0.05,
      staleHoldMs: 60_000,
    });
    const outcomes = Array.from({ length: 10 }, (_, i) =>
      ledger.admit(`concurrent-${i}`),
    );
    const granted = outcomes.filter((o) => o.ok).length;
    check(
      "concurrent in-flight calls are counted while still open",
      granted === 8 &&
        ledger.committedUsd() === 0 &&
        ledger.exposureUsd() === 0.4,
      `${granted} of 10 admitted, ${usd(ledger.committedUsd())} committed but ${usd(ledger.exposureUsd())} exposed`,
    );
  }

  // 7. A call that never reached the gateway carries no generation id, so the
  //    sweep releases it instead of billing you for a request nobody served.
  {
    let clock = 9_000_000;
    const ledger = createSpendLedger({
      capUsd: 1,
      holdUsd: 0.05,
      staleHoldMs: 30_000,
      now: () => clock,
    });
    const a = ledger.admit("dns-failure");
    if (!a.ok) throw new Error("first admission must succeed");
    clock += 40_000;
    const swept = ledger.sweep();
    check(
      "a hold with no generation id is released, not written off",
      swept.writtenOff.length === 0 &&
        ledger.committedUsd() === 0 &&
        ledger.openHolds().length === 0,
      `nothing written off, committed stayed ${usd(ledger.committedUsd())}, ${ledger.openHolds().length} holds left open`,
    );
  }

  // 8. Float drift. A thousand reconciliations of $0.0021 must sum exactly.
  {
    const ledger = createSpendLedger({
      capUsd: 100,
      holdUsd: 0.01,
      staleHoldMs: 60_000,
    });
    for (let i = 0; i < 1000; i += 1) {
      const a = ledger.admit(`drift-${i}`);
      if (!a.ok) throw new Error("cap is large enough to admit all 1000");
      ledger.reconcile(a.hold.id, 0.0021);
    }
    const naive = Array.from({ length: 1000 }, () => 0.0021).reduce(
      (x, y) => x + y,
      0,
    );
    check(
      "micro-dollar accounting sums exactly where float addition does not",
      ledger.committedUsd() === 2.1 && naive !== 2.1,
      `ledger ${usd(ledger.committedUsd())} exactly, naive float sum ${naive}`,
    );
  }

  console.log(
    failures === 0
      ? "\nspend-ledger.ts: all properties verified"
      : `\nspend-ledger.ts: ${failures} FAILED`,
  );
  if (failures > 0) process.exit(1);
}

if (import.meta.main) demo();
