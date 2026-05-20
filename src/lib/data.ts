export const projects = [
  {
    id: "fitness-coach-ai",
    title: "Fitness Coach AI",
    description:
      "AI-powered personal fitness coaching application that builds adaptive workout and nutrition plans.",
    tech: ["Next.js", "TypeScript", "crewAI", "Python"],
    href: "#",
    status: "live" as const,
  },
  {
    id: "tbd-1",
    title: "TBD",
    description: "Coming soon.",
    tech: [] as string[],
    href: "#",
    status: "wip" as const,
  },
  {
    id: "tbd-2",
    title: "TBD",
    description: "Coming soon.",
    tech: [] as string[],
    href: "#",
    status: "wip" as const,
  },
] satisfies Project[];

export const stack = [
  { name: "Next.js", category: "framework" },
  { name: "TypeScript", category: "language" },
  { name: "SwiftUI", category: "framework" },
  { name: "Python", category: "language" },
  { name: "Tailwind CSS", category: "styling" },
  { name: "Framer Motion", category: "animation" },
  { name: "crewAI", category: "ai" },
] satisfies StackItem[];

export const experience = [
  {
    id: "university",
    role: "Computer Science Student",
    org: "University",
    period: "2022 – Present",
    description:
      "Pursuing a degree in Computer Science with a focus on frontend engineering and AI applications.",
  },
] satisfies Experience[];

// Types

export type Project = {
  id: string;
  title: string;
  description: string;
  tech: string[];
  href: string;
  status: "live" | "wip";
};

export type StackItem = {
  name: string;
  category: "framework" | "language" | "styling" | "animation" | "ai";
};

export type Experience = {
  id: string;
  role: string;
  org: string;
  period: string;
  description: string;
};
