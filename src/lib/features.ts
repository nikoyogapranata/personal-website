/**
 * Feature flags: switch sections on or off without commenting code out. The site type-checks and
 * builds either way, and the e2e suites read these values (tests/e2e/lib.mjs) to skip the checks
 * for anything that's switched off.
 */

/** /about "Two campuses" section: Yogyakarta and Nanjing, with live clocks */
export const SHOW_CITIES = false
