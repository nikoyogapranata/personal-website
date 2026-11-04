export interface ProjectLink {
  label: 'Live Demo' | 'GitHub' | 'Figma' | 'Case Study'
  url: string
}

export interface Project {
  id: number
  slug: string
  title: string
  category: string
  year: string
  featured: boolean
  description: string
  shortDescription: string
  highlights?: string[]
  tags: string[]
  image: string
  link: string
  links: ProjectLink[]
}

export const PROJECTS: Project[] = [
  {
    id: 1,
    slug: 'moink',
    title: 'moink',
    category: 'Web · Fullstack',
    year: '2026',
    featured: true,
    description: 'Interactive Chinese character learning and calligraphy platform bridging traditional ink aesthetics with modern web technologies.',
    shortDescription: 'Interactive Chinese character learning and calligraphy platform with digital ink aesthetics.',
    highlights: [
      'Engineered a canvas-based stroke order recognition engine with fluid ink wash simulation physics',
      'Architected a responsive, component-driven Next.js and TypeScript interface for precision handwriting input',
      'Developed spaced-repetition vocabulary drills and real-time stroke feedback for HSK exam preparation',
    ],
    tags: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Canvas API'],
    image: '/moink.webp',
    link: 'https://moinkchinese.vercel.app/',
    links: [
      { label: 'GitHub', url: 'https://moinkchinese.vercel.app/' },
    ],
  },
  {
    id: 2,
    slug: 'kelas-kampus',
    title: 'Kelas Kampus',
    category: 'Web · Frontend',
    year: '2026',
    featured: true,
    description: 'Education platform for university entrance exam prep and campus life rebuilt with a scalable component-based architecture.',
    shortDescription: 'High-performance university exam prep platform rebuilt with Next.js and custom design system.',
    highlights: [
      'Rebuilt core platform frontend, migrating legacy pages into modular, maintainable React and Next.js components',
      'Engineered an accessible design system covering component libraries, typography, and standardized design tokens',
      'Integrated frontend views with backend services via REST APIs to dynamically fetch and display learning content',
    ],
    tags: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'REST API'],
    image: '/kelas-kampus.webp',
    link: 'https://kelaskampus.id',
    links: [
      { label: 'Live Demo', url: 'https://kelaskampus.id' },
    ],
  },
  {
    id: 3,
    slug: 'hellocation',
    title: 'Hellocation.id',
    category: 'Web · Fullstack',
    year: '2026',
    featured: true,
    description: 'Full-scale digital overhaul and high-performance web platform for a global education consultancy.',
    shortDescription: 'Comprehensive web platform and brand redesign for international education consulting.',
    highlights: [
      'Managed full project lifecycle from high-fidelity Figma UI/UX prototyping to secure staging and deployment',
      'Constructed modular course catalogs, service listings, and consultation inquiry funnels to maximize conversion',
      'Overseeing critical server troubleshooting, hosting uptime, and core web vitals performance optimization',
    ],
    tags: ['WordPress', 'Elementor', 'Figma', 'UI/UX Design', 'PHP'],
    image: '/hellocation.webp',
    link: 'https://hellocation.id',
    links: [
      { label: 'Live Demo', url: 'https://hellocation.id' },
    ],
  },
  /*
  {
    id: 4,
    slug: 'wandr',
    title: 'Wandr',
    category: 'Mobile · AI',
    year: '2026',
    featured: true,
    description: 'AI-powered iOS travel companion with AR landmark recognition and autonomous multi-agent itinerary planning.',
    shortDescription: 'AI travel companion featuring AR scanning and multi-agent itinerary planning.',
    highlights: [
      'Architected 8 autonomous AI agents using Groq and Google Gemini for dynamic personalized trip planning',
      'Implemented on-device computer vision with ARKit and Core ML for instant landmark and cuisine scanning',
      'Constructed reactive native iOS UI with SwiftUI, MapKit, and Firebase cloud data synchronization',
    ],
    tags: ['SwiftUI', 'Gemini AI', 'Groq', 'ARKit', 'Core ML', 'Firebase'],
    image: '/wandr.webp',
    link: 'https://github.com/nikoyogapranata',
    links: [
      { label: 'GitHub', url: 'https://github.com/nikoyogapranata' },
    ],
  },
  */
  {
    id: 5,
    slug: 'healthsync',
    title: 'HealthSync',
    category: 'Web · Fullstack',
    year: '2025',
    featured: true,
    description: 'Healthcare platform integrating electronic health records with a Google Generative AI diagnostic chatbot.',
    shortDescription: 'Healthcare operations platform with integrated Google Generative AI diagnostic assistant.',
    highlights: [
      'Integrated Google Generative AI SDK to power an intelligent diagnostic chatbot and patient intake assistant',
      'Engineered real-time hospital queueing system with Supabase real-time subscriptions and PostgreSQL',
      'Implemented role-based access control (RBAC) across patient, doctor, and administrator portals',
    ],
    tags: ['Next.js', 'Supabase', 'PostgreSQL', 'Google Gen AI', 'Tailwind CSS'],
    image: '/healthsync.webp',
    link: 'https://healthsync-7.vercel.app',
    links: [
      { label: 'Live Demo', url: 'https://healthsync-7.vercel.app' },
    ],
  },
  {
    id: 6,
    slug: 'jamusari',
    title: 'JAMUSARI',
    category: 'Web · Fullstack',
    year: '2025',
    featured: true,
    description: 'Digital platform and product catalog promoting the Modern Jamu and TOGA conservation initiative.',
    shortDescription: 'Cultural preservation and e-commerce web platform digitizing herbal medicine traditions.',
    highlights: [
      'Spearheaded end-to-end development, server configuration on Hostinger, and domain architecture',
      'Designed responsive, culturally resonant UI with custom catalogs for medicinal plants and products',
      'Executed comprehensive SEO strategies to enhance visibility for community empowerment efforts in Desa Guwosari',
    ],
    tags: ['WordPress', 'Elementor', 'UI/UX Design', 'SEO', 'Hostinger'],
    image: '/jamusari.webp',
    link: 'https://jamusari.com',
    links: [
      { label: 'Live Demo', url: 'https://jamusari.com' },
    ],
  },
  {
    id: 7,
    slug: 'wetrack',
    title: 'WETRACK',
    category: 'Web · Fullstack',
    year: '2024',
    featured: false,
    description: 'Web-based surveillance system using real-time location tracking and geofencing to monitor compliance.',
    shortDescription: 'Web-based surveillance and compliance system with real-time geofencing alerts.',
    highlights: [
      'Developed interactive map interface with real-time geofencing to alert authorities of boundary violations',
      'Constructed secure multi-user role architecture allowing distinct authorities to manage sensitive tracking data',
      'Optimized relational MySQL schema and background polling for efficient location telemetry processing',
    ],
    tags: ['PHP', 'MySQL', 'JavaScript', 'Leaflet', 'Tailwind CSS'],
    image: '/wetrack.webp',
    link: 'https://github.com/nikoyogapranata/wetrack',
    links: [
      { label: 'GitHub', url: 'https://github.com/nikoyogapranata/wetrack' },
    ],
  },
  {
    id: 8,
    slug: 'edunovel',
    title: 'EduNovel',
    category: 'UI/UX Design',
    year: '2023',
    featured: false,
    description: 'Gamified educational mobile application concept, brand identity, and interactive prototype.',
    shortDescription: 'Interactive gamified educational app design and visual branding system.',
    highlights: [
      'Designed end-to-end user experience and wireframes incorporating interactive gamification mechanics',
      'Conducted user research to optimize learning workflows and accessibility for young learners',
      'Created complete design token palette, iconography, and high-fidelity clickable prototype in Figma',
    ],
    tags: ['Figma', 'UI/UX Design', 'Design Systems', 'Gamification'],
    image: '/edunovel.webp',
    link: 'https://www.figma.com/proto/cY7vOHUdtTfLDkTYDthI1n/EduNovel?page-id=0%3A1&node-id=2-2397&p=f&viewport=308%2C326%2C0.03&t=n2kiA8gcGTPQdv0j-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=2%3A2397&show-proto-sidebar=1',
    links: [
      {
        label: 'Figma',
        url: 'https://www.figma.com/proto/cY7vOHUdtTfLDkTYDthI1n/EduNovel?page-id=0%3A1&node-id=2-2397&p=f&viewport=308%2C326%2C0.03&t=n2kiA8gcGTPQdv0j-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=2%3A2397&show-proto-sidebar=1',
      },
    ],
  },
]
