import { NextResponse, type NextRequest } from 'next/server';
import { verifyMemberSession, SESSION_COOKIE } from '@/lib/memberSession';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/members') &&
    !pathname.startsWith('/members/logout')
  ) {
    const cookie = request.cookies.get(SESSION_COOKIE);
    const session = cookie ? await verifyMemberSession(cookie.value) : null;
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      if (pathname !== '/members/dashboard') {
        loginUrl.searchParams.set('redirect', pathname);
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next({ request });
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
