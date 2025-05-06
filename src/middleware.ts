import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// NOTE: This middleware uses sessionStorage which is NOT secure and only works
// for client-side checks AFTER hydration. A real application MUST use
// secure, HTTP-only cookies or server-side sessions managed by a proper
// authentication provider (like NextAuth.js, Clerk, Firebase Auth) for
// robust security. This is a simplified example for demonstration.

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect the /admin routes except for the login page itself
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    // Check for an authentication indicator. In a real app, this would
    // involve verifying a secure session cookie or token.
    // Here, we simulate by checking a cookie that might be set on login.
    // THIS IS NOT SECURE FOR PRODUCTION.
    const isAuthenticatedCookie = request.cookies.get('adminAuthToken'); // Example cookie name

    // A better, though still client-dependent approach for the demo:
    // Redirecting immediately. The client-side check on the admin page
    // will handle the final verification after hydration.
    // if (!isAuthenticatedCookie) { // Check if the *mock* cookie exists
    //   const loginUrl = new URL('/admin/login', request.url);
    //   loginUrl.searchParams.set('redirectedFrom', pathname); // Optional: pass original path
    //   return NextResponse.redirect(loginUrl);
    // }
     // Since we are using sessionStorage which is client-side,
     // the middleware can't reliably check it.
     // We will rely on a client-side check within the admin layout/page.
     // The middleware's primary job here is structure, logging, or basic checks.
     console.log(`Accessing protected admin route: ${pathname}`);
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/admin/:path*', // Apply middleware to all routes under /admin
}
