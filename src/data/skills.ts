export interface SkillCategory {
  title: string
  skills: string[]
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    title: 'Frontend',
    skills: ['React', 'Next.js', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Framer Motion'],
  },
  {
    title: 'Backend & Database',
    skills: ['Node.js', 'Express', 'PHP', 'REST API', 'PostgreSQL', 'MySQL', 'Supabase', 'Firebase'],
  },
  {
    title: 'Mobile',
    skills: ['Swift', 'SwiftUI', 'ARKit', 'Core ML'],
  },
  {
    title: 'AI',
    skills: ['Google Gemini', 'Groq / LLaMA', 'crewAI'],
  },
  {
    title: 'Web & CMS',
    skills: ['WordPress', 'Elementor', 'SEO', 'Google Analytics'],
  },
  {
    title: 'Tools',
    skills: ['Git', 'GitHub', 'Vercel', 'Figma', 'Notion', 'VS Code', 'Xcode'],
  },
]
