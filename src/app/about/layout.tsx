import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "/about",
  "About",
  "About Niko Pranata, double degree student in Software Engineering (Nanjing Xiaozhuang University, China) and Informatics (Universitas Islam Indonesia): tech stack, experience, and approach to interface engineering.",
);

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
