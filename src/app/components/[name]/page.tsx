import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { CodeBlock } from "@/components/site/code-block";
import { DemoStage } from "@/components/site/demo-stage";
import { getComponentMeta } from "@/lib/component-meta";
import {
  getRegistryItem,
  REGISTRY_NAMESPACE,
  registryItems,
} from "@/lib/registry";
import { buildRegistryItem } from "@/lib/registry-server";
import { highlight } from "@/lib/shiki";

export function generateStaticParams() {
  return registryItems.map((item) => ({ name: item.name }));
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

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const item = getRegistryItem(name);
  if (!item) notFound();

  const meta = getComponentMeta(name);
  const built = await buildRegistryItem(name);
  const installCmd = `npx shadcn@latest add ${REGISTRY_NAMESPACE}/${item.name}`;

  const demoSource = meta
    ? await readFile(path.join(process.cwd(), meta.demoPath), "utf-8")
    : null;

  const [installHtml, demoHtml, sourceHtmls] = await Promise.all([
    highlight(installCmd, "bash"),
    demoSource ? highlight(demoSource, "tsx") : Promise.resolve(null),
    Promise.all(
      built.files.map(async (file) => ({
        filename: file.target.split("/").pop() ?? file.target,
        html: await highlight(file.content, "tsx"),
        raw: file.content,
      })),
    ),
  ]);

  return (
    <main className="flex flex-col gap-14 pt-8 pb-32">
      {/* Header */}
      <header className="flex flex-col gap-5">
        <nav className="flex items-center gap-2 text-xs tracking-[0.12em] uppercase">
          <Link
            href="/"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Components
          </Link>
          <span className="text-faint">/</span>
          <span className="text-foreground">{item.title}</span>
        </nav>
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl tracking-wide text-foreground uppercase sm:text-4xl">
            {item.title}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {item.description}
          </p>
          <p className="text-xs tracking-[0.12em] text-faint uppercase">
            Released {item.date}
          </p>
        </div>
      </header>

      <Row label="Preview">
        <DemoStage name={item.name} />
      </Row>

      <Row label="Install">
        <div className="flex flex-col gap-2">
          <CodeBlock html={installHtml} raw={installCmd} />
          <p className="text-xs text-faint">
            Or register the {REGISTRY_NAMESPACE} namespace once — see the{" "}
            <Link href="/docs" className="underline hover:text-foreground">
              docs
            </Link>
            .
          </p>
        </div>
      </Row>

      {demoHtml && demoSource ? (
        <Row label="demo.tsx">
          <CodeBlock html={demoHtml} raw={demoSource} filename="demo.tsx" />
        </Row>
      ) : null}

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
                    className="border-b last:border-0 align-top"
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

      <Row label="Source">
        <div className="flex flex-col gap-3">
          {sourceHtmls.map((file) => (
            <CodeBlock
              key={file.filename}
              html={file.html}
              raw={file.raw}
              filename={file.filename}
            />
          ))}
        </div>
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
