export const LOADER_STORAGE_KEY = 'niko_session_loaded'

/**
 * Runs in <head> before first paint. Sets html[data-loader] on the first visit of a session,
 * unless the visitor prefers reduced motion. CSS shows the loader only while that attribute
 * exists, so there's no flash of content, and nothing shows when JavaScript is off.
 */
export const loaderBootScript = `try{if(!sessionStorage.getItem('${LOADER_STORAGE_KEY}')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.dataset.loader='1'}sessionStorage.setItem('${LOADER_STORAGE_KEY}','1')}catch(e){}`
