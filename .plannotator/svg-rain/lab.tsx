// Preview lab. Default: the proposed BLANK glyphs. `?original` loads the
// source's glyphs.glb and rows from reference/ for like-for-like comparison.
import { createRoot } from "react-dom/client";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import GlyphRain, { type GlyphSet } from "./glyph-rain";

const SOURCE_ROWS = [
  ["R00", "?", "S", "4", "F01", "R01", "N01", "4"],
  ["B01", "4", "S", "#", "M", "U01", "N01", "Q"],
  ["B01", "A", "H", "R01", "M", "E", "H", "T"],
  ["B01", "Q", "S", "M", "#", "E", "N01", "T"],
  ["U00", "A", "S", "U00", "Y", "E", "R01", "?"],
  ["F00", "A", "U01", "E", "F01", "E", "N01", "T"],
  ["K", "G", "#", "E", "M", "E", "N01", "T"],
  ["B01", "A", "S", "Q", "M", "Y", "N01", "T"],
  ["B01", "A", "S", "E", "M", "E", "N00", "T"],
].reverse();

const loadOriginal = async (): Promise<GlyphSet> => {
  const gltf = await new GLTFLoader().loadAsync("/reference/svg-rain/glyphs.glb");
  const set: GlyphSet = new Map();
  gltf.scene.traverse((o) => {
    if (o instanceof THREE.Mesh) set.set(o.name, o.geometry);
  });
  return set;
};

const original = new URLSearchParams(location.search).has("original");
const host = document.getElementById("root");
if (host)
  createRoot(host).render(
    <div style={{ position: "fixed", display: "flex", height: "100vh", width: "100%", alignItems: "center" }}>
      {original ? (
        <GlyphRain rows={SOURCE_ROWS} loadGlyphs={loadOriginal} />
      ) : (
        <GlyphRain markUrl="./blank-mark.svg" />
      )}
    </div>,
  );
