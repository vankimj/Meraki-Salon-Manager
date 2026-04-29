/**
 * TipFlow subdomain router — Cloudflare Worker
 *
 * Routes *.tipflow.app/* → meraki-salon-manager.web.app (Firebase Hosting).
 * The React app detects the tenant from window.location.hostname at runtime.
 *
 * Deploy:
 *   npx wrangler deploy
 *
 * DNS setup (Cloudflare dashboard):
 *   *.tipflow.app  CNAME  meraki-salon-manager.web.app  (proxied)
 *    tipflow.app   CNAME  meraki-salon-manager.web.app  (proxied)
 */

const FIREBASE_HOST = 'meraki-salon-manager.web.app';

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Build upstream request against Firebase Hosting
    const upstreamUrl = `https://${FIREBASE_HOST}${url.pathname}${url.search}`;

    const upstreamHeaders = new Headers(request.headers);
    upstreamHeaders.set('host', FIREBASE_HOST);
    // Pass original hostname so server-side logic could inspect it if needed
    upstreamHeaders.set('x-forwarded-host', url.hostname);

    const upstreamReq = new Request(upstreamUrl, {
      method:  request.method,
      headers: upstreamHeaders,
      body:    ['GET', 'HEAD'].includes(request.method) ? null : request.body,
      redirect: 'follow',
    });

    const response = await fetch(upstreamReq);

    // Pass response through; strip X-Frame-Options so tenant apps can be iframed
    // in the super-admin Tenants preview if needed.
    const headers = new Headers(response.headers);
    headers.delete('x-frame-options');

    return new Response(response.body, {
      status:     response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
