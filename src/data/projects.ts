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
  /** What Niko personally did, shown under the description on /work */
  contribution: string
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
    description: 'Chinese vocabulary learning platform with radical-based grouping, three quiz modes, and HSK 1 to 4 vocabulary, wrapped in a digital ink aesthetic.',
    shortDescription: 'Chinese vocabulary learning platform with radical-based grouping, three quiz modes, and HSK 1 to 4 vocabulary, wrapped in a digital ink aesthetic.',
    contribution: 'Designed and built the full app, frontend and backend.',
    highlights: [
      'Built a Chinese vocabulary learning platform covering HSK 1 to 4 vocabulary sourced from the CC-CEDICT dictionary',
      'Designed radical-based vocabulary grouping and three quiz modes to help learners build and review vocabulary for HSK exam preparation',
      'Implemented user authentication with Firebase Auth and stored learning data across Firestore and Supabase (PostgreSQL)',
      'Created an ink and calligraphy-inspired interface with Framer Motion animations and the Canvas API',
    ],
    tags: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Firebase', 'Supabase', 'PostgreSQL'],
    image: '/moink.webp',
    link: 'https://moinkchinese.vercel.app/',
    links: [
      { label: 'GitHub', url: 'https://moinkchinese.vercel.app/' },
    ],
  },
  {
    id: 2,
    slug: 'healthsync',
    title: 'HealthSync',
    category: 'Web · Fullstack',
    year: '2025',
    featured: true,
    description: 'Healthcare platform integrating electronic health records and cross-facility data, with a Google Generative AI chatbot and diagnostic assistant.',
    shortDescription: 'Healthcare platform integrating electronic health records with a Google Gen AI chatbot and diagnostic assistant.',
    contribution: 'Led development with a Supabase/PostgreSQL backend, role-based access control, and a Google Gen AI assistant.',
    highlights: [
      'Led the development of a healthcare platform using Next.js, Supabase, and PostgreSQL to integrate electronic health records and cross-facility data',
      'Integrated the Google Generative AI SDK to build a health chatbot and diagnostic assistant, providing real-time support for patients',
      'Engineered a real-time queuing system and role-based access control (RBAC) to streamline hospital workflows for doctors and administrators',
    ],
    tags: ['Next.js', 'Supabase', 'PostgreSQL', 'Google Gen AI', 'Tailwind CSS'],
    image: '/healthsync.webp',
    link: 'https://healthsync-7.vercel.app',
    links: [
      { label: 'Live Demo', url: 'https://healthsync-7.vercel.app' },
    ],
  },
  {
    id: 3,
    slug: 'kelas-kampus',
    title: 'Kelas Kampus',
    category: 'Web · Frontend',
    year: '2026',
    featured: true,
    description: 'Education platform for university entrance exam prep and campus life content, rebuilt with Next.js and a reusable design system.',
    shortDescription: 'Education platform for university entrance exam prep and campus life content, rebuilt with Next.js and a reusable design system.',
    contribution: 'Rebuilt the frontend and built the company design system.',
    highlights: [
      'Rebuilt core pages of the website using Next.js, TypeScript, and Tailwind CSS',
      'Established a reusable design system, including component library and style tokens, to standardize UI across the platform and speed up future development',
      'Improved page structure and responsiveness to support a growing student user base',
    ],
    tags: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'REST API'],
    image: '/kelas-kampus.webp',
    link: 'https://kelaskampus.id',
    links: [
      { label: 'Live Demo', url: 'https://kelaskampus.id' },
    ],
  },
  {
    id: 4,
    slug: 'hellocation',
    title: 'Hellocation.id',
    category: 'Web · CMS & Redesign',
    year: '2026',
    featured: true,
    description: 'Website redesign taken from Figma concept to WordPress staging and launch.',
    shortDescription: 'Website redesign taken from Figma concept to WordPress staging and launch.',
    contribution: 'Led the website redesign and handled on-page SEO and Google Analytics.',
    highlights: [
      'Led the redesign of hellocation.id from Figma concept to WordPress staging and launch, coordinating a remote team of 6 designers and developers',
      'Managed on-page SEO on WordPress (meta titles and descriptions, sitemap, Search Console) and used Google Analytics to monitor site traffic and guide redesign priorities',
      'Handled server and website issues to keep the site running',
    ],
    tags: ['WordPress', 'Elementor', 'Figma', 'SEO', 'Google Analytics'],
    image: '/hellocation.webp',
    link: 'https://hellocation.id',
    links: [
      { label: 'Live Demo', url: 'https://hellocation.id' },
    ],
  },
  {
    id: 5,
    slug: 'jamusari',
    title: 'JAMUSARI',
    category: 'Web · CMS',
    year: '2025',
    featured: true,
    description: 'Website for the "Modern Jamu" brand, with product catalogs, educational blogs, and conservation galleries presenting the PPK Ormawa TOGA conservation program in Desa Guwosari.',
    shortDescription: 'Website for the "Modern Jamu" brand, with product catalogs, educational blogs, and conservation galleries.',
    contribution: 'Designed and built the site end to end, including SEO, hosting, and launch.',
    highlights: [
      'Built jamusari.com end to end with WordPress and Elementor, handling hosting, domain setup on Hostinger, and deployment independently',
      'Designed a responsive interface for the "Modern Jamu" brand, with custom layouts for product catalogs, educational blogs, and conservation galleries',
      'Implemented on-page SEO and curated all digital assets to support search visibility and performance across devices',
    ],
    tags: ['WordPress', 'Elementor', 'UI/UX Design', 'SEO', 'Hostinger'],
    image: '/jamusari.webp',
    link: 'https://jamusari.com',
    links: [
      { label: 'Live Demo', url: 'https://jamusari.com' },
    ],
  },
  {
    id: 6,
    slug: 'wetrack',
    title: 'WETRACK',
    category: 'Web · Fullstack',
    year: '2024',
    featured: false,
    description: 'Web-based monitoring system to track ex-prisoners and monitor compliance before full release, with geofencing alerts for boundary violations.',
    shortDescription: 'Web-based monitoring system with location tracking and geofencing that alerts authorities of boundary violations.',
    contribution: 'Built a PHP/MySQL system with Leaflet geofencing and role-based multi-user access.',
    highlights: [
      'Developed a web-based monitoring system using PHP, MySQL, and JavaScript to track ex-prisoners and monitor compliance before full release',
      'Implemented location tracking and geofencing with Leaflet to alert authorities of boundary violations',
      'Designed a role-based, multi-user architecture that lets different authorities securely access and manage sensitive tracking data',
    ],
    tags: ['PHP', 'MySQL', 'JavaScript', 'Leaflet'],
    image: '/wetrack.webp',
    link: 'https://github.com/nikoyogapranata/wetrack',
    links: [
      { label: 'GitHub', url: 'https://github.com/nikoyogapranata/wetrack' },
    ],
  },
  {
    id: 7,
    slug: 'edunovel',
    title: 'EduNovel',
    category: 'UI/UX Design',
    year: '2023',
    featured: false,
    description: 'Interactive educational app design, using gamification elements to encourage student engagement.',
    shortDescription: 'Interactive educational app design, using gamification elements to encourage student engagement.',
    contribution: 'Designed the app UI and visual branding system in Figma.',
    highlights: [
      'Designed the user interface for an interactive educational app, using gamification elements to encourage student engagement',
      'Improved accessibility and usability for both students and educators through user-centered design',
      'Created visual assets and promotional content to support the app launch and marketing',
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
  /*
  {
    id: 8,
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
]
