import Link from "next/link";
import type { ReactNode } from "react";
import { CopyButton } from "@/components/site/copy-button";
import { REGISTRY_NAMESPACE, registryItems } from "@/lib/registry";

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
      {/* Title */}
      <header className="flex flex-col items-center pt-16 pb-20 text-center sm:pt-24">
        <h1 className="text-5xl tracking-tight text-foreground sm:text-7xl">
          COMPRONENTS
        </h1>
        <p className="mt-4 text-sm tracking-wide text-muted-foreground uppercase">
          registry for blank&apos;s personal use
        </p>
      </header>

      <div className="grid grid-cols-1 gap-x-16 gap-y-16 lg:grid-cols-[232px_1fr]">
        {/* Meta */}
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

          <Field label="Source">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="uppercase tracking-wide transition-colors hover:text-foreground"
            >
              Github
            </a>
          </Field>

          <Field label="Author">
            <span className="uppercase tracking-wide">blank</span>
          </Field>
        </aside>

        {/* Main */}
        <div className="flex flex-col gap-16">
          <Row label="Description">
            <div className="flex max-w-2xl flex-col gap-4 text-sm uppercase leading-relaxed tracking-wide text-muted-foreground">
              <p>
                A small, quiet registry of React components for blank&apos;s
                personal projects.
              </p>
              <p>
                Every item is served as JSON over HTTP and installed straight
                into a codebase with the shadcn CLI. Full source, yours to edit.
              </p>
              <p>Built with React, TypeScript, Tailwind and Motion.</p>
            </div>
          </Row>

          <Row label="Components">
            {items.length === 0 ? (
              <p className="text-sm tracking-wide text-faint uppercase">
                No components yet.
              </p>
            ) : (
              <ul className="flex flex-col gap-7">
                {items.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={`/components/${item.name}`}
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
