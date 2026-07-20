/**
 * Publishing side for Vercel Queues push mode, written around the one ordering
 * rule that this system inverts relative to every other queue you have used.
 *
 * Pinned to @vercel/queue@0.4.0. Queues is in PUBLIC BETA, not GA: the first
 * non-alpha release landed 2026-02-27, and the trigger type in vercel.json is
 * still literally "queue/v2beta". Treat the surface as movable.
 *
 * THE ORDERING HAZARD, from https://vercel.com/docs/queues/concepts:
 *
 *   "After replication, the publish acknowledgment and consumer notification
 *    happen simultaneously. This means a consumer may receive and begin
 *    processing a message before the producer's publish call returns,
 *    depending on network latency."
 *
 * Read that twice. On SQS, Kafka, or Redis Streams the producer's ack strictly
 * precedes any consumer seeing the record, so the near-universal idiom
 *
 *   const { messageId } = await send("orders", { id });
 *   await db.insert(order);            // <- consumer is ALREADY running
 *
 * is a guaranteed intermittent 404 in the consumer, weighted by how fast your
 * database is on the day. It passes locally, passes in CI, and fails a few
 * times an hour in production under load. Every write the consumer reads must
 * be committed BEFORE send is called. There is no ordering knob to fix this
 * after the fact.
 *
 * Matching vercel.json for the consumer half:
 *
 * {
 *   "functions": {
 *     "app/api/queues/fulfill-order/route.ts": {
 *       "experimentalTriggers": [
 *         {
 *           "type": "queue/v2beta",
 *           "topic": "orders",
 *           "retryAfterSeconds": 60,
 *           "initialDelaySeconds": 0
 *         }
 *       ]
 *     }
 *   }
 * }
 */

import { send } from "@vercel/queue";

export type OrderMessage = {
  orderId: string;
  /**
   * Carried so the consumer can detect that it is running against a payload
   * shape it does not know. Topics are partitioned by deployment ID and push
   * mode delivers back to the publishing deployment, so this is belt and
   * braces, but poll mode consumers do not get that partitioning for free.
   */
  schema: 1;
};

/**
 * Structural type, so this file pins no ORM. Adapt at the call site.
 * `insertOrder` MUST have committed by the time its promise resolves: an
 * open transaction, a deferred write, or a queued batch reintroduces exactly
 * the race the ordering above exists to avoid.
 */
export type OrderStore = {
  insertOrder: (order: {
    id: string;
    accountId: string;
    amountCents: number;
  }) => Promise<void>;
};

export type PlaceOrderInput = {
  orderId: string;
  accountId: string;
  amountCents: number;
};

/**
 * Thrown when the row is durably committed but the publish did not land. This
 * is a real state, not a theoretical one, and it is NOT the same failure as
 * "the order was rejected": the customer's order exists and simply has no
 * fulfilment message behind it. Callers must either retry `placeOrder` with the
 * same input, which the idempotency key makes safe, or leave the row for a
 * reconciliation sweep to pick up.
 */
export class OrderPublishFailedError extends Error {
  constructor(
    readonly orderId: string,
    cause: unknown,
  ) {
    super(
      `Order ${orderId} was committed but publishing to the orders topic failed`,
      {
        cause,
      },
    );
    this.name = "OrderPublishFailedError";
  }
}

export async function placeOrder(
  store: OrderStore,
  input: PlaceOrderInput,
): Promise<{ orderId: string; messageId: string }> {
  // ORDER IS LOAD-BEARING. The write is awaited to completion first, so the row
  // is readable from any connection before the topic knows the order exists.
  await store.insertOrder({
    id: input.orderId,
    accountId: input.accountId,
    amountCents: input.amountCents,
  });

  let messageId: string;
  try {
    // <- THIS LINE. Between the call and its resolution, a consumer function
    // may already be mid-flight against `input.orderId`. Nothing the consumer
    // needs may be written after this point.
    ({ messageId } = await send(
      "orders",
      { orderId: input.orderId, schema: 1 } satisfies OrderMessage,
      {
        // Deduplicates a producer-side retry (network timeout, function retry,
        // double-submitted form). Note the timing: dedupe happens out of band
        // AFTER SendMessage returns success, so this call resolves normally on
        // a duplicate and DuplicateMessageError does not fire on the happy
        // publish path. The duplicate is dropped before any consumer sees it.
        // Do not write `catch (DuplicateMessageError) { /* already queued */ }`
        // and expect it to run.
        idempotencyKey: `order:${input.orderId}`,
        // TTL bounds the blast radius of a poison message. With no DLQ, a
        // message that cannot be processed retries until it expires, so a
        // 7 day retention is 7 days of a failing handler burning invocations.
        // Minimum 60 seconds, maximum 7 days, default 24 hours.
        retentionSeconds: 6 * 60 * 60,
      },
    ));
  } catch (cause) {
    throw new OrderPublishFailedError(input.orderId, cause);
  }

  return { orderId: input.orderId, messageId };
}

/**
 * Delayed follow-up on a separate topic. Delay is capped at the message TTL, and
 * a delay that would outlive the TTL means the message expires before it ever
 * becomes visible and is never delivered. Set both together or not at all.
 */
export async function scheduleAbandonedCartNudge(
  orderId: string,
  afterSeconds: number,
): Promise<string> {
  const { messageId } = await send(
    "order-nudges",
    { orderId, schema: 1 } satisfies OrderMessage,
    {
      delaySeconds: afterSeconds,
      retentionSeconds: afterSeconds + 3600,
      idempotencyKey: `nudge:${orderId}`,
    },
  );
  return messageId;
}
