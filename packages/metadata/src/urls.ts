export interface SiblingUrls {
  dashboard: string;
  builder: string;
  runtime: string;
}

/**
 * Dynamically resolves sibling application URLs based on the host.
 * Supports development localhost environments and production Cloudflare Pages environments.
 */
export function getSiblingUrls(currentHost?: string | null): SiblingUrls {
  // Defaults for local development
  let dashboard = 'http://localhost:3001';
  let builder = 'http://localhost:3000';
  let runtime = 'http://localhost:3002';

  if (currentHost) {
    const hostname = currentHost.split(':')[0]; // Remove port if present

    if (hostname.includes('pages.dev')) {
      let basePrefix = '';
      if (hostname.endsWith('-builder.pages.dev')) {
        basePrefix = hostname.replace('-builder.pages.dev', '');
      } else if (hostname.endsWith('-runtime.pages.dev')) {
        basePrefix = hostname.replace('-runtime.pages.dev', '');
      } else {
        basePrefix = hostname.replace('.pages.dev', '');
      }

      dashboard = `https://${basePrefix}.pages.dev`;
      builder = `https://${basePrefix}-builder.pages.dev`;
      runtime = `https://${basePrefix}-runtime.pages.dev`;
    }
  }

  // Override with environment variables if present
  return {
    dashboard: process.env.NEXT_PUBLIC_DASHBOARD_URL || dashboard,
    builder: process.env.NEXT_PUBLIC_BUILDER_URL || builder,
    runtime: process.env.NEXT_PUBLIC_RUNTIME_URL || runtime,
  };
}
