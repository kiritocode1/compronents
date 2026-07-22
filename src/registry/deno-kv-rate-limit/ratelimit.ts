// ratelimit.ts: sliding-window rate limiter middleware for Deno.serve, backed
// by Deno KV, zero dependencies.
//
// What it is: rateLimit({ limit, windowMs })(handler) wraps a Deno.serve
// handler and enforces a per-client sliding window with standard RateLimit-*
// and Retry-After headers. Because the counters live in KV, the limit holds
// across isolates and regions on Deploy, not just one process.
//
// Why Deno makes this trivial: kv.atomic().mutate({ type: "sum" }) is a
// distributed atomic increment (Deno.KvU64), and the sum mutation accepts
// expireIn, so buckets garbage-collect themselves: no cron, no cleanup scan.
// The sliding window is the two-bucket weighted approximation (current bucket
// plus the previous bucket scaled by its remaining overlap), which smooths the
// burst-at-window-edge problem of plain fixed windows while costing one
// atomic increment and one getMany per request.
//
// run:
//   deno run -A --unstable-kv ratelimit.ts        (demo server on :4110)
//   for i in 1 2 3 4 5 6 7; do curl -s -o /dev/null -w "%{http_code} " http://localhost:4110/; done

export interface RateLimitOptions {
  kv: Deno.Kv;
  /** Max requests per window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
  /** Client identity. Default: remote IP address. */
  keyFn?: (req: Request, info: Deno.ServeHandlerInfo) => string;
  /** KV key namespace prefix. Default "ratelimit". */
  prefix?: string;
}

export interface RateLimitDecision {
  allowed: boolean;
  /** Weighted request count in the sliding window, after this request. */
  used: number;
  remaining: number;
  /** Seconds until the current bucket rolls over. */
  resetSeconds: number;
}

/** Core check, usable without Deno.serve (queues, jobs, RPC layers). */
export async function checkRateLimit(
  opts: RateLimitOptions,
  clientKey: string,
): Promise<RateLimitDecision> {
  const { kv, limit, windowMs } = opts;
  const prefix = opts.prefix ?? "ratelimit";
  const now = Date.now();
  const bucketStart = now - (now % windowMs);
  const currKey: Deno.KvKey = [prefix, clientKey, bucketStart];
  const prevKey: Deno.KvKey = [prefix, clientKey, bucketStart - windowMs];

  // Atomic distributed increment; the bucket deletes itself after two windows.
  await kv.atomic()
    .mutate({
      type: "sum",
      key: currKey,
      value: new Deno.KvU64(1n),
      expireIn: windowMs * 2,
    })
    .commit();

  const [curr, prev] = await kv.getMany<[Deno.KvU64, Deno.KvU64]>([
    currKey,
    prevKey,
  ]);
  const currCount = Number(curr.value?.value ?? 0n);
  const prevCount = Number(prev.value?.value ?? 0n);
  const elapsedFraction = (now - bucketStart) / windowMs;
  const used = currCount + prevCount * (1 - elapsedFraction);
  const resetSeconds = Math.ceil((bucketStart + windowMs - now) / 1000);
  return {
    allowed: used <= limit,
    used,
    remaining: Math.max(0, Math.floor(limit - used)),
    resetSeconds,
  };
}

/** Wrap a Deno.serve handler with sliding-window rate limiting. */
export function rateLimit(
  opts: RateLimitOptions,
): (handler: Deno.ServeHandler) => Deno.ServeHandler {
  const keyFn = opts.keyFn ??
    ((_req: Request, info: Deno.ServeHandlerInfo) =>
      (info.remoteAddr as Deno.NetAddr).hostname ?? "unknown");
  return (handler) => async (req, info) => {
    const decision = await checkRateLimit(opts, keyFn(req, info));
    const headers: Record<string, string> = {
      // IETF draft-ietf-httpapi-ratelimit-headers style.
      "RateLimit-Limit": String(opts.limit),
      "RateLimit-Remaining": String(decision.remaining),
      "RateLimit-Reset": String(decision.resetSeconds),
      "RateLimit-Policy": `${opts.limit};w=${opts.windowMs / 1000}`,
    };
    if (!decision.allowed) {
      return new Response(
        JSON.stringify({
          error: "rate limit exceeded",
          retryAfterSeconds: decision.resetSeconds,
        }),
        {
          status: 429,
          headers: {
            ...headers,
            "Retry-After": String(decision.resetSeconds),
            "Content-Type": "application/json",
          },
        },
      );
    }
    const res = await handler(req, info);
    const out = new Response(res.body, res);
    for (const [k, v] of Object.entries(headers)) out.headers.set(k, v);
    return out;
  };
}

if (import.meta.main) {
  const kv = await Deno.openKv();
  const limited = rateLimit({ kv, limit: 5, windowMs: 10_000 });
  Deno.serve(
    { port: 4110 },
    limited((_req) =>
      new Response(
        JSON.stringify({ message: "you are within the limit" }) + "\n",
        { headers: { "Content-Type": "application/json" } },
      )
    ),
  );
}
