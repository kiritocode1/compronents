// @ts-nocheck
// biome-ignore-all lint: source-authored GSAP template port.

"use client";

import gsap from "gsap";
import { useCallback, useEffect, useRef } from "react";
import {
  LocalLink as Link,
  useAsset,
  useTemplateLenis as useLenis,
  useRoute,
} from "../../runtime";

import { MENU_CLOSE_EVENT } from "../../utils/menuClose";
import { scrambleIn, scrambleVisible } from "./scramble";

// normalize pathname for same-route link detection
const menuNormalizePath = (path) => {
  const normalized = (path.split("?")[0].split("#")[0] || "/").replace(
    /\/$/,
    "",
  );
  return normalized || "/";
};

const Menu = () => {
  const { pathname } = useRoute();
  const asset = useAsset();
  const lenis = useLenis();
  const navRef = useRef(null);
  const overlayRef = useRef(null);
  const hamburgerTl = useRef(null);
  const isMenuOpen = useRef(false);
  const hoverCleanups = useRef([]);

  // clear scramble timers on all overlay elements
  const menuClearScrambleTimers = () => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const elements = overlay.querySelectorAll("*");
    elements.forEach((el) => {
      if (el.scrambleInterval) {
        clearInterval(el.scrambleInterval);
        el.scrambleInterval = null;
      }
      if (el.scrambleTimeout) {
        clearTimeout(el.scrambleTimeout);
        el.scrambleTimeout = null;
      }
      if (el.staggerTimeout) {
        clearTimeout(el.staggerTimeout);
        el.staggerTimeout = null;
      }
    });
  };

  // restore link text and color after scramble
  const menuRevertText = () => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const allLinks = overlay.querySelectorAll(
      ".nav-item a, .nav-footer-item a",
    );
    allLinks.forEach((link) => {
      link.style.color = "";
      delete link.dataset.originalColor;
      const originalText = link.textContent;
      link.innerHTML = originalText;
    });
  };

  // remove all hover listener cleanups
  const menuRemoveHoverListeners = () => {
    hoverCleanups.current.forEach((cleanup) => cleanup());
    hoverCleanups.current = [];
  };

  // attach scramble-on-hover to nav links (desktop only)
  const menuAddHoverEffects = () => {
    const isMobile = window.innerWidth < 1000;
    if (isMobile) return;

    const overlay = overlayRef.current;
    if (!overlay) return;

    menuRemoveHoverListeners();

    const allLinks = [
      ...overlay.querySelectorAll(".nav-item a"),
      ...overlay.querySelectorAll(".nav-footer-item a"),
    ];

    allLinks.forEach((link) => {
      let hovering = false;

      const onEnter = () => {
        if (hovering || !isMenuOpen.current) return;
        hovering = true;

        if (!link.dataset.originalColor) {
          link.dataset.originalColor = getComputedStyle(link).color;
        }
        link.style.color = "var(--tone-500)";

        scrambleVisible(link, 0, {
          duration: 0.2,
          charDelay: 50,
          stagger: 25,
          maxIterations: 10,
        });

        setTimeout(() => {
          hovering = false;
        }, 250);
      };

      const onLeave = () => {
        link.style.color = link.dataset.originalColor || "";
      };

      link.addEventListener("mouseenter", onEnter);
      link.addEventListener("mouseleave", onLeave);

      hoverCleanups.current.push(() => {
        link.removeEventListener("mouseenter", onEnter);
        link.removeEventListener("mouseleave", onLeave);
      });
    });
  };

  // close menu overlay and reverse hamburger animation
  const menuClose = useCallback(
    (immediate = false) => {
      if (!isMenuOpen.current) return;

      const tl = hamburgerTl.current;
      const overlay = overlayRef.current;
      if (!tl || !overlay) return;

      isMenuOpen.current = false;
      lenis?.start();
      tl.reverse();
      menuRemoveHoverListeners();
      menuClearScrambleTimers();

      if (immediate) {
        overlay.style.transition = "none";
        overlay.style.opacity = "0";
        overlay.style.pointerEvents = "none";
        overlay.style.visibility = "hidden";
        menuRevertText();
        return;
      }

      overlay.style.transition = "opacity 0.4s ease";
      overlay.style.opacity = "0";
    },
    [lenis],
  );

  // prevent navigation when clicking the current route link
  const menuHandleLinkClick = useCallback(
    (e, href) => {
      if (menuNormalizePath(pathname) !== menuNormalizePath(href)) return;

      e.preventDefault();
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      menuClose();
    },
    [pathname, menuClose],
  );

  // listen for global menu-close event from page transitions
  useEffect(() => {
    const handleMenuClose = () => menuClose(true);
    window.addEventListener(MENU_CLOSE_EVENT, handleMenuClose);
    return () => window.removeEventListener(MENU_CLOSE_EVENT, handleMenuClose);
  }, [menuClose]);

  // hamburger timeline, scroll-based nav class, overlay transitionend
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const updateNavTopClass = () => {
      const scrollY = lenis?.scroll ?? window.scrollY;
      const threshold = window.innerHeight * 0.5;
      if (scrollY < threshold) {
        nav.classList.add("top");
      } else {
        nav.classList.remove("top");
      }
    };

    lenis?.on("scroll", updateNavTopClass);
    updateNavTopClass();

    const spans = nav.querySelectorAll(".nav-toggler-hamburger span");
    const tl = gsap.timeline({ paused: true });

    tl.to(
      spans[0],
      {
        y: "0.19rem",
        rotation: 45,
        width: "1.1rem",
        duration: 0.3,
        ease: "power2.inOut",
      },
      0,
    ).to(
      spans[1],
      {
        y: "-0.19rem",
        rotation: -45,
        width: "1.1rem",
        duration: 0.3,
        ease: "power2.inOut",
      },
      0,
    );

    hamburgerTl.current = tl;

    const overlay = overlayRef.current;
    if (overlay) {
      overlay.addEventListener("transitionend", (e) => {
        if (e.target !== overlay) return;
        if (e.propertyName !== "opacity") return;
        if (!isMenuOpen.current) {
          overlay.style.pointerEvents = "none";
          overlay.style.visibility = "hidden";
          menuRevertText();
        }
      });
    }

    return () => {
      lenis?.off("scroll", updateNavTopClass);
      tl.kill();
      menuRemoveHoverListeners();
    };
  }, [lenis]);

  // toggle menu open/close with staggered scramble-in on links
  const menuHandleToggle = () => {
    const tl = hamburgerTl.current;
    const overlay = overlayRef.current;
    if (!tl || !overlay) return;

    if (!isMenuOpen.current) {
      tl.play();
      menuRevertText();

      overlay.style.visibility = "visible";
      overlay.style.pointerEvents = "all";
      overlay.style.transition = "none";
      overlay.style.opacity = "0";

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          overlay.style.transition = "opacity 0.4s ease";
          overlay.style.opacity = "1";
        });
      });

      const navItems = overlay.querySelectorAll(".nav-item");
      navItems.forEach((item, index) => {
        const link = item.querySelector("a");
        if (link) {
          scrambleIn(link, index * 0.1, {
            duration: 0.15,
            charDelay: 50,
            stagger: 25,
            maxIterations: 5,
          });
        }
      });

      const footerItems = overlay.querySelectorAll(".nav-footer-item");
      let footerLinkIndex = 0;
      const navItemCount = navItems.length;
      footerItems.forEach((footerItem) => {
        const links = footerItem.querySelectorAll("a");
        links.forEach((link) => {
          scrambleIn(link, navItemCount * 0.1 + footerLinkIndex * 0.1, {
            duration: 0.15,
            charDelay: 50,
            stagger: 25,
            maxIterations: 5,
          });
          footerLinkIndex++;
        });
      });

      menuAddHoverEffects();
      isMenuOpen.current = true;
      lenis?.stop();
    } else {
      menuClose();
    }
  };

  return (
    <>
      <nav ref={navRef} className="top">
        <div className="container">
          <div className="nav-container">
            <div className="nav-cta">
              <Link
                href="/connect"
                className="btn"
                onClickCapture={(e) => menuHandleLinkClick(e, "/connect")}
              >
                <span className="mono">Connect</span>
              </Link>
            </div>
            <div className="nav-logo">
              <Link
                href="/"
                onClickCapture={(e) => menuHandleLinkClick(e, "/")}
              >
                <img src={asset("logo.png")} alt="" />
              </Link>
            </div>
            <div className="nav-toggler">
              <div className="btn" onClick={menuHandleToggle}>
                <p className="mono">Menu</p>
                <div className="nav-toggler-hamburger">
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="nav-overlay" ref={overlayRef}>
        <div className="nav-items">
          <div className="nav-overlay-logo">
            <img src={asset("logo.png")} alt="" />
          </div>
          <div className="nav-item active">
            <Link href="/" onClickCapture={(e) => menuHandleLinkClick(e, "/")}>
              Index
            </Link>
          </div>
          <div className="nav-item">
            <Link
              href="/studio"
              onClickCapture={(e) => menuHandleLinkClick(e, "/studio")}
            >
              Studio
            </Link>
          </div>
          <div className="nav-item">
            <Link
              href="/catalog"
              onClickCapture={(e) => menuHandleLinkClick(e, "/catalog")}
            >
              Catalog
            </Link>
          </div>
          <div className="nav-item">
            <Link
              href="/brief"
              onClickCapture={(e) => menuHandleLinkClick(e, "/brief")}
            >
              Brief
            </Link>
          </div>
          <div className="nav-item">
            <Link
              href="/connect"
              onClickCapture={(e) => menuHandleLinkClick(e, "/connect")}
            >
              Connect
            </Link>
          </div>
        </div>

        <div className="nav-footer">
          <div className="container">
            <div className="nav-footer-container">
              <div className="nav-footer-item">
                <a
                  className="mono"
                  href="https://www.instagram.com/aryank.space/"
                  target="_blank"
                >
                  Feed
                </a>
                <a className="mono" href="https://aryank.space" target="_blank">
                  Channel
                </a>
              </div>
              <div className="nav-footer-item">
                <Link
                  className="mono"
                  href="/connect"
                  onClickCapture={(e) => menuHandleLinkClick(e, "/connect")}
                >
                  Get In Touch
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Menu;
