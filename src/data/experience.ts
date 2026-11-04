export interface ExperienceItem {
  id: string
  role: string
  company: string
  period: string
  location?: string
  type: 'Work' | 'Academic' | 'Leadership'
  description: string
  highlights?: string[]
  skills?: string[]
}

export const EXPERIENCES: ExperienceItem[] = [
  {
    id: 'it-manager-hellocation',
    role: 'IT Manager',
    company: 'HelloCation',
    period: 'Jan 2026 - Present',
    location: 'Remote',
    type: 'Leadership',
    description: 'Spearheaded strategic restructuring of the IT division into Development and Support squads, directed a remote team of designers and developers, managed the redesign of Hellocation.id, and served as the technical bridge to C-level executives.',
    highlights: [
      'Restructured IT division into specialized Development and Support squads to optimize workflow, accountability, and project delivery speed',
      'Leading comprehensive redesign of Hellocation.id from high-fidelity UI/UX conceptualization to secure WordPress staging and implementation',
      'Directing a remote team of UI/UX designers and web developers with agile Notion workflows and monthly KPI tracking',
      'Acting as liaison between IT and C-level executives to align technical roadmaps with business growth and oversee server reliability',
    ],
    skills: ['Team Leadership', 'Project Management', 'WordPress', 'Figma', 'Server Administration'],
  },
  {
    id: 'frontend-kelas-kampus',
    role: 'Frontend Web Developer',
    company: 'Kelas Kampus',
    period: 'Jul 2026 - Oct 2026',
    location: 'Remote',
    type: 'Work',
    description: 'Rebuilt the front end using Next.js, TypeScript, Tailwind CSS, and Framer Motion, migrating legacy pages to a modern component-based architecture and building the company design system.',
    highlights: [
      'Rebuilt core platform frontend using Next.js, TypeScript, Tailwind CSS, and Framer Motion for higher performance and responsiveness',
      'Built a centralized design system covering reusable components, typography, spacing, and standardized color tokens',
      'Integrated frontend views with backend services via REST APIs to fetch and manage platform content dynamically',
      'Collaborated remotely with the Batch 8 product team, translating requirement specifications into production-ready interfaces',
    ],
    skills: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'REST API'],
  },
  {
    id: 'web-developer-jamusari',
    role: 'Web Developer',
    company: 'Jamusari',
    period: 'Aug 2025 - Nov 2025',
    location: 'Yogyakarta, Indonesia',
    type: 'Work',
    description: 'Designed and built the Jamusari website end-to-end - from UI concept and asset curation to SEO implementation and launch - using WordPress and Elementor to deliver a maintainable, performant site promoting the Modern Jamu and TOGA conservation initiative.',
    highlights: [
      'Designed a responsive and visually engaging user interface to promote the "Modern Jamu" concept and TOGA conservation initiative',
      'Curated digital assets and implemented comprehensive SEO strategies ensuring high search discoverability and optimal device performance',
      'Managed complete project lifecycle independently from requirement gathering to server deployment on Hostinger',
      'Leveraged WordPress and Elementor to build a customizable site architecture easily maintained by non-technical stakeholders',
    ],
    skills: ['WordPress', 'Elementor', 'SEO', 'UI/UX Design', 'Hostinger'],
  },
  {
    id: 'ta-software-engineering',
    role: 'Software Engineering Course Teaching Assistant',
    company: 'Islamic University of Indonesia',
    period: 'Mar 2025 - Aug 2025',
    location: 'Yogyakarta, Indonesia',
    type: 'Academic',
    description: 'Assessed student programming assignments, provided technical feedback, and guided undergraduates in mastering software engineering principles and design patterns.',
    highlights: [
      'Assessed and provided constructive code reviews on undergraduate software engineering assignments to reinforce best practices',
      'Assisted students in understanding object-oriented design, modularity, and clean architectural principles',
      'Conducted mentoring sessions to help students resolve implementation roadblocks and logical bugs',
    ],
    skills: ['Software Engineering', 'Code Review', 'Clean Code', 'Mentoring'],
  },
  {
    id: 'ta-dsa',
    role: 'Data Structures and Algorithms Laboratory Assistant',
    company: 'Integrated Informatics Laboratory',
    period: 'Mar 2025 - Aug 2025',
    location: 'Yogyakarta, Indonesia',
    type: 'Academic',
    description: 'Conducted weekly hands-on laboratory sessions for 30+ students, evaluated coding assignments, and reinforced algorithmic problem-solving techniques.',
    highlights: [
      'Supported 30+ undergraduate students during weekly hands-on lab sessions covering core data structures and algorithmic paradigms',
      'Reviewed and graded coding assignments, providing actionable guidance for logical structuring and computational efficiency',
      'Delivered live explanations and problem-solving demos to reinforce theoretical concepts through practical code implementation',
    ],
    skills: ['Data Structures', 'Algorithms', 'Java', 'Python', 'Problem Solving'],
  },
  {
    id: 'uiux-hellocation',
    role: 'UI/UX Designer',
    company: 'HelloCation',
    period: 'Mar 2025 - Aug 2025',
    location: 'Remote',
    type: 'Work',
    description: 'Redesigned the entire HelloCation website across all key pages in Figma - modernizing layouts, improving visual hierarchy, and ensuring consistent branding and responsive, user-friendly interfaces throughout.',
    highlights: [
      'Redesigned the entire HelloCation website including Home, About Us, Services, News, and Contact pages',
      'Enhanced information architecture with clearer navigation, optimized content presentation, and refined section layouts',
      'Ensured responsive, user-friendly mobile and desktop interfaces using Figma and modern design principles',
    ],
    skills: ['Figma', 'UI/UX Design', 'Design Systems', 'Wireframing', 'Prototyping'],
  },
  {
    id: 'it-support-hellocation',
    role: 'IT Support',
    company: 'HelloCation Korea',
    period: 'Oct 2024 - Feb 2025',
    location: 'Remote',
    type: 'Work',
    description: 'Provided technical operations support, managed live streaming broadcasts for international sessions, and analyzed digital engagement metrics.',
    highlights: [
      'Managed live streaming infrastructure across social media platforms ensuring high broadcast quality during events',
      'Provided rapid technical troubleshooting and assistance for Zoom and webinar conference sessions',
      'Analyzed audience engagement and social media metrics to optimize outreach campaigns',
    ],
    skills: ['Technical Support', 'Live Streaming', 'Digital Media', 'Analytics'],
  },
]
