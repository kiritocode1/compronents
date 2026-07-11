"use client";

import { useGSAP } from "@gsap/react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ReactLenis, { useLenis } from "lenis/react";
import { ArrowRight } from "lucide-react";
import {
  type ComponentType,
  type CSSProperties,
  createContext,
  type ElementType,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BiSolidQuoteLeft } from "react-icons/bi";
import {
  Link,
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import SplitType from "split-type";
import { getMarch2025TemplateStyles } from "./styles";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const DEFAULT_ASSET_BASE = "https://ui.aryank.space/assets/march-2025-template";

const ASSET_CONTEXT = createContext(DEFAULT_ASSET_BASE);
const TRANSITION_GRID = Array.from({ length: 10 }, (_, rowIndex) => ({
  id: `row-${rowIndex}`,
  rowIndex,
  blocks: Array.from({ length: 11 }, (__, blockIndex) => ({
    id: `block-${rowIndex}-${blockIndex}`,
  })),
}));

export const MARCH_2025_TEMPLATE_ROUTES = [
  { path: "/", label: "Home" },
  { path: "/work", label: "Work" },
  { path: "/sample-project", label: "Project" },
  { path: "/about", label: "About" },
  { path: "/contact", label: "Contact" },
  { path: "/faq", label: "FAQ" },
] as const;

export interface March2025TemplateProps {
  assetBase?: string;
  initialPath?: (typeof MARCH_2025_TEMPLATE_ROUTES)[number]["path"];
  className?: string;
  style?: CSSProperties;
}

function normalizeAssetBase(assetBase: string) {
  return assetBase.replace(/\/$/, "");
}

function joinAsset(base: string, pathname: string) {
  return `${normalizeAssetBase(base)}/${pathname.replace(/^\/+/, "")}`;
}

function useAssetResolver() {
  const assetBase = useContext(ASSET_CONTEXT);
  return useMemo(
    () => (pathname: string) => joinAsset(assetBase, pathname),
    [assetBase],
  );
}

function getQueryRoot(element: HTMLElement | null) {
  return element?.closest(".march-2025-template") ?? document;
}

interface ProjectItem {
  id: number;
  title: string;
  description: string;
  image: string;
}

interface WorkItem {
  id: number;
  title: string;
  category: string;
  image: string;
}

interface ReviewItem {
  id: number;
  copy: string;
  author: string;
  image: string;
}

const faqs = [
  {
    question: "What types of films do you specialize in?",
    answer:
      "I specialize in narrative short films, documentaries, and branded content. My focus is on strong storytelling and cinematic visuals.",
  },
  {
    question: "Are you available for freelance or commissioned work?",
    answer:
      "Yes, I'm open to freelance and commissioned projects. Feel free to reach out through the contact form to discuss your vision.",
  },
  {
    question: "Do you handle both filming and post-production?",
    answer:
      "Absolutely. I provide end-to-end services, including cinematography, editing, color grading, and sound design.",
  },
  {
    question: "What equipment do you use?",
    answer:
      "I shoot with industry-standard gear including 4K cameras, professional audio equipment, and high-end editing software.",
  },
  {
    question: "Can you travel for shoots?",
    answer:
      "Yes, I'm available for both local and international projects. Travel logistics can be discussed during the project planning phase.",
  },
  {
    question: "Do you collaborate with other creatives?",
    answer:
      "Definitely. I often work with writers, actors, musicians, and other filmmakers to bring projects to life collaboratively.",
  },
  {
    question: "How long does it take to complete a project?",
    answer:
      "Timelines vary by scope, but short films typically take 3 to 6 weeks. We'll set a schedule that aligns with your goals and deadlines.",
  },
  {
    question: "Can you help develop a concept or script?",
    answer:
      "Yes, I offer creative development services including concept ideation, scripting, and storyboarding to shape your project from scratch.",
  },
  {
    question: "Where can I view your previous work?",
    answer:
      "You can explore my film projects on the portfolio page. Each listing includes a short description, trailer, or full version when available.",
  },
  {
    question: "How can I contact you for a project?",
    answer:
      "You can use the contact form or email listed on the site. I aim to respond to all inquiries within 48 hours.",
  },
];

function useProjects() {
  const asset = useAssetResolver();
  return useMemo<ProjectItem[]>(
    () => [
      {
        id: 1,
        title: "Fragments of Light",
        description: "Short film on self-discovery",
        image: asset("work/work-1.jpg"),
      },
      {
        id: 2,
        title: "Market Pulse",
        description: "Street life, raw and real",
        image: asset("work/work-2.jpg"),
      },
      {
        id: 3,
        title: "The Stillness Project",
        description: "Visual ode to silence",
        image: asset("work/work-3.jpg"),
      },
      {
        id: 4,
        title: "Chroma/City",
        description: "Urban color in motion",
        image: asset("work/work-4.jpg"),
      },
      {
        id: 5,
        title: "Echoes of Silence",
        description: "Grief told through memory",
        image: asset("work/work-5.jpg"),
      },
    ],
    [asset],
  );
}

function useWorkList() {
  const asset = useAssetResolver();
  return useMemo<WorkItem[]>(
    () => [
      {
        id: 1,
        title: "Fragments of Light",
        category: "Short Film",
        image: asset("work/work-1.jpg"),
      },
      {
        id: 2,
        title: "Market Pulse",
        category: "Documentary",
        image: asset("work/work-2.jpg"),
      },
      {
        id: 3,
        title: "The Stillness Project",
        category: "Experimental",
        image: asset("work/work-3.jpg"),
      },
      {
        id: 4,
        title: "Chroma/City",
        category: "Branded Content",
        image: asset("work/work-4.jpg"),
      },
      {
        id: 5,
        title: "Echoes of Silence",
        category: "Narrative Drama",
        image: asset("work/work-5.jpg"),
      },
    ],
    [asset],
  );
}

function useReviews() {
  const asset = useAssetResolver();
  return useMemo<ReviewItem[]>(
    () => [
      {
        id: 1,
        copy: "Working with you was a seamless experience. The visuals were stunning, and the storytelling felt incredibly personal.",
        author: "Ava Reynolds",
        image: asset("reviews/review-1.jpg"),
      },
      {
        id: 2,
        copy: "Your direction brought our brand to life. Every frame had purpose and emotion, couldn't be happier with the result.",
        author: "Liam Carter",
        image: asset("reviews/review-2.jpg"),
      },
      {
        id: 3,
        copy: "Truly professional, creative, and detail-oriented. You made our vision clearer and better than we imagined.",
        author: "Sophie Nguyen",
        image: asset("reviews/review-3.jpg"),
      },
    ],
    [asset],
  );
}

interface AnimatedCopyProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  stagger?: number;
  lineSelector?: string;
  animateOnScroll?: boolean;
  direction?: "top" | "bottom";
  tag?: ElementType;
}

function AnimatedCopy({
  children,
  className = "",
  delay = 0,
  duration = 1,
  ease = "power4.out",
  stagger = 0.05,
  lineSelector = "",
  animateOnScroll = true,
  direction = "bottom",
  tag = "p",
}: AnimatedCopyProps) {
  const copyRef = useRef<HTMLElement | null>(null);
  const [copyId, setCopyId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const textSplitRef = useRef<SplitType | null>(null);

  useEffect(() => {
    setCopyId(`copy-${Math.floor(Math.random() * 10000)}`);
  }, []);

  useEffect(() => {
    if (!copyId || !copyRef.current) return;

    const lineClass = `line-${copyId}`;
    const text = new SplitType(copyRef.current, {
      types: "lines",
      lineClass,
    });

    textSplitRef.current = text;

    const selector = lineSelector || `.${lineClass}`;
    const lines = getQueryRoot(copyRef.current).querySelectorAll(selector);

    lines.forEach((line) => {
      const content = line.innerHTML;
      line.innerHTML = `<span class="line-inner-${copyId}">${content}</span>`;
    });

    const initialY = direction === "top" ? "-100%" : "100%";

    gsap.set(`.line-inner-${copyId}`, {
      y: initialY,
      display: "block",
    });

    setIsInitialized(true);

    return () => {
      textSplitRef.current?.revert();
    };
  }, [copyId, lineSelector, direction]);

  useGSAP(
    () => {
      if (!isInitialized || !copyRef.current) return;

      const tl = gsap.timeline({
        defaults: {
          ease,
          duration,
        },
        ...(animateOnScroll
          ? {
              scrollTrigger: {
                trigger: copyRef.current,
                start: "top 80%",
                toggleActions: "play none none none",
              },
            }
          : {}),
      });

      tl.to(`.line-inner-${copyId}`, {
        y: "0%",
        stagger,
        delay,
      });

      return () => {
        if (animateOnScroll) {
          ScrollTrigger.getAll()
            .filter((st) => st.vars.trigger === copyRef.current)
            .forEach((st) => {
              st.kill();
            });
        }
      };
    },
    {
      scope: copyRef,
      dependencies: [
        isInitialized,
        animateOnScroll,
        delay,
        duration,
        ease,
        stagger,
        direction,
      ],
    },
  );

  const Tag = tag;

  return (
    <Tag
      ref={copyRef}
      className={`animated-copy ${className}`}
      data-copy-id={copyId ?? undefined}
    >
      {children}
    </Tag>
  );
}

export function AnimatedH1({
  children,
  className = "",
  delay = 0,
  duration = 1,
  ease = "power4.out",
  stagger = 0.1,
  lineSelector = "",
  animateOnScroll = false,
  direction = "bottom",
}: Omit<AnimatedCopyProps, "tag">) {
  return (
    <AnimatedCopy
      tag="h1"
      className={`animated-h1 ${className}`}
      delay={delay}
      duration={duration}
      ease={ease}
      stagger={stagger}
      lineSelector={lineSelector}
      animateOnScroll={animateOnScroll}
      direction={direction}
    >
      {children}
    </AnimatedCopy>
  );
}

const lerp = (start: number, end: number, factor: number) =>
  start + (end - start) * factor;

function ParallaxImage({
  src,
  alt,
  speed = 0.2,
}: {
  src: string;
  alt: string;
  speed?: number;
}) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const bounds = useRef<{
    top: number;
    bottom: number;
    height: number;
  } | null>(null);
  const currentTranslateY = useRef(0);
  const targetTranslateY = useRef(0);
  const rafId = useRef<number | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 900);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const updateBounds = () => {
      if (imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
        bounds.current = {
          top: rect.top + window.scrollY,
          bottom: rect.bottom + window.scrollY,
          height: rect.height,
        };
      }
    };

    updateBounds();
    window.addEventListener("resize", updateBounds);

    const animate = () => {
      if (imageRef.current && bounds.current) {
        currentTranslateY.current = lerp(
          currentTranslateY.current,
          targetTranslateY.current,
          0.1,
        );

        if (
          Math.abs(currentTranslateY.current - targetTranslateY.current) > 0.01
        ) {
          imageRef.current.style.transform = `translateY(${currentTranslateY.current}px) scale(1.5)`;
        }
      }
      rafId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", updateBounds);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isDesktop]);

  useLenis(({ scroll }: { scroll: number }) => {
    if (!isDesktop || !bounds.current) return;

    const windowHeight = window.innerHeight;
    const elementMiddle = bounds.current.top + bounds.current.height / 2;
    const windowMiddle = scroll + windowHeight / 2;
    const distanceFromCenter = windowMiddle - elementMiddle;

    targetTranslateY.current = distanceFromCenter * speed;
  });

  return (
    <img
      ref={imageRef}
      src={src}
      alt={alt}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        willChange: isDesktop ? "transform" : "auto",
        transform: isDesktop ? "translateY(0) scale(1.5)" : "none",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    />
  );
}

function calculateRandomBlockDelay(rowIndex: number, totalRows: number) {
  const blockDelay = Math.random() * 0.5;
  const rowDelay = (totalRows - rowIndex - 1) * 0.05;
  return blockDelay + rowDelay;
}

function withTransition(Page: ComponentType) {
  return function TransitionPage() {
    return (
      <>
        <Page />

        <div className="blocks-container transition-in">
          {TRANSITION_GRID.map(({ id, rowIndex, blocks }) => (
            <div className="row" key={id}>
              {blocks.map((block) => (
                <motion.div
                  key={block.id}
                  className="block"
                  initial={{ scaleY: 1 }}
                  animate={{ scaleY: 0 }}
                  exit={{ scaleY: 0 }}
                  transition={{
                    duration: 1,
                    ease: [0.22, 1, 0.36, 1],
                    delay: calculateRandomBlockDelay(rowIndex, 10),
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="blocks-container transition-out">
          {TRANSITION_GRID.map(({ id, rowIndex, blocks }) => (
            <div className="row" key={id}>
              {blocks.map((block) => (
                <motion.div
                  key={block.id}
                  className="block"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 0 }}
                  exit={{ scaleY: 1 }}
                  transition={{
                    duration: 1,
                    ease: [0.22, 1, 0.36, 1],
                    delay: calculateRandomBlockDelay(rowIndex, 10),
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </>
    );
  };
}

function Menu() {
  const location = useLocation();
  const menuContainer = useRef<HTMLDivElement | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuAnimation = useRef<gsap.core.Timeline | null>(null);
  const menuLinksAnimation = useRef<gsap.core.Timeline | null>(null);
  const menuBarAnimation = useRef<gsap.core.Timeline | null>(null);
  const lastScrollY = useRef(0);
  const [windowWidth, setWindowWidth] = useState(1200);
  const [shouldDelayClose, setShouldDelayClose] = useState(false);
  const previousPathRef = useRef(location.pathname);
  const scrollPositionRef = useRef(0);

  const toggleBodyScroll = useCallback((disableScroll: boolean) => {
    if (typeof window === "undefined") return;

    if (disableScroll) {
      scrollPositionRef.current = window.pageYOffset;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollPositionRef.current}px`;
      document.body.style.width = "100%";
    } else {
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("position");
      document.body.style.removeProperty("top");
      document.body.style.removeProperty("width");
      window.scrollTo(0, scrollPositionRef.current);
    }
  }, []);

  const closeMenu = useCallback(() => {
    if (!isMenuOpen) return;
    const icon = menuContainer.current?.querySelector(".hamburger-icon");
    icon?.classList.remove("active");
    setIsMenuOpen(false);
    toggleBodyScroll(false);
  }, [isMenuOpen, toggleBodyScroll]);

  const toggleMenu = useCallback(() => {
    const icon = menuContainer.current?.querySelector(".hamburger-icon");
    icon?.classList.toggle("active");
    const newMenuState = !isMenuOpen;
    setIsMenuOpen(newMenuState);
    toggleBodyScroll(newMenuState);
  }, [isMenuOpen, toggleBodyScroll]);

  const handleLinkClick = useCallback(
    (path: string) => {
      if (path !== location.pathname) {
        setShouldDelayClose(true);
      }
    },
    [location.pathname],
  );

  useEffect(() => {
    if (location.pathname !== previousPathRef.current && shouldDelayClose) {
      const timer = window.setTimeout(() => {
        closeMenu();
        setShouldDelayClose(false);
      }, 700);

      previousPathRef.current = location.pathname;
      return () => clearTimeout(timer);
    }

    previousPathRef.current = location.pathname;
  }, [location.pathname, shouldDelayClose, closeMenu]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!menuContainer.current) return;

    const ctx = gsap.context(() => {
      gsap.set(".menu-link-item-holder", { y: 125 });

      menuAnimation.current = gsap.timeline({ paused: true }).to(".menu", {
        duration: 1,
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        ease: "power4.inOut",
      });

      const heightValue =
        windowWidth < 1000 ? "calc(100% - 2.5em)" : "calc(100% - 4em)";

      menuBarAnimation.current = gsap
        .timeline({ paused: true })
        .to(".menu-bar", {
          duration: 1,
          height: heightValue,
          ease: "power4.inOut",
        });

      menuLinksAnimation.current = gsap
        .timeline({ paused: true })
        .to(".menu-link-item-holder", {
          y: 0,
          duration: 1.25,
          stagger: 0.075,
          ease: "power3.inOut",
          delay: 0.125,
        });
    }, menuContainer);

    return () => ctx.revert();
  }, [windowWidth]);

  useEffect(() => {
    if (isMenuOpen) {
      menuAnimation.current?.play();
      menuBarAnimation.current?.play();
      menuLinksAnimation.current?.play();
    } else {
      menuAnimation.current?.reverse();
      menuBarAnimation.current?.reverse();
      menuLinksAnimation.current?.reverse();
    }
  }, [isMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      if (isMenuOpen) return;

      const currentScrollY = window.scrollY;
      const menuBar = menuContainer.current?.querySelector(".menu-bar");

      if (menuBar) {
        gsap.to(menuBar, {
          y: currentScrollY > lastScrollY.current ? -200 : 0,
          duration: 1,
          ease: "power2.out",
        });
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    return () => {
      if (document.body.style.position === "fixed") {
        toggleBodyScroll(false);
      }
    };
  }, [toggleBodyScroll]);

  return (
    <div className="menu-container" ref={menuContainer}>
      <div className="menu-bar">
        <div className="menu-bar-container">
          <div className="menu-logo">
            <Link to="/" onClick={closeMenu}>
              <h4>Palmer</h4>
            </Link>
          </div>
          <div className="menu-actions">
            <div className="menu-toggle">
              <button
                className="hamburger-icon"
                type="button"
                onClick={toggleMenu}
                aria-label="Toggle menu"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="menu">
        <div className="menu-col">
          <div className="menu-sub-col">
            <div className="menu-links">
              {MARCH_2025_TEMPLATE_ROUTES.filter(
                (item) => item.path !== "/sample-project",
              ).map((link) => (
                <div key={link.path} className="menu-link-item">
                  <div className="menu-link-item-holder">
                    <Link
                      className="menu-link"
                      to={link.path}
                      onClick={() => handleLinkClick(link.path)}
                    >
                      {link.label}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactForm() {
  return (
    <div className="contact-form">
      <div className="contact-form-row">
        <div className="contact-form-row-copy-item">
          <p className="primary sm">Let's create together</p>
        </div>
        <div className="contact-form-row-copy-item">
          <p className="primary sm">(Scene 07)</p>
        </div>
        <div className="contact-form-row-copy-item">
          <p className="primary sm">&copy; 2025</p>
        </div>
      </div>

      <div className="contact-form-row">
        <div className="contact-form-col">
          <div className="contact-form-header">
            <h3>Start a Conversation</h3>

            <p>
              Have a story in mind? Let's bring it to life. I'd love to hear
              what you're working on and explore how we can collaborate.
            </p>
          </div>

          <div className="contact-form-availability">
            <p className="primary sm">Available for Freelance</p>
            <p className="primary sm">Clients worldwide</p>
          </div>
        </div>

        <div className="contact-form-col">
          <div className="form-item">
            <input type="text" placeholder="Name" />
          </div>

          <div className="form-item">
            <input type="text" placeholder="Email" />
          </div>

          <div className="form-item">
            <textarea rows={6} placeholder="Message" />
          </div>

          <div className="form-item">
            <button className="btn" type="button">
              Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="footer">
      <div className="footer-row">
        <div className="footer-contact">
          <h3>
            Let's Collaborate <br />
            film<span>@</span>nicopalmer.com
          </h3>

          <p className="secondary">
            From short films to full productions, I'm always open to creative
            collaborations. Feel free to reach out anytime.
          </p>

          <Link to="/contact" className="btn">
            Get in Touch
          </Link>
        </div>

        <div className="footer-nav">
          {MARCH_2025_TEMPLATE_ROUTES.filter(
            (item) => item.path !== "/sample-project",
          ).map((item) => (
            <Link to={item.path} className="footer-nav-item" key={item.path}>
              <span>{item.label}</span>
              <span>&#8594;</span>
            </Link>
          ))}
        </div>
      </div>
      <div className="footer-row">
        <div className="footer-header">
          <h1>Nico</h1>
          <h1>Palmer</h1>
        </div>

        <div className="footer-copyright-line">
          <p className="primary sm">&copy; Nico Palmer 2025</p>
          <p className="primary sm">Website Template by BLANK</p>
        </div>
      </div>
    </div>
  );
}

function FAQContainer({
  title = true,
  fullWidth = false,
}: {
  title?: boolean;
  fullWidth?: boolean;
}) {
  const [activeIndices, setActiveIndices] = useState<number[]>([]);
  const iconRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const contentRefs = useRef<Array<HTMLDivElement | null>>([]);
  const faqItemsRef = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    iconRefs.current = iconRefs.current.slice(0, faqs.length);
    contentRefs.current = contentRefs.current.slice(0, faqs.length);
    faqItemsRef.current = faqItemsRef.current.slice(0, faqs.length);

    gsap.fromTo(
      faqItemsRef.current,
      {
        opacity: 0,
        y: 20,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.1,
        delay: 1.25,
      },
    );
  }, []);

  const toggleFAQ = (index: number) => {
    if (activeIndices.includes(index)) {
      gsap.to(iconRefs.current[index], {
        rotation: 0,
        duration: 0.3,
        ease: "power2.out",
      });

      gsap.to(contentRefs.current[index], {
        height: 0,
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
        paddingTop: 0,
        paddingBottom: 0,
      });

      setActiveIndices(activeIndices.filter((i) => i !== index));
    } else {
      gsap.to(iconRefs.current[index], {
        rotation: 90,
        duration: 0.3,
        ease: "power2.out",
      });

      const contentHeight = contentRefs.current[index]?.scrollHeight ?? 0;

      gsap.to(contentRefs.current[index], {
        height: contentHeight + 24,
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
        paddingTop: "0.5em",
        paddingBottom: "0.5em",
      });

      setActiveIndices([...activeIndices, index]);
    }
  };

  return (
    <div className="faq-container">
      <div className={`faq-wrapper ${fullWidth ? "full-width" : "contained"}`}>
        {title && (
          <div className="faq-title">
            <AnimatedCopy tag="h2" animateOnScroll={false} delay={1}>
              Frequently <br /> Asked Questions
            </AnimatedCopy>
          </div>
        )}

        <div className="faq-items">
          {faqs.map((item, index) => (
            <div
              key={item.question}
              className="faq-item"
              ref={(el) => {
                faqItemsRef.current[index] = el;
              }}
            >
              <button
                type="button"
                className="faq-question"
                onClick={() => toggleFAQ(index)}
              >
                <h3>{item.question}</h3>
                <span
                  className="faq-icon"
                  ref={(el) => {
                    iconRefs.current[index] = el;
                  }}
                >
                  <ArrowRight size={20} />
                </span>
              </button>
              <div
                className="faq-answer"
                ref={(el) => {
                  contentRefs.current[index] = el;
                }}
                style={{ height: 0, opacity: 0, overflow: "hidden" }}
              >
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Reviews() {
  const reviews = useReviews();
  const [activeReview, setActiveReview] = useState(0);
  const reviewsContainerRef = useRef<HTMLElement | null>(null);
  const initialRenderRef = useRef(true);
  const animationInProgressRef = useRef(false);
  const hasInitialClickRef = useRef(false);

  useEffect(() => {
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }

    if (animationInProgressRef.current) return;
    animationInProgressRef.current = true;

    const currentReviewItems =
      reviewsContainerRef.current?.querySelectorAll(".review-item") ?? [];
    if (currentReviewItems.length > 0) {
      if (!hasInitialClickRef.current) {
        hasInitialClickRef.current = true;
        const initialReviewCopy =
          currentReviewItems[0].querySelector("#review-copy");
        const initialReviewAuthor =
          currentReviewItems[0].querySelector("#review-author");

        if (initialReviewCopy && initialReviewAuthor) {
          new SplitType(initialReviewCopy as HTMLElement, {
            types: "lines",
            lineClass: "line",
          });

          new SplitType(initialReviewAuthor as HTMLElement, {
            types: "lines",
            lineClass: "line",
          });

          initialReviewCopy.querySelectorAll(".line").forEach((line) => {
            const content = line.innerHTML;
            line.innerHTML = `<span>${content}</span>`;
          });

          initialReviewAuthor.querySelectorAll(".line").forEach((line) => {
            const content = line.innerHTML;
            line.innerHTML = `<span>${content}</span>`;
          });
        }
      }

      const currentReview = currentReviewItems[currentReviewItems.length - 1];
      const lineSpans = currentReview.querySelectorAll(".line span");

      gsap.to(lineSpans, {
        yPercent: -110,
        duration: 0.7,
        stagger: 0.05,
        ease: "power4.in",
      });
    }

    const newReviewItem = document.createElement("div");
    newReviewItem.className = "review-item";

    newReviewItem.innerHTML = `
      <h4 id="review-copy">${reviews[activeReview].copy}</h4>
      <h4 id="review-author">- ${reviews[activeReview].author}</h4>
    `;

    if (reviewsContainerRef.current) {
      reviewsContainerRef.current.appendChild(newReviewItem);

      const newReviewCopy = newReviewItem.querySelector("#review-copy");
      const newReviewAuthor = newReviewItem.querySelector("#review-author");

      if (!newReviewCopy || !newReviewAuthor) return;

      new SplitType(newReviewCopy as HTMLElement, {
        types: "lines",
        lineClass: "line",
      });

      new SplitType(newReviewAuthor as HTMLElement, {
        types: "lines",
        lineClass: "line",
      });

      const newLineSpans: HTMLElement[] = [];

      newReviewCopy.querySelectorAll(".line").forEach((line) => {
        const content = line.innerHTML;
        line.innerHTML = `<span>${content}</span>`;
        const span = line.querySelector("span");
        if (span) newLineSpans.push(span);
      });

      newReviewAuthor.querySelectorAll(".line").forEach((line) => {
        const content = line.innerHTML;
        line.innerHTML = `<span>${content}</span>`;
        const span = line.querySelector("span");
        if (span) newLineSpans.push(span);
      });

      gsap.set(newLineSpans, { yPercent: 110 });

      gsap.to(newLineSpans, {
        yPercent: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power4.out",
        delay: 0.7,
        onComplete: () => {
          const reviewItems =
            reviewsContainerRef.current?.querySelectorAll(".review-item") ?? [];
          if (reviewItems.length > 1) {
            for (let i = 0; i < reviewItems.length - 1; i++) {
              reviewItems[i].remove();
            }
          }
          animationInProgressRef.current = false;
        },
      });
    }
  }, [activeReview, reviews]);

  const handleReviewClick = (index: number) => {
    if (index !== activeReview && !animationInProgressRef.current) {
      setActiveReview(index);
    }
  };

  return (
    <section className="reviews" ref={reviewsContainerRef}>
      <h3 id="quote-icon">
        <BiSolidQuoteLeft />
      </h3>

      <div className="review-item">
        <h4 id="review-copy">{reviews[activeReview].copy}</h4>
        <h4 id="review-author">- {reviews[activeReview].author}</h4>
      </div>

      <div className="reviews-list">
        {reviews.map((review, index) => (
          <button
            key={review.id}
            type="button"
            aria-label={`Show review by ${review.author}`}
            className={`review-thumbnail ${
              index === activeReview ? "active" : ""
            }`}
            onClick={() => handleReviewClick(index)}
          >
            <img src={review.image} alt={`Review by ${review.author}`} />
          </button>
        ))}
      </div>
    </section>
  );
}

function HomePage() {
  const asset = useAssetResolver();
  const workItems = useWorkList();
  const stickyTitlesRef = useRef<HTMLElement | null>(null);
  const titlesRef = useRef<Array<HTMLHeadingElement | null>>([]);
  const stickyWorkHeaderRef = useRef<HTMLElement | null>(null);
  const homeWorkRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleResize = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", handleResize);

    const stickySection = stickyTitlesRef.current;
    const titles = titlesRef.current.filter(Boolean);

    if (!stickySection || titles.length !== 3) {
      window.removeEventListener("resize", handleResize);
      return;
    }

    gsap.set(titles[0], { opacity: 1, scale: 1 });
    gsap.set(titles[1], { opacity: 0, scale: 0.75 });
    gsap.set(titles[2], { opacity: 0, scale: 0.75 });

    const pinTrigger = ScrollTrigger.create({
      trigger: stickySection,
      start: "top top",
      end: `+=${window.innerHeight * 5}`,
      pin: true,
      pinSpacing: true,
    });

    const masterTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: stickySection,
        start: "top top",
        end: `+=${window.innerHeight * 4}`,
        scrub: 0.5,
      },
    });

    masterTimeline
      .to(
        titles[0],
        {
          opacity: 0,
          scale: 0.75,
          duration: 0.3,
          ease: "power2.out",
        },
        1,
      )
      .to(
        titles[1],
        {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          ease: "power2.in",
        },
        1.25,
      )
      .to(
        titles[1],
        {
          opacity: 0,
          scale: 0.75,
          duration: 0.3,
          ease: "power2.out",
        },
        2.5,
      )
      .to(
        titles[2],
        {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          ease: "power2.in",
        },
        2.75,
      );

    const workHeaderSection = stickyWorkHeaderRef.current;
    const homeWorkSection = homeWorkRef.current;

    let workHeaderPinTrigger: ScrollTrigger | undefined;
    if (workHeaderSection && homeWorkSection) {
      workHeaderPinTrigger = ScrollTrigger.create({
        trigger: workHeaderSection,
        start: "top top",
        endTrigger: homeWorkSection,
        end: "bottom bottom",
        pin: true,
        pinSpacing: false,
      });
    }

    return () => {
      pinTrigger.kill();
      workHeaderPinTrigger?.kill();
      masterTimeline.scrollTrigger?.kill();
      masterTimeline.kill();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <ReactLenis root>
      <div className="page home">
        <section className="hero">
          <div className="hero-img">
            <img src={asset("home/hero.jpg")} alt="" />
          </div>

          <div className="hero-header">
            <AnimatedCopy tag="h1" animateOnScroll={false} delay={0.7}>
              Nico
            </AnimatedCopy>
            <AnimatedCopy tag="h1" animateOnScroll={false} delay={0.8}>
              Palmer
            </AnimatedCopy>
          </div>
        </section>

        <section ref={stickyTitlesRef} className="sticky-titles">
          <div className="sticky-titles-nav">
            <p className="primary sm">About Me</p>
            <p className="primary sm">Let's Connect</p>
          </div>
          <div className="sticky-titles-footer">
            <p className="primary sm">Storytelling Through Film</p>
            <p className="primary sm">Open to Collaborations</p>
          </div>
          <h2
            ref={(el) => {
              titlesRef.current[0] = el;
            }}
          >
            I craft films that tell human stories with cinematic depth.
          </h2>
          <h2
            ref={(el) => {
              titlesRef.current[1] = el;
            }}
          >
            Each project is driven by emotion, clarity, and vision.
          </h2>
          <h2
            ref={(el) => {
              titlesRef.current[2] = el;
            }}
          >
            This portfolio is a glimpse into the frames that move me.
          </h2>
        </section>

        <section ref={stickyWorkHeaderRef} className="sticky-work-header">
          <AnimatedCopy tag="h1" animateOnScroll>
            Palmer selects
          </AnimatedCopy>
        </section>

        <section ref={homeWorkRef} className="home-work">
          <div className="home-work-list">
            {workItems.map((work, index) => (
              <Link
                to="/sample-project"
                key={work.id}
                className="home-work-item"
              >
                <p className="primary sm">{`${String(index + 1).padStart(
                  2,
                  "0",
                )} - ${String(workItems.length).padStart(2, "0")}`}</p>
                <h3>{work.title}</h3>
                <div className="work-item-img">
                  <img src={work.image} alt={work.title} />
                </div>
                <h4>{work.category}</h4>
              </Link>
            ))}
          </div>
        </section>

        <Reviews />

        <section className="hobbies">
          {["Camera", "Editing", "Story", "Sound"].map((item) => (
            <div className="hobby" key={item}>
              <AnimatedCopy tag="h4" animateOnScroll>
                {item}
              </AnimatedCopy>
            </div>
          ))}
        </section>

        <ContactForm />
        <Footer />
      </div>
    </ReactLenis>
  );
}

function WorkPage() {
  const projects = useProjects();
  const [activeProject, setActiveProject] = useState(projects[0]);
  const carouselDescriptionRef = useRef<HTMLDivElement | null>(null);
  const carouselTitleRef = useRef<HTMLDivElement | null>(null);
  const workSliderImgRef = useRef<HTMLDivElement | null>(null);
  const descriptionTextRef = useRef<HTMLParagraphElement | null>(null);
  const titleTextRef = useRef<HTMLHeadingElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setActiveProject(projects[0]);
  }, [projects]);

  const animateCarouselInfo = (newProject: ProjectItem) => {
    const tl = gsap.timeline();

    tl.to([descriptionTextRef.current, titleTextRef.current], {
      yPercent: -100,
      duration: 0.75,
      stagger: 0.25,
      ease: "power4.in",
    });

    tl.to(
      imageRef.current,
      {
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => {
          descriptionTextRef.current?.remove();
          titleTextRef.current?.parentElement?.remove();
          imageRef.current?.remove();

          const newDescriptionEl = document.createElement("p");
          newDescriptionEl.className = "primary sm";
          newDescriptionEl.textContent = newProject.description;

          const titleContainer = document.createElement("button");
          titleContainer.className = "project-title-container";
          titleContainer.type = "button";
          titleContainer.style.cursor = "pointer";

          const newTitleEl = document.createElement("h1");
          newTitleEl.textContent = newProject.title;

          titleContainer.onclick = () => navigate("/sample-project");
          titleContainer.appendChild(newTitleEl);

          const newImageEl = document.createElement("img");
          newImageEl.src = newProject.image;
          newImageEl.alt = newProject.title;

          gsap.set(newDescriptionEl, { yPercent: 100 });
          gsap.set(newTitleEl, { yPercent: 100 });
          gsap.set(newImageEl, { opacity: 0 });

          carouselDescriptionRef.current?.appendChild(newDescriptionEl);
          carouselTitleRef.current?.appendChild(titleContainer);
          workSliderImgRef.current?.appendChild(newImageEl);

          descriptionTextRef.current = newDescriptionEl;
          titleTextRef.current = newTitleEl;
          imageRef.current = newImageEl;

          const inTl = gsap.timeline();

          inTl.to(newImageEl, {
            opacity: 1,
            duration: 0.75,
            ease: "power2.out",
          });

          inTl.to(
            [newDescriptionEl, newTitleEl],
            {
              yPercent: 0,
              duration: 0.75,
              stagger: 0.25,
              ease: "power4.out",
            },
            "-=0.5",
          );
          setActiveProject(newProject);
        },
      },
      "-=0.5",
    );
  };

  useEffect(() => {
    if (
      carouselDescriptionRef.current &&
      carouselTitleRef.current &&
      workSliderImgRef.current
    ) {
      descriptionTextRef.current =
        carouselDescriptionRef.current.querySelector("p");

      const initialTitleLink = carouselTitleRef.current.querySelector("a");
      if (initialTitleLink) {
        const initialTitle = initialTitleLink.querySelector("h1");

        if (!initialTitle) return;

        const titleContainer = document.createElement("button");
        titleContainer.className = "project-title-container";
        titleContainer.type = "button";
        titleContainer.style.cursor = "pointer";

        const newTitle = initialTitle.cloneNode(true) as HTMLHeadingElement;
        titleContainer.appendChild(newTitle);
        titleContainer.onclick = () => navigate("/sample-project");

        initialTitleLink.parentNode?.replaceChild(
          titleContainer,
          initialTitleLink,
        );

        titleTextRef.current = newTitle;
      } else {
        titleTextRef.current = carouselTitleRef.current.querySelector("h1");
      }

      imageRef.current = workSliderImgRef.current.querySelector("img");
    }
  }, [navigate]);

  const handleWorkItemClick = (project: ProjectItem) => {
    if (project.id !== activeProject.id) {
      animateCarouselInfo(project);
    }
  };

  return (
    <div className="page work">
      <div className="work-carousel">
        <div className="work-slider-img" ref={workSliderImgRef}>
          <img src={activeProject.image} alt={activeProject.title} />
        </div>

        <div className="work-items-preview-container">
          {projects.map((project) => (
            <button
              key={project.id}
              type="button"
              aria-label={`Show ${project.title}`}
              className={`work-item ${
                activeProject.id === project.id ? "active" : ""
              }`}
              onClick={() => handleWorkItemClick(project)}
            >
              <img src={project.image} alt={project.title} />
            </button>
          ))}
        </div>

        <div className="carousel-info">
          <div className="carousel-description" ref={carouselDescriptionRef}>
            <p className="primary sm">{activeProject.description}</p>
          </div>
          <div className="carousel-title" ref={carouselTitleRef}>
            <Link to="/sample-project">
              <h1>{activeProject.title}</h1>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectPage() {
  const asset = useAssetResolver();

  return (
    <ReactLenis root>
      <div className="page project">
        <section className="project-header">
          <AnimatedCopy
            delay={1}
            animateOnScroll={false}
            className="primary sm"
          >
            Short film on self-discovery
          </AnimatedCopy>
          <AnimatedCopy tag="h2" delay={1}>
            Fragments of Light
          </AnimatedCopy>
        </section>

        <section className="project-banner-img">
          <div className="project-banner-img-wrapper">
            <ParallaxImage src={asset("project/banner.jpg")} alt="" />
          </div>
        </section>

        <section className="project-details">
          <div className="details">
            <AnimatedCopy tag="p" animateOnScroll className="primary sm">
              Overview
            </AnimatedCopy>
            <AnimatedCopy tag="h4" animateOnScroll>
              A visual meditation on identity, *Fragments of Light* explores the
              quiet journey of self-discovery through minimalism, mood, and
              motion.
            </AnimatedCopy>
          </div>

          {[
            ["Year", "2024"],
            ["Category", "Short Film"],
            ["Running Time", "6:30"],
            ["Directed by", "Nico Palmer"],
          ].map(([label, value]) => (
            <div className="details" key={label}>
              <AnimatedCopy tag="p" animateOnScroll className="primary sm">
                {label}
              </AnimatedCopy>
              <AnimatedCopy tag="h4" animateOnScroll>
                {value}
              </AnimatedCopy>
            </div>
          ))}
        </section>

        <section className="project-images">
          <div className="project-images-container">
            {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
              <div className="project-img" key={n}>
                <div className="project-img-wrapper">
                  <ParallaxImage
                    src={asset(`project/project-${n}.jpg`)}
                    alt=""
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="project-details">
          {[
            ["Editor", "Nico Palmer"],
            ["Sound Design", "Elena Brooks"],
            ["Art Director", "Milo Vance"],
            ["Producer", "Asha Lennox"],
            ["Director", "Nico Palmer"],
          ].map(([label, value]) => (
            <div className="details" key={label}>
              <AnimatedCopy tag="p" animateOnScroll className="primary sm">
                {label}
              </AnimatedCopy>
              <AnimatedCopy tag="h4" animateOnScroll>
                {value}
              </AnimatedCopy>
            </div>
          ))}
        </section>

        <section className="next-project">
          <AnimatedCopy tag="p" animateOnScroll className="primary sm">
            02 - 05
          </AnimatedCopy>
          <AnimatedCopy tag="h3" animateOnScroll>
            Next
          </AnimatedCopy>

          <div className="next-project-img">
            <div className="next-project-img-wrapper">
              <ParallaxImage src={asset("work/work-2.jpg")} alt="" />
            </div>
          </div>

          <AnimatedCopy tag="h4" animateOnScroll>
            Market Pulse
          </AnimatedCopy>
        </section>
      </div>
    </ReactLenis>
  );
}

function AboutPage() {
  const asset = useAssetResolver();

  return (
    <ReactLenis root>
      <div className="page about">
        <section className="about-header">
          <h1>Est</h1>
          <h1>1997</h1>
        </section>

        <section className="about-hero">
          <div className="about-hero-img">
            <img src={asset("about/about-hero.jpg")} alt="" />
          </div>
        </section>

        <section className="about-me-copy">
          <div className="about-me-copy-wrapper">
            <AnimatedCopy animateOnScroll tag="h3">
              I'm Nico Palmer, a filmmaker drawn to human stories, quiet
              moments, and the visual language of emotion. My work spans short
              films, experimental pieces, and cinematic visuals.
            </AnimatedCopy>

            <AnimatedCopy animateOnScroll tag="h3">
              For me, filmmaking isn't just about images, it's about what those
              images make us feel. I believe in subtlety, texture, and honesty
              in storytelling.
            </AnimatedCopy>

            <AnimatedCopy animateOnScroll tag="h3">
              Every project is a new collaboration, a new challenge, and a new
              chance to create something meaningful. If it moves someone, even
              for a second, it's done its job.
            </AnimatedCopy>
          </div>
        </section>

        <section className="services">
          <div className="services-col">
            <div className="services-banner">
              <img src={asset("about/services-banner.jpg")} alt="" />
            </div>
            <p className="primary">Crafted with Intention</p>
          </div>
          <div className="services-col">
            <h4>
              Every project is a chance to explore new visual language, push
              creative boundaries, and tell stories that feel real. I approach
              each film with care, precision, and purpose.
            </h4>

            <div className="services-list">
              {[
                [
                  "Filmmaking",
                  "From short films to personal narratives, my work is driven by emotion and atmosphere. I handle direction, cinematography, and editing, crafting each piece with a filmmaker's eye for mood, movement, and meaning.",
                ],
                [
                  "Visual Storytelling",
                  "I create visuals that speak, whether it's a quiet moment or a bold idea. My work blends aesthetic choices with story clarity, making sure the emotional core always comes through.",
                ],
                [
                  "Creative Direction",
                  "From ideation to final cut, I guide the visual and narrative tone of every project. I bring a cohesive, cinematic vision that aligns story, style, and intention, grounded in authenticity.",
                ],
              ].map(([title, copy]) => (
                <div className="service-list-row" key={title}>
                  <div className="service-list-col">
                    <h5>{title}</h5>
                  </div>
                  <div className="service-list-col">
                    <p>{copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="about-banner-img">
          <div className="about-banner-img-wrapper">
            <img src={asset("about/about-banner.jpg")} alt="" />
          </div>
        </section>

        <section className="fav-tools">
          <div className="fav-tools-header">
            <AnimatedCopy tag="p" animateOnScroll className="primary sm">
              Daily Stack
            </AnimatedCopy>
            <AnimatedCopy tag="h2" animateOnScroll delay={0.25}>
              Favourite Tools
            </AnimatedCopy>
            <AnimatedCopy
              tag="p"
              animateOnScroll
              className="secondary"
              delay={0.5}
            >
              My favorite stack includes Framer, Figma, and other cutting-edge
              technologies to ensure seamless and dynamic designs.
            </AnimatedCopy>
          </div>

          <div className="fav-tools-list">
            {[0, 1].map((row) => (
              <div className="fav-tools-list-row" key={row}>
                {[
                  ["DaVinci Resolve", "Color Grading"],
                  ["Adobe Premiere Pro", "Video Editing"],
                  ["Blackmagic Pocket", "Cinematic Shooting"],
                  ["ShotDeck", "Visual References"],
                  ["Frame.io", "Remote Collaboration"],
                  ["Celtx", "Scriptwriting Tool"],
                ]
                  .slice(row * 3, row * 3 + 3)
                  .map(([title, subtitle], index) => {
                    const assetIndex = row * 3 + index + 1;
                    return (
                      <div className="fav-tool" key={title}>
                        <div className="fav-tool-img">
                          <img
                            src={asset(`about/tool-${assetIndex}.jpg`)}
                            alt=""
                          />
                        </div>
                        <h4>{title}</h4>
                        <p className="primary sm">{subtitle}</p>
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        </section>

        <ContactForm />
        <Footer />
      </div>
    </ReactLenis>
  );
}

function FAQPage() {
  return (
    <ReactLenis root>
      <div className="page faq">
        <FAQContainer />
        <ContactForm />
        <Footer />
      </div>
    </ReactLenis>
  );
}

function ContactPage() {
  return (
    <ReactLenis root>
      <div className="page contact">
        <ContactForm />
        <Footer />
      </div>
    </ReactLenis>
  );
}

const Home = withTransition(HomePage);
const Work = withTransition(WorkPage);
const Project = withTransition(ProjectPage);
const About = withTransition(AboutPage);
const FAQ = withTransition(FAQPage);
const Contact = withTransition(ContactPage);

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!pathname) return;

    const timer = window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 1400);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}

function TemplateRoutes() {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />
      <Menu />
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/work" element={<Work />} />
          <Route path="/sample-project" element={<Project />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default function March2025Template({
  assetBase = DEFAULT_ASSET_BASE,
  initialPath = "/",
  className = "",
  style,
}: March2025TemplateProps) {
  const normalizedAssetBase = normalizeAssetBase(assetBase);
  const styles = useMemo(
    () => getMarch2025TemplateStyles(normalizedAssetBase),
    [normalizedAssetBase],
  );

  return (
    <ASSET_CONTEXT.Provider value={normalizedAssetBase}>
      <main className={`march-2025-template ${className}`.trim()} style={style}>
        <style>{styles}</style>
        <MemoryRouter key={initialPath} initialEntries={[initialPath]}>
          <TemplateRoutes />
        </MemoryRouter>
      </main>
    </ASSET_CONTEXT.Provider>
  );
}
