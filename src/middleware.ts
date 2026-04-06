import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/digital-donors',
  '/campaign-managers',
  '/beneficiaries-approval',
  '/beneficiaries-list',
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // Get the JWT token from cookies
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Verify the JWT token
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (error) {
      // Token is invalid, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Allow access to non-protected routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
