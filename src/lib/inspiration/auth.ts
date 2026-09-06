import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { InspirationError, type Viewer } from "./types.ts";

export const OWNER_COOKIE = "inspiration_owner";
const localKey = globalThis as typeof globalThis & {
  inspirationSessionKey?: string;
};

function signingKey() {
  const key = process.env.INSPIRATION_SESSION_SECRET;
  if (key && key.length >= 32) return key;
  if (process.env.VERCEL || process.env.NODE_ENV === "production") return null;
  localKey.inspirationSessionKey ??= randomBytes(32).toString("hex");
  return localKey.inspirationSessionKey;
}

export function equalSecret(a: string, b: string) {
  return timingSafeEqual(
    createHash("sha256").update(a).digest(),
    createHash("sha256").update(b).digest(),
  );
}

export function ownerPasswordMatches(password: string) {
  const local = !process.env.VERCEL && process.env.NODE_ENV !== "production";
  const expected =
    process.env.INSPIRATION_OWNER_PASSWORD ||
    (local ? process.env.INSPIRATION_PASSWORD : undefined);
  if (!expected || !signingKey())
    throw new InspirationError(
      "Configure INSPIRATION_OWNER_PASSWORD and INSPIRATION_SESSION_SECRET for owner access.",
      503,
    );
  return equalSecret(password, expected);
}

export function createOwnerSession(now = Date.now()) {
  const key = signingKey();
  if (!key)
    throw new InspirationError("Owner sessions are not configured.", 503);
  const payload = `owner.${Math.floor(now / 1000) + 60 * 60 * 12}.${randomBytes(12).toString("hex")}`;
  return `${payload}.${createHmac("sha256", key).update(payload).digest("base64url")}`;
}

export function validOwnerSession(token: string | undefined, now = Date.now()) {
  const key = signingKey();
  if (!key || !token || token.length > 250) return false;
  const [role, expires, nonce, signature, extra] = token.split(".");
  if (
    role !== "owner" ||
    extra ||
    !signature ||
    !nonce ||
    !/^\d+$/.test(expires)
  )
    return false;
  if (
    Number(expires) <= Math.floor(now / 1000) ||
    Number(expires) > Math.floor(now / 1000) + 43200
  )
    return false;
  return equalSecret(
    signature,
    createHmac("sha256", key)
      .update(`${role}.${expires}.${nonce}`)
      .digest("base64url"),
  );
}

export function requestViewer(request: Request): Viewer {
  const token = request.headers
    .get("cookie")
    ?.split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${OWNER_COOKIE}=`))
    ?.slice(OWNER_COOKIE.length + 1);
  if (validOwnerSession(token)) return { owner: true };
  const expected = process.env.INSPIRATION_MCP_TOKEN;
  const authorization = request.headers.get("authorization");
  if (authorization) {
    if (!expected || !equalSecret(authorization, `Bearer ${expected}`))
      throw new InspirationError("Invalid inspiration read token.", 401);
    return { owner: true };
  }
  return { owner: false };
}

/** MCP credentials can read preferences, but only a browser owner session may write. */
export function requireOwnerWrite(request: Request) {
  const token = request.headers
    .get("cookie")
    ?.split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${OWNER_COOKIE}=`))
    ?.slice(OWNER_COOKIE.length + 1);
  if (!validOwnerSession(token))
    throw new InspirationError(
      "Sign in as the owner to edit preferences.",
      401,
    );
  requireSameOrigin(request);
}

export function requireSameOrigin(request: Request) {
  // Use server configuration behind a proxy. Forwarded headers are client input.
  const local = !process.env.VERCEL && process.env.NODE_ENV !== "production";
  const publicUrl =
    process.env.INSPIRATION_ORIGIN ||
    (local ? process.env.PORTLESS_URL : undefined);
  const expected = new URL(publicUrl || request.url).origin;
  if (request.headers.get("origin") !== expected)
    throw new InspirationError("This action must come from this site.", 403);
}
