// Preview lab: the port at full viewport, fed the source page's own asset
// URLs so it can be compared with phonestackcarousel.framer.website before
// anything is uploaded to Blob.
import { createRoot } from "react-dom/client";
import PhoneStackCarousel, {
  type PhoneStackSlide,
} from "./phone-stack-carousel";

const F = "https://framerusercontent.com";
const SOURCE_SLIDES: PhoneStackSlide[] = [
  { image: `${F}/images/hKcEsn0JC6BzFmP1LFaJXM9OQnI.jpg?width=736&height=958`, title: "Chrome Study" },
  { image: `${F}/images/KbhZ8TSifLt6oom0DJy3I6dtRk.png?width=800&height=1200`, title: "Soft Ritual" },
  { video: `${F}/assets/evzABRU4WEqu8p0fD9C5sDiGY9s.mp4`, title: "Lattice" },
  { image: `${F}/images/N1JlQm7o4uyWW9iqV5Rz9BMeA.jpg?width=736&height=919`, title: "Glass Edge" },
  { image: `${F}/images/FnA0lOktORlmJAnlNebTalpe6ZM.png?width=1796&height=2400`, title: "Plume" },
  { video: `${F}/assets/NN6Lx6k4t7M9vGURDbnyq40sQ.mp4`, title: "Quiet Form" },
  { image: `${F}/images/amKQGUjyxH3cwRmcKcFl6ClvObQ.jpg?width=1200&height=1600`, title: "Night Grain" },
  { video: `${F}/assets/roSTU06jbgGlsYXGIPH26maBtQQ.mp4`, title: "" },
];

const params = new URLSearchParams(location.search);
const host = document.getElementById("root");
if (host)
  createRoot(host).render(
    <PhoneStackCarousel
      items={params.has("blob") ? undefined : SOURCE_SLIDES}
    />,
  );
