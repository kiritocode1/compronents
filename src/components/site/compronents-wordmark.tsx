"use client";

import { Calligraph } from "calligraph";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * The COMPRONENTS wordmark: COM / NENTS animate in through Calligraph. When
 * `mosaic` is set (the big homepage lockup), PRO is a yellow pixel grid whose
 * cells assemble left-to-right the first time it scrolls into view, then
 * idle-twinkle to scattered accent colors. In the header (`mosaic={false}`)
 * PRO is plain amber text so the animation only lives where it is showcased.
 */

// 7x8 bitmaps for the three letters (1 = filled cell).
const GLYPHS: Record<string, string[]> = {
  P: [
    "1111110",
    "1100011",
    "1100011",
    "1111110",
    "1100000",
    "1100000",
    "1100000",
    "1100000",
  ],
  R: [
    "1111110",
    "1100011",
    "1100011",
    "1111110",
    "1101100",
    "1100110",
    "1100011",
    "1100011",
  ],
  O: [
    "0111110",
    "1100011",
    "1100011",
    "1100011",
    "1100011",
    "1100011",
    "1100011",
    "0111110",
  ],
};

const COLS = 7;
const BASE = "#f4b400"; // amber / yellow
const FLASH = "#ffd766"; // brighter yellow (accent cells twinkle back to this)
const ACCENTS = ["#e8402a", "#2f6bff", "#c3f53b", "#141d3f"]; // red, blue, lime, navy

/** Deterministic 0..1 from an integer, stable across SSR and client. */
function rnd(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

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

  return (
    <span
      ref={ref}
      aria-hidden
      className={cn(
        "pro-mosaic mx-[0.1em] inline-block align-baseline",
        inView && "is-in",
      )}
    >
      {"PRO".split("").map((ch, li) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed 3-letter lockup
          key={li}
          className="inline-grid"
          style={{
            gridTemplateColumns: `repeat(${COLS}, 0.08em)`,
            gridAutoRows: "0.08em",
            gap: "0.015em",
            marginRight: li < 2 ? "0.11em" : undefined,
          }}
        >
          {GLYPHS[ch].flatMap((row, r) =>
            row.split("").map((bit, c) => {
              const key = `${r}-${c}`;
              if (bit !== "1") return <span key={key} />;
              const gi = li * 100 + r * COLS + c;
              const accent = ACCENTS[Math.floor(rnd(gi + 7) * ACCENTS.length)];
              const isAccentCell = rnd(gi) < 0.2;
              const colPos = li * (COLS + 1) + c; // left-to-right across the word
              const delay = colPos * 0.018 + rnd(gi + 3) * 0.05;
              const twinkle = 1.8 + rnd(gi + 11) * 1.8;
              return (
                <span
                  key={key}
                  className="pro-cell"
                  style={
                    {
                      "--pro-base": isAccentCell ? accent : BASE,
                      "--pro-flash": isAccentCell ? FLASH : accent,
                      "--pro-d": `${delay.toFixed(3)}s`,
                      "--pro-t": `${twinkle.toFixed(2)}s`,
                    } as CSSProperties
                  }
                />
              );
            }),
          )}
        </span>
      ))}
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
        "inline-block whitespace-nowrap font-semibold tracking-tight text-foreground",
        className,
      )}
    >
      <Calligraph as="span" initial>
        COM
      </Calligraph>
      {mosaic ? (
        <ProMosaic />
      ) : (
        <span className="mx-[0.04em] font-semibold text-amber-500">PRO</span>
      )}
      <Calligraph as="span" initial>
        NENTS
      </Calligraph>
    </span>
  );
}
