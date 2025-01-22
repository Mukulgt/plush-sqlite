import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJWT } from './lib/auth'

export async function middleware(request: NextRequest) {
  // Public paths that don't require authentication
  const publicPaths = ['/auth/login', '/api/auth/login']
  if (publicPaths.includes(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  // Check if it's an API route
  const isApiRoute = request.nextUrl.pathname.startsWith('/api')
  
  // Check if it's an admin route
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')

  // Get token from cookie
  const token = request.cookies.get('auth-token')

  if (!token) {
    if (isApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  const user = await verifyJWT(token.value)

  if (!user) {
    if (isApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Check admin access
  if (isAdminRoute && user.role !== 'ADMIN') {
    if (isApiRoute) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/products/:path*',
    '/api/orders/:path*',
    '/api/categories/:path*',
  ]
}
