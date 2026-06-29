import Link from "next/link";
import type { ReactNode } from "react";
import { CopyButton } from "@/components/site/copy-button";
import {
  getLibrarySection,
  getRegistryItemsBySection,
  type LibrarySectionId,
  REGISTRY_NAMESPACE,
} from "@/lib/registry";

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="label">{label}</span>
      <div className="text-sm text-muted-foreground">{children}</div>
    </div>
  );
}

export function LibrarySectionPage({
  sectionId,
}: {
  sectionId: LibrarySectionId;
}) {
  const section = getLibrarySection(sectionId);
  const items = getRegistryItemsBySection(sectionId);
  const install =
    items.length > 0
      ? `npx shadcn@latest add ${REGISTRY_NAMESPACE}/${items[0].name}`
      : null;

  if (!section) return null;

  return (
    <main className="pb-32 pt-8">
      <header className="grid grid-cols-1 gap-x-16 gap-y-10 border-b pb-14 lg:grid-cols-[232px_1fr]">
        <aside className="flex flex-col gap-8">
          <Stat label="Section">
            <span className="uppercase tracking-wide">{section.label}</span>
          </Stat>
          <Stat label="Items">
            <span className="tabular-nums">{items.length}</span>
          </Stat>
          {install ? (
            <Stat label="Install latest">
              <div className="flex items-start gap-2">
                <code className="break-all text-foreground/90">{install}</code>
                <CopyButton value={install} className="mt-px shrink-0" />
              </div>
            </Stat>
          ) : null}
        </aside>

        <div className="max-w-3xl">
          <p className="label">{section.eyebrow}</p>
          <h1 className="mt-3 text-4xl text-foreground uppercase sm:text-6xl">
            {section.label}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {section.description}
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-x-16 gap-y-10 pt-14 lg:grid-cols-[232px_1fr]">
        <span className="label pt-1">Library</span>
        {items.length === 0 ? (
          <div className="border-y py-10">
            <p className="text-sm tracking-wide text-faint uppercase">
              No drops in this section yet.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-6">
            {items.map((item) => (
              <li key={item.name} className="border-b pb-6 last:border-0">
                <Link
                  href={`/${item.section}/${item.name}`}
                  className="group grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg tracking-wide text-foreground uppercase transition-colors group-hover:text-accent">
                        {item.title}
                      </h2>
                      <span className="rounded border px-2 py-0.5 text-[0.65rem] tracking-[0.12em] text-muted-foreground uppercase">
                        {item.category}
                      </span>
                    </div>
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <time className="text-xs tabular-nums text-faint">
                    {item.date}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
