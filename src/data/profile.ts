export interface LocationItem {
  city: string
  country: string
  label: string
}

export interface EducationItem {
  degree: string
  /** Field of study on its own, e.g. "Informatics" (the /about cities section) */
  field: string
  institution: string
  abbreviation?: string
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
    /** About 70 words: the reading-size bio block on /about */
    short: string
    /** One-liner beside the photo at the top of /about */
    tagline: string
    /**
     * The scroll-read statement (home "About" section, /about scroll story). Segments keep their
     * own spacing; `accent` ones are set in Playfair italic.
     */
    story: { text: string; accent?: boolean }[]
  }
  education: EducationItem[]
  languages: LanguageItem[]
}

export const PROFILE: Profile = {
  name: 'Niko Yoga Pranata',
  preferredName: 'Niko Pranata',
  title: 'Fullstack Web Developer',
  headline: 'Informatics and Software Engineering student and fullstack web developer. I build interfaces that feel considered, from motion to markup.',
  status: 'Open to Work',
  availability: 'Available for web developer internships & freelance collaborations',
  email: 'nikopranatabusiness@gmail.com',
  siteUrl: 'https://nikopranata.vercel.app',
  resumePath: '/cv.pdf',
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
      "I'm Niko Pranata, an undergraduate pursuing a Double Degree in Informatics (Universitas Islam Indonesia) and Software Engineering (Nanjing Xiaozhuang University, China). I've always been drawn to the parts of design that most people never notice: the easing curve on a transition, the spacing between letters, the moment a layout just clicks into place. Those details are what separate something functional from something that actually feels good to use.",
      "My work lives at the intersection of design and engineering. I build with Next.js, TypeScript, Tailwind CSS, and Framer Motion, and I bring the same level of care to the code as I do to the visual. I also build backends with Node.js, PHP, and PostgreSQL. Things should work well and feel right. For me those aren't two separate goals.",
      "I'm currently looking for a web developer internship where I can work on real products, collaborate with experienced engineering teams, and deliver thoughtful user experiences.",
    ],
    short: "I got into tech by fixing Zoom calls and running live streams at HelloCation. Since then I've redesigned their pages in Figma, built a client's website end to end, and now lead the IT team there. That path taught me to care about the whole product: how it looks, how it's built, and who maintains it after launch. Right now I'm looking for a web development internship on a team that ships real products.",
    tagline: "a developer with a designer's eye",
    story: [
      { text: 'A ' }, { text: 'developer ' }, { text: 'with ' }, { text: 'a ' },
      { text: "designer's", accent: true }, { text: ' eye. ' },
      { text: 'I ' }, { text: 'build ' }, { text: 'interfaces ' }, { text: 'that ' }, { text: 'feel ' }, { text: 'as ' },
      { text: 'good ' }, { text: 'as ' }, { text: 'they ' }, { text: 'look, ' }, { text: 'obsessed ' }, { text: 'with ' },
      { text: 'motion,', accent: true }, { text: ' the ' }, { text: 'type, ' }, { text: 'and ' }, { text: 'the ' },
      { text: 'details', accent: true }, { text: ' others ' }, { text: 'skip. ' },
      { text: 'Studying ' }, { text: 'Informatics ' }, { text: 'and ' }, { text: 'Software ' }, { text: 'Engineering, ' },
      { text: 'always ' }, { text: 'building. ' },
      { text: 'Somewhere ' }, { text: 'between ' }, { text: 'engineering ' }, { text: 'and ' }, { text: 'design: ' },
      { text: "that's " }, { text: 'where ' }, { text: 'I ' }, { text: 'live.', accent: true },
    ],
  },
  education: [
    {
      degree: 'Bachelor of Software Engineering (Double Degree Partner Institution)',
      field: 'Software Engineering',
      institution: 'Nanjing Xiaozhuang University',
      abbreviation: 'NJXZ',
      location: 'Nanjing, China',
      period: '2025 - Present',
      description: 'Undergraduate double-degree program specializing in software engineering, systems design, and application development.',
      isDoubleDegree: true,
    },
    {
      degree: 'Bachelor of Informatics (Double Degree Program)',
      field: 'Informatics',
      institution: 'Universitas Islam Indonesia',
      abbreviation: 'UII',
      location: 'Yogyakarta, Indonesia',
      period: '2023 - Present',
      description: 'Core curriculum in computer science, algorithms, software engineering, and web development technologies.',
      isDoubleDegree: true,
    },
    {
      degree: 'Mathematics and Natural Sciences',
      field: 'Mathematics and Natural Sciences',
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
