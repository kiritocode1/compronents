// @ts-nocheck
// NextResponse.upgrade() is an RFC (github.com/vercel/next.js/discussions/95514),
// not yet shipped in the installed Next.js types.
import { NextResponse } from "next/server";

// Requires the experimental flag in next.config.ts:
//   experimental: { webSocketRouteHandlers: true }
// Node.js runtime only: not supported on Edge, static export, or Vercel
// Functions (the edge network terminates WebSocket connections before they
// reach a Function). Works with `next dev`, `next start`, and standalone
// Node output.
export function GET(request: Request) {
  return NextResponse.upgrade({
    open(peer) {
      peer.send({ type: "welcome", message: "connected" });
    },
    message(peer, message) {
      // Echo whatever the client sends back to them.
      peer.send(message.text());
    },
    close(peer, event) {
      console.log("closed", peer.id, event);
    },
    error(peer, error) {
      console.error(error);
    },
  });
}
