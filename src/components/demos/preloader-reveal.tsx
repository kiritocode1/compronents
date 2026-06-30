"use client";

import PreloaderReveal from "@/registry/preloader-reveal";

const LOGO = "/assets/preloader-reveal/logo.png";
const BUTTON_LOGO = "/assets/preloader-reveal/logo-light.png";

export default function PreloaderRevealDemo() {
  return (
    <div className="relative h-[620px] w-full overflow-hidden rounded-md bg-black">
      <PreloaderReveal logo={LOGO} buttonLogo={BUTTON_LOGO} />
    </div>
  );
}
