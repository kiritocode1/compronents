import { BLOB_PUBLIC_ORIGIN } from "@/lib/assets";

const HTML_CACHE = "public, max-age=60, stale-while-revalidate=300";
const ASSET_CACHE = "public, max-age=31536000, immutable";

function hasExtension(pathname: string) {
  return /\.[a-zA-Z0-9]+$/.test(pathname);
}

function contentTypeFor(pathname: string, fallback: string | null) {
  if (fallback) return fallback;

  const extension = pathname.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "css":
      return "text/css; charset=utf-8";
    case "js":
    case "mjs":
      return "text/javascript; charset=utf-8";
    case "json":
      return "application/json; charset=utf-8";
    case "svg":
      return "image/svg+xml";
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "ico":
      return "image/x-icon";
    case "mp4":
      return "video/mp4";
    case "mp3":
      return "audio/mpeg";
    case "otf":
      return "font/otf";
    case "ttf":
      return "font/ttf";
    case "woff":
      return "font/woff";
    case "woff2":
      return "font/woff2";
    default:
      return "application/octet-stream";
  }
}

function csp() {
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${BLOB_PUBLIC_ORIGIN}`,
    `style-src 'self' 'unsafe-inline' ${BLOB_PUBLIC_ORIGIN}`,
    `img-src 'self' data: blob: ${BLOB_PUBLIC_ORIGIN}`,
    `media-src 'self' blob: ${BLOB_PUBLIC_ORIGIN}`,
    `font-src 'self' data: ${BLOB_PUBLIC_ORIGIN}`,
    `connect-src 'self' ${BLOB_PUBLIC_ORIGIN}`,
  ].join("; ");
}

function safeParts(parts: string[]) {
  const value = parts.join("/");
  if (
    value.includes("..") ||
    value.includes("//") ||
    !/^[a-zA-Z0-9][a-zA-Z0-9/_+.-]*[a-zA-Z0-9]?$/.test(value)
  ) {
    return null;
  }

  return value;
}

export async function staticTemplateResponse({
  slug,
  pathname,
}: {
  slug: string;
  pathname?: string[];
}) {
  const suffix = pathname?.length ? safeParts(pathname) : "";
  if (suffix === null) {
    return Response.json({ error: "Invalid template path." }, { status: 400 });
  }

  const blobPath = suffix ? `${slug}/${suffix}` : slug;
  const candidates = hasExtension(blobPath)
    ? [blobPath]
    : [blobPath, `${blobPath}.html`, `${blobPath}/index.html`];

  let upstream: globalThis.Response | null = null;
  let resolvedPath = candidates[0];

  for (const candidate of candidates) {
    const response = await fetch(`${BLOB_PUBLIC_ORIGIN}/${candidate}`, {
      cache: "force-cache",
    });

    if (response.ok) {
      upstream = response;
      resolvedPath = candidate;
      break;
    }
  }

  if (!upstream) {
    return Response.json(
      { error: "Template asset not found." },
      { status: 404 },
    );
  }

  const contentType = contentTypeFor(
    resolvedPath,
    upstream.headers.get("content-type"),
  );
  const isHtml = contentType.includes("text/html");

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Cache-Control": isHtml ? HTML_CACHE : ASSET_CACHE,
      "Content-Disposition": "inline",
      "Content-Security-Policy": isHtml ? csp() : "default-src 'self'",
      "Content-Type": contentType,
    },
  });
}
