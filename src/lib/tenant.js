function detectTenantId() {
  if (typeof window === 'undefined') return 'meraki';
  const { hostname } = window.location;
  if (hostname === 'localhost' || hostname.startsWith('127.')) return 'meraki';
  // SaaS subdomain routing: {tenant}.tipflow.app
  if (hostname.endsWith('.tipflow.app')) return hostname.slice(0, hostname.length - '.tipflow.app'.length);
  // Custom subdomain: {tenant}.yourbrand.app — add more patterns here as needed
  // Default: current single-tenant Firebase Hosting URL (meraki-salon-manager.web.app)
  return 'meraki';
}

export const TENANT_ID = detectTenantId();
