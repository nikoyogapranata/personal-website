import localFont from 'next/font/local'

/**
 * The Chinese characters on /about, and only those: 日惹南京 (two-cities section) and 中文 (bio
 * "Speaks" line), 1.9 KB. Not a full CJK font. Adding a character means re-subsetting
 * public/fonts/NotoSerifSC-subset.woff2 (see the LICENSE note next to it).
 */
export const cjk = localFont({
  src: '../../../public/fonts/NotoSerifSC-subset.woff2',
  variable: '--font-cjk',
  display: 'swap',
  weight: '500',
  preload: false,
})
