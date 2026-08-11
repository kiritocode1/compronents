/**
 * browser-channel.ts
 *
 * A popup, an iframe, or a worker as one scoped Effect Stream. The listener is
 * provably live before the context exists, every event is pinned to that one
 * peer and decoded against a schema, and the context is released by a
 * finalizer on every exit path.
 *
 * Failure modes solved:
 *   1. The lost handshake (the race you cannot see in development): a child
 *      context posts its first message as soon as it boots. Code that opens
 *      the popup and then attaches the listener is racing that boot; it wins
 *      on a warm cache and a fast machine and loses on a cold one, so the bug
 *      ships as "the sign-in window sometimes just hangs". Ordering the two
 *      steps removes the race instead of shrinking it, because the peer gate
 *      reads its handle at DELIVERY time and can therefore be attached while
 *      that handle is still null.
 *   2. The lazy subscription (the fix that does not fix it): writing that
 *      ordering as a Stream does not achieve it. A Stream subscribes when it
 *      is run, so forking a drain of BrowserStream.fromEventListenerWindow
 *      leaves zero listeners attached when the next statement executes, and a
 *      yield does not help. Measured on effect 4.0.0-beta.98, not assumed.
 *      The listener that must be live before another side effect happens has
 *      to be attached by an effect that can be sequenced against, which is
 *      what acquireRelease is for; a Stream is the right tool only for a
 *      listener whose attach time does not matter.
 *   3. The unpinned peer (window.onmessage is a party line): every frame,
 *      extension, embedded player, and analytics tag on the page posts to the
 *      same window. A handler that trusts event.data will decode an ad
 *      iframe's message as its own protocol. Pinning event.source (this exact
 *      context) and event.origin (this exact site) is what turns a shared bus
 *      into a channel; source alone accepts a stolen handle, origin alone
 *      accepts any frame on the trusted site.
 *   4. The orphaned context (the leak with a UI): nothing in the platform
 *      closes a popup, removes an iframe, or terminates a worker when the
 *      code that opened it stops caring, and a popup outlives the very tab
 *      that opened it. Binding release to the stream's scope means an early
 *      return, a failure, and an interrupt all clean up on one path, because
 *      there is only one path.
 *   5. The silent death (waiting on a peer that is already gone): the browser
 *      fires no event when a user closes a popup, and a worker that throws on
 *      boot simply never answers. Without a liveness check the consumer waits
 *      forever on a stream that can no longer emit. A handshake deadline and
 *      a closed-poll turn both into typed failures.
 *   6. The untyped payload (structured clone hands you `any`): postMessage
 *      data crosses a trust boundary with no shape. Decoding at the edge
 *      means a malformed frame fails the channel with a protocol error
 *      instead of crashing a reducer three layers in.
 *   7. The premature request (failure mode 1 seen from the child's side):
 *      having fixed our own listener ordering it is tempting to post as soon
 *      as the context opens, but the child is running the same race and drops
 *      whatever arrives before its listener is attached. The peer's own first
 *      message is the only evidence it is listening, so `onReady` sends on
 *      the back of one and `onOpen` is kept for the rare handoff that cannot
 *      wait.
 *
 * Why the primitives make it correct: Stream.callback owns a Scope, so
 * acquireRelease inside it ties the context's lifetime to the stream's with no
 * interruption window between opening the context and registering its
 * teardown, and the listener registered in that same scope cannot outlive the
 * channel it feeds.
 */

import { BrowserStream } from "@effect/platform-browser";
import {
  Cause,
  Data,
  Duration,
  Effect,
  Fiber,
  Option,
  Queue,
  Result,
  Schema,
  type Scope,
  Stream,
} from "effect";

// ---------------------------------------------------------------------------
// errors
// ---------------------------------------------------------------------------

/** The context never opened: a blocked popup, or an iframe with no document. */
export class ContextBlocked extends Data.TaggedError("ContextBlocked")<{
  readonly context: string;
}> {}

/** The context opened but never spoke, so it is not running our protocol. */
export class HandshakeTimeout extends Data.TaggedError("HandshakeTimeout")<{
  readonly context: string;
  readonly waitedMillis: number;
}> {}

/** The context went away: closed by the user, detached, or crashed on boot. */
export class PeerGone extends Data.TaggedError("PeerGone")<{
  readonly context: string;
  readonly reason: string;
}> {}

/** A message arrived from the right peer but did not match the protocol. */
export class PeerProtocolError extends Data.TaggedError("PeerProtocolError")<{
  readonly context: string;
  readonly detail: string;
}> {}

/** A one-shot request went unanswered before its deadline. */
export class RequestTimeout extends Data.TaggedError("RequestTimeout")<{
  readonly context: string;
  readonly waitedMillis: number;
}> {}

export type ChannelError =
  | ContextBlocked
  | HandshakeTimeout
  | PeerGone
  | PeerProtocolError;

// ---------------------------------------------------------------------------
// the peer handle
// ---------------------------------------------------------------------------

/**
 * One opened browser context, reduced to the four things a channel needs.
 * Popups and iframes share the window message bus and so must be identified by
 * `source`; a worker owns a private port and reports null, which matches the
 * null `source` its own events carry.
 */
export interface BrowserPeer {
  /** the identity every event must carry in `source`; null for a private port */
  readonly source: unknown;
  /** send into the context */
  readonly post: (message: unknown) => void;
  /** true once the context can no longer answer */
  readonly gone: () => boolean;
  /** close the popup, remove the iframe, terminate the worker */
  readonly release: () => void;
}

/**
 * Any schema that decodes without services, which is every postMessage
 * protocol: the payload is plain structured-clone data, so decoding it must
 * not need a database or an HTTP client.
 */
export type PlainSchema = Schema.Top & { readonly DecodingServices: never };

export interface ChannelOptions<S extends PlainSchema> {
  /** the protocol; anything that fails to decode fails the channel */
  readonly messages: S;
  /**
   * The exact origin the peer must post from. Use "*" only for a private port
   * (a worker), where there is no shared bus and so no origin to check.
   */
  readonly origin: string;
  /** fail if the peer has not sent an accepted message within this. 10s */
  readonly handshake?: Duration.Input;
  /** how often to check that the context is still alive. 250ms */
  readonly liveness?: Duration.Input;
  /**
   * Runs the moment the context exists. Use it only for something that cannot
   * wait, such as handing over a MessagePort, and understand the risk: the
   * child has the same race this component solves, seen from the other side.
   * It drops anything posted before its own listener is attached.
   */
  readonly onOpen?: (peer: BrowserPeer) => Effect.Effect<void>;
  /**
   * Runs once the peer's FIRST message has been accepted. Prefer this for
   * anything you send: a message from the peer is the only proof that the
   * peer is listening, so a request sent on the back of one cannot be
   * dropped by a context that has not finished booting.
   */
  readonly onReady?: (peer: BrowserPeer) => Effect.Effect<void>;
}

/** what the constructors below hand the core; `onOpen` may hold the scope */
interface CoreOptions<S extends PlainSchema>
  extends Omit<ChannelOptions<S>, "onOpen"> {
  readonly onOpen?: (
    peer: BrowserPeer,
  ) => Effect.Effect<unknown, never, Scope.Scope>;
}

/**
 * Attach a listener for the life of the scope and hand back nothing: the
 * caller sequences on this effect COMPLETING, which is the guarantee a forked
 * stream drain cannot give (failure mode 2).
 */
type Attach = (
  deliver: (event: MessageEvent) => void,
) => Effect.Effect<unknown, never, Scope.Scope>;

// ---------------------------------------------------------------------------
// the core: one context, one stream, one scope
// ---------------------------------------------------------------------------

const channel = <S extends PlainSchema>(
  context: string,
  attach: Attach,
  open: Effect.Effect<BrowserPeer, ContextBlocked>,
  options: CoreOptions<S>,
): Stream.Stream<S["Type"], ChannelError> => {
  const handshake = options.handshake ?? "10 seconds";
  const liveness = options.liveness ?? "250 millis";
  const onReady = options.onReady;

  // Suspended so that every run of this stream opens its own context and gets
  // its own handles. A Stream is a description, not a running thing.
  return Stream.suspend(() => {
    // Still null while the listener attaches, and that is the point: the gate
    // reads it at delivery time, so the listener is live before the context it
    // filters for exists.
    let peer: BrowserPeer | null = null;
    let heard = false;
    let announced = false;

    const messages = Stream.callback<S["Type"], ChannelError>(
      Effect.fnUntraced(function* (queue) {
        // Synchronous decode, so a message cannot overtake the one before it
        // on the way to the queue. A postMessage protocol is plain data and
        // needs no services to decode.
        const decode = Schema.decodeUnknownResult(options.messages);

        // 1. Listen. This effect COMPLETING is the proof the listener is on.
        yield* attach((event) => {
          if (peer === null) return;
          if (event.source !== peer.source) return;
          if (options.origin !== "*" && event.origin !== options.origin) return;
          heard = true;
          const decoded = decode(event.data);
          if (Result.isSuccess(decoded)) {
            Queue.offerUnsafe(queue, decoded.success);
          } else {
            Queue.failCauseUnsafe(
              queue,
              Cause.fail(
                new PeerProtocolError({
                  context,
                  detail: decoded.failure.message,
                }),
              ),
            );
          }
        });

        // 2. Only now open the context. acquireRelease rather than open
        //    followed by addFinalizer: the pair is atomic, so an interrupt
        //    landing between them cannot leave an orphaned popup on screen.
        peer = yield* Effect.acquireRelease(open, (opened) =>
          Effect.sync(() => opened.release()),
        );

        // 3. Anything that genuinely cannot wait for the peer to speak.
        if (options.onOpen !== undefined) yield* options.onOpen(peer);

        // 4. A context that never speaks is not running our protocol. Without
        //    this the consumer waits on a stream that will never emit.
        yield* Effect.forkScoped(
          Effect.sleep(handshake).pipe(
            Effect.andThen(
              Effect.suspend(() =>
                heard
                  ? Effect.void
                  : Queue.fail(
                      queue,
                      new HandshakeTimeout({
                        context,
                        waitedMillis: Duration.toMillis(handshake),
                      }),
                    ),
              ),
            ),
          ),
        );

        // 5. The browser fires no event when a user closes a popup, so the
        //    only way to notice is to look. The loop ends itself on the first
        //    sight of a dead context rather than spinning until the scope
        //    closes.
        const watch: Effect.Effect<void> = Effect.suspend(() =>
          peer?.gone()
            ? Effect.asVoid(
                Queue.fail(
                  queue,
                  new PeerGone({ context, reason: "context closed" }),
                ),
              )
            : Effect.andThen(Effect.sleep(liveness), watch),
        );
        yield* Effect.forkScoped(watch);
      }),
    );

    // 6. The peer's first message is the only proof it is listening, so
    //    anything we send rides on the back of one. Sending at open time
    //    instead is failure mode 1 played out on the child's side of the
    //    channel, and it is just as invisible in development.
    return onReady === undefined
      ? messages
      : Stream.tap(messages, () => {
          const current = peer;
          if (announced || current === null) return Effect.void;
          announced = true;
          return onReady(current);
        });
  });
};

// ---------------------------------------------------------------------------
// contexts
// ---------------------------------------------------------------------------

/** the window message bus, attached by an effect the core can sequence on */
const attachToWindow: Attach = (deliver) =>
  Effect.acquireRelease(
    Effect.sync(() => {
      const handler = (event: Event) => deliver(event as MessageEvent);
      window.addEventListener("message", handler);
      return handler;
    }),
    (handler) =>
      Effect.sync(() => window.removeEventListener("message", handler)),
  );

/**
 * Close the peer when the opener page goes away. A popup is the one context
 * the browser does NOT tear down with its opener, so an abandoned tab leaves a
 * live window on screen holding a half-finished flow.
 *
 * This is the listener BrowserStream is right for: nothing is racing it, so it
 * costs nothing that it subscribes when the fiber gets around to running.
 */
const closeWithOpener = (peer: BrowserPeer) =>
  Effect.forkScoped(
    Stream.runForEach(BrowserStream.fromEventListenerWindow("pagehide"), () =>
      Effect.sync(() => peer.release()),
    ),
  );

/**
 * A popup window as a stream. The popup is closed when the stream ends, for
 * any reason: completion, failure, interruption, or the opener going away.
 */
export const popupChannel = <S extends PlainSchema>(
  options: ChannelOptions<S> & {
    readonly url: string;
    readonly features?: string;
  },
): Stream.Stream<S["Type"], ChannelError> => {
  const context = `popup ${options.url}`;
  return channel(
    context,
    attachToWindow,
    Effect.suspend(() => {
      const opened = window.open(
        options.url,
        "_blank",
        options.features ?? "popup=yes,width=520,height=680",
      );
      // A blocked popup is null, not an exception, and it is the single most
      // common reason this flow does not run. Make it a typed failure.
      return opened === null
        ? Effect.fail(new ContextBlocked({ context }))
        : Effect.succeed<BrowserPeer>({
            source: opened,
            post: (message) => opened.postMessage(message, options.origin),
            gone: () => opened.closed,
            release: () => opened.close(),
          });
    }),
    {
      ...options,
      onOpen: (peer) =>
        Effect.andThen(
          closeWithOpener(peer),
          options.onOpen?.(peer) ?? Effect.void,
        ),
    },
  );
};

/**
 * A hidden iframe as a stream, for a same-page context that must not steal
 * focus. The element is removed from the document when the stream ends.
 */
export const iframeChannel = <S extends PlainSchema>(
  options: ChannelOptions<S> & {
    readonly url: string;
    /** default "allow-scripts": no same-origin, no forms, no top navigation */
    readonly sandbox?: string;
  },
): Stream.Stream<S["Type"], ChannelError> => {
  const context = `iframe ${options.url}`;
  return channel(
    context,
    attachToWindow,
    Effect.suspend(() => {
      const frame = document.createElement("iframe");
      frame.setAttribute("sandbox", options.sandbox ?? "allow-scripts");
      frame.setAttribute("aria-hidden", "true");
      frame.style.display = "none";
      frame.src = options.url;
      document.body.appendChild(frame);
      const view = frame.contentWindow;
      if (view === null) {
        frame.remove();
        return Effect.fail(new ContextBlocked({ context }));
      }
      return Effect.succeed<BrowserPeer>({
        source: view,
        post: (message) => view.postMessage(message, options.origin),
        gone: () => !frame.isConnected,
        release: () => frame.remove(),
      });
    }),
    options,
  );
};

/**
 * A dedicated worker as a stream. A worker is a private port rather than a
 * shared bus, so there is no origin to pin, but the ordering problem is worse:
 * its port starts delivering the moment it is constructed, and an event with
 * no listener is dropped rather than queued. Construction and subscription
 * therefore happen in one synchronous step, which is what makes an await
 * between them impossible to write, and whatever the worker says before the
 * channel is ready waits in a backlog instead of being lost.
 */
export const workerChannel = <S extends PlainSchema>(
  options: Omit<ChannelOptions<S>, "origin"> & {
    readonly spawn: () => Worker;
    readonly label?: string;
  },
): Stream.Stream<S["Type"], ChannelError> =>
  Stream.unwrap(
    Effect.sync(() => {
      const context = `worker ${options.label ?? "dedicated"}`;
      const worker = options.spawn();
      let crashed = false;
      const backlog: MessageEvent[] = [];
      let sink: ((event: MessageEvent) => void) | null = null;
      const onMessage = (event: Event) => {
        const message = event as MessageEvent;
        if (sink === null) backlog.push(message);
        else sink(message);
      };
      worker.addEventListener("message", onMessage);
      // A worker that throws on boot never answers; this is its version of a
      // user closing the popup.
      worker.addEventListener("error", () => {
        crashed = true;
      });

      const attach: Attach = (deliver) =>
        Effect.acquireRelease(
          Effect.sync(() => {
            sink = deliver;
          }),
          () =>
            Effect.sync(() => {
              sink = null;
              worker.removeEventListener("message", onMessage);
            }),
        );

      return channel(
        context,
        attach,
        Effect.succeed<BrowserPeer>({
          // A private port carries no source, and neither do its events, so
          // the identity check passes on null === null.
          source: null,
          post: (message) => worker.postMessage(message),
          gone: () => crashed,
          release: () => worker.terminate(),
        }),
        {
          ...options,
          origin: "*",
          // The backlog is replayed only once the peer exists, because the
          // gate drops everything while it is still null.
          onOpen: (peer) =>
            Effect.sync(() => {
              const buffered = backlog.splice(0, backlog.length);
              for (const event of buffered) sink?.(event);
            }).pipe(Effect.andThen(options.onOpen?.(peer) ?? Effect.void)),
        },
      );
    }),
  );

// ---------------------------------------------------------------------------
// one-shot request
// ---------------------------------------------------------------------------

/**
 * Open a context, ask it one question, and take the first matching answer.
 *
 * The channel's scope closes as soon as that answer is taken, so the popup
 * that signed the transaction is closed by the same step that produced the
 * result. There is no cleanup call left to forget.
 */
export const askPeer = <A, E, R>(options: {
  readonly context: string;
  /**
   * Build the channel with the handler given. It is wired to `onReady`, not
   * `onOpen`, so the request goes out on the back of the peer's own first
   * message rather than into a context that may still be booting.
   */
  readonly channel: (
    onReady: (peer: BrowserPeer) => Effect.Effect<void>,
  ) => Stream.Stream<A, E, R>;
  readonly request: unknown;
  readonly accept: (message: A) => boolean;
  /** default 30s: an upper bound on a human in the popup, not on a network */
  readonly timeout?: Duration.Input;
}): Effect.Effect<A, E | RequestTimeout, R> => {
  const timeout = options.timeout ?? "30 seconds";
  const timedOut = Effect.fail(
    new RequestTimeout({
      context: options.context,
      waitedMillis: Duration.toMillis(timeout),
    }),
  );
  return options
    .channel((peer) => Effect.sync(() => peer.post(options.request)))
    .pipe(
      Stream.filter(options.accept),
      Stream.take(1),
      Stream.runHead,
      Effect.flatMap(
        Option.match({ onNone: () => timedOut, onSome: Effect.succeed }),
      ),
      Effect.timeoutOrElse({ duration: timeout, orElse: () => timedOut }),
    );
};

// ---------------------------------------------------------------------------
// demo: prove the properties
// ---------------------------------------------------------------------------

/**
 * A page, a popup, and a worker small enough to reason about. The point of a
 * fake DOM here is that the ordering claims above are about WHEN listeners
 * attach, and that is exactly what a real browser hides from a test.
 */
const PEER = "https://wallet.example";
const URL_ = `${PEER}/authorize`;

const Wallet = Schema.TaggedUnion({
  ready: { protocol: Schema.String },
  signed: { requestId: Schema.String, receipt: Schema.String },
});

type Handler = (event: never) => void;

class FakePopup {
  closed = false;
  readonly inbox: unknown[] = [];
  onRequest: ((message: unknown) => void) | null = null;
  constructor(private readonly page: FakePage) {}
  /** page -> popup */
  postMessage(message: unknown, _targetOrigin?: string) {
    this.inbox.push(message);
    this.onRequest?.(message);
  }
  close() {
    this.closed = true;
  }
  /** popup -> page */
  say(data: unknown, origin = PEER) {
    this.page.emit("message", { data, origin, source: this });
  }
}

class FakePage {
  private readonly handlers = new Map<string, Set<Handler>>();
  blocked = false;
  /** what the child does once it has booted, on its own clock */
  boot: ((popup: FakePopup) => void) | null = null;
  readonly opened: FakePopup[] = [];

  addEventListener(type: string, handler: Handler) {
    const set = this.handlers.get(type) ?? new Set<Handler>();
    set.add(handler);
    this.handlers.set(type, set);
  }
  removeEventListener(type: string, handler: Handler) {
    this.handlers.get(type)?.delete(handler);
  }
  emit(type: string, event: unknown) {
    for (const handler of [...(this.handlers.get(type) ?? [])]) {
      handler(event as never);
    }
  }
  open(_url: string, _target?: string, _features?: string) {
    if (this.blocked) return null;
    const popup = new FakePopup(this);
    this.opened.push(popup);
    // A real popup boots on its own clock. A fast one is already talking by
    // the time `open` has returned to its caller.
    queueMicrotask(() => {
      if (!popup.closed) this.boot?.(popup);
    });
    return popup;
  }
  get listeners() {
    return this.handlers.get("message")?.size ?? 0;
  }
}

class FakeWorker {
  private readonly handlers = new Map<string, Set<Handler>>();
  terminated = false;
  readonly inbox: unknown[] = [];
  addEventListener(type: string, handler: Handler) {
    const set = this.handlers.get(type) ?? new Set<Handler>();
    set.add(handler);
    this.handlers.set(type, set);
  }
  removeEventListener(type: string, handler: Handler) {
    this.handlers.get(type)?.delete(handler);
  }
  postMessage(message: unknown) {
    this.inbox.push(message);
  }
  terminate() {
    this.terminated = true;
  }
  /** worker -> page: a private port carries no source and no origin */
  say(data: unknown) {
    for (const handler of [...(this.handlers.get("message") ?? [])]) {
      handler({ data, origin: "", source: null } as never);
    }
  }
}

const installPage = () => {
  const page = new FakePage();
  (globalThis as { window?: unknown }).window = page;
  return page;
};

const ready = { _tag: "ready", protocol: "wallet/1" };

const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() =>
      console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`),
    );
  const base = {
    url: URL_,
    origin: PEER,
    messages: Wallet,
    handshake: "400 millis",
    liveness: "20 millis",
  } as const;

  // Property 1: the listener is live before the context exists, so a popup
  // that boots instantly cannot slip its first message past us. The same
  // flow written the ordinary way loses it.
  {
    const page = installPage();
    page.boot = (popup) => popup.say(ready);
    const ours = yield* popupChannel(base).pipe(Stream.take(1), Stream.runHead);

    const naivePage = installPage();
    naivePage.boot = (popup) => popup.say(ready);
    const theirs = yield* Effect.gen(function* () {
      // open first, subscribe second: the shape this component replaces
      const opened = window.open(URL_, "_blank");
      return yield* BrowserStream.fromEventListenerWindow("message").pipe(
        Stream.filter((event) => event.source === opened),
        Stream.take(1),
        Stream.runHead,
        Effect.timeoutOrElse({
          duration: "120 millis",
          orElse: () => Effect.succeed(Option.none<MessageEvent>()),
        }),
      );
    });

    yield* check(
      "listen-before-open wins the boot race",
      Option.isSome(ours) && Option.isNone(theirs),
      `scoped channel got ${Option.isSome(ours) ? (ours.value as { _tag: string })._tag : "nothing"}, open-then-listen got ${Option.isSome(theirs) ? "a message" : "nothing"}`,
    );
    yield* check(
      "the listener is removed with the channel",
      page.listeners === 0,
      `${page.listeners} message listener(s) left on the page`,
    );
  }

  // Property 2: a shared bus carries everyone. Only the pinned peer, posting
  // from the pinned origin, gets through.
  {
    const page = installPage();
    const impostor = new FakePopup(page);
    page.boot = (popup) => {
      impostor.say({ _tag: "ready", protocol: "impostor" }); // wrong source
      popup.say(ready, "https://evil.example"); // wrong origin
      popup.say(ready); // ours
    };
    const first = yield* popupChannel(base).pipe(
      Stream.take(1),
      Stream.runHead,
    );
    const protocol = Option.isSome(first)
      ? (first.value as { protocol?: string }).protocol
      : "nothing";
    yield* check(
      "source and origin pin the peer",
      protocol === "wallet/1",
      `three messages on the bus, the channel emitted "${protocol}"`,
    );
  }

  // Property 3: a frame from the right peer that is not the protocol fails
  // the channel at the edge instead of reaching the consumer.
  {
    const page = installPage();
    page.boot = (popup) => popup.say({ _tag: "signed", requestId: 42 });
    const error = yield* Effect.flip(Stream.runDrain(popupChannel(base)));
    yield* check(
      "a malformed frame fails at the edge",
      error._tag === "PeerProtocolError" && page.opened[0].closed,
      `${error._tag}, popup closed: ${page.opened[0].closed}`,
    );
  }

  // Property 4: interruption is not a special case. The popup closes on the
  // same path as a clean end.
  {
    const page = installPage();
    page.boot = (popup) => popup.say(ready);
    const fiber = yield* Effect.forkDetach(
      Stream.runDrain(popupChannel({ ...base, liveness: "5 seconds" })),
    );
    yield* Effect.sleep("40 millis");
    yield* Fiber.interrupt(fiber);
    yield* check(
      "interruption closes the popup",
      page.opened[0].closed && page.listeners === 0,
      `popup closed: ${page.opened[0].closed}, listeners left: ${page.listeners}`,
    );
  }

  // Property 5: a context that opens but never speaks is a typed failure, not
  // a hang.
  {
    const page = installPage();
    page.boot = null;
    const error = yield* Effect.flip(
      Stream.runDrain(popupChannel({ ...base, handshake: "80 millis" })),
    );
    yield* check(
      "a silent context times out instead of hanging",
      error._tag === "HandshakeTimeout" && page.opened[0].closed,
      `${error._tag} after ${(error as HandshakeTimeout).waitedMillis}ms, popup closed: ${page.opened[0].closed}`,
    );
  }

  // Property 6: the browser fires no event when a user closes a popup, so the
  // channel has to look for itself.
  {
    const page = installPage();
    page.boot = (popup) => {
      popup.say(ready);
      setTimeout(() => {
        popup.closed = true; // the user clicked the X
      }, 40);
    };
    const error = yield* Effect.flip(Stream.runDrain(popupChannel(base)));
    yield* check(
      "a popup the user closed ends the stream",
      error._tag === "PeerGone",
      `stream failed with ${error._tag} rather than waiting forever`,
    );
  }

  // Property 7: a popup outlives the tab that opened it unless something
  // closes it.
  {
    const page = installPage();
    page.boot = (popup) => popup.say(ready);
    const fiber = yield* Effect.forkDetach(
      Stream.runDrain(popupChannel({ ...base, liveness: "5 seconds" })),
    );
    yield* Effect.sleep("60 millis");
    page.emit("pagehide", {});
    yield* Effect.sleep("20 millis");
    const closed = page.opened[0].closed;
    yield* Fiber.interrupt(fiber);
    yield* check(
      "the opener navigating away closes the popup",
      closed,
      `popup closed on pagehide: ${closed}`,
    );
  }

  // Property 8: one question, one answer, and the popup is closed by the same
  // step that produced the result.
  {
    const page = installPage();
    const requestId = "req-7";
    page.boot = (popup) => {
      popup.say(ready);
      popup.onRequest = (message) =>
        popup.say({
          _tag: "signed",
          requestId: (message as { requestId: string }).requestId,
          receipt: "0xfeed",
        });
    };
    const answer = yield* askPeer({
      context: "wallet",
      channel: (onReady) => popupChannel({ ...base, onReady }),
      request: { _tag: "sign", requestId },
      accept: (message) =>
        message._tag === "signed" && message.requestId === requestId,
      timeout: "500 millis",
    });
    yield* check(
      "one-shot ask releases the popup with the answer",
      answer._tag === "signed" &&
        answer.receipt === "0xfeed" &&
        page.opened[0].closed &&
        page.listeners === 0,
      `receipt ${answer._tag === "signed" ? answer.receipt : "none"}, popup closed: ${page.opened[0].closed}, listeners left: ${page.listeners}`,
    );
  }

  // Property 9: a worker's port drops events that arrive with no listener, so
  // the boot message has to be buffered from construction, not from drain.
  {
    installPage();
    let spawned: FakeWorker | null = null;
    const stream = workerChannel({
      messages: Wallet,
      handshake: "400 millis",
      liveness: "20 millis",
      label: "signer",
      spawn: () => {
        const worker = new FakeWorker();
        spawned = worker;
        queueMicrotask(() => worker.say(ready));
        return worker as unknown as Worker;
      },
    });
    const boot = yield* stream.pipe(Stream.take(1), Stream.runHead);
    const worker = spawned as FakeWorker | null;
    yield* check(
      "a worker's boot message survives the gap before the drain",
      Option.isSome(boot) && worker !== null && worker.terminated,
      `got ${Option.isSome(boot) ? (boot.value as { _tag: string })._tag : "nothing"}, worker terminated on scope close: ${worker?.terminated}`,
    );
  }

  // Property 10: a blocked popup is a typed failure, not a null dereference.
  {
    const page = installPage();
    page.blocked = true;
    const error = yield* Effect.flip(Stream.runDrain(popupChannel(base)));
    yield* check(
      "a blocked popup is typed, not a crash",
      error._tag === "ContextBlocked",
      `window.open returned null and the stream failed with ${error._tag}`,
    );
  }

  console.log("browser-channel.ts: all properties verified");
});

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e);
  process.exit(1);
});
