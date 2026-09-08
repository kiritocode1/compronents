"use client";

import { useSound } from "@web-kits/audio/react";
import { Calligraph } from "calligraph";
import { ArrowUpRight, Search, X } from "lucide-react";
import { useQueryState } from "nuqs";
import {
  Suspense,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { InspirationGroup } from "@/lib/inspiration";
import type { RetrievalHit, RetrievalResult } from "@/lib/inspiration/types";
import { browseInspiration } from "@/lib/inspiration-browse";
import { uiHover } from "@/lib/sounds";

/** Below this the local index is guessing, so the server gets a turn. */
const ESCALATE_BELOW = 0.55;
/** Long enough that mid-word keystrokes never reach the network. */
const ESCALATE_DELAY_MS = 250;
/** `in:kalypso` scopes preferences without a second input in the bar. */
const CONTEXT_TOKEN = /(?:^|\s)in:([a-z0-9][a-z0-9/._-]*)/i;

/** One bar carries both the text and the preference scope. */
function splitContext(raw: string) {
  const match = raw.match(CONTEXT_TOKEN);
  if (!match) return { text: raw.trim(), contextKey: "" };
  return {
    text: raw.replace(match[0], " ").replace(/\s+/g, " ").trim(),
    contextKey: match[1].toLowerCase(),
  };
}

async function post(operation: string, body: unknown) {
  const response = await fetch(`/api/inspiration/${operation}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
}

export function InspirationIndex({ groups }: { groups: InspirationGroup[] }) {
  // Reading the URL opts this subtree out of prerendering, so the fallback
  // renders the unfiltered list: static HTML still ships every link.
  return (
    <Suspense fallback={<InspirationIndexView groups={groups} query="" />}>
      <InspirationIndexFiltered groups={groups} />
    </Suspense>
  );
}

function InspirationIndexFiltered({ groups }: { groups: InspirationGroup[] }) {
  const [query, setQuery] = useQueryState("q", { defaultValue: "" });
  return (
    <InspirationIndexView
      groups={groups}
      query={query}
      onQueryChange={setQuery}
    />
  );
}

function InspirationIndexView({
  groups,
  query,
  onQueryChange,
}: {
  groups: InspirationGroup[];
  query: string;
  onQueryChange?: (value: string) => void;
}) {
  const playHover = useSound(uiHover);
  const { text, contextKey } = useMemo(() => splitContext(query), [query]);
  // Ranking 1100+ links runs per keystroke; this keeps the input itself smooth.
  const deferredText = useDeferredValue(text);

  const { groups: visible, top } = useMemo(
    () => browseInspiration(groups, deferredText),
    [groups, deferredText],
  );

  const [owner, setOwner] = useState(false);
  const [result, setResult] = useState<RetrievalResult | null>(null);
  /** The query the user pressed Enter on, so a strong local hit can still ask. */
  const [forced, setForced] = useState("");
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/inspiration/session", { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => setOwner(data.owner === true))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  // The wall answered weakly, or you asked outright. Either way the server runs
  // in the background and its hits join the list; nothing on screen is replaced.
  const wanted =
    text.length > 0 &&
    (visible.length === 0 || top < ESCALATE_BELOW || forced === text);

  useEffect(() => {
    // Owner changes and successful preference writes refresh the same query.
    void owner;
    void revision;
    if (!wanted) {
      setResult(null);
      setBusy(false);
      setError("");
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setBusy(true);
      setError("");
      fetch(
        `/api/inspiration/search?${new URLSearchParams({ q: text, contextKey })}`,
        { signal: controller.signal },
      )
        .then(async (response) => {
          const data = await response.json();
          if (!response.ok) throw new Error(data.error);
          setResult(data);
        })
        .catch((error) => {
          if (!controller.signal.aborted) {
            setResult(null);
            setError(error.message);
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setBusy(false);
        });
    }, ESCALATE_DELAY_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [wanted, text, contextKey, owner, revision]);

  const hitByHref = useMemo(() => {
    const map = new Map<string, RetrievalHit>();
    for (const hit of result?.hits ?? []) map.set(hit.resource.href, hit);
    return map;
  }, [result]);

  // Anything retrieval found that the wall is not already showing. Semantic-only
  // finds read as their own band instead of appearing inside your shelves.
  const extra = useMemo(() => {
    const onWall = new Set<string>();
    for (const group of visible)
      for (const link of group.links) onWall.add(link.href);
    return (result?.hits ?? []).filter((hit) => !onWall.has(hit.resource.href));
  }, [result, visible]);

  const detailProps = {
    owner,
    contextKey,
    onSaved: () => setRevision((value) => value + 1),
    onError: setError,
  };

  return (
    <main className="mx-auto w-full max-w-[40rem] pb-32">
      <Calligraph
        as="h1"
        initial
        className="pt-28 text-2xl font-semibold tracking-tight text-foreground sm:pt-36"
      >
        Inspiration
      </Calligraph>

      <form
        className="mt-20 flex items-center gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          setForced(text);
        }}
      >
        <Search size={15} className="shrink-0 text-faint" aria-hidden />
        <input
          type="text"
          name="query"
          value={query}
          onChange={(event) => onQueryChange?.(event.target.value)}
          placeholder={
            owner
              ? "Search by idea, tech, or date, or scope with in:project"
              : "Search by idea, tech, or date…"
          }
          aria-label="Search inspiration"
          className="w-full bg-transparent py-1 text-sm text-foreground placeholder:text-faint focus:outline-none"
        />
        {contextKey ? (
          <button
            type="button"
            onClick={() => onQueryChange?.(text)}
            aria-label={`Clear the ${contextKey} context`}
            className="flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs text-muted-foreground"
          >
            {contextKey}
            <X size={11} aria-hidden />
          </button>
        ) : null}
        <button
          type="submit"
          className="shrink-0 text-xs text-blue-600 dark:text-blue-400"
        >
          Search
        </button>
      </form>

      <details className="mt-4 text-xs text-muted-foreground">
        <summary className="cursor-pointer">
          {owner ? "Owner preferences enabled" : "Owner sign in"}
        </summary>
        <form
          className="mt-3 flex gap-3"
          onSubmit={async (event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const data = new FormData(form);
            try {
              const session = await post(
                "session",
                owner ? { logout: true } : { password: data.get("password") },
              );
              setOwner(session.owner);
              form.reset();
            } catch (error) {
              setError(
                error instanceof Error ? error.message : "Sign in failed.",
              );
            }
          }}
        >
          {!owner ? (
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              aria-label="Owner password"
              className="rounded border bg-transparent px-2 py-1"
            />
          ) : null}
          <button type="submit">{owner ? "Sign out" : "Sign in"}</button>
        </form>
      </details>
      <p aria-live="polite" className="mt-4 text-xs text-muted-foreground">
        {busy ? "Searching sources..." : error || result?.notice}
      </p>

      <div className="mt-12 space-y-14">
        {visible.map((group) => (
          <section key={group.title}>
            <div className="flex items-baseline justify-between gap-4 border-b border-blue-500/25 pb-3">
              <h2 className="text-sm font-medium tracking-wide text-blue-600 dark:text-blue-400">
                {group.title}
              </h2>
              <span className="tabular-nums text-xs text-blue-500/70">
                {group.links.length}
              </span>
            </div>
            <ul className="dim-list">
              {group.links.map((link) => {
                const hit = hitByHref.get(link.href);
                return (
                  <li
                    key={`${group.title}-${link.href}`}
                    className="border-b last:border-0"
                  >
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      onMouseEnter={playHover}
                      className="group flex items-center gap-5 py-3.5 text-sm"
                    >
                      <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                        {link.title}
                      </span>
                      <span className="hidden max-w-56 truncate text-xs text-faint sm:block">
                        {new URL(link.href).hostname.replace(/^www\./, "")}
                      </span>
                      <ArrowUpRight
                        size={14}
                        className="shrink-0 text-faint transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </a>
                    {hit ? (
                      <div className="pb-3.5">
                        <HitDetail hit={hit} {...detailProps} />
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        {extra.length ? (
          <section>
            <div className="flex items-baseline justify-between gap-4 border-b border-blue-500/25 pb-3">
              <h2 className="text-sm font-medium tracking-wide text-blue-600 dark:text-blue-400">
                Found in sources
              </h2>
              <span className="tabular-nums text-xs text-blue-500/70">
                {extra.length}
              </span>
            </div>
            <ol className="dim-list">
              {extra.map((hit) => (
                <li
                  key={hit.resource.id}
                  className="border-b py-3.5 last:border-0"
                >
                  <a
                    href={hit.resource.href}
                    target="_blank"
                    rel="noreferrer"
                    onMouseEnter={playHover}
                    className="group flex items-center gap-5 text-sm"
                  >
                    <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                      {hit.resource.title}
                    </span>
                    <ArrowUpRight
                      size={14}
                      className="shrink-0 text-faint transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </a>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {hit.resource.description}
                  </p>
                  <HitDetail hit={hit} {...detailProps} />
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {visible.length === 0 && extra.length === 0 && !busy ? (
          <p className="py-3.5 text-sm text-muted-foreground">
            {text ? "No matches on the wall or in sources." : "No results."}
          </p>
        ) : null}
      </div>
    </main>
  );
}

/** Preference badge, source passages, and the owner's edit form for one hit. */
function HitDetail({
  hit,
  owner,
  contextKey,
  onSaved,
  onError,
}: {
  hit: RetrievalHit;
  owner: boolean;
  contextKey: string;
  onSaved: () => void;
  onError: (message: string) => void;
}) {
  return (
    <>
      {hit.preference ? (
        <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
          {hit.preference.preference}
          {hit.preference.rating ? ` · ${hit.preference.rating}/5` : ""}
          {hit.preference.contextKey ? ` · ${hit.preference.contextKey}` : ""}
        </p>
      ) : null}
      <details className="mt-3 text-xs text-muted-foreground">
        <summary className="cursor-pointer">
          Sources{owner ? " and preference" : ""}
        </summary>
        {hit.evidence.length ? (
          hit.evidence.map((passage) => (
            <blockquote key={passage.id} className="mt-3 border-l pl-3">
              <a
                href={passage.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 dark:text-blue-400"
              >
                {passage.heading || "Source passage"}
              </a>
              <p className="mt-2 whitespace-pre-wrap">{passage.text}</p>
              <p className="mt-2">Fetched {passage.fetchedAt.slice(0, 10)}</p>
            </blockquote>
          ))
        ) : (
          <p className="mt-3">
            Catalog description only. Open the source to verify its fit.
          </p>
        )}
        {owner ? (
          <form
            key={`${hit.resource.id}-${hit.preference?.revision ?? 0}-${contextKey}`}
            className="mt-4 flex flex-wrap items-center gap-3"
            onSubmit={async (event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              try {
                await post("preference", {
                  resourceId: hit.resource.id,
                  contextKey,
                  preference: data.get("preference"),
                  rating: data.get("rating")
                    ? Number(data.get("rating"))
                    : null,
                  note: data.get("note"),
                  revision:
                    hit.preference?.contextKey === contextKey
                      ? hit.preference.revision
                      : 0,
                });
                onSaved();
              } catch (error) {
                onError(
                  error instanceof Error
                    ? error.message
                    : "Preference could not be saved.",
                );
              }
            }}
          >
            <select
              name="preference"
              aria-label={`Preference for ${hit.resource.title}`}
              defaultValue={hit.preference?.preference ?? "neutral"}
              className="rounded border bg-background p-1"
            >
              <option value="neutral">Neutral</option>
              <option value="prefer">Prefer</option>
              <option value="avoid">Avoid</option>
            </select>
            <select
              name="rating"
              aria-label={`Rating for ${hit.resource.title}`}
              defaultValue={hit.preference?.rating ?? ""}
              className="rounded border bg-background p-1"
            >
              <option value="">Unrated</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}/5
                </option>
              ))}
            </select>
            <input
              name="note"
              aria-label={`Note for ${hit.resource.title}`}
              placeholder="Your note"
              maxLength={2000}
              defaultValue={hit.preference?.note ?? ""}
              className="min-w-40 flex-1 rounded border bg-transparent p-1"
            />
            <button type="submit" className="text-blue-600 dark:text-blue-400">
              Save preference
            </button>
          </form>
        ) : null}
      </details>
    </>
  );
}
