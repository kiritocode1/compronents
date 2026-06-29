import Link from "next/link";
import type { ReactNode } from "react";
import { CopyButton } from "@/components/site/copy-button";
import {
  getRegistryItemsBySection,
  librarySections,
  REGISTRY_NAMESPACE,
  registryItems,
} from "@/lib/registry";

const items = [...registryItems].sort((a, b) => b.date.localeCompare(a.date));
const INSTALL = `npx shadcn@latest add ${REGISTRY_NAMESPACE}/${
  items[0]?.name ?? "<name>"
}`;

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="label">{label}</span>
      <div className="text-sm text-muted-foreground">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-[130px_1fr]">
      <span className="label pt-1">{label}</span>
      <div>{children}</div>
    </section>
  );
}

export default function Page() {
  return (
    <main className="pb-32">
      <header className="flex flex-col items-center pt-16 pb-20 text-center sm:pt-24">
        <h1 className="text-5xl tracking-tight text-foreground sm:text-7xl">
          COMPRONENTS
        </h1>
        <p className="mt-4 text-sm tracking-wide text-muted-foreground uppercase">
          personal shadcn registry for careful interface pieces
        </p>
      </header>

      <div className="grid grid-cols-1 gap-x-16 gap-y-16 lg:grid-cols-[232px_1fr]">
        <aside className="flex flex-col gap-9">
          <Field label="Namespace">
            <code className="text-foreground">{REGISTRY_NAMESPACE}</code>
          </Field>

          <Field label="Install">
            <div className="flex items-start gap-2">
              <code className="break-all text-foreground/90">{INSTALL}</code>
              <CopyButton value={INSTALL} className="mt-px shrink-0" />
            </div>
          </Field>

          <Field label="Assets">
            <span className="uppercase tracking-wide">Vercel Blob</span>
          </Field>

          <Field label="Author">
            <span className="uppercase tracking-wide">blank</span>
          </Field>
        </aside>

        <div className="flex flex-col gap-16">
          <Row label="Description">
            <div className="flex max-w-2xl flex-col gap-4 text-sm uppercase leading-relaxed tracking-wide text-muted-foreground">
              <p>
                A library for components, full pages, backend snippets, and
                inspiration studies that deserve source-level care.
              </p>
              <p>
                Installable items stay shadcn-compatible. The site carries the
                extra craft notes, editable studios, and asset metadata needed
                to replicate them precisely.
              </p>
            </div>
          </Row>

          <Row label="Sections">
            <ul className="grid gap-6 sm:grid-cols-2">
              {librarySections.map((section) => {
                const count = getRegistryItemsBySection(section.id).length;
                return (
                  <li key={section.id} className="border-t pt-4">
                    <Link href={`/${section.id}`} className="group block">
                      <div className="flex items-center justify-between gap-4">
                        <h2 className="text-sm tracking-wide text-foreground uppercase transition-colors group-hover:text-accent">
                          {section.label}
                        </h2>
                        <span className="text-xs tabular-nums text-faint">
                          {count}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {section.description}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Row>

          <Row label="Latest">
            {items.length === 0 ? (
              <p className="text-sm tracking-wide text-faint uppercase">
                No drops yet.
              </p>
            ) : (
              <ul className="flex flex-col gap-7">
                {items.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={`/${item.section}/${item.name}`}
                      className="group block"
                    >
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="uppercase tracking-wide text-foreground transition-colors group-hover:text-accent">
                          {item.title}
                        </span>
                        <time className="shrink-0 text-xs tabular-nums text-faint">
                          {item.date}
                        </time>
                      </div>
                      <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Row>
        </div>
      </div>
    </main>
  );
}
