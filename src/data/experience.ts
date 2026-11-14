export interface ExperienceRole {
  id: string
  role: string
  /** Shown under the role when the team differs from the company heading */
  team?: string
  period: string
  location?: string
  type: 'Work' | 'Academic' | 'Leadership'
  description: string
  highlights?: string[]
  skills?: string[]
}

export interface ExperienceEntry {
  id: string
  company: string
  /** Newest first */
  roles: ExperienceRole[]
}

export const EXPERIENCES: ExperienceEntry[] = [
  {
    id: 'hellocation',
    company: 'HelloCation',
    roles: [
      {
        id: 'it-manager-hellocation',
        role: 'IT Manager',
        period: 'Jan 2026 - Present',
        location: 'Remote',
        type: 'Leadership',
        description: 'Restructured the IT division into Development and Support squads. Led the redesign of hellocation.id with a remote team of 6 designers and developers, from Figma concept to WordPress launch. Manage on-page SEO and Google Analytics, and work with C-level executives to align technical plans with business goals.',
        highlights: [
          'Restructured the IT division into Development and Support squads, giving each team clearer ownership and a faster path from request to delivery',
          'Led the redesign of hellocation.id from Figma concept to WordPress staging and launch, coordinating a remote team of 6 designers and developers',
          'Managed on-page SEO on WordPress (meta titles and descriptions, sitemap, Search Console) and used Google Analytics to monitor site traffic and guide redesign priorities',
          'Set up Notion workflows for task tracking and monthly KPIs, and ran team kickoff and onboarding for new intern batches',
          'Served as the link between the IT team and C-level executives, aligning technical plans with business goals and handling server and website issues to keep the site running',
        ],
        skills: ['WordPress', 'Figma', 'SEO', 'Google Analytics', 'Notion'],
      },
      {
        id: 'uiux-hellocation',
        role: 'UI/UX Designer',
        team: 'HelloCation Korea',
        period: 'Mar 2025 - Jun 2025',
        location: 'Remote',
        type: 'Work',
        description: 'Redesigned the entire HelloCation website, including the Home, About Us, Services, News, and Contact pages, with modern layouts, improved visual hierarchy, and consistent branding. Designed responsive, user-friendly interfaces in Figma.',
        highlights: [
          'Redesigned the entire HelloCation website, including the Home, About Us, Services, News, and Contact pages, focusing on modern layouts, improved visual hierarchy, and consistent branding',
          'Enhanced page structures with clearer navigation, optimized content presentation, and refined section organization, such as hero banners, service listings, article layouts, and contact forms',
          'Ensured responsive, user-friendly interfaces across all pages using Figma and current UI/UX design principles',
        ],
        skills: ['Figma', 'UI/UX Design'],
      },
      {
        id: 'it-support-hellocation',
        role: 'IT Support',
        team: 'HelloCation Korea',
        period: 'Oct 2024 - Feb 2025',
        location: 'Remote',
        type: 'Work',
        description: 'Provided technical support, focusing on Zoom-related issues. Managed live streaming of events across social media platforms and analyzed social media engagement metrics to optimize content strategies.',
        highlights: [
          'Provided technical support, focusing on Zoom-related issues',
          'Managed live streaming of events across social media platforms, ensuring professional broadcast quality',
          'Analyzed social media engagement metrics to optimize content strategies',
        ],
        skills: ['Technical Support', 'Live Streaming', 'Analytics'],
      },
    ],
  },
  {
    id: 'kelas-kampus',
    company: 'Kelas Kampus',
    roles: [
      {
        id: 'frontend-kelas-kampus',
        role: 'Frontend Developer Intern',
        period: 'Jul 2026 - Oct 2026',
        location: 'Remote',
        type: 'Work',
        description: 'Rebuilt the website front end with Next.js, TypeScript, Tailwind CSS, and Framer Motion, migrating legacy pages to a component-based architecture. Integrated it with backend services via REST API and built a design system of reusable components, typography, spacing, and color tokens. Worked remotely with the team as part of Batch 8.',
        highlights: [
          'Rebuilt the website front end using Next.js, TypeScript, Tailwind CSS, and Framer Motion, migrating legacy pages to a modern, component-based architecture',
          'Integrated the frontend with backend services via REST API to fetch and manage platform content and data',
          'Built a design system covering reusable components, typography, spacing, and color tokens to keep the UI consistent across the platform',
          'Collaborated remotely with the Kelas Kampus team as part of Batch 8, translating product and content requirements into responsive, production-ready interfaces',
        ],
        skills: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'REST API'],
      },
    ],
  },
  {
    id: 'jamusari',
    company: 'Jamusari Cafe',
    roles: [
      {
        id: 'web-developer-jamusari',
        role: 'Web Developer',
        period: 'Aug 2025 - Nov 2025',
        location: 'Yogyakarta, Indonesia',
        type: 'Work',
        description: 'Built jamusari.com end to end with WordPress and Elementor, handling hosting, domain setup on Hostinger, and deployment independently. Designed a responsive interface for the "Modern Jamu" brand, implemented on-page SEO, and set up the site so non-technical staff can update content without developer help.',
        highlights: [
          'Built jamusari.com end to end with WordPress and Elementor, handling hosting, domain setup on Hostinger, and deployment independently',
          'Designed a responsive interface for the "Modern Jamu" brand, with custom layouts for product catalogs, educational blogs, and conservation galleries',
          'Implemented on-page SEO and curated all digital assets to support search visibility and performance across devices',
          'Gathered and structured all site content to present the PPK Ormawa TOGA conservation program in Desa Guwosari',
          'Set up the site so non-technical staff can update content without developer help',
        ],
        skills: ['WordPress', 'Elementor', 'SEO', 'Hostinger'],
      },
    ],
  },
  {
    id: 'uii',
    company: 'Universitas Islam Indonesia',
    roles: [
      {
        id: 'ta-software-engineering',
        role: 'Software Engineering Course Teaching Assistant',
        period: 'Mar 2025 - Aug 2025',
        location: 'Yogyakarta, Indonesia',
        type: 'Academic',
        description: 'Assessed student assignments and gave constructive feedback to help students avoid repeating mistakes. Helped students understand course material and assignments through responsive, clear communication.',
        highlights: [
          'Assessed and provided constructive feedback on student assignments to help them avoid repeating mistakes',
          'Assisted students in understanding course material and assignments through responsive and clear communication',
        ],
        skills: ['Software Engineering'],
      },
    ],
  },
  {
    id: 'integrated-informatics-lab',
    company: 'Integrated Informatics Laboratory',
    roles: [
      {
        id: 'ta-dsa',
        role: 'Data Structures and Algorithms Laboratory Assistant',
        period: 'Mar 2025 - Aug 2025',
        location: 'Yogyakarta, Indonesia',
        type: 'Academic',
        description: 'Supported 30+ students in the Data Structures and Algorithms course during weekly lab sessions. Reviewed and graded coding assignments, gave guidance on logical structuring and efficiency, and provided explanations and hands-on help during labs.',
        highlights: [
          'Supported 30+ students enrolled in the Data Structures and Algorithms course during weekly lab sessions',
          'Reviewed and graded coding assignments, providing guidance for logical structuring and efficiency improvements',
          'Delivered explanations and hands-on assistance during labs to reinforce understanding of algorithmic concepts and programming techniques',
        ],
        skills: ['Data Structures', 'Algorithms'],
      },
    ],
  },
]

/* ── /about experience cards ────────────────────────────────────────────────
   Work only, in this order. Built from EXPERIENCES so the roles above stay the single source;
   education lives in profile.ts (the /about cities section). */

export interface ExperienceCard {
  id: string
  company: string
  /** Name in the /about index list; defaults to the company */
  label?: string
  role: string
  /** Earlier roles at the same company, shown as one small line */
  previously?: string
  period: string
  /**
   * One line for the card. Written for Kelas Kampus and Teaching Assistant; HelloCation
   * and Jamusari use the first sentence of the role's description
   */
  summary: string
  skills: string[]
}

const firstSentence = (text: string) => text.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? text

function entry(id: string) {
  const found = EXPERIENCES.find(e => e.id === id)
  if (!found) throw new Error(`experience.ts: no entry "${id}"`)
  return found
}

function card(id: string, overrides: Partial<ExperienceCard> = {}): ExperienceCard {
  const e = entry(id)
  const [current, ...earlier] = e.roles
  return {
    id: e.id,
    company: e.company,
    role: current.role,
    previously: earlier.length ? earlier.map(r => r.role).join(', ') : undefined,
    period: current.period,
    summary: firstSentence(current.description),
    skills: current.skills ?? [],
    ...overrides,
  }
}

// The two teaching-assistant roles, shown as one card
const ta = entry('uii').roles[0]
const lab = entry('integrated-informatics-lab').roles[0]

export const EXPERIENCE_CARDS: ExperienceCard[] = [
  card('hellocation'),
  card('kelas-kampus', {
    summary: 'Rebuilt the front end as reusable components, connected it to REST APIs, and built the design system behind it.',
  }),
  card('jamusari'),
  {
    id: 'teaching-assistant',
    company: `${entry('uii').company} · ${entry('integrated-informatics-lab').company}`,
    label: 'Teaching Assistant',
    role: 'Teaching Assistant',
    // Both roles ran over the same months; joined if that ever changes
    period: ta.period === lab.period ? ta.period : `${ta.period} / ${lab.period}`,
    summary: 'Ran weekly Data Structures and Algorithms labs for 30+ students and graded coding assignments for the Software Engineering course.',
    skills: [...new Set([...(ta.skills ?? []), ...(lab.skills ?? [])])],
  },
]
