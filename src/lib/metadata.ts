import type { Metadata } from 'next'

const SHARE_IMAGE = { url: '/opengraph-image.jpg', width: 1200, height: 630, alt: 'Niko Pranata — Frontend Web Developer based in Yogyakarta, Indonesia. Currently open to work.' }

/**
 * Metadata for a top-level page. A child segment's openGraph/twitter objects replace the
 * root's rather than merging, so the share image has to be repeated here.
 */
export function pageMetadata(path: string, title: string, description: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { url: path, title: `Niko Pranata | ${title}`, description, images: [SHARE_IMAGE] },
    twitter: { card: 'summary_large_image', title: `Niko Pranata | ${title}`, description, images: [SHARE_IMAGE] },
  }
}
