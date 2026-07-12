import { ImageResponse } from "next/og";
import {
  PRO_COLS,
  PRO_LETTERS,
  PRO_ROWS,
  proLetterCells,
} from "@/lib/pro-mosaic";

/** Standard Open Graph card. Visual design matches the homepage 1:1 (static). */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt =
  "Compronents. A quiet registry for careful interfaces for BLANK.";

const CELL = 9;
const GAP = 2;
const LETTER_GAP = 12;

function StaticProMosaic() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: LETTER_GAP,
        marginLeft: 10,
        marginRight: 10,
      }}
    >
      {PRO_LETTERS.map((ch, li) => {
        const filled = new Map(
          proLetterCells(ch, li).map((cell) => [`${cell.r}-${cell.c}`, cell]),
        );
        return (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed 3-letter lockup
            key={li}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: GAP,
            }}
          >
            {Array.from({ length: PRO_ROWS }, (_, r) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed grid
                key={r}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: GAP,
                }}
              >
                {Array.from({ length: PRO_COLS }, (_, c) => {
                  const cell = filled.get(`${r}-${c}`);
                  return (
                    <div
                      // biome-ignore lint/suspicious/noArrayIndexKey: fixed grid
                      key={c}
                      style={{
                        width: CELL,
                        height: CELL,
                        borderRadius: 1,
                        backgroundColor: cell ? cell.color : "transparent",
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

/** BLANK mark: white tile, black AK monogram (matches BlankIcon). */
function BlankMark({ sizePx }: { sizePx: number }) {
  return (
    <svg
      width={sizePx}
      height={sizePx}
      viewBox="0 0 120 120"
      fill="none"
      style={{ display: "flex" }}
    >
      <rect width="120" height="120" fill="white" />
      <path
        d="M49.6591 101H45.2273L58.0455 66.0909H62.4091L75.2273 101H70.7955L60.3636 71.6136H60.0909L49.6591 101ZM51.2955 87.3636H69.1591V91.1136H51.2955V87.3636ZM80.6648 101V66.0909H84.892V83.4091H85.3011L100.983 66.0909H106.506L91.8466 81.8409L106.506 101H101.392L89.2557 84.7727L84.892 89.6818V101H80.6648Z"
        fill="black"
      />
    </svg>
  );
}

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        backgroundColor: "#000000",
        padding: 96,
      }}
    >
      {/* COMPRONENTS: COM + static pixel PRO + NENTS */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          fontSize: 96,
          fontWeight: 600,
          letterSpacing: -2.5,
          color: "#e6e6e6",
        }}
      >
        <span>COM</span>
        <StaticProMosaic />
        <span>NENTS</span>
      </div>

      {/* Tagline with Blank logo, matches homepage heading */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          marginTop: 40,
          fontSize: 36,
          fontWeight: 500,
          color: "#e6e6e6",
          gap: 12,
        }}
      >
        <span>A quiet registry for careful interfaces for</span>
        <BlankMark sizePx={34} />
        <span>BLANK.</span>
      </div>

      <div
        style={{
          display: "flex",
          marginTop: 64,
          fontSize: 26,
          color: "#5a5a5a",
        }}
      >
        ui.aryank.space
      </div>
    </div>,
    size,
  );
}
