export interface LocationItem {
  city: string
  country: string
  label: string
}

export interface EducationItem {
  degree: string
  institution: string
  location: string
  period: string
  description?: string
  isDoubleDegree?: boolean
}

export interface LanguageItem {
  language: string
  proficiency: string
}

export interface Profile {
  name: string
  preferredName: string
  title: string
  headline: string
  status: string
  availability: string
  email: string
  siteUrl: string
  resumePath: string
  locations: LocationItem[]
  social: {
    linkedin: string
    github: string
  }
  bio: {
    lead: string
    paragraphs: string[]
  }
  education: EducationItem[]
  languages: LanguageItem[]
}

export const PROFILE: Profile = {
  name: 'Niko Yoga Pranata',
  preferredName: 'Niko Pranata',
  title: 'Frontend Web Developer',
  headline: 'CS student and frontend developer. I build interfaces that feel considered - from motion to markup.',
  status: 'Open to Work',
  availability: 'Available for frontend developer internships & freelance collaborations',
  email: 'nikopranatabusiness@gmail.com',
  siteUrl: 'https://nikopranata.vercel.app',
  resumePath: '/resume.pdf',
  locations: [
    { city: 'Nanjing', country: 'China', label: 'Nanjing, China' },
    { city: 'Yogyakarta', country: 'Indonesia', label: 'Yogyakarta, Indonesia' },
  ],
  social: {
    linkedin: 'https://www.linkedin.com/in/nikoyogapranata',
    github: 'https://github.com/nikoyogapranata',
  },
  bio: {
    lead: 'I build interfaces that feel considered, where every detail has a reason.',
    paragraphs: [
      "I'm Niko Pranata, an undergraduate pursuing a Double Degree in Informatics (Islamic University of Indonesia) and Software Engineering (Nanjing Xiaozhuang University, China). I've always been drawn to the parts of design that most people never notice: the easing curve on a transition, the spacing between letters, the moment a layout just clicks into place. Those details are what separate something functional from something that actually feels good to use.",
      "My work lives at the intersection of design and engineering. I build with Next.js, TypeScript, Tailwind CSS, and Framer Motion, and I bring the same level of care to the code as I do to the visual. Things should work well and feel right. For me those aren't two separate goals.",
      "I'm currently targeting a frontend web developer internship where I can work on real products, collaborate with experienced engineering teams, and deliver thoughtful user experiences.",
    ],
  },
  education: [
    {
      degree: 'Bachelor of Software Engineering (Double Degree Partner Institution)',
      institution: 'Nanjing Xiaozhuang University (NJXZ)',
      location: 'Nanjing, China',
      period: '2025 - Present',
      description: 'Undergraduate double-degree program specializing in software engineering, systems design, and application development.',
      isDoubleDegree: true,
    },
    {
      degree: 'Bachelor of Informatics (Double Degree Program)',
      institution: 'Islamic University of Indonesia (UII)',
      location: 'Yogyakarta, Indonesia',
      period: '2023 - Present',
      description: 'Core curriculum in computer science, algorithms, software engineering, and web development technologies.',
      isDoubleDegree: true,
    },
    {
      degree: 'Mathematics and Natural Sciences',
      institution: 'SMA N 1 Purworejo',
      location: 'Central Java, Indonesia',
      period: '2020 - 2023',
      isDoubleDegree: false,
    },
  ],
  languages: [
    { language: 'Indonesian & Javanese', proficiency: 'Native or Bilingual' },
    { language: 'English', proficiency: 'Professional Working' },
    { language: 'Chinese', proficiency: 'Elementary' },
  ],
}
