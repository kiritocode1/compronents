// BLANK — aryank.space
// Default content for the colourist reel page. Media paths are relative to
// the component's `assetBase`. Clips and stills are cut from the BLANK Blob
// library: template footage, our own loops, and one CC0 sample (Red Bud).

export type ProjectType = "commercial" | "music" | "narrative";

export interface ColouristCredit {
  role: string;
  title: string;
  link?: string;
}

export interface ColouristProject {
  slug: string;
  client: string;
  title: string;
  type: ProjectType;
  year: string;
  /** Swatch shown beside the centred row of the list carousel. */
  tileColor?: string;
  /** Looping clip shown in the player and on grid hover. */
  video: string;
  /** Still shown on the grid card and as the video poster. */
  poster: string;
  gallery: string[];
  /** Gallery image height as a percentage of width: "56.25" for 16:9, "75" for 4:3. */
  galleryRatio?: string;
  credits: ColouristCredit[];
}

export interface ColouristSite {
  name: string;
  email: string;
  instagramUrl: string;
  instagramHandle: string;
  location: string;
  timezone: string;
  /** Role word that takes the cursor hue on the home title. */
  role: string;
  titleSuffix: string;
  subTitle: string;
  /** Info screen paragraphs; blank lines become line breaks. */
  description: string;
  featuredLogos: string[];
  showreel: { video: string; poster: string };
  builtBy: { label: string; href: string };
}

export const DEFAULT_SITE: ColouristSite = {
  name: "BLANK",
  email: "hello@aryank.space",
  instagramUrl: "https://www.instagram.com/aryankspace",
  instagramHandle: "@aryankspace",
  location: "India",
  timezone: "Asia/Kolkata",
  role: "Colourist",
  titleSuffix: "grading music videos and short films.",
  subTitle:
    "Skin that still reads as skin, and night scenes that stay dark without losing the faces in them.",
  description:
    "Booking sessions in person and remote.\n\nSend the locked edit with the camera originals, and say which scene worries you most.",
  featuredLogos: [],
  showreel: { video: "reel.mp4", poster: "reel.jpg" },
  builtBy: { label: "aryank.space", href: "https://aryank.space" },
};

const clip = (name: string, still = 1) => ({
  video: `cut-${name}.mp4`,
  poster: `cut-${name}-${still}.jpg`,
});

const stills = (...names: string[]) =>
  names.flatMap((name) => [1, 2, 3].map((i) => `cut-${name}-${i}.jpg`));

const credits = (footage: string): ColouristCredit[] => [
  { role: "Colour", title: "BLANK" },
  { role: "Footage", title: footage },
];

export const DEFAULT_PROJECTS: ColouristProject[] = [
  {
    slug: "orange-room",
    client: "BLANK Studio",
    title: "Orange Room",
    type: "commercial",
    year: "2026",
    tileColor: "#e0761f",
    ...clip("orange", 1),
    gallery: stills("orange", "knit"),
    credits: credits("BLANK library"),
  },
  {
    slug: "violet-hands",
    client: "BLANK Records",
    title: "Violet Hands",
    type: "music",
    year: "2026",
    tileColor: "#a63ad8",
    ...clip("violet", 2),
    gallery: stills("violet", "haze"),
    credits: credits("BLANK library"),
  },
  {
    slug: "helmet",
    client: "BLANK Films",
    title: "Helmet",
    type: "narrative",
    year: "2025",
    tileColor: "#2f8a96",
    ...clip("helmet", 2),
    gallery: stills("helmet", "haze"),
    galleryRatio: "75",
    credits: credits("BLANK library"),
  },
  {
    slug: "shoot-day",
    client: "BLANK Studio",
    title: "Shoot Day",
    type: "commercial",
    year: "2025",
    tileColor: "#6f8fa6",
    ...clip("shoot", 1),
    gallery: stills("shoot", "backstage"),
    credits: credits("BLANK library"),
  },
  {
    slug: "night-range",
    client: "BLANK Films",
    title: "Night Range",
    type: "narrative",
    year: "2025",
    tileColor: "#1f5e3a",
    ...clip("range", 1),
    gallery: stills("range", "dusk"),
    credits: credits("BLANK library"),
  },
  {
    slug: "red-bud",
    client: "BLANK Studio",
    title: "Red Bud",
    type: "commercial",
    year: "2025",
    tileColor: "#d8402a",
    ...clip("bloom", 1),
    gallery: stills("bloom"),
    credits: credits("CC0"),
  },
  {
    slug: "sea-surface",
    client: "BLANK Records",
    title: "Sea Surface",
    type: "music",
    year: "2024",
    tileColor: "#1f6b5c",
    ...clip("ocean", 1),
    gallery: stills("ocean"),
    credits: credits("BLANK library"),
  },
  {
    slug: "yellow-knit",
    client: "BLANK Studio",
    title: "Yellow Knit",
    type: "commercial",
    year: "2024",
    tileColor: "#d9b42a",
    ...clip("knit", 2),
    gallery: stills("knit", "orange"),
    credits: credits("BLANK library"),
  },
  {
    slug: "haze",
    client: "BLANK Films",
    title: "Haze",
    type: "narrative",
    year: "2024",
    tileColor: "#b9824a",
    ...clip("haze", 2),
    gallery: stills("haze"),
    credits: credits("BLANK library"),
  },
  {
    slug: "ball-corridor",
    client: "BLANK Records",
    title: "Ball Corridor",
    type: "music",
    year: "2024",
    tileColor: "#8fb8a0",
    ...clip("corridor", 1),
    gallery: stills("corridor", "range"),
    credits: credits("BLANK library"),
  },
  {
    slug: "foil",
    client: "BLANK Records",
    title: "Foil",
    type: "music",
    year: "2023",
    tileColor: "#5d6f96",
    ...clip("foil", 1),
    gallery: stills("foil"),
    galleryRatio: "75",
    credits: credits("BLANK library"),
  },
  {
    slug: "blue-sculpture",
    client: "BLANK Studio",
    title: "Blue Sculpture",
    type: "commercial",
    year: "2023",
    tileColor: "#2f55d4",
    ...clip("gallery", 2),
    gallery: stills("gallery"),
    credits: credits("BLANK library"),
  },
  {
    slug: "dusk-fairway",
    client: "BLANK Films",
    title: "Dusk Fairway",
    type: "narrative",
    year: "2023",
    tileColor: "#d29a7a",
    ...clip("dusk", 2),
    gallery: stills("dusk"),
    credits: credits("BLANK library"),
  },
  {
    slug: "backstage",
    client: "BLANK Studio",
    title: "Backstage",
    type: "commercial",
    year: "2022",
    tileColor: "#3d4f63",
    ...clip("backstage", 3),
    gallery: stills("backstage"),
    credits: credits("BLANK library"),
  },
  {
    slug: "after-the-talk",
    client: "BLANK Films",
    title: "After the Talk",
    type: "narrative",
    year: "2022",
    tileColor: "#4a6fa5",
    ...clip("talk", 2),
    gallery: stills("talk"),
    credits: credits("BLANK library"),
  },
  {
    slug: "proof-sheet",
    client: "BLANK Studio",
    title: "Proof Sheet",
    type: "commercial",
    year: "2022",
    tileColor: "#6a77cc",
    ...clip("print", 1),
    gallery: stills("print"),
    credits: credits("BLANK library"),
  },
  {
    slug: "ridge",
    client: "BLANK Records",
    title: "Ridge",
    type: "music",
    year: "2021",
    tileColor: "#8c8c8c",
    ...clip("ridge", 1),
    gallery: stills("ridge"),
    credits: credits("BLANK library"),
  },
  {
    slug: "paper-floor",
    client: "BLANK Films",
    title: "Paper Floor",
    type: "narrative",
    year: "2021",
    tileColor: "#8a3b22",
    ...clip("studio", 3),
    gallery: stills("studio"),
    credits: credits("BLANK library"),
  },
  {
    slug: "two-sheep",
    client: "BLANK Studio",
    title: "Two Sheep",
    type: "commercial",
    year: "2020",
    tileColor: "#c9b994",
    ...clip("flock", 2),
    gallery: [],
    credits: credits("BLANK library"),
  },
];
