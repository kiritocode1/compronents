import { betterAuth, type BetterAuthOptions } from "better-auth";
import { jwt } from "better-auth/plugins";

/**
 * Session cookie cache signed with the `jwt()` plugin's asymmetric keys.
 *
 * Requires better-auth >= 1.7.0. The `session.cookieCache.jwt.signingKey`
 * option landed in 1.7.0 (PR #8931). On 1.6.x the only cookie cache
 * strategies are "compact", "jwt" (HS256 with the server secret) and "jwe";
 * none of them can be verified by a process that does not hold the secret.
 *
 * With `signingKey: "jwt-plugin"` the cache cookie is an ES256 (default)
 * JWT whose `kid` resolves against the public JWKS the jwt() plugin
 * publishes at `<baseURL>/api/auth/jwks`. An edge worker, a separate
 * gateway, or a different service can then verify a session without the
 * Better Auth secret and without a database round trip.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    // Fail at boot, not at the first sign-in. Never inline a fallback
    // string here: a checked-in default secret is a forgeable session.
    throw new Error(
      `${name} is not set. Generate one with \`openssl rand -base64 32\` and put it in the environment, never in source control.`,
    );
  }
  return value;
}

/** Exported so the edge verifier can pin the JWT `iss` claim to this exact string. */
export const AUTH_BASE_URL = requireEnv("BETTER_AUTH_URL");

/**
 * How long a cached session may be trusted without touching the database.
 * This is the revocation lag: a banned or signed-out user keeps a valid
 * cookie for up to this long at any consumer that only checks the cache.
 * Keep it short, and re-check server side before anything destructive.
 */
export const COOKIE_CACHE_MAX_AGE_SECONDS = 60;

export function createAuth(database: BetterAuthOptions["database"]) {
  return betterAuth({
    database,
    // A string baseURL is what ends up in the cookie-cache JWT `iss` claim,
    // so it must match what the edge verifier pins.
    baseURL: AUTH_BASE_URL,
    secret: requireEnv("BETTER_AUTH_SECRET"),
    // The jwt() plugin owns the keyring. Its private key signs the cache
    // cookie; its JWKS endpoint is what remote verifiers read.
    plugins: [jwt()],
    session: {
      cookieCache: {
        enabled: true,
        maxAge: COOKIE_CACHE_MAX_AGE_SECONDS,
        strategy: "jwt",
        jwt: { signingKey: "jwt-plugin" },
      },
    },
    advanced: {
      // Forces the `__Secure-` cookie prefix and `Secure` attribute even when
      // NODE_ENV is not "production" (preview deployments, staging behind TLS).
      useSecureCookies: true,
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
