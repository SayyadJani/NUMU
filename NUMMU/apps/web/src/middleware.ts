import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Edge Middleware for Server-Side Route Guarding
 * Protects private learning dashboards, tests attempt sessions, and profiles.
 * Redirects already-authenticated candidates away from auth pages.
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Retrieve auth cookies
  const accessToken = request.cookies.get('numu_access_token')?.value;
  const refreshToken = request.cookies.get('numu_refresh_token')?.value;
  const hasAuthToken = Boolean(accessToken || refreshToken);

  // Define route classifications
  const isAuthPage =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/signup');

  const isProtectedPage =
    pathname.startsWith('/dashboard') ||
    pathname.includes('/attempt') ||
    (pathname.startsWith('/profile') && !pathname.match(/^\/profile\/[a-zA-Z0-9_-]+$/)) ||
    pathname.startsWith('/settings');

  // 1. Redirect unauthenticated users trying to access protected paths
  if (isProtectedPage && !hasAuthToken) {
    const callbackUrl = encodeURIComponent(`${pathname}${search}`);
    const loginUrl = new URL(`/login?callbackUrl=${callbackUrl}`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Redirect already-authenticated users trying to access login/register
  if (isAuthPage && hasAuthToken) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (/api/*)
     * - static files (_next/static, _next/image, favicon.ico, public assets)
     */
    '/dashboard/:path*',
    '/tests/:testId/attempt',
    '/profile',
    '/settings/:path*',
    '/settings',
    '/login',
    '/register',
    '/signup',
  ],
};
