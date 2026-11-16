// Preview lab for the shipped registry file, full viewport like the source page.
import { createRoot } from "react-dom/client";
import HalftoneHands from "../../src/registry/halftone-hands";

const q = new URLSearchParams(location.search);
const theme = (q.get("theme") ?? "paper") as "paper";
const host = document.getElementById("root");
if (host)
  createRoot(host).render(
    <div style={{ width: "100%", height: "100vh" }}>
      <HalftoneHands theme={theme} />
    </div>,
  );
