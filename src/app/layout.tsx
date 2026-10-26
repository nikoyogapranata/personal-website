import type { Metadata } from "next";
import { Space_Grotesk, Playfair_Display } from "next/font/google";
import localFont from "next/font/local";
import FilmGrain from "@/components/ui/FilmGrain";
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
  style: "italic",
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Niko Pranata | Frontend Web Developer",
    template: "Niko Pranata | %s",
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
      className={`${clashDisplay.variable} ${spaceGrotesk.variable} ${playfairDisplay.variable}`}
    >
      <body>
        <LoadingScreen />
        <FilmGrain />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
