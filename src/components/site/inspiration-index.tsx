"use client";

import { useSound } from "@web-kits/audio/react";
import { Calligraph } from "calligraph";
import { ArrowUpRight, Search } from "lucide-react";
import { useState } from "react";
import type { InspirationGroup } from "@/lib/inspiration";
import { uiHover } from "@/lib/sounds";

export function InspirationIndex({ groups }: { groups: InspirationGroup[] }) {
  const [query, setQuery] = useState("");
  const playHover = useSound(uiHover);
  const q = query.trim().toLowerCase();
  const visible = groups
    .map((group) => ({
      ...group,
      links:
        q && !group.title.toLowerCase().includes(q)
          ? group.links.filter((link) => link.title.toLowerCase().includes(q))
          : group.links,
    }))
    .filter((group) => group.links.length > 0);

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
          placeholder="Search…"
          aria-label="Search inspiration"
          className="w-full bg-transparent py-1 text-sm text-foreground placeholder:text-faint focus:outline-none"
        />
      </div>

      <div className="mt-12 space-y-14">
        {visible.map((group) => (
          <section key={group.title}>
            <div className="flex items-baseline justify-between gap-4 border-b pb-3">
              <h2 className="text-sm font-medium text-foreground">
                {group.title}
              </h2>
              <span className="tabular-nums text-xs text-faint">
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
