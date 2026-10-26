export type Project = {
  id: number
  title: string
  category: string
  year: string
  description: string
  tags: string[]
  /** WebP in /public; next/image serves resized AVIF/WebP variants */
  image: string
  link: string
}

// Single source for the home Work list and the /work grid
export const PROJECTS: Project[] = [
  {
    id: 1,
    title: 'JAMUSARI',
    category: 'Web · Fullstack',
    year: '2025',
    description: 'A fullstack web platform built for modern needs.',
    tags: ['Next.js', 'TypeScript', 'Supabase'],
    image: '/jamusari.webp',
    link: 'https://jamusari.com',
  },
  {
    id: 2,
    title: 'HealthSync',
    category: 'Web · Fullstack',
    year: '2025',
    description: 'Health tracking dashboard with real-time data sync.',
    tags: ['React', 'Node.js', 'Firebase'],
    image: '/healthsync.webp',
    link: 'https://healthsync-7.vercel.app',
  },
  {
    id: 3,
    title: 'WETRACK',
    category: 'Web · Fullstack',
    year: '2024',
    description: 'Collaborative project tracking tool for teams.',
    tags: ['Next.js', 'Prisma', 'PostgreSQL'],
    image: '/wetrack.webp',
    link: 'https://github.com/nikoyogapranata/wetrack',
  },
  {
    id: 4,
    title: 'EduNovel',
    category: 'Design · Branding',
    year: '2023',
    description: 'Brand identity and UI design for an ed-tech startup.',
    tags: ['Figma', 'Branding', 'UI Design'],
    image: '/edunovel.webp',
    link: 'https://www.figma.com/proto/cY7vOHUdtTfLDkTYDthI1n/EduNovel?page-id=0%3A1&node-id=2-2397&p=f&viewport=308%2C326%2C0.03&t=n2kiA8gcGTPQdv0j-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=2%3A2397&show-proto-sidebar=1',
  },
]
