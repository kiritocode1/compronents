import { after } from "next/server";
import { getSql } from "@/lib/db";
import type { LibrarySectionId } from "@/lib/registry";

export type ActiveToken = { id: string; scopes: LibrarySectionId[] };

/**
 * Single read path against the registry_tokens table, which the mint-me app
 * owns. Used by both the `/r/*` route gate and the on-site source gate so
 * there is one definition of "this token is live".
 */
export async function findActiveTokenByHash(
  hash: string,
): Promise<ActiveToken | null> {
  const sql = getSql();
  const rows = (await sql`
    select id, scopes from registry_tokens
    where token_hash = ${hash} and revoked_at is null
    limit 1
  `) as ActiveToken[];
  return rows[0] ?? null;
}

/**
 * Usage tracking must never delay or fail the response, and an unawaited
 * promise can be killed when the function suspends: after() is the primitive
 * that survives that.
 */
export function bumpTokenUsage(id: string) {
  after(async () => {
    try {
      const sql = getSql();
      await sql`
        update registry_tokens
        set last_used_at = now(), use_count = use_count + 1
        where id = ${id}
      `;
    } catch {
      // Usage stats are not worth failing an otherwise valid request over.
    }
  });
}
