import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "/work",
  "Work",
  "Selected projects by Niko Pranata: JAMUSARI, HealthSync, WETRACK and EduNovel — fullstack web apps and UI design.",
);

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  return children;
}
