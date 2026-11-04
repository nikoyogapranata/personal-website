import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "/work",
  "Work",
  "Selected projects by Niko Pranata: moink, Kelas Kampus, Hellocation.id, HealthSync, JAMUSARI, WETRACK, and EduNovel — fullstack web applications, frontend engineering, and UI design.",
);

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  return children;
}
