/**
 * A long-lived server-sent events endpoint on Vercel Fluid compute, written
 * around the two things Fluid changes: how long a function may stay open, and
 * who else is sharing the instance while it does.
 *
 * On classic serverless, one invocation owned one instance for its whole life
 * and was billed for every wall-clock second of it. That priced streaming out of
 * existence. A ten minute SSE connection was ten minutes of a dedicated,
 * fully-billed instance sitting idle on an await, so the standard advice was to
 * not do it: poll every few seconds, or push the connection out to a third-party
 * realtime service.
 *
 * Fluid changes both halves. Instances serve multiple invocations concurrently,
 * and billing is weighted towards active CPU rather than wall clock, so a handler
 * that spends nine of its ten minutes awaiting an upstream token is sharing that
 * instance with other requests and is not being charged as if it were alone on
 * it. A streaming endpoint is now an ordinary thing to write.
 *
 * The bill for that is a new failure mode, and it is the reason this file is
 * mostly lifecycle:
 *
 *   1. **Neighbours.** Concurrent invocations share one event loop. A synchronous
 *      loop over a large payload inside a stream handler no longer slows only its
 *      own request; it stalls every other request on the instance, including
 *      their streams. Anything CPU-bound belongs off this path.
 *   2. **Disconnects.** A client that closes the tab does not stop this function.
 *      Nothing here observes the disconnect unless `request.signal` is watched,
 *      so an unwatched handler keeps pulling from an upstream model and keeps
 *      being billed for tokens nobody will read.
 *   3. **Cleanup after the response.** Once the stream ends or aborts, the
 *      remaining work has no response to hang off. `waitUntil` is what keeps the
 *      invocation alive for it, and it shares the function's timeout, so it is
 *      for short cleanup, not for work that must not be lost.
 *
 * Pinned to next@16.2.9, @vercel/functions@3.7.5.
 *
 * Requires Fluid compute enabled on the project (default-on for projects created
 * after April 23 2025). Without it, maxDuration is capped far lower and this
 * handler is silently truncated mid-stream instead of failing loudly.
 */

import { waitUntil } from "@vercel/functions";
import { heartbeat, sseStream } from "./stream.ts";

/**
 * The ceiling, not the target. Fluid raises the maximum duration well past the
 * classic limits, but a value chosen larger than the longest legitimate stream
 * only extends how long a stuck handler occupies capacity before the platform
 * ends it.
 */
export const maxDuration = 800;

/** Streams require the Node.js runtime and a per-request response. */
export const dynamic = "force-dynamic";

type Token = { text: string };

export async function POST(request: Request): Promise<Response> {
  const { prompt, conversationId } = (await request.json()) as {
    prompt: string;
    conversationId: string;
  };

  const startedAt = Date.now();
  let delivered = 0;
  let transcript = "";

  const body = sseStream(async (send) => {
    // Keepalive frames stop intermediaries from treating a quiet stream as a
    // dead one. They cost nothing and they are the difference between a stream
    // that survives a slow first token and one that is closed underneath you.
    const stopHeartbeat = heartbeat(send, 15_000);

    try {
      // The signal is threaded all the way down. This is the load-bearing line:
      // passing request.signal into the upstream fetch is what turns a browser
      // tab closing into a cancelled model request rather than a stream of
      // tokens billed to nobody's benefit.
      const upstream = await fetch(
        "https://ai-gateway.vercel.sh/v1/responses",
        {
          method: "POST",
          signal: request.signal,
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${process.env.AI_GATEWAY_API_KEY}`,
          },
          body: JSON.stringify({
            model: "anthropic/claude-opus-4-8",
            input: [{ type: "message", role: "user", content: prompt }],
            stream: true,
          }),
        },
      );

      if (!upstream.ok || !upstream.body) {
        await send({ event: "error", data: { status: upstream.status } });
        return;
      }

      for await (const token of readTokens(upstream.body, request.signal)) {
        // send() awaits the sink, so a slow reader propagates backpressure up
        // through this loop to the upstream read. Without that await the tokens
        // pile up in memory on an instance that is also serving other requests.
        await send({ event: "token", data: token });
        transcript += token.text;
        delivered += 1;
      }

      await send({ event: "done", data: { tokens: delivered } });
    } catch (error) {
      // An abort is the normal way this ends, not an error worth alerting on.
      // Logging it as a failure is how a dashboard ends up showing a 40% error
      // rate that is entirely users closing tabs.
      if (request.signal.aborted) return;
      await send({ event: "error", data: { message: String(error) } });
    } finally {
      stopHeartbeat();

      // Persist whatever arrived, including on the abort path, where a partial
      // answer is still worth keeping. waitUntil is what allows this to outlive
      // the stream. It shares the function's timeout, so it holds a short write
      // and nothing more; anything that must not be lost belongs in a queue.
      waitUntil(
        persist({
          conversationId,
          transcript,
          tokens: delivered,
          durationMs: Date.now() - startedAt,
          aborted: request.signal.aborted,
        }),
      );
    }
  });

  return new Response(body, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      // no-store keeps any cache between here and the browser from holding the
      // response, which for a stream means holding it forever.
      "cache-control": "no-store, no-transform",
      connection: "keep-alive",
    },
  });
}

/**
 * Parse the upstream SSE frames into tokens.
 *
 * ponytail: a hand-rolled split on the delimiter, because the frames from this
 * endpoint are single-line JSON `data:` events and a full SSE parser would be
 * fifty lines to handle fields this stream never sends. The buffer is here
 * because a chunk boundary lands mid-frame regularly under real network
 * conditions, which is the one edge a naive version gets wrong.
 */
async function* readTokens(
  body: ReadableStream<Uint8Array>,
  signal: AbortSignal,
): AsyncGenerator<Token> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (!signal.aborted) {
      const { done, value } = await reader.read();
      if (done) return;

      buffer += decoder.decode(value, { stream: true });
      const frames = buffer.split("\n\n");
      buffer = frames.pop() ?? "";

      for (const frame of frames) {
        const line = frame.split("\n").find((l) => l.startsWith("data:"));
        if (!line) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;

        const event = JSON.parse(payload) as { type: string; delta?: string };
        if (event.type === "response.output_text.delta" && event.delta) {
          yield { text: event.delta };
        }
      }
    }
  } finally {
    // Releasing the lock lets the abort actually tear the socket down. Skipping
    // it leaves the upstream connection held by an instance that is still
    // serving other requests.
    reader.releaseLock();
  }
}

/**
 * ponytail: a console line standing in for the project's store. The shape that
 * matters is that it is called from finally and wrapped in waitUntil, not what
 * it writes to.
 */
async function persist(record: Record<string, unknown>): Promise<void> {
  console.log("conversation", record);
}
