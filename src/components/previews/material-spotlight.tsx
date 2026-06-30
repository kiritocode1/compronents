"use client";

import MaterialSpotlight from "@/registry/material-spotlight";

const MODEL = "/assets/material-spotlight/model.glb";

/** Full-viewport preview of Material Spotlight. */
export default function Preview() {
  return (
    <div style={{ position: "relative", height: "100svh", width: "100%" }}>
      <MaterialSpotlight src={MODEL} />
    </div>
  );
}
