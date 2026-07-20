/**
 * The SSE plumbing behind the route handler, kept separate because it is the
 * part with the sharp edges and none of the business logic.
 *
 * Three things this gets right that a five-line inline version does not:
 *
 *   - **Backpressure.** `controller.enqueue()` is fire-and-forget: it accepts
 *     everything and buffers it in memory regardless of whether the client is
 *     reading. On Fluid, where one instance holds many concurrent streams, a
 *     handler that ignores backpressure is filling shared memory with data for
 *     a client on a train in a tunnel. Awaiting `controller.desiredSize` before
 *     the next write is what makes a slow reader slow the producer instead.
 *   - **Double close.** Calling `controller.close()` on a stream the runtime has
 *     already torn down after a disconnect throws, and that throw lands in a
 *     `finally` where it masks whatever real error was propagating.
 *   - **Heartbeat teardown.** An interval that outlives its stream keeps a timer,
 *     and therefore the invocation, alive. On classic serverless the instance
 *     froze anyway. On Fluid it does not, so the leak is real.
 */

export type SseEvent = {
  event: string;
  data: unknown;
  /** Sent as `id:`, which the browser returns as Last-Event-ID on reconnect. */
  id?: string;
};

export type Send = (event: SseEvent) => Promise<void>;

const encoder = new TextEncoder();

/** How long to wait on a full queue before deciding the client is gone. */
const BACKPRESSURE_TIMEOUT_MS = 30_000;

export function sseStream(
  producer: (send: Send) => Promise<void>,
): ReadableStream<Uint8Array> {
  let closed = false;

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const write = async (chunk: string) => {
        if (closed) return;

        // desiredSize goes to zero or below when the consumer is not keeping up
        // and null once the stream is errored. Yielding here is what turns
        // enqueue's unbounded buffering into real backpressure.
        const deadline = Date.now() + BACKPRESSURE_TIMEOUT_MS;
        while (
          controller.desiredSize !== null &&
          controller.desiredSize <= 0 &&
          !closed
        ) {
          if (Date.now() > deadline) {
            closed = true;
            controller.error(new Error("client stopped reading"));
            return;
          }
          await new Promise((resolve) => setTimeout(resolve, 25));
        }

        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          // The consumer went away between the check and the write. Not an
          // error; it is the ordinary shape of a closed tab.
          closed = true;
        }
      };

      const send: Send = async ({ event, data, id }) => {
        // Every data line must be a single line. A newline inside the JSON would
        // terminate the frame early and the browser would parse the remainder as
        // a new, malformed event.
        const lines = [
          id ? `id: ${id}` : null,
          `event: ${event}`,
          `data: ${JSON.stringify(data)}`,
          "",
          "",
        ].filter((line) => line !== null);
        await write(lines.join("\n"));
      };

      try {
        await producer(send);
      } finally {
        if (!closed) {
          closed = true;
          // Guarded because the runtime may already have closed this after a
          // disconnect, and a throw here would replace the real error.
          try {
            controller.close();
          } catch {
            // Already closed.
          }
        }
      }
    },

    // Fires when the consumer cancels, which includes the browser closing the
    // connection. Flipping the flag stops the producer's next write from
    // touching a dead controller.
    cancel() {
      closed = true;
    },
  });
}

/**
 * Periodic keepalive frames.
 *
 * Anything written keeps the connection warm through proxies and load balancers
 * that close idle sockets. This sends a named `ping` event rather than a bare
 * `:` comment because a named event is visible to the client, which can use the
 * gap between pings to decide the connection is dead and reconnect. A comment
 * would be invisible to EventSource and give the client nothing to time.
 *
 * Returns its own stop function rather than a handle, because the one thing
 * that must happen is the clear, and a caller holding a timer id can forget to.
 */
export function heartbeat(send: Send, intervalMs: number): () => void {
  const timer = setInterval(() => {
    // Not awaited: a heartbeat that queues behind backpressure would be a
    // heartbeat that no longer signals liveness.
    void send({ event: "ping", data: Date.now() });
  }, intervalMs);

  // unref keeps this timer from being a reason the invocation stays alive if
  // every other handle has been released.
  timer.unref?.();

  return () => clearInterval(timer);
}
