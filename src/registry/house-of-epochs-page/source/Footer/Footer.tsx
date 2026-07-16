// @ts-nocheck
// biome-ignore-all lint: source-authored full-page port.
"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

const FOOTER_ARC_TEXT = "Where History Finds Its Keeper  · ";
const FOOTER_ARC_REPEAT = 14;
const FOOTER_ARC_PATH =
  "M 0,280 C 300,280 450,40 700,40 C 950,40 1100,280 1400,280";

const FOOTER_NAV_LEFT = [
  { label: "Chronicles", href: "/chronicles" },
  { label: "Report", href: "/report" },
];

const FOOTER_NAV_RIGHT = [
  { label: "Catalog", href: "/catalog" },
  { label: "Transmit", href: "/transmit" },
];

const FOOTER_SOCIALS = ["Instagram", "Twitter", "YouTube"];

export default function Footer() {
  const footerRef = useRef(null);
  const footerArcRef = useRef(null);
  const footerTextPathRef = useRef(null);

  useGSAP(
    () => {
      const footerArc = footerArcRef.current;
      const footerTextPath = footerTextPathRef.current;
      if (!footerArc || !footerTextPath) return;

      let footerTrigger;

      function setup() {
        cleanup();

        gsap.set(footerArc, { clearProps: "all" });
        footerTextPath.setAttribute("startOffset", "-30%");

        footerTrigger = ScrollTrigger.create({
          trigger: footerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
          refreshPriority: -1,
          onUpdate: (self) => {
            const footerOffset = -30 + self.progress * 60;
            footerTextPath.setAttribute("startOffset", `${footerOffset}%`);
          },
        });
      }

      function cleanup() {
        footerTrigger?.kill();
        footerTrigger = null;
      }

      setup();

      let footerResizeTimer;
      const handleFooterResize = () => {
        clearTimeout(footerResizeTimer);
        footerResizeTimer = setTimeout(setup, 250);
      };

      window.addEventListener("resize", handleFooterResize);

      return () => {
        cleanup();
        clearTimeout(footerResizeTimer);
        window.removeEventListener("resize", handleFooterResize);
      };
    },
    { scope: footerRef },
  );

  return (
    <footer className="footer" ref={footerRef}>
      <div className="footer-wrapper">
        <div className="footer-arc" ref={footerArcRef}>
          <svg
            viewBox="0 0 1400 300"
            xmlns="http://www.w3.org/2000/svg"
            className="footer-arc-svg"
          >
            <defs>
              <path id="footer-arc-path" d={FOOTER_ARC_PATH} fill="none" />
            </defs>
            <text className="footer-arc-text">
              <textPath
                ref={footerTextPathRef}
                href="#footer-arc-path"
                startOffset="0%"
              >
                {FOOTER_ARC_TEXT.repeat(FOOTER_ARC_REPEAT)}
              </textPath>
            </text>
          </svg>
        </div>

        <div className="footer-content">
          <div className="footer-center">
            <div className="footer-brand">
              <h1 className="subheader">House of</h1>
              <h1>Epochs</h1>
            </div>

            <div className="footer-newsletter">
              <input
                type="email"
                placeholder="Enter your coordinates"
                className="footer-newsletter-input"
              />
              <button className="footer-newsletter-btn">
                <p className="mono sm">Enlist</p>
              </button>
            </div>
          </div>

          <div className="footer-nav-row">
            <div className="footer-nav footer-nav-left">
              {FOOTER_NAV_LEFT.map(({ label, href }) => (
                <Link href={href} key={label} className="footer-nav-link">
                  <p className="mono sm">{label}</p>
                </Link>
              ))}
            </div>

            <div className="footer-nav footer-nav-right">
              {FOOTER_NAV_RIGHT.map(({ label, href }) => (
                <Link href={href} key={label} className="footer-nav-link">
                  <p className="mono sm">{label}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="footer-contact">
            <div className="footer-socials">
              {FOOTER_SOCIALS.map((name) => (
                <Link href="/" key={name} className="footer-social-link">
                  <p className="mono sm">{name}</p>
                </Link>
              ))}
            </div>
            <p className="sm" id="footer-contact-email">
              inquiries@houseofepochs.com
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="sm">&copy; House of Epochs</p>
          <p className="sm">Built by BLANK</p>
        </div>
      </div>
    </footer>
  );
}
