"use client";

import { useSound } from "@web-kits/audio/react";
import { FileCodeIcon } from "lucide-react";
import type { ElementType } from "react";
import { useMemo, useState } from "react";
import { CodeTabs } from "@/components/animate-ui/components/animate/code-tabs";
import {
  FileItem,
  Files,
  FolderContent,
  FolderItem,
  FolderTrigger,
  SubFiles,
} from "@/components/animate-ui/components/radix/files";
import { FILE_ICON_MAP } from "@/components/ui/file-tree";
import { uiCopy } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface BuiltFile {
  /** Install target path, e.g. `components/ui/foo/index.tsx`. */
  target: string;
  /** Raw source, 1:1 with what `shadcn add` writes. */
  content: string;
}

interface TreeNode {
  name: string;
  /** Full path from the tree root, also the accordion value / tab key. */
  path: string;
  children?: TreeNode[];
}

/** Nest install-target paths into folders, editor-style ordering. */
function buildTree(paths: string[]): TreeNode[] {
  const roots: TreeNode[] = [];
  for (const full of paths) {
    let level = roots;
    const parts = full.split("/");
    parts.forEach((name, i) => {
      const path = parts.slice(0, i + 1).join("/");
      const isFile = i === parts.length - 1;
      let node = level.find((n) => n.name === name);
      if (!node) {
        node = isFile ? { name, path } : { name, path, children: [] };
        level.push(node);
      }
      if (!isFile) level = node.children ??= [];
    });
  }
  const sort = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      const af = a.children ? 0 : 1;
      const bf = b.children ? 0 : 1;
      return af - bf || a.name.localeCompare(b.name);
    });
    for (const n of nodes) if (n.children) sort(n.children);
    return nodes;
  };
  return sort(roots);
}

function folderPaths(nodes: TreeNode[]): string[] {
  return nodes.flatMap((n) =>
    n.children ? [n.path, ...folderPaths(n.children)] : [],
  );
}

const LANG_BY_EXT: Record<string, string> = {
  tsx: "tsx",
  ts: "typescript",
  jsx: "jsx",
  js: "javascript",
  css: "css",
  json: "json",
};

function languageOf(target: string): string {
  return LANG_BY_EXT[target.split(".").pop() ?? ""] ?? "tsx";
}

/**
 * Tab keys double as tab labels, so use the filename and only fall back to the
 * full path where two install targets share a basename (two `index.tsx`).
 */
function labelsByPath(targets: string[]): Map<string, string> {
  const counts = new Map<string, number>();
  for (const t of targets) {
    const base = t.split("/").pop() ?? t;
    counts.set(base, (counts.get(base) ?? 0) + 1);
  }
  return new Map(
    targets.map((t) => {
      const base = t.split("/").pop() ?? t;
      return [t, (counts.get(base) ?? 0) > 1 ? t : base];
    }),
  );
}

/**
 * Language badge per extension (`TX` in TypeScript blue, `{}` in JSON grey),
 * reusing the palette the old file tree already shipped. Cached so `FileItem`
 * keeps the same component type across renders instead of remounting the icon.
 */
const badgeCache = new Map<string, ElementType>();

function iconFor(name: string): ElementType {
  const ext = name.split(".").pop() ?? "";
  const info = FILE_ICON_MAP[ext];
  if (!info) return FileCodeIcon;

  let Badge = badgeCache.get(ext);
  if (!Badge) {
    Badge = ({ className }: { className?: string }) => (
      <span
        aria-hidden
        className={cn(
          "flex shrink-0 items-center justify-center rounded-[3px] font-bold text-[8px] leading-none",
          className,
        )}
        style={{ backgroundColor: `${info.color}20`, color: info.color }}
      >
        {info.label}
      </span>
    );
    badgeCache.set(ext, Badge);
  }
  return Badge;
}

function FileTree({
  nodes,
  selected,
  onSelect,
}: {
  nodes: TreeNode[];
  selected: string;
  onSelect: (path: string) => void;
}) {
  return nodes.map((node) =>
    node.children ? (
      <FolderItem key={node.path} value={node.path}>
        <FolderTrigger className="whitespace-nowrap">{node.name}</FolderTrigger>
        <FolderContent>
          <SubFiles defaultOpen={folderPaths(node.children)}>
            <FileTree
              nodes={node.children}
              onSelect={onSelect}
              selected={selected}
            />
          </SubFiles>
        </FolderContent>
      </FolderItem>
    ) : (
      // The file row is `pointer-events-none` inside its highlight, so the
      // click target is this wrapper. A real button mirrors what the folder
      // trigger already does, and opts the row into the site-wide click sound.
      <button
        className="w-full cursor-pointer text-left"
        key={node.path}
        onClick={() => onSelect(node.path)}
        type="button"
      >
        <FileItem
          className={cn(
            "whitespace-nowrap transition-colors",
            selected === node.path
              ? "text-foreground"
              : "text-muted-foreground",
          )}
          icon={iconFor(node.name)}
        >
          {node.name}
        </FileItem>
      </button>
    ),
  );
}

/**
 * Portrays a registry item exactly as it installs: a file tree of the install
 * targets beside a single code surface holding every file as a tab. Clicking a
 * file in the tree animates that file into the code panel. Sources are the
 * output of `buildRegistryItem`, so what is shown is byte-for-byte what
 * `shadcn add` writes (guarded by the registry install tests).
 */
export function RegistryFiles({
  files,
  demo,
}: {
  files: BuiltFile[];
  demo?: { filename: string; content: string };
}) {
  const all = useMemo(
    () =>
      (demo ? [{ target: demo.filename, content: demo.content }] : []).concat(
        files,
      ),
    [demo, files],
  );
  const tree = useMemo(() => buildTree(all.map((f) => f.target)), [all]);
  const labels = useMemo(() => labelsByPath(all.map((f) => f.target)), [all]);
  const codes = useMemo(
    () =>
      Object.fromEntries(
        all.map((f) => [labels.get(f.target) ?? f.target, f.content]),
      ),
    [all, labels],
  );

  const [selected, setSelected] = useState(all[0]?.target ?? "");
  const activeLabel = labels.get(selected) ?? selected;

  if (all.length === 0) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:items-start">
      <div className="overflow-hidden rounded-xl border bg-muted/50 lg:sticky lg:top-6 [&_[data-slot=motion-highlight]]:bg-foreground/8">
        <Files
          className="scroll-thin max-h-[28rem] text-sm"
          defaultOpen={folderPaths(tree)}
        >
          <FileTree nodes={tree} onSelect={setSelected} selected={selected} />
        </Files>
      </div>

      <FileCodeTabs
        activeLabel={activeLabel}
        codes={codes}
        lang={languageOf(selected)}
        onSelectLabel={(label) => {
          for (const [path, l] of labels) if (l === label) setSelected(path);
        }}
      />
    </div>
  );
}

/**
 * The code surface. Split out so the copy sound hook and the per-file shiki
 * language live next to the tabs they belong to.
 */
function FileCodeTabs({
  codes,
  activeLabel,
  lang,
  onSelectLabel,
}: {
  codes: Record<string, string>;
  activeLabel: string;
  lang: string;
  onSelectLabel: (label: string) => void;
}) {
  const playCopied = useSound(uiCopy);

  return (
    <CodeTabs
      // The vendored copy button ships `variant="ghost"`, whose
      // `hover:text-accent-foreground` turns the icon black on this dark
      // surface. Restate the site's copy-button colors, green tick included.
      className={cn(
        // The pane wrapper ships `items-center`, so a file taller than the box
        // overflows both ways and neither end is reachable. Anchor it to the
        // top and give it the same bounded, thin-scrollbar treatment as the
        // tree beside it.
        "[&_[data-slot=install-tabs-content]>div]:max-h-[28rem] [&_[data-slot=install-tabs-content]>div]:items-start",
        "[&_[data-slot=install-tabs-content]>div]:scroll-thin [&_[data-slot=install-tabs-content]>div]:p-5",
        // The `pre` is a flex item, so it shrinks to its longest *word* and
        // clips long lines with no scrollbar. Pin it to its full line width.
        "[&_[data-slot=install-tabs-content]_pre]:min-w-max",
        // Scroll the tab strip itself, not the row, so the copy button stays
        // pinned right once an item has more tabs than fit. Match on `role=tab`
        // because the highlight wrapper overwrites the trigger's `data-slot`.
        "[&_[role=tab]]:whitespace-nowrap [&_[data-slot=install-tabs-list]>div:first-of-type]:scroll-thin [&_[data-slot=install-tabs-list]>div:first-of-type]:gap-x-6 [&_[data-slot=install-tabs-list]>div:first-of-type]:overflow-x-auto",
        "[&_[data-slot=copy-button]]:ml-3 [&_[data-slot=copy-button]]:shrink-0",
        "[&_[data-slot=copy-button]]:text-muted-foreground [&_[data-slot=copy-button]:hover]:bg-foreground/8 [&_[data-slot=copy-button]:hover]:text-foreground",
        "[&_[data-slot=copy-button]_.lucide-check]:text-emerald-400",
      )}
      codes={codes}
      lang={lang}
      onCopiedChange={(copied) => copied && playCopied()}
      onValueChange={onSelectLabel}
      themes={DARK_THEMES}
      value={activeLabel}
    />
  );
}

/** The site is forced dark, so both `CodeTabs` theme slots take a dark theme. */
const DARK_THEMES = { light: "github-dark", dark: "github-dark" };
