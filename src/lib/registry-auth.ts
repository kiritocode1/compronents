import { hasDatabase } from "@/lib/db";
import { getRegistryItem } from "@/lib/registry";
import {
  type ActiveToken,
  bumpTokenUsage,
  findActiveTokenByHash,
} from "@/lib/registry-token-store";
import { hashToken } from "@/lib/token-contract";

/**
 * Gate for the `/r/*` routes. Follows the same shape as
 * `requireRegistryAssetAdmin` in blob-assets.ts: returns a Response to send on
 * failure, or null when the caller may proceed.
 */

/**
 * shadcn can only attach an auth header to a *namespaced* registry configured
 * in components.json. A plain-URL install has nowhere to put one, so the query
 * parameter is not a convenience: it is the only way `shadcn add <url>` and
 * "Open in v0" can authenticate at all.
 */
function extractToken(request: Request) {
  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim();
  }

  const header = request.headers.get("x-registry-token")?.trim();
  if (header) return header;

  return new URL(request.url).searchParams.get("token")?.trim() || null;
}

function unauthorized(message: string) {
  return Response.json(
    { error: message },
    {
      status: 401,
      headers: {
        "Cache-Control": "no-store",
        "WWW-Authenticate": 'Bearer realm="compronents"',
      },
    },
  );
}

function unavailable(message: string) {
  return Response.json(
    { error: message },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}

/**
 * @param slug Item name for a single-item request, or null for the catalog.
 *             Determines which scope the token must carry.
 */
export async function requireRegistryToken(
  request: Request,
  slug: string | null,
) {
  // Fails closed. A misconfigured deployment must not serve the registry
  // openly just because it cannot reach the token store.
  if (!hasDatabase()) {
    return unavailable("Registry authentication is not configured.");
  }

  const raw = extractToken(request);
  if (!raw) {
    return unauthorized(
      "A registry token is required. Pass it as an Authorization: Bearer header, or append ?token= to the URL.",
    );
  }

  let token: ActiveToken | null;
  try {
    token = await findActiveTokenByHash(hashToken(raw));
  } catch {
    return unavailable("Could not verify the registry token.");
  }

  if (!token) {
    return unauthorized("That registry token is not valid or was revoked.");
  }

  // Scopes are per-section. The catalog has no single section, so any live
  // token may list it; individual items check the section they belong to.
  if (slug) {
    const section = getRegistryItem(
      slug.replace(/\.(?:json|md)$/, ""),
    )?.section;
    if (section && !token.scopes.includes(section)) {
      return unauthorized(`That token does not cover the ${section} section.`);
    }
  }

  bumpTokenUsage(token.id);
  return null;
}
