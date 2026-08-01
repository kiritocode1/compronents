"use client";

import { useSound } from "@web-kits/audio/react";
import { Calligraph } from "calligraph";
import { ArrowUpRight, Search } from "lucide-react";
import { useQueryState } from "nuqs";
import { Suspense, useDeferredValue, useMemo } from "react";
import type { InspirationGroup } from "@/lib/inspiration";
import { browseInspiration } from "@/lib/inspiration-browse";
import { uiHover } from "@/lib/sounds";

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

  return (
    <main className="mx-auto w-full max-w-[40rem] pb-32">
      <Calligraph
        as="h1"
        initial
        className="pt-28 text-2xl font-semibold tracking-tight text-foreground sm:pt-36"
      >
        Inspiration
      </Calligraph>

      <div className="mt-20 flex items-center gap-3">
        <Search size={15} className="shrink-0 text-faint" aria-hidden />
        <input
          type="text"
          value={query}
          onChange={(event) => onQueryChange?.(event.target.value)}
          placeholder="Search by idea, tech, or date…"
          aria-label="Search inspiration"
          className="w-full bg-transparent py-1 text-sm text-foreground placeholder:text-faint focus:outline-none"
        />
      </div>

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
      </div>
    </main>
  );
}
