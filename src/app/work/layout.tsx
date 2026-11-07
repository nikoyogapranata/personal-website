import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "/work",
  "Work",
  "Selected projects by Niko Pranata: moink, HealthSync, Kelas Kampus, HelloCation.id, JAMUSARI, WETRACK, and EduNovel. Fullstack web applications, frontend engineering, CMS builds, and UI design.",
);

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  return children;
}
