import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for API routes, static files, Next.js internals, and special routes
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_vercel') ||
    pathname.startsWith('/embed') ||      // Embed pages (no locale needed)
    pathname.startsWith('/booking') ||    // Booking status pages
    pathname.startsWith('/payment') ||    // Payment pages
    pathname.startsWith('/bundles') ||    // Bundles page
    pathname.startsWith('/login') ||      // Legacy login
    pathname.startsWith('/register') ||   // Legacy register
    pathname.includes('.') // Static files like .ico, .png, etc.
  ) {
    return;
  }

  return intlMiddleware(request);
}

export const config = {
  // Only run middleware on pages, not on API routes or static files
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
