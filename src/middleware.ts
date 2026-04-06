import { NextRequest, NextResponse } from 'next/server';

// Minimal middleware - just let requests through
// Protection is handled at the page/component level
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|static|favicon.ico).*)'],
};
