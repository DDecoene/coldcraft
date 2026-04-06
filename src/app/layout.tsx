import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "ColdCraft — AI Cold Email Generator",
  description:
    "Generate high-converting cold emails in seconds with AI. Free cold email generator for sales reps, founders, and agencies.",
  keywords: [
    "cold email generator",
    "ai cold email generator",
    "how to write cold emails",
    "cold email templates",
    "sales email generator",
  ],
  openGraph: {
    title: "ColdCraft — AI Cold Email Generator",
    description:
      "Generate high-converting cold emails in seconds with AI. Free to start.",
    type: "website",
    url: "https://coldcraft.ai",
    siteName: "ColdCraft",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ColdCraft — AI Cold Email Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ColdCraft — AI Cold Email Generator",
    description: "Generate high-converting cold emails in seconds with AI.",
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
      className={`${dmSans.variable} ${dmSerifDisplay.variable} ${ibmPlexMono.variable} dark`}
    >
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
