/** Toolbox categories on /about. Each has its own chip style there (see Toolbox.tsx) */
export type SkillCategoryId = 'frontend' | 'backend' | 'databases' | 'ios' | 'ai' | 'design'

export interface SkillCategory {
  id: SkillCategoryId
  title: string
  skills: string[]
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: 'frontend',
    title: 'Web frontend',
    skills: ['Next.js', 'React', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Framer Motion', 'HTML5', 'CSS3'],
  },
  {
    id: 'backend',
    title: 'Web backend',
    skills: ['Node.js', 'Express', 'PHP', 'Spring Boot', 'Jakarta EE', 'Thymeleaf', 'REST API'],
  },
  {
    id: 'databases',
    title: 'Databases',
    skills: ['PostgreSQL', 'MySQL', 'Supabase', 'Firebase'],
  },
  {
    id: 'ios',
    title: 'iOS',
    skills: ['Swift', 'SwiftUI', 'ARKit', 'Core ML', 'HealthKit'],
  },
  {
    id: 'ai',
    title: 'AI and data',
    skills: ['Python', 'Gemini', 'Groq / LLaMA', 'crewAI'],
  },
  {
    id: 'design',
    title: 'Design and tools',
    skills: ['Figma', 'WordPress', 'Git', 'Vercel'],
  },
]
