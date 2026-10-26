import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "/about",
  "About",
  "About Niko Pranata, a CS student and frontend developer in Yogyakarta, Indonesia: tech stack, experience and approach to interface work.",
);

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
