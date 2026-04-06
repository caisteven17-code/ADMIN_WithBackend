import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'hopecard-admin-secret-key-change-in-production'
);

// Routes that don't require authentication
const publicRoutes = ['/login', '/forgot-password', '/verify', '/api/auth/login', '/api/auth/send-otp', '/api/auth/verify-otp'];

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/digital-donors',
  '/campaign-managers',
  '/beneficiaries-approval',
  '/beneficiaries-list',
  '/change-password',
  '/api/auth/logout',
  '/api/auth/change-password',
  '/api/auth/verify-session',
];

async function verifyJWT(token: string) {
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch (error) {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static assets and next internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/public') ||
    pathname === '/favicon.ico' ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.svg')
  ) {
    return NextResponse.next();
  }

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname === route || pathname.startsWith(route));

  if (isProtectedRoute) {
    // Get JWT token from cookies
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      // No token, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verify JWT token
    const isValid = await verifyJWT(token);

    if (!isValid) {
      // Invalid token, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Token is valid, allow access
    return NextResponse.next();
  }

  // For all other routes, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except next internals and static files
    '/((?!_next|static|favicon.ico).*)',
  ],
};
