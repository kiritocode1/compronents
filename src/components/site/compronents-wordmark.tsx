"use client";

import { Calligraph } from "calligraph";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import {
  PRO_COLS,
  PRO_LETTERS,
  proLetterCells,
  proRnd,
} from "@/lib/pro-mosaic";
import { cn } from "@/lib/utils";

/**
 * The COMPRONENTS wordmark: COM / NENTS animate in through Calligraph. When
 * `mosaic` is set (the big homepage lockup), PRO is a yellow pixel grid whose
 * cells assemble left-to-right the first time it scrolls into view, then
 * idle-twinkle to scattered accent colors. In the header (`mosaic={false}`)
 * PRO is plain amber text so the animation only lives where it is showcased.
 */

function ProMosaic() {
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 8 rows of cells sized to match capital letter height (~0.72em).
  const cell = "0.078em";
  const gap = "0.014em";

  return (
    <span
      ref={ref}
      aria-hidden
      className={cn(
        "pro-mosaic mx-[0.08em] inline-flex shrink-0 items-center",
        inView && "is-in",
      )}
      style={{ gap: "0.1em", height: "0.72em" }}
    >
      {PRO_LETTERS.map((ch, li) => {
        const cells = proLetterCells(ch, li);
        const filled = new Map(
          cells.map((data) => [`${data.r}-${data.c}`, data]),
        );
        return (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed 3-letter lockup
            key={li}
            className="grid shrink-0"
            style={{
              gridTemplateColumns: `repeat(${PRO_COLS}, ${cell})`,
              gridAutoRows: cell,
              gap,
            }}
          >
            {Array.from({ length: 8 * PRO_COLS }, (_, i) => {
              const r = Math.floor(i / PRO_COLS);
              const c = i % PRO_COLS;
              const key = `${r}-${c}`;
              const data = filled.get(key);
              if (!data) return <span key={key} />;
              const delay = data.colPos * 0.018 + proRnd(data.gi + 3) * 0.05;
              const twinkle = 1.8 + proRnd(data.gi + 11) * 1.8;
              return (
                <span
                  key={key}
                  className="pro-cell"
                  style={
                    {
                      "--pro-base": data.color,
                      "--pro-flash": data.flash,
                      "--pro-d": `${delay.toFixed(3)}s`,
                      "--pro-t": `${twinkle.toFixed(2)}s`,
                    } as CSSProperties
                  }
                />
              );
            })}
          </span>
        );
      })}
    </span>
  );
}

export function CompronentsWordmark({
  className,
  mosaic = true,
}: {
  className?: string;
  mosaic?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex flex-nowrap items-center whitespace-nowrap font-semibold tracking-tight text-foreground",
        className,
      )}
    >
      <Calligraph as="span" initial>
        COM
      </Calligraph>
      {mosaic ? (
        <ProMosaic />
      ) : (
        <span className="mx-[0.04em] shrink-0 font-semibold text-amber-500">
          PRO
        </span>
      )}
      <Calligraph as="span" initial>
        NENTS
      </Calligraph>
    </span>
  );
}
