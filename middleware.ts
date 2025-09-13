import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Check if user is accessing a protected route
    const { pathname } = req.nextUrl;
    const isProtectedRoute = pathname.startsWith('/dashboard') || 
                            pathname.startsWith('/patients') || 
                            pathname.startsWith('/revenue') ||
                            pathname.startsWith('/appointments') ||
                            pathname.startsWith('/documents');

    // If accessing a protected route and not authenticated, redirect to home
    if (isProtectedRoute && !req.nextauth.token) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // If authenticated and trying to access landing page, redirect to dashboard
    if (pathname === '/' && req.nextauth.token) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Allow access to landing page and auth pages without token
        if (pathname === '/' || pathname.startsWith('/api/auth')) {
          return true;
        }
        
        // For protected routes, require token
        const isProtectedRoute = pathname.startsWith('/dashboard') || 
                                pathname.startsWith('/patients') || 
                                pathname.startsWith('/revenue') ||
                                pathname.startsWith('/appointments') ||
                                pathname.startsWith('/documents');
        
        if (isProtectedRoute) {
          return !!token;
        }
        
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};