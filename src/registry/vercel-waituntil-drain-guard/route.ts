import { waitUntil } from "@vercel/functions";
import { createBackgroundRunner } from "./background";

/**
 * A checkout handler with three pieces of post-response work, routed three
 * different ways by the same call.
 *
 * The point of writing them side by side is that in almost every codebase they
 * are written identically:
 *
 *   waitUntil(track(...));
 *   waitUntil(sendReceipt(...));
 *   waitUntil(warmCache(...));
 *
 * Three lines that look like one decision, when they are three. The first is
 * fine. The second is a receipt the customer will ask about, scheduled on a
 * mechanism the docs describe as cancelled on timeout with no retry. The third
 * is fine in principle and pointless in practice, because by the time it runs
 * the invocation has usually spent its budget.
 *
 * Verified against @vercel/functions 3.7.6.
 * Docs: https://vercel.com/docs/functions/functions-api-reference/vercel-functions-package
 *       https://vercel.com/docs/fluid-compute
 */

/**
 * Keep this in sync with the route's configured maxDuration. It is not
 * readable at runtime, so it is a constant that has to be maintained by hand,
 * and getting it wrong in the optimistic direction is the failure this module
 * exists to catch. Vercel's Node.js default is 300s on Fluid, with 800s
 * available on Pro and Enterprise.
 *
 * export const maxDuration = 60;
 */
const MAX_DURATION_MS = 60_000;

type Order = { id: string; accountId: string; totalCents: number };

type Deps = {
  createOrder: (input: {
    accountId: string;
    totalCents: number;
  }) => Promise<Order>;
  /**
   * Commits an outbox row in the SAME transaction as the order. This is where
   * must-not-lose work goes, and the reason it is a separate dependency rather
   * than a background task is that the planner will refuse to background it.
   */
  enqueueDurable: (
    topic: string,
    payload: Record<string, unknown>,
  ) => Promise<void>;
  trackConversion: (order: Order, signal: AbortSignal) => Promise<void>;
  warmAccountCache: (accountId: string, signal: AbortSignal) => Promise<void>;
};

export async function handleCheckout(
  request: Request,
  deps: Deps,
): Promise<Response> {
  /**
   * Constructed first, before any awaits, so `startedAt` is the invocation's
   * start. Under Fluid the instance may be hours old; only the invocation's own
   * clock says anything about the remaining duration budget.
   */
  const background = createBackgroundRunner({
    maxDurationMs: MAX_DURATION_MS,
    /**
     * The SDK function is passed in rather than called directly, so the runner
     * decides whether calling it is meaningful. Calling it blind is what
     * produces the no-op: it returns `void | undefined` either way.
     */
    waitUntil,
    onOutcome: (outcome) => {
      if (outcome.plan === "background") return;
      console.warn("background task not backgrounded", outcome);
    },
  });

  const body = (await request.json()) as {
    accountId: string;
    totalCents: number;
  };

  const order = await deps.createOrder(body);

  /**
   * Losable. A missing conversion event moves a dashboard by a fraction of a
   * percent. It gets the remaining budget and an AbortSignal.
   */
  await background.schedule("track-conversion", {
    durability: "losable",
    estimatedMs: 250,
    run: (signal) => deps.trackConversion(order, signal),
  });

  /**
   * Must-not-lose, so `schedule` returns a rejection instead of running it and
   * the durable path is taken. Written as an explicit branch rather than a
   * comment, because the version that reads `waitUntil(sendReceipt(order))`
   * looks correct in review and fails only under the load that makes the
   * handler slow, which is the load where the receipt matters most.
   */
  const receipt = await background.schedule("send-receipt", {
    durability: "must-not-lose",
    estimatedMs: 900,
    run: async () => {
      throw new Error("unreachable: must-not-lose work is never backgrounded");
    },
  });
  if (receipt.action === "reject") {
    await deps.enqueueDurable("receipts", { orderId: order.id, schema: 1 });
  }

  /**
   * Losable, and last, which is the whole reason it is worth planning. If
   * `createOrder` took 58 of the 60 seconds, this is refused rather than
   * started and cancelled two seconds later. The refusal is logged by
   * `onOutcome`, so a route that keeps refusing its own tail work is visible
   * instead of being a mystery gap in cache hit rate.
   */
  await background.schedule("warm-cache", {
    durability: "losable",
    estimatedMs: 400,
    run: (signal) => deps.warmAccountCache(order.accountId, signal),
  });

  return Response.json({ orderId: order.id }, { status: 201 });
}

export async function POST(request: Request): Promise<Response> {
  return handleCheckout(request, resolveDeps());
}

/**
 * Wire to your own data layer. Split out so the handler above stays a pure
 * function of its dependencies and can be exercised without a deployment.
 */
function resolveDeps(): Deps {
  throw new Error("wire handleCheckout to your order store and outbox");
}
