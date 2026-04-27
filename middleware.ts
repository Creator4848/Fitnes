import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE = 'fitpro_auth';
const AUTH_TOKEN = 'fitpro_authenticated_v1';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const isAuthenticated = token === AUTH_TOKEN;

  // Login sahifasi va auth API'ga ruxsat
  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth')) {
    // Allaqachon kirgan bo'lsa — dashboardga yo'naltir
    if (isAuthenticated && pathname === '/login') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Static fayllar va Next.js ichki yo'llari
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Autentifikatsiya yo'q — login sahifasiga yo'naltir
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
