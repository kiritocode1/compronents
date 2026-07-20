/// <reference types="@cloudflare/workers-types" />

/**
 * The upgrade entry point in front of `ChatRoom`.
 *
 * The Worker validates the handshake and picks the room, then hands the request
 * to the Durable Object unchanged. It deliberately does not create the
 * `WebSocketPair` itself: the 101 response has to be produced by whichever actor
 * will own the socket, and a socket accepted in the Worker cannot be handed to a
 * Durable Object afterwards.
 *
 * The `ChatRoom` re-export is not decorative. Wrangler resolves Durable Object
 * classes from the exports of `main`, so a class that is only exported from
 * `room.ts` fails at deploy time with an unresolved class error.
 *
 * Requires @cloudflare/workers-types@5.20260719.1 and wrangler 4.112.0.
 */

import type { ChatEnv } from "./room";

export { ChatRoom } from "./room";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const match = /^\/rooms\/([\w-]{1,64})\/ws$/.exec(url.pathname);
    if (!match) return new Response("Not found", { status: 404 });

    // Both checks are required by the protocol and both are cheap here, so a
    // malformed client never costs a Durable Object wake. The Upgrade header is
    // case insensitive per RFC 6455, which a strict === comparison gets wrong.
    if (request.method !== "GET") {
      return new Response("Expected GET", { status: 400 });
    }
    if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
      return new Response("Expected Upgrade: websocket", { status: 426 });
    }

    // Authenticate here, at the boundary, and pass the resolved identity down.
    // The Durable Object trusts its query string precisely because this handler
    // is the only route to it, so anything derived from a client-supplied token
    // must be verified before the forward, never inside the room.
    const userId = url.searchParams.get("userId");
    const displayName = url.searchParams.get("displayName");
    if (!userId || !displayName) {
      return new Response("userId and displayName are required", {
        status: 400,
      });
    }

    // getByName replaces idFromName + get. One object per room name, which is
    // what makes every socket in a room reachable from one getWebSockets() call.
    const stub = env.ROOM.getByName(match[1]);

    // Forwarded as a fetch rather than RPC: RPC cannot carry a WebSocket upgrade.
    return stub.fetch(request);
  },
} satisfies ExportedHandler<ChatEnv>;
