import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { CodeBlock } from "@/components/site/code-block";
import {
  REGISTRY_NAME,
  REGISTRY_NAMESPACE,
  registryItems,
} from "@/lib/registry";
import { highlight } from "@/lib/shiki";

export const metadata: Metadata = {
  title: "Docs",
  description: `How to install and consume the ${REGISTRY_NAME} registry.`,
};

const first = registryItems[0]?.name ?? "button";
const URL_CMD = `npx shadcn@latest add http://localhost:3000/r/${first}.json`;
const NAMESPACE_CMD = `npx shadcn@latest registry add ${REGISTRY_NAMESPACE}=http://localhost:3000/r/{name}.json`;
const ADD_CMD = `npx shadcn@latest add ${REGISTRY_NAMESPACE}/${first}`;
const COMPONENTS_JSON = `{
  "registries": {
    "${REGISTRY_NAMESPACE}": "http://localhost:3000/r/{name}.json"
  }
}`;

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-[130px_1fr]">
      <span className="label pt-1">{label}</span>
      <div className="flex min-w-0 flex-col gap-3">{children}</div>
    </section>
  );
}

export default async function DocsPage() {
  const [urlHtml, nsHtml, addHtml, jsonHtml] = await Promise.all([
    highlight(URL_CMD, "bash"),
    highlight(NAMESPACE_CMD, "bash"),
    highlight(ADD_CMD, "bash"),
    highlight(COMPONENTS_JSON, "json"),
  ]);

  return (
    <main className="flex flex-col gap-14 pt-8 pb-32">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl tracking-wide text-foreground uppercase sm:text-4xl">
          Docs
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {REGISTRY_NAME} is a shadcn-compatible registry. Items are served as
          JSON over HTTP and installed straight into a project with the shadcn
          CLI.
        </p>
      </header>

      <Row label="Direct">
        <p className="text-sm text-muted-foreground">
          Point the CLI at any item URL — no setup.
        </p>
        <CodeBlock html={urlHtml} raw={URL_CMD} />
      </Row>

      <Row label="Namespace">
        <p className="text-sm text-muted-foreground">
          Register {REGISTRY_NAMESPACE} once, then install items by name.
        </p>
        <CodeBlock html={nsHtml} raw={NAMESPACE_CMD} />
        <p className="text-sm text-muted-foreground">
          Or add it to your components.json:
        </p>
        <CodeBlock
          html={jsonHtml}
          raw={COMPONENTS_JSON}
          filename="components.json"
        />
        <CodeBlock html={addHtml} raw={ADD_CMD} />
      </Row>

      <Row label="Endpoints">
        <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
          <li>
            <code className="text-foreground">/r/registry.json</code> — the
            catalog (powers list / search)
          </li>
          <li>
            <code className="text-foreground">/r/{"{name}"}.json</code> — a
            single installable item
          </li>
        </ul>
        <p className="text-sm text-muted-foreground">
          Browse everything on the{" "}
          <Link href="/" className="text-accent-soft hover:underline">
            index
          </Link>
          .
        </p>
      </Row>
    </main>
  );
}
