function detectTenantId() {
  // Build-time override wins — set by .env.production or .env.staging via VITE_TENANT_ID
  if (import.meta.env.VITE_TENANT_ID) return import.meta.env.VITE_TENANT_ID;
  if (typeof window === 'undefined') return 'meraki';
  const { hostname } = window.location;
  if (hostname === 'localhost' || hostname.startsWith('127.')) return 'meraki';
  // SaaS subdomain routing — recognize both old (tipflow.app) and new
  // (plumenexus.com / plumenexus.app) brand domains. Tenant ID = the
  // leftmost subdomain. www/app/api are reserved and fall through to
  // the marketing page / default tenant.
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
