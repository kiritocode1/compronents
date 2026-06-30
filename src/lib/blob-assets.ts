import {
  BlobError,
  BlobNotFoundError,
  del,
  type HeadBlobResult,
  head,
  type ListBlobResultBlob,
  list,
  type PutBlobResult,
  put,
} from "@vercel/blob";
import type { AssetItem } from "@/lib/assets";

export const REGISTRY_ASSET_ADMIN_HEADER = "x-registry-asset-token";
export const REGISTRY_ASSET_MAX_BYTES = Number(
  process.env.REGISTRY_ASSET_MAX_BYTES ?? 25 * 1024 * 1024,
);

const SAFE_PATH_RE = /^[a-zA-Z0-9][a-zA-Z0-9/_+.-]*[a-zA-Z0-9]$/;
const DEFAULT_CACHE_MAX_AGE = 60 * 60 * 24 * 30;

const ALLOWED_CONTENT_TYPE_PREFIXES = [
  "audio/",
  "font/",
  "image/",
  "model/",
  "text/",
  "video/",
];

const ALLOWED_CONTENT_TYPES = new Set([
  "application/font-woff",
  "application/font-woff2",
  "application/json",
  "application/octet-stream",
  "application/pdf",
  "application/wasm",
]);

const ALLOWED_EXTENSIONS = new Set([
  "avif",
  "css",
  "gif",
  "glb",
  "gltf",
  "jpeg",
  "jpg",
  "json",
  "mov",
  "mp3",
  "mp4",
  "ogg",
  "otf",
  "pdf",
  "png",
  "svg",
  "ttf",
  "txt",
  "wasm",
  "wav",
  "webm",
  "webp",
  "woff",
  "woff2",
]);

export interface RegistryAssetBlob {
  url: string;
  downloadUrl: string;
  pathname: string;
  size?: number;
  contentType?: string;
  uploadedAt?: string;
  etag?: string;
}

export interface UploadRegistryAssetInput {
  pathname: string;
  file: File;
  allowOverwrite?: boolean;
}

export function hasBlobStore() {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
      (process.env.VERCEL_OIDC_TOKEN && process.env.BLOB_STORE_ID),
  );
}

export function getRegistryAssetAdminToken() {
  return process.env.REGISTRY_ASSET_ADMIN_TOKEN;
}

export function requireRegistryAssetAdmin(request: Request) {
  const configuredToken = getRegistryAssetAdminToken();
  if (!configuredToken) {
    return Response.json(
      {
        error:
          "REGISTRY_ASSET_ADMIN_TOKEN is not configured, so registry asset mutations are disabled.",
      },
      { status: 503 },
    );
  }

  const authorization = request.headers.get("authorization");
  const bearerToken = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : null;
  const headerToken = request.headers.get(REGISTRY_ASSET_ADMIN_HEADER);

  if (bearerToken !== configuredToken && headerToken !== configuredToken) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  return null;
}

export function normalizeAssetPathname(value: string) {
  const pathname = value.trim().replace(/^\/+/, "");

  if (
    pathname.length < 3 ||
    pathname.length > 240 ||
    pathname.includes("..") ||
    pathname.includes("//") ||
    pathname.endsWith("/") ||
    !pathname.includes("/") ||
    !SAFE_PATH_RE.test(pathname)
  ) {
    throw new Error(
      "Invalid asset pathname. Use a nested path like component-name/file-name.png with only letters, numbers, /, _, +, ., and -.",
    );
  }

  return pathname;
}

export function normalizeAssetPrefix(value: string) {
  const prefix = value.trim().replace(/^\/+/, "").replace(/\/+$/, "");
  if (!prefix) return undefined;

  if (
    prefix.length > 220 ||
    prefix.includes("..") ||
    prefix.includes("//") ||
    !SAFE_PATH_RE.test(`${prefix}/asset`)
  ) {
    throw new Error(
      "Invalid asset prefix. Use only letters, numbers, /, _, +, ., and -.",
    );
  }

  return `${prefix}/`;
}

export function assertAllowedContentType(contentType: string) {
  const normalized = contentType.toLowerCase().split(";")[0].trim();
  const allowed =
    ALLOWED_CONTENT_TYPES.has(normalized) ||
    ALLOWED_CONTENT_TYPE_PREFIXES.some((prefix) =>
      normalized.startsWith(prefix),
    );

  if (!allowed) {
    throw new Error(`Unsupported asset content type: ${contentType}`);
  }

  return normalized;
}

export function assertAllowedExtension(pathname: string) {
  const extension = pathname.split(".").pop()?.toLowerCase();
  if (!extension || !ALLOWED_EXTENSIONS.has(extension)) {
    throw new Error(`Unsupported asset extension: ${extension ?? "(none)"}.`);
  }
}

function serializeBlob(
  blob: HeadBlobResult | ListBlobResultBlob | PutBlobResult,
): RegistryAssetBlob {
  return {
    url: blob.url,
    downloadUrl: blob.downloadUrl,
    pathname: blob.pathname,
    size: "size" in blob ? blob.size : undefined,
    contentType: "contentType" in blob ? blob.contentType : undefined,
    uploadedAt:
      "uploadedAt" in blob && blob.uploadedAt
        ? blob.uploadedAt.toISOString()
        : undefined,
    etag: "etag" in blob ? blob.etag : undefined,
  };
}

function isBlobNotFound(error: unknown) {
  return (
    error instanceof BlobNotFoundError ||
    (error instanceof BlobError && /not found/i.test(error.message))
  );
}

export async function getRegistryAssetBlob(pathname: string) {
  if (!hasBlobStore()) return null;

  try {
    const blob = await head(normalizeAssetPathname(pathname));
    return serializeBlob(blob);
  } catch (error) {
    if (isBlobNotFound(error)) return null;
    throw error;
  }
}

export async function getRegistryAssetServingUrl(
  pathname: string,
  fallbackAsset?: AssetItem,
) {
  const blob = await getRegistryAssetBlob(pathname);
  if (blob) return blob.url;
  return fallbackAsset?.fallbackPath ?? null;
}

export async function listRegistryAssets({
  prefix,
  cursor,
  limit = 100,
}: {
  prefix?: string;
  cursor?: string;
  limit?: number;
}) {
  if (!hasBlobStore()) {
    return { blobs: [], hasMore: false, configured: false };
  }

  const result = await list({
    prefix: prefix ? normalizeAssetPrefix(prefix) : undefined,
    cursor,
    limit: Math.min(Math.max(limit, 1), 1000),
  });

  return {
    blobs: result.blobs.map(serializeBlob),
    cursor: result.cursor,
    hasMore: result.hasMore,
    configured: true,
  };
}

export async function uploadRegistryAsset({
  pathname,
  file,
  allowOverwrite = false,
}: UploadRegistryAssetInput) {
  if (!hasBlobStore()) {
    throw new Error(
      "Vercel Blob is not configured. Set BLOB_READ_WRITE_TOKEN before uploading registry assets.",
    );
  }

  const safePathname = normalizeAssetPathname(pathname);
  assertAllowedExtension(safePathname);
  const contentType = assertAllowedContentType(
    file.type || "application/octet-stream",
  );

  if (file.size > REGISTRY_ASSET_MAX_BYTES) {
    throw new Error(
      `Asset is too large. Max size is ${REGISTRY_ASSET_MAX_BYTES} bytes.`,
    );
  }

  const blob = await put(safePathname, file, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite,
    cacheControlMaxAge: DEFAULT_CACHE_MAX_AGE,
    contentType,
  });

  return serializeBlob(blob);
}

export async function deleteRegistryAsset(pathname: string, ifMatch?: string) {
  if (!hasBlobStore()) {
    throw new Error(
      "Vercel Blob is not configured. Set BLOB_READ_WRITE_TOKEN before deleting registry assets.",
    );
  }

  const safePathname = normalizeAssetPathname(pathname);
  await del(safePathname, ifMatch ? { ifMatch } : undefined);
  return { pathname: safePathname };
}
