import { cookies } from "next/headers";
import { hasDatabase } from "@/lib/db";
import {
  type ActiveToken,
  findActiveTokenByHash,
} from "@/lib/registry-token-store";

export const REGISTRY_SESSION_COOKIE = "registry_source";
export const REGISTRY_SESSION_MAX_AGE = 60 * 60 * 24 * 30;

/**
 * The cookie stores the token's SHA-256 hash, not a bearer value and not an
 * "unlocked" flag. Two consequences, both deliberate:
 *
 *   - It cannot be hand-written in devtools without already holding a valid
 *     token, since that would require a preimage.
 *   - Every read hits the token store, so revoking in mint-me locks the site
 *     out immediately rather than at the end of some session TTL.
 */
export async function currentSourceSession(): Promise<ActiveToken | null> {
  if (!hasDatabase()) return null;

  const hash = (await cookies()).get(REGISTRY_SESSION_COOKIE)?.value;
  if (!hash || !/^[0-9a-f]{64}$/.test(hash)) return null;

  try {
    return await findActiveTokenByHash(hash);
  } catch {
    return null;
  }
}
