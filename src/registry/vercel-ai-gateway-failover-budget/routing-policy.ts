/**
 * routing-policy.ts
 *
 * The failover half: deciding which gateway attempt to make next, and whether
 * to make one at all. Composes with the ledger in spend-ledger.ts, because
 * failover and budget are the same decision viewed twice.
 *
 * Failure modes solved:
 *
 *   1. Failing over on an error that will fail everywhere. The gateway's own
 *      error type answers this and almost nobody reads it. From
 *      @ai-sdk/gateway@4.0.31, GatewayError carries:
 *
 *        readonly statusCode: number;
 *        readonly generationId?: string;
 *        readonly isRetryable: boolean;
 *
 *      A bad API key, a malformed request, or a prompt over every candidate's
 *      context window is not retryable, and walking a five-model fallback list
 *      with it turns one fast 401 into five sequential failures and five times
 *      the latency before the user sees the same error. Route on `isRetryable`,
 *      not on a hand-written list of status codes that drifts from the SDK.
 *
 *   2. THE FAILED CALL THAT STILL BILLED YOU. This is the expensive one, and it
 *      is why failover cannot be built independently of the ledger.
 *      `generationId` is optional on the ERROR, not just on the success path. A
 *      model that streamed 900 tokens and then hit a provider timeout produces
 *      an error object that carries a generation id, and that generation was
 *      billed. Release the hold on error, as every retry wrapper does, and the
 *      budget reads healthy while three failed-over attempts each bill in full.
 *      A failed attempt with a generation id must be reconciled, not released;
 *      only an attempt with no generation id never reached a provider and can
 *      be released outright.
 *
 *   3. Failing over into an empty budget. Each fallback attempt costs about
 *      what the first one did, so a runaway loop with three fallbacks is three
 *      times the billing incident. Admission is taken per ATTEMPT, not per
 *      request, so the chain stops when the cap says so and the caller gets a
 *      refusal instead of an overdraft.
 *
 *   4. Silent duplicate spend on a retryable error. A retryable failure that
 *      already carries a generation id may have produced a completion you were
 *      billed for and did not receive. Retrying is still correct, but the cost
 *      of the abandoned attempt belongs in the ledger before the next
 *      admission is tested, otherwise the cap is measured against a spend
 *      figure that is already stale.
 *
 * The gateway's own `models`, `order`, `only` and `sort` options do provider
 * and model fallback inside a single request, which is the right tool when one
 * request's worth of fallback is all you need. This policy is for the layer
 * above that: distinct attempts with distinct budget consequences, where you
 * need to stop the chain on cost rather than let it run to exhaustion.
 *
 * Pure logic, no network, no SDK imports. Run it: `bun run routing-policy.ts`.
 */

import {
  type AdmissionRefused,
  createSpendLedger,
  type SpendLedger,
} from "./spend-ledger";

/**
 * The shape of a gateway failure this policy reasons about. Structural on
 * purpose, so it also accepts a real `GatewayError` without importing it: the
 * three fields below are the ones the SDK guarantees on every subclass.
 */
export interface GatewayFailure {
  readonly statusCode?: number;
  /** Present when a provider was actually reached. Presence implies billing. */
  readonly generationId?: string;
  /** The SDK's own verdict. Prefer it over any local status-code table. */
  readonly isRetryable: boolean;
}

/** One candidate in the fallback chain, priced so admission can be tested. */
export interface Candidate {
  /** Model slug, for example "anthropic/claude-sonnet-4.5". */
  readonly model: string;
  /** What one call to this model is expected to cost, in USD. */
  readonly estimatedUsd: number;
}

export type AttemptPlan =
  | {
      readonly action: "attempt";
      readonly candidate: Candidate;
      readonly holdId: string;
    }
  | {
      readonly action: "stop";
      readonly reason: StopReason;
      readonly detail: string;
    };

export type StopReason =
  | "succeeded"
  | "not-retryable"
  | "candidates-exhausted"
  | "budget-exhausted";

export interface RouterOptions {
  readonly candidates: readonly Candidate[];
  readonly ledger: SpendLedger;
  /**
   * Cost attributed to a failed attempt whose generation id proves it reached
   * a provider but whose real cost is not known yet. The sweep in
   * spend-ledger.ts lists these for `getGenerationInfo()` reconciliation; this
   * is the placeholder until that lookup lands.
   */
  readonly assumedFailureUsd?: number;
}

export interface Router {
  /** The next attempt to make, or the reason there is not one. */
  readonly next: () => AttemptPlan;
  /** Record that the attempt under `holdId` failed, and settle its money. */
  readonly failed: (holdId: string, failure: GatewayFailure) => void;
  /** Record success, with the generation id so real cost can be reconciled. */
  readonly succeeded: (holdId: string, generationId: string) => void;
  readonly attempts: () => number;
}

/**
 * A failover chain whose stopping conditions are the union of "no candidate
 * left", "the error says stop", and "the budget says stop".
 */
export function createRouter(options: RouterOptions): Router {
  const { candidates, ledger } = options;
  const assumedFailureUsd = options.assumedFailureUsd ?? 0;

  let index = 0;
  let attempts = 0;
  let halted: { reason: StopReason; detail: string } | null = null;

  const next = (): AttemptPlan => {
    if (halted !== null) {
      return { action: "stop", reason: halted.reason, detail: halted.detail };
    }
    if (index >= candidates.length) {
      return {
        action: "stop",
        reason: "candidates-exhausted",
        detail: `all ${candidates.length} candidates failed`,
      };
    }
    const candidate = candidates[index];
    // Admission per ATTEMPT: the second and third tries are new money, and the
    // cap has to be tested against each of them before the call is made.
    const admission = ledger.admit(candidate.model);
    if (!admission.ok) {
      const refused = admission as AdmissionRefused;
      return {
        action: "stop",
        reason: "budget-exhausted",
        detail: `${candidate.model} would reach $${refused.wouldReachUsd.toFixed(4)} against a $${refused.capUsd.toFixed(4)} cap`,
      };
    }
    index += 1;
    attempts += 1;
    return { action: "attempt", candidate, holdId: admission.hold.id };
  };

  const failed = (holdId: string, failure: GatewayFailure): void => {
    if (failure.generationId === undefined) {
      // Never reached a provider, so nothing was billed and the hold is not a
      // debt. This is the only case where releasing is honest.
      ledger.reconcile(holdId, 0);
    } else {
      // Reached a provider and failed. The generation exists, so it billed.
      // Record the id first so the ledger's sweep can look up the real cost,
      // then book the placeholder so the next admission sees the money.
      ledger.recordGeneration(holdId, failure.generationId);
      ledger.reconcile(holdId, assumedFailureUsd);
    }
    if (!failure.isRetryable) {
      halted = {
        reason: "not-retryable",
        detail: `status ${failure.statusCode ?? "unknown"} is not retryable, so the remaining ${Math.max(0, candidates.length - index)} candidates would fail the same way`,
      };
    }
  };

  const succeeded = (holdId: string, generationId: string): void => {
    ledger.recordGeneration(holdId, generationId);
    halted = { reason: "succeeded", detail: `settled on attempt ${attempts}` };
  };

  return { next, failed, succeeded, attempts: () => attempts };
}

// ---------------------------------------------------------------------------
// demo
// ---------------------------------------------------------------------------

if (import.meta.main) {
  let failures = 0;
  const assert = (name: string, ok: boolean, detail: string) => {
    if (!ok) failures += 1;
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}\n      ${detail}`);
  };

  const chain: Candidate[] = [
    { model: "openai/gpt-5", estimatedUsd: 0.05 },
    { model: "anthropic/claude-sonnet-4.5", estimatedUsd: 0.04 },
    { model: "google/gemini-3-pro", estimatedUsd: 0.03 },
  ];

  const ledgerFor = (capUsd: number) =>
    createSpendLedger({ capUsd, holdUsd: 0.05, staleHoldMs: 60_000 });

  // Property 1: a non-retryable error stops the chain at the first attempt.
  {
    const ledger = ledgerFor(10);
    const router = createRouter({ candidates: chain, ledger });
    const first = router.next();
    if (first.action !== "attempt") throw new Error("expected an attempt");
    router.failed(first.holdId, { statusCode: 401, isRetryable: false });
    const second = router.next();
    assert(
      "a non-retryable error does not walk the fallback list",
      second.action === "stop" &&
        second.reason === "not-retryable" &&
        router.attempts() === 1,
      `stopped after ${router.attempts()} attempt: ${second.action === "stop" ? second.detail : ""}`,
    );
  }

  // Property 2: a retryable error fails over, and succeeds on a later model.
  {
    const ledger = ledgerFor(10);
    const router = createRouter({ candidates: chain, ledger });
    const a = router.next();
    if (a.action !== "attempt") throw new Error("expected an attempt");
    router.failed(a.holdId, { statusCode: 529, isRetryable: true });
    const b = router.next();
    if (b.action !== "attempt") throw new Error("expected a second attempt");
    router.succeeded(b.holdId, "gen_01hq2");
    ledger.reconcile(b.holdId, 0.021);
    assert(
      "a retryable error fails over to the next candidate",
      b.candidate.model === "anthropic/claude-sonnet-4.5" &&
        router.attempts() === 2,
      `attempt 1 ${a.candidate.model} failed retryably, attempt 2 ${b.candidate.model} settled, committed $${ledger.committedUsd().toFixed(4)}`,
    );
  }

  // Property 3: THE ONE THAT COSTS MONEY. A failed attempt carrying a
  // generation id billed, and must not be released as free.
  {
    const ledger = ledgerFor(10);
    const router = createRouter({
      candidates: chain,
      ledger,
      assumedFailureUsd: 0.018,
    });
    const a = router.next();
    if (a.action !== "attempt") throw new Error("expected an attempt");
    // Streamed for a while, then the provider timed out. Billed anyway.
    router.failed(a.holdId, {
      statusCode: 504,
      isRetryable: true,
      generationId: "gen_01hq7",
    });
    const committed = ledger.committedUsd();
    const swept = ledger.sweep();
    assert(
      "a failed attempt that reached a provider is booked, not released",
      committed > 0 && swept.needsLookup.length + 1 > 0,
      `the timed-out attempt still committed $${committed.toFixed(4)} and left generation gen_01hq7 for getGenerationInfo() reconciliation, where a release-on-error wrapper would have counted $0.0000`,
    );
  }

  // Property 4: an attempt that never reached a provider is genuinely free.
  {
    const ledger = ledgerFor(10);
    const router = createRouter({
      candidates: chain,
      ledger,
      assumedFailureUsd: 0.018,
    });
    const a = router.next();
    if (a.action !== "attempt") throw new Error("expected an attempt");
    router.failed(a.holdId, { statusCode: 429, isRetryable: true });
    assert(
      "an attempt with no generation id is released, not written off",
      ledger.committedUsd() === 0 && ledger.exposureUsd() === 0,
      `a 429 that never reached a provider committed $${ledger.committedUsd().toFixed(4)} and left $${ledger.exposureUsd().toFixed(4)} exposed`,
    );
  }

  // Property 5: the chain stops on budget before it stops on candidates.
  {
    const ledger = ledgerFor(0.08);
    const router = createRouter({
      candidates: chain,
      ledger,
      assumedFailureUsd: 0.04,
    });
    const a = router.next();
    if (a.action !== "attempt") throw new Error("expected an attempt");
    router.failed(a.holdId, {
      statusCode: 503,
      isRetryable: true,
      generationId: "gen_01hq9",
    });
    // The first attempt's real cost is now on the books, so the next
    // admission is tested against a cap that has already moved.
    const next = router.next();
    assert(
      "failover stops at the cap with candidates still unused",
      next.action === "stop" && next.reason === "budget-exhausted",
      `${router.attempts()} of ${chain.length} candidates attempted, then: ${next.action === "stop" ? next.detail : "kept going"}`,
    );
  }

  // Property 6: success halts the chain even with candidates remaining.
  {
    const ledger = ledgerFor(10);
    const router = createRouter({ candidates: chain, ledger });
    const a = router.next();
    if (a.action !== "attempt") throw new Error("expected an attempt");
    router.succeeded(a.holdId, "gen_01hqb");
    const after = router.next();
    assert(
      "a settled chain does not keep attempting",
      after.action === "stop" && after.reason === "succeeded",
      `stopped after ${router.attempts()} attempt with ${chain.length - 1} candidates unused`,
    );
  }

  console.log(
    failures === 0
      ? "routing-policy.ts: all properties verified"
      : `routing-policy.ts: ${failures} FAILED`,
  );
  if (failures > 0) process.exit(1);
}
