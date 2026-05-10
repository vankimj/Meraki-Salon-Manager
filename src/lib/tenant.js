// Format gate for any caller-supplied tenant id (query param / sessionStorage).
// Mirrors the backend validation in chatWithSalon, refreshGoogleReviews, etc.
function isValidTenantId(s) {
  return typeof s === 'string' && /^[a-z0-9-]{1,64}$/.test(s);
}

function detectTenantId() {
  // Build-time override wins — set by .env.production or .env.staging via VITE_TENANT_ID
  if (import.meta.env.VITE_TENANT_ID) return import.meta.env.VITE_TENANT_ID;
  if (typeof window === 'undefined') return 'meraki';

  // Test-only override: ?tenant=foo on the URL pins the session to that
  // tenant for end-to-end multi-tenant testing without provisioning a
  // subdomain. Persists in sessionStorage so navigating around the app
  // keeps the override active in the same tab. Closing the tab clears it.
  // Tenant data isolation is still enforced by Firestore rules — the
  // override only changes which tenant the UI is configured for; the
  // signed-in user must be a member of that tenant to read its data.
  try {
    const qs = new URLSearchParams(window.location.search);
    const fromUrl = qs.get('tenant');
    if (fromUrl && isValidTenantId(fromUrl)) {
      sessionStorage.setItem('plumenexus_tenant_override', fromUrl);
      return fromUrl;
    }
    const fromSession = sessionStorage.getItem('plumenexus_tenant_override');
    if (fromSession && isValidTenantId(fromSession)) return fromSession;
  } catch { /* sessionStorage unavailable — fall through to host-based detection */ }

  const { hostname } = window.location;
  if (hostname === 'localhost' || hostname.startsWith('127.')) return 'meraki';
  // SaaS subdomain routing — recognize both old (tipflow.app) and new
  // (plumenexus.com / plumenexus.app) brand domains. Tenant ID = the
  // leftmost subdomain. www/app/api are reserved and fall through to
  // the marketing page / default tenant.
  //
  // FAST PATH: returns the URL subdomain synchronously. This is correct
  // for tenants whose `subdomain` field still equals their original signup
  // ID (every tenant at signup; most tenants forever).
  //
  // SLOW PATH: when a tenant has CHANGED their subdomain, the URL might be
  // an alias. Per principle #11 + plumenexus/SUBDOMAIN-CHANGE-DESIGN.md,
  // aliases should 301-redirect to the current primary. That async resolver
  // lives in src/lib/subdomainResolver.js — call it at app init to handle
  // the alias case. Wiring is deferred until tenant #2 actually exists.
  const SAAS_ROOTS = ['.plumenexus.com', '.plumenexus.app', '.tipflow.app'];
  for (const root of SAAS_ROOTS) {
    if (hostname.endsWith(root)) {
      const sub = hostname.slice(0, hostname.length - root.length);
      if (!sub || sub === 'www' || sub === 'app' || sub === 'api') return 'meraki';
      return sub;
    }
  }
  return 'meraki';
}

export const TENANT_ID = detectTenantId();

// Returns the leftmost subdomain of the current URL, normalized. Useful for
// the placeholder Settings → Domain UI to show "your salon URL is
// X.plumenexus.com". For Meraki on meraki-salon-manager.web.app this falls
// back to the default tenant id.
export function currentSubdomain() {
  if (typeof window === 'undefined') return TENANT_ID;
  const { hostname } = window.location;
  const SAAS_ROOTS = ['.plumenexus.com', '.plumenexus.app', '.tipflow.app'];
  for (const root of SAAS_ROOTS) {
    if (hostname.endsWith(root)) {
      const sub = hostname.slice(0, hostname.length - root.length);
      return (sub && sub !== 'www' && sub !== 'app' && sub !== 'api') ? sub : TENANT_ID;
    }
  }
  return TENANT_ID;
}
