import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Extract token from cookie (not localstorage because middleware runs on server)
  // But wait, our token is in localstorage.
  // Next.js middleware cannot read localstorage.
  // We should rely on client-side routing protection or set a cookie upon login.
  // For now, let's just let it pass and do client-side protection or basic checks.
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
