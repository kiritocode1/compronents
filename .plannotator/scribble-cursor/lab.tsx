// Preview lab for the shipped registry file. Default: fixed canvas over the
// viewport with the source page's instance props, for the seeded comparison.
// `?embedded` runs the docs-demo setup (canvas bound to a 960x560 stage).
import { useRef } from "react";
import { createRoot } from "react-dom/client";
import ScribbleCursor from "../../src/registry/scribble-cursor";

function Embedded() {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div style={{ padding: 40, background: "#222", height: "100vh", boxSizing: "border-box" }}>
      <div ref={ref} style={{ position: "relative", width: 960, height: 560, overflow: "hidden", background: "#ededed" }}>
        <ScribbleCursor container={ref} />
      </div>
    </div>
  );
}

const embedded = new URLSearchParams(location.search).has("embedded");
const host = document.getElementById("root");
if (host)
  createRoot(host).render(
    embedded ? <Embedded /> : <ScribbleCursor color="rgb(61, 168, 255)" />,
  );
