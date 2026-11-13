import type { FontData } from "three/addons/loaders/FontLoader.js";
import font from "../vendor/helvetiker_bold.typeface.json";
import { mountExtrudeType } from "./extrude-type";

const TITLE = "Attention Is All You Need";
const BODY =
  "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks in an encoder-decoder configuration. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train. Our model achieves 28.4 BLEU on the WMT 2014 English-to-German translation task, improving over the existing best results, including ensembles by over 2 BLEU. On the WMT 2014 English-to-French translation task, our model establishes a new single-model state-of-the-art BLEU score of 41.8 after training for 3.5 days on eight GPUs, a small fraction of the training costs of the best models from the literature. We show that the Transformer generalizes well to other tasks by applying it successfully to English constituency parsing both with large and limited training data.";

const params = new URLSearchParams(location.search);
const stage = document.getElementById("stage") as HTMLElement;
mountExtrudeType(stage, {
  title: TITLE,
  body: BODY,
  font: font as unknown as FontData,
  intro: params.get("intro") !== "0",
  // Lab-only tuning: any numeric or colour option can be overridden from the query string.
  ...Object.fromEntries(
    ["keyIntensity", "fillIntensity", "falloff", "elevation", "spread", "peak", "radius", "depth", "glow", "soften"]
      .filter((k) => params.has(k))
      .map((k) => [k, Number(params.get(k))]),
  ),
  ...Object.fromEntries(
    ["keyColor", "fillColor", "marble"].filter((k) => params.has(k)).map((k) => [k, `#${params.get(k)}`]),
  ),
});
