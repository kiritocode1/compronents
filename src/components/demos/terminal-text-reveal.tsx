"use client";

import TerminalTextReveal from "@/registry/terminal-text-reveal";

export default function TerminalTextRevealDemo() {
  return (
    <div className="relative max-h-[760px] w-full overflow-auto rounded-md bg-white">
      <TerminalTextReveal
        bannerImage="/assets/terminal-text-reveal/img_1.jpg"
        introImage="/assets/terminal-text-reveal/intro.jpg"
        services={[
          {
            title: "Precision Engineering",
            body: "Every breakthrough begins with detail. From the first sketch to full-scale production, the process is built on accuracy, consistency, and performance. The machine is the sum of deliberate calculations designed to set new standards in motion.",
            image: "/assets/terminal-text-reveal/img_2.jpg",
          },
          {
            title: "Performance Optimization",
            body: "True innovation means doing more with less. These systems deliver maximum output while reducing waste, resistance, and downtime. Each detail is calibrated for efficiency and refined power.",
            image: "/assets/terminal-text-reveal/img_3.jpg",
          },
          {
            title: "Advanced Mobility",
            body: "The future of movement is seamless. Mobility work connects people, industries, and cities with speed and reliability. Every element is engineered for flow and dependable rhythm.",
            image: "/assets/terminal-text-reveal/img_4.jpg",
          },
          {
            title: "Next-Gen Infrastructure",
            body: "Building for tomorrow requires infrastructure that can endure, adapt, and expand. The work is designed for harsh environments while maintaining precise control.",
            image: "/assets/terminal-text-reveal/img_5.jpg",
          },
        ]}
      />
    </div>
  );
}
