import { readFile } from "node:fs/promises";
import path from "node:path";
import { assetItems } from "@/lib/assets";
import { type ComponentAssetDoc, getComponentMeta } from "@/lib/component-meta";
import {
  getRegistryItem,
  installCommands,
  REGISTRY_BASE_URL,
  REGISTRY_NAMESPACE,
} from "@/lib/registry";
import {
  buildRegistryItem,
  RegistryItemNotFoundError,
} from "@/lib/registry-server";

const GENERIC_FONT_FAMILIES = new Set([
  "cursive",
  "fantasy",
  "inherit",
  "initial",
  "monospace",
  "sans-serif",
  "serif",
  "system-ui",
  "ui-monospace",
  "ui-sans-serif",
  "ui-serif",
  "unset",
]);

const LANGUAGE_BY_EXTENSION: Record<string, string> = {
  css: "css",
  js: "javascript",
  jsx: "jsx",
  json: "json",
  ts: "typescript",
  tsx: "tsx",
};

function markdownCell(value: string | undefined) {
  return (value || "Not documented")
    .replaceAll("|", "\\|")
    .replaceAll("\n", "<br>");
}

function codeFence(content: string, language = "") {
  const longestRun = Math.max(
    0,
    ...Array.from(content.matchAll(/`+/g), (match) => match[0].length),
  );
  const fence = "`".repeat(Math.max(3, longestRun + 1));
  return `${fence}${language}\n${content.trimEnd()}\n${fence}`;
}

function languageOf(filename: string) {
  const extension = filename.split(".").pop() ?? "";
  return LANGUAGE_BY_EXTENSION[extension] ?? "text";
}

function normalizeFontFamily(value: string) {
  return value
    .trim()
    .replace(/^['"`]|['"`]$/g, "")
    .replace(/\\[nr]/g, "")
    .replace(/!important$/i, "")
    .trim();
}

function extractFontFamilies(sources: string[]) {
  const families = new Set<string>();

  for (const source of sources) {
    for (const match of source.matchAll(/font-family\s*:\s*([^;}{]+)/gi)) {
      for (const family of match[1].split(",")) {
        const normalized = normalizeFontFamily(family);
        if (
          normalized &&
          !normalized.startsWith("var(") &&
          !GENERIC_FONT_FAMILIES.has(normalized.toLowerCase())
        ) {
          families.add(normalized);
        }
      }
    }

    for (const match of source.matchAll(
      /fontFamily\s*:\s*["'`]([^"'`]+)["'`]/g,
    )) {
      for (const family of match[1].split(",")) {
        const normalized = normalizeFontFamily(family);
        if (
          normalized &&
          !normalized.startsWith("var(") &&
          !GENERIC_FONT_FAMILIES.has(normalized.toLowerCase())
        ) {
          families.add(normalized);
        }
      }
    }
  }

  return Array.from(families).sort((a, b) => a.localeCompare(b));
}

function extractFontStylesheets(sources: string[]) {
  const stylesheets = new Set<string>();

  for (const source of sources) {
    for (const match of source.matchAll(
      /@import\s+(?:url\()?\s*["']?(https?:\/\/[^"')\s;]+)/gi,
    )) {
      if (/font/i.test(match[1])) stylesheets.add(match[1]);
    }
  }

  return Array.from(stylesheets).sort((a, b) => a.localeCompare(b));
}

function assetsForItem(name: string, documented: ComponentAssetDoc[]) {
  const documentedById = new Map(documented.map((asset) => [asset.id, asset]));
  const exactAssets = assetItems
    .filter((asset) => asset.id.startsWith(`${name}-`))
    .map((asset) => ({
      ...asset,
      role: documentedById.get(asset.id)?.role ?? asset.role,
    }));
  const exactIds = new Set<string>(exactAssets.map((asset) => asset.id));

  return [
    ...exactAssets,
    ...documented.filter((asset) => !exactIds.has(asset.id)),
  ];
}

async function readOptionalFile(relativePath: string) {
  try {
    return await readFile(path.join(process.cwd(), relativePath), "utf-8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

/**
 * Produces a complete, agent-readable implementation handoff for one registry
 * item. It is generated from the same source used by the shadcn endpoint, so
 * the copied Markdown cannot drift away from the code that actually installs.
 */
export async function buildRegistryItemMarkdown(name: string) {
  const slug = name.replace(/\.(?:json|md)$/, "");
  const item = getRegistryItem(slug);
  if (!item) throw new RegistryItemNotFoundError(slug);

  const [built, demoSource] = await Promise.all([
    buildRegistryItem(slug),
    readOptionalFile(
      getComponentMeta(slug)?.demoPath ?? `src/components/demos/${slug}.tsx`,
    ),
  ]);
  const meta = getComponentMeta(slug);
  const sources = built.files.map((file) => file.content);
  const fontFamilies = extractFontFamilies(sources);
  const fontStylesheets = extractFontStylesheets(sources);
  const assets = assetsForItem(slug, meta?.assets ?? []);
  const fontAssets = assets.filter((asset) =>
    /(?:^|\/)(?:font|fonts)(?:\/|$)|\.(?:otf|ttf|woff2?)$/i.test(
      asset.pathname,
    ),
  );
  const needsNext = sources.some((source) =>
    /from\s+["']next(?:\/|["'])/.test(source),
  );
  const install = installCommands(slug).find(
    (command) => command.id === "pnpm",
  )?.command;
  const manualDependencies = item.dependencies.length
    ? `pnpm add ${item.dependencies.join(" ")}`
    : "# No additional runtime packages are required.";

  const lines: string[] = [
    `# ${item.title}`,
    "",
    `> Complete implementation handoff generated from [${REGISTRY_BASE_URL}](${REGISTRY_BASE_URL}). Give this document to a developer or coding agent together with the target project.`,
    "",
    `- Registry item: \`${REGISTRY_NAMESPACE}/${item.name}\``,
    `- Kind: ${item.section === "pages" ? "Full page" : item.section === "backend" ? "Backend" : "Component"}`,
    `- Category: ${item.category}`,
    `- Registry JSON: [${REGISTRY_BASE_URL}/r/${item.name}.json](${REGISTRY_BASE_URL}/r/${item.name}.json)`,
    `- Live reference: [${REGISTRY_BASE_URL}/${item.section}/${item.name}](${REGISTRY_BASE_URL}/${item.section}/${item.name})`,
    "",
    "## Description",
    "",
    item.description,
    "",
    "## Implementation contract",
    "",
    "1. Use the shipped source below as the canonical implementation. Preserve its client directives, component boundaries, cleanup logic, and file structure.",
    "2. Install every listed dependency before changing the component. Do not replace working packages with approximations unless the target project requires it.",
    "3. Preserve the documented typography and asset paths. Do not substitute placeholder media for the Blob assets.",
    "4. Keep the motion, scrolling, pointer, loading, and responsive behavior described in the fidelity notes.",
    "5. Adapt copy, data, colors, and composition through the documented editable surfaces and public API instead of deleting the behavior that gives the component its character.",
    "6. Verify TypeScript, the target framework build, desktop and narrow layouts, and the primary interaction from start to finish.",
    "",
    "## Project setup",
    "",
    `- Start with a TypeScript React project${needsNext ? " using the Next.js App Router" : ""}.`,
    "- The fastest path is a shadcn-compatible project with a valid `components.json`.",
    "- If shadcn is not configured yet, initialize it first:",
    "",
    codeFence("pnpm dlx shadcn@latest init", "bash"),
    "",
    "### Install the complete item",
    "",
    codeFence(
      install ??
        `pnpm dlx shadcn@latest add ${REGISTRY_BASE_URL}/r/${item.name}.json`,
      "bash",
    ),
    "",
    "The registry install writes every file to the target paths listed below and installs its declared dependencies.",
    "",
    "### Manual dependency install",
    "",
    "Only use this when copying the source by hand instead of using the registry command.",
    "",
    codeFence(manualDependencies, "bash"),
    "",
  ];

  if (item.registryDependencies.length) {
    lines.push(
      "### Registry dependencies",
      "",
      ...item.registryDependencies.map(
        (dependency) => `- \`${REGISTRY_NAMESPACE}/${dependency}\``,
      ),
      "",
      "The shadcn command resolves these automatically. Install them first if you are assembling files manually.",
      "",
    );
  }

  lines.push("## Typography", "");
  if (fontFamilies.length) {
    lines.push(
      `Detected font families in the shipped source: ${fontFamilies
        .map((font) => `\`${font}\``)
        .join(", ")}.`,
      "",
    );
  } else {
    lines.push(
      "No custom font family is declared in the shipped source. The component inherits typography from the consumer project.",
      "",
    );
  }

  if (fontAssets.length) {
    lines.push(
      "The following font files are part of the Blob asset set. Keep their paths stable or update the matching `@font-face` declarations.",
      "",
      "| Font asset | Hosted path | Role |",
      "| --- | --- | --- |",
      ...fontAssets.map(
        (asset) =>
          `| ${markdownCell(asset.label)} | [\`/assets/${asset.pathname}\`](${REGISTRY_BASE_URL}/assets/${asset.pathname}) | ${markdownCell(asset.role)} |`,
      ),
      "",
    );
  } else if (fontStylesheets.length) {
    lines.push(
      "The shipped source loads typography from these external stylesheets. Keep these imports, or self-host equivalent licensed font files and update the declarations.",
      "",
      ...fontStylesheets.map((stylesheet) => `- <${stylesheet}>`),
      "",
    );
  } else if (fontFamilies.length) {
    lines.push(
      "No font binary ships with this item. Make the detected families available through the target project's font loader or global CSS, or choose an intentional metrically compatible substitute.",
      "",
    );
  }

  lines.push("## Public API", "");
  if (meta?.api.length) {
    lines.push(
      "| Prop | Type | Default | Description |",
      "| --- | --- | --- | --- |",
      ...meta.api.map(
        (prop) =>
          `| \`${markdownCell(prop.name)}\` | \`${markdownCell(prop.type)}\` | ${prop.default ? `\`${markdownCell(prop.default)}\`` : "Required"} | ${markdownCell(prop.description)} |`,
      ),
      "",
    );
  } else {
    lines.push(
      "No separate prop contract is documented for this item. Use the exported signatures in the source files below as the API reference.",
      "",
    );
  }

  lines.push("## Editable surfaces", "");
  if (meta?.editable.length) {
    lines.push(
      "| Surface | Control | Guidance |",
      "| --- | --- | --- |",
      ...meta.editable.map(
        (editable) =>
          `| \`${markdownCell(editable.name)}\` | ${markdownCell(editable.control)} | ${markdownCell(editable.description)} |`,
      ),
      "",
    );
  } else {
    lines.push(
      "No dedicated studio controls are documented. Customize through the public API and the clearly named constants in the source.",
      "",
    );
  }

  lines.push("## Fidelity notes", "");
  if (meta?.nuance.length) {
    for (const nuance of meta.nuance) {
      lines.push(`### ${nuance.label}`, "", nuance.description, "");
    }
  } else {
    lines.push(
      "Preserve the behavior described above and treat the live reference as the visual and interaction acceptance target.",
      "",
    );
  }

  lines.push("## Assets", "");
  if (assets.length) {
    lines.push(
      "Assets are served from Vercel Blob through stable `/assets/<pathname>` URLs. Keep this directory structure when self-hosting. Large image sequences are listed in full so another agent can reproduce the component without guessing filenames.",
      "",
      "| Asset | Path | Role |",
      "| --- | --- | --- |",
      ...assets.map(
        (asset) =>
          `| ${markdownCell(asset.label)} | [\`/assets/${asset.pathname}\`](${REGISTRY_BASE_URL}/assets/${asset.pathname}) | ${markdownCell(asset.role)} |`,
      ),
      "",
    );
  } else {
    lines.push(
      "This item does not require a registered external asset set.",
      "",
    );
  }

  lines.push(
    "## Installed file tree",
    "",
    ...built.files.map((file) => `- \`${file.target}\``),
    "",
  );

  if (demoSource) {
    lines.push(
      "## Usage",
      "",
      "This is the registry's own usage example. Start here, then change only the documented inputs.",
      "",
      codeFence(demoSource, "tsx"),
      "",
    );
  }

  lines.push(
    "## Source",
    "",
    "These files are byte-for-byte equivalent to what the registry endpoint installs.",
    "",
  );
  for (const file of built.files) {
    lines.push(
      `### \`${file.target}\``,
      "",
      codeFence(file.content, languageOf(file.target)),
      "",
    );
  }

  lines.push(
    "## Acceptance checklist",
    "",
    "- [ ] Every shipped file is present at the documented target path.",
    "- [ ] Runtime and registry dependencies are installed.",
    "- [ ] Custom fonts load without fallback flashes or missing-file requests.",
    "- [ ] Blob assets resolve without placeholders or broken URLs.",
    "- [ ] The public API and defaults match this document.",
    "- [ ] The live reference's primary interaction and motion cadence are preserved.",
    "- [ ] The component works at desktop and narrow viewport widths.",
    "- [ ] Type checking and the production build pass in the target project.",
    "",
  );

  return lines.join("\n");
}
