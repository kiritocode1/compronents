// @ts-nocheck
// biome-ignore-all lint: source-authored GSAP template port.

"use client";

import Accordion from "../components/Accordion/Accordion";
import AnimeText from "../components/AnimeText/AnimeText";
import Footer from "../components/Footer/Footer";
import Spiral from "../components/Spiral/Spiral";
import Team from "../components/Team/Team";
import { useAsset } from "../runtime";

// intro copy for scroll-driven word reveal
const PARAGRAPHS = [
  "Deadlock Studios is a design-led game studio that operates at the edge of comfort. We make experiences for people who want to be unsettled, challenged, and held in place by worlds that feel more real than they should.",
  "We work at the intersection of systems design and psychological tension. Every project ships only when the player feels watched from the first frame and never fully shakes it after the last.",
];

const KEYWORDS = [];
const KEYWORD_COLORS = {};

// spiral gallery image paths
const SPIRAL_IMAGE_PATHS = Array.from(
  { length: 19 },
  (_, i) => `/spiral/spiral-${i + 1}.jpg`,
);

// studio page - spiral hero, manifesto text, pillars, team, footer
const Studio = () => {
  const asset = useAsset();
  const SPIRAL_IMAGES = SPIRAL_IMAGE_PATHS.map(asset);
  return (
    <>
      <Spiral
        images={SPIRAL_IMAGES}
        heading="We exist in the space where control breaks down and something else takes over"
      />

      <AnimeText
        paragraphs={PARAGRAPHS}
        keywords={KEYWORDS}
        keywordColors={KEYWORD_COLORS}
        highlightBg="60, 60, 60"
        pinDuration={4}
      />

      <Accordion />

      <Team />

      <Footer />
    </>
  );
};

export default Studio;
