"use client";

import { type CSSProperties, useEffect, useState } from "react";

const SOURCE_URL = "https://ui.aryank.space/assets/type-garden/core.html";

export interface TypeGardenProps {
  /** The scene fills its parent. Give the parent an explicit height. */
  className?: string;
  style?: CSSProperties;
  title?: string;
}

/** The original type-to-grow scene, without the source site's editor and export controls. */
export default function TypeGarden({
  className,
  style,
  title = "Type Garden",
}: TypeGardenProps) {
  const [document, setDocument] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(SOURCE_URL, { signal: controller.signal })
      .then((response) => {
        if (!response.ok)
          throw new Error(`Type Garden asset returned ${response.status}`);
        return response.text();
      })
      .then(setDocument)
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          console.error("Could not load Type Garden", reason);
          setError(true);
        }
      });
    return () => controller.abort();
  }, []);

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "#000",
        ...style,
      }}
    >
      {document ? (
        <iframe
          title={title}
          srcDoc={document}
          sandbox="allow-scripts"
          style={{ display: "block", width: "100%", height: "100%", border: 0 }}
        />
      ) : error ? (
        <p role="alert" style={{ color: "#fff", padding: 16 }}>
          Type Garden could not load.
        </p>
      ) : null}
    </div>
  );
}
