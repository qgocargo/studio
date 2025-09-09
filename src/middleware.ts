import { NextResponse, type NextRequest } from 'next/server'
import { getSession } from '@/lib/session'

export async function middleware(request: NextRequest) {
  const session = await getSession()
  const { pathname } = request.nextUrl

  // Define public paths that don't require authentication
  const publicPaths = ['/login', '/signup', '/forgot-password']

  // If user is not logged in and is trying to access a protected route, redirect to login
  if (!session && !publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If user is logged in and is trying to access a public route (like login), redirect to home
  if (session && publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

    