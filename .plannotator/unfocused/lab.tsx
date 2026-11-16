// Preview lab for the shipped registry file, full viewport like the source page.
import { createRoot } from "react-dom/client";
import Unfocused from "../../src/registry/unfocused";

const host = document.getElementById("root");
if (host)
  createRoot(host).render(
    <div style={{ width: "100%", height: "100vh", background: "#000" }}>
      <Unfocused />
    </div>,
  );
