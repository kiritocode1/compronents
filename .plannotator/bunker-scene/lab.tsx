// Lab for bunker-scene. Lays the component out the way the source page does
// (full width, vertically centred in a 100vh black page).
//   ?original  the source's Draco GLB with its own B U N K E R letters
//   ?nonoise   no film noise (the source's `_config={"noise":false}`)
//   ?still     particles hold their t=0 noise offset (`"uParticleVelocity":0`)
import { createRoot } from "react-dom/client";
import BunkerScene from "./bunker-scene";

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
      <BunkerScene
        modelSrc={
          original
            ? "/reference/bunker-scene/bunker.glb"
            : "/bunker-scene/bunker-blank.glb"
        }
        dracoDecoderPath={
          original
            ? "https://www.gstatic.com/draco/versioned/decoders/1.5.5/"
            : undefined
        }
        sign={original ? "model" : "blank"}
        noiseOpacity={params.has("nonoise") ? 0 : 0.75}
        particleSpeed={params.has("still") ? 0 : 0.1}
      />
    </div>
  );
}

const root = document.getElementById("root");
if (root) createRoot(root).render(<Lab />);
