/**
 * Post-response work on Vercel, with the two things `waitUntil` will not tell
 * you made explicit: whether it is wired at all, and how much of the
 * invocation's duration budget is left to spend.
 *
 * Failure modes solved:
 *
 *   1. SILENT NO-OP. `waitUntil` is not a runtime primitive, it is a lookup.
 *      The shipped implementation in @vercel/functions 3.7.6
 *      (node_modules/@vercel/functions/wait-until.js) is exactly:
 *
 *        const waitUntil = (promise) => {
 *          if (promise === null || typeof promise !== "object" ||
 *              typeof promise.then !== "function") {
 *            throw new TypeError(...);
 *          }
 *          return getContext().waitUntil?.(promise);
 *        };
 *
 *      and `getContext` (get-context.js) is:
 *
 *        const SYMBOL_FOR_REQ_CONTEXT = Symbol.for("@vercel/request-context");
 *        function getContext() {
 *          return globalThis[SYMBOL_FOR_REQ_CONTEXT]?.get?.() ?? {};
 *        }
 *
 *      Read the `?.` on `waitUntil`. When the runtime has not installed the
 *      symbol, or when `get()` returns a context that has no `waitUntil`, the
 *      call does nothing, throws nothing, warns nothing, and returns
 *      `undefined`. The declared return type is `void | undefined`, so there is
 *      no value to check either. Your promise is now an ordinary floating
 *      promise, which is the precise failure `waitUntil` was added to prevent.
 *
 *      The context is per invocation, and the runtime resolves it through a
 *      per-request store, so it does follow `await`, timers, and promise
 *      chains started inside the handler. What it does not follow is code that
 *      never ran inside a request in the first place: a `setInterval` drain
 *      loop started at module load, a listener registered during cold start,
 *      a queue flushed by a timer that outlived the request that filled it.
 *      Those run in the root context, `get()` returns nothing, and every
 *      `waitUntil` in them is a no-op even while the instance is busy serving
 *      traffic. The same is true anywhere the symbol is simply absent: a unit
 *      test, a self-hosted Node server, another platform. Nothing in that list
 *      produces an error, so the first evidence is a production analytics table
 *      that is quietly 4% short.
 *
 *   2. BUDGET SPENT BEFORE IT STARTS. Per the Fluid compute docs, "Promises
 *      passed to waitUntil() will have the same timeout as the function itself.
 *      If the function times out, the promises will be cancelled."
 *      (https://vercel.com/docs/fluid-compute). Same timeout means shared, not
 *      extended. A handler that spent 280 seconds of a 300 second limit hands
 *      the background task 20 seconds, not 300, and when the limit hits, the
 *      cancellation is invisible: the response already went out 200, no
 *      invocation is marked failed, nothing retries.
 *
 * This module makes both computable. `resolveWaitUntil` reads the same symbol
 * the SDK reads, so "is background work actually possible here" becomes a
 * boolean instead of an assumption. `planBackgroundTask` turns the remaining
 * budget and the task's durability class into one of three decisions, and
 * refuses the class of work that should never have been backgrounded at all.
 *
 * Verified against @vercel/functions 3.7.6 (shipped wait-until.js,
 * get-context.js, and the `waitUntil: (promise: Promise<unknown>) => void |
 * undefined` signature in wait-until.d.ts).
 *
 * Run the self-check: `bun run background.ts`
 */

/** The exact symbol @vercel/functions looks up. Not ours to rename. */
export const REQUEST_CONTEXT = Symbol.for("@vercel/request-context");

type RequestContext = {
  waitUntil?: (promise: Promise<unknown>) => void;
};

type ContextHost = {
  [REQUEST_CONTEXT]?: { get?: () => RequestContext | undefined };
};

/**
 * The detection the SDK does not expose. Mirrors `getContext().waitUntil`
 * exactly, but returns the function (or null) instead of swallowing the
 * absence behind optional chaining.
 *
 * Call this INSIDE the request, at the point you are about to schedule work.
 * The answer is not a property of the deployment, it is a property of the
 * async context you are standing in, which is why hoisting the check to module
 * scope reports `false` on a perfectly healthy Fluid instance.
 */
export function resolveWaitUntil(
  host: ContextHost = globalThis as ContextHost,
): ((promise: Promise<unknown>) => void) | null {
  const waitUntil = host[REQUEST_CONTEXT]?.get?.()?.waitUntil;
  return typeof waitUntil === "function" ? waitUntil : null;
}

/**
 * The classification that decides everything downstream, and the only field a
 * caller has to think about.
 *
 *   "losable": a page view, a log line, a cache warm, an optional CDN purge.
 *   Losing one in a thousand is a rounding error.
 *
 *   "must-not-lose": an outbound webhook, an audit row, a billing meter, a
 *   receipt, a search index update a customer will look for. Anything you
 *   would have written a retry loop for if it ran inline.
 *
 * There is no third class. Work that is "important but probably fine" is
 * must-not-lose, and the planner will say so.
 */
export type TaskDurability = "losable" | "must-not-lose";

export type TaskPlan =
  /** Hand to waitUntil. It is wired, and the work fits in what is left. */
  | { action: "background"; budgetMs: number }
  /** Await before responding. Slower response, but the work actually happens. */
  | { action: "inline"; budgetMs: number; reason: string }
  /** Do not start it here at all. Commit a durable record instead. */
  | { action: "reject"; reason: string };

export type PlanInput = {
  durability: TaskDurability;
  /** Honest p99, not the median. The planner is only as good as this number. */
  estimatedMs: number;
  /** Epoch ms at which this invocation's duration limit expires. */
  deadlineAt: number;
  now: number;
  /** Result of `resolveWaitUntil()`, evaluated in this async context. */
  waitUntilWired: boolean;
  /**
   * Held back from the deadline so a task that finishes "just in time" still
   * has room to flush its socket and for the platform to notice. Cancellation
   * at the limit is silent, so the margin is the only thing standing between a
   * near miss and a disappeared write.
   */
  safetyMarginMs?: number;
};

export function planBackgroundTask(input: PlanInput): TaskPlan {
  const margin = input.safetyMarginMs ?? 2_000;
  const budgetMs = input.deadlineAt - input.now - margin;

  /**
   * Checked first, deliberately. This is a boundary, not an optimization, and
   * it does not become safe because there happens to be budget today. A
   * cancelled waitUntil promise produces no failed invocation, no dead letter,
   * and no retry, so durability requirements cannot be met by anything that
   * runs inside the request's lifetime. The correct shape is a row committed in
   * the same transaction as the write that caused it, drained by a consumer.
   */
  if (input.durability === "must-not-lose") {
    return {
      action: "reject",
      reason:
        "durability requires a committed record: waitUntil work is cancelled without a signal when the function times out",
    };
  }

  if (budgetMs <= 0) {
    return {
      action: "reject",
      reason: `no budget left: ${input.deadlineAt - input.now}ms to the duration limit, under the ${margin}ms safety margin`,
    };
  }

  /**
   * Starting work that provably cannot finish is worse than skipping it: it
   * burns the instance's remaining time, holds any connection it opened, and
   * still loses the result. Skip it and say why.
   */
  if (input.estimatedMs > budgetMs) {
    return {
      action: "reject",
      reason: `task needs ~${input.estimatedMs}ms, only ${budgetMs}ms of budget remains`,
    };
  }

  /**
   * The case the SDK hides. Not wired means a bare `waitUntil(p)` here is a
   * no-op and `p` is a floating promise, so the choice is not "background or
   * inline", it is "inline or lose it". Latency is the cheaper failure.
   */
  if (!input.waitUntilWired) {
    return {
      action: "inline",
      budgetMs,
      reason:
        "no request context on globalThis[Symbol.for('@vercel/request-context')]: waitUntil would silently no-op here",
    };
  }

  return { action: "background", budgetMs };
}

export type TaskOutcome = {
  name: string;
  plan: TaskPlan["action"];
  reason?: string;
};

/**
 * The runner. Constructed once per invocation, at the top of the handler, so
 * `startedAt` is the invocation's own start rather than the instance's, which
 * on Fluid is a different and much older number.
 */
export function createBackgroundRunner(options: {
  /** The route's configured maxDuration, in milliseconds. */
  maxDurationMs: number;
  /**
   * Pass `waitUntil` from @vercel/functions. Kept as a parameter rather than
   * imported so this module has no dependencies and its self-check runs
   * anywhere, and so a test can hand in a fake.
   */
  waitUntil?: (promise: Promise<unknown>) => void;
  now?: () => number;
  safetyMarginMs?: number;
  onOutcome?: (outcome: TaskOutcome) => void;
}) {
  const now = options.now ?? Date.now;
  const startedAt = now();
  const deadlineAt = startedAt + options.maxDurationMs;
  const outcomes: TaskOutcome[] = [];

  return {
    deadlineAt,
    outcomes,

    /**
     * Schedules `run` according to the plan, and returns the plan so the caller
     * can react to a rejection (write an outbox row, raise a metric) instead of
     * discovering it in a log.
     *
     * `run` receives an AbortSignal wired to the remaining budget. Nothing
     * cancels a promise for you: `fetch` honours the signal, most drivers do
     * not, so this is a best effort that at least stops the HTTP calls.
     */
    async schedule(
      name: string,
      task: {
        durability: TaskDurability;
        estimatedMs: number;
        run: (signal: AbortSignal) => Promise<unknown>;
      },
    ): Promise<TaskPlan> {
      const plan = planBackgroundTask({
        durability: task.durability,
        estimatedMs: task.estimatedMs,
        deadlineAt,
        now: now(),
        waitUntilWired: resolveWaitUntil() !== null,
        safetyMarginMs: options.safetyMarginMs,
      });

      const outcome: TaskOutcome = {
        name,
        plan: plan.action,
        reason: plan.action === "background" ? undefined : plan.reason,
      };
      outcomes.push(outcome);
      options.onOutcome?.(outcome);

      if (plan.action === "reject") return plan;

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), plan.budgetMs);
      const settled = task
        .run(controller.signal)
        .catch((error: unknown) => {
          /**
           * Not decoration. An unhandled rejection inside a promise handed to
           * waitUntil reaches the process-level handler, and under Fluid that
           * stops the process after draining, taking a healthy instance with it.
           */
          console.error(`background task ${name} failed`, error);
        })
        .finally(() => clearTimeout(timer));

      if (plan.action === "inline") {
        await settled;
        return plan;
      }

      /**
       * The one call site for the SDK function in this module. By here we have
       * already proved the context exists, so this cannot be the silent no-op.
       */
      options.waitUntil?.(settled);
      return plan;
    },
  };
}

// ---------------------------------------------------------------------------
// self-check
// ---------------------------------------------------------------------------

/**
 * A fake Vercel instance. Installs the same symbol the platform installs,
 * resolves it through AsyncLocalStorage the way a per-request store does, and
 * models the freeze: when the invocation ends, registered promises are awaited
 * and anything else stops being able to observe the world.
 */
async function demo(): Promise<void> {
  const { AsyncLocalStorage } = await import("node:async_hooks");
  const store = new AsyncLocalStorage<RequestContext>();
  (globalThis as ContextHost)[REQUEST_CONTEXT] = {
    get: () => store.getStore(),
  };

  let failures = 0;
  const check = (label: string, ok: boolean, detail: string) => {
    if (!ok) failures++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${label}: ${detail}`);
  };
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  // The analytics table every one of these tasks is trying to write to.
  let frozen = false;
  const rows: string[] = [];
  const writeRow = (row: string) => {
    if (frozen) return; // after the freeze the instance cannot observe anything
    rows.push(row);
  };

  // 1. Detection is a property of the async context, not the deployment.
  check(
    "no context outside a request",
    resolveWaitUntil() === null,
    "resolveWaitUntil at module scope returns null, so a bare waitUntil() here is the documented no-op",
  );

  // 2. The trap: a drain loop started at module load, running alongside a live
  //    request. This is the shape Fluid actively encourages, because module
  //    scope now survives between invocations.
  const moduleScopeQueue: string[] = [];
  const drainTimer = setInterval(() => {
    if (moduleScopeQueue.length === 0) return;
    moduleScopeQueue.length = 0;
    check(
      "no context in a module-scope drain loop",
      resolveWaitUntil() === null,
      "the instance is mid-request, but this interval never ran inside one, so waitUntil() here drops every promise",
    );
  }, 5);

  await new Promise<void>((done) => {
    const registered: Promise<unknown>[] = [];
    store.run({ waitUntil: (p) => registered.push(p) }, async () => {
      check(
        "context inside a request",
        resolveWaitUntil() !== null,
        "the same call inside store.run resolves a real waitUntil",
      );
      moduleScopeQueue.push("flush-me");

      // 3. A floating promise versus a registered one, across the freeze. The
      //    floating one is slower, which is exactly why it is the one that dies.
      void (async () => {
        await sleep(80);
        writeRow("floating");
      })();
      registered.push(
        (async () => {
          await sleep(20);
          writeRow("registered");
        })(),
      );

      await sleep(5); // handler returns its response here
      await Promise.all(registered); // the platform drains what it was told about
      frozen = true;
      await sleep(100); // the floating promise resolves into a frozen instance

      check(
        "floating promise is lost at the freeze",
        !rows.includes("floating") && rows.includes("registered"),
        `rows written: [${rows.join(", ")}]`,
      );
      clearInterval(drainTimer);
      done();
    });
  });

  // 4. Planner: must-not-lose is refused regardless of available budget.
  {
    const plan = planBackgroundTask({
      durability: "must-not-lose",
      estimatedMs: 5,
      deadlineAt: 300_000,
      now: 0,
      waitUntilWired: true,
    });
    check(
      "must-not-lose is refused",
      plan.action === "reject",
      `298s of budget and a 5ms task, still rejected: ${plan.action === "reject" ? plan.reason : ""}`,
    );
  }

  // 5. Planner: unwired context downgrades to inline instead of dropping.
  {
    const plan = planBackgroundTask({
      durability: "losable",
      estimatedMs: 40,
      deadlineAt: 300_000,
      now: 0,
      waitUntilWired: false,
    });
    check(
      "unwired downgrades to inline",
      plan.action === "inline",
      `action=${plan.action}, which costs 40ms of response latency instead of losing the row`,
    );
  }

  // 6. Planner: the budget is what remains, not what the route was configured for.
  {
    const plan = planBackgroundTask({
      durability: "losable",
      estimatedMs: 8_000,
      deadlineAt: 300_000,
      now: 295_000,
      waitUntilWired: true,
    });
    check(
      "a task larger than the remainder is refused",
      plan.action === "reject",
      `maxDuration was 300s but 295s are gone: ${plan.action === "reject" ? plan.reason : ""}`,
    );
  }

  // 7. Runner end to end, with a fake clock so the assertion is exact.
  {
    const registered: Promise<unknown>[] = [];
    const written: string[] = [];
    let clock = 1_000_000;
    await store.run({ waitUntil: (p) => registered.push(p) }, async () => {
      const runner = createBackgroundRunner({
        maxDurationMs: 300_000,
        now: () => clock,
        waitUntil: (p) => registered.push(p),
      });
      await runner.schedule("page-view", {
        durability: "losable",
        estimatedMs: 30,
        run: async () => written.push("page-view"),
      });
      await runner.schedule("receipt-email", {
        durability: "must-not-lose",
        estimatedMs: 200,
        run: async () => written.push("receipt-email"),
      });
      clock += 299_500; // the handler turned out to be slow
      await runner.schedule("cache-warm", {
        durability: "losable",
        estimatedMs: 100,
        run: async () => written.push("cache-warm"),
      });
      await Promise.all(registered);
      const plans = runner.outcomes
        .map((o) => `${o.name}=${o.plan}`)
        .join(", ");
      check(
        "runner routes three tasks three ways",
        plans ===
          "page-view=background, receipt-email=reject, cache-warm=reject" &&
          written.includes("page-view") &&
          !written.includes("receipt-email") &&
          !written.includes("cache-warm"),
        `plans: ${plans}`,
      );
    });
  }

  console.log(
    failures === 0
      ? "background.ts: all properties verified"
      : `background.ts: ${failures} check(s) failed`,
  );
  if (failures > 0) process.exit(1);
}

if (import.meta.main) {
  demo().catch((error) => {
    console.error("demo failed", error);
    process.exit(1);
  });
}
