import type { BetterAuthOptions } from "better-auth";

/**
 * A Redis-backed `rateLimit.customStorage` built on a single atomic
 * `consume` decision per request.
 *
 * Requires better-auth >= 1.7.0. PR #10000 ("harden atomic state
 * transitions", merged 2026-06-12) made `consume` the sole member of
 * `BetterAuthRateLimitStorage` and deleted the legacy `get`/`set` pair
 * along with its non-atomic fallback. On 1.6.17 through 1.6.23 `consume`
 * exists but is optional and a storage without it silently degrades to the
 * read-then-write path. That path is why a 1.6.x custom storage could be
 * walked past: N concurrent sign-in attempts all read the same stale count
 * before any of them writes, so all N are admitted under a limit of 1.
 *
 * Wire it up:
 *
 * ```ts
 * betterAuth({
 *   rateLimit: {
 *     enabled: true,
 *     customStorage: createRedisRateLimitStorage({ redis }),
 *     customRules: {
 *       "/sign-in/email": { window: 60, max: 5 },
 *       "/forget-password": { window: 300, max: 3 },
 *     },
 *   },
 * });
 * ```
 */

type RateLimitStorage = NonNullable<NonNullable<BetterAuthOptions["rateLimit"]>["customStorage"]>;

/**
 * Minimal structural type matching `@upstash/redis`, which takes keys and
 * args as arrays. For ioredis, adapt at the call site:
 * `{ eval: (s, keys, args) => io.eval(s, keys.length, ...keys, ...args) }`.
 */
export type EvalCapableRedis = {
  eval: (script: string, keys: string[], args: (string | number)[]) => Promise<unknown>;
};

/**
 * Fixed window counter. INCR and PEXPIRE run inside one Lua invocation, so
 * Redis executes them as a single atomic unit and no caller can observe the
 * count between the read and the write.
 *
 * Returns the post-increment count and the remaining TTL in milliseconds.
 * The PTTL < 0 branch repairs a key that exists without an expiry, which is
 * otherwise a permanent lockout: the counter would never reset.
 */
const CONSUME_SCRIPT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
  return {count, tonumber(ARGV[1])}
end
local ttl = redis.call('PTTL', KEYS[1])
if ttl < 0 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
  ttl = tonumber(ARGV[1])
end
return {count, ttl}
`;

export type RedisRateLimitStorageConfig = {
  redis: EvalCapableRedis;
  /** Namespace for the counter keys. Keep distinct per deployment so staging cannot throttle production. */
  keyPrefix?: string;
  /**
   * What to do when Redis is unreachable. "closed" rejects the request,
   * "open" allows it. Default is "closed": an auth rate limiter that fails
   * open turns a Redis outage into an unthrottled credential stuffing window.
   */
  onError?: "closed" | "open";
};

export function createRedisRateLimitStorage(
  config: RedisRateLimitStorageConfig,
): RateLimitStorage {
  const prefix = config.keyPrefix ?? "better-auth:rl";
  const failOpen = config.onError === "open";

  return {
    async consume(key, rule) {
      const windowMs = rule.window * 1000;

      let result: unknown;
      try {
        result = await config.redis.eval(CONSUME_SCRIPT, [`${prefix}:${key}`], [windowMs]);
      } catch {
        // Do not log `key` here: it embeds the client identifier (IP or
        // session token) that Better Auth derived for this request.
        return failOpen ? { allowed: true, retryAfter: null } : { allowed: false, retryAfter: 1 };
      }

      if (!Array.isArray(result) || result.length < 2) {
        return failOpen ? { allowed: true, retryAfter: null } : { allowed: false, retryAfter: 1 };
      }

      const count = Number(result[0]);
      const ttlMs = Number(result[1]);
      if (!Number.isFinite(count)) {
        return failOpen ? { allowed: true, retryAfter: null } : { allowed: false, retryAfter: 1 };
      }

      if (count <= rule.max) return { allowed: true, retryAfter: null };

      // retryAfter is seconds, and it goes into a Retry-After header, so it
      // must round up. Rounding down advertises a retry that is still blocked.
      const retryAfter = Number.isFinite(ttlMs) ? Math.max(1, Math.ceil(ttlMs / 1000)) : rule.window;
      return { allowed: false, retryAfter };
    },
  };
}
