import type { Metadata } from "next";
import { Space_Grotesk, Playfair_Display } from "next/font/google";
import localFont from "next/font/local";
import RibbonsCursor from "@/components/ui/RibbonsCursor";
import Navbar from "@/components/sections/Navbar";
import LoadingScreen from "@/components/ui/LoadingScreen";
import "./globals.css";

const clashDisplay = localFont({
  src: "../../public/fonts/ClashDisplay-Variable.woff2",
  variable: "--font-display",
  display: "swap",
  weight: "200 700",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const aktura = localFont({
  src: "../../public/fonts/Aktura-Regular.woff2",
  variable: "--font-aktura",
  display: "swap",
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "Niko Pranata — Frontend Developer",
    template: "%s — Niko Pranata",
  },
  icons: {
    icon: "/favicon.png",
  },
  description:
    "CS student and frontend developer. I build interfaces that feel considered — from motion to markup.",
  authors: [{ name: "Niko Pranata" }],
  creator: "Niko Pranata",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Niko Pranata - Frontend Developer",
    description:
      "CS student and frontend developer. I build interfaces that feel considered — from motion to markup.",
    siteName: "Niko Pranata",
  },
  twitter: {
    card: "summary_large_image",
    title: "Niko Pranata - Frontend Developer",
    description:
      "CS student and frontend developer. I build interfaces that feel considered — from motion to markup.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${clashDisplay.variable} ${spaceGrotesk.variable} ${playfairDisplay.variable} ${aktura.variable}`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css"
        />
      </head>
      <body>
        <LoadingScreen />
        <RibbonsCursor />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
