import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define admin routes that need protection
  const isAdminRoute = pathname.startsWith('/admin');

  // Allow public access to non-admin routes
  if (!isAdminRoute) {
    return NextResponse.next();
  }

  // Check for admin session using JWT
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    // Not authenticated - redirect to signin
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('callbackUrl', encodeURI(pathname));
    return NextResponse.redirect(url);
  }

  // Check if user has admin role
  // Note: You'll need to add role to JWT callback in auth config
  if (token.role !== 'ADMIN') {
    // Not admin - redirect to home with error
    return NextResponse.redirect(new URL('/?error=unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
