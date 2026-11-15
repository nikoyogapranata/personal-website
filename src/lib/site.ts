export const SITE_URL = 'https://nikopranata.vercel.app'

export const EMAIL = 'nikopranatabusiness@gmail.com'

export const SOCIAL = {
  linkedin: 'https://www.linkedin.com/in/nikoyogapranata',
  github:   'https://github.com/nikoyogapranata',
} as const

export const RESUME_PATH = '/cv.pdf'

/**
 * Where I'm based: the one place to change it. Used by the hero, the Contact section, /contact
 * (status bar clock, sent label, channels) and the JSON-LD/share image text. The campus cities
 * on /about (TwoCities) and job locations in data/experience.ts are facts of their own and stay put.
 */
export const CITY = {
  name: 'Yogyakarta',
  country: 'Indonesia',
  countryCode: 'ID',
  timeZone: 'Asia/Jakarta',
} as const
