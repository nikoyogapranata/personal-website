import type { Metadata } from "next";
import { Space_Grotesk, Playfair_Display } from "next/font/google";
import localFont from "next/font/local";
import FilmGrain from "@/components/ui/FilmGrain";
import Navbar from "@/components/sections/Navbar";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { loaderBootScript } from "@/lib/loader";
import MotionProvider from "@/components/MotionProvider";
import ToneProvider from "@/components/ui/Tone";
import { EMAIL, SITE_URL, SOCIAL } from "@/lib/site";
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

const TITLE       = "Niko Pranata | Frontend Web Developer";
const DESCRIPTION =
  "CS student and frontend developer. I build interfaces that feel considered — from motion to markup.";

// Icons and the share image come from the app/ file conventions (icon.png, favicon.ico, opengraph-image.png)
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "Niko Pranata | %s",
  },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  authors: [{ name: "Niko Pranata", url: SITE_URL }],
  creator: "Niko Pranata",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Niko Pranata",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Niko Yoga Pranata",
  alternateName: "Niko Pranata",
  url: SITE_URL,
  image: `${SITE_URL}/hero.jpeg`,
  jobTitle: "Frontend Web Developer",
  email: `mailto:${EMAIL}`,
  address: { "@type": "PostalAddress", addressLocality: "Yogyakarta", addressCountry: "ID" },
  sameAs: [SOCIAL.linkedin, SOCIAL.github],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${clashDisplay.variable} ${spaceGrotesk.variable} ${playfairDisplay.variable}`}
      // The boot script below may add data-loader before hydration
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: loaderBootScript }} />
        {/* Scroll reveals are server-rendered at opacity 0; without JS they'd never appear */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
        />
        <MotionProvider>
          <ToneProvider>
            <LoadingScreen />
            <FilmGrain />
            <Navbar />
            {children}
          </ToneProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
