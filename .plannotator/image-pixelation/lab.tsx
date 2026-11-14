// Preview lab. `?source` loads the source photo from reference/ for the
// side-by-side diff; the default shows the proposed BLANK image.
import { createRoot } from "react-dom/client";
import ImagePixelation from "./image-pixelation";

const params = new URLSearchParams(location.search);
const src = params.has("source")
  ? "/reference/image-pixelation/10.next.avif"
  : "./media/beanie.jpg";

const host = document.getElementById("root");
if (host)
  createRoot(host).render(
    <div style={{ display: "flex", width: "100vw", height: "100vh", overflow: "hidden", background: "#000" }}>
      <div style={{ margin: "auto", width: "100%" }}>
        <ImagePixelation
          src={src}
          trigger={params.has("source") ? "click" : "inView"}
        />
      </div>
    </div>,
  );
