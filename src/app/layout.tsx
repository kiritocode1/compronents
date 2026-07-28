import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { SiteNav } from "@/components/site/site-nav";
import { SiteSoundProvider } from "@/components/site/sound-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DESCRIPTION =
  "A quiet registry for careful interfaces for BLANK. Components, full pages, and backend pieces, installable with the shadcn CLI.";

export const metadata: Metadata = {
  metadataBase: new URL("https://ui.aryank.space"),
  title: {
    default: "Compronents",
    template: "%s · Compronents",
  },
  description: DESCRIPTION,
  openGraph: {
    title: "Compronents",
    description: DESCRIPTION,
    url: "https://ui.aryank.space",
    siteName: "Compronents",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Compronents",
    description: DESCRIPTION,
  },
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
      <body className="min-h-full bg-background text-foreground">
        <NuqsAdapter>
          <SiteSoundProvider>
            <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-6 sm:px-10">
              <SiteNav />
              <div className="flex flex-1 flex-col">{children}</div>
            </div>
          </SiteSoundProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
