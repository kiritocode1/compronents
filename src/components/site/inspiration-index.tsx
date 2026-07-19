"use client";

import { useSound } from "@web-kits/audio/react";
import { Calligraph } from "calligraph";
import Fuse from "fuse.js";
import { ArrowUpRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { InspirationGroup, InspirationLink } from "@/lib/inspiration";
import { matchesDateRange, parseTimeQuery } from "@/lib/search-time";
import { uiHover } from "@/lib/sounds";

interface SearchEntry {
  groupTitle: string;
  link: InspirationLink;
}

export function InspirationIndex({ groups }: { groups: InspirationGroup[] }) {
  const [query, setQuery] = useState("");
  const playHover = useSound(uiHover);

  const fuse = useMemo(() => {
    const entries: SearchEntry[] = groups.flatMap((group) =>
      group.links.map((link) => ({ groupTitle: group.title, link })),
    );
    return new Fuse(entries, {
      keys: [
        { name: "link.title", weight: 0.5 },
        { name: "link.description", weight: 0.3 },
        { name: "groupTitle", weight: 0.2 },
      ],
      threshold: 0.2,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });
  }, [groups]);

  const visible = useMemo(() => {
    const { query: q, date, words } = parseTimeQuery(query);
    if (!q) return groups;

    const wordsQuery = words.join(" ");
    const textMatchedHrefs = wordsQuery
      ? new Set(fuse.search(wordsQuery).map((result) => result.item.link.href))
      : null;

    return groups
      .map((group) => ({
        ...group,
        links: group.links.filter((link) => {
          if (!matchesDateRange(link.dateAdded, date)) return false;
          if (!textMatchedHrefs) return true;
          if (group.title.toLowerCase().includes(wordsQuery.toLowerCase()))
            return true;
          return textMatchedHrefs.has(link.href);
        }),
      }))
      .filter((group) => group.links.length > 0);
  }, [groups, fuse, query]);

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
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search titles or dates…"
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
