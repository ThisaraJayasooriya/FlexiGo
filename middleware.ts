import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookie or header
  const token = request.cookies.get('access_token')?.value;
  
  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password'];
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/api/auth'));
  
  // Routes that require authentication
  const protectedRoutes = ['/dashboard', '/profile'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // If accessing a protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // If accessing login/register with valid token, redirect to dashboard
  if ((pathname === '/login' || pathname === '/register') && token) {
    // Check if user has completed profile
    try {
      const checkResponse = await fetch(`${request.nextUrl.origin}/api/check`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (checkResponse.ok) {
        const data = await checkResponse.json();
        
        // If profile not complete, redirect to profile creation
        if (!data.first_login_complete) {
          const profileUrl = new URL(`/profile/${data.role}/create`, request.url);
          return NextResponse.redirect(profileUrl);
        }
        
        // If profile complete, redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error) {
      console.error('Error checking user status:', error);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
