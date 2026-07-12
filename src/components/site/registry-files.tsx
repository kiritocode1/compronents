import { CodeBlock } from "@/components/ui/code-block";
import { FileTree, type FileTreeNode } from "@/components/ui/file-tree";

interface BuiltFile {
  /** Install target path, e.g. `components/ui/foo/index.tsx`. */
  target: string;
  /** Raw source, 1:1 with what `shadcn add` writes. */
  content: string;
}

/** Nest install-target paths into the tree shape `<FileTree>` expects. */
function buildTree(paths: string[]): FileTreeNode[] {
  const roots: FileTreeNode[] = [];
  for (const full of paths) {
    let level = roots;
    const parts = full.split("/");
    parts.forEach((name, i) => {
      const isFile = i === parts.length - 1;
      let node = level.find((n) => n.name === name);
      if (!node) {
        node = isFile ? { name } : { name, children: [] };
        level.push(node);
      }
      if (!isFile) level = node.children ??= [];
    });
  }
  const sort = (nodes: FileTreeNode[]) => {
    // Folders first, then files, each alphabetical — the usual editor ordering.
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
 * Portrays a registry item exactly as it installs: a file tree of the install
 * targets, then each file's source in a code block. `files` is the output of
 * `buildRegistryItem`, so the code shown is byte-for-byte what `shadcn add`
 * writes (guarded by the registry install tests). An optional leading demo
 * shows how the component is used.
 */
export function RegistryFiles({
  files,
  demo,
}: {
  files: BuiltFile[];
  demo?: { filename: string; content: string };
}) {
  const tree = buildTree(files.map((f) => f.target));
  const entry =
    files.find((f) => /(^|\/)index\.[jt]sx?$/.test(f.target))?.target ??
    files[0]?.target;

  return (
    <div className="flex flex-col gap-4">
      <FileTree
        tree={tree}
        iconStyle="colored"
        highlight={entry ? [entry] : undefined}
      />
      {demo ? (
        <CodeBlock
          code={demo.content}
          filename={demo.filename}
          language="tsx"
        />
      ) : null}
      {files.map((file) => (
        <CodeBlock
          key={file.target}
          code={file.content}
          filename={file.target}
          language={languageOf(file.target)}
        />
      ))}
    </div>
  );
}
