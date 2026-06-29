"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/components", label: "Components" },
  { href: "/pages", label: "Pages" },
  { href: "/backend", label: "Backend" },
  { href: "/inspiration", label: "Inspiration" },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="flex flex-col gap-4 py-8 text-xs tracking-[0.12em] uppercase sm:flex-row sm:items-center sm:justify-between">
      <nav className="flex flex-wrap items-center gap-x-5 gap-y-3 sm:gap-7">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
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
      </nav>
      <span className="hidden text-faint sm:block">shadcn-compatible</span>
    </header>
  );
}
