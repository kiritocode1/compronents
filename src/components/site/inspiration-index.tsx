"use client";

import { useSound } from "@web-kits/audio/react";
import { Calligraph } from "calligraph";
import { ArrowUpRight, Search } from "lucide-react";
import { useQueryState } from "nuqs";
import { Suspense, useDeferredValue, useEffect, useMemo, useState } from "react";
import type { InspirationGroup } from "@/lib/inspiration";
import { browseInspiration } from "@/lib/inspiration-browse";
import { uiHover } from "@/lib/sounds";
import type { RetrievalResult } from "@/lib/inspiration/types";

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
  // Ranking 1100+ links runs per keystroke; this keeps the input itself smooth.
  const deferredQuery = useDeferredValue(query);

  const visible = useMemo(
    () => browseInspiration(groups, deferredQuery),
    [groups, deferredQuery],
  );
  const [owner, setOwner] = useState(false);
  const [submitted, setSubmitted] = useState({ query, contextKey: "" });
  const [result, setResult] = useState<RetrievalResult | null>(null);
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/inspiration/session", { signal: controller.signal }).then(r => r.json()).then(data => setOwner(data.owner === true)).catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    // Owner changes and successful preference writes refresh the same submitted query.
    void owner; void revision;
    if (!submitted.query) { setResult(null); return; }
    const controller = new AbortController();
    setBusy(true); setError("");
    fetch(`/api/inspiration/search?${new URLSearchParams({ q: submitted.query, contextKey: submitted.contextKey })}`, { signal: controller.signal })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setResult(data);
      }).catch(error => { if (!controller.signal.aborted) { setResult(null); setError(error.message); } })
      .finally(() => { if (!controller.signal.aborted) setBusy(false); });
    return () => controller.abort();
  }, [submitted, owner, revision]);

  async function post(operation: string, body: unknown) {
    setError("");
    const response = await fetch(`/api/inspiration/${operation}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  }

  return (
    <main className="mx-auto w-full max-w-[40rem] pb-32">
      <Calligraph
        as="h1"
        initial
        className="pt-28 text-2xl font-semibold tracking-tight text-foreground sm:pt-36"
      >
        Inspiration
      </Calligraph>

      <form className="mt-20 flex items-center gap-3" onSubmit={event => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSubmitted({ query, contextKey: String(data.get("context") ?? "") });
      }}>
        <Search size={15} className="shrink-0 text-faint" aria-hidden />
        <input
          type="text"
          name="query"
          value={query}
          onChange={(event) => onQueryChange?.(event.target.value)}
          placeholder="Search by idea, tech, or date…"
          aria-label="Search inspiration"
          className="w-full bg-transparent py-1 text-sm text-foreground placeholder:text-faint focus:outline-none"
        />
        {owner ? <input name="context" aria-label="Preference context" placeholder="Context" className="w-24 bg-transparent text-xs focus:outline-none" /> : null}
        <button type="submit" className="text-xs text-blue-600 dark:text-blue-400">Search</button>
      </form>

      <details className="mt-4 text-xs text-muted-foreground">
        <summary className="cursor-pointer">{owner ? "Owner preferences enabled" : "Owner sign in"}</summary>
        <form className="mt-3 flex gap-3" onSubmit={async event => {
          event.preventDefault(); const form = event.currentTarget; const data = new FormData(form);
          try { const session = await post("session", owner ? { logout: true } : { password: data.get("password") }); setOwner(session.owner); form.reset(); }
          catch (error) { setError(error instanceof Error ? error.message : "Sign in failed."); }
        }}>
          {!owner ? <input name="password" type="password" autoComplete="current-password" aria-label="Owner password" className="rounded border bg-transparent px-2 py-1" /> : null}
          <button type="submit">{owner ? "Sign out" : "Sign in"}</button>
        </form>
      </details>
      <p aria-live="polite" className="mt-4 text-xs text-muted-foreground">{busy ? "Searching..." : error || result?.notice}</p>

      {result && !busy ? <ol className="mt-10">
        {result.hits.map(hit => <li key={hit.resource.id} className="border-b py-5">
          <a href={hit.resource.href} target="_blank" rel="noreferrer" onMouseEnter={playHover} className="flex items-center justify-between text-sm font-medium">
            {hit.resource.title}<ArrowUpRight size={14} aria-hidden />
          </a>
          <p className="mt-2 text-xs text-muted-foreground">{hit.resource.description}</p>
          {hit.preference ? <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">{hit.preference.preference}{hit.preference.rating ? ` · ${hit.preference.rating}/5` : ""}{hit.preference.contextKey ? ` · ${hit.preference.contextKey}` : ""}</p> : null}
          <details className="mt-3 text-xs text-muted-foreground">
            <summary className="cursor-pointer">Sources{owner ? " and preference" : ""}</summary>
            {hit.evidence.length ? hit.evidence.map(passage => <blockquote key={passage.id} className="mt-3 border-l pl-3">
              <a href={passage.sourceUrl} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400">{passage.heading || "Source passage"}</a>
              <p className="mt-2 whitespace-pre-wrap">{passage.text}</p>
              <p className="mt-2">Fetched {passage.fetchedAt.slice(0, 10)}</p>
            </blockquote>) : <p className="mt-3">Catalog description only. Open the source to verify its fit.</p>}
            {owner ? <form key={`${hit.resource.id}-${hit.preference?.revision ?? 0}-${submitted.contextKey}`} className="mt-4 flex flex-wrap items-center gap-3" onSubmit={async event => {
              event.preventDefault(); const data = new FormData(event.currentTarget);
              try {
                await post("preference", { resourceId: hit.resource.id, contextKey: submitted.contextKey,
                  preference: data.get("preference"), rating: data.get("rating") ? Number(data.get("rating")) : null,
                  note: data.get("note"), revision: hit.preference?.contextKey === submitted.contextKey ? hit.preference.revision : 0 });
                setRevision(value => value + 1);
              } catch (error) { setError(error instanceof Error ? error.message : "Preference could not be saved."); }
            }}>
              <select name="preference" aria-label={`Preference for ${hit.resource.title}`} defaultValue={hit.preference?.preference ?? "neutral"} className="rounded border bg-background p-1">
                <option value="neutral">Neutral</option><option value="prefer">Prefer</option><option value="avoid">Avoid</option>
              </select>
              <select name="rating" aria-label={`Rating for ${hit.resource.title}`} defaultValue={hit.preference?.rating ?? ""} className="rounded border bg-background p-1">
                <option value="">Unrated</option>{[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}/5</option>)}
              </select>
              <input name="note" aria-label={`Note for ${hit.resource.title}`} placeholder="Your note" maxLength={2000} defaultValue={hit.preference?.note ?? ""} className="min-w-40 flex-1 rounded border bg-transparent p-1" />
              <button type="submit" className="text-blue-600 dark:text-blue-400">Save preference</button>
            </form> : null}
          </details>
        </li>)}
        {!result.hits.length ? <li className="text-sm text-muted-foreground">No supported matches. Try another phrase.</li> : null}
      </ol> : null}

      {!submitted.query ? <div className="mt-12 space-y-14">
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
              {group.links.map((link) => (
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
                </li>
              ))}
            </ul>
          </section>
        ))}
        {visible.length === 0 ? (
          <p className="py-3.5 text-sm text-muted-foreground">No results.</p>
        ) : null}
      </div> : null}
    </main>
  );
}
