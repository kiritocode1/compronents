import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  getRegistryItem,
  REGISTRY_HOMEPAGE,
  REGISTRY_NAME,
  type RegistryItem,
  registryItems,
} from "@/lib/registry";

const ITEM_SCHEMA = "https://ui.shadcn.com/schema/registry-item.json";
const REGISTRY_SCHEMA = "https://ui.shadcn.com/schema/registry.json";

export class RegistryItemNotFoundError extends Error {
  constructor(name: string) {
    super(`Registry item "${name}" was not found.`);
    this.name = "RegistryItemNotFoundError";
  }
}

async function readItemFiles(item: RegistryItem) {
  return Promise.all(
    item.files.map(async (file) => ({
      path: file.target,
      type: file.type,
      target: file.target,
      content: await readFile(path.join(process.cwd(), file.path), "utf-8"),
    })),
  );
}

/** Build a complete shadcn registry-item JSON, inlining file contents. */
export async function buildRegistryItem(name: string) {
  const item = getRegistryItem(name.replace(/\.json$/, ""));
  if (!item) {
    throw new RegistryItemNotFoundError(name);
  }

  return {
    $schema: ITEM_SCHEMA,
    name: item.name,
    type: item.type,
    title: item.title,
    description: item.description,
    dependencies: item.dependencies,
    registryDependencies: item.registryDependencies,
    files: await readItemFiles(item),
  };
}

/** Build the registry catalog (`registry.json`) used by `list` / `search`. */
export function buildRegistryCatalog() {
  return {
    $schema: REGISTRY_SCHEMA,
    name: REGISTRY_NAME,
    homepage: REGISTRY_HOMEPAGE,
    items: registryItems.map((item) => ({
      name: item.name,
      type: item.type,
      title: item.title,
      description: item.description,
      dependencies: item.dependencies,
      registryDependencies: item.registryDependencies,
      files: item.files.map((file) => ({
        path: file.target,
        type: file.type,
        target: file.target,
      })),
    })),
  };
}
