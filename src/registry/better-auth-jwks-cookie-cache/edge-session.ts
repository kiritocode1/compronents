import { getCookieCache } from "better-auth/cookies";
import type { JSONWebKeySet } from "jose";

/**
 * Reads the Better Auth session cookie cache at the edge, verifying it
 * against the auth server's public JWKS instead of a shared secret.
 *
 * Requires better-auth >= 1.7.0: `getCookieCache` gained the `jwt` config
 * ({ signingKey, jwks, issuer, audience }) in 1.7.0. On 1.6.x the same call
 * only accepts `secret`, which means every verifier needs the signing
 * secret, which means every verifier can also mint sessions.
 *
 * Pair with the `auth.ts` config in this component, which sets
 * `session.cookieCache.jwt.signingKey: "jwt-plugin"`.
 */

/** Audience claim Better Auth sets on cookie-cache JWTs. Pinned so a token minted for another purpose cannot be replayed here. */
const COOKIE_CACHE_AUDIENCE = "better-auth:session-cache";

export type EdgeSessionConfig = {
  /** Must be byte-identical to the `baseURL` passed to betterAuth(): it is the `iss` claim. */
  baseURL: string;
  /** Better Auth mount path. Default matches the standard Next.js `app/api/auth/[...all]/route.ts`. */
  basePath?: string;
  /**
   * How long a fetched JWKS is reused. This is also the worst-case window in
   * which a freshly rotated key is unknown here and sessions read as absent.
   * The caller falls back to a full session check, so the failure mode is a
   * slow request, not an accepted forgery.
   */
  jwksTtlMs?: number;
};

let cachedJwks: { keys: JSONWebKeySet; expiresAt: number } | null = null;

async function loadJwks(
  config: EdgeSessionConfig,
): Promise<JSONWebKeySet | null> {
  const ttl = config.jwksTtlMs ?? 5 * 60 * 1000;
  if (cachedJwks && cachedJwks.expiresAt > Date.now()) return cachedJwks.keys;

  const basePath = config.basePath ?? "/api/auth";
  const response = await fetch(`${config.baseURL}${basePath}/jwks`, {
    // The JWKS is public, so no credentials. Sending cookies to this route
    // would leak the session into an edge cache entry.
    credentials: "omit",
  });
  if (!response.ok) {
    // Serve the stale keyring rather than signing every user out during a
    // brief auth-server blip. Stale public keys cannot forge anything.
    return cachedJwks?.keys ?? null;
  }

  const keys = (await response.json()) as JSONWebKeySet;
  if (!Array.isArray(keys?.keys)) return cachedJwks?.keys ?? null;

  cachedJwks = { keys, expiresAt: Date.now() + ttl };
  return keys;
}

/**
 * Returns the cached session when the cookie verifies, otherwise null.
 *
 * null means "no proof at the edge", not "signed out": it is also returned
 * for an unknown `kid`, an expired cache, and a cache older than
 * `cookieCache.maxAge`. Treat it as "ask the auth server", never as a
 * permission decision on its own.
 *
 * This function does NOT prove the session is still live. The cookie cache
 * is a bounded-staleness snapshot; sign-out, ban, and session revocation
 * take effect here only after `cookieCache.maxAge` elapses. Anything
 * destructive, privileged, or billing related must re-read the session
 * through `auth.api.getSession({ headers })` on the origin.
 */
export async function readEdgeSession(
  request: Request,
  config: EdgeSessionConfig,
) {
  const jwks = await loadJwks(config);
  if (!jwks) return null;

  return getCookieCache(request, {
    strategy: "jwt",
    jwt: {
      signingKey: "jwt-plugin",
      jwks,
      // Pinning both claims is what stops a JWT signed by the same keyring
      // for a different purpose (an access token, an OIDC id_token) from
      // being accepted as a session.
      issuer: config.baseURL,
      audience: COOKIE_CACHE_AUDIENCE,
    },
    // Matches advanced.useSecureCookies: true, so the `__Secure-` prefixed
    // cookie name is read in every environment, not just NODE_ENV=production.
    isSecure: true,
  });
}
