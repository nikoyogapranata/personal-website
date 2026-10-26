import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "/contact",
  "Contact",
  "Get in touch with Niko Pranata about frontend internships, freelance projects and collaborations.",
);

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
