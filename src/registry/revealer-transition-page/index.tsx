"use client";

/**
 * Revealer Transition Page - a four route studio site with two layers of
 * transition. On arrival a solid panel scaled to full height shrinks away from
 * its top edge, wiping the page in. On navigation the browser's View Transition
 * API animates the incoming snapshot from a small centered rectangle out to the
 * full frame, so the new page grows through a window in the old one rather than
 * sliding over it. Each route then splits and staggers its own copy, by
 * character on the home hero and by word elsewhere.
 *
 * Routes run through a lightweight internal router, so the whole template is
 * one installable component with no routing dependency.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { useCallback, useEffect, useRef, useState } from "react";

import { getRevealerTransitionStyles } from "./styles";

export const DEFAULT_ASSET_BASE =
  "https://ui.aryank.space/assets/revealer-transition-page";

export const REVEALER_ROUTES = [
  { path: "/", label: "nuvoro" },
  { path: "/work", label: "work" },
  { path: "/studio", label: "studio" },
  { path: "/contact", label: "contact" },
] as const;

export type RevealerRoute = (typeof REVEALER_ROUTES)[number]["path"];

const ROUTE_SET = new Set<string>(REVEALER_ROUTES.map((r) => r.path));

function normalizePath(path: string | undefined): RevealerRoute {
  if (path && ROUTE_SET.has(path)) return path as RevealerRoute;
  return "/";
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => {
    ready: Promise<void>;
    finished: Promise<void>;
  };
};

export interface RevealerTransitionPageProps {
  assetBase?: string;
  brand?: string;
  location?: string;
  studioCopy?: string;
  contactEmails?: [string, string];
  socials?: string[];
  initialPath?: RevealerRoute;
}

export default function RevealerTransitionPage({
  assetBase = DEFAULT_ASSET_BASE,
  brand = "nuvoro",
  location = "toronto, ca",
  studioCopy = "At Nuvoro, we believe creativity is not just a skill, it is a mindset. Born from a passion for bold ideas and beautifully crafted storytelling, we are a collective of designers, strategists, and dreamers who thrive at the intersection of art and innovation. Today, we collaborate with visionary clients around the world to shape identities.",
  contactEmails = ["studio@nuvoro.com", "support@nuvoro.com"],
  socials = ["Instagram", "Twitter", "LinkedIn"],
  initialPath = "/",
}: RevealerTransitionPageProps) {
  const [path, setPath] = useState<RevealerRoute>(normalizePath(initialPath));
  const rootRef = useRef<HTMLDivElement>(null);

  const navigate = useCallback(
    (next: RevealerRoute) => {
      if (next === path) return;

      const triggerPageTransition = () => {
        document.documentElement.animate(
          [
            { clipPath: "polygon(25% 75%, 75% 75%, 75% 75%, 25% 75%)" },
            { clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)" },
          ],
          {
            duration: 2000,
            easing: "cubic-bezier(0.9, 0, 0.1, 1)",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      };

      const doc = document as ViewTransitionDocument;
      if (typeof doc.startViewTransition !== "function") {
        setPath(next);
        return;
      }

      const transition = doc.startViewTransition(() => {
        setPath(next);
      });
      transition.ready.then(triggerPageTransition).catch(() => {});
    },
    [path],
  );

  useEffect(() => {
    setPath(normalizePath(initialPath));
  }, [initialPath]);

  // Both the revealer wipe and the per-route copy split re-run on every route,
  // matching the source, where each page was a fresh mount.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(CustomEase, SplitText);
    CustomEase.create("rvt-hop", "0.9, 0, 0.1, 1");

    const content = root.querySelector<HTMLElement>(".rvt-scroll");
    const lenis = content
      ? new Lenis({ wrapper: root, content })
      : new Lenis({ wrapper: root });
    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    const revealer = root.querySelector<HTMLElement>(".rvt-revealer");
    gsap.set(revealer, { scaleY: 1 });
    const revealTween = gsap.to(revealer, {
      scaleY: 0,
      duration: 1.25,
      delay: 1,
      ease: "rvt-hop",
    });

    const splits: SplitText[] = [];

    if (path === "/") {
      const heading = root.querySelector<HTMLElement>(".rvt-home h1");
      if (heading) {
        const splitText = SplitText.create(heading, {
          type: "chars",
          charsClass: "rvt-letter",
          mask: "chars",
        });
        splits.push(splitText);
        gsap.set(splitText.chars, { y: "110%" });
        gsap.to(splitText.chars, {
          y: "0%",
          duration: 1.5,
          stagger: 0.1,
          delay: 1.25,
          ease: "power4.out",
        });
      }
    } else {
      const headings = gsap.utils.toArray<HTMLElement>(
        root.querySelectorAll(".rvt-page h1, .rvt-page h2"),
      );
      for (const heading of headings) {
        const splitText = SplitText.create(heading, {
          type: "words",
          wordsClass: "rvt-word",
          mask: "words",
        });
        splits.push(splitText);
        gsap.set(splitText.words, { y: "110%" });
        gsap.to(splitText.words, {
          y: "0%",
          duration: 1.5,
          stagger: 0.1,
          delay: 1.75,
          ease: "power4.out",
        });
      }
    }

    return () => {
      cancelAnimationFrame(rafId);
      revealTween.kill();
      for (const split of splits) split.revert();
      lenis.destroy();
    };
  }, [path]);

  return (
    <div className="rvt-root" ref={rootRef}>
      <style>{getRevealerTransitionStyles()}</style>

      <div className="rvt-nav">
        <div className="rvt-col">
          <div className="rvt-nav-logo">
            <button type="button" onClick={() => navigate("/")}>
              {brand}
            </button>
          </div>
        </div>

        <div className="rvt-col">
          <div className="rvt-nav-items">
            {REVEALER_ROUTES.filter((r) => r.path !== "/").map((route) => (
              <div className="rvt-nav-item" key={route.path}>
                <button type="button" onClick={() => navigate(route.path)}>
                  {route.label}
                </button>
              </div>
            ))}
          </div>
          <div className="rvt-nav-copy">
            <p>{location}</p>
          </div>
        </div>
      </div>

      <div className="rvt-scroll" key={path}>
        <div className="rvt-revealer" />

        {path === "/" ? (
          <div className="rvt-page rvt-home">
            <div className="rvt-header">
              <h1>{brand}</h1>
            </div>
            <div className="rvt-hero-img">
              <img src={`${assetBase}/hero.jpg`} alt="" />
            </div>
          </div>
        ) : null}

        {path === "/work" ? (
          <div className="rvt-page rvt-work">
            <h1>selected work</h1>
            <div className="rvt-projects">
              {Array.from({ length: 4 }, (_, i) => (
                <img
                  src={`${assetBase}/img${i + 1}.jpg`}
                  alt=""
                  key={`work-${i + 1}`}
                />
              ))}
            </div>
          </div>
        ) : null}

        {path === "/studio" ? (
          <div className="rvt-page rvt-studio">
            <div className="rvt-col">
              <h2 className="rvt-studio-header">Our Story</h2>
            </div>
            <div className="rvt-col">
              <h2>{studioCopy}</h2>
              <div className="rvt-about-img">
                <img src={`${assetBase}/studio.jpg`} alt="" />
              </div>
            </div>
          </div>
        ) : null}

        {path === "/contact" ? (
          <div className="rvt-page rvt-contact">
            <div className="rvt-col">
              <h2>Contact Us</h2>
            </div>
            <div className="rvt-col">
              <div className="rvt-contact-copy">
                <h2>Collaborations</h2>
                <h2>{contactEmails[0]}</h2>
              </div>

              <div className="rvt-contact-copy">
                <h2>Inquiries</h2>
                <h2>{contactEmails[1]}</h2>
              </div>

              <div className="rvt-socials">
                {socials.map((social) => (
                  <p key={social}>{social}</p>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
