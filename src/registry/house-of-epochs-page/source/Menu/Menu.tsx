// @ts-nocheck
// biome-ignore-all lint: source-authored full-page port.
"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useLenis } from "lenis/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

gsap.registerPlugin(useGSAP);

const MENU_PRIMARY_LINKS = [
  { href: "/", label: "Genesis" },
  { href: "/chronicles", label: "Chronicles" },
  { href: "/report", label: "Field Report" },
  { href: "/catalog", label: "Catalog" },
  { href: "/transmit", label: "Transmit" },
];

const MENU_FOOTER_LINKS_LEFT = [
  { href: "https://www.instagram.com/aryankspaceweb", label: "Instagram" },
  { href: "https://x.com/aryankspaceweb", label: "X / Twitter" },
  { href: "https://discord.com/invite/B8B9MXxuSS", label: "Discord" },
];

const MENU_FOOTER_LINKS_RIGHT = [
  { href: "https://vimeo.com/aryankspace", label: "Vimeo" },
  { href: "https://www.youtube.com/@aryankspace", label: "YouTube" },
  { href: "mailto:contact@aryankspace.com", label: "Email" },
];

function MenuLineLink({ href, label, className = "", onClick }) {
  return (
    <Link href={href} className={className} onClick={onClick}>
      <span className="menu-line-mask">
        <span className="menu-line">{label}</span>
      </span>
    </Link>
  );
}

export default function Menu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const menuOpenTlRef = useRef(null);
  const menuCloseTlRef = useRef(null);
  const lenis = useLenis();
  const pathname = usePathname();

  useGSAP(
    () => {
      gsap.set(".menu-panel", {
        clipPath: "polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)",
        pointerEvents: "none",
        visibility: "hidden",
      });
      gsap.set(".menu-toggle-word", { yPercent: 0 });
      gsap.set(".menu-close-word", { yPercent: 100 });
      gsap.set(".menu-line", { yPercent: 100 });

      menuOpenTlRef.current = gsap
        .timeline({ paused: true, defaults: { ease: "power3.out" } })
        .set(".menu-panel", { visibility: "visible", pointerEvents: "none" }, 0)
        .to(".menu-toggle-word", { yPercent: -100, duration: 0.5 }, 0)
        .to(".menu-close-word", { yPercent: 0, duration: 0.5 }, 0)
        .to(
          ".menu-panel",
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            duration: 0.7,
          },
          0,
        )
        .set(".menu-panel", { pointerEvents: "all" }, 0.7)
        .to(".menu-line", { yPercent: 0, duration: 0.65, stagger: 0.04 }, 0.1);

      menuCloseTlRef.current = gsap
        .timeline({ paused: true, defaults: { ease: "power3.out" } })
        .set(".menu-panel", { pointerEvents: "none" }, 0)
        .to(".menu-toggle-word", { yPercent: 0, duration: 0.6 }, 0)
        .to(".menu-close-word", { yPercent: 100, duration: 0.6 }, 0)
        .to(
          ".menu-panel",
          {
            clipPath: "polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)",
            duration: 0.65,
          },
          0.06,
        )
        .set(".menu-panel", { visibility: "hidden" }, 0.71)
        .set(".menu-line", { yPercent: 100 }, 0.75);
    },
    { scope: menuRef },
  );

  useEffect(() => {
    if (!isOpen) return;

    menuOpenTlRef.current?.pause();
    menuCloseTlRef.current?.pause(0);

    gsap.set(".menu-panel", {
      clipPath: "polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)",
      pointerEvents: "none",
      visibility: "hidden",
    });
    gsap.set(".menu-toggle-word", { yPercent: 0 });
    gsap.set(".menu-close-word", { yPercent: 100 });
    gsap.set(".menu-line", { yPercent: 100 });

    lenis?.start();
    setIsOpen(false);
  }, [pathname]);

  const handleClose = () => {
    if (isOpen) {
      lenis?.start();
      menuOpenTlRef.current?.pause();
      menuCloseTlRef.current?.play(0);
      setIsOpen(false);
    }
  };

  const handleLinkClick = (href) => {
    if (href === pathname) {
      handleClose();
    }
  };

  const handleToggle = () => {
    setIsOpen((prev) => {
      const next = !prev;

      if (next) {
        lenis?.stop();
        menuCloseTlRef.current?.pause(0);
        gsap.set(".menu-line", { yPercent: 100 });
        menuOpenTlRef.current?.play(0);
      } else {
        lenis?.start();
        menuOpenTlRef.current?.pause();
        menuCloseTlRef.current?.play(0);
      }

      return next;
    });
  };

  return (
    <div className="menu-container">
      <div className="menu" ref={menuRef}>
        <div className="menu-rail">
          <Link
            href="/"
            className="menu-box menu-logo"
            onClick={() => handleLinkClick("/")}
          >
            <img
              src="https://ui.aryank.space/assets/house-of-epochs-page/logo.svg"
              alt="Home"
            />
          </Link>

          <button
            type="button"
            className="menu-box menu-toggle"
            onClick={handleToggle}
            aria-expanded={isOpen}
            aria-controls="main-menu-panel"
          >
            <span className="menu-toggle-mask">
              <p className="mono sm menu-toggle-word">Menu</p>
              <p className="mono sm menu-close-word">Close</p>
            </span>
          </button>
        </div>

        <aside id="main-menu-panel" className="menu-panel">
          <div className="menu-panel-top">
            <p className="mono sm">House of Epochs</p>
          </div>

          <nav className="menu-panel-nav" aria-label="Main pages">
            {MENU_PRIMARY_LINKS.map((link) => (
              <MenuLineLink
                key={link.href}
                href={link.href}
                label={link.label}
                className="menu-link menu-link-main"
                onClick={() => handleLinkClick(link.href)}
              />
            ))}
          </nav>

          <div className="menu-panel-footer">
            <div className="menu-panel-footer-col">
              {MENU_FOOTER_LINKS_LEFT.map((link) => (
                <MenuLineLink
                  key={link.label}
                  href={link.href}
                  label={link.label}
                  className="menu-link menu-link-footer"
                  onClick={() => handleLinkClick(link.href)}
                />
              ))}
            </div>

            <div className="menu-panel-footer-col">
              {MENU_FOOTER_LINKS_RIGHT.map((link) => (
                <MenuLineLink
                  key={link.label}
                  href={link.href}
                  label={link.label}
                  className="menu-link menu-link-footer"
                  onClick={() => handleLinkClick(link.href)}
                />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
