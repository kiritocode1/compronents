"use client";

/**
 * Archive Commerce Page - source-backed Format Archive commerce template.
 *
 * A faithful React port of the Next.js Format Archive site: the full routed
 * experience (home, catalogue, product detail, archive, editorial, article
 * detail, info) with its counter preloader, clip-path menu overlay, cart
 * drawer with local persistence, hover-trail archive previews, staggered
 * catalogue reveals, SplitType line reveals, Lenis smooth scroll, and a
 * self-contained clip-path page transition replacing the source's
 * next-view-transitions choreography. Imagery is served from the Compronents
 * asset host.
 */

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import CustomEase from "gsap/CustomEase";
import Lenis from "lenis";
import type * as React from "react";
import {
  type CSSProperties,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import SplitType from "split-type";
import { getArchiveCommercePageStyles } from "./styles";

gsap.registerPlugin(useGSAP, CustomEase);
CustomEase.create("acpHop", ".15, 1, .25, 1");
CustomEase.create("acpHop2", ".9, 0, .1, 1");
CustomEase.create("acpSlide", ".87, 0, .13, 1");

const DEFAULT_ASSET_BASE =
  "https://ui.aryank.space/assets/archive-commerce-page";
const TRANSITION_DURATION = 1.2;

const ASSET_CONTEXT = createContext(DEFAULT_ASSET_BASE);

function useAsset() {
  const base = useContext(ASSET_CONTEXT);
  return useCallback(
    (path: string) => `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`,
    [base],
  );
}

/* -------------------------------------------------------------------- data */

interface Product {
  id: string;
  category: string;
  name: string;
  description: { bodyCopy1: string; bodyCopy2: string };
  designer: string;
  price: number;
  date: string;
  fileType: string;
  previewImg: string;
  productImages: string[];
  compatibility: string;
}

const PRODUCTS: Product[] = [
  {
    id: "001",
    category: "graphic element",
    name: "Mirror Orb Mockup",
    description: {
      bodyCopy1:
        "Mirror Orb Mockup is a high-fidelity digital asset designed to enhance your creative presentations and visuals.",
      bodyCopy2:
        "Crafted with modern aesthetics, it's ideal for branding, portfolio showcases, and product campaigns.",
    },
    designer: "Studio Moderno",
    price: 12,
    date: "2025-04-06",
    fileType: "PSD",
    previewImg: "product_001.jpeg",
    productImages: ["product_001.jpeg", "product_002.jpeg", "product_003.jpeg"],
    compatibility: "Photoshop",
  },
  {
    id: "002",
    category: "mockup",
    name: "Earbud Ad Mockup",
    description: {
      bodyCopy1:
        "Earbud Ad Mockup is a high-fidelity digital asset designed to enhance your creative presentations and visuals.",
      bodyCopy2:
        "Crafted with modern aesthetics, it's ideal for branding, portfolio showcases, and product campaigns.",
    },
    designer: "AudioHaus",
    price: 30,
    date: "2025-04-07",
    fileType: "PNG",
    previewImg: "product_002.jpeg",
    productImages: ["product_002.jpeg", "product_003.jpeg", "product_004.jpeg"],
    compatibility: "Figma",
  },
  {
    id: "003",
    category: "mockup",
    name: "Minimal Phone Mockup",
    description: {
      bodyCopy1:
        "Minimal Phone Mockup is a high-fidelity digital asset designed to enhance your creative presentations and visuals.",
      bodyCopy2:
        "Crafted with modern aesthetics, it's ideal for branding, portfolio showcases, and product campaigns.",
    },
    designer: "Form Labs",
    price: 10,
    date: "2025-04-08",
    fileType: "PSD",
    previewImg: "product_003.jpeg",
    productImages: ["product_003.jpeg", "product_004.jpeg", "product_005.jpeg"],
    compatibility: "Photoshop",
  },
  {
    id: "004",
    category: "graphic element",
    name: "Hanging Lamp Element",
    description: {
      bodyCopy1:
        "Hanging Lamp Element is a high-fidelity digital asset designed to enhance your creative presentations and visuals.",
      bodyCopy2:
        "Crafted with modern aesthetics, it's ideal for branding, portfolio showcases, and product campaigns.",
    },
    designer: "Lumen Design",
    price: 5,
    date: "2025-04-09",
    fileType: "SVG",
    previewImg: "product_004.jpeg",
    productImages: ["product_004.jpeg", "product_005.jpeg", "product_006.jpeg"],
    compatibility: "Figma",
  },
  {
    id: "005",
    category: "mockup",
    name: "Keyboard Top View",
    description: {
      bodyCopy1:
        "Keyboard Top View is a high-fidelity digital asset designed to enhance your creative presentations and visuals.",
      bodyCopy2:
        "Crafted with modern aesthetics, it's ideal for branding, portfolio showcases, and product campaigns.",
    },
    designer: "Keystroke Studio",
    price: 15,
    date: "2025-04-10",
    fileType: "PSD",
    previewImg: "product_005.jpeg",
    productImages: ["product_005.jpeg", "product_006.jpeg", "product_007.jpeg"],
    compatibility: "Photoshop",
  },
  {
    id: "006",
    category: "graphic element",
    name: "Eye Slice Overlay",
    description: {
      bodyCopy1:
        "Eye Slice Overlay is a high-fidelity digital asset designed to enhance your creative presentations and visuals.",
      bodyCopy2:
        "Crafted with modern aesthetics, it's ideal for branding, portfolio showcases, and product campaigns.",
    },
    designer: "Visage Lab",
    price: 20,
    date: "2025-04-11",
    fileType: "PNG",
    previewImg: "product_006.jpeg",
    productImages: ["product_006.jpeg", "product_007.jpeg", "product_008.jpeg"],
    compatibility: "Figma",
  },
  {
    id: "007",
    category: "mockup",
    name: "Audio Mixer Interface",
    description: {
      bodyCopy1:
        "Audio Mixer Interface is a high-fidelity digital asset designed to enhance your creative presentations and visuals.",
      bodyCopy2:
        "Crafted with modern aesthetics, it's ideal for branding, portfolio showcases, and product campaigns.",
    },
    designer: "Sonic Grid",
    price: 10,
    date: "2025-04-12",
    fileType: "PSD",
    previewImg: "product_007.jpeg",
    productImages: ["product_007.jpeg", "product_008.jpeg", "product_009.jpeg"],
    compatibility: "Sketch",
  },
  {
    id: "008",
    category: "mockup",
    name: "Futuristic Speaker Render",
    description: {
      bodyCopy1:
        "Futuristic Speaker Render is a high-fidelity digital asset designed to enhance your creative presentations and visuals.",
      bodyCopy2:
        "Crafted with modern aesthetics, it's ideal for branding, portfolio showcases, and product campaigns.",
    },
    designer: "Echo Form",
    price: 25,
    date: "2025-04-13",
    fileType: "PNG",
    previewImg: "product_008.jpeg",
    productImages: ["product_008.jpeg", "product_009.jpeg", "product_010.jpeg"],
    compatibility: "Photoshop",
  },
  {
    id: "009",
    category: "mockup",
    name: "Gamepad Closeup",
    description: {
      bodyCopy1:
        "Gamepad Closeup is a high-fidelity digital asset designed to enhance your creative presentations and visuals.",
      bodyCopy2:
        "Crafted with modern aesthetics, it's ideal for branding, portfolio showcases, and product campaigns.",
    },
    designer: "Grip Creative",
    price: 50,
    date: "2025-04-14",
    fileType: "PNG",
    previewImg: "product_009.jpeg",
    productImages: ["product_009.jpeg", "product_010.jpeg", "product_011.jpeg"],
    compatibility: "Figma",
  },
  {
    id: "010",
    category: "motion",
    name: "3D Robot Render",
    description: {
      bodyCopy1:
        "3D Robot Render is a high-fidelity digital asset designed to enhance your creative presentations and visuals.",
      bodyCopy2:
        "Crafted with modern aesthetics, it's ideal for branding, portfolio showcases, and product campaigns.",
    },
    designer: "Future Constructs",
    price: 20,
    date: "2025-04-15",
    fileType: "MP4",
    previewImg: "product_010.jpeg",
    productImages: ["product_010.jpeg", "product_011.jpeg", "product_012.jpeg"],
    compatibility: "After Effects",
  },
  {
    id: "011",
    category: "mockup",
    name: "Smart Cube Display",
    description: {
      bodyCopy1:
        "Smart Cube Display is a high-fidelity digital asset designed to enhance your creative presentations and visuals.",
      bodyCopy2:
        "Crafted with modern aesthetics, it's ideal for branding, portfolio showcases, and product campaigns.",
    },
    designer: "Glasshouse Studio",
    price: 12,
    date: "2025-04-16",
    fileType: "PSD",
    previewImg: "product_011.jpeg",
    productImages: ["product_011.jpeg", "product_012.jpeg", "product_013.jpeg"],
    compatibility: "Figma",
  },
  {
    id: "012",
    category: "mockup",
    name: "Silhouette Portrait Mockup",
    description: {
      bodyCopy1:
        "Silhouette Portrait Mockup is a high-fidelity digital asset designed to enhance your creative presentations and visuals.",
      bodyCopy2:
        "Crafted with modern aesthetics, it's ideal for branding, portfolio showcases, and product campaigns.",
    },
    designer: "Persona",
    price: 20,
    date: "2025-04-17",
    fileType: "PNG",
    previewImg: "product_012.jpeg",
    productImages: ["product_012.jpeg", "product_013.jpeg", "product_014.jpeg"],
    compatibility: "Figma",
  },
  {
    id: "013",
    category: "sfx",
    name: "Retro Joystick UI",
    description: {
      bodyCopy1:
        "Retro Joystick UI is a high-fidelity digital asset designed to enhance your creative presentations and visuals.",
      bodyCopy2:
        "Crafted with modern aesthetics, it's ideal for branding, portfolio showcases, and product campaigns.",
    },
    designer: "Classic Console Co.",
    price: 5,
    date: "2025-04-18",
    fileType: "MP3",
    previewImg: "product_013.jpeg",
    productImages: ["product_013.jpeg", "product_014.jpeg", "product_015.jpeg"],
    compatibility: "All DAWs",
  },
  {
    id: "014",
    category: "mockup",
    name: "Phone Display Hands",
    description: {
      bodyCopy1:
        "Phone Display Hands is a high-fidelity digital asset designed to enhance your creative presentations and visuals.",
      bodyCopy2:
        "Crafted with modern aesthetics, it's ideal for branding, portfolio showcases, and product campaigns.",
    },
    designer: "Visual Hands",
    price: 25,
    date: "2025-04-19",
    fileType: "PNG",
    previewImg: "product_014.jpeg",
    productImages: ["product_014.jpeg", "product_015.jpeg", "product_001.jpeg"],
    compatibility: "Figma",
  },
  {
    id: "015",
    category: "motion",
    name: "Laser Cutter Loop",
    description: {
      bodyCopy1:
        "Laser Cutter Loop is a high-fidelity digital asset designed to enhance your creative presentations and visuals.",
      bodyCopy2:
        "Crafted with modern aesthetics, it's ideal for branding, portfolio showcases, and product campaigns.",
    },
    designer: "Machina Works",
    price: 45,
    date: "2025-04-20",
    fileType: "MP4",
    previewImg: "product_015.jpeg",
    productImages: ["product_015.jpeg", "product_001.jpeg", "product_002.jpeg"],
    compatibility: "Blender",
  },
];

interface Article {
  id: string;
  title: string;
  bannerImg: string;
  bodyCopy: string[];
  author: string;
  date: string;
  tags: string[];
}

const ARTICLES: Article[] = [
  {
    id: "A001",
    title: "Designing with Restraint",
    bannerImg: "article_001.jpeg",
    bodyCopy: [
      "In the world of modern design, minimal mockups offer a clean canvas that lets the core of your concept shine. They remove distractions and amplify intentionality, allowing users to focus on the essentials. By using restraint in layout, color, and texture, minimal mockups help you communicate clarity and purpose. When you're designing assets for client presentations or product previews, minimal mockups can serve as a visual anchor. They provide a professional, consistent foundation that frames your work without overwhelming it. This makes them ideal for branding, UI showcases, and portfolio displays. Choosing the right mockup means thinking about hierarchy, whitespace, and usability.",
      "Minimalism isn't just about aesthetics; it's a design principle rooted in intentionality. When used thoughtfully, minimal mockups allow the viewer's focus to remain on the product or content, rather than on overly stylized backgrounds. This ensures the message comes through clearly and memorably. Many of the top-performing design assets across platforms share this trait: they use space and subtlety to highlight what matters. These mockups become a storytelling tool, not just a placeholder, adding professionalism and polish to your work. At Format Archive, we value assets that don't shout, but speak with precision. We select mockups that balance style with simplicity, so you can express your vision without compromise. It's not just about showing your work; it's about showing it thoughtfully. Designers often reach for bold, colorful assets, but the elegance of minimal mockups cannot be overstated. They encourage restraint, elevate branding, and offer a timeless quality that flashy designs often lack. Minimal mockups are future-proof; they won't date your work.",
      "At Format Archive, we believe that restraint is not limitation; it's liberation. When you strip away the unnecessary, you're free to focus on what truly matters. Consider the shape and form showcased in our minimal product photography: clean lines, thoughtful shadows, and deliberate composition. These elements don't just happen by accident. They're carefully orchestrated to draw attention to what matters most: the product itself. The same principles apply to your design presentations. By embracing minimalism in your mockup selection, you're making a statement about your own design philosophy: that you value clarity, precision, and purpose above all else.",
    ],
    author: "Nina Lang",
    date: "2025-04-10",
    tags: ["mockups", "minimalism", "design"],
  },
  {
    id: "A002",
    title: "Building Tools that Inspire",
    bannerImg: "article_002.jpeg",
    bodyCopy: [
      "Motion elements add dimension to design. They breathe life into static compositions, guiding the viewer's attention and creating rhythm within a layout. From subtle UI transitions to cinematic logo reveals, motion graphics help tell stories that resonate. When done right, they make the digital experience feel polished and immersive, one that the viewer doesn't just see, but feels. Designers today are expected to think beyond the frame. It's not enough to create a still image; you need to anticipate how it moves, shifts, and unfolds over time. This is where motion becomes a vital design language. At Format Archive, we curate motion assets with intention. We look for pieces that enhance a message without overwhelming it: loops that can sit in the background, animations that support a narrative, transitions that guide user flow.",
      "The best motion work is invisible until it's not. It should feel like an extension of the brand, not an interruption. Subtle timing, intuitive pacing, and visual restraint all play a role in how effective motion assets can be. Our motion category includes assets created by artists who understand this delicate balance, creators who build for mood, tone, and intention. The result is a collection that works across industries, mediums, and messages. These aren't flashy effects for the sake of flash; they're building blocks of meaningful storytelling. Whether it's a hero banner for a landing page or a seamless scroll-triggered animation, motion elements should always be in service of clarity and emotion. Take a close look at the controllers and interfaces that inspire our motion philosophy: sleek, tactile, and purposeful. These physical objects embody the same principles we value in digital motion: precision, responsiveness, and thoughtful interaction. Great motion design, like great product design, anticipates the user's needs and desires.",
      "Motion is more than just movement; it's emotion in action. The right animation can transform a user's experience from passive to participatory, from observational to emotional. This is why we're passionate about providing tools that inspire not just through their functionality, but through their feel. When designers have access to thoughtfully crafted motion elements, they can create experiences that resonate on a deeper level, forming lasting connections between users and products. At Format Archive, we're committed to building a library of motion assets that elevate the entire digital ecosystem.",
    ],
    author: "Eliot Tanaka",
    date: "2025-04-11",
    tags: ["motion", "branding", "visual"],
  },
  {
    id: "A003",
    title: "Sound Design for Interfaces",
    bannerImg: "article_003.jpeg",
    bodyCopy: [
      "Sound is often the unsung hero of digital design. From subtle haptic clicks to ambient background tones, sound effects add atmosphere, context, and emotion. They anchor the user in the experience and reinforce visual feedback. In interfaces, for instance, a soft ping or swoosh can guide interactions and affirm actions, creating a more intuitive, responsive product. It's not about volume or complexity; it's about timing, tone, and texture. The right sound, in the right moment, can change how something feels completely. Our SFX category at Format Archive focuses on what we call 'quiet impact': sound elements that don't demand attention, but heighten presence. We feature packs built specifically for interfaces, product demos, reels, and branding.",
      "We collaborate with sound designers who approach audio with a designer's mindset, balancing frequency, softness, and rhythm for usability. This results in a sound library that feels modern and refined, yet flexible enough to be repurposed across projects. The digital space is full of noise; we help you tune it to something intentional. Clean, light, and emotionally intelligent: this is sound design done right. These aren't generic stock sounds; they're crafted with purpose, optimized for clean layering and seamless integration. Whether you're designing an app, a website, or an installation, sound should never be an afterthought. Consider the minimalist speaker shown in our imagery; its form factor is as considered as the sound it produces. This physical manifestation of audio technology reminds us that sound design, like product design, should be both functional and beautiful.",
      "When we think about comprehensive digital experiences, we must consider all senses. While our primary focus is often visual, the auditory layer can make or break user engagement. A thoughtfully designed soundscape can reduce cognitive load by providing confirmation cues, create emotional connections through branded sound signatures, and guide users through complex interfaces with audio wayfinding. At Format Archive, we believe that great sound design is invisible yet indispensable, much like the best UX decisions. Our curated audio collections are designed to help you create experiences that don't just look good, but feel complete.",
    ],
    author: "Jules Moreno",
    date: "2025-04-12",
    tags: ["sound", "UX", "digital"],
  },
  {
    id: "A004",
    title: "Curating a Digital Archive",
    bannerImg: "article_004.jpeg",
    bodyCopy: [
      "Curation is at the core of Format Archive. In a landscape overflowing with design assets, we believe less is more, when it's done right. Our digital archive prioritizes quality over quantity, focusing on assets that are useful, beautiful, and built to last. Every product we feature is selected through a deliberate process that asks: is this thoughtful, versatile, and well-crafted? We avoid trends in favor of timelessness, because great design shouldn't have an expiration date. We're not trying to be the biggest archive; we're building the most intentional one. That means fewer, better assets. Tools that respect your time and your taste. Each submission is reviewed for utility, elegance, and fit with our broader aesthetic.",
      "We see the archive as a creative companion. It's not just where you find assets; it's where you find alignment. With your values, with your process, with your visual identity. By prioritizing curation, we aim to create a space that inspires confidence in every download. Because when every asset works, you work better, faster, and more creatively. This isn't about perfection, it's about precision: an archive where every file counts, and every detail has been considered. Think of the way light falls across a tablet display, highlighting content while creating natural depth and focus. Our curation philosophy works the same way, drawing attention to what matters while creating context that enhances rather than distracts. In a digital landscape overwhelmed with options, thoughtful curation becomes a form of design itself.",
      "The digital archive we're building isn't static; it's a living collection that evolves with intention. Unlike algorithms that simply serve more of what's popular, our human-centered curation process considers the subtleties of design needs across disciplines and contexts. We look beyond metrics to consider usefulness, versatility, and longevity. This approach means that when you browse Format Archive, you're not just seeing random assets; you're exploring a carefully constructed ecosystem designed to support creative work at its highest level. Our commitment to thoughtful curation means you spend less time searching and more time creating.",
    ],
    author: "Cam Park",
    date: "2025-04-13",
    tags: ["curation", "assets", "platform"],
  },
  {
    id: "A005",
    title: "Creating for Creators",
    bannerImg: "article_005.jpeg",
    bodyCopy: [
      "At Format Archive, we think of our platform as more than a marketplace; it's a toolkit for creative professionals. Our goal is to support the designers, developers, and makers who push visual culture forward. That means offering assets that are not only visually consistent, but also purpose-built for real creative needs. From drag-and-drop mockups to adaptable UI kits, we want every file to feel like something you'd make yourself, just faster. We design for creators because we are creators. That gives us a deep respect for your time, your tools, and your standards. Every product on our platform is chosen to help you spend less time tweaking and more time building.",
      "This philosophy of 'creating for creators' guides everything we do, from how we review submissions to how we communicate with our community. We're not just offering files; we're offering trust, craft, and clarity. Our archive is designed to empower your process, refine your output, and spark inspiration when you need it most. You shouldn't have to compromise between beauty and usability. With Format Archive, you don't have to. Look at the precision engineering reflected in our hardware imagery: the tactile satisfaction of well-designed controls, the thoughtful placement of indicator lights, the considered balance of form and function. These physical tools embody the same principles we bring to our digital assets: utility elevated by craft. Creative professionals deserve tools that not only solve problems but inspire new possibilities.",
      "The relationship between creator and tool is intimate and essential. The right tools don't just facilitate creation; they shape it, inform it, elevate it. At Format Archive, we understand this relationship deeply. We curate assets that respect the creative process while expanding creative potential. Whether you're designing interfaces, building brands, or crafting experiences, our collection offers the foundation you need to express your unique vision. By focusing on the needs of professional creators, we've built more than an archive; we've built a resource that grows with you, adapts to your workflow, and honors your craft. Because when creators have the right tools, everyone benefits from better design.",
    ],
    author: "Avery Kim",
    date: "2025-04-14",
    tags: ["design tools", "creativity", "workflow"],
  },
];

function generateSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

function findProductBySlug(slug: string) {
  return PRODUCTS.find((product) => generateSlug(product.name) === slug);
}

function findArticleBySlug(slug: string) {
  return ARTICLES.find((article) => generateSlug(article.title) === slug);
}

/* -------------------------------------------------------------------- cart */

interface CartItem extends Product {
  quantity: number;
}

interface CartValue {
  cartItems: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (value: boolean) => void;
  toggleCart: () => void;
  openCart: () => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartValue | null>(null);

function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside the template");
  return value;
}

const CART_STORAGE_KEY = "archive-commerce-page-cart";

function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CART_STORAGE_KEY);
      if (stored) setCartItems(JSON.parse(stored) as CartItem[]);
    } catch {
      // ignore unreadable storage
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // ignore unwritable storage
    }
  }, [cartItems]);

  const addToCart = useCallback((product: Product) => {
    setCartItems((items) => {
      const existing = items.find((item) => item.id === product.id);
      if (existing) {
        return items.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...items, { ...product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems((items) => items.filter((item) => item.id !== productId));
  }, []);

  const value = useMemo<CartValue>(
    () => ({
      cartItems,
      isCartOpen,
      setIsCartOpen,
      toggleCart: () => setIsCartOpen((open) => !open),
      openCart: () => setIsCartOpen(true),
      addToCart,
      removeFromCart,
      cartTotal: cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      ),
      cartCount: cartItems.reduce((count, item) => count + item.quantity, 0),
    }),
    [cartItems, isCartOpen, addToCart, removeFromCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/* ------------------------------------------------------------------ router */

export const ARCHIVE_COMMERCE_PAGE_ROUTES = [
  { path: "/", label: "Index" },
  { path: "/catalogue", label: "Catalogue" },
  { path: "/info", label: "Info" },
  { path: "/archive", label: "Archive" },
  { path: "/editorial", label: "Editorial" },
] as const;

interface RouterValue {
  pathname: string;
  navigate: (to: string) => void;
  isAnimating: boolean;
}

const RouterContext = createContext<RouterValue>({
  pathname: "/",
  navigate: () => {},
  isAnimating: false,
});

function useRouter() {
  return useContext(RouterContext);
}

function normalizePath(path: string) {
  const trimmed = path.trim();
  if (!trimmed.startsWith("/")) return `/${trimmed}`;
  return trimmed.length > 1 ? trimmed.replace(/\/+$/, "") : trimmed;
}

/* -------------------------------------------------------------------- menu */

function Menu() {
  const router = useRouter();
  const { isCartOpen, toggleCart, cartCount } = useCart();
  const [isAnimating, setIsAnimating] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);
  const menuOverlayRef = useRef<HTMLDivElement | null>(null);
  const navLogoRef = useRef<HTMLAnchorElement | null>(null);
  const menuBtnRef = useRef<HTMLParagraphElement | null>(null);
  const cartBtnRef = useRef<HTMLParagraphElement | null>(null);
  const overlayLogoRef = useRef<HTMLAnchorElement | null>(null);
  const closeBtnRef = useRef<HTMLParagraphElement | null>(null);

  useGSAP(
    () => {
      gsap.set(menuOverlayRef.current, {
        clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
        pointerEvents: "none",
      });
      gsap.set([overlayLogoRef.current, closeBtnRef.current], { y: "100%" });
      gsap.set(".menu-overlay-items .revealer a", { y: "100%" });
      gsap.set(".menu-footer .revealer p, .menu-footer .revealer a", {
        y: "100%",
      });
    },
    { scope: menuRef },
  );

  const openMenu = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    const menuRoot = menuRef.current;
    if (!menuRoot) return;

    const tl = gsap.timeline({ onComplete: () => setIsAnimating(false) });

    tl.to([navLogoRef.current, menuBtnRef.current, cartBtnRef.current], {
      y: "-100%",
      duration: 0.5,
      stagger: 0.1,
      ease: "power3.out",
      onComplete: () => {
        if (navRef.current) navRef.current.style.pointerEvents = "none";
        gsap.set([navLogoRef.current, menuBtnRef.current, cartBtnRef.current], {
          y: "100%",
        });
      },
    });

    tl.to(
      menuOverlayRef.current,
      {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 1,
        ease: "acpHop",
        onStart: () => {
          if (menuOverlayRef.current)
            menuOverlayRef.current.style.pointerEvents = "all";
        },
      },
      "-=0.55",
    );

    tl.to(
      [overlayLogoRef.current, closeBtnRef.current],
      { y: "0%", duration: 1, stagger: 0.1, ease: "power3.out" },
      "-=0.5",
    );

    tl.to(
      menuRoot.querySelectorAll(".menu-overlay-items .revealer a"),
      { y: "0%", duration: 1, stagger: 0.075, ease: "power3.out" },
      "<",
    );

    tl.to(
      menuRoot.querySelectorAll(
        ".menu-footer .revealer p, .menu-footer .revealer a",
      ),
      { y: "0%", duration: 1, stagger: 0.1, ease: "power3.out" },
      "<",
    );
  };

  const closeMenu = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    const menuRoot = menuRef.current;
    if (!menuRoot) return;

    const tl = gsap.timeline({ onComplete: () => setIsAnimating(false) });

    tl.to([overlayLogoRef.current, closeBtnRef.current], {
      y: "-100%",
      duration: 0.5,
      stagger: 0.1,
      ease: "power3.out",
    });

    tl.to(
      menuRoot.querySelectorAll(".menu-overlay-items .revealer a"),
      { y: "-100%", duration: 0.5, stagger: 0.05, ease: "power3.in" },
      "<",
    );

    tl.to(
      menuRoot.querySelectorAll(
        ".menu-footer .revealer p, .menu-footer .revealer a",
      ),
      { y: "-100%", duration: 0.5, stagger: 0.05, ease: "power3.in" },
      "<",
    );

    tl.to(
      menuOverlayRef.current,
      {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        duration: 1,
        ease: "acpHop",
        onComplete: () => {
          if (menuOverlayRef.current) {
            menuOverlayRef.current.style.pointerEvents = "none";
            gsap.set(menuOverlayRef.current, {
              clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
            });
          }
          gsap.set([overlayLogoRef.current, closeBtnRef.current], {
            y: "100%",
          });
          gsap.set(
            menuRoot.querySelectorAll(".menu-overlay-items .revealer a"),
            {
              y: "100%",
            },
          );
          gsap.set(
            menuRoot.querySelectorAll(
              ".menu-footer .revealer p, .menu-footer .revealer a",
            ),
            { y: "100%" },
          );
        },
      },
      "+=0.25",
    );

    tl.to(
      [navLogoRef.current, menuBtnRef.current, cartBtnRef.current],
      {
        y: "0%",
        duration: 0.5,
        stagger: 0.1,
        ease: "power3.out",
        onStart: () => {
          if (navRef.current) navRef.current.style.pointerEvents = "all";
        },
      },
      "-=0.35",
    );
  };

  const navigateFromOverlay = (path: string) => {
    if (isAnimating) return;
    if (router.pathname === path) {
      closeMenu();
      return;
    }
    closeMenu();
    setTimeout(() => {
      router.navigate(path);
    }, 750);
  };

  return (
    <div className="menu" ref={menuRef}>
      <div className="nav" ref={navRef}>
        <div className="nav-logo">
          <div className="revealer">
            <a
              href="/"
              ref={navLogoRef}
              onClick={(e) => {
                e.preventDefault();
                if (router.pathname === "/") return;
                if (isCartOpen) {
                  setTimeout(() => router.navigate("/"), 500);
                } else {
                  router.navigate("/");
                }
              }}
            >
              Format Archive
            </a>
          </div>
        </div>
        <div className="nav-items">
          <div className="nav-menu-toggle-open">
            <div className="revealer" onClick={openMenu}>
              <p ref={menuBtnRef}>Menu</p>
            </div>
          </div>
          <div className="nav-cart-btn">
            <div className="revealer" onClick={toggleCart}>
              <p ref={cartBtnRef}>
                Cart (<span id="cart-count">{cartCount}</span>)
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="menu-overlay" ref={menuOverlayRef}>
        <div className="menu-overlay-nav">
          <div className="menu-overlay-nav-logo">
            <div className="revealer">
              <a
                href="/"
                ref={overlayLogoRef}
                onClick={(e) => {
                  e.preventDefault();
                  navigateFromOverlay("/");
                }}
              >
                Format Archive
              </a>
            </div>
          </div>
          <div className="menu-overlay-nav-toggle-close">
            <div className="revealer" onClick={closeMenu}>
              <p ref={closeBtnRef}>Close</p>
            </div>
          </div>
        </div>
        <div className="menu-overlay-items">
          {ARCHIVE_COMMERCE_PAGE_ROUTES.map((route) => (
            <div className="revealer" key={route.path}>
              <a
                href={route.path}
                onClick={(e) => {
                  e.preventDefault();
                  navigateFromOverlay(route.path);
                }}
              >
                {route.label}
              </a>
            </div>
          ))}
        </div>
        <div className="menu-footer">
          <div className="menu-footer-col">
            <div className="revealer">
              <p>&copy;2025 All rights reserved</p>
            </div>
          </div>
          <div className="menu-footer-col">
            <div className="socials">
              <div className="revealer">
                <a href="https://aryank.space" target="_blank" rel="noreferrer">
                  YouTube
                </a>
              </div>
              <div className="revealer">
                <a href="https://aryank.space" target="_blank" rel="noreferrer">
                  Instagram
                </a>
              </div>
              <div className="revealer">
                <a href="https://aryank.space" target="_blank" rel="noreferrer">
                  X
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- cart drawer */

function Cart() {
  const asset = useAsset();
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, cartTotal } =
    useCart();
  const cartRef = useRef<HTMLDivElement | null>(null);

  const handleClose = useCallback(() => {
    gsap.to(cartRef.current, {
      x: "100%",
      duration: 1,
      ease: "acpHop",
      pointerEvents: "none",
      onComplete: () => setIsCartOpen(false),
    });
  }, [setIsCartOpen]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        cartRef.current &&
        !cartRef.current.contains(e.target as Node) &&
        isCartOpen
      ) {
        handleClose();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isCartOpen, handleClose]);

  useGSAP(() => {
    if (isCartOpen) {
      gsap.to(cartRef.current, {
        x: "0%",
        duration: 1,
        ease: "acpHop",
        pointerEvents: "all",
      });
    }
  }, [isCartOpen]);

  return (
    <div className="cart-sidebar" ref={cartRef}>
      <div className="cart-nav">
        <div className="revealer">
          <p>Bag</p>
        </div>
        <div className="revealer" id="close-cart-sidebar" onClick={handleClose}>
          <p>Close</p>
        </div>
      </div>
      <div className="cart-items" data-lenis-prevent={true}>
        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <p>Your bag is empty</p>
          </div>
        ) : (
          cartItems.map((item) => (
            <div className="cart-item" key={item.id}>
              <div className="cart-item-img">
                <img
                  src={asset(`product_images/${item.previewImg}`)}
                  alt={item.name}
                />
              </div>
              <div className="cart-item-info">
                <div className="cart-item-info-row">
                  <div className="revealer cart-item-product-name">
                    <p>{item.name}</p>
                  </div>
                  <div className="revealer cart-item-product-price">
                    <p>${item.price}</p>
                  </div>
                </div>
                <div className="cart-item-info-row">
                  <div
                    className="revealer cart-item-remove-btn"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <p>Remove</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {cartItems.length > 0 && (
        <div className="cart-summary">
          <div className="cart-summary-row">
            <div className="revealer">
              <p>Shipping</p>
            </div>
            <div className="revealer">
              <p>At Checkout</p>
            </div>
          </div>
          <div className="cart-summary-row">
            <div className="revealer">
              <p>Subtotal</p>
            </div>
            <div className="revealer">
              <p>${cartTotal}</p>
            </div>
          </div>
          <div className="cart-summary-row">
            <a href="https://stripe.com/" target="_blank" rel="noreferrer">
              <div className="checkout-btn">
                <div className="revealer">
                  <p>Checkout</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ footer */

function Footer() {
  const [torontoTime, setTorontoTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const formatter = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
        timeZone: "America/Toronto",
      });
      setTorontoTime(formatter.format(new Date()));
    };
    updateTime();
    const intervalId = setInterval(updateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="footer">
      <div className="footer-col">
        <p>&copy;2025 All right reserved</p>
      </div>
      <div className="footer-col">
        <div className="footer-clock">
          <p>Toronto, ON {torontoTime}</p>
        </div>
        <div className="footer-author">
          <p>
            Made by&nbsp;
            <a href="https://aryank.space" target="_blank" rel="noreferrer">
              BLANK
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- home */

let isInitialLoad = true;

function HomePage() {
  const asset = useAsset();
  const router = useRouter();
  const container = useRef<HTMLDivElement | null>(null);
  const counterRef = useRef<HTMLParagraphElement | null>(null);
  const [showPreloader] = useState(isInitialLoad);

  useEffect(() => {
    return () => {
      isInitialLoad = false;
    };
  }, []);

  const startLoader = () => {
    const counterElement = counterRef.current;
    const totalDuration = 2000;
    const totalSteps = 11;
    const timePerStep = totalDuration / totalSteps;

    if (counterElement) counterElement.textContent = "0";

    let currentStep = 0;
    function updateCounter() {
      currentStep++;
      if (currentStep <= totalSteps) {
        const progress = currentStep / totalSteps;
        let value: number;
        if (currentStep === totalSteps) {
          value = 100;
        } else {
          const exactValue = progress * 100;
          const minValue = Math.max(Math.floor(exactValue - 5), 1);
          const maxValue = Math.min(Math.floor(exactValue + 5), 99);
          value =
            Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
        }
        if (counterElement) counterElement.textContent = String(value);
        if (currentStep < totalSteps) setTimeout(updateCounter, timePerStep);
      }
    }

    setTimeout(updateCounter, timePerStep);
  };

  useGSAP(
    () => {
      if (showPreloader) {
        startLoader();

        gsap.set(".home-page-content", {
          clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
        });

        const tl = gsap.timeline();
        tl.to(".count", { opacity: 0, delay: 2.5, duration: 0.25 });
        tl.to(".pre-loader", { scale: 0.5, ease: "acpHop2", duration: 1 });
        tl.to(".home-page-content", {
          clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
          duration: 1.5,
          ease: "acpHop2",
          delay: -1,
        });
        tl.to(".loader", {
          height: "0",
          ease: "acpHop2",
          duration: 1,
          delay: -1,
        });
        tl.to(".loader-bg", {
          height: "0",
          ease: "acpHop2",
          duration: 1,
          delay: -0.5,
        });
        tl.to(".loader-2", {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
          ease: "acpHop2",
          duration: 1,
        });
      } else {
        gsap.set(".home-page-content", {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        });
      }

      const tl = gsap.timeline();
      tl.to("h1 span", {
        y: "0%",
        ease: "acpHop",
        duration: 1.5,
        stagger: 0.2,
        delay: showPreloader ? 4 : 1,
      });
      tl.to(
        ".product-preview-hero",
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          ease: "acpHop",
          duration: 1.5,
          stagger: 0.3,
        },
        "<",
      );
    },
    { scope: container, dependencies: [showPreloader] },
  );

  return (
    <div className="home-page" ref={container}>
      {showPreloader && (
        <>
          <div className="preloader-overlay">
            <div className="pre-loader">
              <div className="loader"></div>
              <div className="loader-bg"></div>
            </div>
            <div className="count">
              <p ref={counterRef}>0</p>
            </div>
            <div className="loader-2"></div>
          </div>
          <div className="preloader-bg-img">
            <img src={asset("hero.gif")} alt="" />
          </div>
        </>
      )}

      <div className="home-page-content">
        <div className="header">
          <h1 className="header-line-1">
            <span>Format</span>
          </h1>
          <h1 className="header-line-2">
            <span>Archive</span>
          </h1>
        </div>

        <div className="home-page-footer">
          <div className="hp-footer-col"></div>
          <div className="hp-footer-col">
            <div
              className="product-preview-hero"
              onClick={() => router.navigate("/catalogue/mirror-orb-mockup")}
            >
              <img src={asset("product_images/product_001.jpeg")} alt="" />
            </div>
            <div
              className="product-preview-hero"
              onClick={() => router.navigate("/catalogue/earbud-ad-mockup")}
            >
              <img src={asset("product_images/product_002.jpeg")} alt="" />
            </div>
            <div
              className="product-preview-hero"
              onClick={() => router.navigate("/catalogue/minimal-phone-mockup")}
            >
              <img src={asset("product_images/product_003.jpeg")} alt="" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- archive */

function ArchivePage() {
  const asset = useAsset();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const mouseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      gsap.set(".archive-header .revealer p", { y: "100%" });
      gsap.set(".archive-item .revealer p", { y: "100%" });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out", delay: 0.85 },
      });
      tl.to(".archive-header .revealer p", { y: "0%", duration: 0.75 });

      const archiveItems =
        containerRef.current.querySelectorAll(".archive-item");
      const rowTimeline = gsap.timeline({ delay: 0.95 });
      archiveItems.forEach((item, index) => {
        const pTags = item.querySelectorAll(".revealer p");
        rowTimeline.to(
          pTags,
          { y: "0%", duration: 0.75, ease: "power3.out" },
          index * 0.05,
        );
      });
    },
    { scope: containerRef },
  );

  const isInsideArchive = useCallback((x: number, y: number) => {
    const archiveItems = containerRef.current?.querySelector(".archive-items");
    if (!archiveItems) return false;
    const rect = archiveItems.getBoundingClientRect();
    return (
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    );
  }, []);

  const removeAllImages = useCallback(() => {
    if (!previewRef.current) return;
    previewRef.current.querySelectorAll("img").forEach((img) => {
      gsap.to(img, {
        transform: "scale(0)",
        duration: 0.4,
        ease: "power2.out",
        onComplete: () => img.remove(),
      });
    });
  }, []);

  const cleanupOldImages = useCallback(() => {
    if (!previewRef.current) return;
    const images = previewRef.current.querySelectorAll("img");
    if (images.length <= 1) return;
    const lastImage = images[images.length - 1];
    images.forEach((img) => {
      if (img !== lastImage) {
        gsap.to(img, {
          transform: "scale(0)",
          duration: 0.4,
          ease: "power2.out",
          onComplete: () => img.remove(),
        });
      }
    });
  }, []);

  useEffect(() => {
    const lastPointer = { x: 0, y: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      lastPointer.x = e.clientX;
      lastPointer.y = e.clientY;

      if (mouseTimeoutRef.current) clearTimeout(mouseTimeoutRef.current);

      if (!isInsideArchive(e.clientX, e.clientY)) {
        removeAllImages();
      } else {
        mouseTimeoutRef.current = setTimeout(() => {
          cleanupOldImages();
        }, 2000);
      }
    };

    const handleScroll = () => {
      if (!isInsideArchive(lastPointer.x, lastPointer.y)) {
        removeAllImages();
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("scroll", handleScroll, {
      capture: true,
      passive: true,
    });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("scroll", handleScroll, { capture: true });
      if (mouseTimeoutRef.current) clearTimeout(mouseTimeoutRef.current);
    };
  }, [isInsideArchive, removeAllImages, cleanupOldImages]);

  const createPreviewImage = (product: Product, e: React.MouseEvent) => {
    if (!previewRef.current) return;
    if (!isInsideArchive(e.clientX, e.clientY)) return;

    const img = document.createElement("img");
    img.src = asset(`product_images/${product.previewImg}`);
    img.style.position = "absolute";
    img.style.top = "0";
    img.style.left = "0";
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";
    img.style.transform = "scale(0)";
    img.style.zIndex = String(previewRef.current.children.length + 1);

    previewRef.current.appendChild(img);

    gsap.to(img, {
      transform: "scale(1)",
      duration: 0.4,
      ease: "power2.out",
    });
  };

  return (
    <>
      <div className="p-25"></div>
      <div className="archive-page" ref={containerRef}>
        <div className="archive">
          <div className="archive-header">
            <div className="archive-header-name">
              <div className="revealer">
                <p>Product Name</p>
              </div>
            </div>
            <div className="archive-header-designer">
              <div className="revealer">
                <p>Designer</p>
              </div>
            </div>
            <div className="archive-header-year">
              <div className="revealer">
                <p>Year</p>
              </div>
            </div>
          </div>
          <div className="archive-items">
            {[...Array(2)].flatMap((_, repetition) =>
              PRODUCTS.map((product) => {
                const productYear = new Date(product.date).getFullYear();
                const uniqueKey = `${repetition}-${product.id}`;
                return (
                  <div
                    className="archive-item"
                    key={uniqueKey}
                    onMouseEnter={(e) => createPreviewImage(product, e)}
                  >
                    <div className="archive-item-name">
                      <div className="revealer">
                        <p>{product.name}</p>
                      </div>
                    </div>
                    <div className="archive-item-designer">
                      <div className="revealer">
                        <p>{product.designer}</p>
                      </div>
                    </div>
                    <div className="archive-item-year">
                      <div className="revealer">
                        <p>{productYear}</p>
                      </div>
                    </div>
                  </div>
                );
              }),
            )}
          </div>
        </div>
        <div className="archive-empty-col"></div>
      </div>
      <div className="p-25"></div>
      <div className="product-preview" ref={previewRef}></div>
      <div className="footer-wrapper">
        <Footer />
      </div>
    </>
  );
}

/* --------------------------------------------------------------- catalogue */

const PRODUCT_DISTRIBUTION = [
  [1, 0, 0, 1],
  [0, 1, 0, 0],
  [1, 0, 0, 0],
  [0, 1, 0, 1],
  [1, 0, 0, 1],
  [0, 1, 0, 0],
  [0, 0, 1, 1],
  [1, 0, 0, 0],
  [0, 1, 0, 1],
  [0, 0, 1, 0],
];

function getProductLayout() {
  let productIndex = 0;
  const layout: Product[][][] = [];
  for (let rowIndex = 0; rowIndex < PRODUCT_DISTRIBUTION.length; rowIndex++) {
    const rowLayout: Product[][] = [[], [], [], []];
    for (let colIndex = 0; colIndex < 4; colIndex++) {
      const productCount = PRODUCT_DISTRIBUTION[rowIndex][colIndex];
      for (let i = 0; i < productCount; i++) {
        if (productIndex < PRODUCTS.length) {
          rowLayout[colIndex].push(PRODUCTS[productIndex]);
          productIndex++;
        }
      }
    }
    layout.push(rowLayout);
  }
  return layout;
}

function CataloguePage() {
  const asset = useAsset();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const productLayout = useMemo(() => getProductLayout(), []);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      const rows = containerRef.current.querySelectorAll(".row");
      gsap.fromTo(
        rows,
        { y: 300, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          stagger: 0.1,
          delay: 0.85,
        },
      );
    },
    { scope: containerRef },
  );

  return (
    <div className="catalogue-page" ref={containerRef}>
      <div className="p-25"></div>
      <div className="products">
        {productLayout.map((row, rowIndex) => (
          <div className="row" key={`row-${rowIndex}`}>
            {row.map((column, colIndex) => (
              <div
                className={`column ${column.length === 0 ? "empty-column" : ""}`}
                key={`col-${rowIndex}-${colIndex}`}
              >
                {column.map((product) => (
                  <div
                    key={product.id}
                    className="product-link"
                    onClick={() =>
                      router.navigate(
                        `/catalogue/${generateSlug(product.name)}`,
                      )
                    }
                  >
                    <div className="product-card">
                      <div className="product-card-image">
                        <img
                          src={asset(`product_images/${product.previewImg}`)}
                          alt={product.name}
                          className="product-card-img"
                        />
                      </div>
                      <div className="product-info">
                        <p className="product-card-name">{product.name}</p>
                        <p className="product-card-price">${product.price}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="p-50"></div>
      <Footer />
    </div>
  );
}

/* ---------------------------------------------------------- product detail */

function getRelatedProducts(product: Product) {
  const otherProducts = PRODUCTS.filter((p) => p.id !== product.id);
  const sameCategory = otherProducts.filter(
    (p) => p.category === product.category,
  );
  const sameFileType = otherProducts.filter(
    (p) => p.fileType === product.fileType && p.category !== product.category,
  );
  const sameDesigner = otherProducts.filter(
    (p) => p.designer === product.designer && p.category !== product.category,
  );

  let selectedProducts: Product[] = [];
  const seed = Number.parseInt(product.id, 10);

  if (sameCategory.length > 0) {
    const catIndex = seed % sameCategory.length;
    selectedProducts.push(sameCategory[catIndex]);
    if (sameCategory.length > 1) {
      const catIndex2 = (seed + 1) % sameCategory.length;
      if (catIndex !== catIndex2) {
        selectedProducts.push(sameCategory[catIndex2]);
      }
    }
  }

  if (sameFileType.length > 0 && selectedProducts.length < 4) {
    const fileTypeProduct = sameFileType[seed % sameFileType.length];
    if (!selectedProducts.some((p) => p.id === fileTypeProduct.id)) {
      selectedProducts.push(fileTypeProduct);
    }
  }

  if (sameDesigner.length > 0 && selectedProducts.length < 4) {
    const designerProduct = sameDesigner[seed % sameDesigner.length];
    if (!selectedProducts.some((p) => p.id === designerProduct.id)) {
      selectedProducts.push(designerProduct);
    }
  }

  if (selectedProducts.length < 4) {
    const remainingProducts = otherProducts.filter(
      (p) => !selectedProducts.some((sp) => sp.id === p.id),
    );
    remainingProducts.sort((a, b) => {
      const scoreA = (Number.parseInt(a.id, 10) * seed) % 100;
      const scoreB = (Number.parseInt(b.id, 10) * seed) % 100;
      return scoreB - scoreA;
    });
    const neededCount = 4 - selectedProducts.length;
    selectedProducts = [
      ...selectedProducts,
      ...remainingProducts.slice(0, neededCount),
    ];
  }

  return selectedProducts;
}

function ProductDetailPage({ slug }: { slug: string }) {
  const asset = useAsset();
  const router = useRouter();
  const product = findProductBySlug(slug);
  const { addToCart, openCart } = useCart();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const descriptionRef = useRef<HTMLParagraphElement | null>(null);
  const addToCartBtnRef = useRef<HTMLDivElement | null>(null);

  const relatedProducts = useMemo(
    () => (product ? getRelatedProducts(product) : []),
    [product],
  );

  const handleAddToCart = () => {
    if (!product || router.isAnimating) return;
    addToCart(product);
    gsap.to(addToCartBtnRef.current, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
    });
    openCart();
  };

  useGSAP(
    () => {
      if (!containerRef.current || !product) return;

      gsap.set(".info-item .revealer p", { y: "105%" });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out", delay: 1 },
      });

      tl.to(".info-item .revealer:first-child p", {
        y: "0%",
        duration: 0.75,
      });

      tl.to(
        ".info-item .revealer:nth-child(2) p",
        { y: "0%", duration: 0.75 },
        "-=1.6",
      );

      if (descriptionRef.current) {
        const splitDescription = new SplitType(descriptionRef.current, {
          types: "lines",
          lineClass: "line",
        });

        splitDescription.lines?.forEach((line) => {
          const content = line.innerHTML;
          line.innerHTML = `<span>${content}</span>`;
        });

        gsap.set("#product-description .line span", {
          y: "100%",
          display: "block",
        });

        tl.to(
          "#product-description .line span",
          { y: "0%", duration: 0.75, stagger: 0.1 },
          "-=1.75",
        );
      }

      tl.fromTo(
        ".product-detail-img",
        { y: 300, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          stagger: 0.1,
        },
        "-=2",
      );
    },
    { scope: containerRef, dependencies: [product] },
  );

  if (!product) {
    return (
      <div className="product-not-found">
        <h1>Product not found</h1>
        <div
          className="back-link"
          onClick={() => router.navigate("/catalogue")}
        >
          Back to Catalogue
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page" ref={containerRef}>
      <div className="product-detail-container">
        <div className="product-detail-col product-detail-copy">
          <div className="info-row">
            <div className="info-item">
              <div className="revealer">
                <p>ID</p>
              </div>
              <div className="revealer">
                <p>{product.id}</p>
              </div>
            </div>
            <div className="info-item">
              <div className="revealer">
                <p>Designer</p>
              </div>
              <div className="revealer">
                <p>{product.designer}</p>
              </div>
            </div>
            <div className="info-item">
              <div className="revealer">
                <p>Date</p>
              </div>
              <div className="revealer">
                <p>{product.date}</p>
              </div>
            </div>
          </div>
          <div className="info-row">
            <div className="info-item">
              <div className="revealer">
                <p>Name</p>
              </div>
              <div className="revealer">
                <p>{product.name}</p>
              </div>
            </div>
            <div className="info-item">
              <div className="revealer">
                <p>Compatibility</p>
              </div>
              <div className="revealer">
                <p>{product.compatibility}</p>
              </div>
            </div>
            <div className="info-item">
              <div className="revealer">
                <p>File Type</p>
              </div>
              <div className="revealer">
                <p>{product.fileType}</p>
              </div>
            </div>
          </div>
          <div className="info-row">
            <div className="info-item">
              <div className="revealer">
                <p>Price</p>
              </div>
              <div className="revealer">
                <p>${product.price}</p>
              </div>
            </div>
            <div className="info-item">
              <div className="revealer">
                <p>Info</p>
              </div>
              <p id="product-description" ref={descriptionRef}>
                {product.description.bodyCopy1}
              </p>
            </div>
            <div className="info-item"></div>
          </div>
          <div className="info-row" id="add-to-cart-row">
            <div className="info-item">
              <div
                className="add-to-cart-btn"
                ref={addToCartBtnRef}
                onClick={handleAddToCart}
              >
                <div className="revealer">
                  <p>Add to cart</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="product-detail-col product-detail-images">
          {product.productImages.map((image, index) => (
            <div
              className={`product-detail-img product-detail-img-${index + 1}`}
              key={index}
            >
              <img src={asset(`product_images/${image}`)} alt={product.name} />
            </div>
          ))}
        </div>
      </div>
      <div className="more-products">
        <div className="more-products-header">
          <p>Related Products</p>
        </div>
        <div className="more-products-list">
          {relatedProducts.map((relatedProduct) => (
            <div
              key={relatedProduct.id}
              className="related-product-link"
              onClick={() =>
                router.navigate(
                  `/catalogue/${generateSlug(relatedProduct.name)}`,
                )
              }
            >
              <div className="related-product-card">
                <div className="related-product-image">
                  <img
                    src={asset(`product_images/${relatedProduct.previewImg}`)}
                    alt={relatedProduct.name}
                    className="related-product-img"
                  />
                </div>
                <div className="related-product-info">
                  <p className="related-product-name">{relatedProduct.name}</p>
                  <p className="related-product-price">
                    ${relatedProduct.price}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

/* --------------------------------------------------------------- editorial */

const ARTICLE_DISTRIBUTION = [
  [0, 1, 0],
  [1, 0, 0],
  [0, 0, 1],
  [0, 1, 0],
  [1, 0, 0],
];

function getArticleLayout() {
  let articleIndex = 0;
  const layout: (Article | null)[][] = [];
  const maxRows = Math.min(ARTICLE_DISTRIBUTION.length, ARTICLES.length);
  for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
    const rowLayout: (Article | null)[] = [null, null, null];
    for (let colIndex = 0; colIndex < 3; colIndex++) {
      if (
        ARTICLE_DISTRIBUTION[rowIndex][colIndex] === 1 &&
        articleIndex < ARTICLES.length
      ) {
        rowLayout[colIndex] = ARTICLES[articleIndex];
        articleIndex++;
        break;
      }
    }
    layout.push(rowLayout);
  }
  return layout;
}

function EditorialPage() {
  const asset = useAsset();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const articleLayout = useMemo(() => getArticleLayout(), []);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      const rows = containerRef.current.querySelectorAll(".article-row");
      gsap.fromTo(
        rows,
        { y: 300, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          stagger: 0.1,
          delay: 0.85,
        },
      );
    },
    { scope: containerRef },
  );

  return (
    <div className="editorial-page" ref={containerRef}>
      <div className="p-25"></div>
      <div className="articles">
        {articleLayout.map((row, rowIndex) => (
          <div className="article-row" key={`row-${rowIndex}`}>
            {row.map((article, colIndex) => (
              <div
                className={`column ${article === null ? "empty-column" : "article-column"}`}
                key={`col-${rowIndex}-${colIndex}`}
              >
                {article && (
                  <div
                    className="article-card"
                    onClick={() =>
                      router.navigate(
                        `/editorial/${generateSlug(article.title)}`,
                      )
                    }
                  >
                    <div className="article-image">
                      <img
                        src={asset(`article_images/${article.bannerImg}`)}
                        alt={article.title}
                        className="article-img"
                      />
                    </div>
                    <div className="article-info">
                      <p className="article-title">{article.title}</p>
                      <p className="article-author">{article.author}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="p-50"></div>
      <Footer />
    </div>
  );
}

/* ---------------------------------------------------------- article detail */

function ArticleDetailPage({ slug }: { slug: string }) {
  const asset = useAsset();
  const router = useRouter();
  const article = findArticleBySlug(slug);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const descriptionRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  useGSAP(
    () => {
      if (!containerRef.current || !article) return;

      gsap.set(".article-meta .revealer p", { y: "100%" });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out", delay: 0.85 },
      });

      tl.to(".article-meta .revealer p", {
        y: "0%",
        duration: 0.75,
        stagger: 0.05,
      });

      tl.fromTo(
        ".article-banner-img",
        { y: 300, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
        "-=2",
      );

      descriptionRefs.current.forEach((ref, index) => {
        if (ref) {
          const splitDescription = new SplitType(ref, {
            types: "lines",
            lineClass: "line",
          });

          splitDescription.lines?.forEach((line) => {
            const content = line.innerHTML;
            line.innerHTML = `<span>${content}</span>`;
          });

          gsap.set(`#article-paragraph-${index} .line span`, {
            y: "100%",
            display: "block",
          });

          tl.to(
            `#article-paragraph-${index} .line span`,
            { y: "0%", duration: 0.75, stagger: 0.05 },
            "-=1.5",
          );
        }
      });
    },
    { scope: containerRef, dependencies: [article] },
  );

  if (!article) {
    return (
      <div className="article-not-found">
        <h1>Article not found</h1>
        <div
          className="back-link"
          onClick={() => router.navigate("/editorial")}
        >
          Back to Editorial
        </div>
      </div>
    );
  }

  return (
    <div className="article-detail-page" ref={containerRef}>
      <div className="article-content">
        <div className="article-detail-col">
          <div className="article-banner-img">
            <img
              src={asset(`article_images/${article.bannerImg}`)}
              alt={article.title}
            />
          </div>
          {article.bodyCopy.map((copy, index) => (
            <div className="article-copy" key={index}>
              <p
                id={`article-paragraph-${index}`}
                ref={(el) => {
                  descriptionRefs.current[index] = el;
                }}
              >
                {copy}
              </p>
            </div>
          ))}
        </div>
        <div className="article-detail-col article-meta">
          <div className="article-date">
            <div className="revealer">
              <p>Date</p>
            </div>
            <div className="revealer">
              <p>{article.date}</p>
            </div>
          </div>
          <div className="article-title">
            <div className="revealer">
              <p>Article Name</p>
            </div>
            <div className="revealer">
              <p>{article.title}</p>
            </div>
          </div>
          <div className="article-author">
            <div className="revealer">
              <p>Author</p>
            </div>
            <div className="revealer">
              <p>By {article.author}</p>
            </div>
          </div>
          <div className="article-tags">
            <div className="revealer">
              <p>Tags</p>
            </div>
            <div className="tags">
              {article.tags.map((tag, index) => (
                <div className="revealer" key={index}>
                  <p>{tag}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

/* -------------------------------------------------------------------- info */

function InfoPage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const descriptionRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      gsap.set(".info-wrapper .revealer p", { y: "100%" });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out", delay: 0.85 },
      });

      tl.to(".info-col:nth-child(1) .revealer p", {
        y: "0%",
        duration: 0.75,
        stagger: 0.1,
      });

      tl.to(
        ".info-col:nth-child(2) .revealer p",
        { y: "0%", duration: 0.75, stagger: 0.1 },
        "0",
      );

      if (descriptionRef.current) {
        const descriptionParagraphs =
          descriptionRef.current.querySelectorAll("p");

        descriptionParagraphs.forEach((paragraph) => {
          const splitDescription = new SplitType(paragraph, {
            types: "lines",
            lineClass: "line",
          });

          splitDescription.lines?.forEach((line) => {
            const content = line.innerHTML;
            line.innerHTML = `<span>${content}</span>`;
          });
        });

        gsap.set("#info-description p .line span", {
          y: "100%",
          display: "block",
        });

        tl.to(
          "#info-description p .line span",
          { y: "0%", duration: 0.75, stagger: 0.05 },
          "-=2.5",
        );
      }
    },
    { scope: containerRef },
  );

  return (
    <div className="info-page" ref={containerRef}>
      <div className="info-wrapper">
        <div className="info-col">
          <div className="info-item">
            <div className="info-title">
              <div className="revealer">
                <p>Info</p>
              </div>
            </div>
            <div
              className="info-copy"
              id="info-description"
              ref={descriptionRef}
            >
              <p>
                Format Archive is a thoughtfully curated marketplace for digital
                design assets, tailored for creatives who value minimalism,
                clarity, and intentionality. Our collection includes everything
                from refined mockups and sleek UI templates to motion elements,
                sound effects, and graphic components, each crafted to elevate
                the way visual stories are told. Whether you're a designer
                shaping a brand, a developer building an interface, or an artist
                exploring new mediums, Format Archive offers tools that are as
                functional as they are beautiful, designed to seamlessly
                integrate into modern workflows and creative processes.
              </p>
              <p>
                We believe great design is about more than aesthetics; it's
                about purpose, utility, and the subtle details that create
                emotional resonance. That's why we partner with independent
                designers and studios across the globe who share our commitment
                to quality and simplicity. Every asset we feature is carefully
                selected to ensure it meets our standards for visual precision
                and usability. At Format Archive, we aim to be more than just a
                resource; we're building a creative ecosystem where thoughtful
                design lives, evolves, and empowers creators to do their best
                work with confidence and clarity.
              </p>
            </div>
          </div>
        </div>
        <div className="info-col">
          <div className="info-item">
            <div className="info-title">
              <div className="revealer">
                <p>What You Get</p>
              </div>
            </div>
            <div className="info-copy">
              <div className="revealer">
                <p>Curated digital assets</p>
              </div>
              <div className="revealer">
                <p>Ready to use</p>
              </div>
              <div className="revealer">
                <p>No subscriptions</p>
              </div>
              <div className="revealer">
                <p>Pay once, own forever</p>
              </div>
            </div>
          </div>
          <div className="info-item">
            <div className="info-title">
              <div className="revealer">
                <p>Contact</p>
              </div>
            </div>
            <div className="info-copy">
              <div className="revealer">
                <p>Creator Collaborations</p>
              </div>
              <div className="revealer">
                <p>studio@formatarchive.com</p>
              </div>
              <br />
              <div className="revealer">
                <p>Customer Support</p>
              </div>
              <div className="revealer">
                <p>support@formatarchive.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

/* --------------------------------------------------------- scroll runtime */

/** Nearest scrollable ancestor, or null when this is the page's own scroller. */
function getScrollParent(el: HTMLElement | null): HTMLElement | null {
  let node: HTMLElement | null = el?.parentElement ?? null;
  while (node) {
    const oy = getComputedStyle(node).overflowY;
    if (oy === "auto" || oy === "scroll") return node;
    node = node.parentElement;
  }
  return null;
}

function scrollToTop(scroller: HTMLElement | Window | null) {
  if (scroller instanceof HTMLElement) {
    scroller.scrollTo({ top: 0, behavior: "instant" });
  } else {
    window.scrollTo({ top: 0, behavior: "instant" });
  }
}

/**
 * Drives Lenis against the real scroll container. When embedded (registry
 * preview / demo box), the component lives inside an `overflow-y:auto`
 * element, not the window; the source's `<ReactLenis root>` would hijack the
 * window instead.
 */
function useScrollRuntime(rootElement: HTMLElement | null) {
  const [state, setState] = useState<{
    scroller: HTMLElement | Window | null;
    lenis: Lenis | null;
  }>({ scroller: null, lenis: null });

  useLayoutEffect(() => {
    if (!rootElement) return;

    const scroller = getScrollParent(rootElement);
    let lenis: Lenis | null = null;
    let previousOverflowAnchor = "";
    let previousOverscrollBehavior = "";
    let previousScrollBehavior = "";

    const isMobile = window.innerWidth <= 900;
    const scrollSettings = {
      duration: isMobile ? 1 : 1.2,
      easing: (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      touchMultiplier: isMobile ? 1.5 : 2,
      lerp: isMobile ? 0.05 : 0.1,
      wheelMultiplier: 1,
      smoothWheel: true,
      syncTouch: true,
    };

    if (scroller instanceof HTMLElement) {
      previousOverflowAnchor = scroller.style.overflowAnchor;
      previousOverscrollBehavior = scroller.style.overscrollBehavior;
      previousScrollBehavior = scroller.style.scrollBehavior;
      scroller.style.overflowAnchor = "none";
      scroller.style.overscrollBehavior = "contain";
      scroller.style.scrollBehavior = "auto";
      lenis = new Lenis({
        ...scrollSettings,
        wrapper: scroller,
        content: rootElement,
      });
    } else {
      lenis = new Lenis(scrollSettings);
    }

    const ticker = (time: number) => lenis?.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);
    setState({ scroller: scroller ?? window, lenis });

    return () => {
      gsap.ticker.remove(ticker);
      lenis?.destroy();
      if (scroller instanceof HTMLElement) {
        scroller.style.overflowAnchor = previousOverflowAnchor;
        scroller.style.overscrollBehavior = previousOverscrollBehavior;
        scroller.style.scrollBehavior = previousScrollBehavior;
      }
      setState({ scroller: null, lenis: null });
    };
  }, [rootElement]);

  return state;
}

/* ------------------------------------------------------------------- shell */

function renderRoute(pathname: string) {
  if (pathname === "/") return <HomePage />;
  if (pathname === "/catalogue") return <CataloguePage />;
  if (pathname.startsWith("/catalogue/")) {
    return <ProductDetailPage slug={pathname.slice("/catalogue/".length)} />;
  }
  if (pathname === "/archive") return <ArchivePage />;
  if (pathname === "/editorial") return <EditorialPage />;
  if (pathname.startsWith("/editorial/")) {
    return <ArticleDetailPage slug={pathname.slice("/editorial/".length)} />;
  }
  if (pathname === "/info") return <InfoPage />;
  return <HomePage />;
}

function RouteLayer({
  pathname,
  isOverlay,
  layerRef,
}: {
  pathname: string;
  isOverlay: boolean;
  layerRef: (node: HTMLDivElement | null) => void;
}) {
  return (
    <div className={`page ${isOverlay ? "page-overlay" : ""}`} ref={layerRef}>
      <div className="page-wrapper">{renderRoute(pathname)}</div>
    </div>
  );
}

function ArchiveCommerceShell({
  initialPath,
  scroller,
  lenis,
}: {
  initialPath: string;
  scroller: HTMLElement | Window;
  lenis: Lenis;
}) {
  const { isCartOpen } = useCart();
  const [current, setCurrent] = useState(normalizePath(initialPath));
  const [incoming, setIncoming] = useState<string | null>(null);
  const layerNodes = useRef<Record<string, HTMLDivElement | null>>({});
  const isCartOpenRef = useRef(isCartOpen);
  isCartOpenRef.current = isCartOpen;

  const navigate = useCallback(
    (to: string) => {
      const target = normalizePath(to);
      if (target === current || incoming) return;
      if (isCartOpenRef.current) {
        setTimeout(() => {
          setIncoming((pending) => pending ?? target);
        }, 500);
      } else {
        setIncoming(target);
      }
    },
    [current, incoming],
  );

  useGSAP(
    () => {
      if (!incoming) return;
      const oldLayer = layerNodes.current[current];
      const newLayer = layerNodes.current[incoming];
      if (!newLayer) return;

      const scrollTop =
        scroller instanceof HTMLElement ? scroller.scrollTop : window.scrollY;

      lenis.stop();

      gsap.set(newLayer, {
        top: scrollTop,
        clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
      });

      const tl = gsap.timeline({
        onComplete: () => {
          setCurrent(incoming);
          setIncoming(null);
          scrollToTop(scroller);
          lenis.start();
          requestAnimationFrame(() => {
            const settled = layerNodes.current[incoming];
            if (settled) gsap.set(settled, { clearProps: "all" });
          });
        },
      });

      if (oldLayer) {
        tl.to(
          oldLayer,
          {
            y: "-35%",
            opacity: 0.2,
            duration: TRANSITION_DURATION,
            ease: "acpSlide",
          },
          0,
        );
      }
      tl.to(
        newLayer,
        {
          clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
          duration: TRANSITION_DURATION,
          ease: "acpSlide",
        },
        0,
      );
    },
    { dependencies: [incoming] },
  );

  const routerValue = useMemo<RouterValue>(
    () => ({
      pathname: incoming ?? current,
      navigate,
      isAnimating: Boolean(incoming),
    }),
    [incoming, current, navigate],
  );

  const layers = incoming ? [current, incoming] : [current];

  return (
    <RouterContext.Provider value={routerValue}>
      <Menu />
      <Cart />
      <div className="acp-viewport">
        {layers.map((route, index) => (
          <RouteLayer
            key={route}
            pathname={route}
            isOverlay={Boolean(incoming) && index === 1}
            layerRef={(node) => {
              layerNodes.current[route] = node;
            }}
          />
        ))}
      </div>
    </RouterContext.Provider>
  );
}

/* --------------------------------------------------------------- top level */

export interface ArchiveCommercePageProps {
  assetBase?: string;
  initialPath?: string;
  className?: string;
  style?: CSSProperties;
}

export default function ArchiveCommercePage({
  assetBase = DEFAULT_ASSET_BASE,
  initialPath = "/",
  className = "",
  style,
}: ArchiveCommercePageProps) {
  const normalizedAssetBase = assetBase.replace(/\/$/, "");
  const [rootElement, setRootElement] = useState<HTMLElement | null>(null);
  const { scroller, lenis } = useScrollRuntime(rootElement);
  const styles = useMemo(
    () => getArchiveCommercePageStyles(normalizedAssetBase),
    [normalizedAssetBase],
  );

  return (
    <ASSET_CONTEXT.Provider value={normalizedAssetBase}>
      <main
        ref={setRootElement}
        className={`archive-commerce-page ${className}`.trim()}
        style={style}
      >
        {/** biome-ignore lint/security/noDangerouslySetInnerHtml: scoped template stylesheet */}
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        {rootElement && scroller && lenis ? (
          <CartProvider>
            <ArchiveCommerceShell
              key={initialPath}
              initialPath={initialPath}
              scroller={scroller}
              lenis={lenis}
            />
          </CartProvider>
        ) : null}
      </main>
    </ASSET_CONTEXT.Provider>
  );
}
