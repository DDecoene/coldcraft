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
  metadataBase: new URL('https://coldcraft.rgwnd.app'),
  title: "ColdCraft — Free AI Cold Email Generator",
  description:
    "Generate 3 personalised cold emails in seconds. Free AI cold email generator using proven frameworks (AIDA, Problem-Solution, Pattern Interrupt). No sign-up required.",
  keywords: [
    "cold email generator",
    "ai cold email generator",
    "how to write cold emails",
    "cold email templates",
    "sales email generator",
  ],
  alternates: {
    canonical: 'https://coldcraft.rgwnd.app',
  },
  openGraph: {
    title: "ColdCraft — Free AI Cold Email Generator",
    description:
      "Generate 3 personalised cold emails in seconds. Free AI cold email generator using proven frameworks. No sign-up required.",
    type: "website",
    url: "https://coldcraft.rgwnd.app",
    siteName: "ColdCraft",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ColdCraft — Free AI Cold Email Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ColdCraft — Free AI Cold Email Generator",
    description: "Generate 3 personalised cold emails in seconds. Free, no sign-up required.",
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
