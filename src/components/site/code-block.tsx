import { CopyButton } from "@/components/site/copy-button";
import { StreamerVeil } from "@/components/site/streamer-veil";

/**
 * Renders Shiki-highlighted HTML in a bordered surface with a copy button.
 * Server component — `html` is produced by the Shiki helper.
 */
export function CodeBlock({
  html,
  raw,
  filename,
}: {
  html: string;
  raw: string;
  filename?: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border bg-surface">
      {filename ? (
        <div className="flex items-center justify-between border-b px-4 py-2">
          <span className="text-xs tracking-wide text-muted-foreground">
            {filename}
          </span>
          <CopyButton value={raw} />
        </div>
      ) : null}
      <div className="relative">
        {filename ? null : (
          <CopyButton value={raw} className="absolute top-2 right-2 z-10" />
        )}
        <StreamerVeil
          className="p-4 [&_pre]:break-words [&_pre]:whitespace-pre-wrap"
          html={html}
        />
      </div>
    </div>
  );
}
