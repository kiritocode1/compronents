import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { CodeBlock } from "@/components/site/code-block";
import { StreamerVeil } from "@/components/site/streamer-veil";
import {
  REGISTRY_BASE_URL,
  REGISTRY_NAME,
  REGISTRY_NAMESPACE,
  registryItems,
  registryItemUrl,
} from "@/lib/registry";
import { highlight } from "@/lib/shiki";

export const metadata: Metadata = {
  title: "Docs",
  description: `How to install and consume the ${REGISTRY_NAME} registry.`,
};

const first = registryItems[0]?.name ?? "button";

const INIT_CMD = `npx shadcn@latest init`;
const ENV_FILE = `BLANK_REGISTRY_TOKEN=blank_your_token_here`;
// A fragment, not a whole file: shadcn rejects a components.json that is
// missing the keys `init` writes, so this has to be merged in.
const COMPONENTS_JSON = `"registries": {
  "${REGISTRY_NAMESPACE}": {
    "url": "${REGISTRY_BASE_URL}/r/{name}.json",
    "headers": { "Authorization": "Bearer \${BLANK_REGISTRY_TOKEN}" }
  }
}`;
const ADD_CMD = `npx shadcn@latest add ${REGISTRY_NAMESPACE}/${first}`;
const URL_CMD = `npx shadcn@latest add "${registryItemUrl(first)}?token=$BLANK_REGISTRY_TOKEN"`;
const BROKEN_CMD = `npx shadcn@latest registry add ${REGISTRY_NAMESPACE}=${REGISTRY_BASE_URL}/r/{name}.json`;

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-[130px_1fr]">
      <span className="label pt-1">{label}</span>
      <div className="flex min-w-0 flex-col gap-3">{children}</div>
    </section>
  );
}

function Step({ n, children }: { n: number; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="mt-px shrink-0 font-mono text-xs text-faint">{n}</span>
      <div className="flex min-w-0 flex-1 flex-col gap-3">{children}</div>
    </div>
  );
}

export default async function DocsPage() {
  const [initHtml, envHtml, jsonHtml, addHtml, urlHtml, brokenHtml] =
    await Promise.all([
      highlight(INIT_CMD, "bash"),
      highlight(ENV_FILE, "bash"),
      highlight(COMPONENTS_JSON, "json"),
      highlight(ADD_CMD, "bash"),
      highlight(URL_CMD, "bash"),
      highlight(BROKEN_CMD, "bash"),
    ]);

  return (
    <main className="flex flex-col gap-14 pt-8 pb-32">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl tracking-wide text-foreground uppercase sm:text-4xl">
          Docs
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {REGISTRY_NAME} is a shadcn-compatible registry. Every item is token
          gated, so a fresh project needs four things wired up before the first
          install.
        </p>
      </header>

      <Row label="Setup">
        <Step n={1}>
          <p className="text-sm text-muted-foreground">
            In a new project, initialise shadcn first. Skip this if{" "}
            <code className="text-foreground">components.json</code> already
            exists.
          </p>
          <CodeBlock html={initHtml} raw={INIT_CMD} />
        </Step>

        <Step n={2}>
          <StreamerVeil>
            <p className="text-sm text-muted-foreground">
              Mint a token at{" "}
              <a
                href="https://mint-me.aryank.space"
                className="text-accent-soft hover:underline"
              >
                mint-me.aryank.space
              </a>
              . It is shown once and never stored in readable form, so copy it
              before closing the page.
            </p>
          </StreamerVeil>
        </Step>

        <Step n={3}>
          <p className="text-sm text-muted-foreground">
            Put it in <code className="text-foreground">.env.local</code>. An
            exported shell variable works too, but the file survives a new
            terminal.
          </p>
          <CodeBlock html={envHtml} raw={ENV_FILE} filename=".env.local" />
        </Step>

        <Step n={4}>
          <p className="text-sm text-muted-foreground">
            Merge this key into the{" "}
            <code className="text-foreground">components.json</code> that step 1
            created. Add it alongside the existing keys rather than replacing
            the file: shadcn rejects the config if the keys{" "}
            <code className="text-foreground">init</code> wrote are missing. The
            headers block is the part that matters, since shadcn only sends
            authentication for a namespaced registry, never for a plain URL.
          </p>
          <CodeBlock
            html={jsonHtml}
            raw={COMPONENTS_JSON}
            filename="components.json"
          />
        </Step>

        <Step n={5}>
          <p className="text-sm text-muted-foreground">
            Install anything by name. The token is read from the environment, so
            it never lands in your shell history.
          </p>
          <CodeBlock html={addHtml} raw={ADD_CMD} />
        </Step>
      </Row>

      <Row label="Do not">
        <p className="text-sm text-muted-foreground">
          Skip the <code className="text-foreground">registry add</code>{" "}
          subcommand. It writes the namespace as a bare URL string with no
          headers, so every install then fails with a 401 even when the token is
          set correctly. Edit{" "}
          <code className="text-foreground">components.json</code> by hand as
          shown above.
        </p>
        <CodeBlock html={brokenHtml} raw={BROKEN_CMD} />
      </Row>

      <Row label="One-off">
        <p className="text-sm text-muted-foreground">
          Without a namespace there is nowhere to put a header, so the token
          rides as a query parameter instead. Fine for a single install, though
          it does leave the token in your shell history.
        </p>
        <CodeBlock html={urlHtml} raw={URL_CMD} />
      </Row>

      <Row label="If it 401s">
        <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
          <li>
            <span className="text-foreground">
              &ldquo;requires the following environment variables&rdquo;
            </span>{" "}
            means the namespace is wired but{" "}
            <code className="text-foreground">BLANK_REGISTRY_TOKEN</code> is not
            set. Check <code className="text-foreground">.env.local</code>.
          </li>
          <li>
            <span className="text-foreground">
              &ldquo;A registry token is required&rdquo;
            </span>{" "}
            means no credential reached the server at all, which usually means
            the namespace is a bare string rather than the object form above.
          </li>
          <li>
            <span className="text-foreground">
              &ldquo;not valid or was revoked&rdquo;
            </span>{" "}
            means the token was recognised and rejected. Mint a fresh one.
          </li>
        </ul>
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
          <li>
            Both require a token, sent as{" "}
            <code className="text-foreground">Authorization: Bearer</code>,{" "}
            <code className="text-foreground">X-Registry-Token</code>, or{" "}
            <code className="text-foreground">?token=</code>.
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
