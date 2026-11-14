/**
 * Marks a value that's still missing. Nothing renders it: a TODO link shows no button, a TODO
 * screenshot shows the neutral placeholder, a TODO period shows nothing. `grep -n TODO` lists them.
 */
export const TODO = 'TODO' as const
export type Todo = typeof TODO
export const isTodo = (v: unknown): v is Todo => v === TODO

export type ProjectCategory = 'web' | 'ios' | 'cms' | 'design'

/** Filter chips, in order, with their labels */
export const CATEGORIES: { id: ProjectCategory; chip: string; label: string }[] = [
  { id: 'web', chip: 'Web apps', label: 'Web app' },
  { id: 'ios', chip: 'iOS',      label: 'iOS app' },
  { id: 'cms', chip: 'CMS',      label: 'CMS site' },
  { id: 'design', chip: 'Design', label: 'UI/UX design' },
]
export const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map(c => [c.id, c.label])) as Record<ProjectCategory, string>

export interface ProjectLink {
  /** VISIT for a live site, GITHUB for a repo */
  kind: 'visit' | 'github'
  url: string
}

export interface Screenshot {
  src: string
  width: number
  height: number
}

export interface Project {
  slug: string
  title: string
  category: ProjectCategory
  /** e.g. "Mar 2025 to Jul 2025" */
  period: string | Todo
  /** Shown in the home page list */
  featured: boolean
  teamLead?: boolean
  /** Team the project was made with. Not shown on the card yet */
  team?: string
  description: string
  stack: string[]
  /** Landscape for web and cms, a portrait phone screenshot for ios */
  screenshot: Screenshot | Todo
  link: ProjectLink | Todo | null
  /** Longer notes from the CV. Not shown anywhere yet; kept for case studies */
  highlights?: string[]
}

/** In display order */
export const PROJECTS: Project[] = [
  {
    slug: 'moink',
    title: 'moink',
    category: 'web',
    period: TODO,
    featured: true,
    description: 'Chinese vocabulary learning platform with radical-based grouping, three quiz modes, and HSK 1 to 4 vocabulary, wrapped in a digital ink aesthetic.',
    stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Firebase', 'Supabase', 'PostgreSQL'],
    screenshot: { src: '/moink.webp', width: 1898, height: 970 },
    link: { kind: 'visit', url: 'https://moinkchinese.vercel.app/' },
    highlights: [
      'Built a Chinese vocabulary learning platform covering HSK 1 to 4 vocabulary sourced from the CC-CEDICT dictionary',
      'Designed radical-based vocabulary grouping and three quiz modes to help learners build and review vocabulary for HSK exam preparation',
      'Implemented user authentication with Firebase Auth and stored learning data across Firestore and Supabase (PostgreSQL)',
      'Created an ink and calligraphy-inspired interface with Framer Motion animations and the Canvas API',
    ],
  },
  {
    slug: 'healthsync',
    title: 'HealthSync',
    category: 'web',
    period: 'Mar 2025 to Jul 2025',
    featured: true,
    teamLead: true,
    description: 'Healthcare platform with electronic health records, real-time queuing and an AI health chatbot, for patients, doctors and admins.',
    stack: ['Next.js', 'Supabase', 'PostgreSQL'],
    screenshot: { src: '/healthsync.webp', width: 2400, height: 1423 },
    link: { kind: 'visit', url: 'https://healthsync-7.vercel.app' },
    highlights: [
      'Led the development of a healthcare platform using Next.js, Supabase, and PostgreSQL to integrate electronic health records and cross-facility data',
      'Integrated the Google Generative AI SDK to build a health chatbot and diagnostic assistant, providing real-time support for patients',
      'Engineered a real-time queuing system and role-based access control (RBAC) to streamline hospital workflows for doctors and administrators',
    ],
  },
  {
    slug: 'kelas-kampus',
    title: 'Kelas Kampus',
    category: 'web',
    period: 'Jul 2026 to Oct 2026',
    featured: true,
    description: 'Rebuilt the core pages and set up a reusable design system for an exam-prep education platform.',
    stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    screenshot: { src: '/kelas-kampus.webp', width: 1900, height: 968 },
    link: { kind: 'visit', url: 'https://kelaskampus.id' },
    highlights: [
      'Rebuilt core pages of the website using Next.js, TypeScript, and Tailwind CSS',
      'Established a reusable design system, including component library and style tokens, to standardize UI across the platform and speed up future development',
      'Improved page structure and responsiveness to support a growing student user base',
    ],
  },
  {
    slug: 'hellocation',
    title: 'HelloCation.id',
    category: 'cms',
    period: TODO,
    featured: true,
    description: 'Led the website redesign with a remote team, plus SEO and analytics.',
    stack: ['WordPress'],
    screenshot: { src: '/hellocation.webp', width: 1897, height: 967 },
    link: { kind: 'visit', url: 'https://hellocation.id' },
    highlights: [
      'Led the redesign of hellocation.id from Figma concept to WordPress staging and launch, coordinating a remote team of 6 designers and developers',
      'Managed on-page SEO on WordPress (meta titles and descriptions, sitemap, Search Console) and used Google Analytics to monitor site traffic and guide redesign priorities',
      'Handled server and website issues to keep the site running',
    ],
  },
  {
    slug: 'kinetiq',
    title: 'KinetiQ',
    category: 'ios',
    period: 'May 2026 to Jun 2026',
    featured: false,
    description: 'Checks your squat form live through the camera with a custom Core ML model, and coaches you out loud while you train.',
    stack: ['SwiftUI', 'Core ML', 'Vision', 'HealthKit', 'crewAI', 'Firebase'],
    screenshot: TODO,
    link: TODO, // GitHub repo, or null if there's none
  },
  {
    slug: 'wandr',
    title: 'Wandr',
    category: 'ios',
    period: 'May 2026 to Jun 2026',
    featured: false,
    description: 'Plans itineraries with AI, tells city stories in AR, and keeps a travel journal.',
    stack: ['SwiftUI', 'ARKit', 'MapKit', 'Groq', 'Firebase'],
    // public/wandr.webp is a 2400×1423 landscape image, not a portrait phone screenshot
    screenshot: TODO,
    link: TODO, // GitHub repo, or null if there's none
  },
  {
    slug: 'jamusari',
    title: 'JAMUSARI',
    category: 'cms',
    period: 'Sep 2025 to Nov 2025',
    featured: true,
    description: 'WordPress site for a herbal café and medicinal-plant conservation project in Desa Guwosari, with staff trained to run it.',
    stack: ['WordPress', 'Elementor'],
    screenshot: { src: '/jamusari.webp', width: 2400, height: 1417 },
    link: { kind: 'visit', url: 'https://jamusari.com' },
    highlights: [
      'Built jamusari.com end to end with WordPress and Elementor, handling hosting, domain setup on Hostinger, and deployment independently',
      'Designed a responsive interface for the "Modern Jamu" brand, with custom layouts for product catalogs, educational blogs, and conservation galleries',
      'Implemented on-page SEO and curated all digital assets to support search visibility and performance across devices',
    ],
  },
  {
    slug: 'wetrack',
    title: 'WETRACK',
    category: 'web',
    period: 'Sep 2024 to Jan 2025',
    featured: false,
    teamLead: true,
    description: 'Monitoring system with real-time tracking, geofencing alerts and role-based dashboards for supervising conditional release.',
    stack: ['PHP', 'MySQL', 'JavaScript', 'Leaflet'],
    screenshot: { src: '/wetrack.webp', width: 2400, height: 1358 },
    link: { kind: 'github', url: 'https://github.com/nikoyogapranata/wetrack' },
    highlights: [
      'Developed a web-based monitoring system using PHP, MySQL, and JavaScript to track ex-prisoners and monitor compliance before full release',
      'Implemented location tracking and geofencing with Leaflet to alert authorities of boundary violations',
      'Designed a role-based, multi-user architecture that lets different authorities securely access and manage sensitive tracking data',
    ],
  },
  {
    slug: 'edunovel',
    title: 'EduNovel',
    category: 'design',
    period: 'Sep 2023 to Jan 2024',
    featured: false,
    team: 'EduConnect',
    description: 'Designed the user flows, interface and visual theme for a gamified learning app, plus the posters and promo videos.',
    stack: ['Figma'],
    screenshot: { src: '/edunovel.webp', width: 2400, height: 1490 },
    link: null,
  },
]

export const FEATURED_PROJECTS = PROJECTS.filter(p => p.featured)
