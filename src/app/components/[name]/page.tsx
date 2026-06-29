import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { CodeBlock } from "@/components/site/code-block";
import { ComponentStudioPanel } from "@/components/site/component-studio-panel";
import { getHostedAssetUrl } from "@/lib/assets";
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
            href="/components"
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

      <Row label="Studio">
        <ComponentStudioPanel name={item.name} />
      </Row>

      {meta?.nuance.length ? (
        <Row label="Nuance">
          <div className="grid gap-4 sm:grid-cols-3">
            {meta.nuance.map((note) => (
              <section key={note.label} className="border-t pt-3">
                <h2 className="text-xs tracking-[0.12em] text-foreground uppercase">
                  {note.label}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {note.description}
                </p>
              </section>
            ))}
          </div>
        </Row>
      ) : null}

      {meta?.editable.length ? (
        <Row label="Editable">
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

      {meta?.assets.length ? (
        <Row label="Assets">
          <div className="grid gap-4">
            {meta.assets.map((asset) => (
              <section
                key={asset.id}
                className="rounded-lg border bg-surface p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-sm text-foreground uppercase">
                      {asset.label}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {asset.role}
                    </p>
                  </div>
                  <span className="w-fit rounded border px-2 py-1 text-[0.65rem] tracking-[0.12em] text-accent-soft uppercase">
                    {asset.provider}
                  </span>
                </div>
                <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
                  <div>
                    <dt className="label">Path</dt>
                    <dd className="mt-1 break-all text-muted-foreground">
                      {asset.pathname}
                    </dd>
                  </div>
                  <div>
                    <dt className="label">Blob env</dt>
                    <dd className="mt-1 break-all text-muted-foreground">
                      {asset.envKey}
                    </dd>
                  </div>
                  <div>
                    <dt className="label">Served from</dt>
                    <dd className="mt-1 break-all text-muted-foreground">
                      <a
                        href={getHostedAssetUrl(asset.pathname)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-4 hover:text-foreground"
                      >
                        {getHostedAssetUrl(asset.pathname)}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="label">Local fallback</dt>
                    <dd className="mt-1 break-all text-muted-foreground">
                      {asset.fallbackPath}
                    </dd>
                  </div>
                </dl>
              </section>
            ))}
          </div>
        </Row>
      ) : null}

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
