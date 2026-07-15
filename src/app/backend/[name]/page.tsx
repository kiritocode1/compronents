import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { CodeTabs } from "@/components/site/code-tabs";
import { CopyMarkdownButton } from "@/components/site/copy-markdown-button";
import { RegistryFiles } from "@/components/site/registry-files";
import {
  getRegistryItem,
  installCommands,
  REGISTRY_NAMESPACE,
  registryItems,
} from "@/lib/registry";
import { buildRegistryItem } from "@/lib/registry-server";
import { highlight } from "@/lib/shiki";

export function generateStaticParams() {
  return registryItems
    .filter((item) => item.section === "backend")
    .map((item) => ({ name: item.name }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  const item = getRegistryItem(name);
  if (!item) return { title: "Not found" };
  return { title: item.title, description: item.description };
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-[130px_1fr]">
      <span className="label pt-1">{label}</span>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export default async function BackendItemPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const item = getRegistryItem(name);
  if (!item || item.section !== "backend") notFound();

  const built = await buildRegistryItem(item.name);

  const installTabs = await Promise.all(
    installCommands(item.name).map(async (pm) => ({
      label: pm.label,
      html: await highlight(pm.command, "bash"),
      raw: pm.command,
    })),
  );

  return (
    <main className="flex flex-col gap-14 pt-8 pb-32">
      <header className="flex flex-col gap-4">
        <nav className="flex items-center gap-2 text-xs tracking-[0.12em] uppercase">
          <Link
            href="/backend"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Backend
          </Link>
          <span className="text-faint">/</span>
          <span className="text-foreground">{item.title}</span>
        </nav>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl tracking-wide text-foreground uppercase sm:text-4xl">
            {item.title}
          </h1>
          <CopyMarkdownButton href={`/r/${item.name}.md`} />
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {item.description}
        </p>
      </header>

      <Row label="Install">
        <div className="flex flex-col gap-2">
          <CodeTabs tabs={installTabs} />
          <p className="text-xs text-faint">
            Installs from ui.aryank.space. To add it by hand, copy the files in
            Files below, or register the {REGISTRY_NAMESPACE} namespace via the{" "}
            <Link href="/docs" className="underline hover:text-foreground">
              docs
            </Link>
            .
          </p>
        </div>
      </Row>

      <Row label="Files">
        <RegistryFiles files={built.files} />
      </Row>

      <Row label="Dependencies">
        <div className="flex flex-wrap gap-2 text-sm">
          {item.dependencies.length === 0 &&
          item.registryDependencies.length === 0 ? (
            <span className="text-faint">None.</span>
          ) : (
            <>
              {item.dependencies.map((dep) => (
                <code
                  key={dep}
                  className="rounded border bg-card px-2 py-1 text-foreground/90"
                >
                  {dep}
                </code>
              ))}
              {item.registryDependencies.map((dep) => (
                <code
                  key={dep}
                  className="rounded border bg-card px-2 py-1 text-accent-soft"
                >
                  {REGISTRY_NAMESPACE}/{dep}
                </code>
              ))}
            </>
          )}
        </div>
      </Row>
    </main>
  );
}
