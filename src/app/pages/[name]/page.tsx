import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { CodeTabs } from "@/components/site/code-tabs";
import { CopyMarkdownButton } from "@/components/site/copy-markdown-button";
import { PageIframePreview } from "@/components/site/page-iframe-preview";
import { RegistryFiles } from "@/components/site/registry-files";
import { getComponentMeta } from "@/lib/component-meta";
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
    .filter((item) => item.section === "pages")
    .map((item) => ({ name: item.name }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  const item = getRegistryItem(name);
  if (!item || item.section !== "pages") return { title: "Not found" };
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

export default async function PageRegistryItemPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const item = getRegistryItem(name);
  if (!item || item.section !== "pages") notFound();

  const meta = getComponentMeta(name);
  const built = await buildRegistryItem(name);

  const demoSource = meta
    ? await readFile(path.join(process.cwd(), meta.demoPath), "utf-8")
    : null;

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
            href="/pages"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Pages
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

      <Row label="Page">
        <PageIframePreview name={item.name} />
      </Row>

      <Row label="Install">
        <div className="flex flex-col gap-2">
          <CodeTabs tabs={installTabs} />
          <p className="text-xs text-faint">
            Installs from ui.aryank.space. To add it by hand, copy the files in
            Usage below, or register the {REGISTRY_NAMESPACE} namespace via the{" "}
            <Link href="/docs" className="underline hover:text-foreground">
              docs
            </Link>
            .
          </p>
        </div>
      </Row>

      <Row label="Files">
        <RegistryFiles
          files={built.files}
          demo={
            demoSource
              ? { filename: "demo.tsx", content: demoSource }
              : undefined
          }
        />
      </Row>

      {meta ? (
        <Row label="API">
          <div className="overflow-x-auto rounded-lg border bg-surface">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs tracking-[0.12em] text-muted-foreground uppercase">
                  <th className="px-4 py-2.5 font-normal">Prop</th>
                  <th className="px-4 py-2.5 font-normal">Type</th>
                  <th className="px-4 py-2.5 font-normal">Default</th>
                  <th className="px-4 py-2.5 font-normal">Description</th>
                </tr>
              </thead>
              <tbody>
                {meta.api.map((prop) => (
                  <tr
                    key={prop.name}
                    className="border-b align-top last:border-0"
                  >
                    <td className="px-4 py-2.5 whitespace-nowrap text-foreground">
                      {prop.name}
                    </td>
                    <td className="px-4 py-2.5 text-accent-soft">
                      {prop.type}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground">
                      {prop.default ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {prop.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Row>
      ) : null}

      {meta?.editable.length ? (
        <Row label="Customize">
          <div className="grid gap-3">
            {meta.editable.map((control) => (
              <div
                key={control.name}
                className="grid grid-cols-1 gap-2 border-b pb-3 last:border-0 sm:grid-cols-[160px_120px_1fr]"
              >
                <code className="text-sm text-foreground">{control.name}</code>
                <span className="text-xs tracking-[0.12em] text-accent-soft uppercase">
                  {control.control}
                </span>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {control.description}
                </p>
              </div>
            ))}
          </div>
        </Row>
      ) : null}

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
