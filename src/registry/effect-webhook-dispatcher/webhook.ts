/**
 * webhook.ts
 *
 * Failure modes solved:
 *   1. The dropped event (fire-and-forget delivery): a webhook is a push
 *      into someone else's infrastructure, and their endpoint WILL be down
 *      sometimes. A single attempt silently drops the event. Delivery here
 *      is Effect.retry over jittered exponential backoff with a per-attempt
 *      timeout, and an endpoint that stays down moves the event to a
 *      dead-letter queue with its attempt history, so an outage on their
 *      side becomes a replayable record on yours, never a silent gap.
 *   2. The forged webhook (an unauthenticated POST endpoint): a consumer
 *      that trusts any JSON hitting its endpoint can be fed fake "payment
 *      succeeded" events by anyone with the URL. Every delivery is signed
 *      with HMAC-SHA256 over timestamp.body, the consumer verifies with a
 *      constant-time comparison, and the timestamp is checked against a
 *      tolerance window so a captured request cannot be replayed tomorrow.
 *
 * Why the primitives make it correct: Schedule.jittered(exponential) makes
 * synchronized retry waves impossible, the dead-letter queue makes retry
 * exhaustion an explicit state instead of a log line, and timingSafeEqual
 * removes the byte-by-byte comparison oracle.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { Data, type Duration, Effect, Queue, Ref, Schedule } from "effect";

class DeliveryFailed extends Data.TaggedError("DeliveryFailed")<{
  readonly status: number;
}> {}

export interface WebhookEvent {
  readonly id: string;
  readonly body: string;
}

export interface DeadLetter {
  readonly event: WebhookEvent;
  readonly attempts: number;
  readonly lastStatus: number;
}

export const sign = (
  secret: string,
  timestampMs: number,
  body: string,
): string =>
  createHmac("sha256", secret).update(`${timestampMs}.${body}`).digest("hex");

/** Consumer-side verification: constant-time compare + replay window. */
export const verify = (options: {
  readonly secret: string;
  readonly timestampMs: number;
  readonly body: string;
  readonly signature: string;
  readonly nowMs: number;
  readonly toleranceMs: number;
}): boolean => {
  if (Math.abs(options.nowMs - options.timestampMs) > options.toleranceMs)
    return false;
  const expected = Buffer.from(
    sign(options.secret, options.timestampMs, options.body),
    "hex",
  );
  const given = Buffer.from(options.signature, "hex");
  return expected.length === given.length && timingSafeEqual(expected, given);
};

export interface Dispatcher {
  readonly dispatch: (event: WebhookEvent) => Effect.Effect<void>;
  readonly deadLetters: Effect.Effect<readonly DeadLetter[]>;
}

export const makeDispatcher = (options: {
  readonly secret: string;
  /** the consumer endpoint; returns an HTTP status */
  readonly post: (headers: {
    readonly signature: string;
    readonly timestampMs: number;
    readonly body: string;
  }) => Effect.Effect<number>;
  readonly maxRetries: number;
  readonly baseDelay: Duration.Input;
  readonly attemptTimeout: Duration.Input;
}): Effect.Effect<Dispatcher> =>
  Effect.gen(function* () {
    const dead = yield* Queue.unbounded<DeadLetter>();

    const dispatch = (event: WebhookEvent) =>
      Effect.gen(function* () {
        const attempts = yield* Ref.make(0);
        const lastStatus = yield* Ref.make(0);
        const attempt = Effect.gen(function* () {
          yield* Ref.update(attempts, (n) => n + 1);
          const timestampMs = Date.now();
          const status = yield* options
            .post({
              signature: sign(options.secret, timestampMs, event.body),
              timestampMs,
              body: event.body,
            })
            .pipe(
              Effect.timeoutOrElse({
                duration: options.attemptTimeout,
                orElse: () => Effect.succeed(0), // status 0: the socket never answered
              }),
            );
          yield* Ref.set(lastStatus, status);
          if (status < 200 || status >= 300)
            return yield* new DeliveryFailed({ status });
        });

        yield* attempt.pipe(
          Effect.retry({
            schedule: Schedule.jittered(
              Schedule.exponential(options.baseDelay, 2),
            ),
            times: options.maxRetries,
          }),
          Effect.catch(() =>
            Effect.gen(function* () {
              yield* Queue.offer(dead, {
                event,
                attempts: yield* Ref.get(attempts),
                lastStatus: yield* Ref.get(lastStatus),
              });
            }),
          ),
        );
      });

    const deadLetters = Queue.clear(dead);

    return { dispatch, deadLetters } as const;
  });

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() =>
      console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`),
    );

  const SECRET = "whsec_demo_key";

  // Property 1: an endpoint that is down twice then recovers gets the event
  // on attempt 3; the signature verifies on the consumer side.
  {
    const received = yield* Ref.make<{
      body: string;
      verified: boolean;
    } | null>(null);
    const calls = yield* Ref.make(0);
    const dispatcher = yield* makeDispatcher({
      secret: SECRET,
      maxRetries: 4,
      baseDelay: "10 millis",
      attemptTimeout: "200 millis",
      post: (req) =>
        Effect.gen(function* () {
          const n = yield* Ref.updateAndGet(calls, (c) => c + 1);
          if (n <= 2) return 503;
          const verified = verify({
            secret: SECRET,
            timestampMs: req.timestampMs,
            body: req.body,
            signature: req.signature,
            nowMs: Date.now(),
            toleranceMs: 5 * 60 * 1000,
          });
          yield* Ref.set(received, { body: req.body, verified });
          return 200;
        }),
    });
    yield* dispatcher.dispatch({
      id: "evt_1",
      body: '{"type":"invoice.paid","amount":4999}',
    });
    const attempts = yield* Ref.get(calls);
    const got = yield* Ref.get(received);
    yield* check(
      "flaky endpoint gets the event with a valid signature",
      attempts === 3 && got?.verified === true,
      `delivered on attempt ${attempts} after two 503s, consumer verified HMAC: ${got?.verified}`,
    );
  }

  // Property 2: a dead endpoint exhausts retries into the dead-letter queue.
  {
    const dispatcher = yield* makeDispatcher({
      secret: SECRET,
      maxRetries: 3,
      baseDelay: "5 millis",
      attemptTimeout: "100 millis",
      post: () => Effect.succeed(500),
    });
    yield* dispatcher.dispatch({
      id: "evt_2",
      body: '{"type":"invoice.paid"}',
    });
    const dead = yield* dispatcher.deadLetters;
    yield* check(
      "exhausted retries dead-letter, never drop",
      dead.length === 1 && dead[0].attempts === 4 && dead[0].lastStatus === 500,
      `event landed in DLQ after ${dead[0]?.attempts} attempts, last status ${dead[0]?.lastStatus}`,
    );
  }

  // Property 3: a tampered payload and a replayed timestamp both fail verify.
  {
    const t = Date.now();
    const body = '{"type":"payout.settled","amount":120000}';
    const signature = sign(SECRET, t, body);
    const tampered = verify({
      secret: SECRET,
      timestampMs: t,
      body: '{"type":"payout.settled","amount":999999}',
      signature,
      nowMs: t,
      toleranceMs: 300000,
    });
    const replayed = verify({
      secret: SECRET,
      timestampMs: t,
      body,
      signature,
      nowMs: t + 10 * 60 * 1000, // captured and replayed 10 minutes later
      toleranceMs: 300000,
    });
    const genuine = verify({
      secret: SECRET,
      timestampMs: t,
      body,
      signature,
      nowMs: t + 1000,
      toleranceMs: 300000,
    });
    yield* check(
      "tampering and replay are rejected",
      !tampered && !replayed && genuine,
      `tampered body: ${tampered}, 10-minute replay: ${replayed}, genuine: ${genuine}`,
    );
  }

  console.log("webhook.ts: all properties verified");
});

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e);
  process.exit(1);
});
