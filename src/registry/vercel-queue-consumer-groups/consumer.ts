/**
 * Push mode consumer for the "orders" topic: ONE handler, ONE consumer group,
 * with a poison-message policy standing in for the dead letter queue that
 * Vercel Queues does not have.
 *
 * Pinned to @vercel/queue@0.4.0, public beta. Wire it up as exactly one route,
 * and read the warning under "one consumer group" before you copy that route
 * file anywhere:
 *
 * ```ts
 * // app/api/queues/fulfill-order/route.ts
 * import { createOrderConsumer } from "@/queue/consumer";
 * import { orderRepository } from "@/lib/orders";
 *
 * export const POST = createOrderConsumer(orderRepository);
 * ```
 *
 * ONE CONSUMER GROUP. From https://vercel.com/docs/queues/concepts:
 *
 *   "Multiple route files with the same topic create separate consumer groups,
 *    each receiving a copy of every message."
 *
 * That is fan-out, not load balancing, and it is the single most expensive
 * mistake available here because it looks like scaling. Duplicating this route
 * to "handle more throughput", or leaving a stale copy behind after a rename,
 * or adding a second service with a trigger on the same topic, does not split
 * the work. It doubles it, and every confirmation email sends twice. Vercel
 * already scales one group with fluid compute; use the per-group max
 * concurrency setting instead of a second route file. Grep for the topic name
 * across every vercel.json and nitro.config.ts before adding a trigger.
 *
 * DEPLOYMENT PARTITIONING. Topics are partitioned by deployment ID, and in
 * push mode Vercel delivers messages back to the same deployment that
 * published them. The docs present this as schema safety, and it is, but the
 * operational corollary bites during an incident: shipping a fix does NOT
 * repair the in-flight backlog. Old messages keep running the old deployment's
 * buggy handler until that backlog drains or its TTL expires. Producer-side
 * retention is therefore your real mean-time-to-recovery, which is why the
 * producer here sets 6 hours rather than accepting the 24 hour default.
 *
 * VISIBILITY TIMEOUT. Two different defaults, and material to get wrong. The
 * SDK defaults visibilityTimeoutSeconds to 300 and automatically re-extends
 * the lease while the handler is still running. The underlying HTTP Queues API
 * defaults to 60 seconds with no auto-extend. Handwriting a poll loop against
 * the raw API with an SDK-shaped mental model gives you duplicate deliveries
 * of everything that takes longer than a minute.
 *
 * ORDERING. Approximate write order only. There is no FIFO guarantee even
 * with a single consumer at max concurrency 1, and retried messages are
 * deprioritized below messages with no delivery attempts. Handlers must be
 * order-independent as well as idempotent.
 */

import { handleCallback } from "@vercel/queue";
import type { OrderMessage } from "./producer";

/**
 * Structural types so this file pins no ORM or mail vendor.
 *
 * `findOrder` returning null is the tell for the producer-side ordering bug:
 * on a correctly ordered producer the row is always committed before the
 * message exists, so a null here means either a genuine deletion or a
 * `send()`-before-commit somewhere upstream.
 */
export type FulfilmentDeps = {
  findOrder: (
    orderId: string,
  ) => Promise<{ id: string; accountId: string; fulfilled: boolean } | null>;
  fulfilOrder: (orderId: string) => Promise<void>;
  /**
   * Where acknowledged poison messages land. This is the DLQ, and it is your
   * job. Anything acknowledged without being recorded here is deleted with no
   * trace, which is worse than the retry loop it replaced.
   */
  recordPoisonMessage: (record: {
    messageId: string;
    topicName: string;
    orderId: string | null;
    deliveryCount: number;
    reason: string;
    error: string;
  }) => Promise<void>;
};

/**
 * Marks a failure as permanent. Retrying a malformed payload or a deleted
 * order cannot succeed on attempt 40 either, so it should never enter the
 * retry loop at all.
 */
export class PermanentFulfilmentError extends Error {
  constructor(
    readonly reason: string,
    message: string,
  ) {
    super(message);
    this.name = "PermanentFulfilmentError";
  }
}

/**
 * Hard ceiling on redelivery. Without a DLQ the only other stopping condition
 * is the message TTL, so a handler that always throws retries for the full
 * retention window. Vercel respects your configured retry delay for the first
 * 32 delivery attempts and forces exponential backoff after that, meaning an
 * uncapped poison message stays alive and billable for hours.
 */
const MAX_DELIVERIES = 8;

export function createOrderConsumer(deps: FulfilmentDeps) {
  return handleCallback(
    async (message: OrderMessage, metadata) => {
      // Reject before doing any work. A payload from a schema this deployment
      // does not understand is permanent by definition: no retry re-encodes it.
      if (message?.schema !== 1 || typeof message.orderId !== "string") {
        throw new PermanentFulfilmentError(
          "unrecognized-schema",
          `Message ${metadata.messageId} is not an orders/v1 payload`,
        );
      }

      try {
        const order = await deps.findOrder(message.orderId);

        if (!order) {
          // Deliberately permanent, and deliberately not a retry. The publish
          // ordering rule guarantees the row exists before the message does,
          // so a miss here is a real absence, not a race worth waiting out. If
          // this fires in volume the bug is a producer calling send() before
          // its write commits, and retrying only hides it.
          throw new PermanentFulfilmentError(
            "order-not-found",
            `Order ${message.orderId} does not exist`,
          );
        }

        // Delivery is at-least-once, so this runs more than once for some
        // messages under normal operation. Idempotence is not optional.
        if (order.fulfilled) return;

        await deps.fulfilOrder(order.id);
      } catch (error) {
        const terminal =
          error instanceof PermanentFulfilmentError ||
          metadata.deliveryCount >= MAX_DELIVERIES;

        if (!terminal) throw error;

        // Acknowledge with a record, not a silent drop. Recording is awaited
        // here, inside the handler, because the retry callback below is the
        // wrong place for it: returning normally from this handler is what
        // acknowledges the message, so the row is written before the message
        // stops existing. If recordPoisonMessage itself throws, the error
        // propagates and the message is retried, which is the correct failure
        // direction: never acknowledge what you could not write down.
        await deps.recordPoisonMessage({
          messageId: metadata.messageId,
          topicName: metadata.topicName,
          orderId: message.orderId ?? null,
          deliveryCount: metadata.deliveryCount,
          reason:
            error instanceof PermanentFulfilmentError
              ? error.reason
              : "delivery-count-exceeded",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    },
    {
      /**
       * Backoff only. The handler above owns the poison decision because it
       * can await the record write; this callback is the second line of
       * defence for anything that escapes it, and it acknowledges without
       * recording, which is a last resort rather than the policy.
       */
      retry: (_error, metadata) => {
        if (metadata.deliveryCount > MAX_DELIVERIES)
          return { acknowledge: true };
        return { afterSeconds: Math.min(300, 2 ** metadata.deliveryCount * 5) };
      },
      /**
       * The SDK re-extends the lease automatically, so this only needs raising
       * when a single message legitimately takes longer than 5 minutes.
       * Raising it does not make a crashed handler recover faster: it makes
       * redelivery of a lost lease slower by exactly this much.
       */
      visibilityTimeoutSeconds: 300,
    },
  );
}
