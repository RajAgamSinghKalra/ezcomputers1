import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CompareDrawer } from "@/components/compare/compare-drawer";
import { LiveChatWidget } from "@/components/layout/live-chat-widget";
import { NewsletterModal } from "@/components/layout/newsletter-modal";
import { AppProviders } from "@/components/providers/app-providers";
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/constants";
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
  metadataBase: new URL(SITE_URL),
  title: {
    default: "EZComputers | Precision-Crafted PCs & Custom Builds",
    template: "%s | EZComputers",
  },
  description:
    "Discover high-performance pre-built PCs or craft a custom machine with EZComputers. Expert support, secure checkout, and pro-grade hardware for gamers, creators, and businesses.",
  keywords: [
    "custom PC builds",
    "pre-built gaming PCs",
    "workstation computers",
    "PC builder tool",
    "high performance computers",
  ],
  applicationName: "EZComputers",
  authors: [{ name: "EZComputers" }],
  category: "technology",
  alternates: {
    canonical: SITE_URL,
    languages: {
      "en-US": SITE_URL,
    },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "EZComputers | Precision-Crafted PCs & Custom Builds",
    description:
      "Discover high-performance pre-built PCs or craft a custom machine with EZComputers. Expert support, secure checkout, and pro-grade hardware for gamers, creators, and businesses.",
    siteName: "EZComputers",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Hero PC setup from EZComputers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@EZComputersHQ",
    creator: "@EZComputersHQ",
    title: "EZComputers | Precision-Crafted PCs & Custom Builds",
    description:
      "Discover high-performance pre-built PCs or craft a custom machine with EZComputers. Expert support, secure checkout, and pro-grade hardware for gamers, creators, and businesses.",
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppProviders>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1 bg-background">{children}</main>
            <SiteFooter />
          </div>
          <NewsletterModal />
          <CompareDrawer />
          <LiveChatWidget />
        </AppProviders>
      </body>
    </html>
  );
}









