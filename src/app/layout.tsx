import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://pistream.xyz";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "π Forever — A digit of pi, every minute, forever | pistream.xyz",
    template: "%s | pistream.xyz",
  },
  description:
    "Watch pi unfold one digit at a time. A new decimal digit of π is revealed every 60 seconds, starting Pi Day 2026. Search for your birthday, anniversary, or lucky number in the digits of pi.",
  keywords: [
    "pi",
    "π",
    "pi day",
    "digits of pi",
    "mathematics",
    "pi stream",
    "live pi",
    "find birthday in pi",
    "pi forever",
    "irrational numbers",
    "pi digits",
    "math experiment",
  ],
  authors: [{ name: "pistream.xyz" }],
  creator: "pistream.xyz",
  openGraph: {
    title: "π Forever — A digit of pi, every minute, forever",
    description:
      "A new digit of π every 60 seconds, starting Pi Day 2026. Find your birthday in pi. Watch math unfold in real time.",
    url: SITE_URL,
    siteName: "pistream.xyz",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image",
        width: 1200,
        height: 630,
        alt: "π Forever — digits of pi streaming live",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "π Forever — A digit of pi, every minute, forever",
    description:
      "A new digit of π every 60 seconds. Find your birthday in pi.",
    images: ["/og-image"],
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${mono.variable} font-mono antialiased bg-[#0a0a0a] text-white min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
