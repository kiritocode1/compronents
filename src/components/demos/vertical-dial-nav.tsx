"use client";

import { motion, useReducedMotion } from "motion/react";
import { useId, useRef } from "react";
import VerticalDialNav from "@/registry/vertical-dial-nav";

const SECTIONS = [
  { id: "01", label: "AI Coder", color: "#e3e3e3" },
  { id: "02", label: "3D Generalist", color: "#ebc3c3" },
  { id: "03", label: "Digital Artist", color: "#ede6ad" },
  { id: "04", label: "Product Designer", color: "#a6edd2" },
  { id: "05", label: "Detail Obsesed", color: "#a7a3e6" },
  { id: "06", label: "Curious", color: "#e8a9dd" },
];

export function VerticalDialScene({
  fullscreen = false,
  activeColor = "rgb(26, 26, 26)",
  fadeDistance = 2,
  itemSpacing = 12,
}: {
  fullscreen?: boolean;
  activeColor?: string;
  fadeDistance?: number;
  itemSpacing?: number;
}) {
  const root = useRef<HTMLDivElement>(null);
  const prefix = useId();
  const sections = SECTIONS.map((section) => ({
    ...section,
    id: `${prefix}-${section.id}`,
  }));
  const reducedMotion = useReducedMotion();
  return (
    <div
      className="vertical-dial-scene"
      style={{
        position: "relative",
        width: "100%",
        height: fullscreen ? "100svh" : 620,
        overflow: "hidden",
        fontFamily: '"Vertical Dial Geist", sans-serif',
        textRendering: "auto",
      }}
    >
      <style>{`
        @font-face{font-family:"Vertical Dial Geist";src:url('/assets/vertical-dial-nav/geist-400.woff2') format('woff2');font-style:normal;font-weight:400;font-display:swap}
        @font-face{font-family:"Vertical Dial Geist";src:url('/assets/vertical-dial-nav/geist-500.woff2') format('woff2');font-style:normal;font-weight:500;font-display:swap}
        .vertical-dial-scene h1{font-size:100px;font-weight:500;letter-spacing:-.04em;line-height:1.1;color:#191919;text-align:center;margin:0;user-select:none}
        @media(max-width:1199px){.vertical-dial-scene h1{font-size:82px}}
        @media(max-width:809px){.vertical-dial-scene h1{font-size:36px}}
      `}</style>
      <div
        ref={root}
        data-dial-scroll-root
        style={{
          height: "100%",
          width: "100%",
          overflowY: "auto",
          scrollbarWidth: "none",
        }}
      >
        {sections.map((section, index) => (
          <section
            key={section.id}
            id={section.id}
            style={{
              height: fullscreen ? "100svh" : 620,
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              background: section.color,
            }}
          >
            <motion.h1
              initial={reducedMotion ? false : { opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ root, once: true, amount: 0.5 }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : {
                      type: "spring",
                      stiffness: 180,
                      damping: 30,
                      mass: 1,
                      delay: 0.4,
                    }
              }
            >
              {index === 4 ? "Detail Obessed" : section.label}
            </motion.h1>
          </section>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          width: 200,
          height: 430,
          zIndex: 9,
          mixBlendMode: "luminosity",
        }}
      >
        <VerticalDialNav
          sections={sections}
          scrollRoot={root}
          font={{
            fontFamily: '"Vertical Dial Geist", sans-serif',
            fontSize: 16,
            letterSpacing: "-0.05em",
          }}
          activeColor={activeColor}
          fadeDistance={fadeDistance}
          itemSpacing={itemSpacing}
        />
      </div>
    </div>
  );
}

export default function VerticalDialNavDemo() {
  return <VerticalDialScene />;
}
