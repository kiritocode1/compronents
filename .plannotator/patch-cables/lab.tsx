// Preview lab, full viewport like the source page. Query flags:
// ?voice=pluck|bloop|acid|off, ?gen=wander,rain,selfpatch,lfo,seq, ?pal=0|1|2
import { useState } from "react";
import { createRoot } from "react-dom/client";
import PatchCables, {
  PATCH_CABLES_PALETTES,
  type PatchCablesGenerators,
  type PatchCablesVoice,
} from "./patch-cables";

const q = new URLSearchParams(location.search);
const voice = (q.get("voice") ?? "mist") as PatchCablesVoice;
const palette = PATCH_CABLES_PALETTES[Number(q.get("pal") ?? 0)];
const generators: Partial<PatchCablesGenerators> = {};
for (const g of (q.get("gen") ?? "").split(",").filter(Boolean))
  generators[g as keyof PatchCablesGenerators] = true;

// The audio diff switches voices the way the source's Sound buttons do.
function Lab() {
  const [v, setV] = useState(voice);
  (window as unknown as { __setVoice: (x: PatchCablesVoice) => void }).__setVoice = setV;
  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <PatchCables voice={v} palette={palette} generators={generators} />
    </div>
  );
}

const host = document.getElementById("root");
if (host) createRoot(host).render(<Lab />);
