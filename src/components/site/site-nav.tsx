"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Index" },
  { href: "/docs", label: "Docs" },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between py-8 text-xs tracking-[0.12em] uppercase">
      <nav className="flex items-center gap-7">
        {links.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/" || pathname.startsWith("/components")
              : pathname.startsWith(link.href);
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
        <a
          href="https://ui.shadcn.com/docs/registry"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Registry
        </a>
      </nav>
      <span className="hidden text-faint sm:block">shadcn-compatible</span>
    </header>
  );
}
