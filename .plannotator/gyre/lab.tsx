// Port lab: the Gyre in an 820x560 box at the page origin, matching the
// source studio's default frame. ?appearance=light|dark. The engine handle is
// on window.__gyre for the diff script.
import { createRoot } from "react-dom/client";
import Gyre, { type GyreAppearance, type GyreHandle } from "./gyre";

const q = new URLSearchParams(location.search);
const appearance = (q.get("appearance") ?? "dark") as GyreAppearance;
const w = Number(q.get("w") ?? 820);
const h = Number(q.get("h") ?? 560);

const host = document.getElementById("root");
if (host)
  createRoot(host).render(
    <div style={{ width: w, height: h }}>
      <Gyre
        appearance={appearance}
        fontUrl="/gyre/source/Unbounded-900.woff"
        onReady={(g: GyreHandle) => {
          (window as unknown as { __gyre: GyreHandle }).__gyre = g;
        }}
      />
    </div>,
  );
