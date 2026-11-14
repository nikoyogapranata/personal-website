import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "/work",
  "Work",
  "Projects by Niko Pranata: moink, HealthSync, Kelas Kampus, HelloCation.id, KinetiQ, Wandr, JAMUSARI and WETRACK. Web apps, iOS apps and CMS sites, designed, built and shipped.",
);

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  return children;
}
