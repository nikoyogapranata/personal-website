export interface SkillCategory {
  title: string
  description?: string
  skills: string[]
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    title: 'Frontend & UI',
    description: 'Modern, responsive, and accessible interfaces with fluid motion and semantic markup.',
    skills: [
      'React',
      'Next.js',
      'TypeScript',
      'JavaScript',
      'Tailwind CSS',
      'Framer Motion',
      'HTML5',
      'CSS3',
    ],
  },
  {
    title: 'Backend & Data',
    description: 'Scalable serverless backends, relational databases, and RESTful API architectures.',
    skills: [
      'Node.js',
      'Express',
      'PHP',
      'Supabase',
      'Firebase',
      'PostgreSQL',
      'MySQL',
      'REST API',
    ],
  },
  {
    title: 'Mobile & AI',
    description: 'Native mobile interfaces integrated with autonomous multi-agent AI and machine learning.',
    skills: [
      'SwiftUI',
      'Swift',
      'Python',
      'Google Gemini AI',
      'Groq / LLaMA',
      'crewAI',
      'ARKit',
      'Core ML',
    ],
  },
  {
    title: 'Design & Tooling',
    description: 'Design systems, prototyping workflows, and modern development pipelines.',
    skills: [
      'Figma',
      'Git',
      'GitHub',
      'Vercel',
      'VS Code',
      'Xcode',
      'WordPress',
      'Elementor',
    ],
  },
]

/**
 * Flat list of all core technologies for quick iteration and legacy component support.
 */
export const ALL_SKILLS: string[] = SKILL_CATEGORIES.flatMap(cat => cat.skills)

