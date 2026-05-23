import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = req.headers.get('host') || '';

  // Parse subdomain
  // e.g. "crm.localhost:3002" or "crm.oneatlas.app"
  const hostname = host.split(':')[0]; // Remove port if present
  const parts = hostname.split('.');

  // If we are dealing with a local subdomain (e.g. crm.localhost) or staging/prod subdomain (e.g. crm.oneatlas.app)
  if (parts.length > 1) {
    const isLocalhost = parts[parts.length - 1] === 'localhost';
    const isDomain = parts[parts.length - 2] === 'oneatlas' && parts[parts.length - 1] === 'app';
    
    // Subdomain is parts[0] if:
    // 1. [subdomain].localhost
    // 2. [subdomain].oneatlas.app
    if ((isLocalhost && parts.length === 2) || (isDomain && parts.length === 3)) {
      const subdomain = parts[0];
      if (subdomain !== 'www' && subdomain !== 'dashboard' && subdomain !== 'builder') {
        // Rewrite internally to /app/[subdomain]
        url.pathname = `/app/${subdomain}${url.pathname}`;
        return NextResponse.rewrite(url);
      }
    }
  }

  return NextResponse.next();
}

// Config matching the dynamic app path only
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api routes (so queries/mutations pass raw)
     * 2. /_next (Next.js internals)
     * 3. /static, /favicon.ico (static files)
     */
    '/((?!api|_next|favicon.ico|static).*)',
  ],
};
