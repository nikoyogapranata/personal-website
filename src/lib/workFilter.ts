import { CATEGORIES, PROJECTS, type ProjectCategory } from '@/data/projects'

/** /work?filter=… values. 'all' is the bare URL */
export type WorkFilter = 'all' | ProjectCategory
export const FILTER_PARAM = 'filter'

const IDS = CATEGORIES.map(c => c.id) as string[]

export function parseFilter(search: string): WorkFilter {
  const v = new URLSearchParams(search).get(FILTER_PARAM)
  return v && IDS.includes(v) ? (v as ProjectCategory) : 'all'
}

export const filterHref = (f: WorkFilter) => (f === 'all' ? '/work' : `/work?${FILTER_PARAM}=${f}`)

export const countFor = (f: WorkFilter) => (f === 'all' ? PROJECTS.length : PROJECTS.filter(p => p.category === f).length)

/**
 * Runs in <head> before first paint, on every page:
 * - html[data-js]: the /work gallery pins only with JavaScript. Without it (or before this runs,
 *   which is never, since it's inline) the cards stay a plain list. Set here and not after
 *   hydration, so the layout never switches under the visitor (CLS 0).
 * - html[data-work-filter]: on a hard load of /work?filter=ios, CSS hides the other cards and sets
 *   the pinned scroll length before paint, so a static page can open filtered without a flash.
 *   WorkGallery takes over from the attribute once it hydrates, and removes it.
 */
export const workBootScript = `try{var d=document.documentElement;d.dataset.js='1';if(location.pathname==='/work'){var f=new URLSearchParams(location.search).get('${FILTER_PARAM}');if(${JSON.stringify(IDS)}.indexOf(f)>-1)d.dataset.workFilter=f}}catch(e){}`
