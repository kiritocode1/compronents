// Lab for the neon sign scene. Lays the component out the way the source page
// does (full width, vertically centred in a 100vh black page).
//   ?original  the source model with its own sign texture
//   ?nonoise   no film noise (the source's `_config={"noiseOpacity":0}`)
import { createRoot } from "react-dom/client";
import XeroScene from "./xero-scene";

const params = new URLSearchParams(window.location.search);
const original = params.has("original");

function Lab() {
  return (
    <div
      style={{
        position: "fixed",
        display: "flex",
        height: "100vh",
        width: "100%",
        alignItems: "center",
      }}
    >
      <XeroScene
        modelSrc={
          original
            ? "/reference/xero-scene/xero.glb"
            : "/xero-scene/xero-blank.glb"
        }
        environmentSrc="/reference/xero-scene/potsdamer_platz_1k.hdr"
        sign={original ? "model" : "blank"}
        noiseOpacity={params.has("nonoise") ? 0 : 0.2}
      />
    </div>
  );
}

const root = document.getElementById("root");
if (root) createRoot(root).render(<Lab />);
