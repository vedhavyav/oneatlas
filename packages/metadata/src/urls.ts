export interface SiblingUrls {
  dashboard: string;
  builder: string;
  runtime: string;
}

/**
 * Dynamically resolves sibling application URLs based on the host.
 * Supports development localhost environments and production/preview Cloudflare Pages environments.
 */
export function getSiblingUrls(currentHost?: string | null): SiblingUrls {
  // Defaults for local development
  let dashboard = 'http://localhost:3001';
  let builder = 'http://localhost:3000';
  let runtime = 'http://localhost:3002';

  // Determine current active host (client-side window check or server-side parameter)
  const activeHost = currentHost || (typeof window !== 'undefined' ? window.location.host : null);

  if (activeHost) {
    const hostname = activeHost.split(':')[0]; // Remove port if present

    // Check if running on Cloudflare Pages or any cloud deployment (not localhost)
    if (hostname.includes('pages.dev') || (hostname !== 'localhost' && hostname !== '127.0.0.1')) {
      let basePrefix = '';
      
      if (hostname.endsWith('-builder.pages.dev')) {
        basePrefix = hostname.replace('-builder.pages.dev', '');
      } else if (hostname.endsWith('-runtime.pages.dev')) {
        basePrefix = hostname.replace('-runtime.pages.dev', '');
      } else if (hostname.endsWith('-7w6.pages.dev')) {
        basePrefix = hostname.replace('-7w6.pages.dev', '');
      } else {
        basePrefix = hostname.replace('.pages.dev', '');
      }

      // Automatically detect tenant suffix family (e.g. "-7w6" or "")
      let tenantSuffix = '';
      const match = hostname.match(/oneatlas(-[a-z0-9]+)?/i);
      if (match && match[1]) {
        tenantSuffix = match[1]; // e.g. "-7w6"
      }

      // Check if this is the oneatlas tenant/project family
      const cleanPrefix = basePrefix.split('.').pop() || '';
      if (cleanPrefix.startsWith('oneatlas')) {
        const previewPart = basePrefix.includes('.') ? basePrefix.substring(0, basePrefix.lastIndexOf('.') + 1) : '';
        dashboard = `https://${previewPart}oneatlas${tenantSuffix}.pages.dev`;
        builder = `https://${previewPart}oneatlas-builder${tenantSuffix}.pages.dev`;
        runtime = `https://${previewPart}oneatlas-runtime${tenantSuffix}.pages.dev`;
      } else {
        // Fallback generic pages.dev sibling resolver
        dashboard = `https://${basePrefix}.pages.dev`;
        builder = `https://${basePrefix}-builder.pages.dev`;
        runtime = `https://${basePrefix}-runtime.pages.dev`;
      }
    }
  }

  // Read environment variables
  const envDashboard = process.env.NEXT_PUBLIC_DASHBOARD_URL;
  const envBuilder = process.env.NEXT_PUBLIC_BUILDER_URL;
  const envRuntime = process.env.NEXT_PUBLIC_RUNTIME_URL;

  // Determine if running locally
  const isLocal = !activeHost || activeHost.includes('localhost') || activeHost.includes('127.0.0.1');
  
  // Determine if running in a Cloudflare preview environment (subdomain of project, length of dots > 3)
  // e.g. 5a9f5d1b.oneatlas-7w6.pages.dev (4 segments) vs oneatlas-7w6.pages.dev (3 segments)
  const isPreview = activeHost && activeHost.split('.').length > 3;

  // If we are on a preview subdomain, ignore hardcoded environment variables to prevent leaking production domains
  const useEnv = !isPreview;

  return {
    dashboard: (useEnv && envDashboard && (isLocal || !envDashboard.includes('localhost'))) ? envDashboard : dashboard,
    builder: (useEnv && envBuilder && (isLocal || !envBuilder.includes('localhost'))) ? envBuilder : builder,
    runtime: (useEnv && envRuntime && (isLocal || !envRuntime.includes('localhost'))) ? envRuntime : runtime,
  };
}
