"use client";

import { useSound } from "@web-kits/audio/react";
import { Calligraph } from "calligraph";
import { Search } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useState } from "react";
import type { RegistryItem } from "@/lib/registry";
import { uiHover } from "@/lib/sounds";

export function RegistryIndex({
  heading,
  items,
  brand,
}: {
  heading: ReactNode;
  items: RegistryItem[];
  brand?: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const playHover = useSound(uiHover);
  const q = query.trim().toLowerCase();
  const visible = q
    ? items.filter((item) => item.title.toLowerCase().includes(q))
    : items;

  return (
    <main className="mx-auto w-full max-w-[40rem] pb-32">
      {brand ? <div className="pt-24 sm:pt-32">{brand}</div> : null}
      {typeof heading === "string" ? (
        <Calligraph
          as="h1"
          initial
          className={
            brand
              ? "pt-8 text-2xl font-semibold tracking-tight text-foreground"
              : "pt-28 text-2xl font-semibold tracking-tight text-foreground sm:pt-36"
          }
        >
          {heading}
        </Calligraph>
      ) : (
        <h1
          className={
            brand
              ? "pt-8 text-2xl font-semibold tracking-tight text-foreground"
              : "pt-28 text-2xl font-semibold tracking-tight text-foreground sm:pt-36"
          }
        >
          {heading}
        </h1>
      )}

      <div className="mt-20 flex items-center gap-3">
        <Search size={15} className="shrink-0 text-faint" aria-hidden />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search…"
          aria-label="Search the registry"
          className="w-full bg-transparent py-1 text-sm text-foreground placeholder:text-faint focus:outline-none"
        />
      </div>

      <ul className="dim-list mt-8">
        {visible.map((item) => (
          <li key={item.name} className="border-b last:border-0">
            <Link
              href={`/${item.section}/${item.name}`}
              onMouseEnter={playHover}
              className="flex items-baseline gap-6 py-3.5 text-sm"
            >
              <span className="w-10 shrink-0 tabular-nums text-faint">
                {item.date.slice(0, 4)}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                {item.title}
              </span>
              <span className="shrink-0 tabular-nums text-faint">
                {item.date.slice(5).replace("-", "/")}
              </span>
            </Link>
          </li>
        ))}
        {visible.length === 0 ? (
          <li className="py-3.5 text-sm text-muted-foreground">
            {q ? "No results." : "Nothing here yet."}
          </li>
        ) : null}
      </ul>
    </main>
  );
}
