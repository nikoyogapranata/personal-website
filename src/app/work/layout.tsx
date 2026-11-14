import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "/work",
  "Work",
  "Projects by Niko Pranata: moink, HealthSync, Kelas Kampus, HelloCation.id, KinetiQ, Wandr, JAMUSARI, WETRACK and EduNovel. Web apps, iOS apps, CMS sites and UI/UX design.",
);

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  return children;
}
