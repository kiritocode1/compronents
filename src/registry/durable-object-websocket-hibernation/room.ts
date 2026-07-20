/// <reference types="@cloudflare/workers-types" />

/**
 * A chat room Durable Object that holds thousands of open WebSockets without
 * being pinned to memory, using the WebSocket Hibernation API.
 *
 * `ws.accept()` and `ctx.acceptWebSocket(ws)` produce the same open socket and
 * bill completely differently. With `ws.accept()` the Durable Object stays
 * resident for the entire life of the connection, so an idle room with 200
 * lurkers accrues duration charges overnight for doing nothing. With
 * `ctx.acceptWebSocket(ws)` the runtime owns the socket: the object can be
 * evicted during inactivity while every connection stays open, and the next
 * inbound frame reconstructs the object (running the constructor again) and
 * dispatches to `webSocketMessage`.
 *
 * That eviction is the whole design constraint. When the object is evicted,
 * every field on the instance is gone. The classic bug is a
 * `Map<WebSocket, Session>` populated in `fetch`: it is correct in `wrangler
 * dev`, correct in any test that finishes in a few seconds, and then in
 * production it is empty for the first message after a quiet period, so
 * broadcast silently delivers to nobody and no error is thrown anywhere. The
 * fix is to stop keeping per-connection state on the instance at all. The
 * socket itself is the storage:
 *
 *   - `ws.serializeAttachment(value)` stores a structured-cloneable value
 *     alongside the connection. Maximum serialized size is 16,384 bytes, and
 *     the attachment is dropped when the connection closes.
 *   - `ws.deserializeAttachment()` returns a copy. Mutating that copy changes
 *     nothing; you must call `serializeAttachment` again to persist an edit.
 *   - `ctx.getWebSockets(tag?)` recovers the connection set after a wake,
 *     which is the only way to enumerate sockets you never held a reference to.
 *
 * Tags are assigned once, in `acceptWebSocket(ws, tags)`, and there is no API
 * to change them afterwards; `ctx.getTags(ws)` only reads them back. So tag by
 * identity that cannot change (a user id) and attach anything that can (a
 * subscription set). At most 10 tags per WebSocket, 256 characters each, and
 * 32,768 hibernatable connections per Durable Object.
 *
 * The other half of staying hibernated is the heartbeat. A client `setInterval`
 * that sends `{"type":"ping"}` wakes the object on every tick and turns
 * hibernation back into a full-time resident with extra steps.
 * `ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair("ping",
 * "pong"))` makes the runtime answer that exact request string without waking
 * anything. Request and response are limited to 2,048 characters each, and the
 * match is exact string equality, not a parse, so the client must send the
 * literal `ping` and nothing else. `ctx.getWebSocketAutoResponseTimestamp(ws)`
 * then gives you the last auto-ping time for free, which is enough to reap dead
 * connections without a heartbeat that costs a wake.
 *
 * Pinned to @cloudflare/workers-types@5.20260719.1, wrangler 4.112.0,
 * compatibility_date 2026-07-01.
 *
 * Matching wrangler.jsonc:
 *
 * {
 *   "name": "blank-chat",
 *   "main": "src/chat/worker.ts",
 *   "compatibility_date": "2026-07-01",
 *   "durable_objects": {
 *     "bindings": [{ "name": "ROOM", "class_name": "ChatRoom" }]
 *   },
 *   "exports": {
 *     "ChatRoom": { "type": "durable-object", "storage": "sqlite" }
 *   }
 * }
 */

import { DurableObject } from "cloudflare:workers";

export type ChatEnv = {
  ROOM: DurableObjectNamespace<ChatRoom>;
};

/**
 * Per-connection state. This is the entire memory of a connection: it must be
 * structured-cloneable and it must serialize to under 16,384 bytes, so it holds
 * identity and a bounded subscription set, never message history.
 */
export type Session = {
  userId: string;
  displayName: string;
  joinedAt: number;
  topics: string[];
};

type Inbound =
  | { type: "subscribe" | "unsubscribe"; topic: string }
  | { type: "say"; topic: string; text: string };

/** Bounds chosen so a Session stays far below the 16,384 byte attachment limit. */
const MAX_TOPICS = 32;
const MAX_TOPIC_LENGTH = 64;
const MAX_TEXT_LENGTH = 4_000;

/** Auto-response strings are matched by exact equality and capped at 2,048 characters. */
const PING = "ping";
const PONG = "pong";

/** A connection with no auto-ping for this long is treated as dead. */
const STALE_AFTER_MS = 90_000;

export class ChatRoom extends DurableObject<ChatEnv> {
  constructor(ctx: DurableObjectState, env: ChatEnv) {
    super(ctx, env);
    // Re-registered on every wake, because the constructor is what a wake runs.
    // Cheap and idempotent, so there is no reason to try to detect a cold start.
    ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair(PING, PONG));
    // ponytail: no sessions Map is rebuilt here on purpose. getWebSockets() plus
    // deserializeAttachment() is already the connection set, and a mirror of it
    // on the instance is the exact thing that goes stale after an eviction.
  }

  override async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const displayName = url.searchParams.get("displayName");
    if (!userId || !displayName) {
      return new Response("userId and displayName are required", {
        status: 400,
      });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    // Tags are fixed at accept time. `user:<id>` lets a later request reach every
    // device a single user has open without deserializing all 32k attachments.
    this.ctx.acceptWebSocket(server, [`user:${userId}`.slice(0, 256)]);

    const session: Session = {
      userId,
      displayName: displayName.slice(0, 128),
      joinedAt: Date.now(),
      topics: [],
    };
    server.serializeAttachment(session);

    return new Response(null, { status: 101, webSocket: client });
  }

  override async webSocketMessage(
    ws: WebSocket,
    message: string | ArrayBuffer,
  ): Promise<void> {
    // Auto-responded pings never reach this handler, so anything arriving here
    // is real work and the wake it cost was justified.
    if (typeof message !== "string") {
      return this.send(ws, {
        type: "error",
        error: "binary frames are not accepted",
      });
    }

    let parsed: Inbound;
    try {
      parsed = JSON.parse(message) as Inbound;
    } catch {
      return this.send(ws, { type: "error", error: "malformed json" });
    }

    // deserializeAttachment returns a copy, so every mutation below is followed
    // by a serializeAttachment. Forgetting that write is a silent no-op that
    // only shows up after the next eviction.
    const session = ws.deserializeAttachment() as Session | null;
    if (!session) {
      // Accepted without an attachment, which means it did not come through
      // fetch above. Nothing can be authorised, so drop it.
      ws.close(1011, "session missing");
      return;
    }

    switch (parsed.type) {
      case "subscribe": {
        const topic = normalizeTopic(parsed.topic);
        if (!topic)
          return this.send(ws, { type: "error", error: "invalid topic" });
        if (session.topics.includes(topic)) return;
        if (session.topics.length >= MAX_TOPICS) {
          return this.send(ws, { type: "error", error: "topic limit reached" });
        }
        session.topics.push(topic);
        ws.serializeAttachment(session);
        return this.send(ws, { type: "subscribed", topic });
      }

      case "unsubscribe": {
        const topic = normalizeTopic(parsed.topic);
        if (!topic)
          return this.send(ws, { type: "error", error: "invalid topic" });
        session.topics = session.topics.filter((t) => t !== topic);
        ws.serializeAttachment(session);
        return this.send(ws, { type: "unsubscribed", topic });
      }

      case "say": {
        const topic = normalizeTopic(parsed.topic);
        if (!topic || !session.topics.includes(topic)) {
          return this.send(ws, {
            type: "error",
            error: "not subscribed to topic",
          });
        }
        const text = String(parsed.text ?? "").slice(0, MAX_TEXT_LENGTH);
        if (!text) return;
        this.broadcast(topic, {
          type: "message",
          topic,
          text,
          from: session.displayName,
          userId: session.userId,
          at: Date.now(),
        });
        return;
      }

      default:
        return this.send(ws, { type: "error", error: "unknown message type" });
    }
  }

  override async webSocketClose(
    ws: WebSocket,
    code: number,
    reason: string,
    _wasClean: boolean,
  ): Promise<void> {
    const session = ws.deserializeAttachment() as Session | null;
    // The attachment dies with the connection, so read it before closing.
    if (session) {
      for (const topic of session.topics) {
        this.broadcast(topic, {
          type: "left",
          topic,
          userId: session.userId,
          at: Date.now(),
        });
      }
    }
    // 1006 is never a valid close code to send back.
    ws.close(
      code >= 1000 && code < 5000 && code !== 1006 ? code : 1000,
      reason,
    );
  }

  override async webSocketError(ws: WebSocket, error: unknown): Promise<void> {
    const session = ws.deserializeAttachment() as Session | null;
    console.error("websocket error", {
      userId: session?.userId,
      message: error instanceof Error ? error.message : String(error),
    });
  }

  /**
   * Fan out to every socket subscribed to `topic`.
   *
   * This is the path that a stale in-memory Map breaks. `getWebSockets()` is
   * served by the runtime rather than by instance state, so it returns the full
   * connection set on the very first call after a wake, including sockets opened
   * by a previous incarnation of this object that this instance has never seen.
   */
  broadcast(topic: string, payload: Record<string, unknown>): void {
    const frame = JSON.stringify(payload);
    const now = Date.now();

    for (const ws of this.ctx.getWebSockets()) {
      const session = ws.deserializeAttachment() as Session | null;
      if (!session?.topics.includes(topic)) continue;

      // Free liveness signal: the runtime records when it last auto-answered a
      // ping, so a dead connection is detectable without any server heartbeat
      // and without a wake. Null means this socket has not pinged yet.
      const lastPing = this.ctx.getWebSocketAutoResponseTimestamp(ws);
      if (lastPing && now - lastPing.getTime() > STALE_AFTER_MS) {
        ws.close(1001, "stale connection");
        continue;
      }

      // A socket can enter closing between the enumeration and the send, and
      // send() throws on a closed socket. One dead peer must not abort the fan out.
      try {
        ws.send(frame);
      } catch {
        // Already gone; webSocketClose has run or is about to.
      }
    }
  }

  /** RPC entry point: push to one user across every device they have open. */
  async notifyUser(
    userId: string,
    payload: Record<string, unknown>,
  ): Promise<number> {
    const frame = JSON.stringify(payload);
    let delivered = 0;
    // The tag filter is done by the runtime, so this touches only that user's
    // sockets instead of deserializing every attachment in the room.
    for (const ws of this.ctx.getWebSockets(`user:${userId}`)) {
      try {
        ws.send(frame);
        delivered += 1;
      } catch {
        // Ignore closed sockets.
      }
    }
    return delivered;
  }

  /** Occupancy without waking anything else and without any bookkeeping of our own. */
  async occupancy(): Promise<number> {
    return this.ctx.getWebSockets().length;
  }

  private send(ws: WebSocket, payload: Record<string, unknown>): void {
    try {
      ws.send(JSON.stringify(payload));
    } catch {
      // Closed between dispatch and reply.
    }
  }
}

function normalizeTopic(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const topic = raw.trim().slice(0, MAX_TOPIC_LENGTH);
  return /^[a-z0-9:_-]+$/i.test(topic) ? topic : null;
}
