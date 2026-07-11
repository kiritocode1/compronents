"use client";

import { useSound } from "@web-kits/audio/react";
import { Volume2, VolumeX } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSoundSetting } from "@/components/site/sound-provider";
import { uiHover, uiToggleOn } from "@/lib/sounds";
import { cn } from "@/lib/utils";

const links = [
  { href: "/components", label: "Components" },
  { href: "/pages", label: "Pages" },
  { href: "/backend", label: "Backend" },
  { href: "/inspiration", label: "Inspiration" },
];

function SoundToggle() {
  const { enabled, setEnabled } = useSoundSetting();
  const playOn = useSound(uiToggleOn);

  return (
    <button
      type="button"
      aria-label={enabled ? "Mute interface sounds" : "Unmute interface sounds"}
      aria-pressed={enabled}
      onClick={() => {
        setEnabled(!enabled);
        if (!enabled) setTimeout(playOn, 0);
      }}
      className="hit-area-2 text-muted-foreground transition-colors hover:text-foreground"
    >
      {enabled ? (
        <Volume2 className="size-3.5" />
      ) : (
        <VolumeX className="size-3.5" />
      )}
    </button>
  );
}

export function SiteNav() {
  const pathname = usePathname();
  const playHover = useSound(uiHover);

  return (
    <header className="flex items-center justify-between py-8 text-[13px]">
      <Link
        href="/"
        className="font-semibold tracking-tight text-foreground"
        aria-label="BLANK home"
        onMouseEnter={playHover}
      >
        BLANK
      </Link>
      <nav className="flex items-center gap-5">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onMouseEnter={playHover}
              className={cn(
                "transition-colors",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          );
        })}
        <SoundToggle />
      </nav>
    </header>
  );
}
