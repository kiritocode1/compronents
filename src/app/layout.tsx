import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteNav } from "@/components/site/site-nav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Compronents — a component registry",
    template: "%s — Compronents",
  },
  description:
    "A small, quiet registry of React components. Installable with the shadcn CLI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="top-glow min-h-full bg-background text-foreground">
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1200px] flex-col px-6 sm:px-10">
          <SiteNav />
          <div className="flex flex-1 flex-col">{children}</div>
        </div>
      </body>
    </html>
  );
}
