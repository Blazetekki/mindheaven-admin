import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If the user is not signed in and the path is not the login page,
  // redirect them to the login page.
  if (!session && req.nextUrl.pathname !== '/admin/login') {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  return res;
}

// This config ensures the middleware runs on ALL paths inside the /admin folder
export const config = {
  matcher: ['/admin/:path*'],
};