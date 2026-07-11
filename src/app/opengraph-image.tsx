import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt =
  "Compronents. A quiet registry for careful interfaces for BLANK.";

const ghost = (
  offset: number,
  color: string,
  opacity: number,
): React.CSSProperties => ({
  position: "absolute",
  left: offset,
  top: offset,
  color,
  opacity,
});

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
      <div
        style={{
          display: "flex",
          fontSize: 104,
          fontWeight: 700,
          letterSpacing: -3,
          color: "#e6e6e6",
        }}
      >
        <span>COM</span>
        <span
          style={{
            position: "relative",
            display: "flex",
            margin: "0 6px",
          }}
        >
          <span style={ghost(14, "#2547d0", 0.7)}>PRO</span>
          <span style={ghost(7, "#f59e0b", 0.8)}>PRO</span>
          <span style={{ color: "#e6e6e6" }}>PRO</span>
        </span>
        <span>NENTS</span>
      </div>
      <div
        style={{
          marginTop: 36,
          fontSize: 40,
          color: "#8a8a8a",
        }}
      >
        A quiet registry for careful interfaces for BLANK.
      </div>
      <div
        style={{
          marginTop: 72,
          fontSize: 26,
          color: "#4a4a4a",
        }}
      >
        ui.aryank.space
      </div>
    </div>,
    size,
  );
}
