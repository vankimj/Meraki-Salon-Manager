// Replaced at build time by Vite define (vite.config.js)
export const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '?';
export const BUILD_DATE  = typeof __BUILD_DATE__  !== 'undefined' ? __BUILD_DATE__  : '';
export const BUILD_LABEL = `v${APP_VERSION} · ${BUILD_DATE}`;
