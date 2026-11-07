export const LOADER_STORAGE_KEY = 'niko_session_loaded'

/** html[data-loader] values: set by the boot script, then switched once LoadingScreen takes over */
export const LOADER_PENDING = '1'
export const LOADER_RUNNING = 'running'

/**
 * If JavaScript hasn't taken over the loader by this point, CSS hides it and unlocks scrolling
 * (see LoadingScreen). The intro itself lasts about 2s, so this only fires when the app bundle is
 * slow, blocked or broken.
 */
export const LOADER_FAILSAFE_MS = 4000

/**
 * Runs in <head> before first paint. Sets html[data-loader] on the first visit of a session,
 * unless the visitor prefers reduced motion. CSS shows the loader only while that attribute
 * exists, so there's no flash of content, and nothing shows when JavaScript is off.
 * The timeout is a second failsafe for browsers that can't animate `overflow` in the CSS one;
 * it lives here, not in the app bundle, so it runs even when the bundle never arrives.
 */
export const loaderBootScript = `try{var d=document.documentElement;if(!sessionStorage.getItem('${LOADER_STORAGE_KEY}')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){d.dataset.loader='${LOADER_PENDING}';setTimeout(function(){if(d.dataset.loader==='${LOADER_PENDING}')delete d.dataset.loader},${LOADER_FAILSAFE_MS + 500})}sessionStorage.setItem('${LOADER_STORAGE_KEY}','1')}catch(e){}`
