"use client";

import { useSound } from "@web-kits/audio/react";
import { Calligraph } from "calligraph";
import { Search } from "lucide-react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { type ReactNode, Suspense } from "react";
import type { RegistryItem } from "@/lib/registry";
import type { RegistryGroup } from "@/lib/registry-groups";
import { rankRegistryItems } from "@/lib/registry-search";
import { uiHover } from "@/lib/sounds";

interface RegistryIndexProps {
  heading: ReactNode;
  items: RegistryItem[];
  brand?: ReactNode;
  groups?: RegistryGroup[];
}

export function RegistryIndex(props: RegistryIndexProps) {
  // Reading the URL opts this subtree out of prerendering, so the fallback
  // renders the unfiltered list: static HTML still ships every row.
  return (
    <Suspense fallback={<RegistryIndexView {...props} query="" />}>
      <RegistryIndexFiltered {...props} />
    </Suspense>
  );
}

function RegistryIndexFiltered(props: RegistryIndexProps) {
  const [query, setQuery] = useQueryState("q", { defaultValue: "" });
  return (
    <RegistryIndexView {...props} query={query} onQueryChange={setQuery} />
  );
}

function RegistryIndexView({
  heading,
  items,
  brand,
  groups,
  query,
  onQueryChange,
}: RegistryIndexProps & {
  query: string;
  onQueryChange?: (value: string) => void;
}) {
  const playHover = useSound(uiHover);
  const q = query.trim();
  // Ranked search: same scorer as /registry/search and blank-direction.
  // Empty query keeps the incoming list order (date / group order).
  const visible = q ? rankRegistryItems(items, q) : items;
  const searching = Boolean(q);

  // Bucket the visible items into their group. With an active query, items
  // inside each bucket stay in relevance order (rankRegistryItems), and groups
  // are ordered by their best hit. Without a query, group order is stable.
  const grouped = groups
    ? (() => {
        const groupOf = new Map<string, string>();
        for (const g of groups)
          for (const n of g.names) groupOf.set(n, g.title);
        const buckets = new Map<string, RegistryItem[]>();
        for (const g of groups) buckets.set(g.title, []);
        const more: RegistryItem[] = [];
        for (const item of visible) {
          const title = groupOf.get(item.name);
          if (title) buckets.get(title)?.push(item);
          else more.push(item);
        }
        const out = groups
          .map((g) => ({ title: g.title, items: buckets.get(g.title) ?? [] }))
          .filter((g) => g.items.length > 0);
        if (more.length) out.push({ title: "More", items: more });
        if (searching) {
          // Groups with stronger top hits first; item order already ranked.
          const rankOf = new Map(visible.map((item, i) => [item.name, i]));
          out.sort((a, b) => {
            const aBest = Math.min(
              ...a.items.map((item) => rankOf.get(item.name) ?? 9999),
            );
            const bBest = Math.min(
              ...b.items.map((item) => rankOf.get(item.name) ?? 9999),
            );
            return aBest - bBest;
          });
        }
        return out;
      })()
    : null;

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
          onChange={(event) => onQueryChange?.(event.target.value)}
          placeholder="Search titles or dates…"
          aria-label="Search the registry"
          className="w-full bg-transparent py-1 text-sm text-foreground placeholder:text-faint focus:outline-none"
        />
      </div>

      {grouped ? (
        <div className="mt-8 space-y-12">
          {grouped.map((group) => (
            <section key={group.title}>
              <div className="flex items-baseline justify-between gap-4 border-b border-blue-500/25 pb-3">
                <h2 className="text-sm font-medium tracking-wide text-blue-600 dark:text-blue-400">
                  {group.title}
                </h2>
                <span className="tabular-nums text-xs text-blue-500/70">
                  {group.items.length}
                </span>
              </div>
              <ul className="dim-list">
                {group.items.map((item) => (
                  <RegistryRow
                    key={item.name}
                    item={item}
                    onHover={playHover}
                  />
                ))}
              </ul>
            </section>
          ))}
          {grouped.length === 0 ? (
            <p className="py-3.5 text-sm text-muted-foreground">
              {q ? "No results." : "Nothing here yet."}
            </p>
          ) : null}
        </div>
      ) : (
        <ul className="dim-list mt-8">
          {visible.map((item) => (
            <RegistryRow key={item.name} item={item} onHover={playHover} />
          ))}
          {visible.length === 0 ? (
            <li className="py-3.5 text-sm text-muted-foreground">
              {q ? "No results." : "Nothing here yet."}
            </li>
          ) : null}
        </ul>
      )}
    </main>
  );
}

function RegistryRow({
  item,
  onHover,
}: {
  item: RegistryItem;
  onHover: () => void;
}) {
  return (
    <li className="border-b last:border-0">
      <Link
        href={`/${item.section}/${item.name}`}
        onMouseEnter={onHover}
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
  );
}
